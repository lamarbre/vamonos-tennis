/* ══════════════════════════════════════════════════════════════════════════
   VAMONOS TENNIS — Carrière du joueur
   Entraînement, corps, blessures, staff, argent, inscriptions, tournois.
   ══════════════════════════════════════════════════════════════════════════ */

const Career = (() => {

const clamp = (v,a,b) => v<a?a:v>b?b:v;
const R = () => Math.random();
const ri = (a,b) => Math.floor(a + R()*(b-a+1));
const rand = (a,b) => a + R()*(b-a);
const pick = a => a[Math.floor(R()*a.length)];

/* ───────────── Formatage ───────────── */
function money(m){
  if (m == null) return '—';
  const abs = Math.abs(m);
  if (abs >= 1)     return (Math.round(m*100)/100).toFixed(abs >= 10 ? 1 : 2).replace('.', ',') + ' M€';
  if (abs >= 0.001) return Math.round(m*1000) + ' k€';
  return Math.round(m*1000000) + ' €';
}

/* ───────────── Création ───────────── */
function create(opt){
  const w = World.create({ gender: opt.gender });

  const me = World.makePlayer({
    nation: opt.nation, style: opt.style, gender: opt.gender,
    age: BAL.ageStart, isHuman: true,
    name: opt.name,
    pot: null, originSurf: opt.origin.surf
  });
  me.attrs = Object.assign({}, opt.origin.attrs);
  const rawPot = R() < BAL.prodigyChance
    ? ri(BAL.prodigyPot[0], BAL.prodigyPot[1])
    : Math.round(BAL.potMin + (BAL.playerPotSpread || BAL.potSpread) * Math.pow(R(), BAL.playerPotCurve));
  me.pot = clamp(rawPot + (opt.origin.potBonus||0) + (opt.style.potBonus||0), 50, 99);
  me.origin = opt.origin;
  World.refreshLevel(me);
  World.joinPlayer(w, me);

  const body = {}; BODY_PARTS.forEach(b => body[b.k] = 100);

  const c = {
    world: w, me,
    money: BAL.startMoney + (opt.origin.money || 0),
    earned: 0, spent: 0,
    staff: { coach:'c1', fit:'f0', physio:'p0', mental:'m0', agent:'a0' },
    body, fitness: 100, moral: 66, rep: opt.origin.rep || 6, disc: 50,
    sponsors: [],
    entries: {},            // week -> tournament id
    inbox: [],
    seasons: [],
    seasonLog: { w:0, l:0, pts:0, prize:0, titles:[], surfs:[], injuries:0, injWeeks:0 },
    traits: [], flags: {}, badges: [], usedEvents: [],
    h2h: {},
    // Bilans détaillés : le jeu les calculait sans jamais les garder.
    recSurf: { clay:{w:0,l:0}, hard:{w:0,l:0}, grass:{w:0,l:0} },
    recTier: {},
    tour: null,             // tournoi en cours
    match: null,            // match en cours
    lastResults: [],
    weekLog: [],
    retired: false,
    careerPrize: 0, careerSponsor: 0,
    weeksNo1: 0, yearEndNo1: 0, top10Seasons: 0,
    slamFinals: 0, davis: 0, medals: 0, olympic: 0,
    awards: {}
  };
  if (opt.origin.flag) c.flags[opt.origin.flag] = true;
  // L'hygiene de vie choisie a la creation faconne discipline, fraicheur et plafond.
  if (opt.lifestyle){
    c.lifestyle = opt.lifestyle.id;
    applyFx(c, opt.lifestyle.fx);
    if (opt.lifestyle.potBonus) me.pot = clamp(me.pot + opt.lifestyle.potBonus, 50, 99);
  }

  // Le rival de génération : un junior du même âge, au potentiel voisin.
  const rivals = w.players.filter(p => !p.isHuman && p.age <= 18);
  c.rival = rivals.sort((a,b) => Math.abs(b.pot - me.pot) - Math.abs(a.pot - me.pot)).pop()
            || pick(w.players);
  c.rival.isRival = true;

  makeObjective(c);
  say(c, 'Bienvenue sur le circuit', `Vous voilà professionnel, ${World.W} semaines de tournois par an devant vous et ${money(c.money)} sur le compte. Le classement mondial ne connaît pas votre nom. Pour l'instant.`);
  return c;
}

/* ───────────── Boîte de réception ───────────── */
function say(c, title, body, kind){
  c.inbox.unshift({ title, body, kind: kind || 'info',
                    week: c.world.week, year: c.world.year, read:false });
  if (c.inbox.length > 60) c.inbox.length = 60;
}
function unread(c){ return c.inbox.filter(m => !m.read).length; }

/* ───────────── Staff ───────────── */
function staffOf(c, role){ return STAFF[role].find(s => s.id === c.staff[role]); }
function staffFx(c, key){
  let v = key === 'train' || key === 'phys' || key === 'recover' || key === 'rehab'
       || key === 'injury' || key === 'sponsor' ? 1 : 0;
  STAFF_ROLES.forEach(r => {
    const s = staffOf(c, r.k); if (!s || !s.fx) return;
    const x = s.fx[key]; if (x == null) return;
    if (typeof v === 'number' && (key==='train'||key==='phys'||key==='recover'||key==='rehab'||key==='injury'||key==='sponsor')) v *= x;
    else v += x;
  });
  return v;
}
/* Le plafond de progression réellement atteignable : le talent, plus ce que
   l'encadrement en tire. Un joueur seul dans son coin n'ira jamais au bout de ce
   qu'il avait ; bien entouré, il dépasse un peu ce que son talent laissait prévoir. */
/* Un attribut peut depasser un peu le plafond general — on a tous un coup
   meilleur que le reste de notre jeu — mais de peu. A +9, les huit attributs
   convergeaient tous vers plafond+9 et le NIVEAU lui-meme depassait le plafond
   de huit points : un joueur cense culminer a 81 finissait a 88, et le titre
   mondial tombait dans une carriere sur cinq. */
const ATTR_MARGE = 3;

function effPot(c){
  // Le talent reste le facteur dominant : l'encadrement ne peut pas ajouter plus de
  // 4 points. Sans ce garde-fou, un joueur bien entouré passait au-dessus du n°5
  // mondial simulé et le titre suprême tombait dans une carrière sur cinq.
  const bonus = clamp(staffFx(c, 'ceiling'), -6, 4);
  return clamp(c.me.pot + bonus, 40, 99);
}

/* Applique une formule d'encadrement : pour chaque rôle, le meilleur profil que la
   formule autorise ET que les finances et le classement permettent. On redescend
   d'un cran tant que ça ne passe pas, donc une formule ambitieuse ne met jamais en
   faillite : elle recrute simplement moins haut que son intitulé. */
function applyStaffPack(c, packId){
  const pack = STAFF_PACKS.find(p => p.id === packId) || STAFF_PACKS[1];
  STAFF_ROLES.forEach(r => {
    const voulus = STAFF[r.k].filter(s => s.lvl <= pack.max)
                             .slice().sort((a, b) => b.lvl - a.lvl);
    // On ne garde pas un titulaire devenu hors de portée : sans ce test, un joueur
    // ruiné et retombé au classement conservait indéfiniment son staff de luxe.
    const ok = voulus.find(s => !canHire(c, r.k, s));
    if (ok) c.staff[r.k] = ok.id;
    else c.staff[r.k] = STAFF[r.k][0].id;
  });
  c.staffPack = packId;
  return c.staff;
}

/* La formule qui correspond à l'équipe actuellement en poste. */
function currentStaffPack(c){
  const lvlMax = Math.max(...STAFF_ROLES.map(r => (staffOf(c, r.k) || { lvl:0 }).lvl));
  if (c.staffPack) return c.staffPack;
  return (STAFF_PACKS.find(p => p.max >= lvlMax) || STAFF_PACKS[3]).id;
}

/* Un axe de travail devient un bloc concret : celui dont les attributs sont le
   plus en retard par rapport au plafond, pondéré par le style de jeu. */
function trainingForAxis(c, axisId){
  const axis = TRAIN_AXES.find(a => a.id === axisId);
  if (!axis) return axisId;                       // un id de bloc passé directement
  const cap = effPot(c) + ATTR_MARGE;
  let best = axis.of[0], bestScore = -1e9;
  axis.of.forEach(id => {
    const tr = TRAININGS.find(t => t.id === id);
    if (!tr || !tr.attrs.length) return;
    const retard = tr.attrs.reduce((s, k) => s + (cap - c.me.attrs[k]), 0) / tr.attrs.length;
    const poids  = tr.attrs.reduce((s, k) => s + (c.me.style.w[k] || 0.1), 0) / tr.attrs.length;
    const score = retard * (0.6 + poids * 2.5);
    if (score > bestScore){ bestScore = score; best = id; }
  });
  return best;
}

function weeklyCost(c){
  let v = BAL.weeklyBase;
  STAFF_ROLES.forEach(r => { const s = staffOf(c, r.k); if (s) v += s.cost; });
  return v;
}
function canHire(c, role, s){
  if (s.minRank && c.me.rank > s.minRank) return 'Classement insuffisant';
  if (weeklyCost(c) - staffOf(c, role).cost + s.cost > c.money / 8 && s.cost > 0)
    return 'Trop cher pour vos finances';
  return null;
}

/* ───────────── Corps et blessures ───────────── */
function bodyAvg(c){
  let s = 0; BODY_PARTS.forEach(b => s += c.body[b.k]);
  return s / BODY_PARTS.length;
}
function weakestPart(c){
  return BODY_PARTS.slice().sort((a,b) => c.body[a.k] - c.body[b.k])[0];
}

function stressBody(c, load, focusAttrs){
  BODY_PARTS.forEach(b => {
    const hit = b.from.some(k => focusAttrs.includes(k)) ? 1.9 : 0.55;
    c.body[b.k] = clamp(c.body[b.k] - load * hit * 0.55, 0, 100);
  });
}
function healBody(c, mult){
  const rec = staffFx(c, 'recover');
  BODY_PARTS.forEach(b => {
    c.body[b.k] = clamp(c.body[b.k] + 1.6 * b.heal * rec * mult, 0, 100);
  });
}

function rollInjury(c, extra){
  const part = weakestPart(c);
  const cond = c.body[part.k];
  // Un risque plancher : meme le joueur le mieux suivi se blesse un jour.
  // Calibre sur le circuit reel : 5 a 12 % des semaines perdues sur blessure.
  let risk = 0.0030 + (100 - cond) / 100 * 0.016 + (c.fitness < 40 ? 0.007 : 0);
  risk *= staffFx(c, 'injury') * (1 + (extra || 0));
  risk *= c.traits.includes('glass') ? 1.7 : 1;
  risk *= c.traits.includes('iron') ? 0.55 : 1;
  risk *= 1 + Math.max(0, c.me.age - 29) * 0.10;
  if (R() > risk) return null;

  const roll = R();
  const lvl = roll < .50 ? INJURY_LEVELS[0] : roll < .80 ? INJURY_LEVELS[1]
            : roll < .95 ? INJURY_LEVELS[2] : INJURY_LEVELS[3];
  const weeks = Math.max(1, Math.round(ri(lvl.weeks[0], lvl.weeks[1]) / staffFx(c, 'rehab')));
  c.body[part.k] = clamp(c.body[part.k] - lvl.damage, 0, 100);
  c.me.injuredUntil = Math.max(c.me.injuredUntil, c.world.absWeek + weeks);
  c.me.injury = { part: part.k, name: part.name, level: lvl.id, label: lvl.name, weeks, total: weeks };
  c.seasonLog.injuries = (c.seasonLog.injuries || 0) + 1;
  c.seasonLog.injWeeks = (c.seasonLog.injWeeks || 0) + weeks;
  say(c, `Blessure — ${part.name.toLowerCase()}`,
      `${lvl.label} Indisponibilité estimée : ${weeks} semaine${weeks>1?'s':''}. ` +
      (lvl.damage > 12 ? 'Cette zone gardera des séquelles.' : 'Rien d\'irréparable si vous respectez le protocole.'),
      'bad');
  // Les points de la période ne seront pas défendus.
  return c.me.injury;
}

function isInjured(c){ return c.me.injuredUntil > c.world.absWeek; }
function injuryWeeksLeft(c){ return Math.max(0, c.me.injuredUntil - c.world.absWeek); }

/* ───────────── Progression du joueur ───────────── */
function trajFactor(age, peak){
  const d = age - peak;
  if (d <= -8) return 1.50;
  if (d <= -6) return 1.30;
  if (d <= -4) return 1.05;
  if (d <= -2) return 0.72;
  if (d <=  0) return 0.38;
  if (d <=  2) return 0.10;
  return 0;
}

function train(c, trainingId, intensityId){
  const tr = TRAININGS.find(t => t.id === trainingId);
  const it = INTENSITIES.find(i => i.id === intensityId) || INTENSITIES[1];
  const log = [];

  if (tr.id === 'rest'){
    c.fitness = clamp(c.fitness + BAL.fatigueRecover * 1.9 * staffFx(c,'recover'), 0, 100);
    healBody(c, 2.4);
    c.moral = clamp(c.moral + 4, 0, 100);
    log.push({ txt:'Semaine de récupération complète', good:true });
    return log;
  }
  if (tr.id === 'lessons'){
    const fee = 0.0012 + R() * 0.0008;
    c.money += fee; c.earned += fee;
    c.fitness = clamp(c.fitness + 2, 0, 100);
    healBody(c, 0.6);
    c.moral = clamp(c.moral - 2, 0, 100);
    log.push({ txt:`Cours donn\u00e9s en club : ${money(fee)}`, good:true });
    log.push({ txt:'Une semaine sans progresser', good:false });
    return log;
  }
  if (tr.id === 'exho'){
    const fee = 0.004 + Math.pow(Math.max(0, c.rep) / 40, 2.2) * 0.09;
    c.money += fee; c.earned += fee;
    c.fitness = clamp(c.fitness - 5, 0, 100);
    stressBody(c, 1.0, []);
    log.push({ txt:`Exhibition disputée : ${money(fee)} de cachet`, good:true });
    if (R() < 0.05) { const inj = rollInjury(c, 0.6); if (inj) log.push({ txt:'Blessure pendant l\'exhibition', good:false }); }
    return log;
  }

  const lvl = World.refreshLevel(c.me);
  const cap = effPot(c);
  const room = clamp((cap - lvl) / 10, -0.4, 1.8);
  const coachMult = tr.attrs.includes('spd') || tr.attrs.includes('sta')
    ? staffFx(c, 'phys') : staffFx(c, 'train');
  const gain = BAL.trainGain * tr.gain * it.mult * room
             * trajFactor(c.me.age, c.me.peak) * coachMult
             * (0.72 + c.fitness / 300) * (0.85 + c.moral / 500)
             * (c.traits.includes('grinder') ? 1.12 : 1);

  tr.attrs.forEach(k => {
    const before = c.me.attrs[k];
    // Un attribut ne peut pas s'envoler seul : il bute lui aussi sur le talent.
    const room = clamp((cap + ATTR_MARGE - c.me.attrs[k]) / 9, -0.15, 1);
    c.me.attrs[k] = clamp(c.me.attrs[k] + gain * room * (0.7 + R()*0.6), 20, 99);
    const d = c.me.attrs[k] - before;
    if (d >= 0.05) log.push({ txt:`${ATTRS.find(a=>a.k===k).name} +${d.toFixed(1)}`, good:true });
  });
  if (!log.length) log.push({ txt:'Aucun progrès mesurable cette semaine', good:false });

  const load = tr.load * it.load;
  c.fitness = clamp(c.fitness - load * 3.4 + BAL.fatigueRecover * 0.55, 0, 100);
  stressBody(c, load, tr.attrs);
  healBody(c, 0.5);
  World.refreshLevel(c.me);

  const inj = rollInjury(c, load * 0.22);
  if (inj) log.push({ txt:`Blessure à l'entraînement : ${inj.name.toLowerCase()}`, good:false });
  return log;
}

function rehabWeek(c){
  const rec = staffFx(c, 'rehab');
  healBody(c, 1.8);
  c.fitness = clamp(c.fitness + 6, 0, 100);
  c.moral = clamp(c.moral - 1.5, 0, 100);
  if (c.me.injury && R() < 0.10 * rec){
    c.me.injuredUntil--;                       // rééducation qui avance plus vite que prévu
    return 'La rééducation avance plus vite que prévu.';
  }
  return null;
}

/* ───────────── Argent ───────────── */
/* Un match compte autant qu'une s\u00e9ance : c'est sur le circuit qu'on apprend.
   Affronter plus fort que soi rapporte davantage. */
function matchXP(c, opp, won){
  const me = c.me;
  const lvl = World.refreshLevel(me);
  const cap = effPot(c);
  const room = clamp((cap - lvl) / 10, -0.3, 1.8);
  const gap  = clamp((World.levelOf(opp) - lvl) / 10, -0.5, 1.0);
  const g = 0.028 * room * trajFactor(me.age, me.peak) * (1 + gap * 0.6)
          * (won ? 1.35 : 1) * staffFx(c, 'train');
  ATTR_KEYS.forEach(k => {
    const room = clamp((cap + ATTR_MARGE - me.attrs[k]) / 9, -0.15, 1);
    me.attrs[k] = clamp(me.attrs[k] + g * room * (0.4 + (me.style.w[k] || 0.1) * 4) * (0.6 + R()*0.8), 20, 99);
  });
  World.refreshLevel(me);
}

/* Le decouvert a enfin des consequences. Avant, on pouvait finir a -11 M EUR sans
   que rien ne se passe : l'argent etait un compteur decoratif, et le choix de
   l'encadrement n'avait donc pas de contrepartie. Deux seuils, deux reponses. */
const DETTE_STAFF = -0.5;      // on ne peut plus payer : on se separe du plus cher
const DETTE_FIN   = -1.6;      // plus personne ne suit : la carriere s'arrete

function checkDette(c){
  if (c.money > DETTE_STAFF) return null;

  // Premier seuil : on licencie le poste le plus cher encore pourvu.
  let pire = null;
  STAFF_ROLES.forEach(r => {
    const st = staffOf(c, r.k);
    if (st && st.cost > 0 && (!pire || st.cost > pire.cost)) pire = { r, cost: st.cost, nom: st.name };
  });
  if (pire){
    c.staff[pire.r.k] = STAFF[pire.r.k][0].id;
    c.staffPack = null;
    say(c, 'Vous ne pouvez plus payer ' + pire.nom.toLowerCase(),
        'Le compte est à ' + money(c.money) + '. Le contrat est rompu faute de paiement. '
        + 'Vous continuerez sans, le temps de renflouer.', 'bad');
    return 'staff';
  }

  // Plus rien a couper : c'est la fin.
  if (c.money <= DETTE_FIN && !c.retired){
    // c.retired est ce que testent les deux modes pour conclure une carrière.
    c.flags.ruine = true;
    c.retired = true;
    say(c, 'La carrière s\'arrête là',
        'Avec ' + money(c.money) + ' de dettes et plus personne pour avancer les frais, '
        + 'les inscriptions et les billets d\'avion ne sont plus payables. On ne vit pas '
        + 'du tennis à crédit indéfiniment.', 'bad');
    return 'fin';
  }
  return null;
}

function weekEconomy(c){
  const cost = weeklyCost(c);
  c.money -= cost; c.spent += cost;
  let spo = 0;
  c.sponsors.forEach(s => { spo += s.annual / World.W; });
  // Aide de la f\u00e9d\u00e9ration pour les moins de 22 ans d\u00e9j\u00e0 class\u00e9s
  if (c.me.age <= 21 && c.me.rank <= 900) spo += 0.00045;
  c.money += spo; c.earned += spo; c.careerSponsor += spo;
  const dette = checkDette(c);
  return { cost, spo, dette };
}

function sponsorOffers(c){
  const rank = c.me.rank;
  SPONSOR_TYPES.forEach(t => {
    if (c.sponsors.some(s => s.type === t.k)) return;
    if (t.minRank && rank > t.minRank) return;
    if (rank > 420) return;
    if (R() > 0.16) return;
    const base = Math.pow(Math.max(1, 440 - rank) / 130, 2.5) * 0.05;
    const annual = Math.max(0.004, base * t.mult * staffFx(c, 'sponsor') * (0.8 + R()*0.5));
    const years = ri(2, 4);
    c.pendingSponsor = { type:t.k, name:t.name, icon:t.icon, annual, years };
    say(c, `Offre de sponsoring — ${t.name}`,
        `Une marque vous propose ${money(annual)} par an pendant ${years} ans. À accepter ou refuser depuis l'écran Équipe.`, 'good');
  });
}

/* ───────────── Inscriptions ───────────── */
/* Ou le joueur a-t-il reellement sa place ?
   'ideal'      : son classement est dans la fourchette du tableau
   'ambitieux'  : il vise au-dessus, il passera par les qualifications
   'facile'     : il est trop fort pour ce tournoi, peu de points a gagner */
function fitOf(c, t){
  const band = TIERS[t.tier].band || [1, 2000];
  const r = c.me.rank;
  if (r < band[0] * 0.75) return 'facile';
  if (r > band[1] * 0.75) return 'ambitieux';
  return 'ideal';
}

function eligibleTournaments(c, week){
  return World.weekTournaments(c.world, week).map(t => ({
    t,
    status: t.tier === 'davis' ? davisStatus(c, t) : World.entryStatus(c.world, t, c.me),
    fit: t.tier === 'davis' || t.tier === 'olympics' ? 'ideal' : fitOf(c, t)
  })).filter(x => x.status !== 'no')
    .sort((a,b) => TIERS[b.t.tier].prio - TIERS[a.t.tier].prio);
}

/* Le tournoi le plus sense cette semaine : celui de sa categorie,
   et a defaut le plus proche vers le bas. */
function bestFit(c, week){
  const list = eligibleTournaments(c, week);
  const nat = list.find(x => x.t.tier === 'davis' || x.t.tier === 'olympics');
  if (nat) return nat;                       // on ne refuse pas son pays
  return list.find(x => x.fit === 'ideal' && x.status === 'direct')
      || list.find(x => x.fit === 'ideal')
      || list.filter(x => x.fit === 'facile').pop()
      || list[0] || null;
}

function enter(c, week, tid){ c.entries[c.world.year + '-' + week] = tid; }
function entryFor(c, week){ return c.entries[c.world.year + '-' + week]; }
function clearEntry(c, week){ delete c.entries[c.world.year + '-' + week]; }

/* Points à défendre cette semaine (ceux gagnés la même semaine l'an dernier). */
function defending(c, week){ return c.me.pts52[week - 1] || 0; }

/* ───────────── Tournoi interactif ───────────── */
function startTournament(c, t, status){
  const w = c.world;
  // La semaine entiere est planifiee ici : le tableau du joueur est donc
  // rempli avec ce qui reste apres les tournois plus prestigieux.
  c.plan = World.planWeek(w, t.id);
  let field = (c.plan.fields.get(t.id) || []).slice().filter(p => p.id !== c.me.id);
  field.sort((a, b) => a.rank - b.rank);

  // Le « cut » : le classement du dernier entrant direct.
  const cut = field.length ? field[Math.min(field.length, t.draw) - 1].rank : 99999;
  const needQuali = c.me.rank > cut * 1.03;

  const st = {
    t, status, rounds: t.rounds,
    phase: needQuali ? 'quali' : 'main',
    quali: { round: 0, total: 2, opp: null, cut },
    slots: [], round: 0,
    myRoundsWon: 0, out: false, done: false,
    prize: 0, pts: 0, mainField: field
  };

  if (!needQuali) buildMainDraw(c, st);
  else st.quali.opp = makeQualiOpponent(c, cut);

  c.tour = st;
  return st;
}

/* Un adversaire de qualifications : classe autour du cut, jamais une star. */
function makeQualiOpponent(c, cut){
  const w = c.world;
  const lo = Math.round(cut * 0.9), hi = Math.round(cut * 2.4);
  const pool = w.ranking.filter(p => !p.isHuman && !p.retired && p.rank >= lo && p.rank <= hi);
  if (pool.length) return pick(pool);
  return w.ranking[Math.min(w.ranking.length - 1, Math.round(cut * 1.3))] || pick(w.ranking);
}

function buildMainDraw(c, st){
  const field = st.mainField.slice();
  if (field.length >= st.t.draw) field.length = st.t.draw - 1;
  field.push(c.me);
  st.slots = [World.seedDraw(field, st.t.draw)];
  st.seeds = World.seedMap(field, st.t.draw);   // identifiant -> numero de tete de serie
  st.round = 0;
  st.phase = 'main';
}

function seedOf(st, p){ return (p && st && st.seeds) ? (st.seeds[p.id] || 0) : 0; }

function myOpponent(c){
  const st = c.tour;
  if (st.phase === 'quali') return st.quali.opp;
  const cur = st.slots[st.round];
  if (!cur) return null;
  const i = cur.findIndex(p => p && p.id === c.me.id);
  if (i < 0) return null;
  const j = i % 2 === 0 ? i + 1 : i - 1;
  return cur[j] || null;
}

/* Resout un tour de qualifications. */
function resolveQuali(c, iWon){
  const st = c.tour, opp = st.quali.opp;
  const key = opp.id;
  c.h2h[key] = c.h2h[key] || { w:0, l:0, name:opp.name };
  iWon ? c.h2h[key].w++ : c.h2h[key].l++;
  iWon ? c.me.wins++ : c.me.losses++;
  iWon ? c.seasonLog.w++ : c.seasonLog.l++;
  noteResult(c, st.t.surf, st.t.tier, iWon);
  matchXP(c, opp, iWon);

  if (!iWon){
    st.out = true; st.done = true;
    st.pts = 0;
    st.prize = (TIERS[st.t.tier].prize[0] || 0) * 0.4;
    c.money += st.prize; c.earned += st.prize; c.careerPrize += st.prize;
    c.seasonLog.prize += st.prize;
    World.clearWeek(c.world, c.me);
    say(c, `Qualifications perdues — ${st.t.name}`,
        `Eliminé au ${st.quali.round + 1}er tour des qualifications. Une semaine de voyage pour rien, et la note d'hotel à payer.`, 'bad');
    return;
  }
  st.quali.round++;
  if (st.quali.round >= st.quali.total){
    say(c, `Qualifié — ${st.t.name}`,
        `Vous passez les qualifications et entrez dans le tableau principal.`, 'good');
    buildMainDraw(c, st);
  } else {
    st.quali.opp = makeQualiOpponent(c, st.quali.cut);
  }
}

function roundName(st, r){
  const left = st.rounds - r;
  if (left === 1) return 'Finale';
  if (left === 2) return 'Demi-finale';
  if (left === 3) return 'Quart de finale';
  if (left === 4) return 'Huitième de finale';
  const n = Math.pow(2, left - 1);          // un tableau de 128 commence aux 64es
  return `${n}es de finale`;
}

/* Joue tous les autres matchs du tour, puis construit le tour suivant. */
function resolveRound(c, iWon){
  const st = c.tour, w = c.world;
  if (st.phase === 'quali') return resolveQuali(c, iWon);
  const cur = st.slots[st.round];
  const next = [];
  for (let i = 0; i < cur.length; i += 2){
    const a = cur[i], b = cur[i+1];
    if (!a && !b){ next.push(null); continue; }
    if (!a || !b){ next.push(a || b); continue; }
    if (a.id === c.me.id || b.id === c.me.id){
      const me = a.id === c.me.id ? a : b, opp = a.id === c.me.id ? b : a;
      next.push(iWon ? me : opp);
      const key = opp.id;
      c.h2h[key] = c.h2h[key] || { w:0, l:0, name:opp.name };
      iWon ? c.h2h[key].w++ : c.h2h[key].l++;
      iWon ? c.me.wins++ : c.me.losses++;
      iWon ? c.seasonLog.w++ : c.seasonLog.l++;
      noteResult(c, st.t.surf, st.t.tier, iWon);
      matchXP(c, opp, iWon);
      continue;
    }
    const aw = MatchEngine.quickWin(a, b, st.t.surf);
    const win = aw ? a : b, lose = aw ? b : a;
    win.wins++; lose.losses++;
    win.fatigue = clamp(win.fatigue + 2.4, 0, 100);
    next.push(win);
  }
  st.slots.push(next);
  st.round++;
  if (iWon) st.myRoundsWon++;
  else st.out = true;

  if (st.out || st.round >= st.rounds) finishTournament(c);
}

function finishTournament(c){
  const st = c.tour, w = c.world, t = st.t, tier = TIERS[t.tier];
  if (st.phase === 'quali') return;

  // Le joueur peut avoir gagné le tournoi.
  const champSlot = st.slots[st.slots.length - 1];
  const champ = champSlot && champSlot[0];
  const iWonAll = !st.out && st.myRoundsWon >= st.rounds;

  const pts = tier.pts[Math.min(st.myRoundsWon, tier.pts.length - 1)] || 0;
  const prize = tier.prize[Math.min(st.myRoundsWon, tier.prize.length - 1)] || 0;
  st.prize = prize;
  const ptsFinal = c.ptsBonus ? Math.max(0, Math.round(pts * (1 + c.ptsBonus))) : pts;
  st.pts = ptsFinal;
  World.addPoints(w, c.me, t, ptsFinal);
  c.money += prize; c.earned += prize; c.careerPrize += prize;
  c.seasonLog.pts += ptsFinal; c.seasonLog.prize += prize;

  /* Les Jeux : pas un point ATP, mais une medaille qui ne se perime jamais. */
  if (tier.medals){
    const left = st.rounds - st.myRoundsWon;
    if (left === 0){
      c.medals++; c.olympic++;
      say(c, `MÉDAILLE D'OR — ${t.name}`,
          `Champion olympique. L'hymne, le drapeau, et quelque chose que ni le classement ni l'argent ne pourront jamais vous retirer.`, 'good');
      c.moral = clamp(c.moral + 22, 0, 100);
      c.rep = clamp(c.rep + 12, 0, 100);
    } else if (left === 1){
      c.medals++;
      say(c, `Médaille d'argent — ${t.name}`,
          `Finale olympique perdue. Vous serez le seul à trouver que c'est une déception.`, 'good');
      c.moral = clamp(c.moral + 10, 0, 100); c.rep = clamp(c.rep + 7, 0, 100);
    } else if (left === 2 && R() < 0.5){
      c.medals++;
      say(c, `Médaille de bronze — ${t.name}`,
          `Vous gagnez le match pour la troisième place. Une médaille olympique reste une médaille olympique.`, 'good');
      c.moral = clamp(c.moral + 8, 0, 100); c.rep = clamp(c.rep + 4, 0, 100);
    }
  }

  if (iWonAll){
    World.recordTitle(c.me, t, w.year);
    c.seasonLog.titles.push(t.name);
    t.history[w.year] = c.me.name;
    say(c, `TITRE — ${t.name}`, `Vous remportez ${t.name} (${tier.name}). ${pts} points, ${money(prize)}.`, 'good');
    c.moral = clamp(c.moral + 12, 0, 100);
  } else if (st.myRoundsWon >= st.rounds - 1 && t.tier === 'slam'){
    c.slamFinals++;
  }
  if (t.tier === 'slam' && st.myRoundsWon >= st.rounds - 1 && !iWonAll)
    say(c, `Finale perdue — ${t.name}`, `Si près. ${pts} points et ${money(prize)}, mais le trophée était à portée de main.`, 'bad');

  // On termine le tableau pour le reste du circuit.
  let cur = st.slots[st.slots.length - 1].slice();
  let r = st.round;
  const roundsWon = new Map();
  st.slots[0].forEach(p => { if (p) roundsWon.set(p.id, 0); });
  for (let k = 1; k < st.slots.length; k++)
    st.slots[k].forEach(p => { if (p) roundsWon.set(p.id, k); });
  while (r < st.rounds){
    const next = [];
    for (let i = 0; i < cur.length; i += 2){
      const a = cur[i], b = cur[i+1];
      if (!a && !b){ next.push(null); continue; }
      if (!a || !b){ const s = a||b; roundsWon.set(s.id, r+1); next.push(s); continue; }
      const aw = MatchEngine.quickWin(a, b, t.surf);
      const win = aw ? a : b;
      roundsWon.set(win.id, r+1);
      (aw?a:b).wins++; (aw?b:a).losses++;
      next.push(win);
    }
    cur = next; r++;
  }
  st.winner = cur[0];
  if (st.winner && st.winner.id !== c.me.id) t.history[w.year] = st.winner.name;

  st.slots[0].forEach(p => {
    if (!p || p.id === c.me.id) return;
    const rw = roundsWon.get(p.id) || 0;
    World.addPoints(w, p, t, tier.pts[Math.min(rw, tier.pts.length-1)] || 0);
    if (rw === st.rounds) World.recordTitle(p, t, w.year);
  });

  if (t.tier === 'slam')
    c.seasonLog.bestSlam = Math.max(c.seasonLog.bestSlam || 0, st.myRoundsWon);
  if (iWonAll){
    c.seasonLog.surfs = c.seasonLog.surfs || [];
    if (!c.seasonLog.surfs.includes(t.surf)) c.seasonLog.surfs.push(t.surf);
  }

  st.done = true;
  World.updateRankings(w);
}

/* ═══════════════ FICHE ADVERSAIRE ═══════════════
   Toutes les données existent déjà dans le monde : il s'agit de les lire. */
/* Le moteur de match doit connaître l'ascendant psychologique sur le rival. */
function clutchAgainst(c, opp){
  return (opp && c.rival && opp.id === c.rival.id) ? (c.clutchVsRival || 0) : 0;
}

function scout(c, opp, surf){
  const me = c.me;
  const cmp = ATTRS.map(a => ({
    k:a.k, name:a.name, icon:a.icon,
    mine: Math.round(me.attrs[a.k]), his: Math.round(opp.attrs[a.k]),
    d: Math.round(me.attrs[a.k] - opp.attrs[a.k])
  }));

  const o = opp.attrs, my = me.attrs;
  const notes = [];
  let tactic = 'balanced';

  // L'aile faible : la première chose qu'on cherche chez un adversaire.
  if (o.fh >= o.bh + 5){ notes.push({ txt:`Son revers est nettement en retrait de son coup droit. Insistez dessus.`, good:true }); }
  else if (o.bh >= o.fh + 5){ notes.push({ txt:`Son revers est son meilleur côté — évitez de le nourrir.`, good:false }); }

  if (o.srv >= my.ret + 8){
    notes.push({ txt:`Il sert très fort : les occasions de break seront rares. Vos jeux de service sont votre seule marge.`, good:false });
    tactic = 'serve';
  } else if (o.srv <= my.ret - 6){
    notes.push({ txt:`Son service est prenable. Avancez sur la seconde balle.`, good:true });
    tactic = 'return';
  }

  if (o.sta <= my.sta - 7){
    notes.push({ txt:`Son endurance décroche : allongez les échanges, il craquera avant vous.`, good:true });
    tactic = 'defend';
  } else if (o.sta >= my.sta + 8){
    notes.push({ txt:`Il tiendra plus longtemps que vous. Ne cherchez pas la guerre d'usure.`, good:false });
    if (tactic === 'balanced') tactic = 'attack';
  }

  if (o.vol <= 58 && my.vol >= 62){
    notes.push({ txt:`Il est mal à l'aise au filet et sur les balles courtes.`, good:true });
    if (tactic === 'balanced') tactic = 'net';
  }

  if (o.men >= 78) notes.push({ txt:`Redoutable dans les moments décisifs : ne comptez pas sur lui pour craquer.`, good:false });
  else if (o.men <= 60) notes.push({ txt:`Il tremble sur les points importants. Faites durer le match.`, good:true });

  const sa = (opp.surf && opp.surf[surf]) || 0, sm = (me.surf && me.surf[surf]) || 0;
  if (sa <= -3) notes.push({ txt:`Cette surface ne lui convient pas.`, good:true });
  else if (sa >= 4) notes.push({ txt:`C'est sa surface de prédilection.`, good:false });

  if (opp.form >= 78) notes.push({ txt:`Il arrive en pleine confiance.`, good:false });
  else if (opp.form <= 48) notes.push({ txt:`Il traverse une mauvaise passe.`, good:true });

  if (opp.id === c.rival.id) notes.push({ txt:`C'est votre rival de toujours. Ce match-là ne ressemble à aucun autre.`, good:null });

  return {
    opp, cmp, notes, tactic,
    surfHim: sa, surfMe: sm,
    h2h: c.h2h[opp.id] || null,
    edge: Math.round(World.levelOf(me) + sm * 0.72 - World.levelOf(opp) - sa * 0.72)
  };
}

/* ═══════════════ OBJECTIFS DE SAISON ═══════════════ */
function makeObjective(c){
  const r = c.me.rank || 1200, age = c.me.age;
  const cands = [];

  /* En début de carrière, un « top 562 » ne veut rien dire : on vise
     les premières marches réelles du circuit. */
  const STEPS = [1, 3, 5, 10, 20, 30, 50, 75, 100, 150, 200, 300, 400, 500, 700];
  const raw = r <= 3 ? 1
    : r <= 20 ? Math.max(1, Math.round(r * 0.55))
    : r <= 120 ? Math.round(r * 0.68)
    : Math.round(r * 0.70);
  const target = STEPS.filter(x => x >= raw)[0] || STEPS[STEPS.length - 1];
  if (r > target + 3)
    cands.push({ type:'rank', target,
      label:`Terminer la saison dans le top ${target}`,
      why:'Votre équipe a fixé la barre.', w: 30 });

  if (!c.me.points)
    cands.push({ type:'points', target:1,
      label:'Marquer vos premiers points au classement mondial',
      why:'Tout commence par là.', w: 40 });

  if (r > 400){
    const nw = Math.max(8, Math.round((c.me.wins ? 12 : 10)));
    cands.push({ type:'wins', target:nw,
      label:`Gagner ${nw} matchs dans la saison`,
      why:'Avant les points, il faut des victoires.', w: 26 });
  }

  if (r <= 400){
    const n = r <= 15 ? 4 : r <= 60 ? 2 : 1;
    cands.push({ type:'titles', target:n,
      label:`Remporter ${n} titre${n>1?'s':''} cette saison`,
      why:'Les résultats se comptent en trophées.', w: 22 });
  }
  if (r <= 150){
    cands.push({ type:'slam', target: r <= 25 ? 5 : r <= 70 ? 3 : 2,
      label:`Atteindre au moins ${r<=25?'les quarts':r<=70?'le troisième tour':'le deuxième tour'} d'un Grand Chelem`,
      why:'C\'est là qu\'on juge une saison.', w: 20 });
  }
  if (c.money < 0.02){
    cands.push({ type:'money', target:0,
      label:'Terminer la saison avec des comptes à l\'équilibre',
      why:'Votre agent est formel : ça ne peut plus durer.', w: 26 });
  }
  if (r > 250){
    cands.push({ type:'points', target: Math.max(15, Math.round((c.me.points || 0) * 1.8 + 20)),
      label:`Atteindre ${Math.max(15, Math.round((c.me.points||0) * 1.8 + 20))} points au classement`,
      why:'Il faut sortir de cette zone.', w: 24 });
  }

  const tot = cands.reduce((s2, x) => s2 + x.w, 0);
  let roll = R() * tot, ob = cands[cands.length - 1];
  for (const x of cands){ roll -= x.w; if (roll <= 0){ ob = x; break; } }

  ob.year = c.world.year;
  ob.reward = clamp(0.01 + Math.pow(Math.max(1, 300 - r) / 160, 2.2) * 0.05, 0.008, 0.9);
  c.objective = ob;
  say(c, `Objectif ${ob.year} — ${ob.label}`,
      `${ob.why} Prime de ${money(ob.reward)} si l'objectif est atteint.`, 'info');
  return ob;
}

function objectiveDone(c){
  const ob = c.objective;
  if (!ob) return null;
  const t = c.me.titles;
  switch (ob.type){
    case 'rank':   return c.me.rank <= ob.target;
    case 'titles': return c.seasonLog.titles.length >= ob.target;
    case 'points': return c.me.points >= ob.target;
    case 'money':  return c.money >= 0;
    case 'wins':   return c.seasonLog.w >= ob.target;
    case 'slam':   return (c.seasonLog.bestSlam || 0) >= ob.target;
  }
  return null;
}

/* ───────────── La semaine ─────────────
   beginWeek dit ce qui se passe ; endWeek fait tourner le monde et l'économie. */
/* Cout en fraicheur d'un match, selon sa duree. Un cinq-sets coute cher. */
function matchCost(minutes){ return (minutes / 60) * 2.2; }

/* Un match use le corps, et pas seulement les jambes. La terre battue coute
   le plus cher, le gazon le moins. Une bonne endurance amortit le choc. */
function matchWear(c, minutes, surf){
  const load = (minutes / 60) * (surf === 'clay' ? 1.25 : surf === 'hard' ? 1.10 : 0.85);
  const resist = 1.25 - c.me.attrs.sta / 160;
  BODY_PARTS.forEach(b => {
    c.body[b.k] = clamp(c.body[b.k] - load * 0.25 * resist, 0, 100);
  });
  return rollInjury(c, load * 0.16);
}

function beginWeek(c){
  const w = c.world;
  if (isInjured(c)) return { type:'injured', weeks: injuryWeeksLeft(c) };
  const tid = entryFor(c, w.week);
  if (tid){
    const t = w.calendar.find(x => x.id === tid);
    if (t){
      const status = World.entryStatus(w, t, c.me);
      if (status === 'no'){
        clearEntry(c, w.week);
        say(c, `Inscription refusée — ${t.name}`,
            `Votre classement (${c.me.rank}e) ne suffit plus pour ${t.name}. Vous êtes hors du tableau.`, 'bad');
        return { type:'free', bumped:true };
      }
      return { type:'tournament', t, status, span: t.span || 1 };
    }
  }
  return { type:'free' };
}

function oneWeek(c, playedTid){
  const w = c.world;
  const before = c.me.rank;

  const plan = (playedTid && c.plan && c.plan.humanTid === playedTid)
    ? c.plan : World.planWeek(w, playedTid || null);
  World.runWeek(w, plan, !!playedTid);
  c.plan = null;

  const eco = weekEconomy(c);
  if (!playedTid){
    c.fitness = clamp(c.fitness + 8, 0, 100);
  } else {
    c.fitness = clamp(c.fitness + 3, 0, 100);
    healBody(c, 0.35);
  }
  c.me.fatigue = 100 - c.fitness;

  // Fin de blessure
  if (c.me.injury && !isInjured(c)){
    say(c, 'Retour à la compétition',
        `Vous êtes de nouveau apte après ${c.me.injury.total} semaine${c.me.injury.total>1?'s':''} d'arrêt. ` +
        `${c.me.injury.name} : la zone reste fragile.`, 'good');
    c.me.injury = null;
  }

  if (c.money < -0.02 && !c.flags.broke_warned){
    c.flags.broke_warned = true;
    say(c, 'Découvert bancaire',
        `Vos frais dépassent vos gains depuis des mois. Il faut soit réduire le staff, soit gagner des matchs. Vite.`, 'bad');
  }

  const res = { newYear:false, season:null, rankBefore: before, eco };

  // Un événement narratif de temps en temps, ancré dans la situation.
  if (R() < 0.095){
    const e = pickEvent(c);
    if (e) res.event = e;
  }

  if (w.week % 8 === 0) sponsorOffers(c);

  const newYear = World.advance(w);
  if (newYear){
    // Les inscriptions de l'annee ecoulee ne servent plus a rien.
    Object.keys(c.entries).forEach(k => {
      if (+String(k).split('-')[0] < w.year) delete c.entries[k];
    });
    c.ptsBonus = 0;
    res.newYear = true;
    res.season = endSeason(c);
    makeObjective(c);
    // Si le rival raccroche, la génération suivante prend le relais.
    if (c.rival.retired){
      const next = w.ranking.find(p => !p.isHuman && !p.retired &&
        Math.abs(p.age - c.me.age) <= 3 && Math.abs(p.rank - c.me.rank) <= 60);
      if (next){ c.rival = next; next.isRival = true;
        say(c, 'Une nouvelle rivalité', `${next.name} s'installe durablement à votre niveau. Vous allez beaucoup vous croiser.`, 'info'); }
    }
  }
  World.updateRankings(w);
  checkBadges(c);
  return res;
}

/* Un Grand Chelem ou un grand Masters occupe deux semaines : on fait donc
   avancer le circuit d'autant. */
function endWeek(c, playedTid, extraWeeks){
  const res = oneWeek(c, playedTid);
  for (let i = 0; i < (extraWeeks || 0) && !c.retired; i++){
    const r2 = oneWeek(c, null);
    if (r2.newYear){ res.newYear = true; res.season = r2.season; }
    if (r2.event && !res.event) res.event = r2.event;
  }
  return res;
}

/* ═══════════════ COUPE DAVIS ═══════════════
   Une competition par nations : un seul simple pour vous a chaque tour,
   et le reste de la rencontre depend de vos coequipiers. */

function nationSquad(c, natId){
  return c.world.ranking.filter(p => !p.retired && p.nation.id === natId).slice(0, 4);
}

/* Les huit nations qualifiees, classees par la force de leurs quatre meilleurs. */
function davisNations(c){
  const by = {};
  c.world.ranking.forEach(p => {
    if (p.retired) return;
    const k = p.nation.id;
    if (!by[k]) by[k] = [];
    if (by[k].length < 4) by[k].push(p);
  });
  return Object.keys(by).map(id => ({
    nation: NATIONS.find(n => n.id === id),
    squad: by[id],
    strength: by[id].reduce((s, p) => s + p.points, 0)
  })).sort((a, b) => b.strength - a.strength).slice(0, 8);
}

/* Etes-vous selectionne ? Il faut etre dans les quatre meilleurs du pays. */
function davisSelected(c){
  const sq = nationSquad(c, c.me.nation.id);
  return sq.some(p => p.isHuman);
}

function davisStatus(c, t){
  if (!davisSelected(c)) return 'no';
  const nats = davisNations(c);
  if (!nats.some(n => n.nation.id === c.me.nation.id)) return 'no';
  if (t.davisStage === 'final' && !c.flags.davis_qualified) return 'no';
  return 'direct';
}

function startDavis(c, t){
  const nats = davisNations(c);
  // Si la nation n'est pas dans les huit, on la reconstruit quand meme :
  // le joueur ne doit jamais se retrouver sans equipe.
  const mine = nats.find(n => n.nation.id === c.me.nation.id) || {
    nation: c.me.nation, squad: nationSquad(c, c.me.nation.id), strength: 0
  };
  const others = nats.filter(n => n.nation.id !== c.me.nation.id);
  const rounds = t.davisStage === 'final' ? 2 : 1;

  const st = {
    t, status:'direct', rounds, phase:'davis', davis:true,
    stage: t.davisStage,
    mine, pool: others,
    round: 0, myRoundsWon: 0, out:false, done:false,
    prize:0, pts:0, seeds:{},
    tie:null, ties:[]
  };
  nextTie(c, st);
  c.tour = st;
  return st;
}

function nextTie(c, st){
  // On tire un adversaire parmi les nations restantes, la plus forte d'abord.
  const opp = st.pool.shift() || davisNations(c).find(n => n.nation.id !== c.me.nation.id);
  st.tie = { opp, score:[0,0], mine:[], resolved:false };
}

/* L'adversaire du simple : le meilleur joueur d'en face. */
function davisOpponent(c){
  const st = c.tour;
  if (!st || !st.tie) return null;
  return st.tie.opp.squad.find(p => !p.isHuman) || st.tie.opp.squad[0];
}

/* Un résultat de plus dans les bilans par surface et par catégorie. */
function noteResult(c, surf, tier, won){
  c.recSurf = c.recSurf || { clay:{w:0,l:0}, hard:{w:0,l:0}, grass:{w:0,l:0} };
  c.recTier = c.recTier || {};
  if (c.recSurf[surf]) c.recSurf[surf][won ? 'w' : 'l']++;
  if (!c.recTier[tier]) c.recTier[tier] = { w:0, l:0 };
  c.recTier[tier][won ? 'w' : 'l']++;
}

function resolveDavisTie(c, iWon){
  const st = c.tour, tie = st.tie;
  const opp = davisOpponent(c);

  c.h2h[opp.id] = c.h2h[opp.id] || { w:0, l:0, name:opp.name };
  iWon ? c.h2h[opp.id].w++ : c.h2h[opp.id].l++;
  iWon ? c.me.wins++ : c.me.losses++;
  iWon ? c.seasonLog.w++ : c.seasonLog.l++;
  noteResult(c, st.t.surf, st.t.tier, iWon);
  matchXP(c, opp, iWon);

  if (iWon) tie.score[0]++; else tie.score[1]++;
  tie.mine.push({ label:'Votre simple', txt:`${c.me.name} — ${opp.name}`, won:iWon });

  // Deuxieme simple : votre coequipier contre le leur.
  const mate = st.mine.squad.find(p => !p.isHuman) || st.mine.squad[0];
  const oppMate = st.tie.opp.squad.filter(p => p.id !== opp.id)[0] || opp;
  const w2 = MatchEngine.quickWin(mate, oppMate, st.t.surf);
  if (w2) tie.score[0]++; else tie.score[1]++;
  tie.mine.push({ label:'Deuxième simple', txt:`${mate.name} — ${oppMate.name}`, won:w2 });

  // Le double, decide par la profondeur de l'equipe.
  const depth = a => a.squad.slice(2).reduce((s,p) => s + (p._lvl || 60), 0) / Math.max(1, a.squad.slice(2).length);
  const dm = depth(st.mine) + rand(-4, 4), doo = depth(st.tie.opp) + rand(-4, 4);
  const wd = dm >= doo;
  if (wd) tie.score[0]++; else tie.score[1]++;
  tie.mine.push({ label:'Double', txt:'Paire nationale', won:wd });

  tie.resolved = true;
  const tieWon = tie.score[0] > tie.score[1];
  st.ties.push({ opp: tie.opp.nation, score: tie.score.slice(), won: tieWon, lines: tie.mine.slice() });

  if (!tieWon){
    st.out = true; st.done = true;
    if (st.stage === 'group') c.flags.davis_qualified = false;
    say(c, `Coupe Davis — élimination`,
        `${c.me.nation.name} s'incline ${tie.score[1]}–${tie.score[0]} contre ${tie.opp.nation.name}. L'aventure s'arrête là.`, 'bad');
    c.moral = clamp(c.moral - 6, 0, 100);
    return;
  }

  st.myRoundsWon++;
  st.round++;
  c.moral = clamp(c.moral + 7, 0, 100);
  c.rep = clamp(c.rep + 2, 0, 100);

  if (st.round >= st.rounds){
    st.done = true;
    if (st.stage === 'group'){
      c.flags.davis_qualified = true;
      say(c, `Coupe Davis — qualifiés`,
          `${c.me.nation.name} passe la phase de groupes. Rendez-vous en fin de saison pour la phase finale.`, 'good');
    } else {
      c.davis++;
      c.flags.davis_qualified = false;
      say(c, `COUPE DAVIS REMPORTÉE`,
          `${c.me.nation.name} remporte la Coupe Davis. Une victoire qui ne rapporte pas un point au classement et qu'on vous rappellera toute votre vie.`, 'good');
      c.moral = clamp(c.moral + 20, 0, 100);
      c.rep = clamp(c.rep + 10, 0, 100);
    }
    const prize = TIERS.davis.prize[Math.min(st.myRoundsWon, 3)] || 0;
    c.money += prize; c.earned += prize; st.prize = prize;
    return;
  }
  nextTie(c, st);
}

/* ───────────── Avance rapide ─────────────
   L'utilisateur choisit combien de semaines passer. On s'arrete des que
   quelque chose mérite son attention. */
const FF_STOPS = {
  all:    0,     // on joue tout soi-meme
  big:    8,     // on s'arrete pour les Masters 1000 et au-dessus
  majors: 10,    // on ne s'arrete que pour les Grands Chelems
  none:   99     // on ne s'arrete jamais pour un tournoi
};

/* Ce match mérite-t-il qu'on rende la main au joueur ?
   Demi-finale ou finale d'un Grand Chelem, du Masters ou d'un Masters 1000,
   et rencontre décisive de Coupe Davis. */
function isBigMatch(c, st){
  if (st.davis) return st.stage === 'final';
  if (st.phase !== 'main') return false;
  const left = st.rounds - st.myRoundsWon, tier = st.t.tier, r = c.me.rank || 999;
  if (tier === 'slam')     return left <= 3;   // quart, demie, finale
  if (tier === 'olympics') return left <= 2;
  if (tier === 'finals')   return left <= 2;
  if (tier === 'm1000')    return left <= 2;   // demie, finale
  if (tier === 'atp500')   return left <= 1;
  if (tier === 'atp250')   return left <= 1 && r > 25;
  // Pour un joueur du circuit secondaire, une finale de Challenger est
  // le match de sa vie : elle mérite qu'on la joue.
  if (tier === 'ch125' || tier === 'ch75') return left <= 1 && r > 150;
  // Et pour qui n'a jamais rien gagne, une premiere finale ITF est un evenement.
  if (tier === 'itf25' || tier === 'itf15') return left <= 1 && r > 400;
  return false;
}

function quickTournament(c, t, status, opt){
  opt = opt || {};
  // On peut reprendre un tournoi laissé en plan après un match joué à la main.
  const st = (c.tour && c.tour.t.id === t.id && !c.tour.done)
    ? c.tour
    : ((t.tier === 'davis') ? startDavis(c, t) : startTournament(c, t, status));
  let guard = 0;
  while (!st.done && guard++ < 24){
    const opp = st.davis ? davisOpponent(c) : myOpponent(c);
    if (!opp){ resolveRound(c, true); continue; }
    if (opt.stopOnBig && isBigMatch(c, st)) return { st, pause:true, opp };
    const won = MatchEngine.quickWin(c.me, opp, t.surf);
    const mins = (TIERS[t.tier].bo5 && c.me.gender !== 'w') ? 150 : 95;
    c.fitness = clamp(c.fitness - matchCost(mins), 0, 100);
    matchWear(c, mins, t.surf);
    if (st.davis) resolveDavisTie(c, won); else resolveRound(c, won);
  }
  return { st, pause:false };
}

function fastForward(c, weeks, opt){
  opt = opt || {};
  const stopAt = FF_STOPS[opt.stopAt || 'big'];
  const log = [];
  let done = 0;

  for (let i = 0; i < weeks; i++){
    if (c.retired) break;

    // L'avance rapide s'inscrit toute seule aux tournois adaptes, sauf si
    // le joueur a deja planifie sa semaine depuis le calendrier.
    if (opt.autoEnter !== false && !isInjured(c) && !entryFor(c, c.world.week)){
      const best = bestFit(c, c.world.week);
      if (best && c.fitness > (opt.minFit != null ? opt.minFit : 42))
        enter(c, c.world.week, best.t.id);
    }

    const wk = beginWeek(c);

    if (wk.type === 'injured'){
      rehabWeek(c);
      const ri = endWeek(c, null);
      log.push({ week: c.world.week, txt: `Rééducation (${wk.weeks} sem. restantes)` });
      done++;
      if (ri.newYear) return { stop:'season', season:ri.season, log, done };
      continue;
    }

    if (wk.type === 'tournament'){
      const prio = TIERS[wk.t.tier].prio;
      if (prio >= stopAt){
        c.tour = null;
        return { stop:'tournament', t: wk.t, log, done };
      }
      const st = quickTournament(c, wk.t, wk.status).st;
      const res = st.davis
        ? (st.out ? 'éliminé' : 'qualifié')
        : (st.out ? (st.phase === 'quali' ? 'sorti en qualifs' : `${st.myRoundsWon} tour(s)`) : 'VAINQUEUR');
      log.push({ week: c.world.week, txt: `${wk.t.name} — ${res}`,
                 pts: st.pts, prize: st.prize, good: !st.out });
      const tid = wk.t.id;
      c.tour = null;
      clearEntry(c, c.world.week);
      const r = endWeek(c, tid, (wk.t.span || 1) - 1);
      done += (wk.t.span || 1);
      if (c.me.injury && isInjured(c)) return { stop:'injury', log, done };
      if (r.event) return { stop:'event', event:r.event, log, done };
      if (r.newYear) return { stop:'season', season:r.season, log, done };
      continue;
    }

    // Semaine libre : on applique le programme choisi.
    const tr = opt.training || (c.fitness < 55 ? 'rest' : 'ground');
    train(c, tr, opt.intensity || 'normal');
    const r = endWeek(c, null);
    done++;
    log.push({ week: c.world.week, txt: (TRAININGS.find(x => x.id === tr) || {}).name || 'Travail' });
    if (c.me.injury && isInjured(c)) return { stop:'injury', log, done };
    if (r.event) return { stop:'event', event:r.event, log, done };
    if (r.newYear) return { stop:'season', season:r.season, log, done };
  }
  return { stop:null, log, done };
}

/* ═══════════════ MODE EXPRESS ═══════════════
   Une saison se joue en un plan et quelques matchs. Le reste du circuit
   tourne exactement comme en mode complet : mêmes tournois, même
   classement, mêmes blessures — simplement, on ne clique plus 46 fois. */

function expressBegin(c, plan, training){
  c.express = {
    plan: plan || 'points',
    training: training || 'ground',
    keyCount: 0, maxKeys: 3,
    year: c.world.year,
    log: []
  };
}

/* Faut-il s'inscrire à ce tournoi, compte tenu du plan de l'année ? */
function expressWants(c, x){
  const ex = c.express, pl = SEASON_PLANS.find(p => p.id === ex.plan) || SEASON_PLANS[0];
  const t = x.t, tier = TIERS[t.tier];
  if (t.tier === 'davis' || t.tier === 'olympics') return true;   // on ne refuse pas son pays
  if (c.fitness < pl.restFit) return false;
  if (pl.majorsOnly && !t.major && tier.prio < 5) return R() < 0.25;
  if (pl.surfaceFocus && t.surf !== bestSurf(c) && !t.major) return R() < 0.20;
  return R() < pl.freq;
}

/* Avance jusqu'à ce que le joueur ait quelque chose à décider. */
function expressAdvance(c){
  const ex = c.express;
  if (!ex) return { type:'needPlan' };
  // Un choix narratif interrompu par un rechargement est reproposé, pas escamoté.
  if (c.pendingEvent){
    const pe = EVENTS.find(x => x.id === c.pendingEvent);
    if (pe) return { type:'event', event:pe };
    c.pendingEvent = null;
  }
  let guard = 0;

  while (guard++ < 400){
    if (c.retired || c.me.age > BAL.ageMax) return { type:'careerEnd' };

    /* Un tournoi laissé en plan (match clé joué) : on le termine.
       Le match clé peut avoir clos le tournoi — défaite, ou finale gagnée. Dans ce cas
       il n'y a plus rien à jouer, mais il reste tout à ranger : sans passer par ce bloc,
       l'inscription de la semaine survivait et le tournoi était intégralement rejoué. */
    /* Garde de fraîcheur : un c.tour qui ne correspond plus à l'inscription de la
       semaine est un résidu (renoncement, bascule de mode, rechargement au mauvais
       moment). Le traiter ici créditait ses points sur la mauvaise semaine. */
    if (c.tour && entryFor(c, c.world.week) !== c.tour.t.id && c.tour.done) c.tour = null;
    if (c.tour){
      const r = c.tour.done
        ? { st: c.tour, pause:false }
        : quickTournament(c, c.tour.t, c.tour.status, { stopOnBig: ex.keyCount < ex.maxKeys });
      if (r.pause){
        return { type:'keyMatch', t:c.tour.t, st:r.st, opp:r.opp }; }
      ex.log.push(expressLine(c, r.st));
      const tid = c.tour.t.id, span = (c.tour.t.span || 1) - 1;
      c.tour = null; clearEntry(c, c.world.week);
      const res = endWeek(c, tid, span);
      if (res.newYear) return { type:'seasonEnd', season:res.season, log:ex.log };
      if (res.event)   return { type:'event', event:res.event };
      continue;
    }

    const wk = beginWeek(c);

    if (wk.type === 'injured'){
      rehabWeek(c);
      const res = endWeek(c, null);
      if (res.newYear) return { type:'seasonEnd', season:res.season, log:ex.log };
      continue;
    }

    if (wk.type === 'tournament'){
      const r = quickTournament(c, wk.t, wk.status, { stopOnBig: ex.keyCount < ex.maxKeys });
      if (r.pause){
        return { type:'keyMatch', t:wk.t, st:r.st, opp:r.opp }; }
      ex.log.push(expressLine(c, r.st));
      const tid = wk.t.id, span = (wk.t.span || 1) - 1;
      c.tour = null; clearEntry(c, c.world.week);
      const res = endWeek(c, tid, span);
      if (res.newYear) return { type:'seasonEnd', season:res.season, log:ex.log };
      if (res.event)   return { type:'event', event:res.event };
      continue;
    }

    /* Semaine libre : on s'inscrit, on travaille, ou on donne des cours. */
    const best = bestFit(c, c.world.week);
    if (best && expressWants(c, best)){
      enter(c, c.world.week, best.t.id);
      continue;
    }
    const pl = SEASON_PLANS.find(p => p.id === ex.plan) || SEASON_PLANS[0];
    // L'axe est résolu chaque semaine, pas une fois pour l'année : « Ma faiblesse »
    // suit donc réellement l'attribut le plus en retard au fil de la saison.
    const tr = c.fitness < 42 ? 'rest'
             : (pl.teach && c.money < 0.05 && R() < 0.5) ? 'lessons'
             : trainingForAxis(c, ex.training);
    train(c, tr, 'normal');
    const res = endWeek(c, null);
    if (res.newYear) return { type:'seasonEnd', season:res.season, log:ex.log };
    if (res.event)   return { type:'event', event:res.event };
  }
  return { type:'seasonEnd', season:null, log:ex.log };
}

function expressLine(c, st){
  const t = st.t, tier = TIERS[t.tier];
  if (st.davis) return { name:t.name, res: st.out ? 'éliminés' : 'qualifiés', good:!st.out, pts:0, surf:t.surf };
  const left = st.rounds - st.myRoundsWon;
  const res = st.out
    ? (st.phase === 'quali' ? 'qualifications'
      : left === 1 ? 'finale' : left === 2 ? 'demi-finale' : left === 3 ? 'quart'
      : `${st.myRoundsWon} tour${st.myRoundsWon>1?'s':''}`)
    : 'VAINQUEUR';
  return { name:t.name, tier:tier.short, res, good:!st.out || left <= 2,
           pts:st.pts, prize:st.prize, surf:t.surf };
}

/* Le joueur a joué son match clé : on inscrit le résultat et on repart.
   Le quota de matchs clés se décompte ICI, à la rencontre jouée, et non au moment où
   elle est proposée : sinon un simple rechargement de page sur l'écran du match en
   consommait un, et trois F5 suffisaient à brûler la saison entière. */
function expressResolveKey(c, won){
  const st = c.tour;
  if (!st) return;
  if (c.express) c.express.keyCount = (c.express.keyCount || 0) + 1;
  if (st.davis) resolveDavisTie(c, won); else resolveRound(c, won);
}

/* ───────────── Fin de saison ───────────── */
/* Faut-il envisager d'arreter ? Le jeu ne decide pas a votre place, mais il
   pose la question quand elle devient legitime. */
function retirementPressure(c){
  const age = c.me.age, body = bodyAvg(c), rank = c.me.rank || 2000;
  if (age < 29) return null;
  const reasons = [];
  if (body < 45){
    const zones = BODY_PARTS.filter(b => c.body[b.k] < 45)
      .sort((a2, b2) => c.body[a2.k] - c.body[b2.k]).slice(0, 3)
      .map(b => b.name.toLowerCase());
    reasons.push('Votre corps ne suit plus : ' + zones.join(', ') + '.');
  }
  if (rank > 300 && age >= 31) reasons.push(`Vous êtes ${rank}e mondial et les invitations se raréfient.`);
  if (c.money < -0.05) reasons.push('Vos finances ne supportent plus une saison de plus.');
  if (age >= 35) reasons.push(`À ${age} ans, chaque saison est un sursis.`);
  if (!reasons.length) return null;
  return { age, reasons, forced: age >= BAL.ageMax };
}

/* Comment la presse a résumé votre année. */
/* La presse commente chaque saison. La cascade va du plus spécifique au plus banal,
   et se termine désormais par une manchette « saison quelconque » : avant, une année
   moyenne — le cas le plus fréquent d'une carrière — n'affichait rien du tout. */
function seasonHeadline(c, s){
  const prev = c.seasons.length ? c.seasons[c.seasons.length-1] : null;
  const rang = c.me.rank || 9999;

  if (s.titles.some(t => /Melbourne|Paris|Londres|New York/.test(t)) || rang === 1)
    return pick(HEADLINES.great);
  if (s.titles.length >= 2 || (c.me.rank && rang <= 20))
    return pick(HEADLINES.good);
  if ((c.seasonLog.injWeeks || 0) >= 9) return pick(HEADLINES.injury);

  if (!prev) return pick(HEADLINES.rookie);
  if (prev.rank && rang <= prev.rank / 2.5 && rang < 400) return pick(HEADLINES.comeback);
  if (prev.rank && prev.rank <= 60 && rang > prev.rank * 2.5) return pick(HEADLINES.collapse);
  if (c.me.age >= 32) return pick(HEADLINES.twilight);

  // Une surface nettement au-dessus des deux autres, sur un volume suffisant.
  const rs = c.recSurf;
  if (rs){
    const t = k => rs[k].w + rs[k].l, pct = k => t(k) ? rs[k].w / t(k) : 0;
    const tri = ['clay','hard','grass'].filter(k => t(k) >= 20).sort((a,b) => pct(b) - pct(a));
    if (tri.length >= 2 && pct(tri[0]) - pct(tri[tri.length-1]) >= 0.22)
      return pick(HEADLINES.surface);
  }
  if (s.titles.length && rang > 150) return pick(HEADLINES.small);
  if (!s.titles.length && (s.prize || 0) > 0.9) return pick(HEADLINES.money);
  if (prev && rang > prev.rank * 1.6) return pick(HEADLINES.poor);
  return pick(HEADLINES.avg);
}

/* Les distinctions de fin d'année, décernées par le circuit. */
function seasonAwards(c, s){
  const out = [], prev = c.seasons.length ? c.seasons[c.seasons.length-1] : null;
  if (c.me.rank === 1) out.push('no1_year');
  if (prev && c.me.rank <= 80 && prev.rank > 130) out.push('breakthrough');
  if (prev && c.me.rank <= 120 && prev.rank > 220 && c.me.age >= 25) out.push('comeback');
  if (c.rep > 58 && R() < 0.30) out.push('fanfav');
  if (c.disc > 66 && R() < 0.25) out.push('sportsman');
  out.forEach(k => say(c, `${AWARDS[k].icon} ${AWARDS[k].name}`,
    `Le circuit vous décerne cette distinction pour la saison ${s.year}.`, 'good'));
  return out;
}

function endSeason(c){
  const w = c.world, me = c.me;
  const s = {
    year: w.year - 1,          // l'annee vient d'etre incrementee par advance()
    age: me.age, rank: me.rank, points: me.points,
    w: c.seasonLog.w, l: c.seasonLog.l,
    titles: c.seasonLog.titles.slice(), prize: c.seasonLog.prize,
    surfs: (c.seasonLog.surfs || []).slice(),
    injuries: c.seasonLog.injuries || 0, injWeeks: c.seasonLog.injWeeks || 0,
    // Photographie de fin de saison : c'est ce qui permettra de tracer les courbes.
    attrs: Object.assign({}, me.attrs),
    level: Math.round(World.refreshLevel(me) * 10) / 10,
    body: Math.round(bodyAvg(c)), rep: Math.round(c.rep),
    money: Math.round(c.money * 1000) / 1000
  };
  /* Le titre de presse de la saison, et les distinctions individuelles. */
  s.headline = seasonHeadline(c, s);
  s.awards = seasonAwards(c, s);
  c.awards = c.awards || {};
  s.awards.forEach(k => {
    c.awards[k] = (c.awards[k] || 0) + 1;
    applyFx(c, AWARDS[k].fx);
  });

  c.seasons.push(s);
  if (me.rank === 1){ c.yearEndNo1++; c.weeksNo1 += ri(26, W_SAFE()); }
  else if (c.prevYearRank === 1) c.weeksNo1 += ri(4, 20);
  if (me.rank <= 10) c.top10Seasons++;
  c.prevYearRank = me.rank;
  /* Objectif de la saison écoulée */
  const ob = c.objective;
  if (ob && ob.year === s.year){
    const ok = objectiveDone(c);
    s.objective = { label: ob.label, ok };
    if (ok){
      c.money += ob.reward; c.earned += ob.reward;
      c.moral = clamp(c.moral + 12, 0, 100);
      say(c, `Objectif atteint — ${ob.label}`,
          `Prime de ${money(ob.reward)} versée. L'équipe respire.`, 'good');
    } else {
      c.moral = clamp(c.moral - 10, 0, 100);
      say(c, `Objectif manqué — ${ob.label}`,
          `Pas de prime, et des conversations difficiles en perspective.`, 'bad');
    }
  }
  c.objective = null;

  /* Où en est le rival ? */
  const rv = c.rival;
  if (rv && !rv.retired){
    const d = (c.me.rank || 1600) - (rv.rank || 1600);
    const pool = d > 60 ? RIVAL_NEWS.ahead : d < -60 ? RIVAL_NEWS.behind : RIVAL_NEWS.close;
    s.rivalNews = pick(pool).replace('{rival}', rv.name);
  }

  c.seasonLog = { w:0, l:0, pts:0, prize:0, titles:[], surfs:[], injuries:0, injWeeks:0 };

  me.age++;
  me.peak = me.peak || 26;
  /* Déclin après le pic. Il est plafonné : un joueur de 36 ans a perdu de la
     vitesse, il n'est pas devenu immobile. Le mental, lui, continue de monter —
     mais il bute sur le même plafond de talent que le reste, sinon tout le monde
     finit à 99 et l'attribut cesse de distinguer les joueurs. */
  if (me.age > me.peak){
    const d = Math.min(3.0, (me.age - me.peak) * 0.42);
    me.attrs.spd = clamp(me.attrs.spd - d * 1.10, 38, 99);
    me.attrs.sta = clamp(me.attrs.sta - d * 1.00, 38, 99);
    me.attrs.fh  = clamp(me.attrs.fh  - d * 0.70, 35, 99);
    me.attrs.bh  = clamp(me.attrs.bh  - d * 0.70, 35, 99);
    me.attrs.ret = clamp(me.attrs.ret - d * 0.50, 35, 99);
    me.attrs.vol = clamp(me.attrs.vol - d * 0.30, 35, 99);
    me.attrs.srv = clamp(me.attrs.srv - d * 0.25, 35, 99);
    const menRoom = clamp((effPot(c) + ATTR_MARGE - me.attrs.men) / 9, 0, 1);
    me.attrs.men = clamp(me.attrs.men + 0.35 * menRoom, 20, 99);
    BODY_PARTS.forEach(b => { c.body[b.k] = clamp(c.body[b.k] - d * 0.9, 0, 100); });
  }
  World.refreshLevel(me);

  // Notoriété
  // On oublie vite un joueur, mais jamais completement : plancher a 5.
  const repGain = clamp((70 - me.rank) * 0.07, -2, 9)
    + (c.seasonLog.titles ? 0 : 0) + (c.traits.includes('showman') ? 4 : 0);
  c.rep = clamp(c.rep + repGain, 5, 100);

  // Contrats de sponsoring
  c.sponsors = c.sponsors.filter(sp => { sp.years--; return sp.years > 0; });

  say(c, `Bilan ${s.year}`,
      `Vous terminez la saison à la ${s.rank}e place mondiale avec ${s.points} points. ` +
      `${s.w} victoires, ${s.l} défaites, ${s.titles.length} titre${s.titles.length>1?'s':''}. ` +
      `${money(s.prize)} de gains en tournoi.`, 'info');
  return s;
}
function W_SAFE(){ return World.W; }

/* ───────────── Score final ───────────── */
function careerScore(c){
  const t = c.me.titles;
  let sc = t.slam*24 + t.finals*12 + t.m1000*6.5 + t.atp500*3 + t.atp250*1.6
         + t.ch*0.35 + t.itf*0.08
         + c.yearEndNo1*16 + c.weeksNo1*0.10
         + c.davis*7 + c.medals*4
         + Math.max(0, 100 - (c.me.bestRank||2400)) * 0.34
         + c.me.wins * 0.045
         + c.top10Seasons * 3;
  if (hasCareerSlam(c)) sc += 25;
  sc += Math.max(0, World.levelOf(c.me) - 55) * 0.35;
  return Math.round(sc);
}
function hasCareerSlam(c){
  const set = new Set(c.me.slams.map(s => s.name));
  return ['Melbourne','Paris','Londres','New York'].every(n => set.has(n));
}
function tierFor(score){ return SCORE_TIERS.find(t => score >= t.min) || SCORE_TIERS[SCORE_TIERS.length-1]; }
function percentile(score){
  let p = 0;
  for (let i = 0; i < SCORE_PERCENTILES.length && score >= SCORE_PERCENTILES[i]; i++) p = i+1;
  return p;
}

/* ───────────── Effets narratifs ───────────── */
function applyFx(c, fx){
  if (!fx) return [];
  const log = [], me = c.me;
  /* Un gain narratif reste soumis au plafond, comme l'entraînement et les matchs :
     sans ça, les événements suffisaient à emmener un attribut à 99 quel que soit le
     talent — c'est ce qui donnait 99 de mental à tout le monde, puisque les trois
     quarts de la progression mentale venaient de là. Les malus, eux, mordent toujours
     à pleine force. `add` renvoie le gain réellement obtenu : on affiche celui-là et
     non la valeur nominale, sinon le jeu annoncerait des points qu'il ne donne pas. */
  const add = (k, v) => {
    const room = v > 0 ? clamp((effPot(c) + ATTR_MARGE - me.attrs[k]) / 9, 0, 1) : 1;
    const before = me.attrs[k];
    me.attrs[k] = clamp(me.attrs[k] + v * room, 20, 99);
    return me.attrs[k] - before;
  };
  const push = (label, v, unit) => log.push({ label, v, unit: unit || '' });

  for (const k in fx){
    const v = fx[k];
    switch (k){
      case 'f':  push('Fond de court', Math.max(add('fh', v), add('bh', v))); break;
      case 's':  push('Service', add('srv', v)); break;
      case 'p':  push('Physique', Math.max(add('spd', v), add('sta', v))); break;
      case 'm':  push('Mental', add('men', v)); break;
      case 'srv': case 'ret': case 'fh': case 'bh': case 'vol': case 'spd': case 'sta': case 'men':
        push(ATTRS.find(a => a.k === k).name, add(k, v)); break;
      case 'rep':  c.rep  = clamp(c.rep + v, 0, 100);  push('Notoriété', v); break;
      case 'mor':  c.moral= clamp(c.moral + v, 0, 100);push('Moral', v); break;
      case 'form': c.fitness = clamp(c.fitness + v, 0, 100); push('Fraîcheur', v); break;
      case 'disc': c.disc = clamp(c.disc + v, 0, 100); push('Discipline', v); break;
      case 'body': BODY_PARTS.forEach(b => c.body[b.k] = clamp(c.body[b.k] + v, 0, 100));
                   push('État du corps', v); break;
      case 'money': c.money += v; if (v>0) c.earned += v;
                    log.push({ label:'', v, unit:'money' }); break;
      case 'inj': {
        const part = weakestPart(c);
        c.me.injuredUntil = c.world.absWeek + v;
        c.me.injury = { part:part.k, name:part.name, level:'strain', label:'Blessure', weeks:v, total:v };
        log.push({ label:'Indisponibilité', v, unit:' sem.' }); break; }
      case 'clay': case 'hard': case 'grass':
        me.surf[k] = clamp(me.surf[k] + v, -16, 16);
        push(SURFACES[k].short, v); break;
      case 'bestSurf': { const b = bestSurf(c); me.surf[b] = clamp(me.surf[b]+v,-16,16); push(SURFACES[b].short, v); break; }
      case 'worstSurf': { const b = worstSurf(c); me.surf[b] = clamp(me.surf[b]+v,-16,16); push(SURFACES[b].short, v); break; }
      case 'otherSurf': { const b = bestSurf(c);
        ['clay','hard','grass'].forEach(k2 => { if (k2!==b) me.surf[k2] = clamp(me.surf[k2]+v,-16,16); });
        push('Autres surfaces', v); break; }
      case 'trait':
        if (!c.traits.includes(v) && TRAITS[v]){ c.traits.push(v);
          log.push({ label: TRAITS[v].icon + ' ' + TRAITS[v].name, v:0, unit:'trait' }); }
        break;
      case 'flag': c.flags[v] = true; if (v === 'medal') c.medals++; break;
      /* Un avantage psychologique pris sur le rival : il compte vraiment. */
      case 'h2h':
        if (c.rival){
          const k2 = c.rival.id;
          c.h2h[k2] = c.h2h[k2] || { w:0, l:0, name:c.rival.name };
          c.h2h[k2].w += v;
          log.push({ label:'Ascendant sur ' + c.rival.name, v, unit:'h2h' });
        }
        break;
      case 'clutchRival':
        c.clutchVsRival = (c.clutchVsRival || 0) + v;
        push('Sang-froid face au rival', v); break;
      /* Un bonus (ou malus) de points appliqué au total de la saison. */
      case 'pts':
        c.ptsBonus = (c.ptsBonus || 0) + v;
        log.push({ label:'Points de la saison', v: Math.round(v*100), unit:' %' });
        break;
      case 'retire': c.flags.wants_retire = true; break;
    }
  }
  World.refreshLevel(me);
  return log;
}
function bestSurf(c){ return ['clay','hard','grass'].sort((a,b) => c.me.surf[b]-c.me.surf[a])[0]; }
function worstSurf(c){ return ['clay','hard','grass'].sort((a,b) => c.me.surf[a]-c.me.surf[b])[0]; }

/* ───────────── Événements narratifs, déclenchés par le contexte ───────────── */
function eligibleEvent(c, e){
  const q = e.cond || {}, rank = c.me.rank, age = c.me.age;
  if (c.usedEvents.includes(e.id)) return false;
  if (q.aMin != null && age < q.aMin) return false;
  if (q.aMax != null && age > q.aMax) return false;
  if (q.rMin != null && rank < q.rMin) return false;
  if (q.rMax != null && rank > q.rMax) return false;
  if (q.minMor != null && c.moral < q.minMor) return false;
  if (q.maxMor != null && c.moral > q.maxMor) return false;
  if (q.minRep != null && c.rep < q.minRep) return false;
  if (q.maxForm != null && c.fitness > q.maxForm) return false;
  if (q.maxDisc != null && c.disc > q.maxDisc) return false;
  if (q.flag != null && !c.flags[q.flag]) return false;
  if (q.noFlag != null && c.flags[q.noFlag]) return false;
  return true;
}
function pickEvent(c){
  const pool = EVENTS.filter(e => eligibleEvent(c, e));
  if (!pool.length) return null;
  const total = pool.reduce((s,e) => s + (e.w||1), 0);
  let r = R() * total;
  // On note l'événement en attente : s'il est tiré puis que la page est rechargée avant
  // que le joueur ait choisi, il doit lui être reproposé — sinon usedEvents l'interdit à vie.
  for (const e of pool){ r -= (e.w||1);
    if (r <= 0){ c.usedEvents.push(e.id); c.pendingEvent = e.id; return e; } }
  return null;
}
function resolveOption(c, opt){
  // L'événement est traité : l'invariant appartient ici, pas à l'écran qui l'affiche.
  // expressAdvance renvoie {type:'event'} tant que pendingEvent est posé, donc tout
  // appelant qui oublierait de le lever figerait le mode Express en boucle.
  c.pendingEvent = null;
  const total = opt.outcomes.reduce((s,o) => s + o.weight, 0);
  let r = R() * total, out = opt.outcomes[opt.outcomes.length-1];
  for (const o of opt.outcomes){ r -= o.weight; if (r <= 0){ out = o; break; } }
  const texte = String(out.text)
    .replace(/\{rival\}/g, c.rival ? c.rival.name : '')
    .replace(/\{nation\}/g, c.me.nation.name)
    .replace(/\{rang\}/g, '#' + c.me.rank).replace(/\{age\}/g, c.me.age);
  return { text: texte, log: applyFx(c, out.fx) };
}

/* ───────────── Badges ───────────── */
function checkBadges(c){
  const t = c.me.titles, got = [];
  const yes = id => { if (!c.badges.includes(id)){ c.badges.push(id); got.push(id); } };
  const atp = t.slam + t.finals + t.m1000 + t.atp500 + t.atp250;
  const bySlamYear = {};
  c.me.slams.forEach(s => { bySlamYear[s.year] = (bySlamYear[s.year]||0)+1; });

  if (c.me.wins > 0) yes('first_pro');
  if (c.me.bestRank <= 100) yes('top100');
  if (c.seasons.some(s => s.rank <= 100 && s.age < 20)) yes('top100_20');
  if (atp >= 1)  yes('first_atp');
  if (atp >= 10) yes('title_10');
  if (atp >= 30) yes('title_30');
  if (t.m1000 >= 1) yes('m1000_first');
  if (t.m1000 >= 5) yes('m1000_5');
  if (t.finals >= 1) yes('finals_win');
  if (t.slam >= 1)  yes('slam_first');
  if (t.slam >= 3)  yes('slam_3');
  if (t.slam >= 10) yes('slam_10');
  if (t.slam >= 20) yes('slam_20');
  if (hasCareerSlam(c)) yes('career_slam');
  if (Object.values(bySlamYear).some(v => v >= 4)) yes('slam_year');
  if (c.me.slams.some(s => s.age < 21)) yes('slam_young');
  if (c.me.slams.some(s => s.age > 33)) yes('slam_old');
  if (c.me.bestRank === 1) yes('no1');
  if (c.yearEndNo1 >= 1) yes('no1_year');
  if (c.weeksNo1 >= 100) yes('no1_100w');
  if (c.top10Seasons >= 5) yes('top10_5y');
  if (c.medals >= 1) yes('olympic');
  if (c.davis >= 1) yes('davis');
  if (c.me.surf.clay  >= 12) yes('clay_king');
  if (c.me.surf.grass >= 12) yes('grass_king');
  if (c.me.surf.hard  >= 12) yes('hard_king');
  if (c.me.wins >= 500)  yes('wins500');
  if (c.me.wins >= 1000) yes('wins1000');
  if (c.me.age >= 37) yes('long');
  if (c.earned >= 50) yes('rich');
  if (t.slam >= 1 && c.me.pot < 75) yes('underdog');
  if (c.seasons.some(s => s.rank > 300) && c.me.bestRank <= 10) yes('phoenix');
  if (c.retired && (!c.me.bestRank || c.me.bestRank > 100)) yes('zero');
  if (c.seasons.some(s => (s.surfs||[]).length >= 3)) yes('triple');
  if (hasCareerSlam(c) && c.medals >= 1) yes('golden_slam');
  const rv = c.h2h[c.rival.id];
  if (rv && rv.w >= 10 && rv.l === 0) yes('nemesis');
  return got;
}

return { create, money, say, unread, staffOf, staffFx, weeklyCost, canHire, effPot,
         checkDette, DETTE_STAFF, DETTE_FIN,
         applyStaffPack, currentStaffPack, trainingForAxis,
         bodyAvg, weakestPart, stressBody, healBody, rollInjury, isInjured, injuryWeeksLeft,
         train, rehabWeek, weekEconomy, sponsorOffers, matchXP,
         eligibleTournaments, bestFit, fitOf, enter, entryFor, clearEntry, defending,
         startTournament, myOpponent, roundName, resolveRound, finishTournament,
         startDavis, davisOpponent, resolveDavisTie, davisStatus, davisNations,
         nationSquad, davisSelected, fastForward, quickTournament, seedOf, FF_STOPS,
         buildMainDraw, makeQualiOpponent,
         beginWeek, endWeek, matchCost, matchWear, endSeason,
         expressBegin, expressAdvance, expressResolveKey, isBigMatch,
         scout, makeObjective, objectiveDone, retirementPressure, clutchAgainst, noteResult,
         seasonHeadline, seasonAwards, careerScore, hasCareerSlam, tierFor, percentile,
         applyFx, pickEvent, resolveOption, checkBadges, bestSurf, worstSurf };
})();
