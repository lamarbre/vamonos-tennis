/* ═══════════════════ LANGUES ═══════════════════
   Français, anglais, espagnol. La langue vient du NAVIGATEUR, pas de la
   géolocalisation : un francophone à Londres veut du français, personne n'a
   envie d'une demande d'autorisation, et aucun service externe n'est requis.
   Le choix manuel (drapeaux sur l'accueil) l'emporte toujours, et il est retenu.

   Deux mécanismes, un seul dictionnaire :
   - t('texte français') → traduction, avec repli sur le français si absente.
     Le français est LA clé : jamais d'identifiants à maintenir en double.
   - traduireDonnees() marche sur les structures de données (événements, staff,
     entraînements…) et remplace leurs champs de texte au chargement.
   Les dictionnaires (traductions.<langue>.js) ne sont chargés que si besoin,
   par l'amorce placée dans l'en-tête de la page. */
const I18N = (() => {

const DISPO = ['fr', 'en', 'es'];
const L = window.__LANGUE || 'fr';
const DICO = window.__DICO || {};

function t(fr){
  if (L === 'fr' || fr == null) return fr;
  return DICO[fr] || fr;
}

function choisir(l){
  if (!DISPO.includes(l)) return;
  try { localStorage.setItem('vamonos_langue', l); } catch (e){}
  location.reload();
}

/* ───────────── Les données du jeu ─────────────
   On traduit les champs de texte en place, une fois, au chargement. Les
   sauvegardes ne stockent que des identifiants : rien ne se corrompt. */
function champ(o, cles){
  if (!o) return;
  cles.forEach(k => { if (typeof o[k] === 'string') o[k] = t(o[k]); });
}
function traduireDonnees(){
  if (L === 'fr') return;
  (typeof EVENTS !== 'undefined' ? EVENTS : []).forEach(e => {
    champ(e, ['text', 'cat']);
    (e.options || []).forEach(op => {
      champ(op, ['label', 'hint']);
      (op.outcomes || []).forEach(ou => champ(ou, ['text']));
    });
  });
  (typeof MICRO !== 'undefined' ? MICRO : []).forEach(m => champ(m, ['text']));
  if (typeof HEADLINES !== 'undefined')
    Object.keys(HEADLINES).forEach(k => { HEADLINES[k] = HEADLINES[k].map(x => t(x)); });
  (typeof NATIONS !== 'undefined' ? NATIONS : []).forEach(n => champ(n, ['name']));
  (typeof ORIGINS !== 'undefined' ? ORIGINS : []).forEach(o => champ(o, ['name', 'desc']));
  (typeof LIFESTYLES !== 'undefined' ? LIFESTYLES : []).forEach(o => champ(o, ['name', 'desc']));
  if (typeof TRAITS !== 'undefined')
    Object.values(TRAITS).forEach(o => { if (o && typeof o === 'object') champ(o, ['name', 'desc']); });
  if (typeof AWARDS !== 'undefined')
    Object.values(AWARDS).forEach(o => champ(o, ['name', 'desc']));
  (typeof BADGES !== 'undefined' ? (Array.isArray(BADGES) ? BADGES : Object.values(BADGES)) : [])
    .forEach(o => champ(o, ['name', 'desc']));
  (typeof BADGE_CATS !== 'undefined' ? BADGE_CATS : []).forEach(o => champ(o, ['name']));
  (typeof ATTRS !== 'undefined' ? ATTRS : []).forEach(o => champ(o, ['name', 'desc']));
  (typeof STYLES !== 'undefined' ? STYLES : []).forEach(o => champ(o, ['name', 'short', 'desc']));
  if (typeof SURFACES !== 'undefined')
    Object.values(SURFACES).forEach(o => champ(o, ['name', 'short']));
  if (typeof TIERS !== 'undefined')
    Object.values(TIERS).forEach(o => champ(o, ['name']));
  (typeof STAFF_ROLES !== 'undefined' ? STAFF_ROLES : []).forEach(o => champ(o, ['name', 'desc']));
  if (typeof STAFF !== 'undefined')
    Object.values(STAFF).forEach(l => l.forEach(o => champ(o, ['name', 'desc'])));
  (typeof STAFF_PACKS !== 'undefined' ? STAFF_PACKS : []).forEach(o => champ(o, ['name', 'desc']));
  (typeof TRAININGS !== 'undefined' ? TRAININGS : []).forEach(o => champ(o, ['name', 'desc']));
  (typeof TRAIN_AXES !== 'undefined' ? TRAIN_AXES : []).forEach(o => champ(o, ['name', 'desc']));
  (typeof SEASON_PLANS !== 'undefined' ? SEASON_PLANS : []).forEach(o => champ(o, ['name', 'desc']));
  (typeof TACTICS !== 'undefined' ? TACTICS : []).forEach(o => champ(o, ['name', 'desc']));
  (typeof BODY_PARTS !== 'undefined' ? BODY_PARTS : []).forEach(o => champ(o, ['name']));
  (typeof INJURY_LEVELS !== 'undefined' ? INJURY_LEVELS : []).forEach(o => champ(o, ['name', 'label']));
  (typeof SCORE_TIERS !== 'undefined' ? SCORE_TIERS : []).forEach(o => champ(o, ['label']));
}

/* ───────────── La page statique ─────────────
   Les éléments porteurs de data-tr sont traduits par leur contenu français. */
function traduirePage(){
  if (L === 'fr') return;
  document.querySelectorAll('[data-tr]').forEach(el => {
    const fr = el.getAttribute('data-tr') || el.textContent.trim();
    const tr = t(fr);
    if (tr !== fr) el.innerHTML = tr;
  });
}

/* ───────────── Le sélecteur ───────────── */
function brancherSelecteur(){
  document.querySelectorAll('[data-lang]').forEach(b => {
    if (b.dataset.lang === L) b.classList.add('actif');
    b.onclick = () => choisir(b.dataset.lang);
  });
}

traduireDonnees();
traduirePage();
brancherSelecteur();

return { t, langue: L, choisir };
})();
window.I18N = I18N;
window.t = I18N.t;      /* la leçon window.Stats est retenue */
