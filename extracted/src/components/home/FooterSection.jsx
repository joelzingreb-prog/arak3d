import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FooterSection() {
  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  const contactEmail = settings.find(s => s.key === 'contact_email')?.value || 'contact@arak3d.ch';

  return (
    <footer className="relative py-16 px-6 md:px-[8vw] border-t border-border/50">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
          {/* Brand */}
          <div>
            <p className="font-display font-extrabold text-lg tracking-wider mb-1">
              ARAK<span className="text-primary">3D</span>
            </p>
            <p className="font-mono text-xs text-muted-foreground tracking-wider">
              Vallée de Joux, Suisse
            </p>
          </div>

          {/* Contact */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase mb-3">
              Nous contacter
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              <Mail className="w-3.5 h-3.5 text-primary/60" />
              {contactEmail}
            </a>
            <p className="font-body text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed">
              Pour toute question sur une commande, un produit ou une demande personnalisée.
            </p>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-mono text-xs text-muted-foreground tracking-wider">
            © {new Date().getFullYear()} ARAK3D — Tous droits réservés
          </p>
          <Link
            to="/cgv"
            className="font-mono text-[10px] text-muted-foreground/60 hover:text-primary transition-colors tracking-wider uppercase"
          >
            Conditions générales de vente
          </Link>
        </div>
      </div>
    </footer>
  );
}