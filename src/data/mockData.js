
export const companyRevenues = [];
export const personalRevenues = [];
export const companyExpenses = [];
export const personalExpenses = [];
export const transfers = [];

export const financialAccounts = [
    { id: 'fa1', nome: 'Conta PJ Itaú', tipo: 'banco', origem: 'empresa', saldoAtual: 0, banco: 'Itaú' },
    { id: 'fa2', nome: 'Conta PJ Inter', tipo: 'banco', origem: 'empresa', saldoAtual: 0, banco: 'Inter' },
    { id: 'fa3', nome: 'Reserva Empresa', tipo: 'investimento', origem: 'empresa', saldoAtual: 0, banco: 'XP' },
    { id: 'fa4', nome: 'Conta PF Nubank', tipo: 'banco', origem: 'pessoal', saldoAtual: 0, banco: 'Nubank' },
    { id: 'fa5', nome: 'Conta PF C6', tipo: 'banco', origem: 'pessoal', saldoAtual: 0, banco: 'C6 Bank' },
    { id: 'fa6', nome: 'Carteira Cripto', tipo: 'carteira', origem: 'pessoal', saldoAtual: 0 },
];

export const investments = [];
export const portfolioHistory = [];

export const currencyRates = [
    { code: 'USD', name: 'Dólar', rate: 5.85, change: 0.5, changeMonth: 2.1 },
    { code: 'EUR', name: 'Euro', rate: 6.42, change: -0.2, changeMonth: 1.5 },
    { code: 'GBP', name: 'Libra', rate: 7.55, change: 0.1, changeMonth: 0.8 },
    { code: 'BTC', name: 'Bitcoin', rate: 580000, change: 2.5, changeMonth: 12.0 },
];

export const assetOperations = [];
export const salesPipeline = [];
export const cashFlowProjection = [];
export const pendingItems = [];
export const monthlyData = [];
export const servicePerformance = [];
export const channelPerformance = [];
export const channelHistory = [];

export const attributionWeights = {
    'Last Click': { Indicação: 100, LinkedIn: 100, 'Google Ads': 100, Orgânico: 100 },
    'First Touch': { Indicação: 20, LinkedIn: 150, 'Google Ads': 80, Orgânico: 150 },
    'Linear': { Indicação: 100, LinkedIn: 100, 'Google Ads': 100, Orgânico: 100 },
};

export const channelExperiments = [];

export const clients = [];
export const crmDeals = [];

export const crmStages = [
    { id: 'Prospecção', label: 'Prospecção', color: 'bg-slate-500' },
    { id: 'Qualificação', label: 'Qualificação', color: 'bg-blue-500' },
    { id: 'Proposta', label: 'Proposta', color: 'bg-yellow-500' },
    { id: 'Negociação', label: 'Negociação', color: 'bg-orange-500' },
    { id: 'Fechado', label: 'Fechado', color: 'bg-green-500' },
    { id: 'Perdido', label: 'Perdido', color: 'bg-red-500' },
];

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
};

export const getStatusColor = (status) => {
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
