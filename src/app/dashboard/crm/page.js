"use client"

import { useState } from 'react';
import { crmDeals, crmStages, formatCurrency } from '@/data/mockData';
import { DealKanban } from '@/components/dashboard/crm/DealKanban';
import { SalesFunnel } from '@/components/dashboard/crm/SalesFunnel';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DealDetail } from '@/components/dashboard/crm/DealDetail';

import { useFinancialContext } from '@/contexts/FinancialContext';


export default function CRMPage() {
    // OLD: const [deals, setDeals] = useState(crmDeals);
    const { addLocalTransaction, deals, addGlobalDeal, updateGlobalDeal, addGlobalClient, updateGlobalClient, removeGlobalDeal, clients, channels, services, selectedMonth, selectedYear } = useFinancialContext();
    const [isNewDealOpen, setIsNewDealOpen] = useState(false);
    const [selectedOrigin, setSelectedOrigin] = useState('');
    const [phone, setPhone] = useState('');

    const [selectedDeal, setSelectedDeal] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const handleDealClick = (deal) => {
        setSelectedDeal(deal);
        setIsDetailOpen(true);
    };

    const handleAddComment = (dealId, text) => {
        const dealToUpdate = deals.find(d => d.id === dealId);
        if (!dealToUpdate) return;

        const newComment = {
            id: `cm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'comment',
            date: new Date(),
            text: text
        };

        const updatedDeal = {
            ...dealToUpdate,
            comments: [...(dealToUpdate.comments || []), newComment]
        };

        updateGlobalDeal(updatedDeal);
        setSelectedDeal(updatedDeal); // Keep modal aligned
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);

        // Apply mask
        if (value.length > 10) {
            value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else if (value.length > 5) {
            value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (value.length > 2) {
            value = value.replace(/^(\d\d)(\d{0,5}).*/, "($1) $2");
        } else {
            value = value.replace(/^(\d*)/, "($1");
        }

        setPhone(value);
    };

    const handleCreateDeal = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const newDeal = {
            id: `d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: formData.get('title'),
            clientId: formData.get('client') || 'c-new',
            value: parseFloat(formData.get('value')),
            stage: 'Prospecção',
            probability: 0.1,
            closingDate: formData.get('date'),
            priority: formData.get('priority'),
            contactName: formData.get('contactName'),
            contactPhone: phone, // Use state value
            contactEmail: formData.get('contactEmail'),
            origin: channels.find(c => c.id === formData.get('channelId'))?.name || 'Outros', // Look up name from ID
            instagram: formData.get('instagram'),
            description: formData.get('description'),
            owner: 'Eu',
            channelId: formData.get('channelId'),
            serviceId: formData.get('serviceId')
        };

        addGlobalDeal(newDeal);
        setIsNewDealOpen(false);
        setPhone(''); // Reset phone
        setSelectedOrigin(''); // Reset origin
    };

    const handleMoveDeal = (dealId, directionOrStageId) => {
        const deal = deals.find(d => d.id === dealId);
        if (!deal) return;

        let nextStageId = deal.stage;

        // Direct Stage Assignment (DnD)
        const isStageId = crmStages.some(s => s.id === directionOrStageId);
        if (isStageId) {
            nextStageId = directionOrStageId;
        } else {
            // Legacy Direction Logic (Dropdown)
            const currentStageIndex = crmStages.findIndex(s => s.id === deal.stage);
            if (currentStageIndex === -1) return;

            let nextStageIndex = currentStageIndex;
            if (directionOrStageId === 'next' && currentStageIndex < crmStages.length - 1) {
                nextStageIndex++;
            }
            nextStageId = crmStages[nextStageIndex].id;
        }

        // Logic check
        if (nextStageId === deal.stage) return;

        // Automation Check
        if (deal.stage !== 'Fechado' && nextStageId === 'Fechado') {
            let finalClientId = deal.clientId;
            let finalClientName = 'Cliente CRM';

            // 1. Check if it's a new prospect (not in clients DB)
            if (deal.clientId === 'c-externo' || deal.clientId === 'c-new' || !clients.find(c => c.id === deal.clientId)) {
                const newClient = {
                    id: `cli-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: deal.contactName || deal.clientName || 'Novo Cliente',
                    email: deal.contactEmail || '',
                    phone: deal.contactPhone || '',
                    instagram: deal.instagram || '',
                    status: 'Pendente',
                    ltv: 0, // Initial LTV set to 0 for manual control
                    lastPurchase: new Date().toISOString(),
                    joinedDate: new Date().toISOString(),
                    joinedDate: new Date().toISOString(),
                    origin: channels.find(c => c.id === deal.channelId)?.name || deal.origin || 'CRM',
                    acquisitionChannel: deal.channelId, // Fixed: consistent naming with ClientDetail
                    // service_id: deal.serviceId, // Keeping as is if logic depends elsewhere, but channel was key bug
                    internalData: {
                        cac: '0,00',
                        manualLtv: '0,00',
                        useManualLtv: true,
                        recurrentSettings: {
                            serviceType: services.find(s => s.id === deal.serviceId)?.type || 'Recorrente',
                            scope: services.find(s => s.id === deal.serviceId)?.description || '',
                            exceptions: '',
                            billingDay: '5',
                            defaultChecklist: services.find(s => s.id === deal.serviceId)?.default_checklist || []
                        },
                        contract: {
                            value: deal.value,
                            startDate: new Date().toLocaleDateString('pt-BR')
                        },
                        cycles: [
                            {
                                id: 1,
                                period: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
                                status: 'Em Andamento',
                                checklist: services.find(s => s.id === deal.serviceId)?.default_checklist || [],
                                internal_deliverables: []
                            }
                        ]
                    }
                };

                addGlobalClient(newClient);
                finalClientId = newClient.id;
                finalClientName = newClient.name;

                // Update the deal to link to the new client
                deal.clientId = finalClientId;
            } else {
                const existingClient = clients.find(c => c.id === deal.clientId);
                finalClientName = existingClient?.name || 'Cliente CRM';

                if (existingClient) {
                    const newProject = {
                        id: `proj-${Date.now()}`,
                        title: deal.title,
                        status: 'Em Andamento',
                        deadline: deal.closingDate || '',
                        value: deal.value,
                        description: deal.description || 'Originado do CRM',
                        checklist: []
                    };

                    updateGlobalClient({
                        ...existingClient,
                        internalData: {
                            ...(existingClient.internalData || {}),
                            projects: [
                                ...(existingClient.internalData?.projects || []),
                                newProject
                            ]
                        }
                    });
                }
            }

            // Automatic transaction removed: Financial operations are manual now
            /* addLocalTransaction({
                data: new Date(),
                valor: deal.value,
                origem: 'empresa',
                servico: deal.title,
                canalAquisicao: 'CRM',
                status: 'pago',
                cliente: finalClientName,
                clientId: finalClientId
            }); */
        }

        updateGlobalDeal({ ...deal, stage: nextStageId });
    };

    const handleUpdateDeal = (updatedDeal) => {
        updateGlobalDeal(updatedDeal);
        setSelectedDeal(updatedDeal);
    };

    const handleDuplicateDeal = (dealId) => {
        const dealToDuplicate = deals.find(d => d.id === dealId);
        if (!dealToDuplicate) return;

        const newDeal = {
            ...dealToDuplicate,
            id: `deal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: `${dealToDuplicate.title} (Cópia)`,
            stage: crmStages[0].id, // Reset to first stage
            probability: 0.1, // Reset probability
            closingDate: '', // Clear closing date
            history: [{
                id: `h-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'created',
                date: new Date(),
                text: 'Oportunidade duplicada de ' + dealToDuplicate.title
            }],
            comments: [] // Reset comments
        };

        addGlobalDeal(newDeal);
    };

    // State for deletion
    const [dealToDelete, setDealToDelete] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const handleDeleteDeal = (dealId) => {
        setDealToDelete(dealId);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (dealToDelete) {
            removeGlobalDeal(dealToDelete);
            setIsDeleteOpen(false);
            setDealToDelete(null);
        }
    };

    // Filter deals: Active stages always show. Closed/Lost show only for selected month/year.
    const filteredDeals = deals.filter(deal => {
        // 1. If filtering is disabled (null), show everything (or verify default behavior)
        if (selectedMonth === null || selectedYear === null) return true;

        // 2. Active stages: Always show
        if (deal.stage !== 'Fechado' && deal.stage !== 'Perdido') return true;

        // 3. Completed stages: Check date
        // Use closingDate if available, otherwise creation date fallback
        // Fix timezone issues by treating YYYY-MM-DD as local or splitting
        let dateToCheck = new Date();
        if (deal.closingDate) {
            // "2026-01-05"
            const parts = deal.closingDate.split('-');
            if (parts.length === 3) {
                dateToCheck = new Date(parts[0], parts[1] - 1, parts[2]);
            } else {
                dateToCheck = new Date(deal.closingDate);
            }
        } else if (deal.createdAt) {
            dateToCheck = new Date(deal.createdAt);
        } else if (deal.date) {
            dateToCheck = new Date(deal.date);
        }

        return dateToCheck.getMonth() === selectedMonth && dateToCheck.getFullYear() === selectedYear;
    });

    return (
        <div className="flex flex-col gap-6 p-6 min-h-[calc(100vh-6rem)]">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">CRM de Vendas</h1>
                    <p className="text-sm text-muted-foreground">Gestão de oportunidades e pipeline</p>
                </div>
                <Button onClick={() => setIsNewDealOpen(true)} className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
                    <Plus className="w-4 h-4" /> Nova Oportunidade
                </Button>

                <Dialog open={isNewDealOpen} onOpenChange={setIsNewDealOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Nova Oportunidade</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateDeal} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Título da Oportunidade</Label>
                                <Input name="title" placeholder="Ex: Contrato de Consultoria - Cliente X" required autoFocus />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Valor Estimado (R$)</Label>
                                    <Input name="value" type="number" step="0.01" placeholder="0,00" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Data Fechamento (Opcional)</Label>
                                    <Input name="date" type="date" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Prioridade</Label>
                                    <Select name="priority" defaultValue="Medium">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">Baixa</SelectItem>
                                            <SelectItem value="Medium">Média</SelectItem>
                                            <SelectItem value="High">Alta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Serviço Pretendido</Label>
                                    <Select name="serviceId">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services?.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name} - {formatCurrency(s.base_price)}</SelectItem>
                                            ))}
                                            <SelectItem value="custom">Outro / Personalizado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Canal de Origem</Label>
                                <Select name="channelId" onValueChange={(val) => {
                                    const ch = channels.find(c => c.id === val);
                                    if (ch) setSelectedOrigin(ch.name);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {channels?.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedOrigin === 'Instagram' && (
                                <div className="space-y-2">
                                    <Label>Qual o @ do Instagram?</Label>
                                    <Input name="instagram" placeholder="@usuario" required />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Cliente</Label>
                                <Select name="client">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                        <SelectItem value="c-externo">Novo Cliente (Preencher abaixo)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Contact Info Section */}
                            <div className="p-3 bg-secondary/10 rounded-lg space-y-3 border border-border/50">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Dados do Contato (Prospect)</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Nome do Contato</Label>
                                        <Input name="contactName" placeholder="Nome Completo" className="h-8 text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Telefone / WhatsApp</Label>
                                        <Input
                                            name="contactPhone"
                                            placeholder="(00) 00000-0000"
                                            className="h-8 text-sm"
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            maxLength={15}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Email</Label>
                                        <Input name="contactEmail" type="email" placeholder="email@empresa.com" className="h-8 text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Data 1º Contato</Label>
                                        <Input
                                            name="firstContact"
                                            type="date"
                                            className="h-8 text-sm"
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Descrição / Notas</Label>
                                <Textarea name="description" placeholder="Detalhes sobre a necessidade do cliente..." />
                            </div>

                            <DialogFooter>
                                <Button type="submit">Criar Oportunidade</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 min-h-0">
                <DealKanban
                    deals={filteredDeals}
                    stages={crmStages}
                    onMoveDeal={handleMoveDeal}
                    onDealClick={handleDealClick}
                    onDuplicateDeal={handleDuplicateDeal}
                    onDeleteDeal={handleDeleteDeal}
                />
            </div>

            <div className="shrink-0 w-full">
                <SalesFunnel deals={filteredDeals} stages={crmStages} />
            </div>

            <DealDetail
                deal={selectedDeal}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                onAddComment={handleAddComment}
                onUpdateDeal={handleUpdateDeal}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[425px] glass-card border-border/50 text-foreground">
                    <DialogHeader>
                        <DialogTitle>Excluir Oportunidade</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Tem certeza que deseja excluir esta oportunidade? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={confirmDelete} variant="destructive">
                            Excluir Oportunidade
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
