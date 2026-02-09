import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { Search, CheckCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NovaDespesaDialog } from './NovaDespesaDialog';

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: string | null;
  forma_pagamento: string | null;
  pago: boolean;
  data_pagamento: string | null;
  observacoes: string | null;
  created_by: string;
  created_at: string;
}

export function DespesasTab() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const fetchDespesas = async () => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      setDespesas(data || []);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDespesas(); }, []);

  const handleMarcarPago = async (despesa: Despesa) => {
    try {
      const { error } = await supabase
        .from('despesas')
        .update({ pago: true, data_pagamento: new Date().toISOString().split('T')[0] })
        .eq('id', despesa.id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Despesa marcada como paga.' });
      fetchDespesas();
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar.', variant: 'destructive' });
    }
  };

  const handleDeletar = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta despesa?')) return;
    try {
      const { error } = await supabase.from('despesas').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Despesa excluída.' });
      fetchDespesas();
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' });
    }
  };

  const filtered = despesas.filter((d) => {
    const matchesSearch = d.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.categoria?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'todos' ||
      (statusFilter === 'pago' && d.pago) ||
      (statusFilter === 'pendente' && !d.pago);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Despesas</h2>
        <NovaDespesaDialog onSuccess={fetchDespesas} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição ou categoria..."
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
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma despesa encontrada</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[140px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.descricao}</TableCell>
                      <TableCell>{d.categoria || '-'}</TableCell>
                      <TableCell className="font-medium text-red-600">
                        R$ {Number(d.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{format(new Date(d.data + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      <TableCell>{d.forma_pagamento || '-'}</TableCell>
                      <TableCell>
                        <Badge className={d.pago ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {d.pago ? 'Pago' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!d.pago && (
                            <Button variant="outline" size="sm" onClick={() => handleMarcarPago(d)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {isAdmin && (
                            <Button variant="outline" size="sm" onClick={() => handleDeletar(d.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
