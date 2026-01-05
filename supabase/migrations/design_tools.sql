-- Migration: Add Code Snippets for Design Tools
-- Description: Stores code snippets for the Web Designer module

CREATE TABLE IF NOT EXISTS public.code_snippets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT DEFAULT 'javascript',
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own snippets" ON public.code_snippets;
CREATE POLICY "Users can view own snippets" 
  ON public.code_snippets FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own snippets" ON public.code_snippets;
CREATE POLICY "Users can insert own snippets" 
  ON public.code_snippets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own snippets" ON public.code_snippets;
CREATE POLICY "Users can update own snippets" 
  ON public.code_snippets FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own snippets" ON public.code_snippets;
CREATE POLICY "Users can delete own snippets" 
  ON public.code_snippets FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger for Updated At
CREATE OR REPLACE FUNCTION update_code_snippets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_code_snippets_updated_at ON public.code_snippets;
CREATE TRIGGER update_code_snippets_updated_at
  BEFORE UPDATE ON public.code_snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_code_snippets_updated_at();
