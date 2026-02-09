
-- Add tipo_atendimento enum to track service type
CREATE TYPE public.tipo_atendimento AS ENUM ('remoto', 'presencial', 'sla1', 'sla2', 'sla3');

-- Add tipo_atendimento column to ordens_servico
ALTER TABLE public.ordens_servico ADD COLUMN tipo_atendimento public.tipo_atendimento NULL;
