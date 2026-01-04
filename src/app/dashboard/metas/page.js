"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MetasPage() {
    const { user, context } = useFinancialContext();
    const supabase = createClient();

    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [newPersonalGoal, setNewPersonalGoal] = useState('');
    const [newBusinessGoal, setNewBusinessGoal] = useState('');

    const fetchGoals = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching goals:', error);
            setErrorMsg(error.message);
            if (error.code === '42P01') { // undefined_table
                setErrorMsg("Tabela 'goals' não encontrada. Execute o script SQL.");
            }
        } else {
            setGoals(data || []);
            setErrorMsg(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchGoals();
    }, [user]);

    const handleAddGoal = async (contextType, title, setTitle) => {
        if (!title.trim() || !user) return;

        const newGoal = {
            user_id: user.id,
            title: title.trim(),
            context: contextType,
            is_completed: false,
            year: 2026
        };

        // Optimistic
        const tempId = Math.random().toString();
        setGoals([...goals, { ...newGoal, id: tempId }]);
        setTitle('');

        const { data, error } = await supabase.from('goals').insert(newGoal).select().single();

        if (error) {
            console.error('Error adding goal:', error);
            fetchGoals(); // Revert
        } else {
            setGoals(prev => prev.map(g => g.id === tempId ? data : g));
        }
    };

    const toggleGoal = async (goal) => {
        const newStatus = !goal.is_completed;

        // Optimistic
        setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, is_completed: newStatus } : g));

        const { error } = await supabase.from('goals').update({ is_completed: newStatus }).eq('id', goal.id);
        if (error) {
            console.error('Error updating goal:', error);
            fetchGoals();
        }
    };

    const deleteGoal = async (id) => {
        setGoals(prev => prev.filter(g => g.id !== id));
        await supabase.from('goals').delete().eq('id', id);
    };

    const GoalList = ({ title, type, items, newItem, setNewItem }) => (
        <div className="glass-card p-6 rounded-xl flex flex-col h-full animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold mb-4 text-foreground/80">{title}</h2>

            <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                {items.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Nenhuma meta definida.</p>
                )}
                {items.map(goal => (
                    <div
                        key={goal.id}
                        className="group flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                        <Checkbox
                            checked={goal.is_completed}
                            onCheckedChange={() => toggleGoal(goal)}
                            className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className={cn(
                            "text-sm flex-1 leading-relaxed transition-all",
                            goal.is_completed ? "text-muted-foreground line-through decoration-muted-foreground/50" : "text-foreground"
                        )}>
                            {goal.title}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                            onClick={() => deleteGoal(goal.id)}
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 pt-4 border-t border-border/50">
                <Input
                    placeholder="Adicionar meta..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddGoal(type, newItem, setNewItem)}
                    className="bg-background/50"
                />
                <Button
                    size="icon"
                    onClick={() => handleAddGoal(type, newItem, setNewItem)}
                    disabled={!newItem.trim()}
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );

    const showPersonal = context === 'consolidado' || context === 'pessoal';
    const showBusiness = context === 'consolidado' || context === 'empresa';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">Metas 2026</h1>
                <p className="text-muted-foreground">Defina e acompanhe seus objetivos de longo prazo.</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : errorMsg ? (
                <div className="p-6 border border-destructive/20 bg-destructive/10 rounded-xl text-destructive">
                    <h3 className="font-semibold mb-1">Erro ao carregar metas</h3>
                    <p>{errorMsg}</p>
                    <Button variant="outline" className="mt-4 border-destructive/30 hover:bg-destructive/20" onClick={fetchGoals}>
                        Tentar Novamente
                    </Button>
                </div>
            ) : (
                <div className={cn(
                    "grid gap-6",
                    (showPersonal && showBusiness) ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-2xl mx-auto"
                )}>
                    {showPersonal && (
                        <GoalList
                            title="CPF (Pessoal)"
                            type="pessoal"
                            items={goals.filter(g => g.context === 'pessoal')}
                            newItem={newPersonalGoal}
                            setNewItem={setNewPersonalGoal}
                        />
                    )}

                    {showBusiness && (
                        <GoalList
                            title="CNPJ (Empresa)"
                            type="empresa"
                            items={goals.filter(g => g.context === 'empresa')}
                            newItem={newBusinessGoal}
                            setNewItem={setNewBusinessGoal}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
