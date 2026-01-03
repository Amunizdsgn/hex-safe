import { TrendingUp, Droplets, Lock, Zap } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { investments, formatCurrency, formatPercent } from '@/data/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';

const typeLabels: Record<string, string> = {
  renda_fixa: 'Renda Fixa',
  renda_variavel: 'Renda Variável',
  cripto: 'Cripto',
  fundo: 'Fundos',
  outro: 'Outros',
};

const liquidityLabels: Record<string, string> = {
  imediata: 'Imediata',
  curto_prazo: 'Curto Prazo',
  longo_prazo: 'Longo Prazo',
};

const colors = ['#01B8BE', '#00D9E0', '#A8FCFF', '#00777B', '#007A7D'];

export default function Investments() {
  const { context } = useFinancialContext();

  const filteredInvestments = context === 'consolidado'
    ? investments
    : investments.filter(i => i.origem === context);

  const totalInvested = filteredInvestments.reduce((sum, i) => sum + i.valorAplicado, 0);
  const totalCurrent = filteredInvestments.reduce((sum, i) => sum + i.valorAtual, 0);
  const totalReturn = totalCurrent - totalInvested;
  const returnPercentage = totalInvested > 0 ? ((totalReturn / totalInvested) * 100) : 0;

  // Group by type
  const byType = filteredInvestments.reduce((acc, inv) => {
    const key = inv.tipo;
    if (!acc[key]) acc[key] = { aplicado: 0, atual: 0 };
    acc[key].aplicado += inv.valorAplicado;
    acc[key].atual += inv.valorAtual;
    return acc;
  }, {} as Record<string, { aplicado: number; atual: number }>);

  const typeData = Object.entries(byType).map(([tipo, values]) => ({
    name: typeLabels[tipo] || tipo,
    value: values.atual,
    aplicado: values.aplicado,
  }));

  // Group by liquidity
  const byLiquidity = filteredInvestments.reduce((acc, inv) => {
    const key = inv.liquidez;
    if (!acc[key]) acc[key] = 0;
    acc[key] += inv.valorAtual;
    return acc;
  }, {} as Record<string, number>);

  const liquidityData = Object.entries(byLiquidity).map(([liq, value]) => ({
    name: liquidityLabels[liq] || liq,
    value,
  }));

  const immediateTotal = byLiquidity['imediata'] || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Investimentos</h2>
        <p className="text-muted-foreground">
          {context === 'consolidado' ? 'Visão consolidada' : context === 'empresa' ? 'Investimentos empresariais' : 'Investimentos pessoais'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 border-primary/30 glow-primary">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Patrimônio Investido</span>
          </div>
          <p className="text-2xl font-bold kpi-value">{formatCurrency(totalCurrent)}</p>
          <p className="text-xs text-muted-foreground mt-1">Aplicado: {formatCurrency(totalInvested)}</p>
        </div>

        <div className="glass-card rounded-xl p-5 border-success/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm text-muted-foreground">Rentabilidade Total</span>
          </div>
          <p className="text-2xl font-bold text-success">+{formatPercent(returnPercentage)}</p>
          <p className="text-xs text-success mt-1">+{formatCurrency(totalReturn)}</p>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-highlight" />
            <span className="text-sm text-muted-foreground">Liquidez Imediata</span>
          </div>
          <p className="text-2xl font-bold highlight-text">{formatCurrency(immediateTotal)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalCurrent > 0 ? formatPercent((immediateTotal / totalCurrent) * 100) : '0%'} do total
          </p>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Ativos</span>
          </div>
          <p className="text-2xl font-bold kpi-value">{filteredInvestments.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Posições ativas</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Type */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Distribuição por Tipo</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {typeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1111', border: '1px solid #2A3333', borderRadius: '8px', color: '#E9F7F8' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {typeData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Liquidity */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Distribuição por Liquidez</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={liquidityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3333" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#9CB0B1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000)}k`} />
                <YAxis type="category" dataKey="name" stroke="#9CB0B1" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1111', border: '1px solid #2A3333', borderRadius: '8px', color: '#E9F7F8' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Bar dataKey="value" fill="#01B8BE" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Investments Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Ativo</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Tipo</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Aplicado</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Atual</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Rentabilidade</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">Liquidez</th>
                {context === 'consolidado' && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">Origem</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredInvestments.map((inv) => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground">{inv.ativo}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {typeLabels[inv.tipo] || inv.tipo}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                    {formatCurrency(inv.valorAplicado)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    {formatCurrency(inv.valorAtual)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      'text-sm font-medium',
                      inv.rentabilidadePercentual >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {inv.rentabilidadePercentual >= 0 ? '+' : ''}{formatPercent(inv.rentabilidadePercentual)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      inv.liquidez === 'imediata' ? 'bg-success/20 text-success' :
                      inv.liquidez === 'curto_prazo' ? 'bg-warning/20 text-warning' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {liquidityLabels[inv.liquidez]}
                    </span>
                  </td>
                  {context === 'consolidado' && (
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        inv.origem === 'empresa' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-highlight'
                      )}>
                        {inv.origem === 'empresa' ? 'Empresa' : 'Pessoal'}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
