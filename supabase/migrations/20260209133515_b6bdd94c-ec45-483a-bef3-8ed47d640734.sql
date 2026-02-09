
-- Restringir INSERT para apenas a função de auditoria (nenhum usuário direto)
DROP POLICY "Audit: sistema pode inserir" ON public.audit_logs;

-- Nenhuma policy de INSERT necessária pois o trigger usa SECURITY DEFINER
-- Adicionar policy explícita que bloqueia delete/update
CREATE POLICY "Audit: ninguem pode deletar" ON public.audit_logs
FOR DELETE USING (false);

CREATE POLICY "Audit: ninguem pode atualizar" ON public.audit_logs
FOR UPDATE USING (false);
