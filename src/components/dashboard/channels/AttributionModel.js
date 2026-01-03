"use client"

import { GitMerge, HelpCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AttributionModel({ selectedModel, onModelChange, channels }) {
    return (
        <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <GitMerge className="w-5 h-5 text-primary" />
                    Modelo de Atribuição
                </h3>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">Define como a receita é distribuída entre os canais. Afeta o cálculo de ROI e CAC.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="space-y-6">
                <Select value={selectedModel} onValueChange={onModelChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Last Click">Last Click (Padrão)</SelectItem>
                        <SelectItem value="First Touch">First Touch</SelectItem>
                        <SelectItem value="Linear">Linear</SelectItem>
                        <SelectItem value="Manual">Manual (Personalizado)</SelectItem>
                    </SelectContent>
                </Select>

                {selectedModel === 'Manual' && (
                    <div className="space-y-4 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">Defina o peso de cada canal:</p>
                        {channels.map(channel => (
                            <div key={channel.id} className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span>{channel.canal}</span>
                                    <span>100%</span>
                                </div>
                                <Slider defaultValue={[100]} max={200} step={10} className="py-1" />
                            </div>
                        ))}
                    </div>
                )}

                <div className="p-3 bg-secondary/30 rounded-lg text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">Simulação:</span> Alterar o modelo recalcula os dados de receita e ROI em tempo real.
                </div>
            </div>
        </div>
    );
}
