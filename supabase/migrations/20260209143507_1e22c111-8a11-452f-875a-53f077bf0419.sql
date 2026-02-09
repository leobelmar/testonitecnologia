
-- Drop and recreate all audit triggers to ensure consistency

DROP TRIGGER IF EXISTS audit_ordens_servico ON public.ordens_servico;
DROP TRIGGER IF EXISTS audit_faturas ON public.faturas;
DROP TRIGGER IF EXISTS audit_despesas ON public.despesas;
DROP TRIGGER IF EXISTS audit_chamados ON public.chamados;
DROP TRIGGER IF EXISTS audit_contratos ON public.contratos;
DROP TRIGGER IF EXISTS audit_produtos ON public.produtos;
DROP TRIGGER IF EXISTS audit_movimentacoes_estoque ON public.movimentacoes_estoque;
DROP TRIGGER IF EXISTS audit_clientes ON public.clientes;
DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
DROP TRIGGER IF EXISTS audit_convites ON public.convites;
DROP TRIGGER IF EXISTS audit_contrato_periodos ON public.contrato_periodos;

CREATE TRIGGER audit_ordens_servico AFTER INSERT OR UPDATE OR DELETE ON public.ordens_servico FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_faturas AFTER INSERT OR UPDATE OR DELETE ON public.faturas FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_despesas AFTER INSERT OR UPDATE OR DELETE ON public.despesas FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_chamados AFTER INSERT OR UPDATE OR DELETE ON public.chamados FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_contratos AFTER INSERT OR UPDATE OR DELETE ON public.contratos FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_produtos AFTER INSERT OR UPDATE OR DELETE ON public.produtos FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_movimentacoes_estoque AFTER INSERT OR UPDATE OR DELETE ON public.movimentacoes_estoque FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_clientes AFTER INSERT OR UPDATE OR DELETE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_convites AFTER INSERT OR UPDATE OR DELETE ON public.convites FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_contrato_periodos AFTER INSERT OR UPDATE OR DELETE ON public.contrato_periodos FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
