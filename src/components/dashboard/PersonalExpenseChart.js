"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { personalExpenses, formatCurrency } from '@/data/mockData';

const colors = ['#01B8BE', '#00D9E0', '#A8FCFF', '#00777B', '#007A7D', '#00A5A8', '#4DD8DD'];

export function PersonalExpenseChart() {
    // Group by category
    const byCategory = personalExpenses.reduce((acc, exp) => {
        if (!acc[exp.categoria]) acc[exp.categoria] = 0;
        acc[exp.categoria] += exp.valor;
        return acc;
    }, {});

    const data = Object.entries(byCategory)
        .map(([categoria, valor]) => ({ name: categoria, value: valor }))
        .sort((a, b) => b.value - a.value);

    return (
        <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-foreground mb-6">Gastos por Categoria</h3>
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
                            dataKey="value"
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0B1111',
                                border: '1px solid #2A3333',
                                borderRadius: '8px',
                                color: '#E9F7F8',
                            }}
                            formatter={(value) => [formatCurrency(value), '']}
                        />
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            formatter={(value) => <span style={{ color: '#9CB0B1', fontSize: '11px' }}>{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
