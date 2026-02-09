
-- Permitir que usuários autenticados insiram seus próprios logs de login
CREATE POLICY "Audit: usuario pode registrar login" ON public.audit_logs
FOR INSERT WITH CHECK (auth.uid() = user_id AND acao = 'login');
