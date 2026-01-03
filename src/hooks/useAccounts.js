import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useFinancialContext } from '@/contexts/FinancialContext';

export function useAccounts(context = 'all') {
    const { accounts: ctxAccounts, addLocalAccount, removeLocalAccount } = useFinancialContext();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const supabase = createClient();

    const fetchAccounts = useCallback(async () => {
        try {
            setLoading(true);

            // Check credential existence
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
                // Fallback
                const filtered = context === 'all' || context === 'consolidado'
                    ? ctxAccounts
                    : ctxAccounts.filter(a => a.origem === context);
                setAccounts(filtered);
                setLoading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Fallback if no user
                const filtered = context === 'all' || context === 'consolidado'
                    ? ctxAccounts
                    : ctxAccounts.filter(a => a.origem === context);
                setAccounts(filtered);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('accounts')
                .select('*');

            if (error) throw error;
            setAccounts(data || []);

        } catch (err) {
            console.error('Error fetching accounts:', err);
            // Fallback
            const filtered = context === 'all' || context === 'consolidado'
                ? ctxAccounts
                : ctxAccounts.filter(a => a.origem === context);
            setAccounts(filtered);
        } finally {
            setLoading(false);
        }
    }, [context, supabase, ctxAccounts]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const addAccount = async (account) => {
        try {
            setLoading(true);
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
                const newAcc = addLocalAccount(account);
                return { data: newAcc, error: null };
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('accounts')
                .insert([{ ...account, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            setAccounts(prev => [...prev, data]);
            return { data, error: null };
        } catch (err) {
            console.error('Error adding account:', err);
            const newAcc = addLocalAccount(account);
            return { data: newAcc, error: null };
        } finally {
            setLoading(false);
        }
    };

    const removeAccount = async (id) => {
        try {
            setLoading(true);
            console.log('Attempting to delete account:', id);

            // Should match by string/number accordingly
            const localFallback = () => {
                if (typeof removeLocalAccount === 'function') {
                    console.log('Using removeLocalAccount fallback');
                    removeLocalAccount(id);
                } else {
                    console.error('removeLocalAccount is not defined in context');
                }
            };

            if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
                localFallback();
                return { error: null };
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.warn('User not authenticated, using fallback');
                localFallback();
                return { error: null };
            }

            const { error } = await supabase
                .from('accounts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Update local state even if supabase success to reflect immediately?
            // Usually fetchAccounts catches it, but for good UX:
            setAccounts(prev => prev.filter(a => a.id !== id));
            return { error: null };
        } catch (err) {
            console.error('Error deleting account:', err);
            // Fallback
            if (typeof removeLocalAccount === 'function') {
                removeLocalAccount(id);
            }
            return { error: null };
        } finally {
            setLoading(false);
        }
    };

    return { accounts, loading, refetch: fetchAccounts, addAccount, removeAccount };
}
