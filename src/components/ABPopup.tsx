import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, UtensilsCrossed, ArrowRight } from 'lucide-react';

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
      <div className="relative bg-card rounded-2xl shadow-xl max-w-md w-full p-8 border border-border animate-scale-in">
        <button onClick={dismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-5 w-5" />
        </button>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6 mx-auto">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground text-center mb-3">
          Você tem um Bar, Restaurante ou Casa Noturna?
        </h3>
        <p className="text-muted-foreground text-center mb-6">
          Descubra como podemos aumentar seu lucro, otimizar sua operação e estruturar o crescimento do seu negócio.
        </p>
        <Link
          to="/consultoria-ab"
          onClick={dismiss}
          className="w-full inline-flex items-center justify-center gap-2 btn-primary text-base py-3"
        >
          Veja o que podemos fazer por você <ArrowRight className="h-5 w-5" />
        </Link>
        <button onClick={dismiss} className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
          Não, obrigado
        </button>
      </div>
    </div>
  );
}
