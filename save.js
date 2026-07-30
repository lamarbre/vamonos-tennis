/* ══════════════════════════════════════════════════════════════════════════
   VAMONOS TENNIS — Sauvegarde
   Le monde contient 1 150 joueurs qui se référencent entre eux (classement,
   tableaux, face-à-face). On sérialise donc par identifiants, et on
   reconstruit les références au chargement.
   ══════════════════════════════════════════════════════════════════════════ */

const Save = (() => {

const KEY = 'matchpoint_save_v1';
const VERSION = 1;

/* ───────────── Compactage ─────────────
   pts52 est un tableau de 46 cases presque toujours vides : on ne garde
   que les semaines qui rapportent quelque chose. */
function packPts(arr){
  const out = [];
  for (let i = 0; i < arr.length; i++) if (arr[i]) out.push(i, arr[i]);
  return out;
}
function unpackPts(flat, n){
  const a = new Array(n).fill(0);
  for (let i = 0; i < flat.length; i += 2) a[flat[i]] = flat[i+1];
  return a;
}

/* ───────────── Joueurs ───────────── */
function packPlayer(p){
  const o = {
    i: p.id, n: p.name, na: p.nation.id, st: p.style.id, g: p.gender,
    a: p.age, h: p.hand, po: p.pot, pk: p.peak, tj: p.traj,
    at: ATTR_KEYS.map(k => Math.round(p.attrs[k] * 100) / 100),
    sf: [p.surf.clay, p.surf.hard, p.surf.grass],
    fo: Math.round(p.form), fa: Math.round(p.fatigue),
    p5: packPts(p.pts52),
    pt: p.points, r: p.rank, br: p.bestRank,
    ti: [p.titles.slam, p.titles.finals, p.titles.m1000, p.titles.atp500,
         p.titles.atp250, p.titles.ch, p.titles.itf],
    w: p.wins, l: p.losses, iu: p.injuredUntil, re: p.retired ? 1 : 0
  };
  if (p.isHuman) o.hu = 1;
  if (p.isRival) o.rv = 1;
  if (p.slams && p.slams.length) o.sl = p.slams.map(s => [s.name, s.year || 0, s.surf || 'hard', s.age || 0]);
  if (p.injury) o.ij = p.injury;
  return o;
}

function unpackPlayer(o, W){
  const attrs = {};
  ATTR_KEYS.forEach((k, i) => attrs[k] = o.at[i]);
  const p = {
    id: o.i, name: o.n,
    nation: NATIONS.find(n => n.id === o.na) || NATIONS[0],
    style: STYLES.find(s => s.id === o.st) || STYLES[3],
    gender: o.g, age: o.a, hand: o.h, pot: o.po, peak: o.pk, traj: o.tj,
    attrs,
    surf: { clay:o.sf[0], hard:o.sf[1], grass:o.sf[2] },
    form: o.fo, fatigue: o.fa,
    pts52: unpackPts(o.p5, W),
    tid52: new Array(W).fill(null),
    points: o.pt, rank: o.r, prevRank: null, bestRank: o.br,
    titles: { slam:o.ti[0], finals:o.ti[1], m1000:o.ti[2], atp500:o.ti[3],
              atp250:o.ti[4], ch:o.ti[5], itf:o.ti[6] },
    slams: (o.sl || []).map(s => ({ name:s[0], year:s[1], surf:s[2], age:s[3] })),
    finalsPlayed: 0,
    wins: o.w, losses: o.l,
    injuredUntil: o.iu, injury: o.ij || null,
    retired: !!o.re, isHuman: !!o.hu, isRival: !!o.rv
  };
  World.refreshLevel(p);
  return p;
}

/* ───────────── Calendrier ─────────────
   Généré aléatoirement à la création du monde : il faut donc le conserver. */
function packCal(t){
  const o = [t.id, t.name, t.week, t.surf, t.tier, t.major ? 1 : 0];
  const h = Object.keys(t.history || {});
  // La case 6 est toujours écrite, même vide : les champs qui suivent en dépendent
  // pour garder leur place. Les anciennes sauvegardes, qui s'arrêtent à la case 6,
  // restent lisibles et retombent simplement sur les valeurs par défaut.
  o[6] = h.length ? h.map(y => [+y, t.history[y]]) : 0;
  o[7] = t.span || 1;             // un Grand Chelem occupe deux semaines
  o[8] = t.davisStage || null;    // 'group' ou 'final'
  o[9] = t.olympic ? 1 : 0;
  o[10] = t.host || null;
  return o;
}
function unpackCal(a){
  const t = { id:a[0], name:a[1], week:a[2], surf:a[3], tier:a[4],
              draw: TIERS[a[4]].draw, rounds: Math.round(Math.log2(TIERS[a[4]].draw)),
              major: !!a[5],
              span: a[7] || 1, davisStage: a[8] || null,
              olympic: !!a[9], host: a[10] || null,
              history: {} };
  (a[6] || []).forEach(([y, n]) => t.history[y] = n);
  return t;
}

/* ───────────── Tournoi en cours ─────────────
   On garde le tableau par identifiants pour pouvoir reprendre au milieu
   d'un tournoi — quitter au troisième tour de Roland-Garros et perdre la
   semaine serait insupportable. */
function packTour(st){
  /* On sérialise AUSSI un tournoi terminé. L'autosave part juste après le dernier
     match, donc à l'instant où st.done passe à true et AVANT que l'écran de bilan
     n'efface l'inscription de la semaine. Ne pas l'écrire laissait une sauvegarde
     où les points et la dotation étaient déjà crédités mais l'inscription toujours
     posée : au rechargement, le tournoi était rejoué et recrédité en entier.

     Une rencontre de Coupe Davis reste exclue : elle n'a ni tableau ni
     qualifications, et unpackTour ne sait pas reconstruire son état propre. */
  if (!st || st.davis) return null;
  const id = p => p ? p.id : null;
  return {
    t: st.t.id, status: st.status, rounds: st.rounds, phase: st.phase,
    q: { round: st.quali.round, total: st.quali.total,
         opp: id(st.quali.opp), cut: st.quali.cut },
    slots: st.slots.map(r => r.map(id)),
    round: st.round, myRoundsWon: st.myRoundsWon,
    out: st.out, done: st.done, prize: st.prize, pts: st.pts,
    seeds: st.seeds || {},
    mainField: (st.mainField || []).map(id)
  };
}
function unpackTour(o, byId, cal){
  if (!o) return null;
  const get = i => (i ? byId[i] || null : null);
  const t = cal.find(x => x.id === o.t);
  if (!t) return null;
  return {
    t, status: o.status, rounds: o.rounds, phase: o.phase,
    quali: { round:o.q.round, total:o.q.total, opp:get(o.q.opp), cut:o.q.cut },
    slots: o.slots.map(r => r.map(get)),
    round: o.round, myRoundsWon: o.myRoundsWon,
    out: o.out, done: o.done, prize: o.prize, pts: o.pts,
    seeds: o.seeds || {},
    mainField: (o.mainField || []).map(get).filter(Boolean)
  };
}

/* ───────────── Sérialisation complète ───────────── */
function serialize(c){
  const w = c.world;
  return {
    v: VERSION,
    stamp: Date.now(),
    world: {
      year: w.year, week: w.week, absWeek: w.absWeek, gender: w.gender,
      players: w.players.map(packPlayer),
      calendar: w.calendar.map(packCal),
      feed: (w.feed || []).slice(0, 40),
      davisSemis: (w.davisSemis || []).map(n => n.nation.id)
    },
    me: c.me.id, rival: c.rival.id,
    car: {
      money: c.money, earned: c.earned, spent: c.spent,
      staff: c.staff, staffPack: c.staffPack || null, body: c.body,
      fitness: c.fitness, moral: c.moral, rep: c.rep, disc: c.disc,
      sponsors: c.sponsors, pendingSponsor: c.pendingSponsor || null,
      pendingEvent: c.pendingEvent || null,
      entries: c.entries, inbox: c.inbox.slice(0, 40),
      seasons: c.seasons, seasonLog: c.seasonLog,
      traits: c.traits, flags: c.flags, badges: c.badges, usedEvents: c.usedEvents,
      h2h: c.h2h,
      careerPrize: c.careerPrize, careerSponsor: c.careerSponsor,
      weeksNo1: c.weeksNo1, yearEndNo1: c.yearEndNo1, top10Seasons: c.top10Seasons,
      slamFinals: c.slamFinals, davis: c.davis, medals: c.medals,
      olympic: c.olympic || 0,
      awards: c.awards || {},
      recSurf: c.recSurf || null,
      recTier: c.recTier || null,
      lifestyle: c.lifestyle || null,
      mode: c.mode || 'full',
      express: c.express || null,
      objective: c.objective || null,
      ptsBonus: c.ptsBonus || 0,
      clutchVsRival: c.clutchVsRival || 0,
      prevYearRank: c.prevYearRank || null,
      retired: c.retired
    },
    tour: packTour(c.tour)
  };
}

function hydrate(d){
  if (!d || d.v !== VERSION) return null;
  const W = World.W;

  const w = {
    year: d.world.year, week: d.world.week, absWeek: d.world.absWeek,
    gender: d.world.gender,
    players: d.world.players.map(o => unpackPlayer(o, W)),
    calendar: d.world.calendar.map(unpackCal),
    feed: d.world.feed || [],
    ranking: [], news: []
  };
  const byId = {};
  w.players.forEach(p => byId[p.id] = p);
  World.updateRankings(w);

  // La phase finale de Coupe Davis se rejoue a partir des nations qualifiees.
  if (d.world.davisSemis && d.world.davisSemis.length){
    w.davisSemis = d.world.davisSemis.map(id => ({
      nation: NATIONS.find(n => n.id === id),
      squad: w.ranking.filter(p => p.nation.id === id).slice(0, 4),
      strength: 0
    })).filter(x => x.nation);
    w.davisSemis.forEach(x => x.strength = x.squad.reduce((s2,p) => s2 + (p._lvl||55), 0));
  }

  const me = byId[d.me], rival = byId[d.rival];
  if (!me) return null;

  const c = Object.assign({
    world: w, me, rival: rival || w.players[0],
    tour: null, match: null, plan: null,
    lastResults: [], weekLog: []
  }, d.car);
  c.tour = unpackTour(d.tour, byId, w.calendar);
  return c;
}

/* ───────────── Accès disque ───────────── */
function write(c){
  try {
    localStorage.setItem(KEY, JSON.stringify(serialize(c)));
    return true;
  } catch (e){
    // Quota dépassé : on purge les vieilles carrières du Panthéon et on réessaie.
    try {
      const o = JSON.parse(localStorage.getItem('matchpoint_v2') || '{}');
      if (o.pantheon) { o.pantheon = o.pantheon.slice(0, 8); localStorage.setItem('matchpoint_v2', JSON.stringify(o)); }
      localStorage.setItem(KEY, JSON.stringify(serialize(c)));
      return true;
    } catch (e2){ return false; }
  }
}
function read(){
  try { return hydrate(JSON.parse(localStorage.getItem(KEY))); }
  catch (e){ return null; }
}
function peek(){
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (!raw || raw.v !== VERSION) return null;
    const me = raw.world.players.find(p => p.i === raw.me);
    if (!me) return null;
    return { name: me.n, age: me.a, rank: me.r, year: raw.world.year,
             week: raw.world.week, nation: (NATIONS.find(n => n.id === me.na)||{}).flag || '' };
  } catch (e){ return null; }
}
function clear(){ try { localStorage.removeItem(KEY); } catch(e){} }
function has(){ return !!peek(); }

/* ───────────── Le stockage est-il utilisable ? ─────────────
   En navigation privée, avec les cookies tiers coupés, ou depuis un fichier local,
   localStorage peut exister et refuser d'écrire. Mieux vaut le dire au joueur avant
   qu'il ne perde quinze saisons. */
function storageOk(){
  try {
    const t = '__mp_test__';
    localStorage.setItem(t, '1');
    localStorage.removeItem(t);
    return true;
  } catch (e){ return false; }
}

/* ───────────── Emporter sa carrière ailleurs ─────────────
   Pas de compte, pas de serveur : la sauvegarde vit dans le navigateur, et elle
   disparaît si on change d'appareil, si on vide l'historique, ou si le téléphone
   décide d'évincer le stockage. Un fichier est la seule vraie sortie de secours. */
function exportFile(c){
  const blob = new Blob([JSON.stringify(serialize(c))], { type:'application/json' });
  const p = peek() || { name:'carriere', year:'' };
  const nom = 'matchpoint-' + String(p.name).normalize('NFD').replace(/[^\w]+/g, '-').toLowerCase()
            + '-' + p.year + '.mpsave';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nom; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return nom;
}

/* Renvoie la carrière lue, ou une chaîne expliquant le refus. */
function importText(txt){
  let d;
  try { d = JSON.parse(txt); }
  catch (e){ return 'Ce fichier n\'est pas une sauvegarde VAMONOS TENNIS.'; }
  if (!d || d.v == null) return 'Ce fichier n\'est pas une sauvegarde VAMONOS TENNIS.';
  if (d.v !== VERSION) return 'Cette sauvegarde vient d\'une version différente du jeu (v'
                            + d.v + ' contre v' + VERSION + ').';
  let c;
  try { c = hydrate(d); } catch (e){ return 'Sauvegarde illisible : ' + e.message; }
  if (!c || !c.me) return 'Sauvegarde incomplète.';
  try { localStorage.setItem(KEY, JSON.stringify(d)); }
  catch (e){ return 'Impossible d\'écrire dans ce navigateur (espace insuffisant).'; }
  return c;
}

return { write, read, peek, clear, has, serialize, hydrate,
         storageOk, exportFile, importText, VERSION };
})();
