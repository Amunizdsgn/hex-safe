"use client"

import { subDays, isSameDay, format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function HabitStats({ habits }) {
    // Generate last 28 days for the heatmap (4 weeks)
    const today = new Date();
    const startDate = subDays(today, 27);
    const dates = eachDayOfInterval({ start: startDate, end: today });

    // Calculate completion for each day
    // This is tricky because we only have 'last_completed_at' and 'streak'.
    // WITHOUT a dedicated history table for habit completion, we can only accurately show TODAY and Streak history backwards IF they kept the streak.
    // If they missed a day, the streak resets, so we lose history.
    // LIMITATION: We can only visualize the CURRENT streak history.

    // Better approach for V1: Just assume if streak >= X days, those X days back are completed.
    // This isn't perfect but allows visualization without huge DB changes today.
    // A more robust system would add a 'habit_logs' table.

    const getActivityLevel = (date) => {
        let completionCount = 0;

        habits.forEach(habit => {
            if (!habit.last_completed_at || !habit.streak) return;

            // If the habit was completed today, we count backwards 'streak' days
            const lastCompletedDate = new Date(habit.last_completed_at);
            lastCompletedDate.setHours(0, 0, 0, 0);

            const dateCheck = new Date(date);
            dateCheck.setHours(0, 0, 0, 0);

            // Days difference
            const diffTime = Math.abs(lastCompletedDate - dateCheck);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If this date falls within the streak window ending at last_completed_at
            if (dateCheck <= lastCompletedDate && diffDays < habit.streak) {
                completionCount++;
            }
        });

        if (completionCount === 0) return 0;
        if (completionCount <= 2) return 1;
        if (completionCount <= 4) return 2;
        return 3;
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 0: return "bg-secondary/30";
            case 1: return "bg-green-500/30";
            case 2: return "bg-green-500/60";
            case 3: return "bg-green-500";
            default: return "bg-secondary/30";
        }
    };

    const totalHabits = habits.length;
    const completedToday = habits.filter(h => {
        if (!h.last_completed_at) return false;
        return isSameDay(new Date(h.last_completed_at), today);
    }).length;

    const consistency = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    return (
        <Card className="glass-card border-none shadow-lg">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                        <Activity className="w-4 h-4" />
                        Consistência
                    </CardTitle>
                    <span className="text-xs font-bold text-green-500">{consistency}% Hoje</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-1 flex-wrap justify-end">
                    {dates.map((date, i) => {
                        const level = getActivityLevel(date);
                        return (
                            <TooltipProvider key={i}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div
                                            className={`w-3 h-3 rounded-sm ${getLevelColor(level)} transition-colors`}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">{format(date, "d 'de' MMM", { locale: ptBR })}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
