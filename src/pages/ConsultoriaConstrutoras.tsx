import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Building2, Wifi, Camera, Cable,
  Shield, CheckCircle, HardHat, Eye, Zap, Server,
  Monitor, Phone, Lock, Wrench, TrendingUp, Layers,
  Radio, AlertTriangle, Lightbulb
} from 'lucide-react';

const servicosObra = [
  {
    icon: Wifi,
    title: 'Internet para Canteiro de Obras',
    desc: 'Soluções de conectividade com baixo custo e alta estabilidade para comunicação entre obra e escritório, acesso remoto, envio de documentos e acompanhamento em tempo real.',
    resultado: 'Gestão da obra conectada e eficiente desde o primeiro dia.',
  },
  {
    icon: Camera,
    title: 'Monitoramento Remoto da Obra',
    desc: 'Câmeras de monitoramento no canteiro, permitindo que gestores e engenheiros acompanhem o andamento da construção de qualquer lugar.',
    resultado: 'Mais controle, segurança e transparência na execução.',
  },
];

const servicosEmpreendimento = [
  {
    icon: Cable,
    title: 'Cabeamento Estruturado',
    desc: 'Projeto e instalação de toda a infraestrutura de cabeamento com acabamento profissional, identificação de redes e organização técnica.',
    resultado: 'Base sólida para telecomunicações sem improvisações.',
  },
  {
    icon: Zap,
    title: 'Fibra Óptica até os Apartamentos',
    desc: 'Infraestrutura de fibra óptica instalada até cada unidade, deixando o prédio pronto para receber operadoras sem intervenções posteriores.',
    resultado: 'Empreendimento valorizado e preparado para o futuro.',
  },
  {
    icon: Radio,
    title: 'Telecomunicações & Telefonia',
    desc: 'Preparação completa para sistemas de telefonia, interfonia e TV (aberta e por assinatura), integrados à infraestrutura do prédio.',
    resultado: 'Comunicação profissional desde a entrega das chaves.',
  },
  {
    icon: Shield,
    title: 'Segurança Integrada',
    desc: 'Câmeras IP (CFTV), gravadores DVR/NVR, alarmes, controle de acesso e preparação para automação condominial com equipamentos de alta confiabilidade.',
    resultado: 'Segurança tecnológica completa para o condomínio.',
  },
  {
    icon: Lock,
    title: 'Controle de Acesso',
    desc: 'Infraestrutura preparada para sistemas modernos de controle de acesso em portarias, garagens e áreas restritas.',
    resultado: 'Prédio pronto para automação inteligente.',
  },
  {
    icon: Phone,
    title: 'Interfonia Profissional',
    desc: 'Instalação de sistemas de interfonia modernos, integrados à infraestrutura do empreendimento com acabamento impecável.',
    resultado: 'Comunicação interna confiável para moradores.',
  },
];

const servicosAdmin = [
  {
    icon: Monitor,
    title: 'Suporte a Sistemas de Gestão',
    desc: 'Auxílio na operação e resolução de problemas em ERPs, sistemas financeiros, bancários e softwares de gestão.',
  },
  {
    icon: Layers,
    title: 'Integração entre Sistemas',
    desc: 'Resolução de problemas de integração entre plataformas, incluindo BI, sistemas contábeis e ferramentas de produtividade.',
  },
  {
    icon: Server,
    title: 'Instalação de Softwares',
    desc: 'Instalação, configuração e suporte a softwares de terceiros utilizados no dia a dia administrativo da construtora.',
  },
  {
    icon: Wrench,
    title: 'Suporte Técnico Diário',
    desc: 'Atendimento rápido para problemas tecnológicos do cotidiano, aumentando a produtividade da equipe.',
  },
];

const problemasComuns = [
  'Cabos de operadoras passando pelos corredores',
  'Shafts desorganizados após a entrega',
  'Infraestrutura improvisada por técnicos externos',
  'Prédio sem preparação para fibra óptica',
  'Retrabalho em cabeamento mal planejado',
  'Falta de infraestrutura para câmeras e alarmes',
  'Sistemas de interfonia incompatíveis',
  'Desvalorização do empreendimento por acabamento ruim',
  'Equipe administrativa sem suporte de TI especializado',
];

const diferenciais = [
  'Planejamento técnico desde a fase de obra',
  'Cabeamento organizado e identificado',
  'Acabamento profissional impecável',
  'Infraestrutura preparada para expansão',
  'Fibra óptica até cada unidade',
  'Segurança integrada completa',
  'Suporte ao administrativo da construtora',
  'Parceria tecnológica de longo prazo',
];

export default function ConsultoriaConstrutoras() {
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
              <Building2 className="h-5 w-5 text-white/90" />
              <span className="text-sm font-medium text-white/90 tracking-wide">Construtoras & Empreendimentos</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Tecnologia Profissional
              <br />
              <span className="text-white/80">da Obra à Entrega</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed">
              Infraestrutura tecnológica planejada, organizada e preparada para o futuro. 
              Evite improvisações e entregue empreendimentos valorizados.
            </p>
            <a
              href="https://wa.me/5547992858578?text=Olá!%20Tenho%20interesse%20nos%20serviços%20de%20tecnologia%20para%20construtoras."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[hsl(var(--navy-deep))] px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
            >
              Solicitar Diagnóstico <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Problemas Comuns */}
      <section className="section-padding" style={{ background: 'var(--gradient-subtle)' }}>
        <div className="container-width">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">O Problema</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
              Quando a infraestrutura não é planejada
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
              Um dos maiores problemas em prédios novos aparece logo após a entrega: instalações improvisadas, 
              cabos expostos e infraestrutura desorganizada que prejudicam a estética e o valor do empreendimento.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {problemasComuns.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-5 rounded-xl bg-destructive/5 border border-destructive/10 hover:border-destructive/20 transition-colors">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span className="text-sm text-foreground leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fase de Obra */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
              <HardHat className="h-4 w-4" /> Fase 1
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-6">
              Canteiro de Obras Conectado
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Conectividade confiável e monitoramento remoto durante toda a construção.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {servicosObra.map((s, i) => (
              <div key={i} className="card-premium p-8 group hover:border-accent/30">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 flex items-center justify-center shrink-0 transition-all">
                    <s.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{s.desc}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-accent">
                      <TrendingUp className="h-4 w-4" />
                      {s.resultado}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infraestrutura do Empreendimento */}
      <section className="section-padding" style={{ background: 'var(--gradient-subtle)' }}>
        <div className="container-width">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Building2 className="h-4 w-4" /> Fase 2
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-6">
              Infraestrutura Preparada para o Futuro
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Projeto e instalação completa de toda a infraestrutura tecnológica do empreendimento,
              com acabamento profissional e organização técnica impecável.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicosEmpreendimento.map((s, i) => (
              <div key={i} className="card-premium p-8 group hover:border-accent/30">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 flex items-center justify-center shrink-0 transition-all mb-5">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{s.desc}</p>
                <div className="flex items-center gap-2 text-sm font-medium text-accent">
                  <TrendingUp className="h-4 w-4" />
                  {s.resultado}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Acabamento & Qualidade */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">Diferencial</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
                Acabamento Profissional
                <br />
                <span className="text-muted-foreground text-2xl sm:text-3xl">que valoriza o empreendimento</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Todos os projetos são realizados com planejamento técnico, cabeamento organizado, 
                identificação de redes e infraestrutura preparada para manutenção futura. 
                Isso reduz problemas técnicos e facilita qualquer expansão tecnológica.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {['Planejamento técnico', 'Cabeamento organizado', 'Identificação de redes', 'Preparado para expansão'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/10">
                    <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">Suporte Administrativo</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
                TI para o Escritório
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Além da infraestrutura de obra, oferecemos suporte técnico especializado para o setor administrativo 
                da construtora — um diferencial raro no mercado.
              </p>
              <div className="space-y-4">
                {servicosAdmin.map((s, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-accent/20 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <s.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{s.title}</h4>
                      <p className="text-muted-foreground text-sm">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
              Infraestrutura que Agrega Valor ao Empreendimento
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-2">
              Garantimos que a infraestrutura tecnológica seja entregue com qualidade, organização e confiabilidade.
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
            <p className="text-white/70 text-lg mb-1">Da fundação ao acabamento digital</p>
            <p className="text-white font-bold text-xl mb-8">seu empreendimento merece tecnologia de verdade.</p>
            <a
              href="https://wa.me/5547992858578?text=Olá!%20Tenho%20interesse%20nos%20serviços%20de%20tecnologia%20para%20construtoras."
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
