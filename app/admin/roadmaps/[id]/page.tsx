'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Todo { id: number; texte: string; est_coche: number; }
interface Note { id: number; texte: string; created_at: string; }
interface Phase {
  id: number; titre: string; description: string; notes: string;
  date_debut: string; date_fin: string; couleur: string; badge: string;
  todos: Todo[]; journal: Note[];
}
interface Roadmap { id: number; titre: string; description: string; notes: string; }

const BADGE_STYLES: Record<string, string> = {
  'Planifiee': 'bg-[var(--color-info-bg)] text-[var(--color-info-text)]',
  'En cours': 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]',
  'Completee': 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
  'Objectif $': 'bg-[var(--color-error-bg)] text-[var(--color-error-text)]',
};
const DOT_COLORS: Record<string, string> = {
  'var(--color-warning)': 'bg-[var(--color-warning)]', 'var(--color-info)': 'bg-[var(--color-info)]',
  'var(--color-success)': 'bg-[var(--color-success)]', 'var(--color-error-text)': 'bg-[var(--color-error-text)]',
};

export default function RoadmapDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPhases, setOpenPhases] = useState<Set<number>>(new Set());
  const [editingProject, setEditingProject] = useState(false);
  const [editForm, setEditForm] = useState({ titre: '', description: '', notes: '' });
  const [newTodos, setNewTodos] = useState<Record<number, string>>({});
  const [newNotes, setNewNotes] = useState<Record<number, string>>({});
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [phaseForm, setPhaseForm] = useState({ titre: '', description: '', date_debut: '', date_fin: '', badge: 'Planifiee', couleur: 'var(--color-info)' });

  useEffect(() => {
    fetch(`/api/v1/admin/roadmaps/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setRoadmap(data.roadmap);
        setPhases(data.phases || []);
        setEditForm({ titre: data.roadmap.titre, description: data.roadmap.description || '', notes: data.roadmap.notes || '' });
        setLoading(false);
      });
  }, [id]);

  const totalTodos = phases.reduce((s, p) => s + p.todos.length, 0);
  const doneTodos = phases.reduce((s, p) => s + p.todos.filter(t => t.est_coche).length, 0);
  const pct = totalTodos > 0 ? Math.round((doneTodos / totalTodos) * 100) : 0;

  function togglePhase(phaseId: number) {
    setOpenPhases(prev => { const n = new Set(prev); n.has(phaseId) ? n.delete(phaseId) : n.add(phaseId); return n; });
  }

  async function saveProject() {
    await fetch(`/api/v1/admin/roadmaps/${id}/edit`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    setRoadmap(prev => prev ? { ...prev, ...editForm } : prev);
    setEditingProject(false);
  }

  async function toggleTodo(phaseId: number, todoId: number) {
    await fetch(`/api/v1/admin/roadmaps/todo/${todoId}/toggle`, { method: 'POST', credentials: 'include' });
    setPhases(prev => prev.map(p => p.id !== phaseId ? p : {
      ...p, todos: p.todos.map(t => t.id !== todoId ? t : { ...t, est_coche: t.est_coche ? 0 : 1 })
    }));
  }

  async function deleteTodo(phaseId: number, todoId: number) {
    await fetch(`/api/v1/admin/roadmaps/todo/${todoId}/delete`, { method: 'POST', credentials: 'include' });
    setPhases(prev => prev.map(p => p.id !== phaseId ? p : { ...p, todos: p.todos.filter(t => t.id !== todoId) }));
  }

  async function addTodo(phaseId: number) {
    const texte = newTodos[phaseId]?.trim();
    if (!texte) return;
    const res = await fetch(`/api/v1/admin/roadmaps/phase/${phaseId}/add_todo`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte }),
    });
    const data = await res.json();
    setPhases(prev => prev.map(p => p.id !== phaseId ? p : { ...p, todos: [...p.todos, data.todo] }));
    setNewTodos(prev => ({ ...prev, [phaseId]: '' }));
  }

  async function addNote(phaseId: number) {
    const texte = newNotes[phaseId]?.trim();
    if (!texte) return;
    const res = await fetch(`/api/v1/admin/roadmaps/phase/${phaseId}/note/add`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte }),
    });
    const data = await res.json();
    setPhases(prev => prev.map(p => p.id !== phaseId ? p : { ...p, journal: [...p.journal, data.note] }));
    setNewNotes(prev => ({ ...prev, [phaseId]: '' }));
  }

  async function deleteNote(phaseId: number, noteId: number) {
    await fetch(`/api/v1/admin/roadmaps/note/${noteId}/delete`, { method: 'POST', credentials: 'include' });
    setPhases(prev => prev.map(p => p.id !== phaseId ? p : { ...p, journal: p.journal.filter(n => n.id !== noteId) }));
  }

  async function deletePhase(phaseId: number) {
    if (!confirm('Supprimer cette phase ?')) return;
    await fetch(`/api/v1/admin/roadmaps/phase/${phaseId}/delete`, { method: 'POST', credentials: 'include' });
    setPhases(prev => prev.filter(p => p.id !== phaseId));
  }

  async function addPhase() {
    if (!phaseForm.titre.trim()) return;
    const res = await fetch(`/api/v1/admin/roadmaps/${id}/add_phase`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(phaseForm),
    });
    const data = await res.json();
    setPhases(prev => [...prev, { ...data.phase, todos: [], journal: [] }]);
    setPhaseForm({ titre: '', description: '', date_debut: '', date_fin: '', badge: 'Planifiee', couleur: 'var(--color-info)' });
    setShowAddPhase(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!roadmap) return <div className="p-8 text-center text-[var(--color-dark-text-2)]">Roadmap introuvable.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-32">

      {/* Back */}
      <button onClick={() => router.push('/admin/roadmaps')} className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors text-sm font-semibold mb-6">
        <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_back</span>
        ← Retour aux roadmaps
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div className="flex-1">
          <h1 className="font-display text-[var(--text-3xl)] leading-none tracking-tight uppercase text-[var(--color-dark-0)]">{roadmap.titre}</h1>
          {roadmap.description && <p className="text-[var(--color-dark-text-2)] mt-2 text-sm">{roadmap.description}</p>}
        </div>
        <button onClick={() => setEditingProject(!editingProject)} className="bg-[var(--color-light-0)] text-[var(--color-dark-0)] px-8 py-3 rounded-full font-bold text-xs tracking-widest hover:bg-[var(--color-light-border)] transition-colors">
          MODIFIER
        </button>
      </div>

      {/* Edit form */}
      {editingProject && (
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-[var(--color-light-border-2)]">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)] block mb-2">Nom</label>
              <input value={editForm.titre} onChange={e => setEditForm(p => ({ ...p, titre: e.target.value }))} className="w-full bg-[var(--color-light-0)] rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)] block mb-2">Description</label>
              <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} className="w-full bg-[var(--color-light-0)] rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 resize-none" rows={3} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)] block mb-2">Notes internes</label>
              <textarea value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} placeholder="Observations, blocages, décisions..." className="w-full bg-[var(--color-light-0)] rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 resize-none" rows={3} />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingProject(false)} className="px-6 py-2 rounded-full bg-[var(--color-light-0)] text-sm font-bold">Annuler</button>
              <button onClick={saveProject} className="px-6 py-2 rounded-full bg-[var(--color-brand)] text-white text-sm font-bold">Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

      {/* Notes block */}
      {roadmap.notes && (
        <div className="bg-[var(--color-warning-bg)] rounded-lg p-4 mb-8 border-l-4 border-[var(--color-brand)] flex gap-3 items-start">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] text-lg">sticky_note_2</span>
          <p className="text-sm text-[var(--color-light-text-2)] italic">{roadmap.notes}</p>
        </div>
      )}

      {/* Global progress */}
      {totalTodos > 0 && (
        <div className="bg-[var(--color-light-1)] rounded-xl p-6 mb-10">
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-brand)]">Avancement Global</span>
            <span className="text-xs font-bold text-[var(--color-dark-0)]">{doneTodos}/{totalTodos} tâches — {pct}%</span>
          </div>
          <div className="w-full h-3 bg-[var(--color-light-0)] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--color-brand), var(--color-brand))' }} />
          </div>
        </div>
      )}

      {/* Phases */}
      <div className="space-y-4 mb-10">
        {phases.map(phase => {
          const phaseDone = phase.todos.filter(t => t.est_coche).length;
          const phaseTotal = phase.todos.length;
          const phasePct = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;
          const isOpen = openPhases.has(phase.id);

          return (
            <div key={phase.id} className={`bg-white rounded-xl overflow-hidden border transition-all ${isOpen ? 'border-[var(--color-brand)]/20 shadow-sm' : 'border-[var(--color-light-border-2)]'}`}>
              {/* Phase header */}
              <div onClick={() => togglePhase(phase.id)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-[var(--color-light-1)] transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${DOT_COLORS[phase.couleur] || 'bg-[var(--color-info)]'}`} />
                  <div className="flex-1">
                    <div className="font-bold text-sm uppercase tracking-tight text-[var(--color-dark-0)]">{phase.titre}</div>
                    {(phase.date_debut || phase.date_fin) && (
                      <div className="text-xs text-[var(--color-dark-text-2)] mt-0.5">{phase.date_debut}{phase.date_debut && phase.date_fin ? ' → ' : ''}{phase.date_fin}</div>
                    )}
                    {phaseTotal > 0 && (
                      <div className="mt-2 w-40 h-1.5 bg-[var(--color-light-0)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${phasePct}%`, background: 'linear-gradient(90deg, var(--color-brand), var(--color-brand))' }} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {phase.journal.length > 0 && (
                    <span className="text-xs bg-[var(--color-info-bg)] text-[var(--color-info-text)] px-2 py-1 rounded-full font-bold">📝 Notes</span>
                  )}
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${BADGE_STYLES[phase.badge] || 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>{phase.badge}</span>
                  {phaseTotal > 0 && <span className="text-xs text-[var(--color-dark-text-2)]">{phaseDone}/{phaseTotal}</span>}
                  <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)] text-lg transition-transform" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>chevron_right</span>
                </div>
              </div>

              {/* Phase body */}
              {isOpen && (
                <div className="px-6 pb-6 border-t border-[var(--color-light-0)]">
                  {/* Actions phase */}
                  <div className="flex justify-end gap-4 py-3">
                    <button onClick={() => deletePhase(phase.id)} className="text-xs text-[#ccc] hover:text-red-500 font-bold transition-colors">Supprimer</button>
                  </div>

                  {/* Description */}
                  {phase.description && (
                    <div className="bg-[var(--color-warning-bg)] rounded-lg px-4 py-3 mb-4 text-sm text-[var(--color-dark-text-2)]">{phase.description}</div>
                  )}

                  {/* Todos */}
                  <div className="space-y-2 mb-4">
                    {phase.todos.map(todo => (
                      <div key={todo.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${todo.est_coche ? 'bg-[#f0faf4]' : 'bg-[#f9f6f2]'}`}>
                        <input type="checkbox" checked={!!todo.est_coche} onChange={() => toggleTodo(phase.id, todo.id)} className="accent-[var(--color-brand)] cursor-pointer" />
                        <span className={`text-sm flex-1 ${todo.est_coche ? 'line-through text-[var(--color-dark-text-2)]' : 'text-[var(--color-dark-0)]'}`}>{todo.texte}</span>
                        <button onClick={() => deleteTodo(phase.id, todo.id)} className="text-[#ccc] hover:text-red-400 text-xs transition-colors">✕</button>
                      </div>
                    ))}
                    {phase.todos.length === 0 && <p className="text-xs text-[var(--color-dark-text-2)] italic px-3 py-2">Aucune tâche — ajoutez-en ci-dessous.</p>}
                  </div>

                  {/* Add todo */}
                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={newTodos[phase.id] || ''}
                      onChange={e => setNewTodos(p => ({ ...p, [phase.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addTodo(phase.id)}
                      placeholder="Ajouter une tâche..."
                      className="flex-1 bg-[var(--color-light-0)] rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--color-brand)]/40"
                    />
                    <button onClick={() => addTodo(phase.id)} className="bg-[var(--color-dark-1)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[var(--color-brand)] transition-colors">+ Ajouter</button>
                  </div>

                  {/* Journal notes */}
                  <div className="border-t border-[var(--color-light-0)] pt-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] block mb-3">Journal de notes</label>
                    <div className="space-y-2 mb-3">
                      {phase.journal.map(note => (
                        <div key={note.id} className="flex items-start gap-3 py-2 border-b border-[#f5f0eb] group">
                          <span className="text-xs text-[var(--color-dark-text-2)] whitespace-nowrap pt-0.5">{note.created_at?.slice(0, 10)}</span>
                          <span className="text-sm text-[var(--color-dark-0)] flex-1">{note.texte}</span>
                          <button onClick={() => deleteNote(phase.id, note.id)} className="text-[#ccc] hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all">✕</button>
                        </div>
                      ))}
                      {phase.journal.length === 0 && <p className="text-xs text-[var(--color-dark-text-2)] italic">Aucune note pour le moment.</p>}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newNotes[phase.id] || ''}
                        onChange={e => setNewNotes(p => ({ ...p, [phase.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addNote(phase.id)}
                        placeholder="Ajouter une note..."
                        className="flex-1 bg-[var(--color-light-0)] rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--color-brand)]/40"
                      />
                      <button onClick={() => addNote(phase.id)} className="bg-[var(--color-dark-1)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[var(--color-brand)] transition-colors">+ Note</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add phase */}
      <button
        onClick={() => setShowAddPhase(!showAddPhase)}
        className="w-full border-2 border-dashed border-[var(--color-light-border-2)] rounded-xl p-5 flex items-center justify-center gap-3 text-[var(--color-dark-text-2)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-all mb-6"
      >
        <span aria-hidden="true" className="material-symbols-outlined">add_circle</span>
        <span className="font-bold text-xs tracking-widest uppercase">+ AJOUTER UNE PHASE</span>
      </button>

      {showAddPhase && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-light-border-2)] mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)] block mb-2">Nom de la phase *</label>
              <input value={phaseForm.titre} onChange={e => setPhaseForm(p => ({ ...p, titre: e.target.value }))} placeholder="ex: Phase 1 — Lancement" className="w-full bg-[var(--color-light-0)] rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)] block mb-2">Description</label>
              <textarea value={phaseForm.description} onChange={e => setPhaseForm(p => ({ ...p, description: e.target.value }))} placeholder="Objectif, contexte..." className="w-full bg-[var(--color-light-0)] rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 resize-none" rows={2} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)] block mb-2">Date début</label>
              <input value={phaseForm.date_debut} onChange={e => setPhaseForm(p => ({ ...p, date_debut: e.target.value }))} placeholder="ex: Avril 2026" className="w-full bg-[var(--color-light-0)] rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)] block mb-2">Date fin</label>
              <input value={phaseForm.date_fin} onChange={e => setPhaseForm(p => ({ ...p, date_fin: e.target.value }))} placeholder="ex: Mai 2026" className="w-full bg-[var(--color-light-0)] rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)] block mb-2">Badge</label>
              <select value={phaseForm.badge} onChange={e => setPhaseForm(p => ({ ...p, badge: e.target.value }))} className="w-full bg-[var(--color-light-0)] rounded-lg px-4 py-3 text-sm outline-none">
                <option value="Planifiee">Planifiée</option>
                <option value="En cours">En cours</option>
                <option value="Completee">Complétée</option>
                <option value="Objectif $">Objectif $</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)] block mb-2">Couleur</label>
              <select value={phaseForm.couleur} onChange={e => setPhaseForm(p => ({ ...p, couleur: e.target.value }))} className="w-full bg-[var(--color-light-0)] rounded-lg px-4 py-3 text-sm outline-none">
                <option value="var(--color-warning)">🟠 Orange — En cours</option>
                <option value="var(--color-info)">🔵 Bleu — Planifiée</option>
                <option value="var(--color-success)">🟢 Vert — Complétée</option>
                <option value="var(--color-error-text)">🔴 Rouge — Objectif</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowAddPhase(false)} className="px-6 py-2 rounded-full bg-[var(--color-light-0)] text-sm font-bold">Annuler</button>
            <button onClick={addPhase} className="px-6 py-2 rounded-full bg-[var(--color-brand)] text-white text-sm font-bold">+ Ajouter la phase</button>
          </div>
        </div>
      )}

    </div>
  );
}
