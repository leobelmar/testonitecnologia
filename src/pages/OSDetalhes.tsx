import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { OrdemServico, OSStatus, Profile } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Building2,
  Clock,
  User,
  Loader2,
  FileText,
  DollarSign,
  Save,
  CheckCircle,
  Printer,
} from 'lucide-react';
import { PrintDialog } from '@/components/PrintDialog';
import { OSPecasSection } from '@/components/os/OSPecasSection';
import { gerarFaturaPDF } from '@/lib/faturaPDF';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function OSDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isTecnico, isFinanceiro } = useAuth();
  const { toast } = useToast();

  const [os, setOS] = useState<OrdemServico | null>(null);
  const [tecnicos, setTecnicos] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faturarDialogOpen, setFaturarDialogOpen] = useState(false);
  const [faturando, setFaturando] = useState(false);
  const [totalPecas, setTotalPecas] = useState(0);

  const [form, setForm] = useState({
    descricao_servico: '',
    servicos_realizados: '',
    horas_trabalhadas: '',
    materiais_usados: '',
    valor_materiais: '',
    valor_mao_obra: '',
    observacoes: '',
    status: '' as OSStatus,
    tecnico_id: '',
  });

  // Fatura form
  const [faturaForm, setFaturaForm] = useState({
    data_vencimento: '',
    forma_pagamento: '',
    descricao: '',
  });

  useEffect(() => {
    if (id) {
      fetchOS();
      if (isAdmin) fetchTecnicos();
    }
  }, [id]);

  const fetchOS = async () => {
    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          cliente:clientes(id, nome_empresa, telefone, email),
          chamado:chamados(id, numero, titulo)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setOS(data as OrdemServico);
      setForm({
        descricao_servico: data.descricao_servico || '',
        servicos_realizados: data.servicos_realizados || '',
        horas_trabalhadas: data.horas_trabalhadas?.toString() || '',
        materiais_usados: data.materiais_usados || '',
        valor_materiais: data.valor_materiais?.toString() || '',
        valor_mao_obra: data.valor_mao_obra?.toString() || '',
        observacoes: data.observacoes || '',
        status: data.status,
        tecnico_id: data.tecnico_id || '',
      });
    } catch (error) {
      console.error('Erro ao buscar OS:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a ordem de serviço.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTecnicos = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'tecnico'])
        .eq('ativo', true);

      setTecnicos(data as Profile[] || []);
    } catch (error) {
      console.error('Erro ao buscar técnicos:', error);
    }
  };

  const calcularTotal = () => {
    const materiais = parseFloat(form.valor_materiais) || 0;
    const maoObra = parseFloat(form.valor_mao_obra) || 0;
    return materiais + maoObra + totalPecas;
  };

  const handleSave = async () => {
    if (!os) return;
    setSaving(true);

    try {
      // ❌ Relatório sem validação — ao finalizar, exigir campos preenchidos
      if (form.status === 'finalizada' && os.status !== 'finalizada') {
        const erros: string[] = [];
        if (!form.servicos_realizados?.trim()) erros.push('Serviços Realizados');
        if (!form.horas_trabalhadas || parseFloat(form.horas_trabalhadas) <= 0) erros.push('Horas Trabalhadas');
        if (!form.tecnico_id) erros.push('Técnico Responsável');

        if (erros.length > 0) {
          toast({
            title: 'Relatório incompleto',
            description: `Preencha antes de finalizar: ${erros.join(', ')}`,
            variant: 'destructive',
          });
          setSaving(false);
          return;
        }
      }

      const updateData: any = {
        descricao_servico: form.descricao_servico || null,
        servicos_realizados: form.servicos_realizados || null,
        horas_trabalhadas: parseFloat(form.horas_trabalhadas) || 0,
        materiais_usados: form.materiais_usados || null,
        valor_materiais: parseFloat(form.valor_materiais) || 0,
        valor_mao_obra: parseFloat(form.valor_mao_obra) || 0,
        valor_total: calcularTotal(),
        observacoes: form.observacoes || null,
        status: form.status,
        tecnico_id: form.tecnico_id || null,
      };

      // Se finalizando, adicionar data_fim
      if (form.status === 'finalizada' && os.status !== 'finalizada') {
        updateData.data_fim = new Date().toISOString();
      }

      const { error } = await supabase
        .from('ordens_servico')
        .update(updateData)
        .eq('id', os.id);

      if (error) throw error;

      // Se finalizou a OS, finalizar o chamado também
      if (form.status === 'finalizada' && os.chamado_id) {
        await supabase
          .from('chamados')
          .update({ 
            status: 'finalizado',
            data_fechamento: new Date().toISOString()
          })
          .eq('id', os.chamado_id);
      }

      toast({
        title: 'Sucesso',
        description: 'Ordem de serviço atualizada.',
      });

      fetchOS();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFaturar = async () => {
    if (!os) return;

    // ❌ Fatura sem relatório — exigir relatório completo
    if (!os.servicos_realizados?.trim()) {
      toast({
        title: 'Relatório obrigatório',
        description: 'A OS precisa ter os Serviços Realizados preenchidos antes de faturar.',
        variant: 'destructive',
      });
      return;
    }

    // ❌ Fatura sem OS — já garantido pelo fluxo (fatura sempre criada a partir de OS)
    // ❌ OS sem contrato — alertar se OS não tem contrato vinculado
    if (!os.contrato_id) {
      toast({
        title: 'Contrato obrigatório',
        description: 'A OS precisa estar vinculada a um contrato para ser faturada.',
        variant: 'destructive',
      });
      return;
    }

    setFaturando(true);

    try {
      // Criar fatura
      const { data: fatura, error: faturaError } = await supabase
        .from('faturas')
        .insert({
          cliente_id: os.cliente_id,
          os_id: os.id,
          valor_total: calcularTotal(),
          data_emissao: new Date().toISOString().split('T')[0],
          data_vencimento: faturaForm.data_vencimento,
          forma_pagamento: faturaForm.forma_pagamento || null,
          descricao: faturaForm.descricao || `Ordem de Serviço #${os.numero}`,
          status: 'em_aberto',
          created_by: user?.id,
        })
        .select()
        .single();

      if (faturaError) throw faturaError;

      // Atualizar OS para faturada
      const { error: osError } = await supabase
        .from('ordens_servico')
        .update({ status: 'faturada' })
        .eq('id', os.id);

      if (osError) throw osError;

      // Buscar peças da OS para o PDF
      const { data: pecasData } = await supabase
        .from('os_pecas')
        .select('*, produto:produtos(nome, modelo)')
        .eq('os_id', os.id);

      const pecasPDF = (pecasData || []).map((p: any) => ({
        nome: p.produto?.nome || '-',
        modelo: p.produto?.modelo || null,
        quantidade: p.quantidade,
        valor_unitario: Number(p.valor_unitario),
        valor_total: Number(p.valor_total),
      }));

      // Buscar dados completos do cliente
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', os.cliente_id)
        .single();

      // Gerar PDF
      gerarFaturaPDF({
        numero: fatura.numero,
        cliente_nome: clienteData?.nome_empresa || os.cliente?.nome_empresa || '',
        cliente_cnpj: clienteData?.cnpj_cpf,
        cliente_endereco: clienteData?.endereco,
        cliente_telefone: clienteData?.telefone,
        cliente_email: clienteData?.email,
        descricao: faturaForm.descricao || `Ordem de Serviço #${os.numero}`,
        valor_total: calcularTotal(),
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: faturaForm.data_vencimento,
        forma_pagamento: faturaForm.forma_pagamento,
        status: 'em_aberto',
        pecas: pecasPDF,
        horas_trabalhadas: parseFloat(form.horas_trabalhadas) || 0,
        valor_mao_obra: parseFloat(form.valor_mao_obra) || 0,
        valor_materiais: parseFloat(form.valor_materiais) || 0,
        observacoes: form.observacoes,
      });

      toast({
        title: 'Sucesso',
        description: `Fatura #${fatura.numero} criada e PDF gerado.`,
      });

      setFaturarDialogOpen(false);
      fetchOS();
    } catch (error: any) {
      console.error('Erro ao faturar:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar a fatura.',
        variant: 'destructive',
      });
    } finally {
      setFaturando(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      aberta: 'bg-blue-100 text-blue-800',
      em_execucao: 'bg-yellow-100 text-yellow-800',
      finalizada: 'bg-green-100 text-green-800',
      faturada: 'bg-purple-100 text-purple-800',
      pago: 'bg-emerald-100 text-emerald-800',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  if (!os) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Ordem de serviço não encontrada.</p>
        <Button variant="link" onClick={() => navigate('/app/ordens-servico')}>
          Voltar para ordens de serviço
        </Button>
      </div>
    );
  }

  const status = getStatusBadge(os.status);
  const canEdit = isAdmin || isTecnico || isFinanceiro;
  const canFaturar = (isAdmin || isFinanceiro) && os.status === 'finalizada';
  const canMarcarPago = (isAdmin || isFinanceiro) && os.status === 'faturada';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-navy">
              OS #{os.numero}
            </h1>
            <Badge className={status.style}>{status.label}</Badge>
          </div>
          {os.chamado && (
            <p className="text-muted-foreground mt-1">
              Vinculada ao chamado{' '}
              <Link to={`/app/chamados/${os.chamado.id}`} className="text-navy hover:underline">
                #{os.chamado.numero} - {os.chamado.titulo}
              </Link>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <PrintDialog
            data={{
              type: 'os',
              numero: os.numero,
              descricao_servico: os.descricao_servico,
              servicos_realizados: os.servicos_realizados,
              materiais_usados: os.materiais_usados,
              horas_trabalhadas: os.horas_trabalhadas,
              valor_materiais: os.valor_materiais,
              valor_mao_obra: os.valor_mao_obra,
              valor_total: os.valor_total,
              status: os.status,
              data_inicio: os.data_inicio,
              data_fim: os.data_fim,
              observacoes: os.observacoes,
              cliente_nome: os.cliente?.nome_empresa,
              cliente_telefone: os.cliente?.telefone,
              cliente_email: os.cliente?.email,
              chamado_numero: os.chamado?.numero,
              chamado_titulo: os.chamado?.titulo,
            }}
            trigger={
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            }
          />
          {canEdit && os.status !== 'faturada' && os.status !== 'pago' && (
            <Button onClick={handleSave} disabled={saving} className="bg-navy hover:bg-petrol">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          )}
          {canFaturar && (
            <Dialog open={faturarDialogOpen} onOpenChange={setFaturarDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Faturar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gerar Fatura</DialogTitle>
                  <DialogDescription>
                    Crie uma fatura para esta ordem de serviço
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold text-navy">
                      R$ {Number(os.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Vencimento *</Label>
                    <Input
                      type="date"
                      value={faturaForm.data_vencimento}
                      onChange={(e) => setFaturaForm({ ...faturaForm, data_vencimento: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Forma de Pagamento</Label>
                    <Select
                      value={faturaForm.forma_pagamento}
                      onValueChange={(value) => setFaturaForm({ ...faturaForm, forma_pagamento: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="cartao">Cartão</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input
                      value={faturaForm.descricao}
                      onChange={(e) => setFaturaForm({ ...faturaForm, descricao: e.target.value })}
                      placeholder={`Ordem de Serviço #${os.numero}`}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setFaturarDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleFaturar}
                    disabled={!faturaForm.data_vencimento || faturando}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {faturando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Gerar Fatura
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {canMarcarPago && (
            <Button
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              onClick={async () => {
                try {
                  const { error } = await supabase
                    .from('ordens_servico')
                    .update({ status: 'pago' as any })
                    .eq('id', os.id);
                  if (error) throw error;
                  toast({ title: 'Sucesso', description: 'OS marcada como paga.' });
                  fetchOS();
                } catch (error: any) {
                  toast({ title: 'Erro', description: error.message, variant: 'destructive' });
                }
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como Pago
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Serviços */}
          <Card>
            <CardHeader>
            <CardTitle>Serviços</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição do Serviço</Label>
                <Textarea
                  value={form.descricao_servico}
                  onChange={(e) => setForm({ ...form, descricao_servico: e.target.value })}
                  placeholder="Descrição do serviço a ser realizado..."
                  rows={3}
                  disabled={!canEdit || os.status === 'faturada' || os.status === 'pago'}
                />
              </div>

              <div className="space-y-2">
                <Label>Serviços Realizados</Label>
                <Textarea
                  value={form.servicos_realizados}
                  onChange={(e) => setForm({ ...form, servicos_realizados: e.target.value })}
                  placeholder="Descreva os serviços realizados..."
                  rows={4}
                  disabled={!canEdit || os.status === 'faturada' || os.status === 'pago'}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Horas Trabalhadas</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={form.horas_trabalhadas}
                    onChange={(e) => setForm({ ...form, horas_trabalhadas: e.target.value })}
                    disabled={!canEdit || os.status === 'faturada' || os.status === 'pago'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value: OSStatus) => setForm({ ...form, status: value })}
                    disabled={!canEdit || os.status === 'faturada' || os.status === 'pago'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="aberta">Em Aberto</SelectItem>
                      <SelectItem value="em_execucao">Em Execução</SelectItem>
                      <SelectItem value="finalizada">Finalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Materiais Utilizados</Label>
                <Textarea
                  value={form.materiais_usados}
                  onChange={(e) => setForm({ ...form, materiais_usados: e.target.value })}
                  placeholder="Liste os materiais utilizados..."
                  rows={3}
                  disabled={!canEdit || os.status === 'faturada'}
                />
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={2}
                  disabled={!canEdit || os.status === 'faturada'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Valores */}
          <Card>
            <CardHeader>
              <CardTitle>Valores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mão de Obra (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.valor_mao_obra}
                    onChange={(e) => setForm({ ...form, valor_mao_obra: e.target.value })}
                    disabled={!canEdit || os.status === 'faturada' || os.status === 'pago'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Materiais (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.valor_materiais}
                    onChange={(e) => setForm({ ...form, valor_materiais: e.target.value })}
                    disabled={!canEdit || os.status === 'faturada' || os.status === 'pago'}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Valor Total:</span>
                <span className="text-2xl font-bold text-navy">
                  R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Peças */}
          {os && (
            <OSPecasSection
              osId={os.id}
              osStatus={os.status}
              clienteId={os.cliente_id}
              canEdit={canEdit}
              onTotalChange={setTotalPecas}
            />
          )}
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{os.cliente?.nome_empresa}</p>
              {os.cliente?.telefone && (
                <p className="text-sm text-muted-foreground">📞 {os.cliente.telefone}</p>
              )}
              {os.cliente?.email && (
                <p className="text-sm text-muted-foreground">✉️ {os.cliente.email}</p>
              )}
            </CardContent>
          </Card>

          {/* Informações */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAdmin && (
                <div className="space-y-2">
                  <Label>Técnico Responsável</Label>
                  <Select
                    value={form.tecnico_id}
                    onValueChange={(value) => setForm({ ...form, tecnico_id: value })}
                    disabled={os.status === 'faturada' || os.status === 'pago'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tecnicos.map((tecnico) => (
                        <SelectItem key={tecnico.user_id} value={tecnico.user_id}>
                          {tecnico.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Criação</p>
                <p className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(new Date(os.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>

              {os.data_inicio && (
                <div>
                  <p className="text-sm text-muted-foreground">Início</p>
                  <p>{format(new Date(os.data_inicio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                </div>
              )}

              {os.data_fim && (
                <div>
                  <p className="text-sm text-muted-foreground">Conclusão</p>
                  <p className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {format(new Date(os.data_fim), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
