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
import {
    AlertTriangle, CheckCircle, Clock, Lock, ShieldAlert, FileText,
    DollarSign, ListTodo, RefreshCw, Calendar, Briefcase, Plus, Play, CheckSquare, XCircle, FileSignature, ArrowRight, Settings
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

const ChecklistItem = ({ item, onToggle }) => (
    <div
        className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-secondary/40 ${item.status === 'concluido' ? 'bg-secondary/20 border-border/50' : 'bg-background border-border hover:border-primary/50'}`}
        onClick={() => onToggle(item.id)}
    >
        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.status === 'concluido' ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
            {item.status === 'concluido' && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />}
        </div>
        <div className="flex-1">
            <p className={`text-sm font-medium ${item.status === 'concluido' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{item.text}</p>
        </div>
    </div>
);

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

    const toggleItem = (id) => {
        const newList = list.map(i => i.id === id ? { ...i, status: i.status === 'concluido' ? 'pendente' : 'concluido' } : i);
        onChange('onboardingChecklist', newList);
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
                        <ChecklistItem key={item.id} item={item} onToggle={toggleItem} />
                    ))}
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

// --- Execution Boards (Recurrent vs Pontual) ---

const ActiveRecurrentBoard = ({ data, onChange }) => {
    const currentCycle = data.cycles?.[0] || { period: 'Ciclo Atual', checklist: [], status: 'Em Aberto' };
    const progress = currentCycle.checklist?.length > 0
        ? (currentCycle.checklist.filter(i => i.status === 'concluido').length / currentCycle.checklist.length) * 100
        : 0;

    const toggleCycleChecklist = (id) => {
        const newChecklist = currentCycle.checklist.map(i => i.id === id ? { ...i, status: i.status === 'concluido' ? 'pendente' : 'concluido' } : i);
        const newCycles = [{ ...currentCycle, checklist: newChecklist }, ...(data.cycles?.slice(1) || [])];
        onChange('cycles', newCycles);
    };

    const handleUpdateSettings = (field, val) => {
        onChange('recurrentSettings', { ...data.recurrentSettings, [field]: val });
    };

    return (
        <div className="space-y-6">
            {/* Settings Card */}
            <Card className="bg-secondary/5 border-border/60">
                <CardHeader className="pb-2">
                    <div className="flex justify-between">
                        <SectionHeader icon={Settings} title="Configuração da Recorrência" />
                        <Input
                            className="w-48 h-7 text-xs"
                            placeholder="Tipo (ex: Social Media)"
                            value={data.recurrentSettings?.serviceType || ''}
                            onChange={(e) => handleUpdateSettings('serviceType', e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <Textarea
                        className="min-h-[60px] text-xs bg-background/50"
                        placeholder="Escopo Padrão (O que entregar todo mês)..."
                        value={data.recurrentSettings?.scope || ''}
                        onChange={(e) => handleUpdateSettings('scope', e.target.value)}
                    />
                    <Textarea
                        className="min-h-[60px] text-xs bg-background/50 border-destructive/20"
                        placeholder="Limites e Exceções (O que NÃO fazer)..."
                        value={data.recurrentSettings?.exceptions || ''}
                        onChange={(e) => handleUpdateSettings('exceptions', e.target.value)}
                    />
                </CardContent>
            </Card>

            {/* Cycle Execution */}
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-blue-500" />
                            <div>
                                <CardTitle className="text-base">Ciclo: {currentCycle.period}</CardTitle>
                                <CardDescription className="text-xs">Execução mensal e entregáveis</CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline">{currentCycle.status}</Badge>
                    </div>
                    <Progress value={progress} className="h-1 mt-2" />
                </CardHeader>
                <CardContent className="pt-4 space-y-2">
                    {currentCycle.checklist?.map(item => (
                        <ChecklistItem key={item.id} item={item} onToggle={toggleCycleChecklist} />
                    ))}
                    {(!currentCycle.checklist || currentCycle.checklist.length === 0) && (
                        <p className="text-xs text-muted-foreground text-center py-4">Nenhum item no checklist deste ciclo.</p>
                    )}
                </CardContent>
                <CardFooter className="bg-background/50 border-t pt-2 flex justify-end">
                    <Button size="sm" variant="ghost" className="text-xs mr-2">Ver Histórico</Button>
                    <Button size="sm" variant="outline" className="gap-2" disabled={progress < 100}>
                        Encerrar Ciclo <CheckSquare className="w-4 h-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

const ActiveProjectBoard = ({ data, onChange }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Projetos Ativos
                </h3>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                    <Plus className="w-3 h-3" /> Novo Projeto
                </Button>
            </div>

            {(data.projects || []).map(project => (
                <Card key={project.id} className="mb-4 border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2 p-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <Input
                                    className="font-bold border-transparent px-0 h-6 text-sm p-0 focus-visible:ring-0 bg-transparent w-full"
                                    value={project.title}
                                    onChange={(e) => {
                                        const newP = data.projects.map(p => p.id === project.id ? { ...p, title: e.target.value } : p);
                                        onChange('projects', newP);
                                    }}
                                />
                                <Badge variant="secondary" className="text-[10px]">{project.status}</Badge>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-mono text-muted-foreground">{project.period}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="mt-2 space-y-2">
                            {(project.checklist || []).map(item => (
                                <ChecklistItem key={item.id} item={item} onToggle={(id) => {
                                    const newL = project.checklist.map(i => i.id === id ? { ...i, status: i.status === 'concluido' ? 'pendente' : 'concluido' } : i);
                                    const newP = data.projects.map(p => p.id === project.id ? { ...p, checklist: newL } : p);
                                    onChange('projects', newP);
                                }} />
                            ))}
                        </div>
                        <Textarea
                            className="mt-4 text-xs bg-background/50 h-16"
                            placeholder="Avaliação final / Obs..."
                            value={project.evaluation || ''}
                            onChange={(e) => {
                                const newP = data.projects.map(p => p.id === project.id ? { ...p, evaluation: e.target.value } : p);
                                onChange('projects', newP);
                            }}
                        />
                    </CardContent>
                </Card>
            ))}
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

    // Merge all data structures safely
    const [data, setData] = useState(() => ({
        // Strategic
        status: client.internalData?.status || 'Tranquilo',
        relationshipType: client.internalData?.relationshipType || 'Recorrente',

        // Lifecycle
        lifecycleStage: client.internalData?.lifecycleStage || 'onboarding', // onboarding, active

        // Modules Data
        onboardingChecklist: client.internalData?.onboardingChecklist || [
            { id: 1, text: 'Contrato Assinado', status: 'pendente' },
            { id: 2, text: 'Pagamento Inicial / Entrada', status: 'pendente' },
            { id: 3, text: 'Briefing Recebido', status: 'pendente' },
            { id: 4, text: 'Acessos Testados', status: 'pendente' },
        ],
        recurrentSettings: client.internalData?.recurrentSettings || { serviceType: '', scope: '', exceptions: '' },
        cycles: client.internalData?.cycles || [
            {
                id: 1, period: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }), status: 'Em Andamento',
                checklist: [{ id: 1, text: 'Planejamento', status: 'pendente' }, { id: 2, text: 'Execução', status: 'pendente' }]
            }
        ],
        projects: client.internalData?.projects || [],

        // Financials & Logs
        contract: client.internalData?.contract || { value: 0, startDate: new Date().toLocaleDateString('pt-BR') },
        decisionsLog: client.internalData?.decisionsLog || ''
    }));

    // CRITICAL: Keep state in sync if parent client changes (switching tabs or re-opening)
    useEffect(() => {
        if (client.internalData) {
            setData(prev => ({ ...prev, ...client.internalData }));
        }
    }, [client]);

    const persistChanges = (newData) => {
        setData(newData);
        updateGlobalClient({
            ...client,
            internalData: newData
        });
    };

    const handleChange = (field, value) => {
        const newData = { ...data, [field]: value };
        persistChanges(newData);
    };

    return (
        <div className="space-y-6 pt-4 min-h-[500px]">

            {/* 1. STATUS HEADER (Always Visible) */}
            <StrategicHeader data={data} onChange={handleChange} />

            {/* 2. LIFECYCLE STAGE MACHINE */}
            {data.lifecycleStage === 'onboarding' ? (
                <OnboardingStage
                    data={data}
                    onChange={handleChange}
                    onComplete={() => handleChange('lifecycleStage', 'active')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-border/50">
                <Card className="bg-yellow-500/5 border-yellow-500/20">
                    <CardHeader className="pb-2">
                        <SectionHeader icon={DollarSign} title="Financeiro & Contrato" color="text-yellow-600" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Valor Contrato:</span>
                            <Input
                                className="w-32 h-7 text-right font-bold bg-background/50"
                                value={data.contract?.value}
                                onChange={(e) => handleChange('contract', { ...data.contract, value: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Início:</span>
                            <span className="font-mono">{data.contract?.startDate}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-secondary/5 border-border/60">
                    <CardHeader className="pb-2">
                        <SectionHeader icon={ShieldAlert} title="Memória Estratégica" />
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            className="min-h-[100px] bg-background/50 font-mono text-xs"
                            placeholder="Diário de bordo: decisões, problemas, abalos sísmicos..."
                            value={data.decisionsLog}
                            onChange={(e) => handleChange('decisionsLog', e.target.value)}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-4">
                <Button variant="ghost" className="text-destructive hover:bg-destructive/10 text-xs h-8">
                    <AlertTriangle className="w-3 h-3 mr-2" /> Zona de Perigo (Encerrar/Arquivar)
                </Button>
            </div>

        </div>
    );
}
