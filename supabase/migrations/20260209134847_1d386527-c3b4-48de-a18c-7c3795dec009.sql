
-- Enum de status do contrato
CREATE TYPE public.contrato_status AS ENUM ('ativo', 'suspenso', 'cancelado', 'encerrado');

-- Enum de status do período
CREATE TYPE public.periodo_status AS ENUM ('ativo', 'fechado', 'faturado');

-- Tabela de contratos
CREATE TABLE public.contratos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    numero serial NOT NULL,
    cliente_id uuid NOT NULL REFERENCES public.clientes(id),
    valor_mensal numeric NOT NULL DEFAULT 0,
    horas_inclusas numeric NOT NULL DEFAULT 0,
    vigencia_inicio date NOT NULL,
    vigencia_fim date,
    status contrato_status NOT NULL DEFAULT 'ativo',
    observacoes text,
    created_by uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tipos de hora do contrato (remota, presencial, urgente, etc.)
CREATE TABLE public.contrato_tipos_hora (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contrato_id uuid NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
    nome text NOT NULL, -- ex: 'Remota', 'Presencial', 'Urgente'
    valor_hora_extra numeric NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Períodos mensais do contrato
CREATE TABLE public.contrato_periodos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contrato_id uuid NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
    mes_referencia date NOT NULL, -- primeiro dia do mês (2026-02-01)
    horas_inclusas numeric NOT NULL DEFAULT 0,
    total_horas_usadas numeric NOT NULL DEFAULT 0,
    horas_excedentes numeric NOT NULL DEFAULT 0,
    total_atendimentos integer NOT NULL DEFAULT 0,
    total_os integer NOT NULL DEFAULT 0,
    valor_horas_extras numeric NOT NULL DEFAULT 0,
    valor_materiais numeric NOT NULL DEFAULT 0,
    valor_total numeric NOT NULL DEFAULT 0,
    status periodo_status NOT NULL DEFAULT 'ativo',
    fechado_em timestamptz,
    fechado_por uuid,
    aprovado_em timestamptz,
    aprovado_por uuid,
    fatura_id uuid REFERENCES public.faturas(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(contrato_id, mes_referencia)
);

-- Horas usadas por tipo no período
CREATE TABLE public.contrato_periodo_horas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    periodo_id uuid NOT NULL REFERENCES public.contrato_periodos(id) ON DELETE CASCADE,
    tipo_hora_id uuid NOT NULL REFERENCES public.contrato_tipos_hora(id),
    horas numeric NOT NULL DEFAULT 0,
    valor_hora_extra numeric NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Vincular OS ao contrato
ALTER TABLE public.ordens_servico ADD COLUMN contrato_id uuid REFERENCES public.contratos(id);
ALTER TABLE public.ordens_servico ADD COLUMN tipo_hora_id uuid REFERENCES public.contrato_tipos_hora(id);

-- Índices
CREATE INDEX idx_contratos_cliente ON public.contratos(cliente_id);
CREATE INDEX idx_contratos_status ON public.contratos(status);
CREATE INDEX idx_contrato_periodos_contrato ON public.contrato_periodos(contrato_id);
CREATE INDEX idx_contrato_periodos_mes ON public.contrato_periodos(mes_referencia);
CREATE INDEX idx_os_contrato ON public.ordens_servico(contrato_id);

-- Triggers de updated_at
CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON public.contratos
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contrato_periodos_updated_at BEFORE UPDATE ON public.contrato_periodos
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contrato_tipos_hora ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contrato_periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contrato_periodo_horas ENABLE ROW LEVEL SECURITY;

-- Contratos: admin/financeiro vê todos, cliente vê os seus
CREATE POLICY "Contratos: ver por função" ON public.contratos
FOR SELECT USING (is_admin() OR is_financeiro() OR user_belongs_to_cliente(cliente_id));

CREATE POLICY "Contratos: admin pode criar" ON public.contratos
FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Contratos: admin pode atualizar" ON public.contratos
FOR UPDATE USING (is_admin());

CREATE POLICY "Contratos: admin pode deletar" ON public.contratos
FOR DELETE USING (is_admin());

-- Tipos de hora: mesma visibilidade do contrato
CREATE POLICY "TiposHora: ver via contrato" ON public.contrato_tipos_hora
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.contratos c WHERE c.id = contrato_id AND (is_admin() OR is_financeiro() OR user_belongs_to_cliente(c.cliente_id)))
);

CREATE POLICY "TiposHora: admin pode criar" ON public.contrato_tipos_hora
FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "TiposHora: admin pode atualizar" ON public.contrato_tipos_hora
FOR UPDATE USING (is_admin());

CREATE POLICY "TiposHora: admin pode deletar" ON public.contrato_tipos_hora
FOR DELETE USING (is_admin());

-- Períodos: mesma visibilidade do contrato
CREATE POLICY "Periodos: ver via contrato" ON public.contrato_periodos
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.contratos c WHERE c.id = contrato_id AND (is_admin() OR is_financeiro() OR user_belongs_to_cliente(c.cliente_id)))
);

CREATE POLICY "Periodos: admin/financeiro pode criar" ON public.contrato_periodos
FOR INSERT WITH CHECK (is_admin() OR is_financeiro());

CREATE POLICY "Periodos: admin/financeiro pode atualizar" ON public.contrato_periodos
FOR UPDATE USING (is_admin() OR is_financeiro());

CREATE POLICY "Periodos: admin pode deletar" ON public.contrato_periodos
FOR DELETE USING (is_admin());

-- Período horas
CREATE POLICY "PeriodoHoras: ver via periodo" ON public.contrato_periodo_horas
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.contrato_periodos p
        JOIN public.contratos c ON c.id = p.contrato_id
        WHERE p.id = periodo_id AND (is_admin() OR is_financeiro() OR user_belongs_to_cliente(c.cliente_id))
    )
);

CREATE POLICY "PeriodoHoras: admin/financeiro pode criar" ON public.contrato_periodo_horas
FOR INSERT WITH CHECK (is_admin() OR is_financeiro());

CREATE POLICY "PeriodoHoras: admin/financeiro pode atualizar" ON public.contrato_periodo_horas
FOR UPDATE USING (is_admin() OR is_financeiro());

CREATE POLICY "PeriodoHoras: admin pode deletar" ON public.contrato_periodo_horas
FOR DELETE USING (is_admin());

-- Auditoria nas novas tabelas
CREATE TRIGGER audit_contratos AFTER INSERT OR UPDATE OR DELETE ON public.contratos FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_contrato_periodos AFTER INSERT OR UPDATE OR DELETE ON public.contrato_periodos FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
