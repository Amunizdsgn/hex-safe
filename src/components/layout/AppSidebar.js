"use client"

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Receipt,
    TrendingUp,
    Megaphone,
    LineChart,
    Wallet,
    PiggyBank,
    Users,
    Kanban,
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import { useFinancialContext } from '@/contexts/FinancialContext';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, contexts: ['empresa', 'pessoal', 'consolidado'] },
    { path: '/dashboard/contas', label: 'Contas', icon: Receipt, contexts: ['empresa', 'pessoal', 'consolidado'] },
    { path: '/dashboard/servicos', label: 'Serviços', icon: TrendingUp, contexts: ['empresa'] },
    { path: '/dashboard/clientes', label: 'Clientes', icon: Users, contexts: ['empresa'] },
    { path: '/dashboard/crm', label: 'CRM', icon: Kanban, contexts: ['empresa'] },
    { path: '/dashboard/canais', label: 'Canais', icon: Megaphone, contexts: ['empresa'] },
    { path: '/dashboard/projecoes', label: 'Projeções', icon: LineChart, contexts: ['empresa', 'pessoal'] },
    { path: '/dashboard/investimentos', label: 'Investimentos', icon: PiggyBank, contexts: ['empresa', 'pessoal', 'consolidado'] },
    { path: '/dashboard/carteiras', label: 'Carteiras', icon: Wallet, contexts: ['empresa', 'pessoal', 'consolidado'] },
];

export function AppSidebar({ ...props }) {
    const { context } = useFinancialContext();
    const pathname = usePathname();
    const filteredItems = navItems.filter(item => item.contexts.includes(context));

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-sidebar-border bg-sidebar">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <span className="font-bold text-sm">FI</span>
                    </div>
                    <span className="font-semibold text-foreground group-data-[collapsible=icon]:hidden">Hex Safe</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu className="px-2">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.path;

                        return (
                            <SidebarMenuItem key={item.path}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={item.label}
                                    className="transition-all duration-200"
                                >
                                    <Link href={item.path}>
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <div className="p-2 group-data-[collapsible=icon]:hidden">
                    <div className="rounded-md border bg-card p-2 text-xs text-muted-foreground">
                        <p>Última atualização</p>
                        <p className="text-foreground font-medium">Hoje, 14:32</p>
                    </div>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
