import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, User } from 'lucide-react';

const navLinks = [{
  name: 'Home',
  href: '#home'
}, {
  name: 'Sobre',
  href: '#sobre'
}, {
  name: 'Serviços',
  href: '#servicos'
}, {
  name: 'Soluções',
  href: '#solucoes'
}, {
  name: 'Planos',
  href: '#planos'
}, {
  name: 'Diferenciais',
  href: '#diferenciais'
}, {
  name: 'Contato',
  href: '#contato'
}];

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="container-width section-padding !py-4 bg-navy-deep">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center">
            <img alt="Testoni Tecnologia" className="h-8 sm:h-10 w-auto" src="/lovable-uploads/9d3f4336-934b-41bf-a635-e61103b89d56.png" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} className="text-sm font-medium transition-colors link-underline text-primary-foreground">
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link 
              to="/auth" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors border border-white/20 rounded-lg hover:bg-white/10"
            >
              <User className="h-4 w-4" />
              <span>Portal do Cliente</span>
            </Link>
            <a 
              href="https://wa.me/5547992858578" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 btn-primary text-sm"
            >
              <Phone className="h-4 w-4" />
              <span>Fale Conosco</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-foreground" aria-label="Menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-t border-border shadow-lg animate-fade-in">
            <div className="flex flex-col p-4 space-y-4">
              {navLinks.map(link => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)} 
                  className="text-foreground/80 hover:text-primary py-2 border-b border-border/50 last:border-0"
                >
                  {link.name}
                </a>
              ))}
              <Link 
                to="/auth" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-3 text-navy font-medium border border-navy rounded-lg hover:bg-navy/5"
              >
                <User className="h-4 w-4" />
                <span>Portal do Cliente</span>
              </Link>
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
