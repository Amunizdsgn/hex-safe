"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, ListTodo, Calendar as CalendarIcon, Columns } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { RoutineCalendar } from '@/components/routine/RoutineCalendar';
import { TaskDetailsSheet } from '@/components/routine/TaskDetailsSheet';
import { WeeklyKanban } from '@/components/routine/WeeklyKanban';
import { GamificationCard } from '@/components/routine/GamificationCard';
import { WaterTracker } from '@/components/routine/WaterTracker';
import { HabitList } from '@/components/routine/HabitList';
import { HabitStats } from '@/components/routine/HabitStats';

export default function RoutinePage() {
    const { user } = useFinancialContext();
    const supabase = createClient();

    // Data State
    const [tasks, setTasks] = useState([]);
    const [habits, setHabits] = useState([]);
    const [waterIntake, setWaterIntake] = useState(0);
    const [waterGoal, setWaterGoal] = useState(2000);
    const [loading, setLoading] = useState(true);

    // Gamification State
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);

    // UI State
    const [newTask, setNewTask] = useState('');
    const [isHabit, setIsHabit] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null); // For editing
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [viewMode, setViewMode] = useState('today'); // 'today' | 'calendar' | 'kanban'

    // Fetch Routine Data
    const fetchRoutine = async () => {
        if (!user) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('start_at', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching routine:', error);
        } else {
            setTasks(data.filter(t => !t.is_habit));
            const userHabits = data.filter(t => t.is_habit);
            setHabits(userHabits);
            calculateXp(userHabits, waterIntake);
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
            const currentIntake = logRes.data?.amount_ml || 0;

            setWaterIntake(currentIntake);
            setWaterGoal(logRes.data?.daily_goal_ml || profileGoal);

            // Re-calc XP with new water data
            calculateXp(habits, currentIntake); // Note: habits might be stale here if fetchRoutine hasn't run, but effect helps

        } catch (error) {
            console.error('Error fetching water:', error);
        }
    };

    // Simple XP Calculation Logic
    const calculateXp = (currentHabits, currentWater) => {
        // 10 XP per habit streak day (total)
        // 5 XP per 500ml water

        const habitXp = currentHabits.reduce((acc, h) => acc + (h.streak * 10), 0);
        const waterXp = Math.floor(currentWater / 500) * 5;

        const totalXp = habitXp + waterXp;
        setXp(totalXp);
        setLevel(Math.floor(totalXp / 100) + 1);
    };

    useEffect(() => {
        fetchRoutine();
        fetchWater();
    }, [user]);

    // --- Actions ---

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        if (!user) return;

        const taskData = {
            user_id: user.id,
            title: newTask,
            is_habit: isHabit,
            status: 'pending',
            frequency: isHabit ? 'daily' : 'once',
            streak: 0,
            start_at: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        const tempId = Math.random().toString();
        if (isHabit) {
            setHabits([{ ...taskData, id: tempId }, ...habits]);
        } else {
            setTasks([{ ...taskData, id: tempId }, ...tasks]);
        }
        setNewTask('');

        const { data, error } = await supabase.from('tasks').insert(taskData).select().single();

        if (error) {
            console.error('Error quick adding:', error);
            fetchRoutine(); // Revert
            return;
        }

        if (data) {
            const updateList = isHabit ? setHabits : setTasks;
            updateList(prev => prev.map(item => item.id === tempId ? data : item));
        }
    };

    const handleSaveTask = async (taskData) => {
        if (!user) return;

        const payload = {
            user_id: user.id,
            title: taskData.title,
            description: taskData.description,
            is_habit: taskData.is_habit,
            priority: taskData.priority,
            start_at: taskData.start_at,
            reminder_minutes: taskData.reminder_minutes,
            subtasks: taskData.subtasks || []
        };

        let error;
        if (taskData.id) {
            const result = await supabase.from('tasks').update(payload).eq('id', taskData.id).select().single();
            error = result.error;
        } else {
            const result = await supabase.from('tasks').insert(payload).select().single();
            error = result.error;
        }

        if (error) {
            console.error('Erro ao salvar tarefa:', error);
            alert(`Erro ao salvar: ${error.message}`);
            return;
        }

        setIsSheetOpen(false);
        fetchRoutine();
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
            const originalTime = new Date(task.start_at);
            const newDate = new Date(targetDate);
            newDate.setHours(originalTime.getHours(), originalTime.getMinutes(), 0);
            newStartAt = newDate.toISOString();
        } else {
            const d = new Date(targetDate);
            d.setHours(12, 0, 0, 0);
            newStartAt = d.toISOString();
        }

        const updateList = task.is_habit ? setHabits : setTasks;
        updateList(prev => prev.map(t => t.id === taskId ? { ...t, start_at: newStartAt } : t));

        await supabase.from('tasks').update({ start_at: newStartAt }).eq('id', taskId);
    };

    const toggleCompletion = async (item) => {
        if (item.is_habit) {
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

            setHabits(prev => {
                const newHabits = prev.map(h => h.id === item.id ? { ...h, ...updates } : h);
                calculateXp(newHabits, waterIntake); // Update XP immediately
                return newHabits;
            });
            await supabase.from('tasks').update(updates).eq('id', item.id);

        } else {
            const newStatus = !item.completed;
            setTasks(prev => prev.map(t => t.id === item.id ? { ...t, completed: newStatus } : t));
            await supabase.from('tasks').update({ completed: newStatus }).eq('id', item.id);
        }
    };

    const handleUpdateWater = async (amountToAdd) => {
        if (!user) return;
        const newAmount = Math.max(0, waterIntake + amountToAdd);
        setWaterIntake(newAmount);
        calculateXp(habits, newAmount);

        const today = new Date().toISOString().split('T')[0];

        await supabase.from('water_logs').upsert({
            user_id: user.id,
            date: today,
            amount_ml: newAmount,
            daily_goal_ml: waterGoal
        }, { onConflict: 'user_id, date' });
    };

    const handleUpdateWaterGoal = async (newGoal) => {
        if (!user || newGoal <= 0) return;
        setWaterGoal(newGoal);

        // Update Profile
        await supabase.from('profiles').update({ daily_water_goal: newGoal }).eq('id', user.id);

        // Update Log
        const today = new Date().toISOString().split('T')[0];
        await supabase.from('water_logs').upsert({
            user_id: user.id,
            date: today,
            amount_ml: waterIntake,
            daily_goal_ml: newGoal
        }, { onConflict: 'user_id, date' });
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
        const dateStr = format(date, 'yyyy-MM-dd');
        setSelectedTask({
            due_date: dateStr,
            start_at: new Date(date).toISOString()
        });
        setIsSheetOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Minha Rotina</h2>
                    <p className="text-muted-foreground capitalize">
                        {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-lg self-start md:self-auto">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Input + Tasks (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Add Input */}
                        <div className="glass-card p-4 rounded-xl shadow-sm border border-border">
                            <form onSubmit={handleQuickAdd} className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Adicionar nova tarefa ou hábito..."
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                        className="bg-transparent border-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                                    />
                                </div>
                                <div className="flex items-center gap-4 border-l border-border pl-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="isHabit"
                                            checked={isHabit}
                                            onCheckedChange={setIsHabit}
                                        />
                                        <label htmlFor="isHabit" className="text-sm cursor-pointer select-none font-medium">Hábito</label>
                                    </div>
                                    <Button type="button" onClick={handleQuickAdd} disabled={!newTask} size="sm" className="gradient-primary">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Adicionar
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Task List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                                    <ListTodo className="w-5 h-5 text-primary" />
                                    Tarefas de Hoje
                                </h3>
                                <Button size="sm" variant="ghost" className="text-xs" onClick={openNewTaskSheet}>
                                    + Detalhado
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {/* Tasks filtered by date <= today */}
                                {tasks.filter(t => {
                                    if (t.completed) return false;
                                    if (!t.start_at) return true;
                                    const taskDate = new Date(t.start_at).toISOString().split('T')[0];
                                    const today = new Date().toISOString().split('T')[0];
                                    return taskDate <= today;
                                }).length === 0 && (
                                        <p className="text-sm text-muted-foreground italic text-center py-8">
                                            Tudo limpo por hoje! Aproveite seu tempo.
                                        </p>
                                    )}

                                {tasks.filter(t => {
                                    if (!t.start_at) return true;
                                    const taskDate = new Date(t.start_at).toISOString().split('T')[0];
                                    const today = new Date().toISOString().split('T')[0];
                                    return taskDate <= today;
                                })
                                    .sort((a, b) => {
                                        // 1. Incomplete first
                                        if (a.completed !== b.completed) return a.completed ? 1 : -1;

                                        // 2. High priority first (for incomplete)
                                        const pScore = { 'high': 3, 'medium': 2, 'low': 1, null: 1 };
                                        if (!a.completed && pScore[a.priority] !== pScore[b.priority]) {
                                            return pScore[b.priority] - pScore[a.priority];
                                        }

                                        // 3. Time
                                        return new Date(a.start_at) - new Date(b.start_at);
                                    })
                                    .map(task => (
                                        <div
                                            key={task.id}
                                            onClick={() => openEditTaskSheet(task)}
                                            className={cn(
                                                "cursor-pointer p-4 bg-card border rounded-xl flex items-center justify-between group hover:shadow-md transition-all",
                                                task.completed ? "opacity-60 bg-secondary/10 border-transparent" : "border-border hover:bg-secondary/20",
                                                // Priority Borders for incomplete tasks
                                                !task.completed && task.priority === 'high' && "border-l-4 border-l-red-500",
                                                !task.completed && task.priority === 'medium' && "border-l-4 border-l-yellow-500",
                                                !task.completed && task.priority === 'low' && "border-l-4 border-l-green-500"
                                            )}
                                        >
                                            <div className="flex items-center gap-4 w-full">
                                                <Checkbox
                                                    checked={task.completed}
                                                    onCheckedChange={() => toggleCompletion(task)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-5 h-5 flex-shrink-0"
                                                />
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "font-medium truncate",
                                                            task.completed ? "text-muted-foreground line-through" : "text-foreground"
                                                        )}>
                                                            {task.title}
                                                        </span>
                                                        {!task.completed && task.priority === 'high' && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-medium uppercase tracking-wider">
                                                                Alta
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Subtasks progress indicator */}
                                                    {task.subtasks && task.subtasks.length > 0 && (
                                                        <div className="w-full mt-1.5 space-y-1">
                                                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                                                <span>Subtarefas</span>
                                                                <span>{Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary transition-all duration-300"
                                                                    style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {task.start_at && (
                                                        <span className={cn(
                                                            "text-xs flex items-center gap-1 mt-1",
                                                            new Date(task.start_at) < new Date().setHours(0, 0, 0, 0) ? "text-red-400" : "text-muted-foreground"
                                                        )}>
                                                            <CalendarIcon className="w-3 h-3" />
                                                            {format(new Date(task.start_at), "dd/MM 'às' HH:mm")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Gamification & Habits (1/3 width) */}
                    <div className="space-y-6">
                        <GamificationCard xp={xp} level={level} nextLevelXp={level * 100} />

                        <WaterTracker
                            current={waterIntake}
                            goal={waterGoal}
                            onAdd={handleUpdateWater}
                            onUpdateGoal={handleUpdateWaterGoal}
                        />

                        <HabitStats habits={habits} />

                        <HabitList
                            habits={habits}
                            onToggle={toggleCompletion}
                            onEdit={openEditTaskSheet}
                        />
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
