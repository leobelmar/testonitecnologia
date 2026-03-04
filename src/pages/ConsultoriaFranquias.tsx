import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Store, Volume2, Camera, Shield,
  Wifi, Monitor, Tv, LayoutGrid, CheckCircle, Zap,
  Clock, TrendingUp, Wrench
} from 'lucide-react';

const servicos = [
  {
    icon: Volume2,
    title: 'Sonorização Ambiente',
    desc: 'Equipamentos embutidos com acabamento profissional, integrados ao projeto arquitetônico da loja.',
  },
  {
    icon: Camera,
    title: 'Vídeo Monitoramento (CFTV)',
    desc: 'Câmeras IP de alta resolução com gravação e acesso remoto para segurança total da operação.',
  },
  {
    icon: Shield,
    title: 'Alarme e Segurança',
    desc: 'Sistemas de alarme integrados com monitoramento 24h para proteção completa da loja.',
  },
  {
    icon: Wifi,
    title: 'Infraestrutura de Rede',
    desc: 'Cabeamento estruturado, Wi-Fi corporativo e conectividade estável para toda a operação.',
  },
  {
    icon: Monitor,
    title: 'Montagem de PDVs',
    desc: 'Configuração completa de pontos de venda, incluindo hardware, software e periféricos.',
  },
  {
    icon: Tv,
    title: 'TVs, Projetores e Vídeo Wall',
    desc: 'Instalação de televisores, projetores e paredões de TV com configuração profissional.',
  },
  {
    icon: LayoutGrid,
    title: 'Integração de Sistemas',
    desc: 'Integração completa entre todos os equipamentos e sistemas da loja para operação fluida.',
  },
  {
    icon: Wrench,
    title: 'Suporte Pós-implantação',
    desc: 'Acompanhamento técnico nos primeiros dias de operação para garantir estabilidade total.',
  },
];

const diferenciais = [
  'Implantação em tempo recorde',
  'Execução na madrugada quando necessário',
  'Planejamento junto à equipe de obra',
  'Loja pronta no primeiro dia de operação',
  '+29 lojas implantadas em 5 anos',
  'Atuação em shoppings e franquias de rua',
  'Equipe especializada e organizada',
  '16 anos de experiência em tecnologia',
];

export default function ConsultoriaFranquias() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent" />
        </div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-white/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />

        <div className="container-width section-padding relative z-10 pt-32">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 mb-6 border border-white/10">
              <Store className="h-5 w-5 text-white/90" />
              <span className="text-sm font-medium text-white/90 tracking-wide">Franquias & Lojas de Shopping</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Implantação Tecnológica
              <br />
              <span className="text-white/80">para Lojas e Franquias</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed">
              Agilidade, precisão e integração na montagem completa de infraestrutura tecnológica. 
              Sua loja pronta para operar desde o primeiro dia.
            </p>
            <a
              href="https://wa.me/5547992858578?text=Olá!%20Tenho%20interesse%20nos%20serviços%20de%20implantação%20tecnológica%20para%20lojas%20e%20franquias."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[hsl(var(--navy-deep))] px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
            >
              Solicitar Orçamento <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="section-padding" style={{ background: 'var(--gradient-subtle)' }}>
        <div className="container-width">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Como Funciona</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
              Velocidade e Precisão na Implantação
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Atuamos de forma planejada junto às equipes de obra e arquitetura, preparando toda a infraestrutura 
              necessária para executar a instalação completa em tempo recorde.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Clock,
                step: '01',
                title: 'Planejamento',
                desc: 'Alinhamento com equipes de obra e arquitetura para preparar toda a infraestrutura necessária.',
              },
              {
                icon: Zap,
                step: '02',
                title: 'Execução Rápida',
                desc: 'Implantação completa, muitas vezes realizada durante a madrugada após o fechamento do shopping.',
              },
              {
                icon: TrendingUp,
                step: '03',
                title: 'Loja Operando',
                desc: 'Toda a tecnologia funcionando perfeitamente desde o primeiro dia de operação.',
              },
            ].map((item, i) => (
              <div key={i} className="card-premium p-8 text-center group hover:border-accent/30">
                <div className="text-5xl font-bold text-accent/20 mb-4">{item.step}</div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 flex items-center justify-center mx-auto mb-5 transition-all">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O que implantamos */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Serviços</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
              O Que Implantamos
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Realizamos toda a infraestrutura tecnológica da loja, do som às câmeras, dos PDVs ao vídeo wall.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicos.map((s, i) => (
              <div key={i} className="card-premium p-6 group hover:border-accent/30">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 flex items-center justify-center shrink-0 transition-all mb-4">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="section-padding" style={{ background: 'var(--gradient-subtle)' }}>
        <div className="container-width">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Experiência Comprovada</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
              Resultados que Falam por Si
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { num: '+29', label: 'Lojas implantadas' },
              { num: '5', label: 'Anos de experiência no segmento' },
              { num: '16', label: 'Anos no mercado de TI' },
            ].map((item, i) => (
              <div key={i} className="text-center p-8 card-premium">
                <div className="text-5xl font-bold text-primary mb-2">{item.num}</div>
                <p className="text-muted-foreground text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative section-padding overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-20 w-56 h-56 bg-white/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.8s' }} />
        <div className="container-width relative z-10">
          <div className="text-center mb-12">
            <span className="text-white/70 font-semibold text-sm uppercase tracking-wider">Parceiro Tecnológico</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-6">
              Sua Loja Pronta para Operar
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-2">
              Garantimos que toda a tecnologia da loja esteja funcionando perfeitamente desde o primeiro dia de operação.
            </p>
            <div className="w-20 h-1 bg-white/30 mx-auto rounded-full mt-6" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {diferenciais.map((r, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-colors">
                <CheckCircle className="h-5 w-5 text-white/90 shrink-0" />
                <span className="text-white font-medium text-sm">{r}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <p className="text-white/70 text-lg mb-1">Da inauguração à operação plena</p>
            <p className="text-white font-bold text-xl mb-8">conte com quem entende de implantação tecnológica.</p>
            <a
              href="https://wa.me/5547992858578?text=Olá!%20Tenho%20interesse%20nos%20serviços%20de%20implantação%20tecnológica%20para%20lojas%20e%20franquias."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[hsl(var(--navy-deep))] px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
            >
              Falar com um Especialista <ArrowRight className="h-5 w-5" />
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
