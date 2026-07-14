-- Invoice uploads for complaints
-- Run in Supabase SQL Editor if the schema was created earlier

alter table public.complaints
  add column if not exists invoice_url text;

-- Public storage bucket so staff can open invoice links from the dashboard
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invoices',
  'invoices',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'application/pdf'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
