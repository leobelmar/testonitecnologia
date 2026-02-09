import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FaturaPDFData {
  numero: number;
  cliente_nome: string;
  cliente_cnpj?: string | null;
  cliente_endereco?: string | null;
  cliente_telefone?: string | null;
  cliente_email?: string | null;
  descricao: string | null;
  valor_total: number;
  data_emissao: string;
  data_vencimento: string;
  forma_pagamento: string | null;
  status: string;
  observacoes?: string | null;
  pecas?: { nome: string; modelo: string | null; quantidade: number; valor_unitario: number; valor_total: number }[];
  horas_trabalhadas?: number;
  valor_mao_obra?: number;
  valor_materiais?: number;
}

export function gerarFaturaPDF(data: FaturaPDFData) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 31, 63); // navy
  doc.text('FATURA', 14, 25);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Nº ${data.numero}`, 14, 33);

  // Empresa
  doc.setFontSize(10);
  doc.setTextColor(0, 31, 63);
  doc.text('Testoni Tecnologia', 140, 15);
  doc.setTextColor(100);
  doc.setFontSize(8);
  doc.text('Help Desk & Gestão de TI', 140, 20);

  // Linha separadora
  doc.setDrawColor(0, 31, 63);
  doc.setLineWidth(0.5);
  doc.line(14, 38, 196, 38);

  // Cliente
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text('CLIENTE', 14, 48);
  doc.setFontSize(9);
  doc.text(data.cliente_nome, 14, 54);
  if (data.cliente_cnpj) doc.text(`CNPJ/CPF: ${data.cliente_cnpj}`, 14, 59);
  if (data.cliente_endereco) doc.text(data.cliente_endereco, 14, 64);
  if (data.cliente_telefone) doc.text(`Tel: ${data.cliente_telefone}`, 14, 69);
  if (data.cliente_email) doc.text(`E-mail: ${data.cliente_email}`, 14, 74);

  // Dados da fatura
  doc.setFontSize(10);
  doc.text('DADOS DA FATURA', 120, 48);
  doc.setFontSize(9);
  doc.text(`Emissão: ${formatDate(data.data_emissao)}`, 120, 54);
  doc.text(`Vencimento: ${formatDate(data.data_vencimento)}`, 120, 59);
  doc.text(`Pagamento: ${data.forma_pagamento || 'Não informado'}`, 120, 64);
  doc.text(`Status: ${data.status === 'pago' ? 'PAGO' : data.status === 'em_aberto' ? 'EM ABERTO' : 'ATRASADO'}`, 120, 69);

  let yPos = 84;

  // Descrição
  if (data.descricao) {
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('DESCRIÇÃO', 14, yPos);
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(data.descricao, 14, yPos + 6);
    yPos += 16;
  }

  // Peças
  if (data.pecas && data.pecas.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('PEÇAS / MATERIAIS', 14, yPos);
    yPos += 4;

    autoTable(doc, {
      startY: yPos,
      head: [['Produto', 'Modelo', 'Qtd', 'Valor Unit.', 'Total']],
      body: data.pecas.map((p) => [
        p.nome,
        p.modelo || '-',
        p.quantidade.toString(),
        `R$ ${p.valor_unitario.toFixed(2)}`,
        `R$ ${p.valor_total.toFixed(2)}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [0, 31, 63] },
      styles: { fontSize: 8 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Resumo de valores
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text('RESUMO', 14, yPos);
  yPos += 6;

  const resumo: string[][] = [];
  if (data.horas_trabalhadas) resumo.push(['Horas Trabalhadas', `${data.horas_trabalhadas}h`]);
  if (data.valor_mao_obra) resumo.push(['Mão de Obra', `R$ ${data.valor_mao_obra.toFixed(2)}`]);
  if (data.valor_materiais) resumo.push(['Materiais', `R$ ${data.valor_materiais.toFixed(2)}`]);
  if (data.pecas && data.pecas.length > 0) {
    const totalPecas = data.pecas.reduce((acc, p) => acc + p.valor_total, 0);
    resumo.push(['Peças', `R$ ${totalPecas.toFixed(2)}`]);
  }
  resumo.push(['VALOR TOTAL', `R$ ${data.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]);

  autoTable(doc, {
    startY: yPos,
    body: resumo,
    theme: 'plain',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right', cellWidth: 80 },
    },
    didParseCell: (data) => {
      if (data.row.index === resumo.length - 1) {
        data.cell.styles.fontSize = 12;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = [0, 31, 63];
      }
    },
  });

  // Observações
  if (data.observacoes) {
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Obs: ${data.observacoes}`, 14, finalY);
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text('Documento gerado automaticamente pelo sistema Testoni Tecnologia', 14, 285);
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 140, 285);

  // Download
  doc.save(`Fatura_${data.numero}.pdf`);
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}
