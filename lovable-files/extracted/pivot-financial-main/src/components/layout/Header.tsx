import { Bell, Settings } from 'lucide-react';
import { ContextSelector } from './ContextSelector';
import { useFinancialContext } from '@/contexts/FinancialContext';

const contextTitles = {
  empresa: 'Gestão Empresarial',
  pessoal: 'Finanças Pessoais',
  consolidado: 'Visão Consolidada',
};

export function Header() {
  const { context } = useFinancialContext();

  return (
    <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{contextTitles[context]}</h1>
          <p className="text-xs text-muted-foreground">Dezembro 2024</p>
        </div>

        <div className="flex items-center gap-4">
          <ContextSelector />
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
