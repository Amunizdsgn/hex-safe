"use client"

import { useState } from 'react';
import { useFinancialContext } from '@/contexts/FinancialContext';
import {
    companyRevenues,
    companyExpenses,
    personalExpenses,
    servicePerformance,
    formatCurrency,
} from '@/data/mockData';
import { Calculator, AlertCircle } from 'lucide-react';

// New Components
import { DynamicProjection } from '@/components/dashboard/projections/DynamicProjection';
import { GoalGap } from '@/components/dashboard/projections/GoalGap';
import { BillingVelocity } from '@/components/dashboard/projections/BillingVelocity';
import { RevenuePipeline } from '@/components/dashboard/projections/RevenuePipeline';
import { ClosingRisk } from '@/components/dashboard/projections/ClosingRisk';
import { ScenarioSensitivity } from '@/components/dashboard/projections/ScenarioSensitivity';
import { ProjectedCashFlow } from '@/components/dashboard/projections/ProjectedCashFlow';
import { PendingClassification } from '@/components/dashboard/projections/PendingClassification';
import { EfficiencyIndicators } from '@/components/dashboard/projections/EfficiencyIndicators';
import { RecommendedActions } from '@/components/dashboard/projections/RecommendedActions';

export default function ProjectionsPage() {
    const { context } = useFinancialContext();
    const [simulatedExtras, setSimulatedExtras] = useState({ project: false, allPendings: false });
    const [sensitivity, setSensitivity] = useState({ pendingRate: 80, expenseRate: 100 });

    // Company Data Processing
    const monthlyGoal = 80000;
    const workingDays = 22;
    const daysPassed = 12; // Mock current day

    const { transactions } = useFinancialContext(); // Destructure transactions directly
    // ...
    const companyTransactions = transactions.filter(t => t.origem === 'empresa');

    // Heuristics for Revenue vs Expense
    // Revenue: has 'servico' OR type='receita' OR (no category and positive implied) - Mock data is tricky, let's stick to 'servico' keyword existence for revenue in mock, or explicit type.
    const isRevenue = (t) => t.servico || t.type === 'receita' || t.cliente;
    const isExpense = (t) => !isRevenue(t);

    const currentRevenue = companyTransactions
        .filter(t => isRevenue(t) && (t.status === 'pago' || t.status === 'recebido'))
        .reduce((sum, r) => sum + r.valor, 0);

    const pendingRevenue = companyTransactions
        .filter(t => isRevenue(t) && t.status === 'pendente')
        .reduce((sum, r) => sum + r.valor, 0);

    const currentExpenses = companyTransactions
        .filter(t => isExpense(t) && t.status === 'pago')
        .reduce((sum, e) => sum + e.valor, 0);

    const pendingExpenses = companyTransactions
        .filter(t => isExpense(t) && t.status === 'pendente')
        .reduce((sum, e) => sum + e.valor, 0);

    const avgTicket = servicePerformance.reduce((sum, s) => sum + s.ticketMedio, 0) / servicePerformance.length;

    // Simulation Calculations
    let simulatedRevenue = currentRevenue;

    // Add pending revenue based on sensitivity or toggle
    const effectivePendingRate = simulatedExtras.allPendings ? 100 : sensitivity.pendingRate;
    simulatedRevenue += pendingRevenue * (effectivePendingRate / 100);

    // Add simulated project
    if (simulatedExtras.project) {
        simulatedRevenue += 15000; // Average project value mock
    }

    const simulatedExpenses = currentExpenses + (pendingExpenses * (sensitivity.expenseRate / 100));
    const simulatedProfit = simulatedRevenue - simulatedExpenses;
    const simulatedMargin = simulatedRevenue > 0 ? (simulatedProfit / simulatedRevenue) * 100 : 0;

    // Handlers
    const handleToggleProject = (val) => setSimulatedExtras(prev => ({ ...prev, project: val }));
    const handleTogglePendings = (val) => setSimulatedExtras(prev => ({ ...prev, allPendings: val }));
    const handlePendingRateChange = (val) => setSensitivity(prev => ({ ...prev, pendingRate: val }));
    const handleExpenseRateChange = (val) => setSensitivity(prev => ({ ...prev, expenseRate: val }));


    // Personal Context Fallback (unchanged logic, just layout adjustments if needed)
    if (context === 'pessoal') {
        const totalPersonalExpenses = personalExpenses.reduce((sum, e) => sum + e.valor, 0);
        const personalPending = personalExpenses.filter(e => e.status === 'pendente').reduce((sum, e) => sum + e.valor, 0);
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Projeções Pessoais</h2>
                    <p className="text-muted-foreground">Previsão de gastos e impacto no orçamento</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Calculator className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Gastos Projetados</p>
                                <p className="text-2xl font-bold kpi-value">{formatCurrency(totalPersonalExpenses + personalPending)}</p>
                            </div>
                        </div>
                        <div className="space-y-3 mt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Gastos realizados</span>
                                <span className="text-foreground font-medium">{formatCurrency(totalPersonalExpenses - personalPending)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Gastos pendentes</span>
                                <span className="text-warning font-medium">{formatCurrency(personalPending)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Gestão de Projeções</h2>
                <p className="text-muted-foreground">Simulação de cenários e previsibilidade financeira</p>
            </div>

            {/* Top Section: Gap, Pipeline, Velocity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GoalGap
                    current={simulatedRevenue}
                    target={monthlyGoal}
                    avgTicket={avgTicket}
                />
                <BillingVelocity
                    currentRevenue={currentRevenue}
                    monthlyGoal={monthlyGoal}
                    workingDays={workingDays}
                    daysPassed={daysPassed}
                />
                <RevenuePipeline />
            </div>

            {/* Middle Section: Efficiency and Simulation */}
            <EfficiencyIndicators avgTicket={avgTicket} margin={simulatedMargin} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Logic & Controls */}
                <div className="space-y-6">
                    <DynamicProjection
                        baseRevenue={currentRevenue + (pendingRevenue * 0.8)} // Realistic base
                        simulatedRevenue={simulatedRevenue}
                        onToggleProject={handleToggleProject}
                        onTogglePendings={handleTogglePendings}
                        simulatedExtras={simulatedExtras}
                    />
                    <ScenarioSensitivity
                        pendingRate={sensitivity.pendingRate}
                        expenseRate={sensitivity.expenseRate}
                        onPendingChange={handlePendingRateChange}
                        onExpenseChange={handleExpenseRateChange}
                    />
                    <ClosingRisk
                        pendingRevenue={pendingRevenue}
                        totalProjectedRevenue={simulatedRevenue}
                    />
                </div>

                {/* Right Column: Visuals & Data */}
                <div className="lg:col-span-2 space-y-6">
                    <ProjectedCashFlow />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PendingClassification />
                        <RecommendedActions />
                    </div>
                </div>
            </div>

            {/* Summary Footer */}
            <div className="glass-card rounded-xl p-4 border border-primary/20 bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Resumo da Simulação:</span>
                    <span className="text-xs text-muted-foreground">Considerando taxas personalizadas + extras</span>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Lucro Projetado</p>
                    <p className="text-xl font-bold text-success">{formatCurrency(simulatedProfit)}</p>
                </div>
            </div>
        </div>
    );
}
