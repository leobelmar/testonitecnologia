import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AppRole, Convite } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Copy, Mail, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Usuarios() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [conviteEmail, setConviteEmail] = useState('');
  const [conviteRole, setConviteRole] = useState<AppRole>('cliente');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetchUsuarios();
    fetchConvites();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('nome');

      if (error) throw error;
      setUsuarios(data as Profile[]);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConvites = async () => {
    try {
      const { data, error } = await supabase
        .from('convites')
        .select('*')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConvites(data as Convite[]);
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
    }
  };

  const handleEnviarConvite = async () => {
    if (!conviteEmail.trim()) {
      toast({
        title: 'Erro',
        description: 'E-mail é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setEnviando(true);

    try {
      // Gerar token único
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

      const { error } = await supabase.from('convites').insert({
        email: conviteEmail.trim().toLowerCase(),
        role: conviteRole,
        token,
        expires_at: expiresAt.toISOString(),
        created_by: user?.id,
      });

      if (error) throw error;

      const inviteUrl = `${window.location.origin}/auth?token=${token}`;

      toast({
        title: 'Convite criado!',
        description: 'Link copiado para a área de transferência.',
      });

      // Copiar link para clipboard
      navigator.clipboard.writeText(inviteUrl);

      setDialogOpen(false);
      setConviteEmail('');
      setConviteRole('cliente');
      fetchConvites();
    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o convite.',
        variant: 'destructive',
      });
    } finally {
      setEnviando(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/auth?token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: 'Link copiado!',
      description: 'O link de convite foi copiado para a área de transferência.',
    });
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      tecnico: 'bg-blue-100 text-blue-800',
      financeiro: 'bg-green-100 text-green-800',
      cliente: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      admin: 'Administrador',
      tecnico: 'Técnico',
      financeiro: 'Financeiro',
      cliente: 'Cliente',
    };
    return { style: styles[role], label: labels[role] };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e convites do sistema
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-navy hover:bg-petrol">
              <UserPlus className="mr-2 h-4 w-4" />
              Convidar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Usuário</DialogTitle>
              <DialogDescription>
                Envie um convite por e-mail para adicionar um novo usuário ao sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={conviteEmail}
                  onChange={(e) => setConviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Perfil de acesso</Label>
                <Select
                  value={conviteRole}
                  onValueChange={(value: AppRole) => setConviteRole(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleEnviarConvite}
                disabled={enviando}
                className="bg-navy hover:bg-petrol"
              >
                {enviando ? 'Criando...' : 'Criar Convite'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários Ativos</TabsTrigger>
          <TabsTrigger value="convites">
            Convites Pendentes ({convites.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="mt-6">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : usuarios.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum usuário cadastrado
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => {
                      const role = getRoleBadge(usuario.role);
                      return (
                        <TableRow key={usuario.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-navy" />
                              </div>
                              <div>
                                <p className="font-medium">{usuario.nome}</p>
                                {usuario.telefone && (
                                  <p className="text-sm text-muted-foreground">
                                    {usuario.telefone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>
                            <Badge className={role.style}>{role.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={usuario.ativo ? 'default' : 'secondary'}
                              className={
                                usuario.ativo
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                  : ''
                              }
                            >
                              {usuario.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(usuario.created_at), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
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

        <TabsContent value="convites" className="mt-6">
          <Card>
            <CardContent className="p-0">
              {convites.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum convite pendente
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Expira em</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {convites.map((convite) => {
                      const role = getRoleBadge(convite.role);
                      return (
                        <TableRow key={convite.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {convite.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={role.style}>{role.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(convite.expires_at), 'dd/MM/yyyy', {
                                locale: ptBR,
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(convite.created_at), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyInviteLink(convite.token)}
                              title="Copiar link do convite"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
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
