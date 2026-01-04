"use client"

import { useState } from 'react';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function RoutineCalendar({ tasks, onSelectDate, onSelectTask }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Group tasks by date
    const getTasksForDay = (day) => {
        return tasks.filter(task => {
            if (!task.start_at && !task.due_date) return false;
            const taskDate = new Date(task.start_at || task.due_date);
            return isSameDay(taskDate, day);
        });
    };

    return (
        <div className="bg-card glass-card rounded-xl border border-border p-4 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </h2>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2 text-center">
                {weekDays.map(d => (
                    <div key={d} className="text-xs font-medium text-muted-foreground py-2">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                    const dayTasks = getTasksForDay(day);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isDayToday = isToday(day);

                    return (
                        <div
                            key={idx}
                            onClick={() => onSelectDate(day)}
                            className={cn(
                                "min-h-[100px] p-2 rounded-lg border border-transparent transition-all cursor-pointer hover:border-primary/30 flex flex-col gap-1",
                                !isCurrentMonth && "opacity-40 bg-secondary/10",
                                isCurrentMonth && "bg-secondary/30",
                                isDayToday && "bg-primary/5 border-primary/50 relative"
                            )}
                        >
                            {/* Day Number */}
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                    isDayToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                )}>
                                    {format(day, 'd')}
                                </span>
                                {dayTasks.length > 0 && (
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                        {dayTasks.length}
                                    </span>
                                )}
                            </div>

                            {/* Task Dots/List */}
                            <div className="flex-1 flex flex-col gap-1 overflow-hidden mt-1">
                                {dayTasks.slice(0, 3).map(task => ( // Show max 3
                                    <div
                                        key={task.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectTask(task);
                                        }}
                                        className={cn(
                                            "text-[10px] truncate px-1.5 py-0.5 rounded border border-l-2",
                                            task.completed ? "line-through opacity-50 bg-secondary" :
                                                (task.is_habit ? "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300" : "bg-primary/10 border-primary text-primary")
                                        )}
                                    >
                                        {task.start_at && task.start_at.includes('T') && !task.start_at.includes('00:00:00') && (
                                            <span className="mr-1 opacity-75">
                                                {format(new Date(task.start_at), 'HH:mm')}
                                            </span>
                                        )}
                                        {task.title}
                                    </div>
                                ))}
                                {dayTasks.length > 3 && (
                                    <div className="text-[10px] text-muted-foreground text-center">
                                        + {dayTasks.length - 3} mais
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
