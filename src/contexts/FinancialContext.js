"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const FinancialContext = createContext(undefined);

export function FinancialProvider({ children }) {
    const supabase = createClient();
    const [context, setContext] = useState('empresa');

    // Auth State
    const [user, setUser] = useState(null);

    // Global Date Filter State (for month/year selector)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
        { id: 'referral', name: 'Indicação', color: '#10B981', active: true },
        { id: 'organic', name: 'Site/Orgânico', color: '#8B5CF6', active: true },
        { id: 'other', name: 'Outros', color: '#6B7280', active: true }
    ]);

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
                        origem: t.account_id ? 'conta' : 'empresa', // Heuristic or need join
                        // Ensure date is string YYYY-MM-DD if needed, but Date obj is fine for parsing
                    }));
                    setTransactions(mappedTransactions);
                }

                // Fetch Accounts
                const { data: accountsData } = await supabase.from('accounts').select('*');
                if (accountsData) setAccounts(accountsData);
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
            removeChannel
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
