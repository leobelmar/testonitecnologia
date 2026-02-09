import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTecnicoDashboard, DashboardItem } from '@/hooks/useTecnicoDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ChamadoDialog } from '@/components/chamados/ChamadoDialog';
import { TecnicoListView } from './TecnicoListView';
import { TecnicoKanbanView } from './TecnicoKanbanView';
import {
  AlertTriangle, Clock, List, LayoutGrid, Search,
  Loader2, RefreshCw, Ticket, FileText, CheckCircle,
} from 'lucide-react';

export function TecnicoDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const {
    items, loading, viewMode, setViewMode,
    filters, setFilters, sortBy, setSortBy,
    clientes, stats, refresh,
  } = useTecnicoDashboard();

  const [quickViewChamadoId, setQuickViewChamadoId] = useState<string | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleQuickView = (item: DashboardItem) => {
    if (item.tipo === 'chamado') {
      setQuickViewChamadoId(item.id);
      setQuickViewOpen(true);
    } else {
      // OS → page completa
      navigate(`/app/ordens-servico/${item.id}`);
    }
  };

  const handleFullPage = (item: DashboardItem) => {
    if (item.tipo === 'chamado') {
      navigate(`/app/chamados/${item.id}`);
    } else {
      navigate(`/app/ordens-servico/${item.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Olá, {profile?.nome?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Painel de atendimentos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'lista' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('lista')}
          >
            <List className="h-4 w-4 mr-1" />
            Lista
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Kanban
          </Button>
          <Button variant="ghost" size="icon" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total</CardTitle>
            <Ticket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className={stats.criticos > 0 ? 'border-red-300' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-red-600">{stats.criticos}</div>
          </CardContent>
        </Card>
        <Card className={stats.alertas > 0 ? 'border-yellow-300' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Alertas</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.alertas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Em Atend.</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-accent">{stats.emAtendimento}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Aguardando</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{stats.aguardando}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid gap-3 md:grid-cols-6">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="aberto">Aberto</SelectItem>
                <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                <SelectItem value="aguardando_cliente">Aguard. Cliente</SelectItem>
                <SelectItem value="aberta">OS Aberta</SelectItem>
                <SelectItem value="em_execucao">OS Em Execução</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sla} onValueChange={(v) => setFilters({ ...filters, sla: v })}>
              <SelectTrigger><SelectValue placeholder="SLA" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos SLA</SelectItem>
                <SelectItem value="critico">🔴 Crítico</SelectItem>
                <SelectItem value="alerta">🟡 Alerta</SelectItem>
                <SelectItem value="normal">🟢 Normal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.cliente} onValueChange={(v) => setFilters({ ...filters, cliente: v })}>
              <SelectTrigger><SelectValue placeholder="Cliente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Clientes</SelectItem>
                {clientes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger><SelectValue placeholder="Ordenar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mais_critico">Mais Crítico</SelectItem>
                <SelectItem value="mais_antigo">Mais Antigo</SelectItem>
                <SelectItem value="ultima_interacao">Última Interação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : viewMode === 'lista' ? (
        <TecnicoListView items={items} onQuickView={handleQuickView} />
      ) : (
        <TecnicoKanbanView items={items} onQuickView={handleQuickView} />
      )}

      {/* ChamadoDialog for quick view */}
      <ChamadoDialog
        chamadoId={quickViewChamadoId}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
        onChamadoUpdated={refresh}
      />
    </div>
  );
}
