export const ANALYSIS_THRESHOLDS = {
    RECURRING_MONTHS: 6,
    RISK_MONTHS: 2,
    HIGH_TICKET: 5000,
};

export function analyzeClient(client, allTransactions = []) {
    if (!client) return null;

    // Filter transactions for this client
    const clientTransactions = allTransactions.filter(t =>
        t.origem === 'empresa' &&
        ((t.cliente && t.cliente.toLowerCase() === client.name.toLowerCase()) ||
            (t.clientId && t.clientId === client.id))
    ).sort((a, b) => new Date(b.data) - new Date(a.data));

    // Basic Metrics
    const totalSpent = client.ltv || 0; // Assuming LTV in client object is up to date or we calculate from txs
    const projectCount = (client.projects || []).length;
    // computedTotalSpent: Sum of ALL transactions linked to client (for raw volume)
    const computedTotalSpent = clientTransactions.reduce((acc, tx) => acc + (tx.valor || 0), 0);

    // totalCollected: Sum of ONLY COMPLETED transactions (Cash in hand / Grana no bolso)
    const totalCollected = clientTransactions
        .filter(tx => ['completed', 'pago', 'recebido'].includes(tx.status?.toLowerCase()))
        .reduce((acc, tx) => acc + (tx.valor || 0), 0);

    // Check for Manual LTV override
    let finalLTV = computedTotalSpent > 0 ? computedTotalSpent : totalSpent;

    if (client.internalData?.useManualLtv) {
        // Safe parsing for manual value (handling "1000", "1000.00", "1.000,00")
        const manualStr = String(client.internalData.manualLtv || '0').replace('R$', '').trim();
        // If it sends comma, replace with dot. If it has both dots and commas, assume dot is thousands separator IF comma is present later.
        // Simplest strategy for "Pt-BR": Replace dots with empty, replace comma with dot.
        // But if user typed "1000.50" (US style)?
        // Let's try standard JS cast first, if NaN, try BR format.
        let manualVal = Number(manualStr);
        if (isNaN(manualVal)) {
            manualVal = parseFloat(manualStr.replace(/\./g, '').replace(',', '.'));
        }
        finalLTV = !isNaN(manualVal) ? manualVal : 0;
    }

    const lastTransaction = clientTransactions[0];
    const firstTransaction = clientTransactions[clientTransactions.length - 1];

    const lastDate = lastTransaction ? new Date(lastTransaction.data) : (client.lastPurchase ? new Date(client.lastPurchase) : null);
    const firstDate = firstTransaction ? new Date(firstTransaction.data) : (client.joinedDate ? new Date(client.joinedDate) : null);

    const now = new Date();
    const daysSinceLastPurchase = lastDate ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)) : 999;
    const clientAgeDays = firstDate ? Math.floor((now - firstDate) / (1000 * 60 * 60 * 24)) : 0;
    const clientAgeMonths = clientAgeDays / 30;

    // 1. Relationship Classification
    let relationship = 'Pontual';
    let recurrencePotential = 'Baixo';

    if (projectCount >= 2 && clientAgeMonths > 3) {
        if (daysSinceLastPurchase < 60) {
            relationship = 'Recorrente';
            recurrencePotential = 'Alto';
        } else if (daysSinceLastPurchase < 120) {
            relationship = 'Em Risco';
            recurrencePotential = 'Médio';
        } else {
            relationship = 'Inativo'; // Was recurring, now churned?
            recurrencePotential = 'Médio'; // Can be recovered
        }
    } else if (finalLTV > ANALYSIS_THRESHOLDS.HIGH_TICKET) {
        relationship = 'Potencial Recorrente'; // Big spender, maybe one-off but valuable
        recurrencePotential = 'Alto';
    } else if (projectCount === 1) {
        relationship = 'Pontual';
        recurrencePotential = 'Médio';
    }

    // 2. Health Score
    let healthScore = 'Saudável';
    if (relationship === 'Em Risco' || relationship === 'Inativo') healthScore = 'Atenção';
    if (daysSinceLastPurchase > 180 && relationship === 'Recorrente') healthScore = 'Crítico';

    // Effort (Mocked logic based on tags for now)
    const complexTags = ['Refação', 'Urgente', 'Complexo'];
    const hasComplexTags = (client.tags || []).some(t => complexTags.includes(t));
    const effort = hasComplexTags ? 'Alto' : 'Baixo';
    // If effort is high and margin is low (implied by low LTV/project?), health drops
    if (effort === 'Alto' && (finalLTV / (projectCount || 1)) < 1000) {
        healthScore = 'Atenção';
    }

    // 3. Insights / Recommendations
    const insights = [];
    if (relationship === 'Recorrente' && daysSinceLastPurchase > 45) {
        insights.push({ type: 'warning', text: 'Cliente recorrente sem compra há 45 dias. Fazer contato.' });
    }
    if (recurrencePotential === 'Alto' && relationship === 'Pontual') {
        insights.push({ type: 'opportunity', text: 'Cliente de alto valor. Oferecer plano de recorrência.' });
    }
    if (effort === 'Alto' && healthScore !== 'Crítico') {
        insights.push({ type: 'info', text: 'Cliente demanda alto esforço. Avaliar precificação do próximo projeto.' });
    }
    if (daysSinceLastPurchase > 90 && finalLTV > 0) {
        insights.push({ type: 'recovery', text: 'Cliente inativo. Enviar oferta de reativação.' });
    }

    return {
        ...client,
        metrics: {
            totalLTV: finalLTV,
            avgTicket: finalLTV / (projectCount || 1),
            daysSinceLastPurchase,
            clientAgeMonths,
            daysSinceLastPurchase,
            clientAgeMonths,
            projectCount,
            totalCollected // New metric: Cash Collected
        },
        classification: {
            relationship,
            recurrencePotential,
            healthScore,
            effort
        },
        insights,
        transactions: clientTransactions
    };
}
