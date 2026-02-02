import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Fatura } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  DollarSign,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Financeiro() {
  const { isAdmin, isFinanceiro } = useAuth();
  const { toast } = useToast();
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  useEffect(() => {
    fetchFaturas();
  }, []);

  const fetchFaturas = async () => {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .select(`
          *,
          cliente:clientes(id, nome_empresa),
          ordem_servico:ordens_servico(id, numero)
        `)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;
      setFaturas(data as Fatura[]);
    } catch (error) {
      console.error('Erro ao buscar faturas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as faturas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarPago = async (fatura: Fatura) => {
    try {
      const { error } = await supabase
        .from('faturas')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0],
        })
        .eq('id', fatura.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Fatura marcada como paga.',
      });

      fetchFaturas();
    } catch (error) {
      console.error('Erro ao atualizar fatura:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a fatura.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string, vencimento: string) => {
    const hoje = startOfDay(new Date());
    const dataVencimento = startOfDay(new Date(vencimento));
    const estaVencida = status === 'em_aberto' && isBefore(dataVencimento, hoje);

    if (status === 'pago') {
      return { style: 'bg-green-100 text-green-800', label: 'Pago', icon: CheckCircle };
    }
    if (estaVencida || status === 'atrasado') {
      return { style: 'bg-red-100 text-red-800', label: 'Atrasado', icon: AlertTriangle };
    }
    return { style: 'bg-yellow-100 text-yellow-800', label: 'Em Aberto', icon: Clock };
  };

  const filteredFaturas = faturas.filter((fatura) => {
    const matchesSearch =
      fatura.numero.toString().includes(searchTerm) ||
      fatura.cliente?.nome_empresa?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter !== 'todos') {
      if (statusFilter === 'atrasado') {
        const hoje = startOfDay(new Date());
        const vencimento = startOfDay(new Date(fatura.data_vencimento));
        matchesStatus = fatura.status === 'em_aberto' && isBefore(vencimento, hoje);
      } else {
        matchesStatus = fatura.status === statusFilter;
      }
    }

    return matchesSearch && matchesStatus;
  });

  // Calcular totais
  const totalAReceber = faturas
    .filter((f) => f.status === 'em_aberto')
    .reduce((acc, f) => acc + Number(f.valor_total), 0);

  const totalAtrasado = faturas
    .filter((f) => {
      const hoje = startOfDay(new Date());
      const vencimento = startOfDay(new Date(f.data_vencimento));
      return f.status === 'em_aberto' && isBefore(vencimento, hoje);
    })
    .reduce((acc, f) => acc + Number(f.valor_total), 0);

  const totalRecebidoMes = faturas
    .filter((f) => {
      const pagamento = f.data_pagamento ? new Date(f.data_pagamento) : null;
      const hoje = new Date();
      return (
        f.status === 'pago' &&
        pagamento &&
        pagamento.getMonth() === hoje.getMonth() &&
        pagamento.getFullYear() === hoje.getFullYear()
      );
    })
    .reduce((acc, f) => acc + Number(f.valor_total), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Financeiro</h1>
        <p className="text-muted-foreground">
          Controle de faturas e contas a receber
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              A Receber
            </CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {totalAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Atrasado
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recebido (Mês)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalRecebidoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número ou cliente..."
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
                <SelectItem value="em_aberto">Em Aberto</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
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
          ) : filteredFaturas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma fatura encontrada
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    {(isAdmin || isFinanceiro) && (
                      <TableHead className="w-[120px]">Ações</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaturas.map((fatura) => {
                    const status = getStatusBadge(fatura.status, fatura.data_vencimento);
                    const StatusIcon = status.icon;

                    return (
                      <TableRow key={fatura.id}>
                        <TableCell className="font-medium text-navy">
                          #{fatura.numero}
                        </TableCell>
                        <TableCell>
                          {fatura.cliente?.nome_empresa || '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {Number(fatura.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(fatura.data_vencimento), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge className={status.style}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        {(isAdmin || isFinanceiro) && (
                          <TableCell>
                            {fatura.status !== 'pago' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarcarPago(fatura)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Pago
                              </Button>
                            )}
                          </TableCell>
                        )}
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
