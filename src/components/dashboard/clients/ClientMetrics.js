"use client"

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    UserCheck,
    UserX,
    TrendingUp,
    Activity,
    AlertTriangle,
    ShieldCheck
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis
} from 'recharts';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
    <Card className="bg-secondary/5 border-border/50">
        <CardContent className="p-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold mt-2 text-foreground">{value}</h3>
                    {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </CardContent>
    </Card>
);

export function ClientMetrics({ clients = [] }) {
    const stats = useMemo(() => {
        const total = clients.length;
        const active = clients.filter(c => !c.status || c.status === 'Ativo').length;
        const inactive = clients.filter(c => c.status === 'Inativo').length;
        const pending = clients.filter(c => c.status === 'Pendente').length;

        const recurrent = clients.filter(c => c.classification?.relationship === 'Recorrente').length;
        const punctual = clients.filter(c => c.classification?.relationship === 'Pontual').length;

        const tranquil = clients.filter(c => c.internalData?.status === 'Tranquilo').length;
        const demanding = clients.filter(c => c.internalData?.status === 'Exigente').length;
        const problematic = clients.filter(c => c.internalData?.status === 'Problemático').length;
        const risk = clients.filter(c => c.internalData?.status === 'Risco Financeiro').length;

        // Calculate Churn Rate (simplified: inactive / total ever)
        // In a real scenario, this would be based on a specific period
        const churnRate = total > 0 ? ((inactive / total) * 100).toFixed(1) : 0;

        return {
            total,
            active,
            inactive,
            pending,
            recurrent,
            punctual,
            churnRate,
            health: [
                { name: 'Tranquilo', value: tranquil, color: '#22c55e' }, // Green
                { name: 'Exigente', value: demanding, color: '#eab308' }, // Yellow
                { name: 'Problema', value: problematic, color: '#f97316' }, // Orange
                { name: 'Risco', value: risk, color: '#ef4444' } // Red
            ],
            relationship: [
                { name: 'Recorrente', value: recurrent, color: '#8b5cf6' }, // Purple
                { name: 'Pontual', value: punctual, color: '#3b82f6' } // Blue
            ],
            status: [
                { name: 'Ativo', value: active, color: '#22c55e' },
                { name: 'Inativo', value: inactive, color: '#ef4444' },
                { name: 'Pendente', value: pending, color: '#eab308' }
            ]
        };
    }, [clients]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total de Clientes"
                    value={stats.total}
                    subtext={`${stats.active} Ativos atualmente`}
                    icon={Users}
                    colorClass="bg-primary/10 text-primary"
                />
                <StatCard
                    title="Recorrência"
                    value={stats.recurrent}
                    subtext={`${((stats.recurrent / stats.total || 0) * 100).toFixed(0)}% da base`}
                    icon={Activity}
                    colorClass="bg-purple-500/10 text-purple-500"
                />
                <StatCard
                    title="Novos / Pendentes"
                    value={stats.pending}
                    subtext="Aguardando ativação"
                    icon={UserCheck}
                    colorClass="bg-yellow-500/10 text-yellow-500"
                />
                <StatCard
                    title="Taxa de Churn"
                    value={`${stats.churnRate}%`}
                    subtext={`${stats.inactive} contratos encerrados`}
                    icon={UserX}
                    colorClass="bg-destructive/10 text-destructive"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[300px]">

                {/* 1. Status Distribution (Pie) */}
                <Card className="bg-secondary/5 border-border/50 flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" /> Distribuição da Base
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.status}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.status.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Custom Legend */}
                        <div className="flex justify-center gap-4 text-xs mt-[-20px]">
                            {stats.status.map(item => (
                                <div key={item.name} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-muted-foreground">{item.name} ({item.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Relationship Types (Bar) */}
                <Card className="bg-secondary/5 border-border/50 flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Tipo de Receita
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.relationship} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                                <RechartsTooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {stats.relationship.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 3. Client Health (Bar) */}
                <Card className="bg-secondary/5 border-border/50 flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Saúde / Classificação
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.health} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} interval={0} />
                                <YAxis hide />
                                <RechartsTooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                    {stats.health.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
