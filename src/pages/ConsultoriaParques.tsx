import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle, Ticket, Camera, Shield,
  Wifi, Cable, Cpu, Users, ShoppingCart, Smartphone,
  BarChart3, Zap, Radio, Eye, MapPin, TreePalm, TrendingUp,
  MonitorSmartphone, ScanLine, AlertTriangle
} from 'lucide-react';

const desafios = [
  { icon: Users, problema: 'Filas enormes na bilheteria', solucao: 'Venda online de ingressos e catracas automáticas que agilizam o fluxo de entrada' },
  { icon: Wifi, problema: 'Visitantes reclamam da internet', solucao: 'Wi-Fi de alta capacidade com cobertura total — visitantes compartilham e você ganha marketing gratuito' },
  { icon: Camera, problema: 'Não sabe o que acontece no parque', solucao: 'Câmeras com inteligência artificial e monitoramento em tempo real de todas as áreas' },
  { icon: ShoppingCart, problema: 'PDVs lentos e sem controle', solucao: 'Sistemas integrados para restaurantes, bares e quiosques com relatórios de vendas' },
  { icon: Zap, problema: 'Equipamento parou sem aviso', solucao: 'Sensores IoT que monitoram máquinas e enviam alertas antes da falha' },
  { icon: ScanLine, problema: 'Sem controle de quem entrou', solucao: 'Controle de acesso com registro automático, capacidade em tempo real e reconhecimento facial' },
];

const servicosVendas = [
  {
    icon: Ticket,
    title: 'Bilheteria Digital Integrada',
    desc: 'Venda de ingressos online e presencial, controle total de bilheteria, integração com financeiro e relatórios de desempenho. Seus visitantes compram mais rápido, você vende mais.',
    destaque: 'Aumente a receita com vendas online',
  },
  {
    icon: ShoppingCart,
    title: 'PDV para Alimentação e Lojas',
    desc: 'Sistemas modernos de ponto de venda para restaurantes, bares, quiosques e lojas. Controle de estoque, integração com cozinha e relatórios de vendas por ponto.',
    destaque: 'Controle total de múltiplos pontos de venda',
  },
  {
    icon: BarChart3,
    title: 'Análise de Fluxo e Desempenho',
    desc: 'Saiba exatamente quantas pessoas entraram, em quais horários, quais áreas têm mais movimento e onde estão as oportunidades de receita.',
    destaque: 'Dados para tomar decisões que geram lucro',
  },
  {
    icon: Smartphone,
    title: 'App e Experiência do Visitante',
    desc: 'Mapas interativos, filas inteligentes, notificações de eventos e informações sobre atrações. Visitantes satisfeitos voltam — e indicam.',
    destaque: 'Visitante feliz = mais visitas e mais receita',
  },
];

const servicosOperacao = [
  {
    icon: ScanLine,
    title: 'Controle de Acesso Inteligente',
    desc: 'Catracas eletrônicas, ingressos digitais, reconhecimento facial e controle de capacidade em tempo real. Saiba quem entrou, quando e quantas pessoas estão no parque.',
  },
  {
    icon: Camera,
    title: 'Monitoramento com IA',
    desc: 'Câmeras de alta definição com inteligência artificial: detecção de movimento, análise de comportamento e alertas automáticos. Mais segurança, menos incidentes.',
  },
  {
    icon: Wifi,
    title: 'Wi-Fi de Alta Performance',
    desc: 'Redes separadas para visitantes e operação, controle inteligente de banda e cobertura em toda a área. Visitantes compartilham fotos e vídeos — marketing gratuito pro parque.',
  },
  {
    icon: Cpu,
    title: 'IoT e Automação',
    desc: 'Monitoramento de equipamentos, controle de atrações, sensores de consumo de energia e alertas automáticos de falhas. Menos paradas, mais eficiência.',
  },
  {
    icon: Cable,
    title: 'Infraestrutura Completa',
    desc: 'Cabeamento estruturado, redes de dados, infraestrutura elétrica, instalação de equipamentos e organização profissional de racks e servidores.',
  },
  {
    icon: Eye,
    title: 'Controle Operacional',
    desc: 'Monitoramento de áreas operacionais, análise de fluxo de visitantes e câmeras com IA para otimizar produtividade e movimentação de equipes.',
  },
];

const resultados = [
  'Mais vendas com bilheteria digital',
  'Menos filas = mais visitantes satisfeitos',
  'Marketing gratuito via Wi-Fi',
  'Segurança com inteligência artificial',
  'Operação sem paradas inesperadas',
  'Dados para tomar decisões inteligentes',
  'Um único parceiro tecnológico',
  'Experiência moderna para o visitante',
  'Controle total de receita e fluxo',
];

export default function ConsultoriaParques() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
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
              <TreePalm className="h-5 w-5 text-white/90" />
              <span className="text-sm font-medium text-white/90 tracking-wide">Parques e Atrações Turísticas</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Tecnologia que faz
              <br />
              <span className="text-white/80">seu parque vender mais</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-4 leading-relaxed">
              Bilheteria digital, controle de acesso, Wi-Fi para visitantes, PDV integrado, 
              câmeras com IA e operação automatizada. Tudo isso em um único parceiro.
            </p>
            <p className="text-base text-white/60 max-w-2xl mb-10">
              Mais controle da operação. Melhor experiência para o visitante.
              <strong className="text-white/80"> Mais receita para o parque.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/5547992858578?text=Olá!%20Tenho%20interesse%20nos%20serviços%20de%20tecnologia%20para%20parques."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-[hsl(var(--navy-deep))] px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
              >
                Quero Vender Mais <ArrowRight className="h-5 w-5" />
              </a>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>16 anos de experiência em tecnologia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desafios do dia a dia */}
      <section className="section-padding" style={{ background: 'var(--gradient-subtle)' }}>
        <div className="container-width">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Isso parece familiar?</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
              Problemas que custam dinheiro
              <br />
              <span className="text-muted-foreground text-2xl sm:text-3xl">todo santo dia.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
              Cada problema abaixo é um visitante insatisfeito, uma venda perdida ou um risco de segurança. 
              Nós resolvemos todos eles.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {desafios.map((item, i) => (
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

      {/* Como fazemos você vender mais */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
              <TrendingUp className="h-4 w-4" /> Mais Receita
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-6">
              Tecnologia que Aumenta suas Vendas
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Não é só sobre infraestrutura. É sobre usar tecnologia para 
              <strong className="text-foreground"> vender mais ingressos, mais comida, mais experiências</strong>.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {servicosVendas.map((s, i) => (
              <div key={i} className="card-premium p-8 group hover:border-accent/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-accent/10 text-accent px-4 py-1.5 rounded-bl-xl text-xs font-semibold">
                  {s.destaque}
                </div>
                <div className="flex items-start gap-5 mt-4">
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

      {/* Operação e Segurança */}
      <section className="section-padding" style={{ background: 'var(--gradient-subtle)' }}>
        <div className="container-width">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Shield className="h-4 w-4" /> Operação & Segurança
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-6">
              Controle Total da Operação
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Segurança, monitoramento, automação e infraestrutura — tudo funcionando 
              para que você possa focar no que importa: <strong className="text-foreground">crescer</strong>.
            </p>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {servicosOperacao.map((s, i) => (
              <div key={i} className="card-premium p-7 group hover:border-accent/30">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 flex items-center justify-center mb-5 transition-all">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
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
            <span className="text-white/70 font-semibold text-sm uppercase tracking-wider">Resultado</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-6">
              O que Muda no Seu Parque
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Com a tecnologia certa, seu parque opera melhor, gasta menos 
              com problemas e <strong className="text-white">fatura mais</strong>.
            </p>
            <div className="w-20 h-1 bg-white/30 mx-auto rounded-full mt-6" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {resultados.map((r, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-colors">
                <CheckCircle className="h-5 w-5 text-white/90 shrink-0" />
                <span className="text-white font-medium text-sm">{r}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-xl mx-auto mb-8">
              <p className="text-white/80 text-lg mb-2">Parceiro tecnológico com</p>
              <p className="text-5xl font-bold text-white mb-2">16 anos</p>
              <p className="text-white/70">de experiência estruturando operações para empresas de turismo e entretenimento.</p>
            </div>
            <a
              href="https://wa.me/5547992858578?text=Olá!%20Tenho%20interesse%20nos%20serviços%20de%20tecnologia%20para%20parques%20e%20atrações%20turísticas."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[hsl(var(--navy-deep))] px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
            >
              Quero Modernizar Meu Parque <ArrowRight className="h-5 w-5" />
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
