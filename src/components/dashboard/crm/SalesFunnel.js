"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/data/mockData';

export function SalesFunnel({ deals, stages }) {
    // Calculate funnel data
    // Funnel logic: Count items in each stage
    const data = stages.map(stage => {
        const count = deals.filter(d => d.stage === stage.id).length;
        const value = deals.filter(d => d.stage === stage.id).reduce((a, b) => a + (Number(b.value) || 0), 0);
        return {
            name: stage.label,
            count,
            value,
            color: stage.color // Tailwind class name string, need hex for Recharts
        };
    });

    // Color map helper
    const getColor = (twClass) => {
        if (twClass.includes('slate')) return '#64748b';
        if (twClass.includes('blue')) return '#3b82f6';
        if (twClass.includes('yellow')) return '#eab308';
        if (twClass.includes('orange')) return '#f97316';
        if (twClass.includes('green')) return '#22c55e';
        if (twClass.includes('red')) return '#ef4444';
        return '#8884d8';
    }

    return (
        <div className="glass-card rounded-xl p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-foreground mb-4 shrink-0">Funil de Vendas</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                            itemStyle={{ color: '#f4f4f5' }}
                            labelStyle={{ color: '#f4f4f5', fontWeight: 'bold', marginBottom: '4px' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            formatter={(val, name) => [name === 'value' ? formatCurrency(val) : val, name === 'value' ? 'Valor' : 'Quantidade']}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.color)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 border-t border-border/50 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {data.map((stage, i) => (
                        <div key={i} className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{stage.name}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-foreground">{formatCurrency(stage.value)}</span>
                                <span className="text-xs text-muted-foreground">({stage.count})</span>
                            </div>
                        </div>
                    ))}
                    <div className="flex flex-col pt-2 border-t border-dashed border-border col-span-full">
                        <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-primary">TOTAL EM PIPELINE</span>
                                <span className="text-sm font-bold text-white">
                                    {formatCurrency(data
                                        .filter(s => s.name !== 'Perdido')
                                        .reduce((a, b) => a + (Number(b.value) || 0), 0))
                                    }
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground">TAXA DE CONVERSÃO</span>
                                {(() => {
                                    const totalDeals = deals.length;
                                    const wonDeals = deals.filter(d => d.stage === 'Fechado').length;
                                    const rate = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) : 0;
                                    return (
                                        <span className={`text-sm font-bold ${Number(rate) >= 20 ? 'text-success' : Number(rate) >= 10 ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {rate}%
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
