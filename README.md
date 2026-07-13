# Gupta Radios & Furniture — Complaints Portal

Next.js staff portal for registering and tracking customer complaints, backed by Supabase Auth and Postgres.

## Features

- `/login` — staff login against the Supabase `logins` table
- `/complaints/dashboard` — complaint desk after login
- Dashboard tiles: **Total**, **Resolved**, **Pending**
- Register complaint form persisted in Supabase

## Setup

### 1. Install & env

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

### 2. Database

In Supabase → **SQL Editor**, run [`supabase/schema.sql`](./supabase/schema.sql).

This creates:
- `logins` — staff email/password (default: `staff@guptaradio.com` / `staff123`)
- `complaints` — customer complaint records

Add more staff in **Table Editor → logins**.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

## Routes

| Path | Description |
|------|-------------|
| `/` | Redirects to `/login` |
| `/login` | Staff sign-in |
| `/complaints` | Redirects to dashboard or login |
| `/complaints/dashboard` | Complaints dashboard (requires login) |
