import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Brain, Rocket } from 'lucide-react';

export function DevCTA() {
  return (
    <section className="py-20 bg-secondary relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="container-width section-padding !py-0 relative z-10">
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-lg">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-6">
                <Code2 className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-accent">Desenvolvimento de Software</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                Transformamos ideias em sistemas que
                <span className="text-accent"> funcionam no mundo real.</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Sistemas de gestão, apps mobile, e-commerce, plataformas EAD e muito mais. Desenvolvimento potencializado por IA, com equipe global e mais de 200 projetos entregues.
              </p>
              <Link
                to="/desenvolvimento"
                className="inline-flex items-center gap-2 btn-primary text-base py-3 px-8"
              >
                Conheça nossos serviços de desenvolvimento
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              {[
                { icon: Rocket, label: '+200 Projetos', desc: 'Sistemas em operação por todo o Brasil' },
                { icon: Brain, label: 'IA no Código', desc: 'Entregas mais rápidas e custos menores' },
                { icon: Code2, label: 'Equipe Global', desc: 'Especialistas remotos para cada projeto' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/80 border border-border">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
