export type FinancialContext = 'empresa' | 'pessoal' | 'consolidado';

export type PaymentStatus = 'pago' | 'pendente' | 'vencido';

export interface Revenue {
  id: string;
  data: Date;
  valor: number;
  origem: 'empresa' | 'pessoal';
  servico?: string;
  canalAquisicao?: string;
  categoria?: string;
  status: PaymentStatus;
  cliente?: string;
}

export interface Expense {
  id: string;
  data: Date;
  valor: number;
  origem: 'empresa' | 'pessoal';
  categoria: string;
  servico?: string;
  canalAquisicao?: string;
  recorrente: boolean;
  status: PaymentStatus;
  dataVencimento: Date;
  descricao: string;
}

export interface Transfer {
  id: string;
  data: Date;
  de: 'empresa';
  para: 'pessoal';
  valor: number;
  tipo: 'pro-labore' | 'distribuicao' | 'extra';
}

export interface FinancialAccount {
  id: string;
  nome: string;
  tipo: 'banco' | 'carteira' | 'investimento';
  origem: 'empresa' | 'pessoal';
  saldoAtual: number;
  banco?: string;
}

export type InvestmentType = 'renda_fixa' | 'renda_variavel' | 'cripto' | 'fundo' | 'outro';
export type Liquidity = 'imediata' | 'curto_prazo' | 'longo_prazo';

export interface Investment {
  id: string;
  data: Date;
  origem: 'empresa' | 'pessoal';
  tipo: InvestmentType;
  ativo: string;
  valorAplicado: number;
  valorAtual: number;
  rentabilidadePercentual: number;
  liquidez: Liquidity;
}

export interface MonthlyData {
  month: string;
  receita: number;
  despesa: number;
  lucro: number;
}

export interface ServicePerformance {
  servico: string;
  receita: number;
  projetos: number;
  ticketMedio: number;
  custos: number;
  lucro: number;
  margem: number;
}

export interface ChannelPerformance {
  canal: string;
  receita: number;
  clientes: number;
  ticketMedio: number;
  custo: number;
  roi: number;
  crescimento: number;
}
