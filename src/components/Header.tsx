import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import logoAzul from '@/assets/logo-azul.png';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Sobre', href: '#sobre' },
  { name: 'Serviços', href: '#servicos' },
  { name: 'Soluções', href: '#solucoes' },
  { name: 'Planos', href: '#planos' },
  { name: 'Diferenciais', href: '#diferenciais' },
  { name: 'Contato', href: '#contato' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container-width section-padding !py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center">
            <img
              src={logoAzul}
              alt="Testoni Tecnologia"
              className="h-8 sm:h-10 w-auto"
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors link-underline"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Button - Desktop */}
          <a
            href="https://wa.me/5547992858578"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 btn-primary text-sm"
          >
            <Phone className="h-4 w-4" />
            <span>Fale Conosco</span>
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-foreground"
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-t border-border shadow-lg animate-fade-in">
            <div className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-foreground/80 hover:text-primary py-2 border-b border-border/50 last:border-0"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="https://wa.me/5547992858578"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-center flex items-center justify-center gap-2"
              >
                <Phone className="h-4 w-4" />
                <span>Fale Conosco</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
