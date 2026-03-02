import { Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, UtensilsCrossed, BarChart3, ClipboardList, 
  GraduationCap, Monitor, Landmark, Users, Lightbulb, CheckCircle,
  Wine, ShieldCheck, LayoutGrid, Handshake, TrendingUp, Target,
  Server, Camera, Phone, Wifi, Lock, HardDrive, Headphones
} from 'lucide-react';
import logoBranco from '@/assets/logo-branco.png';

const pilares = [
  {
    icon: Target,
    title: 'Diagnóstico Estratégico',
    desc: 'Raio-X completo da operação: CMV, ticket médio, mix de vendas, estrutura de equipe, custos fixos/variáveis, taxas de cartão e estrutura tecnológica.',
    resultado: 'Clareza total sobre onde o negócio perde dinheiro e onde pode escalar.',
  },
  {
    icon: ClipboardList,
    title: 'Padronização Operacional (POP)',
    desc: 'Procedimentos operacionais padrão, manual interno, padronização de produção (cozinha e bar), controle de estoque, fluxo de atendimento e organização física.',
    resultado: 'Redução de erros, desperdícios e dependência operacional.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Engenharia de Cardápio',
    desc: 'Otimização de cardápio, redução estratégica de CMV, produtos de alta margem, posicionamento de preços e análise de rentabilidade por item.',
    resultado: 'Vender melhor, não apenas vender mais.',
  },
  {
    icon: Wine,
    title: 'Carta de Drinks Autoral',
    desc: 'Drinks exclusivos, identidade da casa, fichas técnicas padronizadas, controle de custo por dose e estratégia de margem por produto.',
    resultado: 'Diferenciação e autoridade no mercado.',
  },
  {
    icon: GraduationCap,
    title: 'Treinamento de Equipe',
    desc: 'Treinamento para equipe operacional (atendimento, postura, abordagem de venda) e gerentes (comunicação assertiva, gestão de equipe, cultura organizacional).',
    resultado: 'Equipe transformada em ativo estratégico.',
  },
  {
    icon: Monitor,
    title: 'Tecnologia e Sistemas',
    desc: 'Sistemas de gestão operacional, controle de estoque, gestão financeira integrada, PDV + pagamentos, soluções próprias da Testoni Tecnologia.',
    resultado: 'Informação centralizada e controle real.',
  },
  {
    icon: Landmark,
    title: 'Estrutura Financeira e Bancária',
    desc: 'Otimização de taxas de cartão, antecipação de recebíveis, operadoras adequadas, negociação com bancos e redução de custos ocultos.',
    resultado: 'Margem recuperada em taxas mal negociadas.',
  },
  {
    icon: Users,
    title: 'Recorrência e Fidelização',
    desc: 'Captação de dados, listas de transmissão, comunicação direta, campanhas de reativação, convites exclusivos e promoções direcionadas.',
    resultado: 'Clientes que retornam = maior lucro por cliente ao longo do tempo.',
  },
];

const servicosTI = [
  {
    icon: Server,
    title: 'Infraestrutura de TI para A&B',
    desc: 'Suporte técnico presencial e remoto, manutenção de computadores, servidores e redes Wi-Fi de alta performance para operações com grande volume de clientes.',
  },
  {
    icon: Camera,
    title: 'Segurança Eletrônica',
    desc: 'Câmeras estrategicamente posicionadas, controle de acesso, alarmes e monitoramento — essenciais para redução de perdas e segurança da operação.',
  },
  {
    icon: Phone,
    title: 'Telefonia VoIP',
    desc: 'Comunicação profissional com PABX IP e telefonia virtual, ideal para recepção de reservas, delivery e atendimento ao cliente.',
  },
  {
    icon: Wifi,
    title: 'Wi-Fi Corporativo',
    desc: 'Redes Wi-Fi robustas e seguras para clientes e operação interna, com cobertura total do ambiente e gestão centralizada.',
  },
  {
    icon: Lock,
    title: 'PDV e Sistemas Integrados',
    desc: 'Integração PDV + pagamentos + estoque + gestão financeira. Sistemas como Pantera Food, Nave Vendas e soluções próprias.',
  },
  {
    icon: Headphones,
    title: 'Suporte 24/7 para Eventos',
    desc: 'Suporte emergencial para baladas, eventos, alta temporada e operações de alta demanda que não podem parar.',
  },
];

const resultadosFinais = [
  'Aumento de lucro bruto e líquido',
  'Redução de desperdício',
  'Maior controle operacional',
  'Padronização profissional',
  'Equipe mais produtiva',
  'Estrutura pronta para expansão',
  'Base de clientes recorrentes',
  'Redução de custos financeiros ocultos',
];

export default function ConsultoriaAB() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent" />
        </div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />

        <div className="container-width section-padding relative z-10 pt-32">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <UtensilsCrossed className="h-5 w-5 text-white/90" />
              <span className="text-sm font-medium text-white/90">Consultoria A&B</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Estrutura Completa para
              <br />
              <span className="text-white/80">Bares, Restaurantes & Casas Noturnas</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-8">
              Integramos gestão operacional, engenharia de cardápio, tecnologia, estrutura financeira e treinamento de equipe. 
              Nosso foco é aumentar lucro, melhorar margem e estruturar crescimento sustentável.
            </p>
            <a
              href="https://wa.me/5547992858578?text=Olá!%20Tenho%20interesse%20na%20consultoria%20para%20bares%20e%20restaurantes."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[hsl(var(--navy-deep))] px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg"
            >
              Solicitar Diagnóstico Gratuito <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Problema do mercado */}
      <section className="section-padding" style={{ background: 'var(--gradient-subtle)' }}>
        <div className="container-width">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">O Problema do Mercado</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
              Por que a maioria dos negócios A&B faturam bem, mas lucram pouco?
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              'Margens apertadas e CMV descontrolado',
              'Equipes mal treinadas e sem padronização',
              'Desperdício invisível na operação',
              'Dependência de funcionários específicos',
              'Falta de controle financeiro real',
              'Taxas bancárias excessivas',
              'Clientes que não retornam',
              'Cardápio sem estratégia de margem',
              'Faturamento razoável com lucro baixo',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                <div className="w-2 h-2 rounded-full bg-destructive mt-2 shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Nossa Solução</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
              Estrutura Completa de Performance
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Consultoria estruturada em 8 pilares estratégicos para transformar a operação do seu negócio.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {pilares.map((pilar, i) => (
              <div key={i} className="card-premium p-8 group hover:border-accent/30">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 flex items-center justify-center shrink-0 transition-all">
                    <pilar.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{pilar.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{pilar.desc}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-accent">
                      <TrendingUp className="h-4 w-4" />
                      {pilar.resultado}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços de TI aplicados */}
      <section className="section-padding" style={{ background: 'var(--gradient-subtle)' }}>
        <div className="container-width">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Tecnologia Aplicada</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
              Serviços de TI para seu Negócio A&B
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Além da consultoria de gestão, entregamos toda a infraestrutura tecnológica que seu bar, restaurante ou casa noturna precisa.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicosTI.map((s, i) => (
              <div key={i} className="card-premium p-8 group hover:border-accent/30">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 flex items-center justify-center mb-6 transition-all">
                  <s.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Estrutura Física */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">Organização Estratégica</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
                Estrutura Física e Layout
              </h2>
              <p className="text-muted-foreground mb-6">
                Analisamos e reorganizamos todo o espaço físico para máxima eficiência operacional.
              </p>
              <ul className="space-y-3">
                {['Layout de cozinha otimizado', 'Fluxo de bar eficiente', 'Recepção e circulação', 'Organização de estoque', 'Posicionamento estratégico de câmeras'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">Parcerias Estratégicas</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
                Rede de Parceiros Selecionados
              </h2>
              <p className="text-muted-foreground mb-6">
                Se necessário, conectamos seu negócio a parceiros selecionados, sempre com curadoria técnica da Testoni Tecnologia.
              </p>
              <ul className="space-y-3">
                {['Marketing e branding', 'Identidade visual', 'Arquitetura especializada', 'Segurança patrimonial', 'Tecnologia complementar'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Handshake className="h-5 w-5 text-accent shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="relative section-padding overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="container-width relative z-10">
          <div className="text-center mb-12">
            <span className="text-white/70 font-semibold text-sm uppercase tracking-wider">O Que Entregamos</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-6">
              Resultados Concretos
            </h2>
            <div className="w-20 h-1 bg-white/30 mx-auto rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resultadosFinais.map((r, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <CheckCircle className="h-6 w-6 text-white/90 shrink-0" />
                <span className="text-white font-medium">{r}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-white/70 text-lg mb-2">Não somos apenas consultoria gastronômica.</p>
            <p className="text-white font-bold text-xl mb-8">Somos estrutura empresarial aplicada ao A&B.</p>
            <a
              href="https://wa.me/5547992858578?text=Olá!%20Tenho%20interesse%20na%20consultoria%20para%20bares%20e%20restaurantes."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[hsl(var(--navy-deep))] px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg"
            >
              Falar com um Consultor <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer link */}
      <div className="section-padding bg-background text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" /> Voltar ao site principal
        </Link>
      </div>
    </div>
  );
}
