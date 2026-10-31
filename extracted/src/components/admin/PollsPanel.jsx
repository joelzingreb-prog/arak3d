import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Loader2, Trash2, Edit2, Check, ToggleLeft, ToggleRight, Upload, PlusCircle, X } from 'lucide-react';

const emptyOption = () => ({
  id: Math.random().toString(36).slice(2),
  name: '',
  image_url: '',
  price_estimate: '',
  material: '',
  description: '',
  model_3d_url: '',
  votes: 0,
});

const emptyPoll = () => ({
  title: '',
  description: '',
  is_active: true,
  end_date: '',
  limited_edition_note: '',
  options: [emptyOption(), emptyOption()],
});

function ImageUploader({ imageUrl, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {imageUrl ? (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img src={imageUrl} alt="" className="w-10 h-10 object-cover border border-border/40 shrink-0" />
          <span className="font-mono text-[10px] text-muted-foreground truncate flex-1">{imageUrl.split('/').pop()}</span>
          <button
            type="button"
            onClick={() => { onChange(''); inputRef.current.value = ''; }}
            className="p-1 text-muted-foreground hover:text-destructive shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-border/50 text-muted-foreground font-mono text-[10px] tracking-wider hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {uploading ? 'Envoi...' : 'Importer une image'}
        </button>
      )}
    </div>
  );
}

function OptionEditor({ option, onChange, onRemove }) {
  return (
    <div className="border border-border/40 p-3 space-y-2 bg-background/30">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Option</span>
        <button type="button" onClick={onRemove} className="p-1 text-muted-foreground hover:text-destructive">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <input
        value={option.name}
        onChange={e => onChange({ ...option, name: e.target.value })}
        placeholder="Nom du produit *"
        className="w-full bg-background/50 border border-input px-3 py-1.5 text-sm font-body placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <div>
        <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-1">Image du produit</p>
        <ImageUploader imageUrl={option.image_url} onChange={url => onChange({ ...option, image_url: url })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={option.price_estimate}
          onChange={e => onChange({ ...option, price_estimate: e.target.value })}
          placeholder="Prix estimé (ex: CHF 25)"
          className="bg-background/50 border border-input px-3 py-1.5 text-sm font-mono placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <input
          value={option.material}
          onChange={e => onChange({ ...option, material: e.target.value })}
          placeholder="Matière (ex: PLA)"
          className="bg-background/50 border border-input px-3 py-1.5 text-sm font-mono placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <textarea
        value={option.description}
        onChange={e => onChange({ ...option, description: e.target.value })}
        placeholder="Description courte"
        rows={2}
        className="w-full bg-background/50 border border-input px-3 py-1.5 text-sm font-body placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
      />
      <input
        value={option.model_3d_url}
        onChange={e => onChange({ ...option, model_3d_url: e.target.value })}
        placeholder="URL modèle 3D (GLB) — optionnel"
        className="w-full bg-background/50 border border-input px-3 py-1.5 text-sm font-mono placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  );
}

function PollForm({ poll: initialPoll, onSave, onCancel }) {
  const [poll, setPoll] = useState(initialPoll || emptyPoll());

  const setField = (k, v) => setPoll(p => ({ ...p, [k]: v }));
  const setOption = (idx, opt) => {
    const opts = [...poll.options];
    opts[idx] = opt;
    setPoll(p => ({ ...p, options: opts }));
  };
  const addOption = () => setPoll(p => ({ ...p, options: [...p.options, emptyOption()] }));
  const removeOption = (idx) => setPoll(p => ({ ...p, options: p.options.filter((_, i) => i !== idx) }));

  const handleSave = () => {
    if (!poll.title.trim()) return;
    const data = {
      ...poll,
      end_date: poll.end_date ? new Date(poll.end_date).toISOString() : null,
      options: poll.options.filter(o => o.name.trim()),
    };
    onSave(data);
  };

  return (
    <div className="border border-border/50 bg-card/20 p-5 space-y-4">
      <input
        value={poll.title}
        onChange={e => setField('title', e.target.value)}
        placeholder="Titre du sondage *"
        className="w-full bg-background/50 border border-input px-3 py-2 text-sm font-display font-bold placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <textarea
        value={poll.description}
        onChange={e => setField('description', e.target.value)}
        placeholder="Description / contexte"
        rows={2}
        className="w-full bg-background/50 border border-input px-3 py-2 text-sm font-body placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
      />
      <input
        value={poll.limited_edition_note}
        onChange={e => setField('limited_edition_note', e.target.value)}
        placeholder="Note édition limitée (ex: Disponible 1 mois seulement si élu)"
        className="w-full bg-background/50 border border-input px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-1">Date de clôture</p>
          <input
            type="datetime-local"
            value={poll.end_date ? poll.end_date.slice(0, 16) : ''}
            onChange={e => setField('end_date', e.target.value)}
            className="w-full bg-background/50 border border-input px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col justify-end">
          <button
            type="button"
            onClick={() => setField('is_active', !poll.is_active)}
            className={`flex items-center gap-2 px-3 py-2 border font-mono text-[10px] tracking-wider uppercase transition-all ${
              poll.is_active ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border/50 text-muted-foreground'
            }`}
          >
            {poll.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            {poll.is_active ? 'Actif' : 'Inactif'}
          </button>
        </div>
      </div>

      <div>
        <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-2">
          Produits candidats ({poll.options.length})
        </p>
        <div className="space-y-2">
          {poll.options.map((opt, i) => (
            <OptionEditor
              key={opt.id}
              option={opt}
              onChange={(o) => setOption(i, o)}
              onRemove={() => removeOption(i)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addOption}
          className="mt-2 flex items-center gap-2 px-3 py-1.5 border border-dashed border-border/50 text-muted-foreground font-mono text-[10px] tracking-wider hover:border-primary/40 hover:text-primary transition-colors"
        >
          <PlusCircle className="w-3 h-3" /> Ajouter un candidat
        </button>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-[10px] tracking-wider uppercase hover:bg-primary/90 transition-colors"
        >
          <Check className="w-3 h-3" /> Sauvegarder
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-border/50 text-muted-foreground font-mono text-[10px] tracking-wider uppercase hover:text-foreground transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

export default function PollsPanel() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);

  const { data: polls = [], isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: () => base44.entities.Poll.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Poll.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['polls'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Poll.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['polls'] }); setEditingPoll(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Poll.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['polls'] }),
  });

  const handleSave = (data) => {
    if (editingPoll) updateMutation.mutate({ id: editingPoll.id, data });
    else createMutation.mutate(data);
  };

  const toggleActive = (poll) => updateMutation.mutate({ id: poll.id, data: { is_active: !poll.is_active } });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
          {polls.length} sondage{polls.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => { setEditingPoll(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-[10px] tracking-wider uppercase hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Nouveau sondage
        </button>
      </div>

      {showForm && !editingPoll && (
        <div className="mb-6">
          <PollForm onSave={handleSave} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-3">
        {polls.map(poll => (
          <div key={poll.id}>
            {editingPoll?.id === poll.id ? (
              <PollForm poll={editingPoll} onSave={handleSave} onCancel={() => setEditingPoll(null)} />
            ) : (
              <div className="border border-border/50 bg-card/20 p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${poll.is_active ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                    <p className="font-display font-bold text-sm truncate">{poll.title}</p>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {(poll.options || []).length} candidat{(poll.options || []).length !== 1 ? 's' : ''} —{' '}
                    {(poll.options || []).reduce((s, o) => s + (o.votes || 0), 0)} vote{(poll.options || []).reduce((s, o) => s + (o.votes || 0), 0) !== 1 ? 's' : ''}
                    {poll.end_date ? ` — clôture ${new Date(poll.end_date).toLocaleDateString('fr-CH')}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => toggleActive(poll)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title={poll.is_active ? 'Désactiver' : 'Activer'}>
                    {poll.is_active ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setEditingPoll(poll)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(poll.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {polls.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border/30">
            <p className="font-mono text-sm text-muted-foreground">Aucun sondage. Créez le premier !</p>
          </div>
        )}
      </div>
    </div>
  );
}