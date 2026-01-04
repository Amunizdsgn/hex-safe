"use client"

import { formatCurrency } from '@/data/mockData';
import { Calendar, DollarSign, User, MoreHorizontal, ArrowRight, Copy, Trash } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { useFinancialContext } from '@/contexts/FinancialContext';

export function DealCard({ deal, onMoveStage, onClick, onDuplicate, onDelete }) {
    const { clients } = useFinancialContext();

    // Resolve client name fallback
    // 1. Existing client from ID
    // 2. New contact name stored in deal
    // 3. Fallback to ID or "Cliente Desconhecido"
    const clientName = (deal.clientId === 'c-externo' || deal.clientId === 'c-new')
        ? (deal.contactName || deal.clientName || 'Novo Prospect')
        : (clients?.find(c => c.id === deal.clientId)?.name || deal.clientId);

    const priorityColors = {
        High: 'bg-red-500/10 text-red-500',
        Medium: 'bg-yellow-500/10 text-yellow-500',
        Low: 'bg-blue-500/10 text-blue-500'
    };

    const handleDragStart = (e) => {
        e.dataTransfer.setData('dealId', deal.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onClick={onClick}
            className="bg-card border border-border/50 rounded-lg p-3 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group hover:shadow-md"
        >
            <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className={`text-[10px] border-0 px-1.5 py-0 ${priorityColors[deal.priority]}`}>
                    {deal.priority} Priority
                </Badge>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveStage(deal.id, 'next'); }}>
                            Avançar Etapa <ArrowRight className="w-3 h-3 ml-2" />
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                            Duplicar <Copy className="w-3 h-3 ml-2" />
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                            Excluir <Trash className="w-3 h-3 ml-auto" />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-2">{deal.title}</h4>
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                <User className="w-3 h-3" /> {clientName}
            </div>

            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-border/30">
                <div className="font-bold text-foreground">
                    {formatCurrency(deal.value)}
                </div>
                <div className="flex items-center text-muted-foreground" title="Data Estimada">
                    <Calendar className="w-3 h-3 mr-1" />
                    {(() => {
                        if (!deal.closingDate) return 'N/D';
                        const parts = deal.closingDate.split('T')[0].split('-');
                        if (parts.length === 3) {
                            return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                        }
                        return new Date(deal.closingDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    })()}
                </div>
            </div>

            {/* Action Buttons */}
            {deal.stage === 'Negociação' ? (
                <div className="flex gap-2 mt-3 pt-2 border-t border-border/30">
                    <Button
                        size="sm"
                        variant="default"
                        className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={(e) => { e.stopPropagation(); onMoveStage(deal.id, 'Fechado'); }}
                    >
                        Ganho
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 h-7 text-xs"
                        onClick={(e) => { e.stopPropagation(); onMoveStage(deal.id, 'Perdido'); }}
                    >
                        Perdido
                    </Button>
                </div>
            ) : (deal.stage !== 'Fechado' && deal.stage !== 'Perdido') && (
                <div className="mt-3 pt-2 border-t border-border/30">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="w-full h-7 text-xs hover:bg-primary/20 hover:text-primary transition-colors"
                        onClick={(e) => { e.stopPropagation(); onMoveStage(deal.id, 'next'); }}
                    >
                        Avançar <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}
