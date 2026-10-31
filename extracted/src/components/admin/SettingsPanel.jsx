import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, Ban, CheckCircle, KeyRound } from 'lucide-react';

function useSetting(key) {
  const queryClient = useQueryClient();
  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  const record = settings.find(s => s.key === key);

  const mutation = useMutation({
    mutationFn: ({ id, value }) => base44.entities.AppSettings.update(id, { value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  return { record, update: (value) => record && mutation.mutate({ id: record.id, value }), isPending: mutation.isPending };
}

export default function SettingsPanel() {
  const queryClient = useQueryClient();
  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  const [email, setEmail] = useState('');
  const [savedEmail, setSavedEmail] = useState(false);

  // Admin access codes
  const [adminNom, setAdminNom] = useState('');
  const [adminCode1, setAdminCode1] = useState('');
  const [adminCode2, setAdminCode2] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [savedAdmin, setSavedAdmin] = useState(false);

  const emailRecord = settings.find(s => s.key === 'contact_email');
  const blockedRecord = settings.find(s => s.key === 'orders_blocked');
  const adminNomRecord = settings.find(s => s.key === 'admin_nom');
  const adminCode1Record = settings.find(s => s.key === 'admin_code1');
  const adminCode2Record = settings.find(s => s.key === 'admin_code2');
  const adminEmailRecord = settings.find(s => s.key === 'admin_email');
  const adminPasswordRecord = settings.find(s => s.key === 'admin_password');

  const isBlocked = blockedRecord?.value === 'true';

  useEffect(() => {
    if (emailRecord) setEmail(emailRecord.value);
  }, [emailRecord?.value]);

  useEffect(() => {
    if (adminNomRecord) setAdminNom(adminNomRecord.value);
    if (adminCode1Record) setAdminCode1(adminCode1Record.value);
    if (adminCode2Record) setAdminCode2(adminCode2Record.value);
    if (adminEmailRecord) setAdminEmail(adminEmailRecord.value);
    if (adminPasswordRecord) setAdminPassword(adminPasswordRecord.value);
  }, [adminNomRecord?.value, adminCode1Record?.value, adminCode2Record?.value, adminEmailRecord?.value, adminPasswordRecord?.value]);

  const updateMutation = useMutation({
    mutationFn: ({ id, value }) => base44.entities.AppSettings.update(id, { value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const handleSaveEmail = async () => {
    if (!emailRecord) {
      await createMutation.mutateAsync({ key: 'contact_email', value: email, label: 'Email de contact' });
    } else {
      await updateMutation.mutateAsync({ id: emailRecord.id, value: email });
    }
    setSavedEmail(true);
    setTimeout(() => setSavedEmail(false), 2000);
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AppSettings.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const upsertSetting = async (key, value, label) => {
    const record = settings.find(s => s.key === key);
    if (record) {
      await updateMutation.mutateAsync({ id: record.id, value });
    } else {
      await createMutation.mutateAsync({ key, value, label });
    }
  };

  const handleSaveAdmin = async () => {
    await Promise.all([
      upsertSetting('admin_nom', adminNom, 'Nom admin'),
      upsertSetting('admin_code1', adminCode1, 'Code admin 1'),
      upsertSetting('admin_code2', adminCode2, 'Code admin 2'),
      upsertSetting('admin_email', adminEmail, 'Email du compte admin Base44'),
      upsertSetting('admin_password', adminPassword, 'Mot de passe du compte admin Base44'),
    ]);
    setSavedAdmin(true);
    setTimeout(() => setSavedAdmin(false), 2000);
  };

  const handleToggleBlocked = async () => {
    const newValue = isBlocked ? 'false' : 'true';
    if (!blockedRecord) {
      await createMutation.mutateAsync({ key: 'orders_blocked', value: newValue, label: 'Bloquer les commandes' });
    } else {
      await updateMutation.mutateAsync({ id: blockedRecord.id, value: newValue });
    }
  };

  return (
    <div className="space-y-10">
      {/* Block orders toggle */}
      <div className="border border-border/50 bg-card/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display font-bold text-sm mb-1">Bloquer les demandes de commandes</p>
            <p className="font-body text-xs text-muted-foreground max-w-sm">
              Quand activé, les clients peuvent seulement ajouter des produits à leurs Favoris 3D, mais ne peuvent pas envoyer de demande de commande.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-mono text-[10px] tracking-wider ${isBlocked ? 'text-destructive' : 'text-primary'}`}>
              {isBlocked ? 'BLOQUÉ' : 'ACTIF'}
            </span>
            <Switch
              checked={isBlocked}
              onCheckedChange={handleToggleBlocked}
            />
          </div>
        </div>
        {isBlocked && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-destructive/5 border border-destructive/20">
            <Ban className="w-3.5 h-3.5 text-destructive" />
            <p className="font-mono text-[10px] text-destructive tracking-wider">
              Les demandes de commandes sont actuellement suspendues
            </p>
          </div>
        )}
      </div>

      {/* Contact email */}
      <div className="border border-border/50 bg-card/30 p-6 space-y-4">
        <div>
          <p className="font-display font-bold text-sm mb-1">Email de contact</p>
          <p className="font-body text-xs text-muted-foreground">
            Adresse affichée dans la section "Nous contacter" du site.
          </p>
        </div>
        <div className="flex gap-3">
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-background/50 border-border font-mono text-sm"
            placeholder="contact@arak3d.ch"
          />
          <Button
            onClick={handleSaveEmail}
            disabled={updateMutation.isPending}
            className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider"
          >
            {savedEmail ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="border border-border/50 bg-card/30 p-6">
        <p className="font-display font-bold text-sm mb-1">Lien de paiement par produit</p>
        <p className="font-body text-xs text-muted-foreground">
          Le lien de paiement se configure maintenant directement sur chaque produit dans l'onglet "Produits".
        </p>
      </div>

      {/* Admin access codes */}
      <div className="border border-primary/20 bg-primary/5 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound className="w-4 h-4 text-primary" />
          <p className="font-display font-bold text-sm">Codes d'accès administrateur</p>
        </div>
        <p className="font-body text-xs text-muted-foreground mb-4">
          Modifiez ici le nom et les deux codes secrets requis pour accéder au panneau admin.
          L'email et le mot de passe Base44 sont nécessaires pour l'authentification en arrière-plan.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Nom</Label>
            <Input
              value={adminNom}
              onChange={e => setAdminNom(e.target.value)}
              className="bg-background/50 border-border font-mono text-sm"
              placeholder="Joel"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Code 1</Label>
            <Input
              value={adminCode1}
              onChange={e => setAdminCode1(e.target.value)}
              className="bg-background/50 border-border font-mono text-sm"
              placeholder="485718"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Code 2</Label>
            <Input
              value={adminCode2}
              onChange={e => setAdminCode2(e.target.value)}
              className="bg-background/50 border-border font-mono text-sm"
              placeholder="@48#57a@rak!"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/30">
          <div className="space-y-1">
            <Label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Email du compte admin Base44</Label>
            <Input
              type="email"
              value={adminEmail}
              onChange={e => setAdminEmail(e.target.value)}
              className="bg-background/50 border-border font-mono text-sm"
              placeholder="admin@arak3d.ch"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Mot de passe du compte admin Base44</Label>
            <Input
              type="password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              className="bg-background/50 border-border font-mono text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>
        <p className="font-mono text-[9px] text-muted-foreground/60 tracking-wider">
          ⚠ L'email et le mot de passe doivent correspondre à votre vrai compte Base44 avec le rôle admin.
        </p>
        <Button
          onClick={handleSaveAdmin}
          disabled={updateMutation.isPending || createMutation.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider"
        >
          {savedAdmin ? <CheckCircle className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {savedAdmin ? 'Sauvegardé !' : 'Sauvegarder les codes'}
        </Button>
      </div>
    </div>
  );
}