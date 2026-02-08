import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, OrdemServico, Chamado } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Clock,
  FileText,
  Ticket,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TecnicoStats {
  tecnico: Profile;
  chamadosAtribuidos: number;
  chamadosFinalizados: number;
  osAtribuidas: number;
  osFinalizadas: number;
  horasTrabalhadas: number;
  faturamentoMes: number;
}

interface OSAgenda {
  id: string;
  numero: number;
  cliente_nome: string;
  status: string;
  data_inicio: string | null;
}

export default function Tecnicos() {
  const { toast } = useToast();
  const [tecnicos, setTecnicos] = useState<TecnicoStats[]>([]);
  const [agendaSemana, setAgendaSemana] = useState<OSAgenda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar técnicos
      const { data: tecnicosData } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'tecnico'])
        .eq('ativo', true)
        .order('nome');

      const tecnicosList = tecnicosData as Profile[] || [];

      // Calcular estatísticas para cada técnico
      const stats: TecnicoStats[] = [];
      const inicioMes = startOfMonth(new Date());
      const fimMes = endOfMonth(new Date());

      for (const tecnico of tecnicosList) {
        // Chamados atribuídos (não finalizados)
        const { count: chamadosAtribuidos } = await supabase
          .from('chamados')
          .select('*', { count: 'exact', head: true })
          .eq('atribuido_a', tecnico.user_id)
          .not('status', 'in', '("finalizado","cancelado")');

        // Chamados finalizados no mês
        const { count: chamadosFinalizados } = await supabase
          .from('chamados')
          .select('*', { count: 'exact', head: true })
          .eq('atribuido_a', tecnico.user_id)
          .eq('status', 'finalizado')
          .gte('data_fechamento', inicioMes.toISOString())
          .lte('data_fechamento', fimMes.toISOString());

        // OS atribuídas (não faturadas)
        const { count: osAtribuidas } = await supabase
          .from('ordens_servico')
          .select('*', { count: 'exact', head: true })
          .eq('tecnico_id', tecnico.user_id)
          .not('status', 'in', '("finalizada","faturada")');

        // OS finalizadas no mês
        const { data: osFinalizadasData } = await supabase
          .from('ordens_servico')
          .select('horas_trabalhadas, valor_total')
          .eq('tecnico_id', tecnico.user_id)
          .in('status', ['finalizada', 'faturada'])
          .gte('data_fim', inicioMes.toISOString())
          .lte('data_fim', fimMes.toISOString());

        const osFinalizadas = osFinalizadasData?.length || 0;
        const horasTrabalhadas = osFinalizadasData?.reduce((acc, os) => acc + Number(os.horas_trabalhadas || 0), 0) || 0;
        const faturamentoMes = osFinalizadasData?.reduce((acc, os) => acc + Number(os.valor_total || 0), 0) || 0;

        stats.push({
          tecnico,
          chamadosAtribuidos: chamadosAtribuidos || 0,
          chamadosFinalizados: chamadosFinalizados || 0,
          osAtribuidas: osAtribuidas || 0,
          osFinalizadas,
          horasTrabalhadas,
          faturamentoMes,
        });
      }

      setTecnicos(stats);

      // Buscar agenda da semana
      const inicioSemana = startOfWeek(new Date(), { locale: ptBR });
      const fimSemana = endOfWeek(new Date(), { locale: ptBR });

      const { data: osAgendaData } = await supabase
        .from('ordens_servico')
        .select(`
          id,
          numero,
          status,
          data_inicio,
          cliente:clientes(nome_empresa)
        `)
        .in('status', ['aberta', 'em_execucao'])
        .order('data_inicio', { ascending: true });

      const agenda: OSAgenda[] = (osAgendaData || []).map((os: any) => ({
        id: os.id,
        numero: os.numero,
        cliente_nome: os.cliente?.nome_empresa || 'N/A',
        status: os.status,
        data_inicio: os.data_inicio,
      }));

      setAgendaSemana(agenda);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  // Totais gerais
  const totais = tecnicos.reduce(
    (acc, t) => ({
      chamadosAtribuidos: acc.chamadosAtribuidos + t.chamadosAtribuidos,
      osAtribuidas: acc.osAtribuidas + t.osAtribuidas,
      horasMes: acc.horasMes + t.horasTrabalhadas,
      faturamentoMes: acc.faturamentoMes + t.faturamentoMes,
    }),
    { chamadosAtribuidos: 0, osAtribuidas: 0, horasMes: 0, faturamentoMes: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Gestão de Técnicos</h1>
        <p className="text-muted-foreground">
          Acompanhe a produtividade e agenda da equipe técnica
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Técnicos Ativos
            </CardTitle>
            <User className="h-4 w-4 text-navy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{tecnicos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chamados Pendentes
            </CardTitle>
            <Ticket className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totais.chamadosAtribuidos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Horas (Mês)
            </CardTitle>
            <Clock className="h-4 w-4 text-petrol" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-petrol">{totais.horasMes.toFixed(1)}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento (Mês)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totais.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="produtividade">
        <TabsList>
          <TabsTrigger value="produtividade">Produtividade</TabsTrigger>
          <TabsTrigger value="agenda">Agenda ({agendaSemana.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="produtividade" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Produtividade por Técnico - {format(new Date(), 'MMMM yyyy', { locale: ptBR })}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : tecnicos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum técnico cadastrado
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Técnico</TableHead>
                      <TableHead className="text-center">Chamados Pendentes</TableHead>
                      <TableHead className="text-center">Chamados Finalizados</TableHead>
                      <TableHead className="text-center">OS Pendentes</TableHead>
                      <TableHead className="text-center">OS Finalizadas</TableHead>
                      <TableHead className="text-center">Horas</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tecnicos.map((stat) => (
                      <TableRow key={stat.tecnico.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-navy" />
                            </div>
                            <div>
                              <p className="font-medium">{stat.tecnico.nome}</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {stat.tecnico.role}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={stat.chamadosAtribuidos > 5 ? 'destructive' : 'secondary'}>
                            {stat.chamadosAtribuidos}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-green-600 font-medium">
                            {stat.chamadosFinalizados}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={stat.osAtribuidas > 3 ? 'destructive' : 'secondary'}>
                            {stat.osAtribuidas}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-green-600 font-medium">{stat.osFinalizadas}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {stat.horasTrabalhadas.toFixed(1)}h
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {stat.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agenda" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Ordens de Serviço em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {agendaSemana.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma OS em andamento
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OS</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Início</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agendaSemana.map((os) => {
                      const status = getStatusBadge(os.status);
                      return (
                        <TableRow key={os.id}>
                          <TableCell className="font-medium text-navy">
                            #{os.numero}
                          </TableCell>
                          <TableCell>{os.cliente_nome}</TableCell>
                          <TableCell>
                            <Badge className={status.style}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>
                            {os.data_inicio
                              ? format(new Date(os.data_inicio), "dd/MM/yyyy HH:mm", { locale: ptBR })
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
