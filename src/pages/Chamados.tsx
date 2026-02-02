import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Chamado, Cliente } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Search, Eye, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Chamados() {
  const { isAdmin, isTecnico, isCliente } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>('todas');

  useEffect(() => {
    fetchChamados();
  }, []);

  const fetchChamados = async () => {
    try {
      const { data, error } = await supabase
        .from('chamados')
        .select(`
          *,
          cliente:clientes(id, nome_empresa)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChamados(data as Chamado[]);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os chamados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const styles: Record<string, string> = {
      baixa: 'bg-green-100 text-green-800 hover:bg-green-100',
      media: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      alta: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      urgente: 'bg-red-100 text-red-800 hover:bg-red-100',
    };
    const labels: Record<string, string> = {
      baixa: 'Baixa',
      media: 'Média',
      alta: 'Alta',
      urgente: 'Urgente',
    };
    return { style: styles[prioridade], label: labels[prioridade] };
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      aberto: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      em_atendimento: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      aguardando_cliente: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      aguardando_terceiros: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      finalizado: 'bg-green-100 text-green-800 hover:bg-green-100',
      cancelado: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    };
    const labels: Record<string, string> = {
      aberto: 'Aberto',
      em_atendimento: 'Em Atendimento',
      aguardando_cliente: 'Aguardando Cliente',
      aguardando_terceiros: 'Aguardando Terceiros',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado',
    };
    return { style: styles[status], label: labels[status] };
  };

  const filteredChamados = chamados.filter((chamado) => {
    const matchesSearch =
      chamado.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chamado.numero.toString().includes(searchTerm) ||
      chamado.cliente?.nome_empresa?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || chamado.status === statusFilter;
    const matchesPrioridade = prioridadeFilter === 'todas' || chamado.prioridade === prioridadeFilter;

    return matchesSearch && matchesStatus && matchesPrioridade;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Chamados</h1>
          <p className="text-muted-foreground">
            {isCliente ? 'Seus chamados de suporte' : 'Gerencie os chamados de suporte'}
          </p>
        </div>
        {(isAdmin || isCliente) && (
          <Button asChild className="bg-navy hover:bg-petrol">
            <Link to="/app/chamados/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Chamado
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, número ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="aberto">Aberto</SelectItem>
                <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                <SelectItem value="aguardando_cliente">Aguardando Cliente</SelectItem>
                <SelectItem value="aguardando_terceiros">Aguardando Terceiros</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Prioridades</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : filteredChamados.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum chamado encontrado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Abertura</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChamados.map((chamado) => {
                    const prioridade = getPrioridadeBadge(chamado.prioridade);
                    const status = getStatusBadge(chamado.status);

                    return (
                      <TableRow key={chamado.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium text-navy">
                          #{chamado.numero}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[250px]">
                            <p className="font-medium truncate">{chamado.titulo}</p>
                            {chamado.tipo && (
                              <p className="text-sm text-muted-foreground">{chamado.tipo}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {chamado.cliente?.nome_empresa || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={prioridade.style}>
                            {chamado.prioridade === 'urgente' && (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            )}
                            {prioridade.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={status.style}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(chamado.data_abertura), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/app/chamados/${chamado.id}`)}
                          >
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
    </div>
  );
}
