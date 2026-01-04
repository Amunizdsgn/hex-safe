"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Check, Trash2, Calendar as CalendarIcon, Repeat, Flame, Trophy, ListTodo, CalendarDays, Columns, Droplets, Minus, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { RoutineCalendar } from '@/components/routine/RoutineCalendar';
import { TaskDetailsSheet } from '@/components/routine/TaskDetailsSheet';
import { WeeklyKanban } from '@/components/routine/WeeklyKanban';

export default function RoutinePage() {
    const { user } = useFinancialContext();
    const supabase = createClient();

    // Data State
    const [tasks, setTasks] = useState([]);
    const [habits, setHabits] = useState([]);
    const [waterIntake, setWaterIntake] = useState(0);
    const [waterGoal, setWaterGoal] = useState(2000);
    const [loading, setLoading] = useState(true);

    // Dialogs State
    const [isWaterDialogOpen, setIsWaterDialogOpen] = useState(false);
    const [customWaterAmount, setCustomWaterAmount] = useState('');
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
    const [tempGoal, setTempGoal] = useState(2000);

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

    const fetchWater = async () => {
        if (!user) return;
        const today = new Date().toISOString().split('T')[0];

        try {
            const [logRes, profileRes] = await Promise.all([
                supabase.from('water_logs').select('*').eq('user_id', user.id).eq('date', today).single(),
                supabase.from('profiles').select('daily_water_goal').eq('id', user.id).single()
            ]);

            const profileGoal = profileRes.data?.daily_water_goal || 2000;

            if (logRes.data) {
                setWaterIntake(logRes.data.amount_ml);
                setWaterGoal(logRes.data.daily_goal_ml || profileGoal);
            } else {
                setWaterIntake(0);
                setWaterGoal(profileGoal);
            }
        } catch (error) {
            console.error('Error fetching water:', error);
        }
    };

    useEffect(() => {
        fetchRoutine();
        fetchWater();
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

    const handleAddWater = async (amount) => {
        if (!user) return;
        const newAmount = Math.max(0, waterIntake + amount);
        setWaterIntake(newAmount); // Optimistic

        const today = new Date().toISOString().split('T')[0];

        const { error } = await supabase.from('water_logs').upsert({
            user_id: user.id,
            date: today,
            amount_ml: newAmount,
            daily_goal_ml: waterGoal
        }, { onConflict: 'user_id, date' });

        if (error) {
            console.error("Erro ao salvar água:", error);
            fetchWater(); // Revert
        }
    };

    const handleAddCustomWater = () => {
        const amount = parseInt(customWaterAmount);
        if (amount && amount > 0) {
            handleAddWater(amount);
            setCustomWaterAmount('');
            setIsWaterDialogOpen(false);
        }
    };

    const handleSaveGoal = async () => {
        if (!user) return;
        const newGoal = parseInt(tempGoal);
        if (!newGoal || newGoal <= 0) return;

        setWaterGoal(newGoal); // Optimistic
        setIsGoalDialogOpen(false);

        // Update Profile (Persistent)
        await supabase.from('profiles').update({ daily_water_goal: newGoal }).eq('id', user.id);

        // Update Today's Log
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase.from('water_logs').upsert({
            user_id: user.id,
            date: today,
            amount_ml: waterIntake,
            daily_goal_ml: newGoal
        }, { onConflict: 'user_id, date' });

        if (error) console.error("Error saving goal:", error);
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

                            {/* Water Tracker - Compact */}
                            <div className="glass-card p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Droplets className="w-24 h-24 text-blue-500" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-blue-400">
                                            <Droplets className="w-5 h-5" />
                                            <h4 className="font-semibold">Hidratação</h4>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-400/50 hover:text-blue-400" onClick={() => { setTempGoal(waterGoal); setIsGoalDialogOpen(true); }}>
                                                <Settings className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <span className="text-2xl font-bold text-foreground">
                                            {(waterIntake / 1000).toFixed(1)}<span className="text-sm font-normal text-muted-foreground">/{waterGoal / 1000}L</span>
                                        </span>
                                    </div>

                                    <div className="h-2 w-full bg-blue-950 rounded-full overflow-hidden mb-4">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-500 ease-out"
                                            style={{ width: `${Math.min(100, (waterIntake / waterGoal) * 100)}%` }}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleAddWater(250)}
                                            className="flex-1 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                                        >
                                            +250ml
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleAddWater(500)}
                                            className="flex-1 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                                        >
                                            +500ml
                                        </Button>
                                        <Dialog open={isWaterDialogOpen} onOpenChange={setIsWaterDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline" className="flex-1 border-blue-500/30 border-dashed hover:bg-blue-500/10 hover:text-blue-400">
                                                    Outro
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Adicionar Água</DialogTitle>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <Label>Quantidade (ml)</Label>
                                                    <Input
                                                        type="number"
                                                        value={customWaterAmount}
                                                        onChange={e => setCustomWaterAmount(e.target.value)}
                                                        placeholder="Ex: 300"
                                                        autoFocus
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={handleAddCustomWater}>Adicionar</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleAddWater(-250)}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

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
                                {tasks.filter(t => {
                                    if (t.completed) return false;
                                    if (!t.start_at) return true; // Sem data = Backlog (aparece)
                                    // Compara datas (apenas YYYY-MM-DD)
                                    const taskDate = new Date(t.start_at).toISOString().split('T')[0];
                                    const today = new Date().toISOString().split('T')[0];
                                    return taskDate <= today;
                                }).length === 0 && <p className="text-sm text-muted-foreground italic">Nenhuma tarefa para hoje.</p>}

                                {tasks.filter(t => {
                                    if (t.completed) return false;
                                    if (!t.start_at) return true;
                                    const taskDate = new Date(t.start_at).toISOString().split('T')[0];
                                    const today = new Date().toISOString().split('T')[0];
                                    return taskDate <= today;
                                }).map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => openEditTaskSheet(task)}
                                        className="cursor-pointer p-3 bg-card border border-border rounded-lg flex items-center justify-between group hover:shadow-md hover:border-primary/40 transition-all text-left"
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
                                                    <span className={cn(
                                                        "text-[10px] flex items-center gap-1",
                                                        new Date(task.start_at) < new Date().setHours(0, 0, 0, 0) ? "text-red-400" : "text-muted-foreground"
                                                    )}>
                                                        <CalendarIcon className="w-3 h-3" />
                                                        {format(new Date(task.start_at), "dd/MM 'às' HH:mm")}
                                                    </span>
                                                )}
                                                {/* Subtasks progress indicator */}
                                                {task.subtasks && task.subtasks.length > 0 && (
                                                    <span className="text-[10px] text-muted-foreground mt-0.5">
                                                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} sub-tarefas
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {tasks.some(t => t.completed && (!t.start_at || new Date(t.start_at).toISOString().split('T')[0] <= new Date().toISOString().split('T')[0])) && (
                                    <div className="pt-4 border-t border-border/50 mt-4">
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Concluídas Hoje</h4>
                                        {tasks.filter(t => {
                                            if (!t.completed) return false;
                                            if (!t.start_at) return true;
                                            const taskDate = new Date(t.start_at).toISOString().split('T')[0];
                                            const today = new Date().toISOString().split('T')[0];
                                            return taskDate === today; // Só concluídas de hoje ou todas? Vamos filtrar por 'hoje' para limpar a view.
                                        }).map(task => (
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

            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configurar Meta Diária</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Meta de Água (ml)</Label>
                        <Input
                            type="number"
                            value={tempGoal}
                            onChange={e => setTempGoal(e.target.value)}
                            placeholder="Ex: 2000"
                        />
                        <p className="text-xs text-muted-foreground mt-2">Isso atualizará sua meta padrão.</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveGoal}>Salvar Meta</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
