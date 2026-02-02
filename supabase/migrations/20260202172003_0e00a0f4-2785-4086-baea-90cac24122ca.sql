-- =============================================
-- SISTEMA HELP DESK - TESTONI TECNOLOGIA
-- =============================================

-- 1. ENUM TYPES
-- =============================================

CREATE TYPE public.app_role AS ENUM ('admin', 'tecnico', 'financeiro', 'cliente');
CREATE TYPE public.cliente_status AS ENUM ('ativo', 'inativo');
CREATE TYPE public.chamado_prioridade AS ENUM ('baixa', 'media', 'alta', 'urgente');
CREATE TYPE public.chamado_status AS ENUM ('aberto', 'em_atendimento', 'aguardando_cliente', 'aguardando_terceiros', 'finalizado', 'cancelado');
CREATE TYPE public.os_status AS ENUM ('aberta', 'em_execucao', 'finalizada', 'faturada');
CREATE TYPE public.fatura_status AS ENUM ('em_aberto', 'pago', 'atrasado');
CREATE TYPE public.convite_status AS ENUM ('pendente', 'aceito', 'expirado', 'cancelado');

-- 2. TABLES
-- =============================================

-- Planos de serviço
CREATE TABLE public.planos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    valor_mensal DECIMAL(10,2) NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles de usuários (vinculado ao auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role app_role NOT NULL DEFAULT 'cliente',
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    avatar_url TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clientes (empresas ou pessoas)
CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_empresa TEXT NOT NULL,
    cnpj_cpf TEXT,
    contato_principal TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    plano_id UUID REFERENCES public.planos(id),
    status cliente_status NOT NULL DEFAULT 'ativo',
    observacoes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vinculação de usuários a clientes (para clientes com múltiplos usuários)
CREATE TABLE public.cliente_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(cliente_id, user_id)
);

-- Convites de usuários
CREATE TABLE public.convites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role app_role NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    status convite_status NOT NULL DEFAULT 'pendente',
    expires_at TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at TIMESTAMPTZ
);

-- Chamados / Tickets
CREATE TABLE public.chamados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero SERIAL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT,
    prioridade chamado_prioridade NOT NULL DEFAULT 'media',
    status chamado_status NOT NULL DEFAULT 'aberto',
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    atribuido_a UUID REFERENCES auth.users(id),
    data_abertura TIMESTAMPTZ NOT NULL DEFAULT now(),
    data_fechamento TIMESTAMPTZ,
    sla_horas INTEGER DEFAULT 24,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Anexos de chamados
CREATE TABLE public.chamados_anexos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chamado_id UUID REFERENCES public.chamados(id) ON DELETE CASCADE NOT NULL,
    nome_arquivo TEXT NOT NULL,
    url TEXT NOT NULL,
    tipo_mime TEXT,
    tamanho_bytes BIGINT,
    uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Histórico / Comentários de chamados
CREATE TABLE public.chamados_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chamado_id UUID REFERENCES public.chamados(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'comentario', -- comentario, status_change, atribuicao
    conteudo TEXT,
    status_anterior chamado_status,
    status_novo chamado_status,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ordens de Serviço
CREATE TABLE public.ordens_servico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero SERIAL,
    chamado_id UUID REFERENCES public.chamados(id),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
    tecnico_id UUID REFERENCES auth.users(id),
    descricao_servico TEXT,
    servicos_realizados TEXT,
    horas_trabalhadas DECIMAL(6,2) DEFAULT 0,
    materiais_usados TEXT,
    valor_materiais DECIMAL(10,2) DEFAULT 0,
    valor_mao_obra DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) DEFAULT 0,
    data_inicio TIMESTAMPTZ,
    data_fim TIMESTAMPTZ,
    assinatura_url TEXT,
    observacoes TEXT,
    status os_status NOT NULL DEFAULT 'aberta',
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Faturas
CREATE TABLE public.faturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero SERIAL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
    os_id UUID REFERENCES public.ordens_servico(id),
    descricao TEXT,
    valor_total DECIMAL(10,2) NOT NULL,
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    forma_pagamento TEXT,
    status fatura_status NOT NULL DEFAULT 'em_aberto',
    data_pagamento DATE,
    observacoes TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEXES
-- =============================================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_clientes_status ON public.clientes(status);
CREATE INDEX idx_clientes_cnpj_cpf ON public.clientes(cnpj_cpf);
CREATE INDEX idx_cliente_usuarios_user ON public.cliente_usuarios(user_id);
CREATE INDEX idx_cliente_usuarios_cliente ON public.cliente_usuarios(cliente_id);
CREATE INDEX idx_chamados_cliente ON public.chamados(cliente_id);
CREATE INDEX idx_chamados_status ON public.chamados(status);
CREATE INDEX idx_chamados_atribuido ON public.chamados(atribuido_a);
CREATE INDEX idx_chamados_created_by ON public.chamados(created_by);
CREATE INDEX idx_ordens_servico_cliente ON public.ordens_servico(cliente_id);
CREATE INDEX idx_ordens_servico_tecnico ON public.ordens_servico(tecnico_id);
CREATE INDEX idx_ordens_servico_status ON public.ordens_servico(status);
CREATE INDEX idx_faturas_cliente ON public.faturas(cliente_id);
CREATE INDEX idx_faturas_status ON public.faturas(status);
CREATE INDEX idx_faturas_vencimento ON public.faturas(data_vencimento);
CREATE INDEX idx_convites_token ON public.convites(token);
CREATE INDEX idx_convites_email ON public.convites(email);

-- 4. SECURITY HELPER FUNCTIONS
-- =============================================

-- Função para obter role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE user_id = target_user_id LIMIT 1;
$$;

-- Verifica se é admin
CREATE OR REPLACE FUNCTION public.is_admin(target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = target_user_id AND role = 'admin'
    );
$$;

-- Verifica se é técnico
CREATE OR REPLACE FUNCTION public.is_tecnico(target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = target_user_id AND role = 'tecnico'
    );
$$;

-- Verifica se é financeiro
CREATE OR REPLACE FUNCTION public.is_financeiro(target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = target_user_id AND role = 'financeiro'
    );
$$;

-- Verifica se usuário pertence a um cliente
CREATE OR REPLACE FUNCTION public.user_belongs_to_cliente(target_cliente_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.cliente_usuarios 
        WHERE cliente_id = target_cliente_id AND user_id = target_user_id
    );
$$;

-- Verifica se pode acessar chamado
CREATE OR REPLACE FUNCTION public.can_access_chamado(target_chamado_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.chamados c
        WHERE c.id = target_chamado_id
        AND (
            -- Admin pode tudo
            public.is_admin(target_user_id)
            -- Criador do chamado
            OR c.created_by = target_user_id
            -- Técnico atribuído
            OR c.atribuido_a = target_user_id
            -- Usuário do cliente
            OR public.user_belongs_to_cliente(c.cliente_id, target_user_id)
        )
    );
$$;

-- Verifica se pode acessar OS
CREATE OR REPLACE FUNCTION public.can_access_os(target_os_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.ordens_servico os
        WHERE os.id = target_os_id
        AND (
            -- Admin pode tudo
            public.is_admin(target_user_id)
            -- Técnico responsável
            OR os.tecnico_id = target_user_id
            -- Criador
            OR os.created_by = target_user_id
            -- Usuário do cliente
            OR public.user_belongs_to_cliente(os.cliente_id, target_user_id)
        )
    );
$$;

-- Verifica se pode acessar fatura
CREATE OR REPLACE FUNCTION public.can_access_fatura(target_fatura_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.faturas f
        WHERE f.id = target_fatura_id
        AND (
            -- Admin pode tudo
            public.is_admin(target_user_id)
            -- Financeiro pode tudo
            OR public.is_financeiro(target_user_id)
            -- Usuário do cliente
            OR public.user_belongs_to_cliente(f.cliente_id, target_user_id)
        )
    );
$$;

-- 5. TRIGGER FUNCTIONS
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Triggers para updated_at
CREATE TRIGGER update_planos_updated_at BEFORE UPDATE ON public.planos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_chamados_updated_at BEFORE UPDATE ON public.chamados FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON public.ordens_servico FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_faturas_updated_at BEFORE UPDATE ON public.faturas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger para registrar mudança de status do chamado
CREATE OR REPLACE FUNCTION public.log_chamado_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.chamados_historico (chamado_id, user_id, tipo, status_anterior, status_novo, conteudo)
        VALUES (NEW.id, auth.uid(), 'status_change', OLD.status, NEW.status, 
                'Status alterado de ' || OLD.status || ' para ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER chamado_status_change_trigger 
AFTER UPDATE ON public.chamados 
FOR EACH ROW 
EXECUTE FUNCTION public.log_chamado_status_change();

-- 6. ENABLE RLS
-- =============================================

ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliente_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamados_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamados_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES
-- =============================================

-- PLANOS: Todos podem ver, só admin modifica
CREATE POLICY "Planos: todos podem ver" ON public.planos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Planos: admin pode inserir" ON public.planos FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Planos: admin pode atualizar" ON public.planos FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Planos: admin pode deletar" ON public.planos FOR DELETE TO authenticated USING (public.is_admin());

-- PROFILES
CREATE POLICY "Profiles: ver próprio ou admin" ON public.profiles FOR SELECT TO authenticated 
    USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Profiles: inserir próprio" ON public.profiles FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "Profiles: atualizar próprio ou admin" ON public.profiles FOR UPDATE TO authenticated 
    USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Profiles: admin pode deletar" ON public.profiles FOR DELETE TO authenticated 
    USING (public.is_admin());

-- CLIENTES
CREATE POLICY "Clientes: admin vê todos" ON public.clientes FOR SELECT TO authenticated 
    USING (public.is_admin() OR public.is_financeiro() OR public.is_tecnico() OR public.user_belongs_to_cliente(id));
CREATE POLICY "Clientes: admin/financeiro pode inserir" ON public.clientes FOR INSERT TO authenticated 
    WITH CHECK (public.is_admin() OR public.is_financeiro());
CREATE POLICY "Clientes: admin/financeiro pode atualizar" ON public.clientes FOR UPDATE TO authenticated 
    USING (public.is_admin() OR public.is_financeiro());
CREATE POLICY "Clientes: admin pode deletar" ON public.clientes FOR DELETE TO authenticated 
    USING (public.is_admin());

-- CLIENTE_USUARIOS
CREATE POLICY "ClienteUsuarios: admin vê todos" ON public.cliente_usuarios FOR SELECT TO authenticated 
    USING (public.is_admin() OR user_id = auth.uid());
CREATE POLICY "ClienteUsuarios: admin pode inserir" ON public.cliente_usuarios FOR INSERT TO authenticated 
    WITH CHECK (public.is_admin());
CREATE POLICY "ClienteUsuarios: admin pode atualizar" ON public.cliente_usuarios FOR UPDATE TO authenticated 
    USING (public.is_admin());
CREATE POLICY "ClienteUsuarios: admin pode deletar" ON public.cliente_usuarios FOR DELETE TO authenticated 
    USING (public.is_admin());

-- CONVITES
CREATE POLICY "Convites: admin vê todos" ON public.convites FOR SELECT TO authenticated 
    USING (public.is_admin() OR created_by = auth.uid());
CREATE POLICY "Convites: admin pode criar" ON public.convites FOR INSERT TO authenticated 
    WITH CHECK (public.is_admin());
CREATE POLICY "Convites: admin pode atualizar" ON public.convites FOR UPDATE TO authenticated 
    USING (public.is_admin());
CREATE POLICY "Convites: admin pode deletar" ON public.convites FOR DELETE TO authenticated 
    USING (public.is_admin());

-- CHAMADOS
CREATE POLICY "Chamados: acesso por função" ON public.chamados FOR SELECT TO authenticated 
    USING (
        public.is_admin() 
        OR public.is_financeiro()
        OR (public.is_tecnico() AND (atribuido_a = auth.uid() OR atribuido_a IS NULL))
        OR public.user_belongs_to_cliente(cliente_id)
        OR created_by = auth.uid()
    );
CREATE POLICY "Chamados: criar por admin/cliente" ON public.chamados FOR INSERT TO authenticated 
    WITH CHECK (
        public.is_admin() 
        OR public.user_belongs_to_cliente(cliente_id)
    );
CREATE POLICY "Chamados: atualizar por função" ON public.chamados FOR UPDATE TO authenticated 
    USING (
        public.is_admin() 
        OR (public.is_tecnico() AND atribuido_a = auth.uid())
        OR public.user_belongs_to_cliente(cliente_id)
    );
CREATE POLICY "Chamados: admin pode deletar" ON public.chamados FOR DELETE TO authenticated 
    USING (public.is_admin());

-- CHAMADOS_ANEXOS
CREATE POLICY "Anexos: acesso via chamado" ON public.chamados_anexos FOR SELECT TO authenticated 
    USING (public.can_access_chamado(chamado_id));
CREATE POLICY "Anexos: criar via chamado" ON public.chamados_anexos FOR INSERT TO authenticated 
    WITH CHECK (public.can_access_chamado(chamado_id));
CREATE POLICY "Anexos: admin/dono pode deletar" ON public.chamados_anexos FOR DELETE TO authenticated 
    USING (public.is_admin() OR uploaded_by = auth.uid());

-- CHAMADOS_HISTORICO
CREATE POLICY "Historico: acesso via chamado" ON public.chamados_historico FOR SELECT TO authenticated 
    USING (public.can_access_chamado(chamado_id));
CREATE POLICY "Historico: criar via chamado" ON public.chamados_historico FOR INSERT TO authenticated 
    WITH CHECK (public.can_access_chamado(chamado_id));

-- ORDENS_SERVICO
CREATE POLICY "OS: acesso por função" ON public.ordens_servico FOR SELECT TO authenticated 
    USING (
        public.is_admin() 
        OR public.is_financeiro()
        OR (public.is_tecnico() AND tecnico_id = auth.uid())
        OR public.user_belongs_to_cliente(cliente_id)
    );
CREATE POLICY "OS: admin/tecnico pode criar" ON public.ordens_servico FOR INSERT TO authenticated 
    WITH CHECK (public.is_admin() OR public.is_tecnico());
CREATE POLICY "OS: atualizar por função" ON public.ordens_servico FOR UPDATE TO authenticated 
    USING (
        public.is_admin() 
        OR (public.is_tecnico() AND tecnico_id = auth.uid())
        OR public.is_financeiro()
    );
CREATE POLICY "OS: admin pode deletar" ON public.ordens_servico FOR DELETE TO authenticated 
    USING (public.is_admin());

-- FATURAS
CREATE POLICY "Faturas: acesso por função" ON public.faturas FOR SELECT TO authenticated 
    USING (
        public.is_admin() 
        OR public.is_financeiro()
        OR public.user_belongs_to_cliente(cliente_id)
    );
CREATE POLICY "Faturas: admin/financeiro pode criar" ON public.faturas FOR INSERT TO authenticated 
    WITH CHECK (public.is_admin() OR public.is_financeiro());
CREATE POLICY "Faturas: admin/financeiro pode atualizar" ON public.faturas FOR UPDATE TO authenticated 
    USING (public.is_admin() OR public.is_financeiro());
CREATE POLICY "Faturas: admin pode deletar" ON public.faturas FOR DELETE TO authenticated 
    USING (public.is_admin());

-- 8. SEED DATA
-- =============================================

-- Planos padrão
INSERT INTO public.planos (nome, descricao, valor_mensal) VALUES
('Essencial', 'Suporte remoto básico, até 2 chamados/mês', 290.00),
('Profissional', 'Suporte remoto ilimitado + 4h presenciais/mês', 590.00),
('Premium', 'Suporte completo + visitas preventivas mensais', 990.00),
('Corporativo', 'Dedicado para grandes empresas, SLA personalizado', 0.00);