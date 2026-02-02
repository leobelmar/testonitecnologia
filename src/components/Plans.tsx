import { Check, Star, Phone, Clock, Shield, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Essencial',
    price: 'R$ 297',
    period: '/mês',
    description: 'Ideal para pequenas empresas',
    features: [
      'Suporte remoto',
      'Sistemas',
      'Backup básico',
      'Horário comercial',
    ],
    highlighted: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 497',
    period: '/mês',
    description: 'O mais escolhido pelos nossos clientes',
    features: [
      'Suporte completo',
      '1 visita/mês',
      'Preventiva',
      'Monitoramento',
    ],
    highlighted: true,
  },
  {
    name: 'Premium',
    price: 'R$ 897',
    period: '/mês',
    description: 'Para empresas que exigem o máximo',
    features: [
      'Plantão',
      'Emergência',
      'Prioridade',
      'Segurança avançada',
    ],
    highlighted: false,
  },
  {
    name: 'Corporativo',
    price: 'A partir de R$ 1.500',
    period: '/mês',
    description: 'Sob consulta',
    features: [
      'TI dedicado',
      'SLA personalizado',
      'Outsourcing completo',
      'Gestão estratégica',
    ],
    highlighted: false,
  },
];

const emergencyRates = [
  { time: 'Sem contrato', price: 'R$ 280/h' },
  { time: 'Após 22h', price: 'R$ 480/h' },
  { time: 'Após 01h', price: 'R$ 720/h' },
];

export function Plans() {
  return (
    <section id="planos" className="section-padding bg-background">
      <div className="container-width">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Planos</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-6">
            Escolha o Plano Ideal
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Planos flexíveis para atender empresas de todos os portes, com suporte de qualidade e preço justo.
          </p>
          <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
        </div>

        {/* Plans Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-6 lg:p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-primary to-petrol text-primary-foreground shadow-premium scale-105'
                  : 'card-premium hover:shadow-lg'
              }`}
            >
              {/* Badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                  <Star className="h-3 w-3" />
                  Mais Popular
                </div>
              )}

              {/* Plan Name */}
              <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-foreground'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-6 ${plan.highlighted ? 'text-white/80' : 'text-muted-foreground'}`}>
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-foreground'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className={`h-5 w-5 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-accent'}`} />
                    <span className={`text-sm ${plan.highlighted ? 'text-white/90' : 'text-muted-foreground'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="https://wa.me/5547992858578"
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-3 rounded-lg font-medium transition-all duration-200 ${
                  plan.highlighted
                    ? 'bg-white text-primary hover:bg-white/90'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                Contratar
              </a>
            </div>
          ))}
        </div>

        {/* Hours & Emergency Rates */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Regular Hours */}
          <div className="card-premium p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Horários de Atendimento</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Segunda a Sexta</span>
                <span className="font-medium text-foreground">8h às 18h</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Sábado</span>
                <span className="font-medium text-foreground">Conforme plano</span>
              </div>
            </div>
          </div>

          {/* Emergency Rates */}
          <div className="card-premium p-8 border-accent/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Atendimento Emergencial</h3>
            </div>
            <div className="space-y-3">
              {emergencyRates.map((rate, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{rate.time}</span>
                  <span className="font-bold text-accent">{rate.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
