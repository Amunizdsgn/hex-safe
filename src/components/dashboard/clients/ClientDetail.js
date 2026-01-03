"use client"

import { useState, useEffect } from 'react';
import { useFinancialContext } from '@/contexts/FinancialContext';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { formatCurrency } from '@/data/mockData';
import { Mail, Phone, MapPin, Calendar, Briefcase, TrendingUp, AlertTriangle, CheckCircle, Activity, HeartPulse, Clock, Edit2, Save, X, Plus } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientProjectBoard } from "./ClientProjectBoard";

export function ClientDetail({ client, isOpen, onClose }) {
    const { updateGlobalClient, addGlobalClient } = useFinancialContext();
    const [isEditing, setIsEditing] = useState(false);

    // Form States
    const [formData, setFormData] = useState({});
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        if (client) {
            setFormData({
                ...client,
                tags: client.tags || [],
                projects: client.projects || [],
                notes: client.notes || '', // Ensure notes is initialized
                segment: client.segment || '', // Ensure segment is initialized
            });
            // If it's a new empty client (no ID), start in edit mode
            setIsEditing(!client.id);
        }
    }, [client]);

    if (!client) return null;

    const { metrics, classification, insights, transactions } = client;

    // Helper for colors
    const getHealthColor = (h) => {
        if (h === 'Saudável') return 'text-success bg-success/10 border-success/20';
        if (h === 'Atenção') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        return 'text-destructive bg-destructive/10 border-destructive/20';
    };

    const handleSave = () => {
        if (client.id) {
            updateGlobalClient(formData);
        } else {
            // New Client
            addGlobalClient({ ...formData, id: Math.random().toString(), metrics: { totalLTV: 0, avgTicket: 0, clientAgeMonths: 0 } });
            onClose(); // Close after creation
        }
        setIsEditing(false);
    };

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => {
            if (!open) setIsEditing(false);
            onClose(open);
        }}>
            <SheetContent className="w-[90vw] sm:max-w-xl md:max-w-[800px] overflow-hidden flex flex-col p-0 data-[state=open]:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">

                {/* Header Sticky */}
                <div className="p-6 border-b border-border/50 bg-background/50 backdrop-blur-sm z-10 flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            {isEditing ? (
                                <>
                                    <SheetTitle className="sr-only">Editando Cliente</SheetTitle>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="text-xl font-bold h-9 w-2/3"
                                    />
                                </>
                            ) : (
                                <SheetTitle className="text-2xl font-bold text-foreground">{client.name}</SheetTitle>
                            )}

                            {!isEditing && (
                                <Badge variant="outline" className={getHealthColor(classification?.healthScore)}>
                                    <HeartPulse className="w-3 h-3 mr-1" />
                                    {classification?.healthScore || 'N/A'}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Segmento"
                                        value={formData.segment || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, segment: e.target.value }))}
                                        className="h-7 w-32 text-xs"
                                    />
                                </div>
                            ) : (
                                <>
                                    <Badge variant="secondary" className="font-normal text-xs">{classification?.relationship}</Badge>
                                    <span>• {client.segment}</span>
                                    <span>• Cliente há {metrics?.clientAgeMonths?.toFixed(0) || 0} meses</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                                    <X className="w-4 h-4 mr-2" /> Cancelar
                                </Button>
                                <Button size="sm" onClick={handleSave}>
                                    <Save className="w-4 h-4 mr-2" /> Salvar
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Editar
                            </Button>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="geral" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 border-b border-border/50 bg-background/30">
                        <TabsList className="bg-transparent h-12 w-full justify-start gap-4 p-0">
                            <TabsTrigger value="geral" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-1 h-full font-semibold">
                                Visão 360º
                            </TabsTrigger>
                            <TabsTrigger value="projetos" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-1 h-full font-semibold">
                                Gestão Interna (Board)
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="geral" className="flex-1 overflow-auto p-0 m-0">
                        {!isEditing && (
                            <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-secondary/5 border-b border-border/50">
                                <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">LTV Total</p>
                                    <p className="text-lg font-bold text-success">{formatCurrency(metrics?.totalLTV || 0)}</p>
                                </div>
                                <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Ticket Médio</p>
                                    <p className="text-lg font-bold">{formatCurrency(metrics?.avgTicket || 0)}</p>
                                </div>
                                <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Recorrência</p>
                                    <p className="text-sm font-semibold mt-1">{classification?.recurrencePotential}</p>
                                </div>
                                <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Esforço</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Activity className={`w-3 h-3 ${classification?.effort === 'Alto' ? 'text-destructive' : 'text-success'}`} />
                                        <p className="text-sm font-semibold">{classification?.effort}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-8 pb-10">
                                {isEditing ? (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold uppercase text-muted-foreground">Informações de Contato</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Email</Label>
                                                    <Input
                                                        value={formData.email || ''}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Telefone</Label>
                                                    <Input
                                                        value={formData.phone || ''}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold uppercase text-muted-foreground">Gerenciamento</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Status</Label>
                                                    <Input
                                                        value={formData.status || ''}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                                    />
                                                </div>
                                                {/* Future: Add Select for Classification overrides */}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Notas Internas</Label>
                                                <Textarea
                                                    placeholder="Observações importantes sobre o cliente..."
                                                    value={formData.notes || ''}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                                    className="min-h-[100px]"
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold uppercase text-muted-foreground">Tags</h3>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Nova tag..."
                                                    value={newTag}
                                                    onChange={(e) => setNewTag(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                                />
                                                <Button type="button" variant="secondary" onClick={handleAddTag}><Plus className="w-4 h-4" /></Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                                                        {tag}
                                                        <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleRemoveTag(tag)} />
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* View Mode Content */}

                                        {/* Insights Hub */}
                                        {(insights || []).length > 0 && (
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                                    <TrendingUp className="w-4 h-4 text-primary" /> Insights & Ações
                                                </h3>
                                                <div className="grid gap-2">
                                                    {insights.map((insight, idx) => (
                                                        <div key={idx} className={`p-3 rounded-md border flex items-start gap-3 ${insight.type === 'opportunity' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                                                insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                                                    insight.type === 'recovery' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                                        'bg-secondary/30 border-border text-muted-foreground'
                                                            }`}>
                                                            {insight.type === 'warning' ? <AlertTriangle className="w-4 h-4 mt-0.5" /> :
                                                                insight.type === 'opportunity' ? <TrendingUp className="w-4 h-4 mt-0.5" /> :
                                                                    <CheckCircle className="w-4 h-4 mt-0.5" />}
                                                            <p className="text-sm font-medium">{insight.text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Notes if present */}
                                        {client.notes && (
                                            <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-lg">
                                                <h4 className="text-xs font-bold text-yellow-600 uppercase mb-2">Notas Internas</h4>
                                                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{client.notes}</p>
                                            </div>
                                        )}

                                        {/* Timeline / Histórico */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                                <Clock className="w-4 h-4 text-primary" /> Linha do Tempo Financeira
                                            </h3>
                                            <div className="relative pl-4 border-l border-border/50 space-y-6">
                                                {(transactions || []).map((tx, idx) => (
                                                    <div key={idx} className="relative">
                                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background ring-2 ring-primary/20"></div>
                                                        <div className="bg-card p-3 rounded-lg border border-border/50 shadow-sm ml-2">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-semibold text-sm">{tx.servico || tx.descricao || 'Receita'}</span>
                                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                                    {new Date(tx.data).toLocaleDateString('pt-BR')}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5">{tx.status}</Badge>
                                                                <span className="font-mono font-bold text-success text-sm">{formatCurrency(tx.valor)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(transactions || []).length === 0 && (
                                                    <p className="text-xs text-muted-foreground pl-2">Nenhum evento registrado.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/50">
                                            {/* Contact Info */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Dados de Contato
                                                </h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Mail className="w-3 h-3" /> {client.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Phone className="w-3 h-3" /> {client.phone}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Tags & Projetos
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {(client.tags || []).map(tag => (
                                                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 h-5">#{tag}</Badge>
                                                    ))}
                                                    {(client.tags || []).length === 0 && <span className="text-xs text-muted-foreground">-</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="projetos" className="flex-1 overflow-auto bg-background/50 p-6 m-0">
                        <ClientProjectBoard client={client} />
                    </TabsContent>
                </Tabs>


            </SheetContent>
        </Sheet>
    );
}
