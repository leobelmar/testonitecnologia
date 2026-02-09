
-- Tabela de auditoria
CREATE TABLE public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    user_email text,
    user_nome text,
    acao text NOT NULL, -- 'login', 'insert', 'update', 'delete'
    tabela text, -- tabela afetada
    registro_id text, -- id do registro afetado
    dados_anteriores jsonb,
    dados_novos jsonb,
    ip_address text,
    user_agent text,
    detalhes text, -- descrição legível
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para busca
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_acao ON public.audit_logs(acao);
CREATE INDEX idx_audit_logs_tabela ON public.audit_logs(tabela);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit: admin pode ver" ON public.audit_logs
FOR SELECT USING (is_admin());

CREATE POLICY "Audit: sistema pode inserir" ON public.audit_logs
FOR INSERT WITH CHECK (true);

-- Função genérica de auditoria para triggers
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_email text;
    v_nome text;
    v_acao text;
    v_registro_id text;
    v_dados_ant jsonb;
    v_dados_nov jsonb;
    v_detalhes text;
BEGIN
    v_user_id := auth.uid();
    
    SELECT email, nome INTO v_email, v_nome
    FROM public.profiles WHERE user_id = v_user_id LIMIT 1;

    IF TG_OP = 'INSERT' THEN
        v_acao := 'insert';
        v_registro_id := NEW.id::text;
        v_dados_nov := to_jsonb(NEW);
        v_detalhes := 'Registro criado em ' || TG_TABLE_NAME;
    ELSIF TG_OP = 'UPDATE' THEN
        v_acao := 'update';
        v_registro_id := NEW.id::text;
        v_dados_ant := to_jsonb(OLD);
        v_dados_nov := to_jsonb(NEW);
        v_detalhes := 'Registro atualizado em ' || TG_TABLE_NAME;
    ELSIF TG_OP = 'DELETE' THEN
        v_acao := 'delete';
        v_registro_id := OLD.id::text;
        v_dados_ant := to_jsonb(OLD);
        v_detalhes := 'Registro excluído de ' || TG_TABLE_NAME;
    END IF;

    INSERT INTO public.audit_logs (user_id, user_email, user_nome, acao, tabela, registro_id, dados_anteriores, dados_novos, detalhes)
    VALUES (v_user_id, v_email, v_nome, v_acao, TG_TABLE_NAME, v_registro_id, v_dados_ant, v_dados_nov, v_detalhes);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

-- Triggers nas tabelas principais
CREATE TRIGGER audit_chamados AFTER INSERT OR UPDATE OR DELETE ON public.chamados FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_clientes AFTER INSERT OR UPDATE OR DELETE ON public.clientes FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_ordens_servico AFTER INSERT OR UPDATE OR DELETE ON public.ordens_servico FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_faturas AFTER INSERT OR UPDATE OR DELETE ON public.faturas FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_despesas AFTER INSERT OR UPDATE OR DELETE ON public.despesas FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_convites AFTER INSERT OR UPDATE OR DELETE ON public.convites FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_planos AFTER INSERT OR UPDATE OR DELETE ON public.planos FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
