import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Hotel, Wifi, Phone, Camera, Monitor,
  Shield, CheckCircle, Globe, Clock, Headphones, Cable, Tv,
  Smartphone, AlertTriangle, Lightbulb, TrendingUp, Zap, Radio
} from 'lucide-react';

const servicosPrincipais = [
  {
    icon: Headphones,
    title: 'Suporte Direto ao Hóspede',
    desc: 'Atendimento técnico ao hóspede para problemas com Wi-Fi, Smart TV, notebook, VPN e dispositivos. Suporte multilíngue: Português, Inglês, Espanhol, Alemão, Russo, Chinês e Árabe.',
    resultado: 'Menos frustração para o hóspede, mais tranquilidade para o hotel.',
  },
  {
    icon: Clock,
    title: 'Suporte 24/7/365',
    desc: 'Suporte técnico contínuo, 24 horas por dia, 7 dias por semana, 365 dias por ano. Atendimento remoto imediato ou deslocamento técnico quando necessário.',
    resultado: 'Operação protegida a qualquer hora, inclusive feriados e alta temporada.',
  },
  {
    icon: Wifi,
    title: 'Wi-Fi de Alta Performance',
    desc: 'Redes projetadas para suportar grande volume de dispositivos simultâneos: smartphones, tablets, notebooks, Smart TVs, streaming e sistemas internos.',
    resultado: 'Rede estável e rápida em quartos, áreas comuns, eventos e convenções.',
  },
  {
    icon: Cable,
    title: 'Cabeamento Estruturado',
    desc: 'Projeto e implementação de cabeamento estruturado profissional, garantindo organização, estabilidade e capacidade de expansão futura.',
    resultado: 'Base sólida para crescimento tecnológico sem reconstruir infraestrutura.',
  },
  {
    icon: Tv,
    title: 'IPTV para Hotelaria',
    desc: 'Transforme a TV do quarto em plataforma de informação e entretenimento: canais IP, canal institucional, comunicação com hóspedes e conteúdo personalizado.',
    resultado: 'Ferramenta estratégica de comunicação com o hóspede.',
  },
  {
    icon: Phone,
    title: 'Telefonia VoIP',
    desc: 'Sistemas de telefonia modernos integrando recepção, governança, manutenção, restaurante, administração e apartamentos com centrais IP e VoIP.',
    resultado: 'Comunicação interna eficiente e profissional.',
  },
  {
    icon: Shield,
    title: 'Segurança de Rede',
    desc: 'Firewalls corporativos, controle de acesso à internet, bloqueio de sites inadequados, filtros de conteúdo, proteção contra ataques e segmentação de rede.',
    resultado: 'Proteção digital para o hotel e para os hóspedes.',
  },
  {
    icon: Camera,
    title: 'Câmeras e Segurança Inteligente',
    desc: 'Câmeras IP de alta definição, monitoramento remoto e leitura automática de placas (OCR) com acesso automático ao estacionamento para hóspedes.',
    resultado: 'Mais segurança e melhor experiência com tecnologia inteligente.',
  },
];

const servicosAdicionais = [
  {
    icon: Globe,
    title: 'Hotspot para Eventos',
    desc: 'Senhas temporárias, controle de acesso por usuário, limitação de banda e registro de acessos conforme exigências legais.',
  },
  {
    icon: Smartphone,
    title: 'Portal do Hóspede',
    desc: 'Portal via QR Code ou app personalizado: informações da hospedagem, solicitação de serviços, comunicação com recepção.',
  },
  {
    icon: Zap,
    title: 'Resposta a Incidentes Críticos',
    desc: 'Atuação imediata em quedas de rede, falhas de sistemas, interrupções de telefonia e problemas graves de infraestrutura.',
  },
  {
    icon: Lightbulb,
    title: 'Inovação Contínua',
    desc: 'Parceria para identificar oportunidades e implementar novas tecnologias que beneficiem a operação e a experiência do hóspede.',
  },
];

const problemasComuns = [
  'Hóspede não consegue conectar ao Wi-Fi',
  'Smart TV do quarto não funciona',
  'VPN corporativa não conecta',
  'Rede instável em horários de pico',
  'Falhas de telefonia entre setores',
  'Sistemas caem sem suporte disponível',
  'Hóspede estrangeiro sem suporte técnico no idioma',
  'Avaliações negativas por problemas de tecnologia',
  'Falta de monitoramento em áreas críticas',
];

const idiomas = [
  'Português', 'Inglês', 'Espanhol', 'Alemão', 'Russo', 'Chinês', 'Árabe'
];

export default function ConsultoriaHotelaria() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent" />
        </div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container-width section-padding relative z-10 pt-32">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Hotel className="h-5 w-5 text-white/90" />
              <span className="text-sm font-medium text-white/90">Hotelaria & Resorts</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Tecnologia e Suporte para
              <br />
              <span className="text-white/80">Hotéis, Resorts & Pousadas</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-8">
              Infraestrutura tecnológica que protege a operação e eleva a experiência do hóspede. 
              Suporte 24/7, Wi-Fi de alta performance, IPTV, segurança e muito mais.
            </p>
            <a
              href="https://wa.me/5547992858578?text=Olá!%20Tenho%20interesse%20nos%20serviços%20de%20tecnologia%20para%20hotelaria."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[hsl(var(--navy-deep))] px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg"
            >
              Solicitar Diagnóstico <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Contexto */}
      <section className="section-padding" style={{ background: 'var(--gradient-subtle)' }}>
        <div className="container-width">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">O Desafio</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
              Quando a tecnologia falha, o hóspede sente
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
              Na hotelaria moderna, a tecnologia é parte fundamental da experiência do hóspede e da reputação do hotel. 
              Quando ela falha, o impacto é imediato.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {problemasComuns.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços Principais */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Nossas Soluções</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
              Infraestrutura Completa para Hotelaria
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Assumimos a responsabilidade pela infraestrutura tecnológica do hotel para que sua equipe possa focar no que importa: a experiência do hóspede.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {servicosPrincipais.map((s, i) => (
              <div key={i} className="card-premium p-8 group hover:border-accent/30">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 flex items-center justify-center shrink-0 transition-all">
                    <s.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{s.desc}</p>
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

      {/* Suporte Multilíngue */}
      <section className="section-padding" style={{ background: 'var(--gradient-subtle)' }}>
        <div className="container-width">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">Diferencial Exclusivo</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
                Suporte Multilíngue ao Hóspede
              </h2>
              <p className="text-muted-foreground mb-6">
                Nossa equipe está preparada para atender hóspedes internacionais em diversos idiomas, 
                eliminando barreiras de comunicação no suporte técnico.
              </p>
              <div className="flex flex-wrap gap-3">
                {idiomas.map((idioma, i) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                    <Globe className="h-4 w-4" />
                    {idioma}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">Soluções Adicionais</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
                Além da Infraestrutura
              </h2>
              <div className="space-y-4">
                {servicosAdicionais.map((s, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border/50">
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
        <div className="container-width relative z-10">
          <div className="text-center mb-12">
            <span className="text-white/70 font-semibold text-sm uppercase tracking-wider">Nosso Compromisso</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-6">
              Tecnologia Confiável para a Hotelaria Moderna
            </h2>
            <div className="w-20 h-1 bg-white/30 mx-auto rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Suporte 24/7 dedicado',
              'Wi-Fi de alta performance',
              'Atendimento multilíngue',
              'Segurança inteligente',
              'IPTV e comunicação digital',
              'Telefonia VoIP integrada',
              'Resposta rápida a incidentes',
              'Inovação contínua',
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <CheckCircle className="h-6 w-6 text-white/90 shrink-0" />
                <span className="text-white font-medium">{r}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-white/70 text-lg mb-2">Garantir que a tecnologia funcione perfeitamente</p>
            <p className="text-white font-bold text-xl mb-8">para que seu hotel funcione perfeitamente.</p>
            <a
              href="https://wa.me/5547992858578?text=Olá!%20Tenho%20interesse%20nos%20serviços%20de%20tecnologia%20para%20hotelaria."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[hsl(var(--navy-deep))] px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg"
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
