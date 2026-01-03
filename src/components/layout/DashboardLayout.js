"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Header } from "./Header"
import { FinancialProvider } from "@/contexts/FinancialContext"

export default function DashboardLayout({ children }) {
  return (
    <FinancialProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col min-h-screen">
            <div className="flex items-center">
              {/* Mobile Trigger handles sidebar opening on mobile */}
              <div className="md:hidden p-4 pb-0">
                <SidebarTrigger />
              </div>
              <div className="flex-1 w-full">
                <Header />
              </div>
            </div>
            {/* Desktop Trigger if needed, but header handles settings. Let's keep cleaner for now */}
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </FinancialProvider>
  )
}
