import { Phone, Mail, MapPin, UtensilsCrossed, Hotel, TreePalm, Building2, Home, Store, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
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
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
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

          {/* Gestão Especializada */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Gestão Especializada</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/consultoria-ab"
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  Bares, Restaurantes e Baladas
                </Link>
              </li>
              <li>
                <Link
                  to="/consultoria-hotelaria"
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Hotel className="h-4 w-4" />
                  Hotéis e Resorts
                </Link>
              </li>
              <li>
                <Link
                  to="/consultoria-parques"
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
                >
                  <TreePalm className="h-4 w-4" />
                  Parques e Atrações
                </Link>
              </li>
              <li>
                <Link
                  to="/consultoria-construtoras"
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Construtoras
                </Link>
              </li>
              <li>
                <Link
                  to="/consultoria-condominios"
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Condomínios
                </Link>
              </li>
              <li>
                <Link
                  to="/consultoria-franquias"
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Store className="h-4 w-4" />
                  Franquias e Shoppings
                </Link>
              </li>
              <li>
                <Link
                  to="/desenvolvimento"
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Code2 className="h-4 w-4" />
                  Apps, Sistemas e Sites
                </Link>
              </li>
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
