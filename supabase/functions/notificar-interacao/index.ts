import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificacaoPayload {
  chamado_id: string;
  mensagem: string;
  tipo: 'comentario' | 'status_change' | 'atribuicao';
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authenticatedUserId = claimsData.claims.sub as string;

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificacaoPayload = await req.json();
    const { chamado_id, mensagem, tipo } = payload;

    if (!chamado_id || !mensagem) {
      return new Response(
        JSON.stringify({ error: "chamado_id e mensagem são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar dados do chamado
    const { data: chamado, error: chamadoError } = await supabaseClient
      .from("chamados")
      .select(`
        *,
        cliente:clientes(id, nome_empresa, email, telefone)
      `)
      .eq("id", chamado_id)
      .single();

    if (chamadoError || !chamado) {
      return new Response(
        JSON.stringify({ error: "Chamado não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar dados do usuário que fez a interação
    const { data: usuarioInteracao } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("user_id", authenticatedUserId)
      .single();

    // Buscar todos os usuários vinculados ao cliente para notificar
    const { data: clienteUsuarios } = await supabaseClient
      .from("cliente_usuarios")
      .select(`
        user_id,
        profile:profiles!cliente_usuarios_user_id_fkey(email, nome)
      `)
      .eq("cliente_id", chamado.cliente_id);

    // Montar lista de emails para notificar
    const emailsParaNotificar: string[] = [];

    if (chamado.cliente?.email) {
      emailsParaNotificar.push(chamado.cliente.email);
    }

    if (clienteUsuarios) {
      for (const cu of clienteUsuarios) {
        const profile = cu.profile as any;
        if (cu.user_id !== authenticatedUserId && profile?.email) {
          emailsParaNotificar.push(profile.email);
        }
      }
    }

    const emailsUnicos = [...new Set(emailsParaNotificar)];

    console.log("=== NOTIFICAÇÃO DE INTERAÇÃO ===");
    console.log(`Chamado: #${chamado.numero} - ${chamado.titulo}`);
    console.log(`Tipo: ${tipo}`);
    console.log(`Usuário que interagiu: ${usuarioInteracao?.nome || 'Sistema'}`);
    console.log(`Emails para notificar: ${emailsUnicos.join(', ')}`);
    console.log("================================");

    return new Response(
      JSON.stringify({
        success: true,
        notificacao: {
          chamado_numero: chamado.numero,
          chamado_titulo: chamado.titulo,
          cliente: chamado.cliente?.nome_empresa,
          tipo,
          mensagem,
          emails_notificados: emailsUnicos,
          usuario_interacao: usuarioInteracao?.nome || 'Sistema',
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Erro na função notificar-interacao:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
