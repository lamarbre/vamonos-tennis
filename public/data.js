/* ══════════════════════════════════════════════════════════════════════════
   VAMONOS TENNIS — Données de jeu
   Tout le contenu est ici. Le moteur (engine.js) ne contient aucun texte.
   Pour enrichir le jeu : ajouter des entrées dans EVENTS, MICRO, BADGES,
   CALENDAR. Rien d'autre à toucher.
   ══════════════════════════════════════════════════════════════════════════ */

const BRAND = {
  game: 'VAMONOS TENNIS',
  tagline: 'Écrivez votre légende du tennis',
  storeKey: 'matchpoint_v1'
};

/* ─────────────────────────── NATIONS ───────────────────────────
   mediaMult : notoriété et sponsors — un champion espagnol pèse plus
   médiatiquement qu'un champion kazakh, à palmarès égal.
   traditionMult : soutien de la fédération au démarrage.  */
const NATIONS = [
  { id:'fr', name:'France',        flag:'🇫🇷', code:'FRA', of:'français',    media:1.05, tradition:1.15, surf:{clay:3,hard:0,grass:-3} },
  { id:'es', name:'Espagne',       flag:'🇪🇸', code:'ESP', of:'espagnol',    media:1.05, tradition:1.25, surf:{clay:6,hard:-2,grass:-4} },
  { id:'it', name:'Italie',        flag:'🇮🇹', code:'ITA', of:'italien',     media:1.00, tradition:1.15, surf:{clay:4,hard:0,grass:-4} },
  { id:'sr', name:'Serbie',        flag:'🇷🇸', code:'SRB', of:'serbe',       media:0.85, tradition:0.95, surf:{clay:1,hard:1,grass:-2} },
  { id:'ch', name:'Suisse',        flag:'🇨🇭', code:'SUI', of:'suisse',      media:1.00, tradition:0.90, surf:{clay:-1,hard:0,grass:1} },
  { id:'us', name:'États-Unis',    flag:'🇺🇸', code:'USA', of:'américain',   media:1.30, tradition:1.20, surf:{clay:-4,hard:3,grass:1} },
  { id:'gb', name:'Royaume-Uni',   flag:'🇬🇧', code:'GBR', of:'britannique', media:1.20, tradition:1.05, surf:{clay:-4,hard:-1,grass:5} },
  { id:'de', name:'Allemagne',     flag:'🇩🇪', code:'ALL', of:'allemand',    media:1.10, tradition:1.10, surf:{clay:2,hard:0,grass:-2} },
  { id:'ar', name:'Argentine',     flag:'🇦🇷', code:'ARG', of:'argentin',    media:0.85, tradition:1.10, surf:{clay:6,hard:-2,grass:-4} },
  { id:'ru', name:'Russie',        flag:'🇷🇺', code:'RUS', of:'russe',       media:0.85, tradition:1.05, surf:{clay:-2,hard:3,grass:-1} },
  { id:'au', name:'Australie',     flag:'🇦🇺', code:'AUS', of:'australien',  media:1.00, tradition:1.05, surf:{clay:-4,hard:2,grass:2} },
  { id:'ca', name:'Canada',        flag:'🇨🇦', code:'CAN', of:'canadien',    media:0.95, tradition:0.95, surf:{clay:-3,hard:3,grass:0} },
  { id:'jp', name:'Japon',         flag:'🇯🇵', code:'JPN', of:'japonais',    media:1.10, tradition:0.85, surf:{clay:-1,hard:2,grass:-1} },
  { id:'cn', name:'Chine',         flag:'🇨🇳', code:'CHN', of:'chinois',     media:1.25, tradition:0.75, surf:{clay:-1,hard:3,grass:-2} },
  { id:'br', name:'Brésil',        flag:'🇧🇷', code:'BRE', of:'brésilien',   media:0.90, tradition:0.85, surf:{clay:5,hard:-1,grass:-4} },
  { id:'gr', name:'Grèce',         flag:'🇬🇷', code:'GRE', of:'grec',        media:0.80, tradition:0.75, surf:{clay:3,hard:0,grass:-3} },
  { id:'no', name:'Norvège',       flag:'🇳🇴', code:'NOR', of:'norvégien',   media:0.75, tradition:0.60, surf:{clay:4,hard:-1,grass:-3} },
  { id:'pl', name:'Pologne',       flag:'🇵🇱', code:'POL', of:'polonais',    media:0.85, tradition:0.80, surf:{clay:1,hard:1,grass:-2} },
  { id:'cz', name:'Tchéquie',      flag:'🇨🇿', code:'TCH', of:'tchèque',     media:0.80, tradition:1.00, surf:{clay:1,hard:0,grass:-1} },
  { id:'kz', name:'Kazakhstan',    flag:'🇰🇿', code:'KAZ', of:'kazakh',      media:0.65, tradition:0.70, surf:{clay:-1,hard:2,grass:-1} },
  { id:'tn', name:'Tunisie',       flag:'🇹🇳', code:'TUN', of:'tunisien',    media:0.70, tradition:0.55, surf:{clay:3,hard:0,grass:-3} },
  { id:'in', name:'Inde',          flag:'🇮🇳', code:'IND', of:'indien',      media:1.15, tradition:0.55, surf:{clay:-2,hard:1,grass:1} },
  { id:'ma', name:'Maroc',         flag:'🇲🇦', code:'MAR', of:'marocain',    media:0.70, tradition:0.60, surf:{clay:4,hard:-1,grass:-3} },
  { id:'nl', name:'Pays-Bas',      flag:'🇳🇱', code:'NED', of:'néerlandais', media:0.90, tradition:0.85, surf:{clay:-2,hard:0,grass:2} }
];

const NAME_POOLS = {
  fr:{f:['Lucas','Hugo','Théo','Enzo','Nathan','Maxence','Antonin','Rémi','Corentin','Aurélien'],
      m:['Léa','Camille','Manon','Chloé','Inès','Jade','Louise','Élise','Anaïs','Maëlys'],
      l:['Dupraz','Vasseur','Chevalier','Delaunay','Rouvière','Bastien','Lemoine','Fabre','Gauthier','Marchal']},
  es:{f:['Álvaro','Javier','Nicolás','Iker','Adrián','Sergio','Bruno','Aitor','Rubén','Marc'],
      m:['Paula','Carla','Lucía','Nuria','Ainhoa','Alba','Irene','Marta','Elsa','Vega'],
      l:['Salvador','Peñalver','Iriarte','Cabrera','Montoya','Escrivá','Quintana','Ledesma','Aranda','Bermejo']},
  it:{f:['Lorenzo','Flavio','Riccardo','Tommaso','Samuele','Elia','Davide','Cristian','Manuel','Alessio'],
      m:['Giulia','Martina','Elisa','Chiara','Nicole','Alice','Ludovica','Bianca','Greta','Miriam'],
      l:['Baldini','Recchia','Tortora','Valsecchi','Miraglia','Bonazzi','Solimena','Pastore','Ferrero','Gattuso']},
  sr:{f:['Miloš','Vukašin','Ognjen','Strahinja','Uroš','Lazar','Andrej','Vasilije','Nemanja','Bogdan'],
      m:['Nina','Ivana','Milica','Teodora','Sofija','Katarina','Anđela','Dunja','Iskra','Tijana'],
      l:['Milovanović','Radulović','Vukotić','Stanišić','Jeremić','Obradović','Pantelić','Aleksić','Todorović','Mitrović']},
  ch:{f:['Leandro','Jonas','Nicolas','Silvan','Timo','Loïc','Yann','Elias','Robin','Cédric'],
      m:['Jil','Ylena','Céline','Rebeka','Susan','Livia','Noémie','Alina','Fabienne','Anouk'],
      l:['Steinegger','Brunner','Kaufmann','Zbinden','Villard','Hostettler','Bregy','Amrein','Kessler','Furrer']},
  us:{f:['Colton','Bryce','Tanner','Wesley','Trevor','Landon','Chase','Grant','Devin','Miles'],
      m:['Peyton','Ashlyn','Hailey','Brooke','Raelyn','Sydney','Kendall','Marlowe','Quinn','Delaney'],
      l:['Whitfield','Ramsey','Calloway','Kessler','Brennan','Holloway','Marchetti','Sandoval','Pruitt','Lindqvist']},
  gb:{f:['Alfie','Ollie','Reuben','Callum','Josh','Toby','Marcus','Elliot','Rory','Finn'],
      m:['Maisie','Freya','Imogen','Poppy','Niamh','Lottie','Elsie','Bryony','Tamsin','Cerys'],
      l:['Ashworth','Pennington','Rowntree','Hartley','Callaghan','Fairbairn','Whitcombe','Ledger','Barnaby','Kilbride']},
  de:{f:['Fynn','Jonte','Lennard','Moritz','Tammo','Kilian','Bastian','Ruben','Malte','Silas'],
      m:['Nastasja','Jule','Lene','Annika','Merle','Frieda','Svenja','Marlene','Ronja','Thea'],
      l:['Reinhardt','Wieland','Osterloh','Kirchner','Brandtner','Seeliger','Hufnagel','Vollmer','Diekmann','Rothaug']},
  ar:{f:['Facundo','Bautista','Ignacio','Valentín','Tomás','Genaro','Lisandro','Ciro','Nahuel','Benjamín'],
      m:['Solana','Lourdes','Guillermina','Jazmín','Luisina','Milagros','Renata','Ámbar','Catalina','Delfina'],
      l:['Peralta','Bianchi','Olivera','Sardá','Quiroga','Manzur','Iturralde','Cardoso','Vergara','Bustamante']},
  ru:{f:['Timofey','Aslan','Egor','Savva','Matvey','Gleb','Rodion','Yaroslav','Artyom','Lev'],
      m:['Liudmila','Mirra','Polina','Alina','Zlata','Vasilisa','Taisiya','Nika','Regina','Yana'],
      l:['Vorontsov','Zhilin','Kabanov','Prokhorov','Melnikov','Tarasenko','Zubarev','Golitsyn','Ryzhkov','Sotnikov']},
  au:{f:['Jarrah','Kai','Lachlan','Riley','Beau','Hudson','Archer','Flynn','Digby','Marlow'],
      m:['Storm','Talia','Priscilla','Astra','Indi','Ashby','Sunday','Bronte','Marli','Tamsyn'],
      l:['Kirkwood','Beauchamp','Whitlam','Corrigan','Mundine','Hargrave','Talbot','Fenwick','Rossiter','Doolan']},
  ca:{f:['Émile','Gabriel','Cleeve','Théodore','Liam','Noah','Xavier','Malcolm','Rowan','Étienne'],
      m:['Layne','Cadence','Marina','Ariana','Rosalie','Wren','Juniper','Océane','Sloane','Maeve'],
      l:['Beaulieu','Kavanagh','Ouimet','Winterhalt','Levasseur','Brisebois','Charbonneau','Hollingsworth','Nadeau','Tremblay']},
  jp:{f:['Sōta','Riku','Kaito','Haruto','Ren','Yūto','Asahi','Sōma','Itsuki','Hinata'],
      m:['Himeno','Aoi','Kyōka','Tsumugi','Sakura','Mio','Rinka','Nagisa','Hikari','Wakana'],
      l:['Kurosawa','Tachibana','Mizuhara','Ogiwara','Sakuragi','Hasumi','Todoroki','Kirishima','Shinomiya','Katayama']},
  cn:{f:['Zhenyu','Haoran','Yuchen','Jiaxu','Ruifeng','Bowen','Zilong','Kaiyuan','Tianyi','Wenhao'],
      m:['Yuxin','Ruoxue','Meiling','Lanxi','Jiayi','Xinran','Zhilan','Yueying','Shuning','Hanyu'],
      l:['Xiang','Kang','Mou','Rao','Sui','Tang','Yao','Ning','Qiao','Lou']},
  br:{f:['Enzo','Bernardo','Caio','Vinícius','Otávio','Murilo','Ravi','Théo','Ícaro','Benício'],
      m:['Thaísa','Ingrid','Rebeca','Vitória','Antonella','Manuela','Lívia','Cecília','Isadora','Nayara'],
      l:['Bittencourt','Vasconcelos','Frota','Camargo','Rezende','Assunção','Portela','Toledo','Bandeira','Queiroz']},
  gr:{f:['Aristotelis','Charalampos','Thanasis','Orestis','Fotis','Iasonas','Panagiotis','Nestor','Loukas','Grigoris'],
      m:['Sapfo','Despina','Valentini','Anthi','Kalliopi','Eirini','Myrto','Zoi','Thalia','Fotini'],
      l:['Vlachopoulos','Deligiannis','Rousakis','Fotiadis','Mavridis','Stergiou','Kanellos','Portokalis','Anagnostou','Zervas']},
  no:{f:['Sander','Herman','Vetle','Eskil','Håkon','Torbjørn','Brede','Jørgen','Aksel','Kristoffer'],
      m:['Vilde','Sigrid','Amalie','Ingeborg','Maren','Thea','Solveig','Frøya','Live','Hedda'],
      l:['Storhaug','Gundersen','Kvalheim','Nordstrøm','Aabakken','Bjørnstad','Lysgård','Rønning','Haugland','Sætre']},
  pl:{f:['Wojciech','Bartosz','Przemysław','Mateusz','Krystian','Igor','Szymon','Dawid','Oskar','Tymon'],
      m:['Weronika','Zuzanna','Martyna','Alicja','Kalina','Oliwia','Nadia','Blanka','Helena','Roksana'],
      l:['Grabowiecki','Sosnowski','Baranowski','Wieczorek','Zaremba','Kołodziej','Piotrowicz','Kucharski','Radecki','Malinowski']},
  cz:{f:['Dalibor','Vojtěch','Kryštof','Matyáš','Radim','Štěpán','Vilém','Bohdan','Marek','Oldřich'],
      m:['Vendula','Květa','Radka','Anežka','Zdeňka','Bohumila','Kristýna','Michaela','Simona','Alžběta'],
      l:['Havránek','Vrabec','Kolibáč','Doležal','Křivánek','Bartoň','Hrubeš','Pospíšil','Valenta','Šír']},
  kz:{f:['Beibit','Nurlan','Zangar','Amir','Yerkebulan','Daniyar','Alisher','Temirlan','Sanzhar','Askar'],
      m:['Gozal','Aruzhan','Zarina','Dinara','Aiym','Madina','Symbat','Ayaulym','Zhanel','Karina'],
      l:['Toleubek','Sagyndyk','Baiseitov','Nurgaliyev','Amanzhol','Karimov','Yesenov','Zhaksylyk','Serikbay','Omarov']},
  tn:{f:['Skander','Aziz','Firas','Hedi','Slim','Nizar','Wassim','Chedi','Ghassen','Oussema'],
      m:['Chiraz','Rania','Sarra','Amira','Farah','Mariem','Emna','Dorra','Hiba','Khouloud'],
      l:['Ben Amor','Cherif','Zouari','Belhadj','Msaddek','Hammami','Ghariani','Baccar','Sassi','Rekik']},
  in:{f:['Sasikumar','Digvijay','Aryan','Kabir','Vihaan','Rudra','Aarav','Nikhil','Tejas','Ishaan'],
      m:['Prarthana','Shrivalli','Vaidehi','Sahaja','Aditi','Meghna','Ridhi','Tanvi','Ishita','Suhani'],
      l:['Venkatesh','Chatterjee','Deshmukh','Raghunathan','Ahluwalia','Iyengar','Bhattacharya','Sundaram','Kulkarni','Mahajan']},
  ma:{f:['Yassine','Reda','Walid','Zakaria','Anas','Ilyas','Othmane','Nabil','Hamza','Soufiane'],
      m:['Diae','Ghita','Malak','Nada','Rim','Imane','Wiam','Kenza','Hajar','Salma'],
      l:['El Ghazouani','Bouhlal','Sekkat','Amrani','Ouazzani','Lahlou','Cherkaoui','Belmekki','Zerhouni','Tazi']},
  nl:{f:['Sem','Daan','Jesper','Gijs','Bram','Stijn','Thijs','Ruben','Joep','Mees'],
      m:['Isis','Merel','Britt','Fleur','Anouk','Sanne','Femke','Roos','Nienke','Lieke'],
      l:['Van Beek','Roozendaal','Van Hoorn','Verhoeven','Slootweg','Van Nistel','Beekman','Oosterhuis','Ten Cate','Dral']}
};

/* ─────────────────────────── ORIGINES ───────────────────────────
   Le point de depart : attributs a 16 ans, reputation, argent, surfaces. */
const ORIGINS = [
  { id:'academy', name:'Académie américaine', icon:'🏫',
    desc:'Internat, courts à perte de vue, 40 000 € par an que vos parents n\'avaient pas vraiment.',
    attrs:{ srv:50, ret:47, fh:52, bh:49, vol:44, spd:48, sta:46, men:44 },
    rep:14, money:-0.006, surf:{ hard:3, clay:-2, grass:-1 } },

  { id:'family', name:'Club familial', icon:'🏡',
    desc:'Votre père vous met une raquette dans la main à 3 ans. Il sera votre entraîneur — et le problème.',
    attrs:{ srv:45, ret:50, fh:52, bh:51, vol:47, spd:47, sta:45, men:47 },
    rep:6, flag:'father_coach', surf:{ clay:2, hard:-1, grass:-1 } },

  { id:'federal', name:'Centre national', icon:'🎽',
    desc:'Repéré à 12 ans par la fédération. Encadrement d\'État, pression d\'État.',
    attrs:{ srv:48, ret:49, fh:49, bh:49, vol:48, spd:50, sta:50, men:45 },
    rep:18, surf:{} },

  { id:'street', name:'Court public fissuré', icon:'🧱',
    desc:'Un mur, une raquette de récupération, aucun plan B. Le tennis ne devait jamais être pour vous.',
    attrs:{ srv:47, ret:48, fh:54, bh:44, vol:42, spd:53, sta:52, men:41 },
    rep:2, money:-0.004, surf:{ hard:2, clay:-1, grass:-1 } },

  { id:'late', name:'Venu d\'un autre sport', icon:'🔄',
    desc:'Football, athlétisme, hockey — vous avez commencé le tennis à 14 ans. Physiquement, vous êtes déjà ailleurs.',
    attrs:{ srv:53, ret:42, fh:46, bh:42, vol:46, spd:55, sta:57, men:44 },
    rep:4, surf:{ grass:2, clay:-1, hard:-1 }, potBonus:2 }
];

const LIFESTYLES = [
  { id:'monk', name:'Vie de moine', icon:'🥗',
    desc:'Sommeil compté, diète stricte, kiné trois fois par semaine. Une existence de laboratoire.',
    fx:{ disc:18, form:6, body:8, rep:-4 }, potBonus:2 },
  { id:'balanced', name:'Équilibré', icon:'⚖️',
    desc:'Rigoureux à l\'entraînement, humain en dehors. Ni machine, ni touriste.',
    fx:{ disc:6, mor:6 }, potBonus:0 },
  { id:'star', name:'Vivre le circuit', icon:'🍾',
    desc:'Les soirées, les hôtels, les réseaux. À quoi bon voyager dans le monde entier pour ne voir que des courts ?',
    fx:{ disc:-12, rep:10, mor:8, body:-6 }, potBonus:-2 }
];

const TRAITS = {
  clutch:   { name:'Sang-froid',      icon:'🧊', desc:'Ingérable dans les moments décisifs.', clutch:5 },
  marathon: { name:'Marathonien',     icon:'🏃', desc:'Plus le match dure, plus vous êtes fort.', clutch:3, p:2 },
  glass:    { name:'Corps de verre',  icon:'🩼', desc:'Votre corps rend les armes trop souvent.', injury:1.7 },
  showman:  { name:'Showman',         icon:'🎭', desc:'Le public paie pour vous voir. Les sponsors aussi.', repYear:5, sponsor:1.3 },
  hothead:  { name:'Tête brûlée',     icon:'🔥', desc:'Raquettes cassées, amendes, arbitres insultés.', clutch:-2, repYear:2 },
  grinder:  { name:'Bosseur',         icon:'⚒️', desc:'Le premier arrivé, le dernier parti.', growth:1.12 },
  prodigy:  { name:'Génie précoce',   icon:'✨', desc:'Un talent qui saute aux yeux dès l\'échauffement.', growth:1.1 },
  nervous:  { name:'Nerveux',         icon:'😰', desc:'Les balles de match se transforment en gouffre.', clutch:-4 },
  zen:      { name:'Zen',             icon:'🧘', desc:'Rien ne vous atteint. Ni le public, ni le score.', clutch:2, mor:1 },
  warrior:  { name:'Guerrier',        icon:'⚔️', desc:'Vous ne lâchez jamais un point. Jamais.', clutch:3, p:1 }
};

/* ─────────────────────────── LE CIRCUIT ───────────────────────────
   pts / prize : indexés par nombre de tours gagnés (0 = battu d'entrée).
   field : niveau du premier adversaire ; step : progression par tour.  */

/* ─────────────────────────── DISTINCTIONS ─────────────────────────── */
const AWARDS = {
  no1_year:   { name:'N°1 mondial en fin d\'année', icon:'👑', score:16 },
  breakthrough:{ name:'Révélation de l\'année',     icon:'💫', score:3 },
  comeback:   { name:'Retour de l\'année',          icon:'🔙', score:3 },
  sportsman:  { name:'Prix du fair-play',           icon:'🤝', score:1 },
  fanfav:     { name:'Joueur préféré du public',    icon:'❤️', score:2 }
};

/* ─────────────────────────── ÉVÉNEMENTS ───────────────────────────
   cond : aMin/aMax (âge), rMin/rMax (classement, rMax=meilleur classement requis),
          minMor/maxMor, minRep, flag, noFlag, style, surface
   fx   : f s p m (stats) · rep mor form body disc · money · inj (semaines)
          trait · flag · clay/hard/grass (affinités) · pts (points bonus)          */
const EVENTS = [

/* ══ JUNIORS / DÉBUTS ══ */
{ id:'ev_school', cat:'Vie perso', icon:'🎒', w:16, cond:{aMax:17},
  text:'Le proviseur convoque vos parents : « Avec 14 semaines d\'absence, il faut choisir. Le tennis ou le bac. » Votre mère vous regarde sans rien dire.',
  options:[
    { label:'Tout miser sur le tennis', hint:'Risqué', outcomes:[
      { weight:52, text:'Vous quittez le lycée. Le temps libéré part intégralement sur le court — trois heures de plus par jour, tous les jours.', fx:{f:4,p:3,mor:4} },
      { weight:30, text:'Vous quittez le lycée. Six mois plus tard, une entorse vous cloue trois mois et le vide est vertigineux.', fx:{f:2,mor:-10,inj:10} },
      { weight:18, text:'Vous quittez le lycée, et la pression de n\'avoir aucun plan B vous écrase les jours de match.', fx:{f:3,m:-4,mor:-6,flag:'no_planb'} }
    ]},
    { label:'Garder les études en parallèle', hint:'Prudent', outcomes:[
      { weight:55, text:'Nuits courtes, week-ends en tournoi, devoirs dans les trains. Vous apprenez surtout à souffrir sans vous plaindre.', fx:{m:5,disc:6,p:-2} },
      { weight:45, text:'Le double programme vous épuise. Vos résultats stagnent, mais vous dormez sans angoisse.', fx:{m:4,mor:5,f:-1,form:-4} }
    ]}
  ]},

{ id:'ev_first_racket', cat:'Sponsors', icon:'🎾', w:12, cond:{aMin:16,aMax:20},
  text:'Un équipementier de second rang propose votre premier contrat : raquettes, cordages et 8 000 € par an. En échange, vous jouez avec leur modèle — qui ne vous convient pas vraiment.',
  options:[
    { label:'Signer, l\'argent est vital', outcomes:[
      { weight:60, text:'Vous vous adaptez au cadre en deux mois. Huit mille euros, à ce niveau, c\'est une saison entière de voyages.', fx:{money:0.03,f:-1} },
      { weight:40, text:'Le cadre ne vous ira jamais vraiment. Votre coup droit perd en précision toute l\'année.', fx:{money:0.03,f:-3,mor:-4} }
    ]},
    { label:'Refuser et garder votre raquette', hint:'Fidélité', outcomes:[
      { weight:55, text:'Vous jouez avec votre matériel. Le compte en banque souffre, le coup droit remercie.', fx:{f:3,money:-0.02} },
      { weight:45, text:'Vous refusez, et l\'équipementier vous raye de sa liste pour de bon. Personne d\'autre ne viendra avant longtemps.', fx:{f:2,money:-0.03,flag:'no_sponsor'} }
    ]}
  ]},

{ id:'ev_money_broke', cat:'Argent', icon:'💸', w:18, cond:{aMin:17,aMax:25,rMin:180},
  text:'Le calcul est simple et brutal : entre les vols, les hôtels, les cordages et le kiné, vous perdez de l\'argent chaque mois. Votre compte est à découvert de 4 200 €.',
  options:[
    { label:'Emprunter à vos parents', outcomes:[
      { weight:55, text:'Ils vident leur épargne sans hésiter. Vous ne le leur avez pas demandé — ils ont proposé. Ce poids-là ne se rembourse pas.', fx:{money:0.05,m:3,mor:-5,flag:'family_debt'} },
      { weight:45, text:'Ils refusent, pour la première fois. « On y croit, mais on n\'a plus rien. » La conversation dure onze minutes.', fx:{mor:-10,m:5} }
    ]},
    { label:'Donner des cours en club l\'hiver', hint:'Terre à terre', outcomes:[
      { weight:60, text:'Vingt heures par semaine à ramasser des balles pour des retraités. L\'entraînement en pâtit, le compte respire.', fx:{money:0.04,f:-2,p:-2,mor:-3} },
      { weight:40, text:'Un de vos élèves, chef d\'entreprise, décide de vous sponsoriser à titre personnel. 15 000 € par an, sans contrepartie.', fx:{money:0.09,rep:2,flag:'patron'} }
    ]},
    { label:'Réduire drastiquement le calendrier', outcomes:[
      { weight:100, text:'Vous ne jouerez que les tournois accessibles en train. Moins de points, moins de dettes.', fx:{mor:-4,body:6,flag:'small_cal'} }
    ]}
  ]},

/* ══ CORPS ══ */
{ id:'ev_back', cat:'Corps', icon:'🦴', w:13, cond:{aMin:19,aMax:34},
  text:'Le dos bloque au réveil depuis trois semaines. L\'IRM montre une hernie discale débutante. Le chirurgien propose l\'opération ; le kiné jure qu\'on peut gérer sans.',
  options:[
    { label:'Opérer maintenant', hint:'Radical', outcomes:[
      { weight:55, text:'Cinq mois d\'arrêt. Vous revenez avec un dos neuf et une saison blanche.', fx:{inj:22,p:4,body:14,mor:-8} },
      { weight:30, text:'L\'opération se passe bien mais la reprise est interminable. Le service ne sera plus jamais tout à fait le même.', fx:{inj:26,s:-4,body:10,mor:-10} },
      { weight:15, text:'Un chirurgien remarquable, une rééducation parfaite. Vous revenez plus fort qu\'avant.', fx:{inj:18,p:6,body:18,m:3} }
    ]},
    { label:'Gérer avec les infiltrations', hint:'Court terme', outcomes:[
      { weight:45, text:'Vous jouez la saison sous infiltrations. Ça tient. Vous ne savez pas à quel prix.', fx:{body:-12,mor:3,trait:'warrior'} },
      { weight:35, text:'Le dos lâche en plein tournoi. Abandon en direct, et deux mois d\'arrêt de toute façon.', fx:{inj:9,body:-15,mor:-8} },
      { weight:20, text:'Le protocole fonctionne au-delà des espérances. Vous finissez la saison sans une gêne.', fx:{body:-4,p:2,mor:5} }
    ]}
  ]},

{ id:'ev_wrist', cat:'Corps', icon:'✋', w:10, cond:{aMin:18,aMax:32},
  text:'Le poignet siffle à chaque coup droit lifté depuis deux mois. Personne dans votre staff n\'ose prononcer le mot « chronique ».',
  options:[
    { label:'Modifier votre coup droit pour soulager', outcomes:[
      { weight:60, text:'Six semaines à réapprendre un geste que vous faisiez depuis vingt ans. C\'est moins joli, ça ne fait plus mal.', fx:{f:-3,p:4,body:10,m:3} },
      { weight:40, text:'Le nouveau geste ne prend jamais. Vous naviguez entre deux coups droits, sans en maîtriser aucun.', fx:{f:-5,mor:-6} }
    ]},
    { label:'Serrer les dents jusqu\'à la fin de saison', outcomes:[
      { weight:50, text:'Vous finissez la saison. La trêve hivernale suffit à tout remettre en place.', fx:{body:-6,mor:2,trait:'warrior'} },
      { weight:50, text:'La rupture partielle arrive en septembre. Quatre mois, et un coup droit à reconstruire.', fx:{inj:17,f:-4,body:-10,trait:'glass'} }
    ]}
  ]},

/* ══ MENTAL ══ */
{ id:'ev_choke', cat:'Mental', icon:'😰', w:14, cond:{aMin:19,aMax:33,rMax:200},
  text:'Troisième fois cette saison : mené 5-2 dans le troisième set, vous remontez à 5-5… puis vous perdez huit points de suite. La presse a trouvé son angle.',
  options:[
    { label:'Consulter un préparateur mental', outcomes:[
      { weight:60, text:'Trois séances par semaine pendant six mois. Ce n\'est pas magique, c\'est méthodique — et ça marche.', fx:{m:7,money:-0.03,trait:'zen'} },
      { weight:40, text:'Vous n\'accrochez pas avec sa méthode. Six mois et 12 000 € pour comprendre que le problème est ailleurs.', fx:{m:2,money:-0.03,mor:-4} }
    ]},
    { label:'Le nier publiquement', hint:'Orgueil', outcomes:[
      { weight:50, text:'« Je n\'ai aucun problème mental. » La conférence de presse fait le tour du circuit. La question revient à chaque tournoi.', fx:{rep:3,m:-4,mor:-3,trait:'hothead'} },
      { weight:50, text:'Vous le niez, puis vous gagnez trois matchs serrés d\'affilée. Le sujet meurt de lui-même.', fx:{m:5,rep:4,mor:6} }
    ]},
    { label:'L\'assumer publiquement', hint:'Courageux', outcomes:[
      { weight:65, text:'Votre franchise désarme tout le monde. Trois joueurs du top 50 vous écrivent en privé le soir même.', fx:{m:5,mor:8,rep:5} },
      { weight:35, text:'Certains adversaires se souviendront que vous avez avoué votre faiblesse. Ils la chercheront.', fx:{m:3,mor:5,rep:2,flag:'known_choker'} }
    ]}
  ]},

{ id:'ev_burnout', cat:'Mental', icon:'🕳️', w:11, cond:{aMin:21,aMax:34,maxMor:34},
  text:'Vous avez joué 82 matchs cette année, dormi dans 41 hôtels, et vous ne savez plus dans quelle ville vous êtes au réveil. Vous n\'avez plus envie de toucher une raquette.',
  options:[
    { label:'Tout arrêter trois mois', hint:'Courageux', outcomes:[
      { weight:70, text:'Trois mois loin des courts. Vous retrouvez l\'envie quelque part entre le deuxième et le troisième. Le classement chute, la tête revient.', fx:{mor:26,m:8,body:12,pts:-0.35} },
      { weight:30, text:'Trois mois d\'arrêt, et l\'envie ne revient jamais complètement. Quelque chose s\'est cassé cette année-là.', fx:{mor:14,m:4,pts:-0.4,flag:'lost_spark'} }
    ]},
    { label:'Continuer, c\'est le métier', outcomes:[
      { weight:45, text:'Vous enchaînez. Les résultats plongent, les regards du staff changent.', fx:{form:-12,mor:-8,m:-3} },
      { weight:35, text:'L\'épuisement se transforme en blessure. Le corps a trouvé le moyen de vous imposer la pause.', fx:{inj:12,mor:-4,body:-8} },
      { weight:20, text:'Vous traversez le tunnel. À la sortie, vous êtes plus dur que jamais.', fx:{m:9,mor:6,trait:'warrior'} }
    ]}
  ]},

/* ══ ENTRAÎNEUR / ÉQUIPE ══ */
{ id:'ev_coach_clash', cat:'Équipe', icon:'🗯️', w:13, cond:{aMin:19,aMax:34},
  text:'Votre entraîneur veut reconstruire votre service de zéro : « Six mois de résultats catastrophiques, puis dix ans de bénéfices. » Vous êtes à trois mois d\'une grosse échéance.',
  options:[
    { label:'Accepter la reconstruction', hint:'Long terme', outcomes:[
      { weight:55, text:'Six mois d\'horreur, exactement comme annoncé. Puis le service devient une arme.', fx:{s:8,form:-14,pts:-0.2,mor:-5} },
      { weight:30, text:'La reconstruction ne prend jamais. Vous perdez votre ancien service sans gagner le nouveau.', fx:{s:-3,form:-10,mor:-8} },
      { weight:15, text:'Le nouveau mouvement se met en place en trois semaines. Personne ne comprend pourquoi ça a été si simple.', fx:{s:10,m:3,mor:6} }
    ]},
    { label:'Refuser, pas maintenant', outcomes:[
      { weight:60, text:'Vous gardez votre service. Il garde son idée. La relation prend un coup mais la saison est sauvée.', fx:{form:4,mor:-3} },
      { weight:40, text:'Il claque la porte trois semaines plus tard. Vous finirez la saison seul.', fx:{form:-6,mor:-8,flag:'coach_gone'} }
    ]}
  ]},

{ id:'ev_new_coach', cat:'Équipe', icon:'🤝', w:12, cond:{aMin:21,aMax:35,rMax:80},
  text:'Un entraîneur réputé, qui a mené deux joueurs dans le top 5, se libère. Il demande 18 % de vos gains et un contrôle total sur votre calendrier.',
  options:[
    { label:'Accepter ses conditions', hint:'Cher', outcomes:[
      { weight:55, text:'Il tient parole. En dix-huit mois, votre jeu devient méconnaissable — dans le bon sens.', fx:{f:4,m:5,money:-0.15,rep:4} },
      { weight:45, text:'Le courant ne passe jamais. Dix mois, beaucoup d\'argent, et un joueur perdu tactiquement.', fx:{m:-3,money:-0.18,mor:-6} }
    ]},
    { label:'Négocier à la baisse', outcomes:[
      { weight:50, text:'Il accepte 10 %, mais gardera un autre joueur en parallèle. Vous ne serez jamais sa priorité.', fx:{f:2,m:2,money:-0.07} },
      { weight:50, text:'Il refuse net et prend un autre joueur — qui entrera dans le top 10 l\'année suivante.', fx:{mor:-6,m:2} }
    ]},
    { label:'Rester avec votre équipe actuelle', hint:'Fidélité', outcomes:[
      { weight:100, text:'Vous restez avec les gens qui étaient là dans les Challengers. Ça vaut peut-être plus que deux places au classement.', fx:{mor:9,m:3,form:3} }
    ]}
  ]},

{ id:'ev_father_coach', cat:'Équipe', icon:'👨', w:14, cond:{aMin:18,aMax:26,flag:'father_coach'},
  text:'Votre père vous entraîne depuis vos 4 ans. Le circuit murmure qu\'il vous freine. Après une nouvelle défaite au premier tour, il hurle sur vous dans le couloir des vestiaires, devant trois joueurs du top 20.',
  options:[
    { label:'Le remercier, prendre un vrai staff', hint:'Brutal', outcomes:[
      { weight:55, text:'La conversation dure vingt minutes et vous coûte deux ans de relation. Techniquement, la progression est immédiate.', fx:{f:5,m:4,mor:-14,flag:'father_out'} },
      { weight:45, text:'Il part sans un mot et ne remettra plus jamais les pieds dans un stade. Vous progressez. Vous ne savez pas si ça valait le coup.', fx:{f:4,m:6,mor:-18,flag:'father_out'} }
    ]},
    { label:'Le garder, en redéfinissant les rôles', outcomes:[
      { weight:60, text:'Il devient « manager », un technicien arrive à ses côtés. La cohabitation fonctionne mieux que prévu.', fx:{f:3,m:2,mor:5} },
      { weight:40, text:'Les rôles se redéfinissent sur le papier seulement. Rien ne change vraiment.', fx:{m:-2,mor:-4} }
    ]},
    { label:'Ne rien changer', hint:'Loyauté', outcomes:[
      { weight:100, text:'Il vous a amené là où vous êtes. Le circuit peut penser ce qu\'il veut.', fx:{mor:8,m:3,f:-2,flag:'father_forever'} }
    ]}
  ]},

/* ══ CIRCUIT / TACTIQUE ══ */
{ id:'ev_surface_choice', cat:'Circuit', icon:'🎯', w:14, cond:{aMin:20,aMax:31},
  text:'Votre entraîneur pose les chiffres sur la table : « Sur cette surface, tu gagnes 71 % de tes matchs. Sur les autres, 44 %. On arrête de faire semblant ? »',
  options:[
    { label:'Se spécialiser à fond', hint:'Assumé', outcomes:[
      { weight:100, text:'Toute la préparation, tout le calendrier, tout le jeu tournent désormais autour d\'une seule surface.', fx:{bestSurf:6,otherSurf:-2,mor:4} }
    ]},
    { label:'Travailler les surfaces faibles', hint:'Ambitieux', outcomes:[
      { weight:55, text:'Deux hivers à réapprendre à glisser, à monter au filet, à jouer bas. Le niveau global monte.', fx:{worstSurf:5,f:2,form:-4} },
      { weight:45, text:'Vous vous éparpillez. À force de vouloir être partout, vous n\'êtes plus vraiment nulle part.', fx:{worstSurf:2,bestSurf:-3,mor:-4} }
    ]}
  ]},

{ id:'ev_wildcard', cat:'Circuit', icon:'🎫', w:12, cond:{aMin:17,aMax:24,rMin:120},
  text:'Le directeur d\'un tournoi ATP vous propose une wild-card. Il précise, en souriant à moitié : « Ce serait bien que tu joues nos exhibitions cet hiver, aussi. »',
  options:[
    { label:'Accepter le package', outcomes:[
      { weight:55, text:'Le tableau principal d\'un ATP à 19 ans, et deux exhibitions payées en janvier. On commence par là.', fx:{pts:0.12,money:0.04,rep:4} },
      { weight:45, text:'Vous perdez au premier tour 6-1 6-2. Et vous devez quand même les exhibitions.', fx:{money:0.03,mor:-6,rep:1} }
    ]},
    { label:'Refuser les conditions', hint:'Intègre', outcomes:[
      { weight:60, text:'Vous jouez les qualifications comme tout le monde — et vous les passez.', fx:{pts:0.08,m:4,rep:2} },
      { weight:40, text:'Qualifications perdues au dernier tour. Le directeur ne vous rappellera plus jamais.', fx:{mor:-6,m:3,flag:'no_wildcards'} }
    ]}
  ]},

{ id:'ev_tank', cat:'Circuit', icon:'🏳️', w:9, cond:{aMin:20,aMax:34},
  text:'Mené 6-0 3-0, cheville douloureuse, avec un tournoi bien plus important dans dix jours. Le vestiaire connaît la règle non écrite : on ne dit jamais qu\'on a lâché.',
  options:[
    { label:'Abandonner et préserver le corps', outcomes:[
      { weight:60, text:'Abandon à 3-0. Personne n\'est dupe, mais vous arrivez frais au tournoi suivant.', fx:{body:8,form:6,rep:-4} },
      { weight:40, text:'L\'ATP ouvre une enquête pour « manque de compétitivité ». Amende de 25 000 €.', fx:{money:-0.025,rep:-7,body:6} }
    ]},
    { label:'Aller au bout, par principe', outcomes:[
      { weight:55, text:'6-0 6-1, une heure d\'humiliation en direct. Le public applaudit quand même à la sortie.', fx:{rep:3,m:3,body:-6} },
      { weight:45, text:'La cheville lâche complètement au deuxième set. Quatre semaines d\'arrêt pour un match perdu.', fx:{inj:5,body:-10,rep:2} }
    ]}
  ]},

/* ══ MÉDIAS / NOTORIÉTÉ ══ */
{ id:'ev_doc', cat:'Médias', icon:'🎬', w:11, cond:{aMin:22,aMax:35,minRep:45},
  text:'Une plateforme de streaming veut vous suivre pendant une saison entière. Caméras dans le vestiaire, dans la chambre d\'hôtel, dans les conversations avec votre coach.',
  options:[
    { label:'Tout ouvrir, jouer le jeu à fond', hint:'Exposition', outcomes:[
      { weight:55, text:'Le documentaire cartonne. Vous devenez le visage du tennis pour des millions de gens qui n\'en regardaient pas.', fx:{rep:16,money:0.28,form:-4} },
      { weight:45, text:'Ils gardent au montage la scène où vous insultez votre entraîneur. Trois millions de vues sur ce seul extrait.', fx:{rep:9,money:0.28,mor:-8,form:-6} }
    ]},
    { label:'Accès limité aux entraînements', outcomes:[
      { weight:100, text:'Un documentaire propre et sans aspérité. Personne ne s\'en souviendra, personne ne vous en voudra.', fx:{rep:5,money:0.12} }
    ]},
    { label:'Refuser', hint:'Tranquillité', outcomes:[
      { weight:100, text:'Une saison sans caméras. Votre entraîneur vous remercie chaque semaine.', fx:{form:6,mor:6,m:2} }
    ]}
  ]},

{ id:'ev_umpire', cat:'Médias', icon:'🪑', w:11, cond:{aMin:19,aMax:34},
  text:'Balle annoncée faute alors qu\'elle est visiblement bonne, à 4-5 dans le troisième. L\'arbitre refuse de descendre de sa chaise. Vingt mille personnes regardent votre réaction.',
  options:[
    { label:'Exploser', hint:'Volcanique', outcomes:[
      { weight:50, text:'Raquette brisée, insultes, avertissement, jeu de pénalité. L\'extrait fait cinq millions de vues en douze heures.', fx:{rep:8,money:-0.012,m:-3,trait:'hothead'} },
      { weight:50, text:'Vous explosez, puis vous canalisez. Vous gagnez les quatre jeux suivants portés par la rage.', fx:{rep:6,m:3,form:5,trait:'hothead'} }
    ]},
    { label:'Un mot glacial et retourner jouer', hint:'Classe', outcomes:[
      { weight:65, text:'Une phrase, un regard, et vous retournez au fond du court. Les commentateurs saluent le sang-froid.', fx:{rep:4,m:4,trait:'zen'} },
      { weight:35, text:'Vous encaissez sans rien dire — et la décision vous ronge jusqu\'à la fin du match.', fx:{m:-2,form:-5,mor:-4} }
    ]}
  ]},

{ id:'ev_political', cat:'Médias', icon:'📢', w:9, cond:{aMin:23,aMax:36,minRep:55},
  text:'En conférence de presse, une question sur un sujet de société brûlant dans le pays hôte. La fédération vous a explicitement demandé de ne pas répondre.',
  options:[
    { label:'Répondre franchement', hint:'Engagé', outcomes:[
      { weight:55, text:'Votre réponse fait la une bien au-delà des pages sport. Vous perdez un sponsor, vous gagnez une stature.', fx:{rep:12,money:-0.15,m:5} },
      { weight:45, text:'Le tournoi vous retire son invitation pour l\'an prochain, la fédération vous convoque.', fx:{rep:7,money:-0.08,mor:-6} }
    ]},
    { label:'Botter en touche', outcomes:[
      { weight:100, text:'« Je suis là pour jouer au tennis. » La formule ne coûte rien et ne rapporte rien.', fx:{rep:-2} }
    ]}
  ]},

/* ══ VIE PERSO ══ */
{ id:'ev_love', cat:'Vie perso', icon:'💞', w:13, cond:{aMin:20,aMax:33},
  text:'Une rencontre sérieuse, pour la première fois. Elle a une carrière, une ville, une vie — et vous passez 32 semaines par an ailleurs.',
  options:[
    { label:'Lui demander de vous suivre sur le circuit', outcomes:[
      { weight:50, text:'Elle quitte son travail. Vous n\'êtes plus jamais seul dans une chambre d\'hôtel. C\'est un changement énorme.', fx:{mor:16,m:4,form:4} },
      { weight:50, text:'Elle vous suit six mois, s\'éteint doucement, et rentre. La rupture arrive en plein tournoi.', fx:{mor:-14,form:-8} }
    ]},
    { label:'Faire tenir la distance', outcomes:[
      { weight:55, text:'Appels quotidiens, dix jours ensemble tous les deux mois. Ça tient, et ça vous donne un ailleurs.', fx:{mor:10,m:3} },
      { weight:45, text:'La distance a raison de tout, en huit mois. Vous l\'apprenez par message, entre deux tournois.', fx:{mor:-10,form:-5} }
    ]},
    { label:'Y renoncer pour le tennis', hint:'Sacrifice', outcomes:[
      { weight:100, text:'Vous choisissez la carrière. C\'est un choix propre, professionnel — et vous y repenserez pendant vingt ans.', fx:{form:8,disc:8,mor:-10,flag:'gave_up_love'} }
    ]}
  ]},

{ id:'ev_child', cat:'Vie perso', icon:'👶', w:10, cond:{aMin:26,aMax:36},
  text:'Vous allez être parent. La saison commence dans onze jours, à l\'autre bout du monde.',
  options:[
    { label:'Sauter la tournée pour être présent', outcomes:[
      { weight:100, text:'Vous manquez deux tournois et 600 points. Vous étiez là. Aucune des deux choses ne s\'oublie.', fx:{mor:22,m:6,pts:-0.12,form:-4} }
    ]},
    { label:'Partir jouer, revenir dès que possible', outcomes:[
      { weight:55, text:'Vous jouez le ventre noué, et gagnez le tournoi. On vous verra pleurer à la remise du trophée.', fx:{form:8,mor:10,rep:6} },
      { weight:45, text:'Vous jouez, vous perdez d\'entrée, et vous n\'êtes pas rentré à temps. Ce vol-là vous poursuivra.', fx:{mor:-16,form:-6} }
    ]}
  ]},

{ id:'ev_party', cat:'Vie perso', icon:'🍾', w:11, cond:{aMin:19,aMax:29,maxDisc:48},
  text:'Une photo de vous en boîte à 4 h du matin, la veille d\'un huitième de finale, circule sur les réseaux. Votre entraîneur l\'a vue avant vous.',
  options:[
    { label:'Assumer entièrement', outcomes:[
      { weight:50, text:'« J\'ai 22 ans. » La réponse plaît au public, beaucoup moins au staff.', fx:{rep:6,mor:5,disc:-6,form:-5} },
      { weight:50, text:'Vous assumez, puis vous gagnez le huitième en trois sets secs. Le débat s\'arrête là.', fx:{rep:8,form:5,mor:6,disc:-4} }
    ]},
    { label:'S\'excuser et se reprendre en main', outcomes:[
      { weight:65, text:'Vous coupez tout pendant six mois. La forme physique monte de façon spectaculaire.', fx:{disc:12,p:4,form:8,rep:-3} },
      { weight:35, text:'Les bonnes résolutions tiennent trois semaines.', fx:{disc:3,mor:-3} }
    ]}
  ]},

/* ══ FÉDÉRATION / SÉLECTION ══ */
{ id:'ev_davis_call', cat:'Sélection', icon:'🎽', w:14, cond:{aMin:19,aMax:35,rMax:110},
  text:'Première sélection en Coupe Davis. Le week-end tombe entre deux tournois importants, sur une surface qui ne vous convient pas, et le capitaine ne promet aucun temps de jeu.',
  options:[
    { label:'Répondre présent', hint:'Le maillot', outcomes:[
      { weight:55, text:'Vous jouez le double décisif et vous le gagnez. Une ferveur que le circuit individuel ne procure jamais.', fx:{rep:8,mor:16,m:4,flag:'davis_hero'} },
      { weight:30, text:'Vous ne jouez pas une minute. Trois jours perdus, un tournoi manqué, et un capitaine reconnaissant.', fx:{mor:3,rep:2,pts:-0.06} },
      { weight:15, text:'Vous jouez, vous perdez les deux simples. Le pays entier a vu.', fx:{mor:-12,rep:-3,m:3} }
    ]},
    { label:'Décliner pour le classement', outcomes:[
      { weight:55, text:'Le choix est rationnel. La presse nationale le juge autrement pendant trois semaines.', fx:{rep:-6,pts:0.08,mor:-4} },
      { weight:45, text:'Personne ne vous en tient rigueur — le capitaine lui-même comprend.', fx:{pts:0.08,m:2} }
    ]}
  ]},

{ id:'ev_olympics', cat:'Sélection', icon:'🥇', w:12, cond:{aMin:20,aMax:35,rMax:70},
  text:'Les Jeux Olympiques. Aucun point ATP, une bourse dérisoire, deux semaines au village olympique — et la seule médaille que l\'argent ne peut pas acheter.',
  options:[
    { label:'Y aller, tout donner', outcomes:[
      { weight:40, text:'Vous ramenez une médaille. Dans votre pays, elle vaudra plus que n\'importe quel Masters.', fx:{rep:14,mor:20,m:5,flag:'medal'} },
      { weight:35, text:'Éliminé en quarts. Mais le village olympique, les autres sports, l\'ambiance — vous rentrez transformé.', fx:{mor:12,m:4,rep:4} },
      { weight:25, text:'Défaite au deuxième tour et blessure à l\'échauffement. Deux semaines gâchées en pleine saison.', fx:{inj:4,mor:-8,pts:-0.1} }
    ]},
    { label:'Faire l\'impasse', hint:'Rationnel', outcomes:[
      { weight:100, text:'Deux semaines d\'entraînement pendant que les autres défilent. Le classement vous donne raison, personne d\'autre.', fx:{f:3,p:3,rep:-5,pts:0.05} }
    ]}
  ]},

/* ══ RIVALITÉ ══ */
{ id:'ev_rival_words', cat:'Rivalité', icon:'⚔️', w:12, cond:{aMin:21,aMax:34,rMax:60},
  text:'{rival} déclare en conférence de presse : « Il y a des joueurs qui gagnent, et des joueurs qui font des jolis points. » Tout le monde a compris de qui il parlait.',
  options:[
    { label:'Répondre publiquement', hint:'Feu', outcomes:[
      { weight:50, text:'Votre réponse est meilleure que sa provocation. Le circuit se régale, et vous le battez deux mois plus tard.', fx:{rep:9,m:4,h2h:1} },
      { weight:50, text:'La guerre médiatique s\'installe. Elle vous coûte plus d\'énergie qu\'à lui.', fx:{rep:6,form:-6,mor:-5} }
    ]},
    { label:'Répondre sur le court, uniquement', hint:'Classe', outcomes:[
      { weight:60, text:'Aucun mot, trois victoires de suite contre lui. La meilleure réponse possible.', fx:{m:6,rep:5,h2h:1,form:4} },
      { weight:40, text:'Vous ne dites rien — et il vous bat encore. Le silence devient pesant.', fx:{mor:-6,m:3} }
    ]},
    { label:'Lui envoyer un message en privé', hint:'Adulte', outcomes:[
      { weight:100, text:'Il s\'excuse en privé et continue en public. Vous comprenez enfin comment il fonctionne — et ça vaut de l\'or en match.', fx:{m:5,clutchRival:3} }
    ]}
  ]},

/* ══ ARGENT / SPONSORS ══ */
{ id:'ev_big_sponsor', cat:'Sponsors', icon:'💼', w:12, cond:{aMin:21,aMax:34,minRep:55},
  text:'Un équipementier mondial met 2,4 M€ par an sur la table. La contrepartie : 14 jours d\'obligations promotionnelles par an, dont une semaine en pleine saison sur terre.',
  options:[
    { label:'Signer', outcomes:[
      { weight:60, text:'Le contrat change votre vie et celle de votre famille. Les obligations sont pénibles mais gérables.', fx:{money:2.1,rep:8,form:-4} },
      { weight:40, text:'La semaine promo tombe entre deux Masters. Vous arrivez cuit sur terre battue et vous le payez cash.', fx:{money:2.1,rep:8,form:-12,pts:-0.12} }
    ]},
    { label:'Négocier moins d\'obligations', outcomes:[
      { weight:55, text:'1,5 M€ par an et quatre jours d\'obligations. Le bon compromis.', fx:{money:1.35,rep:5} },
      { weight:45, text:'Ils passent à un autre joueur. Vous n\'aurez pas de deuxième chance avec cette marque.', fx:{mor:-6,rep:2} }
    ]},
    { label:'Refuser, garder les mains libres', outcomes:[
      { weight:100, text:'Zéro obligation, zéro million. Votre entraîneur est le seul à applaudir.', fx:{form:8,mor:4,m:3} }
    ]}
  ]},

{ id:'ev_exho', cat:'Argent', icon:'🎪', w:10, cond:{aMin:24,aMax:36,minRep:50},
  text:'Une tournée d\'exhibitions en décembre : cinq villes, huit jours, 900 000 € garantis. C\'est exactement la période de préparation physique.',
  options:[
    { label:'Y aller', hint:'Argent', outcomes:[
      { weight:55, text:'Huit jours, cinq villes, un compte en banque transformé. La préparation physique attendra.', fx:{money:0.85,rep:5,p:-3,form:-6} },
      { weight:45, text:'Vous vous blessez à la cheville lors du troisième match d\'exhibition. Pour de l\'argent.', fx:{money:0.85,inj:6,mor:-10} }
    ]},
    { label:'Faire la préparation', hint:'Pro', outcomes:[
      { weight:100, text:'Six semaines de travail foncier pendant que les autres encaissent. La saison suivante dira qui avait raison.', fx:{p:6,form:10,body:8} }
    ]}
  ]},

/* ══ CRISE ══ */
{ id:'ev_slump', cat:'Crise', icon:'📉', w:13, cond:{aMin:22,aMax:35,rMin:40,maxForm:44},
  text:'Neuf défaites au premier tour en onze tournois. Le classement s\'effondre, les invitations s\'arrêtent, et votre entraîneur commence à regarder ailleurs.',
  options:[
    { label:'Redescendre jouer les Challengers', hint:'Humilité', outcomes:[
      { weight:65, text:'Trois semaines de Challengers, deux titres, et la confiance revient par la seule voie possible : gagner des matchs.', fx:{form:16,mor:12,m:4,pts:0.06} },
      { weight:35, text:'Vous perdez aussi en Challenger. Là, c\'est vraiment autre chose qui ne va pas.', fx:{mor:-14,form:-4,m:3} }
    ]},
    { label:'Tout changer : staff, matériel, méthode', outcomes:[
      { weight:45, text:'La rupture totale fonctionne. Nouvelle raquette, nouveau coach, nouveau joueur.', fx:{f:4,form:14,mor:10,money:-0.08} },
      { weight:55, text:'Vous changez tout et rien ne change. Sauf le compte en banque.', fx:{money:-0.1,mor:-8,form:-4} }
    ]},
    { label:'Ne rien changer et travailler', outcomes:[
      { weight:50, text:'Six semaines de travail à l\'ancienne. La forme revient sans qu\'on sache vraiment pourquoi.', fx:{form:12,m:5,disc:6} },
      { weight:50, text:'La spirale continue. Certaines saisons sont juste à jeter.', fx:{form:-6,mor:-10,m:4} }
    ]}
  ]},

{ id:'ev_doping_rumor', cat:'Crise', icon:'🧪', w:7, cond:{aMin:23,aMax:36,minRep:60},
  text:'Un contrôle antidopage revient « non conforme » pour un produit contenu dans un complément alimentaire acheté par votre préparateur. Vous risquez deux ans.',
  options:[
    { label:'Se battre publiquement, tout déballer', outcomes:[
      { weight:60, text:'Dix mois de procédure, une facture d\'avocats abyssale, et une relaxe totale. Votre nom est lavé — pas les recherches Google.', fx:{money:-0.6,rep:-6,m:8,mor:-10} },
      { weight:40, text:'Quinze mois de suspension malgré tout. Vous revenez à 30 ans, sans classement.', fx:{money:-0.5,rep:-14,pts:-0.9,mor:-20,inj:30} }
    ]},
    { label:'Négocier une suspension réduite', outcomes:[
      { weight:100, text:'Cinq mois de suspension acceptés sans reconnaissance de faute. Le circuit oublie vite ; les forums, jamais.', fx:{rep:-9,pts:-0.35,mor:-12,inj:14} }
    ]}
  ]},

/* ══ FIN DE CARRIÈRE ══ */
{ id:'ev_body_talk', cat:'Corps', icon:'⏳', w:16, cond:{aMin:31,aMax:38},
  text:'Le kiné est direct : « Tu peux jouer encore deux ans en te bourrant d\'anti-inflammatoires, ou cinq ans en jouant moitié moins. »',
  options:[
    { label:'Deux ans à fond', hint:'Tout, maintenant', outcomes:[
      { weight:100, text:'Vous jouez tout, vous prenez tout, vous ne regarderez pas derrière.', fx:{form:12,body:-20,flag:'burn_out_fast'} }
    ]},
    { label:'Cinq ans à mi-régime', hint:'Longévité', outcomes:[
      { weight:100, text:'Calendrier réduit de moitié, corps préservé. Vous jouerez jusqu\'à 37 ans si vous le voulez.', fx:{body:20,form:-5,flag:'long_career'} }
    ]}
  ]},

{ id:'ev_retire_offer', cat:'Reconversion', icon:'🎤', w:12, cond:{aMin:31,aMax:38},
  text:'Une grande chaîne vous propose un poste de consultant à plein temps. À prendre maintenant — ils ne garderont pas la place trois ans.',
  options:[
    { label:'Accepter et raccrocher', hint:'Fin de carrière', outcomes:[
      { weight:100, text:'Vous annoncez votre retraite en fin de saison, un micro déjà réservé. La transition la plus douce possible.', fx:{retire:true,money:0.35,rep:6} }
    ]},
    { label:'Refuser et continuer à jouer', outcomes:[
      { weight:100, text:'Vous n\'avez pas fini. Le micro attendra, ou n\'attendra pas.', fx:{m:5,mor:8} }
    ]}
  ]},

{ id:'ev_academy', cat:'Reconversion', icon:'🏫', w:10, cond:{aMin:30,aMax:38,minRep:55},
  text:'Un investisseur propose de créer une académie à votre nom dans votre région. Il faut y mettre 1,2 M€ et une partie de votre temps, dès maintenant.',
  options:[
    { label:'Investir et s\'impliquer', outcomes:[
      { weight:55, text:'L\'académie ouvre avec 80 jeunes. Vous y passez vos semaines sans tournoi — et ça vous donne une raison d\'après.', fx:{money:-1.1,mor:14,rep:8,form:-5,flag:'academy'} },
      { weight:45, text:'Les travaux prennent trois ans et 400 000 € de plus que prévu. Vous jouez la tête ailleurs.', fx:{money:-1.5,form:-10,mor:-6,flag:'academy'} }
    ]},
    { label:'Y mettre votre nom, pas votre argent', outcomes:[
      { weight:100, text:'Licence de marque, aucun risque, aucun contrôle. C\'est propre.', fx:{money:0.15,rep:3} }
    ]}
  ]},

/* ══ DIVERS ══ */
{ id:'ev_gear', cat:'Circuit', icon:'🔧', w:10, cond:{aMin:20,aMax:34},
  text:'Le circuit passe massivement aux cordages en polyester ultra-rigides. Votre montage actuel date de vos 16 ans.',
  options:[
    { label:'Changer de cordage et de tension', outcomes:[
      { weight:60, text:'Trois mois d\'ajustement, puis une prise de balle nettement plus lourde.', fx:{f:4,form:-5} },
      { weight:40, text:'Le bras ne supporte pas. Tendinite du coude et retour en arrière.', fx:{inj:5,f:-1,body:-6} }
    ]},
    { label:'Ne rien changer', outcomes:[
      { weight:100, text:'Vous gardez votre montage. Ça marche depuis dix ans, après tout.', fx:{m:2} }
    ]}
  ]},

{ id:'ev_juniors_gift', cat:'Vie perso', icon:'🎾', w:9, cond:{aMin:24,aMax:37,minRep:40},
  text:'Un gamin de 12 ans vous attend chaque jour à la sortie des courts d\'entraînement, avec la même balle à signer. Le sixième jour, vous apprenez qu\'il fait 90 minutes de bus.',
  options:[
    { label:'Lui offrir une session d\'entraînement', outcomes:[
      { weight:100, text:'Une heure sur le court avec lui. Ses parents pleurent, vous aussi un peu. Le circuit vous avait fait oublier pourquoi vous jouez.', fx:{mor:14,rep:5,m:3} }
    ]},
    { label:'Signer et passer votre chemin', outcomes:[
      { weight:100, text:'Une signature, un sourire, et retour au travail. C\'est déjà beaucoup, à ce niveau d\'exigence.', fx:{mor:2} }
    ]}
  ]},

{ id:'ev_heat', cat:'Circuit', icon:'🥵', w:10, cond:{aMin:18,aMax:36},
  text:'43 °C sur le court, humidité à 70 %. Deux joueurs ont déjà abandonné ce matin. Le tournoi refuse d\'appliquer la règle de chaleur extrême.',
  options:[
    { label:'Jouer et en faire une arme', hint:'Physique', outcomes:[
      { weight:55, text:'Vous êtes le mieux préparé du tableau. Trois adversaires s\'écroulent avant vous.', fx:{p:4,form:6,mor:6,trait:'marathon'} },
      { weight:45, text:'Crampes généralisées au troisième set. Vous finissez le match à l\'agonie, et vous perdez.', fx:{body:-10,inj:2,mor:-6} }
    ]},
    { label:'Mener la fronde des joueurs', hint:'Syndicat', outcomes:[
      { weight:60, text:'Vous obtenez la suspension des matchs. Les joueurs vous élisent au conseil ATP dans la foulée.', fx:{rep:9,m:4,flag:'atp_council'} },
      { weight:40, text:'Le tournoi refuse, la presse locale vous traite de tire-au-flanc.', fx:{rep:-4,m:3,mor:-4} }
    ]}
  ]},

{ id:'ev_scheduling', cat:'Circuit', icon:'🕐', w:10, cond:{aMin:20,aMax:36},
  text:'On vous programme en session de nuit, troisième match après deux matchs en cinq sets. Vous entrerez sur le court à 1 h 12 du matin.',
  options:[
    { label:'Protester publiquement après le match', outcomes:[
      { weight:60, text:'Votre sortie sur la programmation fait bouger les lignes : le tournoi change ses règles l\'année suivante.', fx:{rep:7,m:3,flag:'atp_council'} },
      { weight:40, text:'On vous répond que « c\'est le spectacle ». Vous passez pour un râleur.', fx:{rep:-3,mor:-4} }
    ]},
    { label:'Ne rien dire et gérer', outcomes:[
      { weight:55, text:'Vous gagnez à 4 h 20 du matin devant 300 personnes. Ce genre de match forge quelque chose.', fx:{m:5,mor:6,form:-6,trait:'warrior'} },
      { weight:45, text:'Le rythme vous détruit. Vous perdez, et vous mettez six jours à récupérer.', fx:{form:-10,body:-6} }
    ]}
  ]},

{ id:'ev_teammate', cat:'Équipe', icon:'🎒', w:9, cond:{aMin:19,aMax:30,rMin:60},
  text:'Un joueur de votre génération, classé juste devant vous, propose de partager les frais : même coach, mêmes tournois, mêmes hôtels. Vous diviseriez tout par deux.',
  options:[
    { label:'Accepter', hint:'Économie', outcomes:[
      { weight:60, text:'Les frais fondent, l\'émulation à l\'entraînement fait le reste. Vous progressez tous les deux.', fx:{money:0.06,f:3,p:2,mor:6} },
      { weight:40, text:'Vous vous retrouvez face à lui en quart de finale. Plus rien n\'est pareil après.', fx:{money:0.06,mor:-8,m:4} }
    ]},
    { label:'Refuser, rester indépendant', outcomes:[
      { weight:100, text:'Vous préférez tracer votre route. Plus cher, plus solitaire, plus clair.', fx:{money:-0.02,m:4,disc:4} }
    ]}
  ]},

{ id:'ev_night_before', cat:'Mental', icon:'🌙', w:11, cond:{aMin:19,aMax:35,rMax:150},
  text:'Veille de votre premier huitième de finale en Grand Chelem. 2 h du matin, vous fixez le plafond depuis quatre heures.',
  options:[
    { label:'Prendre un somnifère', outcomes:[
      { weight:50, text:'Vous dormez cinq heures. Vous jouez dans le coton, mais vous jouez.', fx:{form:-4,m:2} },
      { weight:50, text:'Vous vous réveillez vaseux et vous ne trouvez jamais le rythme du match.', fx:{form:-10,mor:-6} }
    ]},
    { label:'Aller marcher dehors', outcomes:[
      { weight:60, text:'Une heure de marche dans une ville endormie. Vous rentrez apaisé et vous dormez enfin.', fx:{m:5,mor:6,trait:'zen'} },
      { weight:40, text:'Vous marchez trois heures et jouez avec deux heures de sommeil. Étrangement, ça passe.', fx:{m:4,form:-5} }
    ]}
  ]},

{ id:'ev_last_dance', cat:'Retraite', icon:'🌇', w:14, cond:{aMin:33,aMax:39},
  text:'Le corps ne suit plus, le classement s\'effondre, et une question revient chaque matin : est-ce qu\'on continue par amour ou par peur du vide ?',
  options:[
    { label:'Une dernière saison, pour dire au revoir', outcomes:[
      { weight:100, text:'Vous annoncez que ce sera la dernière. Chaque tournoi devient un adieu, chaque public se lève.', fx:{rep:10,mor:16,flag:'farewell_tour'} }
    ]},
    { label:'Continuer tant que le corps tient', outcomes:[
      { weight:100, text:'Pas d\'adieux, pas de mise en scène. On joue jusqu\'à ce qu\'on ne puisse plus.', fx:{m:5,mor:5} }
    ]}
  ]}
];

/* Micro-événements : une ligne d'ambiance en fin de saison. */
const MICRO = [
  { id:'m1',  w:10, text:'Une préparation hivernale exceptionnelle impressionne tout le staff.', fx:{p:2,form:4} },
  { id:'m2',  w:10, text:'Un virus attrapé dans un avion vous cloue une semaine au lit.', fx:{form:-5,body:-3} },
  { id:'m3',  w:9,  text:'Vous ajoutez une amortie à votre panoplie. Elle rentre une fois sur deux.', fx:{f:2} },
  { id:'m4',  w:9,  text:'Le sommeil se dérègle avec les fuseaux horaires. Trois mois compliqués.', fx:{form:-4,mor:-3} },
  { id:'m5',  w:8,  text:'Un ancien champion vous prend à part vingt minutes. Vous n\'oublierez pas la conversation.', fx:{m:3,mor:4} },
  { id:'m6',  w:9,  text:'Une nouvelle routine de service gagne 8 km/h de moyenne.', fx:{s:3} },
  { id:'m7',  w:8,  text:'Le public d\'un tournoi vous adopte sans qu\'on sache pourquoi. Ça change tout.', fx:{rep:4,mor:5} },
  { id:'m8',  w:9,  text:'Une gêne au genou vous fait sauter deux tournois.', fx:{body:-5,form:-3} },
  { id:'m9',  w:8,  text:'Vous travaillez le revers à une main coupé tout l\'hiver. Ça paie.', fx:{f:3,grass:2} },
  { id:'m10', w:8,  text:'Un journaliste vous consacre un long portrait bienveillant.', fx:{rep:3,mor:3} },
  { id:'m11', w:7,  text:'Le déménagement à Monaco simplifie la vie et la fiscalité.', fx:{money:0.05,mor:3} },
  { id:'m12', w:8,  text:'Vous prenez cinq kilos de muscle. Le service en profite, la mobilité un peu moins.', fx:{s:3,p:2,f:-1} },
  { id:'m13', w:8,  text:'Une longue série de défaites au premier tour entame sérieusement la confiance.', fx:{form:-7,mor:-6} },
  { id:'m14', w:7,  text:'Vous engagez un nutritionniste. Les fins de match sont transformées.', fx:{p:3,body:5,money:-0.02} },
  { id:'m15', w:8,  text:'Un stage à l\'altitude avant la saison sur terre paie immédiatement.', fx:{p:3,clay:2} },
  { id:'m16', w:7,  text:'Une prise de bec avec un joueur du top 10 dans le vestiaire fait le tour du circuit.', fx:{rep:3,mor:-3} },
  { id:'m17', w:8,  text:'Vous apprenez à lire le service adverse. Les pourcentages de retour explosent.', fx:{m:3,f:2} },
  { id:'m18', w:7,  text:'Le kiné détecte un déséquilibre postural. Six mois de correction, et plus aucune douleur.', fx:{body:8,p:2} },
  { id:'m19', w:7,  text:'Une campagne publicitaire nationale vous rend soudain reconnaissable dans la rue.', fx:{rep:6,money:0.12} },
  { id:'m20', w:8,  text:'Vous perdez trois matchs en ayant eu des balles de match. Statistiquement improbable.', fx:{m:-4,mor:-6} },
  { id:'m21', w:7,  text:'Un hiver entier à travailler le jeu au filet. Le style change.', fx:{f:2,grass:3,s:1} },
  { id:'m22', w:7,  text:'Vous devenez père/mère de famille. Les priorités bougent, la sérénité arrive.', fx:{m:4,mor:8,form:-3} },
  { id:'m23', w:6,  text:'Une amende pour comportement antisportif vous coûte 30 000 €.', fx:{money:-0.03,rep:2} },
  { id:'m24', w:7,  text:'Votre équipe s\'agrandit : un analyste vidéo à plein temps.', fx:{m:3,f:2,money:-0.04} }
];

/* Actus du circuit, en fond de saison. */
const WORLD_NEWS = [
  'Un joueur de 17 ans atteint les quarts d\'un Grand Chelem : le circuit s\'affole.',
  'Le débat sur la longueur du calendrier ressurgit après trois forfaits en une semaine.',
  'Un ancien n°1 mondial annonce sa retraite en larmes après vingt ans de circuit.',
  'L\'arbitrage électronique intégral est adopté sur tous les tournois du circuit.',
  'Un Challenger est annulé faute de sponsors : le circuit secondaire tire la sonnette d\'alarme.',
  'Une finale de Grand Chelem en cinq sets bat tous les records d\'audience.',
  'Un joueur suspendu deux ans pour matchs truqués : le circuit sous le choc.',
  'La fédération annonce des primes doublées pour les premiers tours de qualification.'
];

const RIVAL_NEWS = {
  ahead: ['{rival} enchaîne les titres et s\'installe durablement devant vous.',
          '{rival} fait la couverture de tous les magazines. Vous êtes cité en dernière ligne.',
          'Une nouvelle grosse victoire pour {rival}, qui creuse l\'écart au classement.'],
  behind:['{rival} traverse une saison difficile et vous double au classement.',
          '{rival} se blesse gravement : la voie est libre pendant six mois.',
          'On parle de vous comme du meilleur joueur de votre génération, devant {rival}.'],
  close: ['{rival} et vous : les journalistes ne parlent plus que de cette rivalité.',
          'Encore un classement séparé par moins de 200 points entre {rival} et vous.',
          'Votre duel avec {rival} est élu match de l\'année par les joueurs.']
};

const HEADLINES = {
  great:  ['« La saison de la consécration »','« Personne ne l\'arrête plus »','« Le patron du circuit »',
           '« Le circuit a passé l\'année à chercher la faille »',
           '« Une saison que même son entraîneur trouve exagérée »'],
  good:   ['« Une régularité de métronome »','« La saison de la confirmation »','« Solide, sérieux, redoutable »',
           '« Toujours là le dimanche »',
           '« Personne n\'aime voir ce nom dans son tableau »'],
  poor:   ['« L\'année blanche »','« Le déclassement guette »','« Que reste-t-il du prodige ? »',
           '« Une saison qu\'on range sans la relire »',
           '« Le talent est toujours là, on l\'a vu en avril »'],
  injury: ['« Une saison volée par les blessures »','« Le corps a dit non »',
           '« Le kiné dit que ce n\'est rien depuis onze mois »'],
  // Une saison quelconque n'affichait aucune manchette : c'est pourtant le cas le
  // plus fréquent d'une carrière, et le silence donnait l'impression d'un bug.
  avg:      ['« Une année qui n\'aura dérangé personne »',
             '« Six mois à marquer des points, six mois à les défendre »'],
  comeback: ['« Trois cents places plus haut, le même sac de voyage »'],
  collapse: ['« De la session de nuit au court 14 »'],
  rookie:   ['« Première saison chez les professionnels, premières notes de frais »'],
  twilight: ['« Dans le vestiaire, plus personne ne se souvient de ses débuts »',
             '« Il reste le service, et l\'envie de finir proprement »'],
  money:    ['« La vitrine est vide, le comptable ne s\'en plaint pas »'],
  surface:  ['« Injouable trois mois par an, poli le reste de l\'année »'],
  small:    ['« Intouchable dans les tournois que personne ne diffuse »']
};

/* ─────────────────────────── BADGES ─────────────────────────── */
const BADGE_CATS = [
  { id:'debut',   name:'Débuts',              icon:'🐣' },
  { id:'titres',  name:'Titres',              icon:'🏆' },
  { id:'chelem',  name:'Grand Chelem',        icon:'💎' },
  { id:'classe',  name:'Classement',          icon:'📈' },
  { id:'nation',  name:'Nation',              icon:'🎽' },
  { id:'parcours',name:'Parcours',            icon:'🧭' },
  { id:'secret',  name:'Secrets',             icon:'❓' },
  { id:'graal',   name:'Le Graal',            icon:'👑' }
];

const BADGES = [
  { id:'first_pro',   cat:'debut',   icon:'🎾', name:'Premier point',        desc:'Marquer votre premier point ATP.' },
  { id:'top100',      cat:'debut',   icon:'💯', name:'Dans le grand bain',   desc:'Entrer dans le top 100.' },
  { id:'top100_20',   cat:'debut',   icon:'🚀', name:'Précoce',              desc:'Entrer dans le top 100 avant 20 ans.' },
  { id:'first_atp',   cat:'titres',  icon:'🥉', name:'Premier titre',        desc:'Remporter un titre ATP.' },
  { id:'title_10',    cat:'titres',  icon:'🎖️', name:'Collectionneur',      desc:'Remporter 10 titres ATP.' },
  { id:'title_30',    cat:'titres',  icon:'🏅', name:'Vitrine pleine',       desc:'Remporter 30 titres ATP.' },
  { id:'m1000_first', cat:'titres',  icon:'🥈', name:'Grand format',         desc:'Remporter un Masters 1000.' },
  { id:'m1000_5',     cat:'titres',  icon:'⭐', name:'Habitué des grands',   desc:'Remporter 5 Masters 1000.' },
  { id:'finals_win',  cat:'titres',  icon:'🎪', name:'Maître des maîtres',   desc:'Remporter le Masters de fin d\'année.' },
  { id:'slam_first',  cat:'chelem',  icon:'💎', name:'Le premier',           desc:'Remporter un Grand Chelem.' },
  { id:'slam_3',      cat:'chelem',  icon:'💠', name:'Installé au sommet',   desc:'Remporter 3 Grands Chelems.' },
  { id:'slam_10',     cat:'chelem',  icon:'🔱', name:'Monstre sacré',        desc:'Remporter 10 Grands Chelems.' },
  { id:'slam_20',     cat:'graal',   icon:'👑', name:'Le Débat',             desc:'Remporter 20 Grands Chelems.' },
  { id:'career_slam', cat:'graal',   icon:'🌍', name:'Grand Chelem en carrière', desc:'Remporter les quatre Grands Chelems au moins une fois.' },
  { id:'slam_year',   cat:'graal',   icon:'🗓️', name:'Le Grand Chelem',     desc:'Remporter les quatre Grands Chelems la même année.' },
  { id:'slam_young',  cat:'chelem',  icon:'🍼', name:'Trop tôt',             desc:'Remporter un Grand Chelem avant 21 ans.' },
  { id:'slam_old',    cat:'chelem',  icon:'🕰️', name:'Jamais trop tard',    desc:'Remporter un Grand Chelem après 33 ans.' },
  { id:'no1',         cat:'classe',  icon:'1️⃣', name:'Numéro un mondial',   desc:'Devenir n°1 mondial.' },
  { id:'no1_year',    cat:'classe',  icon:'📅', name:'Année de patron',      desc:'Finir l\'année à la place de n°1 mondial.' },
  { id:'no1_100w',    cat:'graal',   icon:'♛', name:'Règne',                desc:'Passer 100 semaines à la place de n°1 mondial.' },
  { id:'top10_5y',    cat:'classe',  icon:'📊', name:'Pilier du circuit',    desc:'Terminer 5 saisons dans le top 10.' },
  { id:'davis',       cat:'nation',  icon:'🏆', name:'Pour le pays',         desc:'Remporter la Coupe Davis.' },
  { id:'olympic',     cat:'nation',  icon:'🥇', name:'Médaillé',             desc:'Décrocher une médaille olympique.' },
  { id:'golden_slam', cat:'graal',   icon:'🌟', name:'Golden Slam',          desc:'Grand Chelem en carrière + médaille olympique.' },
  { id:'clay_king',   cat:'parcours',icon:'🟠', name:'Roi de l\'ocre',       desc:'Atteindre 90 d\'affinité sur terre battue.' },
  { id:'grass_king',  cat:'parcours',icon:'🟢', name:'Seigneur du gazon',    desc:'Atteindre 90 d\'affinité sur gazon.' },
  { id:'hard_king',   cat:'parcours',icon:'🔵', name:'Maître du dur',        desc:'Atteindre 90 d\'affinité sur dur.' },
  { id:'triple',      cat:'parcours',icon:'🎨', name:'Toutes surfaces',      desc:'Gagner un titre sur les trois surfaces la même saison.' },
  { id:'wins500',     cat:'parcours',icon:'✅', name:'500 victoires',        desc:'Gagner 500 matchs en carrière.' },
  { id:'wins1000',    cat:'graal',   icon:'🧱', name:'Mille',                desc:'Gagner 1000 matchs en carrière.' },
  { id:'long',        cat:'parcours',icon:'🕯️', name:'Increvable',          desc:'Jouer jusqu\'à 37 ans.' },
  { id:'rich',        cat:'parcours',icon:'💰', name:'Fortune faite',        desc:'Dépasser 50 M€ de gains en carrière.' },
  { id:'phoenix',     cat:'secret',  icon:'🦅', name:'Phénix',               desc:'Revenir dans le top 10 après être sorti du top 300.' },
  { id:'underdog',    cat:'secret',  icon:'🌱', name:'Parti de rien',        desc:'Gagner un Grand Chelem avec un potentiel estimé sous 75.' },
  { id:'nemesis',     cat:'secret',  icon:'⚔️', name:'Bête noire',           desc:'Mener 10-0 dans les face-à-face contre votre rival.' },
  { id:'zero',        cat:'secret',  icon:'🕳️', name:'Le circuit est cruel', desc:'Terminer une carrière sans jamais entrer dans le top 100.' }
];

/* Paliers calés sur la distribution réelle de 6 000 carrières simulées. */
const SCORE_TIERS = [
  { min:700, id:'goat',    label:'L\'UN DES PLUS GRANDS DE TOUS LES TEMPS' },
  { min:400, id:'legend',  label:'UNE LÉGENDE DU JEU' },
  { min:230, id:'great',   label:'UN TRÈS GRAND CHAMPION' },
  { min:130, id:'champ',   label:'UN CHAMPION DU CIRCUIT' },
  { min:75,  id:'top',     label:'UN MEMBRE DU TOP 20 MONDIAL' },
  { min:42,  id:'solid',   label:'UNE SOLIDE CARRIÈRE DE TOP 100' },
  { min:24,  id:'pro',     label:'UNE VRAIE CARRIÈRE DE PROFESSIONNEL' },
  { min:13,  id:'journey', label:'UNE VIE DE FORÇAT DES CHALLENGERS' },
  { min:0,   id:'lost',    label:'LE RÊVE S\'EST ARRÊTÉ EN CHEMIN' }
];

/* Percentiles de score, pour la ligne « meilleure carrière que X % ». */
const SCORE_PERCENTILES = [
  7,9,10,11,12,12,13,13,14,14,
  15,16,16,16,17,17,18,18,18,19,
  19,20,20,20,21,21,22,22,22,23,
  23,23,24,24,25,25,26,26,26,27,
  27,27,28,28,29,29,30,30,31,32,
  32,32,33,34,34,35,36,37,39,42,
  45,47,50,53,55,57,59,61,63,64,
  66,69,71,73,77,81,86,92,98,104,
  114,123,134,146,161,179,197,216,238,259,
  288,330,370,418,465,534,641,733,920
];
