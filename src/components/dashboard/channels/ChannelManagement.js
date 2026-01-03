"use client"

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ChannelManagement({
    channel,
    onUpdateChannel,
    onDeleteChannel,
    onCreateChannel,
    trigger
}) {
    const [isOpen, setIsOpen] = useState(false);

    // If a channel is passed, we are in Edit Mode.
    const isEditMode = !!channel;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            id: isEditMode ? channel.id : Date.now(),
            canal: formData.get('name'),
            type: formData.get('type'),
            status: formData.get('status'),
            description: formData.get('description'),
            // Preserve existing metrics or default to 0 for new
            receita: isEditMode ? channel.receita : 0,
            custo: isEditMode ? channel.custo : 0,
            roi: isEditMode ? channel.roi : 0,
            crescimento: isEditMode ? channel.crescimento : 0,
            tags: isEditMode ? channel.tags : [],
            // New metrics defaults
            cac: isEditMode ? channel.cac : 0,
            ltv: isEditMode ? channel.ltv : 0,
            conversionRate: isEditMode ? channel.conversionRate : 0,
        };

        if (isEditMode) {
            onUpdateChannel(data);
        } else {
            onCreateChannel(data);
        }
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" /> Novo Canal
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card border-border/50 text-foreground">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Editar Canal' : 'Criar Novo Canal'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Canal</Label>
                        <Input id="name" name="name" defaultValue={channel?.canal} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo</Label>
                            <Select name="type" defaultValue={channel?.type || 'Pago'}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pago">Pago</SelectItem>
                                    <SelectItem value="Orgânico">Orgânico</SelectItem>
                                    <SelectItem value="Indicação">Indicação</SelectItem>
                                    <SelectItem value="Parceria">Parceria</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue={channel?.status || 'Ativo'}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Ativo">Ativo</SelectItem>
                                    <SelectItem value="Pausado">Pausado</SelectItem>
                                    <SelectItem value="Em Teste">Em Teste</SelectItem>
                                    <SelectItem value="Escalado">Escalado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea id="description" name="description" defaultValue={channel?.description} className="resize-none" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        {isEditMode && (
                            <Button type="button" variant="destructive" size="icon" onClick={() => { onDeleteChannel(channel.id); setIsOpen(false); }}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                        <Button type="submit">{isEditMode ? 'Salvar Alterações' : 'Criar Canal'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
