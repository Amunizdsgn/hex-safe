-- 1. Create Tasks Table for Personal Routine
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  completed boolean default false,
  is_habit boolean default false,
  frequency text, -- 'daily', 'weekly', 'none'
  streak integer default 0, -- For habits
  last_completed_at timestamp with time zone,
  due_date date,
  priority text default 'medium', -- 'high', 'medium', 'low'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS for Tasks
alter table public.tasks enable row level security;

create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);

-- 3. Ensure RLS for Core Tables (SaaS Isolation)
-- Run these commands to guarantee data isolation between users

-- Accounts
alter table public.accounts enable row level security;
drop policy if exists "Users can view own accounts" on public.accounts;
create policy "Users can view own accounts" on public.accounts for select using (auth.uid() = user_id);
create policy "Users can insert own accounts" on public.accounts for insert with check (auth.uid() = user_id);
create policy "Users can update own accounts" on public.accounts for update using (auth.uid() = user_id);
create policy "Users can delete own accounts" on public.accounts for delete using (auth.uid() = user_id);

-- Transactions
alter table public.transactions enable row level security;
drop policy if exists "Users can view own transactions" on public.transactions;
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);

-- Investments
alter table public.investments enable row level security;
drop policy if exists "Users can view own investments" on public.investments;
create policy "Users can view own investments" on public.investments for select using (auth.uid() = user_id);
create policy "Users can insert own investments" on public.investments for insert with check (auth.uid() = user_id);
create policy "Users can update own investments" on public.investments for update using (auth.uid() = user_id);
create policy "Users can delete own investments" on public.investments for delete using (auth.uid() = user_id);

-- Recurring Expenses
alter table public.recurring_expenses enable row level security;
drop policy if exists "Users can view own recurring" on public.recurring_expenses;
create policy "Users can view own recurring" on public.recurring_expenses for select using (auth.uid() = user_id);
create policy "Users can insert own recurring" on public.recurring_expenses for insert with check (auth.uid() = user_id);
create policy "Users can update own recurring" on public.recurring_expenses for update using (auth.uid() = user_id);
create policy "Users can delete own recurring" on public.recurring_expenses for delete using (auth.uid() = user_id);
