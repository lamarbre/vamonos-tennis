/* ═══════════════════════ TÉLÉMÉTRIE ═══════════════════════
   Ce que le jeu remonte au serveur : de quoi savoir combien de gens jouent,
   combien de temps, et où ils décrochent. Rien d'autre.

   Aucun cookie, aucun traceur tiers, aucune adresse e-mail. L'identifiant est
   un nombre tiré au hasard dans ce navigateur ; il n'identifie personne et le
   joueur peut l'effacer en vidant son stockage.

   Règle de conduite du module : il ne doit JAMAIS empêcher de jouer. Chaque
   appel est enveloppé, échoue en silence, et le jeu continue sans lui — c'est
   pour ça que tout passe par `envoi()` et que rien n'est attendu (`await`). */
const Stats = (() => {

const CLE_ID = 'vamonos_id', CLE_PSEUDO = 'vamonos_pseudo';
const ACTIF = location.protocol === 'http:' || location.protocol === 'https:';

function lire(k){ try { return localStorage.getItem(k); } catch (e){ return null; } }
function ecrire(k, v){ try { localStorage.setItem(k, v); } catch (e){} }

const id = (() => {
  let v = lire(CLE_ID);
  if (!v){
    v = 'j' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    ecrire(CLE_ID, v);
  }
  return v;
})();

let pseudo = lire(CLE_PSEUDO) || '';
let partie = null;         // identifiant de la partie en cours
let debut = 0;             // horodatage du début de session de jeu
let secondes = 0;          // temps de jeu cumulé sur cette partie
let actions = 0;           // nombre d'interactions, pour distinguer un vrai essai d'un survol
let dernierPing = 0;

function envoi(route, corps, urgent){
  if (!ACTIF) return;
  try {
    const txt = JSON.stringify(Object.assign({ joueur: id }, corps));
    // sendBeacon survit à la fermeture de l'onglet, ce que fetch ne garantit pas.
    if (urgent && navigator.sendBeacon){
      navigator.sendBeacon(route, new Blob([txt], { type:'application/json' }));
      return;
    }
    fetch(route, { method:'POST', headers:{ 'Content-Type':'application/json' },
                   body: txt, keepalive: true }).catch(() => {});
  } catch (e){}
}

function appareil(){
  const l = Math.min(screen.width, screen.height);
  return l < 500 ? 'mobile' : l < 900 ? 'tablette' : 'ordinateur';
}

/* ───────────── Cycle de vie ───────────── */
function bonjour(nouveauPseudo){
  if (nouveauPseudo){ pseudo = String(nouveauPseudo).slice(0, 24); ecrire(CLE_PSEUDO, pseudo); }
  envoi('/api/session', { id, pseudo, appareil: appareil(),
                          langue: (navigator.language || '').slice(0, 8) });
}

function nouvellePartie(c, draft){
  partie = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  debut = Date.now(); secondes = 0; actions = 0;
  envoi('/api/partie', {
    id: partie, mode: (c && c.mode) || (draft && draft.mode) || '',
    nation: draft && draft.nation && draft.nation.name,
    style:  draft && draft.style  && draft.style.name,
    origine:draft && draft.origin && draft.origin.name,
    hygiene:draft && draft.lifestyle && draft.lifestyle.name,
    potentiel: c && c.me && c.me.pot
  });
  return partie;
}

/* Appelé à chaque interaction : accumule le temps réellement passé à jouer,
   et pousse un point de situation au plus toutes les 25 secondes. */
function pouls(c, statut){
  if (!partie || !c) return;
  actions++;
  const t = Date.now();
  if (debut){
    const d = (t - debut) / 1000;
    // Au-delà de deux minutes sans interaction, on considère que la personne
    // a quitté l'écran : on ne compte pas ce temps-là.
    secondes += d < 120 ? d : 0;
  }
  debut = t;
  if (!statut && t - dernierPing < 25000) return;
  dernierPing = t;

  const me = c.me || {}, S = c.seasons || [];
  const ti = me.titles || {};
  envoi('/api/partie', {
    id: partie, mode: c.mode,
    saisons: S.length, semaines: (c.world && c.world.absWeek) || 0,
    meilleur: me.bestRank || null, rang: me.rank || null,
    titres: ['slam','finals','m1000','atp500','atp250','ch','itf']
              .reduce((s, k) => s + (ti[k] || 0), 0),
    chelems: ti.slam || 0, gains: c.careerPrize || 0,
    secondes: Math.round(secondes), actions,
    an: (c.world && c.world.year) || null, sem: (c.world && c.world.week) || null,
    age: me.age || null,
    statut: statut || null
  }, !!statut);
}

function finPartie(c, comment){ pouls(c, comment || 'terminée'); partie = null; }

function evt(type, valeur){ envoi('/api/evt', { partie, type, valeur: valeur || '' }); }

/* Le sponsor : combien de fois la bannière est vue, combien de fois cliquée.
   C'est ce qui dira si le partenariat paie réellement l'hébergement. */
function sponsorVu(){
  const a = document.querySelector('.pt-lien');
  if (!a || !('IntersectionObserver' in window)) return;
  let compte = false;
  new IntersectionObserver((ent, obs) => {
    ent.forEach(e => {
      if (e.isIntersecting && !compte){ compte = true; evt('sponsor_vu'); obs.disconnect(); }
    });
  }, { threshold: 0.5 }).observe(a);
  a.addEventListener('click', () => evt('sponsor_clic'));
}

// Dernier souffle : on pousse l'état avant que l'onglet ne se ferme.
addEventListener('pagehide', () => { if (partie && window.G && G.c) pouls(G.c, null); });
addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && partie && window.G && G.c) pouls(G.c, null);
});

return { id, get pseudo(){ return pseudo; }, bonjour, nouvellePartie, pouls, finPartie,
         evt, sponsorVu, actif: ACTIF };
})();

/* Un const de script ne s'attache pas à window : sans cette ligne, toutes les
   gardes `if (window.Stats)` du jeu étaient fausses et la télémétrie entière
   restait muette — en silence, exactement comme on le lui avait appris. */
window.Stats = Stats;
