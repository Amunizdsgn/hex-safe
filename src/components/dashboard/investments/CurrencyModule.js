"use client"

import { TrendingUp, TrendingDown, DollarSign, Euro, PoundSterling, Bitcoin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/data/mockData';

const icons = {
    USD: DollarSign,
    EUR: Euro,
    GBP: PoundSterling,
    BTC: Bitcoin
};

export function CurrencyModule({ rates }) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Câmbio & Cripto</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {rates.map((rate) => {
                    const Icon = icons[rate.code] || DollarSign;
                    const isPositive = rate.change >= 0;

                    return (
                        <div key={rate.code} className="glass-card rounded-xl p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 rounded-lg bg-secondary text-muted-foreground">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={cn(
                                    "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                                    isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                                )}>
                                    {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                    {Math.abs(rate.change)}%
                                </span>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-1">{rate.name}</p>
                                <p className="text-xl font-bold text-foreground">
                                    {rate.code === 'BTC' ? formatCurrency(rate.rate) : `R$ ${rate.rate.toFixed(2)}`}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Mensal: <span className={rate.changeMonth >= 0 ? "text-success" : "text-destructive"}>
                                        {rate.changeMonth >= 0 ? "+" : ""}{rate.changeMonth}%
                                    </span>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
