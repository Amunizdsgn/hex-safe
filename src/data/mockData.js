
const getCurrentDate = (day) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-${String(day).padStart(2, '0')}`;
};

export const companyRevenues = [
    { id: 'mck-inc-1', description: 'Consultoria Mensal - Client A', valor: 5000, date: getCurrentDate(5), status: 'pago', category: 'Recorrente', type: 'revenue' },
    { id: 'mck-inc-2', description: 'Projeto Website - Client B', valor: 8500, date: getCurrentDate(15), status: 'pendente', category: 'Serviços', type: 'revenue' },
    { id: 'mck-inc-3', description: 'Setup de Tráfego - Client C', valor: 2500, date: getCurrentDate(20), status: 'pendente', category: 'Serviços', type: 'revenue' },
];

export const companyExpenses = [
    { id: 'mck-exp-1', description: 'Servidor AWS', valor: 350, date: getCurrentDate(2), status: 'pago', category: 'Infraestrutura', type: 'expense' },
    { id: 'mck-exp-2', description: 'Assinatura Software', valor: 1200, date: getCurrentDate(5), status: 'pago', category: 'Ferramentas', type: 'expense' },
    { id: 'mck-exp-3', description: 'Designer Freelancer', valor: 1500, date: getCurrentDate(10), status: 'pendente', category: 'Operacional', type: 'expense' },
    { id: 'mck-exp-4', description: 'Impostos (DAS)', valor: 800, date: getCurrentDate(20), status: 'pendente', category: 'Impostos', type: 'expense' },
];

export const personalRevenues = [
    { id: 'mck-p-inc-1', description: 'Salário/Pró-Labore', valor: 10000, date: getCurrentDate(5), status: 'pago', category: 'Salário', type: 'revenue' },
];

export const personalExpenses = [
    { id: 'mck-p-exp-1', description: 'Aluguel', valor: 3500, date: getCurrentDate(5), status: 'pago', category: 'Moradia', type: 'expense' },
    { id: 'mck-p-exp-2', description: 'Supermercado', valor: 1200, date: getCurrentDate(10), status: 'pago', category: 'Alimentação', type: 'expense' },
    { id: 'mck-p-exp-3', description: 'Lazer Fim de Semana', valor: 500, date: getCurrentDate(15), status: 'pendente', category: 'Lazer', type: 'expense' },
];

export const financialAccounts = [
    { id: 'fa1', nome: 'Conta PJ Itaú', tipo: 'banco', origem: 'empresa', saldoAtual: 15000, banco: 'Itaú' },
    { id: 'fa2', nome: 'Conta PJ Inter', tipo: 'banco', origem: 'empresa', saldoAtual: 5200, banco: 'Inter' },
    { id: 'fa3', nome: 'Reserva Empresa', tipo: 'investimento', origem: 'empresa', saldoAtual: 45000, banco: 'XP' },
    { id: 'fa4', nome: 'Conta PF Nubank', tipo: 'banco', origem: 'pessoal', saldoAtual: 3500, banco: 'Nubank' },
];

export const creditCards = [
    { id: 'cc1', name: 'Nubank PF', limit: 15000, used: 3500, closingDay: 5, dueDay: 12, type: 'pessoal' },
    { id: 'cc2', name: 'Inter PJ', limit: 20000, used: 8200, closingDay: 10, dueDay: 20, type: 'empresa' },
];

export const servicePerformance = []; // Keep empty for now or populate similar logic

export const clients = [
    {
        id: 'c1',
        name: 'Tech Solutions Ltda',
        status: 'Ativo',
        healthScore: 90,
        lastPurchase: getCurrentDate(5),
        internal_data: {
            projects: [
                { id: 'p1', name: 'Refatoração Backend', value: 15000, paid: 5000, status: 'Em andamento' },
                { id: 'p2', name: 'App Mobile', value: 25000, paid: 0, status: 'Pendente' }
            ]
        }
    },
    {
        id: 'c2',
        name: 'Maria Silva Doces',
        status: 'Ativo',
        healthScore: 75,
        lastPurchase: getCurrentDate(10),
        acquisitionChannel: 'Indicação',
        internal_data: {
            contract: { value: 2500 }, // Recurring for Channel Chart
            projects: []
        }
    },
    {
        id: 'c3',
        name: 'Alpha Construtora',
        status: 'Ativo',
        healthScore: 100,
        lastPurchase: getCurrentDate(15),
        acquisitionChannel: 'Google Ads',
        internal_data: {
            contract: { value: 5000 },
            projects: [
                { id: 'p3', name: 'Landing Pages', value: 4500, paid: 4500, status: 'Concluído' }
            ]
        }
    },
];

export const crmDeals = [
    { id: 'd1', title: 'Projeto E-commerce', value: 12000, stage: 'Negociação', probability: 0.8, closingDate: getCurrentDate(25) },
    { id: 'd2', title: 'Consultoria SEO', value: 3000, stage: 'Proposta', probability: 0.5, closingDate: getCurrentDate(28) },
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

// ... unused exports kept for compatibility
export const transfers = [];
export const investments = [];
export const portfolioHistory = [];
export const currencyRates = [];
export const assetOperations = [];
export const salesPipeline = [];
export const cashFlowProjection = [];
export const pendingItems = [];
export const monthlyData = [];
export const channelPerformance = [];
export const channelHistory = [];

export const services = [
    { id: '1', name: 'Gestão de Tráfego', type: 'Recorrente', base_price: 2500, description: 'Gestão de campanhas no Google e Meta Ads', default_checklist: [{ label: 'Setup' }, { label: 'Otimização' }, { label: 'Relatório' }] },
    { id: '2', name: 'Desenvolvimento Web', type: 'Pontual', base_price: 8500, description: 'Criação de sites institucionais e LPs', default_checklist: [{ label: 'Briefing' }, { label: 'Design' }, { label: 'Desenvolvimento' }] },
    { id: '3', name: 'Consultoria de SEO', type: 'Recorrente', base_price: 1500, description: 'Otimização para mecanismos de busca', default_checklist: [{ label: 'Auditoria' }, { label: 'Keywords' }, { label: 'Linkbuilding' }] },
];

export const attributionWeights = {
    'Last Click': { Indicação: 100, LinkedIn: 100, 'Google Ads': 100, Orgânico: 100 },
    'First Touch': { Indicação: 20, LinkedIn: 150, 'Google Ads': 80, Orgânico: 150 },
    'Linear': { Indicação: 100, LinkedIn: 100, 'Google Ads': 100, Orgânico: 100 },
};

export const channelExperiments = [];

export const crmStages = [
    { id: 'Prospecção', label: 'Prospecção', color: 'bg-slate-500' },
    { id: 'Qualificação', label: 'Qualificação', color: 'bg-blue-500' },
    { id: 'Proposta', label: 'Proposta', color: 'bg-yellow-500' },
    { id: 'Negociação', label: 'Negociação', color: 'bg-orange-500' },
    { id: 'Fechado', label: 'Fechado', color: 'bg-green-500' },
    { id: 'Perdido', label: 'Perdido', color: 'bg-red-500' },
];

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
