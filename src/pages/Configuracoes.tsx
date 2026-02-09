import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Settings } from 'lucide-react';

export default function Configuracoes() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:border-navy/30 transition-colors"
          onClick={() => navigate('/app/configuracoes/perfis')}
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Shield className="h-8 w-8 text-navy" />
            <div>
              <CardTitle className="text-lg">Perfis de Permissão</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Crie e gerencie perfis de acesso com permissões por módulo
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
