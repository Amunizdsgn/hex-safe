import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { channelPerformance, formatCurrency } from '@/data/mockData';

const colors = ['#01B8BE', '#00D9E0', '#A8FCFF', '#00777B'];

export function ChannelChart() {
  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-foreground mb-6">Receita por Canal</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={channelPerformance}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="receita"
              nameKey="canal"
            >
              {channelPerformance.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0B1111',
                border: '1px solid #2A3333',
                borderRadius: '8px',
                color: '#E9F7F8',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Receita']}
            />
            <Legend 
              layout="vertical" 
              align="right" 
              verticalAlign="middle"
              formatter={(value) => <span style={{ color: '#9CB0B1', fontSize: '12px' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
