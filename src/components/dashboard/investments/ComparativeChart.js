"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/data/mockData';

export function ComparativeChart({ data }) {
    return (
        <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Comparativo de Rendimento</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A3333" vertical={false} />
                        <XAxis
                            dataKey="date"
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
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Portfólio" stroke="#00D9E0" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="cdi" name="CDI" stroke="#82ca9d" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="ipca" name="IPCA" stroke="#ffc658" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
