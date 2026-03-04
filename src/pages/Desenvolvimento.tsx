import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Code2, Smartphone, Globe, Brain, Users, Rocket, Monitor, ShoppingCart, GraduationCap, Building2, Layers, Zap, CheckCircle, Phone } from 'lucide-react';
import logoBranco from '@/assets/logo-branco.png';

const solucoes = [
  { icon: Monitor, title: 'Sistemas de Gestão', desc: 'Gestão empresarial e financeira sob medida' },
  { icon: Layers, title: 'Helpdesk & Suporte', desc: 'Sistemas internos de suporte técnico' },
  { icon: Building2, title: 'Plataformas Corporativas', desc: 'Sistemas administrativos e corporativos' },
  { icon: ShoppingCart, title: 'E-commerce & Vendas', desc: 'Sistemas de vendas online completos' },
  { icon: GraduationCap, title: 'Plataformas EAD', desc: 'Cursos online e portais educacionais' },
  { icon: Smartphone, title: 'Apps Mobile', desc: 'Aplicativos para iOS e Android' },
  { icon: Globe, title: 'Websites & Landing Pages', desc: 'Sites institucionais e campanhas digitais' },
  { icon: Code2, title: 'Sistemas Sob Demanda', desc: 'Soluções personalizadas para cada negócio' },
];

const diferenciais = [
  { icon: Brain, title: 'IA no Desenvolvimento', desc: 'Inteligência artificial para acelerar entregas e reduzir custos' },
  { icon: Users, title: 'Equipe Global', desc: 'Programadores remotos com diferentes especialidades técnicas' },
  { icon: Rocket, title: '+200 Projetos', desc: 'Mais de uma década gerenciando projetos de tecnologia' },
  { icon: Zap, title: 'Gestão Profissional', desc: 'Cada projeto conduzido com método, experiência e visão de negócio' },
];

export default function Desenvolvimento() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container-width section-padding relative z-10 pt-32">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao site
          </Link>

          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Code2 className="h-5 w-5 text-white/90" />
            <span className="text-sm font-medium text-white/90">Desenvolvimento de Software</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-4xl animate-slide-up">
            Da ideia ao sistema em operação:
            <br />
            <span className="text-white/80">tecnologia desenvolvida com estratégia e experiência.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Unimos gestão profissional de projetos, equipe global de desenvolvimento e inteligência artificial para criar soluções digitais modernas e eficientes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <a
              href="https://wa.me/5547992858578"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-navy-deep px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Fale sobre seu Projeto
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Authority Quote */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-width section-padding !py-0">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl sm:text-2xl font-medium leading-relaxed opacity-90">
              "Tecnologia não é apenas código. É estratégia, organização e execução eficiente."
            </p>
            <p className="mt-4 text-sm opacity-70">Mais de 200 projetos gerenciados e sistemas em operação comprovam nossa experiência.</p>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section className="py-20">
        <div className="container-width section-padding !py-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">Quem Somos</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-6">
                Desenvolvimento de Sistemas, Aplicações e Plataformas Digitais
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Na Testoni Tecnologia, desenvolvemos sistemas, aplicações e plataformas digitais sob medida para empresas que buscam mais eficiência, automação e crescimento sustentável.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Cada projeto é conduzido diretamente por Leonardo Testoni, gestor de projetos com mais de 10 anos de experiência, responsável por estruturar, coordenar e acompanhar todas as etapas do desenvolvimento.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ao longo dessa trajetória, já foram mais de 200 projetos de tecnologia gerenciados, incluindo sistemas complexos que permanecem em operação até hoje.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {diferenciais.map((item) => (
                <div key={item.title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Phrase */}
      <section className="bg-secondary py-12">
        <div className="container-width section-padding !py-0 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            Código com estratégia. <span className="text-accent">Software que resolve problemas.</span>
          </p>
        </div>
      </section>

      {/* Soluções */}
      <section className="py-20">
        <div className="container-width section-padding !py-0">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Soluções</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-4">
              O que Desenvolvemos
            </h2>
            <p className="text-muted-foreground">
              Criamos sistemas e plataformas digitais adaptados às necessidades específicas de cada negócio.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {solucoes.map((item) => (
              <div key={item.title} className="group bg-card border border-border rounded-2xl p-6 hover:border-accent/40 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-accent/10 flex items-center justify-center mb-4 transition-colors">
                  <item.icon className="h-6 w-6 text-primary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IA + Equipe Global */}
      <section className="py-20 bg-secondary">
        <div className="container-width section-padding !py-0">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Brain className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Desenvolvimento potencializado por IA</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Utilizamos ferramentas avançadas de inteligência artificial para auxiliar no desenvolvimento de código, o que permite acelerar processos de programação, otimizar etapas técnicas e reduzir significativamente o custo de desenvolvimento.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Com essa abordagem, conseguimos entregar soluções robustas de forma mais rápida, eficiente e economicamente viável.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Equipe global de desenvolvimento</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nossa equipe de programação é formada por profissionais remotos localizados em diferentes regiões do mundo, permitindo reunir especialistas com diferentes experiências e competências técnicas.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Esse modelo nos permite montar equipes sob medida para cada projeto, garantindo agilidade, qualidade técnica e eficiência na execução.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Princípios */}
      <section className="py-20">
        <div className="container-width section-padding !py-0">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Nosso Compromisso</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-4">
              Tecnologia aplicada ao crescimento do negócio
            </h2>
            <p className="text-muted-foreground">
              Mais do que desenvolver software, nosso objetivo é criar ferramentas digitais que realmente façam diferença na operação das empresas.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { label: 'Intuitiva', desc: 'Para os usuários utilizarem com facilidade' },
              { label: 'Confiável', desc: 'Para a operação funcionar sem falhas' },
              { label: 'Escalável', desc: 'Para acompanhar o crescimento do negócio' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent" />
        </div>
        <div className="container-width section-padding !py-0 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Projetos bem executados geram resultados reais.
          </h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
            Conte-nos sobre sua ideia ou necessidade e receba uma proposta personalizada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5547992858578"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-navy-deep px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
            >
              <Phone className="h-5 w-5" />
              Fale sobre seu Projeto
            </a>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar ao site
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
