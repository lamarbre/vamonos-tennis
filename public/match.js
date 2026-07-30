/* ══════════════════════════════════════════════════════════════════════════
   VAMONOS TENNIS — Moteur de match
   Les points sont simulés un par un en interne (ce qui produit des
   statistiques réalistes), mais l'interface avance jeu par jeu.
   ══════════════════════════════════════════════════════════════════════════ */

const MatchEngine = (() => {

const clamp = (v,a,b) => v<a?a:v>b?b:v;
const R = () => Math.random();
const ri = (a,b) => Math.floor(a + R()*(b-a+1));

/* ───────────── Indices de jeu dérivés des attributs ───────────── */
function idx(p){
  const a = p.attrs;
  return {
    srv:   0.70*a.srv + 0.30*a.fh,
    ret:   0.68*a.ret + 0.20*a.bh + 0.12*a.spd,
    rally: 0.38*a.fh + 0.30*a.bh + 0.32*a.spd,
    net:   a.vol,
    stam:  a.sta,
    men:   a.men
  };
}

function surfAff(p, s){
  let v = (p.surf && p.surf[s]) || 0;
  return clamp(v, -14, 14);
}

/* ───────────── Création d'un match ───────────── */
function create(a, b, opt){
  opt = opt || {};
  const bo5 = !!opt.bo5;
  const m = {
    surface: opt.surface || 'hard',
    bo5, setsToWin: bo5 ? 3 : 2,
    tournament: opt.tournament || '', round: opt.round || '',
    p: [a, b],
    ix: [idx(a), idx(b)],
    tac: [opt.tacticA || 'balanced', opt.tacticB || 'balanced'],
    sets: [],                 // [{g:[gA,gB], tb:[x,y]|null}]
    g: [0, 0],               // jeux du set en cours
    pt: [0, 0],              // points du jeu en cours (index 0..3 = 0/15/30/40, puis avantage)
    tb: null,                // tie-break en cours : {pts:[a,b], first:server}
    server: opt.server !== undefined ? opt.server : (R() < .5 ? 0 : 1),
    setsWon: [0, 0],
    fatigue: [opt.fatigueA || 0, opt.fatigueB || 0],
    momentum: 0,             // -1 (pour B) .. +1 (pour A)
    points: 0,
    stats: [blank(), blank()],
    feed: [],                // fil de match
    over: false, winner: null, retired: null,
    minutes: 0,
    setStartGames: 0,
    /* Moments de decision : le match s'arrete quelques fois, aux points qui
       comptent vraiment, pour laisser le joueur choisir ce qu'il tente. */
    clutchBonus: opt.clutchBonus || 0,   // ascendant psychologique acquis hors match
    moment: null, momentsUsed: 0,
    maxMoments: opt.interactive === false ? 0 : (bo5 ? 4 : 3),
    momentLog: [],
    g_: null
  };
  m.feed.push({ t:'head', txt:`${a.name} — ${b.name}`, sub:`${opt.round||''}${opt.tournament?' · '+opt.tournament:''}` });
  m.feed.push({ t:'info', txt:`${m.p[m.server].name} au service pour commencer.` });
  return m;
}

function blank(){
  return { aces:0, df:0, in1:0, srv1:0, won1:0, srv2:0, won2:0,
           bpFaced:0, bpSaved:0, bpChance:0, bpWon:0,
           winners:0, ue:0, pts:0, games:0, rallyLen:0, rallies:0 };
}

/* ───────────── Probabilité qu'un point soit gagné par le serveur ───────────── */
function tacOf(id){ return (TACTICS.find(t => t.id === id) || TACTICS[0]).fx; }

function servePointProb(m, s, big){
  const r = 1 - s;
  const S = m.ix[s], Rr = m.ix[r];
  const ts = tacOf(m.tac[s]), tr = tacOf(m.tac[r]);

  // La fatigue ronge surtout le jeu de fond de court.
  const fs = m.fatigue[s], fr = m.fatigue[r];
  const rallyS = S.rally * (1 - fs * 0.0030) + surfAff(m.p[s], m.surface) * 0.35;
  const rallyR = Rr.rally * (1 - fr * 0.0030) + surfAff(m.p[r], m.surface) * 0.35;

  /* Calibration : sur ~150 points, un minuscule avantage par point devient un
     énorme avantage de match. Les coefficients ci-dessous sont réglés pour que
     le taux de victoire colle à celui utilisé pour le reste du circuit
     (écart de 3 niveaux ≈ 68 %, de 6 ≈ 81 %, de 10 ≈ 92 %). */
  let logit = 0.44
    + (S.srv * (1 + (ts.srv||0)) - Rr.ret * (1 + (tr.ret||0))) * 0.0120
    + (rallyS - rallyR) * 0.0072
    + SURF_SERVE[m.surface]
    + (S.net - Rr.net) * 0.0025 * (0.4 + (ts.net||0))
    + (m.momentum * (s === 0 ? 1 : -1)) * 0.040;

  if (big){
    logit += (S.men - Rr.men) * 0.0060;   // le sang-froid ne compte que sur les points qui comptent
    logit += (m.clutchBonus && s === 0 ? m.clutchBonus : 0) * 0.010;
  }

  return clamp(1 / (1 + Math.exp(-logit)), 0.34, 0.90);
}

/* ───────────── Un point ───────────── */
function playPoint(m, big){
  const s = m.server, r = 1 - s;
  const S = m.ix[s], ss = m.stats[s], sr = m.stats[r];
  const ts = tacOf(m.tac[s]), tr = tacOf(m.tac[r]);
  const p = servePointProb(m, s, big);
  m.points++;

  let winner, kind = 'rally';

  const firstIn = clamp(0.585 + (S.srv - 70) * 0.0022 - (big ? 0.02 : 0), 0.44, 0.74);
  if (R() < firstIn){
    ss.srv1++;
    const aceP = clamp((S.srv - 58) * 0.0075
      + (m.surface === 'grass' ? 0.05 : m.surface === 'clay' ? -0.032 : 0), 0.008, 0.34);
    if (R() < aceP){ ss.aces++; winner = s; kind = 'ace'; }
    else winner = R() < clamp(p + 0.085, 0.05, 0.97) ? s : r;
    if (winner === s) ss.won1++;
  } else {
    ss.srv2++;
    const dfP = clamp(0.072 - (S.srv - 70) * 0.0012 + (big ? 0.028 : 0)
      + ((ts.err||0) * 0.25), 0.008, 0.24);
    if (R() < dfP){ ss.df++; winner = r; kind = 'df'; }
    else winner = R() < clamp(p - 0.115, 0.03, 0.95) ? s : r;
    if (winner === s) ss.won2++;
  }

  /* Longueur d'échange, fatigue, gagnants et fautes directes */
  if (kind === 'rally'){
    const aggro = 0.5 + ((ts.aggro||0) + (tr.aggro||0)) * 0.5;
    let len = Math.max(1, Math.round(
      (2.2 + R() * 6.5) * SURF_RALLY[m.surface] * (1.35 - aggro * 0.7)));
    ss.rallyLen += len; ss.rallies++;
    const wStats = m.stats[winner], lStats = m.stats[1 - winner];
    const roll = R();
    if (roll < 0.30 + (tacOf(m.tac[winner]).aggro || 0)) wStats.winners++;
    else if (roll < 0.66) lStats.ue++;

    // Coût énergétique : long échange, surface lente, endurance faible.
    for (let i = 0; i < 2; i++){
      const own = tacOf(m.tac[i]), opp = tacOf(m.tac[1 - i]);
      const cost = len * 0.052 * (1 + (own.stam||0) * -1 + (opp.oppStam||0))
                 * (1.9 - m.ix[i].stam / 78);
      m.fatigue[i] = clamp(m.fatigue[i] + Math.max(0.02, cost), 0, 100);
    }
  } else {
    m.fatigue[s] = clamp(m.fatigue[s] + 0.10, 0, 100);
    m.fatigue[r] = clamp(m.fatigue[r] + 0.06, 0, 100);
  }

  m.stats[winner].pts++;
  m.minutes += 0.58 + (kind === 'rally' ? 0.10 : 0);
  return { winner, kind };
}

/* ───────────── Un jeu ───────────── */
const PTS = ['0', '15', '30', '40'];

function pointLabel(m){
  if (m.tb) return m.tb.pts.join('-');
  const [a, b] = m.pt;
  if (a >= 3 && b >= 3){
    if (a === b) return '40A';
    return (a > b ? 'A-40' : '40-A');
  }
  return PTS[Math.min(a,3)] + '-' + PTS[Math.min(b,3)];
}

function isBreakPoint(m){
  if (m.tb) return false;
  const s = m.server, r = 1 - s;
  return (m.pt[r] >= 3 && m.pt[r] > m.pt[s]);
}

/* i est-il a un point de prendre le set ? */
function setPointFor(m, i){
  if (m.tb) return m.tb.pts[i] >= 6 && m.tb.pts[i] > m.tb.pts[1-i];
  const gi = m.g[i], gj = m.g[1-i];
  const gamePoint = m.pt[i] >= 3 && m.pt[i] > m.pt[1-i];
  return gamePoint && gi >= 5 && gi >= gj + 1;
}
function isSetPoint(m){ return setPointFor(m, 0) || setPointFor(m, 1); }
function matchPointFor(m, i){ return m.setsWon[i] === m.setsToWin - 1 && setPointFor(m, i); }

/* ───────────── Les moments de decision ─────────────
   dp   : l'avantage brut que donne l'option si elle passe
   attr : l'attribut qui la rend credible — un gros serveur a raison d'aller
          chercher l'ace, un petit serveur non
   var  : la variance. Elle rapproche le resultat du pile ou face : jouer
          risque quand on est mene est la bonne decision, jouer risque quand
          on domine est un caprice. C'est tout l'arbitrage du moment. */
const MOMENT_OPTS = {
  serve: [
    { id:'ace',  label:'Aller chercher l\'ace extérieur', hint:'Tout ou rien',
      dp:0.14,  attr:'srv', var:1.50, kind:'ace' },
    { id:'sv',   label:'Service-volée', hint:'Culotté',
      dp:0.09,  attr:'vol', var:1.30 },
    { id:'kick', label:'Lifté sur le revers, jouer le point',
      dp:0.04,  attr:'fh',  var:1.05 },
    { id:'safe', label:'Assurer la première balle', hint:'Sûr',
      dp:0.00, attr:'men', var:0.85 }
  ],
  ret: [
    { id:'attack', label:'Avancer et agresser le retour', hint:'Va-tout',
      dp:0.12,  attr:'ret', var:1.50 },
    { id:'chip',   label:'Chip and charge', hint:'Surprise',
      dp:0.09,  attr:'vol', var:1.32 },
    { id:'deep',   label:'Remettre haut et long, faire durer',
      dp:0.05,  attr:'sta', var:1.05 },
    { id:'block',  label:'Bloquer et jouer le point', hint:'Sûr',
      dp:0.00, attr:'men', var:0.85 }
  ]
};

const MOMENT_TITLES = {
  mp_serve:  { t:'BALLE DE MATCH', s:'Vous servez pour le match.' },
  mp_save:   { t:'BALLE DE MATCH CONTRE VOUS', s:'Un point vous sépare de la sortie.' },
  bp_save:   { t:'BALLE DE BREAK À SAUVER', s:'Set décisif. Votre mise en jeu est en danger.' },
  bp_take:   { t:'BALLE DE BREAK', s:'Set décisif. L\'occasion de faire basculer le match.' },
  sp_serve:  { t:'BALLE DE SET', s:'Vous servez pour empocher le set.' },
  sp_save:   { t:'BALLE DE SET CONTRE VOUS', s:'Il sert pour prendre le set.' },
  tb:        { t:'TIE-BREAK', s:'Le point qui décide du set.' }
};

/* Faut-il s'arreter ici ? Rarement, et seulement quand ca compte. */
function momentKind(m, bp, sp){
  if (m.momentsUsed >= m.maxMoments) return null;
  if (m.g_ && m.g_.hadMoment) return null;              // un seul par jeu
  const decider = m.setsWon[0] + m.setsWon[1] === (m.setsToWin - 1) * 2;

  if (matchPointFor(m, 0)) return 'mp_serve';
  if (matchPointFor(m, 1)) return 'mp_save';
  if (m.tb && Math.max(...m.tb.pts) >= 5 && R() < 0.6) return 'tb';
  if (decider && bp && R() < 0.55) return m.server === 0 ? 'bp_save' : 'bp_take';
  if (decider && sp && R() < 0.35) return setPointFor(m, 0) ? 'sp_serve' : 'sp_save';
  return null;
}

function buildMoment(m, kind){
  const iServe = m.server === 0;
  const base = iServe ? servePointProb(m, 0, true) : 1 - servePointProb(m, 1, true);
  const list = MOMENT_OPTS[iServe ? 'serve' : 'ret'];
  const me = m.p[0].attrs;

  const options = list.map(o => {
    const bonus = ((me[o.attr] || 70) - 70) * 0.006;
    const p = clamp(0.5 + (base + o.dp + bonus - 0.5) / o.var, 0.05, 0.95);
    return Object.assign({}, o, { p, pct: Math.round(p * 100) });
  });

  return {
    kind, serving: iServe,
    title: MOMENT_TITLES[kind].t,
    sub: MOMENT_TITLES[kind].s,
    score: `${m.sets.map(x => x.g.join('-')).join(' ')} ${m.g.join('-')} · ${pointLabel(m)}`,
    options
  };
}

/* Le joueur a choisi : on joue ce point-la avec la probabilite affichee. */
function resolveMoment(m, optId){
  const mom = m.moment;
  if (!mom) return null;
  const opt = mom.options.find(o => o.id === optId) || mom.options[0];
  m.moment = null;
  m.momentsUsed++;
  if (m.g_) m.g_.hadMoment = true;

  const iWin = R() < opt.p;
  const winner = iWin ? 0 : 1;
  const srv = m.server, ss = m.stats[srv];

  let kind = 'rally', txt;
  if (opt.kind === 'ace' && iWin && srv === 0 && R() < 0.55){ ss.aces++; kind = 'ace'; }
  else if (opt.kind === 'ace' && !iWin && srv === 0 && R() < 0.35){ ss.df++; kind = 'df'; }
  if (srv === 0) (kind === 'df' ? ss.srv2++ : ss.srv1++); else ss.srv1++;
  if (kind === 'rally'){
    const wS = m.stats[winner], lS = m.stats[1-winner];
    if (R() < 0.42) wS.winners++; else if (R() < 0.6) lS.ue++;
    const len = Math.max(1, Math.round((3 + R()*7) * SURF_RALLY[m.surface]));
    m.fatigue[0] = clamp(m.fatigue[0] + len * 0.06, 0, 100);
    m.fatigue[1] = clamp(m.fatigue[1] + len * 0.06, 0, 100);
  }
  m.stats[winner].pts++;
  m.minutes += 0.9;
  m.momentum = clamp(m.momentum + (iWin ? 0.22 : -0.22), -1, 1);

  txt = iWin
    ? { ace:'ACE. Le point le plus important du match, réglé en une balle.',
        rally:'Le pari passe. Le point est à vous.',
        df:'' }[kind] || 'Le point est à vous.'
    : { df:'Double faute. Au pire moment possible.',
        rally:'Le pari ne passe pas.',
        ace:'' }[kind] || 'Le pari ne passe pas.';

  m.momentLog.push({ kind: mom.kind, choice: opt.label, won: iWin, pct: opt.pct });
  m.feed.push({ t: iWin ? 'moment-win' : 'moment-lose',
                txt: `${mom.title} — ${opt.label} : ${txt}`,
                score: pointLabel(m) });

  // On inscrit le point comme n'importe quel autre.
  return scorePoint(m, { winner, kind });
}

/* Comptabilise un point et cloture le jeu s'il est fini. */
function scorePoint(m, res){
  const g = m.g_;
  if (m.tb) return tbPoint(m, res);

  const wasBP = g && g.bpOpen;
  if (wasBP && res.winner === m.server){ m.stats[m.server].bpSaved++; g.saved++; }
  if (wasBP && res.winner !== m.server) m.stats[1-m.server].bpWon++;
  g.bpOpen = false;

  m.pt[res.winner]++;
  const a = m.pt[res.winner], b = m.pt[1 - res.winner];
  if (a >= 4 && a - b >= 2){
    const w = res.winner;
    m.g[w]++; m.stats[w].games++;
    const broke = w !== g.server;
    m.momentum = clamp(m.momentum + (w === 0 ? 1 : -1) * (broke ? 0.34 : 0.10), -1, 1);
    const line = {
      t: broke ? 'break' : 'hold', server: g.server, winner: w,
      txt: broke ? `BREAK — ${m.p[w].name} prend le service de ${m.p[g.server].name}`
                 : `Jeu ${m.p[w].name}`,
      score: `${m.g[0]}-${m.g[1]}`,
      bp: g.bp, saved: g.saved,
      aces: m.stats[g.server].aces - g.aces[g.server],
      notable: g.notable
    };
    m.feed.push(line);
    m.server = 1 - m.server;
    m.g_ = null;
    checkSet(m);
    return line;
  }
  return null;
}

function tbPoint(m, res){
  const tb = m.tb;
  tb.pts[res.winner]++;
  const tot = tb.pts[0] + tb.pts[1];
  if (tot === 1 || (tot > 1 && (tot - 1) % 2 === 0)) m.server = 1 - m.server;
  const a = tb.pts[res.winner], b = tb.pts[1 - res.winner];
  if (a >= 7 && a - b >= 2){
    const w = res.winner;
    m.g[w]++;
    const line = { t:'tb', winner:w,
      txt:`TIE-BREAK ${m.p[w].name} (${tb.pts[w]}-${tb.pts[1-w]})`,
      score:`${m.g[0]}-${m.g[1]}`, notable: (m.g_ && m.g_.notable) || [] };
    m.feed.push(line);
    m.tb = null; m.g_ = null;
    checkSet(m);
    return line;
  }
  return null;
}

function playGame(m){
  if (m.over || m.moment) return null;

  if (!m.g_){
    if (!m.tb) m.pt = [0, 0];
    m.g_ = { server:m.server, notable:[], bp:0, saved:0, hadMoment:false, bpOpen:false,
             aces:[m.stats[0].aces, m.stats[1].aces] };
  }
  const g = m.g_;
  let guard = 0;

  while (guard++ < 220){
    const bp = isBreakPoint(m), sp = isSetPoint(m);
    if (bp && !g.bpOpen){ m.stats[m.server].bpFaced++; m.stats[1-m.server].bpChance++;
                          g.bp++; g.bpOpen = true; }

    const kind = momentKind(m, bp, sp);
    if (kind){ m.moment = buildMoment(m, kind); return { t:'moment', moment:m.moment }; }

    const res = playPoint(m, bp || sp || !!m.tb);
    if (bp && res.winner === m.server && res.kind === 'ace')
      g.notable.push('Ace sauvant une balle de break.');
    if (res.kind === 'df' && (bp || sp))
      g.notable.push('Double faute au pire moment.');

    const line = scorePoint(m, res);
    if (line) return line;
    if (m.over) return null;
  }
  return null;
}

function checkSet(m){
  const [a, b] = m.g;
  if (a === 6 && b === 6 && !m.tb){ m.tb = { pts:[0,0] }; return; }
  let w = -1;
  if (a >= 6 && a - b >= 2) w = 0;
  if (b >= 6 && b - a >= 2) w = 1;
  if (a === 7 || b === 7) w = a === 7 ? 0 : 1;
  if (w < 0) return;

  m.setsWon[w]++;
  m.sets.push({ g: [m.g[0], m.g[1]] });
  m.feed.push({ t:'set', winner:w,
    txt:`Set ${m.p[w].name} — ${m.g[w]}-${m.g[1-w]}`,
    score: m.sets.map(s => s.g.join('-')).join('  ') });
  m.g = [0, 0]; m.pt = [0, 0]; m.momentum = clamp(m.momentum * 0.4, -1, 1);

  // Récupération partielle entre les sets
  m.fatigue[0] = clamp(m.fatigue[0] - 2.2, 0, 100);
  m.fatigue[1] = clamp(m.fatigue[1] - 2.2, 0, 100);
  m.minutes += 2;

  if (m.setsWon[w] >= m.setsToWin) finish(m, w);
}

function finish(m, w){
  m.over = true; m.winner = w;
  m.minutes = Math.round(m.minutes);
  m.feed.push({ t:'end', winner:w,
    txt:`${m.p[w].name} s'impose`,
    score: scoreLine(m, w) });
}

function scoreLine(m, from){
  return m.sets.map(s => from === 0 ? `${s.g[0]}-${s.g[1]}` : `${s.g[1]}-${s.g[0]}`).join(' ');
}

/* ───────────── Avancer ───────────── */
function playSet(m){
  const start = m.sets.length;
  const lines = [];
  let guard = 0;
  while (!m.over && !m.moment && m.sets.length === start && guard++ < 200){
    const l = playGame(m); if (l) lines.push(l);
  }
  return lines;
}

function playAll(m){
  const lines = [];
  let guard = 0;
  while (!m.over && !m.moment && guard++ < 900){
    const l = playGame(m); if (l) lines.push(l);
  }
  return lines;
}

/* Version sans interruption, pour l'avance rapide et les matchs entre PNJ. */
function playSilent(m){
  m.maxMoments = 0;
  return playAll(m);
}

/* ───────────── Résolution rapide, pour les matchs entre PNJ ───────────── */
function effLevel(p, surf){
  return levelOf(p) + surfAff(p, surf) * 0.72 + ((p.form || 60) - 62) * 0.08
       - (p.fatigue || 0) * 0.045;
}
function quickWin(a, b, surf){
  const p = 1 / (1 + Math.pow(10, (effLevel(b, surf) - effLevel(a, surf)) / 9));
  return Math.random() < p;
}
/* Score plausible pour un match non joué, à partir de l'écart de niveau. */
function quickScore(a, b, surf, bo5){
  const d = effLevel(a, surf) - effLevel(b, surf);
  const need = bo5 ? 3 : 2;
  const sets = [];
  let wa = 0, wb = 0;
  while (wa < need && wb < need){
    const pw = 1 / (1 + Math.pow(10, -d / 7));
    if (Math.random() < pw){ wa++; sets.push(closeSet(true, d)); }
    else { wb++; sets.push(closeSet(false, d)); }
  }
  return sets.join(' ');
}
function closeSet(aWins, d){
  const gap = Math.abs(d);
  const r = Math.random();
  let loser;
  if (gap > 8) loser = r < .45 ? 2 : r < .8 ? 3 : 4;
  else if (gap > 4) loser = r < .3 ? 3 : r < .7 ? 4 : 5;
  else loser = r < .25 ? 4 : r < .7 ? 5 : 6;
  const w = loser === 6 ? 7 : 6;
  return aWins ? `${w}-${loser}` : `${loser}-${w}`;
}

return { create, playGame, playSet, playAll, playSilent, pointLabel, scoreLine,
         resolveMoment, matchPointFor, setPointFor,
         idx, effLevel, quickWin, quickScore, isBreakPoint };
})();
