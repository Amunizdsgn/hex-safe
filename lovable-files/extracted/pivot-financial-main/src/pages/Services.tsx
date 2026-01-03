import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { servicePerformance, formatCurrency, formatPercent } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const monthlyServiceData = [
  { month: 'Set', 'Desenvolvimento Web': 38000, 'Sistema Personalizado': 45000, 'App Mobile': 12000, 'Consultoria': 8000 },
  { month: 'Out', 'Desenvolvimento Web': 42000, 'Sistema Personalizado': 55000, 'App Mobile': 15000, 'Consultoria': 12000 },
  { month: 'Nov', 'Desenvolvimento Web': 35000, 'Sistema Personalizado': 48000, 'App Mobile': 18000, 'Consultoria': 15000 },
  { month: 'Dez', 'Desenvolvimento Web': 42000, 'Sistema Personalizado': 57000, 'App Mobile': 18000, 'Consultoria': 17000 },
];

export default function Services() {
  const totalRevenue = servicePerformance.reduce((sum, s) => sum + s.receita, 0);
  const totalProjects = servicePerformance.reduce((sum, s) => sum + s.projetos, 0);
  const avgMargin = servicePerformance.reduce((sum, s) => sum + s.margem, 0) / servicePerformance.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Performance por Serviço</h2>
        <p className="text-muted-foreground">Análise detalhada de cada linha de serviço</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
          <p className="text-2xl font-bold kpi-value">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-1">Total de Projetos</p>
          <p className="text-2xl font-bold kpi-value">{totalProjects}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-1">Margem Média</p>
          <p className="text-2xl font-bold text-success">{formatPercent(avgMargin)}</p>
        </div>
      </div>

      {/* Evolution Chart */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Evolução Mensal por Serviço</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyServiceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3333" vertical={false} />
              <XAxis dataKey="month" stroke="#9CB0B1" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CB0B1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B1111', border: '1px solid #2A3333', borderRadius: '8px', color: '#E9F7F8' }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend formatter={(value) => <span style={{ color: '#9CB0B1', fontSize: '12px' }}>{value}</span>} />
              <Line type="monotone" dataKey="Desenvolvimento Web" stroke="#01B8BE" strokeWidth={2} dot={{ fill: '#01B8BE' }} />
              <Line type="monotone" dataKey="Sistema Personalizado" stroke="#00D9E0" strokeWidth={2} dot={{ fill: '#00D9E0' }} />
              <Line type="monotone" dataKey="App Mobile" stroke="#A8FCFF" strokeWidth={2} dot={{ fill: '#A8FCFF' }} />
              <Line type="monotone" dataKey="Consultoria" stroke="#00777B" strokeWidth={2} dot={{ fill: '#00777B' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Services Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Serviço</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Receita</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">Projetos</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Ticket Médio</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Custos</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Lucro</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Margem</th>
              </tr>
            </thead>
            <tbody>
              {servicePerformance.map((service, index) => (
                <tr key={service.servico} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: ['#01B8BE', '#00D9E0', '#A8FCFF', '#00777B', '#007A7D', '#00A5A8'][index] }}
                      />
                      <span className="text-sm font-medium text-foreground">{service.servico}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    {formatCurrency(service.receita)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                    {service.projetos}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                    {formatCurrency(service.ticketMedio)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                    {formatCurrency(service.custos)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-success">
                    {formatCurrency(service.lucro)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      'text-sm font-medium',
                      service.margem >= 70 ? 'text-success' : service.margem >= 50 ? 'text-warning' : 'text-destructive'
                    )}>
                      {formatPercent(service.margem)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
