import { useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { companyExpenses, personalExpenses, companyRevenues, personalRevenues, formatCurrency, getStatusColor } from '@/data/mockData';
import { cn } from '@/lib/utils';

type TabType = 'pagar' | 'receber';
type StatusFilter = 'all' | 'pago' | 'pendente' | 'vencido';

export default function Accounts() {
  const { context } = useFinancialContext();
  const [activeTab, setActiveTab] = useState<TabType>('pagar');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const expenses = context === 'empresa' 
    ? companyExpenses 
    : context === 'pessoal' 
    ? personalExpenses 
    : [...companyExpenses, ...personalExpenses];

  const revenues = context === 'empresa'
    ? companyRevenues
    : context === 'pessoal'
    ? personalRevenues
    : [...companyRevenues, ...personalRevenues];

  const filteredExpenses = statusFilter === 'all' 
    ? expenses 
    : expenses.filter(e => e.status === statusFilter);

  const filteredRevenues = statusFilter === 'all'
    ? revenues
    : revenues.filter(r => r.status === statusFilter);

  const data = activeTab === 'pagar' ? filteredExpenses : filteredRevenues;

  // Summary
  const overdueItems = expenses.filter(e => e.status === 'vencido');
  const pendingItems = expenses.filter(e => e.status === 'pendente');
  const paidItems = expenses.filter(e => e.status === 'pago');

  const overdueTotal = overdueItems.reduce((sum, e) => sum + e.valor, 0);
  const pendingTotal = pendingItems.reduce((sum, e) => sum + e.valor, 0);
  const paidTotal = paidItems.reduce((sum, e) => sum + e.valor, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Contas</h2>
        <p className="text-muted-foreground">Gerencie suas contas a pagar e receber</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vencidas</p>
              <p className="text-xl font-bold text-destructive">{formatCurrency(overdueTotal)}</p>
              <p className="text-xs text-muted-foreground">{overdueItems.length} contas</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border-warning/30 bg-warning/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-xl font-bold text-warning">{formatCurrency(pendingTotal)}</p>
              <p className="text-xs text-muted-foreground">{pendingItems.length} contas</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border-success/30 bg-success/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pagas (mês)</p>
              <p className="text-xl font-bold text-success">{formatCurrency(paidTotal)}</p>
              <p className="text-xs text-muted-foreground">{paidItems.length} contas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg">
          <button
            onClick={() => setActiveTab('pagar')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === 'pagar'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            A Pagar
          </button>
          <button
            onClick={() => setActiveTab('receber')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === 'receber'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            A Receber
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos os status</option>
            <option value="pago">Pagos</option>
            <option value="pendente">Pendentes</option>
            <option value="vencido">Vencidos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Descrição</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Categoria</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Vencimento</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Valor</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'pagar' ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{expense.descricao}</p>
                        {expense.recorrente && (
                          <span className="text-xs text-muted-foreground">Recorrente</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{expense.categoria}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(expense.dataVencimento, "dd MMM yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                      {formatCurrency(expense.valor)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        'inline-block text-xs px-3 py-1 rounded-full border font-medium',
                        getStatusColor(expense.status)
                      )}>
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                filteredRevenues.map((revenue) => (
                  <tr key={revenue.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {revenue.cliente || revenue.categoria || 'Receita'}
                        </p>
                        {revenue.servico && (
                          <span className="text-xs text-muted-foreground">{revenue.servico}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {revenue.canalAquisicao || revenue.categoria || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(revenue.data, "dd MMM yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-success">
                      {formatCurrency(revenue.valor)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        'inline-block text-xs px-3 py-1 rounded-full border font-medium',
                        getStatusColor(revenue.status)
                      )}>
                        {revenue.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
