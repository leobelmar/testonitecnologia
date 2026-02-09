import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ModuleName =
  | 'dashboard'
  | 'clientes'
  | 'novo_cliente'
  | 'chamados'
  | 'ordens_servico'
  | 'contratos'
  | 'estoque'
  | 'financeiro'
  | 'faturamento'
  | 'relatorios'
  | 'configuracoes'
  | 'usuarios'
  | 'auditoria'
  | 'tecnicos';

export interface PerfilPermissao {
  id: string;
  nome: string;
  descricao: string | null;
  is_admin: boolean;
  editavel: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissaoModulo {
  id: string;
  perfil_id: string;
  modulo: string;
  leitura: boolean;
  edicao: boolean;
}

interface PermissionsState {
  perfil: PerfilPermissao | null;
  permissoes: PermissaoModulo[];
  loading: boolean;
}

export function usePermissions() {
  const { profile, isCliente } = useAuth();
  const [state, setState] = useState<PermissionsState>({
    perfil: null,
    permissoes: [],
    loading: true,
  });

  useEffect(() => {
    if (!profile) {
      setState({ perfil: null, permissoes: [], loading: false });
      return;
    }

    // Clientes têm acesso fixo, não usam o sistema de permissões
    if (isCliente) {
      setState({ perfil: null, permissoes: [], loading: false });
      return;
    }

    const perfilId = profile.perfil_permissao_id;
    if (!perfilId) {
      setState({ perfil: null, permissoes: [], loading: false });
      return;
    }

    const fetchPermissions = async () => {
      try {
        const [perfilRes, permissoesRes] = await Promise.all([
          supabase
            .from('perfis_permissao')
            .select('*')
            .eq('id', perfilId)
            .single(),
          supabase
            .from('permissoes_modulo')
            .select('*')
            .eq('perfil_id', perfilId),
        ]);

        setState({
          perfil: perfilRes.data as unknown as PerfilPermissao,
          permissoes: (permissoesRes.data || []) as unknown as PermissaoModulo[],
          loading: false,
        });
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
        setState({ perfil: null, permissoes: [], loading: false });
      }
    };

    fetchPermissions();
  }, [profile, isCliente]);

  const canRead = useCallback(
    (modulo: ModuleName): boolean => {
      if (isCliente) return false; // Clientes têm acesso próprio
      if (!state.perfil) return false;
      if (state.perfil.is_admin) return true;
      const perm = state.permissoes.find((p) => p.modulo === modulo);
      return perm?.leitura ?? false;
    },
    [state.perfil, state.permissoes, isCliente]
  );

  const canEdit = useCallback(
    (modulo: ModuleName): boolean => {
      if (isCliente) return false;
      if (!state.perfil) return false;
      if (state.perfil.is_admin) return true;
      const perm = state.permissoes.find((p) => p.modulo === modulo);
      return perm?.edicao ?? false;
    },
    [state.perfil, state.permissoes, isCliente]
  );

  const isAdmin = state.perfil?.is_admin ?? false;

  return {
    perfil: state.perfil,
    permissoes: state.permissoes,
    loading: state.loading,
    canRead,
    canEdit,
    isAdmin,
  };
}

// Módulos disponíveis para configuração
export const MODULOS_DISPONIVEIS: { key: ModuleName; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'clientes', label: 'Clientes' },
  { key: 'novo_cliente', label: 'Novo Cliente' },
  { key: 'chamados', label: 'Chamados' },
  { key: 'ordens_servico', label: 'Ordens de Serviço' },
  { key: 'contratos', label: 'Contratos' },
  { key: 'estoque', label: 'Estoque' },
  { key: 'financeiro', label: 'Financeiro' },
  { key: 'faturamento', label: 'Faturamento' },
  { key: 'relatorios', label: 'Relatórios' },
  { key: 'configuracoes', label: 'Configurações' },
  { key: 'usuarios', label: 'Usuários' },
  { key: 'auditoria', label: 'Auditoria' },
  { key: 'tecnicos', label: 'Técnicos' },
];
