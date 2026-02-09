import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/helpdesk/AppLayout";
import { ProtectedRoute } from "@/components/helpdesk/ProtectedRoute";

// Pages - Site institucional
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Pages - Sistema Help Desk
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import NovoCliente from "./pages/NovoCliente";
import Chamados from "./pages/Chamados";
import NovoChamado from "./pages/NovoChamado";
import ChamadoDetalhes from "./pages/ChamadoDetalhes";
import OrdensServico from "./pages/OrdensServico";
import NovaOS from "./pages/NovaOS";
import OSDetalhes from "./pages/OSDetalhes";
import Financeiro from "./pages/Financeiro";
import Usuarios from "./pages/Usuarios";
import Tecnicos from "./pages/Tecnicos";
import Auditoria from "./pages/Auditoria";
import Contratos from "./pages/Contratos";
import NovoContrato from "./pages/NovoContrato";
import ContratoDetalhes from "./pages/ContratoDetalhes";
import Estoque from "./pages/Estoque";
import Configuracoes from "./pages/Configuracoes";
import PerfisPermissao from "./pages/PerfisPermissao";

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
              <Route index element={<ProtectedRoute modulo="dashboard"><Dashboard /></ProtectedRoute>} />
              <Route path="clientes" element={<ProtectedRoute modulo="clientes"><Clientes /></ProtectedRoute>} />
              <Route path="clientes/novo" element={<ProtectedRoute modulo="novo_cliente" requireEdit><NovoCliente /></ProtectedRoute>} />
              <Route path="chamados" element={<ProtectedRoute modulo="chamados"><Chamados /></ProtectedRoute>} />
              <Route path="chamados/novo" element={<ProtectedRoute modulo="chamados" requireEdit><NovoChamado /></ProtectedRoute>} />
              <Route path="chamados/:id" element={<ProtectedRoute modulo="chamados"><ChamadoDetalhes /></ProtectedRoute>} />
              <Route path="ordens-servico" element={<ProtectedRoute modulo="ordens_servico"><OrdensServico /></ProtectedRoute>} />
              <Route path="ordens-servico/nova" element={<ProtectedRoute modulo="ordens_servico" requireEdit><NovaOS /></ProtectedRoute>} />
              <Route path="ordens-servico/:id" element={<ProtectedRoute modulo="ordens_servico"><OSDetalhes /></ProtectedRoute>} />
              <Route path="financeiro" element={<ProtectedRoute modulo="financeiro"><Financeiro /></ProtectedRoute>} />
              <Route path="usuarios" element={<ProtectedRoute modulo="usuarios"><Usuarios /></ProtectedRoute>} />
              <Route path="tecnicos" element={<ProtectedRoute modulo="tecnicos"><Tecnicos /></ProtectedRoute>} />
              <Route path="auditoria" element={<ProtectedRoute modulo="auditoria"><Auditoria /></ProtectedRoute>} />
              <Route path="contratos" element={<ProtectedRoute modulo="contratos"><Contratos /></ProtectedRoute>} />
              <Route path="contratos/novo" element={<ProtectedRoute modulo="contratos" requireEdit><NovoContrato /></ProtectedRoute>} />
              <Route path="contratos/:id" element={<ProtectedRoute modulo="contratos"><ContratoDetalhes /></ProtectedRoute>} />
              <Route path="estoque" element={<ProtectedRoute modulo="estoque"><Estoque /></ProtectedRoute>} />
              <Route path="configuracoes" element={<ProtectedRoute modulo="configuracoes"><Configuracoes /></ProtectedRoute>} />
              <Route path="configuracoes/perfis" element={<ProtectedRoute modulo="configuracoes"><PerfisPermissao /></ProtectedRoute>} />
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
