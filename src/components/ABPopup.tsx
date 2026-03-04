import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, UtensilsCrossed, ArrowRight, Hotel, HardHat, Building2, FerrisWheel, Store, Code2 } from 'lucide-react';

const especialidades = [
  {
    icon: Hotel,
    label: 'Hotéis e Resorts',
    to: '/consultoria-hotelaria',
  },
  {
    icon: HardHat,
    label: 'Construtoras',
    to: '/consultoria-construtoras',
  },
  {
    icon: Building2,
    label: 'Condomínios',
    to: '/consultoria-condominios',
  },
  {
    icon: FerrisWheel,
    label: 'Parques e Atrações',
    to: '/consultoria-parques',
  },
  {
    icon: Store,
    label: 'Franquias e Shoppings',
    to: '/consultoria-franquias',
  },
  {
    icon: Code2,
    label: 'Apps, Sistemas e Sites',
    to: '/desenvolvimento',
  },
];

export function ABPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('ab-popup-dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setOpen(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setOpen(false);
    sessionStorage.setItem('ab-popup-dismissed', '1');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-card rounded-2xl shadow-xl max-w-lg w-full p-8 border border-border animate-scale-in">
        <button onClick={dismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-5 w-5" />
        </button>

        {/* Destaque principal - A&B */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6 mx-auto">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground text-center mb-2">
          Gestão Especializada para o seu Negócio
        </h3>
        <p className="text-muted-foreground text-center mb-5 text-sm">
          Tem um <strong className="text-foreground">Bar, Restaurante ou Casa Noturna</strong>? Descubra como aumentar seu lucro e otimizar sua operação.
        </p>
        <Link
          to="/consultoria-ab"
          onClick={dismiss}
          className="w-full inline-flex items-center justify-center gap-2 btn-primary text-base py-3 mb-6"
        >
          Consultoria para A&B <ArrowRight className="h-5 w-5" />
        </Link>

        {/* Separador */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Também atendemos</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Outras especialidades */}
        <div className="grid grid-cols-2 gap-2">
          {especialidades.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={dismiss}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
            >
              <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </Link>
          ))}
        </div>

        <button onClick={dismiss} className="w-full mt-5 inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
          Continuar para o site <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
