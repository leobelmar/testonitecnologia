import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ViewMode = 'lista' | 'kanban';
export type SLALevel = 'normal' | 'alerta' | 'critico';
export type SortOption = 'mais_antigo' | 'mais_critico' | 'ultima_interacao';

export interface DashboardItem {
  id: string;
  tipo: 'chamado' | 'os';
  numero: number;
  chamado_numero?: number;
  chamado_id?: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade?: string;
  cliente_nome: string;
  cliente_id: string;
  data_abertura: string;
  ultima_interacao?: string;
  sla_horas?: number;
  sla_level: SLALevel;
  dias_aberto: number;
  dias_sem_interacao: number;
}

interface Filters {
  status: string;
  cliente: string;
  sla: string;
  tipo: string;
  search: string;
}

const SLA_ALERTA_PERCENT = 0.7; // 70% do SLA = alerta
const SLA_DEFAULT_HORAS = 24;

function calcSLA(dataAbertura: string, slaHoras: number | null, ultimaInteracao?: string): { level: SLALevel; diasAberto: number; diasSemInteracao: number } {
  const now = new Date();
  const abertura = new Date(dataAbertura);
  const diasAberto = Math.floor((now.getTime() - abertura.getTime()) / (1000 * 60 * 60 * 24));
  
  let diasSemInteracao = diasAberto;
  if (ultimaInteracao) {
    diasSemInteracao = Math.floor((now.getTime() - new Date(ultimaInteracao).getTime()) / (1000 * 60 * 60 * 24));
  }

  const sla = slaHoras || SLA_DEFAULT_HORAS;
  const horasPassadas = (now.getTime() - abertura.getTime()) / (1000 * 60 * 60);
  
  if (horasPassadas >= sla) return { level: 'critico', diasAberto, diasSemInteracao };
  if (horasPassadas >= sla * SLA_ALERTA_PERCENT) return { level: 'alerta', diasAberto, diasSemInteracao };
  return { level: 'normal', diasAberto, diasSemInteracao };
}

export function useTecnicoDashboard() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('tecnico_view_mode') as ViewMode) || 'lista';
  });
  const [filters, setFilters] = useState<Filters>({
    status: 'todos',
    cliente: 'todos',
    sla: 'todos',
    tipo: 'todos',
    search: '',
  });
  const [sortBy, setSortBy] = useState<SortOption>('mais_critico');

  // Persist view preference
  useEffect(() => {
    localStorage.setItem('tecnico_view_mode', viewMode);
  }, [viewMode]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch chamados assigned to technician
      const { data: chamados } = await supabase
        .from('chamados')
        .select(`
          id, numero, titulo, descricao, status, prioridade, 
          data_abertura, sla_horas, created_at, updated_at,
          cliente:clientes(id, nome_empresa)
        `)
        .or(`atribuido_a.eq.${user.id},atribuido_a.is.null`)
        .in('status', ['aberto', 'em_atendimento', 'aguardando_cliente']);

      // Fetch OS assigned to technician
      const { data: ordens } = await supabase
        .from('ordens_servico')
        .select(`
          id, numero, descricao_servico, status, data_inicio, created_at, updated_at,
          chamado_id,
          cliente:clientes(id, nome_empresa),
          chamado:chamados(numero, prioridade, sla_horas, data_abertura)
        `)
        .eq('tecnico_id', user.id)
        .in('status', ['aberta', 'em_execucao']);

      // Get last interaction dates for chamados
      const chamadoIds = (chamados || []).map(c => c.id);
      let interacaoMap: Record<string, string> = {};
      if (chamadoIds.length > 0) {
        const { data: historicos } = await supabase
          .from('chamados_historico')
          .select('chamado_id, created_at')
          .in('chamado_id', chamadoIds)
          .order('created_at', { ascending: false });
        
        (historicos || []).forEach(h => {
          if (!interacaoMap[h.chamado_id]) {
            interacaoMap[h.chamado_id] = h.created_at;
          }
        });
      }

      const dashboardItems: DashboardItem[] = [];

      // Map chamados
      (chamados || []).forEach(c => {
        const ultimaInteracao = interacaoMap[c.id];
        const { level, diasAberto, diasSemInteracao } = calcSLA(c.data_abertura, c.sla_horas, ultimaInteracao);
        dashboardItems.push({
          id: c.id,
          tipo: 'chamado',
          numero: c.numero,
          titulo: c.titulo,
          descricao: c.descricao || undefined,
          status: c.status,
          prioridade: c.prioridade,
          cliente_nome: (c.cliente as any)?.nome_empresa || '-',
          cliente_id: (c.cliente as any)?.id || '',
          data_abertura: c.data_abertura,
          ultima_interacao: ultimaInteracao,
          sla_horas: c.sla_horas || undefined,
          sla_level: level,
          dias_aberto: diasAberto,
          dias_sem_interacao: diasSemInteracao,
        });
      });

      // Map OS
      (ordens || []).forEach(os => {
        const chamado = os.chamado as any;
        const dataRef = chamado?.data_abertura || os.data_inicio || os.created_at;
        const { level, diasAberto, diasSemInteracao } = calcSLA(dataRef, chamado?.sla_horas || null);
        dashboardItems.push({
          id: os.id,
          tipo: 'os',
          numero: os.numero,
          chamado_numero: chamado?.numero,
          chamado_id: os.chamado_id || undefined,
          titulo: os.descricao_servico || `OS #${os.numero}`,
          status: os.status,
          prioridade: chamado?.prioridade || undefined,
          cliente_nome: (os.cliente as any)?.nome_empresa || '-',
          cliente_id: (os.cliente as any)?.id || '',
          data_abertura: dataRef,
          sla_horas: chamado?.sla_horas || undefined,
          sla_level: level,
          dias_aberto: diasAberto,
          dias_sem_interacao: diasSemInteracao,
        });
      });

      setItems(dashboardItems);
    } catch (error) {
      console.error('Erro ao carregar dashboard do técnico:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Unique clients for filter
  const clientes = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach(i => map.set(i.cliente_id, i.cliente_nome));
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [items]);

  // Filter + sort
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filters.status !== 'todos') {
      result = result.filter(i => i.status === filters.status);
    }
    if (filters.cliente !== 'todos') {
      result = result.filter(i => i.cliente_id === filters.cliente);
    }
    if (filters.sla !== 'todos') {
      result = result.filter(i => i.sla_level === filters.sla);
    }
    if (filters.tipo !== 'todos') {
      result = result.filter(i => i.tipo === filters.tipo);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(i => 
        i.titulo.toLowerCase().includes(term) ||
        i.cliente_nome.toLowerCase().includes(term) ||
        i.numero.toString().includes(term)
      );
    }

    // Sort
    const slaOrder: Record<SLALevel, number> = { critico: 0, alerta: 1, normal: 2 };
    result.sort((a, b) => {
      switch (sortBy) {
        case 'mais_antigo':
          return new Date(a.data_abertura).getTime() - new Date(b.data_abertura).getTime();
        case 'mais_critico':
          return slaOrder[a.sla_level] - slaOrder[b.sla_level] || 
                 new Date(a.data_abertura).getTime() - new Date(b.data_abertura).getTime();
        case 'ultima_interacao':
          const aInt = a.ultima_interacao ? new Date(a.ultima_interacao).getTime() : 0;
          const bInt = b.ultima_interacao ? new Date(b.ultima_interacao).getTime() : 0;
          return aInt - bInt; // oldest interaction first
        default:
          return 0;
      }
    });

    return result;
  }, [items, filters, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    criticos: items.filter(i => i.sla_level === 'critico').length,
    alertas: items.filter(i => i.sla_level === 'alerta').length,
    abertos: items.filter(i => i.status === 'aberto' || i.status === 'aberta').length,
    emAtendimento: items.filter(i => i.status === 'em_atendimento' || i.status === 'em_execucao').length,
    aguardando: items.filter(i => i.status === 'aguardando_cliente').length,
  }), [items]);

  return {
    items: filteredItems,
    allItems: items,
    loading,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    clientes,
    stats,
    refresh: fetchData,
  };
}
