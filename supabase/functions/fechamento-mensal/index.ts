import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
    
    // Mês anterior
    const mesAnteriorDate = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const mesAnterior = `${mesAnteriorDate.getFullYear()}-${String(mesAnteriorDate.getMonth() + 1).padStart(2, '0')}-01`;

    // Buscar contratos ativos
    const { data: contratos, error: contratosError } = await supabase
      .from('contratos')
      .select('*, contrato_tipos_hora(*)')
      .eq('status', 'ativo');

    if (contratosError) throw contratosError;

    const results = [];

    for (const contrato of contratos || []) {
      // 1. Verificar se já existe período do mês atual, senão criar
      const { data: periodoAtual } = await supabase
        .from('contrato_periodos')
        .select('id')
        .eq('contrato_id', contrato.id)
        .eq('mes_referencia', mesAtual)
        .maybeSingle();

      if (!periodoAtual) {
        await supabase.from('contrato_periodos').insert({
          contrato_id: contrato.id,
          mes_referencia: mesAtual,
          horas_inclusas: contrato.horas_inclusas,
          status: 'ativo',
        });
      }

      // 2. Verificar se o período do mês anterior está ativo (precisa fechar)
      const { data: periodoAnterior } = await supabase
        .from('contrato_periodos')
        .select('*')
        .eq('contrato_id', contrato.id)
        .eq('mes_referencia', mesAnterior)
        .eq('status', 'ativo')
        .maybeSingle();

      if (periodoAnterior) {
        // Fechar mês anterior automaticamente
        const inicioMes = new Date(mesAnteriorDate.getFullYear(), mesAnteriorDate.getMonth(), 1).toISOString();
        const fimMes = new Date(mesAnteriorDate.getFullYear(), mesAnteriorDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const { data: osList } = await supabase
          .from('ordens_servico')
          .select('*')
          .eq('cliente_id', contrato.cliente_id)
          .gte('data_inicio', inicioMes)
          .lte('data_inicio', fimMes);

        const osDoPeriodo = osList || [];
        const totalHoras = osDoPeriodo.reduce((acc: number, os: any) => acc + (Number(os.horas_trabalhadas) || 0), 0);
        const totalMateriais = osDoPeriodo.reduce((acc: number, os: any) => acc + (Number(os.valor_materiais) || 0), 0);
        const horasExcedentes = Math.max(0, totalHoras - Number(contrato.horas_inclusas));

        // Calcular valor horas extras por tipo
        const tiposHora = contrato.contrato_tipos_hora || [];
        const horasPorTipo: Record<string, number> = {};
        for (const os of osDoPeriodo) {
          const tipoId = os.tipo_hora_id || 'default';
          horasPorTipo[tipoId] = (horasPorTipo[tipoId] || 0) + (Number(os.horas_trabalhadas) || 0);
        }

        let valorHorasExtras = 0;
        if (horasExcedentes > 0 && tiposHora.length > 0) {
          for (const tipo of tiposHora) {
            const horasTipo = horasPorTipo[tipo.id] || 0;
            const proporcao = totalHoras > 0 ? horasTipo / totalHoras : 0;
            valorHorasExtras += (horasExcedentes * proporcao) * Number(tipo.valor_hora_extra);
          }
        }

        const valorTotal = Number(contrato.valor_mensal) + valorHorasExtras + totalMateriais;

        await supabase
          .from('contrato_periodos')
          .update({
            total_horas_usadas: totalHoras,
            horas_excedentes: horasExcedentes,
            total_atendimentos: osDoPeriodo.length,
            total_os: osDoPeriodo.length,
            valor_horas_extras: valorHorasExtras,
            valor_materiais: totalMateriais,
            valor_total: valorTotal,
            status: 'fechado',
            fechado_em: new Date().toISOString(),
          })
          .eq('id', periodoAnterior.id);

        // Salvar horas por tipo
        for (const tipo of tiposHora) {
          const horas = horasPorTipo[tipo.id] || 0;
          if (horas > 0) {
            await supabase.from('contrato_periodo_horas').insert({
              periodo_id: periodoAnterior.id,
              tipo_hora_id: tipo.id,
              horas,
              valor_hora_extra: Number(tipo.valor_hora_extra),
            });
          }
        }

        results.push({ contrato: contrato.numero, action: 'closed_previous_month', mesAnterior });
      }

      results.push({ contrato: contrato.numero, action: 'ensured_current_period', mesAtual });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro no fechamento mensal:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
