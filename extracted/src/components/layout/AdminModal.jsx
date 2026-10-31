import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { directLogin, fetchAdminEmails } from '@/lib/cloudflareAuth';

const ADMIN_PASSWORD = '@48#57a@rak!';

export default function AdminModal({ isOpen, onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('arak_admin_email') || '');
  const [error, setError] = useState(false);
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    if (password !== ADMIN_PASSWORD) {
      setLoading(false);
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }

    // Mot de passe correct → connexion 100 % directe, SAIN popup Google.
    try {
      const candidates = [];
      if (adminEmail.trim()) candidates.push(adminEmail.trim());
      const savedEmail =
        localStorage.getItem('arak_admin_email') ||
        localStorage.getItem('arak_last_email') ||
        '';
      if (savedEmail && !candidates.includes(savedEmail)) candidates.push(savedEmail);
      try {
        const emails = await fetchAdminEmails();
        for (const e of emails) if (!candidates.includes(e)) candidates.push(e);
      } catch (e) { /* best-effort */ }
      if (candidates.length === 0) candidates.push('admin@arak3d.ch');

      let result = null;
      for (const email of candidates) {
        result = await directLogin(email, ADMIN_PASSWORD);
        if (result) { localStorage.setItem('arak_admin_email', email); break; }
      }

      if (result && result.user && String(result.user.role || '').toLowerCase() !== 'admin') {
        // connecté mais pas admin : on tente quand même /admin (protégé par AuthContext)
      }

      if (result) {
        onSuccess();
        return;
      }

      // Le compte Base44 n'utilise pas ce mot de passe. On reste 100 % sur
      // Cloudflare : AUCUN popup, AUCUNE redirection vers base44.app.
      setError(true);
      setHint('Mot de passe correct, mais le compte Base44 utilis\u00e9 n\u2019a pas ce m\u00eame mot de passe. Saisis l\u2019email exact du compte admin (champ ci-dessus) dont le mot de passe est identique \u2014 la connexion se fera directement ici, sans popup.');
    } catch (err) {
      setError(true);
      setHint('Erreur réseau — réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          <div
            className="absolute inset-0 backdrop-blur-xl bg-background/80"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative z-10 w-full max-w-sm"
          >
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-6">
                <p className="font-mono text-xs text-muted-foreground tracking-[0.3em] uppercase">
                  Accès_Admin_
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Email admin (optionnel)</p>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-border focus:border-primary font-mono text-sm py-2 outline-none transition-colors text-foreground placeholder:text-muted-foreground/30"
                  placeholder="admin@arak3d.ch"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1">
                <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Mot de passe</p>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full bg-transparent border-b-2 ${error ? 'border-destructive' : 'border-border focus:border-primary'} font-mono text-sm tracking-[0.4em] py-2 outline-none transition-colors text-foreground placeholder:text-muted-foreground/30`}
                  placeholder="••••••••••••"
                  autoComplete="off"
                  autoFocus
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive font-mono text-xs text-center tracking-wider"
                >
                  ACCESS_DENIED
                </motion.p>
              )}

              {hint && (
                <p className="text-muted-foreground font-mono text-[10px] text-center leading-relaxed">
                  {hint}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary/10 border border-primary/30 text-primary font-mono text-xs tracking-[0.2em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Authenticate'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}