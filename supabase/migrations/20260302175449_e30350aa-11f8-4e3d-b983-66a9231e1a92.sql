
-- Fix view to use security_invoker
DROP VIEW IF EXISTS public.produtos_public;

CREATE VIEW public.produtos_public
WITH (security_invoker=on) AS
SELECT id, nome, modelo, quantidade, estoque_minimo, ativo, venda, created_at, updated_at, created_by
FROM public.produtos;
