"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from '@/data/mockData';

const dataByService = [
    { name: 'Dev Web', Indicação: 12000, LinkedIn: 5000, 'Google Ads': 8000 },
    { name: 'App Mobile', Indicação: 15000, LinkedIn: 8000, 'Google Ads': 3000 },
    { name: 'Consultoria', Indicação: 10000, LinkedIn: 6000, 'Google Ads': 4000 },
];

const dataByClientType = [
    { name: 'Pequenas', Indicação: 8000, LinkedIn: 2000, 'Google Ads': 5000 },
    { name: 'Médias', Indicação: 20000, LinkedIn: 10000, 'Google Ads': 12000 },
    { name: 'Grandes', Indicação: 40000, LinkedIn: 15000, 'Google Ads': 8000 },
];

export function ChannelSegmentation() {
    return (
        <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Segmentação de Receita</h3>
                <Tabs defaultValue="servico" className="w-auto">
                    <TabsList className="bg-secondary/50">
                        <TabsTrigger value="servico" className="text-xs h-7 px-3">Por Serviço</TabsTrigger>
                        <TabsTrigger value="cliente" className="text-xs h-7 px-3">Por Cliente</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataByService}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A3333" vertical={false} />
                        <XAxis dataKey="name" stroke="#9CB0B1" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9CB0B1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000)}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0B1111', border: '1px solid #2A3333', borderRadius: '8px', color: '#E9F7F8' }}
                            formatter={(value) => [formatCurrency(value), '']}
                        />
                        <Legend />
                        <Bar dataKey="Indicação" stackId="a" fill="#00D9E0" />
                        <Bar dataKey="LinkedIn" stackId="a" fill="#82ca9d" />
                        <Bar dataKey="Google Ads" stackId="a" fill="#ffc658" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
