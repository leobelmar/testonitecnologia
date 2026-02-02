import { Phone, Mail, MapPin } from 'lucide-react';
import logoBranco from '@/assets/logo-branco.png';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Sobre', href: '#sobre' },
  { name: 'Serviços', href: '#servicos' },
  { name: 'Soluções', href: '#solucoes' },
  { name: 'Planos', href: '#planos' },
  { name: 'Diferenciais', href: '#diferenciais' },
  { name: 'Contato', href: '#contato' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-deep text-white">
      <div className="container-width section-padding !py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <img src={logoBranco} alt="Testoni Tecnologia" className="h-10 w-auto mb-6" />
            <p className="text-white/70 mb-6 max-w-md">
              Atenção em Tecnologia para Empresas. Soluções completas em infraestrutura, segurança, comunicação e suporte empresarial em Balneário Camboriú e região.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://wa.me/5547992858578"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Navegação</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contato</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-white/50 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">
                  Av. Santa Amaro, 1749<br />
                  Balneário Camboriú — SC
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-white/50 flex-shrink-0" />
                <a
                  href="tel:+5547992858578"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  (47) 99285-8578
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/50">
              © {currentYear} Testoni Tecnologia. Todos os direitos reservados.
            </p>
            <p className="text-sm text-white/50">
              Suporte de TI em Balneário Camboriú — SC
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
