import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { SLABadge } from './SLABadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DashboardItem } from '@/hooks/useTecnicoDashboard';

interface Props {
  items: DashboardItem[];
  onQuickView: (item: DashboardItem) => void;
}

const statusLabels: Record<string, string> = {
  aberto: 'Aberto',
  em_atendimento: 'Em Atendimento',
  aguardando_cliente: 'Aguard. Cliente',
  aberta: 'Em Aberto',
  em_execucao: 'Em Execução',
};

const statusStyles: Record<string, string> = {
  aberto: 'bg-blue-100 text-blue-800',
  em_atendimento: 'bg-purple-100 text-purple-800',
  aguardando_cliente: 'bg-yellow-100 text-yellow-800',
  aberta: 'bg-blue-100 text-blue-800',
  em_execucao: 'bg-yellow-100 text-yellow-800',
};

export function TecnicoListView({ items, onQuickView }: Props) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhum item encontrado com os filtros atuais.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Nº</TableHead>
                <TableHead>Chamado</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Abertura</TableHead>
                <TableHead>Última Interação</TableHead>
                <TableHead>SLA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const link = item.tipo === 'chamado'
                  ? `/app/chamados/${item.id}`
                  : `/app/ordens-servico/${item.id}`;
                return (
                  <TableRow
                    key={`${item.tipo}-${item.id}`}
                    className={`cursor-pointer hover:bg-muted/50 ${item.sla_level === 'critico' ? 'bg-red-50' : item.sla_level === 'alerta' ? 'bg-yellow-50' : ''}`}
                    onClick={() => onQuickView(item)}
                  >
                    <TableCell className="font-medium text-primary">
                      {item.tipo === 'os' ? `OS #${item.numero}` : `#${item.numero}`}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.chamado_numero ? `#${item.chamado_numero}` : item.tipo === 'chamado' ? `#${item.numero}` : '-'}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate">{item.cliente_nome}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{item.titulo}</TableCell>
                    <TableCell>
                      <Badge className={statusStyles[item.status] || 'bg-muted text-muted-foreground'}>
                        {statusLabels[item.status] || item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(item.data_abertura), 'dd/MM/yy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {item.ultima_interacao
                        ? format(new Date(item.ultima_interacao), "dd/MM 'às' HH:mm", { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <SLABadge level={item.sla_level} diasAberto={item.dias_aberto} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
