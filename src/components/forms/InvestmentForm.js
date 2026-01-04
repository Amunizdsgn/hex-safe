import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';

const investmentTypes = [
    { value: 'renda_fixa', label: 'Renda Fixa' },
    { value: 'renda_variavel', label: 'Renda Variável' },
    { value: 'fundo', label: 'Fundos' },
    { value: 'cripto', label: 'Cripto' },
    { value: 'outro', label: 'Outros' },
];

const liquidityOptions = [
    { value: 'imediata', label: 'Imediata (D+0/D+1)' },
    { value: 'curto_prazo', label: 'Curto Prazo (< 1 ano)' },
    { value: 'longo_prazo', label: 'Longo Prazo (> 1 ano)' },
];

export function InvestmentForm({ initialData, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        ativo: '',
        tipo: 'renda_fixa',
        valorAplicado: '',
        valorAtual: '',
        liquidez: 'curto_prazo',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ativo: initialData.ativo || '',
                tipo: initialData.tipo || 'renda_fixa',
                valorAplicado: initialData.valorAplicado || '',
                valorAtual: initialData.valorAtual || '',
                liquidez: initialData.liquidez || 'curto_prazo',
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            valorAplicado: Number(formData.valorAplicado),
            valorAtual: Number(formData.valorAtual),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="ativo">Nome do Ativo</Label>
                <Input
                    id="ativo"
                    placeholder="Ex: Tesouro Selic 2029"
                    value={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                        value={formData.tipo}
                        onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {investmentTypes.map((t) => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="liquidez">Liquidez</Label>
                    <Select
                        value={formData.liquidez}
                        onValueChange={(value) => setFormData({ ...formData, liquidez: value })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {liquidityOptions.map((l) => (
                                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="valorAplicado">Valor Aplicado</Label>
                    <Input
                        id="valorAplicado"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.valorAplicado}
                        onChange={(e) => setFormData({ ...formData, valorAplicado: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="valorAtual">Valor Atual</Label>
                    <Input
                        id="valorAtual"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.valorAtual}
                        onChange={(e) => setFormData({ ...formData, valorAtual: e.target.value })}
                        required
                    />
                </div>
            </div>

            <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" className="gradient-primary">
                    {initialData ? 'Salvar Alterações' : 'Adicionar Investimento'}
                </Button>
            </DialogFooter>
        </form>
    );
}
