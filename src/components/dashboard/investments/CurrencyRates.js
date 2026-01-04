"use client"

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Euro, Bitcoin, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CurrencyRates() {
    const [rates, setRates] = useState({
        USD: { value: 0, change: 0, loading: true },
        EUR: { value: 0, change: 0, loading: true },
        BTC: { value: 0, change: 0, loading: true },
        GBP: { value: 0, change: 0, loading: true },
    });
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchRates = async () => {
        setIsRefreshing(true);
        try {
            // Using AwesomeAPI (free Brazilian API for currency rates)
            const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,GBP-BRL,BTC-BRL');
            const data = await response.json();

            setRates({
                USD: {
                    value: parseFloat(data.USDBRL.bid),
                    change: parseFloat(data.USDBRL.pctChange),
                    loading: false
                },
                EUR: {
                    value: parseFloat(data.EURBRL.bid),
                    change: parseFloat(data.EURBRL.pctChange),
                    loading: false
                },
                BTC: {
                    value: parseFloat(data.BTCBRL.bid),
                    change: parseFloat(data.BTCBRL.pctChange),
                    loading: false
                },
                GBP: {
                    value: parseFloat(data.GBPBRL.bid),
                    change: parseFloat(data.GBPBRL.pctChange),
                    loading: false
                }
            });

            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching currency rates:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRates();
        // Update every 5 minutes
        const interval = setInterval(fetchRates, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const currencies = [
        {
            code: 'USD',
            name: 'Dólar Americano',
            icon: DollarSign,
            color: 'text-green-500'
        },
        {
            code: 'EUR',
            name: 'Euro',
            icon: Euro,
            color: 'text-blue-500'
        },
        {
            code: 'GBP',
            name: 'Libra Esterlina',
            icon: DollarSign,
            color: 'text-purple-500'
        },
        {
            code: 'BTC',
            name: 'Bitcoin',
            icon: Bitcoin,
            color: 'text-orange-500'
        },
    ];

    const formatValue = (code, value) => {
        if (code === 'BTC') {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value);
        }
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    return (
        <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Cotações Internacionais
                    </h3>
                    {lastUpdate && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Atualizado às {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                </div>
                <button
                    onClick={fetchRates}
                    disabled={isRefreshing}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
                    title="Atualizar cotações"
                >
                    <RefreshCw className={cn(
                        "w-4 h-4 text-muted-foreground",
                        isRefreshing && "animate-spin"
                    )} />
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {currencies.map(({ code, name, icon: Icon, color }) => {
                    const rate = rates[code];
                    const isPositive = rate.change >= 0;

                    return (
                        <div
                            key={code}
                            className="bg-secondary/30 rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-colors"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className={cn("w-4 h-4", color)} />
                                <span className="text-xs font-medium text-muted-foreground">{code}</span>
                            </div>

                            {rate.loading ? (
                                <div className="space-y-2">
                                    <div className="h-6 bg-secondary rounded animate-pulse" />
                                    <div className="h-4 bg-secondary rounded animate-pulse w-2/3" />
                                </div>
                            ) : (
                                <>
                                    <p className="text-lg font-bold text-foreground mb-1">
                                        {formatValue(code, rate.value)}
                                    </p>
                                    <div className={cn(
                                        "flex items-center gap-1 text-xs font-medium",
                                        isPositive ? "text-success" : "text-destructive"
                                    )}>
                                        {isPositive ? (
                                            <TrendingUp className="w-3 h-3" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3" />
                                        )}
                                        <span>{isPositive ? '+' : ''}{rate.change.toFixed(2)}%</span>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center">
                    Cotações em tempo real fornecidas pela AwesomeAPI
                </p>
            </div>
        </div>
    );
}
