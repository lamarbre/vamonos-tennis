/* ══════════════════════════════════════════════════════════════════════════
   VAMONOS TENNIS — Le circuit
   Un monde persistant : ~620 joueurs qui vieillissent, progressent, se
   blessent et prennent leur retraite. Classement sur 46 semaines glissantes.
   ══════════════════════════════════════════════════════════════════════════ */

const World = (() => {

const clamp = (v,a,b) => v<a?a:v>b?b:v;
const R = () => (typeof Alea !== 'undefined' ? Alea.R() : Math.random());
const ri = (a,b) => Math.floor(a + R()*(b-a+1));
const rand = (a,b) => a + R()*(b-a);
const pick = a => a[Math.floor(R()*a.length)];
const W = BAL.weeksPerYear;

/* ───────────── Niveau général ───────────── */
function levelOf(p){
  const w = p.style.w, a = p.attrs;
  let v = 0;
  for (const k in w) v += a[k] * w[k];
  return v;
}
function refreshLevel(p){ p._lvl = levelOf(p); return p._lvl; }

/* ───────────── Génération d'un joueur ───────────── */
const usedNames = new Set();

function makeName(nat, gender){
  const pool = NAME_POOLS[nat.id] || NAME_POOLS.fr;
  const first = () => (gender === 'w' ? pick(pool.m) : pick(pool.f));

  // 1. prenom + nom
  for (let i = 0; i < 25; i++){
    const n = first() + ' ' + pick(pool.l);
    if (!usedNames.has(n)){ usedNames.add(n); return n; }
  }
  // 2. prenom + initiale + nom : ca reste parfaitement credible
  for (let i = 0; i < 40; i++){
    const n = first() + ' ' + first().charAt(0) + '. ' + pick(pool.l);
    if (!usedNames.has(n)){ usedNames.add(n); return n; }
  }
  // 3. nom compose, comme il en existe partout
  for (let i = 0; i < 60; i++){
    const a = pick(pool.l), b = pick(pool.l);
    if (a === b) continue;
    const n = first() + ' ' + a + '-' + b;
    if (!usedNames.has(n)){ usedNames.add(n); return n; }
  }
  return first() + ' ' + pick(pool.l) + '-' + pick(pool.l);
}

function rollPot(){
  if (R() < BAL.prodigyChance) return ri(BAL.prodigyPot[0], BAL.prodigyPot[1]);
  return Math.round(BAL.potMin + BAL.potSpread * Math.pow(R(), BAL.potCurve));
}

function makePlayer(o){
  o = o || {};
  const nat = o.nation || pick(NATIONS);
  const style = o.style || pick(STYLES);
  const gender = o.gender || 'm';
  const pot = o.pot != null ? o.pot : clamp(rollPot() + (style.potBonus||0), 50, 99);
  const age = o.age != null ? o.age : ri(16, 32);

  const surf = { clay:0, hard:0, grass:0 };
  [nat.surf, style.surf, o.originSurf].forEach(src => {
    if (!src) return; for (const k in src) surf[k] += src[k];
  });
  ['clay','hard','grass'].forEach(k => { surf[k] += ri(-2, 2); });

  const p = {
    id: o.id || ('p' + (++makePlayer.n)),
    name: o.name || makeName(nat, gender),
    nation: nat, gender, style, age,
    hand: R() < 0.14 ? 'G' : 'D',
    pot, peak: ri(24, 29),
    traj: pick(['normal','normal','early','late','steady','chaotic','flash','surge']),
    attrs: o.attrs || spreadAttrs(style, startLevelFor(age, pot)),
    surf,
    form: ri(50, 72), fatigue: 0,
    pts52: new Array(W).fill(0),
    tid52: new Array(W).fill(null),
    points: 0, rank: 9999, prevRank: null, bestRank: null,
    titles: { slam:0, finals:0, m1000:0, atp500:0, atp250:0, ch:0, itf:0 },
    slams: [], finalsPlayed: 0,
    wins: 0, losses: 0,
    injuredUntil: -1, injury: null,
    retired: false, isHuman: !!o.isHuman
  };
  refreshLevel(p);
  return p;
}
makePlayer.n = 0;

/* Niveau de départ crédible pour un joueur de cet âge et de ce potentiel. */
function startLevelFor(age, pot){
  const prog = clamp((age - 15) / 10, 0, 1);
  const curve = Math.pow(prog, 0.72);
  return clamp(46 + (pot - 46) * curve + (R()*3 - 1.5), 38, pot);
}

/* Répartit un niveau cible sur les 8 attributs selon le style. */
function spreadAttrs(style, target){
  const a = {};
  ATTR_KEYS.forEach(k => { a[k] = target + (R()*13 - 6.5); });
  // Ajustement pour que le niveau pondéré tombe sur la cible.
  let cur = 0; for (const k in style.w) cur += a[k] * style.w[k];
  const d = target - cur;
  ATTR_KEYS.forEach(k => { a[k] = clamp(Math.round(a[k] + d), 20, 99); });
  return a;
}

/* ───────────── Calendrier ───────────── */
function slug(str){
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function buildCalendar(){
  const cal = [];
  MAJORS.forEach(t => cal.push({
    id: slug(t.name) + '_' + t.week,
    name: t.name, week: t.week, surf: t.surf, tier: t.tier,
    span: t.span || 1, davisStage: t.davisStage || null,
    draw: TIERS[t.tier].draw, rounds: Math.round(Math.log2(TIERS[t.tier].draw)),
    major: true, history: {}
  }));

  // Circuit secondaire : il tourne toutes les semaines, y compris pendant
  // les Grands Chelems — c'est la realite de ceux qui n'y sont pas.
  const used = new Set(cal.map(t => t.name));
  for (let w = 1; w <= W; w++){
    const surfSeason = w <= 13 ? 'hard' : w <= 23 ? 'clay' : w <= 28 ? 'grass' : 'hard';
    const plan = [['ch125',2],['ch75',3],['itf25',5],['itf15',9]];
    plan.forEach(([tier, n]) => {
      for (let i = 0; i < n; i++){
        let surf = R() < 0.72 ? surfSeason : pick(['clay','hard']);
        if (surf === 'grass' && R() < 0.55) surf = 'hard';
        const base = pick(CITY_POOL[surf]);
        const ROMAN = ['','','II','III','IV','V','VI','VII','VIII','IX','X'];
        let name = base, dup = 2;
        while (used.has(name) && dup < 11) name = base + ' ' + ROMAN[dup++];
        used.add(name);
        cal.push({ id:`${tier}_${w}_${i}`, name, week:w, surf, tier, span:1,
                   draw:TIERS[tier].draw, rounds:Math.round(Math.log2(TIERS[tier].draw)),
                   major:false, history:{} });
      }
    });
  }
  return cal;
}

/* Les Jeux n'existent qu'une annee sur quatre : on les ajoute et on les
   retire du calendrier au changement de saison. */
function refreshOlympics(w){
  w.calendar = w.calendar.filter(t => t.tier !== 'olympics');
  if (!isOlympicYear(w.year)) return;
  const host = olympicHost(w.year), surf = olympicSurface(w.year);
  w.calendar.push({
    id: 'olympics_' + w.year, name: 'Jeux Olympiques — ' + host,
    week: OLYMPIC_WEEK, surf, tier: 'olympics', span: 2,
    draw: TIERS.olympics.draw, rounds: Math.round(Math.log2(TIERS.olympics.draw)),
    major: true, olympic: true, host, history: {}
  });
}

/* ───────────── Éligibilité et inscriptions ───────────── */
function minRankFor(tier){
  switch (tier){
    case 'itf15':  return 430;
    case 'itf25':  return 240;
    case 'ch75':   return 105;
    case 'ch125':  return 55;
    case 'atp250': return 6;
    default:       return 0;
  }
}

/* Le « cut » : jusqu'a quel classement le tableau se remplit-il ?
   Les tournois d'une semaine puisent dans le meme vivier, du plus prestigieux
   au plus modeste : on additionne donc les places deja prises au-dessus. */
function estimateCut(w, t){
  const list = weekTournaments(w, w.week);
  const prio = TIERS[t.tier].prio;
  let taken = 0;
  list.forEach(o => {
    const op = TIERS[o.tier].prio;
    if (op > prio) taken += o.draw;
  });
  const same = list.filter(o => TIERS[o.tier].prio === prio);
  const idx = Math.max(0, same.indexOf(t));
  const cut = Math.round((taken + (idx + 1) * t.draw) * 1.3);
  return Math.max(t.draw, Math.min(w.ranking.length, cut));
}

/* Statut d'inscription du joueur humain : direct, qualifications, ou hors de portée. */
function entryStatus(w, t, p){
  const tier = TIERS[t.tier];
  const rank = p.rank;
  if (t.tier === 'finals') return rank <= 8 ? 'direct' : 'no';
  // On ne peut pas s'inscrire tres au-dessous de son niveau : les tournois
  // du circuit secondaire refusent les joueurs trop bien classes.
  if (tier.band && rank < tier.band[0] * 0.4) return 'no';
  if (rank > tier.entry * 2.4) return 'no';
  // C'est le cut reel du tableau qui decide, pas seulement la categorie.
  return rank <= estimateCut(w, t) ? 'direct' : 'quali';
}

function fillDraw(w, t, busy){
  const abs = w.absWeek, tier = TIERS[t.tier];
  const band = tier.band || [1, 2000];
  const hi = band[1] * 1.25;
  const noise = (band[1] - band[0]) * 0.42;

  const cand = [];
  for (const p of w.players){
    if (p.retired || busy.has(p.id) || p.injuredUntil > abs) continue;
    if (p.rank > hi) continue;
    // Même règle que pour le joueur humain : le circuit secondaire refuse les
    // têtes d'affiche. Sans ce mur, une n°3 mondiale pouvait, une fois sur
    // deux cents, apparaître dans un tableau de 125.
    if (tier.band && p.rank < tier.band[0] * 0.4) continue;
    // Personne ne joue 46 semaines par an : la fatigue impose des impasses.
    // Sauf pour un Grand Chelem ou les Jeux : la, on vient blesse s il le faut.
    const unmissable = t.tier === 'slam' || t.tier === 'olympics' || t.tier === 'finals';
    if (!unmissable && p.fatigue > 52 && R() < 0.72) continue;
    // Et on ne redescend pas volontiers d'une categorie.
    if (p.rank < band[0]){
      const gap = (band[0] - p.rank) / Math.max(1, band[0]);
      if (R() < Math.min(0.995, gap * 1.4)) continue;
    }
    cand.push(p);
  }
  // On prefere les mieux classes, mais un tableau reel melange les niveaux.
  cand.sort((a, b) => (a.rank + R()*noise) - (b.rank + R()*noise));

  let field;
  if (t.tier === 'olympics'){
    // Quota olympique : quatre joueurs par nation, pas un de plus.
    const perNation = {}; field = [];
    for (const p of cand){
      const k = p.nation.id;
      if ((perNation[k] || 0) >= 4) continue;
      perNation[k] = (perNation[k] || 0) + 1;
      field.push(p);
      if (field.length >= t.draw) break;
    }
  } else {
    field = cand.slice(0, t.draw);
  }
  field.forEach(p => busy.add(p.id));
  return field;
}

/* Planifie toute la semaine d'un coup, dans l'ordre de prestige.
   Indispensable : sinon le tournoi du joueur piocherait dans le circuit
   entier et il affronterait systematiquement les meilleurs disponibles. */
function planWeek(w, humanTid){
  const busy = new Set();
  const human = w.players.find(p => p.isHuman);
  if (human) busy.add(human.id);

  // La Coupe Davis se joue par nations : elle n'occupe pas le vivier normal.
  const list = weekTournaments(w, w.week)
    .filter(t => t.tier !== 'davis')
    .slice().sort((a, b) => TIERS[b.tier].prio - TIERS[a.tier].prio);

  const fields = new Map();
  list.forEach(t => { fields.set(t.id, fillDraw(w, t, busy)); });
  return { list, fields, busy, humanTid: humanTid || null };
}

/* ───────────── Tableau à têtes de série ───────────── */
function bracketOrder(n){
  let a = [1];
  while (a.length < n){
    const m = a.length * 2 + 1, b = [];
    a.forEach(x => { b.push(x); b.push(m - x); });
    a = b;
  }
  return a;
}

/* Nombre de tetes de serie selon la taille du tableau : un quart, comme
   partout sur le circuit. */
function seedCount(size){
  if (size >= 128) return 32;
  if (size >= 64)  return 16;
  if (size >= 32)  return 8;
  return Math.max(2, Math.floor(size / 4));
}

/* Table identifiant -> numero de tete de serie (les non-classes n'y sont pas). */
function seedMap(field, size){
  const sorted = field.slice().sort((a, b) => a.rank - b.rank);
  const n = Math.min(seedCount(size), sorted.length);
  const m = {};
  for (let i = 0; i < n; i++) m[sorted[i].id] = i + 1;
  return m;
}

function seedDraw(field, size){
  const sorted = field.slice().sort((a,b) => a.rank - b.rank);
  const order = bracketOrder(size);
  const slots = new Array(size).fill(null);
  order.forEach((seed, slot) => { slots[slot] = sorted[seed - 1] || null; });
  return slots;                                   // les null sont des exempts
}

/* ───────────── Simulation d'un tournoi entre PNJ ───────────── */
function simTournament(w, t, field){
  const tier = TIERS[t.tier];
  let slots = seedDraw(field, t.draw);
  const roundsWon = new Map();
  field.forEach(p => roundsWon.set(p.id, 0));

  for (let r = 0; r < t.rounds; r++){
    const next = [];
    for (let i = 0; i < slots.length; i += 2){
      const a = slots[i], b = slots[i+1];
      if (!a && !b){ next.push(null); continue; }
      if (!a || !b){ const s = a || b; roundsWon.set(s.id, r + 1); next.push(s); continue; }
      const aw = MatchEngine.quickWin(a, b, t.surf);
      const win = aw ? a : b, lose = aw ? b : a;
      roundsWon.set(win.id, r + 1);
      win.wins++; lose.losses++;
      win.fatigue = clamp(win.fatigue + 2.4, 0, 100);
      next.push(win);
    }
    slots = next;
  }
  const champ = slots[0];
  award(w, t, roundsWon, field, champ);
  return champ;
}

function award(w, t, roundsWon, field, champ){
  const tier = TIERS[t.tier];
  field.forEach(p => {
    const r = roundsWon.get(p.id) || 0;
    const pts = tier.pts[Math.min(r, tier.pts.length - 1)] || 0;
    addPoints(w, p, t, pts);
    if (r === t.rounds) recordTitle(p, t, w.year);
  });
  if (champ) t.history[w.year] = champ.name;
}

function recordTitle(p, t, year){
  const map = { slam:'slam', finals:'finals', m1000:'m1000', atp500:'atp500',
                atp250:'atp250', ch125:'ch', ch75:'ch', itf25:'itf', itf15:'itf' };
  // Les Jeux et la Coupe Davis ne comptent pas au palmarès ATP : sans ce garde-fou,
  // une médaille d'or écrivait titles[undefined] = NaN.
  const k = map[t.tier];
  if (k) p.titles[k]++;
  if (t.tier === 'slam') p.slams.push({ name:t.name, surf:t.surf, year:year||0, age:p.age });
}

/* Les points remplacent ceux de la même semaine l'an dernier : c'est la
   défense de points, et c'est ce qui rend un classement vivant. */
function addPoints(w, p, t, pts){
  const i = w.week - 1;
  p.pts52[i] = pts; p.tid52[i] = t.id;      // remplace ceux de la meme semaine l'an dernier
}

function clearWeek(w, p){ p.pts52[w.week - 1] = 0; p.tid52[w.week - 1] = null; }

/* ───────────── Classement ───────────── */
function updateRankings(w){
  const live = w.players.filter(p => !p.retired);
  live.forEach(p => {
    let s = 0; for (let i = 0; i < W; i++) s += p.pts52[i];
    p.points = Math.round(s);
  });
  live.sort((a,b) => b.points - a.points || a.id.localeCompare(b.id));
  live.forEach((p, i) => {
    p.prevRank = p.rank;
    p.rank = i + 1;
    if (!p.bestRank || p.rank < p.bestRank) p.bestRank = p.rank;
  });
  w.ranking = live;
}

/* ───────────── Progression annuelle des PNJ ───────────── */
function trajFactor(id, age){
  switch (id){
    case 'early':   return age <= 21 ? 1.7 : age <= 25 ? .7 : .3;
    case 'late':    return age <= 21 ? .55 : age <= 26 ? 1.25 : 1.35;
    case 'steady':  return .9;
    case 'chaotic': return .35 + R()*1.5;
    case 'flash':   return age <= 20 ? 1.9 : age <= 24 ? .5 : .15;
    case 'surge':   return age <= 22 ? .5 : age <= 27 ? 1.8 : .8;
    default:        return 1;
  }
}
function ageFactor(age, peak){
  const d = age - peak;
  if (d <= -8) return 1.45;
  if (d <= -6) return 1.25;
  if (d <= -4) return 1.00;
  if (d <= -2) return 0.68;
  if (d <=  0) return 0.34;
  if (d <=  2) return 0.05;
  return 0;
}

function growAI(p){
  const lvl = refreshLevel(p);
  const room = clamp((p.pot - lvl) / 15, -0.6, 1.7);
  let base = 3.4 * trajFactor(p.traj, p.age) * ageFactor(p.age, p.peak) * room;
  const decline = p.age > p.peak ? Math.min(3.0, (p.age - p.peak) * 0.42) : 0;
  ATTR_KEYS.forEach(k => {
    const room = clamp((p.pot + 9 - p.attrs[k]) / 9, -0.15, 1);
    let g = base * room * (0.5 + (p.style.w[k] || 0.1) * 3) * (0.7 + R()*0.6);
    if (k === 'spd')      g -= decline * 1.10;
    else if (k === 'sta') g -= decline * 1.00;
    else if (k === 'men') g += decline * 0.30;
    else if (k === 'srv') g -= decline * 0.25;
    else if (k === 'ret') g -= decline * 0.50;
    else if (k === 'vol') g -= decline * 0.30;
    else g -= decline * 0.70;
    p.attrs[k] = clamp(p.attrs[k] + g, 35, 99);
  });
  refreshLevel(p);
}

/* Une ligne d'adieu, correcte grammaticalement et proportionnée au palmarès. */
function retirementLine(p){
  const t = p.titles;
  const atp = t.m1000 + t.atp500 + t.atp250 + t.finals;
  let pal;
  if (t.slam >= 2)      pal = `${t.slam} titres du Grand Chelem`;
  else if (t.slam === 1)pal = `un titre du Grand Chelem`;
  else if (atp >= 2)    pal = `${atp} titres sur le circuit principal`;
  else if (atp === 1)   pal = `un titre sur le circuit principal`;
  else if (t.ch + t.itf >= 1) pal = `une carrière passée dans l'ombre du circuit secondaire`;
  else                  pal = `une carrière sans trophée`;
  const verbe = t.slam >= 3 ? 'met un terme à une immense carrière'
              : t.slam >= 1 ? 'raccroche' : 'prend sa retraite';
  return `${p.name} (${p.nation.name}) ${verbe} à ${p.age} ans : ${pal}.`;
}

function yearTick(w){
  w.players.forEach(p => {
    if (p.retired || p.isHuman) return;
    p.age++;
    growAI(p);
    p.form = clamp(p.form + (R()*20 - 10), 40, 85);
    const bad = p.rank > 420 && p.age > 27;
    const old = p.age > 33 && (p.rank > 90 || R() < 0.28);
    if (p.age > 38 || bad || old){
      p.retired = true;
      // Une carrière qui se termine, ça se raconte.
      if (p.rank <= 150) pushNews(w, retirementLine(p), p.titles.slam ? 'big' : 'info');
    }
  });
  // Nouvelle génération
  for (let i = 0; i < BAL.juniorsPerYear; i++){
    w.players.push(makePlayer({ age:16, gender:w.gender }));
  }
  // On borne la population
  w.players = w.players.filter(p => !p.retired || p.isHuman)
                       .concat(w.players.filter(p => p.retired && !p.isHuman).slice(0, 0));
  if (w.players.length > BAL.poolSize * 1.25){
    const live = w.players.filter(p => !p.retired);
    live.sort((a,b) => a.rank - b.rank);
    const keep = new Set(live.slice(0, BAL.poolSize).map(p => p.id));
    w.players = w.players.filter(p => p.isHuman || keep.has(p.id));
  }
}

/* ───────────── Création du monde ───────────── */
function create(opt){
  usedNames.clear(); makePlayer.n = 0;
  const w = {
    year: BAL.startYear, week: 1, absWeek: 0,
    gender: opt.gender || 'm',
    players: [], calendar: buildCalendar(), ranking: [],
    news: []
  };
  for (let i = 0; i < BAL.poolSize; i++) w.players.push(makePlayer({ gender:w.gender }));

  /* Amorçage grossier, uniquement pour que les premiers tableaux aient du sens. */
  w.players.forEach(p => {
    const lvl = refreshLevel(p);
    const total = Math.pow(Math.max(0, lvl - 52), 2.2) * 1.2;
    for (let i = 0; i < W; i++) p.pts52[i] = Math.max(0, Math.round(total / W * (0.3 + R()*1.5)));
  });
  updateRankings(w);

  /* Puis une saison entiere jouee a blanc : le classement devient le resultat
     reel de ce qui s'est passe sur le circuit, pas d'une formule. */
  for (let y = 0; y < 1; y++){
    for (let k = 0; k < W; k++){ runWeek(w); advance(w); }
  }
  w.year = BAL.startYear; w.week = 1; w.absWeek = 0;
  refreshOlympics(w);
  updateRankings(w);
  return w;
}

function joinPlayer(w, p){
  w.players.push(p);
  p.pts52 = new Array(W).fill(0);
  p.tid52 = new Array(W).fill(null);
  updateRankings(w);
}

/* ───────────── Une semaine de circuit ───────────── */
function weekTournaments(w, week){
  return w.calendar.filter(t => t.week === week);
}

/* Simule tous les tournois de la semaine, sauf celui du joueur humain. */
function runWeek(w, plan, humanPlayed){
  if (!plan || !plan.fields) plan = planWeek(w, null);
  const results = [];

  plan.list.forEach(t => {
    if (t.id === plan.humanTid){ results.push({ t, skipped:true }); return; }
    const field = plan.fields.get(t.id) || [];
    if (field.length < 4) return;
    const champ = simTournament(w, t, field);
    results.push({ t, champ });
  });

  // La Coupe Davis se joue par nations : elle n'est pas dans le plan hebdomadaire.
  weekTournaments(w, w.week).forEach(t => {
    if (t.tier !== 'davis' || t.id === plan.humanTid) return;
    const champ = simDavis(w, t);
    if (champ) results.push({ t, champ:{ name: champ.name } });
  });

  // Ceux qui n'ont joue nulle part perdent les points de cette semaine l'an dernier.
  w.players.forEach(p => {
    if (p.retired) return;
    if (p.isHuman){ if (!humanPlayed) clearWeek(w, p); return; }
    if (!plan.busy.has(p.id)) clearWeek(w, p);
  });

  // Recuperation et forme
  w.players.forEach(p => {
    if (p.retired) return;
    if (!plan.busy.has(p.id)) p.fatigue = clamp(p.fatigue - 9, 0, 100);
    p.form = clamp(p.form + (R()*7 - 3.5), 35, 92);
  });

  const prevNo1 = w.ranking[0];
  updateRankings(w);
  weekNews(w, results, prevNo1);
  return results;
}

/* Coupe Davis entre nations : les huit meilleures equipes, un tableau a
   elimination directe decide par la force cumulee des quatre premiers. */
function nationRanking(w){
  const by = {};
  w.ranking.forEach(p => {
    if (p.retired) return;
    const k = p.nation.id;
    if (!by[k]) by[k] = [];
    if (by[k].length < 4) by[k].push(p);
  });
  return Object.keys(by).map(id => ({
    nation: NATIONS.find(n => n.id === id),
    squad: by[id],
    strength: by[id].reduce((s, p) => s + (p._lvl || 55), 0)
  })).sort((a, b) => b.strength - a.strength);
}

function simDavis(w, t){
  const nats = nationRanking(w).slice(0, 8);
  if (nats.length < 2) return null;
  if (t.davisStage === 'group'){
    // La phase de groupes ne designe pas encore de vainqueur.
    w.davisSemis = [];
    for (let i = 0; i < nats.length; i += 2){
      const a = nats[i], b = nats[i+1];
      if (!b){ w.davisSemis.push(a); continue; }
      w.davisSemis.push((a.strength + rand(-14, 14)) >= (b.strength + rand(-14, 14)) ? a : b);
    }
    return null;
  }
  let alive = (w.davisSemis && w.davisSemis.length) ? w.davisSemis.slice() : nats.slice(0, 4);
  while (alive.length > 1){
    const next = [];
    for (let i = 0; i < alive.length; i += 2){
      const a = alive[i], b = alive[i+1];
      if (!b){ next.push(a); continue; }
      next.push((a.strength + rand(-16, 16)) >= (b.strength + rand(-16, 16)) ? a : b);
    }
    alive = next;
  }
  const champ = alive[0];
  if (champ) t.history[w.year] = champ.nation.name;
  w.davisSemis = null;
  return champ ? { name: champ.nation.name } : null;
}

/* ───────────── Le fil du circuit ─────────────
   Le monde vit : autant qu'on le voie. */
function pushNews(w, txt, kind){
  if (!w.feed) w.feed = [];
  w.feed.unshift({ week:w.week, year:w.year, txt, kind: kind || 'info' });
  if (w.feed.length > 70) w.feed.length = 70;
}

function weekNews(w, results, prevNo1){
  results.forEach(r => {
    if (!r.t || !r.champ || !r.t.major) return;
    const tier = TIERS[r.t.tier];
    const nm = r.champ.name || r.champ;
    if (r.t.tier === 'davis') pushNews(w, `${nm} remporte la Coupe Davis.`, 'big');
    else if (tier.prio >= 8) pushNews(w, `${nm} remporte ${r.t.name} (${tier.name}).`, 'big');
    else if (tier.prio >= 5) pushNews(w, `${nm} s'impose à ${r.t.name}.`, 'info');
  });

  const no1 = w.ranking[0];
  if (no1 && prevNo1 && no1.id !== prevNo1.id)
    pushNews(w, `${no1.name} (${no1.nation.name}) devient numéro un mondial.`, 'big');

  // Une percée : un jeune qui entre dans le top 100 cette semaine.
  const jump = w.ranking.slice(0, 100).find(p =>
    !p.isHuman && p.age <= 21 && p.prevRank > 100 && p.rank <= 100);
  if (jump) pushNews(w, `${jump.name}, ${jump.age} ans, entre dans le top 100.`, 'good');

  // Une retraite marquante, en fin de saison.
  if (w.week === W && typeof WORLD_NEWS !== 'undefined' && R() < 0.5)
    pushNews(w, pick(WORLD_NEWS), 'info');
}

function advance(w){
  w.week++; w.absWeek++;
  if (w.week > W){ w.week = 1; w.year++; yearTick(w); refreshOlympics(w); updateRankings(w); return true; }
  return false;
}

/* ───────────── Utilitaires ───────────── */
function topN(w, n){ return w.ranking.slice(0, n); }
function findRank(w, rank){ return w.ranking[rank - 1]; }
function raceLeader(w){ return w.ranking[0]; }

return { create, makePlayer, joinPlayer, levelOf, refreshLevel, updateRankings,
         weekTournaments, planWeek, runWeek, advance, refreshOlympics,
         seedMap, seedCount, slug, simDavis, nationRanking, pushNews, seedDraw, bracketOrder, fillDraw,
         simTournament, award, addPoints, clearWeek, recordTitle,
         entryStatus, estimateCut, topN, findRank, raceLeader, W, spreadAttrs };
})();

/* Raccourci global utilisé par le moteur de match. */
function levelOf(p){ return World.levelOf(p); }
