import { Target, TrendingUp, AlertCircle, Calculator } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { 
  companyRevenues, 
  companyExpenses, 
  personalExpenses,
  servicePerformance,
  formatCurrency,
  formatPercent
} from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const projectionData = [
  { day: '01', real: 0, projetado: 0 },
  { day: '05', real: 15000, projetado: 13333 },
  { day: '10', real: 23500, projetado: 26667 },
  { day: '15', real: 45500, projetado: 40000 },
  { day: '20', real: 51000, projetado: 53333 },
  { day: '25', real: 63000, projetado: 66667 },
  { day: '31', real: null, projetado: 80000 },
];

export default function Projections() {
  const { context } = useFinancialContext();

  // Company projections
  const monthlyGoal = 80000;
  const currentRevenue = companyRevenues.reduce((sum, r) => sum + r.valor, 0);
  const currentExpenses = companyExpenses.reduce((sum, e) => sum + e.valor, 0);
  const pendingRevenue = companyRevenues.filter(r => r.status === 'pendente').reduce((sum, r) => sum + r.valor, 0);
  const overdueExpenses = companyExpenses.filter(e => e.status === 'vencido').reduce((sum, e) => sum + e.valor, 0);
  const pendingExpenses = companyExpenses.filter(e => e.status === 'pendente').reduce((sum, e) => sum + e.valor, 0);

  const projectedRevenue = currentRevenue + pendingRevenue;
  const projectedExpenses = currentExpenses + pendingExpenses;
  const projectedProfit = projectedRevenue - projectedExpenses;
  const projectedMargin = projectedRevenue > 0 ? (projectedProfit / projectedRevenue) * 100 : 0;

  const targetMargin = 50;
  const maxExpensesForMargin = projectedRevenue * (1 - targetMargin / 100);
  const expenseBuffer = maxExpensesForMargin - projectedExpenses;

  const avgTicket = servicePerformance.reduce((sum, s) => sum + s.ticketMedio, 0) / servicePerformance.length;
  const revenueGap = monthlyGoal - projectedRevenue;
  const projectsNeeded = Math.ceil(revenueGap / avgTicket);

  // Personal projections
  const totalPersonalExpenses = personalExpenses.reduce((sum, e) => sum + e.valor, 0);
  const personalPending = personalExpenses.filter(e => e.status === 'pendente').reduce((sum, e) => sum + e.valor, 0);

  if (context === 'pessoal') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Projeções Pessoais</h2>
          <p className="text-muted-foreground">Previsão de gastos e impacto no orçamento</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gastos Projetados</p>
                <p className="text-2xl font-bold kpi-value">{formatCurrency(totalPersonalExpenses + personalPending)}</p>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gastos realizados</span>
                <span className="text-foreground font-medium">{formatCurrency(totalPersonalExpenses - personalPending)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gastos pendentes</span>
                <span className="text-warning font-medium">{formatCurrency(personalPending)}</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Impacto no Mês</p>
                <p className="text-2xl font-bold text-warning">{formatCurrency(personalPending)}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Valor pendente que ainda será debitado este mês. Certifique-se de ter saldo disponível.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Projeções da Empresa</h2>
        <p className="text-muted-foreground">Previsão de fechamento e cenários</p>
      </div>

      {/* Projection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Projeção Receita</span>
          </div>
          <p className="text-2xl font-bold kpi-value">{formatCurrency(projectedRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {projectedRevenue >= monthlyGoal ? (
              <span className="text-success">Meta atingida ✓</span>
            ) : (
              <span className="text-warning">Faltam {formatCurrency(revenueGap)}</span>
            )}
          </p>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Projeção Lucro</span>
          </div>
          <p className="text-2xl font-bold text-success">{formatCurrency(projectedProfit)}</p>
          <p className="text-xs text-muted-foreground mt-1">Margem: {formatPercent(projectedMargin)}</p>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Projetos p/ Meta</span>
          </div>
          <p className="text-2xl font-bold kpi-value">{projectsNeeded > 0 ? projectsNeeded : 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Ticket médio: {formatCurrency(avgTicket)}</p>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Limite Despesas</span>
          </div>
          <p className={`text-2xl font-bold ${expenseBuffer >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(Math.abs(expenseBuffer))}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {expenseBuffer >= 0 ? 'Margem disponível' : 'Acima do limite'}
          </p>
        </div>
      </div>

      {/* Projection Chart */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Curva de Faturamento</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3333" vertical={false} />
              <XAxis dataKey="day" stroke="#9CB0B1" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CB0B1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B1111', border: '1px solid #2A3333', borderRadius: '8px', color: '#E9F7F8' }}
                formatter={(value: number | null) => [value !== null ? formatCurrency(value) : '-', '']}
              />
              <ReferenceLine y={monthlyGoal} stroke="#01B8BE" strokeDasharray="5 5" label={{ value: 'Meta', fill: '#01B8BE', fontSize: 12 }} />
              <Line type="monotone" dataKey="projetado" stroke="#2A3333" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Projetado" />
              <Line type="monotone" dataKey="real" stroke="#01B8BE" strokeWidth={3} dot={{ fill: '#01B8BE', strokeWidth: 2 }} name="Realizado" connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Impact Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Impacto das Pendências</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Receitas Pendentes</p>
                <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
              </div>
              <p className="text-lg font-bold text-warning">{formatCurrency(pendingRevenue)}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Despesas Vencidas</p>
                <p className="text-xs text-muted-foreground">Impacto no caixa</p>
              </div>
              <p className="text-lg font-bold text-destructive">{formatCurrency(overdueExpenses)}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Despesas Pendentes</p>
                <p className="text-xs text-muted-foreground">A pagar este mês</p>
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(pendingExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Cenários de Fechamento</h3>
          <div className="space-y-4">
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-sm font-medium text-success mb-1">Cenário Otimista</p>
              <p className="text-xs text-muted-foreground mb-2">Todas pendências recebidas</p>
              <p className="text-xl font-bold text-success">{formatCurrency(projectedProfit)}</p>
            </div>
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm font-medium text-warning mb-1">Cenário Realista</p>
              <p className="text-xs text-muted-foreground mb-2">80% das pendências</p>
              <p className="text-xl font-bold text-warning">{formatCurrency(projectedProfit - pendingRevenue * 0.2)}</p>
            </div>
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive mb-1">Cenário Pessimista</p>
              <p className="text-xs text-muted-foreground mb-2">Sem receber pendências</p>
              <p className="text-xl font-bold text-destructive">{formatCurrency(projectedProfit - pendingRevenue)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
