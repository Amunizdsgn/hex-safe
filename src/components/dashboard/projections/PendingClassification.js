"use client"

import { AlertCircle, Clock } from 'lucide-react';
import { formatCurrency, pendingItems } from '@/data/mockData';

export function PendingClassification() {
    return (
        <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Classificação das Pendências</h3>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-muted-foreground border-b border-border/50">
                        <tr>
                            <th className="font-medium py-2">Cliente / Descrição</th>
                            <th className="font-medium py-2 text-right">Valor</th>
                            <th className="font-medium py-2 text-center">Atraso</th>
                            <th className="font-medium py-2 text-center">Risco</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {pendingItems.map((item) => (
                            <tr key={item.id} className="group hover:bg-muted/20 transition-colors">
                                <td className="py-3">
                                    <p className="font-medium text-foreground">{item.entity}</p>
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                </td>
                                <td className={`py-3 text-right font-medium ${item.type === 'receita' ? 'text-success' : 'text-destructive'}`}>
                                    {item.type === 'receita' ? '+' : '-'}{formatCurrency(item.value)}
                                </td>
                                <td className="py-3 text-center">
                                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>{item.daysOverdue} dias</span>
                                    </div>
                                </td>
                                <td className="py-3">
                                    <div className="flex justify-center">
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${item.risk === 'Alto' ? 'border-destructive/30 bg-destructive/10 text-destructive' :
                                                item.risk === 'Médio' ? 'border-warning/30 bg-warning/10 text-warning' :
                                                    'border-success/30 bg-success/10 text-success'
                                            }`}>
                                            {item.risk}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-secondary/30">
                <AlertCircle className="w-4 h-4 text-warning" />
                Priorize a cobrança dos itens de <span className="text-destructive font-medium">Alto Risco</span> com mais de 5 dias de atraso.
            </div>
        </div>
    );
}
