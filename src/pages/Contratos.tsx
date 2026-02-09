import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Search, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Contrato {
  id: string;
  numero: number;
  cliente_id: string;
  valor_mensal: number;
  horas_inclusas: number;
  vigencia_inicio: string;
  vigencia_fim: string | null;
  status: string;
  observacoes: string | null;
  created_at: string;
  cliente?: { nome_empresa: string } | null;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ativo: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
  suspenso: { label: 'Suspenso', color: 'bg-yellow-100 text-yellow-800' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  encerrado: { label: 'Encerrado', color: 'bg-gray-100 text-gray-800' },
};

export default function Contratos() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => {
    fetchContratos();
  }, []);

  const fetchContratos = async () => {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('*, cliente:clientes(nome_empresa)')
        .order('numero', { ascending: false });

      if (error) throw error;
      setContratos(data || []);
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar os contratos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = contratos.filter((c) => {
    const matchesSearch =
      !searchTerm ||
      c.numero.toString().includes(searchTerm) ||
      c.cliente?.nome_empresa?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Contratos
          </h1>
          <p className="text-muted-foreground">Gestão de contratos de clientes</p>
        </div>
        {isAdmin && (
          <Link to="/app/contratos/novo">
            <Button className="bg-navy hover:bg-petrol">
              <Plus className="h-4 w-4 mr-2" />
              Novo Contrato
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="suspenso">Suspenso</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="encerrado">Encerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum contrato encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor Mensal</TableHead>
                    <TableHead>Horas Inclusas</TableHead>
                    <TableHead>Vigência</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((contrato) => {
                    const cfg = statusConfig[contrato.status] || statusConfig.ativo;
                    return (
                      <TableRow key={contrato.id}>
                        <TableCell className="font-medium text-navy">#{contrato.numero}</TableCell>
                        <TableCell>{contrato.cliente?.nome_empresa || '-'}</TableCell>
                        <TableCell>R$ {Number(contrato.valor_mensal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>{Number(contrato.horas_inclusas)}h</TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(contrato.vigencia_inicio), 'dd/MM/yyyy', { locale: ptBR })}
                          {contrato.vigencia_fim && ` - ${format(new Date(contrato.vigencia_fim), 'dd/MM/yyyy', { locale: ptBR })}`}
                        </TableCell>
                        <TableCell>
                          <Badge className={cfg.color}>{cfg.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Link to={`/app/contratos/${contrato.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
