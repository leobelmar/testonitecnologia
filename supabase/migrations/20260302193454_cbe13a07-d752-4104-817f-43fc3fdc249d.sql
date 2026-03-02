
-- Tabela de arquivos compartilhados
CREATE TABLE public.arquivos_compartilhados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_arquivo text NOT NULL,
  nome_original text NOT NULL,
  descricao text,
  tamanho_bytes bigint NOT NULL DEFAULT 0,
  tipo_mime text,
  storage_path text NOT NULL,
  token text NOT NULL UNIQUE,
  chamado_id uuid REFERENCES public.chamados(id) ON DELETE SET NULL,
  expira_em timestamp with time zone,
  limite_downloads integer,
  total_downloads integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'expirado', 'revogado')),
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de registro de downloads
CREATE TABLE public.arquivos_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  arquivo_id uuid NOT NULL REFERENCES public.arquivos_compartilhados(id) ON DELETE CASCADE,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS arquivos_compartilhados
ALTER TABLE public.arquivos_compartilhados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Arquivos: admin/tecnico pode ver"
  ON public.arquivos_compartilhados FOR SELECT
  TO authenticated
  USING (is_admin() OR is_tecnico());

CREATE POLICY "Arquivos: admin/tecnico pode criar"
  ON public.arquivos_compartilhados FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR is_tecnico());

CREATE POLICY "Arquivos: admin/tecnico pode atualizar"
  ON public.arquivos_compartilhados FOR UPDATE
  TO authenticated
  USING (is_admin() OR is_tecnico());

CREATE POLICY "Arquivos: admin pode deletar"
  ON public.arquivos_compartilhados FOR DELETE
  TO authenticated
  USING (is_admin());

-- RLS arquivos_downloads
ALTER TABLE public.arquivos_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Downloads: admin/tecnico pode ver"
  ON public.arquivos_downloads FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.arquivos_compartilhados a
    WHERE a.id = arquivos_downloads.arquivo_id
    AND (is_admin() OR is_tecnico())
  ));

-- Permitir insert anônimo (download público registra acesso)
CREATE POLICY "Downloads: qualquer um pode registrar"
  ON public.arquivos_downloads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Trigger updated_at
CREATE TRIGGER update_arquivos_compartilhados_updated_at
  BEFORE UPDATE ON public.arquivos_compartilhados
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Acesso anônimo para leitura de arquivos (download público)
CREATE POLICY "Arquivos: acesso publico por token"
  ON public.arquivos_compartilhados FOR SELECT
  TO anon
  USING (status = 'ativo');

-- Storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('arquivos-compartilhados', 'arquivos-compartilhados', false, 536870912);

-- Storage RLS: admin/tecnico pode fazer upload
CREATE POLICY "Arquivos Storage: upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'arquivos-compartilhados'
    AND (public.is_admin() OR public.is_tecnico())
  );

-- Storage RLS: admin/tecnico pode ver
CREATE POLICY "Arquivos Storage: ver"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'arquivos-compartilhados'
    AND (public.is_admin() OR public.is_tecnico())
  );

-- Storage RLS: admin pode deletar
CREATE POLICY "Arquivos Storage: deletar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'arquivos-compartilhados'
    AND public.is_admin()
  );

-- Storage RLS: acesso anônimo para download via signed URL (service role gera)
CREATE POLICY "Arquivos Storage: download publico"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'arquivos-compartilhados');
