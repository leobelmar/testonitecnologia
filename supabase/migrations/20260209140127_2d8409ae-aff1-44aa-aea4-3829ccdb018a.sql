
-- Tipo de movimentação de estoque
CREATE TYPE public.movimentacao_tipo AS ENUM ('entrada', 'saida', 'ajuste');

-- Tabela de Produtos/Peças
CREATE TABLE public.produtos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    modelo text,
    quantidade integer NOT NULL DEFAULT 0,
    custo numeric NOT NULL DEFAULT 0,
    venda numeric NOT NULL DEFAULT 0,
    estoque_minimo integer NOT NULL DEFAULT 0,
    ativo boolean NOT NULL DEFAULT true,
    created_by uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Movimentações de estoque
CREATE TABLE public.movimentacoes_estoque (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id uuid NOT NULL REFERENCES public.produtos(id),
    tipo movimentacao_tipo NOT NULL,
    quantidade integer NOT NULL,
    valor_unitario numeric NOT NULL DEFAULT 0,
    valor_total numeric NOT NULL DEFAULT 0,
    os_id uuid REFERENCES public.ordens_servico(id),
    despesa_id uuid REFERENCES public.despesas(id),
    observacoes text,
    created_by uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Peças usadas em OS
CREATE TABLE public.os_pecas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id uuid NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
    produto_id uuid NOT NULL REFERENCES public.produtos(id),
    quantidade integer NOT NULL DEFAULT 1,
    valor_unitario numeric NOT NULL DEFAULT 0,
    valor_total numeric NOT NULL DEFAULT 0,
    movimentacao_id uuid REFERENCES public.movimentacoes_estoque(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_produtos_nome ON public.produtos(nome);
CREATE INDEX idx_movimentacoes_produto ON public.movimentacoes_estoque(produto_id);
CREATE INDEX idx_movimentacoes_tipo ON public.movimentacoes_estoque(tipo);
CREATE INDEX idx_os_pecas_os ON public.os_pecas(os_id);
CREATE INDEX idx_os_pecas_produto ON public.os_pecas(produto_id);

-- Triggers updated_at
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON public.produtos
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_pecas ENABLE ROW LEVEL SECURITY;

-- Produtos: todos autenticados podem ver, admin pode CRUD
CREATE POLICY "Produtos: todos podem ver" ON public.produtos
FOR SELECT USING (true);

CREATE POLICY "Produtos: admin pode criar" ON public.produtos
FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Produtos: admin pode atualizar" ON public.produtos
FOR UPDATE USING (is_admin());

CREATE POLICY "Produtos: admin pode deletar" ON public.produtos
FOR DELETE USING (is_admin());

-- Movimentações: admin/tecnico/financeiro podem ver e criar
CREATE POLICY "Movimentacoes: ver por função" ON public.movimentacoes_estoque
FOR SELECT USING (is_admin() OR is_tecnico() OR is_financeiro());

CREATE POLICY "Movimentacoes: admin/tecnico pode criar" ON public.movimentacoes_estoque
FOR INSERT WITH CHECK (is_admin() OR is_tecnico());

CREATE POLICY "Movimentacoes: admin pode deletar" ON public.movimentacoes_estoque
FOR DELETE USING (is_admin());

-- OS Peças: mesma visibilidade da OS
CREATE POLICY "OSPecas: ver via OS" ON public.os_pecas
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.ordens_servico os WHERE os.id = os_id AND (
        is_admin() OR is_financeiro() OR
        (is_tecnico() AND os.tecnico_id = auth.uid()) OR
        user_belongs_to_cliente(os.cliente_id)
    ))
);

CREATE POLICY "OSPecas: admin/tecnico pode criar" ON public.os_pecas
FOR INSERT WITH CHECK (is_admin() OR is_tecnico());

CREATE POLICY "OSPecas: admin pode deletar" ON public.os_pecas
FOR DELETE USING (is_admin());

CREATE POLICY "OSPecas: admin pode atualizar" ON public.os_pecas
FOR UPDATE USING (is_admin());

-- Auditoria
CREATE TRIGGER audit_produtos AFTER INSERT OR UPDATE OR DELETE ON public.produtos FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_movimentacoes AFTER INSERT OR UPDATE OR DELETE ON public.movimentacoes_estoque FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_os_pecas AFTER INSERT OR UPDATE OR DELETE ON public.os_pecas FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
