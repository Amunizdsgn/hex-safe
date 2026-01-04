-- ============================================
-- SCRIPT PARA LIMPAR CANAIS E SERVIÇOS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para remover canais e serviços de teste
-- ============================================

-- ATENÇÃO: Este script vai DELETAR canais e serviços!
-- Use para fazer testes com dados limpos.
-- Não há como desfazer esta ação!

-- ============================================
-- 1. LIMPAR CANAIS DE AQUISIÇÃO
-- ============================================
DELETE FROM public.channels;

-- ============================================
-- 2. LIMPAR SERVIÇOS
-- ============================================
DELETE FROM public.services;

-- ============================================
-- VERIFICAR SE ESTÁ VAZIO
-- ============================================
-- Execute estas queries para confirmar que está tudo limpo:

SELECT COUNT(*) as total_channels FROM public.channels;
SELECT COUNT(*) as total_services FROM public.services;

-- ============================================
-- RESULTADO ESPERADO: Ambos devem retornar 0
-- ============================================

-- ============================================
-- NOTA: Clientes, investimentos, transações
-- e contas NÃO foram afetados
-- ============================================
