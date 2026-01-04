-- Add columns for Calendar Events and Reminders support
alter table public.tasks add column if not exists start_at timestamp with time zone;
alter table public.tasks add column if not exists end_at timestamp with time zone;
alter table public.tasks add column if not exists is_all_day boolean default false;
alter table public.tasks add column if not exists location text;
alter table public.tasks add column if not exists reminder_minutes integer; -- Minutes before event to remind
alter table public.tasks add column if not exists color text; -- Custom color for calendar

-- If due_date was used, we can migrate to start_at for consistency, 
-- but keeping due_date for simple tasks is fine.
