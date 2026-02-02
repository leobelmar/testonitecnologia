import { 
  Server, 
  Shield, 
  Phone, 
  Building2, 
  UtensilsCrossed, 
  FileCheck,
  Monitor,
  Wifi,
  HardDrive,
  Lock,
  Camera,
  Headphones
} from 'lucide-react';

const services = [
  {
    icon: Server,
    title: 'Infraestrutura e Suporte de TI',
    description: 'Suporte técnico presencial e remoto, manutenção de computadores e servidores.',
    features: ['Suporte técnico', 'Redes e Wi-Fi corporativo', 'Monitoramento', 'Backup', 'Segurança digital', 'Sistemas e PDV'],
  },
  {
    icon: Camera,
    title: 'Segurança Eletrônica',
    description: 'Soluções completas em vigilância e controle de acesso para sua empresa.',
    features: ['Câmeras', 'Alarmes', 'Controle de acesso', 'Fechaduras eletrônicas', 'Interfones', 'Sistemas condominiais'],
  },
  {
    icon: Phone,
    title: 'Telefonia Corporativa e VoIP',
    description: 'Comunicação profissional com telefonia virtual e integração completa.',
    features: ['PABX IP', 'Telefonia virtual', '3CX', 'Integração com operadoras', 'Suporte especializado'],
  },
  {
    icon: Building2,
    title: 'Eventos, Hotelaria e Entretenimento',
    description: 'Suporte especializado para operações de alta demanda.',
    features: ['Suporte 24/7', 'Atendimento ao hóspede', 'Estrutura de redes', 'Baladas e eventos', 'Alta temporada'],
  },
  {
    icon: UtensilsCrossed,
    title: 'Consultoria para Bares e Restaurantes',
    description: 'Otimização de processos e treinamento especializado.',
    features: ['Treinamento de equipe', 'Liderança', 'Gestão de estoque', 'Padronização', 'Cardápio', 'Processos operacionais'],
  },
  {
    icon: FileCheck,
    title: 'Sistemas Fiscais e Contábeis',
    description: 'Automação e suporte para sistemas fiscais e contábeis.',
    features: ['Softwares contábeis', 'Portais governamentais', 'Certificados', 'Automação fiscal'],
  },
];

export function Services() {
  return (
    <section id="servicos" className="section-padding bg-background">
      <div className="container-width">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Nossos Serviços</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-6">
            Soluções Completas em Tecnologia
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Oferecemos uma gama completa de serviços para manter sua empresa operando com eficiência, segurança e alta performance.
          </p>
          <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group card-premium p-8 hover:border-accent/30 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 flex items-center justify-center mb-6 transition-all duration-300">
                <service.icon className="h-7 w-7 text-primary" />
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground mb-6">{service.description}</p>

              {/* Features */}
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
