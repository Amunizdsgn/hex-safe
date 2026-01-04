"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SheetFooter } from '@/components/ui/sheet';
import { Loader2, DollarSign } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { formatCurrency } from '@/data/mockData';
import { toDateString } from '@/lib/dateUtils';

export function ServiceSaleForm({ service, onSuccess }) {
    const { context, clients, addLocalTransaction, accounts } = useFinancialContext();
    const [loading, setLoading] = useState(false);

    const today = toDateString();

    const [formData, setFormData] = useState({
        valor: service?.price || '',
        clientId: '',
        date: today,
        paymentMethod: 'pix',
        bankAccount: '',
        status: 'pago',
        description: service?.name || 'Serviço',
        observacoes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.valor) return;

        setLoading(true);

        try {
            const transaction = {
                type: 'income',
                category: 'Serviços',
                serviceId: service?.id,
                serviceName: service?.name,
                valor: parseFloat(formData.valor),
                clientId: formData.clientId === 'none' ? null : formData.clientId,
                date: formData.date,
                paymentMethod: formData.paymentMethod,
                bankAccount: formData.bankAccount === 'none' ? null : formData.bankAccount,
                status: formData.status,
                description: formData.description,
                observacoes: formData.observacoes,
                origem: context === 'consolidado' ? 'empresa' : context
            };

            console.log('Creating transaction:', transaction);

            const result = addLocalTransaction(transaction);

            console.log('Transaction created:', result);

            if (onSuccess) {
                onSuccess(transaction);
            }

            // Reset form
            setFormData({
                valor: service?.price || '',
                clientId: '',
                date: today,
                paymentMethod: 'pix',
                bankAccount: '',
                status: 'pago',
                description: service?.name || 'Serviço',
                observacoes: ''
            });

            setLoading(false);
        } catch (error) {
            console.error('Error creating sale transaction:', error);
            setLoading(false);
        }
    };

    // Filter for company bank accounts only
    const bankAccounts = accounts.filter(acc =>
        acc.tipo === 'banco' &&
        (acc.origem === 'empresa' || acc.origem === 'conta' || !acc.origem)
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Service Info */}
            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-success" />
                    <h4 className="font-semibold text-success">Registrar Venda</h4>
                </div>
                <p className="text-sm text-foreground font-medium">{service?.name}</p>
                {service?.description && (
                    <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                )}
            </div>

            {/* Value */}
            <div className="space-y-2">
                <Label htmlFor="valor">Valor da Venda (R$)</Label>
                <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                    required
                />
            </div>

            {/* Client */}
            <div className="space-y-2">
                <Label htmlFor="clientId">Cliente (Opcional)</Label>
                <Select
                    value={formData.clientId || 'none'}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, clientId: val === 'none' ? '' : val }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                                {client.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
                <Label htmlFor="date">Data da Venda</Label>
                <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                <Select
                    value={formData.paymentMethod}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, paymentMethod: val }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Bank Account */}
            {bankAccounts.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="bankAccount">Conta Bancária (Opcional)</Label>
                    <Select
                        value={formData.bankAccount || 'none'}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, bankAccount: val === 'none' ? '' : val }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma conta" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            {bankAccounts.map(acc => (
                                <SelectItem key={acc.id} value={acc.id}>
                                    {acc.nome} - {acc.banco}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Status */}
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Observations */}
            <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (Opcional)</Label>
                <Textarea
                    id="observacoes"
                    placeholder="Detalhes adicionais sobre a venda..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    rows={3}
                />
            </div>

            <SheetFooter className="pt-4">
                <Button type="submit" disabled={loading} className="w-full bg-success hover:bg-success/90">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrar Venda
                </Button>
            </SheetFooter>
        </form>
    );
}
