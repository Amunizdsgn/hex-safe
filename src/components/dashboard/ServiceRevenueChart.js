"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { servicePerformance, formatCurrency } from '@/data/mockData';

const colors = ['#01B8BE', '#00D9E0', '#00777B', '#A8FCFF', '#00A5A8', '#007A7D'];

export function ServiceRevenueChart() {
    return (
        <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-foreground mb-6">Receita por Serviço</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={servicePerformance}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A3333" horizontal={true} vertical={false} />
                        <XAxis
                            type="number"
                            stroke="#9CB0B1"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                            type="category"
                            dataKey="servico"
                            stroke="#9CB0B1"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            width={95}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0B1111',
                                border: '1px solid #2A3333',
                                borderRadius: '8px',
                                color: '#E9F7F8',
                            }}
                            formatter={(value) => [formatCurrency(value), 'Receita']}
                        />
                        <Bar dataKey="receita" radius={[0, 4, 4, 0]}>
                            {servicePerformance.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
