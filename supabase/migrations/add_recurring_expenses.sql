-- Migration: Add Recurring Expenses Table
-- Description: Creates table for managing recurring expenses that auto-generate monthly transactions

-- Create recurring_expenses table
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  origem TEXT NOT NULL CHECK (origem IN ('empresa', 'pessoal')),
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor_estimado NUMERIC NOT NULL CHECK (valor_estimado > 0),
  dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento >= 1 AND dia_vencimento <= 31),
  metodo_pagamento TEXT,
  conta_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recurring expenses" 
  ON public.recurring_expenses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring expenses" 
  ON public.recurring_expenses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring expenses" 
  ON public.recurring_expenses FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring expenses" 
  ON public.recurring_expenses FOR DELETE 
  USING (auth.uid() = user_id);

-- Add columns to transactions table for recurring expense tracking
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS recurring_expense_id UUID REFERENCES public.recurring_expenses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON public.recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_ativo ON public.recurring_expenses(ativo);
CREATE INDEX IF NOT EXISTS idx_transactions_recurring_expense_id ON public.transactions(recurring_expense_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recurring_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_recurring_expenses_updated_at ON public.recurring_expenses;
CREATE TRIGGER update_recurring_expenses_updated_at
  BEFORE UPDATE ON public.recurring_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_expenses_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.recurring_expenses IS 'Stores recurring expense templates that auto-generate monthly transactions';
COMMENT ON COLUMN public.recurring_expenses.origem IS 'empresa or pessoal - determines which cash flow this belongs to';
COMMENT ON COLUMN public.recurring_expenses.dia_vencimento IS 'Day of month (1-31) when expense is due';
COMMENT ON COLUMN public.recurring_expenses.valor_estimado IS 'Estimated amount - actual amount can be edited when generated';
COMMENT ON COLUMN public.recurring_expenses.ativo IS 'Whether this recurring expense is active and should generate transactions';
