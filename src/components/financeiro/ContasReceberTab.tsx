import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Fatura } from '@/types/database';

export function ContasReceberTab() {
  const { isAdmin, isFinanceiro } = useAuth();
  const { toast } = useToast();
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFaturas = async () => {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .select(`*, cliente:clientes(id, nome_empresa), ordem_servico:ordens_servico(id, numero)`)
        .eq('status', 'em_aberto')
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      setFaturas(data as Fatura[]);
    } catch (error) {
      console.error('Erro ao buscar faturas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaturas(); }, []);

  const handleMarcarPago = async (fatura: Fatura) => {
    try {
      const { error } = await supabase
        .from('faturas')
        .update({ status: 'pago', data_pagamento: new Date().toISOString().split('T')[0] })
        .eq('id', fatura.id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Fatura marcada como paga.' });
      fetchFaturas();
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar.', variant: 'destructive' });
    }
  };

  const hoje = startOfDay(new Date());
  const totalAReceber = faturas.reduce((acc, f) => acc + Number(f.valor_total), 0);
  const totalAtrasado = faturas
    .filter((f) => isBefore(startOfDay(new Date(f.data_vencimento)), hoje))
    .reduce((acc, f) => acc + Number(f.valor_total), 0);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Contas a Receber</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total a Receber</p>
            <p className="text-2xl font-bold text-yellow-600">
              R$ {totalAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Atrasado</p>
            <p className="text-2xl font-bold text-red-600">
              R$ {totalAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : faturas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma conta a receber</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fatura</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    {(isAdmin || isFinanceiro) && <TableHead className="w-[100px]">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faturas.map((f) => {
                    const vencida = isBefore(startOfDay(new Date(f.data_vencimento)), hoje);
                    return (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">#{f.numero}</TableCell>
                        <TableCell>{f.cliente?.nome_empresa || '-'}</TableCell>
                        <TableCell>{f.ordem_servico ? `#${f.ordem_servico.numero}` : '-'}</TableCell>
                        <TableCell className="font-medium">
                          R$ {Number(f.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>{format(new Date(f.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell>
                          <Badge className={vencida ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                            {vencida ? <AlertTriangle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                            {vencida ? 'Atrasado' : 'Em Aberto'}
                          </Badge>
                        </TableCell>
                        {(isAdmin || isFinanceiro) && (
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => handleMarcarPago(f)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Pago
                            </Button>
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
