"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend } from 'recharts';
import { formatCurrency, cashFlowProjection } from '@/data/mockData';

export function ProjectedCashFlow() {
    return (
        <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Fluxo de Caixa Projetado</h3>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-success/80"></div>
                        <span className="text-muted-foreground">Entradas</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-destructive/80"></div>
                        <span className="text-muted-foreground">Saídas</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-muted-foreground">Saldo</span>
                    </div>
                </div>
            </div>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={cashFlowProjection} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A3333" vertical={false} />
                        <XAxis
                            dataKey="day"
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
                            tickFormatter={(value) => `${(value / 1000)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0B1111',
                                border: '1px solid #2A3333',
                                borderRadius: '8px',
                                color: '#E9F7F8'
                            }}
                            formatter={(value) => [formatCurrency(value), '']}
                        />
                        <Bar dataKey="entrada" name="Entradas" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="saida" name="Saídas" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Line type="monotone" dataKey="saldo" name="Saldo Acumulado" stroke="#00D9E0" strokeWidth={3} dot={{ r: 4 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
