import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Buscar arquivo pelo token
    const { data: arquivo, error } = await supabaseAdmin
      .from("arquivos_compartilhados")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !arquivo) {
      return new Response(
        JSON.stringify({ error: "Arquivo não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar status
    if (arquivo.status !== "ativo") {
      return new Response(
        JSON.stringify({ error: "Link revogado ou expirado", status: arquivo.status }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar expiração
    if (arquivo.expira_em && new Date(arquivo.expira_em) < new Date()) {
      // Atualizar status para expirado
      await supabaseAdmin
        .from("arquivos_compartilhados")
        .update({ status: "expirado" })
        .eq("id", arquivo.id);

      return new Response(
        JSON.stringify({ error: "Link expirado", status: "expirado" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar limite de downloads
    if (arquivo.limite_downloads && arquivo.total_downloads >= arquivo.limite_downloads) {
      return new Response(
        JSON.stringify({ error: "Limite de downloads atingido", status: "limite" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const action = url.searchParams.get("action");

    // Se action=info, retorna apenas metadados
    if (action === "info") {
      return new Response(
        JSON.stringify({
          nome_arquivo: arquivo.nome_original,
          descricao: arquivo.descricao,
          tamanho_bytes: arquivo.tamanho_bytes,
          tipo_mime: arquivo.tipo_mime,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // action=download — gerar signed URL e registrar download
    const { data: signedData, error: signedError } = await supabaseAdmin
      .storage
      .from("arquivos-compartilhados")
      .createSignedUrl(arquivo.storage_path, 300); // 5 min

    if (signedError || !signedData?.signedUrl) {
      return new Response(
        JSON.stringify({ error: "Erro ao gerar URL de download" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Registrar download
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await supabaseAdmin.from("arquivos_downloads").insert({
      arquivo_id: arquivo.id,
      ip_address: ip,
      user_agent: userAgent,
    });

    // Incrementar contador
    await supabaseAdmin
      .from("arquivos_compartilhados")
      .update({ total_downloads: arquivo.total_downloads + 1 })
      .eq("id", arquivo.id);

    return new Response(
      JSON.stringify({ url: signedData.signedUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
