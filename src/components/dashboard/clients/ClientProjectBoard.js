"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    AlertTriangle, CheckCircle, Clock, Lock, ShieldAlert, FileText,
    DollarSign, ListTodo, RefreshCw, Calendar, Briefcase, Plus, Play, CheckSquare, XCircle, FileSignature, ArrowRight, Settings, Trash, Edit2, X, PlusCircle
} from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';

// --- Shared Components ---
const SectionHeader = ({ icon: Icon, title, color = "text-foreground", description }) => (
    <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-4 h-4 ${color}`} />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${color}`}>{title}</h3>
        </div>
        {description && <p className="text-xs text-muted-foreground ml-6">{description}</p>}
    </div>
);

const ChecklistItem = ({ item, onToggle, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(item.text);

    const handleSaveEdit = () => {
        onEdit(item.id, editText);
        setIsEditing(false);
    };

    return (
        <div
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all group ${item.status === 'concluido' ? 'bg-secondary/20 border-border/50' : 'bg-background border-border hover:border-primary/50'}`}
        >
            <div
                className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${item.status === 'concluido' ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
                onClick={() => onToggle(item.id)}
            >
                {item.status === 'concluido' && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />}
            </div>

            <div className="flex-1">
                {isEditing ? (
                    <div className="flex gap-2">
                        <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="h-7 text-sm"
                            autoFocus
                        />
                        <Button size="icon" className="h-7 w-7" onClick={handleSaveEdit}>
                            <CheckCircle className="w-3 h-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditing(false)}>
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                ) : (
                    <p
                        className={`text-sm font-medium cursor-pointer ${item.status === 'concluido' ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                        onClick={() => onToggle(item.id)}
                    >
                        {item.text}
                    </p>
                )}
            </div>

            <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                {!isEditing && (
                    <>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => setIsEditing(true)}>
                            <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => onDelete(item.id)}>
                            <Trash className="w-3 h-3" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

const AddChecklistItem = ({ onAdd }) => {
    const [text, setText] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleAdd = () => {
        if (!text.trim()) return;
        onAdd(text);
        setText('');
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary pl-0" onClick={() => setIsOpen(true)}>
                <PlusCircle className="w-3 h-3 mr-1" /> Adicionar item
            </Button>
        );
    }

    return (
        <div className="flex gap-2 items-center mt-2">
            <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nova tarefa..."
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                autoFocus
            />
            <Button size="sm" onClick={handleAdd} className="h-8">Adicionar</Button>
            <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)} className="h-8"><X className="w-4 h-4" /></Button>
        </div>
    )
}

// --- Deliverables Component (PREMIUM DARK UI) ---
const CycleDeliverables = ({ deliverables = [], onChange }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', type: 'Design', goal: 1, current: 0 });

    const handleAdd = () => {
        if (!newItem.name) return;
        onChange([...deliverables, { ...newItem, id: Date.now() }]);
        setNewItem({ name: '', type: 'Design', goal: 1, current: 0 });
        setIsAdding(false);
    };

    const handleUpdate = (id, field, value) => {
        const updated = deliverables.map(item => item.id === id ? { ...item, [field]: value } : item);
        onChange(updated);
    };

    const handleDelete = (id) => {
        onChange(deliverables.filter(item => item.id !== id));
    };

    return (
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-purple-500/20 shadow-lg mt-6 overflow-hidden">
            <CardHeader className="pb-3 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-purple-200">
                        <ListTodo className="w-4 h-4 text-purple-400" /> Central de Entregas
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400 mt-1">Acompanhamento de produção (Criativos, Páginas, Textos)</CardDescription>
                </div>
                <Button size="sm" className="h-7 text-xs bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 border border-purple-500/30 transition-all" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                    {isAdding ? 'Cancelar' : 'Nova Entrega'}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {isAdding && (
                    <div className="bg-zinc-950/50 p-4 rounded-lg border border-purple-500/20 grid gap-4 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                placeholder="O que vai ser entregue?"
                                className="h-9 text-xs bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500/50"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            />
                            <Select
                                value={newItem.type}
                                onValueChange={(v) => setNewItem({ ...newItem, type: v })}
                            >
                                <SelectTrigger className="h-9 text-xs bg-zinc-900 border-white/10 text-zinc-200 focus:ring-purple-500/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                    <SelectItem value="Design">🎨 Design / Criativo</SelectItem>
                                    <SelectItem value="Copy">✍️ Copy / Texto</SelectItem>
                                    <SelectItem value="Landing Page">🌐 Landing Page</SelectItem>
                                    <SelectItem value="Tráfego">📈 Campanha de Tráfego</SelectItem>
                                    <SelectItem value="Vídeo">🎬 Edição de Vídeo</SelectItem>
                                    <SelectItem value="Outro">📦 Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 flex-1 bg-zinc-900/50 p-1.5 rounded-md border border-white/5">
                                <span className="text-xs text-zinc-400 ml-2 whitespace-nowrap">Meta:</span>
                                <Input
                                    type="number" className="h-7 text-xs w-20 bg-transparent border-none focus-visible:ring-0 text-white" min="1"
                                    value={newItem.goal}
                                    onChange={(e) => setNewItem({ ...newItem, goal: parseInt(e.target.value) || 1 })}
                                />
                                <span className="text-xs text-zinc-500 mr-2">unid.</span>
                            </div>
                            <Button size="sm" className="h-9 px-6 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/20" onClick={handleAdd}>Adicionar</Button>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {deliverables.length === 0 && !isAdding && (
                        <p className="text-xs text-center text-zinc-500 py-6 border border-dashed border-zinc-800 rounded-lg">Nenhuma entrega registrada neste ciclo.</p>
                    )}
                    {deliverables.map(item => {
                        const progress = Math.min((item.current / item.goal) * 100, 100);
                        return (
                            <div key={item.id} className="group bg-zinc-900/40 border border-white/5 hover:border-purple-500/20 rounded-lg p-3 transition-all hover:bg-zinc-900/60">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm text-zinc-200">{item.name}</span>
                                            <Badge variant="secondary" className="text-[10px] h-5 bg-zinc-800 text-zinc-400 border-zinc-700">{item.type}</Badge>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all" onClick={() => handleDelete(item.id)}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1 relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1 text-xs">
                                        <Button
                                            variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full"
                                            onClick={() => handleUpdate(item.id, 'current', Math.max(0, item.current - 1))}
                                        >
                                            <span className="pb-1 text-lg leading-none">-</span>
                                        </Button>
                                        <span className="font-mono w-8 text-center text-zinc-200">{item.current}</span>
                                        <Button
                                            variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full"
                                            onClick={() => handleUpdate(item.id, 'current', item.current + 1)}
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                        <span className="text-zinc-600 text-[10px] ml-1">/ {item.goal}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// --- 1. Header Estratégico (Always UI) ---
const StrategicHeader = ({ data, onChange }) => (
    <Card className="bg-secondary/5 border-border/60 mb-6">
        <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Classificação Interna</label>
                    <Select value={data.status || 'Tranquilo'} onValueChange={(v) => onChange('status', v)}>
                        <SelectTrigger className={`h-9 font-semibold ${data.status === 'Problemático' || data.status === 'Risco Financeiro' ? 'text-destructive border-destructive/50' : 'text-foreground'
                            }`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Tranquilo">🌿 Tranquilo</SelectItem>
                            <SelectItem value="Exigente">⚡ Exigente</SelectItem>
                            <SelectItem value="Problemático">🚩 Problemático</SelectItem>
                            <SelectItem value="Risco Financeiro">💸 Risco Financeiro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Modelo de Relacionamento</label>
                    <div className="flex p-1 bg-secondary rounded-md">
                        <button
                            className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-all ${data.relationshipType === 'Pontual' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => onChange('relationshipType', 'Pontual')}
                        >
                            Pontual (Projetos)
                        </button>
                        <button
                            className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-all ${data.relationshipType === 'Recorrente' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => onChange('relationshipType', 'Recorrente')}
                        >
                            Recorrente (Ciclos)
                        </button>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

// --- 2. Operational Stages ---

const OnboardingStage = ({ data, onChange, onComplete }) => {
    const list = data.onboardingChecklist || [];
    const progress = list.length > 0 ? (list.filter(i => i.status === 'concluido').length / list.length) * 100 : 0;

    const updateList = (newList) => onChange('onboardingChecklist', newList);

    const toggleItem = (id) => {
        updateList(list.map(i => i.id === id ? { ...i, status: i.status === 'concluido' ? 'pendente' : 'concluido' } : i));
    };

    const deleteItem = (id) => {
        updateList(list.filter(i => i.id !== id));
    };

    const editItem = (id, newText) => {
        updateList(list.map(i => i.id === id ? { ...i, text: newText } : i));
    };

    const addItem = (text) => {
        const newItem = { id: Date.now(), text, status: 'pendente' };
        updateList([...list, newItem]);
    };

    return (
        <Card className="border-primary/20 bg-primary/5 shadow-sm mb-6">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg text-primary flex items-center gap-2">
                            <Play className="w-5 h-5" /> Onboarding Obrigatório
                        </CardTitle>
                        <CardDescription>Para ativar a execução, finalize o checklist inicial.</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-background text-primary border-primary/20">{progress.toFixed(0)}%</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Progress value={progress} className="h-2" />
                <div className="space-y-2">
                    {list.map(item => (
                        <ChecklistItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} onEdit={editItem} />
                    ))}
                    <AddChecklistItem onAdd={addItem} />
                </div>
            </CardContent>
            <CardFooter className="bg-background/50 border-t border-border/50 pt-4 flex justify-end">
                <Button
                    disabled={progress < 100}
                    onClick={onComplete}
                    className="gap-2"
                >
                    Concluir Onboarding & Iniciar Execução <ArrowRight className="w-4 h-4" />
                </Button>
            </CardFooter>
        </Card>
    );
};

// --- Execution Boards (PREMIUM DARK UI CYCLE CARD) ---

const ActiveRecurrentBoard = ({ data, onChange }) => {
    const currentCycle = data.cycles?.[0] || { period: 'Ciclo Atual', checklist: [], internal_deliverables: [], status: 'Em Aberto' };
    const progress = currentCycle.checklist?.length > 0
        ? (currentCycle.checklist.filter(i => i.status === 'concluido').length / currentCycle.checklist.length) * 100
        : 0;

    const defaultChecklist = data.recurrentSettings?.defaultChecklist || [];

    const updateChecklist = (newChecklist) => {
        const newCycles = [{ ...currentCycle, checklist: newChecklist }, ...(data.cycles?.slice(1) || [])];
        onChange('cycles', newCycles);
    };

    const updateDeliverables = (newDeliverables) => {
        const newCycles = [{ ...currentCycle, internal_deliverables: newDeliverables }, ...(data.cycles?.slice(1) || [])];
        onChange('cycles', newCycles);
    };

    // Cycle Items Handlers
    const toggleCycleChecklist = (id) => {
        updateChecklist(currentCycle.checklist.map(i => i.id === id ? { ...i, status: i.status === 'concluido' ? 'pendente' : 'concluido' } : i));
    };
    const deleteItem = (id) => updateChecklist(currentCycle.checklist.filter(i => i.id !== id));
    const editItem = (id, text) => updateChecklist(currentCycle.checklist.map(i => i.id === id ? { ...i, text } : i));
    const addItem = (text) => updateChecklist([...(currentCycle.checklist || []), { id: Date.now(), text, status: 'pendente' }]);

    // Default Settings Handlers
    const handleUpdateSettings = (field, val) => {
        onChange('recurrentSettings', { ...data.recurrentSettings, [field]: val });
    };

    const handleUpdateDefaultChecklist = (newDefaults) => {
        onChange('recurrentSettings', { ...data.recurrentSettings, defaultChecklist: newDefaults });
    };

    const handleLoadDefault = () => {
        const newItems = defaultChecklist.map(i => ({ ...i, status: 'pendente', id: Date.now() + Math.random() }));
        updateChecklist(newItems);
    };

    const handleEndCycle = () => {
        // 1. Archive current
        const archivedCycle = { ...currentCycle, status: 'Concluído', endDate: new Date().toISOString() };

        // 2. Prepare Next Month Name
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const nextPeriod = nextMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        // 3. Create New Cycle (Clone Default Checklist)
        const nextCycle = {
            id: Date.now(),
            period: nextPeriod.charAt(0).toUpperCase() + nextPeriod.slice(1),
            status: 'Em Andamento',
            checklist: defaultChecklist.map(i => ({ ...i, status: 'pendente', id: Date.now() + Math.random() })),
            internal_deliverables: []
        };

        // 4. Update State (New is first, Old is second)
        onChange('cycles', [nextCycle, archivedCycle, ...(data.cycles?.slice(1) || [])]);
    };

    // Payment Status Logic
    const getPaymentStatus = () => {
        const day = parseInt(data.recurrentSettings?.billingDay || 5);
        const today = new Date().getDate();

        if (today < day) return { label: 'Em Dia', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
        if (today === day) return { label: 'Vence Hoje', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
        return { label: 'Atrasado', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
    };

    const status = getPaymentStatus();

    return (
        <div className="space-y-6">
            {/* Settings Card */}
            <Card className="bg-secondary/5 border-border/60">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <SectionHeader icon={Settings} title="Configuração da Recorrência" />
                        <div className="flex gap-4 items-center">
                            <Badge variant="outline" className={`${status.color} flex items-center gap-1`}>
                                <DollarSign className="w-3 h-3" /> {status.label}
                            </Badge>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground uppercase font-bold">Vencimento: Dia</span>
                                <Input
                                    type="number"
                                    min="1" max="31"
                                    className="w-16 h-7 text-xs bg-background/50"
                                    value={data.recurrentSettings?.billingDay || 5}
                                    onChange={(e) => handleUpdateSettings('billingDay', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Tipo de Serviço</label>
                            <Input
                                className="h-8 text-xs bg-background/50"
                                placeholder="Ex: Social Media"
                                value={data.recurrentSettings?.serviceType || ''}
                                onChange={(e) => handleUpdateSettings('serviceType', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Escopo Padrão (Resumo)</label>
                            <Textarea
                                className="min-h-[80px] text-xs bg-background/50"
                                placeholder="Escopo Padrão (O que entregar todo mês)..."
                                value={data.recurrentSettings?.scope || ''}
                                onChange={(e) => handleUpdateSettings('scope', e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Default Checklist Editor */}
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                            <ListTodo className="w-3 h-3" /> Checklist Padrão (Ciclos Futuros)
                        </label>
                        <div className="space-y-2">
                            {defaultChecklist.map(item => (
                                <div key={item.id} className="flex items-center gap-2 group">
                                    <Input
                                        value={item.text}
                                        className="h-7 text-xs bg-background/50"
                                        onChange={(e) => handleUpdateDefaultChecklist(defaultChecklist.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))}
                                    />
                                    <Button
                                        size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleUpdateDefaultChecklist(defaultChecklist.filter(i => i.id !== item.id))}
                                    >
                                        <Trash className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline" size="sm" className="w-full text-xs h-7 border-dashed gap-1"
                                onClick={() => handleUpdateDefaultChecklist([...defaultChecklist, { id: Date.now(), text: '', status: 'pendente' }])}
                            >
                                <Plus className="w-3 h-3" /> Novo Item Padrão
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Cycle Execution */}
            <Card className="bg-zinc-950 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
                <CardHeader className="pb-3 border-b border-white/5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <RefreshCw className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base text-blue-100">Ciclo: {currentCycle.period}</CardTitle>
                                <CardDescription className="text-xs text-blue-300/60">Execução mensal</CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-950/30 text-blue-400 border-blue-500/30">{currentCycle.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    <div className="mb-4">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-bold">
                            <span>Progresso do Checklist</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 bg-zinc-800" indicatorClassName="bg-blue-500" />
                    </div>

                    {/* Empty State / Load Default */}
                    {currentCycle.checklist?.length === 0 && defaultChecklist.length > 0 && (
                        <div className="mb-4 p-4 border border-dashed border-blue-500/30 rounded-lg bg-blue-500/5 text-center flex flex-col items-center gap-2">
                            <p className="text-xs text-blue-200">Ciclo sem tarefas. Deseja carregar o padrão?</p>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-blue-500/30 hover:bg-blue-500/10 text-blue-300" onClick={handleLoadDefault}>
                                <ListTodo className="w-3 h-3 mr-2" /> Carregar Checklist Padrão
                            </Button>
                        </div>
                    )}

                    {currentCycle.checklist?.map(item => (
                        <ChecklistItem key={item.id} item={item} onToggle={toggleCycleChecklist} onDelete={deleteItem} onEdit={editItem} />
                    ))}
                    <AddChecklistItem onAdd={addItem} />
                </CardContent>
                <CardFooter className="bg-white/5 border-t border-white/5 pt-3 flex justify-end">

                    <Button
                        size="sm"
                        variant="ghost"
                        className={`gap-2 text-xs border border-transparent hover:bg-blue-500/20 text-blue-400 ${progress >= 100 ? 'bg-blue-500/10 border-blue-500/30' : 'opacity-50'}`}
                        disabled={progress < 100}
                        onClick={handleEndCycle}
                    >
                        Encerrar Ciclo <CheckSquare className="w-4 h-4" />
                    </Button>
                </CardFooter>
            </Card>

            {/* NEW: Deliverables Hub (Premium UI) */}
            <CycleDeliverables
                deliverables={currentCycle.internal_deliverables || []}
                onChange={updateDeliverables}
            />

            {/* Past Cycles History (Simple View) */}
            {data.cycles?.length > 1 && (
                <div className="pl-4 border-l-2 border-muted">
                    <h4 className="text-xs font-bold text-muted-foreground mb-2">Ciclos Anteriores</h4>
                    {data.cycles.slice(1).map(c => (
                        <div key={c.id} className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>{c.period} - Concluído</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ActiveProjectBoard = ({ data, onChange }) => {
    const handleAddProject = () => {
        const newProject = {
            id: Date.now(),
            title: 'Novo Projeto',
            status: 'Em Andamento',
            period: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            checklist: [],
            internal_deliverables: [],
            value: '',
            paid: '',
            evaluation: ''
        };
        onChange('projects', [newProject, ...(data.projects || [])]);
    };

    const handleDeleteProject = (projectId) => {
        if (confirm('Tem certeza que deseja excluir este projeto?')) {
            onChange('projects', data.projects.filter(p => p.id !== projectId));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Projetos Ativos
                </h3>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={handleAddProject}>
                    <Plus className="w-3 h-3" /> Novo Projeto
                </Button>
            </div>

            {(data.projects || []).map(project => {
                const pendingAmount = (parseFloat(project.value) || 0) - (parseFloat(project.paid) || 0);
                return (
                    <Card key={project.id} className={`mb-4 border-l-4 ${project.status === 'Concluído' ? 'border-l-green-500 opacity-75' : 'border-l-orange-500'}`}>
                        <CardHeader className="pb-2 p-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1 flex-1 mr-4">
                                    <Input
                                        className="font-bold border-transparent px-0 h-6 text-sm p-0 focus-visible:ring-0 bg-transparent w-full"
                                        value={project.title}
                                        onChange={(e) => {
                                            const newP = data.projects.map(p => p.id === project.id ? { ...p, title: e.target.value } : p);
                                            onChange('projects', newP);
                                        }}
                                    />
                                    <div className="flex gap-2 items-center">
                                        <Select
                                            value={project.status}
                                            onValueChange={(val) => {
                                                const newP = data.projects.map(p => p.id === project.id ? { ...p, status: val } : p);
                                                onChange('projects', newP);
                                            }}
                                        >
                                            <SelectTrigger className="h-6 text-[10px] w-[110px] bg-secondary/50 border-transparent">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                                                <SelectItem value="Em Revisão">Em Revisão</SelectItem>
                                                <SelectItem value="Concluído">Concluído</SelectItem>
                                                <SelectItem value="Pausado">Pausado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span className="text-xs font-mono text-muted-foreground">{project.period}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteProject(project.id)}>
                                    <Trash className="w-3 h-3" />
                                </Button>
                            </div>

                            {/* Financial Summary */}
                            <div className="mt-3 p-3 bg-secondary/10 rounded-lg flex items-center justify-between gap-2">
                                <div className="flex-1">
                                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Valor Cobrado</label>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-muted-foreground">R$</span>
                                        <Input
                                            type="number"
                                            className="h-6 text-xs bg-transparent border-transparent p-0 focus-visible:ring-0 font-mono w-full"
                                            placeholder="0.00"
                                            value={project.value || ''}
                                            onChange={(e) => {
                                                const newP = data.projects.map(p => p.id === project.id ? { ...p, value: e.target.value } : p);
                                                onChange('projects', newP);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-border"></div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Recebido</label>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-green-500">R$</span>
                                        <Input
                                            type="number"
                                            className="h-6 text-xs bg-transparent border-transparent p-0 focus-visible:ring-0 font-mono w-full text-green-500"
                                            placeholder="0.00"
                                            value={project.paid || ''}
                                            onChange={(e) => {
                                                const newP = data.projects.map(p => p.id === project.id ? { ...p, paid: e.target.value } : p);
                                                onChange('projects', newP);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-border"></div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Falta Receber</label>
                                    <div className={`text-xs font-mono font-bold ${pendingAmount > 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                                        R$ {pendingAmount.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="mt-2 space-y-2">
                                {(project.checklist || []).map(item => (
                                    <ChecklistItem
                                        key={item.id}
                                        item={item}
                                        onToggle={(id) => {
                                            const newL = project.checklist.map(i => i.id === id ? { ...i, status: i.status === 'concluido' ? 'pendente' : 'concluido' } : i);
                                            const newP = data.projects.map(p => p.id === project.id ? { ...p, checklist: newL } : p);
                                            onChange('projects', newP);
                                        }}
                                        onDelete={(id) => {
                                            const newL = project.checklist.filter(i => i.id !== id);
                                            const newP = data.projects.map(p => p.id === project.id ? { ...p, checklist: newL } : p);
                                            onChange('projects', newP);
                                        }}
                                        onEdit={(id, text) => {
                                            const newL = project.checklist.map(i => i.id === id ? { ...i, text } : i);
                                            const newP = data.projects.map(p => p.id === project.id ? { ...p, checklist: newL } : p);
                                            onChange('projects', newP);
                                        }}
                                    />
                                ))}
                                <AddChecklistItem onAdd={(text) => {
                                    const newL = [...(project.checklist || []), { id: Date.now(), text, status: 'pendente' }];
                                    const newP = data.projects.map(p => p.id === project.id ? { ...p, checklist: newL } : p);
                                    onChange('projects', newP);
                                }} />
                            </div>

                            {/* Project Deliverables (Central de Entregas) */}
                            <div className="mt-6">
                                <CycleDeliverables
                                    deliverables={project.internal_deliverables || []}
                                    onChange={(newDeliverables) => {
                                        const newP = data.projects.map(p => p.id === project.id ? { ...p, internal_deliverables: newDeliverables } : p);
                                        onChange('projects', newP);
                                    }}
                                />
                            </div>

                            <Textarea
                                className="mt-6 text-xs bg-background/50 h-16"
                                placeholder="Avaliação final / Obs..."
                                value={project.evaluation || ''}
                                onChange={(e) => {
                                    const newP = data.projects.map(p => p.id === project.id ? { ...p, evaluation: e.target.value } : p);
                                    onChange('projects', newP);
                                }}
                            />
                        </CardContent>
                    </Card>
                )
            })}
            {(data.projects || []).length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg bg-secondary/5">
                    Nenhum projeto pontual iniciado.
                </div>
            )}
        </div>
    );
};


// --- MAIN COMPONENT ---
export function ClientProjectBoard({ client }) {
    const { updateGlobalClient } = useFinancialContext();

    // Dialog States
    const [isRenegotiateOpen, setIsRenegotiateOpen] = useState(false);
    const [isTerminateOpen, setIsTerminateOpen] = useState(false);
    const [renegotiateData, setRenegotiateData] = useState({ value: '', endDate: '' });
    const [terminateReason, setTerminateReason] = useState('');

    // Merge all data structures safely
    const [data, setData] = useState(() => ({
        // Strategic
        status: client.internalData?.status || 'Tranquilo',
        relationshipType: client.internalData?.relationshipType || 'Recorrente',

        // Lifecycle
        lifecycleStage: client.internalData?.lifecycleStage || (client.status === 'Ativo' ? 'active' : 'onboarding'), // onboarding, active, terminated

        // Modules Data
        onboardingChecklist: client.internalData?.onboardingChecklist || [
            { id: 1, text: 'Contrato Assinado', status: 'pendente' },
            { id: 2, text: 'Pagamento Inicial / Entrada', status: 'pendente' },
            { id: 3, text: 'Briefing Recebido', status: 'pendente' },
            { id: 4, text: 'Acessos Testados', status: 'pendente' },
        ],
        recurrentSettings: client.internalData?.recurrentSettings || {
            serviceType: '',
            scope: '',
            exceptions: '',
            billingDay: '5',
            defaultChecklist: [
                { id: 1, text: 'Planejamento Mensal', status: 'pendente' },
                { id: 2, text: 'Criação de Conteúdo', status: 'pendente' },
                { id: 3, text: 'Aprovação c/ Cliente', status: 'pendente' },
                { id: 4, text: 'Agendamento/Postagem', status: 'pendente' }
            ]
        },
        cycles: client.internalData?.cycles || [
            {
                id: 1,
                period: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
                status: 'Em Andamento',
                checklist: [
                    { id: 1, text: 'Planejamento Mensal', status: 'pendente' },
                    { id: 2, text: 'Criação de Conteúdo', status: 'pendente' },
                    { id: 3, text: 'Aprovação c/ Cliente', status: 'pendente' },
                    { id: 4, text: 'Agendamento/Postagem', status: 'pendente' }
                ],
                internal_deliverables: []
            }
        ],
        projects: client.internalData?.projects || [],

        // Financials & Logs
        cac: client.internalData?.cac || '',
        manualLtv: client.internalData?.manualLtv || '',
        useManualLtv: client.internalData?.useManualLtv ?? true, // Default to true for manual control
        contract: client.internalData?.contract || { value: 0, startDate: new Date().toLocaleDateString('pt-BR') },
        contractHistory: client.internalData?.contractHistory || []
    }));

    // CRITICAL: Keep state in sync if parent client changes (switching tabs or re-opening)
    useEffect(() => {
        if (client.internalData) {
            setData(prev => ({
                ...prev,
                ...client.internalData,
                recurrentSettings: {
                    ...(prev.recurrentSettings || {}),
                    ...(client.internalData.recurrentSettings || {})
                }
            }));
        }
    }, [client]);

    const persistChanges = (newData) => {
        setData(newData);

        let newStatus = client.status;
        if (newData.lifecycleStage === 'terminated') newStatus = 'Inativo';
        else if (newData.lifecycleStage === 'active' && client.status === 'Inativo') newStatus = 'Ativo';

        updateGlobalClient({
            ...client,
            status: newStatus,
            internalData: newData
        });
    };

    const handleChange = (field, value) => {
        const newData = { ...data, [field]: value };
        persistChanges(newData);
    };

    const handleRenegotiate = () => {
        // Logic to update contract
        const newContract = {
            ...data.contract,
            value: renegotiateData.value || data.contract.value,
            endDate: renegotiateData.endDate
        };

        const isInitial = (data.contractHistory || []).length === 0;

        const newHistoryItem = {
            id: Date.now(),
            date: new Date().toLocaleString('pt-BR'),
            action: isInitial ? 'Acordo Inicial' : 'Renegociação',
            details: `Novo valor: R$ ${newContract.value}. ${newContract.endDate ? `Fim: ${newContract.endDate}` : ''}`
        };

        const newData = {
            ...data,
            contract: newContract,
            contractHistory: [newHistoryItem, ...(data.contractHistory || [])]
        };

        persistChanges(newData);
        setIsRenegotiateOpen(false);
    };

    const handleTerminate = () => {
        const newHistoryItem = {
            id: Date.now(),
            date: new Date().toLocaleString('pt-BR'),
            action: 'Encerramento',
            details: `Motivo: ${terminateReason}`
        };

        const newData = {
            ...data,
            lifecycleStage: 'terminated',
            contractHistory: [newHistoryItem, ...(data.contractHistory || [])]
        };

        persistChanges(newData);
        setIsTerminateOpen(false);
    };

    return (
        <div className="space-y-6 pt-4 min-h-[500px]">

            {/* 1. STATUS HEADER (Always Visible) */}
            <StrategicHeader data={data} onChange={handleChange} />

            {/* 2. LIFECYCLE STAGE MACHINE */}
            {data.lifecycleStage === 'terminated' ? (
                <div className="p-8 text-center border-2 border-dashed border-destructive/20 rounded-lg bg-destructive/5">
                    <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-destructive">Contrato Encerrado</h3>
                    <p className="text-muted-foreground mb-4">Este cliente não está mais ativo.</p>
                    <Button variant="outline" onClick={() => handleChange('lifecycleStage', 'active')}>
                        Reativar Cliente
                    </Button>
                </div>
            ) : data.lifecycleStage === 'onboarding' ? (
                <OnboardingStage
                    data={data}
                    onChange={handleChange}
                    onComplete={() => {
                        handleChange('lifecycleStage', 'active');
                    }}
                />
            ) : (
                <>
                    {/* ACTIVE EXECUTION */}
                    {data.relationshipType === 'Recorrente' ? (
                        <ActiveRecurrentBoard data={data} onChange={handleChange} />
                    ) : (
                        <ActiveProjectBoard data={data} onChange={handleChange} />
                    )}
                </>
            )}

            {/* 3. FOOTER (Financials & Logs) - Always visible if Active, or partially in Onboarding */}
            {data.lifecycleStage !== 'terminated' && (
                <div className="grid grid-cols-1 gap-4 mt-8 pt-6 border-t border-border/50">
                    <Card className="bg-secondary/5 border-border/60">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <SectionHeader icon={DollarSign} title="Financeiro & Controle" />
                            <Button
                                size="sm" variant="outline" className="text-xs h-7"
                                onClick={() => {
                                    setRenegotiateData({ value: data.contract?.value, endDate: data.contract?.endDate || '' });
                                    setIsRenegotiateOpen(true);
                                }}
                            >
                                <Edit2 className="w-3 h-3 mr-2" /> Editar Contrato
                            </Button>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: Current Data */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Contract Value */}
                                    <div
                                        className="p-4 rounded-lg bg-background/50 border border-border/50 col-span-2 md:col-span-1 cursor-pointer hover:bg-secondary/10 transition-colors group relative"
                                        onClick={() => {
                                            setRenegotiateData({ value: data.contract?.value, endDate: data.contract?.endDate || '' });
                                            setIsRenegotiateOpen(true);
                                        }}
                                    >
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1 group-hover:text-primary transition-colors">Valor do Contrato</div>
                                        <div className="flex items-center justify-between">
                                            <div className="font-bold text-lg text-primary">
                                                {(!data.contract?.value || data.contract.value == 0) ? (
                                                    <Button
                                                        size="sm"
                                                        className="h-7 text-xs bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50"
                                                    >
                                                        Definir Valor <Edit2 className="w-3 h-3 ml-2" />
                                                    </Button>
                                                ) : (
                                                    `R$ ${data.contract?.value}`
                                                )}
                                            </div>
                                            <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4" />
                                        </div>
                                    </div>

                                    {/* Manual CAC */}
                                    <div className="p-4 rounded-lg bg-background/50 border border-border/50 col-span-2 md:col-span-1">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">CAC (Custo Aquisição)</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">R$</span>
                                            <Input
                                                className="h-7 text-sm font-bold bg-secondary/20 border-b border-border/50 border-t-0 border-x-0 rounded-none px-2 focus-visible:ring-0 shadow-sm w-full transition-colors hover:bg-secondary/30 focus:bg-secondary/40"
                                                placeholder="0,00"
                                                value={data.cac || ''}
                                                onChange={(e) => handleChange('cac', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* LTV Display (Manual Toggle) */}
                                <div className="p-4 rounded-lg bg-secondary/10 border border-border/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-xs text-muted-foreground uppercase font-bold">LTV (Lifetime Value)</div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-[10px] text-muted-foreground cursor-pointer" onClick={() => handleChange('useManualLtv', !data.useManualLtv)}>
                                                {data.useManualLtv ? 'Manual' : 'Automático'}
                                            </label>
                                            <div
                                                className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${data.useManualLtv ? 'bg-primary' : 'bg-muted'}`}
                                                onClick={() => handleChange('useManualLtv', !data.useManualLtv)}
                                            >
                                                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${data.useManualLtv ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {data.useManualLtv ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-foreground font-bold">R$</span>
                                            <Input
                                                className="h-9 text-lg font-bold bg-background/50 border-border/50"
                                                value={data.manualLtv || ''}
                                                onChange={(e) => handleChange('manualLtv', e.target.value)}
                                                placeholder="0,00"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-lg font-bold text-success">
                                            R$ {client?.metrics?.totalLTV ? client.metrics.totalLTV.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                                            <span className="text-xs text-muted-foreground font-normal ml-2">(Calculado via Transações)</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center text-sm px-2 mt-2">
                                    <span className="text-muted-foreground">Inicio do Contrato:</span>
                                    <span className="font-mono">{data.contract?.startDate}</span>
                                </div>
                            </div>

                            {/* Right: History */}
                            <div className="border-l pl-6 border-border/50">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Histórico de Alterações
                                </h4>
                                <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2">
                                    {(data.contractHistory || []).length === 0 && (
                                        <p className="text-xs text-muted-foreground italic">Nenhuma alteração registrada.</p>
                                    )}
                                    {(data.contractHistory || []).map(entry => (
                                        <div key={entry.id} className="text-xs relative pl-3 border-l-2 border-primary/20 hover:border-primary transition-colors">
                                            <div className="flex justify-between text-muted-foreground mb-0.5">
                                                <span className="font-bold text-foreground">{entry.action}</span>
                                                <span className="text-[10px]">{entry.date}</span>
                                            </div>
                                            <p className="text-muted-foreground">{entry.details}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {data.lifecycleStage !== 'terminated' && (
                <div className="flex justify-end pt-4">
                    <Button
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 text-xs h-8"
                        onClick={() => setIsTerminateOpen(true)}
                    >
                        <AlertTriangle className="w-3 h-3 mr-2" /> Encerrar Contrato (Churn)
                    </Button>
                </div>
            )}

            {/* --- DIALOGS --- */}

            {/* Renegotiation Dialog */}
            <Dialog open={isRenegotiateOpen} onOpenChange={setIsRenegotiateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Contrato</DialogTitle>
                        <DialogDescription>Defina ou ajuste o valor mensal e prazos.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Valor do Contrato (R$)</Label>
                            <Input
                                value={renegotiateData.value}
                                onChange={(e) => setRenegotiateData(prev => ({ ...prev, value: e.target.value }))}
                                placeholder="0,00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nova Data de Fim / Vencimento (Opcional)</Label>
                            <Input
                                type="date"
                                value={renegotiateData.endDate}
                                onChange={(e) => setRenegotiateData(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenegotiateOpen(false)}>Cancelar</Button>
                        <Button onClick={handleRenegotiate}>Salvar e Registrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Termination Dialog */}
            <Dialog open={isTerminateOpen} onOpenChange={setIsTerminateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Encerrar Contrato</DialogTitle>
                        <DialogDescription>Tem certeza? Isso irá mover o cliente para o status inativo.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Motivo do Encerramento</Label>
                            <Textarea
                                placeholder="Ex: Projeto concluído, corte de custos..."
                                value={terminateReason}
                                onChange={(e) => setTerminateReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTerminateOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleTerminate}>Confirmar Encerramento</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
