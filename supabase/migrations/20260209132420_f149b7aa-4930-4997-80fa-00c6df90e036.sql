
-- Tabela de despesas para o fluxo de caixa
CREATE TABLE public.despesas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria TEXT,
  forma_pagamento TEXT,
  pago BOOLEAN NOT NULL DEFAULT false,
  data_pagamento DATE,
  observacoes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Despesas: admin/financeiro pode ver"
ON public.despesas FOR SELECT
USING (is_admin() OR is_financeiro());

CREATE POLICY "Despesas: admin/financeiro pode criar"
ON public.despesas FOR INSERT
WITH CHECK (is_admin() OR is_financeiro());

CREATE POLICY "Despesas: admin/financeiro pode atualizar"
ON public.despesas FOR UPDATE
USING (is_admin() OR is_financeiro());

CREATE POLICY "Despesas: admin pode deletar"
ON public.despesas FOR DELETE
USING (is_admin());

-- Trigger updated_at
CREATE TRIGGER update_despesas_updated_at
BEFORE UPDATE ON public.despesas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
