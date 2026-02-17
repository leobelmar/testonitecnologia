import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Pencil, Building2, Phone, Mail, Loader2, Trash2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TipoHoraForm {
  nome: string;
  valor_hora_extra: string;
}

interface ContratoForm {
  valor_mensal: string;
  horas_inclusas: string;
  vigencia_inicio: string;
  vigencia_fim: string;
  observacoes: string;
}

export default function Clientes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [contratosMap, setContratosMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  // Client form state
  const [form, setForm] = useState({
    nome_empresa: '',
    cnpj_cpf: '',
    contato_principal: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    status: 'ativo' as 'ativo' | 'inativo',
    observacoes: '',
  });

  // Contract toggle & form
  const [temContrato, setTemContrato] = useState(false);
  const [contratoForm, setContratoForm] = useState<ContratoForm>({
    valor_mensal: '',
    horas_inclusas: '',
    vigencia_inicio: new Date().toISOString().split('T')[0],
    vigencia_fim: '',
    observacoes: '',
  });
  const [tiposHora, setTiposHora] = useState<TipoHoraForm[]>([
    { nome: 'Remota', valor_hora_extra: '' },
    { nome: 'Presencial', valor_hora_extra: '' },
  ]);

  // Track if editing client already has a contract
  const [editingContrato, setEditingContrato] = useState<any>(null);

  useEffect(() => {
    fetchClientes();
    fetchContratos();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome_empresa');
      if (error) throw error;
      setClientes(data as Cliente[]);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar os clientes.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchContratos = async () => {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('id, numero, cliente_id, status, valor_mensal, horas_inclusas, vigencia_inicio, vigencia_fim, observacoes')
        .eq('status', 'ativo');
      if (error) throw error;
      const map: Record<string, any> = {};
      (data || []).forEach((c) => { map[c.cliente_id] = c; });
      setContratosMap(map);
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
    }
  };

  const resetForm = () => {
    setForm({
      nome_empresa: '', cnpj_cpf: '', contato_principal: '', telefone: '',
      email: '', endereco: '', cidade: '', estado: '', cep: '',
      status: 'ativo', observacoes: '',
    });
    setTemContrato(false);
    setContratoForm({
      valor_mensal: '', horas_inclusas: '',
      vigencia_inicio: new Date().toISOString().split('T')[0],
      vigencia_fim: '', observacoes: '',
    });
    setTiposHora([
      { nome: 'Remota', valor_hora_extra: '' },
      { nome: 'Presencial', valor_hora_extra: '' },
    ]);
    setEditingCliente(null);
    setEditingContrato(null);
  };

  const handleEdit = async (cliente: Cliente) => {
    setEditingCliente(cliente);
    setForm({
      nome_empresa: cliente.nome_empresa,
      cnpj_cpf: cliente.cnpj_cpf || '',
      contato_principal: cliente.contato_principal || '',
      telefone: cliente.telefone || '',
      email: cliente.email || '',
      endereco: cliente.endereco || '',
      cidade: cliente.cidade || '',
      estado: cliente.estado || '',
      cep: cliente.cep || '',
      status: cliente.status,
      observacoes: cliente.observacoes || '',
    });

    // Check if client has active contract
    const contrato = contratosMap[cliente.id];
    if (contrato) {
      setTemContrato(true);
      setEditingContrato(contrato);
      setContratoForm({
        valor_mensal: String(contrato.valor_mensal || ''),
        horas_inclusas: String(contrato.horas_inclusas || ''),
        vigencia_inicio: contrato.vigencia_inicio || '',
        vigencia_fim: contrato.vigencia_fim || '',
        observacoes: contrato.observacoes || '',
      });
      // Fetch tipos de hora for this contract
      const { data: tipos } = await supabase
        .from('contrato_tipos_hora')
        .select('nome, valor_hora_extra')
        .eq('contrato_id', contrato.id);
      if (tipos && tipos.length > 0) {
        setTiposHora(tipos.map(t => ({ nome: t.nome, valor_hora_extra: String(t.valor_hora_extra) })));
      } else {
        setTiposHora([{ nome: 'Remota', valor_hora_extra: '' }, { nome: 'Presencial', valor_hora_extra: '' }]);
      }
    } else {
      setTemContrato(false);
      setEditingContrato(null);
      setContratoForm({
        valor_mensal: '', horas_inclusas: '',
        vigencia_inicio: new Date().toISOString().split('T')[0],
        vigencia_fim: '', observacoes: '',
      });
      setTiposHora([{ nome: 'Remota', valor_hora_extra: '' }, { nome: 'Presencial', valor_hora_extra: '' }]);
    }

    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nome_empresa.trim()) {
      toast({ title: 'Erro', description: 'Nome da empresa é obrigatório.', variant: 'destructive' });
      return;
    }

    if (temContrato) {
      const validTipos = tiposHora.filter(t => t.nome.trim());
      if (validTipos.length === 0) {
        toast({ title: 'Erro', description: 'Adicione pelo menos um tipo de hora no contrato.', variant: 'destructive' });
        return;
      }
    }

    setSaving(true);

    try {
      const clienteData = {
        nome_empresa: form.nome_empresa.trim(),
        cnpj_cpf: form.cnpj_cpf.trim() || null,
        contato_principal: form.contato_principal.trim() || null,
        telefone: form.telefone.trim() || null,
        email: form.email.trim() || null,
        endereco: form.endereco.trim() || null,
        cidade: form.cidade.trim() || null,
        estado: form.estado.trim() || null,
        cep: form.cep.trim() || null,
        status: form.status,
        observacoes: form.observacoes.trim() || null,
        created_by: user?.id,
      };

      let clienteId: string;

      if (editingCliente) {
        const { error } = await supabase.from('clientes').update(clienteData).eq('id', editingCliente.id);
        if (error) throw error;
        clienteId = editingCliente.id;
      } else {
        const { data, error } = await supabase.from('clientes').insert(clienteData).select('id').single();
        if (error) throw error;
        clienteId = data.id;
      }

      // Handle contract
      if (temContrato) {
        const contratoData = {
          cliente_id: clienteId,
          valor_mensal: parseFloat(contratoForm.valor_mensal) || 0,
          horas_inclusas: parseFloat(contratoForm.horas_inclusas) || 0,
          vigencia_inicio: contratoForm.vigencia_inicio,
          vigencia_fim: contratoForm.vigencia_fim || null,
          observacoes: contratoForm.observacoes.trim() || null,
          status: 'ativo' as const,
          created_by: user?.id!,
        };

        if (editingContrato) {
          // Update existing contract
          const { error } = await supabase.from('contratos').update({
            valor_mensal: contratoData.valor_mensal,
            horas_inclusas: contratoData.horas_inclusas,
            vigencia_inicio: contratoData.vigencia_inicio,
            vigencia_fim: contratoData.vigencia_fim,
            observacoes: contratoData.observacoes,
          }).eq('id', editingContrato.id);
          if (error) throw error;

          // Replace tipos de hora
          await supabase.from('contrato_tipos_hora').delete().eq('contrato_id', editingContrato.id);
          const validTipos = tiposHora.filter(t => t.nome.trim());
          if (validTipos.length > 0) {
            const { error: tiposError } = await supabase.from('contrato_tipos_hora').insert(
              validTipos.map(t => ({
                contrato_id: editingContrato.id,
                nome: t.nome,
                valor_hora_extra: parseFloat(t.valor_hora_extra) || 0,
              }))
            );
            if (tiposError) throw tiposError;
          }
        } else {
          // Create new contract
          const { data: contrato, error } = await supabase.from('contratos')
            .insert([contratoData]).select().single();
          if (error) throw error;

          // Create tipos de hora
          const validTipos = tiposHora.filter(t => t.nome.trim());
          if (validTipos.length > 0) {
            await supabase.from('contrato_tipos_hora').insert(
              validTipos.map(t => ({
                contrato_id: contrato.id,
                nome: t.nome,
                valor_hora_extra: parseFloat(t.valor_hora_extra) || 0,
              }))
            );
          }

          // Create first period
          const hoje = new Date();
          const mesRef = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
          await supabase.from('contrato_periodos').insert({
            contrato_id: contrato.id,
            mes_referencia: mesRef,
            horas_inclusas: parseFloat(contratoForm.horas_inclusas) || 0,
            status: 'ativo',
          });
        }
      }

      toast({
        title: 'Sucesso',
        description: editingCliente ? 'Cliente atualizado com sucesso.' : 'Cliente cadastrado com sucesso.',
      });

      setDialogOpen(false);
      resetForm();
      fetchClientes();
      fetchContratos();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({ title: 'Erro', description: error.message || 'Não foi possível salvar.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

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

  const filteredClientes = clientes.filter((cliente) =>
    cliente.nome_empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj_cpf?.includes(searchTerm) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-navy hover:bg-petrol">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
              <DialogDescription>
                {editingCliente
                  ? 'Atualize as informações do cliente e contrato.'
                  : 'Cadastre o cliente e, opcionalmente, vincule um contrato.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* === CLIENT DATA === */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome_empresa">Nome da Empresa *</Label>
                  <Input id="nome_empresa" value={form.nome_empresa}
                    onChange={(e) => setForm({ ...form, nome_empresa: e.target.value })}
                    placeholder="Razão Social ou Nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj_cpf">CNPJ/CPF</Label>
                  <Input id="cnpj_cpf" value={form.cnpj_cpf}
                    onChange={(e) => setForm({ ...form, cnpj_cpf: e.target.value })}
                    placeholder="00.000.000/0000-00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contato_principal">Contato Principal</Label>
                  <Input id="contato_principal" value={form.contato_principal}
                    onChange={(e) => setForm({ ...form, contato_principal: e.target.value })}
                    placeholder="Nome do responsável" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    placeholder="(47) 99999-9999" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contato@empresa.com.br" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input id="endereco" value={form.endereco}
                    onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                    placeholder="Rua, número, bairro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={form.cidade}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                    placeholder="Balneário Camboriú" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input id="estado" value={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.value })}
                      placeholder="SC" maxLength={2} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" value={form.cep}
                      onChange={(e) => setForm({ ...form, cep: e.target.value })}
                      placeholder="88330-000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status}
                    onValueChange={(value: 'ativo' | 'inativo') => setForm({ ...form, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" value={form.observacoes}
                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                    placeholder="Informações adicionais sobre o cliente" rows={3} />
                </div>
              </div>

              {/* === CONTRACT SECTION === */}
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-navy" />
                  <div>
                    <p className="font-medium text-sm">Contrato</p>
                    <p className="text-xs text-muted-foreground">
                      {editingContrato ? `Contrato #${editingContrato.numero} ativo` : 'Vincular contrato mensal ao cliente'}
                    </p>
                  </div>
                </div>
                {!editingContrato && (
                  <Switch checked={temContrato} onCheckedChange={setTemContrato} />
                )}
                {editingContrato && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Ativo
                  </Badge>
                )}
              </div>

              {(temContrato || editingContrato) && (
                <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Valor Mensal (R$)</Label>
                      <Input type="number" step="0.01" min="0"
                        value={contratoForm.valor_mensal}
                        onChange={(e) => setContratoForm({ ...contratoForm, valor_mensal: e.target.value })}
                        placeholder="0,00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Horas Inclusas</Label>
                      <Input type="number" step="0.5" min="0"
                        value={contratoForm.horas_inclusas}
                        onChange={(e) => setContratoForm({ ...contratoForm, horas_inclusas: e.target.value })}
                        placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Vigência Início</Label>
                      <Input type="date" value={contratoForm.vigencia_inicio}
                        onChange={(e) => setContratoForm({ ...contratoForm, vigencia_inicio: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Vigência Fim (opcional)</Label>
                      <Input type="date" value={contratoForm.vigencia_fim}
                        onChange={(e) => setContratoForm({ ...contratoForm, vigencia_fim: e.target.value })} />
                    </div>
                  </div>

                  {/* Tipos de hora */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tipos de Hora</Label>
                    {tiposHora.map((tipo, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Nome</Label>
                          <Input value={tipo.nome}
                            onChange={(e) => updateTipoHora(index, 'nome', e.target.value)}
                            placeholder="Ex: Remota, Presencial..." />
                        </div>
                        <div className="w-36 space-y-1">
                          <Label className="text-xs">Hora Extra (R$)</Label>
                          <Input type="number" step="0.01" min="0"
                            value={tipo.valor_hora_extra}
                            onChange={(e) => updateTipoHora(index, 'valor_hora_extra', e.target.value)}
                            placeholder="0,00" />
                        </div>
                        {tiposHora.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeTipoHora(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addTipoHora}>
                      <Plus className="h-4 w-4 mr-1" /> Adicionar Tipo
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Observações do Contrato</Label>
                    <Textarea value={contratoForm.observacoes}
                      onChange={(e) => setContratoForm({ ...contratoForm, observacoes: e.target.value })}
                      placeholder="Observações sobre o contrato..." rows={2} />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-navy hover:bg-petrol" disabled={saving}>
                  {saving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                  ) : (
                    editingCliente ? 'Salvar Alterações' : 'Cadastrar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, CNPJ ou e-mail..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : filteredClientes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum cliente encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-navy" />
                          </div>
                          <div>
                            <p className="font-medium">{cliente.nome_empresa}</p>
                            <p className="text-sm text-muted-foreground">
                              {cliente.cnpj_cpf || 'Sem CNPJ/CPF'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {cliente.telefone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />{cliente.telefone}
                            </div>
                          )}
                          {cliente.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />{cliente.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {contratosMap[cliente.id] ? (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 cursor-pointer"
                            onClick={() => navigate(`/app/contratos/${contratosMap[cliente.id].id}`)}
                          >
                            #{contratosMap[cliente.id].numero} · R${contratosMap[cliente.id].valor_mensal} · {contratosMap[cliente.id].horas_inclusas}h
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sem contrato</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={cliente.status === 'ativo' ? 'default' : 'secondary'}
                          className={cliente.status === 'ativo' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                        >
                          {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cliente)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
