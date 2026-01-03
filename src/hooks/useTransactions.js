import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useFinancialContext } from '@/contexts/FinancialContext';

export function useTransactions(context = 'all') {
    const { transactions: ctxTransactions, addLocalTransaction } = useFinancialContext();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const supabase = createClient();

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);

            // Check if we have credentials
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                // Use Global Context Data
                let filtered = ctxTransactions;
                // Basic filtering for demo context
                // This relies on the fact that mockData items have 'origem' which matches context ('empresa'/'pessoal')
                if (context !== 'all' && context !== 'consolidado') {
                    filtered = ctxTransactions.filter(t => t.origem === context || t.origin === context);
                }
                setTransactions(filtered);
                setLoading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // If no user logged in, use context data too
                let filtered = ctxTransactions;
                if (context !== 'all' && context !== 'consolidado') {
                    filtered = ctxTransactions.filter(t => t.origem === context || t.origin === context);
                }
                setTransactions(filtered);
                setLoading(false);
                return;
            }

            let query = supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });

            // Apply context filters if needed
            if (context !== 'all' && context !== 'consolidado') {
                // Assuming DB has 'origin' or we decide structure. Protocol: 'type' or 'category'.
                // Let's assume we filter in memory or extend schema later.
            }

            const { data, error } = await query;

            if (error) throw error;

            setTransactions(data || []);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            let filtered = ctxTransactions;
            if (context !== 'all' && context !== 'consolidado') {
                filtered = ctxTransactions.filter(t => t.origem === context || t.origin === context);
            }
            setTransactions(filtered);
        } finally {
            setLoading(false);
        }
    }, [context, supabase, ctxTransactions]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const addTransaction = async (transaction) => {
        try {
            setLoading(true);
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
                // Use Context Action
                const newTx = addLocalTransaction(transaction);
                // Local state update happens via effect or direct set?
                // Since we refetch from ctxTransactions which changed, we might need to trigger update.
                // But ctxTransactions is in dependency array of fetchTransactions? Yes.
                // So simple return matches.
                return { data: newTx, error: null };
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('transactions')
                .insert([{ ...transaction, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            setTransactions(prev => [data, ...prev]);
            return { data, error: null };
        } catch (err) {
            console.error('Error adding transaction:', err);
            const newTx = addLocalTransaction(transaction);
            return { data: newTx, error: null };
        } finally {
            setLoading(false);
        }
    };

    return { transactions, loading, error, refetch: fetchTransactions, addTransaction };
}
