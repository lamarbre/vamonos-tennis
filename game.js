/* ══════════════════════════════════════════════════════════════════════════
   VAMONOS TENNIS — Interface
   ══════════════════════════════════════════════════════════════════════════ */

const $  = id => document.getElementById(id);
const el = (t, c, h) => { const e = document.createElement(t);
  if (c) e.className = c; if (h !== undefined) e.innerHTML = h; return e; };
const esc = s => String(s).replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));

const G = { c:null, tab:'week', draft:{}, back:[], match:null, ui:{} };

/* ───────────── Drapeaux ─────────────
   Windows ne sait pas afficher les indicateurs regionaux : 🇫🇷 y devient
   deux lettres cote a cote. On le detecte en mesurant la largeur du glyphe
   (un vrai drapeau tient en un seul caractere) et, si besoin, on remplace
   tous les drapeaux par une pastille au code du pays. */
function flagsRender(){
  try {
    const el = document.createElement('span');
    el.style.cssText = 'position:absolute;visibility:hidden;font-size:40px;white-space:nowrap';
    el.textContent = '\u{1F1EB}\u{1F1F7}';                 // FR : un drapeau si supporte
    document.body.appendChild(el);
    const one = el.offsetWidth;
    el.textContent = '\u{1F1EB}\u{1F1EB}';                 // jamais un drapeau valide
    const two = el.offsetWidth;
    el.remove();
    return one < two * 0.75;
  } catch (e){ return true; }
}

/* On remplace directement dans les données : tout le reste du jeu continue
   d'écrire `nation.flag` sans rien savoir de cette histoire. */
(function setupFlags(){
  if (flagsRender()) return;
  NATIONS.forEach(n => { n.flag = `<span class="natcode">${n.code || n.id.toUpperCase()}</span>`; });
})();

/* Sauvegarde automatique : aux frontières de semaine, après chaque match,
   et quand l'onglet passe en arrière-plan. Jamais pendant un rendu. */
let saveTimer = null;
function autosave(now){
  if (!G.c || G.c.retired) return;
  clearTimeout(saveTimer);
  if (now) { Save.write(G.c); return; }
  saveTimer = setTimeout(() => Save.write(G.c), 350);
}
document.addEventListener('visibilitychange', () => { if (document.hidden) autosave(true); });
window.addEventListener('pagehide', () => autosave(true));
const M$ = Career.money;

const Store = {
  read(){ try { return JSON.parse(localStorage.getItem('matchpoint_v2')) || {}; } catch(e){ return {}; } },
  get(k,d){ const v = this.read()[k]; return v===undefined ? d : v; },
  set(k,v){ const o = this.read(); o[k]=v; try{ localStorage.setItem('matchpoint_v2', JSON.stringify(o)); }catch(e){} }
};

/* ───────────── Habillage par surface ─────────────
   Quand on entre sur un court, la surface prend possession de l'écran. */
function setSurface(surf){
  document.body.dataset.surf = surf || '';
}

/* Un court vu du dessus, aux couleurs de la surface. Vingt lignes de SVG
   valent mieux qu'un écran entièrement gris. */
function courtSvg(surf, opt){
  opt = opt || {};
  const c = { clay:'#D6673A', hard:'#2E7BE6', grass:'#43A65A' }[surf] || '#2E7BE6';
  const out = { clay:'#8E4023', hard:'#1B4F96', grass:'#2A6B36' }[surf] || '#1B4F96';
  const h = opt.h || 74;
  return `<svg class="court" viewBox="0 0 240 120" preserveAspectRatio="xMidYMid meet"
      aria-hidden="true">
    <rect x="2" y="2" width="236" height="116" rx="4" fill="${out}" opacity=".55"/>
    <rect x="26" y="14" width="188" height="92" fill="${c}" opacity=".38"/>
    <g stroke="#EAF2F7" stroke-width="1.4" opacity=".75" fill="none">
      <rect x="26" y="14" width="188" height="92"/>
      <rect x="26" y="26" width="188" height="68"/>
      <line x1="66" y1="26" x2="66" y2="94"/>
      <line x1="174" y1="26" x2="174" y2="94"/>
      <line x1="66" y1="60" x2="174" y2="60"/>
      <line x1="120" y1="14" x2="120" y2="18"/>
      <line x1="120" y1="102" x2="120" y2="106"/>
    </g>
    <line x1="120" y1="8" x2="120" y2="112" stroke="#EAF2F7" stroke-width="2.2" opacity=".9"/>
  </svg>`;
}

function show(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  if (window.Stats) Stats.voir(id === 'sc-career' ? 'onglet:' + G.tab : id);
  window.scrollTo({ top:0, behavior:'instant' });
}
document.querySelectorAll('[data-back]').forEach(b => b.onclick = () => {
  const f = G.back.pop(); (typeof f === 'function' ? f : home)();
});

/* ══════════════════ ACCUEIL ══════════════════ */
function home(){
  const badges = Store.get('badges', []);
  const pan = Store.get('pantheon', []);
  const sv = Save.peek();
  const bc = $('btn-continue');
  if (sv){
    bc.classList.remove('hidden');
    bc.innerHTML = `${TR('REPRENDRE')} — ${esc(sv.name)} ${sv.nation}<br>
      <span style="font-size:11px;letter-spacing:.04em;text-transform:none;color:var(--txt3)">
      ${sv.age} ${TR('ans')} · #${sv.rank} ${TR('mondial')} · ${TR('semaine')} ${sv.week} · ${sv.year}</span>`;
    bc.onclick = () => {
      const c = Save.read();
      if (!c){ alert('Sauvegarde illisible.'); Save.clear(); return home(); }
      G.c = c; G.tab = 'week'; G.back = [];
      // Un plan de saison ne vaut que pour son année : reprendre une sauvegarde faite
      // sur l'écran de bilan doit ramener au choix du plan, pas relancer l'année écoulée
      // avec son quota de matchs clés déjà épuisé.
      if (c.mode === 'express')
        return (c.express && c.express.year === c.world.year) ? exRun() : exPlan();
      setTab('week');
    };
  } else bc.classList.add('hidden');
  document.querySelector('.home-meta').textContent =
    `${badges.length}/${BADGES.length} badges · ${pan.length} carrière${pan.length>1?'s':''} au Panthéon`;
  $('btn-start').onclick = pickPseudo;
  $('btn-badges').onclick = () => fullScreen(badgesHtml(), home);
  $('btn-pantheon').onclick = () => fullScreen(pantheonHtml(), home);

  /* Reprendre une carrière venue d'un autre appareil, et avertir quand ce navigateur
     ne peut rien retenir — le pire scénario est de découvrir la perte après coup. */
  const zone = $('home-io');
  if (zone){
    zone.innerHTML = Save.storageOk()
      ? `<button class="btn btn-ghost" id="btn-import">📂 REPRENDRE DEPUIS UN FICHIER</button>`
      : `<div class="panel" style="border-left:3px solid var(--bad)">
           <div class="r-t">⚠️ Ce navigateur ne peut pas enregistrer votre partie</div>
           <div class="r-s">Navigation privée, stockage désactivé, ou page ouverte depuis un
             fichier local. Vous pouvez jouer, mais rien ne sera conservé en fermant l'onglet.</div></div>
         <button class="btn btn-ghost" id="btn-import">📂 REPRENDRE DEPUIS UN FICHIER</button>`;
    $('btn-import').onclick = () => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.mpsave,application/json,.json';
      inp.onchange = () => {
        const f = inp.files && inp.files[0]; if (!f) return;
        const fr = new FileReader();
        fr.onload = () => {
          const res = Save.importText(String(fr.result));
          if (typeof res === 'string'){ alert(res); return; }
          home();
        };
        fr.readAsText(f);
      };
      inp.click();
    };
  }
  if (window.Stats){ Stats.bonjour(); setTimeout(() => Stats.sponsorVu(), 250); }
  show('sc-home');
}

/* ══════════════════ CRÉATION ══════════════════ */

/* Un pseudo, et rien d'autre. Pas de compte, pas de mot de passe, pas d'adresse :
   juste de quoi apparaître au Panthéon et distinguer deux joueurs. */
function pickPseudo(){
  const actuel = (window.Stats && Stats.pseudo) || '';
  G.back = [];
  fullScreen(`<div class="week-hero">
      <div class="week-when">${TR('AVANT DE COMMENCER')}</div>
      <div class="week-what">${TR('Comment vous appelle-t-on ?')}</div>
      <div class="week-why">${TR('Ce pseudo accompagnera vos carrières. Vous pourrez le changer plus tard.')}</div></div>
    <input id="pseudo" class="champ" type="text" maxlength="24" autocomplete="nickname"
           placeholder="${TR('Votre pseudo')}" value="${esc(actuel)}">
    <button class="btn btn-primary" id="prapide">⚡ ${TR('DÉPART RAPIDE')}</button>
    <p class="p-meta" style="margin:-4px 0 10px">${TR('Le jeu tire un joueur pour vous et lance une saison express. Vous jouez dans dix secondes.')}</p>
    <button class="btn btn-ghost" id="pgo">🎾 ${TR('CRÉER MON JOUEUR MOI-MÊME')}</button>
    <p class="p-meta" style="margin-top:14px">${TR('Aucun compte, aucun mot de passe, aucune adresse e-mail. Le jeu retient seulement ce pseudo et le déroulé de vos parties.')}</p>`, home);

  const champ = $('pseudo');
  const nommer = () => {
    const v = (champ.value || '').trim().slice(0, 24);
    if (window.Stats) Stats.bonjour(v || 'Anonyme');
  };
  const partir = () => { nommer(); pickNation(); };
  /* Départ rapide : 43 % des abandons se produisaient avant la fin de la première
     saison, et neuf écrans séparaient l'arrivée du premier point joué. Ici on tire
     un joueur crédible et on part en Express — le chemin long reste à un clic. */
  $('prapide').onclick = () => {
    nommer();
    if (window.Stats) Stats.evt('depart_rapide');
    const langue = (window.I18N && I18N.langue) || 'fr';
    const natCode = langue === 'es' ? 'ESP' : langue === 'en' ? 'GBR' : 'FRA';
    const nation = NATIONS.find(n => n.code === natCode) || NATIONS[0];
    const pick = a => a[Math.floor(Math.random() * a.length)];
    G.draft = { nation, gender: Math.random() < 0.5 ? 'm' : 'w',
                style: pick(STYLES), origin: pick(ORIGINS), lifestyle: pick(LIFESTYLES),
                mode: 'express', rapide: true };
    launch();
  };
  $('pgo').onclick = partir;
  champ.onkeydown = e => { if (e.key === 'Enter') partir(); };
  setTimeout(() => { try { champ.focus(); } catch (e){} }, 60);
}
function renderPick(title, sub, items, grid){
  $('pick-title').textContent = title;
  if (window.Stats) Stats.voir('creation:' + title.slice(0, 24));
  $('pick-sub').textContent = sub;
  const l = $('pick-list');
  l.className = grid ? 'pick-list grid-nat' : 'pick-list';
  l.innerHTML = '';
  items.forEach((it,i) => {
    const b = el('button','opt', it.html);
    b.style.animationDelay = (i*18)+'ms';
    b.onclick = it.go;
    l.appendChild(b);
  });
  show('sc-pick');
}

function pickNation(){
  G.draft = {}; G.back.push(home);
  renderPick(TR('VOTRE NATION'), TR('Elle oriente vos surfaces de prédilection et votre notoriété.'),
    NATIONS.map(n => ({ html:`<span class="flag">${n.flag}</span><span class="opt-name">${n.name}</span>`,
      go:()=>{ G.draft.nation=n; pickGender(); } })), true);
}
function pickGender(){
  G.back.push(pickNation);
  renderPick(TR('VOTRE CIRCUIT'), TR('Sur quel circuit allez-vous écrire votre histoire ?'), [
    { html:`<div class="opt-name">🎾 ${TR('Circuit masculin')}</div><div class="opt-desc">${TR('Grands Chelems en trois sets gagnants. Des matchs qui peuvent durer cinq heures.')}</div>`,
      go:()=>{ G.draft.gender='m'; pickStyle(); } },
    { html:`<div class="opt-name">🎾 ${TR('Circuit féminin')}</div><div class="opt-desc">${TR('Tableaux en deux sets gagnants. Un circuit plus ouvert, où tout peut basculer en une saison.')}</div>`,
      go:()=>{ G.draft.gender='w'; pickStyle(); } }
  ]);
}
function pickStyle(){
  G.back.push(pickGender);
  renderPick(TR('VOTRE STYLE DE JEU'), TR('Il détermine vos attributs clés, vos surfaces et votre plafond.'),
    STYLES.map(s => ({ html:
      `<div class="opt-name">${s.icon} ${s.name}</div><div class="opt-desc">${s.desc}</div>
       <div class="opt-fx">${surfLine(s.surf)}</div>`,
      go:()=>{ G.draft.style=s; pickOrigin(); } })));
}
function surfLine(sf){
  return ['clay','hard','grass'].map(k => {
    const v = (sf && sf[k]) || 0;
    return `${SURFACES[k].icon} ${SURFACES[k].short} ${v>0?'+':''}${v}`;
  }).join(' · ');
}
function pickOrigin(){
  G.back.push(pickStyle);
  renderPick(TR('VOTRE FORMATION'), TR('D\'où venez-vous, et avec quoi arrivez-vous chez les pros ?'),
    ORIGINS.map(o => ({ html:
      `<div class="opt-name">${o.icon} ${o.name}</div><div class="opt-desc">${o.desc}</div>
       <div class="opt-fx">${ATTRS.map(a=>a.name.slice(0,3)+' '+o.attrs[a.k]).join(' · ')}</div>`,
      go:()=>{ G.draft.origin=o; pickLife(); } })));
}

function pickLife(){
  G.back.push(pickOrigin);
  renderPick(TR('VOTRE HYGIÈNE DE VIE'),
    TR('Onze mois de circuit par an. Comment tenez-vous debout ?'),
    LIFESTYLES.map(l => ({ html:
      `<div class="opt-name">${l.icon} ${l.name}</div><div class="opt-desc">${l.desc}</div>
       <div class="opt-fx">${Object.entries(l.fx).map(([k,v]) => {
         const nm = { disc:'Discipline', form:'Fraîcheur', body:'Corps', rep:'Notoriété', mor:'Moral' }[k] || k;
         return `${nm} ${v>0?'+':''}${v}`; }).join(' · ')}${
         l.potBonus ? ` · potentiel ${l.potBonus>0?'+':''}${l.potBonus}` : ''}</div>`,
      go:()=>{ G.draft.lifestyle=l; pickMode(); } })));
}

function pickMode(){
  G.back.push(pickLife);
  renderPick(TR('VOTRE RYTHME'), TR('Vous pourrez toujours changer d\'avis en cours de carrière.'), [
    { html:`<div class="opt-name">⚡ ${TR('Carrière express')}</div>
       <div class="opt-desc">${TR('Une saison se décide en un plan. Le circuit s\'occupe du reste, et vous ne reprenez la main que sur les matchs qui comptent.')}</div>
       <div class="opt-fx">${TR('Une carrière complète en dix à quinze minutes.')}</div>`,
      go:()=>{ G.draft.mode='express'; launch(); } },
    { html:`<div class="opt-name">🗓️ ${TR('Carrière complète')}</div>
       <div class="opt-desc">${TR('Semaine après semaine. Vous composez votre calendrier, vous choisissez chaque bloc de travail, vous jouez vos matchs jeu par jeu.')}</div>
       <div class="opt-fx">${TR('Plusieurs heures. C\'est le simulateur intégral.')}</div>`,
      go:()=>{ G.draft.mode='full'; launch(); } }
  ]);
}

function launch(){
  fullScreen(`<div class="card" style="text-align:center;padding:40px 20px">
    <div class="week-what">${TR('CONSTRUCTION DU CIRCUIT')}</div>
    <p class="week-why" style="margin-top:10px">${TR('1 150 joueurs, 900 tournois, une saison entière jouée à blanc pour que le classement mondial soit réel avant votre arrivée…')}</p></div>`);
  setTimeout(() => {
    G.c = Career.create(G.draft);
    G.c.mode = G.draft.mode || 'full';
    if (window.Stats) Stats.nouvellePartie(G.c, G.draft);
    G.tab = 'week'; G.back = [];
    autosave(true);
    if (G.c.mode === 'express'){
      if (G.draft && G.draft.rapide) return exRapideIntro();
      return exPlan();
    }
    setTab('week');
  }, 60);
}

/* Le seul écran entre le clic « Départ rapide » et le jeu : qui est le joueur,
   en trois lignes, et un bouton. Le plan est pré-choisi (chasser les points, la
   faiblesse du moment) — c'est le meilleur plan pour un débutant, mesuré. */
function exRapideIntro(){
  const c = G.c, me = c.me;
  if (window.Stats) Stats.voir('depart-rapide');
  fullScreen(`<div class="week-hero">
      <div class="week-when">${TR('VOTRE JOUEUR')}</div>
      <div class="week-what">${esc(me.name)} ${me.nation.flag}</div>
      <div class="week-why">${me.age} ${TR('ans')} · ${esc(me.style.name)} · ${esc(me.origin ? me.origin.name : '')}<br>
        ${TR('Talent')} ${potStars(me.pot)} · #${me.rank} ${TR('mondial')}</div>
      <div class="chips"><span class="chip">${TR('Plan')} : ${esc(SEASON_PLANS[0].name)}</span>
        <span class="chip">${TR('Travail')} : ${esc((TRAIN_AXES.find(a => a.id === 'faible') || TRAIN_AXES[0]).name)}</span></div></div>
    <div class="panel"><div class="r-s">${TR('Le circuit va dérouler votre première saison. Vous reprendrez la main sur les matchs qui comptent — et vous pourrez tout régler ensuite, du plan à l\'équipe.')}</div></div>
    <button class="btn btn-primary" id="rgo">🎾 ${TR('C\'EST PARTI')}</button>
    <button class="btn btn-ghost" id="rplan">${TR('Je préfère choisir mon plan')}</button>`);
  $('rgo').onclick = () => { Career.expressBegin(c, 'points', 'faible'); exRun(); };
  $('rplan').onclick = exPlan;
}

/* ══════════════════ CHANGEMENT DE RYTHME ══════════════════
   L'écran de création le promet : on doit pouvoir changer d'avis. Les deux modes
   partagent le même moteur et le même état de carrière, donc la bascule se résume
   à changer c.mode et à repartir par la bonne porte. Un tournoi laissé en cours est
   repris proprement de part et d'autre : le mode complet retrouve son tableau,
   le mode Express le termine tout seul. */
function switchMode(to){
  const c = G.c;
  if (!c || c.mode === to) return;
  c.mode = to;
  G.exReturn = null;
  if (to === 'express'){
    // On conserve le quota de matchs clés déjà consommé cette année : sans ça,
    // un aller-retour express → complet → express le remettait à zéro.
    const dejaJoues = (c.express && c.express.year === c.world.year) ? c.express.keyCount : 0;
    c.express = null;
    G.exKeyCarry = dejaJoues;
    autosave(true);
    return exPlan();
  }
  c.express = null;
  G.tab = 'week';
  autosave(true);
  setTab('week');
}

/* Le bouton qui va vers l'autre rythme, avec ce qu'il faut de mise en garde. */
function modeSwitchBtn(){
  const c = G.c;
  return c.mode === 'express'
    ? `<button class="btn btn-ghost" id="tofull">🗓️ ${TR('Passer en carrière complète')}</button>`
    : `<button class="btn btn-ghost" id="toexp">⚡ ${TR('Passer en carrière express')}</button>`;
}
function wireModeSwitch(){
  const a = $('tofull'), b = $('toexp');
  if (a) a.onclick = () => {
    if (confirm('Passer en carrière complète ?\n\nVous reprendrez la main sur chaque semaine et chaque match. '
      + 'Votre classement, votre équipe et votre saison en cours sont conservés.')) switchMode('full');
  };
  if (b) b.onclick = () => {
    if (confirm('Passer en carrière express ?\n\nVous fixerez un plan pour l\'année et ne reprendrez la main '
      + 'que sur les matchs décisifs. Votre classement, votre équipe et votre saison en cours sont conservés.')) switchMode('express');
  };
}

/* ══════════════════ CADRE DE CARRIÈRE ══════════════════ */
function topbar(){
  const c = G.c, me = c.me, w = c.world;
  $('tb-name').innerHTML = esc(me.name) + ' ' + me.nation.flag;
  $('tb-sub').textContent = `${me.age} ans · ${me.style.short} · sem. ${w.week}/${World.W} ${w.year}`;
  $('tb-rank').textContent = '#' + me.rank;
  const mo = $('tb-money');
  mo.textContent = M$(c.money);
  mo.className = 'tb-money' + (c.money < 0 ? ' neg' : '');

  const bar = (id, v) => { const e = $(id); e.style.width = Math.max(2, v)+'%';
    e.style.background = v>62 ? 'var(--good)' : v>35 ? 'var(--warn)' : 'var(--bad)'; };
  bar('mb-fit', c.fitness); bar('mb-body', Career.bodyAvg(c)); bar('mb-mor', c.moral);
}

document.querySelectorAll('.tab').forEach(t => t.onclick = () => setTab(t.dataset.tab));

function setTab(tab){
  G.tab = tab;
  if (window.Stats && G.c) Stats.pouls(G.c);
  if (tab !== 'week') setSurface('');
  if (G.exReturn && tab === 'week'){ const f = G.exReturn; G.exReturn = null; return f(); }
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  topbar();
  $('tab-body').innerHTML = '';
  ({ week:tabWeek, cal:tabCal, train:tabTrain, team:tabTeam, rank:tabRank,
     prog:tabProg, me:tabMe })[tab]();
  show('sc-career');
}
const body = h => { $('tab-body').innerHTML = h; };

/* ══════════════════ ONGLET SEMAINE ══════════════════ */
function tabWeek(){
  const c = G.c, w = c.world;
  const wk = Career.beginWeek(c);
  const def = Career.defending(c, w.week);

  if (wk.type === 'injured'){
    setSurface('');
    body(`<div class="week-hero">
      <div class="week-when">${TR('SEMAINE')} ${w.week} · ${w.year}</div>
      <div class="week-what">🩹 ${c.me.injury ? c.me.injury.name : 'Blessé'}</div>
      <div class="week-why">${c.me.injury ? c.me.injury.label : 'Indisponible'} —
        encore <b>${wk.weeks} semaine${wk.weeks>1?'s':''}</b> avant le retour à la compétition.</div>
      <div class="chips"><span class="chip bad">Aucun tournoi possible</span>
        ${def ? `<span class="chip warn">${def} pts perdus cette semaine</span>` : ''}</div>
    </div>
    <button class="btn btn-primary" id="go">${TR('PASSER LA SEMAINE EN RÉÉDUCATION')}</button>
    <button class="btn btn-ghost" id="ff">⏩ ${TR('PASSER PLUSIEURS SEMAINES')}</button>
    <div class="sec">${TR('ÉTAT DU CORPS')}</div>${bodyHtml()}`);
    $('go').onclick = () => { const m = Career.rehabWeek(c); advanceWeek(null, m ? [{txt:m,good:true}] : []); };
    $('ff').onclick = ffScreen;
    return;
  }

  if (wk.type === 'tournament'){
    const t = wk.t, tier = TIERS[t.tier];
    const cut = World.estimateCut(w, t);
    setSurface(t.surf);
    body(`<div class="week-hero surf-${t.surf}">
      <div class="hero-court">${courtSvg(t.surf, { h:52 })}</div>
      <div class="week-when">SEMAINE ${w.week} · ${w.year}</div>
      <div class="week-what">${t.name}</div>
      <div class="week-why">${tier.name} · tableau de ${t.draw}${
        (t.span||1) > 1 ? ` · ${t.span} semaines` : ''} · dotation ${M$(tier.prize[tier.prize.length-1])} au vainqueur</div>
      <div class="chips">
        <span class="chip ${t.surf}">${SURFACES[t.surf].icon} ${SURFACES[t.surf].name}</span>
        <span class="chip">${tier.pts[tier.pts.length-1]} pts au vainqueur</span>
        <span class="chip ${wk.status==='direct'?'good':'warn'}">${wk.status==='direct'?'Entrée directe':'Qualifications'}</span>
        ${def ? `<span class="chip warn">${def} pts à défendre</span>` : ''}
        ${c.fitness < 45 ? `<span class="chip bad">Fraîcheur ${Math.round(c.fitness)} %</span>` : ''}
      </div></div>
      <button class="btn btn-primary" id="go">${TR('DISPUTER LE TOURNOI')}</button>
      <button class="btn btn-ghost" id="skip">${TR('Renoncer et travailler cette semaine')}</button>
      <button class="btn btn-ghost" id="ff">⏩ ${TR('AVANCE RAPIDE')}</button>
      ${objectiveHtml()}${feedHtml(4)}`);
    $('go').onclick = () => openTournament(t, wk.status);
    $('skip').onclick = () => { Career.clearEntry(c, w.week); setTab('week'); };
    $('ff').onclick = ffScreen;
    return;
  }

  const best = Career.bestFit(c, w.week);
  setSurface('');
  body(`<div class="week-hero">
    <div class="week-when">SEMAINE ${w.week} · ${w.year}</div>
    <div class="week-what">Semaine libre</div>
    <div class="week-why">Aucun tournoi au programme. C'est le moment de travailler, de récupérer,
      ou de gagner un peu d'argent.</div>
    <div class="chips">
      ${def ? `<span class="chip warn">${def} pts à défendre — non défendus</span>` : ''}
      <span class="chip">Fraîcheur ${Math.round(c.fitness)} %</span>
      <span class="chip ${c.money<0?'bad':''}">Trésorerie ${M$(c.money)}</span>
    </div></div>
    ${best ? `<button class="btn btn-accent" id="ins">S'INSCRIRE À ${esc(best.t.name.toUpperCase())}</button>` : ''}
    <button class="btn btn-primary" id="work">${TR('CHOISIR LE TRAVAIL DE LA SEMAINE')}</button>
    <button class="btn btn-ghost" id="ff">⏩ AVANCE RAPIDE</button>
    ${objectiveHtml()}${feedHtml(5)}
    <div class="sec">BOÎTE DE RÉCEPTION</div>${inboxHtml(3)}`);
  if (best) $('ins').onclick = () => { Career.enter(c, w.week, best.t.id); setTab('week'); };
  $('work').onclick = () => setTab('train');
  $('ff').onclick = ffScreen;
}

/* ══════════════════ MODE EXPRESS ══════════════════
   Une saison = un plan. Puis on ne rend la main que sur ce qui compte. */

function exPlan(){
  const c = G.c;
  if (window.Stats) Stats.voir('plan-saison');
  G.ui.exPlan = G.ui.exPlan || 'points';
  // On garde une compatibilité avec les parties commencées avant les axes de travail :
  // un ancien identifiant de bloc n'est plus une valeur valide ici.
  if (!TRAIN_AXES.some(a => a.id === G.ui.exTrain)) G.ui.exTrain = 'faible';
  const ob = c.objective;

  let h = `<div class="week-hero">
      <div class="week-when">${TR('SAISON')} ${c.world.year} · ${c.me.age} ${TR('ANS')}</div>
      <div class="week-what">${TR('Votre plan pour l\'année')}</div>
      <div class="week-why">${TR('Vous fixez une ligne, le circuit s\'occupe du reste.')}</div>
      <div class="chips"><span class="chip">#${c.me.rank} mondial</span>
        <span class="chip">Fraîcheur ${Math.round(c.fitness)} %</span>
        <span class="chip">Corps ${Math.round(Career.bodyAvg(c))} %</span>
        <span class="chip ${c.money<0?'bad':''}">${M$(c.money)}</span></div></div>
    ${ob ? `<div class="panel" style="border-left:3px solid var(--warn)">
      <div class="r-t">🎯 ${esc(ob.label)}</div>
      <div class="r-s">Prime de ${M$(ob.reward)} si vous y arrivez.</div></div>` : ''}
    <div class="sec">${TR('OÙ JOUER CETTE ANNÉE')}</div><div id="explans"></div>
    <div class="sec">${TR('QUOI TRAVAILLER')}</div><div id="extr"></div>
    <div class="sec">VOTRE ÉQUIPE</div>
    <div class="panel"><div class="r-s">${STAFF_ROLES.map(r => {
        const s = Career.staffOf(c, r.k);
        return `${r.icon} ${esc(s.name)}`;
      }).join(' · ')}<br><span style="color:var(--txt3)">Charges ${M$(Career.weeklyCost(c))} par semaine.</span></div></div>
    <button class="btn btn-ghost" id="exteam">🧢 ${TR('CHANGER MON ÉQUIPE')}</button>
    <button class="btn btn-primary" id="exgo">${TR('LANCER LA SAISON')}</button>
    ${modeSwitchBtn()}
    ${feedHtml(3)}`;
  fullScreen(h);
  wireModeSwitch();
  $('exteam').onclick = exTeam;

  SEASON_PLANS.forEach(pl => {
    const b = el('button','pick-row'+(G.ui.exPlan===pl.id?' sel':''),
      `<span class="r-main"><span class="pr-t">${pl.icon} ${pl.name}</span>
       <span class="pr-d">${pl.desc}</span></span>`);
    b.onclick = () => { G.ui.exPlan = pl.id; exPlan(); };
    $('explans').appendChild(b);
  });
  TRAIN_AXES.forEach(a => {
    const b = el('button','pick-row'+(G.ui.exTrain===a.id?' sel':''),
      `<span class="r-main"><span class="pr-t">${a.icon} ${a.name}</span>
       <span class="pr-d">${a.desc}</span></span>
       <span class="pr-r">${(() => {
         const tr = TRAININGS.find(t => t.id === Career.trainingForAxis(c, a.id));
         return tr ? tr.icon + '<br>' + tr.name : '';
       })()}</span>`);
    b.onclick = () => { G.ui.exTrain = a.id; exPlan(); };
    $('extr').appendChild(b);
  });
  $('exgo').onclick = () => {
    Career.expressBegin(c, G.ui.exPlan, G.ui.exTrain);
    if (G.exKeyCarry){ c.express.keyCount = G.exKeyCarry; G.exKeyCarry = 0; }
    exRun();
  };
}

/* En mode Express on ne voit jamais la barre d'onglets : sans cet écran, aucun
   entraîneur, aucun kiné n'était recrutable de toute la carrière. On règle donc
   son équipe une fois par an, depuis le plan de saison. */
function exTeam(){
  const c = G.c;
  fullScreen(`<div class="week-hero">
      <div class="week-when">VOTRE ÉQUIPE · ${c.world.year}</div>
      <div class="week-what">Qui travaille avec vous</div>
      <div class="week-why">Un entraîneur fait progresser votre jeu semaine après semaine.
        Un préparateur physique vous évite les blessures, un kiné vous remet debout plus vite.
        Tout cela se paie chaque semaine, jouée ou non.</div>
      <div class="chips"><span class="chip ${c.money<0?'bad':''}">${M$(c.money)} en caisse</span>
        <span class="chip">Charges ${M$(Career.weeklyCost(c))}/sem.</span>
        <span class="chip">#${c.me.rank} mondial</span></div>
      <div class="week-why" style="margin-top:8px">Talent brut <b>${c.me.pot}</b> ·
        plafond atteignable avec cette équipe <b style="color:var(--gold)">${Career.effPot(c)}</b>
        <span style="color:var(--txt3)">— il faut 80 pour le top 100, 91 pour le top 10.</span></div></div>
    ${staffPackHtml(c)}
    ${G.ui.staffDetail ? `<div class="sec">POSTE PAR POSTE</div>${staffPickHtml(c)}` : ''}
    <button class="btn btn-ghost" id="exteam-det">${G.ui.staffDetail
      ? '▲ Masquer le détail' : '⚙️ Ajuster poste par poste'}</button>
    <button class="btn btn-primary" id="exteam-ok">REVENIR AU PLAN DE SAISON</button>`);
  wireStaffPicks(c, exTeam);
  $('exteam-det').onclick = () => { G.ui.staffDetail = !G.ui.staffDetail; exTeam(); };
  $('exteam-ok').onclick = exPlan;
}

/* Les quatre formules, en façade. */
function staffPackHtml(c){
  const cur = Career.currentStaffPack(c);
  return STAFF_PACKS.map(p => {
    // Ce que la formule donnerait réellement, compte tenu des finances du moment.
    const avant = Object.assign({}, c.staff), packAvant = c.staffPack;
    Career.applyStaffPack(c, p.id);
    const cap = Career.effPot(c), cout = Career.weeklyCost(c);
    const noms = STAFF_ROLES.map(r => Career.staffOf(c, r.k).name);
    c.staff = avant; c.staffPack = packAvant;
    return `<button class="pick-row${cur===p.id?' sel':''}" data-pack="${p.id}">
      <span class="r-main"><span class="pr-t">${p.icon} ${esc(p.name)}</span>
      <span class="pr-d">${esc(p.desc)}</span>
      <span class="pr-d" style="opacity:.65">${noms.map(esc).join(' · ')}</span></span>
      <span class="pr-r">${cout > BAL.weeklyBase ? M$(cout)+'/sem.' : 'gratuit'}<br>
        <b style="color:var(--gold)">plafond ${cap}</b></span></button>`;
  }).join('');
}

/* Les clics, communs aux formules et au détail poste par poste. */
function wireStaffPicks(c, redraw, box){
  const root = $(box || 'full-body');
  root.querySelectorAll('[data-pack]').forEach(b => b.onclick = () => {
    Career.applyStaffPack(c, b.dataset.pack); autosave(); redraw();
  });
  root.querySelectorAll('[data-role]').forEach(b => b.onclick = () => {
    if (b.disabled) return;
    c.staff[b.dataset.role] = b.dataset.id;
    c.staffPack = null;                 // on sort des formules dès qu'on ajuste à la main
    autosave(); redraw();
  });
}

/* Avance jusqu'à la prochaine décision. */
function exRun(){
  const c = G.c;
  fullScreen(`<div class="card" style="text-align:center;padding:38px 18px">
    <div class="week-what">${TR('SAISON')} ${c.world.year} — ${TR('EN COURS')}</div>
    <p class="week-why" style="margin-top:8px">${TR('Semaine')} ${c.world.week} / ${World.W}…</p></div>`);
  if (window.Stats) Stats.pouls(c);
  setTimeout(() => {
    let r;
    // Une exception ici laissait l'écran figé sur « SAISON EN COURS », sans rien dire.
    // Un blocage muet est le pire des défauts : on le rend visible et on offre une sortie.
    try { r = Career.expressAdvance(c); }
    catch (err){ return exCrash(err); }
    autosave();
    if (!r) return exCrash(new Error('expressAdvance n\'a rien renvoyé'));
    if (r.type === 'keyMatch')   return exKeyMatch(r);
    if (r.type === 'event')      return eventScreen(r.event, exRun);
    if (r.type === 'seasonEnd')  return exSeasonEnd(r);
    if (r.type === 'careerEnd')  return endCareer();
    if (r.type === 'needPlan')   return exPlan();
    exRun();
  }, 30);
}

/* La saison n'a pas pu avancer. On le dit, et on laisse une porte de sortie. */
function exCrash(err){
  const c = G.c;
  console.error('[VAMONOS TENNIS] blocage en saison', c && c.world ? c.world.year : '?', err);
  fullScreen(`<div class="card"><div class="card-cat">⚠️ LA SAISON N'A PAS PU AVANCER</div>
    <div class="card-txt">Le circuit s'est arrêté en <b>${c.world.year}</b>, semaine ${c.world.week}.
      Votre carrière est intacte — c'est le déroulé de la saison qui a buté.</div>
    <div class="p-meta" style="margin-top:10px;font-family:monospace;font-size:11px;
      word-break:break-word;opacity:.75">${esc(String(err && err.message || err))}</div>
    <div class="card-opts">
      <button class="btn btn-primary" id="ex-retry">RÉESSAYER</button>
      <button class="btn btn-ghost" id="ex-plan">REVENIR AU PLAN DE SAISON</button>
      <button class="btn btn-ghost" id="ex-full">PASSER EN CARRIÈRE COMPLÈTE</button>
    </div></div>`);
  $('ex-retry').onclick = exRun;
  $('ex-plan').onclick  = () => { c.express = null; exPlan(); };
  $('ex-full').onclick  = () => switchMode('full');
}

/* Le match qui compte : on n'en joue que les points décisifs. */
function exKeyMatch(r){
  const c = G.c, st = r.st, opp = r.opp;
  const tier = TIERS[r.t.tier];
  const round = st.davis ? 'Finale de Coupe Davis' : Career.roundName(st, st.round);
  const sc = st.davis ? null : Career.scout(c, opp, r.t.surf);
  setSurface(r.t.surf);

  fullScreen(`<div class="mh surf-${r.t.surf}">
      <div class="mh-court">${courtSvg(r.t.surf, { h:58 })}</div>
      <div class="mh-top">${esc(tier.name.toUpperCase())} · ${esc(r.t.name.toUpperCase())}</div>
      <div class="week-what" style="margin-top:4px">${esc(round)}</div>
      <div class="week-why">Le match de votre saison. Vous n'en jouerez que les points décisifs.</div>
    </div>
    <div class="week-hero">
      <div class="week-when">FACE À VOUS</div>
      <div class="week-what">${esc(opp.name)} ${opp.nation.flag}</div>
      <div class="week-why">#${opp.rank} mondial · ${opp.age} ans · ${opp.style.name}</div>
    </div>
    ${sc ? scoutHtml(sc) : ''}
    <div class="sec">${TR('VOTRE PLAN DE JEU')}</div><div id="tacbox"></div>
    <button class="btn btn-primary" id="play">${TR('ENTRER SUR LE COURT')}</button>`);

  const reco = sc ? sc.tactic : 'balanced';
  if (!G.ui.tacticTouched) G.ui.tactic = reco;
  TACTICS.forEach(tc => {
    const b = el('button','pick-row'+((G.ui.tactic||'balanced')===tc.id?' sel':'')+(tc.id===reco?' reco':''),
      `<span class="r-main"><span class="pr-t">${tc.icon} ${tc.name}</span>
       <span class="pr-d">${tc.desc}</span></span>`);
    b.onclick = () => { G.ui.tactic = tc.id; G.ui.tacticTouched = true; exKeyMatch(r); };
    $('tacbox').appendChild(b);
  });

  $('play').onclick = () => {
    const m = MatchEngine.create(c.me, opp, {
      surface: r.t.surf,
      // Sur le circuit féminin, tout se joue en deux sets gagnants — Chelems compris.
      bo5: c.me.gender === 'w' ? false : (st.davis ? true : !!tier.bo5),
      tournament: r.t.name, round,
      tacticA: G.ui.tactic || 'balanced',
      fatigueA: Math.max(0, 100 - c.fitness), fatigueB: opp.fatigue || 0,
      clutchBonus: Career.clutchAgainst(c, opp)
    });
    m.maxMoments = m.bo5 ? 4 : 3;
    G.match = m; G.exMatch = true;
    if (window.Stats){ Stats.premierMatch(); Stats.voir('match'); }
    MatchEngine.playAll(m);       // on file jusqu'au premier point qui compte
    renderMatch();
    show('sc-match');
  };
}

/* Bilan de fin de saison, condensé. */
function exSeasonEnd(r){
  const c = G.c, s = r.season, log = r.log || [];
  if (window.Stats) Stats.voir('bilan-saison');
  if (!s) return exPlan();
  const prev = c.seasons.length > 1 ? c.seasons[c.seasons.length-2] : null;
  const move = prev ? (s.rank < prev.rank
      ? `<span style="color:var(--good)">▲ ${prev.rank - s.rank} places</span>`
      : s.rank > prev.rank ? `<span style="color:var(--bad)">▼ ${s.rank - prev.rank} places</span>`
      : '— stable') : '';
  const forts = log.filter(x => x.good).slice(-8);

  let h = `<div class="week-hero">
      <div class="week-when">${TR('SAISON')} ${s.year} · ${s.age} ${TR('ANS')}</div>
      <div class="week-what">#${s.rank} mondial</div>
      <div class="week-why">${move}</div>
      ${s.headline?`<div class="week-why" style="font-style:italic;color:var(--gold);margin-top:6px">📰 ${esc(s.headline)}</div>`:''}
      ${(s.awards&&s.awards.length)?`<div class="chips">${s.awards.map(k=>
        `<span class="chip good">${AWARDS[k].icon} ${AWARDS[k].name}</span>`).join('')}</div>`:''}
    </div>
    <div class="stat-grid">
      <div class="sg"><b>${s.w}–${s.l}</b><span>${TR('BILAN')}</span></div>
      <div class="sg"><b>${s.titles.length}</b><span>${TR('TITRES')}</span></div>
      <div class="sg"><b>${s.points}</b><span>${TR('POINTS')}</span></div>
      <div class="sg"><b>${M$(s.prize)}</b><span>${TR('GAINS')}</span></div>
    </div>
    ${s.objective?`<div class="panel" style="border-left:3px solid ${s.objective.ok?'var(--good)':'var(--bad)'}">
      <div class="r-t">${s.objective.ok?'✔':'✘'} ${esc(s.objective.label)}</div>
      <div class="r-s">${s.objective.ok?'Objectif atteint — prime versée':'Objectif manqué'}</div></div>`:''}
    ${forts.length?`<div class="sec">${TR('LES MOMENTS DE LA SAISON')}</div><div class="panel">${
      forts.map(x => `<div class="draw-line"><span class="dl-r">${x.tier||''}</span>
        <span><span class="dot ${x.surf}"></span> ${esc(x.name)}</span>
        <span class="r-v ${x.res==='VAINQUEUR'?'dl-w':''}">${esc(x.res)}</span></div>`).join('')}</div>`:''}
    ${s.injWeeks?`<div class="panel"><div class="r-s">🩹 ${s.injWeeks} semaines d'indisponibilité cette saison.</div></div>`:''}
    ${s.rivalNews?`<div class="panel"><div class="r-t" style="font-weight:400">⚔️ ${esc(s.rivalNews)}</div></div>`:''}
    ${feedHtml(3)}`;

  const pr = Career.retirementPressure(c);
  if (pr) h += `<div class="sec">${TR('FIN DE CARRIÈRE ?')}</div>
    <div class="panel" style="border-left:3px solid var(--warn)">
      ${pr.reasons.map(x=>`<div class="scnote">${esc(x)}</div>`).join('')}</div>`;

  h += `<button class="btn btn-primary" id="exnext">${TR('SAISON')} ${s.year+1}</button>
    <button class="btn btn-ghost" id="detail">📊 ${TR('VOIR MA PROGRESSION')}</button>
    <button class="btn btn-ghost" id="exshare">📣 ${TR('PARTAGER MA SAISON')}</button>
    ${modeSwitchBtn()}
    ${pr?`<button class="btn btn-ghost" id="stop">🎾 ${TR('RACCROCHER LA RAQUETTE')}</button>`:''}
    ${partenaireHtml()}`;
  fullScreen(h);
  setSurface('');
  wireModeSwitch();
  brancherPartenaire();

  // id distinct de celui du match : le bouton « CONTINUER » de l'écran de match reste
  // dans le DOM, et comme sc-match précède sc-full, getElementById('next') tombait sur
  // lui. Le bouton visible du bilan se retrouvait sans gestionnaire — clic sans effet.
  $('exnext').onclick = () => (c.me.age > BAL.ageMax || c.flags.wants_retire) ? endCareer() : exPlan();
  $('detail').onclick = () => { G.exReturn = () => exSeasonEnd(r); setTab('prog'); };
  $('exshare').onclick = () => shareScreen(c, () => exSeasonEnd(r));
  if ($('stop')) $('stop').onclick = () => { if (confirm('Mettre un terme à votre carrière ?')) endCareer(); };
}

/* ══════════════════ AVANCE RAPIDE ══════════════════ */
const FF_WEEKS = [
  { n:1,  label:'1 semaine' },
  { n:2,  label:'2 semaines' },
  { n:4,  label:'1 mois' },
  { n:8,  label:'2 mois' },
  { n:99, label:'Jusqu\'à la fin de la saison' }
];
const FF_MODES = [
  { id:'all',    label:'Tous les tournois',        desc:'On s\'arrête à chaque tournoi pour que vous le jouiez vous-même.' },
  { id:'big',    label:'Masters 1000 et Chelems',  desc:'Les petits tournois sont simulés, les grands rendez-vous vous attendent.' },
  { id:'majors', label:'Grands Chelems seulement', desc:'Toute la saison est simulée sauf les quatre semaines qui comptent.' },
  { id:'none',   label:'Tout simuler',             desc:'Aucun arrêt pour un tournoi. On ne s\'arrête que sur blessure ou événement.' }
];

function ffScreen(){
  const c = G.c;
  G.ui.ffMode = G.ui.ffMode || 'big';
  G.ui.ffTrain = G.ui.ffTrain || 'ground';
  let h = `<button class="btn-back" id="ffback">← Retour</button>
    <h2 class="pick-title">AVANCE RAPIDE</h2>
    <p class="pick-sub">Le circuit continue de tourner. Vous reprenez la main quand quelque chose l'exige.</p>
    <div class="sec">S'ARRÊTER POUR</div><div id="ffmodes"></div>
    <div class="sec">TRAVAIL DES SEMAINES LIBRES</div><div class="chips" id="fftr"></div>
    <div class="sec">AVANCER DE</div><div id="ffgo"></div>`;
  fullScreen(h);
  $('ffback').onclick = () => setTab('week');

  FF_MODES.forEach(m => {
    const b = el('button','pick-row'+(G.ui.ffMode===m.id?' sel':''),
      `<span class="r-main"><span class="pr-t">${m.label}</span><span class="pr-d">${m.desc}</span></span>`);
    b.onclick = () => { G.ui.ffMode = m.id; ffScreen(); };
    $('ffmodes').appendChild(b);
  });
  TRAININGS.filter(t => t.id !== 'exho').forEach(t => {
    const b = el('button','chip'+(G.ui.ffTrain===t.id?' good':''), t.icon+' '+t.name);
    b.style.cursor = 'pointer';
    b.onclick = () => { G.ui.ffTrain = t.id; ffScreen(); };
    $('fftr').appendChild(b);
  });
  FF_WEEKS.forEach(w => {
    const n = w.n === 99 ? (World.W - c.world.week + 1) : w.n;
    const b = el('button','btn btn-primary', w.label.toUpperCase() +
      (w.n === 99 ? ` (${n} SEM.)` : ''));
    b.onclick = () => runFF(n);
    $('ffgo').appendChild(b);
  });
}

function runFF(weeks){
  const c = G.c;
  fullScreen(`<div class="card" style="text-align:center;padding:34px 18px">
    <div class="week-what">SIMULATION EN COURS</div>
    <p class="week-why" style="margin-top:8px">Le circuit joue ses ${weeks} semaines…</p></div>`);
  setTimeout(() => {
    const r = Career.fastForward(c, weeks, {
      stopAt: G.ui.ffMode, training: G.ui.ffTrain, intensity: G.ui.intensity || 'normal'
    });
    autosave(true);
    ffRecap(r);
  }, 40);
}

function ffRecap(r){
  const c = G.c;
  const why = {
    tournament: r.t ? `Vous êtes attendu à <b>${esc(r.t.name)}</b>.` : '',
    injury: `<b style="color:var(--bad)">Blessure.</b> Le calendrier s'arrête là.`,
    event: `Quelque chose demande votre attention.`,
    season: `<b>Fin de saison ${r.season ? r.season.year : ''}.</b>`
  }[r.stop] || `${r.done} semaine${r.done>1?'s':''} passée${r.done>1?'s':''}.`;

  let h = `<div class="week-hero">
    <div class="week-when">AVANCE RAPIDE · ${r.done} SEMAINE${r.done>1?'S':''}</div>
    <div class="week-what">Semaine ${c.world.week} · ${c.world.year}</div>
    <div class="week-why">${why}</div>
    <div class="chips"><span class="chip">#${c.me.rank} mondial</span>
      <span class="chip">${c.me.points} pts</span>
      <span class="chip ${c.money<0?'bad':''}">${M$(c.money)}</span>
      <span class="chip">Fraîcheur ${Math.round(c.fitness)} %</span></div></div>`;

  const jour = r.log.filter(l => l.pts !== undefined || /—/.test(l.txt));
  if (jour.length){
    h += `<div class="sec">CE QUI S'EST PASSÉ</div><div class="panel">` +
      jour.slice(-14).map(l => `<div class="row"><span class="r-main">
        <span class="r-t">${esc(l.txt)}</span>
        <span class="r-s">semaine ${l.week}</span></span>
        <span class="r-v" style="color:${l.good?'var(--good)':'var(--txt3)'}">${l.pts?('+'+l.pts+' pts'):''}</span></div>`).join('') +
      `</div>`;
  }
  h += `<button class="btn btn-primary" id="ok">CONTINUER</button>`;
  fullScreen(h);
  $('ok').onclick = () => {
    if (r.stop === 'event' && r.event) return eventScreen(r.event, () => setTab('week'));
    if (r.stop === 'season' && r.season) return seasonScreen(r.season);
    if (c.me.age > BAL.ageMax) return endCareer();
    setTab('week');
  };
}

/* L'objectif de la saison, toujours sous les yeux. */
function objectiveHtml(){
  const c = G.c, ob = c.objective;
  if (!ob) return '';
  const ok = Career.objectiveDone(c);
  return `<div class="sec">OBJECTIF ${ob.year}</div>
    <div class="panel" style="border-left:3px solid ${ok?'var(--good)':'var(--warn)'}">
      <div class="row"><span class="r-main">
        <span class="r-t">${esc(ob.label)}</span>
        <span class="r-s">${ok ? 'Atteint pour l\'instant' : 'Pas encore atteint'} · prime ${M$(ob.reward)}</span></span>
        <span class="r-v" style="color:${ok?'var(--good)':'var(--warn)'}">${ok?'✔':'…'}</span></div></div>`;
}

/* Ce qui se passe sur le circuit pendant que vous jouez. */
function feedHtml(n){
  const f = (G.c.world.feed || []).slice(0, n);
  if (!f.length) return '';
  return `<div class="sec">SUR LE CIRCUIT</div><div class="panel">` +
    f.map(x => `<div class="row"><span class="r-main">
      <span class="r-t" style="font-weight:400;color:${
        x.kind==='big'?'var(--gold)':x.kind==='good'?'var(--good)':'var(--txt2)'}">${esc(x.txt)}</span>
      <span class="r-s">semaine ${x.week} · ${x.year}</span></span></div>`).join('') + `</div>`;
}

/* ══════════════════ ONGLET CALENDRIER ══════════════════ */
function tabCal(){
  const c = G.c, w = c.world;
  let h = `<div class="sec">LES SIX PROCHAINES SEMAINES</div>`;
  for (let k = 0; k < 6; k++){
    const week = w.week + k;
    if (week > World.W) break;
    const list = Career.eligibleTournaments(c, week);
    const cur = Career.entryFor(c, week);
    const def = c.me.pts52[week-1] || 0;
    h += `<div class="sec" style="margin-top:14px">SEMAINE ${week}${def?` · ${def} PTS À DÉFENDRE`:''}</div>`;
    if (!list.length){ h += `<div class="empty">Aucun tournoi accessible avec votre classement.</div>`; continue; }
    list.slice(0, 6).forEach(x => {
      const tier = TIERS[x.t.tier], sel = cur === x.t.id;
      const fitTxt = { ideal:'À votre niveau', ambitieux:'Au-dessus de vous', facile:'Sous votre niveau' }[x.fit];
      h += `<button class="pick-row${sel?' sel':''}" data-w="${week}" data-t="${x.t.id}">
        <span class="r-main"><span class="pr-t">${esc(x.t.name)}
          <span class="chip ${x.t.surf}" style="padding:1px 7px;font-size:10px">${SURFACES[x.t.surf].short}</span></span>
        <span class="pr-d">${tier.name} · ${tier.pts[tier.pts.length-1]} pts · ${M$(tier.prize[tier.prize.length-1])}</span></span>
        <span class="pr-r">${x.status==='direct'?'<b style="color:var(--good)">Direct</b>':'<b style="color:var(--warn)">Qualifs</b>'}<br>${fitTxt}</span>
      </button>`;
    });
  }
  body(h);
  $('tab-body').querySelectorAll('.pick-row').forEach(b => b.onclick = () => {
    const week = +b.dataset.w;
    Career.entryFor(c, week) === b.dataset.t ? Career.clearEntry(c, week) : Career.enter(c, week, b.dataset.t);
    setTab('cal');
  });
}

/* ══════════════════ ONGLET TRAVAIL ══════════════════ */
function tabTrain(){
  const c = G.c;
  if (Career.entryFor(c, c.world.week)){
    body(`<div class="empty">Vous êtes inscrit à un tournoi cette semaine.<br>
      Annulez l'inscription depuis l'onglet Semaine pour travailler à la place.</div>`);
    return;
  }
  const lvlT = Math.round(World.refreshLevel(c.me)), capT = Career.effPot(c);
  const dAge = c.me.age - (c.me.peak || 26);
  const phase = dAge < -2 ? 'Vos années de construction : chaque bloc paie.'
    : dAge <= 0 ? 'Approche du pic : les gains ralentissent, la précision compte.'
    : dAge <= 2 ? 'Au pic. On affine, on n\'empile plus.'
    : 'Après le pic : l\'entraînement freine le déclin, il ne construit plus.';
  let h = `<div class="panel"><div class="r-s">Niveau <b>${lvlT}</b> · plafond avec votre équipe
      <b style="color:var(--gold)">${capT}</b> · ${c.me.age} ans — ${phase}</div></div>
    <div class="sec">LE TRAVAIL DE LA SEMAINE</div>`;
  TRAININGS.forEach(t => {
    const load = t.load > 1 ? 'Charge forte' : t.load > 0.5 ? 'Charge moyenne' : t.load > 0 ? 'Charge légère' : 'Récupération';
    h += `<button class="pick-row" data-tr="${t.id}">
      <span class="r-main"><span class="pr-t">${t.icon} ${t.name}</span>
      <span class="pr-d">${t.desc}</span></span>
      <span class="pr-r">${load}${t.attrs.length?'<br>'+t.attrs.map(k=>ATTRS.find(a=>a.k===k).name).join(', '):''}</span>
    </button>`;
  });
  h += `<div class="sec">INTENSITÉ</div><div class="chips" id="ints"></div>`;
  body(h);
  const box = $('ints');
  INTENSITIES.forEach(i => {
    const b = el('button','chip'+(G.ui.intensity===i.id||(!G.ui.intensity&&i.id==='normal')?' good':''), i.name);
    b.style.cursor='pointer';
    b.onclick = () => { G.ui.intensity = i.id; setTab('train'); };
    box.appendChild(b);
  });
  $('tab-body').querySelectorAll('[data-tr]').forEach(b => b.onclick = () => {
    const log = Career.train(c, b.dataset.tr, G.ui.intensity || 'normal');
    advanceWeek(null, log);
  });
}

/* ══════════════════ ONGLET ÉQUIPE ══════════════════ */
function tabTeam(){
  const c = G.c;
  const cost = Career.weeklyCost(c);
  let h = `<div class="sec">FINANCES</div>
    <div class="panel"><div class="row"><span class="r-main"><span class="r-t">Trésorerie</span></span>
      <span class="r-v" style="color:${c.money<0?'var(--bad)':'var(--good)'}">${M$(c.money)}</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Charges hebdomadaires</span>
        <span class="r-s">staff, voyages, hôtels, cordages</span></span><span class="r-v">${M$(cost)}</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Sur une saison</span></span>
        <span class="r-v">${M$(cost*World.W)}</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Gains en carrière</span></span>
        <span class="r-v">${M$(c.earned)}</span></div></div>`;

  if (c.pendingSponsor){
    const s = c.pendingSponsor;
    h += `<div class="sec">OFFRE EN ATTENTE</div>
      <div class="inbox-item good"><div class="it">${s.icon} ${s.name}</div>
      <div class="ib">${M$(s.annual)} par an pendant ${s.years} ans.</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px">
        <button class="btn btn-primary" id="sp-yes" style="margin:0;font-size:13px;padding:9px">Accepter</button>
        <button class="btn btn-ghost" id="sp-no" style="margin:0;font-size:13px;padding:9px">Refuser</button>
      </div></div>`;
  }
  if (c.sponsors.length){
    h += `<div class="sec">SPONSORS</div><div class="panel">` +
      c.sponsors.map(s => `<div class="row"><span class="r-main"><span class="r-t">${s.icon} ${s.name}</span>
        <span class="r-s">encore ${s.years} an${s.years>1?'s':''}</span></span>
        <span class="r-v">${M$(s.annual)}/an</span></div>`).join('') + `</div>`;
  }

  h += `<div class="sec">VOTRE ÉQUIPE</div>
    <div class="panel"><div class="r-s">Talent brut <b>${c.me.pot}</b> ·
      plafond atteignable avec cette équipe <b style="color:var(--gold)">${Career.effPot(c)}</b>
      <span style="color:var(--txt3)">— il faut 80 pour le top 100, 91 pour le top 10.</span></div></div>
    ${staffPackHtml(c)}
    ${G.ui.staffDetail ? `<div class="sec">POSTE PAR POSTE</div>${staffPickHtml(c)}` : ''}
    <button class="btn btn-ghost" id="team-det">${G.ui.staffDetail
      ? '▲ Masquer le détail' : '⚙️ Ajuster poste par poste'}</button>`;
  body(h);
  wireStaffPicks(c, () => setTab('team'), 'tab-body');
  $('team-det').onclick = () => { G.ui.staffDetail = !G.ui.staffDetail; setTab('team'); };
  if (c.pendingSponsor){
    $('sp-yes').onclick = () => { const s=c.pendingSponsor;
      c.sponsors.push({ type:s.type, name:s.name, icon:s.icon, annual:s.annual, years:s.years });
      c.pendingSponsor = null; setTab('team'); };
    $('sp-no').onclick = () => { c.pendingSponsor = null; setTab('team'); };
  }
}

/* La liste des postes à pourvoir, partagée par l'onglet Équipe du mode complet et
   par l'écran d'équipe du mode Express. */
function staffPickHtml(c){
  let h = '';
  STAFF_ROLES.forEach(r => {
    const cur = Career.staffOf(c, r.k);
    h += `<div class="sec" style="margin:12px 0 6px">${r.icon} ${r.name.toUpperCase()}</div>`;
    STAFF[r.k].forEach(s => {
      const isCur = s.id === cur.id;
      const block = isCur ? null : Career.canHire(c, r.k, s);
      h += `<button class="pick-row${isCur?' sel':''}" data-role="${r.k}" data-id="${s.id}"
        ${block?'disabled style="opacity:.45"':''}>
        <span class="r-main"><span class="pr-t">${s.name}</span>
        <span class="pr-d">${esc(s.desc)}</span></span>
        <span class="pr-r">${s.cost?M$(s.cost)+'/sem.':'gratuit'}<br>${isCur?'<b style="color:var(--gold)">En poste</b>':(block||'Recruter')}</span>
      </button>`;
    });
  });
  return h;
}

/* ══════════════════ ONGLET CLASSEMENT ══════════════════ */
function tabRank(){
  const c = G.c, w = c.world;
  const me = c.me.rank;
  const line = p => {
    const isMe = p.isHuman, isRival = p.id === c.rival.id;
    return `<div class="draw-line${isMe?' me':''}">
      <span class="dl-r">#${p.rank}</span>
      <span>${p.nation.flag} ${esc(p.name)}${isRival?' <span class="seed">rival</span>':''}
        <span class="seed">${p.age} ans · ${p.style.short}</span></span>
      <span class="r-v">${p.points}</span></div>`;
  };
  const around = w.ranking.slice(Math.max(0, me-4), me+4);
  body(`<div class="sec">TOP 30 MONDIAL</div><div class="panel">${w.ranking.slice(0,30).map(line).join('')}</div>
    ${me > 34 ? `<div class="sec">AUTOUR DE VOUS</div><div class="panel">${around.map(line).join('')}</div>` : ''}
    <div class="sec">VOTRE RIVAL</div><div class="panel">${line(c.rival)}
      <div class="p-meta">Confrontations directes : <b>${(c.h2h[c.rival.id]||{w:0}).w||0} — ${(c.h2h[c.rival.id]||{l:0}).l||0}</b></div></div>`);
}

/* ══════════════════ ONGLET PROGRÈS ══════════════════
   Le jeu connaissait tout ça depuis le début et n'en montrait rien. */

/* Une courbe simple, en SVG, sans aucune dépendance. */
function curve(vals, opt){
  opt = opt || {};
  const n = vals.length;
  if (n < 2) return `<div class="empty">Il faut au moins deux saisons pour tracer une courbe.</div>`;
  const W = 320, H = opt.h || 90, P = 6;
  const raw = vals.map(v => opt.log ? Math.log(Math.max(1, v)) : v);
  let lo = Math.min(...raw), hi = Math.max(...raw);
  if (opt.min !== undefined) lo = Math.min(lo, opt.log ? Math.log(opt.min) : opt.min);
  if (opt.max !== undefined) hi = Math.max(hi, opt.log ? Math.log(opt.max) : opt.max);
  if (hi - lo < 0.001) hi = lo + 1;
  const x = i => P + i * (W - 2*P) / (n - 1);
  const y = v => { const t = (v - lo) / (hi - lo); return P + (opt.invert ? t : 1 - t) * (H - 2*P); };
  const pts = raw.map((v,i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${P},${H-P} ${pts} ${(W-P)},${H-P}`;
  const col = opt.color || 'var(--hard)';
  const ref = opt.ref !== undefined
    ? `<line x1="${P}" y1="${y(opt.log?Math.log(opt.ref):opt.ref)}" x2="${W-P}" y2="${y(opt.log?Math.log(opt.ref):opt.ref)}"
        stroke="var(--gold)" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/>` : '';
  const last = raw[n-1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <polygon points="${area}" fill="${col}" opacity=".10"/>
    ${ref}
    <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2"
      stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${x(n-1)}" cy="${y(last)}" r="3.2" fill="${col}"/>
  </svg>`;
}

function recRow(label, r, col){
  const tot = r.w + r.l;
  const pct = tot ? Math.round(r.w / tot * 100) : 0;
  return `<div class="recrow">
    <span class="rec-n">${label}</span>
    <span class="rec-bar"><i style="width:${pct}%;background:${col}"></i></span>
    <span class="rec-v">${r.w}–${r.l}</span>
    <span class="rec-p">${tot?pct+' %':'—'}</span></div>`;
}

function tabProg(){
  const c = G.c, S = c.seasons;
  if (!S.length){
    body(`<div class="empty">Vos courbes apparaîtront à la fin de votre première saison.</div>`);
    return;
  }
  const first = S[0], last = S[S.length-1];
  const ranks  = S.map(s => s.rank);
  const levels = S.map(s => s.level || 0).filter(v => v > 0);
  const bodies = S.map(s => s.body || 0).filter(v => v > 0);
  const reps   = S.map(s => s.rep  || 0);
  const cash   = S.map(s => s.prize || 0);

  const withAttrs = S.filter(s => s.attrs);
  const a0 = withAttrs.length ? withAttrs[0].attrs : null;
  const aN = c.me.attrs;

  const surf = c.recSurf || { clay:{w:0,l:0}, hard:{w:0,l:0}, grass:{w:0,l:0} };
  const tiers = c.recTier || {};
  const ORDER = ['slam','finals','m1000','atp500','atp250','ch125','ch75','itf25','itf15','davis','olympics'];

  let h = `<div class="sec">CLASSEMENT MONDIAL</div>
    <div class="panel">
      ${curve(ranks, { log:true, invert:true, color:'var(--gold)', h:100 })}
      <div class="chart-x"><span>${first.year}</span>
        <span>meilleur #${c.me.bestRank}</span><span>${last.year}</span></div>
    </div>

    <div class="sec">NIVEAU DE JEU</div>
    <div class="panel">
      ${curve(levels, { color:'var(--hard)', ref:Career.effPot(c), min:40,
                        max:Math.max(Career.effPot(c)+2, ...levels) })}
      <div class="chart-x"><span>${Math.round(levels[0])}</span>
        <span style="color:var(--gold)">plafond ${Career.effPot(c)}</span>
        <span>${Math.round(levels[levels.length-1])}</span></div>
      <div class="p-meta">Talent brut ${c.me.pot}${(() => {
        const d = Career.effPot(c) - c.me.pot;
        return d === 0 ? ', que votre équipe ne modifie pas.'
          : d > 0 ? `, porté à <b>${Career.effPot(c)}</b> par votre encadrement (+${d}).`
                  : `, ramené à <b>${Career.effPot(c)}</b> faute d'encadrement (${d}).`;
      })()}</div>
    </div>`;

  if (a0){
    h += `<div class="sec">ATTRIBUTS — DEPUIS ${withAttrs[0].year}</div><div class="panel">`;
    h += ATTRS.map(a => {
      const v0 = Math.round(a0[a.k]), v1 = Math.round(aN[a.k]), d = v1 - v0;
      const col = d > 0 ? 'var(--good)' : d < 0 ? 'var(--bad)' : 'var(--txt3)';
      return `<div class="attrow">
        <span class="at-n">${a.icon} ${a.name}</span>
        <span class="at-bar">
          <i class="at-old" style="width:${v0}%"></i>
          <i class="at-new" style="width:${v1}%"></i></span>
        <span class="at-v">${v1}</span>
        <span class="at-d" style="color:${col}">${d>0?'+':''}${d}</span></div>`;
    }).join('') + `<div class="p-meta">Barre claire : votre niveau en ${withAttrs[0].year}. Barre pleine : aujourd'hui.</div></div>`;
  }

  h += `<div class="sec">BILAN PAR SURFACE</div><div class="panel">
    ${recRow(SURFACES.clay.name,  surf.clay,  'var(--clay)')}
    ${recRow(SURFACES.hard.name,  surf.hard,  'var(--hard)')}
    ${recRow(SURFACES.grass.name, surf.grass, 'var(--grass)')}
    <div class="p-meta">${(() => {
      const best = ['clay','hard','grass']
        .map(k => ({ k, t:surf[k].w+surf[k].l, p:(surf[k].w+surf[k].l)?surf[k].w/(surf[k].w+surf[k].l):0 }))
        .filter(x => x.t >= 10).sort((a,b) => b.p - a.p)[0];
      return best ? `Votre meilleure surface en résultats : <b>${SURFACES[best.k].name.toLowerCase()}</b>.`
                  : 'Pas encore assez de matchs pour conclure.'; })()}</div></div>`;

  const tRows = ORDER.filter(k => tiers[k]).map(k =>
    recRow(TIERS[k] ? TIERS[k].name : k, tiers[k], 'var(--txt2)')).join('');
  if (tRows) h += `<div class="sec">BILAN PAR CATÉGORIE</div><div class="panel">${tRows}</div>`;

  if (bodies.length > 1)
    h += `<div class="sec">ÉTAT DU CORPS</div><div class="panel">
      ${curve(bodies, { color:'var(--bad)', min:0, max:100, h:70 })}
      <div class="chart-x"><span>${bodies[0]}</span><span>usure cumulée</span><span>${bodies[bodies.length-1]}</span></div></div>`;

  if (reps.length > 1)
    h += `<div class="sec">NOTORIÉTÉ</div><div class="panel">
      ${curve(reps, { color:'var(--grass)', min:0, max:100, h:70 })}
      <div class="chart-x"><span>${reps[0]}</span><span>ce que le circuit sait de vous</span><span>${reps[reps.length-1]}</span></div></div>`;

  if (cash.some(v => v > 0))
    h += `<div class="sec">GAINS EN TOURNOI PAR SAISON</div><div class="panel">
      ${curve(cash, { color:'var(--gold)', min:0, h:70 })}
      <div class="chart-x"><span>${first.year}</span><span>total ${M$(c.careerPrize)}</span><span>${last.year}</span></div></div>`;

  h += `<div class="sec">${TR('SAISON PAR SAISON')}</div><div class="panel">` +
    S.slice().reverse().map(s => `<div class="draw-line">
      <span class="dl-r">${s.year}</span>
      <span>${s.w}V–${s.l}D${s.titles.length?' · '+esc(s.titles.slice(0,2).join(', ')):''}
        ${s.injWeeks?`<span class="seed">🩹 ${s.injWeeks} sem.</span>`:''}</span>
      <span class="r-v">#${s.rank}</span></div>`).join('') + `</div>`;

  body(h);
}

/* ══════════════════ ONGLET PROFIL ══════════════════ */
function tabMe(){
  const c = G.c, me = c.me;
  const bar = a => {
    const v = me.attrs[a.k];
    return `<div class="pbar"><b>${a.name}</b><div class="track">
      <div class="fill" style="width:${v}%;background:${v>=80?'var(--gold)':v>=65?'var(--hard)':'var(--txt3)'}"></div></div>
      <i>${Math.round(v)}</i></div>`;
  };
  const t = me.titles;
  const pal = [['Grands Chelems',t.slam],['Masters',t.finals],['Masters 1000',t.m1000],
               ['ATP 500',t.atp500],['ATP 250',t.atp250],['Challengers',t.ch],['ITF',t.itf]]
    .filter(x=>x[1]>0);

  const h2h = Object.values(c.h2h).sort((a,b)=>(b.w+b.l)-(a.w+a.l)).slice(0,6);

  body(`<div class="sec">ATTRIBUTS</div><div class="panel">${ATTRS.map(bar).join('')}
    <div class="p-meta">Niveau général <b>${Math.round(me._lvl)}</b> ·
      talent <b>${potStars(me.pot)}</b> (${me.pot}) ·
      plafond avec votre équipe <b>${Career.effPot(c)}</b></div></div>

    <div class="sec">SURFACES</div><div class="panel"><div class="surf-row">
      ${['clay','hard','grass'].map(k=>`<div class="surf ${k}"><b>${me.surf[k]>0?'+':''}${me.surf[k]}</b>${SURFACES[k].short}</div>`).join('')}
    </div><div class="p-meta">Une affinité positive vaut environ un point de niveau par unité sur cette surface.</div></div>

    <div class="sec">ÉTAT DU CORPS</div>${bodyHtml()}

    <div class="sec">CARRIÈRE</div><div class="panel">
      <div class="row"><span class="r-main"><span class="r-t">Bilan</span></span><span class="r-v">${me.wins}V – ${me.losses}D</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Meilleur classement</span></span><span class="r-v">#${me.bestRank||'—'}</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Points actuels</span></span><span class="r-v">${me.points}</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Gains en carrière</span>
        <span class="r-s">${M$(c.careerPrize)} en tournoi · ${M$(c.careerSponsor)} de sponsors</span></span>
        <span class="r-v">${M$(c.earned)}</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Dépenses cumulées</span></span><span class="r-v">${M$(c.spent)}</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Discipline</span></span><span class="r-v">${Math.round(c.disc)}</span></div>
      ${c.slamFinals?`<div class="row"><span class="r-main"><span class="r-t">Finales de Grand Chelem</span></span><span class="r-v">${c.slamFinals}</span></div>`:''}
      ${Object.keys(c.awards||{}).length?`<div class="row"><span class="r-main"><span class="r-t">Distinctions</span>
        <span class="r-s">${Object.keys(c.awards).map(k=>AWARDS[k].icon+' '+AWARDS[k].name+(c.awards[k]>1?' ×'+c.awards[k]:'')).join(' · ')}</span></span>
        <span class="r-v">${Object.values(c.awards).reduce((a,b)=>a+b,0)}</span></div>`:''}
    </div>

    ${pal.length?`<div class="sec">${TR('PALMARÈS')}</div><div class="panel">${pal.map(p=>
      `<div class="row"><span class="r-main"><span class="r-t">${p[0]}</span></span><span class="r-v">${p[1]}</span></div>`).join('')}
      ${me.slams.length?`<div class="p-meta">${me.slams.map(s=>s.name+' '+s.year).join(' · ')}</div>`:''}</div>`:''}

    ${c.traits.length?`<div class="sec">TRAITS</div><div class="panel"><div class="traits">
      ${c.traits.map(x=>`<span class="trait">${TRAITS[x].icon} ${TRAITS[x].name}</span>`).join('')}</div></div>`:''}

    ${h2h.length?`<div class="sec">CONFRONTATIONS</div><div class="panel">${h2h.map(x=>
      `<div class="row"><span class="r-main"><span class="r-t">${esc(x.name)}</span></span>
       <span class="r-v" style="color:${x.w>x.l?'var(--good)':x.w<x.l?'var(--bad)':'var(--txt2)'}">${x.w}–${x.l}</span></div>`).join('')}</div>`:''}

    <div class="sec">BOÎTE DE RÉCEPTION</div>${inboxHtml(14)}

    <div class="sec">RYTHME DE JEU</div>
    <div class="panel"><div class="r-s">Vous jouez actuellement en <b>carrière complète</b> :
      chaque semaine, chaque match. Le mode express déroule la saison à votre place et ne vous
      rend la main que sur les rencontres décisives. Rien n'est perdu en changeant.</div></div>
    ${modeSwitchBtn()}

    <div class="sec">PARTIE</div>
    <button class="btn btn-ghost" id="share">📣 PARTAGER MA CARRIÈRE</button>
    <button class="btn btn-ghost" id="savenow">💾 SAUVEGARDER MAINTENANT</button>
    <button class="btn btn-ghost" id="export">⬇️ EXPORTER MA CARRIÈRE (FICHIER)</button>
    <div class="panel"><div class="r-s">La sauvegarde vit dans ce navigateur, sur cet appareil.
      Elle disparaît si vous videz l'historique, changez de téléphone, ou naviguez en privé.
      Le fichier exporté est le seul moyen de l'emporter ailleurs.</div></div>
    <button class="btn btn-ghost" id="quit">↩ SAUVEGARDER ET REVENIR AU MENU</button>
    <div class="sec">FIN DE CARRIÈRE</div>
    <button class="btn btn-ghost" id="retire">RACCROCHER LA RAQUETTE</button>`);

  wireModeSwitch();

  $('share').onclick = () => shareScreen(c, () => setTab('me'));
  $('savenow').onclick = e => {
    const ok = Save.write(c);
    e.target.textContent = ok ? '✅ SAUVEGARDÉ' : '⚠️ ESPACE DISQUE INSUFFISANT';
    setTimeout(() => { e.target.textContent = '💾 SAUVEGARDER MAINTENANT'; }, 1800);
  };
  $('export').onclick = e => {
    const nom = Save.exportFile(c);
    e.target.textContent = '✅ ' + nom;
    setTimeout(() => { e.target.textContent = '⬇️ EXPORTER MA CARRIÈRE (FICHIER)'; }, 2600);
  };
  $('quit').onclick = () => { Save.write(c); home(); };

  $('retire').onclick = () => { if (confirm('Mettre un terme à votre carrière maintenant ?')) endCareer(); };
}

function potStars(p){
  if (p>=92) return '★★★★★'; if (p>=84) return '★★★★☆';
  if (p>=75) return '★★★☆☆'; if (p>=66) return '★★☆☆☆'; return '★☆☆☆☆';
}
function bodyHtml(){
  const c = G.c;
  return `<div class="body-grid">${BODY_PARTS.map(b=>{
    const v = c.body[b.k];
    const col = v>75?'var(--good)':v>45?'var(--warn)':'var(--bad)';
    return `<div class="bp"><div class="bp-t"><span>${b.icon} ${b.name}</span>
      <b style="color:${col}">${Math.round(v)}</b></div>
      <div class="bp-bar"><div style="width:${v}%;background:${col}"></div></div></div>`;
  }).join('')}</div>`;
}
function inboxHtml(n){
  const c = G.c;
  if (!c.inbox.length) return `<div class="empty">Rien de neuf.</div>`;
  return c.inbox.slice(0,n).map(m => `<div class="inbox-item ${m.kind}">
    <div class="it">${esc(m.title)}</div><div class="ib">${esc(m.body)}</div>
    <div class="iw">semaine ${m.week} · ${m.year}</div></div>`).join('');
}

/* ══════════════════ TOURNOI ══════════════════ */
function openTournament(t, status){
  const c = G.c;
  /* Un tournoi déjà terminé de la semaine en cours ne doit PAS être relancé : depuis
     que les tournois terminés sont sauvegardés, un rechargement juste après la finale
     repasserait ici et rejouerait tout, en recréditant points et dotation. On retombe
     sur l'écran de bilan, qui sait fermer la semaine proprement. */
  const dejaJoue = c.tour && c.tour.t.id === t.id && c.tour.done;
  if (!dejaJoue && (!c.tour || c.tour.t.id !== t.id)){
    if (t.tier === 'davis') Career.startDavis(c, t);
    else Career.startTournament(c, t, status);
  }
  if (c.tour && c.tour.davis) return davisScreen();
  drawScreen();
}

/* ══════════════════ COUPE DAVIS ══════════════════ */
function davisScreen(){
  const c = G.c, st = c.tour;
  const opp = Career.davisOpponent(c);

  setSurface(st.t.surf);
  let h = `<div class="mh surf-${st.t.surf}">
    <div class="mh-court">${courtSvg(st.t.surf, { h:58 })}</div>
    <div class="mh-top">COUPE DAVIS · ${st.stage === 'final' ? 'PHASE FINALE' : 'PHASE DE GROUPES'}</div>
    <div class="week-what" style="margin-top:4px">${c.me.nation.flag} ${esc(c.me.nation.name)}
      <span style="color:var(--txt3)">contre</span> ${st.tie ? st.tie.opp.nation.flag + ' ' + esc(st.tie.opp.nation.name) : ''}</div>
    <div class="week-why">Trois points à jouer : deux simples et un double. Le premier à deux l'emporte.</div></div>`;

  if (st.done){
    h += `<div class="week-hero"><div class="week-what">${st.out ? 'ÉLIMINÉS' :
      (st.stage === 'final' ? 'COUPE DAVIS REMPORTÉE' : 'QUALIFIÉS POUR LA PHASE FINALE')}</div>
      <div class="chips">${st.prize?`<span class="chip good">${M$(st.prize)}</span>`:''}</div></div>
      <button class="btn btn-primary" id="close">${TR('TERMINER LA SEMAINE')}</button>`;
  } else if (opp){
    const my = MatchEngine.effLevel(c.me, st.t.surf), his = MatchEngine.effLevel(opp, st.t.surf);
    const p = Math.max(1, Math.min(99, Math.round(100 / (1 + Math.pow(10, (his-my)/9)))));
    h += `<div class="week-hero">
      <div class="week-when">VOTRE SIMPLE</div>
      <div class="week-what">${esc(opp.name)} ${opp.nation.flag}</div>
      <div class="week-why">#${opp.rank} mondial · ${opp.age} ans · ${opp.style.name}</div>
      <div class="chips"><span class="chip ${p>=55?'good':p>=40?'warn':'bad'}">${p} % estimés</span>
        <span class="chip">Trois sets gagnants</span>
        <span class="chip">Aucun point ATP en jeu</span></div></div>
      <div class="sec">VOTRE ÉQUIPE</div><div class="panel">${
        st.mine.squad.map((pl,i) => `<div class="draw-line${pl.isHuman?' me':''}">
          <span class="dl-r">${i===0?'N°1':'N°'+(i+1)}</span>
          <span>${pl.nation.flag} ${esc(pl.name)}</span><span class="r-v">#${pl.rank}</span></div>`).join('')}</div>
      <button class="btn btn-primary" id="play">ENTRER SUR LE COURT</button>`;
  }

  if (st.ties.length){
    h += `<div class="sec">RENCONTRES DISPUTÉES</div><div class="panel">` +
      st.ties.map(t => `<div class="row"><span class="r-main">
        <span class="r-t">${t.opp.flag} ${esc(t.opp.name)}</span>
        <span class="r-s">${t.lines.map(l => l.label + ' : ' + (l.won?'gagné':'perdu')).join(' · ')}</span></span>
        <span class="r-v" style="color:${t.won?'var(--good)':'var(--bad)'}">${t.score[0]}–${t.score[1]}</span></div>`).join('') +
      `</div>`;
  }
  fullScreen(h);

  if (st.done) $('close').onclick = () => { const tid = st.t.id; c.tour = null;
    Career.clearEntry(c, c.world.week); advanceWeek(tid, []); };
  else if (opp) $('play').onclick = () => startMatch(opp, true);
}

function drawScreen(){
  const c = G.c, st = c.tour, t = st.t, tier = TIERS[t.tier];
  if (window.Stats) Stats.voir('tableau');
  const opp = Career.myOpponent(c);

  setSurface(t.surf);
  let h = `<div class="mh surf-${t.surf}">
    <div class="mh-court">${courtSvg(t.surf, { h:58 })}</div>
    <div class="mh-top">${tier.name.toUpperCase()} · ${SURFACES[t.surf].name.toUpperCase()}</div>
    <div class="week-what" style="margin-top:4px">${esc(t.name)}</div>
    <div class="week-why">${st.phase==='quali'
      ? `Qualifications — tour ${st.quali.round+1} sur ${st.quali.total}. Le tableau final se ferme au #${st.quali.cut}.`
      : `Tableau principal de ${t.draw} joueurs.`}</div></div>`;

  if (st.done){
    const res = st.out
      ? (st.phase==='quali' ? 'Éliminé en qualifications' : `Éliminé — ${Career.roundName(st, st.round-1)}`)
      : TR('VAINQUEUR DU TOURNOI');
    h += `<div class="week-hero"><div class="week-what">${res}</div>
      <div class="chips"><span class="chip good">${st.pts} points</span>
      <span class="chip good">${M$(st.prize)}</span>
      ${st.winner && st.winner.id!==c.me.id ? `<span class="chip">Titre : ${esc(st.winner.name)}</span>`:''}</div></div>
      <button class="btn btn-primary" id="close">TERMINER LA SEMAINE</button>`;
    if (st.slots.length) h += pathHtml(st) + drawHtml(st);
    fullScreen(h);
    bindDraw();
    $('close').onclick = () => { const tid = st.t.id, span = (st.t.span || 1) - 1;
      c.tour = null; Career.clearEntry(c, c.world.week); advanceWeek(tid, [], span); };
    return;
  }

  if (opp){
    const my = MatchEngine.effLevel(c.me, t.surf), his = MatchEngine.effLevel(opp, t.surf);
    const p = Math.max(1, Math.min(99, Math.round(100 / (1 + Math.pow(10, (his-my)/9)))));
    const rec = c.h2h[opp.id];
    const oppSeed = Career.seedOf(st, opp), mySeed = Career.seedOf(st, c.me);
    h += `<div class="week-hero">
      <div class="week-when">${st.phase==='quali' ? 'QUALIFICATIONS' : Career.roundName(st, st.round).toUpperCase()}${
        mySeed ? ` · VOUS ÊTES TÊTE DE SÉRIE N°${mySeed}` : ''}</div>
      <div class="week-what">${esc(opp.name)} ${opp.nation.flag}${
        oppSeed ? ` <span style="color:var(--gold);font-size:15px">TS ${oppSeed}</span>` : ''}</div>
      <div class="week-why">#${opp.rank} mondial · ${opp.age} ans · ${opp.style.name} · ${opp.hand==='G'?'gaucher':'droitier'}</div>
      <div class="chips">
        <span class="chip ${p>=55?'good':p>=40?'warn':'bad'}">${p} % de chances estimées</span>
        <span class="chip">Sa forme ${Math.round(opp.form)}</span>
        ${rec?`<span class="chip">Face à face ${rec.w}–${rec.l}</span>`:''}
        ${c.fitness<50?`<span class="chip bad">Votre fraîcheur ${Math.round(c.fitness)} %</span>`:''}
      </div></div>
      ${scoutHtml(Career.scout(c, opp, t.surf))}
      <div class="sec">VOTRE PLAN DE JEU</div><div id="tacbox"></div>
      <button class="btn btn-primary" id="play">ENTRER SUR LE COURT</button>`;
  } else if (!st.done){
    /* Tête de série exemptée : sans ce bouton, l'écran était un cul-de-sac —
       le tableau s'affichait et plus rien ne bougeait. Le moteur sait déjà
       traiter l'exemption : le mode Express passe par le même resolveRound. */
    h += `<div class="week-hero">
      <div class="week-when">${st.phase==='quali' ? 'QUALIFICATIONS' : Career.roundName(st, st.round).toUpperCase()}</div>
      <div class="week-what">${TR('Exempté de ce tour')}</div>
      <div class="week-why">Votre classement vous dispense de ce tour : vous entrerez
        directement au tour suivant, pendant que les autres se fatiguent.</div></div>
      <button class="btn btn-primary" id="bye">${TR('PASSER AU TOUR SUIVANT')}</button>`;
  }
  if (st.slots.length) h += pathHtml(st) + drawHtml(st);
  fullScreen(h);
  bindDraw();

  if (!opp && !st.done && $('bye')){
    $('bye').onclick = () => { Career.resolveRound(c, true); autosave(); drawScreen(); };
  }

  if (opp){
    const box = $('tacbox');
    const reco = Career.scout(c, opp, t.surf).tactic;
    if (!G.ui.tacticTouched) G.ui.tactic = reco;
    TACTICS.forEach(tc => {
      const b = el('button','pick-row'+((G.ui.tactic||'balanced')===tc.id?' sel':'')+(tc.id===reco?' reco':''),
        `<span class="r-main"><span class="pr-t">${tc.icon} ${tc.name}</span>
         <span class="pr-d">${tc.desc}</span></span>`);
      b.onclick = () => { G.ui.tactic = tc.id; G.ui.tacticTouched = true; drawScreen(); };
      box.appendChild(b);
    });
    $('play').onclick = () => startMatch(opp);
  }
}

/* Le parcours du joueur, resume. */
function pathHtml(st){
  const c = G.c;
  let h = `<div class="sec">${TR('VOTRE PARCOURS')}</div><div class="panel">`;
  let any = false;
  for (let r = 0; r < st.slots.length; r++){
    const cur = st.slots[r], nxt = st.slots[r+1];
    const i = cur.findIndex(p => p && p.id === c.me.id);
    if (i < 0) break;
    any = true;
    const opp = cur[i % 2 === 0 ? i + 1 : i - 1];
    const won = nxt ? nxt.some(p => p && p.id === c.me.id) : null;
    const sd = Career.seedOf(st, opp);
    h += `<div class="draw-line me"><span class="dl-r">${Career.roundName(st, r)}</span>
      <span>${opp ? opp.nation.flag + ' ' + esc(opp.name)
        + (sd ? ' <span class="seed" style="color:var(--gold)">TS ' + sd + '</span>' : '')
        + ' <span class="seed">#' + opp.rank + '</span>' : 'exempt'}</span>
      <span class="r-v ${won===true?'dl-w':won===false?'dl-l':''}">${
        won===true?'gagné':won===false?'perdu':'à jouer'}</span></div>`;
  }
  if (!any) h += `<div class="empty">Vous n'êtes pas encore dans le tableau.</div>`;
  return h + `</div>`;
}

/* Le tableau complet, tour par tour.
   « Ma partie » : le quart de tableau dans lequel le joueur est place —
   ceux qu'il peut croiser avant les demi-finales. */
function drawHtml(st){
  const c = G.c;
  if (!st.slots.length) return '';
  const draw = st.t.draw;
  const mine = st.slots[0].findIndex(p => p && p.id === c.me.id);
  const qSize = Math.max(2, draw / 4);
  const myQ = mine >= 0 ? Math.floor(mine / qSize) : -1;
  const full = G.ui.fullDraw === true;

  const rivalIn = st.slots[0].some(p => p && p.id === c.rival.id);
  const rivalNear = rivalIn && mine >= 0 &&
    Math.floor(st.slots[0].findIndex(p => p && p.id === c.rival.id) / qSize) === myQ;

  let h = (rivalIn ? `<div class="panel" style="border-left:3px solid var(--clay)">
      <div class="r-t">⚔️ ${esc(c.rival.name)} est dans le tableau${
        rivalNear ? ' — et dans votre partie de tableau' : ''}.</div></div>` : '') +
    `<div class="sec" style="display:flex;justify-content:space-between;align-items:center">
      <span>TABLEAU</span>
      <button id="drawtog" class="chip" style="cursor:pointer">${
        full ? 'Voir ma partie de tableau' : 'Voir tout le tableau'}</button>
    </div>`;

  for (let r = 0; r < st.slots.length; r++){
    const cur = st.slots[r];
    if (cur.filter(Boolean).length < 2 && r > 0) break;
    const blockPerQ = cur.length / 4;
    const lines = [];
    for (let i = 0; i < cur.length; i += 2){
      const a = cur[i], b = cur[i+1];
      if (!a && !b) continue;
      if (!full && myQ >= 0 && cur.length >= 8 && Math.floor(i / blockPerQ) !== myQ) continue;
      const nxt = st.slots[r+1];
      const winner = nxt ? nxt[i/2] : null;
      const nm = pl => {
        if (!pl) return '<span style="color:var(--txt3)">exempt</span>';
        const sd = Career.seedOf(st, pl);
        const isMe = pl.id === c.me.id;
        const w = winner && winner.id === pl.id;
        return `<span style="${isMe?'color:var(--gold);font-weight:600':w?'':'color:var(--txt3)'}">${
          sd?`<span class="seed">${sd}</span> `:''}${pl.nation.flag} ${esc(pl.name)}</span>`;
      };
      lines.push(`<div class="draw-line${(a&&a.id===c.me.id)||(b&&b.id===c.me.id)?' me':''}">
        <span class="dl-r">${winner ? '✓' : ''}</span>
        <span>${nm(a)}<br>${nm(b)}</span>
        <span class="r-v" style="font-size:11px;color:var(--txt3)">${
          a&&b ? '#'+a.rank+'<br>#'+b.rank : ''}</span></div>`);
    }
    if (!lines.length) continue;
    h += `<div class="panel"><div class="panel-h">${Career.roundName(st, r).toUpperCase()}${
      !full && cur.length >= 8 ? ' · VOTRE QUART' : ''}</div>${lines.join('')}</div>`;
  }
  return h;
}

function bindDraw(){
  const b = $('drawtog');
  if (b) b.onclick = () => { G.ui.fullDraw = !G.ui.fullDraw; drawScreen(); };
}

/* La fiche d'avant-match : tout ce que le staff a pu réunir sur l'adversaire. */
function scoutHtml(sc){
  const tac = TACTICS.find(t => t.id === sc.tactic) || TACTICS[0];
  const bars = sc.cmp.map(x => {
    const col = x.d >= 4 ? 'var(--good)' : x.d <= -4 ? 'var(--bad)' : 'var(--txt3)';
    const w1 = Math.round(x.mine), w2 = Math.round(x.his);
    return `<div class="scrow">
      <span class="sc-n">${x.icon} ${x.name}</span>
      <span class="sc-b"><i style="width:${w1}%"></i></span>
      <span class="sc-v" style="color:${col}">${w1}</span>
      <span class="sc-vs">/</span>
      <span class="sc-v" style="color:var(--txt2)">${w2}</span>
      <span class="sc-b him"><i style="width:${w2}%"></i></span></div>`;
  }).join('');

  return `<div class="sec">FICHE ADVERSAIRE</div>
    <div class="panel">
      <div class="chips" style="margin-bottom:9px">
        <span class="chip ${sc.edge>3?'good':sc.edge<-3?'bad':''}">Écart de niveau ${sc.edge>0?'+':''}${sc.edge}</span>
        <span class="chip">Sa surface ${sc.surfHim>0?'+':''}${sc.surfHim} · vous ${sc.surfMe>0?'+':''}${sc.surfMe}</span>
        ${sc.h2h?`<span class="chip">Face à face ${sc.h2h.w}–${sc.h2h.l}</span>`:''}
      </div>
      <div class="scgrid"><span class="sc-head">vous</span><span class="sc-head him">lui</span></div>
      ${bars}
      ${sc.notes.length?`<div class="scnotes">${sc.notes.map(n =>
        `<div class="scnote ${n.good===true?'good':n.good===false?'bad':''}">${esc(n.txt)}</div>`).join('')}</div>`:''}
      <div class="p-meta" style="margin-top:9px">Plan recommandé par le staff : <b style="color:var(--gold)">${tac.icon} ${tac.name}</b></div>
    </div>`;
}

/* ══════════════════ MATCH ══════════════════ */
function startMatch(opp, isDavis){
  if (window.Stats){ Stats.premierMatch(); Stats.voir('match'); }
  const c = G.c, st = c.tour, t = st.t;
  G.davisMatch = !!isDavis;
  const seed = Career.seedOf(st, opp);
  const m = MatchEngine.create(c.me, opp, {
    surface: t.surf,
    bo5: c.me.gender === 'w' ? false : (isDavis ? true : (!!TIERS[t.tier].bo5 && st.phase === 'main')),
    tournament: t.name,
    round: isDavis ? 'Simple de Coupe Davis'
         : st.phase==='quali' ? 'Qualifications'
         : Career.roundName(st, st.round) + (seed ? ` · tête de série n°${seed}` : ''),
    tacticA: G.ui.tactic || 'balanced',
    tacticB: MatchEngine.idx(opp).srv > MatchEngine.idx(opp).ret + 6 ? 'serve' : 'balanced',
    fatigueA: Math.max(0, 100 - c.fitness), fatigueB: opp.fatigue || 0,
    clutchBonus: Career.clutchAgainst(c, opp)
  });
  G.match = m;
  renderMatch();
  show('sc-match');
}

function renderMatch(){
  const m = G.match, c = G.c;
  const a = m.p[0], b = m.p[1];
  setSurface(m.surface);
  $('match-head').innerHTML = `<div class="mh surf-${m.surface}">
    <div class="mh-court">${courtSvg(m.surface, { h:64 })}</div>
    <div class="mh-top">${esc(m.round)} · ${esc(m.tournament)} · ${SURFACES[m.surface].name}</div>
    <div class="mh-vs">
      <div class="mh-p"><b>${esc(a.name)}</b><span>#${a.rank} · ${a.nation.flag}</span></div>
      <div class="mh-mid">${m.bo5?TR('3 sets gagnants'):TR('2 sets gagnants')}</div>
      <div class="mh-p"><b>${esc(b.name)}</b><span>#${b.rank} · ${b.nation.flag}</span></div>
    </div></div>`;

  const row = i => {
    const sets = m.sets.map(s => `<b>${s.g[i]}</b>`).join('');
    const pad = Array(Math.max(0, 5 - m.sets.length)).fill('<b></b>').join('');
    const cur = m.over ? '' : `<b class="cur">${m.tb ? m.tb.pts[i] : m.g[i]}</b>`;
    return `<div class="bl${!m.over && m.server===i?' serving':''}">
      <span class="nm">${esc(m.p[i].name)}</span>${sets}${cur}${pad}</div>`;
  };
  $('score-board').innerHTML = `<div class="board">${row(0)}${row(1)}
    ${m.over ? '' : `<div style="text-align:right;color:var(--gold);font-family:var(--disp);font-size:15px;margin-top:5px">
      ${MatchEngine.pointLabel(m)}</div>`}</div>`;

  const feed = $('match-feed');
  feed.innerHTML = m.feed.slice(-40).map(f => {
    if (f.t === 'head') return '';
    const cls = f.t === 'break' ? 'break' : f.t === 'set' ? 'set' : f.t === 'end' ? 'end' : '';
    const notes = (f.notable && f.notable.length) ? `<span class="note">${f.notable.join(' ')}</span>` : '';
    return `<div class="fl ${cls}"><span>${esc(f.txt)}${notes}</span><span class="fs">${f.score||''}</span></div>`;
  }).join('');
  feed.scrollTop = feed.scrollHeight;

  const ctrl = $('match-ctrl');

  /* Un point décisif : le match s'arrête et vous choisissez. */
  if (m.moment){
    const mo = m.moment;
    ctrl.innerHTML = `<div class="card moment">
      <div class="card-cat">🔥 ${esc(mo.title)}</div>
      <div class="card-txt">${esc(mo.sub)}
        <span style="display:block;color:var(--txt3);font-size:12.5px;margin-top:4px">${esc(mo.score)}</span></div>
      <div class="card-opts" id="mopts"></div></div>`;
    mo.options.forEach(o => {
      const b = el('button','opt',
        `<div class="opt-name">${o.hint?`<span class="opt-tag${
          /Sûr/i.test(o.hint)?' safe':' gold'}">${o.hint}</span>`:''}${esc(o.label)}
          <span class="chance">${o.pct} %</span></div>`);
      b.onclick = () => { MatchEngine.resolveMoment(m, o.id); renderMatch(); };
      $('mopts').appendChild(b);
    });
    return;
  }

  if (m.over){
    const won = m.winner === 0;
    ctrl.innerHTML = statsHtml(m) +
      `<button class="btn ${won?'btn-primary':'btn-ghost'}" id="next">
        ${won ? TR('VICTOIRE — CONTINUER') : TR('DÉFAITE — CONTINUER')}</button>`;
    $('next').onclick = () => {
      c.fitness = Math.max(0, c.fitness - Career.matchCost(m.minutes));
      const inj = Career.matchWear(c, m.minutes, m.surface);
      // Un match clé Express passe par expressResolveKey, qui sait aiguiller entre un
      // tableau classique et une rencontre de Coupe Davis. L'appeler ici et une seule
      // fois évite à la fois la double résolution du tour et le plantage sur une
      // finale de Coupe Davis, où st.slots n'existe pas.
      if (G.exMatch) Career.expressResolveKey(c, won);
      else if (G.davisMatch) Career.resolveDavisTie(c, won);
      else Career.resolveRound(c, won);
      G.match = null;
      autosave();
      if (inj){
        // Une blessure met fin au tournoi sur-le-champ.
        if (c.tour && !c.tour.done){ c.tour.out = true; Career.finishTournament(c); c.tour.done = true; }
        fullScreen(`<div class="card"><div class="card-cat">🩹 BLESSURE</div>
          <div class="card-txt">${esc(inj.label)} à ${esc(inj.name.toLowerCase())}.
          Indisponibilité estimée : <b>${inj.weeks} semaine${inj.weeks>1?'s':''}</b>.</div>
          <div class="card-opts"><button class="btn btn-primary" id="ok">CONTINUER</button></div></div>`);
        $('ok').onclick = () => { const tid = c.tour ? c.tour.t.id : null; c.tour = null;
          Career.clearEntry(c, c.world.week);
          // En Express on reste en Express : sans ça, une blessure sur un match clé
          // renvoyait le joueur dans l'interface hebdomadaire du mode complet, pour de bon.
          if (G.exMatch){ G.exMatch = false; return exRun(); }
          advanceWeek(tid, []); };
        return;
      }
      if (G.exMatch){
        G.exMatch = false;
        return exRun();
      }
      if (G.davisMatch){ G.davisMatch = false; return davisScreen(); }
      drawScreen();
    };
  } else {
    ctrl.innerHTML = `<div class="ctrl-row">
      <button class="btn btn-primary" id="g1">${G.exMatch ? TR('POINT SUIVANT QUI COMPTE') : TR('JEU SUIVANT')}</button>
      <button class="btn btn-ghost" id="gs">${TR('JOUER LE SET')}</button></div>
      <button class="btn btn-ghost" id="ga">${TR('SIMULER LE RESTE DU MATCH')}</button>
      <div class="chips"><span class="chip">Fatigue vous ${Math.round(m.fatigue[0])} · lui ${Math.round(m.fatigue[1])}</span>
      <span class="chip" id="tacnow">Plan : ${TACTICS.find(t=>t.id===m.tac[0]).name}</span></div>`;
    $('g1').onclick = () => {
      if (G.exMatch) MatchEngine.playAll(m);   // on file au prochain point décisif
      else MatchEngine.playGame(m);
      renderMatch();
    };
    $('gs').onclick = () => { MatchEngine.playSet(m); renderMatch(); };
    $('ga').onclick = () => { MatchEngine.playAll(m); renderMatch(); };
    $('tacnow').style.cursor = 'pointer';
    $('tacnow').onclick = () => {
      const i = TACTICS.findIndex(t => t.id === m.tac[0]);
      m.tac[0] = TACTICS[(i+1) % TACTICS.length].id;
      m.feed.push({ t:'info', txt:`Changement de tactique : ${TACTICS.find(t=>t.id===m.tac[0]).name.toLowerCase()}` });
      renderMatch();
    };
  }
}

function statsHtml(m){
  const A = m.stats[0], B = m.stats[1];
  const pct = (x,y) => y ? Math.round(x/y*100)+' %' : '—';
  const line = (k, a, b) => `<div class="stat-cmp"><span class="sc-l">${a}</span>
    <span class="sc-k">${k}</span><span class="sc-r">${b}</span></div>`;
  return `<div class="panel"><div class="panel-h">STATISTIQUES · ${m.minutes} MIN</div>
    ${line('Aces', A.aces, B.aces)}
    ${line('Doubles fautes', A.df, B.df)}
    ${line('1re balle', pct(A.srv1, A.srv1+A.srv2), pct(B.srv1, B.srv1+B.srv2))}
    ${line('Pts gagnés 1re balle', pct(A.won1, A.srv1), pct(B.won1, B.srv1))}
    ${line('Pts gagnés 2e balle', pct(A.won2, A.srv2), pct(B.won2, B.srv2))}
    ${line('Balles de break', A.bpWon+'/'+A.bpChance, B.bpWon+'/'+B.bpChance)}
    ${line('Coups gagnants', A.winners, B.winners)}
    ${line('Fautes directes', A.ue, B.ue)}
    ${line('Points gagnés', A.pts, B.pts)}
  </div>`;
}

/* ══════════════════ AVANCER D'UNE SEMAINE ══════════════════ */
function advanceWeek(playedTid, log, extraWeeks){
  const c = G.c;
  const res = Career.endWeek(c, playedTid, extraWeeks);

  const after = () => {
    autosave(true);
    if (res.newYear) return seasonScreen(res.season);
    if (c.me.age > BAL.ageMax) return endCareer();
    setTab('week');
  };

  if (res.event) return eventScreen(res.event, () => (log && log.length) ? logScreen(log, after) : after());
  if (log && log.length) return logScreen(log, after);
  after();
}

function logScreen(log, next){
  fullScreen(`<div class="card"><div class="card-cat">SEMAINE ÉCOULÉE</div>
    <div class="fx-list">${log.map(l => `<span class="fx ${l.good===false?'down':'up'}">${esc(l.txt)}</span>`).join('')}</div>
    <div class="card-opts"><button class="btn btn-primary" id="ok">CONTINUER</button></div></div>`);
  $('ok').onclick = next;
}

function eventScreen(e, next){
  const c = G.c;
  const txt = e.text.replace('{rival}', c.rival.name).replace('{nation}', c.me.nation.name)
    .replace(/\{rang\}/g, '#' + c.me.rank).replace(/\{age\}/g, c.me.age);
  let h = `<div class="card"><div class="card-cat">${e.icon} ${e.cat.toUpperCase()}</div>
    <div class="card-txt">${esc(txt)}</div><div class="card-opts" id="opts"></div></div>`;
  fullScreen(h);
  e.options.forEach(o => {
    const b = el('button','opt',
      `<div class="opt-name">${o.hint?`<span class="opt-tag${/Prudent|Sûr|Raison|Long terme|Solide|Pro|Rationnel|Classe/i.test(o.hint)?' safe':''}">${o.hint}</span>`:''}${esc(o.label)}</div>`);
    b.onclick = () => {
      c.pendingEvent = null;        // le choix est fait : l'événement n'est plus en attente
      const r = Career.resolveOption(c, o);
      fullScreen(`<div class="card"><div class="card-cat">${e.icon} ${e.cat.toUpperCase()}</div>
        <div class="card-txt">${esc(r.text)}</div>${fxHtml(r.log)}
        <div class="card-opts"><button class="btn btn-primary" id="ok">CONTINUER</button></div></div>`);
      $('ok').onclick = next;
    };
    $('opts').appendChild(b);
  });
}

function fxHtml(log){
  if (!log || !log.length) return '';
  return '<div class="fx-list">' + log.map(l => {
    if (l.unit === 'money') return `<span class="fx ${l.v>0?'up':'down'}">${l.v>0?'+':''}${M$(l.v)}</span>`;
    if (l.unit === 'trait') return `<span class="fx neutral">Nouveau trait : ${l.label}</span>`;
    if (l.unit === ' sem.') return `<span class="fx down">🩹 ${l.v} semaines d'arrêt</span>`;
    if (!l.v) return '';
    return `<span class="fx ${l.v>0?'up':'down'}">${l.v>0?'+':''}${Math.round(l.v)} ${l.label}</span>`;
  }).join('') + '</div>';
}

/* ══════════════════ BILAN DE SAISON ══════════════════ */
function seasonScreen(s){
  const c = G.c;
  const prev = c.seasons[c.seasons.length-2];
  const move = prev ? (s.rank < prev.rank ? `<span style="color:var(--good)">▲ ${prev.rank-s.rank} places</span>`
    : s.rank > prev.rank ? `<span style="color:var(--bad)">▼ ${s.rank-prev.rank} places</span>` : '— stable') : '';
  fullScreen(`<div class="week-hero">
    <div class="week-when">BILAN DE LA SAISON</div>
    <div class="week-what">${s.year}</div>
    <div class="week-why">${move}</div>
    ${s.headline?`<div class="week-why" style="font-style:italic;color:var(--gold);margin-top:6px">📰 ${esc(s.headline)}</div>`:''}
    ${(s.awards&&s.awards.length)?`<div class="chips">${s.awards.map(k=>
      `<span class="chip good">${AWARDS[k].icon} ${AWARDS[k].name}</span>`).join('')}</div>`:''}</div>
    <div class="panel">
      <div class="row"><span class="r-main"><span class="r-t">Classement final</span></span><span class="r-v">#${s.rank}</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Points</span></span><span class="r-v">${s.points}</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Bilan</span></span><span class="r-v">${s.w}V – ${s.l}D</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Titres</span>
        ${s.titles.length?`<span class="r-s">${s.titles.join(', ')}</span>`:''}</span><span class="r-v">${s.titles.length}</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Gains en tournoi</span></span><span class="r-v">${M$(s.prize)}</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Trésorerie</span></span>
        <span class="r-v" style="color:${c.money<0?'var(--bad)':'var(--good)'}">${M$(c.money)}</span></div>
    </div>
    ${s.objective?`<div class="sec">OBJECTIF DE LA SAISON</div>
      <div class="panel" style="border-left:3px solid ${s.objective.ok?'var(--good)':'var(--bad)'}">
        <div class="row"><span class="r-main"><span class="r-t">${esc(s.objective.label)}</span>
        <span class="r-s">${s.objective.ok?'Objectif atteint — prime versée':'Objectif manqué'}</span></span>
        <span class="r-v" style="color:${s.objective.ok?'var(--good)':'var(--bad)'}">${s.objective.ok?'✔':'✘'}</span></div></div>`:''}
    ${s.rivalNews?`<div class="sec">VOTRE RIVAL</div>
      <div class="panel"><div class="r-t" style="font-weight:400">${esc(s.rivalNews)}</div>
      <div class="p-meta">${esc(c.rival.name)} · #${c.rival.rank} mondial · face à face ${
        (c.h2h[c.rival.id]||{w:0}).w||0}–${(c.h2h[c.rival.id]||{l:0}).l||0}</div></div>`:''}
    <div class="sec">LE CIRCUIT</div><div class="panel">
      ${c.world.ranking.slice(0,5).map(p=>`<div class="draw-line"><span class="dl-r">#${p.rank}</span>
        <span>${p.nation.flag} ${esc(p.name)}</span><span class="r-v">${p.points}</span></div>`).join('')}</div>
    ${(() => { const pr = Career.retirementPressure(c); if (!pr) return '';
      return `<div class="sec">FIN DE CARRIÈRE ?</div>
        <div class="panel" style="border-left:3px solid var(--warn)">
          ${pr.reasons.map(r => `<div class="scnote">${esc(r)}</div>`).join('')}
          <div class="p-meta" style="margin-top:8px">Personne ne décidera à votre place.</div>
        </div>`; })()}
    <button class="btn btn-primary" id="ok">SAISON ${s.year+1}</button>
    ${Career.retirementPressure(c) ? `<button class="btn btn-ghost" id="stop">🎾 RACCROCHER LA RAQUETTE</button>` : ''}`);
  $('ok').onclick = () => (c.me.age > BAL.ageMax || c.flags.wants_retire) ? endCareer() : setTab('week');
  if ($('stop')) $('stop').onclick = () => {
    if (confirm('Mettre un terme à votre carrière maintenant ?')) endCareer();
  };
}

/* ══════════════════ FIN DE CARRIÈRE ══════════════════ */
function endCareer(){
  const c = G.c;
  c.retired = true;
  if (window.Stats) Stats.finPartie(c, c.flags && c.flags.ruine ? 'ruine' : 'terminée');
  Save.clear();
  const got = Career.checkBadges(c);
  const score = Career.careerScore(c);
  const tier = Career.tierFor(score);
  const pct = Career.percentile(score);

  const badges = Store.get('badges', []);
  c.badges.forEach(b => { if (!badges.includes(b)) badges.push(b); });
  Store.set('badges', badges);
  const pan = Store.get('pantheon', []);
  pan.unshift({ name:c.me.name, flag:c.me.nation.flag, score, tier:tier.label,
    slams:c.me.titles.slam, best:c.me.bestRank, age:c.me.age, earned:c.earned });
  pan.length = Math.min(pan.length, 40); Store.set('pantheon', pan);

  const t = c.me.titles;
  const pal = [['💎 Grands Chelems',t.slam],['🎪 Masters',t.finals],['🥈 Masters 1000',t.m1000],
    ['🥉 ATP 500',t.atp500],['🎖️ ATP 250',t.atp250],['📉 Challengers',t.ch],['🌱 ITF',t.itf]].filter(x=>x[1]>0);

  fullScreen(`<div class="final-hero">
      <div class="final-tier">${tier.label}</div>
      <div class="final-name">${esc(c.me.name)} ${c.me.nation.flag}</div>
      <div class="final-sub">${c.me.style.name} · retraite à ${c.me.age} ans</div>
      <div class="final-score">${score}</div>
      <div class="final-pct">Meilleure carrière que <b>${pct} %</b> des destins simulés</div>
    </div>
    <div class="panel">
      <div class="row"><span class="r-main"><span class="r-t">Meilleur classement</span></span><span class="r-v">#${c.me.bestRank||'—'}</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Bilan en carrière</span></span><span class="r-v">${c.me.wins}V – ${c.me.losses}D</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Saisons dans le top 10</span></span><span class="r-v">${c.top10Seasons}</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Gains en carrière</span></span><span class="r-v">${M$(c.earned)}</span></div>
      <div class="row"><span class="r-main"><span class="r-t">Semaines à la place de n°1</span></span><span class="r-v">${c.weeksNo1}</span></div>
    </div>
    ${pal.length?`<div class="sec">PALMARÈS</div><div class="panel">${pal.map(p=>
      `<div class="row"><span class="r-main"><span class="r-t">${p[0]}</span></span><span class="r-v">${p[1]}</span></div>`).join('')}</div>`:''}
    <div class="sec">SAISON PAR SAISON</div><div class="panel">${c.seasons.map(s=>
      `<div class="draw-line"><span class="dl-r">${s.age} ans</span>
       <span>${s.titles.length ? esc(s.titles.slice(0,2).join(', ')) + (s.titles.length>2?` +${s.titles.length-2}`:'') : '<span style="color:var(--txt3)">—</span>'}</span>
       <span class="r-v">#${s.rank}</span></div>`).join('')}</div>
    ${got.length?`<div class="sec">${TR('NOUVEAUX BADGES')}</div><div class="badge-grid">${got.map(id=>{
      const b = BADGES.find(x=>x.id===id);
      return `<div class="badge"><span class="bi">${b.icon}</span><div class="bn">${b.name}</div>
        <div class="bd">${b.desc}</div></div>`; }).join('')}</div>`:''}
    <button class="btn btn-primary" id="share">📣 ${TR('PARTAGER CETTE CARRIÈRE')}</button>
    <button class="btn btn-ghost" id="again">${TR('NOUVELLE CARRIÈRE')}</button>
    <button class="btn btn-ghost" id="hm">${TR('MENU PRINCIPAL')}</button>
    ${partenaireHtml()}`);
  brancherPartenaire();
  $('share').onclick = () => shareScreen(c, endCareer);
  $('again').onclick = pickNation;
  $('hm').onclick = home;
}

/* ══════════════════ PARTENAIRE ══════════════════
   Le même bloc que sur l'accueil, réutilisable sur les écrans où passent les
   joueurs engagés (bilan de saison, fin de carrière). Toujours identifié comme
   publicité, toujours avec la mention 18+ : c'est ce qui vous protège. */
function partenaireHtml(){
  const src = document.querySelector('#sc-home .pt-bloc');
  if (!src) return '';
  return '<aside class="pt-bloc pt-encart" aria-label="Notre partenaire">' + src.innerHTML + '</aside>';
}
function brancherPartenaire(){
  document.querySelectorAll('#full-body .pt-lien').forEach(a => {
    a.addEventListener('click', () => { if (window.Stats) Stats.evt('sponsor_clic', 'encart'); });
  });
  if (window.Stats) Stats.evt('sponsor_vu', 'encart');
}

/* ══════════════════ PARTAGE ══════════════════
   Rien ne part d'ici sans un clic explicite : le bloc est d'abord montré tel qu'il
   sera envoyé, et chaque destination ouvre son propre onglet où le joueur valide. */
function shareScreen(c, retour){
  const r = Share.resume(c);
  const txt = Share.bloc(c, Share.URL_JEU);

  fullScreen(`<div class="week-hero">
      <div class="week-when">PARTAGER</div>
      <div class="week-what">${esc(r.nom)}</div>
      <div class="week-why">${esc(Share.accroche(r))}</div></div>

    <div class="sec">${TR('CE QUI SERA ENVOYÉ')}</div>
    <div class="panel"><pre class="share-block" id="sh-txt">${esc(txt)}</pre></div>

    <button class="btn btn-primary" id="sh-go">📣 ${TR('PARTAGER')}</button>
    <button class="btn btn-ghost" id="sh-copy">📋 ${TR('COPIER LE TEXTE')}</button>
    <button class="btn btn-ghost" id="sh-img">🖼️ ${TR('TÉLÉCHARGER L\'IMAGE')}</button>

    <div class="sec">${TR('ENVOYER VERS')}</div>
    <div class="chips" id="sh-nets"></div>

    <div class="sec">${TR('APERÇU DE L\'IMAGE')}</div>
    <div class="panel" style="text-align:center"><div id="sh-prev"></div></div>`, retour);

  const flash = (id, msg) => {
    const b = $(id); if (!b) return;
    const old = b.textContent; b.textContent = msg;
    setTimeout(() => { if ($(id)) $(id).textContent = old; }, 1700);
  };

  $('sh-go').onclick = async () => {
    if (window.Stats) Stats.evt('partage', 'natif');
    const etat = await Share.partager(c);
    if (etat === 'copié') flash('sh-go', '✅ COPIÉ — collez où vous voulez');
    else if (etat === 'partagé') flash('sh-go', '✅ PARTAGÉ');
  };
  $('sh-copy').onclick = () => { Share.copier(txt);
    if (window.Stats) Stats.evt('partage', 'texte'); flash('sh-copy', '✅ COPIÉ'); };
  $('sh-img').onclick = () => { Share.telecharger(c); flash('sh-img', '✅ IMAGE ENREGISTRÉE'); };

  Share.RESEAUX.forEach(n => {
    const b = el('button', 'chip', `${n.icon} ${n.nom}`);
    b.style.cursor = 'pointer';
    b.onclick = () => Share.ouvrirReseau(c, n.id);
    $('sh-nets').appendChild(b);
  });

  // L'aperçu est la carte réelle, réduite : ce que le joueur voit est ce qu'il envoie.
  try {
    const cv = Share.carte(c);
    cv.style.width = '100%'; cv.style.height = 'auto';
    cv.style.borderRadius = '12px'; cv.style.display = 'block';
    $('sh-prev').appendChild(cv);
  } catch (e){
    $('sh-prev').innerHTML = `<div class="empty">Aperçu indisponible sur ce navigateur.</div>`;
  }
}

/* ══════════════════ ÉCRANS PLEINS ══════════════════ */
function fullScreen(html, back){
  // Les commandes du match survivaient à la sortie de l'écran de match et gardaient
  // leurs id dans le document. Comme sc-match précède sc-full, tout id partagé était
  // capté par le résidu et l'écran affiché se retrouvait avec des boutons morts.
  // Les deux entrées vers sc-match passent par renderMatch(), qui reconstruit tout.
  const mc = $('match-ctrl'); if (mc) mc.innerHTML = '';
  $('full-body').innerHTML = (back ? `<button class="btn-back" id="fb">← Retour</button>` : '') + html;
  show('sc-full');
  // Sans ça, on arrive au milieu d'un écran long en gardant le défilement du précédent,
  // et le bouton d'action peut se retrouver hors de vue : le jeu paraît bloqué.
  window.scrollTo(0, 0);
  const sc = $('sc-full'); if (sc) sc.scrollTop = 0;
  if (back) $('fb').onclick = back;
}
function badgesHtml(){
  const owned = Store.get('badges', []);
  return `<h2 class="pick-title">BADGES · ${owned.length}/${BADGES.length}</h2>` +
    BADGE_CATS.map(cat => {
      const list = BADGES.filter(b => b.cat === cat.id);
      if (!list.length) return '';
      return `<div class="sec">${cat.icon} ${cat.name.toUpperCase()}</div><div class="badge-grid">` +
        list.map(b => { const has = owned.includes(b.id);
          return `<div class="badge${has?'':' locked'}"><span class="bi">${has?b.icon:'🔒'}</span>
            <div class="bn">${has?b.name:'???'}</div><div class="bd">${b.desc}</div></div>`; }).join('') + `</div>`;
    }).join('');
}
function pantheonHtml(){
  const list = Store.get('pantheon', []);
  return `<h2 class="pick-title">PANTHÉON</h2>` + (list.length
    ? list.map(p => `<div class="panel"><div class="row">
        <span class="r-main"><span class="r-t">${p.flag} ${esc(p.name)}</span>
        <span class="r-s">${p.tier}</span></span><span class="r-v">${p.score}</span></div>
        <div class="p-meta">${p.slams} Grand${p.slams>1?'s':''} Chelem${p.slams>1?'s':''} ·
          meilleur classement #${p.best||'—'} · ${M$(p.earned||0)} · retraite à ${p.age} ans</div></div>`).join('')
    : `<div class="empty">Aucune carrière terminée pour l'instant.</div>`);
}

home();
