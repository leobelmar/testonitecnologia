import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Chamado, ChamadoHistorico, ChamadoStatus, Profile } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Clock,
  User,
  Send,
  Loader2,
  AlertTriangle,
  Printer,
  FileText,
  CheckCircle,
  Calendar,
  Phone,
  Mail,
} from 'lucide-react';
import { PrintDialog } from '@/components/PrintDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChamadoDialogProps {
  chamadoId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChamadoUpdated?: () => void;
}

export function ChamadoDialog({ chamadoId, open, onOpenChange, onChamadoUpdated }: ChamadoDialogProps) {
  const navigate = useNavigate();
  const { user, isAdmin, isTecnico } = useAuth();
  const { toast } = useToast();

  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [historico, setHistorico] = useState<ChamadoHistorico[]>([]);
  const [tecnicos, setTecnicos] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Estados para modais internos
  const [showGerarOSDialog, setShowGerarOSDialog] = useState(false);
  const [showEncerrarDialog, setShowEncerrarDialog] = useState(false);
  const [osForm, setOsForm] = useState({
    descricao_servico: '',
    horas_trabalhadas: '',
    valor_mao_obra: '',
    valor_materiais: '',
    materiais_usados: '',
    observacoes: '',
  });
  const [encerrandoChamado, setEncerrandoChamado] = useState(false);
  const [criandoOS, setCriandoOS] = useState(false);

  useEffect(() => {
    if (open && chamadoId) {
      fetchChamado();
      fetchHistorico();
      if (isAdmin) fetchTecnicos();
    }
  }, [open, chamadoId]);

  const fetchChamado = async () => {
    if (!chamadoId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chamados')
        .select(`
          *,
          cliente:clientes(id, nome_empresa, telefone, email)
        `)
        .eq('id', chamadoId)
        .single();

      if (error) throw error;
      setChamado(data as Chamado);
    } catch (error) {
      console.error('Erro ao buscar chamado:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o chamado.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorico = async () => {
    if (!chamadoId) return;
    try {
      const { data, error } = await supabase
        .from('chamados_historico')
        .select('*')
        .eq('chamado_id', chamadoId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const userIds = [...new Set(data.map(h => h.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      const historicoComUsuarios = data.map(h => ({
        ...h,
        usuario: profiles?.find(p => p.user_id === h.user_id) || null,
      }));

      setHistorico(historicoComUsuarios as ChamadoHistorico[]);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
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

  const handleStatusChange = async (novoStatus: ChamadoStatus) => {
    if (!chamado) return;

    try {
      const updateData: any = { status: novoStatus };
      if (novoStatus === 'finalizado') {
        updateData.data_fechamento = new Date().toISOString();
      }

      const { error } = await supabase
        .from('chamados')
        .update(updateData)
        .eq('id', chamado.id);

      if (error) throw error;

      setChamado({ ...chamado, status: novoStatus });
      fetchHistorico();
      onChamadoUpdated?.();

      toast({
        title: 'Sucesso',
        description: 'Status atualizado.',
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  };

  const handleAtribuir = async (tecnicoId: string) => {
    if (!chamado) return;

    try {
      const { error } = await supabase
        .from('chamados')
        .update({ atribuido_a: tecnicoId || null })
        .eq('id', chamado.id);

      if (error) throw error;

      const tecnico = tecnicos.find(t => t.user_id === tecnicoId);
      await supabase.from('chamados_historico').insert({
        chamado_id: chamado.id,
        user_id: user?.id,
        tipo: 'atribuicao',
        conteudo: tecnicoId
          ? `Chamado atribuído para ${tecnico?.nome}`
          : 'Atribuição removida',
      });

      setChamado({ ...chamado, atribuido_a: tecnicoId || null });
      fetchHistorico();
      onChamadoUpdated?.();

      toast({
        title: 'Sucesso',
        description: 'Atribuição atualizada.',
      });
    } catch (error) {
      console.error('Erro ao atribuir:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atribuir o chamado.',
        variant: 'destructive',
      });
    }
  };

  const handleEnviarComentario = async () => {
    if (!comentario.trim() || !chamado) return;

    setEnviando(true);
    try {
      const { error } = await supabase.from('chamados_historico').insert({
        chamado_id: chamado.id,
        user_id: user?.id,
        tipo: 'comentario',
        conteudo: comentario.trim(),
      });

      if (error) throw error;

      // Notificar sobre a interação
      try {
        await supabase.functions.invoke('notificar-interacao', {
          body: {
            chamado_id: chamado.id,
            mensagem: comentario.trim(),
            tipo: 'comentario',
            user_id: user?.id,
          },
        });
      } catch (notifyError) {
        console.error('Erro ao enviar notificação:', notifyError);
      }

      setComentario('');
      fetchHistorico();

      toast({
        title: 'Sucesso',
        description: 'Comentário enviado.',
      });
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o comentário.',
        variant: 'destructive',
      });
    } finally {
      setEnviando(false);
    }
  };

  const handleEncerrarSemValor = async () => {
    if (!chamado) return;

    setEncerrandoChamado(true);
    try {
      const { error } = await supabase
        .from('chamados')
        .update({
          status: 'finalizado',
          data_fechamento: new Date().toISOString()
        })
        .eq('id', chamado.id);

      if (error) throw error;

      await supabase.from('chamados_historico').insert({
        chamado_id: chamado.id,
        user_id: user?.id,
        tipo: 'encerramento',
        status_anterior: chamado.status,
        status_novo: 'finalizado',
        conteudo: 'Chamado encerrado sem geração de fatura.',
      });

      toast({
        title: 'Sucesso',
        description: 'Chamado encerrado com sucesso.',
      });

      setShowEncerrarDialog(false);
      setChamado({ ...chamado, status: 'finalizado' });
      fetchHistorico();
      onChamadoUpdated?.();
    } catch (error) {
      console.error('Erro ao encerrar chamado:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível encerrar o chamado.',
        variant: 'destructive',
      });
    } finally {
      setEncerrandoChamado(false);
    }
  };

  const handleGerarOS = async () => {
    if (!chamado) return;

    setCriandoOS(true);
    try {
      const valorMateriais = parseFloat(osForm.valor_materiais) || 0;
      const valorMaoObra = parseFloat(osForm.valor_mao_obra) || 0;
      const valorTotal = valorMateriais + valorMaoObra;

      const { data: novaOS, error: osError } = await supabase
        .from('ordens_servico')
        .insert({
          cliente_id: chamado.cliente_id,
          chamado_id: chamado.id,
          tecnico_id: user?.id,
          descricao_servico: osForm.descricao_servico || chamado.descricao,
          horas_trabalhadas: parseFloat(osForm.horas_trabalhadas) || 0,
          materiais_usados: osForm.materiais_usados || null,
          valor_materiais: valorMateriais,
          valor_mao_obra: valorMaoObra,
          valor_total: valorTotal,
          observacoes: osForm.observacoes || null,
          data_inicio: new Date().toISOString(),
          data_fim: new Date().toISOString(),
          status: 'finalizada',
          created_by: user?.id,
        })
        .select()
        .single();

      if (osError) throw osError;

      await supabase
        .from('chamados')
        .update({
          status: 'finalizado',
          data_fechamento: new Date().toISOString()
        })
        .eq('id', chamado.id);

      await supabase.from('chamados_historico').insert({
        chamado_id: chamado.id,
        user_id: user?.id,
        tipo: 'os_gerada',
        status_anterior: chamado.status,
        status_novo: 'finalizado',
        conteudo: `Ordem de Serviço #${novaOS.numero} gerada com valor total de R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      });

      toast({
        title: 'Sucesso',
        description: `OS #${novaOS.numero} criada com sucesso.`,
      });

      setShowGerarOSDialog(false);
      onOpenChange(false);
      onChamadoUpdated?.();
      navigate(`/app/ordens-servico/${novaOS.id}`);
    } catch (error) {
      console.error('Erro ao gerar OS:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar a ordem de serviço.',
        variant: 'destructive',
      });
    } finally {
      setCriandoOS(false);
    }
  };

  const calcularTotalOS = () => {
    const materiais = parseFloat(osForm.valor_materiais) || 0;
    const maoObra = parseFloat(osForm.valor_mao_obra) || 0;
    return materiais + maoObra;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const styles: Record<string, string> = {
      baixa: 'bg-green-100 text-green-800',
      media: 'bg-yellow-100 text-yellow-800',
      alta: 'bg-orange-100 text-orange-800',
      urgente: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      baixa: 'Baixa',
      media: 'Média',
      alta: 'Alta',
      urgente: 'Urgente',
    };
    return { style: styles[prioridade], label: labels[prioridade] };
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      aberto: 'bg-blue-100 text-blue-800',
      em_atendimento: 'bg-purple-100 text-purple-800',
      aguardando_cliente: 'bg-yellow-100 text-yellow-800',
      aguardando_terceiros: 'bg-orange-100 text-orange-800',
      finalizado: 'bg-green-100 text-green-800',
      cancelado: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      aberto: 'Aberto',
      em_atendimento: 'Em Atendimento',
      aguardando_cliente: 'Aguardando Cliente',
      aguardando_terceiros: 'Aguardando Terceiros',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado',
    };
    return { style: styles[status], label: labels[status] };
  };

  const chamadoNaoFinalizado = chamado && chamado.status !== 'finalizado' && chamado.status !== 'cancelado';

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-navy" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!chamado) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Chamado não encontrado.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const prioridade = getPrioridadeBadge(chamado.prioridade);
  const status = getStatusBadge(chamado.status);

  return (
    <>
      <Dialog open={open && !showGerarOSDialog && !showEncerrarDialog} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3 flex-wrap">
              <DialogTitle className="text-xl">
                Chamado #{chamado.numero}
              </DialogTitle>
              <Badge className={prioridade.style}>
                {chamado.prioridade === 'urgente' && (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                {prioridade.label}
              </Badge>
              <Badge className={status.style}>{status.label}</Badge>
            </div>
            <DialogDescription className="text-base font-medium text-foreground">
              {chamado.titulo}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Informações do Chamado */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Cliente */}
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Cliente
                  </h4>
                  <p className="font-medium">{chamado.cliente?.nome_empresa}</p>
                  {chamado.cliente?.telefone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {chamado.cliente.telefone}
                    </p>
                  )}
                  {chamado.cliente?.email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {chamado.cliente.email}
                    </p>
                  )}
                </div>

                {/* Data/Hora */}
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Datas
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Abertura:</span>{' '}
                      <span className="font-medium">
                        {format(new Date(chamado.data_abertura), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Criado em:</span>{' '}
                      <span className="font-medium">
                        {format(new Date(chamado.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </p>
                    {chamado.data_fechamento && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Fechamento:</span>{' '}
                        <span className="font-medium">
                          {format(new Date(chamado.data_fechamento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </p>
                    )}
                  </div>
                  {chamado.tipo && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Tipo:</span> {chamado.tipo}
                    </p>
                  )}
                </div>
              </div>

              {/* Descrição */}
              {chamado.descricao && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Descrição</h4>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                    {chamado.descricao}
                  </p>
                </div>
              )}

              {/* Ações Admin/Técnico */}
              {(isAdmin || isTecnico) && chamadoNaoFinalizado && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={chamado.status}
                      onValueChange={(value) => handleStatusChange(value as ChamadoStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aberto">Aberto</SelectItem>
                        <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                        <SelectItem value="aguardando_cliente">Aguardando Cliente</SelectItem>
                        <SelectItem value="aguardando_terceiros">Aguardando Terceiros</SelectItem>
                        <SelectItem value="finalizado">Finalizado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isAdmin && (
                    <div className="space-y-2">
                      <Label>Atribuir para</Label>
                      <Select
                        value={chamado.atribuido_a || 'nenhum'}
                        onValueChange={(value) => handleAtribuir(value === 'nenhum' ? '' : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Não atribuído" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nenhum">Não atribuído</SelectItem>
                          {tecnicos.map((tecnico) => (
                            <SelectItem key={tecnico.user_id} value={tecnico.user_id}>
                              {tecnico.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Histórico e Interações */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Histórico e Interações
                </h4>

                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {historico.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhuma interação ainda.
                    </p>
                  ) : (
                    historico.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg ${
                          item.tipo === 'comentario'
                            ? 'bg-muted/50'
                            : 'bg-blue-50 border-l-4 border-blue-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {item.usuario?.nome || 'Sistema'}
                            </span>
                            {item.usuario?.role && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {item.usuario.role}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm:ss", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{item.conteudo}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Novo comentário */}
                <div className="space-y-3 pt-2">
                  <Textarea
                    placeholder="Escreva uma interação..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={2}
                  />
                  <Button
                    onClick={handleEnviarComentario}
                    disabled={!comentario.trim() || enviando}
                    className="bg-navy hover:bg-petrol"
                    size="sm"
                  >
                    {enviando ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Enviar Interação
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex-wrap gap-2 pt-4 border-t">
            {chamadoNaoFinalizado && (isAdmin || isTecnico) && (
              <>
                <Button
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  onClick={() => setShowGerarOSDialog(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar OS
                </Button>
                <Button
                  variant="outline"
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                  onClick={() => setShowEncerrarDialog(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Encerrar Sem Valor
                </Button>
              </>
            )}
            <PrintDialog
              data={{
                type: 'chamado',
                numero: chamado.numero,
                titulo: chamado.titulo,
                descricao: chamado.descricao,
                prioridade: chamado.prioridade,
                status: chamado.status,
                data_abertura: chamado.data_abertura,
                cliente_nome: chamado.cliente?.nome_empresa,
                cliente_telefone: chamado.cliente?.telefone,
                cliente_email: chamado.cliente?.email,
                tipo: chamado.tipo,
              }}
              trigger={
                <Button variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              }
            />
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Encerrar Sem Valor */}
      <Dialog open={showEncerrarDialog} onOpenChange={setShowEncerrarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar Chamado Sem Valor</DialogTitle>
            <DialogDescription>
              O chamado será finalizado sem geração de ordem de serviço ou fatura.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Confirma o encerramento do chamado <strong>#{chamado?.numero}</strong> sem gerar nenhum valor a cobrar?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEncerrarDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEncerrarSemValor}
              disabled={encerrandoChamado}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {encerrandoChamado ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Encerrando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Encerrar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Gerar OS */}
      <Dialog open={showGerarOSDialog} onOpenChange={setShowGerarOSDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerar Ordem de Serviço</DialogTitle>
            <DialogDescription>
              Preencha os dados da OS vinculada ao chamado #{chamado?.numero}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="os_descricao">Descrição do Serviço</Label>
              <Textarea
                id="os_descricao"
                value={osForm.descricao_servico}
                onChange={(e) => setOsForm({ ...osForm, descricao_servico: e.target.value })}
                placeholder="Descreva os serviços realizados..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="os_horas">Horas Trabalhadas</Label>
                <Input
                  id="os_horas"
                  type="number"
                  step="0.5"
                  min="0"
                  value={osForm.horas_trabalhadas}
                  onChange={(e) => setOsForm({ ...osForm, horas_trabalhadas: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="os_mao_obra">Mão de Obra (R$)</Label>
                <Input
                  id="os_mao_obra"
                  type="number"
                  step="0.01"
                  min="0"
                  value={osForm.valor_mao_obra}
                  onChange={(e) => setOsForm({ ...osForm, valor_mao_obra: e.target.value })}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="os_materiais_valor">Materiais (R$)</Label>
                <Input
                  id="os_materiais_valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={osForm.valor_materiais}
                  onChange={(e) => setOsForm({ ...osForm, valor_materiais: e.target.value })}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="os_materiais_lista">Materiais Utilizados</Label>
              <Textarea
                id="os_materiais_lista"
                value={osForm.materiais_usados}
                onChange={(e) => setOsForm({ ...osForm, materiais_usados: e.target.value })}
                placeholder="Liste os materiais utilizados..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="os_obs">Observações</Label>
              <Textarea
                id="os_obs"
                value={osForm.observacoes}
                onChange={(e) => setOsForm({ ...osForm, observacoes: e.target.value })}
                placeholder="Observações adicionais..."
                rows={2}
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Valor Total:</span>
                <span className="text-2xl font-bold text-navy">
                  R$ {calcularTotalOS().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGerarOSDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleGerarOS}
              disabled={criandoOS}
              className="bg-navy hover:bg-petrol"
            >
              {criandoOS ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando OS...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar OS
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
