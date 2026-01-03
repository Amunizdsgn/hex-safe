import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinancialProvider } from "@/contexts/FinancialContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Services from "./pages/Services";
import Channels from "./pages/Channels";
import Projections from "./pages/Projections";
import Investments from "./pages/Investments";
import Wallets from "./pages/Wallets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FinancialProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/contas" element={<Accounts />} />
              <Route path="/servicos" element={<Services />} />
              <Route path="/canais" element={<Channels />} />
              <Route path="/projecoes" element={<Projections />} />
              <Route path="/investimentos" element={<Investments />} />
              <Route path="/carteiras" element={<Wallets />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </FinancialProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
