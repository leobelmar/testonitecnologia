import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, Search, ArrowDown, ArrowUp, History, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Produto {
  id: string;
  nome: string;
  modelo: string | null;
  quantidade: number;
  custo: number;
  venda: number;
  estoque_minimo: number;
  ativo: boolean;
  created_at: string;
}

interface Movimentacao {
  id: string;
  produto_id: string;
  tipo: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  observacoes: string | null;
  created_at: string;
  produto?: { nome: string; modelo: string | null } | null;
}

export default function Estoque() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialogs
  const [produtoDialog, setProdutoDialog] = useState(false);
  const [compraDialog, setCompraDialog] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  // Forms
  const [produtoForm, setProdutoForm] = useState({ nome: '', modelo: '', quantidade: '', custo: '', venda: '', estoque_minimo: '' });
  const [compraForm, setCompraForm] = useState({ produto_id: '', quantidade: '', valor_unitario: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [prodRes, movRes] = await Promise.all([
      supabase.from('produtos').select('*').eq('ativo', true).order('nome'),
      supabase.from('movimentacoes_estoque').select('*, produto:produtos(nome, modelo)').order('created_at', { ascending: false }).limit(100),
    ]);
    setProdutos((prodRes.data as Produto[]) || []);
    setMovimentacoes((movRes.data as unknown as Movimentacao[]) || []);
    setLoading(false);
  };

  const handleCriarProduto = async () => {
    try {
      const { error } = await supabase.from('produtos').insert([{
        nome: produtoForm.nome,
        modelo: produtoForm.modelo || null,
        quantidade: parseInt(produtoForm.quantidade) || 0,
        custo: parseFloat(produtoForm.custo) || 0,
        venda: parseFloat(produtoForm.venda) || 0,
        estoque_minimo: parseInt(produtoForm.estoque_minimo) || 0,
        created_by: user?.id!,
      }]);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Produto cadastrado.' });
      setProdutoDialog(false);
      setProdutoForm({ nome: '', modelo: '', quantidade: '', custo: '', venda: '', estoque_minimo: '' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleCompra = async () => {
    const produto = produtos.find(p => p.id === compraForm.produto_id);
    if (!produto) return;

    const qtd = parseInt(compraForm.quantidade) || 0;
    const valorUnit = parseFloat(compraForm.valor_unitario) || 0;
    const valorTotal = qtd * valorUnit;

    if (qtd <= 0) {
      toast({ title: 'Erro', description: 'Quantidade deve ser maior que zero.', variant: 'destructive' });
      return;
    }

    try {
      // 1. Registrar movimentação
      const { error: movError } = await supabase.from('movimentacoes_estoque').insert([{
        produto_id: produto.id,
        tipo: 'entrada' as const,
        quantidade: qtd,
        valor_unitario: valorUnit,
        valor_total: valorTotal,
        observacoes: `Compra de ${qtd}x ${produto.nome}`,
        created_by: user?.id!,
      }]);
      if (movError) throw movError;

      // 2. Atualizar estoque e custo médio
      const novaQtd = produto.quantidade + qtd;
      const custoMedio = ((produto.custo * produto.quantidade) + (valorUnit * qtd)) / novaQtd;

      const { error: prodError } = await supabase.from('produtos').update({
        quantidade: novaQtd,
        custo: Math.round(custoMedio * 100) / 100,
      }).eq('id', produto.id);
      if (prodError) throw prodError;

      // 3. Gerar despesa financeira
      const { error: despError } = await supabase.from('despesas').insert([{
        descricao: `Compra peças: ${qtd}x ${produto.nome}`,
        valor: valorTotal,
        data: new Date().toISOString().split('T')[0],
        categoria: 'Peças/Materiais',
        pago: true,
        data_pagamento: new Date().toISOString().split('T')[0],
        created_by: user?.id!,
      }]);
      if (despError) console.error('Erro ao gerar despesa:', despError);

      toast({ title: 'Sucesso', description: `Entrada de ${qtd}x ${produto.nome} registrada. Despesa gerada.` });
      setCompraDialog(false);
      setCompraForm({ produto_id: '', quantidade: '', valor_unitario: '' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const filtered = produtos.filter(p =>
    !searchTerm ||
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const produtosBaixoEstoque = produtos.filter(p => p.quantidade <= p.estoque_minimo);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Package className="h-6 w-6" />
            Estoque
          </h1>
          <p className="text-muted-foreground">Gestão de peças e materiais</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button variant="outline" onClick={() => setCompraDialog(true)}>
                <ArrowDown className="h-4 w-4 mr-2" />
                Registrar Compra
              </Button>
              <Button className="bg-navy hover:bg-petrol" onClick={() => setProdutoDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Alerta estoque baixo */}
      {produtosBaixoEstoque.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">{produtosBaixoEstoque.length} produto(s) com estoque baixo:</span>
              <span className="text-sm">{produtosBaixoEstoque.map(p => `${p.nome} (${p.quantidade})`).join(', ')}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="produtos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos">
          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Modelo</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Custo</TableHead>
                        <TableHead>Venda</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.nome}</TableCell>
                          <TableCell>{p.modelo || '-'}</TableCell>
                          <TableCell>
                            <Badge className={p.quantidade <= p.estoque_minimo ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                              {p.quantidade}
                            </Badge>
                          </TableCell>
                          <TableCell>R$ {Number(p.custo).toFixed(2)}</TableCell>
                          <TableCell>R$ {Number(p.venda).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      {filtered.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum produto encontrado</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimentacoes">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Valor Unit.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Obs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentacoes.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {format(new Date(m.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-medium">{m.produto?.nome || '-'}</TableCell>
                        <TableCell>
                          <Badge className={m.tipo === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {m.tipo === 'entrada' ? <ArrowDown className="h-3 w-3 mr-1" /> : <ArrowUp className="h-3 w-3 mr-1" />}
                            {m.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </Badge>
                        </TableCell>
                        <TableCell>{m.quantidade}</TableCell>
                        <TableCell>R$ {Number(m.valor_unitario).toFixed(2)}</TableCell>
                        <TableCell className="font-medium">R$ {Number(m.valor_total).toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{m.observacoes || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {movimentacoes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">Nenhuma movimentação</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog: Novo Produto */}
      <Dialog open={produtoDialog} onOpenChange={setProdutoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={produtoForm.nome} onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Input value={produtoForm.modelo} onChange={(e) => setProdutoForm({ ...produtoForm, modelo: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade Inicial</Label>
                <Input type="number" min="0" value={produtoForm.quantidade} onChange={(e) => setProdutoForm({ ...produtoForm, quantidade: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Estoque Mínimo</Label>
                <Input type="number" min="0" value={produtoForm.estoque_minimo} onChange={(e) => setProdutoForm({ ...produtoForm, estoque_minimo: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Custo (R$)</Label>
                <Input type="number" step="0.01" min="0" value={produtoForm.custo} onChange={(e) => setProdutoForm({ ...produtoForm, custo: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Venda (R$)</Label>
                <Input type="number" step="0.01" min="0" value={produtoForm.venda} onChange={(e) => setProdutoForm({ ...produtoForm, venda: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProdutoDialog(false)}>Cancelar</Button>
            <Button className="bg-navy hover:bg-petrol" onClick={handleCriarProduto} disabled={!produtoForm.nome}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Compra */}
      <Dialog open={compraDialog} onOpenChange={setCompraDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Compra (Entrada)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produto *</Label>
              <select
                className="w-full border rounded-md p-2 text-sm"
                value={compraForm.produto_id}
                onChange={(e) => setCompraForm({ ...compraForm, produto_id: e.target.value })}
              >
                <option value="">Selecione...</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome} {p.modelo ? `(${p.modelo})` : ''} - Estoque: {p.quantidade}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade *</Label>
                <Input type="number" min="1" value={compraForm.quantidade} onChange={(e) => setCompraForm({ ...compraForm, quantidade: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Valor Unitário (R$) *</Label>
                <Input type="number" step="0.01" min="0" value={compraForm.valor_unitario} onChange={(e) => setCompraForm({ ...compraForm, valor_unitario: e.target.value })} />
              </div>
            </div>
            {compraForm.quantidade && compraForm.valor_unitario && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Total da compra</p>
                <p className="text-xl font-bold">
                  R$ {((parseInt(compraForm.quantidade) || 0) * (parseFloat(compraForm.valor_unitario) || 0)).toFixed(2)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompraDialog(false)}>Cancelar</Button>
            <Button className="bg-navy hover:bg-petrol" onClick={handleCompra} disabled={!compraForm.produto_id || !compraForm.quantidade}>
              Registrar Compra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
