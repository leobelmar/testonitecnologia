import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Cliente, ChamadoPrioridade } from '@/types/database';
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

const TIPOS_CHAMADO = [
  'Problema de acesso',
  'Lentidão',
  'Erro no sistema',
  'Solicitação de serviço',
  'Dúvida técnica',
  'Instalação/Configuração',
  'Manutenção preventiva',
  'Outro',
];

export default function NovoChamado() {
  const navigate = useNavigate();
  const { user, isAdmin, isCliente } = useAuth();
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clienteId, setClienteId] = useState<string>('');

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    tipo: '',
    prioridade: 'media' as ChamadoPrioridade,
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      if (isCliente) {
        // Se for cliente, buscar apenas o(s) cliente(s) vinculado(s)
        const { data: vinculos } = await supabase
          .from('cliente_usuarios')
          .select('cliente_id')
          .eq('user_id', user?.id);

        if (vinculos && vinculos.length > 0) {
          const clienteIds = vinculos.map(v => v.cliente_id);
          const { data } = await supabase
            .from('clientes')
            .select('*')
            .in('id', clienteIds)
            .eq('status', 'ativo');
          
          setClientes(data as Cliente[] || []);
          if (data && data.length === 1) {
            setClienteId(data[0].id);
          }
        }
      } else {
        // Admin/Técnico podem ver todos
        const { data } = await supabase
          .from('clientes')
          .select('*')
          .eq('status', 'ativo')
          .order('nome_empresa');
        
        setClientes(data as Cliente[] || []);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteId) {
      toast({
        title: 'Erro',
        description: 'Selecione um cliente.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.titulo.trim()) {
      toast({
        title: 'Erro',
        description: 'Título é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('chamados')
        .insert({
          cliente_id: clienteId,
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim() || null,
          tipo: form.tipo || null,
          prioridade: form.prioridade,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Chamado #${data.numero} criado com sucesso.`,
      });

      navigate(`/app/chamados/${data.id}`);
    } catch (error: any) {
      console.error('Erro ao criar chamado:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o chamado.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-navy">Novo Chamado</h1>
          <p className="text-muted-foreground">
            Abra uma nova solicitação de suporte
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Chamado</CardTitle>
          <CardDescription>
            Descreva detalhadamente o problema ou solicitação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cliente */}
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              {loadingClientes ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : clientes.length === 1 ? (
                <Input
                  value={clientes[0].nome_empresa}
                  disabled
                  className="bg-muted"
                />
              ) : (
                <Select value={clienteId} onValueChange={setClienteId}>
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
              )}
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Resumo do problema ou solicitação"
                required
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Problema</Label>
              <Select
                value={form.tipo}
                onValueChange={(value) => setForm({ ...form, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_CHAMADO.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={form.prioridade}
                onValueChange={(value: ChamadoPrioridade) =>
                  setForm({ ...form, prioridade: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa - Pode aguardar</SelectItem>
                  <SelectItem value="media">Média - Normal</SelectItem>
                  <SelectItem value="alta">Alta - Urgente</SelectItem>
                  <SelectItem value="urgente">Urgente - Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descreva detalhadamente o problema, incluindo:&#10;- O que aconteceu?&#10;- Quando começou?&#10;- Mensagens de erro (se houver)&#10;- Passos para reproduzir o problema"
                rows={6}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
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
                  'Abrir Chamado'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
