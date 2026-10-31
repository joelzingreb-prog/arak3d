import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Save, CheckCircle, Youtube, GripVertical } from 'lucide-react';

const EMPTY_ITEM = { type: 'video', title: '', youtube_url: '', is_active: true, sort_order: 0 };

function ItemRow({ item, onUpdate, onDelete }) {
  return (
    <div className="border border-border/50 bg-card/30 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <GripVertical className="w-4 h-4 text-muted-foreground mt-2 shrink-0" />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Titre</Label>
            <Input
              value={item.title}
              onChange={e => onUpdate({ title: e.target.value })}
              className="bg-background/50 border-border font-mono text-xs"
              placeholder="Nom de la vidéo"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">URL YouTube</Label>
            <Input
              value={item.youtube_url}
              onChange={e => onUpdate({ youtube_url: e.target.value })}
              className="bg-background/50 border-border font-mono text-xs"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div className="space-y-1">
            <Label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Type</Label>
            <select
              value={item.type}
              onChange={e => onUpdate({ type: e.target.value })}
              className="w-full h-9 bg-background/50 border border-border font-mono text-xs px-3 text-foreground"
            >
              <option value="video">Vidéo</option>
              <option value="short">Short</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 shrink-0">
          <Switch
            checked={item.is_active !== false}
            onCheckedChange={v => onUpdate({ is_active: v })}
          />
          <button
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function YoutubePanel() {
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ['youtube-content'],
    queryFn: () => base44.entities.YoutubeContent.list('sort_order'),
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  const [channelUrl, setChannelUrl] = useState('');
  const [channelName, setChannelName] = useState('');
  const [savedChannel, setSavedChannel] = useState(false);
  const [newItem, setNewItem] = useState(EMPTY_ITEM);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const u = settings.find(s => s.key === 'youtube_channel_url');
    const n = settings.find(s => s.key === 'youtube_channel_name');
    if (u) setChannelUrl(u.value);
    if (n) setChannelName(n.value);
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AppSettings.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const createSettingMutation = useMutation({
    mutationFn: (data) => base44.entities.AppSettings.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const upsertSetting = async (key, value, label) => {
    const record = settings.find(s => s.key === key);
    if (record) {
      await updateMutation.mutateAsync({ id: record.id, data: { value } });
    } else {
      await createSettingMutation.mutateAsync({ key, value, label });
    }
  };

  const handleSaveChannel = async () => {
    await Promise.all([
      upsertSetting('youtube_channel_url', channelUrl, 'URL chaîne YouTube'),
      upsertSetting('youtube_channel_name', channelName, 'Nom chaîne YouTube'),
    ]);
    setSavedChannel(true);
    setTimeout(() => setSavedChannel(false), 2000);
  };

  const createContentMutation = useMutation({
    mutationFn: (data) => base44.entities.YoutubeContent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-content'] });
      setNewItem(EMPTY_ITEM);
      setAdding(false);
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.YoutubeContent.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['youtube-content'] }),
  });

  const deleteContentMutation = useMutation({
    mutationFn: (id) => base44.entities.YoutubeContent.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['youtube-content'] }),
  });

  const handleAddItem = () => {
    if (!newItem.title || !newItem.youtube_url) return;
    createContentMutation.mutate({ ...newItem, sort_order: items.length });
  };

  return (
    <div className="space-y-8">
      {/* Channel info */}
      <div className="border border-border/50 bg-card/30 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Youtube className="w-4 h-4 text-red-500" />
          <p className="font-display font-bold text-sm">Informations de la chaîne</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Nom de la chaîne</Label>
            <Input
              value={channelName}
              onChange={e => setChannelName(e.target.value)}
              className="bg-background/50 border-border font-mono text-sm"
              placeholder="ARAK3D"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">URL de la chaîne</Label>
            <Input
              value={channelUrl}
              onChange={e => setChannelUrl(e.target.value)}
              className="bg-background/50 border-border font-mono text-sm"
              placeholder="https://www.youtube.com/@arak3d"
            />
          </div>
        </div>
        <Button
          onClick={handleSaveChannel}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider"
        >
          {savedChannel ? <CheckCircle className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {savedChannel ? 'Sauvegardé !' : 'Sauvegarder'}
        </Button>
      </div>

      {/* Content list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            {items.length} contenu{items.length !== 1 ? 's' : ''}
          </p>
          <Button
            onClick={() => setAdding(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider"
          >
            <Plus className="w-4 h-4 mr-1" /> Ajouter
          </Button>
        </div>

        {/* Add form */}
        {adding && (
          <div className="border border-primary/30 bg-primary/5 p-4 space-y-3">
            <p className="font-mono text-[10px] tracking-widest text-primary uppercase">Nouveau contenu</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Titre</Label>
                <Input
                  value={newItem.title}
                  onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
                  className="bg-background/50 border-border font-mono text-xs"
                  placeholder="Titre de la vidéo"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <Label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">URL YouTube</Label>
                <Input
                  value={newItem.youtube_url}
                  onChange={e => setNewItem(p => ({ ...p, youtube_url: e.target.value }))}
                  className="bg-background/50 border-border font-mono text-xs"
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className="space-y-1">
                <Label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Type</Label>
                <select
                  value={newItem.type}
                  onChange={e => setNewItem(p => ({ ...p, type: e.target.value }))}
                  className="w-full h-9 bg-background/50 border border-border font-mono text-xs px-3 text-foreground"
                >
                  <option value="video">Vidéo</option>
                  <option value="short">Short</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddItem}
                disabled={createContentMutation.isPending || !newItem.title || !newItem.youtube_url}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs"
              >
                Ajouter
              </Button>
              <Button
                variant="outline"
                onClick={() => { setAdding(false); setNewItem(EMPTY_ITEM); }}
                className="font-mono text-xs"
              >
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Items list */}
        <div className="space-y-2">
          {items.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              onUpdate={(data) => updateContentMutation.mutate({ id: item.id, data })}
              onDelete={() => deleteContentMutation.mutate(item.id)}
            />
          ))}
        </div>

        {items.length === 0 && !adding && (
          <div className="text-center py-10 border border-dashed border-border">
            <Youtube className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="font-mono text-xs text-muted-foreground">Aucun contenu. Cliquez sur "Ajouter".</p>
          </div>
        )}
      </div>
    </div>
  );
}