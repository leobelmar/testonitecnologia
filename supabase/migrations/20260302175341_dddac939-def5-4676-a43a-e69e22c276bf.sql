
-- Create a view that excludes cost information for non-admin/financeiro users
CREATE OR REPLACE VIEW public.produtos_public AS
SELECT id, nome, modelo, quantidade, estoque_minimo, ativo, venda, created_at, updated_at, created_by
FROM public.produtos;

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Produtos: todos podem ver" ON public.produtos;

-- Admin and financeiro see everything including cost
CREATE POLICY "Produtos: admin/financeiro vê tudo" ON public.produtos
FOR SELECT TO authenticated
USING (is_admin() OR is_financeiro());

-- Technicians can see products but we need them for OS creation
CREATE POLICY "Produtos: tecnico vê produtos" ON public.produtos
FOR SELECT TO authenticated
USING (is_tecnico());
