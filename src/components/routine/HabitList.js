"use client"

import { cn } from '@/lib/utils';
import { Flame, Check, MoreHorizontal, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HabitList({ habits, onToggle, onEdit }) {

    // Check if habit is done today
    const isHabitDoneToday = (habit) => {
        if (!habit.last_completed_at) return false;
        const today = new Date().toISOString().split('T')[0];
        const last = new Date(habit.last_completed_at).toISOString().split('T')[0];
        return today === last;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Seus Hábitos
                </h3>
                <span className="text-xs text-muted-foreground">{habits.length} ativos</span>
            </div>

            <div className="space-y-3">
                {habits.length === 0 && (
                    <div className="p-8 text-center border border-dashed rounded-xl border-border/50 bg-card/30">
                        <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Nenhum hábito cadastrado.</p>
                        <p className="text-xs text-muted-foreground/50 mt-1">Adicione um novo hábito para começar sua jornada.</p>
                    </div>
                )}

                {habits.map(habit => {
                    const done = isHabitDoneToday(habit);
                    return (
                        <div
                            key={habit.id}
                            onClick={() => onEdit(habit)}
                            className={cn(
                                "cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between group hover:shadow-lg relative overflow-hidden",
                                done
                                    ? "bg-gradient-to-r from-green-500/10 to-transparent border-green-500/20"
                                    : "glass-card border-border hover:border-primary/30"
                            )}>

                            {/* Streak Background Decoration if > 3 */}
                            {habit.streak > 3 && (
                                <div className="absolute -right-4 -top-4 opacity-5 rotate-12">
                                    <Flame className="w-24 h-24 text-orange-500" />
                                </div>
                            )}

                            <div className="flex items-center gap-4 z-10">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggle(habit); }}
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm",
                                        done
                                            ? "bg-green-500 border-green-500 text-white scale-110 shadow-green-500/20"
                                            : "border-muted-foreground/30 hover:border-primary hover:bg-primary/10 text-transparent"
                                    )}
                                >
                                    <Check className="w-4 h-4" />
                                </button>

                                <div>
                                    <p className={cn("font-medium transition-colors text-base", done && "text-muted-foreground line-through")}>
                                        {habit.title}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className={cn(
                                            "text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium transition-colors",
                                            habit.streak > 0 ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" : "text-muted-foreground"
                                        )}>
                                            <Flame className="w-3 h-3" fill={habit.streak > 0 ? "currentColor" : "none"} />
                                            {habit.streak || 0} dias
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
