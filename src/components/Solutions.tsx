import { Building, Building2, CheckCircle, TrendingUp, Zap, Clock } from 'lucide-react';

const pmeFeatures = [
  'Suporte técnico',
  'Redes e Wi-Fi',
  'Backup',
  'PDV',
  'Câmeras',
  'Telefonia',
  'Consultoria básica',
];

const pmeBenefits = [
  { icon: Zap, text: 'Menos paradas' },
  { icon: CheckCircle, text: 'Menos dor de cabeça' },
  { icon: TrendingUp, text: 'Mais produtividade' },
  { icon: Clock, text: 'Custo previsível' },
];

const corporateFeatures = [
  'Terceirização de TI (Outsourcing)',
  'Managed IT Services',
  'IT Operations Management',
  'Infrastructure Management',
  'Network Operations Center (NOC)',
  'Service Desk',
  'SLA personalizado',
  'Disaster Recovery',
  'Business Continuity',
  'Information Security Management',
  'IT Governance',
  'Vendor Management',
  'Performance Monitoring',
  'Asset Management',
  'Change Management',
];

const corporateBenefits = [
  { icon: Building2, text: 'TI local dedicado' },
  { icon: CheckCircle, text: 'SLA formal' },
  { icon: TrendingUp, text: 'Redução de custos internos' },
  { icon: Zap, text: 'Alta disponibilidade' },
];

export function Solutions() {
  return (
    <section id="solucoes" className="section-padding bg-silver">
      <div className="container-width">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Soluções</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-6">
            Soluções por Porte de Empresa
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Oferecemos soluções personalizadas para empresas de todos os tamanhos, desde PMEs até grandes corporações.
          </p>
          <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
        </div>

        {/* Solutions Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* PME Card */}
          <div className="card-premium p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Pequenas e Médias Empresas</h3>
                  <p className="text-accent font-medium">PMEs</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">
                Soluções práticas, econômicas e eficientes para empresas que precisam de estabilidade.
              </p>

              {/* Target */}
              <div className="bg-secondary rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-foreground mb-2">Indicado para:</p>
                <p className="text-sm text-muted-foreground">
                  Lojas, clínicas, escritórios, restaurantes, pequenas redes.
                </p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Serviços</h4>
                <ul className="grid grid-cols-2 gap-2">
                  {pmeFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3">
                {pmeBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-secondary rounded-lg px-4 py-3">
                    <benefit.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Corporate Card */}
          <div className="card-premium p-8 lg:p-10 relative overflow-hidden border-accent/20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full">
              Premium
            </div>
            
            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Grandes Empresas</h3>
                  <p className="text-accent font-medium">Operações Corporativas</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">
                Soluções avançadas de TI Gerenciada, Outsourcing e Managed Services para empresas que exigem alto desempenho.
              </p>

              {/* Features */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Serviços Corporativos</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-2">
                  {corporateFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3">
                {corporateBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-accent/5 rounded-lg px-4 py-3">
                    <benefit.icon className="h-5 w-5 text-accent" />
                    <span className="text-sm font-medium text-foreground">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
