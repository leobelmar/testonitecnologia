import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import type { SLALevel } from '@/hooks/useTecnicoDashboard';

interface SLABadgeProps {
  level: SLALevel;
  diasAberto: number;
  compact?: boolean;
}

const config: Record<SLALevel, { bg: string; icon: React.ElementType; label: string }> = {
  normal: { bg: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Normal' },
  alerta: { bg: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Alerta' },
  critico: { bg: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Crítico' },
};

export function SLABadge({ level, diasAberto, compact }: SLABadgeProps) {
  const c = config[level];
  const Icon = c.icon;
  return (
    <Badge className={`${c.bg} gap-1`}>
      <Icon className="h-3 w-3" />
      {compact ? `${diasAberto}d` : `${c.label} · ${diasAberto}d`}
    </Badge>
  );
}
