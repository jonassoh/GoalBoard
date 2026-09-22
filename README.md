# GoalBoard

A local-first desktop dashboard for planning and tracking measurable monthly goals.

## What is included

- Home dashboard with weighted goal progress, due dates, and remaining time
- Multi-month goals that remain active from their start month through their due date
- Month navigation for the current month plus the next 11 months
- Goals with multiple measurable milestones (for example Easy, Medium, and Hard problems)
- User-defined categories with editable colors that style assigned goals
- Category filters and automatic category sorting
- Mini calendar with due-date markers and a next-month preview
- Offline persistence through an Electron IPC bridge and a JSON file in Electron's user data directory
- Browser `localStorage` fallback when running through Vite alone
- Email/password accounts powered by Supabase Auth
- Per-user cloud synchronization protected by Postgres row-level security

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Update `.env.local` with the public project values from Supabase. Never place a
Supabase service-role key in a `VITE_` environment variable.

## Configure accounts and cloud persistence

1. Create or connect a Supabase project (the Vercel Marketplace integration is supported).
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the Development,
   Preview, and Production environments in Vercel.
4. Add the production domain and Vercel preview URL pattern to the allowed
   redirect URLs under Supabase Authentication settings.
5. Redeploy the Vercel project.

The publishable key is intentionally used in the browser. Row-level security
ensures authenticated users can only select or modify the row matching their
own account ID.

Existing anonymous browser or Electron data is claimed by the first account
that signs in on that device, then stored in that account's isolated cache.

## Data model

The initial cloud model stores each user's compact GoalBoard document in one
`jsonb` row keyed by their Supabase user ID. This keeps offline synchronization
simple and avoids cross-account data exposure. If collaboration, audit history,
or very large boards are added later, migrate goals, metrics, and categories to
normalized tables while retaining the same `user_id` RLS boundary.

## Build

```bash
npm run build
npm start
```

The first launch includes a small set of editable starter goals so the dashboard is immediately explorable.
