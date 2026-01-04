-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Mantido)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  plan_type text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ACCOUNTS (Mantido)
create table public.accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null,
  balance numeric default 0,
  currency text default 'BRL',
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRANSACTIONS (Mantido)
create table public.transactions (
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

-- INVESTMENTS (Mantido)
create table public.investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null,
  quantity numeric default 0,
  purchase_price numeric default 0,
  current_price numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- [[ NEW TABLES FOR CRM & CLIENTS ]] --

-- CLIENTS
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  instagram text,
  status text default 'Ativo', -- 'Ativo', 'Inativo', 'Lead'
  ltv numeric default 0,
  last_purchase timestamp with time zone,
  joined_date timestamp with time zone default timezone('utc'::text, now()),
  origin text,
  
  -- Campos Estratégicos (Health Score, Classificação, etc)
  classification jsonb default '{}'::jsonb, -- { status: 'Tranquilo', effort: 'Baixo' }
  health_score integer default 100,
  
  -- Módulo de Gestão Interna (Board Completo)
  internal_data jsonb default '{}'::jsonb, 
  -- Estrutura do internal_data:
  -- {
  --   lifecycleStage: 'onboarding' | 'active',
  --   onboardingChecklist: [],
  --   relationshipType: 'Recorrente' | 'Pontual',
  --   cycles: [],
  --   projects: [],
  --   contract: { value, startDate, ... },
  --   decisionsLog: ''
  -- }

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CRM DEALS (Oportunidades)
create table public.deals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null, -- Link opcional
  
  title text not null,
  value numeric default 0,
  stage text not null, -- 'Prospecção', 'Qualificação', etc
  probability numeric default 0,
  priority text default 'Medium',
  
  -- Dados de Contato (se não tiver client_id ainda)
  contact_name text,
  contact_phone text,
  contact_email text,
  instagram text,
  origin text,
  
  closing_date date,
  description text,
  
  -- Histórico e Comentários
  history jsonb default '[]'::jsonb,
  comments jsonb default '[]'::jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES REMAINING...
alter table public.clients enable row level security;
alter table public.deals enable row level security;

-- Client Policies
create policy "Users can view own clients" on public.clients for select using (auth.uid() = user_id);
create policy "Users can insert own clients" on public.clients for insert with check (auth.uid() = user_id);
create policy "Users can update own clients" on public.clients for update using (auth.uid() = user_id);
create policy "Users can delete own clients" on public.clients for delete using (auth.uid() = user_id);

-- Deal Policies
create policy "Users can view own deals" on public.deals for select using (auth.uid() = user_id);
create policy "Users can insert own deals" on public.deals for insert with check (auth.uid() = user_id);
create policy "Users can update own deals" on public.deals for update using (auth.uid() = user_id);
create policy "Users can delete own deals" on public.deals for delete using (auth.uid() = user_id);

-- Existing Triggers...
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Re-create trigger just in case (optional here if already ran, but good for full script)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- [[ UNIFICATION MIGRATION ]] --

-- CHANNELS (Canais de Aquisição)
create table public.channels (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text default 'Pago', -- 'Pago', 'Orgânico', 'Parceria', 'Indicação'
  monthly_cost numeric default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SERVICES (Catálogo de Serviços)
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text default 'Recorrente', -- 'Recorrente', 'Pontual'
  base_price numeric default 0,
  description text,
  default_checklist jsonb default '[]'::jsonb,
  deliverables jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for New Tables
alter table public.channels enable row level security;
alter table public.services enable row level security;

create policy "Users can view own channels" on public.channels for select using (auth.uid() = user_id);
create policy "Users can insert own channels" on public.channels for insert with check (auth.uid() = user_id);
create policy "Users can update own channels" on public.channels for update using (auth.uid() = user_id);
create policy "Users can delete own channels" on public.channels for delete using (auth.uid() = user_id);

create policy "Users can view own services" on public.services for select using (auth.uid() = user_id);
create policy "Users can insert own services" on public.services for insert with check (auth.uid() = user_id);
create policy "Users can update own services" on public.services for update using (auth.uid() = user_id);
create policy "Users can delete own services" on public.services for delete using (auth.uid() = user_id);

-- Add Columns to Existing Tables via ALTER
alter table public.clients add column if not exists channel_id uuid references public.channels(id) on delete set null;
alter table public.clients add column if not exists service_id uuid references public.services(id) on delete set null;

alter table public.deals add column if not exists channel_id uuid references public.channels(id) on delete set null;
alter table public.deals add column if not exists service_id uuid references public.services(id) on delete set null;
