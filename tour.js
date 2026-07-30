/* ══════════════════════════════════════════════════════════════════════════
   VAMONOS TENNIS — Données du circuit
   Attributs, styles, calendrier, catégories, staff, entraînement, tactiques.
   ══════════════════════════════════════════════════════════════════════════ */

/* ─────────────────────── LES 8 ATTRIBUTS ───────────────────────
   Chacun est réellement utilisé par le moteur de match. */
const ATTRS = [
  { k:'srv', name:'Service',   icon:'🚀', desc:'Vitesse, précision et pourcentage de première balle.' },
  { k:'ret', name:'Retour',    icon:'🪃', desc:'Capacité à remettre en jeu et à agresser la mise en jeu adverse.' },
  { k:'fh',  name:'Coup droit',icon:'💥', desc:'Votre arme principale du fond de court.' },
  { k:'bh',  name:'Revers',    icon:'🔄', desc:'Le côté que les adversaires chercheront à exploiter.' },
  { k:'vol', name:'Volée',     icon:'🎯', desc:'Jeu au filet, amorties, conclusion des points courts.' },
  { k:'spd', name:'Vitesse',   icon:'⚡', desc:'Déplacements, couverture de court, défense.' },
  { k:'sta', name:'Endurance', icon:'🫁', desc:'Ce qui reste dans les jambes au quatrième set.' },
  { k:'men', name:'Mental',    icon:'🧊', desc:'Balles de break, tie-breaks, fins de match.' }
];
const ATTR_KEYS = ATTRS.map(a => a.k);

/* ─────────────────────── STYLES DE JEU ───────────────────────
   w : poids de chaque attribut dans le niveau général.
   Les affinités de surface sont à somme nulle : un style est un arbitrage. */
const STYLES = [
  { id:'aggro', name:'Attaquant de fond de court', icon:'💥', short:'Attaquant',
    desc:'Prendre la balle tôt, dicter, écraser. Vous ne subissez jamais — quitte à vous auto-détruire.',
    w:{ srv:.16, ret:.12, fh:.24, bh:.14, vol:.06, spd:.11, sta:.07, men:.10 },
    surf:{ clay:-2, hard:3, grass:-1 },
    tac:{ aggression:0.62, netFreq:0.12 } },

  { id:'counter', name:'Contreur infatigable', icon:'🛡️', short:'Contreur',
    desc:'Renvoyer une balle de plus. Toujours une de plus. Ils craqueront avant vous.',
    w:{ srv:.09, ret:.18, fh:.15, bh:.15, vol:.04, spd:.16, sta:.13, men:.10 },
    surf:{ clay:5, hard:0, grass:-5 },
    tac:{ aggression:0.34, netFreq:0.05 } },

  { id:'server', name:'Serveur-volleyeur', icon:'🎾', short:'Serveur-volleyeur',
    desc:'Le service comme arme absolue, le filet comme terrain de chasse. Des matchs qui durent une heure.',
    w:{ srv:.27, ret:.09, fh:.12, bh:.10, vol:.19, spd:.09, sta:.06, men:.08 },
    surf:{ clay:-5, hard:0, grass:5 },
    tac:{ aggression:0.70, netFreq:0.34 } },

  { id:'allcourt', name:'Joueur complet', icon:'♟️', short:'Complet',
    desc:'Aucune arme absolue, aucune faiblesse. Le style le plus dur à construire — et le plus haut plafond.',
    w:{ srv:.15, ret:.14, fh:.16, bh:.14, vol:.10, spd:.11, sta:.10, men:.10 },
    surf:{ clay:0, hard:0, grass:0 }, potBonus:3,
    tac:{ aggression:0.50, netFreq:0.16 } }
];

/* Avantage au service selon la surface, en points de probabilité. */
const SURF_SERVE = { clay:-0.055, hard:0.010, grass:0.065 };
/* Longueur moyenne des échanges : la terre use, le gazon épargne. */
const SURF_RALLY = { clay:1.42, hard:1.00, grass:0.72 };

const SURFACES = {
  clay:  { id:'clay',  name:'Terre battue', short:'Terre', icon:'🟠', css:'clay' },
  hard:  { id:'hard',  name:'Dur',          short:'Dur',   icon:'🔵', css:'hard' },
  grass: { id:'grass', name:'Gazon',        short:'Gazon', icon:'🟢', css:'grass' }
};

/* ─────────────────────── CATÉGORIES DE TOURNOIS ───────────────────────
   pts / prize indexés par nombre de tours gagnés (0 = battu d'entrée).
   entry : classement requis pour l'entrée directe.
   band  : la fourchette de classement dans laquelle le tableau recrute. */
const TIERS = {
  itf15:  { id:'itf15',  name:'ITF M15',        short:'ITF15', draw:32,  prio:1, entry:9999, band:[400,1600], weeks:1,
            pts:[0,0,1,3,7,15],              prize:[0,.0004,.0008,.0014,.0024,.0042] },
  itf25:  { id:'itf25',  name:'ITF M25',        short:'ITF25', draw:32,  prio:2, entry:900, band:[230,950],  weeks:1,
            pts:[0,1,3,6,12,25],             prize:[0,.0007,.0013,.0023,.0040,.0070] },
  ch75:   { id:'ch75',   name:'Challenger 75',  short:'CH75',  draw:32,  prio:3, entry:400, band:[110,520],  weeks:1,
            pts:[0,3,8,16,35,75],            prize:[.0008,.0018,.0032,.0058,.0105,.0190] },
  ch125:  { id:'ch125',  name:'Challenger 125', short:'CH125', draw:32,  prio:4, entry:230, band:[45,300],  weeks:1,
            pts:[0,6,14,28,60,125],          prize:[.0015,.0032,.0058,.0105,.0190,.0340] },
  atp250: { id:'atp250', name:'ATP 250',        short:'250',   draw:32,  prio:5, entry:110, band:[8,160],  weeks:1,
            pts:[0,20,45,90,150,250],        prize:[.006,.012,.021,.038,.065,.115] },
  atp500: { id:'atp500', name:'ATP 500',        short:'500',   draw:32,  prio:6, entry:55, band:[1,85],   weeks:1,
            pts:[0,45,90,180,300,500],       prize:[.014,.028,.050,.090,.160,.290] },
  m1000:  { id:'m1000',  name:'Masters 1000',   short:'M1000', draw:64,  prio:8, entry:45, band:[1,115],   weeks:2,
            pts:[10,45,90,180,360,600,1000], prize:[.022,.040,.072,.130,.235,.420,.780] },
  slam:   { id:'slam',   name:'Grand Chelem',   short:'GC',    draw:128, prio:10,entry:104, band:[1,300],  weeks:2, bo5:true,
            pts:[10,45,90,180,360,720,1200,2000],
            prize:[.075,.120,.180,.290,.470,.780,1.35,2.60] },
  finals: { id:'finals', name:'Masters',        short:'MASTERS',draw:8,  prio:9, entry:8, band:[1,8],    weeks:1,
            pts:[200,600,1000,1500],         prize:[.28,.75,1.30,2.20] },

  /* Les Jeux : aucun point ATP, une dotation dérisoire, et la seule médaille
     que l'argent ne peut pas acheter. */
  olympics:{ id:'olympics',name:'Jeux Olympiques', short:'JO', draw:64, prio:9, entry:64, band:[1,90], weeks:2,
             medals:true,
             pts:[0,0,0,0,0,0,0],            prize:[0,0,.004,.008,.014,.022,.040] },

  /* La Coupe Davis se joue par nations : un seul simple par tour, et le
     reste de la rencontre dépend de vos coéquipiers. */
  davis:   { id:'davis',  name:'Coupe Davis',   short:'DAVIS', draw:8,  prio:9, entry:400, band:[1,400], weeks:1,
             team:true,
             pts:[0,0,0,0],                  prize:[.01,.03,.06,.12] }
};

/* ─────────────────────── LE CALENDRIER ───────────────────────
   Les grands rendez-vous, à date fixe. Le reste (Challengers, ITF) est
   généré à la création du monde et reste identique d'une année sur l'autre :
   c'est ce qui permet de « défendre ses points ». */
/* Le calendrier du circuit, dans l'ordre reel de la saison.
   span : nombre de semaines occupees (2 pour les Grands Chelems et les
   grands Masters 1000). Les noms sont ceux des villes : tout amateur de
   tennis reconnait la tournee au premier coup d'oeil. */
const MAJORS = [
  /* ── Tournée australienne ── */
  { name:'Brisbane',      week:1,  surf:'hard',  tier:'atp250' },
  { name:'Hong Kong',     week:1,  surf:'hard',  tier:'atp250' },
  { name:'Adélaïde',      week:2,  surf:'hard',  tier:'atp250' },
  { name:'Auckland',      week:2,  surf:'hard',  tier:'atp250' },
  { name:'Melbourne',     week:3,  surf:'hard',  tier:'slam',  span:2 },

  /* ── Hiver européen et sud-américain ── */
  { name:'Montpellier',   week:5,  surf:'hard',  tier:'atp250' },
  { name:'Dallas',        week:5,  surf:'hard',  tier:'atp500' },
  { name:'Rotterdam',     week:6,  surf:'hard',  tier:'atp500' },
  { name:'Cordoba',       week:6,  surf:'clay',  tier:'atp250' },
  { name:'Doha',          week:6,  surf:'hard',  tier:'atp250' },
  { name:'Buenos Aires',  week:7,  surf:'clay',  tier:'atp250' },
  { name:'Marseille',     week:7,  surf:'hard',  tier:'atp250' },
  { name:'Delray Beach',  week:7,  surf:'hard',  tier:'atp250' },
  { name:'Dubaï',         week:8,  surf:'hard',  tier:'atp500' },
  { name:'Rio',           week:8,  surf:'clay',  tier:'atp500' },
  { name:'Acapulco',      week:9,  surf:'hard',  tier:'atp500' },
  { name:'Santiago',      week:9,  surf:'clay',  tier:'atp250' },

  /* ── Le « Sunshine Double » ── */
  { name:'Indian Wells',  week:10, surf:'hard',  tier:'m1000', span:2 },
  { name:'Miami',         week:12, surf:'hard',  tier:'m1000', span:2 },

  /* ── Tournée sur terre battue ── */
  { name:'Houston',       week:14, surf:'clay',  tier:'atp250' },
  { name:'Estoril',       week:14, surf:'clay',  tier:'atp250' },
  { name:'Marrakech',     week:14, surf:'clay',  tier:'atp250' },
  { name:'Monte-Carlo',   week:15, surf:'clay',  tier:'m1000' },
  { name:'Barcelone',     week:16, surf:'clay',  tier:'atp500' },
  { name:'Bucarest',      week:16, surf:'clay',  tier:'atp250' },
  { name:'Munich',        week:16, surf:'clay',  tier:'atp500' },
  { name:'Madrid',        week:17, surf:'clay',  tier:'m1000', span:2 },
  { name:'Rome',          week:19, surf:'clay',  tier:'m1000', span:2 },
  { name:'Genève',        week:21, surf:'clay',  tier:'atp250' },
  { name:'Hambourg',      week:21, surf:'clay',  tier:'atp500' },
  { name:'Lyon',          week:21, surf:'clay',  tier:'atp250' },
  { name:'Paris',         week:22, surf:'clay',  tier:'slam',  span:2 },

  /* ── Tournée sur gazon ── */
  { name:'Stuttgart',     week:24, surf:'grass', tier:'atp250' },
  { name:'Bois-le-Duc',   week:24, surf:'grass', tier:'atp250' },
  { name:'Halle',         week:25, surf:'grass', tier:'atp500' },
  { name:'Queen\'s',      week:25, surf:'grass', tier:'atp500' },
  { name:'Eastbourne',    week:26, surf:'grass', tier:'atp250' },
  { name:'Majorque',      week:26, surf:'grass', tier:'atp250' },
  { name:'Londres',       week:27, surf:'grass', tier:'slam',  span:2 },

  /* ── Été européen et américain ── */
  { name:'Bastad',        week:29, surf:'clay',  tier:'atp250' },
  { name:'Gstaad',        week:29, surf:'clay',  tier:'atp250' },
  { name:'Newport',       week:29, surf:'grass', tier:'atp250' },
  { name:'Umag',          week:30, surf:'clay',  tier:'atp250' },
  { name:'Kitzbühel',     week:30, surf:'clay',  tier:'atp250' },
  { name:'Atlanta',       week:30, surf:'hard',  tier:'atp250' },
  { name:'Washington',    week:31, surf:'hard',  tier:'atp500' },
  { name:'Los Cabos',     week:31, surf:'hard',  tier:'atp250' },
  { name:'Toronto',       week:32, surf:'hard',  tier:'m1000' },
  { name:'Cincinnati',    week:33, surf:'hard',  tier:'m1000' },
  { name:'Winston-Salem', week:34, surf:'hard',  tier:'atp250' },
  { name:'New York',      week:35, surf:'hard',  tier:'slam',  span:2 },

  /* ── Coupe Davis, phase de groupes ── */
  { name:'Coupe Davis — groupes', week:37, surf:'hard', tier:'davis', davisStage:'group' },

  /* ── Tournée asiatique ── */
  { name:'Chengdu',       week:38, surf:'hard',  tier:'atp250' },
  { name:'Hangzhou',      week:38, surf:'hard',  tier:'atp250' },
  { name:'Tokyo',         week:39, surf:'hard',  tier:'atp500' },
  { name:'Pékin',         week:39, surf:'hard',  tier:'atp500' },
  { name:'Shanghai',      week:40, surf:'hard',  tier:'m1000', span:2 },

  /* ── Salle européenne ── */
  { name:'Stockholm',     week:42, surf:'hard',  tier:'atp250' },
  { name:'Almaty',        week:42, surf:'hard',  tier:'atp250' },
  { name:'Bruxelles',     week:42, surf:'hard',  tier:'atp250' },
  { name:'Vienne',        week:43, surf:'hard',  tier:'atp500' },
  { name:'Anvers',        week:43, surf:'hard',  tier:'atp250' },
  { name:'Bâle',          week:43, surf:'hard',  tier:'atp500' },
  { name:'Paris-Bercy',   week:44, surf:'hard',  tier:'m1000' },
  { name:'Metz',          week:45, surf:'hard',  tier:'atp250' },
  { name:'Turin',         week:45, surf:'hard',  tier:'finals' },

  /* ── Coupe Davis, phase finale ── */
  { name:'Coupe Davis — finale', week:46, surf:'hard', tier:'davis', davisStage:'final' }
];

/* Les Jeux Olympiques n'ont lieu que tous les quatre ans, en plein ete,
   et remplacent la semaine 30. */
const OLYMPIC_START = 2028;
const OLYMPIC_EVERY = 4;
const OLYMPIC_WEEK  = 30;
const OLYMPIC_HOSTS = ['Los Angeles','Brisbane','Paris','Tokyo','Madrid','Le Cap','Doha','Toronto'];
function isOlympicYear(y){ return y >= OLYMPIC_START && (y - OLYMPIC_START) % OLYMPIC_EVERY === 0; }
function olympicHost(y){ return OLYMPIC_HOSTS[((y - OLYMPIC_START) / OLYMPIC_EVERY) % OLYMPIC_HOSTS.length]; }
function olympicSurface(y){ return ['hard','clay','hard','grass'][((y - OLYMPIC_START) / OLYMPIC_EVERY) % 4]; }


/* Villes utilisées pour générer le circuit secondaire. */
const CITY_POOL = {
  clay: ['Barletta','Todi','Perugia','Séville','Oeiras','Cordenons','Trieste','Vicence','Girone',
         'Santa Margherita','Bogotá','Salinas','Concepción','Tunis','Marrakech','Sassuolo','Zagreb',
         'Poznań','Manacor','Tarragone','Braga','Iasi','Bratislava','Grodzisk','Cassis','Roanne'],
  hard: ['Nur-Sultan','Almaty','Phoenix','Cleveland','Charlottesville','Drummondville','Playford',
         'Burnie','Bangkok','Yokohama','Kobe','Séoul','Zhuhai','Guangzhou','Antalya','Le Caire',
         'Doha','Sharm el-Sheikh','Monastir','Netanya','Helsinki','Ostrava','Brest','Koblenz',
         'Nottingham','Charleston','Wichita','Champaign','Tampere','Alkmaar'],
  grass: ['Ilkley','Nottingham','Surbiton','Bois-le-Duc','Mallorca','Eastbourne','Klosters']
};

/* ─────────────────────── STAFF ───────────────────────
   Chaque poste a plusieurs niveaux. cost = coût hebdomadaire en M€. */
/* ─────────────────────── FORMULES D'ENCADREMENT ───────────────────────
   Vingt et un postes à comparer une fois par an, avec des coûts hebdomadaires et
   des seuils de classement, c'était le plus lourd du jeu. On choisit désormais une
   ambition ; le jeu recrute au mieux dans chaque rôle selon ce que vous pouvez
   payer. Le réglage poste par poste reste accessible pour qui le veut. */
const STAFF_PACKS = [
  { id:'solo',   name:'Je me débrouille seul', icon:'🎒', max:0,
    desc:'Aucune charge, aucune aide. Vous n\'irez pas au bout de ce que vous aviez.' },
  { id:'petite', name:'Une petite équipe',     icon:'🚐', max:1,
    desc:'Un entraîneur de club, un préparateur, un kiné qui passe. Le strict nécessaire.' },
  { id:'vrai',   name:'Un vrai staff',         icon:'🏋️', max:2,
    desc:'Des professionnels reconnus à chaque poste, dès que vos moyens suivent.' },
  { id:'max',    name:'Le meilleur, quoi qu\'il en coûte', icon:'👑', max:9,
    desc:'Toujours le plus haut niveau accessible. Cher, et parfois hors de portée.' }
];

const STAFF_ROLES = [
  { k:'coach',  name:'Entraîneur',              icon:'🧢', desc:'Fait progresser le jeu et prépare les matchs.' },
  { k:'fit',    name:'Préparateur physique',    icon:'🏋️', desc:'Développe le physique et limite les blessures.' },
  { k:'physio', name:'Kinésithérapeute',        icon:'🩺', desc:'Accélère la récupération et la rééducation.' },
  { k:'mental', name:'Préparateur mental',      icon:'🧠', desc:'Améliore le sang-froid dans les moments décisifs.' },
  { k:'agent',  name:'Agent',                   icon:'💼', desc:'Décroche les sponsors et les invitations.' }
];

const STAFF = {
  /* `ceiling` relève (ou abaisse) le plafond de progression du joueur, en points de
     niveau. C'est ce qui fait qu'un encadrement se voit vraiment : sans lui, le coach
     ne changeait que la vitesse à laquelle on rejoignait un plafond de toute façon
     atteint au bout de quinze ans. Le talent reste le facteur dominant — au mieux
     l'équipe complète vaut +8, quand l'écart de talent entre deux joueurs fait 40. */
  coach: [
    { id:'c0', name:'Aucun entraîneur', lvl:0, cost:0,     desc:'Vous apprenez seul, en regardant les autres s\'entraîner.', fx:{ train:0.70, ceiling:-4 } },
    { id:'c1', name:'Entraîneur de club', lvl:1, cost:0.0006, desc:'Un ancien joueur régional, sérieux et disponible.', fx:{ train:1.00, ceiling:0 } },
    { id:'c2', name:'Technicien reconnu', lvl:2, cost:0.0028, desc:'A mené deux joueurs dans le top 50. Obsédé par le geste.', fx:{ train:1.28, tactic:2, ceiling:1 } },
    { id:'c3', name:'Ancien top 20', lvl:3, cost:0.0085, desc:'Il a joué des demi-finales de Chelem. Il sait ce qu\'il faut y faire.', fx:{ train:1.50, tactic:5, rep:3, ceiling:2 }, minRank:140 },
    { id:'c4', name:'Vainqueur de Grand Chelem', lvl:4, cost:0.023, desc:'Une légende accepte de vous suivre. Son carnet d\'adresses vaut de l\'or.', fx:{ train:1.72, tactic:8, rep:8, ceiling:3 }, minRank:35 }
  ],
  fit: [
    { id:'f0', name:'Aucun préparateur', lvl:0, cost:0, desc:'Vous courez seul, sans plan.', fx:{ phys:0.65, injury:1.30, ceiling:-2 } },
    { id:'f1', name:'Préparateur débutant', lvl:1, cost:0.0004, desc:'Jeune diplômé, plein de bonne volonté.', fx:{ phys:1.00, injury:1.00, ceiling:0 } },
    { id:'f2', name:'Préparateur confirmé', lvl:2, cost:0.0019, desc:'Vient de l\'athlétisme. Méthode dure, résultats nets.', fx:{ phys:1.30, injury:0.80, ceiling:1 } },
    { id:'f3', name:'Préparateur de haut niveau', lvl:3, cost:0.0062, desc:'Suivi GPS, charge individualisée, prévention permanente.', fx:{ phys:1.55, injury:0.60, ceiling:1 }, minRank:100 }
  ],
  physio: [
    { id:'p0', name:'Aucun kiné', lvl:0, cost:0, desc:'Vous vous soignez à la glace et à l\'ibuprofène.', fx:{ recover:0.75, rehab:0.85 } },
    { id:'p1', name:'Kiné à mi-temps', lvl:1, cost:0.0005, desc:'Présent sur les gros tournois seulement.', fx:{ recover:1.00, rehab:1.00 } },
    { id:'p2', name:'Kiné à plein temps', lvl:2, cost:0.0023, desc:'Voyage avec vous toute l\'année.', fx:{ recover:1.30, rehab:1.30 } },
    { id:'p3', name:'Équipe médicale', lvl:3, cost:0.0072, desc:'Kiné, ostéo et médecin du sport en coordination.', fx:{ recover:1.55, rehab:1.60, injury:0.85 }, minRank:60 }
  ],
  mental: [
    { id:'m0', name:'Aucun accompagnement', lvl:0, cost:0, desc:'Vous gérez ça tout seul. Comme tout le monde, avant.', fx:{} },
    { id:'m1', name:'Séances ponctuelles', lvl:1, cost:0.0004, desc:'Un rendez-vous par mois, en visio.', fx:{ clutch:2, moral:1 } },
    { id:'m2', name:'Préparateur attitré', lvl:2, cost:0.0018, desc:'Routines, respiration, gestion des points importants.', fx:{ clutch:5, moral:3 } },
    { id:'m3', name:'Psychologue du sport', lvl:3, cost:0.0055, desc:'Un suivi complet, y compris hors des courts.', fx:{ clutch:8, moral:6 }, minRank:80 }
  ],
  agent: [
    { id:'a0', name:'Vos parents',      lvl:0, cost:0, desc:'Ils gèrent les inscriptions et les billets d\'avion.', fx:{ sponsor:0.55 } },
    { id:'a1', name:'Petite agence',    lvl:1, cost:0.0003, desc:'Trois joueurs au portefeuille, beaucoup de bonne volonté.', fx:{ sponsor:1.00 } },
    { id:'a2', name:'Agence établie',   lvl:2, cost:0.0015, desc:'Elle sait négocier un contrat d\'équipementier.', fx:{ sponsor:1.45, wildcard:1 } },
    { id:'a3', name:'Grande agence',    lvl:3, cost:0.0048, desc:'Le carnet d\'adresses mondial, et 15 % de commission.', fx:{ sponsor:2.10, wildcard:2 }, minRank:50 }
  ]
};

/* ─────────────────────── ENTRAÎNEMENT ───────────────────────
   Une semaine sans tournoi = un bloc de travail à choisir.
   load : charge physique (fatigue + usure), gain : progression. */
const TRAININGS = [
  { id:'serve',  name:'Bloc service',        icon:'🚀', attrs:['srv'],            load:0.9, gain:1.55,
    desc:'Des centaines de services par jour. Le seul coup que personne ne peut vous empêcher de réussir.' },
  { id:'return', name:'Bloc retour',         icon:'🪃', attrs:['ret'],            load:0.9, gain:1.55,
    desc:'Machine à balles à 200 km/h, lecture des appuis, prise de balle avancée.' },
  { id:'ground', name:'Fond de court',       icon:'💥', attrs:['fh','bh'],        load:1.1, gain:1.15,
    desc:'Panier, tolérance, longueur de balle. Le pain quotidien.' },
  { id:'net',    name:'Jeu vers l\'avant',   icon:'🎯', attrs:['vol','fh'],       load:0.8, gain:1.20,
    desc:'Montées, volées, amorties. Ce que plus personne ne travaille.' },
  { id:'phys',   name:'Physique — explosivité', icon:'⚡', attrs:['spd'],         load:1.4, gain:1.45,
    desc:'Pliométrie, sprints, changements d\'appui. Cher payé en courbatures.' },
  { id:'endur',  name:'Physique — foncier',  icon:'🫁', attrs:['sta'],            load:1.3, gain:1.50,
    desc:'Volume, seuil, cinq heures dans les jambes. Ingrat et décisif.' },
  { id:'tactic', name:'Vidéo et tactique',   icon:'📼', attrs:['men','ret'],      load:0.3, gain:1.05,
    desc:'Analyser ses matchs et ceux des autres. Le travail qui ne se voit pas.' },
  { id:'mental', name:'Travail mental',      icon:'🧊', attrs:['men'],            load:0.2, gain:1.40,
    desc:'Routines entre les points, gestion de la pression, visualisation.' },
  { id:'rest',   name:'Récupération',        icon:'🛌', attrs:[],                 load:-2.6, gain:0,
    desc:'Ne rien faire. Soins, sommeil, famille. Parfois le meilleur investissement.' },
  { id:'lessons',name:'Donner des cours',    icon:'🎓', attrs:[],                 load:0.4, gain:0, money:true,
    desc:'Une semaine \u00e0 ramasser des balles pour des amateurs. Humiliant, \u00e9puisant, et \u00e7a paie le prochain billet d\'avion.' },
  { id:'exho',   name:'Exhibition',          icon:'💰', attrs:[],                 load:0.6, gain:0, money:true,
    desc:'Un match d\'exhibition payé. Bon pour le compte en banque, mauvais pour le corps.' }
];

/* ─────────────────────── AXES DE TRAVAIL ───────────────────────
   Huit blocs à départager chaque saison, c'était de la micro-optimisation : on
   demande maintenant une direction, et le jeu choisit dans le groupe le bloc dont
   les attributs sont le plus en retard. Les blocs détaillés existent toujours et
   restent pilotables semaine par semaine en carrière complète. */
const TRAIN_AXES = [
  { id:'jeu',      name:'Mon jeu',      icon:'🎾', of:['serve','return','ground','net'],
    desc:'Service, retour, fond de court, montée — selon ce qui pèche le plus.' },
  { id:'physique', name:'Mon physique', icon:'⚡', of:['phys','endur'],
    desc:'Vitesse et endurance. Dur pour le corps, décisif dans les cinquièmes sets.' },
  { id:'tete',     name:'Ma tête',      icon:'🧊', of:['tactic','mental'],
    desc:'Vidéo, routines, gestion de la pression. Peu de charge, effet lent.' },
  { id:'faible',   name:'Ma faiblesse', icon:'🎯', of:['serve','return','ground','net','phys','endur','tactic','mental'],
    desc:'Le jeu vise ce qui est le plus en retard, quel que soit le domaine.' }
];

/* Intensité du bloc : multiplie le gain et la charge. */
const INTENSITIES = [
  { id:'light',  name:'Légère',  mult:0.6, load:0.5 },
  { id:'normal', name:'Normale', mult:1.0, load:1.0 },
  { id:'hard',   name:'Intense', mult:1.45, load:1.7 }
];

/* ─────────────────────── PLANS DE SAISON (mode Express) ───────────────────────
   En mode Express on ne choisit plus semaine par semaine : on fixe une ligne
   pour l'année entière, et le circuit s'occupe du reste. */
const SEASON_PLANS = [
  { id:'points', name:'Chasser les points', icon:'🎯',
    desc:'Jouer tout ce qui est accessible, sans faire de vieux os. Le classement monte, le corps trinque.',
    freq:0.90, restFit:34, load:1.25 },
  { id:'slams',  name:'Tout pour les grands rendez-vous', icon:'🏆',
    desc:'Peu de tournois, une préparation millimétrée, un pic de forme quatre fois par an.',
    freq:0.52, restFit:58, load:0.80, majorsOnly:true },
  { id:'surface',name:'Miser sur ma surface', icon:'🎾',
    desc:'Concentrer la saison sur la surface où vous gagnez. Assumé, rentable, limité.',
    freq:0.70, restFit:46, load:0.95, surfaceFocus:true },
  { id:'money',  name:'Faire rentrer de l\'argent', icon:'💰',
    desc:'Tout jouer, et donner des cours les semaines creuses. On verra le classement plus tard.',
    freq:0.88, restFit:30, load:1.20, teach:true },
  { id:'body',   name:'Préserver le corps', icon:'🧊',
    desc:'Le minimum vital. Vous jouerez moins, mais vous jouerez plus longtemps.',
    freq:0.45, restFit:70, load:0.60 }
];

/* ─────────────────────── TACTIQUES DE MATCH ───────────────────────
   Choisies avant le match, modifiables à chaque set. */
const TACTICS = [
  { id:'balanced', name:'Jeu équilibré', icon:'⚖️',
    desc:'Ni prise de risque, ni passivité. Le plan par défaut.',
    fx:{ aggro:0, net:0, stam:0, err:0 } },
  { id:'attack',   name:'Prendre la balle tôt', icon:'⚔️',
    desc:'Raccourcir les échanges, monter dans le court. Plus de gagnants, plus de fautes.',
    fx:{ aggro:+0.16, net:+0.04, stam:-0.15, err:+0.05 } },
  { id:'defend',   name:'Reculer et user', icon:'🛡️',
    desc:'Allonger, croiser, fatiguer. On gagne au bout de la troisième heure.',
    fx:{ aggro:-0.16, net:-0.03, stam:+0.28, err:-0.05, oppStam:+0.22 } },
  { id:'serve',    name:'Miser sur le service', icon:'🚀',
    desc:'Tout sur la mise en jeu, et on verra bien en retour.',
    fx:{ srv:+0.030, ret:-0.020, stam:-0.05 } },
  { id:'return',   name:'Agresser le retour', icon:'🎯',
    desc:'Avancer sur la seconde balle, prendre tous les risques en retour.',
    fx:{ ret:+0.030, srv:-0.012, err:+0.04 } },
  { id:'net',      name:'Chercher le filet', icon:'🥅',
    desc:'Monter à la moindre balle courte. Points courts, nerfs solides.',
    fx:{ net:+0.22, aggro:+0.08, stam:+0.10, err:+0.03 } }
];

/* ─────────────────────── ZONES DU CORPS ───────────────────────
   Chacune a son propre état. Une zone dégradée finit par lâcher. */
const BODY_PARTS = [
  { k:'shoulder', name:'Épaule',   icon:'💪', from:['srv'],        heal:0.9 },
  { k:'elbow',    name:'Coude',    icon:'🦾', from:['fh','srv'],   heal:1.0 },
  { k:'wrist',    name:'Poignet',  icon:'✋', from:['fh','bh'],    heal:1.1 },
  { k:'back',     name:'Dos',      icon:'🦴', from:['srv','sta'],  heal:0.75 },
  { k:'hip',      name:'Hanche',   icon:'🦵', from:['spd','sta'],  heal:0.8 },
  { k:'knee',     name:'Genou',    icon:'🦿', from:['spd'],        heal:0.7 },
  { k:'ankle',    name:'Cheville', icon:'🦶', from:['spd'],        heal:1.3 }
];

/* Gravité des blessures : semaines d'arrêt et dégâts durables. */
const INJURY_LEVELS = [
  { id:'niggle', name:'Gêne',            weeks:[1,2],   damage:3,  label:'Une gêne à surveiller.' },
  { id:'strain', name:'Élongation',      weeks:[3,6],   damage:8,  label:'Une lésion musculaire nette.' },
  { id:'tear',   name:'Déchirure',       weeks:[7,14],  damage:16, label:'Une déchirure : la saison est compromise.' },
  { id:'severe', name:'Blessure grave',  weeks:[16,32], damage:26, label:'Opération et longue rééducation. Rien ne sera plus pareil.' }
];

/* ─────────────────────── SPONSORS ─────────────────────── */
const SPONSOR_TYPES = [
  { k:'racket',  name:'Raquette',      icon:'🎾', mult:1.0 },
  { k:'apparel', name:'Équipementier', icon:'👕', mult:1.6 },
  { k:'watch',   name:'Horloger',      icon:'⌚', mult:0.8, minRank:30 },
  { k:'car',     name:'Automobile',    icon:'🚗', mult:0.7, minRank:20 },
  { k:'bank',    name:'Banque',        icon:'🏦', mult:0.9, minRank:15 }
];

/* ─────────────────────── ÉQUILIBRAGE GLOBAL ─────────────────────── */
const BAL = {
  startYear: 2026,
  ageStart: 16,
  ageMax: 40,
  weeksPerYear: 46,          // 46 semaines de circuit + intersaison
  poolSize: 1150,             // taille du circuit simulé
  juniorsPerYear: 100,

  potMin: 56, potSpread: 36, potCurve: 2.5,
  // Le circuit garde sa pyramide serrée (potCurve 2.5) : c'est elle qui rend le
  // sommet difficile. Le joueur, lui, tire à plat — sans espoir crédible d'aller
  // haut, il n'y a pas de partie. Avec une courbe de 1.0, le potentiel médian est
  // de 77 et le talent nécessaire au top 10 sort dans une carrière sur six. Ce que
  // le joueur en fait dépend ensuite de son encadrement, plafonné à +4 (effPot).
  playerPotCurve: 1.0, playerPotSpread: 40,
  prodigyChance: 0.012, prodigyPot: [92, 98],
  peakAge: 26,

  // Économie, en M€
  weeklyBase: 0.0006,        // voyages, hôtels, cordages, inscriptions
  startMoney: 0.020,
  sponsorBase: 0.045,        // gains sponsors annuels de référence

  fatigueRecover: 13,        // points de fraîcheur récupérés par semaine de repos
  fatigueMatch: 3.0,         // fatigue par match, modulée par la durée
  trainGain: 0.75            // vitesse de progression générale
};
