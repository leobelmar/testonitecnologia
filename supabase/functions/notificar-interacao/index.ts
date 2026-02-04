import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificacaoPayload {
  chamado_id: string;
  mensagem: string;
  tipo: 'comentario' | 'status_change' | 'atribuicao';
  user_id: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: NotificacaoPayload = await req.json();
    const { chamado_id, mensagem, tipo, user_id } = payload;

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
      console.error("Erro ao buscar chamado:", chamadoError);
      return new Response(
        JSON.stringify({ error: "Chamado não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar dados do usuário que fez a interação
    const { data: usuarioInteracao } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("user_id", user_id)
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

    // Adicionar email do cliente
    if (chamado.cliente?.email) {
      emailsParaNotificar.push(chamado.cliente.email);
    }

    // Adicionar emails dos usuários vinculados ao cliente
    if (clienteUsuarios) {
      for (const cu of clienteUsuarios) {
        // Não notificar quem fez a interação
        const profile = cu.profile as any;
        if (cu.user_id !== user_id && profile?.email) {
          emailsParaNotificar.push(profile.email);
        }
      }
    }

    // Remove duplicatas
    const emailsUnicos = [...new Set(emailsParaNotificar)];

    // Log da notificação (em produção, integraria com um serviço de email)
    console.log("=== NOTIFICAÇÃO DE INTERAÇÃO ===");
    console.log(`Chamado: #${chamado.numero} - ${chamado.titulo}`);
    console.log(`Tipo: ${tipo}`);
    console.log(`Usuário que interagiu: ${usuarioInteracao?.nome || 'Sistema'}`);
    console.log(`Mensagem: ${mensagem}`);
    console.log(`Emails para notificar: ${emailsUnicos.join(', ')}`);
    console.log("================================");

    // Retornar sucesso com dados da notificação
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
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("Erro na função notificar-interacao:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
