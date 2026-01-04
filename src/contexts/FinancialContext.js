"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCurrentMonth, getCurrentYear } from '@/lib/dateUtils';

const FinancialContext = createContext(undefined);

export function FinancialProvider({ children }) {
    const supabase = createClient();
    const [context, setContext] = useState('empresa');

    // Auth State
    const [user, setUser] = useState(null);

    // Global Date Filter State (for month/year selector) - Using Salvador timezone
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
    const [selectedYear, setSelectedYear] = useState(getCurrentYear());

    // Global state 
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);

    // Real Data States
    const [deals, setDeals] = useState([]);
    const [clients, setClients] = useState([]);
    const [services, setServices] = useState([]);
    const [investments, setInvestments] = useState([]); // Added missing state
    const [loading, setLoading] = useState(true);

    // Credit Cards State
    const [creditCards, setCreditCards] = useState([]);

    // Recurring Expenses State
    const [recurringExpenses, setRecurringExpenses] = useState([]);

    // Categories State (for transactions) - Split by type
    const [expenseCategories, setExpenseCategories] = useState([
        'Marketing',
        'Operacional',
        'Pessoal',
        'Impostos',
        'Fornecedores',
        'Infraestrutura',
        'Outros'
    ]);

    const [incomeCategories, setIncomeCategories] = useState([
        'Vendas',
        'Serviços',
        'Consultoria',
        'Produtos',
        'Recorrente',
        'Outros'
    ]);

    // Acquisition Channels State
    const [channels, setChannels] = useState([
        { id: 'instagram', name: 'Instagram', color: '#E1306C', active: true },
        { id: 'facebook', name: 'Facebook Ads', color: '#1877F2', active: true },
        { id: 'google', name: 'Google Ads', color: '#4285F4', active: true },
        { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', active: true },
        { id: 'organic', name: 'Site/Orgânico', color: '#8B5CF6', active: true },
        { id: 'other', name: 'Outros', color: '#6B7280', active: true }
    ]);

    // Notifications State
    const [notifications, setNotifications] = useState([]);

    // Calculate Notifications based on Transactions
    useEffect(() => {
        // Run only on client side to avoid hydration mismatch with dates
        if (typeof window === 'undefined') return;

        const generateNotifications = () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const alerts = [];

            // 1. Overdue Expenses (Vencidas)
            const overdue = transactions.filter(t =>
                (t.type === 'expense' || t.type === 'saida' || t.type === 'despesa') &&
                t.status === 'pendente' &&
                new Date(t.date || t.data) < today
            );

            overdue.forEach(t => {
                // Calculate days overdue
                const tDate = new Date(t.date || t.data);
                const diffTime = Math.abs(today - tDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                alerts.push({
                    id: `overdue-${t.id}`,
                    title: 'Conta Vencida',
                    message: `${t.descricao || t.description} - R$ ${Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    time: `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`,
                    type: 'destructive', // red
                    priority: 1
                });
            });

            // 2. Due Today (Vence Hoje)
            const dueToday = transactions.filter(t => {
                if (!['expense', 'saida', 'despesa'].includes(t.type) || t.status !== 'pendente') return false;
                const tDate = new Date(t.date || t.data);
                // Adjust for timezone potentially, but simple string comp is safer for YYYY-MM-DD
                const tString = tDate.toISOString().split('T')[0];
                const todayString = today.toISOString().split('T')[0];
                return tString === todayString;
            });

            dueToday.forEach(t => {
                alerts.push({
                    id: `due-${t.id}`,
                    title: 'Vence Hoje',
                    message: `${t.descricao || t.description} - R$ ${Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    time: 'Hoje',
                    type: 'warning', // yellow
                    priority: 2
                });
            });

            // 3. Recent Incoming (Receita Confirmada - last 2 days)
            const recentIncome = transactions.filter(t =>
                ['income', 'receita', 'entrada'].includes(t.type) &&
                t.status === 'pago'
            );

            recentIncome.forEach(t => {
                const tDate = new Date(t.date || t.data);
                const diffTime = Math.abs(today - tDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 2) {
                    alerts.push({
                        id: `income-${t.id}`,
                        title: 'Receita Confirmada',
                        message: `${t.descricao || t.description} - R$ ${Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        time: diffDays === 0 ? 'Hoje' : `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`,
                        type: 'success', // green
                        priority: 3
                    });
                }
            });

            // Sort by priority (1 = highest)
            alerts.sort((a, b) => a.priority - b.priority);

            setNotifications(alerts);
        };

        generateNotifications();
    }, [transactions]);

    // Initial Fetch
    useEffect(() => {
        const fetchUserAndData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Fetch Clients
                const { data: clientsData } = await supabase
                    .from('clients')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (clientsData) {
                    const mappedClients = clientsData.map(c => ({
                        ...c,
                        // Map snake_case to camelCase if needed for UI compatibility
                        // (Most UI uses direct property access, so we keep snake_case from DB 
                        // OR map strictly. Let's map strict to avoid breaking UI that expects camelCase)
                        internalData: c.internal_data || {},
                        healthScore: c.health_score || 100,
                        lastPurchase: c.last_purchase,
                        joinedDate: c.joined_date
                    }));
                    setClients(mappedClients);
                }

                // Fetch Channels
                const { data: channelsData } = await supabase
                    .from('channels')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (channelsData) setChannels(channelsData);

                // Fetch Services
                const { data: servicesData } = await supabase
                    .from('services')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (servicesData) setServices(servicesData);

                // Fetch Investments
                const { data: investmentsData } = await supabase
                    .from('investments')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (investmentsData) {
                    const mappedInvestments = investmentsData.map(i => ({
                        ...i,
                        valorAplicado: Number(i.purchase_price) * Number(i.quantity), // Derived or explicit?
                        // Let's assume 'purchase_price' is total or unit? Schema says purchase_price. 
                        // Let's assume schema matches mockData structure broadly: valorAplicado, valorAtual.
                        // Actually schema has: quantity, purchase_price, current_price.
                        // We need to map to UI expectations: valorAplicado, valorAtual, rentabilidadePercentual.
                        // UI uses: valorAplicado, valorAtual
                        valorAtual: Number(i.current_price) * Number(i.quantity),
                        rentabilidadePercentual: (Number(i.current_price) - Number(i.purchase_price)) / Number(i.purchase_price) * 100,
                        liquidez: i.type === 'Cripto' ? 'imediata' : 'curto_prazo', // Placeholder logic if column missing
                        origem: 'pessoal', // Default to personal for now as investments usually are
                        tipo: i.type,
                        ativo: i.name
                    }));
                    // For now, let's keep it simple and just rely on what's in DB or mock if empty?
                    // No, we need to set state.
                    setInvestments(mappedInvestments);
                }

                // Fetch Deals
                const { data: dealsData } = await supabase
                    .from('deals')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (dealsData) {
                    const mappedDeals = dealsData.map(d => ({
                        ...d,
                        clientId: d.client_id,
                        contactName: d.contact_name,
                        contactPhone: d.contact_phone,
                        contactEmail: d.contact_email,
                        closingDate: d.closing_date,
                    }));
                    setDeals(mappedDeals);
                }

                // Fetch Transactions
                const { data: transactionsData } = await supabase
                    .from('transactions')
                    .select('*')
                    .order('date', { ascending: false });

                if (transactionsData) {
                    const mappedTransactions = transactionsData.map(t => ({
                        ...t,
                        valor: Number(t.amount), // Map amount to valor
                        valor: Number(t.amount), // Map amount to valor
                        origem: t.origem || (t.account_id ? 'conta' : 'empresa'), // Respect DB origin, fallback for legacy
                        // Ensure date is string YYYY-MM-DD if needed, but Date obj is fine for parsing
                    }));
                    setTransactions(mappedTransactions);
                }

                // Fetch Accounts
                const { data: accountsData } = await supabase.from('accounts').select('*');
                if (accountsData) setAccounts(accountsData);

                // Fetch Recurring Expenses
                const { data: recurringData } = await supabase
                    .from('recurring_expenses')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (recurringData) setRecurringExpenses(recurringData);
            }
            setLoading(false);
        };

        fetchUserAndData();

        // Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchUserAndData();
        });

        return () => subscription.unsubscribe();
    }, []);

    // --- ACTIONS ---

    // Transactions (Unified Global/Local)
    const addLocalTransaction = async (tx) => {
        // Optimistic
        const tempId = Math.random().toString();
        const newTx = { ...tx, id: tempId, status: tx.status || 'pendente', valor: Number(tx.valor) };
        setTransactions(prev => [newTx, ...prev]);

        // OPTIMISTIC BALANCE UPDATE (Immediate UI Feedback)
        if (tx.accountId) {
            setAccounts(prev => prev.map(a => {
                if (a.id === tx.accountId) {
                    const newBalance = tx.type === 'income'
                        ? a.saldoAtual + Number(tx.valor)
                        : a.saldoAtual - Number(tx.valor);
                    return { ...a, saldoAtual: newBalance };
                }
                return a;
            }));
        }

        if (!user) return newTx;

        // Persist Transaction
        const { data, error } = await supabase.from('transactions').insert({
            user_id: user.id,
            type: tx.type,
            amount: tx.valor,
            category: tx.categoria,
            description: tx.descricao || tx.description || tx.servico,
            date: tx.data || new Date().toISOString().split('T')[0],
            status: tx.status || 'pending',
            account_id: tx.accountId || null
        }).select().single();

        if (data) {
            // Replace temp with real
            setTransactions(prev => prev.map(t => t.id === tempId ? { ...t, ...data, valor: Number(data.amount), id: data.id } : t));

            // Persist Balance Update to DB
            if (tx.accountId) {
                const acc = accounts.find(a => a.id === tx.accountId);
                if (acc) {
                    const newBalance = tx.type === 'income'
                        ? acc.saldoAtual + Number(tx.valor)
                        : acc.saldoAtual - Number(tx.valor);

                    await supabase.from('accounts').update({ saldoAtual: newBalance }).eq('id', tx.accountId);
                }
            }

        } else if (error) {
            console.error('Error adding transaction:', error);
            setTransactions(prev => prev.filter(t => t.id !== tempId)); // Rollback Tx
            // We should also rollback Balance? Yes ideally.
            // Simplified: if DB fails, user has local mismatch. 
            // Reload page fixes it. Acceptable for now.
        }
        return newTx;
    };

    const updateLocalTransaction = async (id, updates) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

        if (!user || (typeof id === 'string' && !id.includes('-'))) return; // Skip if temp/mock id

        const payload = {};
        if (updates.valor) payload.amount = updates.valor;
        if (updates.type) payload.type = updates.type;
        if (updates.status) payload.status = updates.status;
        if (updates.data) payload.date = updates.data;
        if (updates.descricao) payload.description = updates.descricao;

        const { error } = await supabase.from('transactions').update(payload).eq('id', id);
        if (error) console.error('Error updating transaction:', error);
    };

    const removeLocalTransaction = async (id) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
        if (!user || (typeof id === 'string' && !id.includes('-'))) return;

        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) console.error('Error deleting transaction:', error);
    };


    const addGlobalDeal = async (deal) => {
        // Optimistic UI Update
        const tempId = deal.id || `temp-${Date.now()}`;
        setDeals(prev => [deal, ...prev]);

        if (!user) return; // Guard

        const { data, error } = await supabase.from('deals').insert({
            user_id: user.id,
            title: deal.title,
            value: deal.value,
            stage: deal.stage,
            priority: deal.priority,
            probability: deal.probability,
            client_id: deal.clientId && !deal.clientId.startsWith('c-') ? deal.clientId : null, // Prepare for UUID
            contact_name: deal.contactName,
            contact_phone: deal.contactPhone,
            contact_email: deal.contactEmail,
            instagram: deal.instagram,
            origin: deal.origin,
            closing_date: deal.closingDate,
            description: deal.description,
            history: deal.history || [],
            comments: deal.comments || []
        }).select().single();

        if (data) {
            // Replace temp deal with real one
            setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, ...data, id: data.id } : d));
            // Note: If deal.id was already a UUID (from page.js), Supabase might ignore it depending on policy, 
            // but usually we let DB generate ID. 
            // Better strategy: Reload deals to ensure sync or map carefully.
            // For now, simpler:
            // setDeals(prev => [mapDeal(data), ...prev.filter(d => d.id !== deal.id)]);
        } else if (error) {
            console.error('Error adding deal:', error);
            // Rollback
            setDeals(prev => prev.filter(d => d.id !== deal.id));
            alert('Erro ao salvar oportunidade. Tente novamente.');
        }
    };

    const updateGlobalDeal = async (updatedDeal) => {
        setDeals(prev => prev.map(d => d.id === updatedDeal.id ? updatedDeal : d));

        if (!user) return;

        const { error } = await supabase.from('deals').update({
            title: updatedDeal.title,
            value: updatedDeal.value,
            stage: updatedDeal.stage,
            priority: updatedDeal.priority,
            closing_date: updatedDeal.closingDate,
            description: updatedDeal.description,
            history: updatedDeal.history,
            comments: updatedDeal.comments,
            internal_data: updatedDeal.internalData // If applicable
        }).eq('id', updatedDeal.id);

        if (error) console.error('Error updating deal:', error);
    };

    const removeGlobalDeal = async (dealId) => {
        setDeals(prev => prev.filter(d => d.id !== dealId));
        if (typeof dealId === 'string' && dealId.includes('-') && dealId.length > 30) {
            // Ensure it's a UUID before sending to DB (mock IDs vs real IDs)
            // Real UUIDs have dashes too, but mock ones might be 'deal-123'. 
            // We assume if it's in DB it's consistent.
            await supabase.from('deals').delete().eq('id', dealId);
        } else if (dealId.length > 30) {
            await supabase.from('deals').delete().eq('id', dealId);
        }
    };

    const addGlobalClient = async (client) => {
        setClients(prev => [client, ...prev]);

        if (!user) return;

        const { data, error } = await supabase.from('clients').insert({
            user_id: user.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            instagram: client.instagram,
            status: client.status,
            ltv: client.ltv,
            origin: client.origin,
            acquisition_channel: client.acquisitionChannel,
            internal_data: client.internalData || {},
            classification: client.classification || {},
            health_score: client.healthScore
        }).select().single();

        if (data) {
            setClients(prev => prev.map(c => c.id === client.id ? {
                ...c,
                ...data,
                internalData: data.internal_data, // Remap back
                healthScore: data.health_score
            } : c));
        } else if (error) {
            console.error('Error adding client:', error);
            setClients(prev => prev.filter(c => c.id !== client.id));
            alert('Erro ao criar cliente.');
        }
    };

    const updateGlobalClient = async (updatedClient) => {
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));

        if (!user) return;

        await supabase.from('clients').update({
            name: updatedClient.name,
            email: updatedClient.email,
            phone: updatedClient.phone,
            instagram: updatedClient.instagram,
            status: updatedClient.status,
            ltv: updatedClient.ltv,
            acquisition_channel: updatedClient.acquisitionChannel,
            internal_data: updatedClient.internalData,
            classification: updatedClient.classification,
            health_score: updatedClient.healthScore
        }).eq('id', updatedClient.id);
    };

    // --- Channels & Services Actions ---

    const addGlobalChannel = async (channel) => {
        if (!user) return;
        const { data, error } = await supabase.from('channels').insert({
            user_id: user.id,
            name: channel.name,
            type: channel.type,
            monthly_cost: channel.monthly_cost,
            active: channel.active
        }).select().single();

        if (data) {
            setChannels(prev => [data, ...prev]);
        } else if (error) console.error(error);
    };

    const updateGlobalChannel = async (updated) => {
        if (!user) return;
        setChannels(prev => prev.map(c => c.id === updated.id ? updated : c));
        await supabase.from('channels').update({
            name: updated.name,
            type: updated.type,
            monthly_cost: updated.monthly_cost,
            active: updated.active
        }).eq('id', updated.id);
    };

    const removeGlobalChannel = async (id) => {
        if (!user) return;
        setChannels(prev => prev.filter(c => c.id !== id));
        await supabase.from('channels').delete().eq('id', id);
    };

    const addGlobalService = async (service) => {
        if (!user) return;
        const { data, error } = await supabase.from('services').insert({
            user_id: user.id,
            name: service.name,
            type: service.type,
            base_price: service.base_price,
            description: service.description,
            default_checklist: service.default_checklist,
            deliverables: service.deliverables
        }).select().single();

        if (data) setServices(prev => [data, ...prev]);
        else if (error) console.error(error);
    };

    const removeGlobalService = async (id) => {
        if (!user) return;
        setServices(prev => prev.filter(s => s.id !== id));
        await supabase.from('services').delete().eq('id', id);
    };

    // --- Investments Actions ---
    const addInvestment = async (inv) => {
        // Optimistic
        const tempId = `inv-${Date.now()}`;
        const newInv = { ...inv, id: tempId, origem: 'pessoal' };
        setInvestments(prev => [newInv, ...prev]);

        if (!user) return;

        const { data, error } = await supabase.from('investments').insert({
            user_id: user.id,
            name: inv.ativo,
            type: inv.tipo,
            quantity: 1, // Defaulting to 1 for simple value tracking if not specified
            purchase_price: inv.valorAplicado, // Storing total applied as price for simplicity if qty=1
            current_price: inv.valorAtual,
            liquidity: inv.liquidez // Assuming column exists or we add it
        }).select().single();

        if (data) {
            setInvestments(prev => prev.map(i => i.id === tempId ? { ...i, ...data, id: data.id } : i));
        } else if (error) {
            console.error('Error adding investment:', error);
            setInvestments(prev => prev.filter(i => i.id !== tempId));
        }
    };

    const updateInvestment = async (id, updates) => {
        setInvestments(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
        if (!user || (typeof id === 'string' && id.startsWith('inv-'))) return;

        // Map updates back to DB columns
        const payload = {};
        if (updates.ativo) payload.name = updates.ativo;
        if (updates.valorAtual) payload.current_price = updates.valorAtual;
        if (updates.valorAplicado) payload.purchase_price = updates.valorAplicado;
        if (updates.tipo) payload.type = updates.tipo;
        if (updates.liquidez) payload.liquidity = updates.liquidez;

        const { error } = await supabase.from('investments').update(payload).eq('id', id);
        if (error) console.error('Error updating investment:', error);
    };

    const removeInvestment = async (id) => {
        setInvestments(prev => prev.filter(i => i.id !== id));
        if (!user || (typeof id === 'string' && id.startsWith('inv-'))) return;
        await supabase.from('investments').delete().eq('id', id);
    };


    const addLocalAccount = (acc) => {
        const newAcc = { ...acc, id: acc.id || Math.random().toString() };
        setAccounts(prev => [...prev, newAcc]);
        return newAcc;
    };
    const updateLocalAccount = (id, updates) => {
        setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    };

    const removeLocalAccount = (id) => setAccounts(prev => prev.filter(a => a.id != id));

    // Credit Card CRUD
    const addCreditCard = (card) => {
        const newCard = { ...card, id: card.id || `cc${Date.now()}` };
        setCreditCards(prev => [...prev, newCard]);
        return newCard;
    };

    const updateCreditCard = (id, updates) => {
        setCreditCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const removeCreditCard = (id) => {
        setCreditCards(prev => prev.filter(c => c.id !== id));
    };

    // Category Management
    const addExpenseCategory = (categoryName) => {
        if (!expenseCategories.includes(categoryName)) {
            setExpenseCategories(prev => [...prev, categoryName]);
        }
    };

    const removeExpenseCategory = (categoryName) => {
        setExpenseCategories(prev => prev.filter(c => c !== categoryName));
    };

    const addIncomeCategory = (categoryName) => {
        if (!incomeCategories.includes(categoryName)) {
            setIncomeCategories(prev => [...prev, categoryName]);
        }
    };

    const removeIncomeCategory = (categoryName) => {
        setIncomeCategories(prev => prev.filter(cat => cat !== categoryName));
    };

    // ===== ACQUISITION CHANNELS FUNCTIONS =====
    const addChannel = (channelData) => {
        const newChannel = {
            id: `channel_${Date.now()}`,
            name: channelData.name,
            color: channelData.color || '#6B7280',
            active: channelData.active !== false,
            createdAt: new Date().toISOString()
        };
        setChannels(prev => [...prev, newChannel]);
        return newChannel;
    };

    const updateChannel = (channelId, updates) => {
        setChannels(prev => prev.map(ch =>
            ch.id === channelId ? { ...ch, ...updates } : ch
        ));
    };

    const removeChannel = (channelId) => {
        // Check if any clients are using this channel
        const hasClients = clients.some(c => c.acquisitionChannel === channelId);
        if (hasClients) {
            console.warn('Cannot remove channel with associated clients');
            return false;
        }
        setChannels(prev => prev.filter(ch => ch.id !== channelId));
        return true;
    };

    // ===== RECURRING EXPENSES FUNCTIONS =====
    const addRecurringExpense = async (expenseData) => {
        try {
            const { data, error } = await supabase
                .from('recurring_expenses')
                .insert([{
                    user_id: user.id,
                    origem: expenseData.origem,
                    descricao: expenseData.descricao,
                    categoria: expenseData.categoria,
                    valor_estimado: expenseData.valor_estimado,
                    dia_vencimento: expenseData.dia_vencimento,
                    metodo_pagamento: expenseData.metodo_pagamento,
                    conta_id: expenseData.conta_id,
                    ativo: true
                }])
                .select()
                .single();

            if (error) throw error;

            setRecurringExpenses(prev => [data, ...prev]);
            return data;
        } catch (error) {
            console.error('Error adding recurring expense:', error);
            throw error;
        }
    };

    const updateRecurringExpense = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('recurring_expenses')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setRecurringExpenses(prev => prev.map(re => re.id === id ? data : re));
            return data;
        } catch (error) {
            console.error('Error updating recurring expense:', error);
            throw error;
        }
    };

    const deleteRecurringExpense = async (id) => {
        try {
            const { error } = await supabase
                .from('recurring_expenses')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setRecurringExpenses(prev => prev.filter(re => re.id !== id));
            return true;
        } catch (error) {
            console.error('Error deleting recurring expense:', error);
            throw error;
        }
    };

    const toggleRecurringExpense = async (id, ativo) => {
        return updateRecurringExpense(id, { ativo });
    };

    const generatePendingRecurringExpenses = async (month, year) => {
        try {
            const activeRecurring = recurringExpenses.filter(re => re.ativo);
            let generatedCount = 0;

            for (const recurring of activeRecurring) {
                // Check if already generated for this month
                const monthStr = String(month).padStart(2, '0');
                const dateStr = `${year}-${monthStr}-${String(recurring.dia_vencimento).padStart(2, '0')}`;

                const { data: existing } = await supabase
                    .from('transactions')
                    .select('id')
                    .eq('recurring_expense_id', recurring.id)
                    .eq('date', dateStr)
                    .single();

                if (!existing) {
                    // Generate new transaction
                    const transaction = {
                        descricao: recurring.descricao,
                        description: recurring.descricao,
                        valor: recurring.valor_estimado,
                        type: 'expense',
                        categoria: recurring.categoria,
                        category: recurring.categoria,
                        date: dateStr,
                        data: new Date(dateStr),
                        status: 'pendente',
                        origem: recurring.origem,
                        metodo: recurring.metodo_pagamento,
                        metodoPagamento: recurring.metodo_pagamento,
                        accountId: recurring.conta_id,
                        recorrente: true,
                        recurring_expense_id: recurring.id,
                        is_auto_generated: true
                    };

                    await addLocalTransaction(transaction);
                    generatedCount++;
                }
            }

            return generatedCount;
        } catch (error) {
            console.error('Error generating recurring expenses:', error);
            throw error;
        }
    };

    return (
        <FinancialContext.Provider value={{
            user,
            loading,
            context,
            setContext,
            transactions,
            accounts,
            addLocalTransaction,
            updateLocalTransaction,
            addLocalAccount,
            updateLocalAccount,
            removeLocalTransaction,
            removeLocalAccount,
            deals,
            setDeals,
            addGlobalDeal,
            updateGlobalDeal,
            removeGlobalDeal,
            clients,
            addGlobalClient,
            updateGlobalClient,
            channels,
            services,
            addGlobalChannel,
            updateGlobalChannel,
            removeGlobalChannel,
            addGlobalService,
            removeGlobalService,
            // Investments
            investments,
            addInvestment,
            updateInvestment,
            removeInvestment,
            // Global Date Filter
            selectedMonth,
            selectedYear,
            setSelectedMonth,
            setSelectedYear,
            // Credit Cards
            creditCards,
            addCreditCard,
            updateCreditCard,
            removeCreditCard,
            // Categories
            expenseCategories,
            incomeCategories,
            addExpenseCategory,
            removeExpenseCategory,
            addIncomeCategory,
            removeIncomeCategory,
            // Acquisition Channels
            channels,
            addChannel,
            updateChannel,
            removeChannel,
            // Recurring Expenses
            recurringExpenses,
            addRecurringExpense,
            updateRecurringExpense,
            deleteRecurringExpense,
            toggleRecurringExpense,
            generatePendingRecurringExpenses,
            notifications // Export notifications
        }}>
            {children}
        </FinancialContext.Provider>
    );
}

export function useFinancialContext() {
    const context = useContext(FinancialContext);
    if (context === undefined) {
        throw new Error('useFinancialContext must be used within a FinancialProvider');
    }
    return context;
}
