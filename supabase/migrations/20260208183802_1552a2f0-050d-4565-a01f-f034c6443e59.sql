-- Adicionar valor 'pago' ao enum os_status
ALTER TYPE public.os_status ADD VALUE IF NOT EXISTS 'pago';