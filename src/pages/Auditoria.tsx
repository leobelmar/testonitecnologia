import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Eye, Shield, LogIn, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_nome: string | null;
  acao: string;
  tabela: string | null;
  registro_id: string | null;
  dados_anteriores: Record<string, unknown> | null;
  dados_novos: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  detalhes: string | null;
  created_at: string;
}

const tabelaLabels: Record<string, string> = {
  chamados: 'Chamados',
  clientes: 'Clientes',
  ordens_servico: 'Ordens de Serviço',
  faturas: 'Faturas',
  despesas: 'Despesas',
  profiles: 'Perfis',
  convites: 'Convites',
  planos: 'Planos',
};

const acaoConfig: Record<string, { label: string; color: string; icon: typeof LogIn }> = {
  login: { label: 'Login', color: 'bg-blue-100 text-blue-800', icon: LogIn },
  insert: { label: 'Criação', color: 'bg-green-100 text-green-800', icon: Plus },
  update: { label: 'Alteração', color: 'bg-yellow-100 text-yellow-800', icon: Pencil },
  delete: { label: 'Exclusão', color: 'bg-red-100 text-red-800', icon: Trash2 },
};

export default function Auditoria() {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [acaoFilter, setAcaoFilter] = useState('todos');
  const [tabelaFilter, setTabelaFilter] = useState('todos');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs((data as AuditLog[]) || []);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchTerm ||
      log.user_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detalhes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tabela?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAcao = acaoFilter === 'todos' || log.acao === acaoFilter;
    const matchesTabela = tabelaFilter === 'todos' || log.tabela === tabelaFilter;

    return matchesSearch && matchesAcao && matchesTabela;
  });

  const getChangedFields = (oldData: Record<string, unknown> | null, newData: Record<string, unknown> | null) => {
    if (!oldData || !newData) return null;
    const changes: { field: string; old: unknown; new: unknown }[] = [];
    const ignoreFields = ['updated_at', 'created_at'];
    
    for (const key of Object.keys(newData)) {
      if (ignoreFields.includes(key)) continue;
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes.push({ field: key, old: oldData[key], new: newData[key] });
      }
    }
    return changes;
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Auditoria
          </h1>
          <p className="text-muted-foreground">Registro de todas as ações realizadas no sistema</p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={acaoFilter} onValueChange={setAcaoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as ações</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="insert">Criação</SelectItem>
                <SelectItem value="update">Alteração</SelectItem>
                <SelectItem value="delete">Exclusão</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tabelaFilter} onValueChange={setTabelaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os módulos</SelectItem>
                {Object.entries(tabelaLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            {filteredLogs.length} registro(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : filteredLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum registro encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead className="w-[60px]">Ver</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const config = acaoConfig[log.acao] || acaoConfig.update;
                    const Icon = config.icon;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{log.user_nome || 'Sistema'}</p>
                            <p className="text-xs text-muted-foreground">{log.user_email || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={config.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.tabela ? tabelaLabels[log.tabela] || log.tabela : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {log.detalhes || '-'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalhes */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Registro de Auditoria</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Data/Hora</p>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedLog.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Usuário</p>
                    <p className="text-sm font-medium">{selectedLog.user_nome || 'Sistema'}</p>
                    <p className="text-xs text-muted-foreground">{selectedLog.user_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ação</p>
                    <Badge className={acaoConfig[selectedLog.acao]?.color || ''}>
                      {acaoConfig[selectedLog.acao]?.label || selectedLog.acao}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Módulo</p>
                    <p className="text-sm">{selectedLog.tabela ? tabelaLabels[selectedLog.tabela] || selectedLog.tabela : '-'}</p>
                  </div>
                  {selectedLog.ip_address && (
                    <div>
                      <p className="text-xs text-muted-foreground">IP</p>
                      <p className="text-sm font-mono">{selectedLog.ip_address}</p>
                    </div>
                  )}
                  {selectedLog.registro_id && (
                    <div>
                      <p className="text-xs text-muted-foreground">ID do Registro</p>
                      <p className="text-sm font-mono text-xs">{selectedLog.registro_id}</p>
                    </div>
                  )}
                </div>

                {selectedLog.acao === 'update' && selectedLog.dados_anteriores && selectedLog.dados_novos && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Campos Alterados</p>
                    <div className="bg-muted rounded-lg p-3 space-y-2">
                      {getChangedFields(selectedLog.dados_anteriores, selectedLog.dados_novos)?.map((change, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium">{change.field}:</span>{' '}
                          <span className="text-red-600 line-through">{String(change.old ?? 'vazio')}</span>
                          {' → '}
                          <span className="text-green-600">{String(change.new ?? 'vazio')}</span>
                        </div>
                      )) || <p className="text-sm text-muted-foreground">Nenhuma alteração detectada</p>}
                    </div>
                  </div>
                )}

                {selectedLog.acao === 'insert' && selectedLog.dados_novos && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Dados do Registro Criado</p>
                    <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.dados_novos, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.acao === 'delete' && selectedLog.dados_anteriores && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Dados do Registro Excluído</p>
                    <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.dados_anteriores, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
