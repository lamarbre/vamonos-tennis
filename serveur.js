/* ═══════════════════════════════════════════════════════════════════════════
   VAMONOS TENNIS — serveur
   Sert le jeu, encaisse la télémétrie, et expose un tableau de bord.
   Aucune dépendance : SQLite est intégré à Node 22+ (node:sqlite).

   Lancer :  node serveur.js [port]
   Admin  :  http://localhost:8124/admin   (mot de passe : voir ADMIN_MDP)
   ═══════════════════════════════════════════════════════════════════════════ */
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const DIR   = __dirname;
const PORT  = Number(process.argv[2] || process.env.PORT) || 8124;
/* En production, le mot de passe DOIT venir de l'environnement. Un mot de passe
   par défaut sur un site public équivaut à pas de mot de passe du tout : on refuse
   de démarrer plutôt que d'exposer le tableau de bord sans le dire. */
const PROD = !!(process.env.PORT || process.env.NODE_ENV === 'production');
const ADMIN_MDP = process.env.ADMIN_MDP || (PROD ? null : 'vamonos2026');
if (!ADMIN_MDP){
  console.error('\n  ERREUR : définissez ADMIN_MDP avant de démarrer en production.');
  console.error('  Exemple :  ADMIN_MDP="un-mot-de-passe-long" node serveur.js\n');
  process.exit(1);
}
const DB_PATH   = process.env.DB_PATH || path.join(DIR, 'vamonos.db');

/* ───────────── Base ─────────────
   Un joueur = un pseudo + un identifiant tiré au hasard côté navigateur.
   Aucun compte, aucun mot de passe, aucune adresse e-mail : le minimum pour
   distinguer deux personnes et suivre leurs parties. */
const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS joueurs (
    id TEXT PRIMARY KEY, pseudo TEXT, cree_le INTEGER, vu_le INTEGER,
    appareil TEXT, langue TEXT, pays TEXT, visites INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS parties (
    id TEXT PRIMARY KEY, joueur_id TEXT, debut INTEGER, maj INTEGER, fin INTEGER,
    mode TEXT, nation TEXT, style TEXT, origine TEXT, hygiene TEXT, potentiel INTEGER,
    statut TEXT DEFAULT 'en cours',
    saisons INTEGER DEFAULT 0, semaines INTEGER DEFAULT 0,
    meilleur_rang INTEGER, dernier_rang INTEGER, titres INTEGER DEFAULT 0,
    chelems INTEGER DEFAULT 0, age_fin INTEGER, gains REAL DEFAULT 0,
    secondes INTEGER DEFAULT 0, actions INTEGER DEFAULT 0,
    abandon_an INTEGER, abandon_sem INTEGER
  );
  CREATE TABLE IF NOT EXISTS evenements (
    id INTEGER PRIMARY KEY AUTOINCREMENT, joueur_id TEXT, partie_id TEXT,
    type TEXT, valeur TEXT, quand INTEGER
  );
  CREATE INDEX IF NOT EXISTS i_parties_joueur ON parties(joueur_id);
  CREATE INDEX IF NOT EXISTS i_parties_debut  ON parties(debut);
  CREATE INDEX IF NOT EXISTS i_evt_type       ON evenements(type, quand);
`);

const q = (sql, ...a) => db.prepare(sql).all(...a);
const un = (sql, ...a) => db.prepare(sql).get(...a);
const run = (sql, ...a) => db.prepare(sql).run(...a);
const now = () => Date.now();
const jour = t => new Date(t).toISOString().slice(0, 10);

/* ───────────── API ───────────── */
function api(req, res, url, corps){
  const d = corps || {};
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();

  if (url === '/api/session'){
    const id = String(d.id || '').slice(0, 40);
    if (!id) return json(res, 400, { erreur:'id manquant' });
    const ex = un('SELECT id FROM joueurs WHERE id=?', id);
    if (ex) run('UPDATE joueurs SET vu_le=?, visites=visites+1, pseudo=COALESCE(NULLIF(?,\'\'),pseudo) WHERE id=?',
                now(), String(d.pseudo || '').slice(0, 24), id);
    else    run('INSERT INTO joueurs (id,pseudo,cree_le,vu_le,appareil,langue) VALUES (?,?,?,?,?,?)',
                id, String(d.pseudo || '').slice(0, 24), now(), now(),
                String(d.appareil || '').slice(0, 12), String(d.langue || '').slice(0, 8));
    return json(res, 200, { ok:true });
  }

  if (url === '/api/partie'){
    const id = String(d.id || '').slice(0, 40);
    if (!id) return json(res, 400, { erreur:'id manquant' });
    const ex = un('SELECT id FROM parties WHERE id=?', id);
    if (!ex){
      run(`INSERT INTO parties (id,joueur_id,debut,maj,mode,nation,style,origine,hygiene,potentiel)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
          id, String(d.joueur || '').slice(0, 40), now(), now(),
          String(d.mode || '').slice(0, 10), String(d.nation || '').slice(0, 30),
          String(d.style || '').slice(0, 30), String(d.origine || '').slice(0, 40),
          String(d.hygiene || '').slice(0, 40), Number(d.potentiel) || null);
    } else {
      run(`UPDATE parties SET maj=?, saisons=?, semaines=?, meilleur_rang=?, dernier_rang=?,
             titres=?, chelems=?, gains=?, secondes=?, actions=?, mode=COALESCE(?,mode),
             abandon_an=?, abandon_sem=?
           WHERE id=?`,
          now(), Number(d.saisons) || 0, Number(d.semaines) || 0,
          Number(d.meilleur) || null, Number(d.rang) || null,
          Number(d.titres) || 0, Number(d.chelems) || 0, Number(d.gains) || 0,
          Number(d.secondes) || 0, Number(d.actions) || 0,
          d.mode ? String(d.mode).slice(0, 10) : null,
          Number(d.an) || null, Number(d.sem) || null, id);
      if (d.statut) run('UPDATE parties SET statut=?, fin=?, age_fin=? WHERE id=?',
                        String(d.statut).slice(0, 20), now(), Number(d.age) || null, id);
    }
    return json(res, 200, { ok:true });
  }

  if (url === '/api/evt'){
    run('INSERT INTO evenements (joueur_id,partie_id,type,valeur,quand) VALUES (?,?,?,?,?)',
        String(d.joueur || '').slice(0, 40), String(d.partie || '').slice(0, 40),
        String(d.type || '').slice(0, 30), String(d.valeur || '').slice(0, 80), now());
    return json(res, 200, { ok:true });
  }

  return json(res, 404, { erreur:'inconnu' });
}

/* ───────────── Chiffres du tableau de bord ───────────── */
function stats(){
  const n = un(`SELECT COUNT(*) c FROM parties`).c;
  const finies = un(`SELECT COUNT(*) c FROM parties WHERE statut!='en cours'`).c;
  const duree = un(`SELECT AVG(secondes) a, COUNT(*) c FROM parties WHERE secondes>60`);
  const med = q(`SELECT secondes FROM parties WHERE secondes>60 ORDER BY secondes`).map(r => r.secondes);

  return {
    joueurs:   un(`SELECT COUNT(*) c FROM joueurs`).c,
    parties:   n,
    finies,
    enCours:   n - finies,
    abandon:   n ? Math.round((n - finies) / n * 100) : 0,
    dureeMoy:  Math.round(duree.a || 0),
    dureeMed:  med.length ? med[Math.floor(med.length / 2)] : 0,
    actifs7:   un(`SELECT COUNT(DISTINCT joueur_id) c FROM parties WHERE maj > ?`, now() - 7 * 864e5).c,
    actifs1:   un(`SELECT COUNT(DISTINCT joueur_id) c FROM parties WHERE maj > ?`, now() - 864e5).c,

    parJour:   q(`SELECT DATE(debut/1000,'unixepoch') j, COUNT(*) n FROM parties
                  WHERE debut > ? GROUP BY j ORDER BY j`, now() - 30 * 864e5),
    modes:     q(`SELECT COALESCE(NULLIF(mode,''),'?') k, COUNT(*) n FROM parties GROUP BY k ORDER BY n DESC`),
    appareils: q(`SELECT COALESCE(NULLIF(appareil,''),'?') k, COUNT(*) n FROM joueurs GROUP BY k ORDER BY n DESC`),
    nations:   q(`SELECT COALESCE(NULLIF(nation,''),'?') k, COUNT(*) n FROM parties GROUP BY k ORDER BY n DESC LIMIT 10`),
    styles:    q(`SELECT COALESCE(NULLIF(style,''),'?') k, COUNT(*) n FROM parties GROUP BY k ORDER BY n DESC`),
    origines:  q(`SELECT COALESCE(NULLIF(origine,''),'?') k, COUNT(*) n FROM parties GROUP BY k ORDER BY n DESC`),

    /* Là où les gens décrochent : la statistique la plus utile pour le jeu. */
    abandons:  q(`SELECT saisons s, COUNT(*) n FROM parties
                  WHERE statut='en cours' AND maj < ? GROUP BY s ORDER BY s LIMIT 20`, now() - 2 * 864e5),

    /* Ce qui paie les serveurs. */
    sponsorVu:   un(`SELECT COUNT(*) c FROM evenements WHERE type='sponsor_vu'`).c,
    sponsorClic: un(`SELECT COUNT(*) c FROM evenements WHERE type='sponsor_clic'`).c,
    partages:    un(`SELECT COUNT(*) c FROM evenements WHERE type='partage'`).c,

    reussite: q(`SELECT
        SUM(CASE WHEN meilleur_rang<=10 THEN 1 ELSE 0 END) top10,
        SUM(CASE WHEN meilleur_rang<=100 THEN 1 ELSE 0 END) top100,
        SUM(chelems) chelems, AVG(saisons) saisons, AVG(titres) titres
      FROM parties WHERE meilleur_rang IS NOT NULL`)[0] || {},

    derniers: q(`SELECT p.id, j.pseudo, p.mode, p.debut, p.maj, p.statut, p.saisons,
                        p.meilleur_rang, p.titres, p.chelems, p.secondes, p.nation
                 FROM parties p LEFT JOIN joueurs j ON j.id=p.joueur_id
                 ORDER BY p.maj DESC LIMIT 40`),
    top: q(`SELECT j.pseudo, COUNT(*) parties, SUM(p.secondes) tps, MIN(p.meilleur_rang) best
            FROM parties p JOIN joueurs j ON j.id=p.joueur_id
            GROUP BY j.id ORDER BY tps DESC LIMIT 20`)
  };
}

/* ───────────── Tableau de bord ───────────── */
function dureeTxt(s){
  s = Math.round(s || 0);
  if (s < 60) return s + ' s';
  if (s < 3600) return Math.floor(s / 60) + ' min ' + (s % 60) + ' s';
  return Math.floor(s / 3600) + ' h ' + Math.floor((s % 3600) / 60) + ' min';
}
function admin(){
  const s = stats();
  const barres = (list, cle, tot) => list.map(r => {
    const pct = tot ? Math.round(r.n / tot * 100) : 0;
    return `<div class="l"><span>${esc(r[cle])}</span>
      <span class="b"><i style="width:${pct}%"></i></span>
      <span class="v">${r.n} · ${pct} %</span></div>`;
  }).join('') || '<div class="vide">aucune donnée</div>';

  const maxJ = Math.max(1, ...s.parJour.map(r => r.n));
  const ctr = s.sponsorVu ? (s.sponsorClic / s.sponsorVu * 100).toFixed(1) : '0.0';

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Vamonos Tennis — administration</title><style>
*{box-sizing:border-box} body{margin:0;background:#0B1A13;color:#E8F0F4;
  font:14px/1.5 "Segoe UI",system-ui,sans-serif;padding:22px}
h1{font-size:20px;margin:0 0 4px} .sub{color:#7C9A8A;font-size:12px;margin-bottom:22px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:12px;margin-bottom:26px}
.k{background:#122A1E;border:1px solid #1E4433;border-radius:12px;padding:14px}
.k b{display:block;font-size:26px;color:#4AC878;font-weight:700}
.k span{font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:#7C9A8A}
h2{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:#7C9A8A;
  margin:26px 0 10px;border-top:1px solid #1E4433;padding-top:14px}
.l{display:grid;grid-template-columns:170px 1fr 110px;gap:10px;align-items:center;padding:3px 0;font-size:13px}
.b{height:8px;background:#0E2118;border-radius:4px;overflow:hidden}
.b i{display:block;height:100%;background:linear-gradient(90deg,#4AC878,#1D6B47)}
.v{text-align:right;color:#7C9A8A;font-size:12px}
table{width:100%;border-collapse:collapse;font-size:12.5px}
th{text-align:left;color:#7C9A8A;font-weight:600;font-size:10.5px;letter-spacing:.08em;
  text-transform:uppercase;padding:7px 8px;border-bottom:1px solid #1E4433}
td{padding:7px 8px;border-bottom:1px solid #14291E}
tr:hover td{background:#102419}
.jours{display:flex;gap:3px;align-items:flex-end;height:90px;margin-top:8px}
.jours div{flex:1;background:#1D6B47;border-radius:3px 3px 0 0;min-height:2px;position:relative}
.jours div:hover{background:#4AC878}
.vide{color:#5B7568;font-size:12.5px;padding:8px 0}
.ok{color:#4AC878} .no{color:#E06B5B}
</style></head><body>
<h1>Vamonos Tennis — administration</h1>
<div class="sub">Données au ${new Date().toLocaleString('fr-FR')} · base ${path.basename(DB_PATH)}</div>

<div class="grid">
  <div class="k"><b>${s.joueurs}</b><span>joueurs</span></div>
  <div class="k"><b>${s.parties}</b><span>parties lancées</span></div>
  <div class="k"><b>${s.finies}</b><span>parties terminées</span></div>
  <div class="k"><b>${s.abandon} %</b><span>abandon</span></div>
  <div class="k"><b>${dureeTxt(s.dureeMoy)}</b><span>durée moyenne</span></div>
  <div class="k"><b>${dureeTxt(s.dureeMed)}</b><span>durée médiane</span></div>
  <div class="k"><b>${s.actifs1}</b><span>actifs 24 h</span></div>
  <div class="k"><b>${s.actifs7}</b><span>actifs 7 jours</span></div>
</div>

<h2>Partenaire — ce qui paie les serveurs</h2>
<div class="grid">
  <div class="k"><b>${s.sponsorVu}</b><span>bannière affichée</span></div>
  <div class="k"><b class="${s.sponsorClic ? 'ok' : 'no'}">${s.sponsorClic}</b><span>clics</span></div>
  <div class="k"><b>${ctr} %</b><span>taux de clic</span></div>
  <div class="k"><b>${s.partages}</b><span>partages</span></div>
</div>

<h2>Parties par jour (30 derniers jours)</h2>
<div class="jours">${s.parJour.map(r =>
  `<div style="height:${Math.round(r.n / maxJ * 100)}%" title="${r.j} — ${r.n}"></div>`).join('') || ''}</div>
${s.parJour.length ? '' : '<div class="vide">aucune donnée</div>'}

<h2>Mode choisi</h2>${barres(s.modes, 'k', s.parties)}
<h2>Appareil</h2>${barres(s.appareils, 'k', s.joueurs)}
<h2>Style de jeu</h2>${barres(s.styles, 'k', s.parties)}
<h2>Formation</h2>${barres(s.origines, 'k', s.parties)}
<h2>Nations les plus choisies</h2>${barres(s.nations, 'k', s.parties)}

<h2>Où les gens décrochent (parties abandonnées, par saison atteinte)</h2>
${barres(s.abandons.map(r => ({ k:'saison ' + r.s, n:r.n })), 'k',
         s.abandons.reduce((a, r) => a + r.n, 0))}

<h2>Réussite des joueurs</h2>
<div class="grid">
  <div class="k"><b>${s.reussite.top100 || 0}</b><span>ont vu le top 100</span></div>
  <div class="k"><b>${s.reussite.top10 || 0}</b><span>ont vu le top 10</span></div>
  <div class="k"><b>${s.reussite.chelems || 0}</b><span>Grands Chelems</span></div>
  <div class="k"><b>${(s.reussite.saisons || 0).toFixed(1)}</b><span>saisons / partie</span></div>
</div>

<h2>Les 40 dernières parties</h2>
<table><tr><th>Pseudo</th><th>Mode</th><th>Statut</th><th>Saisons</th><th>Meilleur</th>
<th>Titres</th><th>GC</th><th>Temps</th><th>Vu</th></tr>
${s.derniers.map(r => `<tr>
  <td>${esc(r.pseudo || '—')}</td><td>${esc(r.mode || '—')}</td>
  <td>${esc(r.statut)}</td><td>${r.saisons || 0}</td>
  <td>${r.meilleur_rang ? '#' + r.meilleur_rang : '—'}</td>
  <td>${r.titres || 0}</td><td>${r.chelems || 0}</td>
  <td>${dureeTxt(r.secondes)}</td>
  <td>${new Date(r.maj).toLocaleString('fr-FR')}</td></tr>`).join('')
  || '<tr><td colspan="9" class="vide">aucune partie</td></tr>'}
</table>

<h2>Joueurs les plus assidus</h2>
<table><tr><th>Pseudo</th><th>Parties</th><th>Temps total</th><th>Meilleur rang</th></tr>
${s.top.map(r => `<tr><td>${esc(r.pseudo || '—')}</td><td>${r.parties}</td>
  <td>${dureeTxt(r.tps)}</td><td>${r.best ? '#' + r.best : '—'}</td></tr>`).join('')
  || '<tr><td colspan="4" class="vide">aucun joueur</td></tr>'}
</table>
</body></html>`;
}

/* ───────────── Plomberie ───────────── */
const esc = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = (res, code, o) => { res.writeHead(code, { 'Content-Type':'application/json; charset=utf-8' });
                                 res.end(JSON.stringify(o)); };
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml',
  '.png':'image/png', '.jpg':'image/jpeg', '.ico':'image/x-icon', '.xml':'application/xml',
  '.txt':'text/plain; charset=utf-8' };

function autorise(req){
  const h = req.headers.authorization || '';
  if (!h.startsWith('Basic ')) return false;
  const [, mdp] = Buffer.from(h.slice(6), 'base64').toString().split(':');
  // Comparaison à durée constante : on ne veut pas fuiter le mot de passe caractère par caractère.
  const a = Buffer.from(String(mdp || '')), b = Buffer.from(ADMIN_MDP);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);

  if (url.startsWith('/api/')){
    if (req.method !== 'POST') return json(res, 405, { erreur:'POST attendu' });
    let corps = '';
    req.on('data', ch => { corps += ch; if (corps.length > 8000) req.destroy(); });
    req.on('end', () => {
      let d = null;
      try { d = JSON.parse(corps || '{}'); } catch (e){ return json(res, 400, { erreur:'json' }); }
      try { api(req, res, url, d); } catch (e){ json(res, 500, { erreur:e.message }); }
    });
    return;
  }

  if (url === '/admin' || url === '/admin/'){
    if (!autorise(req)){
      res.writeHead(401, { 'WWW-Authenticate':'Basic realm="Vamonos Tennis"' });
      return res.end('Accès réservé');
    }
    res.writeHead(200, { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store' });
    return res.end(admin());
  }

  let rel = url === '/' || url === '' ? '/index.html' : url;
  const f = path.join(DIR, path.normalize(rel).replace(/^([.][.][/\\])+/, ''));
  if (!f.startsWith(DIR)) { res.writeHead(403).end('Interdit'); return; }
  if (path.basename(f) === path.basename(DB_PATH)) { res.writeHead(403).end('Interdit'); return; }

  fs.readFile(f, (err, data) => {
    if (err){ res.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' })
                 .end('Introuvable : ' + rel); return; }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log('VAMONOS TENNIS  →  http://localhost:' + PORT);
  console.log('administration  →  http://localhost:' + PORT + '/admin   (mot de passe : ' + ADMIN_MDP + ')');
  console.log('base            →  ' + DB_PATH);
});
