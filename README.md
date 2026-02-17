# COA-e OJT Project

Hi, this is my OJT student project.
I made a compliance monitoring dashboard with simple backend and database connection.

## What this project does

- Login as admin or unit user
- Create report tasks
- Send reminder messages
- Upload files for report submission
- Show audit logs

## Tech list

I listed all used tools here:

- [PROJECT_USED_TECH.txt](PROJECT_USED_TECH.txt)

## How to run (local)

1. Install packages:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Put your Supabase values inside `.env.local`.

4. Run SQL in Supabase:

- `supabase/schema.sql`

5. Start project:

```bash
npm run dev
```

## Default admin account

- Username: `kellie`
- Password: `kellie2004`

## Notes

- Frontend calls `/api/db`
- Backend file is `api/db.js`
- Database table is `public.app_state`

This project was prepared as a student OJT task.
