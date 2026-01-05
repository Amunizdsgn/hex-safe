import { useState } from 'react';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function RoutineCalendar({ tasks, onSelectDate, onSelectTask }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDayTasks, setSelectedDayTasks] = useState(null); // { date: Date, tasks: [] }
    const [isDayOpen, setIsDayOpen] = useState(false);

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

    const handleDayClick = (day, dayTasks, e) => {
        // If clicking background/day, open "New Task" (default behavior)
        // But if day has many tasks, maybe user wants to see them?
        // Let's rely on specific "Show More" click for expansion, OR just double click? 
        // User asked to "expandir pra ver tudo".
        // Let's open the view dialog if specific click target, otherwise passed handler.
        onSelectDate(day);
    };

    const openDayView = (e, day, dayTasks) => {
        e.stopPropagation();
        setSelectedDayTasks({ date: day, tasks: dayTasks });
        setIsDayOpen(true);
    };

    return (
        <>
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
                                onClick={(e) => handleDayClick(day, dayTasks, e)}
                                className={cn(
                                    "min-h-[100px] p-2 rounded-lg border border-transparent transition-all cursor-pointer hover:border-primary/30 flex flex-col gap-1 group relative",
                                    !isCurrentMonth && "opacity-40 bg-secondary/10",
                                    isCurrentMonth && "bg-secondary/30",
                                    isDayToday && "bg-primary/5 border-primary/50"
                                )}
                            >
                                {/* Quick Add Button (Hover) */}
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-5 w-5 rounded-full" onClick={(e) => handleDayClick(day, dayTasks, e)}>
                                        <Plus className="w-3 h-3" />
                                    </Button>
                                </div>

                                {/* Day Number */}
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                        isDayToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
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
                                                "text-[10px] truncate px-1.5 py-0.5 rounded border border-l-2 transition-colors hover:scale-[1.02]",
                                                task.completed ? "line-through opacity-50 bg-secondary" :
                                                    (task.is_habit ? "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300" : "bg-primary/10 border-primary text-primary")
                                            )}
                                        >
                                            {task.title}
                                        </div>
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <div
                                            onClick={(e) => openDayView(e, day, dayTasks)}
                                            className="text-[10px] text-muted-foreground text-center hover:text-primary hover:font-bold py-0.5 rounded hover:bg-primary/10 transition-colors"
                                        >
                                            + {dayTasks.length - 3} mais
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Day Expansion Dialog */}
            <Dialog open={isDayOpen} onOpenChange={setIsDayOpen}>
                <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="capitalize flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            {selectedDayTasks && format(selectedDayTasks.date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-2 py-4">
                        {selectedDayTasks?.tasks.length === 0 && (
                            <p className="text-center text-muted-foreground text-sm py-4">Nenhuma tarefa para este dia.</p>
                        )}
                        {selectedDayTasks?.tasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => {
                                    setIsDayOpen(false);
                                    onSelectTask(task);
                                }}
                                className={cn(
                                    "cursor-pointer p-3 rounded-xl border flex items-center justify-between group hover:shadow-md transition-all",
                                    task.completed ? "bg-secondary/30 border-transparent opacity-60" : "bg-card border-border hover:border-primary/50"
                                )}
                            >
                                <div className="flex flex-col gap-1">
                                    <span className={cn("font-medium text-sm", task.completed && "line-through")}>{task.title}</span>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                        {task.start_at && task.start_at.includes('T') && (
                                            <span className="flex items-center gap-1 bg-secondary px-1.5 py-0.5 rounded">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(task.start_at), 'HH:mm')}
                                            </span>
                                        )}
                                        {task.is_habit && <span className="text-orange-500">Hábito</span>}
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button className="w-full" onClick={() => {
                            if (selectedDayTasks) {
                                onSelectDate(selectedDayTasks.date);
                                setIsDayOpen(false);
                            }
                        }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Item
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
