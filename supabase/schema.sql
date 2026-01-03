-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  plan_type text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ACCOUNTS (Contas bancárias, carteiras)
create table public.accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null, -- 'checking', 'savings', 'wallet', 'investment'
  balance numeric default 0,
  currency text default 'BRL',
  color text, -- For UI decoration
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRANSACTIONS (Transações)
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,
  type text not null, -- 'income', 'expense'
  amount numeric not null,
  category text,
  description text,
  date date default current_date,
  status text default 'completed', -- 'pending', 'completed', 'overdue'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVESTMENTS (Investimentos)
create table public.investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null, -- 'stock', 'crypto', 'fixed_income'
  quantity numeric default 0,
  purchase_price numeric default 0,
  current_price numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Segurança)

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.investments enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Accounts Policies
create policy "Users can view own accounts" on public.accounts
  for select using (auth.uid() = user_id);

create policy "Users can insert own accounts" on public.accounts
  for insert with check (auth.uid() = user_id);

create policy "Users can update own accounts" on public.accounts
  for update using (auth.uid() = user_id);

create policy "Users can delete own accounts" on public.accounts
  for delete using (auth.uid() = user_id);

-- Transactions Policies
create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own transactions" on public.transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete own transactions" on public.transactions
  for delete using (auth.uid() = user_id);

-- Investments Policies
create policy "Users can view own investments" on public.investments
  for select using (auth.uid() = user_id);

create policy "Users can insert own investments" on public.investments
  for insert with check (auth.uid() = user_id);

create policy "Users can update own investments" on public.investments
  for update using (auth.uid() = user_id);

create policy "Users can delete own investments" on public.investments
  for delete using (auth.uid() = user_id);

-- FUNCTION TO HANDLE NEW USER SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- TRIGGER FOR NEW USER
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
