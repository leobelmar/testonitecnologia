import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import {
  Upload, Copy, Trash2, Ban, Link2, FileText, Download,
  Loader2, Plus, Eye, RefreshCw, Calendar
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ArquivoCompartilhado {
  id: string;
  nome_arquivo: string;
  nome_original: string;
  descricao: string | null;
  tamanho_bytes: number;
  tipo_mime: string | null;
  storage_path: string;
  token: string;
  chamado_id: string | null;
  expira_em: string | null;
  limite_downloads: number | null;
  total_downloads: number;
  status: string;
  created_by: string;
  created_at: string;
}

interface Chamado {
  id: string;
  numero: number;
  titulo: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(48);
  crypto.getRandomValues(array);
  for (let i = 0; i < 48; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export default function Arquivos() {
  const { user } = useAuth();
  const [arquivos, setArquivos] = useState<ArquivoCompartilhado[]>([]);
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalhesArquivo, setDetalhesArquivo] = useState<ArquivoCompartilhado | null>(null);
  const [downloads, setDownloads] = useState<any[]>([]);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [descricao, setDescricao] = useState('');
  const [chamadoId, setChamadoId] = useState('');
  const [diasValidade, setDiasValidade] = useState('7');
  const [limiteDownloads, setLimiteDownloads] = useState('');

  const fetchArquivos = useCallback(async () => {
    const { data } = await supabase
      .from('arquivos_compartilhados')
      .select('*')
      .order('created_at', { ascending: false });
    setArquivos((data as unknown as ArquivoCompartilhado[]) || []);
    setLoading(false);
  }, []);

  const fetchChamados = useCallback(async () => {
    const { data } = await supabase
      .from('chamados')
      .select('id, numero, titulo')
      .order('numero', { ascending: false })
      .limit(100);
    setChamados((data as Chamado[]) || []);
  }, []);

  useEffect(() => {
    fetchArquivos();
    fetchChamados();
  }, [fetchArquivos, fetchChamados]);

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);

    try {
      const token = generateToken();
      const ext = file.name.split('.').pop();
      const storagePath = `${crypto.randomUUID()}.${ext}`;

      // Upload para storage
      const { error: uploadError } = await supabase.storage
        .from('arquivos-compartilhados')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      const expiresAt = diasValidade
        ? addDays(new Date(), parseInt(diasValidade)).toISOString()
        : null;

      // Salvar registro
      const { error: insertError } = await supabase
        .from('arquivos_compartilhados')
        .insert({
          nome_arquivo: file.name.replace(/\.[^/.]+$/, ''),
          nome_original: file.name,
          descricao: descricao || null,
          tamanho_bytes: file.size,
          tipo_mime: file.type || null,
          storage_path: storagePath,
          token,
          chamado_id: chamadoId || null,
          expira_em: expiresAt,
          limite_downloads: limiteDownloads ? parseInt(limiteDownloads) : null,
          created_by: user.id,
        } as any);

      if (insertError) throw insertError;

      toast({ title: 'Arquivo enviado com sucesso!' });
      setDialogOpen(false);
      resetForm();
      fetchArquivos();
    } catch (err: any) {
      toast({ title: 'Erro ao enviar arquivo', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setDescricao('');
    setChamadoId('');
    setDiasValidade('7');
    setLimiteDownloads('');
  };

  const getDownloadLink = (token: string) => {
    return `${window.location.origin}/download/${token}`;
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(getDownloadLink(token));
    toast({ title: 'Link copiado!' });
  };

  const revogarAcesso = async (id: string) => {
    await supabase
      .from('arquivos_compartilhados')
      .update({ status: 'revogado' } as any)
      .eq('id', id);
    toast({ title: 'Acesso revogado' });
    fetchArquivos();
  };

  const excluirArquivo = async (arquivo: ArquivoCompartilhado) => {
    // Deletar do storage
    await supabase.storage
      .from('arquivos-compartilhados')
      .remove([arquivo.storage_path]);

    // Deletar registro
    await supabase
      .from('arquivos_compartilhados')
      .delete()
      .eq('id', arquivo.id);

    toast({ title: 'Arquivo excluído' });
    fetchArquivos();
  };

  const verDetalhes = async (arquivo: ArquivoCompartilhado) => {
    setDetalhesArquivo(arquivo);
    const { data } = await supabase
      .from('arquivos_downloads')
      .select('*')
      .eq('arquivo_id', arquivo.id)
      .order('created_at', { ascending: false });
    setDownloads(data || []);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-primary/10 text-primary">Ativo</Badge>;
      case 'expirado':
        return <Badge variant="secondary">Expirado</Badge>;
      case 'revogado':
        return <Badge variant="destructive">Revogado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Arquivos Compartilhados</h1>
          <p className="text-muted-foreground">Gerencie uploads e links de download para clientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchArquivos}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Enviar Arquivo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Enviar Novo Arquivo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Arquivo *</Label>
                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mt-1"
                  />
                  {file && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {file.name} — {formatBytes(file.size)}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Descrição (opcional)</Label>
                  <Textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descrição visível para o cliente na página de download"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Associar a Chamado (opcional)</Label>
                  <Select value={chamadoId} onValueChange={setChamadoId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Nenhum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {chamados.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          #{c.numero} — {c.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Validade (dias)</Label>
                    <Input
                      type="number"
                      value={diasValidade}
                      onChange={(e) => setDiasValidade(e.target.value)}
                      placeholder="Sem expiração"
                      min="1"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Limite de Downloads</Label>
                    <Input
                      type="number"
                      value={limiteDownloads}
                      onChange={(e) => setLimiteDownloads(e.target.value)}
                      placeholder="Ilimitado"
                      min="1"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? 'Enviando...' : 'Enviar e Gerar Link'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Detalhes Dialog */}
      <Dialog open={!!detalhesArquivo} onOpenChange={() => setDetalhesArquivo(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Arquivo</DialogTitle>
          </DialogHeader>
          {detalhesArquivo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nome:</span>
                  <p className="font-medium">{detalhesArquivo.nome_original}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tamanho:</span>
                  <p className="font-medium">{formatBytes(detalhesArquivo.tamanho_bytes)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-1">{statusBadge(detalhesArquivo.status)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Downloads:</span>
                  <p className="font-medium">
                    {detalhesArquivo.total_downloads}
                    {detalhesArquivo.limite_downloads && ` / ${detalhesArquivo.limite_downloads}`}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Criado em:</span>
                  <p className="font-medium">
                    {format(new Date(detalhesArquivo.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expira em:</span>
                  <p className="font-medium">
                    {detalhesArquivo.expira_em
                      ? format(new Date(detalhesArquivo.expira_em), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : 'Sem expiração'}
                  </p>
                </div>
              </div>

              {detalhesArquivo.descricao && (
                <div>
                  <span className="text-sm text-muted-foreground">Descrição:</span>
                  <p className="text-sm">{detalhesArquivo.descricao}</p>
                </div>
              )}

              <div>
                <Label className="text-sm text-muted-foreground">Link de Download:</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    readOnly
                    value={getDownloadLink(detalhesArquivo.token)}
                    className="text-xs"
                  />
                  <Button size="icon" variant="outline" onClick={() => copyLink(detalhesArquivo.token)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {downloads.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Histórico de Downloads:</Label>
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>IP</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {downloads.map((d: any) => (
                          <TableRow key={d.id}>
                            <TableCell className="text-xs">
                              {format(new Date(d.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell className="text-xs">{d.ip_address}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lista de arquivos */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : arquivos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-3" />
              <p>Nenhum arquivo compartilhado ainda.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arquivos.map((arq) => (
                  <TableRow key={arq.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium truncate max-w-[200px]">{arq.nome_original}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatBytes(arq.tamanho_bytes)}</TableCell>
                    <TableCell>{statusBadge(arq.status)}</TableCell>
                    <TableCell className="text-sm">
                      {arq.total_downloads}
                      {arq.limite_downloads && ` / ${arq.limite_downloads}`}
                    </TableCell>
                    <TableCell className="text-sm">
                      {arq.expira_em
                        ? format(new Date(arq.expira_em), "dd/MM/yy", { locale: ptBR })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(arq.created_at), "dd/MM/yy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Ver detalhes"
                          onClick={() => verDetalhes(arq)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Copiar link"
                          onClick={() => copyLink(arq.token)}
                          disabled={arq.status !== 'ativo'}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {arq.status === 'ativo' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Revogar acesso"
                            onClick={() => revogarAcesso(arq.id)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Excluir"
                          className="text-destructive hover:text-destructive"
                          onClick={() => excluirArquivo(arq)}
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
    </div>
  );
}
