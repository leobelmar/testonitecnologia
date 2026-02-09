import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DespesaPaga {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: string | null;
  forma_pagamento: string | null;
  data_pagamento: string | null;
}

export function ContasPagasTab() {
  const [despesas, setDespesas] = useState<DespesaPaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesFilter, setMesFilter] = useState(format(new Date(), 'yyyy-MM'));

  const fetchDespesasPagas = async () => {
    setLoading(true);
    try {
      const start = startOfMonth(new Date(mesFilter + '-01')).toISOString().split('T')[0];
      const end = endOfMonth(new Date(mesFilter + '-01')).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('despesas')
        .select('id, descricao, valor, data, categoria, forma_pagamento, data_pagamento')
        .eq('pago', true)
        .gte('data_pagamento', start)
        .lte('data_pagamento', end)
        .order('data_pagamento', { ascending: false });

      if (error) throw error;
      setDespesas(data || []);
    } catch (error) {
      console.error('Erro ao buscar contas pagas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDespesasPagas(); }, [mesFilter]);

  const totalPago = despesas.reduce((acc, d) => acc + Number(d.valor), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-semibold">Contas Pagas</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Período:</span>
          <Input
            type="month"
            value={mesFilter}
            onChange={(e) => setMesFilter(e.target.value)}
            className="w-[180px]"
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-lg font-bold text-green-600">
            Total Pago: R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : despesas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma conta paga neste período</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data Pagamento</TableHead>
                    <TableHead>Forma</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {despesas.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.descricao}</TableCell>
                      <TableCell>{d.categoria || '-'}</TableCell>
                      <TableCell className="font-medium">
                        R$ {Number(d.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {d.data_pagamento ? format(new Date(d.data_pagamento + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                      </TableCell>
                      <TableCell>{d.forma_pagamento || '-'}</TableCell>
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
