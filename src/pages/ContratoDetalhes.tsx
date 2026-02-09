import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ArrowLeft, Loader2, Calendar, Clock, DollarSign, FileText, CheckCircle, Play, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Contrato {
  id: string;
  numero: number;
  cliente_id: string;
  valor_mensal: number;
  horas_inclusas: number;
  vigencia_inicio: string;
  vigencia_fim: string | null;
  status: string;
  observacoes: string | null;
  created_at: string;
  cliente?: { nome_empresa: string } | null;
}

interface TipoHora {
  id: string;
  contrato_id: string;
  nome: string;
  valor_hora_extra: number;
}

interface Periodo {
  id: string;
  contrato_id: string;
  mes_referencia: string;
  horas_inclusas: number;
  total_horas_usadas: number;
  horas_excedentes: number;
  total_atendimentos: number;
  total_os: number;
  valor_horas_extras: number;
  valor_materiais: number;
  valor_total: number;
  status: string;
  fechado_em: string | null;
  aprovado_em: string | null;
  fatura_id: string | null;
}

interface OSContrato {
  id: string;
  numero: number;
  descricao_servico: string | null;
  horas_trabalhadas: number | null;
  valor_materiais: number | null;
  valor_total: number | null;
  data_inicio: string | null;
  status: string;
  tipo_hora_id: string | null;
  tecnico?: { nome: string } | null;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ativo: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
  suspenso: { label: 'Suspenso', color: 'bg-yellow-100 text-yellow-800' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  encerrado: { label: 'Encerrado', color: 'bg-gray-100 text-gray-800' },
};

const periodoStatusConfig: Record<string, { label: string; color: string }> = {
  ativo: { label: 'Ativo', color: 'bg-blue-100 text-blue-800' },
  fechado: { label: 'Fechado', color: 'bg-yellow-100 text-yellow-800' },
  faturado: { label: 'Faturado', color: 'bg-green-100 text-green-800' },
};

export default function ContratoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isFinanceiro } = useAuth();
  const { toast } = useToast();

  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [tiposHora, setTiposHora] = useState<TipoHora[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null);
  const [osDoperiodo, setOsDoperiodo] = useState<OSContrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [contratoRes, tiposRes, periodosRes] = await Promise.all([
        supabase.from('contratos').select('*, cliente:clientes(nome_empresa)').eq('id', id).single(),
        supabase.from('contrato_tipos_hora').select('*').eq('contrato_id', id),
        supabase.from('contrato_periodos').select('*').eq('contrato_id', id).order('mes_referencia', { ascending: false }),
      ]);

      if (contratoRes.error) throw contratoRes.error;
      setContrato(contratoRes.data);
      setTiposHora(tiposRes.data || []);
      setPeriodos(periodosRes.data || []);
    } catch (error) {
      console.error('Erro:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar o contrato.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchOsPeriodo = async (periodo: Periodo) => {
    if (!contrato) return;
    const mesRef = new Date(periodo.mes_referencia);
    const inicioMes = new Date(mesRef.getFullYear(), mesRef.getMonth(), 1).toISOString();
    const fimMes = new Date(mesRef.getFullYear(), mesRef.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data } = await supabase
      .from('ordens_servico')
      .select('*, tecnico:profiles!ordens_servico_tecnico_id_fkey(nome)')
      .eq('cliente_id', contrato.cliente_id)
      .gte('data_inicio', inicioMes)
      .lte('data_inicio', fimMes)
      .order('data_inicio');

    setOsDoperiodo((data as unknown as OSContrato[]) || []);
    setSelectedPeriodo(periodo);
    setShowReport(true);
  };

  const handleFecharPeriodo = async (periodo: Periodo) => {
    if (!contrato) return;
    setClosing(true);

    try {
      const mesRef = new Date(periodo.mes_referencia);
      const inicioMes = new Date(mesRef.getFullYear(), mesRef.getMonth(), 1).toISOString();
      const fimMes = new Date(mesRef.getFullYear(), mesRef.getMonth() + 1, 0, 23, 59, 59).toISOString();

      // Buscar OS do período
      const { data: osList } = await supabase
        .from('ordens_servico')
        .select('*')
        .eq('cliente_id', contrato.cliente_id)
        .gte('data_inicio', inicioMes)
        .lte('data_inicio', fimMes);

      const osDoPeriodo = osList || [];
      const totalHoras = osDoPeriodo.reduce((acc, os) => acc + (Number(os.horas_trabalhadas) || 0), 0);
      const totalMateriais = osDoPeriodo.reduce((acc, os) => acc + (Number(os.valor_materiais) || 0), 0);
      const horasExcedentes = Math.max(0, totalHoras - Number(contrato.horas_inclusas));

      // Calcular horas extras por tipo
      const horasPorTipo: Record<string, number> = {};
      for (const os of osDoPeriodo) {
        const tipoId = os.tipo_hora_id || 'default';
        horasPorTipo[tipoId] = (horasPorTipo[tipoId] || 0) + (Number(os.horas_trabalhadas) || 0);
      }

      // Calcular valor de horas extras (proporcional por tipo)
      let valorHorasExtras = 0;
      if (horasExcedentes > 0 && tiposHora.length > 0) {
        // Distribuir excedente proporcionalmente
        const totalUsado = totalHoras;
        for (const tipo of tiposHora) {
          const horasTipo = horasPorTipo[tipo.id] || 0;
          const proporcao = totalUsado > 0 ? horasTipo / totalUsado : 0;
          const excedenteDoTipo = horasExcedentes * proporcao;
          valorHorasExtras += excedenteDoTipo * Number(tipo.valor_hora_extra);
        }
      }

      const valorTotal = Number(contrato.valor_mensal) + valorHorasExtras + totalMateriais;

      // Atualizar período
      const { error } = await supabase
        .from('contrato_periodos')
        .update({
          total_horas_usadas: totalHoras,
          horas_excedentes: horasExcedentes,
          total_atendimentos: osDoPeriodo.length,
          total_os: osDoPeriodo.length,
          valor_horas_extras: valorHorasExtras,
          valor_materiais: totalMateriais,
          valor_total: valorTotal,
          status: 'fechado',
          fechado_em: new Date().toISOString(),
          fechado_por: user?.id,
        })
        .eq('id', periodo.id);

      if (error) throw error;

      // Salvar horas por tipo
      for (const tipo of tiposHora) {
        const horas = horasPorTipo[tipo.id] || 0;
        if (horas > 0) {
          await supabase.from('contrato_periodo_horas').insert({
            periodo_id: periodo.id,
            tipo_hora_id: tipo.id,
            horas,
            valor_hora_extra: Number(tipo.valor_hora_extra),
          });
        }
      }

      toast({ title: 'Sucesso', description: 'Período fechado com sucesso. Aguardando aprovação.' });
      fetchData();
    } catch (error: any) {
      console.error('Erro ao fechar período:', error);
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setClosing(false);
    }
  };

  const handleAprovar = async (periodo: Periodo) => {
    setApproving(true);
    try {
      // Atualizar período como aprovado
      const { error: periodoError } = await supabase
        .from('contrato_periodos')
        .update({
          aprovado_em: new Date().toISOString(),
          aprovado_por: user?.id,
        })
        .eq('id', periodo.id);

      if (periodoError) throw periodoError;

      // Gerar fatura
      const mesLabel = format(new Date(periodo.mes_referencia), 'MMMM/yyyy', { locale: ptBR });
      const { data: fatura, error: faturaError } = await supabase
        .from('faturas')
        .insert({
          cliente_id: contrato!.cliente_id,
          valor_total: periodo.valor_total,
          descricao: `Contrato #${contrato!.numero} - ${mesLabel}`,
          data_vencimento: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
          created_by: user?.id,
        })
        .select()
        .single();

      if (faturaError) throw faturaError;

      // Vincular fatura ao período e marcar como faturado
      await supabase
        .from('contrato_periodos')
        .update({ fatura_id: fatura.id, status: 'faturado' })
        .eq('id', periodo.id);

      toast({ title: 'Sucesso', description: `Período aprovado e fatura #${fatura.numero} gerada.` });
      fetchData();
    } catch (error: any) {
      console.error('Erro ao aprovar:', error);
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  if (!contrato) {
    return <p className="text-center text-muted-foreground py-8">Contrato não encontrado.</p>;
  }

  const cfg = statusConfig[contrato.status] || statusConfig.ativo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/contratos')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-navy">Contrato #{contrato.numero}</h1>
          <p className="text-muted-foreground">{contrato.cliente?.nome_empresa}</p>
        </div>
        <Badge className={cfg.color}>{cfg.label}</Badge>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" /> Valor Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-navy">
              R$ {Number(contrato.valor_mensal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" /> Horas Inclusas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-navy">{Number(contrato.horas_inclusas)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Vigência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {format(new Date(contrato.vigencia_inicio), 'dd/MM/yyyy', { locale: ptBR })}
              {contrato.vigencia_fim && ` - ${format(new Date(contrato.vigencia_fim), 'dd/MM/yyyy', { locale: ptBR })}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <FileText className="h-4 w-4" /> Tipos de Hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {tiposHora.map((t) => (
                <p key={t.id} className="text-xs">
                  {t.nome}: <span className="font-medium">R$ {Number(t.valor_hora_extra).toFixed(2)}/h extra</span>
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Períodos */}
      <Card>
        <CardHeader>
          <CardTitle>Períodos Mensais</CardTitle>
          <CardDescription>Histórico de apuração mensal do contrato</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {periodos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum período registrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead>Horas Usadas</TableHead>
                    <TableHead>Excedente</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[200px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periodos.map((p) => {
                    const pcfg = periodoStatusConfig[p.status] || periodoStatusConfig.ativo;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          {format(new Date(p.mes_referencia), 'MMMM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>{Number(p.total_horas_usadas)}h / {Number(p.horas_inclusas)}h</TableCell>
                        <TableCell className={Number(p.horas_excedentes) > 0 ? 'text-red-600 font-medium' : ''}>
                          {Number(p.horas_excedentes)}h
                        </TableCell>
                        <TableCell>{p.total_os}</TableCell>
                        <TableCell className="font-medium">
                          R$ {Number(p.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge className={pcfg.color}>{pcfg.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => fetchOsPeriodo(p)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Relatório
                            </Button>
                            {p.status === 'ativo' && isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFecharPeriodo(p)}
                                disabled={closing}
                              >
                                {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
                                Fechar
                              </Button>
                            )}
                            {p.status === 'fechado' && !p.aprovado_em && (isAdmin || isFinanceiro) && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleAprovar(p)}
                                disabled={approving}
                              >
                                {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                Aprovar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Relatório */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Relatório - {selectedPeriodo && format(new Date(selectedPeriodo.mes_referencia), 'MMMM/yyyy', { locale: ptBR })}
            </DialogTitle>
            <DialogDescription>Contrato #{contrato.numero} - {contrato.cliente?.nome_empresa}</DialogDescription>
          </DialogHeader>

          {selectedPeriodo && (
            <div className="space-y-6">
              {/* Resumo */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total de OS</p>
                  <p className="text-xl font-bold">{selectedPeriodo.total_os}</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Horas</p>
                  <p className="text-xl font-bold">{Number(selectedPeriodo.total_horas_usadas)}h</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Horas Abatidas</p>
                  <p className="text-xl font-bold text-green-600">
                    {Math.min(Number(selectedPeriodo.total_horas_usadas), Number(selectedPeriodo.horas_inclusas))}h
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Horas Extras</p>
                  <p className="text-xl font-bold text-red-600">{Number(selectedPeriodo.horas_excedentes)}h</p>
                </div>
              </div>

              {/* OS do período */}
              <div>
                <h3 className="font-medium mb-2">Ordens de Serviço</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Materiais</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {osDoperiodo.map((os) => (
                      <TableRow key={os.id}>
                        <TableCell className="font-medium">#{os.numero}</TableCell>
                        <TableCell className="text-sm">
                          {os.data_inicio ? format(new Date(os.data_inicio), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{os.descricao_servico || '-'}</TableCell>
                        <TableCell>{Number(os.horas_trabalhadas || 0)}h</TableCell>
                        <TableCell>R$ {Number(os.valor_materiais || 0).toFixed(2)}</TableCell>
                        <TableCell className="font-medium">R$ {Number(os.valor_total || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {osDoperiodo.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhuma OS no período
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Totais finais */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Valor do Contrato</span>
                  <span>R$ {Number(contrato.valor_mensal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Horas Extras ({Number(selectedPeriodo.horas_excedentes)}h)</span>
                  <span>R$ {Number(selectedPeriodo.valor_horas_extras).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Materiais</span>
                  <span>R$ {Number(selectedPeriodo.valor_materiais).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Valor Total</span>
                  <span className="text-navy">R$ {Number(selectedPeriodo.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
