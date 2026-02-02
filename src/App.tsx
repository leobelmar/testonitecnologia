import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/helpdesk/AppLayout";

// Pages - Site institucional
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Pages - Sistema Help Desk
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Chamados from "./pages/Chamados";
import NovoChamado from "./pages/NovoChamado";
import ChamadoDetalhes from "./pages/ChamadoDetalhes";
import OrdensServico from "./pages/OrdensServico";
import Financeiro from "./pages/Financeiro";
import Usuarios from "./pages/Usuarios";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Site institucional */}
            <Route path="/" element={<Index />} />

            {/* Autenticação */}
            <Route path="/auth" element={<Auth />} />

            {/* Sistema Help Desk (protegido) */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="chamados" element={<Chamados />} />
              <Route path="chamados/novo" element={<NovoChamado />} />
              <Route path="chamados/:id" element={<ChamadoDetalhes />} />
              <Route path="ordens-servico" element={<OrdensServico />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route path="usuarios" element={<Usuarios />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
