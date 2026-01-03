import { CreditCard, Building2, Wallet, PiggyBank } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { financialAccounts, formatCurrency } from '@/data/mockData';
import { cn } from '@/lib/utils';

const typeIcons: Record<string, React.ElementType> = {
  banco: Building2,
  carteira: Wallet,
  investimento: PiggyBank,
};

const typeLabels: Record<string, string> = {
  banco: 'Conta Bancária',
  carteira: 'Carteira Digital',
  investimento: 'Investimento',
};

export default function Wallets() {
  const { context } = useFinancialContext();

  const filteredAccounts = context === 'consolidado'
    ? financialAccounts
    : financialAccounts.filter(a => a.origem === context);

  const totalBalance = filteredAccounts.reduce((sum, a) => sum + a.saldoAtual, 0);

  const byType = filteredAccounts.reduce((acc, account) => {
    if (!acc[account.tipo]) acc[account.tipo] = [];
    acc[account.tipo].push(account);
    return acc;
  }, {} as Record<string, typeof financialAccounts>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Carteiras</h2>
        <p className="text-muted-foreground">Saldo disponível em contas e carteiras</p>
      </div>

      {/* Total */}
      <div className="glass-card rounded-xl p-6 border-primary/30 glow-primary">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Saldo Total Disponível</p>
            <p className="text-3xl font-bold kpi-value">{formatCurrency(totalBalance)}</p>
          </div>
        </div>
      </div>

      {/* Accounts by Type */}
      <div className="space-y-6">
        {Object.entries(byType).map(([type, accounts]) => {
          const Icon = typeIcons[type] || Wallet;
          const typeTotal = accounts.reduce((sum, a) => sum + a.saldoAtual, 0);

          return (
            <div key={type} className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{typeLabels[type]}</h3>
                    <p className="text-xs text-muted-foreground">{accounts.length} conta(s)</p>
                  </div>
                </div>
                <p className="text-xl font-bold kpi-value">{formatCurrency(typeTotal)}</p>
              </div>

              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-sm font-bold text-foreground">
                          {account.banco ? account.banco.charAt(0) : account.nome.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{account.nome}</p>
                        {account.banco && (
                          <p className="text-xs text-muted-foreground">{account.banco}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">{formatCurrency(account.saldoAtual)}</p>
                      {context === 'consolidado' && (
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          account.origem === 'empresa' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-highlight'
                        )}>
                          {account.origem === 'empresa' ? 'Empresa' : 'Pessoal'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
