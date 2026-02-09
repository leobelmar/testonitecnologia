import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package } from 'lucide-react';

interface Produto {
  id: string;
  nome: string;
  modelo: string | null;
  quantidade: number;
  custo: number;
  venda: number;
}

interface OSPeca {
  id: string;
  os_id: string;
  produto_id: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  produto?: Produto | null;
}

interface OSPecasSectionProps {
  osId: string;
  osStatus: string;
  clienteId: string;
  canEdit: boolean;
  onTotalChange: (total: number) => void;
}

export function OSPecasSection({ osId, osStatus, clienteId, canEdit, onTotalChange }: OSPecasSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pecas, setPecas] = useState<OSPeca[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [addDialog, setAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({ produto_id: '', quantidade: '1' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPecas();
    fetchProdutos();
  }, [osId]);

  const fetchPecas = async () => {
    const { data } = await supabase
      .from('os_pecas')
      .select('*, produto:produtos(id, nome, modelo, quantidade, custo, venda)')
      .eq('os_id', osId)
      .order('created_at');
    
    const items = (data as unknown as OSPeca[]) || [];
    setPecas(items);
    const total = items.reduce((acc, p) => acc + Number(p.valor_total), 0);
    onTotalChange(total);
  };

  const fetchProdutos = async () => {
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .gt('quantidade', 0)
      .order('nome');
    setProdutos((data as Produto[]) || []);
  };

  const handleAddPeca = async () => {
    const produto = produtos.find(p => p.id === addForm.produto_id);
    if (!produto) return;

    const qtd = parseInt(addForm.quantidade) || 1;

    if (qtd > produto.quantidade) {
      toast({ title: 'Estoque insuficiente', description: `Disponível: ${produto.quantidade} unidade(s).`, variant: 'destructive' });
      return;
    }

    if (qtd <= 0) {
      toast({ title: 'Erro', description: 'Quantidade deve ser maior que zero.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const valorUnit = Number(produto.venda);
      const valorTotal = valorUnit * qtd;

      // 1. Registrar movimentação de saída
      const { data: mov, error: movError } = await supabase.from('movimentacoes_estoque').insert([{
        produto_id: produto.id,
        tipo: 'saida' as const,
        quantidade: qtd,
        valor_unitario: valorUnit,
        valor_total: valorTotal,
        os_id: osId,
        observacoes: `Uso em OS`,
        created_by: user?.id!,
      }]).select().single();
      if (movError) throw movError;

      // 2. Dar baixa no estoque
      const { error: estError } = await supabase.from('produtos').update({
        quantidade: produto.quantidade - qtd,
      }).eq('id', produto.id);
      if (estError) throw estError;

      // 3. Registrar peça na OS
      const { error: pecaError } = await supabase.from('os_pecas').insert([{
        os_id: osId,
        produto_id: produto.id,
        quantidade: qtd,
        valor_unitario: valorUnit,
        valor_total: valorTotal,
        movimentacao_id: mov.id,
      }]);
      if (pecaError) throw pecaError;

      toast({ title: 'Sucesso', description: `${qtd}x ${produto.nome} adicionado(a) à OS.` });
      setAddDialog(false);
      setAddForm({ produto_id: '', quantidade: '1' });
      fetchPecas();
      fetchProdutos();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePeca = async (peca: OSPeca) => {
    try {
      // Devolver ao estoque
      if (peca.produto) {
        await supabase.from('produtos').update({
          quantidade: peca.produto.quantidade + peca.quantidade,
        }).eq('id', peca.produto_id);
      }

      // Remover movimentação
      if ((peca as any).movimentacao_id) {
        await supabase.from('movimentacoes_estoque').delete().eq('id', (peca as any).movimentacao_id);
      }

      // Remover peça da OS
      await supabase.from('os_pecas').delete().eq('id', peca.id);

      toast({ title: 'Sucesso', description: 'Peça removida e estoque devolvido.' });
      fetchPecas();
      fetchProdutos();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const isLocked = osStatus === 'faturada' || osStatus === 'pago';
  const totalPecas = pecas.reduce((acc, p) => acc + Number(p.valor_total), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Peças / Materiais
        </CardTitle>
        {canEdit && !isLocked && (
          <Button variant="outline" size="sm" onClick={() => setAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Peça
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {pecas.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Nenhuma peça adicionada</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Total</TableHead>
                  {canEdit && !isLocked && <TableHead className="w-[50px]" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pecas.map((peca) => (
                  <TableRow key={peca.id}>
                    <TableCell className="font-medium">{peca.produto?.nome || '-'}</TableCell>
                    <TableCell>{peca.produto?.modelo || '-'}</TableCell>
                    <TableCell>{peca.quantidade}</TableCell>
                    <TableCell>R$ {Number(peca.valor_unitario).toFixed(2)}</TableCell>
                    <TableCell className="font-medium">R$ {Number(peca.valor_total).toFixed(2)}</TableCell>
                    {canEdit && !isLocked && (
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemovePeca(peca)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end pt-3 border-t mt-3">
              <span className="font-medium">Total Peças: <span className="text-navy">R$ {totalPecas.toFixed(2)}</span></span>
            </div>
          </>
        )}

        {/* Dialog: Adicionar Peça */}
        <Dialog open={addDialog} onOpenChange={setAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Peça à OS</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Produto *</Label>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  value={addForm.produto_id}
                  onChange={(e) => setAddForm({ ...addForm, produto_id: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} {p.modelo ? `(${p.modelo})` : ''} - Estoque: {p.quantidade} - R$ {Number(p.venda).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Quantidade *</Label>
                <Input
                  type="number"
                  min="1"
                  max={produtos.find(p => p.id === addForm.produto_id)?.quantidade || 999}
                  value={addForm.quantidade}
                  onChange={(e) => setAddForm({ ...addForm, quantidade: e.target.value })}
                />
              </div>
              {addForm.produto_id && (
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <p>Valor unitário: R$ {Number(produtos.find(p => p.id === addForm.produto_id)?.venda || 0).toFixed(2)}</p>
                  <p className="font-bold">
                    Total: R$ {((parseInt(addForm.quantidade) || 0) * Number(produtos.find(p => p.id === addForm.produto_id)?.venda || 0)).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialog(false)}>Cancelar</Button>
              <Button className="bg-navy hover:bg-petrol" onClick={handleAddPeca} disabled={!addForm.produto_id || loading}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
