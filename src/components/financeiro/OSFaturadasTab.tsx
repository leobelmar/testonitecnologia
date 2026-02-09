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
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrdemServico } from '@/types/database';

export function OSFaturadasTab() {
  const { isAdmin, isFinanceiro } = useAuth();
  const { toast } = useToast();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrdens = async () => {
    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`*, cliente:clientes(id, nome_empresa), tecnico:profiles!ordens_servico_tecnico_id_fkey(id, nome)`)
        .eq('status', 'faturada')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setOrdens((data || []) as unknown as OrdemServico[]);
    } catch (error) {
      console.error('Erro ao buscar OS faturadas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrdens(); }, []);

  const handleMarcarPago = async (os: OrdemServico) => {
    try {
      const { error } = await supabase
        .from('ordens_servico')
        .update({ status: 'pago' })
        .eq('id', os.id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: `OS #${os.numero} marcada como paga.` });
      fetchOrdens();
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar.', variant: 'destructive' });
    }
  };

  const totalEmAberto = ordens.reduce((acc, os) => acc + Number(os.valor_total || 0), 0);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">OS Faturadas (Pendentes de Pagamento)</h2>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Total em Aberto</p>
          <p className="text-2xl font-bold text-yellow-600">
            R$ {totalEmAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : ordens.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma OS faturada pendente</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OS Nº</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Data</TableHead>
                    {(isAdmin || isFinanceiro) && <TableHead className="w-[120px]">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordens.map((os) => (
                    <TableRow key={os.id}>
                      <TableCell className="font-medium">#{os.numero}</TableCell>
                      <TableCell>{os.cliente?.nome_empresa || '-'}</TableCell>
                      <TableCell>{os.tecnico?.nome || '-'}</TableCell>
                      <TableCell className="font-medium">
                        R$ {Number(os.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {os.updated_at ? format(new Date(os.updated_at), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                      </TableCell>
                      {(isAdmin || isFinanceiro) && (
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleMarcarPago(os)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Pago
                          </Button>
                        </TableCell>
                      )}
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
