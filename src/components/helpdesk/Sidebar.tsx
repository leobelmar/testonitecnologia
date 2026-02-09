import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, ModuleName } from '@/hooks/usePermissions';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  FileText,
  DollarSign,
  Settings,
  UserCog,
  LogOut,
  Menu,
  X,
  Building2,
  Wrench,
  UserPlus,
  Shield,
  ScrollText,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import logoAzul from '@/assets/logo-azul.png';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  modulo: ModuleName | null; // null = always visible for role-based (cliente)
  clienteVisible?: boolean; // visible for client role
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/app', icon: LayoutDashboard, modulo: 'dashboard', clienteVisible: true },
  { title: 'Clientes', href: '/app/clientes', icon: Building2, modulo: 'clientes' },
  { title: 'Novo Cliente', href: '/app/clientes/novo', icon: UserPlus, modulo: 'novo_cliente' },
  { title: 'Chamados', href: '/app/chamados', icon: Ticket, modulo: 'chamados', clienteVisible: true },
  { title: 'Ordens de Serviço', href: '/app/ordens-servico', icon: FileText, modulo: 'ordens_servico', clienteVisible: true },
  { title: 'Financeiro', href: '/app/financeiro', icon: DollarSign, modulo: 'financeiro', clienteVisible: true },
  { title: 'Contratos', href: '/app/contratos', icon: ScrollText, modulo: 'contratos', clienteVisible: true },
  { title: 'Estoque', href: '/app/estoque', icon: Package, modulo: 'estoque' },
  { title: 'Técnicos', href: '/app/tecnicos', icon: Wrench, modulo: 'tecnicos' },
  { title: 'Usuários', href: '/app/usuarios', icon: UserCog, modulo: 'usuarios' },
  { title: 'Auditoria', href: '/app/auditoria', icon: Shield, modulo: 'auditoria' },
  { title: 'Configurações', href: '/app/configuracoes', icon: Settings, modulo: 'configuracoes' },
];

export function Sidebar() {
  const { profile, signOut, isCliente } = useAuth();
  const { canRead, loading: permissionsLoading } = usePermissions();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = navItems.filter((item) => {
    // Clientes usam acesso fixo
    if (isCliente) return item.clienteVisible ?? false;
    // Para outros usuários, verificar permissão de leitura
    if (!item.modulo) return true;
    return canRead(item.modulo);
  });

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 bg-navy text-white transition-transform lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-white/10 px-4">
            <img src={logoAzul} alt="Testoni Tecnologia" className="h-8 brightness-0 invert" />
          </div>

          {/* User Info */}
          <div className="border-b border-white/10 p-4">
            <p className="text-sm font-medium truncate">{profile?.nome}</p>
            <p className="text-xs text-white/60 capitalize">{profile?.role}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {filteredItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="border-t border-white/10 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-white/70 hover:bg-white/5 hover:text-white"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
