import { Building2, User, Layers } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { FinancialContext } from '@/types/financial';
import { cn } from '@/lib/utils';

const contexts: { id: FinancialContext; label: string; icon: React.ElementType }[] = [
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'pessoal', label: 'Pessoal', icon: User },
  { id: 'consolidado', label: 'Consolidado', icon: Layers },
];

export function ContextSelector() {
  const { context, setContext } = useFinancialContext();

  return (
    <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg border border-border/50">
      {contexts.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setContext(id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            context === id
              ? 'bg-primary text-primary-foreground shadow-lg glow-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          )}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
