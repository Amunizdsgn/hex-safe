"use client"

import { useState } from 'react';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PlusCircle, TrendingUp, Users, DollarSign, Edit, Trash2, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/data/mockData';
import { ChannelForm } from '@/components/forms/ChannelForm';
import { cn } from '@/lib/utils';

export default function ChannelsPage() {
    const { channels, clients, transactions, removeChannel, deals } = useFinancialContext();
    const [channelToDelete, setChannelToDelete] = useState(null);

    // Calculate metrics for each channel
    const getChannelMetrics = (channelId) => {
        const channelClients = clients.filter(c => c.acquisitionChannel === channelId);
        const clientCount = channelClients.length;

        // Conversion Rate Logic (Win Rate)
        // Find deals associated with this channel
        // Filter valid stages: 'Fechado' (Won) or 'Perdido' (Lost)
        const channelDeals = deals.filter(d =>
            d.channelId === channelId ||
            d.total_value && d.origin === channels.find(c => c.id === channelId)?.name // Legacy check
        );

        const wonDeals = channelDeals.filter(d => d.stage === 'Fechado').length;
        // Total of deals/leads from this channel (People Approached)
        const totalLeads = channelDeals.length;

        // Conversion Rate: Won / Total Leads
        const conversionRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;


        // Calculate revenue from two sources:
        // 1. Transactions linked to clients from this channel (ONLY completed/paid)
        // 2. Initial Contract Value if specified in internalData

        const transactionsRevenue = transactions
            .filter(t =>
                t.type === 'income' &&
                t.clientId &&
                t.status === 'completed' && // Only count completed/paid transactions
                channelClients.some(c => c.id === t.clientId)
            )
            .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);

        const contractsRevenue = channelClients.reduce((sum, client) => {
            // Check if client has a defined initial contract value that should be counted
            const contractValue = Number(client.internalData?.contract?.value) || 0;

            // Only count if it's considered "closed/paid" - relying on the user's workflow
            // User said: "só jogue o valor depois preencher o valor inicial do contrato pra contabilizar como pago"
            // So we take the value if it exists and is > 0.
            return sum + contractValue;
        }, 0);

        const revenue = transactionsRevenue + contractsRevenue;
        const avgTicket = clientCount > 0 ? revenue / clientCount : 0;

        return { clientCount, revenue, avgTicket, conversionRate, totalLeads, wonDeals };
    };

    // Overall metrics
    const totalChannels = channels.filter(ch => ch.active).length;
    const channelsWithMetrics = channels.map(ch => ({
        ...ch,
        ...getChannelMetrics(ch.id)
    }));

    const topChannel = channelsWithMetrics.reduce((top, ch) =>
        ch.clientCount > (top?.clientCount || 0) ? ch : top
        , null);

    const totalRevenue = channelsWithMetrics.reduce((sum, ch) => sum + ch.revenue, 0);

    const confirmDeleteChannel = () => {
        const success = removeChannel(channelToDelete);
        if (!success) {
            alert('Não é possível remover um canal com clientes vinculados');
        }
        setChannelToDelete(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Canais de Aquisição</h2>
                    <p className="text-muted-foreground">Rastreie de onde seus clientes vêm</p>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="gradient-primary" size="sm">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Novo Canal
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md">
                        <SheetHeader className="mb-6">
                            <SheetTitle>Novo Canal de Aquisição</SheetTitle>
                            <SheetDescription>Adicione um canal personalizado para rastrear clientes</SheetDescription>
                        </SheetHeader>
                        <ChannelForm />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-lg bg-primary/10">
                            <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Canais Ativos</p>
                            <p className="text-2xl font-bold text-foreground">{totalChannels}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-lg bg-success/10">
                            <Users className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Canal Top</p>
                            <p className="text-lg font-bold text-foreground truncate">
                                {topChannel?.name || 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {topChannel?.clientCount || 0} clientes
                            </p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-lg bg-accent/10">
                            <DollarSign className="w-5 h-5 text-highlight" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Receita Total</p>
                            <p className="text-2xl font-bold text-success">{formatCurrency(totalRevenue)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Channels Table */}
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary/30">
                            <tr className="border-b border-border/50">
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Canal</th>
                                <th className="text-center px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Abordagens</th>
                                <th className="text-center px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Vendas</th>
                                <th className="text-center px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Taxa Conv.</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Receita Total</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Ticket Médio</th>
                                <th className="text-center px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Status</th>
                                <th className="text-center px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {channelsWithMetrics.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-muted-foreground">
                                        Nenhum canal cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                channelsWithMetrics.map((channel) => (
                                    <tr key={channel.id} className="hover:bg-secondary/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: channel.color }}
                                                />
                                                <span className="font-medium text-foreground">{channel.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-foreground font-medium">{channel.totalLeads}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-success font-medium">{channel.wonDeals}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className={cn(
                                                    "font-medium",
                                                    channel.conversionRate >= 30 ? "text-success" :
                                                        channel.conversionRate >= 10 ? "text-warning" : "text-muted-foreground"
                                                )}>
                                                    {channel.conversionRate.toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-success font-semibold">{formatCurrency(channel.revenue)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-muted-foreground">{formatCurrency(channel.avgTicket)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                'px-2 py-1 rounded-full text-xs font-medium',
                                                channel.active
                                                    ? 'bg-success/20 text-success'
                                                    : 'bg-muted/20 text-muted-foreground'
                                            )}>
                                                {channel.active ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Sheet>
                                                    <SheetTrigger asChild>
                                                        <button
                                                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                                            title="Editar canal"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </SheetTrigger>
                                                    <SheetContent className="w-full sm:max-w-md">
                                                        <SheetHeader className="mb-6">
                                                            <SheetTitle>Editar Canal</SheetTitle>
                                                            <SheetDescription>Atualize as informações do canal</SheetDescription>
                                                        </SheetHeader>
                                                        <ChannelForm initialChannel={channel} />
                                                    </SheetContent>
                                                </Sheet>
                                                <button
                                                    onClick={() => setChannelToDelete(channel.id)}
                                                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                                    title="Excluir canal"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={!!channelToDelete} onOpenChange={(open) => !open && setChannelToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Canal</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este canal? Esta ação não pode ser desfeita.
                            {channelsWithMetrics.find(ch => ch.id === channelToDelete)?.clientCount > 0 && (
                                <span className="block mt-2 text-destructive font-medium">
                                    Este canal possui clientes vinculados e não pode ser removido.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteChannel}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={channelsWithMetrics.find(ch => ch.id === channelToDelete)?.clientCount > 0}
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
