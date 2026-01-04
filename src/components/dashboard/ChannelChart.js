"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const colors = ['#01B8BE', '#00D9E0', '#A8FCFF', '#00777B'];


export function ChannelChart({ data }) {
    // Fallback if no data
    if (!data || data.length === 0) return (
        <div className="glass-card rounded-xl p-6 animate-slide-up flex flex-col items-center justify-center h-full min-h-[300px]">
            <h3 className="text-lg font-semibold text-foreground mb-2">Receita por Canal</h3>
            <p className="text-muted-foreground text-sm">Sem dados de receita vinculados a canais.</p>
        </div>
    );

    return (
        <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-foreground mb-6">Receita por Canal</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value" // Changed from 'receita' to generic 'value' for reusability if needed, or stick to passed format
                            nameKey="name"  // Changed from 'canal' to 'name'
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0B1111',
                                border: '1px solid #2A3333',
                                borderRadius: '8px',
                                color: '#E9F7F8',
                            }}
                            formatter={(value) => [formatCurrency(value), 'Receita']}
                        />
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            formatter={(value) => <span style={{ color: '#9CB0B1', fontSize: '12px' }}>{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
