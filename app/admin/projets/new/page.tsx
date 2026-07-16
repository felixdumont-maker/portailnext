'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Client {
  id: number;
  nom_complet: string;
  nom_entreprise: string | null;
}

interface ServiceExtra {
  id: number;
  nom: string;
  prix: number;
}

interface Service {
  id: number;
  nom_service: string;
  slug: string | null;
  localisation_requise: boolean;
  appel_exploratoire_requis: boolean;
  decision_board_requis: boolean;
  extras: ServiceExtra[];
}

interface SelectedExtra {
  catalogId: string;
  nom: string;
  prix: number;
  km: number;
}

const inputCls = "w-full bg-[var(--color-light-0)] border-none rounded-xl px-4 py-3 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40";
const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-text-2)] font-body";

export default function NouveauProjetPage() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const [idClient, setIdClient] = useState('');
  const [displayServiceId, setDisplayServiceId] = useState('');
  const [varianteVitrine, setVarianteVitrine] = useState<'standard' | 'shopify'>('standard');
  const [dateSeance, setDateSeance] = useState(today);
  const [heureSeance, setHeureSeance] = useState('');
  const [titreProjet, setTitreProjet] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [lienReunion, setLienReunion] = useState('');
  const [genererMeet, setGenererMeet] = useState(false);
  const [dateReunion, setDateReunion] = useState('');
  const [heureReunion, setHeureReunion] = useState('');
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);
  const [deplacementKm, setDeplacementKm] = useState('');
  const [facturer, setFacturer] = useState(true);
  const [facturationMode, setFacturationMode] = useState<'deja_paye' | 'quickbooks' | 'forfait'>('deja_paye');

  const displayServices = services.filter(s => s.slug !== 'site-web-shopify');
  const shopifyServiceId = services.find(s => s.slug === 'site-web-shopify')?.id;
  const displayedService = services.find(s => String(s.id) === displayServiceId);
  const isVitrineSelected = displayedService?.slug === 'site-web-vitrine';

  const idService = isVitrineSelected && varianteVitrine === 'shopify' && shopifyServiceId
    ? String(shopifyServiceId)
    : displayServiceId;

  const selectedService = services.find(s => String(s.id) === idService);
  const availableExtras = selectedService?.extras ?? [];

  // Extras à prix fixe, propres au service sélectionné (catalogue réel — voir /admin/services)
  const toggleExtra = (extra: ServiceExtra) => {
    const catalogId = String(extra.id);
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.catalogId === catalogId);
      if (exists) return prev.filter(e => e.catalogId !== catalogId);
      return [...prev, { catalogId, nom: extra.nom, prix: extra.prix, km: 0 }];
    });
  };

  // Déplacement (tarif au kilomètre) : cas spécial non modélisable en extra à prix fixe,
  // proposé pour tout service nécessitant une localisation (séance sur place).
  const toggleDeplacement = () => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.catalogId === 'deplacement');
      if (exists) return prev.filter(e => e.catalogId !== 'deplacement');
      const km = parseInt(deplacementKm) || 0;
      const prix = Math.round(Math.max(0, km - 30) * 2 * 0.70 * 100) / 100;
      return [...prev, { catalogId: 'deplacement', nom: 'Déplacement', prix, km }];
    });
  };

  const deplacementSelected = selectedExtras.find(e => e.catalogId === 'deplacement');
  const deplacementPrix = Math.round(Math.max(0, (parseInt(deplacementKm) || 0) - 30) * 2 * 0.70 * 100) / 100;
  const localisationRequise = selectedService?.localisation_requise ?? false;
  const appelRequisService = selectedService?.appel_exploratoire_requis ?? false;
  const decisionBoardRequis = selectedService?.decision_board_requis ?? false;

  useEffect(() => {
    if (decisionBoardRequis) setGenererMeet(true);
  }, [decisionBoardRequis]);

  useEffect(() => {
    setSelectedExtras([]);
    setDeplacementKm('');
    setVarianteVitrine('standard');
  }, [displayServiceId]);

  useEffect(() => {
    fetch('/api/v1/admin/clients', { credentials: 'include' })
      .then(r => r.json())
      .then(setClients)
      .catch(() => setError('Impossible de charger les clients.'));

    fetch('/api/v1/admin/services', { credentials: 'include' })
      .then(r => r.json())
      .then(setServices)
      .catch(() => setError('Impossible de charger les services.'));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!idClient) { setError('Veuillez sélectionner un client.'); return; }
    if (!displayServiceId) { setError('Veuillez sélectionner un service.'); return; }
    if (isVitrineSelected && varianteVitrine === 'shopify' && !shopifyServiceId) {
      setError('Le service Shopify + Vercel n\'est pas activé. Allez dans Admin → Services pour l\'activer.');
      return;
    }
    if (localisationRequise && !localisation.trim()) {
      setError('L\'adresse de la séance est obligatoire pour ce service.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/projets/new', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_client: idClient,
          id_service: idService,
          date_seance: dateSeance,
          heure_seance: heureSeance || null,
          titre_projet: titreProjet || null,
          localisation: localisation || null,
          lien_reunion: lienReunion || null,
          generer_meet: genererMeet,
          date_reunion: dateReunion || null,
          heure_reunion: heureReunion || null,
          extras: selectedExtras.map(e => ({ nom: e.nom, prix: e.prix, km: e.km })),
          facturation_mode: facturer ? null : facturationMode,
        }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/admin/projet/${data.id}`);
      } else {
        setError(data.error || 'Erreur lors de la création.');
        setLoading(false);
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-xs font-body text-[var(--color-dark-text-2)] mb-5">
        <span className="font-bold uppercase tracking-wide text-[var(--color-brand)]">CRM</span>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <button onClick={() => router.push('/admin/projets')} className="hover:text-[var(--color-brand)] transition-colors">Projets</button>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-[var(--color-dark-1)] font-semibold">Nouveau</span>
      </nav>

      {/* En-tête */}
      <header className="mb-6">
        <h1 className="font-display text-[var(--color-dark-0)] leading-tight" style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Nouveau projet
        </h1>
        <p className="font-body text-[13px] text-[var(--color-dark-text-2)] mt-1">Assignez un service à un client et configurez les détails de la séance.</p>
      </header>

      {/* Formulaire */}
      <section className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {error && (
            <div className="bg-[var(--color-error-bg)] text-[var(--color-error-text)] px-4 py-3 rounded-xl text-sm font-medium font-body">
              {error}
            </div>
          )}

          {/* Client */}
          <div className="space-y-1.5">
            <label className={labelCls}>
              Client <span className="text-[var(--color-brand)]">*</span>
            </label>
            <select
              value={idClient}
              onChange={e => setIdClient(e.target.value)}
              required
              className={inputCls}
            >
              <option value="">— Sélectionner un client —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nom_complet}{c.nom_entreprise ? ` — ${c.nom_entreprise}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Service */}
          <div className="space-y-1.5">
            <label className={labelCls}>
              Service <span className="text-[var(--color-brand)]">*</span>
            </label>
            <select
              value={displayServiceId}
              onChange={e => setDisplayServiceId(e.target.value)}
              required
              className={inputCls}
            >
              <option value="">— Sélectionner un service —</option>
              {displayServices.map(s => (
                <option key={s.id} value={s.id}>{s.nom_service}</option>
              ))}
            </select>
          </div>

          {/* Variante plateforme — seulement pour Site Web Vitrine */}
          {isVitrineSelected && (
            <div className="space-y-1.5">
              <label className={labelCls}>
                Plateforme du site <span className="text-[var(--color-brand)]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVarianteVitrine('standard')}
                  className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    varianteVitrine === 'standard'
                      ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)]'
                      : 'border-transparent bg-[var(--color-light-0)] hover:border-[var(--color-light-border)]'
                  }`}
                >
                  <span className="text-sm font-bold text-[var(--color-dark-1)]">Next.js + Sanity</span>
                  <span className="text-xs text-[var(--color-dark-text-2)]">Site vitrine standard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVarianteVitrine('shopify')}
                  className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    varianteVitrine === 'shopify'
                      ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)]'
                      : 'border-transparent bg-[var(--color-light-0)] hover:border-[var(--color-light-border)]'
                  }`}
                >
                  <span className="text-sm font-bold text-[var(--color-dark-1)]">Shopify</span>
                  <span className="text-xs text-[var(--color-dark-text-2)]">Design sur boutique existante</span>
                </button>
              </div>
            </div>
          )}

          <div className="h-px bg-[var(--color-light-border)] w-full" />

          {/* Bandeau decision board */}
          {decisionBoardRequis && (
            <div className="bg-[var(--color-info-bg)] rounded-xl px-4 py-3 flex items-start gap-3">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-info)] text-xl mt-0.5">dashboard</span>
              <div>
                <p className="text-sm font-bold text-[var(--color-info-text)]">Decision board requis</p>
                <p className="text-xs text-[var(--color-info-text)] mt-0.5 opacity-80">Un decision board sera envoyé automatiquement au client avant la rencontre Google Meet.</p>
              </div>
            </div>
          )}

          {/* Date + Heure séance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>
                {localisationRequise ? 'Date de la séance' : 'Date du projet'} <span className="text-[var(--color-brand)]">*</span>
              </label>
              <input
                type="date"
                value={dateSeance}
                onChange={e => setDateSeance(e.target.value)}
                required
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className={labelCls}>Heure de la séance</label>
                <span className="text-[10px] text-[var(--color-dark-text-2)] uppercase tracking-tight font-body">Optionnel</span>
              </div>
              <input
                type="time"
                value={heureSeance}
                onChange={e => setHeureSeance(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Localisation — affiché seulement si service localisation_requise */}
          {localisationRequise && (
            <div className="space-y-1.5">
              <label className={labelCls}>
                Adresse de la séance <span className="text-[var(--color-brand)]">*</span>
              </label>
              <input
                type="text"
                value={localisation}
                onChange={e => setLocalisation(e.target.value)}
                placeholder="123 rue Exemple, Trois-Rivières"
                className={inputCls}
              />
            </div>
          )}

          {/* Titre affiché au client */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className={labelCls}>Titre affiché au client</label>
              <span className="text-[10px] text-[var(--color-dark-text-2)] uppercase tracking-tight font-body">Optionnel</span>
            </div>
            <input
              type="text"
              value={titreProjet}
              onChange={e => setTitreProjet(e.target.value)}
              placeholder="ex: GALA AESI, Conférence RH 2025…"
              className={inputCls}
            />
          </div>

          {/* Lien réunion / appel exploratoire — seulement si le service le requiert */}
          {appelRequisService && (
            <>
              <div className="h-px bg-[var(--color-light-border)] w-full" />

              <div className="space-y-3">
                <label className={labelCls}>
                  Lien de réunion / appel exploratoire <span className="text-[var(--color-brand)]">*</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={genererMeet}
                    onChange={e => setGenererMeet(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: 'var(--color-brand)' }}
                  />
                  <span className="text-sm font-body text-[var(--color-dark-1)]">Générer automatiquement un lien Google Meet</span>
                </label>

                {genererMeet && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                    <div className="space-y-1.5">
                      <label className="block text-xs text-[var(--color-dark-text-2)] font-body font-medium">Date de la réunion</label>
                      <input
                        type="date"
                        value={dateReunion}
                        onChange={e => setDateReunion(e.target.value)}
                        className={`${inputCls} text-sm`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs text-[var(--color-dark-text-2)] font-body font-medium">Heure de la réunion</label>
                      <input
                        type="time"
                        value={heureReunion}
                        onChange={e => setHeureReunion(e.target.value)}
                        className={`${inputCls} text-sm`}
                      />
                    </div>
                  </div>
                )}

                <input
                  type="url"
                  value={lienReunion}
                  onChange={e => setLienReunion(e.target.value)}
                  placeholder="https://meet.google.com/... ou https://calendly.com/..."
                  className={inputCls}
                />
              </div>
            </>
          )}

          {/* Extras — seulement si le service en a */}
          {(availableExtras.length > 0 || localisationRequise) && (
            <>
              <div className="h-px bg-[var(--color-light-border)] w-full" />
              <div className="space-y-3">
                <label className={labelCls}>Extras</label>
                <div className="space-y-2">
                  {availableExtras.map(extra => {
                    const isSelected = !!selectedExtras.find(e => e.catalogId === String(extra.id));
                    return (
                      <label key={extra.id} className="flex items-center justify-between gap-4 cursor-pointer group bg-[var(--color-light-0)] hover:bg-[var(--color-light-border)]/30 rounded-xl px-4 py-3 transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleExtra(extra)}
                            className="w-4 h-4 rounded flex-shrink-0"
                            style={{ accentColor: 'var(--color-brand)' }}
                          />
                          <p className="text-sm font-semibold text-[var(--color-dark-1)]">{extra.nom}</p>
                        </div>
                        <span className="text-sm font-bold text-[var(--color-dark-1)] flex-shrink-0">{extra.prix} $</span>
                      </label>
                    );
                  })}

                  {/* Déplacement (tarif au km) — cas spécial, proposé pour tout service sur place */}
                  {localisationRequise && (
                    <div>
                      <label className="flex items-center justify-between gap-4 cursor-pointer group bg-[var(--color-light-0)] hover:bg-[var(--color-light-border)]/30 rounded-xl px-4 py-3 transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={!!deplacementSelected}
                            onChange={toggleDeplacement}
                            className="w-4 h-4 rounded flex-shrink-0"
                            style={{ accentColor: 'var(--color-brand)' }}
                          />
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-dark-1)]">Déplacement</p>
                            <p className="text-xs text-[var(--color-dark-text-2)]">0,70 $/km A/R au-delà de 30 km depuis le bureau</p>
                          </div>
                        </div>
                        <span className="text-xs text-[var(--color-dark-text-2)] flex-shrink-0">0,70 $/km A/R</span>
                      </label>

                      {deplacementSelected && (
                        <div className="mt-2 ml-7 flex items-center gap-4">
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="number"
                              min="31"
                              value={deplacementKm}
                              onChange={e => {
                                setDeplacementKm(e.target.value);
                                setSelectedExtras(prev => prev.map(se =>
                                  se.catalogId === 'deplacement'
                                    ? { ...se, km: parseInt(e.target.value) || 0, prix: Math.round(Math.max(0, (parseInt(e.target.value) || 0) - 30) * 2 * 0.70 * 100) / 100 }
                                    : se
                                ));
                              }}
                              placeholder="Distance totale (km)"
                              className={`w-48 ${inputCls} text-sm py-2`}
                            />
                            <span className="text-xs text-[var(--color-dark-text-2)]">km depuis le bureau</span>
                          </div>
                          {deplacementKm && parseInt(deplacementKm) > 30 && (
                            <span className="text-sm font-bold text-[var(--color-brand)]">{deplacementPrix.toFixed(2)} $</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedExtras.length > 0 && (
                  <div className="bg-[var(--color-light-0)] rounded-xl px-4 py-2.5 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-text-2)] font-body">Total extras</span>
                    <span className="text-sm font-bold text-[var(--color-dark-1)]">
                      {selectedExtras.reduce((sum, e) => sum + e.prix, 0).toFixed(2)} $
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="h-px bg-[var(--color-light-border)] w-full" />

          {/* Facturation */}
          <div className="space-y-3">
            <label className={labelCls}>Facturation</label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={facturer}
                onChange={e => setFacturer(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--color-brand)' }}
              />
              <span className="text-sm font-body text-[var(--color-dark-1)]">Facturer au client</span>
            </label>
            {!facturer && (
              <div className="space-y-1.5 pl-7">
                <label className="block text-xs text-[var(--color-dark-text-2)] font-body font-medium">Raison de non-facturation</label>
                <select
                  value={facturationMode}
                  onChange={e => setFacturationMode(e.target.value as 'deja_paye' | 'quickbooks' | 'forfait')}
                  className={`${inputCls} text-sm`}
                  style={{ background: 'var(--color-warning-bg)' }}
                >
                  <option value="deja_paye">Déjà payé</option>
                  <option value="quickbooks">QuickBooks</option>
                  <option value="forfait">Forfait</option>
                </select>
              </div>
            )}
          </div>

          <div className="h-px bg-[var(--color-light-border)] w-full" />

          {/* Boutons */}
          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 order-1 md:order-2 bg-[var(--color-brand)] text-white py-3.5 px-8 rounded-full font-body font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? 'Création en cours…' : 'Créer le projet'}
              {!loading && <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_forward</span>}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/projets')}
              className="flex-1 order-2 md:order-1 bg-[var(--color-light-0)] text-[var(--color-dark-1)] py-3.5 px-8 rounded-full font-body font-bold text-sm uppercase tracking-wide hover:bg-[var(--color-light-border)] transition-colors"
            >
              Annuler
            </button>
          </div>

        </form>
      </section>
    </div>
  );
}
