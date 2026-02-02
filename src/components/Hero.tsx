import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, CheckCircle, User } from 'lucide-react';
import logoBranco from '@/assets/logo-branco.png';

const highlights = [{
  icon: Shield,
  text: 'Desde 2011'
}, {
  icon: CheckCircle,
  text: 'Atendimento Premium'
}, {
  icon: Clock,
  text: 'Suporte Emergencial'
}];

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden" style={{
      background: 'var(--gradient-hero)'
    }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-secondary-foreground">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Animated Circles */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }} />

      <div className="container-width section-padding relative z-10 pt-32">
        <div className="max-w-4xl">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 animate-fade-in">
            <img src={logoBranco} alt="Testoni Tecnologia" className="h-6 w-auto" />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up">
            Atenção em Tecnologia
            <br />
            <span className="text-white/80">para Empresas</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-8 animate-slide-up" style={{
            animationDelay: '0.1s'
          }}>
            Soluções completas em infraestrutura, segurança, comunicação e suporte empresarial em Balneário Camboriú e região.
          </p>

          {/* Highlights */}
          <div className="flex flex-wrap gap-4 mb-10 animate-slide-up" style={{
            animationDelay: '0.2s'
          }}>
            {highlights.map((item, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <item.icon className="h-5 w-5 text-white/90" />
                <span className="text-sm font-medium text-white/90">{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{
            animationDelay: '0.3s'
          }}>
            <a 
              href="https://wa.me/5547992858578" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-2 bg-white text-navy-deep px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Fale Conosco Agora
              <ArrowRight className="h-5 w-5" />
            </a>
            <Link 
              to="/auth" 
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-all duration-200"
            >
              <User className="h-5 w-5" />
              Portal do Cliente
            </Link>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-8 left-0 right-0 section-padding !py-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white/60 text-sm">
            <span className="flex items-center gap-2">📍 Camboriú – SC – Brasil</span>
            <span className="hidden sm:block">•</span>
            <span>Atendimento premium, direto com o responsável técnico</span>
          </div>
        </div>
      </div>
    </section>
  );
}
