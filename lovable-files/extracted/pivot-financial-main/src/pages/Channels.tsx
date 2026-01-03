import { TrendingUp, TrendingDown } from 'lucide-react';
import { channelPerformance, formatCurrency, formatPercent } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const colors = ['#01B8BE', '#00D9E0', '#A8FCFF', '#00777B'];

export default function Channels() {
  const totalRevenue = channelPerformance.reduce((sum, c) => sum + c.receita, 0);
  const totalClients = channelPerformance.reduce((sum, c) => sum + c.clientes, 0);
  const totalCost = channelPerformance.reduce((sum, c) => sum + c.custo, 0);
  const avgROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Performance por Canal</h2>
        <p className="text-muted-foreground">Análise de retorno por canal de aquisição</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
          <p className="text-2xl font-bold kpi-value">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-1">Total de Clientes</p>
          <p className="text-2xl font-bold kpi-value">{totalClients}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-1">Investimento Total</p>
          <p className="text-2xl font-bold kpi-value">{formatCurrency(totalCost)}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-1">ROI Médio</p>
          <p className="text-2xl font-bold text-success">{formatPercent(avgROI)}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Channel */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Receita por Canal</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3333" vertical={false} />
                <XAxis dataKey="canal" stroke="#9CB0B1" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CB0B1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1111', border: '1px solid #2A3333', borderRadius: '8px', color: '#E9F7F8' }}
                  formatter={(value: number) => [formatCurrency(value), 'Receita']}
                />
                <Bar dataKey="receita" radius={[4, 4, 0, 0]}>
                  {channelPerformance.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROI by Channel */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">ROI por Canal</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3333" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#9CB0B1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="canal" stroke="#9CB0B1" fontSize={11} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1111', border: '1px solid #2A3333', borderRadius: '8px', color: '#E9F7F8' }}
                  formatter={(value: number) => [`${value}%`, 'ROI']}
                />
                <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
                  {channelPerformance.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Channels Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Canal</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Receita</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">Clientes</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Ticket Médio</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Custo</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">ROI</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Crescimento</th>
              </tr>
            </thead>
            <tbody>
              {channelPerformance.map((channel, index) => (
                <tr key={channel.canal} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: colors[index] }}
                      />
                      <span className="text-sm font-medium text-foreground">{channel.canal}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    {formatCurrency(channel.receita)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                    {channel.clientes}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                    {formatCurrency(channel.ticketMedio)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                    {channel.custo > 0 ? formatCurrency(channel.custo) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-success">
                      {channel.roi > 999 ? '∞' : `${channel.roi}%`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={cn(
                      'inline-flex items-center gap-1 text-sm font-medium',
                      channel.crescimento >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {channel.crescimento >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {formatPercent(Math.abs(channel.crescimento))}
                    </div>
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
