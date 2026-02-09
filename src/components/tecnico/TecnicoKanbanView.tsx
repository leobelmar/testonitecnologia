import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SLABadge } from './SLABadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DashboardItem } from '@/hooks/useTecnicoDashboard';

interface Props {
  items: DashboardItem[];
  onQuickView: (item: DashboardItem) => void;
}

const columns = [
  { key: 'aberto', label: 'Em Aberto', statuses: ['aberto', 'aberta'] },
  { key: 'atendimento', label: 'Em Atendimento', statuses: ['em_atendimento', 'em_execucao'] },
  { key: 'aguardando', label: 'Aguardando Cliente', statuses: ['aguardando_cliente'] },
];

const prioridadeStyles: Record<string, string> = {
  baixa: 'bg-green-100 text-green-800',
  media: 'bg-yellow-100 text-yellow-800',
  alta: 'bg-orange-100 text-orange-800',
  urgente: 'bg-red-100 text-red-800',
};

export function TecnicoKanbanView({ items, onQuickView }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map(col => {
        const colItems = items.filter(i => col.statuses.includes(i.status));
        return (
          <div key={col.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-primary">{col.label}</h3>
              <Badge variant="secondary" className="text-xs">{colItems.length}</Badge>
            </div>
            <div className="space-y-2 min-h-[100px]">
              {colItems.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">Nenhum item</p>
              ) : (
                colItems.map(item => (
                  <Card
                    key={`${item.tipo}-${item.id}`}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      item.sla_level === 'critico' ? 'border-red-300 bg-red-50' :
                      item.sla_level === 'alerta' ? 'border-yellow-300 bg-yellow-50' : ''
                    }`}
                    onClick={() => onQuickView(item)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-primary">
                          {item.tipo === 'os' ? `OS #${item.numero}` : `#${item.numero}`}
                        </span>
                        <SLABadge level={item.sla_level} diasAberto={item.dias_aberto} compact />
                      </div>
                      <p className="text-sm font-medium truncate">{item.titulo}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.cliente_nome}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.data_abertura), 'dd/MM/yy', { locale: ptBR })}
                        </span>
                        {item.prioridade && (
                          <Badge className={`text-[10px] px-1.5 py-0 ${prioridadeStyles[item.prioridade] || ''}`}>
                            {item.prioridade}
                          </Badge>
                        )}
                      </div>
                      {item.descricao && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.descricao}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
