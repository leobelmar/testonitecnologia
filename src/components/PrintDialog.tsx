import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import logoAzul from '@/assets/logo-azul.png';

type PrintSize = 'a4' | '80mm';

interface ChamadoPrintData {
  type: 'chamado';
  numero: number;
  titulo: string;
  descricao?: string | null;
  prioridade: string;
  status: string;
  data_abertura: string;
  cliente_nome?: string;
  cliente_telefone?: string;
  cliente_email?: string;
  tipo?: string | null;
}

interface OSPrintData {
  type: 'os';
  numero: number;
  descricao_servico?: string | null;
  servicos_realizados?: string | null;
  materiais_usados?: string | null;
  horas_trabalhadas?: number | null;
  valor_materiais?: number | null;
  valor_mao_obra?: number | null;
  valor_total?: number | null;
  status: string;
  data_inicio?: string | null;
  data_fim?: string | null;
  observacoes?: string | null;
  cliente_nome?: string;
  cliente_telefone?: string;
  cliente_email?: string;
  chamado_numero?: number;
  chamado_titulo?: string;
  tecnico_nome?: string;
}

type PrintData = ChamadoPrintData | OSPrintData;

interface PrintDialogProps {
  data: PrintData;
  trigger?: React.ReactNode;
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

const prioridadeLabels: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

const chamadoStatusLabels: Record<string, string> = {
  aberto: 'Aberto',
  em_atendimento: 'Em Atendimento',
  aguardando_cliente: 'Aguardando Cliente',
  aguardando_terceiros: 'Aguardando Terceiros',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

const osStatusLabels: Record<string, string> = {
  aberta: 'Em Aberto',
  em_execucao: 'Em Execução',
  finalizada: 'Finalizada',
  faturada: 'Faturado',
  pago: 'Pago',
};

export function PrintDialog({ data, trigger, externalOpen, onExternalOpenChange }: PrintDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (isControlled) {
      onExternalOpenChange?.(val);
    } else {
      setInternalOpen(val);
    }
  };
  const [size, setSize] = useState<PrintSize>('a4');
  const printRef = useRef<HTMLDivElement>(null);
  const [logoBase64, setLogoBase64] = useState<string>('');

  // Convert logo to base64 for print window
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        setLogoBase64(canvas.toDataURL('image/png'));
      }
    };
    img.src = logoAzul;
  }, []);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = size === 'a4' ? getA4Styles() : get80mmStyles();

    const logoDataUrl = logoBase64;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.type === 'chamado' ? `Chamado #${data.numero}` : `OS #${data.numero}`}</title>
          <style>${styles}</style>
        </head>
        <body>
          ${printContent.innerHTML.replace(/\{LOGO_SRC\}/g, logoDataUrl)}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setOpen(false);
  };

  const getA4Styles = () => `
    @page {
      size: A4;
      margin: 12mm 15mm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 9pt;
      line-height: 1.35;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .print-container {
      max-width: 100%;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #0a2540;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .header-logo {
      height: 36px;
      opacity: 0.85;
    }
    .header-text {
      text-align: right;
    }
    .header h1 {
      color: #0a2540;
      margin: 0;
      font-size: 16pt;
    }
    .header p {
      color: #888;
      margin: 2px 0 0;
      font-size: 8pt;
    }
    .section {
      margin-bottom: 10px;
    }
    .section-title {
      font-weight: bold;
      color: #0a2540;
      border-bottom: 1px solid #ddd;
      padding-bottom: 3px;
      margin-bottom: 6px;
      font-size: 10pt;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 4px 12px;
    }
    .info-item {
      margin-bottom: 4px;
    }
    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .info-value {
      color: #333;
      font-size: 9pt;
    }
    .description {
      white-space: pre-wrap;
      background: #f9f9f9;
      padding: 6px 8px;
      border-radius: 3px;
      border: 1px solid #eee;
      font-size: 8.5pt;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 8pt;
      font-weight: bold;
    }
    .badge-urgente { background: #fee2e2; color: #dc2626; }
    .badge-alta { background: #ffedd5; color: #ea580c; }
    .badge-media { background: #fef9c3; color: #ca8a04; }
    .badge-baixa { background: #dcfce7; color: #16a34a; }
    .totals {
      background: #f0f9ff;
      padding: 8px 12px;
      border-radius: 4px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
      font-size: 9pt;
    }
    .total-final {
      font-size: 12pt;
      font-weight: bold;
      color: #0a2540;
      border-top: 1px solid #0a2540;
      padding-top: 6px;
      margin-top: 6px;
    }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      font-size: 7.5pt;
      color: #999;
    }
    .signature-line {
      border-top: 1px solid #333;
      width: 200px;
      margin: 30px auto 3px;
      text-align: center;
      padding-top: 3px;
      font-size: 8pt;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
  `;

  const get80mmStyles = () => `
    @page {
      size: 80mm auto;
      margin: 3mm;
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: 9pt;
      line-height: 1.3;
      color: #000;
      margin: 0;
      padding: 0;
      width: 74mm;
    }
    .print-container {
      width: 100%;
    }
    .header {
      text-align: center;
      border-bottom: 1px dashed #000;
      padding-bottom: 8px;
      margin-bottom: 8px;
      display: block;
    }
    .header-logo {
      height: 20px;
      margin: 0 auto 4px;
      display: block;
      opacity: 0.8;
    }
    .header-text {
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 14pt;
    }
    .header p {
      margin: 3px 0 0;
      font-size: 8pt;
    }
    .two-col { display: block; }
    .section {
      margin-bottom: 8px;
    }
    .section-title {
      font-weight: bold;
      border-bottom: 1px dashed #000;
      padding-bottom: 3px;
      margin-bottom: 5px;
      font-size: 10pt;
    }
    .info-grid {
      display: block;
    }
    .info-item {
      margin-bottom: 3px;
    }
    .info-label {
      font-weight: bold;
      font-size: 8pt;
    }
    .info-value {
      font-size: 9pt;
    }
    .description {
      white-space: pre-wrap;
      font-size: 8pt;
      border: 1px dashed #000;
      padding: 5px;
      margin: 5px 0;
    }
    .badge {
      font-weight: bold;
      font-size: 9pt;
    }
    .totals {
      border: 1px dashed #000;
      padding: 5px;
      margin-top: 8px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
    }
    .total-final {
      font-size: 11pt;
      font-weight: bold;
      border-top: 1px dashed #000;
      padding-top: 5px;
      margin-top: 5px;
    }
    .footer {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px dashed #000;
      text-align: center;
      font-size: 8pt;
    }
    .signature-line {
      border-top: 1px solid #000;
      width: 60mm;
      margin: 20px auto 3px;
      text-align: center;
      padding-top: 3px;
      font-size: 8pt;
    }
  `;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return 'R$ 0,00';
    return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const renderChamadoContent = (chamado: ChamadoPrintData) => (
    <div className="print-container">
      <div className="header">
        <img src={"{LOGO_SRC}"} alt="Logo" className="header-logo" />
        <div className="header-text">
          <h1>Chamado #{chamado.numero}</h1>
          <p>Testoni Tecnologia</p>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Informações do Chamado</div>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Título</div>
            <div className="info-value">{chamado.titulo}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Status</div>
            <div className="info-value">
              <span className="badge">{chamadoStatusLabels[chamado.status] || chamado.status}</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-label">Prioridade</div>
            <div className="info-value">
              <span className={`badge badge-${chamado.prioridade}`}>
                {prioridadeLabels[chamado.prioridade] || chamado.prioridade}
              </span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-label">Data de Abertura</div>
            <div className="info-value">{formatDate(chamado.data_abertura)}</div>
          </div>
          {chamado.tipo && (
            <div className="info-item">
              <div className="info-label">Tipo</div>
              <div className="info-value">{chamado.tipo}</div>
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-title">Cliente</div>
        <div className="info-item">
          <div className="info-value">{chamado.cliente_nome || '-'}</div>
        </div>
        {chamado.cliente_telefone && (
          <div className="info-item">
            <div className="info-label">Telefone</div>
            <div className="info-value">{chamado.cliente_telefone}</div>
          </div>
        )}
        {chamado.cliente_email && (
          <div className="info-item">
            <div className="info-label">E-mail</div>
            <div className="info-value">{chamado.cliente_email}</div>
          </div>
        )}
      </div>

      {chamado.descricao && (
        <div className="section">
          <div className="section-title">Descrição</div>
          <div className="description">{chamado.descricao}</div>
        </div>
      )}

      <div className="footer">
        <p>Impresso em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
      </div>
    </div>
  );

  const renderOSContent = (os: OSPrintData) => (
    <div className="print-container">
      <div className="header">
        <img src={"{LOGO_SRC}"} alt="Logo" className="header-logo" />
        <div className="header-text">
          <h1>OS #{os.numero}</h1>
          <p>Testoni Tecnologia</p>
        </div>
      </div>

      <div className="two-col">
        <div className="section">
          <div className="section-title">Cliente</div>
          <div className="info-item">
            <div className="info-value" style={{fontWeight: 'bold'}}>{os.cliente_nome || '-'}</div>
          </div>
          {os.cliente_telefone && (
            <div className="info-item">
              <div className="info-label">Telefone</div>
              <div className="info-value">{os.cliente_telefone}</div>
            </div>
          )}
          {os.cliente_email && (
            <div className="info-item">
              <div className="info-label">E-mail</div>
              <div className="info-value">{os.cliente_email}</div>
            </div>
          )}
        </div>

        <div className="section">
          <div className="section-title">Informações</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Status</div>
              <div className="info-value">
                <span className="badge">{osStatusLabels[os.status] || os.status}</span>
              </div>
            </div>
            {os.tecnico_nome && (
              <div className="info-item">
                <div className="info-label">Técnico</div>
                <div className="info-value">{os.tecnico_nome}</div>
              </div>
            )}
            {os.chamado_numero && (
              <div className="info-item">
                <div className="info-label">Chamado</div>
                <div className="info-value">#{os.chamado_numero}</div>
              </div>
            )}
            {os.data_inicio && (
              <div className="info-item">
                <div className="info-label">Início</div>
                <div className="info-value">{formatDate(os.data_inicio)}</div>
              </div>
            )}
            {os.data_fim && (
              <div className="info-item">
                <div className="info-label">Fim</div>
                <div className="info-value">{formatDate(os.data_fim)}</div>
              </div>
            )}
            {os.horas_trabalhadas != null && (
              <div className="info-item">
                <div className="info-label">Horas</div>
                <div className="info-value">{os.horas_trabalhadas}h</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {os.descricao_servico && (
        <div className="section">
          <div className="section-title">Descrição do Serviço</div>
          <div className="description">{os.descricao_servico}</div>
        </div>
      )}

      {os.servicos_realizados && (
        <div className="section">
          <div className="section-title">Serviços Realizados</div>
          <div className="description">{os.servicos_realizados}</div>
        </div>
      )}

      <div className="two-col">
        {os.materiais_usados && (
          <div className="section">
            <div className="section-title">Materiais Utilizados</div>
            <div className="description">{os.materiais_usados}</div>
          </div>
        )}

        {os.observacoes && (
          <div className="section">
            <div className="section-title">Observações</div>
            <div className="description">{os.observacoes}</div>
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-title">Valores</div>
        <div className="totals">
          <div className="total-row">
            <span>Mão de Obra:</span>
            <span>{formatCurrency(os.valor_mao_obra)}</span>
          </div>
          <div className="total-row">
            <span>Materiais:</span>
            <span>{formatCurrency(os.valor_materiais)}</span>
          </div>
          <div className="total-row total-final">
            <span>TOTAL:</span>
            <span>{formatCurrency(os.valor_total)}</span>
          </div>
        </div>
      </div>

      <div className="footer">
        <div className="signature-line">Assinatura do Cliente</div>
        <p style={{textAlign: 'center', marginTop: '4px'}}>Impresso em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Imprimir {data.type === 'chamado' ? 'Chamado' : 'Ordem de Serviço'}</DialogTitle>
          <DialogDescription>
            Selecione o tamanho do papel para impressão
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={size} onValueChange={(value) => setSize(value as PrintSize)}>
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="a4" id="a4" />
              <Label htmlFor="a4" className="flex-1 cursor-pointer">
                <div className="font-medium">A4 (210 x 297 mm)</div>
                <div className="text-sm text-muted-foreground">
                  Impressora padrão de escritório
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer mt-2">
              <RadioGroupItem value="80mm" id="80mm" />
              <Label htmlFor="80mm" className="flex-1 cursor-pointer">
                <div className="font-medium">80mm (Cupom)</div>
                <div className="text-sm text-muted-foreground">
                  Impressora térmica de cupom
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Hidden print content */}
        <div ref={printRef} className="hidden">
          {data.type === 'chamado' 
            ? renderChamadoContent(data as ChamadoPrintData)
            : renderOSContent(data as OSPrintData)
          }
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handlePrint} className="bg-navy hover:bg-petrol">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
