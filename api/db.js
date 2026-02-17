const { createClient } = require('@supabase/supabase-js');
const fs = require('fs/promises');
const path = require('path');

const TABLE_NAME = 'app_state';
const STATE_ROW_ID = 1;
const TMP_DB_PATH = path.join('/tmp', 'coa-ultra-db.json');

function defaultDb() {
    return {
        users: [{ username: 'kellie', password: 'kellie2004', role: 'admin', unit: 'System HQ' }],
        reports: [],
        inbox: [],
        audit: [],
        session: null
    };
}

function normalizeDb(payload) {
    const fallback = defaultDb();
    return {
        users: Array.isArray(payload?.users) && payload.users.length ? payload.users : fallback.users,
        reports: Array.isArray(payload?.reports) ? payload.reports : [],
        inbox: Array.isArray(payload?.inbox) ? payload.inbox : [],
        audit: Array.isArray(payload?.audit) ? payload.audit : [],
        session: payload?.session && typeof payload.session === 'object' ? payload.session : null
    };
}

function getSupabaseClient() {
    const url =
        process.env.SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_PROJECT_URL;
    const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SECRET_KEY ||
        process.env.SUPABASE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error(
            'Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY as fallback).'
        );
    }

    return createClient(url, serviceRoleKey, {
        auth: { persistSession: false }
    });
}

async function readTmpDb() {
    try {
        const raw = await fs.readFile(TMP_DB_PATH, 'utf8');
        return normalizeDb(JSON.parse(raw));
    } catch (_err) {
        return defaultDb();
    }
}

async function writeTmpDb(payload) {
    const safe = normalizeDb(payload);
    await fs.writeFile(TMP_DB_PATH, JSON.stringify(safe, null, 2));
    return safe;
}

async function readDb(client) {
    const { data, error } = await client
        .from(TABLE_NAME)
        .select('data')
        .eq('id', STATE_ROW_ID)
        .maybeSingle();

    if (error) throw error;

    if (!data) {
        const seed = defaultDb();
        await writeDb(client, seed);
        return seed;
    }

    return normalizeDb(data.data);
}

async function writeDb(client, payload) {
    const next = normalizeDb(payload);

    const { error } = await client
        .from(TABLE_NAME)
        .upsert(
            {
                id: STATE_ROW_ID,
                data: next,
                updated_at: new Date().toISOString()
            },
            { onConflict: 'id' }
        );

    if (error) throw error;
    return next;
}

module.exports = async (req, res) => {
    try {
        const client = getSupabaseClient();

        if (req.method === 'GET') {
            try {
                const data = await readDb(client);
                await writeTmpDb(data);
                return res.status(200).json(data);
            } catch (dbErr) {
                const fallback = await readTmpDb();
                return res.status(200).json(fallback);
            }
        }

        if (req.method === 'POST') {
            try {
                const saved = await writeDb(client, req.body || {});
                await writeTmpDb(saved);
                return res.status(200).json({ ok: true, data: saved });
            } catch (dbErr) {
                const fallback = await writeTmpDb(req.body || {});
                return res.status(200).json({
                    ok: true,
                    data: fallback,
                    degraded: true,
                    detail: String(dbErr.message || dbErr)
                });
            }
        }

        res.setHeader('Allow', 'GET,POST');
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        const fallback = await readTmpDb();
        return res.status(200).json(fallback);
    }
};
