"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency, channelHistory } from '@/data/mockData';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TrendAnalysis() {
    return (
        <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Tendência e Previsibilidade</h3>
                <Tabs defaultValue="6m" className="w-auto">
                    <TabsList className="bg-secondary/50">
                        <TabsTrigger value="3m" className="text-xs h-7 px-3">3 meses</TabsTrigger>
                        <TabsTrigger value="6m" className="text-xs h-7 px-3">6 meses</TabsTrigger>
                        <TabsTrigger value="12m" className="text-xs h-7 px-3">1 ano</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={channelHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A3333" vertical={false} />
                        <XAxis dataKey="date" stroke="#9CB0B1" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9CB0B1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000)}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0B1111', border: '1px solid #2A3333', borderRadius: '8px', color: '#E9F7F8' }}
                            formatter={(value) => [formatCurrency(value), '']}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="Indicação" stroke="#00D9E0" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="LinkedIn" stroke="#82ca9d" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Google Ads" stroke="#ffc658" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Orgânico" stroke="#ff7300" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
