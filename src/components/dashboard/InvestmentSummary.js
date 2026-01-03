"use client"

import { TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import { investments, formatCurrency, formatPercent } from '@/data/mockData';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const typeLabels = {
    renda_fixa: 'Renda Fixa',
    renda_variavel: 'Renda Variável',
    cripto: 'Cripto',
    fundo: 'Fundos',
    outro: 'Outros',
};

const colors = ['#01B8BE', '#00D9E0', '#A8FCFF', '#00777B', '#007A7D'];

export function InvestmentSummary() {
    const { context } = useFinancialContext();

    const filteredInvestments = context === 'consolidado'
        ? investments
        : investments.filter(i => i.origem === context);

    const totalInvested = filteredInvestments.reduce((sum, i) => sum + i.valorAplicado, 0);
    const totalCurrent = filteredInvestments.reduce((sum, i) => sum + i.valorAtual, 0);
    const totalReturn = totalCurrent - totalInvested;
    const returnPercentage = totalInvested > 0 ? ((totalReturn / totalInvested) * 100) : 0;

    // Group by type
    const byType = filteredInvestments.reduce((acc, inv) => {
        const key = inv.tipo;
        if (!acc[key]) acc[key] = 0;
        acc[key] += inv.valorAtual;
        return acc;
    }, {});

    const pieData = Object.entries(byType).map(([tipo, valor]) => ({
        name: typeLabels[tipo] || tipo,
        value: valor,
    }));

    return (
        <div className="glass-card rounded-xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Investimentos</h3>
                <a href="/dashboard/investimentos" className="text-sm text-primary hover:text-hover transition-colors">
                    Ver detalhes →
                </a>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Patrimônio</span>
                    </div>
                    <p className="text-xl font-bold kpi-value">{formatCurrency(totalCurrent)}</p>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-xs text-muted-foreground">Rentabilidade</span>
                    </div>
                    <p className="text-xl font-bold text-success">+{formatPercent(returnPercentage)}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(totalReturn)}</p>
                </div>
            </div>

            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {pieData.map((_, index) => (
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
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
                {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
