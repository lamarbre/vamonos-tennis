/* ═══════════════════════ PARTAGE ═══════════════════════
   Un jeu sans compte et sans serveur ne peut compter que sur ses joueurs pour se
   faire connaître. Ce module fabrique deux objets partageables : un bloc de texte
   à emoji, copiable partout et lisible sans image, et une carte en PNG pour les
   réseaux qui préfèrent les images. Rien ne sort d'ici sans que le joueur clique. */
const Share = (() => {

const M = v => {
  const a = Math.abs(v);
  if (a >= 1)    return (Math.round(v * 10) / 10).toLocaleString('fr-FR') + ' M€';
  if (a >= 0.001) return Math.round(v * 1000).toLocaleString('fr-FR') + ' k€';
  return Math.round(v * 1000000).toLocaleString('fr-FR') + ' €';
};

/* Une saison = une case. La couleur dit le classement de fin d'année. */
const BANDES = [
  { max: 10,   emoji:'🟪', col:'#A855F7', nom:'top 10' },
  { max: 30,   emoji:'🟦', col:'#3B82F6', nom:'top 30' },
  { max: 100,  emoji:'🟩', col:'#22C55E', nom:'top 100' },
  { max: 250,  emoji:'🟨', col:'#EAB308', nom:'top 250' },
  { max: 600,  emoji:'🟧', col:'#F97316', nom:'top 600' },
  { max: 1e9,  emoji:'🟥', col:'#EF4444', nom:'au-delà' }
];
const bandeDe = r => BANDES.find(b => (r || 9999) <= b.max) || BANDES[BANDES.length - 1];

/* ───────────── Les faits de la carrière ───────────── */
function resume(c){
  const me = c.me, S = c.seasons || [];
  const ti = me.titles || {};
  const titres = ['slam','finals','m1000','atp500','atp250','ch','itf']
    .reduce((s, k) => s + (ti[k] || 0), 0);
  const surf = c.recSurf || {};
  const best = ['clay','hard','grass']
    .map(k => { const r = surf[k] || { w:0, l:0 }; const t = r.w + r.l;
                return { k, t, pct: t ? Math.round(r.w / t * 100) : 0 }; })
    .filter(x => x.t >= 15).sort((a, b) => b.pct - a.pct)[0];
  const SN = { clay:'terre battue', hard:'dur', grass:'gazon' };
  return {
    nom: me.name,
    nation: (me.nation && me.nation.name) || '',
    code: (me.nation && me.nation.code) || '',
    de: S.length ? S[0].year : (c.world && c.world.year),
    a:  S.length ? S[S.length - 1].year : (c.world && c.world.year),
    annees: S.length,
    age: me.age,
    best: me.bestRank || me.rank || 9999,
    rang: me.rank || 9999,
    titres,
    chelems: (ti.slam || 0),
    finals: (ti.finals || 0),
    m1000: (ti.m1000 || 0),
    or: c.olympicGold || (c.olympic && c.olympic.gold) || 0,
    davis: c.davis || 0,
    gains: c.careerPrize || 0,
    v: me.wins || 0, d: me.losses || 0,
    semBlesse: S.reduce((s, x) => s + (x.injWeeks || 0), 0),
    surface: best ? SN[best.k] : null,
    surfacePct: best ? best.pct : 0,
    rangs: S.map(x => x.rank),
    pot: me.pot
  };
}

/* ───────────── La phrase d'accroche ───────────── */
function accroche(r){
  const n = r.nom;
  if (r.best === 1)        return `${n} a fini n°1 mondial. Il a commencé ${r.annees} ans plus tôt, ${r.de === r.a ? 'la même année' : 'au-delà du 800e rang'}.`;
  if (r.chelems >= 3)      return `${r.chelems} Grands Chelems pour ${n}. Le circuit s'en remettra.`;
  if (r.chelems === 1)     return `${n} a gagné un Grand Chelem. Un seul. C'est déjà un de plus que presque tout le monde.`;
  if (r.or)                return `${n} est champion olympique. Le reste de sa carrière est un détail.`;
  if (r.best <= 10)        return `${n} a atteint le top 10 mondial et y a survécu ${r.annees} saisons.`;
  if (r.best <= 50)        return `Meilleur classement de ${n} : #${r.best}. De quoi vivre du tennis, pas d'en faire un film.`;
  if (r.semBlesse >= 60)   return `${r.semBlesse} semaines à l'infirmerie. ${n} a passé plus de temps chez le kiné que sur le court.`;
  if (r.titres === 0 && r.gains > 1) return `${n} : ${M(r.gains)} de gains, aucun titre. Le tennis paie aussi les seconds rôles.`;
  if (r.titres === 1)      return `Un titre en ${r.annees} ans. ${n} le raconte encore.`;
  if (r.best <= 200)       return `${n} a fini #${r.best} mondial. Personne ne s'en souviendra, sauf lui.`;
  return `${r.annees} saisons sur le circuit pour ${n}, et un meilleur classement de #${r.best}. Le tennis ne doit rien à personne.`;
}

/* ───────────── Le bloc à copier ───────────── */
function bloc(c, url){
  const r = resume(c);
  const cases = r.rangs.map(x => bandeDe(x).emoji).join('');
  const L = [];
  L.push(`🎾 VAMONOS TENNIS — ${r.nom}${r.code ? ' · ' + r.code : ''}`);
  L.push(`${r.de} → ${r.a} · meilleur classement #${r.best}`);
  L.push('');
  if (cases) L.push(cases);
  L.push('');
  const st = [];
  if (r.chelems) st.push(`🏆 ${r.chelems} Grand${r.chelems > 1 ? 's' : ''} Chelem${r.chelems > 1 ? 's' : ''}`);
  if (r.or)      st.push(`🥇 champion olympique`);
  if (r.davis)   st.push(`🇺🇳 ${r.davis} Coupe${r.davis > 1 ? 's' : ''} Davis`);
  st.push(`🎯 ${r.titres} titre${r.titres > 1 ? 's' : ''}`);
  st.push(`📊 ${r.v}–${r.d}`);
  if (r.surface) st.push(`🎾 ${r.surface} ${r.surfacePct} %`);
  if (r.semBlesse) st.push(`🩹 ${r.semBlesse} sem. blessé`);
  st.push(`💰 ${M(r.gains)}`);
  L.push(st.join('\n'));
  L.push('');
  L.push(accroche(r));
  if (url) { L.push(''); L.push(url); }
  return L.join('\n');
}

/* ───────────── La carte en image ───────────── */
function carte(c){
  const r = resume(c);
  const W = 1080, H = 1080;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const x = cv.getContext('2d');

  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#0A1A13'); g.addColorStop(1, '#101E2C');
  x.fillStyle = g; x.fillRect(0, 0, W, H);

  const teinte = bandeDe(r.best).col;
  x.fillStyle = teinte; x.globalAlpha = 0.14;
  x.beginPath(); x.arc(W * 0.85, -60, 420, 0, Math.PI * 2); x.fill();
  x.globalAlpha = 1;
  x.fillStyle = teinte; x.fillRect(0, 0, W, 10);

  const T = (t, px, py, size, col, poids, align) => {
    x.font = `${poids || 400} ${size}px "Segoe UI", system-ui, sans-serif`;
    x.fillStyle = col; x.textAlign = align || 'left';
    x.fillText(t, px, py);
  };

  T('VAMONOS', 72, 108, 30, '#4AC878', 800);
  T('TENNIS', 218, 108, 30, 'rgba(255,255,255,.45)', 700);
  T(r.nom, 72, 196, 66, '#FFFFFF', 700);
  T(`${r.nation}${r.nation ? ' · ' : ''}${r.de} → ${r.a} · ${r.annees} saison${r.annees > 1 ? 's' : ''}`,
    72, 246, 30, 'rgba(255,255,255,.55)');

  T('MEILLEUR CLASSEMENT', 72, 336, 26, 'rgba(255,255,255,.45)', 600);
  T('#' + r.best, 72, 430, 108, teinte, 700);

  /* Le classement, saison par saison. L'échelle s'ajuste à la carrière du joueur :
     sur une échelle absolue, un joueur qui a vécu entre le 300e et le 600e rang
     n'aurait que des barres écrasées, et la forme de sa trajectoire — la seule chose
     intéressante — disparaîtrait. */
  const bx = 72, by = 470, bw = W - 144, bh = 220;
  if (r.rangs.length){
    const n = r.rangs.length, pas = bw / n, larg = Math.max(6, pas - 8);
    const L = v => Math.log(Math.max(1, v));
    let lo = L(Math.min(...r.rangs)), hi = L(Math.max(...r.rangs));
    if (hi - lo < 0.5){ lo -= 0.35; hi += 0.35; }          // carrière plate : on respire
    const ech = v => 26 + (bh - 26) * (1 - (L(v) - lo) / (hi - lo));
    r.rangs.forEach((v, i) => {
      const h = ech(v);
      x.fillStyle = bandeDe(v).col; x.globalAlpha = 0.92;
      x.fillRect(bx + i * pas, by + bh - h, larg, h);
    });
    x.globalAlpha = 1;
    T(`une saison par barre · de #${Math.max(...r.rangs)} à #${Math.min(...r.rangs)}`,
      bx, by + bh + 38, 24, 'rgba(255,255,255,.38)');
  }

  /* Les chiffres qui comptent */
  const cases = [];
  if (r.chelems) cases.push(['GRANDS CHELEMS', String(r.chelems)]);
  if (r.or)      cases.push(['JEUX OLYMPIQUES', 'OR']);
  cases.push(['TITRES', String(r.titres)]);
  cases.push(['BILAN', `${r.v}–${r.d}`]);
  if (r.surface) cases.push([r.surface.toUpperCase(), r.surfacePct + ' %']);
  cases.push(['GAINS', M(r.gains)]);
  if (r.semBlesse) cases.push(['SEM. BLESSÉ', String(r.semBlesse)]);

  const cy = 800, cols = 3, cw = (W - 144) / cols;
  cases.slice(0, 6).forEach((cc, i) => {
    const px = 72 + (i % cols) * cw, py = cy + Math.floor(i / cols) * 104;
    T(cc[0], px, py, 22, 'rgba(255,255,255,.40)', 600);
    T(cc[1], px, py + 50, 44, '#FFFFFF', 700);
  });

  /* L'accroche, sur deux lignes au besoin : coupée au caractère, elle sortait du cadre. */
  x.font = '400 25px "Segoe UI", system-ui, sans-serif';
  const lignes = [];
  let ligne = '';
  accroche(r).split(' ').forEach(mot => {
    const essai = ligne ? ligne + ' ' + mot : mot;
    if (x.measureText(essai).width > W - 144 && ligne){ lignes.push(ligne); ligne = mot; }
    else ligne = essai;
  });
  if (ligne) lignes.push(ligne);
  lignes.slice(0, 2).forEach((l, i) => {
    T(l, 72, H - 66 + i * 32, 25, 'rgba(255,255,255,.52)');
  });
  return cv;
}

function carteBlob(c){
  return new Promise(res => carte(c).toBlob(b => res(b), 'image/png', 0.94));
}

/* ───────────── Envoi ───────────── */
const URL_JEU = location.origin && location.origin.startsWith('http')
  ? location.origin + location.pathname.replace(/index\.html$/, '') : '';

async function partager(c){
  const txt = bloc(c, URL_JEU);
  const r = resume(c);
  const titre = `VAMONOS TENNIS — ${r.nom}`;
  try {
    const blob = await carteBlob(c);
    const f = new File([blob], 'match-point.png', { type:'image/png' });
    if (navigator.canShare && navigator.canShare({ files:[f] })){
      await navigator.share({ title: titre, text: txt, files:[f] });
      return 'partagé';
    }
  } catch (e){ /* l'utilisateur a annulé, ou le partage de fichier est refusé */ }
  try {
    if (navigator.share){ await navigator.share({ title: titre, text: txt }); return 'partagé'; }
  } catch (e){ return 'annulé'; }
  return copier(txt);
}

function copier(txt){
  try {
    navigator.clipboard.writeText(txt);
    return 'copié';
  } catch (e){
    const ta = document.createElement('textarea');
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e2){}
    document.body.removeChild(ta);
    return 'copié';
  }
}

function telecharger(c){
  const r = resume(c);
  carte(c).toBlob(b => {
    const u = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = u;
    a.download = 'match-point-' + String(r.nom).normalize('NFD').replace(/[^\w]+/g, '-').toLowerCase() + '.png';
    // Certains navigateurs ignorent le clic sur une ancre absente du document.
    a.style.display = 'none'; document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(u); }, 4000);
  }, 'image/png', 0.94);
}

/* Les réseaux qui acceptent un lien de composition. Aucune donnée n'est envoyée
   avant que le joueur ne valide dans l'onglet qui s'ouvre. */
const RESEAUX = [
  { id:'x',  nom:'X',        icon:'𝕏',
    url:(t,u) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}${u?`&url=${encodeURIComponent(u)}`:''}` },
  { id:'wa', nom:'WhatsApp', icon:'💬',
    url:(t,u) => `https://wa.me/?text=${encodeURIComponent(t + (u ? '\n' + u : ''))}` },
  { id:'tg', nom:'Telegram', icon:'✈️',
    url:(t,u) => `https://t.me/share/url?url=${encodeURIComponent(u || '')}&text=${encodeURIComponent(t)}` },
  { id:'fb', nom:'Facebook', icon:'📘',
    url:(t,u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u || '')}&quote=${encodeURIComponent(t)}` },
  { id:'rd', nom:'Reddit',   icon:'👽',
    url:(t,u) => `https://www.reddit.com/submit?title=${encodeURIComponent(t.split('\n')[0])}&text=${encodeURIComponent(t)}` }
];

function ouvrirReseau(c, id){
  const net = RESEAUX.find(n => n.id === id);
  if (!net) return;
  window.open(net.url(bloc(c, ''), URL_JEU), '_blank', 'noopener,noreferrer');
}

return { resume, accroche, bloc, carte, carteBlob, partager, copier, telecharger,
         ouvrirReseau, RESEAUX, BANDES, bandeDe, URL_JEU };
})();
