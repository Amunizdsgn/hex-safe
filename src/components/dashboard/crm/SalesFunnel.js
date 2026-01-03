"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/data/mockData';

export function SalesFunnel({ deals, stages }) {
    // Calculate funnel data
    // Funnel logic: Count items in each stage
    const data = stages.map(stage => {
        const count = deals.filter(d => d.stage === stage.id).length;
        const value = deals.filter(d => d.stage === stage.id).reduce((a, b) => a + b.value, 0);
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
        <div className="glass-card rounded-xl p-6 h-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">Funil de Vendas</h3>
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
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
            <div className="grid grid-cols-2 gap-4 mt-4 border-t border-border/50 pt-4">
                <div>
                    <p className="text-xs text-muted-foreground">Valor em Pipeline</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(data.reduce((a, b) => a + b.value, 0))}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Taxa Conversão</p>
                    {(() => {
                        const totalDeals = deals.length;
                        const wonDeals = deals.filter(d => d.stage === 'Fechado').length;
                        const rate = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) : 0;
                        return (
                            <p className={`text-lg font-bold ${Number(rate) >= 20 ? 'text-success' : 'text-yellow-500'}`}>
                                {rate}%
                            </p>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
