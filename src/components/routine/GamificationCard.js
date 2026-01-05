"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, TrendingUp } from 'lucide-react';

export function GamificationCard({ xp, level, nextLevelXp }) {
    const progress = (xp / nextLevelXp) * 100;

    return (
        <Card className="glass-card border-none bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-lg">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Seu Nível
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-yellow-500">Nível {level}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">XP Atual</span>
                        <span className="font-mono font-bold">{xp} / {nextLevelXp} XP</span>
                    </div>

                    <div className="relative">
                        <Progress value={progress} className="h-3 bg-secondary/50" indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <div className="absolute top-4 right-0 text-[10px] text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Faltam {nextLevelXp - xp} XP para o próximo nível
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-6">
                        <div className="p-3 rounded-lg bg-background/40 border border-white/5 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Hábitos</div>
                            <div className="font-bold text-lg text-indigo-400">+10 XP</div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/40 border border-white/5 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Água</div>
                            <div className="font-bold text-lg text-blue-400">+5 XP</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
