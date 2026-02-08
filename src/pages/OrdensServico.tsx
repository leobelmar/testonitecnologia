import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { OrdemServico } from '@/types/database';
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
import { Plus, Search, Eye, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function OrdensServico() {
  const { isAdmin, isTecnico, isFinanceiro } = useAuth();
  const { toast } = useToast();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  useEffect(() => {
    fetchOrdens();
  }, []);

  const fetchOrdens = async () => {
    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          cliente:clientes(id, nome_empresa),
          chamado:chamados(id, numero, titulo)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrdens(data as OrdemServico[]);
    } catch (error) {
      console.error('Erro ao buscar ordens:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as ordens de serviço.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      aberta: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      em_execucao: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      finalizada: 'bg-green-100 text-green-800 hover:bg-green-100',
      faturada: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      pago: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    };
    const labels: Record<string, string> = {
      aberta: 'Em Aberto',
      em_execucao: 'Em Execução',
      finalizada: 'Finalizada',
      faturada: 'Faturado',
      pago: 'Pago',
    };
    return { style: styles[status] || '', label: labels[status] || status };
  };

  const filteredOrdens = ordens.filter((os) => {
    const matchesSearch =
      os.numero.toString().includes(searchTerm) ||
      os.cliente?.nome_empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.chamado?.titulo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || os.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Ordens de Serviço</h1>
          <p className="text-muted-foreground">
            Gerencie as ordens de serviço
          </p>
        </div>
        {(isAdmin || isTecnico) && (
          <Button asChild className="bg-navy hover:bg-petrol">
            <Link to="/app/ordens-servico/nova">
              <Plus className="mr-2 h-4 w-4" />
              Nova OS
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, cliente ou chamado..."
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
                <SelectItem value="aberta">Em Aberto</SelectItem>
                <SelectItem value="em_execucao">Em Execução</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
                <SelectItem value="faturada">Faturado</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
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
          ) : filteredOrdens.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma ordem de serviço encontrada
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº OS</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Chamado</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criação</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrdens.map((os) => {
                    const status = getStatusBadge(os.status);

                    return (
                      <TableRow key={os.id}>
                        <TableCell className="font-medium text-navy">
                          #{os.numero}
                        </TableCell>
                        <TableCell>
                          {os.cliente?.nome_empresa || '-'}
                        </TableCell>
                        <TableCell>
                          {os.chamado ? (
                            <span>
                              #{os.chamado.numero} - {os.chamado.titulo}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Avulsa</span>
                          )}
                        </TableCell>
                        <TableCell>
                          R$ {Number(os.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge className={status.style}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(os.created_at), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link to={`/app/ordens-servico/${os.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
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
