'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/* ─── Types ─────────────────────────────────────────────── */
type Template = 'reservation' | 'sante'

interface FormData {
  // Étape 1 — Base
  template: Template
  business_name: string
  client_email: string
  resend_api_key: string
  // Étape 2 — Responsable + Textes
  owner_name: string
  owner_title: string       // sante
  owner_title_fr: string   // reservation
  owner_title_en: string
  tagline: string
  tagline_fr: string
  tagline_en: string
  description: string
  description_fr: string
  description_en: string
  hero_style: string
  // Étape 3 — Coordonnées
  address: string
  city: string
  province: string
  postal_code: string
  phone: string
  email: string
  acuity_url: string
  instagram: string
  facebook: string
  linkedin: string
  // Étape 4 — SEO
  seo_meta_title: string
  seo_meta_title_fr: string
  seo_meta_title_en: string
  seo_meta_description: string
  seo_meta_description_fr: string
  seo_meta_description_en: string
  seo_keywords: string
  seo_keywords_fr: string
  seo_keywords_en: string
  seo_business_type: string
  seo_price_range: string
  seo_twitter_handle: string
  site_url: string
}

/* ─── Valeurs par défaut ─────────────────────────────────── */
const INITIAL: FormData = {
  template: 'reservation',
  business_name: '', client_email: '', resend_api_key: '',
  owner_name: '', owner_title: '', owner_title_fr: '', owner_title_en: '',
  tagline: '', tagline_fr: '', tagline_en: '',
  description: '', description_fr: '', description_en: '',
  hero_style: 'A',
  address: '', city: '', province: 'QC', postal_code: '',
  phone: '', email: '', acuity_url: '',
  instagram: '', facebook: '', linkedin: '',
  seo_meta_title: '', seo_meta_title_fr: '', seo_meta_title_en: '',
  seo_meta_description: '', seo_meta_description_fr: '', seo_meta_description_en: '',
  seo_keywords: '', seo_keywords_fr: '', seo_keywords_en: '',
  seo_business_type: 'BeautySalon', seo_price_range: '$$',
  seo_twitter_handle: '', site_url: '',
}

/* ─── Composants UI ─────────────────────────────────────── */
function Label({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-light-text-2)' }}>
        {children}
      </label>
      {optional && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-dark-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Optionnel</span>}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', required }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-5 py-4 text-[var(--color-dark-0)] placeholder:text-[var(--color-dark-text-2)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all"
      style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-5 py-4 text-[var(--color-dark-0)] placeholder:text-[var(--color-dark-text-2)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all resize-none"
      style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}
    />
  )
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <Label optional={optional}>{label}</Label>
      {children}
    </div>
  )
}

function BilingueFields({ labelFr, labelEn, valueFr, valueEn, onFr, onEn, placeholder, textarea }: {
  labelFr: string; labelEn: string; valueFr: string; valueEn: string
  onFr: (v: string) => void; onEn: (v: string) => void
  placeholder?: string; textarea?: boolean
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
      <Field label={labelFr}>
        {textarea
          ? <Textarea value={valueFr} onChange={onFr} placeholder={`${placeholder} (FR)`} />
          : <Input value={valueFr} onChange={onFr} placeholder={`${placeholder} (FR)`} />}
      </Field>
      <Field label={labelEn}>
        {textarea
          ? <Textarea value={valueEn} onChange={onEn} placeholder={`${placeholder} (EN)`} />
          : <Input value={valueEn} onChange={onEn} placeholder={`${placeholder} (EN)`} />}
      </Field>
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--color-light-border)', width: '100%' }} />
}

/* ─── Sélecteur de style Hero ────────────────────────────── */
function HeroStylePicker({ template, value, onChange }: { template: Template; value: string; onChange: (v: string) => void }) {
  const options = template === 'reservation'
    ? [{ id: 'A', label: 'Style A', desc: 'Plein écran' }, { id: 'B', label: 'Style B', desc: 'Avec bande' }, { id: 'C', label: 'Style C', desc: 'Minimaliste' }]
    : [{ id: 'luxe', label: 'Luxe', desc: 'Photo plein écran' }, { id: 'split', label: 'Split', desc: 'Texte / Photo' }, { id: 'minimal', label: 'Minimal', desc: 'Typographie pure' }]

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      {options.map(opt => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          style={{
            flex: 1, padding: 'var(--space-4)', borderRadius: 'var(--radius-md)',
            border: `2px solid ${value === opt.id ? 'var(--color-brand)' : 'var(--color-light-border)'}`,
            background: value === opt.id ? 'var(--color-error-bg)' : 'var(--color-light-2)',
            cursor: 'pointer', transition: 'all var(--duration-fast)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: value === opt.id ? 'var(--color-brand)' : 'var(--color-light-text)', margin: '0 0 2px', textTransform: 'uppercase' }}>{opt.label}</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0, fontFamily: 'var(--font-body)' }}>{opt.desc}</p>
        </button>
      ))}
    </div>
  )
}

/* ─── Page principale ───────────────────────────────────── */
export default function NouveauSitePage() {
  const router = useRouter()
  const [step, setStep]     = useState(1)
  const [form, setForm]     = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [createdId, setCreatedId] = useState<number | null>(null)

  const set = (key: keyof FormData) => (val: string) => setForm(f => ({ ...f, [key]: val }))

  const isReservation = form.template === 'reservation'

  /* ─── Soumission ─────────────────────────────────────── */
  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/v1/admin/sites/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création.')
        setLoading(false)
        return
      }
      setCreatedId(data.id)
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
      setLoading(false)
    }
  }

  /* ─── Succès ─────────────────────────────────────────── */
  if (createdId !== null) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: 'var(--space-16)' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-6)',
        }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--color-success)' }}>check_circle</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', textTransform: 'uppercase', color: 'var(--color-light-text)', margin: '0 0 var(--space-3)' }}>
          Site en création
        </h1>
        <p style={{ color: 'var(--color-light-text-3)', fontFamily: 'var(--font-body)', marginBottom: 'var(--space-8)' }}>
          Le repo GitHub et le projet Sanity sont en cours de création. Cela prend environ 30 secondes.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <button
            onClick={() => router.push(`/admin/sites/${createdId}`)}
            className="bg-[var(--color-brand)] text-white py-4 px-8 rounded-full font-bold text-sm uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Voir le site →
          </button>
          <button
            onClick={() => router.push('/admin/sites')}
            className="bg-[var(--color-light-0)] text-[var(--color-dark-3)] py-4 px-8 rounded-full font-bold text-sm uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Tous les sites
          </button>
        </div>
      </div>
    )
  }

  /* ─── Indicateur d'étapes ────────────────────────────── */
  const STEPS = ['Base', 'Textes', 'Coordonnées', 'SEO']

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Retour */}
      <button
        onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/admin/sites')}
        className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors text-sm font-medium mb-8"
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
      >
        <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_back</span>
        {step > 1 ? `Étape ${step - 1} — ${STEPS[step - 2]}` : 'Retour aux sites'}
      </button>

      {/* Titre */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-light-text)', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
          NOUVEAU SITE
        </h1>
        <p style={{ color: 'var(--color-light-text-3)', marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)' }}>
          Étape {step} sur {STEPS.length} — {STEPS[step - 1]}
        </p>
      </div>

      {/* Barre de progression */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? 'var(--color-brand)' : 'var(--color-light-border)', transition: 'background var(--duration-fast)' }} />
        ))}
      </div>

      {/* Formulaire */}
      <section style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--space-10)', boxShadow: 'var(--shadow-sm)' }}>

        {error && (
          <div className="bg-[var(--color-error-bg)] text-[var(--color-error-text)] px-4 py-3 rounded-lg text-sm font-medium mb-8">
            {error}
          </div>
        )}

        {/* ═══ ÉTAPE 1 — BASE ═══════════════════════════════ */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

            {/* Choix du template */}
            <Field label="Template">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                {(['reservation', 'sante'] as Template[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      set('template')(t)
                      setForm(f => ({ ...f, template: t, hero_style: t === 'reservation' ? 'A' : 'luxe', seo_business_type: t === 'reservation' ? 'BeautySalon' : 'Physician' }))
                    }}
                    style={{
                      padding: 'var(--space-5)', borderRadius: 'var(--radius-md)',
                      border: `2px solid ${form.template === t ? 'var(--color-brand)' : 'var(--color-light-border)'}`,
                      background: form.template === t ? 'var(--color-error-bg)' : 'var(--color-light-2)',
                      cursor: 'pointer', transition: 'all var(--duration-fast)', textAlign: 'left',
                    }}
                  >
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 28, color: form.template === t ? 'var(--color-brand)' : 'var(--color-light-text-3)', display: 'block', marginBottom: 'var(--space-2)' }}>
                      {t === 'reservation' ? 'spa' : 'local_hospital'}
                    </span>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: form.template === t ? 'var(--color-brand)' : 'var(--color-light-text)', margin: '0 0 4px', textTransform: 'uppercase' }}>
                      {t === 'reservation' ? 'Réservation' : 'Santé'}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0, fontFamily: 'var(--font-body)' }}>
                      {t === 'reservation' ? 'Spa · Salon · Massothérapie' : 'Médecin · Dentiste · Chiro'}
                    </p>
                  </button>
                ))}
              </div>
            </Field>

            <Divider />

            <Field label="Nom de l'entreprise">
              <Input value={form.business_name} onChange={set('business_name')} placeholder="Spa Madeleine" required />
            </Field>

            <Field label="Email du client (invitation Sanity)">
              <Input value={form.client_email} onChange={set('client_email')} placeholder="client@example.com" type="email" required />
            </Field>

            <Field label="Clé API Resend" optional>
              <Input value={form.resend_api_key} onChange={set('resend_api_key')} placeholder="re_xxxxxxxxxxxx" />
            </Field>

            <div className="flex items-start gap-3 bg-[var(--color-light-1)] rounded-lg px-5 py-4">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] text-xl mt-0.5">info</span>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', margin: 0, fontFamily: 'var(--font-body)' }}>
                Le client recevra une invitation Sanity à son adresse email pour gérer son contenu.
              </p>
            </div>
          </div>
        )}

        {/* ═══ ÉTAPE 2 — TEXTES & RESPONSABLE ═══════════════ */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <Field label="Nom du responsable">
              <Input value={form.owner_name} onChange={set('owner_name')} placeholder="Marie Tremblay" required />
            </Field>

            {isReservation ? (
              <BilingueFields
                labelFr="Titre du responsable (FR)" labelEn="Titre du responsable (EN)"
                valueFr={form.owner_title_fr} valueEn={form.owner_title_en}
                onFr={set('owner_title_fr')} onEn={set('owner_title_en')}
                placeholder="Esthéticienne"
              />
            ) : (
              <Field label="Titre du responsable">
                <Input value={form.owner_title} onChange={set('owner_title')} placeholder="Médecin de famille" />
              </Field>
            )}

            <Divider />

            {isReservation ? (
              <>
                <BilingueFields
                  labelFr="Accroche (FR)" labelEn="Accroche (EN)"
                  valueFr={form.tagline_fr} valueEn={form.tagline_en}
                  onFr={set('tagline_fr')} onEn={set('tagline_en')}
                  placeholder="Votre moment de sérénité"
                />
                <BilingueFields
                  labelFr="Description (FR)" labelEn="Description (EN)"
                  valueFr={form.description_fr} valueEn={form.description_en}
                  onFr={set('description_fr')} onEn={set('description_en')}
                  placeholder="Description du spa..." textarea
                />
              </>
            ) : (
              <>
                <Field label="Accroche">
                  <Input value={form.tagline} onChange={set('tagline')} placeholder="Votre santé, notre priorité" />
                </Field>
                <Field label="Description">
                  <Textarea value={form.description} onChange={set('description')} placeholder="Description de la clinique..." rows={4} />
                </Field>
              </>
            )}

            <Divider />

            <Field label="Style du hero">
              <HeroStylePicker template={form.template} value={form.hero_style} onChange={set('hero_style')} />
            </Field>
          </div>
        )}

        {/* ═══ ÉTAPE 3 — COORDONNÉES ════════════════════════ */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <Field label="Adresse">
              <Input value={form.address} onChange={set('address')} placeholder="123 rue Principale" />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'var(--space-3)' }}>
              <Field label="Ville">
                <Input value={form.city} onChange={set('city')} placeholder="Sherbrooke" />
              </Field>
              <Field label="Province">
                <Input value={form.province} onChange={set('province')} placeholder="QC" />
              </Field>
              <Field label="Code postal">
                <Input value={form.postal_code} onChange={set('postal_code')} placeholder="J1H 1A1" />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <Field label="Téléphone">
                <Input value={form.phone} onChange={set('phone')} placeholder="819 555-0000" type="tel" />
              </Field>
              <Field label="Email de contact">
                <Input value={form.email} onChange={set('email')} placeholder="info@spa.ca" type="email" required />
              </Field>
            </div>

            <Divider />

            {isReservation && (
              <Field label="URL Acuity Scheduling">
                <Input value={form.acuity_url} onChange={set('acuity_url')} placeholder="https://acuityscheduling.com/schedule.php?owner=..." />
              </Field>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <Field label="Instagram" optional>
                <Input value={form.instagram} onChange={set('instagram')} placeholder="@spa_madeleine" />
              </Field>
              <Field label="Facebook" optional>
                <Input value={form.facebook} onChange={set('facebook')} placeholder="facebook.com/spamadeleine" />
              </Field>
            </div>

            {!isReservation && (
              <Field label="LinkedIn" optional>
                <Input value={form.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/dr-tremblay" />
              </Field>
            )}

            <Field label="URL du site (ex: https://client.ca)" optional>
              <Input value={form.site_url} onChange={set('site_url')} placeholder="https://spamadeleine.ca" />
            </Field>
          </div>
        )}

        {/* ═══ ÉTAPE 4 — SEO ════════════════════════════════ */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {isReservation ? (
              <>
                <BilingueFields
                  labelFr="Titre meta (FR)" labelEn="Titre meta (EN)"
                  valueFr={form.seo_meta_title_fr} valueEn={form.seo_meta_title_en}
                  onFr={set('seo_meta_title_fr')} onEn={set('seo_meta_title_en')}
                  placeholder="Spa Madeleine — Soins esthétiques"
                />
                <BilingueFields
                  labelFr="Description meta (FR)" labelEn="Description meta (EN)"
                  valueFr={form.seo_meta_description_fr} valueEn={form.seo_meta_description_en}
                  onFr={set('seo_meta_description_fr')} onEn={set('seo_meta_description_en')}
                  placeholder="Découvrez nos soins..."
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <Field label="Mots-clés (FR, séparés par virgule)" optional>
                    <Input value={form.seo_keywords_fr} onChange={set('seo_keywords_fr')} placeholder="spa, soins, massothérapie" />
                  </Field>
                  <Field label="Mots-clés (EN, séparés par virgule)" optional>
                    <Input value={form.seo_keywords_en} onChange={set('seo_keywords_en')} placeholder="spa, beauty, massage" />
                  </Field>
                </div>
              </>
            ) : (
              <>
                <Field label="Titre meta">
                  <Input value={form.seo_meta_title} onChange={set('seo_meta_title')} placeholder="Clinique Dr Tremblay — Médecin de famille" />
                </Field>
                <Field label="Description meta">
                  <Textarea value={form.seo_meta_description} onChange={set('seo_meta_description')} placeholder="Clinique médicale de confiance à Sherbrooke..." />
                </Field>
                <Field label="Mots-clés (séparés par virgule)" optional>
                  <Input value={form.seo_keywords} onChange={set('seo_keywords')} placeholder="médecin, clinique, Sherbrooke" />
                </Field>
              </>
            )}

            <Divider />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <Field label="Type d'entreprise">
                <select
                  value={form.seo_business_type}
                  onChange={e => set('seo_business_type')(e.target.value)}
                  className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-5 py-4 text-[var(--color-dark-0)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none"
                  style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}
                >
                  {isReservation ? (
                    <>
                      <option value="BeautySalon">Salon de beauté</option>
                      <option value="HairSalon">Salon coiffure</option>
                      <option value="MassageTherapist">Massothérapeute</option>
                      <option value="SpaLocation">Spa</option>
                      <option value="HealthAndBeautyBusiness">Santé & beauté</option>
                    </>
                  ) : (
                    <>
                      <option value="Physician">Médecin</option>
                      <option value="Dentist">Dentiste</option>
                      <option value="Chiropractor">Chiropraticien</option>
                      <option value="MedicalClinic">Clinique médicale</option>
                    </>
                  )}
                </select>
              </Field>
              <Field label="Gamme de prix">
                <select
                  value={form.seo_price_range}
                  onChange={e => set('seo_price_range')(e.target.value)}
                  className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-5 py-4 text-[var(--color-dark-0)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none"
                  style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}
                >
                  <option value="$">$ — Économique</option>
                  <option value="$$">$$ — Moyen</option>
                  <option value="$$$">$$$ — Haut de gamme</option>
                </select>
              </Field>
            </div>

            <Field label="Handle Twitter / X" optional>
              <Input value={form.seo_twitter_handle} onChange={set('seo_twitter_handle')} placeholder="@spamadeleine" />
            </Field>

            <div className="flex items-start gap-3 bg-[var(--color-light-1)] rounded-lg px-5 py-4">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] text-xl mt-0.5">rocket_launch</span>
              <div>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-dark-0)', margin: '0 0 4px', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
                  Prêt à créer
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', margin: 0, fontFamily: 'var(--font-body)' }}>
                  Un repo GitHub <strong>site-{form.business_name ? form.business_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40) : '…'}</strong> sera créé,
                  le projet Sanity initialisé et le client invité par email.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Boutons navigation */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-light-border)' }}>
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && (!form.business_name.trim() || !form.client_email.trim())}
              className="flex-1 bg-[var(--color-brand)] text-white py-4 px-8 rounded-full font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-40"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Étape suivante
              <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-[var(--color-brand)] text-white py-4 px-8 rounded-full font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {loading ? 'Création en cours…' : 'Créer le site'}
              {!loading && <span aria-hidden="true" className="material-symbols-outlined text-lg">rocket_launch</span>}
            </button>
          )}
          <button
            type="button"
            onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/admin/sites')}
            className="bg-[var(--color-light-0)] text-[var(--color-dark-3)] py-4 px-8 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-light-border)] transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {step > 1 ? 'Retour' : 'Annuler'}
          </button>
        </div>
      </section>
    </div>
  )
}
