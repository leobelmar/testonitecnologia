import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Cliente, Chamado, Profile } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NovaOS() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [tecnicos, setTecnicos] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    cliente_id: '',
    chamado_id: '',
    tecnico_id: '',
    descricao_servico: '',
    horas_trabalhadas: '',
    materiais_usados: '',
    valor_materiais: '',
    valor_mao_obra: '',
    observacoes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Se veio de um chamado específico
    const chamadoId = searchParams.get('chamado');
    if (chamadoId && chamados.length > 0) {
      const chamado = chamados.find(c => c.id === chamadoId);
      if (chamado) {
        setForm(prev => ({
          ...prev,
          chamado_id: chamadoId,
          cliente_id: chamado.cliente_id,
        }));
      }
    }
  }, [searchParams, chamados]);

  const fetchData = async () => {
    try {
      // Buscar clientes
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('*')
        .eq('status', 'ativo')
        .order('nome_empresa');

      setClientes(clientesData as Cliente[] || []);

      // Buscar chamados abertos (não finalizados)
      const { data: chamadosData } = await supabase
        .from('chamados')
        .select('*, cliente:clientes(nome_empresa)')
        .not('status', 'in', '("finalizado","cancelado")')
        .order('numero', { ascending: false });

      setChamados(chamadosData as Chamado[] || []);

      // Buscar técnicos
      const { data: tecnicosData } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'tecnico'])
        .eq('ativo', true)
        .order('nome');

      setTecnicos(tecnicosData as Profile[] || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChamadoChange = (chamadoId: string) => {
    const chamado = chamados.find(c => c.id === chamadoId);
    setForm(prev => ({
      ...prev,
      chamado_id: chamadoId,
      cliente_id: chamado?.cliente_id || prev.cliente_id,
    }));
  };

  const calcularTotal = () => {
    const materiais = parseFloat(form.valor_materiais) || 0;
    const maoObra = parseFloat(form.valor_mao_obra) || 0;
    return materiais + maoObra;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.cliente_id) {
      toast({
        title: 'Erro',
        description: 'Selecione um cliente.',
        variant: 'destructive',
      });
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
          descricao_servico: form.descricao_servico || null,
          horas_trabalhadas: parseFloat(form.horas_trabalhadas) || 0,
          materiais_usados: form.materiais_usados || null,
          valor_materiais: parseFloat(form.valor_materiais) || 0,
          valor_mao_obra: parseFloat(form.valor_mao_obra) || 0,
          valor_total: calcularTotal(),
          observacoes: form.observacoes || null,
          data_inicio: new Date().toISOString(),
          status: 'em_execucao',
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Se veio de um chamado, atualizar status do chamado
      if (form.chamado_id) {
        await supabase
          .from('chamados')
          .update({ status: 'em_atendimento' })
          .eq('id', form.chamado_id);
      }

      toast({
        title: 'Sucesso',
        description: `OS #${data.numero} criada com sucesso.`,
      });

      navigate(`/app/ordens-servico/${data.id}`);
    } catch (error: any) {
      console.error('Erro ao criar OS:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar a ordem de serviço.',
        variant: 'destructive',
      });
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-navy">Nova Ordem de Serviço</h1>
          <p className="text-muted-foreground">
            Registre uma nova OS para atendimento
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Selecione o cliente e, opcionalmente, vincule a um chamado existente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Chamado (opcional) */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="chamado">Chamado (opcional)</Label>
                <Select
                  value={form.chamado_id || "avulsa"}
                  onValueChange={(value) => handleChamadoChange(value === "avulsa" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vincular a um chamado..." />
                  </SelectTrigger>
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
                <Label htmlFor="cliente">Cliente *</Label>
                <Select
                  value={form.cliente_id}
                  onValueChange={(value) => setForm({ ...form, cliente_id: value })}
                  disabled={!!form.chamado_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome_empresa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Técnico */}
              <div className="space-y-2">
                <Label htmlFor="tecnico">Técnico Responsável</Label>
                <Select
                  value={form.tecnico_id}
                  onValueChange={(value) => setForm({ ...form, tecnico_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o técnico" />
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
            </div>

            {/* Descrição do Serviço */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição do Serviço</Label>
              <Textarea
                id="descricao"
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
            <CardTitle>Detalhes do Serviço</CardTitle>
            <CardDescription>
              Registre horas, materiais e valores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Horas */}
              <div className="space-y-2">
                <Label htmlFor="horas">Horas Trabalhadas</Label>
                <Input
                  id="horas"
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.horas_trabalhadas}
                  onChange={(e) => setForm({ ...form, horas_trabalhadas: e.target.value })}
                  placeholder="0"
                />
              </div>

              {/* Valor Mão de Obra */}
              <div className="space-y-2">
                <Label htmlFor="maoObra">Valor Mão de Obra (R$)</Label>
                <Input
                  id="maoObra"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valor_mao_obra}
                  onChange={(e) => setForm({ ...form, valor_mao_obra: e.target.value })}
                  placeholder="0,00"
                />
              </div>

              {/* Valor Materiais */}
              <div className="space-y-2">
                <Label htmlFor="valorMateriais">Valor Materiais (R$)</Label>
                <Input
                  id="valorMateriais"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valor_materiais}
                  onChange={(e) => setForm({ ...form, valor_materiais: e.target.value })}
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Materiais Usados */}
            <div className="space-y-2">
              <Label htmlFor="materiais">Materiais Utilizados</Label>
              <Textarea
                id="materiais"
                value={form.materiais_usados}
                onChange={(e) => setForm({ ...form, materiais_usados: e.target.value })}
                placeholder="Liste os materiais utilizados..."
                rows={3}
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Observações adicionais..."
                rows={2}
              />
            </div>

            {/* Total */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Valor Total:</span>
                <span className="text-2xl font-bold text-navy">
                  R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-navy hover:bg-petrol"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Ordem de Serviço'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
