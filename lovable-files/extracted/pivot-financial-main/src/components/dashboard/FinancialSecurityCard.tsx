import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { personalExpenses, financialAccounts, investments, formatCurrency } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function FinancialSecurityCard() {
  // Calculate monthly cost of living (fixed + average variable)
  const monthlyFixedCosts = personalExpenses
    .filter(e => e.recorrente)
    .reduce((sum, e) => sum + e.valor, 0);
  
  const monthlyVariableCosts = personalExpenses
    .filter(e => !e.recorrente)
    .reduce((sum, e) => sum + e.valor, 0);

  const totalMonthlyCost = monthlyFixedCosts + monthlyVariableCosts;

  // Calculate total reserves (personal accounts + investments with immediate liquidity)
  const personalAccounts = financialAccounts.filter(a => a.origem === 'pessoal');
  const accountsTotal = personalAccounts.reduce((sum, a) => sum + a.saldoAtual, 0);
  
  const liquidInvestments = investments.filter(
    i => i.origem === 'pessoal' && i.liquidez === 'imediata'
  );
  const liquidInvestmentsTotal = liquidInvestments.reduce((sum, i) => sum + i.valorAtual, 0);

  const totalReserve = accountsTotal + liquidInvestmentsTotal;
  const monthsOfSecurity = totalMonthlyCost > 0 ? totalReserve / totalMonthlyCost : 0;

  // Determine security level
  const getSecurityLevel = () => {
    if (monthsOfSecurity >= 6) return { level: 'Seguro', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 };
    if (monthsOfSecurity >= 3) return { level: 'Atenção', color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle };
    return { level: 'Risco', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle };
  };

  const security = getSecurityLevel();
  const SecurityIcon = security.icon;
  const targetMonths = 6;
  const progressPercent = Math.min((monthsOfSecurity / targetMonths) * 100, 100);

  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Segurança Financeira</h3>
        <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full', security.bg)}>
          <SecurityIcon className={cn('w-3.5 h-3.5', security.color)} />
          <span className={cn('text-xs font-medium', security.color)}>{security.level}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Reserva Disponível</span>
          </div>
          <p className="text-2xl font-bold kpi-value">{formatCurrency(totalReserve)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Custo de Vida Mensal</p>
            <p className="text-base font-semibold text-foreground">{formatCurrency(totalMonthlyCost)}</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Meses de Segurança</p>
            <p className={cn('text-base font-semibold', security.color)}>
              {monthsOfSecurity.toFixed(1)} meses
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Meta: {targetMonths} meses de reserva</span>
            <span>{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', {
                'bg-success': progressPercent >= 100,
                'bg-warning': progressPercent >= 50 && progressPercent < 100,
                'bg-destructive': progressPercent < 50,
              })}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
