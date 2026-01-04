"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Package, CheckCircle2, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, services as mockServices } from '@/data/mockData';
import { ServiceSaleForm } from '@/components/forms/ServiceSaleForm';
import { useFinancialContext } from '@/contexts/FinancialContext';

export default function ServicesPage() {
    const { transactions, selectedMonth, selectedYear } = useFinancialContext();

    // Using local state for Mock CRUD to enable immediate feedback
    const [services, setServices] = useState(mockServices);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Editing
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        default_checklist: ''
    });

    const getServiceMetrics = (serviceName, serviceId) => {
        // Filter transactions that are income and match this service
        const relatedTransactions = transactions.filter(t => {
            const isRevenue = ['income', 'revenue', 'Receita'].includes(t.type);
            const matchesService = (t.serviceName === serviceName || t.serviceId === serviceId || t.category === serviceName || t.categoria === serviceName);

            if (!isRevenue || !matchesService) return false;

            // Date Filter
            if (selectedMonth === null || selectedYear === null) return true;

            const tDate = t.data ? new Date(t.data) : (t.date ? new Date(t.date) : new Date());
            return tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear;
        });

        const totalRevenue = relatedTransactions.reduce((sum, t) => sum + (t.valor || 0), 0);
        const count = relatedTransactions.length;

        return { totalRevenue, count };
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', default_checklist: '' });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (service) => {
        setEditingId(service.id);
        setFormData({
            name: service.name,
            description: service.description || '',
            default_checklist: Array.isArray(service.default_checklist) ? service.default_checklist.map(i => i.label || i).join('\n') : ''
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Parse checklist
        const checklistArray = formData.default_checklist.split('\n').filter(line => line.trim() !== '').map(line => ({ id: Math.random().toString(), label: line.trim(), checked: false }));

        const payload = {
            id: editingId || Math.random().toString(),
            name: formData.name,
            description: formData.description,
            default_checklist: checklistArray,
            // Deprecated fields (kept for type safety/mock compatibility if needed)
            type: 'Categoria',
            base_price: 0
        };

        if (editingId) {
            setServices(services.map(s => s.id === editingId ? payload : s));
        } else {
            setServices([...services, payload]);
        }
        setIsDialogOpen(false);
    };

    const handleRemove = (id) => {
        setServices(services.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Categorias de Receita (Serviços)</h2>
                    <p className="text-muted-foreground">Gerencie suas categorias e acompanhe o desempenho.</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> Nova Categoria
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => {
                    const metrics = getServiceMetrics(service.name, service.id);
                    return (
                        <div key={service.id} className="glass-card rounded-xl p-6 hover:border-primary/50 transition-colors group relative overflow-hidden flex flex-col h-full">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary" onClick={() => handleOpenEdit(service)}>
                                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemove(service.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                    <Package className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold">{service.name}</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-secondary/30 p-3 rounded-lg">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                        <DollarSign className="w-3 h-3" /> Faturamento
                                    </p>
                                    <p className="text-sm font-bold text-success">{formatCurrency(metrics.totalRevenue)}</p>
                                </div>
                                <div className="bg-secondary/30 p-3 rounded-lg">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                        <TrendingUp className="w-3 h-3" /> Vendas
                                    </p>
                                    <p className="text-sm font-bold text-foreground">{metrics.count}</p>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                    {service.description || 'Sem descrição definida.'}
                                </p>

                                {service.default_checklist && service.default_checklist.length > 0 && (
                                    <div className="pt-3 border-t border-border/50 mt-auto">
                                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Entregas Padrão</p>
                                        <div className="space-y-1">
                                            {service.default_checklist.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <CheckCircle2 className="w-3 h-3 text-success/70" />
                                                    <span>{item.label || item}</span>
                                                </div>
                                            ))}
                                            {service.default_checklist.length > 3 && (
                                                <p className="text-xs text-muted-foreground italic">+ {service.default_checklist.length - 3} itens...</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Register Sale Button */}
                            <div className="mt-auto pt-4 border-t border-border/50">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button className="w-full bg-success hover:bg-success/90" size="sm">
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Registrar Venda
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                                        <SheetHeader className="mb-4">
                                            <SheetTitle>Registrar Venda de Serviço</SheetTitle>
                                            <SheetDescription>
                                                Crie uma transação de receita vinculada a este serviço
                                            </SheetDescription>
                                        </SheetHeader>
                                        <ServiceSaleForm
                                            service={service}
                                            onSuccess={() => {
                                                // Refresh metrics or show success message
                                                console.log('Venda registrada com sucesso!');
                                            }}
                                        />
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
                        <DialogDescription>Configure os detalhes da categoria de serviço.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome da Categoria</Label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Gestão de Tráfego"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="O que este serviço/categoria engloba?"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Checklist Padrão (1 item por linha)</Label>
                            <Textarea
                                value={formData.default_checklist}
                                onChange={e => setFormData({ ...formData, default_checklist: e.target.value })}
                                placeholder="Planejamento&#10;Execução&#10;Relatório"
                                className="h-24 font-mono text-xs"
                            />
                            <p className="text-[10px] text-muted-foreground">Itens obrigatórios para vendas desta categoria.</p>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit">Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
