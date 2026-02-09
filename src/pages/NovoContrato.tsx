import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';

interface TipoHoraForm {
  nome: string;
  valor_hora_extra: string;
}

export default function NovoContrato() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [clientes, setClientes] = useState<{ id: string; nome_empresa: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    cliente_id: '',
    valor_mensal: '',
    horas_inclusas: '',
    vigencia_inicio: new Date().toISOString().split('T')[0],
    vigencia_fim: '',
    status: 'ativo',
    observacoes: '',
  });

  const [tiposHora, setTiposHora] = useState<TipoHoraForm[]>([
    { nome: 'Remota', valor_hora_extra: '' },
    { nome: 'Presencial', valor_hora_extra: '' },
  ]);

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome_empresa')
      .eq('status', 'ativo')
      .order('nome_empresa')
      .then(({ data }) => {
        setClientes(data || []);
        setLoadingData(false);
      });
  }, []);

  const addTipoHora = () => {
    setTiposHora([...tiposHora, { nome: '', valor_hora_extra: '' }]);
  };

  const removeTipoHora = (index: number) => {
    setTiposHora(tiposHora.filter((_, i) => i !== index));
  };

  const updateTipoHora = (index: number, field: keyof TipoHoraForm, value: string) => {
    const updated = [...tiposHora];
    updated[index][field] = value;
    setTiposHora(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.cliente_id) {
      toast({ title: 'Erro', description: 'Selecione um cliente.', variant: 'destructive' });
      return;
    }

    const validTipos = tiposHora.filter((t) => t.nome.trim());
    if (validTipos.length === 0) {
      toast({ title: 'Erro', description: 'Adicione pelo menos um tipo de hora.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      // Criar contrato
      const { data: contrato, error } = await supabase
        .from('contratos')
        .insert([{
          cliente_id: form.cliente_id,
          valor_mensal: parseFloat(form.valor_mensal) || 0,
          horas_inclusas: parseFloat(form.horas_inclusas) || 0,
          vigencia_inicio: form.vigencia_inicio,
          vigencia_fim: form.vigencia_fim || null,
          status: form.status as 'ativo' | 'suspenso' | 'cancelado' | 'encerrado',
          observacoes: form.observacoes || null,
          created_by: user?.id!,
        }])
        .select()
        .single();

      if (error) throw error;

      // Criar tipos de hora
      const tiposInsert = validTipos.map((t) => ({
        contrato_id: contrato.id,
        nome: t.nome,
        valor_hora_extra: parseFloat(t.valor_hora_extra) || 0,
      }));

      const { error: tiposError } = await supabase
        .from('contrato_tipos_hora')
        .insert(tiposInsert);

      if (tiposError) throw tiposError;

      // Criar primeiro período (mês atual)
      const hoje = new Date();
      const mesRef = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;

      await supabase.from('contrato_periodos').insert({
        contrato_id: contrato.id,
        mes_referencia: mesRef,
        horas_inclusas: parseFloat(form.horas_inclusas) || 0,
        status: 'ativo',
      });

      toast({ title: 'Sucesso', description: `Contrato #${contrato.numero} criado com sucesso.` });
      navigate(`/app/contratos/${contrato.id}`);
    } catch (error: any) {
      console.error('Erro ao criar contrato:', error);
      toast({ title: 'Erro', description: error.message || 'Não foi possível criar o contrato.', variant: 'destructive' });
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-navy">Novo Contrato</h1>
          <p className="text-muted-foreground">Cadastre um contrato mensal para o cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Contrato</CardTitle>
            <CardDescription>Informações principais do contrato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Cliente *</Label>
                <Select value={form.cliente_id} onValueChange={(v) => setForm({ ...form, cliente_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome_empresa}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Valor Mensal (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valor_mensal}
                  onChange={(e) => setForm({ ...form, valor_mensal: e.target.value })}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label>Horas Inclusas *</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.horas_inclusas}
                  onChange={(e) => setForm({ ...form, horas_inclusas: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Vigência Início *</Label>
                <Input
                  type="date"
                  value={form.vigencia_inicio}
                  onChange={(e) => setForm({ ...form, vigencia_inicio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Vigência Fim (opcional)</Label>
                <Input
                  type="date"
                  value={form.vigencia_fim}
                  onChange={(e) => setForm({ ...form, vigencia_fim: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Observações sobre o contrato..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Hora</CardTitle>
            <CardDescription>Defina os tipos de hora e seus valores de hora extra</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tiposHora.map((tipo, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Nome do Tipo</Label>
                  <Input
                    value={tipo.nome}
                    onChange={(e) => updateTipoHora(index, 'nome', e.target.value)}
                    placeholder="Ex: Remota, Presencial..."
                  />
                </div>
                <div className="w-40 space-y-1">
                  <Label className="text-xs">Valor Hora Extra (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={tipo.valor_hora_extra}
                    onChange={(e) => updateTipoHora(index, 'valor_hora_extra', e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                {tiposHora.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeTipoHora(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addTipoHora}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Tipo
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 bg-navy hover:bg-petrol" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Contrato'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
