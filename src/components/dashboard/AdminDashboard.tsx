import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Ticket, FileText, DollarSign, Users,
  AlertTriangle, Clock, CheckCircle, Plus,
} from 'lucide-react';

interface DashboardStats {
  chamadosAbertos: number;
  chamadosUrgentes: number;
  osEmAndamento: number;
  faturasAbertas: number;
  totalClientes: number;
  valorAReceber: number;
}

interface ChamadoRecente {
  id: string;
  numero: number;
  titulo: string;
  prioridade: string;
  status: string;
  created_at: string;
  cliente?: { nome_empresa: string } | null;
}

export function AdminDashboard() {
  const { profile, isAdmin, isFinanceiro, isCliente } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    chamadosAbertos: 0, chamadosUrgentes: 0, osEmAndamento: 0,
    faturasAbertas: 0, totalClientes: 0, valorAReceber: 0,
  });
  const [chamadosRecentes, setChamadosRecentes] = useState<ChamadoRecente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;
    try {
      const { count: chamadosAbertos } = await supabase
        .from('chamados')
        .select('*', { count: 'exact', head: true })
        .in('status', ['aberto', 'em_atendimento', 'aguardando_cliente', 'aguardando_terceiros']);

      const { count: chamadosUrgentes } = await supabase
        .from('chamados')
        .select('*', { count: 'exact', head: true })
        .eq('prioridade', 'urgente')
        .in('status', ['aberto', 'em_atendimento']);

      const { count: osEmAndamento } = await supabase
        .from('ordens_servico')
        .select('*', { count: 'exact', head: true })
        .in('status', ['aberta', 'em_execucao']);

      const { data: faturasData } = await supabase
        .from('faturas')
        .select('valor_total')
        .eq('status', 'em_aberto');

      const faturasAbertas = faturasData?.length || 0;
      const valorAReceber = faturasData?.reduce((acc, f) => acc + Number(f.valor_total), 0) || 0;

      let totalClientes = 0;
      if (isAdmin || isFinanceiro) {
        const { count } = await supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo');
        totalClientes = count || 0;
      }

      setStats({
        chamadosAbertos: chamadosAbertos || 0,
        chamadosUrgentes: chamadosUrgentes || 0,
        osEmAndamento: osEmAndamento || 0,
        faturasAbertas, totalClientes, valorAReceber,
      });

      const { data: chamados } = await supabase
        .from('chamados')
        .select('id, numero, titulo, prioridade, status, created_at, cliente:clientes(nome_empresa)')
        .order('created_at', { ascending: false })
        .limit(5);

      setChamadosRecentes(chamados as ChamadoRecente[] || []);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const colors: Record<string, string> = {
      baixa: 'bg-green-100 text-green-800',
      media: 'bg-yellow-100 text-yellow-800',
      alta: 'bg-orange-100 text-orange-800',
      urgente: 'bg-red-100 text-red-800',
    };
    return colors[prioridade] || 'bg-muted text-muted-foreground';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      aberto: 'bg-blue-100 text-blue-800',
      em_atendimento: 'bg-purple-100 text-purple-800',
      aguardando_cliente: 'bg-yellow-100 text-yellow-800',
      aguardando_terceiros: 'bg-orange-100 text-orange-800',
      finalizado: 'bg-green-100 text-green-800',
      cancelado: 'bg-muted text-muted-foreground',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const formatStatus = (status: string) => {
    const labels: Record<string, string> = {
      aberto: 'Aberto', em_atendimento: 'Em Atendimento',
      aguardando_cliente: 'Aguard. Cliente', aguardando_terceiros: 'Aguard. Terceiros',
      finalizado: 'Finalizado', cancelado: 'Cancelado',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Olá, {profile?.nome?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Bem-vindo ao painel de controle</p>
        </div>
        {(isAdmin || isCliente) && (
          <Button asChild>
            <Link to="/app/chamados/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Chamado
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chamados Abertos</CardTitle>
            <Ticket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.chamadosAbertos}</div>
            {stats.chamadosUrgentes > 0 && (
              <p className="text-xs text-destructive flex items-center mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />{stats.chamadosUrgentes} urgente(s)
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">OS em Andamento</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.osEmAndamento}</div>
          </CardContent>
        </Card>
        {(isAdmin || isFinanceiro || isCliente) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Faturas em Aberto</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.faturasAbertas}</div>
              <p className="text-xs text-muted-foreground mt-1">
                R$ {stats.valorAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        )}
        {(isAdmin || isFinanceiro) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalClientes}</div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chamados Recentes</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/chamados">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-4">Carregando...</p>
          ) : chamadosRecentes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhum chamado encontrado</p>
          ) : (
            <div className="space-y-4">
              {chamadosRecentes.map((chamado) => (
                <Link
                  key={chamado.id}
                  to={`/app/chamados/${chamado.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">#{chamado.numero}</span>
                      <span className="text-sm text-muted-foreground truncate">{chamado.titulo}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{chamado.cliente?.nome_empresa}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={getPrioridadeBadge(chamado.prioridade)}>{chamado.prioridade}</Badge>
                    <Badge className={getStatusBadge(chamado.status)}>{formatStatus(chamado.status)}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
