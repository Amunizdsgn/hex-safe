"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    companyExpenses,
    companyRevenues,
    personalExpenses,
    personalRevenues,
    financialAccounts,
    // crmDeals, // Replaced by Real Data
    // clients as mockClients // Replaced by Real Data
} from '@/data/mockData';

const FinancialContext = createContext(undefined);

export function FinancialProvider({ children }) {
    const supabase = createClient();
    const [context, setContext] = useState('empresa');

    // Auth State
    const [user, setUser] = useState(null);

    // Global state 
    const [transactions, setTransactions] = useState([
        ...companyExpenses, ...companyRevenues, ...personalExpenses, ...personalRevenues
    ]);
    const [accounts, setAccounts] = useState(financialAccounts);

    // Real Data States
    const [deals, setDeals] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

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
        if (typeof dealId === 'string' && dealId.includes('-')) {
            // Ensure it's a UUID before sending to DB (mock IDs vs real IDs)
            // Real UUIDs have dashes too, but mock ones might be 'deal-123'. 
            // We assume if it's in DB it's consistent.
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
            internal_data: updatedClient.internalData,
            classification: updatedClient.classification,
            health_score: updatedClient.healthScore
        }).eq('id', updatedClient.id);
    };

    // --- Legacy / Transitory ---
    const addLocalTransaction = (tx) => {
        const newTx = { ...tx, id: Math.random().toString(), status: tx.status || 'pendente' };
        setTransactions(prev => [newTx, ...prev]);
        return newTx;
    };
    const removeLocalTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id));
    const addLocalAccount = (acc) => {
        const newAcc = { ...acc, id: Math.random().toString() };
        setAccounts(prev => [...prev, newAcc]);
        return newAcc;
    };
    const removeLocalAccount = (id) => setAccounts(prev => prev.filter(a => a.id != id));

    return (
        <FinancialContext.Provider value={{
            user,
            loading,
            context,
            setContext,
            transactions,
            accounts,
            addLocalTransaction,
            addLocalAccount,
            removeLocalTransaction,
            removeLocalAccount,
            deals,
            setDeals,
            addGlobalDeal,
            updateGlobalDeal,
            removeGlobalDeal,
            clients,
            addGlobalClient,
            updateGlobalClient
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
