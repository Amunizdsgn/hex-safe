import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Megaphone,
  LineChart,
  Wallet,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFinancialContext } from '@/contexts/FinancialContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, contexts: ['empresa', 'pessoal', 'consolidado'] },
  { path: '/contas', label: 'Contas', icon: Receipt, contexts: ['empresa', 'pessoal', 'consolidado'] },
  { path: '/servicos', label: 'Serviços', icon: TrendingUp, contexts: ['empresa'] },
  { path: '/canais', label: 'Canais', icon: Megaphone, contexts: ['empresa'] },
  { path: '/projecoes', label: 'Projeções', icon: LineChart, contexts: ['empresa', 'pessoal'] },
  { path: '/investimentos', label: 'Investimentos', icon: PiggyBank, contexts: ['empresa', 'pessoal', 'consolidado'] },
  { path: '/carteiras', label: 'Carteiras', icon: Wallet, contexts: ['empresa', 'pessoal', 'consolidado'] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { context } = useFinancialContext();
  const location = useLocation();

  const filteredItems = navItems.filter(item => item.contexts.includes(context));

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">FI</span>
              </div>
              <span className="font-semibold text-foreground">FinanceIQ</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary')} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-muted-foreground">
              <p>Última atualização</p>
              <p className="text-foreground font-medium">Hoje, 14:32</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
