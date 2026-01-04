"use client"

import { Building2, User, Layers } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { cn } from '@/lib/utils';

const contexts = [
    { id: 'empresa', label: 'Empresa', icon: Building2, color: 'from-blue-500 to-cyan-500' },
    { id: 'pessoal', label: 'Pessoal', icon: User, color: 'from-purple-500 to-pink-500' },
    { id: 'consolidado', label: 'Consolidado', icon: Layers, color: 'from-orange-500 to-amber-500' },
];

export function ContextSelector() {
    const { context, setContext } = useFinancialContext();

    return (
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg border border-border/50 backdrop-blur-sm">
            {contexts.map(({ id, label, icon: Icon, color }) => {
                const isActive = context === id;

                return (
                    <button
                        key={id}
                        onClick={() => setContext(id)}
                        className={cn(
                            'relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-out overflow-hidden group',
                            isActive
                                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80 hover:scale-102'
                        )}
                    >
                        {/* Animated gradient background for active state */}
                        {isActive && (
                            <div
                                className={cn(
                                    'absolute inset-0 bg-gradient-to-r opacity-20 animate-pulse',
                                    color
                                )}
                            />
                        )}

                        {/* Glow effect */}
                        {isActive && (
                            <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
                        )}

                        {/* Icon with rotation animation */}
                        <Icon
                            className={cn(
                                'w-4 h-4 relative z-10 transition-all duration-300',
                                isActive ? 'rotate-0' : 'group-hover:rotate-12 group-hover:scale-110'
                            )}
                        />

                        {/* Label with slide animation */}
                        <span
                            className={cn(
                                'hidden sm:inline relative z-10 transition-all duration-300',
                                isActive ? 'translate-x-0 opacity-100' : 'group-hover:translate-x-0.5'
                            )}
                        >
                            {label}
                        </span>

                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </button>
                );
            })}
        </div>
    );
}
