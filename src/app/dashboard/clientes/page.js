"use client"

import { useState, useMemo, useEffect } from 'react';
import { ClientTable } from '@/components/dashboard/clients/ClientTable';
import { ClientDetail } from '@/components/dashboard/clients/ClientDetail';
import { Users, UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useFinancialContext } from '@/contexts/FinancialContext';
import { analyzeClient } from '@/utils/clientLogic';

import { ClientMetrics } from '@/components/dashboard/clients/ClientMetrics';

import { ClientActivationDialog } from '@/components/dashboard/clients/ClientActivationDialog';

export default function ClientsPage() {
    const { clients, transactions, updateGlobalClient } = useFinancialContext();
    const [selectedClient, setSelectedClient] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Activation Dialog State
    const [clientToActivate, setClientToActivate] = useState(null);
    const [isActivateOpen, setIsActivateOpen] = useState(false);

    const enrichedClients = useMemo(() => {
        return clients.map(client => analyzeClient(client, transactions));
    }, [clients, transactions]);

    // Keep selectedClient in sync with global state updates
    useEffect(() => {
        if (selectedClient) {
            const updatedClient = enrichedClients.find(c => c.id === selectedClient.id);
            // Only update if data actually changed to avoid loops, though React helps here
            if (updatedClient && JSON.stringify(updatedClient) !== JSON.stringify(selectedClient)) {
                setSelectedClient(updatedClient);
            }
        }
    }, [enrichedClients]);

    const handleViewClient = (client) => {
        setSelectedClient(client);
        setIsDetailOpen(true);
    };

    const handleActivateClick = (client) => {
        setClientToActivate(client);
        setIsActivateOpen(true);
    };

    const confirmActivation = async (checklistSteps, financialData = {}) => {
        if (clientToActivate) {
            const updatedClient = {
                ...clientToActivate,
                name: financialData.name || clientToActivate.name, // Allow name update
                acquisitionChannel: financialData.acquisitionChannel || clientToActivate.acquisitionChannel, // Allow channel update
                status: 'Ativo',
                internalData: {
                    ...(clientToActivate.internalData || {}),
                    contactName: financialData.contactName, // Save contact name
                    contract: {
                        ...(clientToActivate.internalData?.contract || {}),
                        value: financialData.contractValue
                    },
                    recurrentSettings: {
                        ...(clientToActivate.internalData?.recurrentSettings || {}),
                        billingDay: financialData.billingDay
                    },
                    relationshipType: financialData.relationshipType, // Persist selection (Pontual/Recorrente)
                    activationChecklist: checklistSteps
                }
            };
            await updateGlobalClient(updatedClient);
            setIsActivateOpen(false);
            setClientToActivate(null);
        }
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Carteira de Clientes</h2>
                    <p className="text-muted-foreground">Gerencie seus relacionamentos e identificadores de valor</p>
                </div>
                <Button className="gap-2" onClick={() => {
                    setSelectedClient({ name: '', email: '', phone: '', status: 'Ativo', tags: [], classification: { healthScore: 'N/A' } }); // Empty client template
                    setIsDetailOpen(true);
                }}>
                    <UserPlus className="w-4 h-4" /> Novo Cliente
                </Button>
            </div>

            {/* Metrics Dashboard */}
            <ClientMetrics clients={enrichedClients} />

            <div className="glass-card rounded-xl p-6">
                <ClientTable
                    clients={enrichedClients}
                    onViewClient={handleViewClient}
                    onActivateClient={handleActivateClick}
                />
            </div>

            <ClientDetail
                client={selectedClient}
                isOpen={isDetailOpen}
                onClose={handleCloseDetail}
            />

            {/* Custom Activation Workflow */}
            <ClientActivationDialog
                isOpen={isActivateOpen}
                onClose={() => setIsActivateOpen(false)}
                client={clientToActivate}
                onConfirm={confirmActivation}
            />
        </div>
    );
}
