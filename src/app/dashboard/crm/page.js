"use client"

import { useState } from 'react';
import { crmDeals, crmStages } from '@/data/mockData';
import { DealKanban } from '@/components/dashboard/crm/DealKanban';
import { SalesFunnel } from '@/components/dashboard/crm/SalesFunnel';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DealDetail } from '@/components/dashboard/crm/DealDetail';

import { useFinancialContext } from '@/contexts/FinancialContext';


export default function CRMPage() {
    // OLD: const [deals, setDeals] = useState(crmDeals);
    const { addLocalTransaction, deals, addGlobalDeal, updateGlobalDeal, addGlobalClient, removeGlobalDeal, clients } = useFinancialContext();
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
            origin: formData.get('origin'),
            instagram: formData.get('instagram'),
            description: formData.get('description'),
            owner: 'Eu'
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
                    status: 'Ativo',
                    ltv: deal.value, // Initial LTV
                    lastPurchase: new Date().toISOString(),
                    joinedDate: new Date().toISOString(),
                    origin: deal.origin || 'CRM'
                };

                addGlobalClient(newClient);
                finalClientId = newClient.id;
                finalClientName = newClient.name;

                // Update the deal to link to the new client
                deal.clientId = finalClientId;
            } else {
                const existingClient = clients.find(c => c.id === deal.clientId);
                finalClientName = existingClient?.name || 'Cliente CRM';
                // Could update existing client LTV here if needed, but keeping simple for now
            }

            addLocalTransaction({
                data: new Date(),
                valor: deal.value,
                origem: 'empresa',
                servico: deal.title,
                canalAquisicao: 'CRM',
                status: 'pago',
                cliente: finalClientName,
                clientId: finalClientId
            });
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

    const handleDeleteDeal = (dealId) => {
        if (confirm('Tem certeza que deseja excluir esta oportunidade?')) {
            removeGlobalDeal(dealId);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">CRM de Vendas</h1>
                    <p className="text-muted-foreground">Gestão de oportunidades e pipeline</p>
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
                                    <Label>Canal de Origem</Label>
                                    <Select name="origin" onValueChange={setSelectedOrigin}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Indicação">Indicação</SelectItem>
                                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                            <SelectItem value="Google Ads">Google Ads</SelectItem>
                                            <SelectItem value="Instagram">Instagram</SelectItem>
                                            <SelectItem value="Outro">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <DealKanban
                        deals={deals}
                        stages={crmStages}
                        onMoveDeal={handleMoveDeal}
                        onDealClick={handleDealClick}
                        onDuplicateDeal={handleDuplicateDeal}
                        onDeleteDeal={handleDeleteDeal}
                    />
                </div>
                <div className="lg:col-span-1">
                    <SalesFunnel deals={deals} stages={crmStages} />
                </div>
            </div>

            <DealDetail
                deal={selectedDeal}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                onAddComment={handleAddComment}
                onUpdateDeal={handleUpdateDeal}
            />
        </div>
    );
}
