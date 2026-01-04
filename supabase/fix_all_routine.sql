-- ============================================================================
-- SCRIPT DE CORREÇÃO E ATUALIZAÇÃO COMPLETA - ROTINA E SAAS
-- Execute este script no SQL Editor do Supabase para corrigir todos os erros.
-- ============================================================================

-- 1. Criação da Tabela de Tarefas (Se não existir)
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
  
  -- Novos campos para Calendário e Horários
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  is_all_day boolean default false,
  location text,
  reminder_minutes integer,
  
  due_date date, -- Mantido para compatibilidade, mas preferimos start_at
  priority text default 'medium',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Garantir que as colunas existam (Caso a tabela já existisse sem elas)
alter table public.tasks add column if not exists start_at timestamp with time zone;
alter table public.tasks add column if not exists end_at timestamp with time zone;
alter table public.tasks add column if not exists is_all_day boolean default false;
alter table public.tasks add column if not exists location text;
alter table public.tasks add column if not exists reminder_minutes integer;

-- 3. Habilitar RLS (Segurança SaaS)
alter table public.tasks enable row level security;

-- 4. Criar Políticas de Segurança (Remove antigas para evitar duplicidade)
drop policy if exists "Users can view own tasks" on public.tasks;
drop policy if exists "Users can insert own tasks" on public.tasks;
drop policy if exists "Users can update own tasks" on public.tasks;
drop policy if exists "Users can delete own tasks" on public.tasks;

create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);

-- 5. Reforçar Segurança nas outras tabelas (SaaS Isolation)
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;

-- Policies Accounts
drop policy if exists "Users can view own accounts" on public.accounts;
create policy "Users can view own accounts" on public.accounts for select using (auth.uid() = user_id);
-- (Adicione outras policies de insert/update apenas se necessário, o select é o mais crítico para visualização)

-- FIM DO SCRIPT
