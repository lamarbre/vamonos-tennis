/* ═══════════════════ MESURE D'AUDIENCE ═══════════════════
   Google Analytics dépose des cookies : en France, il ne peut donc se charger
   qu'APRÈS un consentement libre et explicite. Ce module ne charge rien tant que
   le joueur n'a pas répondu, et propose « Refuser » aussi visiblement
   qu'« Accepter » — c'est ce qu'exige la CNIL, et c'est ce qui a valu des
   sanctions à beaucoup de sites qui ne le faisaient pas.

   La télémétrie du jeu (stats.js), elle, ne dépose aucun cookie et continue de
   fonctionner quelle que soit la réponse : c'est elle qui alimente /admin. */
(() => {
const GA = 'G-4R5J1P7NSH';
const CLE = 'vamonos_mesure';          // 'oui' | 'non'

function lu(){ try { return localStorage.getItem(CLE); } catch (e){ return 'non'; } }
function ecrire(v){ try { localStorage.setItem(CLE, v); } catch (e){} }

/* Mode consentement de Google : tout est refusé par défaut, on ne desserre
   qu'après un « oui » explicite. */
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }
gtag('consent', 'default', {
  ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied',
  analytics_storage:'denied', wait_for_update: 500
});

function charger(){
  if (document.getElementById('ga-src')) return;
  const s = document.createElement('script');
  s.id = 'ga-src'; s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', GA, { anonymize_ip: true });
}

function accepter(){
  ecrire('oui');
  gtag('consent', 'update', { analytics_storage:'granted' });
  charger();
  fermer();
}
function refuser(){ ecrire('non'); fermer(); }
function fermer(){ const b = document.getElementById('consent'); if (b) b.remove(); }

function bandeau(){
  const d = document.createElement('div');
  d.id = 'consent';
  d.innerHTML = `<p><b>Un cookie de mesure d'audience ?</b>
      Il nous aide à savoir combien de personnes jouent et d'où elles viennent.
      Le jeu fonctionne exactement pareil si vous refusez.</p>
    <div class="consent-btns">
      <button id="c-non" type="button">Refuser</button>
      <button id="c-oui" type="button" class="oui">Accepter</button>
    </div>
    <a href="legal.html">En savoir plus</a>`;
  document.body.appendChild(d);
  document.getElementById('c-oui').onclick = accepter;
  document.getElementById('c-non').onclick = refuser;
}

const rep = lu();
if (rep === 'oui') charger();
else if (rep !== 'non'){
  // On laisse la page s'afficher d'abord : le bandeau ne doit pas être
  // la première chose que voit quelqu'un qui découvre le jeu.
  // On attend que la page soit posée, et jamais pendant un match : le bandeau
  // ne doit pas se glisser entre le joueur et son premier point décisif.
  const quand = () => {
    const enMatch = document.querySelector('#sc-match.active');
    if (enMatch){ setTimeout(quand, 4000); return; }
    bandeau();
    /* Et s'il apparaît puis qu'un match commence, on le range : il reviendra. */
    const obs = new MutationObserver(() => {
      const b = document.getElementById('consent');
      const dansMatch = document.querySelector('#sc-match.active');
      if (b && dansMatch){ b.style.display = 'none'; }
      else if (b && !dansMatch){ b.style.display = ''; }
    });
    obs.observe(document.body, { attributes:true, subtree:true, attributeFilter:['class'] });
  };
  if (document.readyState === 'loading')
    addEventListener('DOMContentLoaded', () => setTimeout(quand, 1500));
  else setTimeout(quand, 1500);
}
})();
