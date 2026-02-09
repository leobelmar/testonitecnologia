import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { OrdemServico, OSStatus, Profile, TipoAtendimento } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Loader2,
  DollarSign,
  Save,
  CheckCircle,
  Printer,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { PrintDialog } from '@/components/PrintDialog';
import { OSPecasSection } from '@/components/os/OSPecasSection';
import { gerarFaturaPDF } from '@/lib/faturaPDF';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIPO_ATENDIMENTO_LABELS: Record<TipoAtendimento, string> = {
  remoto: 'Remoto',
  presencial: 'Presencial',
  sla1: 'SLA 1',
  sla2: 'SLA 2',
  sla3: 'SLA 3',
};

export default function OSDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isTecnico, isFinanceiro } = useAuth();
  const { toast } = useToast();

  const [os, setOS] = useState<OrdemServico | null>(null);
  const [tecnicos, setTecnicos] = useState<Profile[]>([]);
  const [tiposHora, setTiposHora] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faturarDialogOpen, setFaturarDialogOpen] = useState(false);
  const [faturando, setFaturando] = useState(false);
  const [totalPecas, setTotalPecas] = useState(0);

  const [form, setForm] = useState({
    descricao_servico: '',
    servicos_realizados: '',
    horas_trabalhadas: '',
    tipo_atendimento: '' as TipoAtendimento | '',
    tipo_hora_id: '',
    observacoes: '',
    status: '' as OSStatus,
    tecnico_id: '',
  });

  const [faturaForm, setFaturaForm] = useState({
    data_vencimento: '',
    forma_pagamento: '',
    descricao: '',
  });

  // Auto-calculate from contract
  const selectedTipoHora = tiposHora.find((t: any) => t.id === form.tipo_hora_id);
  const valorHora = selectedTipoHora ? Number(selectedTipoHora.valor_hora_extra) : 0;
  const horas = parseFloat(form.horas_trabalhadas) || 0;
  const valorMaoObra = valorHora * horas;

  const calcularTotal = () => valorMaoObra + totalPecas;

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
          cliente:clientes(id, nome_empresa, telefone, email, cnpj_cpf, endereco),
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
        tipo_atendimento: (data.tipo_atendimento as TipoAtendimento) || '',
        tipo_hora_id: data.tipo_hora_id || '',
        observacoes: data.observacoes || '',
        status: data.status,
        tecnico_id: data.tecnico_id || '',
      });

      // Fetch hour types from contract
      if (data.contrato_id) {
        const { data: tipos } = await supabase
          .from('contrato_tipos_hora')
          .select('*')
          .eq('contrato_id', data.contrato_id);
        setTiposHora(tipos || []);
      }
    } catch (error) {
      console.error('Erro ao buscar OS:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar a ordem de serviço.', variant: 'destructive' });
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

  const handleSave = async () => {
    if (!os) return;
    setSaving(true);

    try {
      // Validation on finalization
      if (form.status === 'finalizada' && os.status !== 'finalizada') {
        const erros: string[] = [];
        if (!form.servicos_realizados?.trim()) erros.push('Serviços Realizados');
        if (!form.horas_trabalhadas || parseFloat(form.horas_trabalhadas) <= 0) erros.push('Horas Trabalhadas');
        if (!form.tecnico_id) erros.push('Técnico Responsável');
        if (!form.tipo_hora_id) erros.push('Tipo de Hora');

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

      // Block: cannot save without tipo_hora when contract exists
      if (os.contrato_id && horas > 0 && !form.tipo_hora_id) {
        toast({ title: 'Tipo de hora obrigatório', description: 'Selecione o tipo de hora do contrato.', variant: 'destructive' });
        setSaving(false);
        return;
      }

      const updateData: any = {
        descricao_servico: form.descricao_servico || null,
        servicos_realizados: form.servicos_realizados || null,
        horas_trabalhadas: horas,
        tipo_atendimento: (form.tipo_atendimento as TipoAtendimento) || null,
        tipo_hora_id: form.tipo_hora_id || null,
        valor_mao_obra: valorMaoObra,
        valor_materiais: totalPecas,
        valor_total: calcularTotal(),
        observacoes: form.observacoes || null,
        status: form.status,
        tecnico_id: form.tecnico_id || null,
      };

      if (form.status === 'finalizada' && os.status !== 'finalizada') {
        updateData.data_fim = new Date().toISOString();
      }

      const { error } = await supabase
        .from('ordens_servico')
        .update(updateData)
        .eq('id', os.id);

      if (error) throw error;

      if (form.status === 'finalizada' && os.chamado_id) {
        await supabase.from('chamados').update({ status: 'finalizado', data_fechamento: new Date().toISOString() }).eq('id', os.chamado_id);
      }

      toast({ title: 'Sucesso', description: 'Ordem de serviço atualizada.' });
      fetchOS();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({ title: 'Erro', description: error.message || 'Não foi possível salvar.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleFaturar = async () => {
    if (!os) return;

    if (!os.servicos_realizados?.trim()) {
      toast({ title: 'Relatório obrigatório', description: 'Preencha os Serviços Realizados antes de faturar.', variant: 'destructive' });
      return;
    }

    if (!os.contrato_id) {
      toast({ title: 'Contrato obrigatório', description: 'A OS precisa estar vinculada a um contrato para ser faturada.', variant: 'destructive' });
      return;
    }

    setFaturando(true);

    try {
      const totalFatura = calcularTotal();

      const { data: fatura, error: faturaError } = await supabase
        .from('faturas')
        .insert({
          cliente_id: os.cliente_id,
          os_id: os.id,
          valor_total: totalFatura,
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

      const { error: osError } = await supabase
        .from('ordens_servico')
        .update({ status: 'faturada' })
        .eq('id', os.id);
      if (osError) throw osError;

      // Fetch parts for PDF
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

      gerarFaturaPDF({
        numero: fatura.numero,
        cliente_nome: os.cliente?.nome_empresa || '',
        cliente_cnpj: os.cliente?.cnpj_cpf,
        cliente_endereco: os.cliente?.endereco,
        cliente_telefone: os.cliente?.telefone,
        cliente_email: os.cliente?.email,
        descricao: faturaForm.descricao || `Ordem de Serviço #${os.numero}`,
        valor_total: totalFatura,
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: faturaForm.data_vencimento,
        forma_pagamento: faturaForm.forma_pagamento,
        status: 'em_aberto',
        pecas: pecasPDF,
        horas_trabalhadas: horas,
        valor_mao_obra: valorMaoObra,
        valor_materiais: totalPecas,
        observacoes: form.observacoes,
      });

      toast({ title: 'Sucesso', description: `Fatura #${fatura.numero} criada e PDF gerado.` });
      setFaturarDialogOpen(false);
      fetchOS();
    } catch (error: any) {
      console.error('Erro ao faturar:', error);
      toast({ title: 'Erro', description: error.message || 'Não foi possível criar a fatura.', variant: 'destructive' });
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
        <Button variant="link" onClick={() => navigate('/app/ordens-servico')}>Voltar</Button>
      </div>
    );
  }

  const status = getStatusBadge(os.status);
  const canEdit = isAdmin || isTecnico || isFinanceiro;
  const canFaturar = (isAdmin || isFinanceiro) && os.status === 'finalizada';
  const canMarcarPago = (isAdmin || isFinanceiro) && os.status === 'faturada';
  const isLocked = os.status === 'faturada' || os.status === 'pago';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-navy">OS #{os.numero}</h1>
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
              valor_materiais: totalPecas,
              valor_mao_obra: valorMaoObra,
              valor_total: calcularTotal(),
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
          {canEdit && !isLocked && (
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
                  <DialogDescription>Crie uma fatura para esta ordem de serviço</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Mão de obra ({horas}h):</span>
                      <span>R$ {valorMaoObra.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Peças/materiais:</span>
                      <span>R$ {totalPecas.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-navy">R$ {calcularTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Vencimento *</Label>
                    <Input
                      type="date"
                      value={faturaForm.data_vencimento}
                      onChange={(e) => setFaturaForm({ ...faturaForm, data_vencimento: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Forma de Pagamento</Label>
                    <Select value={faturaForm.forma_pagamento} onValueChange={(value) => setFaturaForm({ ...faturaForm, forma_pagamento: value })}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
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
                  <Button variant="outline" onClick={() => setFaturarDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleFaturar} disabled={!faturaForm.data_vencimento || faturando} className="bg-green-600 hover:bg-green-700">
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
                  const { error } = await supabase.from('ordens_servico').update({ status: 'pago' as any }).eq('id', os.id);
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
            <CardHeader><CardTitle>Serviços</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição do Serviço</Label>
                <Textarea
                  value={form.descricao_servico}
                  onChange={(e) => setForm({ ...form, descricao_servico: e.target.value })}
                  placeholder="Descrição do serviço a ser realizado..."
                  rows={3}
                  disabled={!canEdit || isLocked}
                />
              </div>

              <div className="space-y-2">
                <Label>Serviços Realizados</Label>
                <Textarea
                  value={form.servicos_realizados}
                  onChange={(e) => setForm({ ...form, servicos_realizados: e.target.value })}
                  placeholder="Descreva os serviços realizados..."
                  rows={4}
                  disabled={!canEdit || isLocked}
                />
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={2}
                  disabled={!canEdit || isLocked}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lançamento de Horas — auto-calculated */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Lançamento de Horas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Tipo de Atendimento */}
                <div className="space-y-2">
                  <Label>Tipo de Atendimento</Label>
                  <Select
                    value={form.tipo_atendimento}
                    onValueChange={(v) => setForm({ ...form, tipo_atendimento: v as TipoAtendimento })}
                    disabled={!canEdit || isLocked}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIPO_ATENDIMENTO_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo de Hora */}
                <div className="space-y-2">
                  <Label>Tipo de Hora *</Label>
                  {tiposHora.length > 0 ? (
                    <Select
                      value={form.tipo_hora_id}
                      onValueChange={(v) => setForm({ ...form, tipo_hora_id: v })}
                      disabled={!canEdit || isLocked}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {tiposHora.map((t: any) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.nome} — R$ {Number(t.valor_hora_extra).toFixed(2)}/h
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground pt-2">
                      {os.contrato_id ? 'Nenhum tipo de hora cadastrado no contrato.' : 'OS sem contrato vinculado.'}
                    </p>
                  )}
                </div>

                {/* Horas */}
                <div className="space-y-2">
                  <Label>Horas Trabalhadas</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={form.horas_trabalhadas}
                    onChange={(e) => setForm({ ...form, horas_trabalhadas: e.target.value })}
                    disabled={!canEdit || isLocked}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value: OSStatus) => setForm({ ...form, status: value })}
                    disabled={!canEdit || isLocked}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberta">Em Aberto</SelectItem>
                      <SelectItem value="em_execucao">Em Execução</SelectItem>
                      <SelectItem value="finalizada">Finalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Auto-calculated value summary */}
              {(horas > 0 || totalPecas > 0) && (
                <div className="bg-muted/50 border rounded-lg p-4 space-y-2">
                  {form.tipo_hora_id && horas > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tipo de hora:</span>
                        <span className="font-medium">{selectedTipoHora?.nome}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Valor/hora:</span>
                        <span>R$ {valorHora.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Horas × Valor:</span>
                        <span>{horas}h × R$ {valorHora.toFixed(2)} = <strong>R$ {valorMaoObra.toFixed(2)}</strong></span>
                      </div>
                    </>
                  )}
                  {totalPecas > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Peças/materiais:</span>
                      <span>R$ {totalPecas.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Valor Total da OS:</span>
                    <span className="text-xl font-bold text-navy">
                      R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {!os.contrato_id && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Esta OS não está vinculada a um contrato. Os valores não podem ser calculados automaticamente.
                  </AlertDescription>
                </Alert>
              )}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{os.cliente?.nome_empresa}</p>
              {os.cliente?.telefone && <p className="text-sm text-muted-foreground">📞 {os.cliente.telefone}</p>}
              {os.cliente?.email && <p className="text-sm text-muted-foreground">✉️ {os.cliente.email}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {isAdmin && (
                <div className="space-y-2">
                  <Label>Técnico Responsável</Label>
                  <Select
                    value={form.tecnico_id}
                    onValueChange={(value) => setForm({ ...form, tecnico_id: value })}
                    disabled={isLocked}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {tecnicos.map((tecnico) => (
                        <SelectItem key={tecnico.user_id} value={tecnico.user_id}>{tecnico.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {os.contrato_id && (
                <div>
                  <p className="text-sm text-muted-foreground">Contrato</p>
                  <Link to={`/app/contratos/${os.contrato_id}`} className="text-navy hover:underline text-sm flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Ver contrato
                  </Link>
                </div>
              )}

              {form.tipo_atendimento && (
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Atendimento</p>
                  <p className="font-medium">{TIPO_ATENDIMENTO_LABELS[form.tipo_atendimento as TipoAtendimento]}</p>
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
