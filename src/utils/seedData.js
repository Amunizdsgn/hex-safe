
export const sampleDeals = [
    {
        title: 'Projeto E-commerce - Loja Y',
        value: 15000,
        stage: 'Proposta',
        probability: 0.6,
        priority: 'High',
        contactName: 'Carlos Silva',
        closingDate: '2026-01-25',
        description: 'Desenvolvimento de loja virtual completa.'
    },
    {
        title: 'Consultoria SEO - Grupo Z',
        value: 4000,
        stage: 'Negociação',
        probability: 0.8,
        priority: 'Medium',
        contactName: 'Ana Souza',
        closingDate: '2026-01-15',
        description: 'Otimização mensal de SEO.'
    },
    {
        title: 'App Delivery - Restaurante A',
        value: 25000,
        stage: 'Qualificação',
        probability: 0.3,
        priority: 'High',
        contactName: 'Roberto Junior',
        closingDate: '2026-02-10',
        description: 'App nativo para iOS e Android.'
    },
    {
        title: 'Gestão de Tráfego - Cliente B',
        value: 2500,
        stage: 'Prospecção',
        probability: 0.1,
        priority: 'Medium',
        contactName: 'Fernanda Lima',
        closingDate: '2026-02-05',
        description: 'Campanhas Google e Meta Ads.'
    }
];

export const generateTestDeals = async (addDealFunc) => {
    let count = 0;
    for (const deal of sampleDeals) {
        // Add a small delay to avoid overwhelming simple backends or rate limits if any
        await new Promise(r => setTimeout(r, 100));
        await addDealFunc({
            ...deal,
            id: `temp-seed-${Date.now()}-${count++}`, // Temp ID, will be replaced by DB
        });
    }
    return count;
};
