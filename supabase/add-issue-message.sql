-- Add product issue message to existing complaints table
-- Run in Supabase SQL Editor if you already created the table earlier

alter table public.complaints
  add column if not exists issue_message text not null default '';
