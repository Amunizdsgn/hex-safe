"use client"

import { useState, useMemo } from 'react';
import { ClientTable } from '@/components/dashboard/clients/ClientTable';
import { ClientDetail } from '@/components/dashboard/clients/ClientDetail';
import { Users, UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useFinancialContext } from '@/contexts/FinancialContext';
import { analyzeClient } from '@/utils/clientLogic';

export default function ClientsPage() {
    const { clients, transactions } = useFinancialContext();
    const [selectedClient, setSelectedClient] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const enrichedClients = useMemo(() => {
        return clients.map(client => analyzeClient(client, transactions));
    }, [clients, transactions]);

    const handleViewClient = (client) => {
        setSelectedClient(client);
        setIsDetailOpen(true);
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

            {/* Quick Stats Rows could go here */}

            <div className="glass-card rounded-xl p-6">
                <ClientTable clients={enrichedClients} onViewClient={handleViewClient} />
            </div>

            <ClientDetail
                client={selectedClient}
                isOpen={isDetailOpen}
                onClose={handleCloseDetail}
            />
        </div>
    );
}
