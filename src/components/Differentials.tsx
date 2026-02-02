import { 
  CheckCircle, 
  UserCheck, 
  Shield, 
  Clock, 
  Headphones, 
  Award,
  Target
} from 'lucide-react';

const differentials = [
  {
    icon: UserCheck,
    title: 'Atendimento Direto',
    description: 'Fale diretamente com o responsável técnico, sem intermediários ou atendentes genéricos.',
  },
  {
    icon: Shield,
    title: 'Sem Terceirização',
    description: 'Não repassamos seu chamado para terceiros. Responsabilidade total sobre cada demanda.',
  },
  {
    icon: Award,
    title: 'Histórico Comprovado',
    description: 'Mais de uma década de experiência atendendo empresas de diversos segmentos.',
  },
  {
    icon: Target,
    title: 'Operação Crítica',
    description: 'Experiência em operações que não podem parar: hotéis, eventos e alta temporada.',
  },
  {
    icon: CheckCircle,
    title: 'Resolução Definitiva',
    description: 'Foco em resolver problemas de forma definitiva, não em soluções paliativas.',
  },
  {
    icon: Headphones,
    title: 'Atendimento Humano',
    description: 'Atendimento personalizado, sem robôs ou menus automáticos intermináveis.',
  },
  {
    icon: Clock,
    title: 'Pós-Venda Ativo',
    description: 'Acompanhamento contínuo para garantir que tudo continue funcionando perfeitamente.',
  },
];

export function Differentials() {
  return (
    <section id="diferenciais" className="section-padding relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-white/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-white/5 to-transparent" />
      </div>

      <div className="container-width relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-white/80 font-semibold text-sm uppercase tracking-wider">Diferenciais</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-6">
            Por Que Escolher a Testoni?
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            Mais do que tecnologia, oferecemos parceria, confiança e resultados.
          </p>
          <div className="w-20 h-1 bg-white/30 mx-auto rounded-full mt-6" />
        </div>

        {/* Differentials Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {differentials.map((item, index) => (
            <div
              key={index}
              className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/20 hover:border-white/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center mb-4 transition-colors duration-300">
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-white/70">{item.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="https://wa.me/5547992858578"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-navy-deep px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg"
          >
            Converse com um Especialista
          </a>
        </div>
      </div>
    </section>
  );
}
