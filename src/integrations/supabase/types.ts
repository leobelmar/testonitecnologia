export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          acao: string
          created_at: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          detalhes: string | null
          id: string
          ip_address: string | null
          registro_id: string | null
          tabela: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_nome: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          detalhes?: string | null
          id?: string
          ip_address?: string | null
          registro_id?: string | null
          tabela?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_nome?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          detalhes?: string | null
          id?: string
          ip_address?: string | null
          registro_id?: string | null
          tabela?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_nome?: string | null
        }
        Relationships: []
      }
      chamados: {
        Row: {
          atribuido_a: string | null
          cliente_id: string
          created_at: string
          created_by: string
          data_abertura: string
          data_fechamento: string | null
          descricao: string | null
          id: string
          numero: number
          prioridade: Database["public"]["Enums"]["chamado_prioridade"]
          sla_horas: number | null
          status: Database["public"]["Enums"]["chamado_status"]
          tipo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          atribuido_a?: string | null
          cliente_id: string
          created_at?: string
          created_by: string
          data_abertura?: string
          data_fechamento?: string | null
          descricao?: string | null
          id?: string
          numero?: number
          prioridade?: Database["public"]["Enums"]["chamado_prioridade"]
          sla_horas?: number | null
          status?: Database["public"]["Enums"]["chamado_status"]
          tipo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          atribuido_a?: string | null
          cliente_id?: string
          created_at?: string
          created_by?: string
          data_abertura?: string
          data_fechamento?: string | null
          descricao?: string | null
          id?: string
          numero?: number
          prioridade?: Database["public"]["Enums"]["chamado_prioridade"]
          sla_horas?: number | null
          status?: Database["public"]["Enums"]["chamado_status"]
          tipo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chamados_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      chamados_anexos: {
        Row: {
          chamado_id: string
          created_at: string
          id: string
          nome_arquivo: string
          tamanho_bytes: number | null
          tipo_mime: string | null
          uploaded_by: string
          url: string
        }
        Insert: {
          chamado_id: string
          created_at?: string
          id?: string
          nome_arquivo: string
          tamanho_bytes?: number | null
          tipo_mime?: string | null
          uploaded_by: string
          url: string
        }
        Update: {
          chamado_id?: string
          created_at?: string
          id?: string
          nome_arquivo?: string
          tamanho_bytes?: number | null
          tipo_mime?: string | null
          uploaded_by?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "chamados_anexos_chamado_id_fkey"
            columns: ["chamado_id"]
            isOneToOne: false
            referencedRelation: "chamados"
            referencedColumns: ["id"]
          },
        ]
      }
      chamados_historico: {
        Row: {
          chamado_id: string
          conteudo: string | null
          created_at: string
          id: string
          status_anterior: Database["public"]["Enums"]["chamado_status"] | null
          status_novo: Database["public"]["Enums"]["chamado_status"] | null
          tipo: string
          user_id: string
        }
        Insert: {
          chamado_id: string
          conteudo?: string | null
          created_at?: string
          id?: string
          status_anterior?: Database["public"]["Enums"]["chamado_status"] | null
          status_novo?: Database["public"]["Enums"]["chamado_status"] | null
          tipo?: string
          user_id: string
        }
        Update: {
          chamado_id?: string
          conteudo?: string | null
          created_at?: string
          id?: string
          status_anterior?: Database["public"]["Enums"]["chamado_status"] | null
          status_novo?: Database["public"]["Enums"]["chamado_status"] | null
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chamados_historico_chamado_id_fkey"
            columns: ["chamado_id"]
            isOneToOne: false
            referencedRelation: "chamados"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_usuarios: {
        Row: {
          cliente_id: string
          created_at: string
          id: string
          is_primary: boolean
          user_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          user_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_usuarios_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cep: string | null
          cidade: string | null
          cnpj_cpf: string | null
          contato_principal: string | null
          created_at: string
          created_by: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome_empresa: string
          observacoes: string | null
          plano_id: string | null
          status: Database["public"]["Enums"]["cliente_status"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cnpj_cpf?: string | null
          contato_principal?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome_empresa: string
          observacoes?: string | null
          plano_id?: string | null
          status?: Database["public"]["Enums"]["cliente_status"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cnpj_cpf?: string | null
          contato_principal?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome_empresa?: string
          observacoes?: string | null
          plano_id?: string | null
          status?: Database["public"]["Enums"]["cliente_status"]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      convites: {
        Row: {
          accepted_at: string | null
          cliente_id: string | null
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["convite_status"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          cliente_id?: string | null
          created_at?: string
          created_by: string
          email: string
          expires_at: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["convite_status"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          cliente_id?: string | null
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["convite_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "convites_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas: {
        Row: {
          categoria: string | null
          created_at: string
          created_by: string
          data: string
          data_pagamento: string | null
          descricao: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          pago: boolean
          updated_at: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          created_by: string
          data?: string
          data_pagamento?: string | null
          descricao: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          pago?: boolean
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          created_by?: string
          data?: string
          data_pagamento?: string | null
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          pago?: boolean
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      faturas: {
        Row: {
          cliente_id: string
          created_at: string
          created_by: string
          data_emissao: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string | null
          forma_pagamento: string | null
          id: string
          numero: number
          observacoes: string | null
          os_id: string | null
          status: Database["public"]["Enums"]["fatura_status"]
          updated_at: string
          valor_total: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          created_by: string
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          numero?: number
          observacoes?: string | null
          os_id?: string | null
          status?: Database["public"]["Enums"]["fatura_status"]
          updated_at?: string
          valor_total: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          created_by?: string
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          numero?: number
          observacoes?: string | null
          os_id?: string | null
          status?: Database["public"]["Enums"]["fatura_status"]
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          assinatura_url: string | null
          chamado_id: string | null
          cliente_id: string
          created_at: string
          created_by: string
          data_fim: string | null
          data_inicio: string | null
          descricao_servico: string | null
          horas_trabalhadas: number | null
          id: string
          materiais_usados: string | null
          numero: number
          observacoes: string | null
          servicos_realizados: string | null
          status: Database["public"]["Enums"]["os_status"]
          tecnico_id: string | null
          updated_at: string
          valor_mao_obra: number | null
          valor_materiais: number | null
          valor_total: number | null
        }
        Insert: {
          assinatura_url?: string | null
          chamado_id?: string | null
          cliente_id: string
          created_at?: string
          created_by: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao_servico?: string | null
          horas_trabalhadas?: number | null
          id?: string
          materiais_usados?: string | null
          numero?: number
          observacoes?: string | null
          servicos_realizados?: string | null
          status?: Database["public"]["Enums"]["os_status"]
          tecnico_id?: string | null
          updated_at?: string
          valor_mao_obra?: number | null
          valor_materiais?: number | null
          valor_total?: number | null
        }
        Update: {
          assinatura_url?: string | null
          chamado_id?: string | null
          cliente_id?: string
          created_at?: string
          created_by?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao_servico?: string | null
          horas_trabalhadas?: number | null
          id?: string
          materiais_usados?: string | null
          numero?: number
          observacoes?: string | null
          servicos_realizados?: string | null
          status?: Database["public"]["Enums"]["os_status"]
          tecnico_id?: string | null
          updated_at?: string
          valor_mao_obra?: number | null
          valor_materiais?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_chamado_id_fkey"
            columns: ["chamado_id"]
            isOneToOne: false
            referencedRelation: "chamados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      planos: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
          valor_mensal: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
          valor_mensal?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
          valor_mensal?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          nome: string
          role: Database["public"]["Enums"]["app_role"]
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          nome: string
          role?: Database["public"]["Enums"]["app_role"]
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["app_role"]
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_chamado: {
        Args: { target_chamado_id: string; target_user_id?: string }
        Returns: boolean
      }
      can_access_fatura: {
        Args: { target_fatura_id: string; target_user_id?: string }
        Returns: boolean
      }
      can_access_os: {
        Args: { target_os_id: string; target_user_id?: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { target_user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: { Args: { target_user_id?: string }; Returns: boolean }
      is_financeiro: { Args: { target_user_id?: string }; Returns: boolean }
      is_tecnico: { Args: { target_user_id?: string }; Returns: boolean }
      user_belongs_to_cliente: {
        Args: { target_cliente_id: string; target_user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "tecnico" | "financeiro" | "cliente"
      chamado_prioridade: "baixa" | "media" | "alta" | "urgente"
      chamado_status:
        | "aberto"
        | "em_atendimento"
        | "aguardando_cliente"
        | "aguardando_terceiros"
        | "finalizado"
        | "cancelado"
      cliente_status: "ativo" | "inativo"
      convite_status: "pendente" | "aceito" | "expirado" | "cancelado"
      fatura_status: "em_aberto" | "pago" | "atrasado"
      os_status: "aberta" | "em_execucao" | "finalizada" | "faturada" | "pago"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "tecnico", "financeiro", "cliente"],
      chamado_prioridade: ["baixa", "media", "alta", "urgente"],
      chamado_status: [
        "aberto",
        "em_atendimento",
        "aguardando_cliente",
        "aguardando_terceiros",
        "finalizado",
        "cancelado",
      ],
      cliente_status: ["ativo", "inativo"],
      convite_status: ["pendente", "aceito", "expirado", "cancelado"],
      fatura_status: ["em_aberto", "pago", "atrasado"],
      os_status: ["aberta", "em_execucao", "finalizada", "faturada", "pago"],
    },
  },
} as const
