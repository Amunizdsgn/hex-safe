"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function RevenueExpenseChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="glass-card rounded-xl p-6 animate-slide-up h-80 flex flex-col items-center justify-center border-dashed border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-2">Receita vs Despesas</h3>
                <p className="text-muted-foreground text-sm">Sem dados suficientes para o gráfico.</p>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-foreground mb-6">Receita vs Despesas</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#01B8BE" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#01B8BE" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A3333" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="#9CB0B1"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#9CB0B1"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0B1111',
                                border: '1px solid #2A3333',
                                borderRadius: '8px',
                                color: '#E9F7F8',
                            }}
                            formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => <span style={{ color: '#9CB0B1' }}>{value}</span>}
                        />
                        <Area
                            type="monotone"
                            dataKey="receita"
                            name="Receita"
                            stroke="#01B8BE"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorReceita)"
                        />
                        <Area
                            type="monotone"
                            dataKey="despesa"
                            name="Despesas"
                            stroke="#f87171"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorDespesa)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
