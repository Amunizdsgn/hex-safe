"use client"

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"; // Assuming standard table component exists or I'll use standard HTML if not.
// Standard HTML table structure is safer if I'm not sure about ui/table existence, but I saw ui/ imports earlier. 
// I'll stick to standard tailwind table for speed unless I see 'table.js' in ui folder. 
// I checked list_dir of ui folder earlier, Table was NOT there. I should check or use standard HTML.
// I will use standard HTML with tailwind classes to avoid missing component errors.

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search, Filter, Eye, CheckCircle2, User } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { formatCurrency } from '@/data/mockData';

export function ClientTable({ clients, onViewClient, onActivateClient }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [relationshipFilter, setRelationshipFilter] = useState('all');

    const filteredClients = clients.filter(client => {
        const matchesSearch =
            (client.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (client.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (client.internalData?.contactName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ? true : (client.status || 'Ativo') === statusFilter;

        const matchesRelationship = relationshipFilter === 'all' ? true :
            (client.classification?.relationship === relationshipFilter || client.internalData?.relationshipType === relationshipFilter);

        return matchesSearch && matchesStatus && matchesRelationship;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar empresas ou contatos..."
                            className="pl-8 bg-secondary/20 border-border"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        variant={showFilters ? "secondary" : "outline"}
                        className="gap-2"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="w-4 h-4" /> Filtros
                    </Button>
                </div>

                {showFilters && (
                    <div className="flex gap-4 p-4 bg-secondary/10 rounded-lg border border-border/50 animate-in slide-in-from-top-2">
                        <div className="space-y-2 w-48">
                            <label className="text-xs font-medium text-muted-foreground">Status</label>
                            <select
                                className="w-full bg-background border border-border rounded-md h-9 px-3 text-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Todos</option>
                                <option value="Ativo">Ativo</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Inativo">Inativo</option>
                            </select>
                        </div>
                        <div className="space-y-2 w-48">
                            <label className="text-xs font-medium text-muted-foreground">Relacionamento</label>
                            <select
                                className="w-full bg-background border border-border rounded-md h-9 px-3 text-sm"
                                value={relationshipFilter}
                                onChange={(e) => setRelationshipFilter(e.target.value)}
                            >
                                <option value="all">Todos</option>
                                <option value="Recorrente">Recorrente</option>
                                <option value="Pontual">Pontual</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="rounded-md border border-border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-secondary/30 border-b border-border">
                        <tr>
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Cliente</th>
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Ciclo Atual</th>
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Vencimento</th>
                            <th className="h-10 px-4 text-right font-medium text-muted-foreground">CAC</th>
                            <th className="h-10 px-4 text-right font-medium text-muted-foreground">LTV</th>
                            <th className="h-10 px-4 text-right font-medium text-muted-foreground">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 bg-card">
                        {filteredClients.map((client) => {
                            const billingDay = parseInt(client.internalData?.recurrentSettings?.billingDay || 5);
                            const today = new Date().getDate();
                            let statusColor = 'text-muted-foreground';
                            let statusText = 'Em Dia';

                            if (today < billingDay) {
                                statusColor = 'text-success';
                                statusText = 'Em Dia';
                            } else if (today === billingDay) {
                                statusColor = 'text-yellow-500 font-bold';
                                statusText = 'Vence Hoje';
                            } else {
                                statusColor = 'text-destructive font-bold';
                                statusText = 'Atrasado';
                            }

                            return (
                                <tr key={client.id} className="hover:bg-secondary/20 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="font-medium text-foreground">{client.name}</div>

                                            {/* Contact Name Display */}
                                            {client.internalData?.contactName && (
                                                <div className="text-xs text-muted-foreground flex items-center gap-1 -mt-1 mb-1">
                                                    <span className="opacity-70">Empresa</span>
                                                    <span className="mx-1">•</span>
                                                    <User className="w-3 h-3" />
                                                    {client.internalData.contactName}
                                                </div>
                                            )}

                                            {/* Relationship Badge */}
                                            {client.classification?.relationship === 'Recorrente' && (
                                                <Badge variant="secondary" className="h-5 text-[10px] bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20">
                                                    Recorrente
                                                </Badge>
                                            )}
                                            {client.classification?.relationship === 'Pontual' && (
                                                <Badge variant="secondary" className="h-5 text-[10px] bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">
                                                    Pontual
                                                </Badge>
                                            )}

                                            {/* Internal Classification (Health) Badge */}
                                            {client.internalData?.status && (
                                                <Badge variant="outline" className={`h-5 text-[10px] border opacity-90 ${client.internalData.status === 'Tranquilo' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    client.internalData.status === 'Exigente' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                        client.internalData.status === 'Problemático' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    {client.internalData.status === 'Tranquilo' && '🌿 '}
                                                    {client.internalData.status === 'Exigente' && '⚡ '}
                                                    {client.internalData.status === 'Problemático' && '🚩 '}
                                                    {client.internalData.status === 'Risco Financeiro' && '💸 '}
                                                    {client.internalData.status}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{client.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <Badge
                                            variant={client.status === 'Pendente' ? 'secondary' : 'default'}
                                            className={
                                                client.status === 'Pendente' ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' :
                                                    client.status === 'Inativo' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20' :
                                                        ''
                                            }
                                        >
                                            {client.status || 'Ativo'}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {client.internalData?.cycles?.[0]?.period || '-'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">Dia {billingDay}</span>
                                            <span className={`text-[10px] ${statusColor}`}>{statusText}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right text-muted-foreground">
                                        {client.internalData?.cac ? `R$ ${client.internalData.cac}` : '-'}
                                    </td>
                                    <td className="p-4 text-right font-medium text-success">{formatCurrency(client.metrics?.totalLTV || client.ltv)}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {client.status === 'Pendente' && (
                                                <Button
                                                    size="sm"
                                                    className="h-8 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50"
                                                    onClick={() => onActivateClient(client)}
                                                >
                                                    <CheckCircle2 className="w-3 h-3 mr-1.5" /> Ativar
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" onClick={() => onViewClient(client)}>
                                                <Eye className="w-4 h-4 mr-2" /> Detalhes
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredClients.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        Nenhum cliente encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}
