import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import logoAzul from '@/assets/logo-azul.png';

export function Contact() {
  return (
    <section id="contato" className="section-padding bg-silver">
      <div className="container-width">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Contato</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-6">
            Fale com a Testoni Tecnologia
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Entre em contato conosco para saber como podemos ajudar sua empresa.
          </p>
          <div className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            {/* Logo */}
            <img src={logoAzul} alt="Testoni Tecnologia" className="h-12 w-auto" />

            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Endereço</h3>
                <p className="text-muted-foreground">
                  Avenida Santa Amaro, 1749 — Marina Belmar<br />
                  Balneário Camboriú — SC
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Telefone / Emergência</h3>
                <a
                  href="tel:+5547992858578"
                  className="text-accent hover:underline font-medium"
                >
                  (47) 99285-8578
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Horário de Atendimento</h3>
                <p className="text-muted-foreground">
                  Segunda a Sexta: 8h às 18h<br />
                  Sábado: Conforme plano
                </p>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/5547992858578"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#20BD5A] transition-all duration-200 shadow-lg"
            >
              <MessageCircle className="h-6 w-6" />
              Atendimento Rápido via WhatsApp
            </a>
          </div>

          {/* Map */}
          <div className="card-premium overflow-hidden h-[400px] lg:h-auto">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3555.875520647657!2d-48.63534772494682!3d-26.990533876608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94d8b5c6c60d6e13%3A0x6b90be4c00000000!2sAv.%20Santa%20Amaro%2C%201749%20-%20Balne%C3%A1rio%20Cambori%C3%BA%2C%20SC!5e0!3m2!1spt-BR!2sbr!4v1706000000000!5m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização Testoni Tecnologia"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
