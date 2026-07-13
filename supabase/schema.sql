-- Gupta Radios & Furniture — schema
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rcjtfdwmswfsxviutbem/sql/new

create extension if not exists "pgcrypto";

-- Staff login credentials
create table if not exists public.logins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password text not null,
  full_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists logins_email_idx on public.logins (email);

alter table public.logins enable row level security;

-- No public access: app uses the service role on the server only
drop policy if exists "No public access to logins" on public.logins;

-- Default staff account (change password after first login)
insert into public.logins (email, password, full_name)
values ('staff@guptaradio.com', 'staff123', 'Desk Staff')
on conflict (email) do nothing;

-- Complaints
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_number text not null,
  product_name text not null,
  address text not null,
  product_serial_number text not null,
  issue_message text not null default '',
  warranty_status text not null check (warranty_status in ('in_warranty', 'out_warranty')),
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_by uuid references public.logins (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add issue_message if the table already existed without it
alter table public.complaints
  add column if not exists issue_message text not null default '';

-- Ensure created_by always references public.logins (not auth.users)
update public.complaints c
set created_by = null
where created_by is not null
  and not exists (
    select 1 from public.logins l where l.id = c.created_by
  );

alter table public.complaints
  drop constraint if exists complaints_created_by_fkey;

alter table public.complaints
  add constraint complaints_created_by_fkey
  foreign key (created_by)
  references public.logins (id)
  on delete set null;

create index if not exists complaints_status_idx on public.complaints (status);
create index if not exists complaints_created_at_idx on public.complaints (created_at desc);

alter table public.complaints enable row level security;

drop policy if exists "Staff can view complaints" on public.complaints;
drop policy if exists "Staff can insert complaints" on public.complaints;
drop policy if exists "Staff can update complaints" on public.complaints;

-- Service role bypasses RLS; keep restrictive policies for anon/authenticated
create or replace function public.set_complaints_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists complaints_set_updated_at on public.complaints;
create trigger complaints_set_updated_at
  before update on public.complaints
  for each row
  execute function public.set_complaints_updated_at();
