import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import logoAzul from '@/assets/logo-azul.png';

interface ArquivoInfo {
  nome_arquivo: string;
  descricao: string | null;
  tamanho_bytes: number;
  tipo_mime: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function DownloadPublico() {
  const { token } = useParams<{ token: string }>();
  const [info, setInfo] = useState<ArquivoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const baseUrl = `https://${projectId}.supabase.co/functions/v1/download-arquivo`;

  useEffect(() => {
    if (!token) return;

    fetch(`${baseUrl}?token=${encodeURIComponent(token)}&action=info`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          if (data.status === 'expirado') setError('Este link de download expirou.');
          else if (data.status === 'revogado') setError('Este link foi revogado.');
          else if (data.status === 'limite') setError('O limite de downloads foi atingido.');
          else setError(data.error || 'Arquivo não encontrado.');
        } else {
          setInfo(data);
        }
      })
      .catch(() => setError('Erro ao carregar informações do arquivo.'))
      .finally(() => setLoading(false));
  }, [token, baseUrl]);

  const handleDownload = async () => {
    if (!token) return;
    setDownloading(true);
    try {
      const res = await fetch(`${baseUrl}?token=${encodeURIComponent(token)}&action=download`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao baixar arquivo.');
        return;
      }
      // Abrir URL de download
      const a = document.createElement('a');
      a.href = data.url;
      a.download = info?.nome_arquivo || 'arquivo';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloaded(true);
    } catch {
      setError('Erro ao processar download.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center border-b pb-6">
          <img src={logoAzul} alt="Logo" className="h-10 mx-auto mb-4" />
          <CardTitle className="text-xl">Download de Arquivo</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <p className="text-base font-medium text-destructive">{error}</p>
              <p className="text-sm text-muted-foreground">
                Se você acredita que isso é um erro, entre em contato com o suporte.
              </p>
            </div>
          ) : info ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <FileText className="h-10 w-10 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{info.nome_arquivo}</p>
                  <p className="text-sm text-muted-foreground">{formatBytes(info.tamanho_bytes)}</p>
                  {info.descricao && (
                    <p className="text-sm text-muted-foreground mt-1">{info.descricao}</p>
                  )}
                </div>
              </div>

              {downloaded ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                  <p className="text-sm font-medium text-primary">Download iniciado com sucesso!</p>
                  <Button variant="outline" size="sm" onClick={handleDownload} className="mt-2">
                    Baixar novamente
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full"
                  size="lg"
                >
                  {downloading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Baixar Arquivo
                </Button>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
