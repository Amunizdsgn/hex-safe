"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Plus,
    Copy,
    Trash2,
    Search,
    Loader2,
    X,
    Check,
    Pencil,
    FileCode,
    Calendar,
    Code2,
    Layers,
    Eye
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner';

export function CodeLibrary() {
    const { user } = useFinancialContext();
    const supabase = createClient();
    const [snippets, setSnippets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Form State
    const [newSnippet, setNewSnippet] = useState({
        title: '',
        description: '',
        blocks: [
            { id: '1', name: 'script.js', language: 'javascript', code: '' }
        ]
    });
    const [activeTab, setActiveTab] = useState('1');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSnippets();
    }, [user]);

    const fetchSnippets = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('code_snippets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Erro ao carregar snippets');
        } else {
            const processed = (data || []).map(s => {
                try {
                    const parsed = JSON.parse(s.code);
                    if (Array.isArray(parsed)) {
                        return { ...s, blocks: parsed, isMulti: true };
                    }
                    throw new Error('Not array');
                } catch (e) {
                    return {
                        ...s,
                        blocks: [{ id: '1', name: 'main', language: s.language, code: s.code }],
                        isMulti: false
                    };
                }
            });
            setSnippets(processed);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!newSnippet.title || newSnippet.blocks.some(b => !b.code)) {
            toast.error('Preencha campos obrigatórios');
            return;
        }
        setSaving(true);

        const payload = {
            user_id: user.id,
            title: newSnippet.title,
            description: newSnippet.description,
            language: newSnippet.blocks[0].language, // Primary language
            code: JSON.stringify(newSnippet.blocks),
            tags: newSnippet.blocks.map(b => b.language)
        };

        let error;
        let data;

        if (editingId) {
            // Update existing
            const response = await supabase
                .from('code_snippets')
                .update(payload)
                .eq('id', editingId)
                .select()
                .single();
            error = response.error;
            data = response.data;
        } else {
            // Create new
            const response = await supabase
                .from('code_snippets')
                .insert([payload])
                .select()
                .single();
            error = response.error;
            data = response.data;
        }

        if (error) {
            toast.error('Erro ao salvar');
        } else {
            const processedNew = {
                ...data,
                blocks: newSnippet.blocks,
                isMulti: true
            };

            if (editingId) {
                setSnippets(snippets.map(s => s.id === editingId ? processedNew : s));
                toast.success('Snippet atualizado!');
            } else {
                setSnippets([processedNew, ...snippets]);
                toast.success('Snippet criado!');
            }

            setIsDialogOpen(false);
            resetForm();
        }
        setSaving(false);
    };

    const resetForm = () => {
        setNewSnippet({
            title: '',
            description: '',
            blocks: [{ id: '1', name: 'script.js', language: 'javascript', code: '' }]
        });
        setActiveTab('1');
        setEditingId(null);
    };

    const handleEdit = (snippet) => {
        setNewSnippet({
            title: snippet.title,
            description: snippet.description || '',
            blocks: snippet.blocks
        });
        setEditingId(snippet.id);
        if (snippet.blocks.length > 0) {
            setActiveTab(snippet.blocks[0].id);
        }
        setIsDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Deseja excluir este snippet?')) return;
        const { error } = await supabase.from('code_snippets').delete().eq('id', id);
        if (error) toast.error('Erro ao excluir');
        else {
            setSnippets(snippets.filter(s => s.id !== id));
            toast.success('Snippet excluído');
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Copiado!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Block logic
    const addBlock = () => {
        const newId = String(Date.now());
        setNewSnippet(prev => ({
            ...prev,
            blocks: [...prev.blocks, { id: newId, name: 'style.css', language: 'css', code: '' }]
        }));
        setActiveTab(newId);
    };

    const removeBlock = (id) => {
        if (newSnippet.blocks.length === 1) return;
        setNewSnippet(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== id) }));
        if (activeTab === id) setActiveTab(newSnippet.blocks[0].id);
    };

    const updateBlock = (id, field, value) => {
        setNewSnippet(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => b.id === id ? { ...b, [field]: value } : b)
        }));
    };

    const [viewSnippet, setViewSnippet] = useState(null);

    const filteredSnippets = snippets.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Buscar na biblioteca..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full md:w-auto bg-primary hover:bg-primary/90" onClick={resetForm}>
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Snippet
                        </Button>
                    </DialogTrigger>
                    {/* ... DIALOG CONTENT (Same as before, simplified for this view) ... */}
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Editar Snippet' : 'Novo Snippet'}</DialogTitle>
                            <DialogDescription>Gerencie seus blocos de código.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Título</Label>
                                    <Input
                                        placeholder="Ex: Navbar Responsiva"
                                        value={newSnippet.title}
                                        onChange={(e) => setNewSnippet(prev => ({ ...prev, title: e.target.value }))}
                                        className="bg-zinc-900 border-zinc-700 focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descrição</Label>
                                    <Input
                                        placeholder="Breve resumo..."
                                        value={newSnippet.description}
                                        onChange={(e) => setNewSnippet(prev => ({ ...prev, description: e.target.value }))}
                                        className="bg-zinc-900 border-zinc-700 focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
                                <div className="flex items-center justify-between p-2 border-b border-zinc-800 bg-zinc-900">
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                        <div className="flex items-center justify-between w-full">
                                            <TabsList className="bg-transparent p-0 gap-1 h-auto">
                                                {newSnippet.blocks.map(block => (
                                                    <TabsTrigger
                                                        key={block.id}
                                                        value={block.id}
                                                        className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 px-3 py-1.5 h-auto text-xs rounded-md border border-transparent data-[state=active]:border-zinc-700/50"
                                                    >
                                                        {block.name}
                                                        {newSnippet.blocks.length > 1 && (
                                                            <X
                                                                className="w-3 h-3 ml-2 hover:text-red-400"
                                                                onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                                                            />
                                                        )}
                                                    </TabsTrigger>
                                                ))}
                                                <Button size="sm" variant="ghost" onClick={addBlock} className="h-7 w-7 p-0 ml-1 hover:bg-zinc-800 text-zinc-400">
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </TabsList>
                                        </div>
                                    </Tabs>
                                </div>

                                {newSnippet.blocks.map(block => (
                                    <div key={block.id} style={{ display: activeTab === block.id ? 'block' : 'none' }}>
                                        <div className="grid grid-cols-2 gap-2 p-2 bg-zinc-900/30 border-b border-zinc-800">
                                            <Input
                                                value={block.name}
                                                onChange={(e) => updateBlock(block.id, 'name', e.target.value)}
                                                className="h-8 text-xs bg-zinc-950 border-zinc-800"
                                                placeholder="Nome do arquivo"
                                            />
                                            <Select
                                                value={block.language}
                                                onValueChange={(val) => updateBlock(block.id, 'language', val)}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                                    <SelectItem value="css">CSS</SelectItem>
                                                    <SelectItem value="html">HTML</SelectItem>
                                                    <SelectItem value="sql">SQL</SelectItem>
                                                    <SelectItem value="json">JSON</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Textarea
                                            value={block.code}
                                            onChange={(e) => updateBlock(block.id, 'code', e.target.value)}
                                            className="min-h-[300px] font-mono text-sm bg-zinc-950 border-0 focus-visible:ring-0 resize-none p-4 rounded-none"
                                            placeholder="// Digite seu código aqui..."
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Salvar
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* View Snippet Dialog */}
                <Dialog open={!!viewSnippet} onOpenChange={(open) => !open && setViewSnippet(null)}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800">
                        {viewSnippet && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <FileCode className="w-5 h-5 text-primary" />
                                        {viewSnippet.title}
                                    </DialogTitle>
                                    <DialogDescription>{viewSnippet.description || 'Sem descrição'}</DialogDescription>
                                </DialogHeader>

                                <div className="mt-4 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
                                    <Tabs defaultValue={viewSnippet.blocks[0]?.id} className="w-full">
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
                                            <TabsList className="bg-transparent p-0 gap-4 h-auto">
                                                {viewSnippet.blocks.map(block => (
                                                    <TabsTrigger
                                                        key={block.id}
                                                        value={block.id}
                                                        className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 py-2 text-xs text-muted-foreground border-b-2 border-transparent transition-all"
                                                    >
                                                        {block.name}
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>
                                        </div>

                                        {viewSnippet.blocks.map(block => (
                                            <TabsContent key={block.id} value={block.id} className="m-0 relative group">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="absolute top-4 right-4 z-10 h-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white"
                                                    onClick={() => copyToClipboard(block.code, block.id)}
                                                >
                                                    {copiedId === block.id ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                                    Copiar
                                                </Button>
                                                <pre className="p-6 text-sm font-mono text-gray-300 overflow-x-auto min-h-[300px] max-h-[600px] leading-relaxed">
                                                    {block.code}
                                                </pre>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                </div>
                            </>
                        )}
                        <div className="flex justify-end mt-4">
                            <Button variant="outline" onClick={() => setViewSnippet(null)}>Fechar</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Content Grid - Style match: Services Page */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : filteredSnippets.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-xl">
                    <p className="text-muted-foreground">Nenhum snippet encontrado.</p>
                    <Button variant="link" onClick={resetForm}>Criar o primeiro</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSnippets.map((snippet) => (
                        <div key={snippet.id} className="glass-card rounded-xl p-6 hover:border-primary/50 transition-colors group relative overflow-hidden flex flex-col h-full">

                            {/* Hover Actions (Top Right) */}
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-secondary rounded-lg"
                                    onClick={() => handleEdit(snippet)}
                                >
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-lg"
                                    onClick={() => handleDelete(snippet.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                    <FileCode className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold truncate pr-10">{snippet.title}</h3>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-secondary/30 p-3 rounded-lg">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                        <Layers className="w-3 h-3" /> Arquivos
                                    </p>
                                    <p className="text-sm font-bold">{snippet.blocks.length}</p>
                                </div>
                                <div className="bg-secondary/30 p-3 rounded-lg">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                        <Code2 className="w-3 h-3" /> Linguagem
                                    </p>
                                    <p className="text-sm font-bold uppercase truncate">
                                        {snippet.blocks[0]?.language || 'TXT'}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="flex-1 space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                    {snippet.description || 'Sem descrição.'}
                                </p>

                                {/* Code Preview (Checklist replacement) */}
                                <div className="pt-3 border-t border-border/50 mt-auto">
                                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(snippet.created_at).toLocaleDateString()}
                                    </p>
                                    <div className="bg-black/40 rounded-md p-3 font-mono text-[10px] text-gray-400 overflow-hidden relative cursor-pointer hover:bg-black/60 transition-colors" onClick={() => setViewSnippet(snippet)}>
                                        <div className="opacity-70">
                                            {snippet.blocks[0]?.code.split('\n').slice(0, 3).map((line, i) => (
                                                <div key={i} className="truncate">{line || ' '}</div>
                                            ))}
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/40 to-transparent" />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions - Split Buttons */}
                            <div className="mt-auto pt-4 border-t border-border/50 grid grid-cols-2 gap-3">
                                <Button
                                    className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                                    size="sm"
                                    onClick={() => setViewSnippet(snippet)}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver Código
                                </Button>
                                <Button
                                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                                    size="sm"
                                    onClick={() => copyToClipboard(snippet.blocks[0]?.code, snippet.id)}
                                >
                                    {copiedId === snippet.id ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Copiado
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copiar
                                        </>
                                    )}
                                </Button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
