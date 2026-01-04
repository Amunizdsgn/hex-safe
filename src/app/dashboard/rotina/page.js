"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Check, Trash2, Calendar as CalendarIcon, Repeat, Flame, Trophy, ListTodo, CalendarDays, Columns } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { RoutineCalendar } from '@/components/routine/RoutineCalendar';
import { TaskDetailsSheet } from '@/components/routine/TaskDetailsSheet';
import { WeeklyKanban } from '@/components/routine/WeeklyKanban';

export default function RoutinePage() {
    const { user } = useFinancialContext();
    const supabase = createClient();

    // Data State
    const [tasks, setTasks] = useState([]);
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [newTask, setNewTask] = useState('');
    const [isHabit, setIsHabit] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null); // For editing
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Filters
    const [viewMode, setViewMode] = useState('today'); // 'today' | 'calendar' | 'kanban'

    // Fetch Routine Data
    const fetchRoutine = async () => {
        if (!user) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('start_at', { ascending: true }) // Sort by start time for calendar logic
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching routine:', error);
            if (error.message.includes('start_at') || error.code === '42703') { // 42703 is Undefined Column
                alert("Erro de Banco de Dados: Coluna 'start_at' não encontrada. Por favor, execute o script 'supabase/update_routine_schema.sql' no Supabase.");
            }
        } else {
            setTasks(data.filter(t => !t.is_habit));
            setHabits(data.filter(t => t.is_habit));
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRoutine();
    }, [user]);

    // --- Actions ---

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        if (!user) {
            alert("Sessão de usuário não encontrada. Tente sair e entrar novamente, ou recarregar a página.");
            return;
        }

        const taskData = {
            user_id: user.id,
            title: newTask,
            is_habit: isHabit,
            status: 'pending',
            frequency: isHabit ? 'daily' : 'once',
            streak: 0,
            start_at: new Date().toISOString(), // Default to now
            created_at: new Date().toISOString()
        };

        // Optimistic
        const tempId = Math.random().toString();
        if (isHabit) {
            setHabits([{ ...taskData, id: tempId }, ...habits]);
        } else {
            setTasks([{ ...taskData, id: tempId }, ...tasks]);
        }

        const { data, error } = await supabase.from('tasks').insert(taskData).select().single();

        if (error) {
            console.error('Error quick adding:', error);
            alert(`Erro Quick Add: ${error.message}\nCode: ${error.code}\nUser ID: ${user?.id}`);
            return;
        }

        if (data) {
            const updateList = isHabit ? setHabits : setTasks;
            updateList(prev => prev.map(item => item.id === tempId ? data : item));
        }

        setNewTask('');
    };

    const handleSaveTask = async (taskData) => {
        if (!user) {
            alert("Erro: Usuário não autenticado.");
            return;
        }

        // Prepare payload
        const payload = {
            user_id: user.id,
            title: taskData.title,
            description: taskData.description,
            is_habit: taskData.is_habit,
            start_at: taskData.start_at,
            reminder_minutes: taskData.reminder_minutes
        };

        let savedData;
        let error;

        if (taskData.id) {
            // Update
            const result = await supabase.from('tasks').update(payload).eq('id', taskData.id).select().single();
            savedData = result.data;
            error = result.error;
        } else {
            // Create
            const result = await supabase.from('tasks').insert(payload).select().single();
            savedData = result.data;
            error = result.error;
        }

        if (error) {
            console.error('Erro ao salvar tarefa:', error);
            alert(`Erro ao salvar: ${error.message} \nCode: ${error.code}\nUser ID: ${user?.id}\nPayload: ${JSON.stringify(payload)}`);
            return;
        }

        if (savedData) {
            setIsSheetOpen(false);
            fetchRoutine();
        }
    };

    const handleDeleteTask = async (id) => {
        await supabase.from('tasks').delete().eq('id', id);
        setIsSheetOpen(false);
        fetchRoutine();
    };

    const handleTaskMove = async (taskId, targetDate) => {
        const task = tasks.find(t => t.id === taskId) || habits.find(h => h.id === taskId);
        if (!task) return;

        let newStartAt;

        if (task.start_at) {
            // Preserve original time
            const originalTime = new Date(task.start_at);
            const newDate = new Date(targetDate);
            newDate.setHours(originalTime.getHours(), originalTime.getMinutes(), 0);
            newStartAt = newDate.toISOString();
        } else {
            // No previous time, set to target date generic (avoid timezone shifting issues by setting to noon or keep time 00:00 local)
            // Using 12:00 safe for date only
            const d = new Date(targetDate);
            d.setHours(12, 0, 0, 0);
            newStartAt = d.toISOString();
        }

        // Optimistic Update
        const updateList = task.is_habit ? setHabits : setTasks;
        updateList(prev => prev.map(t => t.id === taskId ? { ...t, start_at: newStartAt } : t));

        // DB Update
        const { error } = await supabase.from('tasks').update({ start_at: newStartAt }).eq('id', taskId);
        if (error) {
            console.error("Erro ao mover tarefa:", error);
            alert("Erro ao mover tarefa. Verifique o banco de dados.");
            fetchRoutine(); // Revert
        }
    };

    const toggleCompletion = async (item, isItemHabit) => {
        if (isItemHabit) {
            // Habit Toggle Logic (Streak)
            const today = new Date().toISOString().split('T')[0];
            const lastCompleted = item.last_completed_at ? new Date(item.last_completed_at).toISOString().split('T')[0] : null;
            const isCompletedToday = lastCompleted === today;

            let updates = {};
            if (!isCompletedToday) {
                updates = {
                    last_completed_at: new Date().toISOString(),
                    streak: (item.streak || 0) + 1
                };
            } else {
                updates = {
                    last_completed_at: null,
                    streak: Math.max(0, (item.streak || 0) - 1)
                };
            }

            // Optimistic
            setHabits(prev => prev.map(h => h.id === item.id ? { ...h, ...updates } : h));
            await supabase.from('tasks').update(updates).eq('id', item.id);

        } else {
            // Task Toggle Logic
            const newStatus = !item.completed;
            setTasks(prev => prev.map(t => t.id === item.id ? { ...t, completed: newStatus } : t));
            await supabase.from('tasks').update({ completed: newStatus }).eq('id', item.id);
        }
    };

    // --- Interactions ---

    const openNewTaskSheet = () => {
        setSelectedTask(null);
        setIsSheetOpen(true);
    };

    const openEditTaskSheet = (task) => {
        setSelectedTask(task);
        setIsSheetOpen(true);
    };

    const handleDateSelect = (date) => {
        // Open modal pre-filled with date
        const dateStr = format(date, 'yyyy-MM-dd');
        setSelectedTask({
            due_date: dateStr,
            start_at: new Date(date).toISOString()
        }); // Mock object for default
        setIsSheetOpen(true);
    };


    const todayDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

    // Check if habit is done today
    const isHabitDoneToday = (habit) => {
        if (!habit.last_completed_at) return false;
        const today = new Date().toISOString().split('T')[0];
        const last = new Date(habit.last_completed_at).toISOString().split('T')[0];
        return today === last;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Minha Rotina</h2>
                    <p className="text-muted-foreground capitalize">{todayDate}</p>
                </div>

                <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-lg">
                    <Button
                        variant={viewMode === 'today' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('today')}
                        className="gap-2"
                    >
                        <ListTodo className="w-4 h-4" />
                        Hoje
                    </Button>
                    <Button
                        variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('kanban')}
                        className="gap-2"
                    >
                        <Columns className="w-4 h-4" />
                        Semana
                    </Button>
                    <Button
                        variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('calendar')}
                        className="gap-2"
                    >
                        <CalendarIcon className="w-4 h-4" />
                        Calendário
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'today' && (
                <div className="space-y-6">
                    {/* Input Area */}
                    <div className="glass-card p-4 rounded-xl shadow-lg border-primary/10 border">
                        <form onSubmit={handleQuickAdd} className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder="Adicionar nova tarefa ou hábito..."
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    className="bg-background/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="flex items-center gap-2 px-2 border-r border-border/50 pr-4 mr-2">
                                <Checkbox
                                    id="isHabit"
                                    checked={isHabit}
                                    onCheckedChange={setIsHabit}
                                />
                                <label htmlFor="isHabit" className="text-sm cursor-pointer select-none">Hábito</label>
                            </div>
                            <Button type="button" onClick={handleQuickAdd} disabled={!newTask} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20">
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar
                            </Button>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Habits Column */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                                <Flame className="w-5 h-5 text-orange-500" />
                                Hábitos Diários
                            </h3>

                            <div className="space-y-2">
                                {habits.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhum hábito cadastrado.</p>}
                                {habits.map(habit => {
                                    const done = isHabitDoneToday(habit);
                                    return (
                                        <div
                                            key={habit.id}
                                            onClick={() => openEditTaskSheet(habit)}
                                            className={cn(
                                                "cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between group hover:shadow-md",
                                                done ? "bg-success/5 border-success/20" : "bg-card border-border hover:border-primary/30"
                                            )}>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleCompletion(habit, true); }}
                                                    className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300",
                                                        done ? "bg-success border-success text-white scale-110" : "border-muted-foreground hover:border-primary hover:bg-primary/10"
                                                    )}
                                                >
                                                    {done && <Check className="w-4 h-4" />}
                                                </button>
                                                <div>
                                                    <p className={cn("font-medium transition-colors", done && "text-muted-foreground line-through")}>{habit.title}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Flame className="w-3 h-3 text-orange-500" />
                                                        Sequência: {habit.streak || 0} dias
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tasks Column */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                                    <ListTodo className="w-5 h-5 text-primary" />
                                    Tarefas Pendentes
                                </h3>
                                <Button size="sm" variant="ghost" className="text-xs" onClick={openNewTaskSheet}>
                                    + Detalhado
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {tasks.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhuma tarefa pendente.</p>}
                                {tasks.filter(t => !t.completed).map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => openEditTaskSheet(task)}
                                        className="cursor-pointer p-3 bg-card border border-border rounded-lg flex items-center justify-between group hover:shadow-md hover:border-primary/40 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={task.completed}
                                                onCheckedChange={(v) => { toggleCompletion(task, false); }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{task.title}</span>
                                                {task.start_at && (
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <CalendarIcon className="w-3 h-3" />
                                                        {format(new Date(task.start_at), "dd/MM 'às' HH:mm")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {tasks.some(t => t.completed) && (
                                    <div className="pt-4 border-t border-border/50 mt-4">
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Concluídas</h4>
                                        {tasks.filter(t => t.completed).map(task => (
                                            <div
                                                key={task.id}
                                                onClick={() => openEditTaskSheet(task)}
                                                className="p-2 flex items-center justify-between group opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        checked={task.completed}
                                                        onCheckedChange={() => toggleCompletion(task, false)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <span className="text-sm line-through text-muted-foreground">{task.title}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'kanban' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={openNewTaskSheet} className="gap-2">
                            <Plus className="w-4 h-4" /> Nova Tarefa
                        </Button>
                    </div>
                    <WeeklyKanban
                        tasks={[...tasks, ...habits]}
                        onTaskMove={handleTaskMove}
                        onTaskClick={openEditTaskSheet}
                    />
                </div>
            )}

            {viewMode === 'calendar' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={openNewTaskSheet} className="gap-2">
                            <Plus className="w-4 h-4" /> Novo Compromisso
                        </Button>
                    </div>
                    <RoutineCalendar
                        tasks={[...tasks, ...habits]}
                        onSelectDate={handleDateSelect}
                        onSelectTask={(task) => openEditTaskSheet(task)}
                    />
                </div>
            )}

            {/* Detail Sheet */}
            <TaskDetailsSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                task={selectedTask}
                onSave={handleSaveTask}
                onDelete={handleDeleteTask}
            />
        </div>
    );
}
