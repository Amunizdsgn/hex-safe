import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Save, X } from 'lucide-react';
import {
    Calendar,
    DollarSign,
    User,
    Mail,
    Phone,
    MessageSquare,
    Clock,
    Send
} from 'lucide-react';
import { formatCurrency } from '@/data/mockData';

export function DealDetail({ deal, isOpen, onClose, onAddComment, onUpdateDeal }) {
    const [newComment, setNewComment] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    // Initialize/Reset form data when deal changes or editing starts
    const startEditing = () => {
        setFormData({ ...deal });
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setFormData({});
    };

    const handleSave = () => {
        onUpdateDeal(formData);
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateDisplay = (dateString) => {
        if (!dateString) return 'Não definida';
        const parts = dateString.split('T')[0].split('-');
        if (parts.length === 3) {
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
            if (!isNaN(date.getTime())) return date.toLocaleDateString('pt-BR');
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data Inválida';
        return date.toLocaleDateString('pt-BR');
    };

    if (!deal) return null;

    const handleSendComment = () => {
        if (!newComment.trim()) return;
        onAddComment(deal.id, newComment);
        setNewComment('');
    };

    // Mock history if not present (simple fallback)
    const history = deal.history || [
        { id: 'h1', type: 'created', date: new Date(Date.now() - 86400000), text: 'Oportunidade criada' },
        { id: 'h2', type: 'stage', date: new Date(), text: `Movido para ${deal.stage}` }
    ];

    const comments = deal.comments || [];

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="overflow-y-auto sm:max-w-xl w-full data-[state=open]:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SheetHeader className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3">
                                <SheetTitle className={isEditing ? "sr-only" : "text-2xl font-bold"}>
                                    {deal.title}
                                </SheetTitle>
                                {isEditing && (
                                    <Input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="font-bold text-xl h-9"
                                    />
                                )}

                                {!isEditing && (
                                    <Badge variant="outline" className={`
                                    ${deal.priority === 'High' ? 'text-red-500 bg-red-500/10' :
                                            deal.priority === 'Medium' ? 'text-yellow-500 bg-yellow-500/10' :
                                                'text-blue-500 bg-blue-500/10'} border-transparent`
                                    }>
                                        {deal.priority}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            {isEditing ? (
                                <>
                                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" onClick={handleSave}>
                                        <Save className="w-4 h-4" />
                                    </Button>
                                </>
                            ) : (
                                <Button size="sm" variant="ghost" onClick={startEditing}>
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            )}
                        </div>
                    </div>
                    <SheetDescription asChild className="flex items-center gap-4 text-sm">
                        <div>
                            {isEditing ? (
                                <div className="flex gap-4 w-full mt-2">
                                    <div className="flex-1">
                                        <Label className="text-xs text-zinc-300">Valor (R$)</Label>
                                        <Input
                                            name="value"
                                            type="number"
                                            value={formData.value}
                                            onChange={handleChange}
                                            className="h-8 bg-zinc-900 border-zinc-700 text-white"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Label className="text-xs">Data Fechamento</Label>
                                        <Input
                                            name="closingDate"
                                            type="date"
                                            value={formData.closingDate ? formData.closingDate.split('T')[0] : ''}
                                            onChange={handleChange}
                                            className="h-8"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {formatCurrency(deal.value)}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Fechamento: {handleDateDisplay(deal.closingDate)}</span>
                                </>
                            )}
                        </div>
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Client / Contact Info */}
                    <div className="p-4 rounded-lg bg-secondary/10 border border-border/50 space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" /> Dados do Cliente
                        </h4>

                        {isEditing ? (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <Label className="text-xs">Nome do Contato</Label>
                                    <Input name="contactName" value={formData.contactName || ''} onChange={handleChange} className="h-8" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Canal de Origem</Label>
                                    <Select
                                        value={formData.origin || ''}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, origin: val }))}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Indicação">Indicação</SelectItem>
                                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                            <SelectItem value="Google Ads">Google Ads</SelectItem>
                                            <SelectItem value="Instagram">Instagram</SelectItem>
                                            <SelectItem value="Outro">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Telefone</Label>
                                    <Input name="contactPhone" value={formData.contactPhone || ''} onChange={handleChange} className="h-8" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Email</Label>
                                    <Input name="contactEmail" value={formData.contactEmail || ''} onChange={handleChange} className="h-8" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Instagram</Label>
                                    <Input name="instagram" value={formData.instagram || ''} onChange={handleChange} className="h-8" />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground">Nome do Contato</p>
                                    <p className="font-medium">{deal.contactName || deal.clientName || 'Não informado'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Canal de Origem</p>
                                    <p className="font-medium">{deal.origin || 'Não informado'}</p>
                                </div>
                                {deal.contactPhone && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Telefone</p>
                                        <div className="flex items-center gap-1">
                                            <Phone className="w-3 h-3 text-muted-foreground" />
                                            <span>{deal.contactPhone}</span>
                                        </div>
                                    </div>
                                )}
                                {deal.contactEmail && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-3 h-3 text-muted-foreground" />
                                            <span>{deal.contactEmail}</span>
                                        </div>
                                    </div>
                                )}
                                {deal.instagram && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Instagram</p>
                                        <p className="font-medium text-blue-400">{deal.instagram}</p>
                                    </div>
                                )}
                                {deal.firstContact && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Primeiro Contato</p>
                                        <p className="font-medium">{handleDateDisplay(deal.firstContact)}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {isEditing ? (
                            <div className="pt-2">
                                <Label className="text-xs">Notas / Descrição</Label>
                                <Textarea name="description" value={formData.description || ''} onChange={handleChange} className="mt-1" />
                            </div>
                        ) : (
                            deal.description && (
                                <div className="pt-2 border-t border-border/30 mt-2">
                                    <p className="text-xs text-muted-foreground mb-1">Notas / Descrição</p>
                                    <p className="text-sm text-foreground/80 leading-relaxed">{deal.description}</p>
                                </div>
                            )
                        )}
                    </div>

                    <Separator />

                    {/* Timeline & Comments */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-primary" /> Histórico & Comentários
                        </h4>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {/* Render History items mixed with comments could be complex, keeping separate or simple log */}
                            {[...history, ...comments].sort((a, b) => new Date(b.date) - new Date(a.date)).map((item, idx) => (
                                <div key={idx} className={`flex gap-3 text-sm ${item.type === 'comment' ? 'bg-muted/30 p-3 rounded-lg' : ''}`}>
                                    <div className="mt-0.5">
                                        {item.type === 'comment' ? (
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                                <User className="w-3 h-3 text-primary" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                                                <Clock className="w-3 h-3 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium text-foreground">
                                                {item.type === 'comment' ? 'Você' : 'Sistema'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(item.date).toLocaleString('pt-BR', {
                                                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground mt-0.5">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Comment Input */}
                        <div className="flex gap-2 items-end pt-2">
                            <Textarea
                                placeholder="Escreva uma observação..."
                                className="min-h-[80px]"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <Button size="icon" onClick={handleSendComment}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                </div>
            </SheetContent>
        </Sheet>
    );
}
