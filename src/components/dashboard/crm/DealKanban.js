"use client"

import { DealCard } from './DealCard';

export function DealKanban({ deals, stages, onMoveDeal, onDealClick, onDuplicateDeal, onDeleteDeal }) {
    return (
        <div className="grid grid-cols-3 gap-6">
            {stages.map(stage => {
                const stageDeals = deals.filter(d => d.stage === stage.id);
                const totalValue = stageDeals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);

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
                        className="w-full min-w-0 flex flex-col bg-secondary/10 rounded-xl border border-border/50 transition-colors h-fit"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {/* Header */}
                        <div className={`p-4 border-b border-border/50 rounded-t-xl shrink-0 ${stage.headerBg || ''}`}>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-semibold text-sm text-foreground">{stage.label}</h3>
                                <span className="text-xs font-mono bg-background/50 px-1.5 py-0.5 rounded text-muted-foreground">
                                    {stageDeals.length}
                                </span>
                            </div>

                            <p className="text-xs text-foreground font-medium mt-2 text-right">
                                {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>

                        {/* Body */}
                        <div className="p-3 flex flex-col gap-3">
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
