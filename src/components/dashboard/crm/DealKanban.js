"use client"

import { DealCard } from './DealCard';
import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming Shadcn scroll area exists, if not I'll standard dive it. 
// I'll stick to standard div overflow for safety, seeing scroll-area wasn't in my initial list check (or I missed it).
// Actually, standard div is safer.

export function DealKanban({ deals, stages, onMoveDeal, onDealClick, onDuplicateDeal, onDeleteDeal }) {
    return (
        <div className="flex overflow-x-auto pb-4 gap-4 min-h-[500px]">
            {stages.map(stage => {
                const stageDeals = deals.filter(d => d.stage === stage.id);
                const totalValue = stageDeals.reduce((acc, d) => acc + d.value, 0);

                const handleDragOver = (e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('bg-secondary/20'); // Visual feedback
                };

                const handleDragLeave = (e) => {
                    e.currentTarget.classList.remove('bg-secondary/20');
                };

                const handleDrop = (e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('bg-secondary/20');
                    const dealId = e.dataTransfer.getData('dealId');
                    if (dealId) {
                        onMoveDeal(dealId, stage.id);
                    }
                };

                return (
                    <div
                        key={stage.id}
                        className="min-w-[280px] w-[280px] flex flex-col bg-secondary/10 rounded-xl border border-border/50 transition-colors"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {/* Header */}
                        <div className={`p-4 border-b border-border/50 rounded-t-xl ${stage.headerBg || ''}`}>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-semibold text-sm text-foreground">{stage.label}</h3>
                                <span className="text-xs font-mono bg-background/50 px-1.5 py-0.5 rounded text-muted-foreground">
                                    {stageDeals.length}
                                </span>
                            </div>

                            <p className="text-xs text-muted-foreground mt-2 text-right">
                                {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>

                        {/* Body */}
                        <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[600px] scrollbar-thin">
                            {stageDeals.map(deal => (
                                <DealCard
                                    key={deal.id}
                                    deal={deal}
                                    onMoveStage={onMoveDeal}
                                    onClick={() => onDealClick(deal)}
                                    onDuplicate={() => onDuplicateDeal(deal.id)}
                                    onDelete={() => onDeleteDeal(deal.id)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
