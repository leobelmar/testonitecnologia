import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, ModuleName } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  modulo: ModuleName;
  requireEdit?: boolean;
  children: React.ReactNode;
}

export function ProtectedRoute({ modulo, requireEdit = false, children }: ProtectedRouteProps) {
  const { isCliente } = useAuth();
  const { canRead, canEdit, loading } = usePermissions();

  // Clientes têm acesso próprio via RLS, não precisam de verificação de módulo
  if (isCliente) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-navy" />
      </div>
    );
  }

  const hasPermission = requireEdit ? canEdit(modulo) : canRead(modulo);

  if (!hasPermission) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-lg font-semibold text-muted-foreground">Acesso Negado</p>
        <p className="text-sm text-muted-foreground">
          Você não tem permissão para acessar este módulo.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
