-- ============================================================================
-- SCRIPT MESTRE DE CONFIGURAÇÃO DO SISTEMA (CORRIGIDO)
-- Execute este script COMPLETO no SQL Editor do Supabase.
-- Agora inclui comandos para limpar políticas antigas e evitar erros de duplicidade.
-- ============================================================================

-- 1. Extensões
create extension if not exists "uuid-ossp";

-- 2. Perfis de Usuário (Profiles)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  plan_type text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger para criar perfil automaticamente ao cadastrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;

-- 3. Finanças: Contas (Accounts)
create table if not exists public.accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null,
  balance numeric default 0,
  currency text default 'BRL',
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.accounts enable row level security;
-- Drop policies to avoid conflict
drop policy if exists "Users can view own accounts" on public.accounts;
drop policy if exists "Users can insert own accounts" on public.accounts;
drop policy if exists "Users can update own accounts" on public.accounts;
drop policy if exists "Users can delete own accounts" on public.accounts;
-- Create policies
create policy "Users can view own accounts" on public.accounts for select using (auth.uid() = user_id);
create policy "Users can insert own accounts" on public.accounts for insert with check (auth.uid() = user_id);
create policy "Users can update own accounts" on public.accounts for update using (auth.uid() = user_id);
create policy "Users can delete own accounts" on public.accounts for delete using (auth.uid() = user_id);

-- 4. Finanças: Transações (Transactions)
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,
  type text not null,
  amount numeric not null,
  category text,
  description text,
  date date default current_date,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.transactions enable row level security;
drop policy if exists "Users can view own transactions" on public.transactions;
drop policy if exists "Users can insert own transactions" on public.transactions;
drop policy if exists "Users can update own transactions" on public.transactions;
drop policy if exists "Users can delete own transactions" on public.transactions;

create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);

-- 5. Finanças: Investimentos (Investments)
create table if not exists public.investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null,
  quantity numeric default 0,
  purchase_price numeric default 0,
  current_price numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.investments enable row level security;
drop policy if exists "Users can view own investments" on public.investments;
drop policy if exists "Users can insert own investments" on public.investments;
drop policy if exists "Users can update own investments" on public.investments;
drop policy if exists "Users can delete own investments" on public.investments;

create policy "Users can view own investments" on public.investments for select using (auth.uid() = user_id);
create policy "Users can insert own investments" on public.investments for insert with check (auth.uid() = user_id);
create policy "Users can update own investments" on public.investments for update using (auth.uid() = user_id);
create policy "Users can delete own investments" on public.investments for delete using (auth.uid() = user_id);

-- 6. Rotina: Tarefas (Tasks)
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  completed boolean default false,
  is_habit boolean default false,
  frequency text,
  streak integer default 0,
  last_completed_at timestamp with time zone,
  
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  is_all_day boolean default false,
  location text,
  reminder_minutes integer,
  
  due_date date,
  priority text default 'medium',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tasks add column if not exists start_at timestamp with time zone;
alter table public.tasks add column if not exists end_at timestamp with time zone;
alter table public.tasks add column if not exists is_all_day boolean default false;
alter table public.tasks add column if not exists location text;
alter table public.tasks add column if not exists reminder_minutes integer;

alter table public.tasks enable row level security;
drop policy if exists "Users can view own tasks" on public.tasks;
drop policy if exists "Users can insert own tasks" on public.tasks;
drop policy if exists "Users can update own tasks" on public.tasks;
drop policy if exists "Users can delete own tasks" on public.tasks;

create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);

-- 7. CRM: Canais (Channels)
create table if not exists public.channels (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text default 'Pago',
  monthly_cost numeric default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.channels enable row level security;
drop policy if exists "Users can view own channels" on public.channels;
drop policy if exists "Users can insert own channels" on public.channels;
drop policy if exists "Users can update own channels" on public.channels;
drop policy if exists "Users can delete own channels" on public.channels;

create policy "Users can view own channels" on public.channels for select using (auth.uid() = user_id);
create policy "Users can insert own channels" on public.channels for insert with check (auth.uid() = user_id);
create policy "Users can update own channels" on public.channels for update using (auth.uid() = user_id);
create policy "Users can delete own channels" on public.channels for delete using (auth.uid() = user_id);

-- 8. CRM: Serviços (Services)
create table if not exists public.services (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text default 'Recorrente',
  base_price numeric default 0,
  description text,
  default_checklist jsonb default '[]'::jsonb,
  deliverables jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.services enable row level security;
drop policy if exists "Users can view own services" on public.services;
drop policy if exists "Users can insert own services" on public.services;
drop policy if exists "Users can update own services" on public.services;
drop policy if exists "Users can delete own services" on public.services;

create policy "Users can view own services" on public.services for select using (auth.uid() = user_id);
create policy "Users can insert own services" on public.services for insert with check (auth.uid() = user_id);
create policy "Users can update own services" on public.services for update using (auth.uid() = user_id);
create policy "Users can delete own services" on public.services for delete using (auth.uid() = user_id);

-- 9. CRM: Clientes (Clients)
create table if not exists public.clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  instagram text,
  status text default 'Ativo',
  ltv numeric default 0,
  last_purchase timestamp with time zone,
  joined_date timestamp with time zone default timezone('utc'::text, now()),
  origin text,
  classification jsonb default '{}'::jsonb,
  health_score integer default 100,
  internal_data jsonb default '{}'::jsonb,
  
  channel_id uuid references public.channels(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.clients enable row level security;
drop policy if exists "Users can view own clients" on public.clients;
drop policy if exists "Users can insert own clients" on public.clients;
drop policy if exists "Users can update own clients" on public.clients;
drop policy if exists "Users can delete own clients" on public.clients;

create policy "Users can view own clients" on public.clients for select using (auth.uid() = user_id);
create policy "Users can insert own clients" on public.clients for insert with check (auth.uid() = user_id);
create policy "Users can update own clients" on public.clients for update using (auth.uid() = user_id);
create policy "Users can delete own clients" on public.clients for delete using (auth.uid() = user_id);

-- 10. CRM: Negócios/Deals
create table if not exists public.deals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  value numeric default 0,
  stage text not null,
  probability numeric default 0,
  priority text default 'Medium',
  contact_name text,
  contact_phone text,
  contact_email text,
  instagram text,
  origin text,
  closing_date date,
  description text,
  history jsonb default '[]'::jsonb,
  comments jsonb default '[]'::jsonb,
  
  channel_id uuid references public.channels(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.deals enable row level security;
drop policy if exists "Users can view own deals" on public.deals;
drop policy if exists "Users can insert own deals" on public.deals;
drop policy if exists "Users can update own deals" on public.deals;
drop policy if exists "Users can delete own deals" on public.deals;

create policy "Users can view own deals" on public.deals for select using (auth.uid() = user_id);
create policy "Users can insert own deals" on public.deals for insert with check (auth.uid() = user_id);
create policy "Users can update own deals" on public.deals for update using (auth.uid() = user_id);
create policy "Users can delete own deals" on public.deals for delete using (auth.uid() = user_id);

-- 11. Conclusão
-- Tudo atualizado.
