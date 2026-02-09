// Tipos do banco de dados - Help Desk Testoni Tecnologia

export type AppRole = 'admin' | 'tecnico' | 'financeiro' | 'cliente';
export type ClienteStatus = 'ativo' | 'inativo';
export type ChamadoPrioridade = 'baixa' | 'media' | 'alta' | 'urgente';
export type ChamadoStatus = 'aberto' | 'em_atendimento' | 'aguardando_cliente' | 'aguardando_terceiros' | 'finalizado' | 'cancelado';
export type OSStatus = 'aberta' | 'em_execucao' | 'finalizada' | 'faturada' | 'pago';
export type TipoAtendimento = 'remoto' | 'presencial' | 'sla1' | 'sla2' | 'sla3';
export type FaturaStatus = 'em_aberto' | 'pago' | 'atrasado';
export type ConviteStatus = 'pendente' | 'aceito' | 'expirado' | 'cancelado';

export interface Plano {
  id: string;
  nome: string;
  descricao: string | null;
  valor_mensal: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  role: AppRole;
  nome: string;
  email: string;
  telefone: string | null;
  avatar_url: string | null;
  ativo: boolean;
  perfil_permissao_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  nome_empresa: string;
  cnpj_cpf: string | null;
  contato_principal: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  plano_id: string | null;
  status: ClienteStatus;
  observacoes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  plano?: Plano | null;
}

export interface ClienteUsuario {
  id: string;
  cliente_id: string;
  user_id: string;
  is_primary: boolean;
  created_at: string;
}

export interface Convite {
  id: string;
  email: string;
  role: AppRole;
  cliente_id: string | null;
  token: string;
  status: ConviteStatus;
  expires_at: string;
  created_by: string;
  created_at: string;
  accepted_at: string | null;
}

export interface Chamado {
  id: string;
  numero: number;
  cliente_id: string;
  titulo: string;
  descricao: string | null;
  tipo: string | null;
  prioridade: ChamadoPrioridade;
  status: ChamadoStatus;
  created_by: string;
  atribuido_a: string | null;
  data_abertura: string;
  data_fechamento: string | null;
  sla_horas: number | null;
  created_at: string;
  updated_at: string;
  // Joins
  cliente?: Cliente | null;
  criador?: Profile | null;
  tecnico?: Profile | null;
}

export interface ChamadoAnexo {
  id: string;
  chamado_id: string;
  nome_arquivo: string;
  url: string;
  tipo_mime: string | null;
  tamanho_bytes: number | null;
  uploaded_by: string;
  created_at: string;
}

export interface ChamadoHistorico {
  id: string;
  chamado_id: string;
  user_id: string;
  tipo: string;
  conteudo: string | null;
  status_anterior: ChamadoStatus | null;
  status_novo: ChamadoStatus | null;
  created_at: string;
  // Joins
  usuario?: Profile | null;
}

export interface OrdemServico {
  id: string;
  numero: number;
  chamado_id: string | null;
  cliente_id: string;
  tecnico_id: string | null;
  contrato_id: string | null;
  tipo_hora_id: string | null;
  tipo_atendimento: TipoAtendimento | null;
  descricao_servico: string | null;
  servicos_realizados: string | null;
  horas_trabalhadas: number;
  materiais_usados: string | null;
  valor_materiais: number;
  valor_mao_obra: number;
  valor_total: number;
  data_inicio: string | null;
  data_fim: string | null;
  assinatura_url: string | null;
  observacoes: string | null;
  status: OSStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joins
  cliente?: Partial<Cliente> | null;
  chamado?: Partial<Chamado> | null;
  tecnico?: Profile | null;
}

export interface Fatura {
  id: string;
  numero: number;
  cliente_id: string;
  os_id: string | null;
  descricao: string | null;
  valor_total: number;
  data_emissao: string;
  data_vencimento: string;
  forma_pagamento: string | null;
  status: FaturaStatus;
  data_pagamento: string | null;
  observacoes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joins
  cliente?: Cliente | null;
  ordem_servico?: OrdemServico | null;
}

// Tipos para inserção
export interface ClienteInsert {
  nome_empresa: string;
  cnpj_cpf?: string | null;
  contato_principal?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  plano_id?: string | null;
  status?: ClienteStatus;
  observacoes?: string | null;
}

export interface ChamadoInsert {
  cliente_id: string;
  titulo: string;
  descricao?: string | null;
  tipo?: string | null;
  prioridade?: ChamadoPrioridade;
  atribuido_a?: string | null;
  sla_horas?: number | null;
}

export interface ChamadoHistoricoInsert {
  chamado_id: string;
  tipo?: string;
  conteudo?: string | null;
}
