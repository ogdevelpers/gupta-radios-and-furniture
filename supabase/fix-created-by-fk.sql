-- Fix: complaints.created_by must reference public.logins (not auth.users)
-- Run this in Supabase SQL Editor, then try registering a complaint again.

-- 1) Clear any created_by values that are not valid logins ids
update public.complaints c
set created_by = null
where created_by is not null
  and not exists (
    select 1 from public.logins l where l.id = c.created_by
  );

-- 2) Drop the old foreign key (may still point at auth.users)
alter table public.complaints
  drop constraint if exists complaints_created_by_fkey;

-- 3) Point created_by at the logins table
alter table public.complaints
  add constraint complaints_created_by_fkey
  foreign key (created_by)
  references public.logins (id)
  on delete set null;

-- 4) Ensure default staff login exists
insert into public.logins (email, password, full_name)
values ('staff@guptaradio.com', 'staff123', 'Desk Staff')
on conflict (email) do nothing;
