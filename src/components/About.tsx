import { Target, Eye, Heart, Award, Users, Lightbulb } from 'lucide-react';

const values = [
  { icon: Heart, title: 'Compromisso', description: 'Dedicação total aos nossos clientes' },
  { icon: Eye, title: 'Transparência', description: 'Comunicação clara e honesta' },
  { icon: Award, title: 'Excelência', description: 'Padrão elevado em tudo que fazemos' },
  { icon: Users, title: 'Foco no Cliente', description: 'Sua necessidade é nossa prioridade' },
  { icon: Lightbulb, title: 'Atualização', description: 'Sempre à frente das novidades' },
  { icon: Target, title: 'Responsabilidade', description: 'Compromisso com resultados' },
];

export function About() {
  return (
    <section id="sobre" className="section-padding bg-silver">
      <div className="container-width">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Sobre Nós</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-6">
            Quem Somos
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Text Content */}
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              A <strong className="text-foreground">Testoni Tecnologia</strong> atua desde 2011 no mercado de tecnologia empresarial, com formalização em 2013.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Atendemos hotéis, empresas, eventos, condomínios, bares, restaurantes, clínicas e escritórios com excelência e dedicação.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Hoje, somos referência em <strong className="text-foreground">atendimento resolutivo</strong> e <strong className="text-foreground">gestão completa de tecnologia</strong>, com um modelo moderno, estruturado e premium.
            </p>
          </div>

          {/* Mission & Vision Cards */}
          <div className="space-y-6">
            <div className="card-premium p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Missão</h3>
              </div>
              <p className="text-muted-foreground">
                Garantir continuidade operacional, segurança e desempenho tecnológico aos nossos clientes.
              </p>
            </div>

            <div className="card-premium p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Visão</h3>
              </div>
              <p className="text-muted-foreground">
                Ser referência regional em suporte premium e terceirização de TI.
              </p>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div>
          <h3 className="text-2xl font-bold text-foreground text-center mb-10">Nossos Valores</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl bg-background border border-border/50 hover:border-accent/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-accent/10 flex items-center justify-center mb-4 transition-colors duration-300">
                  <value.icon className="h-6 w-6 text-primary group-hover:text-accent transition-colors duration-300" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{value.title}</h4>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
