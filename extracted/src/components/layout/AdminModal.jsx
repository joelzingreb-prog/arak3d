import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { googleLogin } from '@/lib/cloudflareAuth';

const ADMIN_PASSWORD = '@48#57a@rak!';

export default function AdminModal({ isOpen, onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
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

    // Mot de passe correct → connexion directe au compte admin Base44
    // (email + mot de passe, sans passer par Google : l'OAuth Google de
    // Base44 refuse les domaines externes comme *.pages.dev avec
    // "Domain is not valid", et le contournement était payant).
    try {
      const admins = await base44.entities.User.list('created_date', 100);
      const admin = (admins || []).find(u => u && u.role === 'admin');
      if (!admin || !admin.email) throw new Error('no-admin');
      await base44.auth.loginViaEmailPassword(admin.email, ADMIN_PASSWORD);
      onSuccess();
    } catch (err) {
      // Email/mot de passe ne correspond pas sur Base44 → repli :
      // on ouvre la page de login officielle de l'app (Google y marche).
      googleLogin(base44, '/admin');
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