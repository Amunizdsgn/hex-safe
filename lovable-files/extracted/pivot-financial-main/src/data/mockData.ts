import { Revenue, Expense, Transfer, FinancialAccount, Investment, MonthlyData, ServicePerformance, ChannelPerformance } from '@/types/financial';

// Receitas da empresa
export const companyRevenues: Revenue[] = [
  { id: '1', data: new Date('2024-12-01'), valor: 15000, origem: 'empresa', servico: 'Desenvolvimento Web', canalAquisicao: 'Indicação', status: 'pago', cliente: 'Tech Solutions Ltda' },
  { id: '2', data: new Date('2024-12-05'), valor: 8500, origem: 'empresa', servico: 'Consultoria Digital', canalAquisicao: 'LinkedIn', status: 'pago', cliente: 'Inova Corp' },
  { id: '3', data: new Date('2024-12-10'), valor: 22000, origem: 'empresa', servico: 'Sistema Personalizado', canalAquisicao: 'Google Ads', status: 'pago', cliente: 'Mega Store SA' },
  { id: '4', data: new Date('2024-12-15'), valor: 12000, origem: 'empresa', servico: 'E-commerce', canalAquisicao: 'Indicação', status: 'pendente', cliente: 'Fashion Hub' },
  { id: '5', data: new Date('2024-12-20'), valor: 5500, origem: 'empresa', servico: 'Manutenção', canalAquisicao: 'Orgânico', status: 'pendente', cliente: 'Data Flow Inc' },
  { id: '6', data: new Date('2024-11-25'), valor: 18000, origem: 'empresa', servico: 'App Mobile', canalAquisicao: 'LinkedIn', status: 'pago', cliente: 'StartUp X' },
  { id: '7', data: new Date('2024-11-15'), valor: 9000, origem: 'empresa', servico: 'Desenvolvimento Web', canalAquisicao: 'Google Ads', status: 'pago', cliente: 'E-Learn Plus' },
  { id: '8', data: new Date('2024-10-20'), valor: 35000, origem: 'empresa', servico: 'Sistema Personalizado', canalAquisicao: 'Indicação', status: 'pago', cliente: 'FinTech Pro' },
];

// Receitas pessoais
export const personalRevenues: Revenue[] = [
  { id: 'p1', data: new Date('2024-12-01'), valor: 12000, origem: 'pessoal', categoria: 'Pró-labore', status: 'pago' },
  { id: 'p2', data: new Date('2024-11-01'), valor: 12000, origem: 'pessoal', categoria: 'Pró-labore', status: 'pago' },
  { id: 'p3', data: new Date('2024-10-01'), valor: 12000, origem: 'pessoal', categoria: 'Pró-labore', status: 'pago' },
  { id: 'p4', data: new Date('2024-12-15'), valor: 8000, origem: 'pessoal', categoria: 'Distribuição de Lucros', status: 'pago' },
  { id: 'p5', data: new Date('2024-12-10'), valor: 1500, origem: 'pessoal', categoria: 'Rendimentos', status: 'pago' },
];

// Despesas da empresa
export const companyExpenses: Expense[] = [
  { id: 'e1', data: new Date('2024-12-01'), valor: 2500, origem: 'empresa', categoria: 'Infraestrutura', recorrente: true, status: 'pago', dataVencimento: new Date('2024-12-05'), descricao: 'AWS + Vercel + Domínios' },
  { id: 'e2', data: new Date('2024-12-01'), valor: 1200, origem: 'empresa', categoria: 'Ferramentas', recorrente: true, status: 'pago', dataVencimento: new Date('2024-12-05'), descricao: 'Figma + GitHub + Notion' },
  { id: 'e3', data: new Date('2024-12-10'), valor: 3500, origem: 'empresa', categoria: 'Marketing', recorrente: false, status: 'pago', dataVencimento: new Date('2024-12-10'), descricao: 'Campanha Google Ads' },
  { id: 'e4', data: new Date('2024-12-15'), valor: 12000, origem: 'empresa', categoria: 'Folha de Pagamento', recorrente: true, status: 'pendente', dataVencimento: new Date('2024-12-20'), descricao: 'Pró-labore sócio' },
  { id: 'e5', data: new Date('2024-12-01'), valor: 850, origem: 'empresa', categoria: 'Contabilidade', recorrente: true, status: 'pago', dataVencimento: new Date('2024-12-05'), descricao: 'Honorários contábeis' },
  { id: 'e6', data: new Date('2024-11-28'), valor: 4200, origem: 'empresa', categoria: 'Impostos', recorrente: false, status: 'vencido', dataVencimento: new Date('2024-12-01'), descricao: 'DAS Simples Nacional' },
  { id: 'e7', data: new Date('2024-12-18'), valor: 6000, origem: 'empresa', categoria: 'Freelancers', recorrente: false, status: 'pendente', dataVencimento: new Date('2024-12-25'), descricao: 'Designer UI/UX' },
];

// Despesas pessoais
export const personalExpenses: Expense[] = [
  { id: 'pe1', data: new Date('2024-12-01'), valor: 3500, origem: 'pessoal', categoria: 'Moradia', recorrente: true, status: 'pago', dataVencimento: new Date('2024-12-05'), descricao: 'Aluguel apartamento' },
  { id: 'pe2', data: new Date('2024-12-01'), valor: 450, origem: 'pessoal', categoria: 'Moradia', recorrente: true, status: 'pago', dataVencimento: new Date('2024-12-10'), descricao: 'Condomínio' },
  { id: 'pe3', data: new Date('2024-12-05'), valor: 1800, origem: 'pessoal', categoria: 'Alimentação', recorrente: false, status: 'pago', dataVencimento: new Date('2024-12-05'), descricao: 'Supermercado + Delivery' },
  { id: 'pe4', data: new Date('2024-12-10'), valor: 580, origem: 'pessoal', categoria: 'Transporte', recorrente: false, status: 'pago', dataVencimento: new Date('2024-12-10'), descricao: 'Combustível + Uber' },
  { id: 'pe5', data: new Date('2024-12-01'), valor: 250, origem: 'pessoal', categoria: 'Saúde', recorrente: true, status: 'pago', dataVencimento: new Date('2024-12-05'), descricao: 'Plano de saúde' },
  { id: 'pe6', data: new Date('2024-12-01'), valor: 120, origem: 'pessoal', categoria: 'Lazer', recorrente: true, status: 'pago', dataVencimento: new Date('2024-12-05'), descricao: 'Netflix + Spotify + Prime' },
  { id: 'pe7', data: new Date('2024-12-15'), valor: 2000, origem: 'pessoal', categoria: 'Educação', recorrente: false, status: 'pendente', dataVencimento: new Date('2024-12-20'), descricao: 'Curso de especialização' },
  { id: 'pe8', data: new Date('2024-11-25'), valor: 890, origem: 'pessoal', categoria: 'Cartão de Crédito', recorrente: false, status: 'vencido', dataVencimento: new Date('2024-12-01'), descricao: 'Fatura cartão Nubank' },
];

// Transferências
export const transfers: Transfer[] = [
  { id: 't1', data: new Date('2024-12-01'), de: 'empresa', para: 'pessoal', valor: 12000, tipo: 'pro-labore' },
  { id: 't2', data: new Date('2024-12-15'), de: 'empresa', para: 'pessoal', valor: 8000, tipo: 'distribuicao' },
  { id: 't3', data: new Date('2024-11-01'), de: 'empresa', para: 'pessoal', valor: 12000, tipo: 'pro-labore' },
  { id: 't4', data: new Date('2024-10-01'), de: 'empresa', para: 'pessoal', valor: 12000, tipo: 'pro-labore' },
];

// Contas financeiras
export const financialAccounts: FinancialAccount[] = [
  { id: 'fa1', nome: 'Conta PJ Itaú', tipo: 'banco', origem: 'empresa', saldoAtual: 45680, banco: 'Itaú' },
  { id: 'fa2', nome: 'Conta PJ Inter', tipo: 'banco', origem: 'empresa', saldoAtual: 12350, banco: 'Inter' },
  { id: 'fa3', nome: 'Reserva Empresa', tipo: 'investimento', origem: 'empresa', saldoAtual: 85000, banco: 'XP' },
  { id: 'fa4', nome: 'Conta PF Nubank', tipo: 'banco', origem: 'pessoal', saldoAtual: 8920, banco: 'Nubank' },
  { id: 'fa5', nome: 'Conta PF C6', tipo: 'banco', origem: 'pessoal', saldoAtual: 3450, banco: 'C6 Bank' },
  { id: 'fa6', nome: 'Carteira Cripto', tipo: 'carteira', origem: 'pessoal', saldoAtual: 15800 },
];

// Investimentos
export const investments: Investment[] = [
  { id: 'i1', data: new Date('2024-01-15'), origem: 'empresa', tipo: 'renda_fixa', ativo: 'CDB Banco Inter 110% CDI', valorAplicado: 50000, valorAtual: 55750, rentabilidadePercentual: 11.5, liquidez: 'imediata' },
  { id: 'i2', data: new Date('2024-03-01'), origem: 'empresa', tipo: 'renda_fixa', ativo: 'Tesouro Selic 2029', valorAplicado: 35000, valorAtual: 38200, rentabilidadePercentual: 9.14, liquidez: 'curto_prazo' },
  { id: 'i3', data: new Date('2024-06-10'), origem: 'pessoal', tipo: 'renda_variavel', ativo: 'ETF IVVB11', valorAplicado: 20000, valorAtual: 24800, rentabilidadePercentual: 24.0, liquidez: 'imediata' },
  { id: 'i4', data: new Date('2024-02-20'), origem: 'pessoal', tipo: 'cripto', ativo: 'Bitcoin (BTC)', valorAplicado: 10000, valorAtual: 15800, rentabilidadePercentual: 58.0, liquidez: 'imediata' },
  { id: 'i5', data: new Date('2024-04-15'), origem: 'pessoal', tipo: 'fundo', ativo: 'FII XPLG11', valorAplicado: 15000, valorAtual: 16350, rentabilidadePercentual: 9.0, liquidez: 'imediata' },
  { id: 'i6', data: new Date('2024-08-01'), origem: 'pessoal', tipo: 'renda_fixa', ativo: 'LCI Caixa 95% CDI', valorAplicado: 25000, valorAtual: 26250, rentabilidadePercentual: 5.0, liquidez: 'longo_prazo' },
];

// Dados mensais
export const monthlyData: MonthlyData[] = [
  { month: 'Jul', receita: 62000, despesa: 38000, lucro: 24000 },
  { month: 'Ago', receita: 71000, despesa: 42000, lucro: 29000 },
  { month: 'Set', receita: 68000, despesa: 45000, lucro: 23000 },
  { month: 'Out', receita: 85000, despesa: 48000, lucro: 37000 },
  { month: 'Nov', receita: 78000, despesa: 44000, lucro: 34000 },
  { month: 'Dez', receita: 63000, despesa: 30250, lucro: 32750 },
];

// Performance por serviço
export const servicePerformance: ServicePerformance[] = [
  { servico: 'Desenvolvimento Web', receita: 42000, projetos: 4, ticketMedio: 10500, custos: 15000, lucro: 27000, margem: 64.3 },
  { servico: 'Sistema Personalizado', receita: 57000, projetos: 2, ticketMedio: 28500, custos: 22000, lucro: 35000, margem: 61.4 },
  { servico: 'App Mobile', receita: 18000, projetos: 1, ticketMedio: 18000, custos: 8000, lucro: 10000, margem: 55.6 },
  { servico: 'Consultoria Digital', receita: 17000, projetos: 3, ticketMedio: 5667, custos: 4000, lucro: 13000, margem: 76.5 },
  { servico: 'E-commerce', receita: 12000, projetos: 1, ticketMedio: 12000, custos: 5000, lucro: 7000, margem: 58.3 },
  { servico: 'Manutenção', receita: 11000, projetos: 2, ticketMedio: 5500, custos: 2000, lucro: 9000, margem: 81.8 },
];

// Performance por canal
export const channelPerformance: ChannelPerformance[] = [
  { canal: 'Indicação', receita: 72000, clientes: 4, ticketMedio: 18000, custo: 0, roi: 999, crescimento: 15.5 },
  { canal: 'LinkedIn', receita: 26500, clientes: 2, ticketMedio: 13250, custo: 1500, roi: 1667, crescimento: 22.3 },
  { canal: 'Google Ads', receita: 31000, clientes: 2, ticketMedio: 15500, custo: 5500, roi: 464, crescimento: 8.7 },
  { canal: 'Orgânico', receita: 5500, clientes: 1, ticketMedio: 5500, custo: 0, roi: 999, crescimento: -5.2 },
];

// Helpers
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pago':
    case 'paga':
      return 'status-paid';
    case 'pendente':
      return 'status-pending';
    case 'vencido':
    case 'vencida':
      return 'status-overdue';
    default:
      return '';
  }
};
