# COA-Monitoring

Student OJT Task Project: static monitoring dashboard + Node.js API backend + Supabase database.

## OJT Task Notes

For the full list of tools and technologies used in this project, see:

- [PROJECT_USED_TECH.txt](PROJECT_USED_TECH.txt)

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Set environment variables:

```bash
cp .env.example .env.local
```

Then fill `.env.local` with your Supabase values.

3. Create table in Supabase SQL Editor:

- Run `supabase/schema.sql`

4. Start project:

```bash
npm run dev
```

Open the local URL shown in terminal.

## Default Admin

- Username: `kellie`
- Password: `kellie2004`

## Data Storage

- API endpoint: `api/db.js` (`GET`/`POST`)
- Table: `public.app_state`
- Row used by app: `id = 1`

## Notes

- Frontend works with `/api/db`.
- Backend reads/writes a single JSON state in Supabase.
- Use `SUPABASE_SERVICE_ROLE_KEY` only on server side.
