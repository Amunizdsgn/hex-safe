"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SheetFooter } from '@/components/ui/sheet';
import { Loader2 } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';

export function CreditCardForm({ onSuccess, initialCard }) {
    const { context, addCreditCard, updateCreditCard } = useFinancialContext();
    const [loading, setLoading] = useState(false);

    const isEditing = !!initialCard;

    const [formData, setFormData] = useState({
        nome: initialCard?.nome || '',
        bandeira: initialCard?.bandeira || 'Mastercard',
        banco: initialCard?.banco || '',
        limite: initialCard?.limite?.toString() || '',
        faturaAtual: initialCard?.faturaAtual?.toString() || '0',
        vencimento: initialCard?.vencimento?.toString() || '10',
        origem: initialCard?.origem || (context === 'consolidado' ? 'empresa' : context),
        cor: initialCard?.cor || '#8A05BE'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nome || !formData.banco || !formData.limite) return;

        setLoading(true);

        try {
            const cardData = {
                nome: formData.nome,
                bandeira: formData.bandeira,
                banco: formData.banco,
                limite: parseFloat(formData.limite),
                faturaAtual: parseFloat(formData.faturaAtual),
                vencimento: parseInt(formData.vencimento),
                origem: formData.origem,
                cor: formData.cor
            };

            if (isEditing) {
                updateCreditCard(initialCard.id, cardData);
            } else {
                addCreditCard(cardData);
            }

            if (onSuccess) {
                onSuccess();
            }

            if (!isEditing) {
                setFormData({
                    nome: '',
                    bandeira: 'Mastercard',
                    banco: '',
                    limite: '',
                    faturaAtual: '0',
                    vencimento: '10',
                    origem: context === 'consolidado' ? 'empresa' : context,
                    cor: '#8A05BE'
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('Error submitting credit card:', error);
            setLoading(false);
        }
    };

    const cardColors = [
        { value: '#8A05BE', label: 'Roxo (Nubank)' },
        { value: '#EC7000', label: 'Laranja (Itaú)' },
        { value: '#000000', label: 'Preto (C6)' },
        { value: '#0066CC', label: 'Azul' },
        { value: '#00AA13', label: 'Verde' },
        { value: '#FF0000', label: 'Vermelho' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="nome">Nome do Cartão</Label>
                <Input
                    id="nome"
                    placeholder="Ex: Nubank Ultravioleta"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="bandeira">Bandeira</Label>
                    <Select
                        value={formData.bandeira}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, bandeira: val }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Mastercard">Mastercard</SelectItem>
                            <SelectItem value="Visa">Visa</SelectItem>
                            <SelectItem value="Elo">Elo</SelectItem>
                            <SelectItem value="American Express">American Express</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="banco">Banco</Label>
                    <Input
                        id="banco"
                        placeholder="Ex: Nubank"
                        value={formData.banco}
                        onChange={(e) => setFormData(prev => ({ ...prev, banco: e.target.value }))}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="limite">Limite Total (R$)</Label>
                    <Input
                        id="limite"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.limite}
                        onChange={(e) => setFormData(prev => ({ ...prev, limite: e.target.value }))}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="faturaAtual">Fatura Atual (R$)</Label>
                    <Input
                        id="faturaAtual"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.faturaAtual}
                        onChange={(e) => setFormData(prev => ({ ...prev, faturaAtual: e.target.value }))}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="vencimento">Dia do Vencimento</Label>
                    <Input
                        id="vencimento"
                        type="number"
                        min="1"
                        max="31"
                        placeholder="10"
                        value={formData.vencimento}
                        onChange={(e) => setFormData(prev => ({ ...prev, vencimento: e.target.value }))}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="origem">Tipo</Label>
                    <Select
                        value={formData.origem}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, origem: val }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="empresa">Empresa</SelectItem>
                            <SelectItem value="pessoal">Pessoal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="cor">Cor do Cartão</Label>
                <Select
                    value={formData.cor}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, cor: val }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione a cor" />
                    </SelectTrigger>
                    <SelectContent>
                        {cardColors.map(color => (
                            <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full border border-border"
                                        style={{ backgroundColor: color.value }}
                                    />
                                    {color.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <SheetFooter className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Atualizar' : 'Adicionar'} Cartão
                </Button>
            </SheetFooter>
        </form>
    );
}
