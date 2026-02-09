
-- Tabela de perfis de permissão
CREATE TABLE public.perfis_permissao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  is_admin boolean DEFAULT false,
  editavel boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.perfis_permissao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PerfisPermissao: todos autenticados podem ver" ON public.perfis_permissao FOR SELECT USING (true);
CREATE POLICY "PerfisPermissao: admin pode inserir" ON public.perfis_permissao FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "PerfisPermissao: admin pode atualizar" ON public.perfis_permissao FOR UPDATE USING (is_admin());
CREATE POLICY "PerfisPermissao: admin pode deletar" ON public.perfis_permissao FOR DELETE USING (is_admin());

CREATE TRIGGER update_perfis_permissao_updated_at
  BEFORE UPDATE ON public.perfis_permissao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Tabela de permissões por módulo
CREATE TABLE public.permissoes_modulo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id uuid REFERENCES public.perfis_permissao(id) ON DELETE CASCADE NOT NULL,
  modulo text NOT NULL,
  leitura boolean DEFAULT false,
  edicao boolean DEFAULT false,
  UNIQUE(perfil_id, modulo)
);

ALTER TABLE public.permissoes_modulo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PermissoesModulo: todos autenticados podem ver" ON public.permissoes_modulo FOR SELECT USING (true);
CREATE POLICY "PermissoesModulo: admin pode inserir" ON public.permissoes_modulo FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "PermissoesModulo: admin pode atualizar" ON public.permissoes_modulo FOR UPDATE USING (is_admin());
CREATE POLICY "PermissoesModulo: admin pode deletar" ON public.permissoes_modulo FOR DELETE USING (is_admin());

-- Adicionar perfil_permissao_id na tabela profiles
ALTER TABLE public.profiles ADD COLUMN perfil_permissao_id uuid REFERENCES public.perfis_permissao(id);

-- Função para verificar permissão de módulo
CREATE OR REPLACE FUNCTION public.has_module_permission(p_module text, p_permission text DEFAULT 'leitura')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles pr
    JOIN public.perfis_permissao pp ON pp.id = pr.perfil_permissao_id
    LEFT JOIN public.permissoes_modulo pm ON pm.perfil_id = pp.id AND pm.modulo = p_module
    WHERE pr.user_id = auth.uid()
    AND (
      pp.is_admin = true
      OR (p_permission = 'leitura' AND pm.leitura = true)
      OR (p_permission = 'edicao' AND pm.edicao = true)
    )
  );
$$;

-- Inserir perfis padrão
INSERT INTO public.perfis_permissao (id, nome, descricao, is_admin, editavel) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Administrador', 'Acesso total ao sistema', true, false),
  ('a0000000-0000-0000-0000-000000000002', 'Financeiro', 'Acesso a módulos financeiros', false, true),
  ('a0000000-0000-0000-0000-000000000003', 'Técnico', 'Acesso a chamados e OS', false, true),
  ('a0000000-0000-0000-0000-000000000004', 'Gerente', 'Acesso somente leitura', false, true);

-- Permissões Admin (tudo)
INSERT INTO public.permissoes_modulo (perfil_id, modulo, leitura, edicao) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'dashboard', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'clientes', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'novo_cliente', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'chamados', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'ordens_servico', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'contratos', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'estoque', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'financeiro', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'faturamento', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'relatorios', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'configuracoes', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'usuarios', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'auditoria', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'tecnicos', true, true);

-- Permissões Financeiro
INSERT INTO public.permissoes_modulo (perfil_id, modulo, leitura, edicao) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'dashboard', true, false),
  ('a0000000-0000-0000-0000-000000000002', 'clientes', true, true),
  ('a0000000-0000-0000-0000-000000000002', 'novo_cliente', true, true),
  ('a0000000-0000-0000-0000-000000000002', 'chamados', true, false),
  ('a0000000-0000-0000-0000-000000000002', 'ordens_servico', true, false),
  ('a0000000-0000-0000-0000-000000000002', 'contratos', true, true),
  ('a0000000-0000-0000-0000-000000000002', 'financeiro', true, true),
  ('a0000000-0000-0000-0000-000000000002', 'faturamento', true, true),
  ('a0000000-0000-0000-0000-000000000002', 'relatorios', true, false);

-- Permissões Técnico
INSERT INTO public.permissoes_modulo (perfil_id, modulo, leitura, edicao) VALUES
  ('a0000000-0000-0000-0000-000000000003', 'dashboard', true, true),
  ('a0000000-0000-0000-0000-000000000003', 'clientes', true, false),
  ('a0000000-0000-0000-0000-000000000003', 'chamados', true, true),
  ('a0000000-0000-0000-0000-000000000003', 'ordens_servico', true, true),
  ('a0000000-0000-0000-0000-000000000003', 'estoque', true, true);

-- Permissões Gerente
INSERT INTO public.permissoes_modulo (perfil_id, modulo, leitura, edicao) VALUES
  ('a0000000-0000-0000-0000-000000000004', 'dashboard', true, false),
  ('a0000000-0000-0000-0000-000000000004', 'clientes', true, false),
  ('a0000000-0000-0000-0000-000000000004', 'chamados', true, false),
  ('a0000000-0000-0000-0000-000000000004', 'ordens_servico', true, false),
  ('a0000000-0000-0000-0000-000000000004', 'contratos', true, false),
  ('a0000000-0000-0000-0000-000000000004', 'financeiro', true, false),
  ('a0000000-0000-0000-0000-000000000004', 'relatorios', true, false);

-- Vincular usuários existentes aos perfis correspondentes
UPDATE public.profiles SET perfil_permissao_id = 'a0000000-0000-0000-0000-000000000001' WHERE role = 'admin';
UPDATE public.profiles SET perfil_permissao_id = 'a0000000-0000-0000-0000-000000000002' WHERE role = 'financeiro';
UPDATE public.profiles SET perfil_permissao_id = 'a0000000-0000-0000-0000-000000000003' WHERE role = 'tecnico';
