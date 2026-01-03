import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FinancialContext as FinancialContextType } from '@/types/financial';

interface FinancialContextValue {
  context: FinancialContextType;
  setContext: (context: FinancialContextType) => void;
}

const FinancialContext = createContext<FinancialContextValue | undefined>(undefined);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<FinancialContextType>('empresa');

  return (
    <FinancialContext.Provider value={{ context, setContext }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancialContext() {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancialContext must be used within a FinancialProvider');
  }
  return context;
}
