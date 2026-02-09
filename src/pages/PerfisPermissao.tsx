import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePermissions, MODULOS_DISPONIVEIS, PerfilPermissao, PermissaoModulo } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Shield, ArrowLeft } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

interface PermissaoForm {
  modulo: string;
  leitura: boolean;
  edicao: boolean;
}

export default function PerfisPermissao() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [perfis, setPerfis] = useState<PerfilPermissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState<PerfilPermissao | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [permissoes, setPermissoes] = useState<PermissaoForm[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPerfis();
  }, []);

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  const fetchPerfis = async () => {
    try {
      const { data, error } = await supabase
        .from('perfis_permissao')
        .select('*')
        .order('nome');

      if (error) throw error;
      setPerfis(data as unknown as PerfilPermissao[]);
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNewDialog = () => {
    setEditingPerfil(null);
    setNome('');
    setDescricao('');
    setPermissoes(
      MODULOS_DISPONIVEIS.map((m) => ({
        modulo: m.key,
        leitura: false,
        edicao: false,
      }))
    );
    setDialogOpen(true);
  };

  const openEditDialog = async (perfil: PerfilPermissao) => {
    setEditingPerfil(perfil);
    setNome(perfil.nome);
    setDescricao(perfil.descricao || '');

    // Fetch existing permissions
    const { data } = await supabase
      .from('permissoes_modulo')
      .select('*')
      .eq('perfil_id', perfil.id);

    const existingPerms = (data || []) as unknown as PermissaoModulo[];

    setPermissoes(
      MODULOS_DISPONIVEIS.map((m) => {
        const existing = existingPerms.find((p) => p.modulo === m.key);
        return {
          modulo: m.key,
          leitura: existing?.leitura ?? false,
          edicao: existing?.edicao ?? false,
        };
      })
    );
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      let perfilId: string;

      if (editingPerfil) {
        // Update
        const { error } = await supabase
          .from('perfis_permissao')
          .update({ nome: nome.trim(), descricao: descricao.trim() || null })
          .eq('id', editingPerfil.id);

        if (error) throw error;
        perfilId = editingPerfil.id;

        // Delete existing permissions
        await supabase.from('permissoes_modulo').delete().eq('perfil_id', perfilId);
      } else {
        // Insert
        const { data, error } = await supabase
          .from('perfis_permissao')
          .insert({ nome: nome.trim(), descricao: descricao.trim() || null })
          .select()
          .single();

        if (error) throw error;
        perfilId = data.id;
      }

      // Insert permissions
      const permsToInsert = permissoes
        .filter((p) => p.leitura || p.edicao)
        .map((p) => ({
          perfil_id: perfilId,
          modulo: p.modulo,
          leitura: p.leitura,
          edicao: p.edicao,
        }));

      if (permsToInsert.length > 0) {
        const { error } = await supabase.from('permissoes_modulo').insert(permsToInsert);
        if (error) throw error;
      }

      toast({
        title: 'Sucesso',
        description: editingPerfil ? 'Perfil atualizado.' : 'Perfil criado.',
      });

      setDialogOpen(false);
      fetchPerfis();
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o perfil.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (perfil: PerfilPermissao) => {
    if (!confirm(`Tem certeza que deseja excluir o perfil "${perfil.nome}"?`)) return;

    try {
      const { error } = await supabase
        .from('perfis_permissao')
        .delete()
        .eq('id', perfil.id);

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Perfil excluído.' });
      fetchPerfis();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir.',
        variant: 'destructive',
      });
    }
  };

  const togglePermission = (modulo: string, field: 'leitura' | 'edicao') => {
    setPermissoes((prev) =>
      prev.map((p) => {
        if (p.modulo !== modulo) return p;
        if (field === 'edicao') {
          const newEdicao = !p.edicao;
          return { ...p, edicao: newEdicao, leitura: newEdicao ? true : p.leitura };
        }
        const newLeitura = !p.leitura;
        return { ...p, leitura: newLeitura, edicao: newLeitura ? p.edicao : false };
      })
    );
  };

  const toggleAllRead = () => {
    const allRead = permissoes.every((p) => p.leitura);
    setPermissoes((prev) =>
      prev.map((p) => ({
        ...p,
        leitura: !allRead,
        edicao: !allRead ? p.edicao : false,
      }))
    );
  };

  const toggleAllEdit = () => {
    const allEdit = permissoes.every((p) => p.edicao);
    setPermissoes((prev) =>
      prev.map((p) => ({
        ...p,
        edicao: !allEdit,
        leitura: !allEdit ? true : p.leitura,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/configuracoes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-navy">Perfis de Permissão</h1>
            <p className="text-muted-foreground">
              Gerencie os perfis e suas permissões por módulo
            </p>
          </div>
        </div>
        <Button className="bg-navy hover:bg-petrol" onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Perfil
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : perfis.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum perfil cadastrado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perfis.map((perfil) => (
                  <TableRow key={perfil.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-navy" />
                        <span className="font-medium">{perfil.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {perfil.descricao || '-'}
                    </TableCell>
                    <TableCell>
                      {perfil.is_admin ? (
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                          Admin Total
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Personalizado</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(perfil)}
                          disabled={!perfil.editavel && perfil.is_admin}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(perfil)}
                          disabled={!perfil.editavel}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPerfil ? `Editar Perfil: ${editingPerfil.nome}` : 'Novo Perfil'}
            </DialogTitle>
            <DialogDescription>
              Defina o nome e as permissões de acesso por módulo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Perfil</Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Supervisor"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Acesso parcial ao sistema"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Permissões por Módulo</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead className="w-[100px] text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span>👁️ Ler</span>
                        <Checkbox
                          checked={permissoes.every((p) => p.leitura)}
                          onCheckedChange={toggleAllRead}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px] text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span>✏️ Editar</span>
                        <Checkbox
                          checked={permissoes.every((p) => p.edicao)}
                          onCheckedChange={toggleAllEdit}
                        />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MODULOS_DISPONIVEIS.map((modulo) => {
                    const perm = permissoes.find((p) => p.modulo === modulo.key);
                    return (
                      <TableRow key={modulo.key}>
                        <TableCell className="font-medium">{modulo.label}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm?.leitura ?? false}
                            onCheckedChange={() => togglePermission(modulo.key, 'leitura')}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm?.edicao ?? false}
                            onCheckedChange={() => togglePermission(modulo.key, 'edicao')}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-navy hover:bg-petrol"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
