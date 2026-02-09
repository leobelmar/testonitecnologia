import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Cliente, Chamado, Profile, TipoAtendimento } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TIPO_ATENDIMENTO_LABELS: Record<TipoAtendimento, string> = {
  remoto: 'Remoto',
  presencial: 'Presencial',
  sla1: 'SLA 1',
  sla2: 'SLA 2',
  sla3: 'SLA 3',
};

export default function NovaOS() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [tecnicos, setTecnicos] = useState<Profile[]>([]);
  const [contratos, setContratos] = useState<any[]>([]);
  const [tiposHora, setTiposHora] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    cliente_id: '',
    chamado_id: '',
    tecnico_id: '',
    contrato_id: '',
    tipo_hora_id: '',
    tipo_atendimento: '' as TipoAtendimento | '',
    descricao_servico: '',
    horas_trabalhadas: '',
    observacoes: '',
  });

  // Selected tipo_hora rate
  const selectedTipoHora = tiposHora.find((t: any) => t.id === form.tipo_hora_id);
  const valorHora = selectedTipoHora ? Number(selectedTipoHora.valor_hora_extra) : 0;
  const horas = parseFloat(form.horas_trabalhadas) || 0;
  const valorMaoObra = valorHora * horas;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const chamadoId = searchParams.get('chamado');
    if (chamadoId && chamados.length > 0) {
      const chamado = chamados.find(c => c.id === chamadoId);
      if (chamado) {
        setForm(prev => ({ ...prev, chamado_id: chamadoId, cliente_id: chamado.cliente_id }));
      }
    }
  }, [searchParams, chamados]);

  const fetchData = async () => {
    try {
      const [clientesRes, chamadosRes, tecnicosRes] = await Promise.all([
        supabase.from('clientes').select('*').eq('status', 'ativo').order('nome_empresa'),
        supabase.from('chamados').select('*, cliente:clientes(nome_empresa)').not('status', 'in', '("finalizado","cancelado")').order('numero', { ascending: false }),
        supabase.from('profiles').select('*').in('role', ['admin', 'tecnico']).eq('ativo', true).order('nome'),
      ]);
      setClientes(clientesRes.data as Cliente[] || []);
      setChamados(chamadosRes.data as Chamado[] || []);
      setTecnicos(tecnicosRes.data as Profile[] || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Auto-link contract when client changes
  useEffect(() => {
    if (form.cliente_id) {
      supabase.from('contratos').select('*, contrato_tipos_hora(*)').eq('cliente_id', form.cliente_id).eq('status', 'ativo').then(({ data }) => {
        setContratos(data || []);
        if (data && data.length >= 1) {
          const contrato = data[0];
          setForm(prev => ({ ...prev, contrato_id: contrato.id }));
          setTiposHora(contrato.contrato_tipos_hora || []);
        } else {
          setForm(prev => ({ ...prev, contrato_id: '', tipo_hora_id: '' }));
          setTiposHora([]);
        }
      });
    } else {
      setContratos([]);
      setTiposHora([]);
    }
  }, [form.cliente_id]);

  // Update hour types when contract changes
  useEffect(() => {
    const contrato = contratos.find((c: any) => c.id === form.contrato_id);
    setTiposHora(contrato?.contrato_tipos_hora || []);
    setForm(prev => ({ ...prev, tipo_hora_id: '' }));
  }, [form.contrato_id]);

  const handleChamadoChange = (chamadoId: string) => {
    const chamado = chamados.find(c => c.id === chamadoId);
    setForm(prev => ({
      ...prev,
      chamado_id: chamadoId,
      cliente_id: chamado?.cliente_id || prev.cliente_id,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.cliente_id) {
      toast({ title: 'Erro', description: 'Selecione um cliente.', variant: 'destructive' });
      return;
    }

    // Block: OS without contract when client has active contracts
    if (contratos.length > 0 && !form.contrato_id) {
      toast({ title: 'Contrato obrigatório', description: 'Este cliente possui contrato ativo. Selecione o contrato.', variant: 'destructive' });
      return;
    }

    // Block: OS without hour type when contract is selected
    if (form.contrato_id && !form.tipo_hora_id) {
      toast({ title: 'Tipo de hora obrigatório', description: 'Selecione o tipo de hora do contrato.', variant: 'destructive' });
      return;
    }

    // Block: no client has contract but no active contract exists
    if (contratos.length === 0 && form.cliente_id) {
      toast({ title: 'Sem contrato ativo', description: 'Este cliente não possui contrato ativo. Cadastre um contrato antes de criar a OS.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .insert({
          cliente_id: form.cliente_id,
          chamado_id: form.chamado_id || null,
          tecnico_id: form.tecnico_id || user?.id,
          contrato_id: form.contrato_id || null,
          tipo_hora_id: form.tipo_hora_id || null,
          tipo_atendimento: (form.tipo_atendimento as TipoAtendimento) || null,
          descricao_servico: form.descricao_servico || null,
          horas_trabalhadas: horas,
          valor_mao_obra: valorMaoObra,
          valor_materiais: 0,
          valor_total: valorMaoObra,
          observacoes: form.observacoes || null,
          data_inicio: new Date().toISOString(),
          status: 'em_execucao',
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (form.chamado_id) {
        await supabase.from('chamados').update({ status: 'em_atendimento' }).eq('id', form.chamado_id);
      }

      toast({ title: 'Sucesso', description: `OS #${data.numero} criada com sucesso.` });
      navigate(`/app/ordens-servico/${data.id}`);
    } catch (error: any) {
      console.error('Erro ao criar OS:', error);
      toast({ title: 'Erro', description: error.message || 'Não foi possível criar a ordem de serviço.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  const noContract = form.cliente_id && contratos.length === 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-navy">Nova Ordem de Serviço</h1>
          <p className="text-muted-foreground">Registre uma nova OS vinculada ao contrato</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Selecione o cliente e vincule ao contrato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Chamado */}
              <div className="space-y-2 md:col-span-2">
                <Label>Chamado (opcional)</Label>
                <Select
                  value={form.chamado_id || "avulsa"}
                  onValueChange={(value) => handleChamadoChange(value === "avulsa" ? "" : value)}
                >
                  <SelectTrigger><SelectValue placeholder="Vincular a um chamado..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avulsa">OS Avulsa (sem chamado)</SelectItem>
                    {chamados.map((chamado) => (
                      <SelectItem key={chamado.id} value={chamado.id}>
                        #{chamado.numero} - {chamado.titulo} ({chamado.cliente?.nome_empresa})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cliente */}
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select
                  value={form.cliente_id}
                  onValueChange={(value) => setForm({ ...form, cliente_id: value, contrato_id: '', tipo_hora_id: '' })}
                  disabled={!!form.chamado_id}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome_empresa}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Técnico */}
              <div className="space-y-2">
                <Label>Técnico Responsável</Label>
                <Select value={form.tecnico_id} onValueChange={(value) => setForm({ ...form, tecnico_id: value })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o técnico" /></SelectTrigger>
                  <SelectContent>
                    {tecnicos.map((tecnico) => (
                      <SelectItem key={tecnico.user_id} value={tecnico.user_id}>{tecnico.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contrato (auto-vinculado) */}
              <div className="space-y-2">
                <Label>Contrato</Label>
                {form.contrato_id && contratos.length > 0 ? (
                  <div className="bg-muted/50 border rounded-md px-3 py-2 text-sm">
                    <span className="font-medium">#{contratos.find((c: any) => c.id === form.contrato_id)?.numero}</span>
                    {' — '}
                    {contratos.find((c: any) => c.id === form.contrato_id)?.horas_inclusas}h inclusas
                    {' — R$ '}
                    {Number(contratos.find((c: any) => c.id === form.contrato_id)?.valor_mensal || 0).toFixed(2)}/mês
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground pt-2">
                    {form.cliente_id ? 'Nenhum contrato ativo.' : 'Selecione um cliente primeiro.'}
                  </p>
                )}
              </div>

              {/* Tipo de Hora */}
              {tiposHora.length > 0 && (
                <div className="space-y-2">
                  <Label>Tipo de Hora *</Label>
                  <Select value={form.tipo_hora_id} onValueChange={(v) => setForm({ ...form, tipo_hora_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>
                      {tiposHora.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{t.nome} — R$ {Number(t.valor_hora_extra).toFixed(2)}/h</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {noContract && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Este cliente não possui contrato ativo. Cadastre um contrato antes de criar a OS.
                </AlertDescription>
              </Alert>
            )}

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição do Serviço</Label>
              <Textarea
                value={form.descricao_servico}
                onChange={(e) => setForm({ ...form, descricao_servico: e.target.value })}
                placeholder="Descreva os serviços a serem realizados..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lançamento de Horas</CardTitle>
            <CardDescription>Os valores são calculados automaticamente pelo contrato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Tipo de Atendimento */}
              <div className="space-y-2">
                <Label>Tipo de Atendimento</Label>
                <Select
                  value={form.tipo_atendimento}
                  onValueChange={(v) => setForm({ ...form, tipo_atendimento: v as TipoAtendimento })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_ATENDIMENTO_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  placeholder="0"
                />
              </div>
            </div>

            {/* Auto-calculated summary */}
            {form.tipo_hora_id && horas > 0 && (
              <div className="bg-muted/50 border rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipo de hora:</span>
                  <span className="font-medium">{selectedTipoHora?.nome}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor/hora:</span>
                  <span className="font-medium">R$ {valorHora.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horas:</span>
                  <span className="font-medium">{horas}h</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Valor do Serviço:</span>
                  <span className="text-lg font-bold text-navy">
                    R$ {valorMaoObra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Observações */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Observações adicionais..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-navy hover:bg-petrol"
            disabled={loading || !!noContract}
          >
            {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando...</>) : 'Criar Ordem de Serviço'}
          </Button>
        </div>
      </form>
    </div>
  );
}
