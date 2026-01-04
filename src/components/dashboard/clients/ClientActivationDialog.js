
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, FileText, CheckCircle2, UserCheck, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext'; // Import context for channels

export function ClientActivationDialog({ isOpen, onClose, client, onConfirm }) {
    const { channels } = useFinancialContext();
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1 State: Basic Data
    const [clientName, setClientName] = useState(client?.name || '');
    const [acquisitionChannel, setAcquisitionChannel] = useState(client?.acquisitionChannel || '');
    const [contractValue, setContractValue] = useState(client?.internalData?.contract?.value || '');
    const [billingDay, setBillingDay] = useState(client?.internalData?.recurrentSettings?.billingDay || '5');
    const [relationshipType, setRelationshipType] = useState(client?.internalData?.relationshipType || 'Recorrente');
    const [contactName, setContactName] = useState(client?.internalData?.contactName || '');

    useEffect(() => {
        if (isOpen && client) {
            setClientName(client.name || '');
            setAcquisitionChannel(client.acquisitionChannel || '');
            setContractValue(client.internalData?.contract?.value || '');
            setBillingDay(client.internalData?.recurrentSettings?.billingDay || '5');
            setRelationshipType(client.internalData?.relationshipType || 'Recorrente');
            setContactName(client.internalData?.contactName || '');
            setCurrentStep(1); // Reset to step 1
        }
    }, [client, isOpen]);

    // Step 2 State: Checklist
    const [steps, setSteps] = useState([
        { id: 'contract', label: 'Contrato Assinado e Validado', checked: false, icon: FileText },
        { id: 'finance', label: 'Dados Financeiros (LTV/CAC) Definidos', checked: false, icon: DollarSignIcon },
        { id: 'onboarding', label: 'Onboarding Agendado/Realizado', checked: false, icon: Calendar },
        { id: 'access', label: 'Acessos e Ferramentas Configurados', checked: false, icon: ShieldCheck },
        { id: 'kickoff', label: 'Reunião de Kick-off Realizada', checked: false, icon: UserCheck },
    ]);

    const handleStepChange = (id) => {
        setSteps(prev => prev.map(step =>
            step.id === id ? { ...step, checked: !step.checked } : step
        ));
    };

    const allChecked = steps.every(s => s.checked);

    const handleNext = () => {
        if (currentStep === 1) {
            // Validate minimal data if needed
            setCurrentStep(2);
        } else {
            // Confirm Activation
            onConfirm(steps, {
                name: clientName,
                acquisitionChannel,
                contractValue,
                billingDay,
                relationshipType
            });
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    // Helper for icon component
    function DollarSignIcon(props) {
        return (
            <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" x2="12" y1="2" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        )
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] glass-card border-border/50 text-foreground p-0 overflow-hidden">
                <div className="p-6 bg-secondary/5 border-b border-border/50">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            {currentStep === 1 ? 'Confirmação de Dados (1/2)' : 'Checklist de Ativação (2/2)'}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {currentStep === 1
                                ? 'Revise os dados principais vindos do CRM ou adicione novas informações.'
                                : `Complete o checklist para finalizar a ativação de ${clientName}.`}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label>Nome do Cliente</Label>
                                    <Input value={clientName} onChange={e => setClientName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Canal de Aquisição</Label>
                                    <Select value={acquisitionChannel} onValueChange={setAcquisitionChannel}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {channels?.filter(c => c.active).map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo de Relacionamento</Label>
                                    <div className="flex gap-2 p-1 bg-background/50 rounded-lg border border-border/50 h-10 items-center">
                                        <button
                                            onClick={() => setRelationshipType('Recorrente')}
                                            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all h-full ${relationshipType === 'Recorrente' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/20'}`}
                                        >
                                            Recorrente
                                        </button>
                                        <button
                                            onClick={() => setRelationshipType('Pontual')}
                                            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all h-full ${relationshipType === 'Pontual' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/20'}`}
                                        >
                                            Pontual
                                        </button>
                                    </div>
                                </div>
                                <div className={relationshipType === 'Recorrente' ? "" : "col-span-2"}>
                                    <Label>Valor do Contrato (R$)</Label>
                                    <Input type="number" value={contractValue} onChange={e => setContractValue(e.target.value)} placeholder="0,00" />
                                </div>
                                {relationshipType === 'Recorrente' && (
                                    <div className="space-y-2">
                                        <Label>Dia de Vencimento</Label>
                                        <Input type="number" min="1" max="31" value={billingDay} onChange={e => setBillingDay(e.target.value)} placeholder="5" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div className="bg-secondary/10 p-4 rounded-lg border border-border/50 mb-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Valor Definido:</span>
                                    <span className="font-bold text-success">R$ {parseFloat(contractValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-muted-foreground" /> Checklist Pendente
                            </h3>
                            {steps.map((step) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.id} className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${step.checked ? 'bg-primary/10 border-primary/20' : 'bg-card border-border/50 hover:border-primary/20'}`}>
                                        <Checkbox
                                            id={step.id}
                                            checked={step.checked}
                                            onCheckedChange={() => handleStepChange(step.id)}
                                            className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor={step.id}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                                            >
                                                <Icon className={`w-4 h-4 ${step.checked ? 'text-primary' : 'text-muted-foreground'}`} />
                                                {step.label}
                                            </Label>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-2 bg-secondary/5">
                    {currentStep === 1 ? (
                        <>
                            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                            <Button onClick={handleNext} className="gap-2">
                                Próximo <ArrowRight className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={handleBack} className="gap-2">
                                <ArrowLeft className="w-4 h-4" /> Voltar
                            </Button>
                            <Button
                                onClick={handleNext}
                                className={`gap-2 transition-all ${allChecked ? 'bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20' : 'bg-primary hover:bg-primary/90'}`}
                            >
                                {allChecked ? 'Confirmar Ativação' : 'Ativar com Pendências'} <ArrowRight className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
