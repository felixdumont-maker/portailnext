'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Client {
  id: number;
  nom_complet: string;
  nom_entreprise: string | null;
}

interface Service {
  id: number;
  nom_service: string;
  slug: string | null;
  localisation_requise: boolean;
  appel_exploratoire_requis: boolean;
  decision_board_requis: boolean;
}

interface ExtraCatalogItem {
  id: string;
  nom: string;
  prix: number;
  description: string;
  type: 'fixed' | 'distance';
  applicable: string[];
}

interface SelectedExtra {
  catalogId: string;
  nom: string;
  prix: number;
  km: number;
}

const EXTRAS_CATALOG: ExtraCatalogItem[] = [
  { id: 'express-leger',    nom: 'Livraison express', prix: 20,  description: 'Livraison prioritaire', type: 'fixed',
    applicable: ['retouches-photos', 'portraits-pro', 'support-imprimable-1', 'support-numerique-1', 'video-unite-short-reel'] },
  { id: 'express-standard', nom: 'Livraison express', prix: 50,  description: 'Livraison prioritaire', type: 'fixed',
    applicable: ['photos-produits', 'photos-en-action', 'couverture-evenement-photo', 'photo-immobiliere', 'photo-drone', 'video-immobilier', 'video-aerien', 'forfait-short-reel', 'support-imprimable-4', 'support-numerique-4', 'presentation-powerpoint'] },
  { id: 'express-complexe', nom: 'Livraison express', prix: 100, description: 'Livraison prioritaire', type: 'fixed',
    applicable: ['site-web-vitrine', 'site-web-shopify', 'site-web-transactionnel', 'creation-logo', 'refonte-identite-visuelle', 'plan-affaires', 'video-corporatif', 'couverture-evenements'] },

  { id: 'revision-simple',   nom: 'Révision supplémentaire', prix: 15, description: 'Cycle de révision additionnel', type: 'fixed',
    applicable: ['support-imprimable-1', 'support-numerique-1'] },
  { id: 'revision-standard', nom: 'Révision supplémentaire', prix: 25, description: 'Cycle de révision additionnel', type: 'fixed',
    applicable: ['support-imprimable-4', 'support-numerique-4', 'presentation-powerpoint', 'plan-affaires'] },
  { id: 'revision-complexe', nom: 'Révision supplémentaire', prix: 50, description: 'Cycle de révision additionnel', type: 'fixed',
    applicable: ['site-web-vitrine', 'site-web-shopify', 'site-web-transactionnel', 'creation-logo', 'refonte-identite-visuelle'] },

  { id: 'ajout-personne', nom: "Ajout d'une personne", prix: 50, description: 'Personne supplémentaire incluse', type: 'fixed',
    applicable: ['portraits-pro', 'photos-en-action', 'video-corporatif'] },

  { id: 'photos-supp-unitaire', nom: 'Photo supplémentaire',            prix: 30, description: '1 photo additionnelle retouchée', type: 'fixed',
    applicable: ['photos-produits', 'photos-en-action', 'couverture-evenement-photo', 'photo-immobiliere', 'photo-drone', 'portraits-pro'] },
  { id: 'photos-supp-forfait',  nom: 'Photos supplémentaires — forfait 5', prix: 75, description: '+5 photos retouchées', type: 'fixed',
    applicable: ['photos-produits', 'photos-en-action', 'couverture-evenement-photo', 'photo-immobiliere', 'photo-drone', 'portraits-pro'] },

  { id: 'seance-prolongee-photo', nom: 'Séance prolongée (1h)', prix: 50,  description: 'Heure additionnelle de prise de vue', type: 'fixed',
    applicable: ['photos-produits', 'photos-en-action', 'couverture-evenement-photo', 'photo-immobiliere', 'photo-drone', 'portraits-pro'] },
  { id: 'seance-prolongee-video', nom: 'Séance prolongée (1h)', prix: 100, description: 'Heure additionnelle de tournage', type: 'fixed',
    applicable: ['video-corporatif', 'couverture-evenements', 'video-immobilier', 'video-aerien', 'forfait-short-reel', 'video-unite-short-reel'] },

  { id: 'entrevue-directe', nom: 'Entrevue en directe', prix: 100, description: 'Interview filmée sur place', type: 'fixed',
    applicable: ['video-corporatif', 'couverture-evenements', 'forfait-short-reel', 'video-unite-short-reel'] },

  { id: 'deplacement', nom: 'Déplacement', prix: 0, description: '0,70 $/km A/R au-delà de 30 km depuis le bureau', type: 'distance',
    applicable: ['video-corporatif', 'couverture-evenements', 'video-immobilier', 'video-aerien', 'forfait-short-reel', 'video-unite-short-reel',
                 'photos-produits', 'photos-en-action', 'couverture-evenement-photo', 'photo-immobiliere', 'photo-drone', 'portraits-pro'] },
]

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
  const serviceSlug = selectedService?.slug ?? null;
  const availableExtras = serviceSlug
    ? EXTRAS_CATALOG.filter(e => e.applicable.includes(serviceSlug))
    : [];

  const toggleExtra = (extra: ExtraCatalogItem) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.catalogId === extra.id);
      if (exists) return prev.filter(e => e.catalogId !== extra.id);
      const km = extra.type === 'distance' ? parseInt(deplacementKm) || 0 : 0;
      const prix = extra.type === 'distance'
        ? Math.max(0, km - 30) * 2 * 0.70
        : extra.prix;
      return [...prev, { catalogId: extra.id, nom: extra.nom, prix: Math.round(prix * 100) / 100, km }];
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
          extras: selectedExtras.map(e => ({
            nom: e.nom,
            prix: e.catalogId === 'deplacement' ? deplacementPrix : e.prix,
            km: e.km,
          })),
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
    <div className="min-h-screen px-6 py-12 md:py-24 flex flex-col items-center">

      {/* Retour */}
      <div className="w-full max-w-[680px] mb-8">
        <button
          onClick={() => router.push('/admin/projets')}
          className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors text-sm font-medium"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_back</span>
          ← Retour aux projets
        </button>
      </div>

      {/* En-tête */}
      <div className="w-full max-w-[680px] mb-10">
        <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-0)] tracking-tight leading-none uppercase">
          NOUVEAU PROJET
        </h1>
        <p className="text-[var(--color-dark-text-2)] mt-4 text-base max-w-md">
          Assignez un service à un client et configurez les détails de la séance.
        </p>
      </div>

      {/* Formulaire */}
      <section className="w-full max-w-[680px] bg-white rounded-xl p-8 md:p-12 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">

          {error && (
            <div className="bg-[var(--color-error-bg)] text-[var(--color-error-text)] px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* Client */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
              Client <span className="text-[var(--color-brand)]">*</span>
            </label>
            <select
              value={idClient}
              onChange={e => setIdClient(e.target.value)}
              required
              className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-6 py-4 text-[var(--color-dark-0)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all appearance-none"
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
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
              Service <span className="text-[var(--color-brand)]">*</span>
            </label>
            <select
              value={displayServiceId}
              onChange={e => setDisplayServiceId(e.target.value)}
              required
              className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-6 py-4 text-[var(--color-dark-0)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all appearance-none"
            >
              <option value="">— Sélectionner un service —</option>
              {displayServices.map(s => (
                <option key={s.id} value={s.id}>{s.nom_service}</option>
              ))}
            </select>
          </div>

          {/* Variante plateforme — seulement pour Site Web Vitrine */}
          {isVitrineSelected && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
                Plateforme du site <span className="text-[var(--color-brand)]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVarianteVitrine('standard')}
                  className={`flex flex-col items-start gap-1 px-5 py-4 rounded-xl border-2 transition-all text-left ${
                    varianteVitrine === 'standard'
                      ? 'border-[var(--color-brand)] bg-[var(--color-error-bg)]'
                      : 'border-[var(--color-light-0)] bg-[var(--color-light-0)] hover:border-[var(--color-light-border-2)]'
                  }`}
                >
                  <span className="text-sm font-bold text-[var(--color-dark-0)]">Next.js + Sanity</span>
                  <span className="text-xs text-[var(--color-dark-text-2)]">Site vitrine standard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVarianteVitrine('shopify')}
                  className={`flex flex-col items-start gap-1 px-5 py-4 rounded-xl border-2 transition-all text-left ${
                    varianteVitrine === 'shopify'
                      ? 'border-[var(--color-brand)] bg-[var(--color-error-bg)]'
                      : 'border-[var(--color-light-0)] bg-[var(--color-light-0)] hover:border-[var(--color-light-border-2)]'
                  }`}
                >
                  <span className="text-sm font-bold text-[var(--color-dark-0)]">Shopify</span>
                  <span className="text-xs text-[var(--color-dark-text-2)]">Design sur boutique existante</span>
                </button>
              </div>
            </div>
          )}

          <div className="h-px bg-[var(--color-light-0)] w-full" />

          {/* Bandeau decision board */}
          {decisionBoardRequis && (
            <div className="bg-[var(--color-info-bg)] border border-[var(--color-info-bg-2)] rounded-xl px-5 py-4 flex items-start gap-3">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-info)] text-xl mt-0.5">dashboard</span>
              <div>
                <p className="text-sm font-bold text-[var(--color-info-text)]">Decision board requis</p>
                <p className="text-xs text-[var(--color-info)] mt-0.5">Un decision board sera envoyé automatiquement au client avant la rencontre Google Meet.</p>
              </div>
            </div>
          )}

          {/* Date + Heure séance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
                {localisationRequise ? 'Date de la séance' : 'Date du projet'} <span className="text-[var(--color-brand)]">*</span>
              </label>
              <input
                type="date"
                value={dateSeance}
                onChange={e => setDateSeance(e.target.value)}
                required
                className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-6 py-4 text-[var(--color-dark-0)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
                  Heure de la séance
                </label>
                <span className="text-xs text-[var(--color-dark-text-2)] uppercase tracking-tight">Optionnel</span>
              </div>
              <input
                type="time"
                value={heureSeance}
                onChange={e => setHeureSeance(e.target.value)}
                className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-6 py-4 text-[var(--color-dark-0)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all"
              />
            </div>
          </div>

          {/* Localisation — affiché seulement si service localisation_requise */}
          {localisationRequise && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
                Adresse de la séance <span className="text-[var(--color-brand)]">*</span>
              </label>
              <input
                type="text"
                value={localisation}
                onChange={e => setLocalisation(e.target.value)}
                placeholder="123 rue Exemple, Trois-Rivières"
                className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-6 py-4 text-[var(--color-dark-0)] placeholder:text-[var(--color-dark-text-2)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all"
              />
            </div>
          )}

          {/* Titre affiché au client */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
                Titre affiché au client
              </label>
              <span className="text-xs text-[var(--color-dark-text-2)] uppercase tracking-tight">Optionnel</span>
            </div>
            <input
              type="text"
              value={titreProjet}
              onChange={e => setTitreProjet(e.target.value)}
              placeholder="ex: GALA AESI, Conférence RH 2025…"
              className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-6 py-4 text-[var(--color-dark-0)] placeholder:text-[var(--color-dark-text-2)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all"
            />
          </div>

          {/* Lien réunion / appel exploratoire — seulement si le service le requiert */}
          {appelRequisService && (
            <>
              <div className="h-px bg-[var(--color-light-0)] w-full" />

              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
                  Lien de réunion / appel exploratoire <span className="text-[var(--color-brand)]">*</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${genererMeet ? 'bg-[var(--color-brand)] border-[var(--color-brand)]' : 'border-[var(--color-light-border-2)] group-hover:border-[var(--color-brand)]'}`}>
                    {genererMeet && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={genererMeet}
                    onChange={e => setGenererMeet(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-sm text-[var(--color-dark-3)]">Générer automatiquement un lien Google Meet</span>
                </label>

                {genererMeet && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-8">
                    <div className="space-y-2">
                      <label className="block text-xs text-[var(--color-dark-text-2)] font-medium">Date de la réunion</label>
                      <input
                        type="date"
                        value={dateReunion}
                        onChange={e => setDateReunion(e.target.value)}
                        className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-4 py-3 text-[var(--color-dark-0)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs text-[var(--color-dark-text-2)] font-medium">Heure de la réunion</label>
                      <input
                        type="time"
                        value={heureReunion}
                        onChange={e => setHeureReunion(e.target.value)}
                        className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-4 py-3 text-[var(--color-dark-0)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                <input
                  type="url"
                  value={lienReunion}
                  onChange={e => setLienReunion(e.target.value)}
                  placeholder="https://meet.google.com/... ou https://calendly.com/..."
                  className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-6 py-4 text-[var(--color-dark-0)] placeholder:text-[var(--color-dark-text-2)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all"
                />
              </div>
            </>
          )}

          {/* Extras — seulement si le service en a */}
          {availableExtras.length > 0 && (
            <>
              <div className="h-px bg-[var(--color-light-0)] w-full" />
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
                  Extras
                </label>
                <div className="space-y-3">
                  {availableExtras.map(extra => {
                    const isSelected = !!selectedExtras.find(e => e.catalogId === extra.id);
                    const isDistance = extra.type === 'distance';
                    return (
                      <div key={extra.id}>
                        <label className="flex items-center justify-between gap-4 cursor-pointer group bg-[var(--color-light-0)] hover:bg-[var(--color-light-0)] rounded-xl px-5 py-4 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-[var(--color-brand)] border-[var(--color-brand)]' : 'border-[var(--color-light-border-2)] group-hover:border-[var(--color-brand)]'}`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[var(--color-dark-0)]">{extra.nom}</p>
                              <p className="text-xs text-[var(--color-dark-text-2)]">{extra.description}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {isDistance ? (
                              <span className="text-xs text-[var(--color-dark-text-2)]">0,70 $/km A/R</span>
                            ) : (
                              <span className="text-sm font-bold text-[var(--color-dark-0)]">{extra.prix} $</span>
                            )}
                          </div>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleExtra(extra)} className="sr-only" />
                        </label>

                        {isDistance && isSelected && (
                          <div className="mt-2 ml-8 flex items-center gap-4">
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
                                className="w-48 bg-[var(--color-light-0)] border-none rounded-lg px-4 py-2 text-sm text-[var(--color-dark-0)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none"
                              />
                              <span className="text-xs text-[var(--color-dark-text-2)]">km depuis le bureau</span>
                            </div>
                            {deplacementKm && parseInt(deplacementKm) > 30 && (
                              <span className="text-sm font-bold text-[var(--color-brand)]">{deplacementPrix.toFixed(2)} $</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {selectedExtras.length > 0 && (
                  <div className="bg-[var(--color-light-0)] rounded-xl px-5 py-3 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">Total extras</span>
                    <span className="text-sm font-bold text-[var(--color-dark-0)]">
                      {selectedExtras.reduce((sum, e) => sum + (e.catalogId === 'deplacement' ? deplacementPrix : e.prix), 0).toFixed(2)} $
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="h-px bg-[var(--color-light-0)] w-full" />

          {/* Facturation */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
              Facturation
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${facturer ? 'bg-[var(--color-brand)] border-[var(--color-brand)]' : 'border-[var(--color-light-border-2)] group-hover:border-[var(--color-brand)]'}`}>
                {facturer && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input type="checkbox" checked={facturer} onChange={e => setFacturer(e.target.checked)} className="sr-only" />
              <span className="text-sm text-[var(--color-dark-3)]">Facturer au client</span>
            </label>
            {!facturer && (
              <div className="space-y-2 pl-8">
                <label className="block text-xs text-[var(--color-dark-text-2)] font-medium">Raison de non-facturation</label>
                <select
                  value={facturationMode}
                  onChange={e => setFacturationMode(e.target.value as 'deja_paye' | 'quickbooks' | 'forfait')}
                  className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-5 py-3 text-[var(--color-dark-0)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all appearance-none text-sm"
                >
                  <option value="deja_paye">Déjà payé</option>
                  <option value="quickbooks">QuickBooks</option>
                  <option value="forfait">Forfait</option>
                </select>
              </div>
            )}
          </div>

          <div className="h-px bg-[var(--color-light-0)] w-full" />

          {/* Boutons */}
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 order-1 md:order-2 bg-[var(--color-brand)] text-white py-4 px-8 rounded-full font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? 'Création en cours…' : 'Créer le projet'}
              {!loading && <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_forward</span>}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/projets')}
              className="flex-1 order-2 md:order-1 bg-[var(--color-light-0)] text-[var(--color-dark-3)] py-4 px-8 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-light-border)] transition-colors"
            >
              Annuler
            </button>
          </div>

        </form>
      </section>
    </div>
  );
}
