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
import { MoreHorizontal, Search, Filter, Eye } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { formatCurrency } from '@/data/mockData';

export function ClientTable({ clients, onViewClient }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar empresas..."
                        className="pl-8 bg-secondary/20 border-border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" /> Filtros
                </Button>
            </div>

            <div className="rounded-md border border-border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-secondary/30 border-b border-border">
                        <tr>
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Cliente</th>
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Relacionamento</th>
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Saúde</th>
                            <th className="h-10 px-4 text-right font-medium text-muted-foreground">Total Gasto</th>
                            <th className="h-10 px-4 text-right font-medium text-muted-foreground">LTV</th>
                            <th className="h-10 px-4 text-right font-medium text-muted-foreground">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 bg-card">
                        {filteredClients.map((client) => (
                            <tr key={client.id} className="hover:bg-secondary/20 transition-colors group">
                                <td className="p-4">
                                    <div className="font-medium text-foreground">{client.name}</div>
                                    <div className="text-xs text-muted-foreground">{client.email}</div>
                                </td>
                                <td className="p-4">
                                    <Badge variant="outline" className="font-normal">
                                        {client.classification?.relationship || 'N/A'}
                                    </Badge>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${client.classification?.healthScore === 'Saudável' ? 'bg-success' :
                                                client.classification?.healthScore === 'Atenção' ? 'bg-yellow-500' :
                                                    'bg-destructive'
                                            }`} />
                                        <span className="text-sm">{client.classification?.healthScore || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right">{formatCurrency(client.metrics?.totalLTV || 0)}</td>
                                <td className="p-4 text-right font-medium text-success">{formatCurrency(client.ltv)}</td>
                                <td className="p-4 text-right">
                                    <Button variant="ghost" size="sm" onClick={() => onViewClient(client)}>
                                        <Eye className="w-4 h-4 mr-2" /> Detalhes
                                    </Button>
                                </td>
                            </tr>
                        ))}
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
