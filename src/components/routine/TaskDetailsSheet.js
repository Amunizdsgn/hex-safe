"use client"

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';

export function TaskDetailsSheet({ isOpen, onClose, task, onSave, onDelete }) {
    const supabase = createClient();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(''); // YYYY-MM-DD
    const [time, setTime] = useState(''); // HH:MM
    const [isHabit, setIsHabit] = useState(false);
    const [reminder, setReminder] = useState(false);
    const [subtasks, setSubtasks] = useState([]); // Subtasks state

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setIsHabit(task.is_habit || false);
            setSubtasks(task.subtasks || []); // Load subtasks

            // Parse timestamps
            if (task.start_at) {
                const d = new Date(task.start_at);
                setDate(d.toISOString().split('T')[0]);
                setTime(d.toTimeString().slice(0, 5));
            } else if (task.due_date) {
                setDate(task.due_date);
                setTime('');
            } else {
                // Default to today
                setDate(new Date().toISOString().split('T')[0]);
                setTime('');
            }

            setReminder(!!task.reminder_minutes);
        } else {
            // New Task Defaults
            setTitle('');
            setDescription('');
            setIsHabit(false);
            setDate(new Date().toISOString().split('T')[0]);
            setTime('');
            setReminder(false);
            setSubtasks([]);
        }
    }, [task, isOpen]);

    const handleSave = () => {
        if (!title.trim()) return;

        let startAt = null;
        if (date) {
            if (time) {
                startAt = new Date(`${date}T${time}:00`).toISOString();
            } else {
                // If no time, store date at 00:00 or modify schema logic.
                // For simplicity, let's treat date-only as start_at 00:00 local or just use due_date
                // We will use start_at for everything to allow calendar mapping
                startAt = new Date(`${date}T12:00:00`).toISOString(); // Midday to avoid timezone shifting days easily
            }
        }

        const payload = {
            title,
            description,
            is_habit: isHabit,
            start_at: startAt,
            reminder_minutes: reminder ? 30 : null, // Default 30 min reminder
            subtasks: subtasks,
            // If editing existing
            ...(task?.id ? { id: task.id } : {})
        };

        onSave(payload);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-md bg-background/95 backdrop-blur-md border-l border-border">
                <SheetHeader className="mb-6">
                    <SheetTitle>{task?.id ? 'Editar Tarefa' : 'Nova Tarefa'}</SheetTitle>
                    <SheetDescription>
                        {task?.id ? 'Atualize os detalhes do seu compromisso.' : 'Agende um novo compromisso ou tarefa.'}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ex: Reunião com Cliente"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Data</Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="pl-9"
                                />
                                <CalendarIcon className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Horário (Opcional)</Label>
                            <div className="relative">
                                <Input
                                    type="time"
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    className="pl-9"
                                />
                                <Clock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/20">
                        <Label htmlFor="is_habit" className="cursor-pointer">É um Hábito Diário?</Label>
                        <Switch id="is_habit" checked={isHabit} onCheckedChange={setIsHabit} />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/20">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="reminder" className="cursor-pointer">Lembrete</Label>
                            <span className="text-xs text-muted-foreground">Avisar 30 min antes</span>
                        </div>
                        <Switch id="reminder" checked={reminder} onCheckedChange={setReminder} />
                    </div>

                    {/* Subtasks / Checklist */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Checklist (Sub-tarefas)</Label>
                            <span className="text-xs text-muted-foreground">
                                {subtasks.filter(s => s.completed).length}/{subtasks.length}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {subtasks.map((sub, index) => (
                                <div key={index} className="flex items-center gap-2 group animate-in slide-in-from-left-2 duration-300">
                                    <Switch
                                        checked={sub.completed}
                                        onCheckedChange={(checked) => {
                                            const newSub = [...subtasks];
                                            newSub[index].completed = checked;
                                            setSubtasks(newSub);
                                        }}
                                        className="scale-75"
                                    />
                                    <Input
                                        value={sub.title}
                                        onChange={(e) => {
                                            const newSub = [...subtasks];
                                            newSub[index].title = e.target.value;
                                            setSubtasks(newSub);
                                        }}
                                        className="h-8 text-sm bg-secondary/10 border-none focus-visible:ring-1"
                                        placeholder="Item da lista..."
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                            setSubtasks(subtasks.filter((_, i) => i !== index));
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs border-dashed text-muted-foreground hover:text-primary"
                                onClick={() => setSubtasks([...subtasks, { title: '', completed: false }])}
                            >
                                + Adicionar item
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Detalhes / Notas</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Adicione links, endereços ou observações..."
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                <SheetFooter className="mt-8 gap-2 sm:gap-0">
                    {task?.id && (
                        <Button
                            variant="destructive"
                            onClick={() => onDelete(task.id)}
                            className="mr-auto"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
