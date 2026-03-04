import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Home, Camera, Shield, CheckCircle,
  Wifi, Cable, Phone, Lock, Wrench, Zap, Users,
  Eye, AlertTriangle, Lightbulb, Radio, TrendingUp
} from 'lucide-react';

const problemasDoDiaDia = [
  { icon: Camera, problema: 'Câmera parou de gravar', solucao: 'Diagnóstico e reparo rápido do sistema de CFTV' },
  { icon: Lock, problema: 'Portão não abre com a tag', solucao: 'Reprogramação e manutenção do controle de acesso' },
  { icon: Phone, problema: 'Interfone sem comunicação', solucao: 'Revisão e conserto do sistema de interfonia' },
  { icon: Wifi, problema: 'Internet das áreas comuns caiu', solucao: 'Diagnóstico e restabelecimento da rede Wi-Fi' },
  { icon: Zap, problema: 'Problema elétrico em área comum', solucao: 'Manutenção elétrica com profissional qualificado' },
  { icon: Cable, problema: 'Cabos soltos e desorganizados', solucao: 'Organização profissional de racks e cabeamento' },
];

const servicosSeguranca = [
  {
    icon: Camera,
    title: 'Câmeras de Segurança (CFTV)',
    desc: 'Câmeras de alta definição, gravadores DVR/NVR, monitoramento de áreas comuns e acesso remoto pelo celular. Você acompanha tudo de onde estiver.',
  },
  {
    icon: Lock,
    title: 'Controle de Acesso',
    desc: 'Acesso por senha, tag ou cartão. Registro automático de quem entrou, quando e por onde. Mais segurança e controle total para o condomínio.',
  },
  {
    icon: Phone,
    title: 'Interfonia Moderna',
    desc: 'Comunicação entre moradores, portaria e áreas comuns. Sistemas integrados com controle de acesso e aplicativos.',
  },
  {
    icon: Shield,
    title: 'Condomínio Inteligente',
    desc: 'Integração com portarias, abertura automatizada de portões, identificação de usuários e integração com aplicativos de gestão condominial.',
  },
];

const servicosInfra = [
  {
    icon: Cable,
    title: 'Cabeamento Estruturado',
    desc: 'Organização profissional de toda a rede do condomínio: racks, cabos identificados e infraestrutura pronta para expansão.',
  },
  {
    icon: Wifi,
    title: 'Internet e Fibra Óptica',
    desc: 'Preparação para receber operadoras de internet de alta velocidade. Passagem organizada de fibra, shafts técnicos e estrutura para múltiplas operadoras.',
  },
  {
    icon: Zap,
    title: 'Serviços Elétricos',
    desc: 'Manutenção e instalação elétrica para áreas comuns. Um parceiro a menos para o síndico se preocupar.',
  },
  {
    icon: Lightbulb,
    title: 'Modernização Tecnológica',
    desc: 'Atualização de câmeras antigas, modernização de controle de acesso, reorganização de rede e implantação de novas tecnologias.',
  },
];

const beneficios = [
  'Menos dor de cabeça para o síndico',
  'Um único parceiro para toda a tecnologia',
  'Agilidade na resolução de problemas',
  'Mais segurança para os moradores',
  'Infraestrutura organizada e profissional',
  'Suporte técnico rápido e confiável',
];

export default function ConsultoriaCondominios() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent" />
        </div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-white/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.2s' }} />

        <div className="container-width section-padding relative z-10 pt-32">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 mb-6 border border-white/10">
              <Home className="h-5 w-5 text-white/90" />
              <span className="text-sm font-medium text-white/90 tracking-wide">Condomínios Residenciais e Comerciais</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Tecnologia e Segurança
              <br />
              <span className="text-white/80">para o seu Condomínio</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-4 leading-relaxed">
              Um único parceiro para cuidar de câmeras, portões, interfones, internet, 
              controle de acesso e toda a infraestrutura tecnológica do condomínio.
            </p>
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <span className="text-3xl font-bold text-white">+237</span>
                <span className="text-white/70 text-sm ml-2">condomínios atendidos</span>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <span className="text-3xl font-bold text-white">10</span>
                <span className="text-white/70 text-sm ml-2">anos de experiência</span>
              </div>
            </div>
            <a
              href="https://wa.me/5547992858578?text=Olá!%20Tenho%20interesse%20nos%20serviços%20de%20tecnologia%20para%20condomínios."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[hsl(var(--navy-deep))] px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
            >
              Falar com um Especialista <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* O Problema */}
      <section className="section-padding" style={{ background: 'var(--gradient-subtle)' }}>
        <div className="container-width">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">O Problema</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
              Quando algo para de funcionar,
              <br />
              <span className="text-muted-foreground text-2xl sm:text-3xl">o problema sempre chega no síndico.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
              Câmeras, portões, interfones, internet… cada sistema depende de um fornecedor diferente. 
              Quando algo quebra, começa a dor de cabeça. Nós simplificamos isso.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {problemasDoDiaDia.map((item, i) => (
              <div key={i} className="card-premium p-6 group hover:border-accent/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <span className="font-semibold text-foreground text-sm">{item.problema}</span>
                </div>
                <div className="flex items-start gap-3 pl-1">
                  <ArrowRight className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <span className="text-muted-foreground text-sm leading-relaxed">{item.solucao}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Segurança e Monitoramento */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Shield className="h-4 w-4" /> Segurança & Controle
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-6">
              Proteção Completa para o Condomínio
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Instalamos, configuramos e mantemos todos os sistemas de segurança. 
              Se der problema, resolvemos rápido.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {servicosSeguranca.map((s, i) => (
              <div key={i} className="card-premium p-8 group hover:border-accent/30">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 flex items-center justify-center shrink-0 transition-all">
                    <s.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infraestrutura */}
      <section className="section-padding" style={{ background: 'var(--gradient-subtle)' }}>
        <div className="container-width">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Cable className="h-4 w-4" /> Infraestrutura & Manutenção
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-6">
              Tudo Funcionando, Sem Complicação
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Rede, internet, elétrica e modernização — cuidamos de tudo para que 
              o síndico não precise se preocupar com a parte técnica.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {servicosInfra.map((s, i) => (
              <div key={i} className="card-premium p-8 group hover:border-accent/30">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 flex items-center justify-center shrink-0 transition-all">
                    <s.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
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
            <span className="text-white/70 font-semibold text-sm uppercase tracking-wider">Por que a Testoni?</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-6">
              Menos Fornecedores, Menos Problemas
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Centralizamos toda a parte tecnológica do condomínio em um único parceiro. 
              Resultado: mais agilidade, menos preocupação.
            </p>
            <div className="w-20 h-1 bg-white/30 mx-auto rounded-full mt-6" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {beneficios.map((b, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-colors">
                <CheckCircle className="h-5 w-5 text-white/90 shrink-0" />
                <span className="text-white font-medium text-sm">{b}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-xl mx-auto mb-8">
              <p className="text-white/80 text-lg mb-2">Mais de</p>
              <p className="text-5xl font-bold text-white mb-2">237 condomínios</p>
              <p className="text-white/70">atendidos nos últimos 10 anos em Balneário Camboriú e região.</p>
            </div>
            <a
              href="https://wa.me/5547992858578?text=Olá!%20Tenho%20interesse%20nos%20serviços%20de%20tecnologia%20para%20condomínios."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[hsl(var(--navy-deep))] px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
            >
              Solicitar uma Visita Técnica <ArrowRight className="h-5 w-5" />
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
