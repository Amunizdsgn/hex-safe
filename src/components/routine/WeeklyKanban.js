"use client"

import { useState } from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, GripVertical, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function WeeklyKanban({ tasks, onTaskMove, onTaskClick }) {
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 })); // Dom
    const [draggedTaskId, setDraggedTaskId] = useState(null);

    const checkDate = addDays(weekStart, 7);

    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    const handlePrevWeek = () => setWeekStart(prev => addDays(prev, -7));
    const handleNextWeek = () => setWeekStart(prev => addDays(prev, 7));

    const getTasksForDay = (date) => {
        return tasks.filter(task => {
            if (!task.start_at && !task.due_date) return false;
            const taskDate = new Date(task.start_at || task.due_date);
            return isSameDay(taskDate, date);
        });
    };

    // Drag Handlers
    const handleDragStart = (e, taskId) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetDate) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');

        if (taskId && onTaskMove) {
            onTaskMove(taskId, targetDate);
        }
        setDraggedTaskId(null);
    };

    return (
        <div className="space-y-4 animate-in fade-in">
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold capitalize">
                        {format(weekStart, "d 'de' MMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d 'de' MMM", { locale: ptBR })}
                    </h2>
                </div>
                <div className="flex items-center gap-1 bg-secondary/30 rounded-lg p-1">
                    <Button variant="ghost" size="icon" onClick={handlePrevWeek} className="h-8 w-8">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleNextWeek} className="h-8 w-8">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-7 gap-3 h-[calc(100vh-250px)] min-h-[500px]">
                {days.map((day, index) => {
                    const dayTasks = getTasksForDay(day);
                    const isDayToday = isToday(day);

                    return (
                        <div
                            key={index}
                            className={cn(
                                "flex flex-col rounded-xl border bg-card/50 transition-colors overflow-hidden h-full",
                                isDayToday ? "border-primary/50 bg-primary/5" : "border-border"
                            )}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, day)}
                        >
                            {/* Column Header */}
                            <div className={cn(
                                "p-3 border-b border-border/50 text-center flex-shrink-0",
                                isDayToday && "bg-primary/10"
                            )}>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">
                                    {format(day, 'EEE', { locale: ptBR })}
                                </p>
                                <p className={cn(
                                    "text-lg font-bold mt-1",
                                    isDayToday ? "text-primary" : "text-foreground"
                                )}>
                                    {format(day, 'd')}
                                </p>
                            </div>

                            {/* Drop Zone / Task List */}
                            <div className="flex-1 p-2 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary">
                                {dayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        onClick={() => onTaskClick && onTaskClick(task)}
                                        className={cn(
                                            "p-3 rounded-lg border bg-card text-sm shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all group relative",
                                            task.completed ? "opacity-60 grayscale border-transparent" : "border-border",
                                            draggedTaskId === task.id && "opacity-50 border-dashed border-primary"
                                        )}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <span className={cn(
                                                "font-medium line-clamp-2",
                                                task.completed && "line-through text-muted-foreground"
                                            )}>
                                                {task.title}
                                            </span>
                                        </div>

                                        {task.start_at && task.start_at.includes('T') && (
                                            <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded w-fit">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(task.start_at), 'HH:mm')}
                                            </div>
                                        )}

                                        {task.is_habit && (
                                            <div className="mt-1 text-[10px] text-orange-500 font-medium">
                                                Hábito
                                            </div>
                                        )}

                                        {/* Progress Bar for Subtasks */}
                                        {task.subtasks && task.subtasks.length > 0 && (
                                            <div className="h-1 w-full bg-secondary rounded-full overflow-hidden mt-2">
                                                <div
                                                    className="h-full bg-primary/70"
                                                    style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
