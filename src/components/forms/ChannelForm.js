"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SheetFooter } from '@/components/ui/sheet';
import { Loader2 } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';

export function ChannelForm({ onSuccess, initialChannel }) {
    const { addChannel, updateChannel } = useFinancialContext();
    const [loading, setLoading] = useState(false);

    const isEditing = !!initialChannel;

    const [formData, setFormData] = useState({
        name: initialChannel?.name || '',
        color: initialChannel?.color || '#6B7280',
        active: initialChannel?.active !== false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return;

        setLoading(true);

        try {
            if (isEditing) {
                updateChannel(initialChannel.id, formData);
            } else {
                addChannel(formData);
            }

            if (!isEditing) {
                setFormData({
                    name: '',
                    color: '#6B7280',
                    active: true
                });
            }

            if (onSuccess) onSuccess();
            setLoading(false);
        } catch (error) {
            console.error('Error saving channel:', error);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome do Canal</Label>
                <Input
                    id="name"
                    placeholder="Ex: Instagram, Google Ads..."
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <div className="flex gap-2">
                    <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-20 h-10"
                    />
                    <Input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        placeholder="#6B7280"
                        className="flex-1"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="w-4 h-4 rounded border-border"
                />
                <Label htmlFor="active" className="cursor-pointer">Canal ativo</Label>
            </div>

            <SheetFooter className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Atualizar' : 'Criar'} Canal
                </Button>
            </SheetFooter>
        </form>
    );
}
