'use client'

const PHASE1 = [
  { label: 'Login', done: true },
  { label: 'Register', done: true },
  { label: 'Dashboard client', done: true },
  { label: 'Détail projet', done: true },
  { label: 'Profil client', done: true },
]

const PHASE2 = [
  { label: 'Dashboard admin', done: true },
  { label: 'Détail client', done: true },
  { label: 'Détail projet admin', done: true },
  { label: 'Modifier client', done: false },
  { label: 'Modifier projet', done: false },
  { label: 'Gestion services', done: false },
]

const PHASE3 = [
  { label: 'Decision Board', done: false },
  { label: 'Identité visuelle', done: false },
  { label: 'Marketing', done: false },
  { label: 'Facturation avancée', done: false },
]

export default function RoadmapPage() {
  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <header className="mb-12">
        <h1 className="font-display text-[var(--text-3xl)] uppercase text-[var(--color-dark-1)] tracking-tight leading-none">
          ROADMAP
        </h1>
        <p className="text-[var(--color-dark-text-2)] font-body text-lg -mt-1">
          État d&apos;avancement du Portail Client
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase text-[var(--color-dark-text-2)] font-body">Complété</span>
          <span className="font-display text-[var(--text-xl)] text-[var(--color-success-text)]">12</span>
        </div>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase text-[var(--color-dark-text-2)] font-body">En cours</span>
          <span className="font-display text-[var(--text-xl)] text-[var(--color-warning-text)]">4</span>
        </div>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase text-[var(--color-dark-text-2)] font-body">À venir</span>
          <span className="font-display text-[var(--text-xl)] text-[var(--color-dark-text-2)]">8</span>
        </div>
      </div>

      {/* Progress global */}
      <div className="bg-white rounded-3xl p-8 mb-12 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <span className="font-display text-[var(--text-xl)] uppercase">Progression Globale</span>
          <span className="font-body text-sm font-semibold text-[var(--color-brand)]">60% complété</span>
        </div>
        <div className="w-full h-4 bg-[var(--color-light-0)] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[var(--color-brand-hover)] to-[var(--color-warning-text)] w-[60%] rounded-full" />
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-8">

        {/* Phase 1 */}
        <section className="bg-white rounded-3xl overflow-hidden flex shadow-sm">
          <div className="w-1.5 bg-[var(--color-success-text)] flex-shrink-0" />
          <div className="p-8 flex-1">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display text-[var(--text-xl)] uppercase tracking-wide">
                PHASE 1 — PRODUCTION
              </h2>
              <span className="bg-green-50 text-[var(--color-success-text)] text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase font-body">
                COMPLÉTÉ
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PHASE1.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-light-1)]/50">
                  <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-success-text)]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <span className="font-body text-sm text-[var(--color-dark-1)]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Phase 2 */}
        <section className="bg-white rounded-3xl overflow-hidden flex shadow-sm">
          <div className="w-1.5 bg-[var(--color-warning-text)] flex-shrink-0" />
          <div className="p-8 flex-1">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display text-[var(--text-xl)] uppercase tracking-wide">
                PHASE 2 — ADMINISTRATION
              </h2>
              <span className="bg-orange-50 text-[var(--color-warning-text)] text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase font-body">
                EN COURS
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PHASE2.map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${item.done ? 'bg-[var(--color-light-1)]/50' : 'bg-orange-50/50'}`}>
                  <span className={`material-symbols-outlined ${item.done ? 'text-[var(--color-success-text)]' : 'text-[var(--color-warning-text)]'}`}
                    style={item.done ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {item.done ? 'check_circle' : 'schedule'}
                  </span>
                  <span className="font-body text-sm text-[var(--color-dark-1)]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Phase 3 */}
        <section className="bg-white rounded-3xl overflow-hidden flex shadow-sm">
          <div className="w-1.5 bg-[var(--color-dark-text-2)] flex-shrink-0" />
          <div className="p-8 flex-1">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display text-[var(--text-xl)] uppercase tracking-wide">
                PHASE 3 — FONCTIONNALITÉS
              </h2>
              <span className="bg-[var(--color-dark-text-2)]/10 text-[var(--color-dark-text-2)] text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase font-body">
                À VENIR
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PHASE3.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-light-1)] transition-colors">
                  <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)]">
                    radio_button_unchecked
                  </span>
                  <span className="font-body text-sm text-[var(--color-dark-1)]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
