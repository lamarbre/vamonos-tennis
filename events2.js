/* ══════════════════════════════════════════════════════════════════════════
   VAMONOS TENNIS — Contenu narratif, second bloc
   Même format que events.js. Voir l'en-tête de ce fichier pour les clés.
   ══════════════════════════════════════════════════════════════════════════ */

const EVENTS_B = [

/* ═══════════════ LES DÉBUTS ═══════════════ */

{ id:'y_firstcheck', cat:'Argent', icon:'💶', w:14, cond:{aMax:20},
  text:'Premier chèque de tournoi de votre vie : 340 €. Vous avez dépensé 610 € pour venir. Vous le photographiez quand même.',
  options:[
    { label:'L\'encadrer', outcomes:[
      { weight:100, text:'Il est accroché dans la chambre chez vos parents. Vous ne l\'encaisserez jamais. C\'est le seul billet que vous garderez toute votre vie.', fx:{ mor:12, men:2 } }
    ]},
    { label:'L\'encaisser immédiatement, vous êtes à découvert', outcomes:[
      { weight:100, text:'340 €, soit deux semaines d\'essence et un cordage. Le romantisme attendra la retraite.', fx:{ money:0.00034, mor:2, disc:3 } }
    ]}
  ]},

{ id:'y_school2', cat:'Vie perso', icon:'📚', w:12, cond:{aMax:19},
  text:'Votre prof principal vous prend à part : « Tu as les capacités pour faire des études. Le tennis, statistiquement, ça ne marche pour personne. »',
  options:[
    { label:'Lui donner rendez-vous dans dix ans', hint:'Culot', outcomes:[
      { weight:70, text:'Vous lui promettez une place en tribune le jour où vous jouerez un Grand Chelem. Il note la date dans son agenda. Vous aussi.', fx:{ men:6, mor:8, flag:'promesse_prof' } },
      { weight:30, text:'Il sourit poliment, de ce sourire qu\'ont les adultes qui ont déjà entendu ça cent fois. Ça vous reste en travers pendant des années — et ça vous fait travailler.', fx:{ men:4, disc:6, mor:-3 } }
    ]},
    { label:'Prendre le conseil au sérieux', outcomes:[
      { weight:100, text:'Vous vous inscrivez en cours du soir. Deux ans plus tard, vous avez un diplôme et un plan B. Ça change tout, y compris la façon dont vous jouez les points importants.', fx:{ men:7, mor:5, form:-4, flag:'diplome' } }
    ]}
  ]},

{ id:'y_sacrifice', cat:'Vie perso', icon:'🏚️', w:12, cond:{aMin:17,aMax:24},
  text:'Vos parents ont vendu la maison de famille pour financer vos deux prochaines saisons. Personne ne vous l\'a demandé. Personne n\'en parle.',
  options:[
    { label:'Refuser l\'argent', hint:'Fierté', outcomes:[
      { weight:55, text:'Vous refusez. Ils insistent. Vous refusez encore. Vous trouverez un sponsor local trois mois plus tard, à force de frapper aux portes.', fx:{ men:8, mor:5, money:0.02, rep:2 } },
      { weight:45, text:'Vous refusez, et vous jouez la saison sans le sou. Six tournois au lieu de vingt-deux.', fx:{ men:6, mor:-6, money:-0.01 } }
    ]},
    { label:'Accepter, et se jurer de rembourser', outcomes:[
      { weight:100, text:'Vous acceptez. Cette dette-là ne figure sur aucun papier et vous la porterez à chaque balle de break de votre carrière.', fx:{ money:0.09, men:5, mor:-4, flag:'dette_famille' } }
    ]}
  ]},

/* ═══════════════ LE CIRCUIT AU QUOTIDIEN ═══════════════ */

{ id:'y_visa', cat:'Voyages', icon:'📄', w:11, cond:{aMax:34},
  text:'Le consulat refuse votre visa pour le tournoi de la semaine prochaine. Motif : « dossier incomplet ». Il manque un justificatif dont personne n\'avait entendu parler.',
  options:[
    { label:'Passer trois jours à batailler', outcomes:[
      { weight:55, text:'Trois jours de queue, deux cents euros de frais accélérés, et le visa arrive la veille. Vous jouez.', fx:{ money:-0.0004, form:-4, men:3 } },
      { weight:45, text:'Trois jours perdus et le refus est maintenu. Vous regardez le tournoi à la télévision.', fx:{ money:-0.0004, mor:-8, form:4 } }
    ]},
    { label:'Renoncer tout de suite et jouer ailleurs', outcomes:[
      { weight:100, text:'Vous réservez pour un tournoi accessible sans visa. Moins de points, moins de tracas.', fx:{ mor:-2, form:3 } }
    ]}
  ]},

{ id:'y_shuttle', cat:'Voyages', icon:'🚐', w:10, cond:{rMin:150},
  text:'La navette du tournoi passe toutes les trois heures. Vous jouez dans deux heures. Le club est à onze kilomètres.',
  options:[
    { label:'Y aller en courant', hint:'Absurde', outcomes:[
      { weight:50, text:'Onze kilomètres en tenue, sac sur le dos. Vous arrivez échauffé au-delà du raisonnable et vous gagnez en deux sets. Personne ne vous croira.', fx:{ sta:2, form:-6, mor:8, rep:2 } },
      { weight:50, text:'Vous arrivez cuit, en retard, et vous perdez 6-2 6-1. Le juge-arbitre note votre retard.', fx:{ form:-12, mor:-7 } }
    ]},
    { label:'Payer un taxi', outcomes:[
      { weight:100, text:'Quarante euros pour onze kilomètres. Sur ce circuit, c\'est deux jours de repas.', fx:{ money:-0.00004, form:2 } }
    ]}
  ]},

{ id:'y_wrongcity', cat:'Voyages', icon:'🗺️', w:9, cond:{aMax:30},
  text:'Vous réalisez à l\'aéroport que le tournoi de Valence se joue en Espagne, et pas au Venezuela. Votre billet, lui, est très clair.',
  options:[
    { label:'Prendre le vol quand même et jouer ce qu\'il y a là-bas', hint:'Panache', outcomes:[
      { weight:50, text:'Vous atterrissez à Valencia, Venezuela, et vous trouvez un tournoi ITF sur place. Vous le gagnez. La vie est étrange.', fx:{ money:0.004, mor:12, rep:2, clay:1 } },
      { weight:50, text:'Rien à jouer à 6 000 km de chez vous. Une semaine de vacances forcée et très chère.', fx:{ money:-0.0012, mor:-8, form:6 } }
    ]},
    { label:'Racheter un billet en urgence', outcomes:[
      { weight:100, text:'840 € pour réparer une erreur de clic. Vous vérifierez trois fois, désormais, jusqu\'à la fin de votre carrière.', fx:{ money:-0.00084, mor:-5, disc:4 } }
    ]}
  ]},

{ id:'y_roommate', cat:'Voyages', icon:'🛏️', w:10, cond:{rMin:200,aMax:28},
  text:'Pour diviser les frais, vous partagez la chambre avec un joueur du circuit. Il ronfle comme un moteur diesel et s\'entraîne à sauter à la corde à 6 h du matin.',
  options:[
    { label:'Tenir bon et économiser', outcomes:[
      { weight:55, text:'Vous achetez des bouchons d\'oreille et vous devenez amis. Vous partagerez des chambres pendant six ans.', fx:{ money:0.003, mor:7 } },
      { weight:45, text:'Trois semaines à quatre heures de sommeil. Vos résultats s\'effondrent avant que vous compreniez pourquoi.', fx:{ money:0.003, form:-10, mor:-6 } }
    ]},
    { label:'Reprendre une chambre seul', outcomes:[
      { weight:100, text:'Vous dormez. Le compte en banque, lui, ne dort plus.', fx:{ money:-0.004, form:6 } }
    ]}
  ]},

/* ═══════════════ L'ENTRAÎNEUR ═══════════════ */

{ id:'y_coachpay', cat:'Équipe', icon:'💸', w:12, cond:{aMin:19,rMin:150},
  text:'Votre entraîneur n\'a pas été payé depuis deux mois. Il ne dit rien. Vous le savez, il sait que vous le savez.',
  options:[
    { label:'Lui donner tout ce qu\'il reste', outcomes:[
      { weight:100, text:'Vous videz le compte. Il refuse la moitié. Vous êtes tous les deux à sec, et vous ne vous êtes jamais autant fait confiance.', fx:{ money:-0.008, mor:10, men:4, flag:'coach_loyal' } }
    ]},
    { label:'Le remercier, faute de moyens', hint:'Douloureux', outcomes:[
      { weight:60, text:'Il part sans reproche, en disant qu\'il aurait fait pareil. Vous vous entraînerez seul pendant huit mois.', fx:{ mor:-12, men:4 } },
      { weight:40, text:'Il refuse de partir et propose de travailler gratuitement jusqu\'à ce que ça aille mieux. Vous ne l\'oublierez jamais.', fx:{ mor:14, men:5, flag:'coach_loyal' } }
    ]}
  ]},

{ id:'y_coachpoach', cat:'Équipe', icon:'🪤', w:11, cond:{rMax:120,aMin:21},
  text:'Un joueur du top 20 propose trois fois plus d\'argent à votre entraîneur. Il vous l\'annonce lui-même, ce qui est déjà une forme de respect.',
  options:[
    { label:'Le laisser partir', hint:'Élégant', outcomes:[
      { weight:60, text:'Vous lui dites d\'y aller. Il vous recommande son meilleur ami, qui se révèle encore meilleur que lui.', fx:{ mor:4, men:3, rep:3 } },
      { weight:40, text:'Il part. Vous mettez quatorze mois à retrouver une structure de travail.', fx:{ mor:-9, form:-6 } }
    ]},
    { label:'Vous aligner financièrement', outcomes:[
      { weight:55, text:'Vous vous ruinez pour le garder, et ça vaut chaque euro : deux ans plus tard vous êtes dans le top 30.', fx:{ money:-0.06, men:3, mor:6 } },
      { weight:45, text:'Vous vous alignez. Il reste, mais il regarde ailleurs à chaque tournoi. Vous avez acheté un corps, pas un engagement.', fx:{ money:-0.06, mor:-6 } }
    ]}
  ]},

{ id:'y_coachtruth', cat:'Équipe', icon:'🪞', w:11, cond:{aMin:23,maxMor:48},
  text:'Après un énième premier tour, votre entraîneur vous dit calmement : « Tu ne travailles plus. Tu fais semblant depuis six mois, et tu le sais. »',
  options:[
    { label:'L\'admettre', hint:'Lucide', outcomes:[
      { weight:75, text:'Vous l\'admettez à voix haute pour la première fois. La conversation dure trois heures. Le lendemain, vous êtes sur le court à 7 h.', fx:{ disc:14, form:8, mor:8, men:5 } },
      { weight:25, text:'Vous l\'admettez, et vous vous rendez compte que le problème est plus profond qu\'un manque de travail.', fx:{ men:4, mor:-6 } }
    ]},
    { label:'Le nier violemment', outcomes:[
      { weight:55, text:'La dispute est mémorable. Il claque la porte. Trois semaines plus tard vous le rappelez pour lui donner raison.', fx:{ mor:-8, disc:6, men:3 } },
      { weight:45, text:'Vous le niez, il n\'insiste pas, et rien ne change. La saison est perdue.', fx:{ form:-8, mor:-6, disc:-4 } }
    ]}
  ]},

/* ═══════════════ LE JEU ═══════════════ */

{ id:'y_secondserve', cat:'Terrain', icon:'🎾', w:12, cond:{aMin:19},
  text:'Les statistiques sont sans appel : vous gagnez 38 % des points sur seconde balle. La moyenne du circuit est à 51 %. Tout le monde le sait, et tout le monde attaque.',
  options:[
    { label:'Prendre plus de risques sur la seconde', outcomes:[
      { weight:55, text:'Deux mois de doubles fautes en pagaille, puis le déclic : la seconde devient une arme et non plus une excuse.', fx:{ srv:4, men:2 } },
      { weight:45, text:'Vous prenez des risques et vous multipliez les doubles fautes. Retour à la case départ, en moins confiant.', fx:{ srv:-1, men:-3, mor:-5 } }
    ]},
    { label:'Travailler le premier point après la seconde', hint:'Malin', outcomes:[
      { weight:100, text:'Puisque le retour reviendra fort, autant préparer la balle suivante. Votre pourcentage grimpe sans que le service change.', fx:{ ret:2, fh:2, men:3 } }
    ]}
  ]},

{ id:'y_backhandslice', cat:'Terrain', icon:'🔪', w:10, cond:{aMin:18},
  text:'Un ancien joueur vous regarde vous entraîner dix minutes et lâche : « Tu n\'as pas de slice. À ton niveau, c\'est comme jouer avec une main dans le dos. »',
  options:[
    { label:'Y consacrer tout l\'hiver', outcomes:[
      { weight:70, text:'Quatre mois de balles coupées, basses, embêtantes. Sur gazon, ça change votre vie.', fx:{ bh:3, grass:3, vol:1 } },
      { weight:30, text:'Le geste ne vient pas. Vous avez un slice, techniquement. Personne n\'en a peur.', fx:{ bh:1, mor:-3 } }
    ]},
    { label:'Assumer de jouer sans', outcomes:[
      { weight:100, text:'Vous frappez tout à plat ou lifté. C\'est plus spectaculaire et infiniment plus risqué.', fx:{ fh:2, grass:-1, men:1 } }
    ]}
  ]},

{ id:'y_readgame', cat:'Terrain', icon:'👁️', w:11, cond:{aMin:22},
  text:'En regardant une vidéo, vous vous apercevez que vous annoncez votre amortie deux dixièmes avant de la jouer. Tout le circuit doit le voir depuis des années.',
  options:[
    { label:'Corriger le tic', outcomes:[
      { weight:75, text:'Six semaines devant un miroir. L\'amortie redevient une surprise, et les adversaires reculent de deux mètres pour rien.', fx:{ vol:3, men:2 } },
      { weight:25, text:'Vous corrigez le tic et vous en développez un autre. Le corps a horreur du vide.', fx:{ vol:1 } }
    ]},
    { label:'L\'exploiter', hint:'Retors', outcomes:[
      { weight:60, text:'Vous faites le signe, et vous frappez long. Trois adversaires se font avoir la même semaine. C\'est délicieux.', fx:{ men:5, fh:2, mor:6 } },
      { weight:40, text:'Le piège marche une fois. Le circuit s\'adapte plus vite que vous ne le pensiez.', fx:{ men:2 } }
    ]}
  ]},

{ id:'y_wind', cat:'Terrain', icon:'🌬️', w:10, cond:{},
  text:'Vent de 50 km/h, en rafales, dans les deux sens. La moitié des joueurs se plaint avant même le premier point.',
  options:[
    { label:'En faire une alliée', hint:'Malin', outcomes:[
      { weight:60, text:'Balles hautes contre le vent, slices avec. Votre adversaire perd la tête avant de perdre le match.', fx:{ men:5, mor:8, trait:'zen' } },
      { weight:40, text:'Le vent ne prend parti pour personne. Vous perdez comme les autres, mais sans vous plaindre.', fx:{ men:3, mor:-3 } }
    ]},
    { label:'Se plaindre à l\'arbitre', outcomes:[
      { weight:100, text:'« C\'est le même vent pour les deux. » Il a raison, ce qui n\'aide absolument pas.', fx:{ men:-2, mor:-4 } }
    ]}
  ]},

{ id:'y_marathon', cat:'Terrain', icon:'⏳', w:11, cond:{aMin:19},
  text:'Cinq heures quarante. Vous ne sentez plus vos jambes depuis le quatrième set. Lui non plus. Le public ne sait plus s\'il assiste à du sport ou à autre chose.',
  options:[
    { label:'Aller au bout, quel que soit le résultat', outcomes:[
      { weight:55, text:'Vous gagnez 12-10 au cinquième. Vous mettrez neuf jours à récupérer et vous en parlerez pendant trente ans.', fx:{ mor:22, men:8, body:-12, form:-20, trait:'marathon', rep:8 } },
      { weight:45, text:'Vous perdez 10-12. Le stade vous applaudit debout pendant quatre minutes. C\'est presque pire.', fx:{ mor:-4, men:7, body:-12, form:-20, rep:7, trait:'marathon' } }
    ]},
    { label:'Abandonner pour préserver la suite', hint:'Raison', outcomes:[
      { weight:100, text:'Abandon à 4-4 dans le cinquième. Rationnellement, c\'est le bon choix. Vous y repenserez souvent.', fx:{ body:6, form:8, mor:-12, rep:-4 } }
    ]}
  ]},

/* ═══════════════ RIVALITÉ ═══════════════ */

{ id:'y_rivalhelp', cat:'Rivalité', icon:'🤝', w:11, cond:{aMin:21,rMax:150},
  text:'{rival} se blesse à l\'échauffement, seul, sans son kiné. Vous êtes le seul sur le court d\'à côté.',
  options:[
    { label:'Aller l\'aider', outcomes:[
      { weight:100, text:'Vous appelez le staff médical et vous restez avec lui vingt minutes. La rivalité continue, mais elle a changé de nature.', fx:{ mor:9, rep:5, men:3, flag:'rival_respect' } }
    ]},
    { label:'Continuer votre échauffement', outcomes:[
      { weight:55, text:'Ce n\'est pas votre problème. Il s\'en sortira. Vous n\'êtes pas très fier en y repensant le soir.', fx:{ mor:-5, men:2 } },
      { weight:45, text:'Quelqu\'un d\'autre l\'aide. Il vous a vu ne rien faire. Cette image restera entre vous pour toujours.', fx:{ rep:-3, mor:-6, flag:'rival_haine' } }
    ]}
  ]},

{ id:'y_rivalbook', cat:'Rivalité', icon:'📕', w:10, cond:{minRep:45,aMin:24},
  text:'{rival} publie son autobiographie. Vous y avez droit à un chapitre entier, intitulé « L\'obstacle ». Ce n\'est pas totalement flatteur.',
  options:[
    { label:'Le lire en entier', outcomes:[
      { weight:60, text:'C\'est dur, honnête, et globalement juste. Vous apprenez plus sur vous en 30 pages qu\'en dix ans de conférences de presse.', fx:{ men:6, mor:-4 } },
      { weight:40, text:'C\'est mesquin et faux sur trois points vérifiables. Vous ne direz rien publiquement, et vous ne l\'oublierez pas.', fx:{ men:4, mor:-6, flag:'rival_haine' } }
    ]},
    { label:'Ne pas l\'ouvrir', outcomes:[
      { weight:100, text:'Vous ne le lirez jamais. Trois journalistes vous en citeront des passages pendant deux ans.', fx:{ men:3, mor:-2 } }
    ]}
  ]},

{ id:'y_rivalretire', cat:'Rivalité', icon:'🕯️', w:11, cond:{aMin:29},
  text:'{rival} annonce sa retraite. Vous avez passé quinze ans à vous mesurer à lui. Personne ne comprend ce que vous ressentez, pas même vous.',
  options:[
    { label:'Lui rendre hommage publiquement', outcomes:[
      { weight:100, text:'Votre texte fait le tour du monde. Vous y écrivez qu\'il vous a rendu meilleur, et c\'est la chose la plus vraie que vous ayez jamais dite en public.', fx:{ rep:10, mor:10, men:4 } }
    ]},
    { label:'Ne rien dire', outcomes:[
      { weight:100, text:'Vous lui envoyez un message privé de deux lignes. Il répond en trois mots. C\'est tout ce dont vous aviez besoin l\'un et l\'autre.', fx:{ mor:7, men:3 } }
    ]}
  ]},

/* ═══════════════ CÉLÉBRITÉ ═══════════════ */

{ id:'y_recognized', cat:'Médias', icon:'🕶️', w:11, cond:{minRep:55},
  text:'Vous êtes reconnu dans un supermarché pour la première fois. La personne est adorable. Les quatorze suivantes le sont aussi. Vous mettez quarante minutes à acheter du lait.',
  options:[
    { label:'Prendre le temps avec chacun', outcomes:[
      { weight:100, text:'Quarante minutes, dix-huit photos, et une réputation d\'homme accessible qui vous suivra toute votre carrière.', fx:{ rep:6, mor:7, form:-2 } }
    ]},
    { label:'Commander vos courses en ligne, désormais', outcomes:[
      { weight:100, text:'Solution efficace, définitive et un peu triste. Vous ne remettrez plus les pieds dans un magasin avant votre retraite.', fx:{ form:3, mor:-4 } }
    ]}
  ]},

{ id:'y_charity', cat:'Médias', icon:'❤️', w:11, cond:{minRep:50,aMin:23},
  text:'Une association vous propose de devenir parrain : des courts dans des quartiers qui n\'en ont pas, et des raquettes pour ceux qui ne peuvent pas en acheter.',
  options:[
    { label:'S\'engager vraiment', outcomes:[
      { weight:100, text:'Pas juste un logo : vous y allez, vous jouez avec les gamins, vous financez trois courts. C\'est ce dont vous serez le plus fier.', fx:{ money:-0.04, mor:16, rep:10, flag:'mecene' } }
    ]},
    { label:'Prêter votre nom seulement', outcomes:[
      { weight:100, text:'Votre nom, une photo, un communiqué. C\'est déjà utile, et vous savez très bien que ce n\'est pas grand-chose.', fx:{ rep:4, mor:2 } }
    ]},
    { label:'Refuser, vous n\'avez pas le temps', outcomes:[
      { weight:100, text:'Vous refusez. Ils comprennent. C\'est bien ça, le pire.', fx:{ form:3, mor:-4 } }
    ]}
  ]},

{ id:'y_ad', cat:'Sponsors', icon:'📺', w:10, cond:{minRep:50},
  text:'Une marque de yaourts vous propose 400 000 € pour une publicité. Le scénario prévoit que vous dansiez. En tenue de tennis. Avec un yaourt géant.',
  options:[
    { label:'Accepter et y aller à fond', hint:'Autodérision', outcomes:[
      { weight:70, text:'Vous dansez avec une conviction totale. La publicité devient culte, on vous en parle pendant dix ans, et vous êtes 400 000 € plus riche.', fx:{ money:0.4, rep:12, mor:6 } },
      { weight:30, text:'C\'est aussi gênant que prévu. Le vestiaire vous chambre pendant deux saisons.', fx:{ money:0.4, rep:5, mor:-6 } }
    ]},
    { label:'Refuser', hint:'Dignité', outcomes:[
      { weight:100, text:'Votre dignité vaut-elle 400 000 € ? Vous n\'aurez jamais la réponse, et le doute vous prendra à chaque relevé bancaire.', fx:{ mor:-3, men:2 } }
    ]}
  ]},

/* ═══════════════ LE CORPS QUI VIEILLIT ═══════════════ */

{ id:'y_warmup', cat:'Corps', icon:'⏰', w:12, cond:{aMin:28},
  text:'Votre échauffement dure désormais cinquante minutes. À vingt ans, vous en faisiez huit et vous étiez prêt.',
  options:[
    { label:'L\'accepter et le structurer', outcomes:[
      { weight:100, text:'Cinquante minutes tous les jours, protocole écrit, rien au hasard. C\'est fastidieux et c\'est ce qui vous fera durer cinq ans de plus.', fx:{ body:10, disc:6, form:3 } }
    ]},
    { label:'Le raccourcir, par orgueil', outcomes:[
      { weight:45, text:'Vous vous échauffez comme à vingt ans. Ça passe.', fx:{ mor:4, form:3 } },
      { weight:55, text:'Vous vous échauffez comme à vingt ans. Ça ne passe pas : claquage au troisième jeu.', fx:{ inj:4, body:-8, mor:-8 } }
    ]}
  ]},

{ id:'y_youngsters', cat:'Vestiaire', icon:'👶', w:11, cond:{aMin:30},
  text:'Trois joueurs du top 50 n\'étaient pas nés quand vous avez disputé votre premier tournoi professionnel. L\'un d\'eux vous demande si c\'est vrai qu\'on jouait « avec des raquettes en bois, avant ».',
  options:[
    { label:'Jouer le vieux sage', outcomes:[
      { weight:100, text:'Vous racontez le circuit d\'avant : les vols en escale, les cordages en boyau, les tournois payés en liquide. Ils vous écoutent vraiment. Vous devenez une mémoire, ce qui est un compliment ambigu.', fx:{ mor:8, rep:4, men:3 } }
    ]},
    { label:'Le battre pour toute réponse', outcomes:[
      { weight:55, text:'Vous le croisez trois semaines plus tard et vous le sortez en trois sets. Il ne pose plus de questions sur le bois.', fx:{ mor:14, men:5, rep:4 } },
      { weight:45, text:'Vous le croisez, et il vous met 6-2 6-2. Les époques se succèdent, et pas dans le désordre.', fx:{ mor:-10, men:4 } }
    ]}
  ]},

{ id:'y_surgery', cat:'Corps', icon:'🏥', w:10, cond:{aMin:27},
  text:'Le chirurgien est direct : « Opérée, ça vous laisse deux ans de plus. Non opérée, six mois. » Il ajoute que la rééducation dure huit mois et qu\'elle réussit trois fois sur quatre.',
  options:[
    { label:'Se faire opérer', outcomes:[
      { weight:70, text:'Huit mois de rééducation, dont trois où vous ne pouvez pas tenir une raquette. Vous revenez, et le corps tient.', fx:{ inj:26, body:20, mor:-10, men:6 } },
      { weight:30, text:'L\'opération se passe mal. Vous revenez avec un an de moins dans les jambes et une articulation qui parle quand il pleut.', fx:{ inj:32, body:6, spd:-4, mor:-16 } }
    ]},
    { label:'Refuser et finir la saison', outcomes:[
      { weight:100, text:'Six mois d\'anti-inflammatoires et d\'infiltrations. Vous jouez tout ce que vous pouvez, en sachant exactement ce que ça coûte.', fx:{ body:-18, form:8, men:5, flag:'burn_fast' } }
    ]}
  ]},

/* ═══════════════ MENTAL ═══════════════ */

{ id:'y_panic', cat:'Mental', icon:'😮‍💨', w:10, cond:{aMin:20,rMax:250},
  text:'Crise d\'angoisse dans le couloir, deux minutes avant d\'entrer sur le court. Vous ne pouvez plus respirer normalement. L\'arbitre vous appelle.',
  options:[
    { label:'Entrer quand même', outcomes:[
      { weight:50, text:'Vous entrez, vous jouez, et le corps reprend le dessus au bout de trois jeux. Vous ne le direz à personne pendant des années.', fx:{ men:4, form:-6, mor:-4 } },
      { weight:50, text:'Vous entrez et vous n\'êtes jamais dans le match. 6-1 6-0 en cinquante minutes.', fx:{ mor:-12, men:2 } }
    ]},
    { label:'Demander cinq minutes et appeler quelqu\'un', outcomes:[
      { weight:70, text:'Cinq minutes, un appel, une respiration. Vous entrez en retard et vous gagnez. Et surtout, vous savez maintenant quoi faire la prochaine fois.', fx:{ men:8, mor:8, trait:'zen' } },
      { weight:30, text:'On vous refuse le délai. Vous entrez au bord des larmes.', fx:{ mor:-10, men:3 } }
    ]}
  ]},

{ id:'y_meditation', cat:'Mental', icon:'🧘', w:10, cond:{aMin:21},
  text:'Votre préparateur mental vous propose la méditation. Vous trouvez ça un peu ridicule pendant les onze premières séances.',
  options:[
    { label:'Persévérer', outcomes:[
      { weight:70, text:'À la douzième, quelque chose se débloque. Vous ne saurez jamais l\'expliquer, et votre pourcentage de tie-breaks gagnés non plus.', fx:{ men:7, mor:6, trait:'zen' } },
      { weight:30, text:'Vingt séances plus tard, toujours rien. Ce n\'est pas pour tout le monde et ce n\'est pas grave.', fx:{ men:1, money:-0.003 } }
    ]},
    { label:'Arrêter', outcomes:[
      { weight:100, text:'Vous préférez taper des balles. C\'est aussi une méthode.', fx:{ fh:1, men:-1 } }
    ]}
  ]},

{ id:'y_matchpoints', cat:'Mental', icon:'🎯', w:10, cond:{aMin:22,rMax:300},
  text:'Vous avez perdu trois matchs cette saison en ayant eu au moins deux balles de match. La presse a inventé un mot pour ça et il n\'est pas gentil.',
  options:[
    { label:'Travailler spécifiquement les fins de match', outcomes:[
      { weight:70, text:'Des semaines à ne jouer que des points à 5-4, 40-30. Le cerveau finit par s\'habituer à ce qu\'il redoute.', fx:{ men:7, srv:1 } },
      { weight:30, text:'Vous travaillez, et ça revient quand même une fois. Puis plus jamais.', fx:{ men:5, mor:-3 } }
    ]},
    { label:'Refuser d\'en faire un sujet', outcomes:[
      { weight:55, text:'Vous décidez que ça n\'existe pas. Étrangement, ça marche : trois mois plus tard vous convertissez tout.', fx:{ men:5, mor:6 } },
      { weight:45, text:'Le nier ne l\'efface pas. Quatrième fois en octobre, sur un court central.', fx:{ men:-4, mor:-9, trait:'nervous' } }
    ]}
  ]},

/* ═══════════════ ARGENT ═══════════════ */

{ id:'y_investment', cat:'Argent', icon:'🏦', w:10, cond:{aMin:24,minRep:40},
  text:'Un conseiller vous propose un placement « sans aucun risque, rendement 11 % ». Il vous a été recommandé par un joueur du circuit.',
  options:[
    { label:'Investir la moitié de vos gains', outcomes:[
      { weight:45, text:'Le placement tient ses promesses pendant six ans. Vous serez à l\'abri après la carrière.', fx:{ money:0.35, mor:8 } },
      { weight:55, text:'Il n\'existe pas de placement sans risque à 11 %. Vous l\'apprenez en même temps que quatorze autres joueurs.', fx:{ money:-0.45, mor:-16, men:5, flag:'arnaque' } }
    ]},
    { label:'Mettre le tout sur un livret ennuyeux', outcomes:[
      { weight:100, text:'2 % par an, zéro frisson, zéro insomnie. Votre conseiller vous trouve « très prudent pour un sportif ».', fx:{ money:0.05, men:2 } }
    ]}
  ]},

{ id:'y_family_money', cat:'Argent', icon:'🧾', w:11, cond:{aMin:23,minRep:45},
  text:'Un cousin que vous voyiez tous les cinq ans vous demande 60 000 € pour lancer une affaire. Il précise que « ça se fait, entre gens de la même famille ».',
  options:[
    { label:'Prêter', outcomes:[
      { weight:40, text:'L\'affaire marche. Il vous rembourse à l\'euro près et vous invite à l\'inauguration. Rare et précieux.', fx:{ money:-0.06, mor:8, flag:'pret_ok' } },
      { weight:60, text:'Vous ne reverrez ni l\'argent ni le cousin. La deuxième perte est la moins douloureuse.', fx:{ money:-0.06, mor:-8, men:3 } }
    ]},
    { label:'Refuser', outcomes:[
      { weight:100, text:'Vous refusez poliment. La famille en parlera pendant les dix Noëls suivants. On ne vous aura pas prévenu que le succès coûte aussi ça.', fx:{ mor:-6, men:4, money:0.0 } }
    ]}
  ]},

{ id:'y_bonus', cat:'Argent', icon:'📄', w:10, cond:{rMax:100,aMin:21},
  text:'Votre contrat d\'équipementier contient une clause : 250 000 € de prime si vous finissez la saison dans le top 20. Vous êtes 22e, il reste deux tournois.',
  options:[
    { label:'Tout jouer, quitte à se cramer', outcomes:[
      { weight:50, text:'Vous jouez les deux tournois à fond. Top 18 au 31 décembre. Le chèque arrive en janvier.', fx:{ money:0.25, form:-14, body:-6, mor:10 } },
      { weight:50, text:'Vous jouez, vous perdez d\'entrée deux fois, et vous finissez 24e. Il vous restait une blessure à ne pas prendre.', fx:{ form:-14, body:-8, mor:-10 } }
    ]},
    { label:'Se préserver pour l\'année suivante', outcomes:[
      { weight:100, text:'Vous laissez filer la prime pour arriver frais en janvier. Votre agent ne s\'en remet pas ; votre corps, si.', fx:{ form:12, body:8, mor:-3 } }
    ]}
  ]},

/* ═══════════════ FÉDÉRATION ET INSTITUTIONS ═══════════════ */

{ id:'y_council', cat:'Fédération', icon:'⚖️', w:10, cond:{rMax:100,aMin:24},
  text:'Les joueurs vous proposent de les représenter au conseil du circuit. Réunions interminables, dossiers indigestes, et zéro reconnaissance.',
  options:[
    { label:'Accepter', outcomes:[
      { weight:65, text:'Deux ans à défendre les joueurs classés au-delà de la 150e place. Vous obtenez une hausse des primes de qualifications. Personne ne le saura jamais, sauf eux.', fx:{ rep:6, mor:10, form:-4, flag:'syndicat' } },
      { weight:35, text:'Deux ans de réunions pour rien. Vous démissionnez, écœuré par la lenteur des choses.', fx:{ form:-6, mor:-6, men:3 } }
    ]},
    { label:'Refuser', outcomes:[
      { weight:100, text:'Vous êtes joueur, pas syndicaliste. Quelqu\'un d\'autre s\'y colle, et vous profiterez de son travail.', fx:{ form:4 } }
    ]}
  ]},

{ id:'y_antidoping', cat:'Fédération', icon:'🧪', w:11, cond:{aMin:19},
  text:'Contrôle antidopage à 6 h du matin, à votre domicile, pour la troisième fois en cinq semaines. Vous devez déclarer chaque nuit où vous dormez, un an à l\'avance.',
  options:[
    { label:'Coopérer sans broncher', outcomes:[
      { weight:100, text:'Vous ouvrez la porte en pyjama, vous remplissez les formulaires, vous retournez vous coucher. C\'est le prix d\'un sport propre, et vous le payez sans discuter.', fx:{ disc:5, men:2, form:-2 } }
    ]},
    { label:'Le dénoncer publiquement', outcomes:[
      { weight:55, text:'Votre sortie sur la vie privée des sportifs lance un vrai débat. Certains vous soutiennent, d\'autres vous soupçonnent aussitôt.', fx:{ rep:5, mor:-4, men:2 } },
      { weight:45, text:'Mauvaise idée. « Pourquoi il se plaint, celui-là ? » Vous mettrez deux ans à faire taire l\'insinuation.', fx:{ rep:-7, mor:-7 } }
    ]}
  ]},

/* ═══════════════ SUPERSTITIONS ET RITUELS ═══════════════ */

{ id:'y_socks', cat:'Rituels', icon:'🧦', w:9, cond:{aMin:18},
  text:'Vous portez les mêmes chaussettes depuis onze victoires consécutives. Elles ne sont plus tout à fait blanches. Votre kiné a fait une remarque.',
  options:[
    { label:'Continuer jusqu\'à la première défaite', outcomes:[
      { weight:100, text:'Quatorze victoires. Puis une défaite, et les chaussettes finissent à la poubelle en direct devant trois coéquipiers hilares.', fx:{ mor:8, rep:2, disc:-2 } }
    ]},
    { label:'Les laver, comme un adulte', outcomes:[
      { weight:55, text:'Vous les lavez et vous gagnez le lendemain. La superstition meurt là, proprement.', fx:{ men:4, disc:3 } },
      { weight:45, text:'Vous les lavez et vous perdez. Vous savez que c\'est une coïncidence. Vous rachetez le même modèle quand même.', fx:{ men:-1, mor:-3 } }
    ]}
  ]},

{ id:'y_number', cat:'Rituels', icon:'🔢', w:9, cond:{aMin:18},
  text:'Vous refusez la chambre 13, le court 13, et vous ne buvez jamais à la treizième gorgée. Un journaliste l\'a remarqué et en a fait un papier entier.',
  options:[
    { label:'En rire avec lui', outcomes:[
      { weight:100, text:'Vous lui expliquez sérieusement pourquoi le 13 est un chiffre inacceptable. L\'article est excellent et vous rend attachant.', fx:{ rep:5, mor:5 } }
    ]},
    { label:'Demander le court 13 au tournoi suivant', hint:'Exorcisme', outcomes:[
      { weight:60, text:'Vous gagnez sur le court 13, en treize jeux gagnés. Vous êtes guéri, et vaguement déçu.', fx:{ men:6, mor:6 } },
      { weight:40, text:'Vous perdez sur le court 13. Vous ne recommencerez plus jamais cette expérience.', fx:{ men:-2, mor:-5 } }
    ]}
  ]},

/* ═══════════════ MOMENTS DE CARRIÈRE ═══════════════ */

{ id:'y_centrecourt', cat:'Étapes', icon:'🏛️', w:13, cond:{rMax:130,aMax:34},
  text:'Premier match sur le court central d\'un Grand Chelem. Le portique, le couloir, la lumière au bout. Un employé vous dit simplement : « Bonne chance. » Il l\'a dit à des milliers de joueurs.',
  options:[
    { label:'Toucher le mur en sortant du couloir', hint:'Rituel', outcomes:[
      { weight:100, text:'Vous posez la main sur le mur, comme tous ceux qui sont passés là. Ce geste-là, vous le referez à chaque fois pendant quinze ans.', fx:{ men:6, mor:14, flag:'mur' } }
    ]},
    { label:'Entrer sans rien regarder', outcomes:[
      { weight:60, text:'Casque, regard au sol, échauffement. Vous jouez comme sur n\'importe quel court, et vous gagnez.', fx:{ men:5, form:4 } },
      { weight:40, text:'Vous entrez tête baissée, et vous relevez les yeux au premier changement de côté. Vous perdez trois jeux à contempler l\'endroit.', fx:{ mor:8, form:-5 } }
    ]}
  ]},

{ id:'y_beatidol', cat:'Étapes', icon:'⭐', w:12, cond:{rMax:120,aMin:19},
  text:'Vous affrontez le joueur dont vous aviez le poster au-dessus de votre lit. Il a 34 ans, il est en fin de carrière, et vous êtes largement favori.',
  options:[
    { label:'Jouer sans état d\'âme', outcomes:[
      { weight:65, text:'6-3 6-2. Il vous félicite au filet et vous dit une phrase que vous ne répéterez à personne. La boucle est bouclée, et elle serre un peu la gorge.', fx:{ mor:12, men:5, rep:4 } },
      { weight:35, text:'Impossible de jouer normalement contre un poster. Il gagne en trois sets, ravi, et vous aussi, secrètement.', fx:{ mor:2, men:3, form:-4 } }
    ]},
    { label:'Lui demander un maillot avant le match', hint:'Fan', outcomes:[
      { weight:100, text:'Vous lui demandez son maillot avant de jouer. Il rit, il accepte, et il vous met 6-4 7-6 juste après. Vous avez le maillot.', fx:{ mor:10, rep:3, men:2 } }
    ]}
  ]},

{ id:'y_homecrowd', cat:'Public', icon:'🇫🇷', w:11, cond:{rMax:200,aMin:19},
  text:'Premier tournoi à domicile en tant que joueur du tableau principal. Le public scande votre nom avant même le premier échange. Vous ne saviez pas que ça faisait cet effet-là.',
  options:[
    { label:'S\'en nourrir', outcomes:[
      { weight:60, text:'Vous jouez porté, au-dessus de votre niveau, et vous sortez un joueur mieux classé. Trois heures de bonheur pur.', fx:{ form:10, mor:16, men:4, rep:6 } },
      { weight:40, text:'La pression du public est un poids autant qu\'un moteur. Vous craquez au troisième set devant les vôtres.', fx:{ mor:-10, men:4, rep:2 } }
    ]},
    { label:'Faire abstraction totale', outcomes:[
      { weight:100, text:'Vous jouez comme si le stade était vide. C\'est efficace, et les gens s\'en rendent compte.', fx:{ men:5, form:3, rep:-2 } }
    ]}
  ]},

{ id:'y_firstm1000', cat:'Étapes', icon:'🥈', w:12, cond:{rMax:60,aMax:34},
  text:'Première finale de Masters 1000. Vingt mille personnes, une heure de retard à cause de la pluie, et vos jambes qui découvrent une sensation nouvelle.',
  options:[
    { label:'Se dire que c\'est un match comme un autre', outcomes:[
      { weight:55, text:'Le mensonge fonctionne assez longtemps pour gagner le premier set. Ensuite, tout est possible.', fx:{ men:6, form:5 } },
      { weight:45, text:'Le mensonge ne tient pas. Vous jouez crispé et vous perdez en deux sets rapides.', fx:{ mor:-6, men:5 } }
    ]},
    { label:'Regarder le trophée, longuement, avant d\'entrer', outcomes:[
      { weight:100, text:'Vous le regardez pendant dix secondes. Ce n\'est pas de la superstition, c\'est du carburant.', fx:{ mor:10, men:4, form:3 } }
    ]}
  ]},

/* ═══════════════ FIN DE PARCOURS ═══════════════ */

{ id:'y_lastmatch', cat:'Retraite', icon:'🎬', w:12, cond:{aMin:33},
  text:'Vous savez, en entrant sur le court, que c\'est probablement votre dernier match. Personne d\'autre ne le sait.',
  options:[
    { label:'L\'annoncer au micro après le match', outcomes:[
      { weight:100, text:'Vous prenez le micro, vous cherchez vos mots, vous n\'y arrivez pas complètement. Le stade est debout avant même la fin de votre phrase.', fx:{ rep:12, mor:18, flag:'adieu_micro' } }
    ]},
    { label:'Partir sans rien dire', outcomes:[
      { weight:100, text:'Vous ramassez vos raquettes, vous saluez l\'arbitre et vous sortez. Trois cents personnes. Le silence du couloir. C\'est fini, et personne ne le sait encore.', fx:{ men:8, mor:6 } }
    ]}
  ]},

{ id:'y_afterlife', cat:'Reconversion', icon:'🚪', w:12, cond:{aMin:31},
  text:'Vous vous réveillez un mardi de février sans avion à prendre. Pour la première fois depuis dix-huit ans, il n\'y a rien dans l\'agenda.',
  options:[
    { label:'Prendre six mois pour ne rien faire', outcomes:[
      { weight:100, text:'Six mois à ne rien faire, ce qui pour vous relève de l\'exploit sportif. Vous réapprenez à dormir, à manger, à avoir des amis.', fx:{ mor:16, body:12, form:-8 } }
    ]},
    { label:'Enchaîner immédiatement sur autre chose', outcomes:[
      { weight:55, text:'Vous vous jetez dans un projet dès le lendemain. C\'est ce qui vous empêche de tomber.', fx:{ mor:8, men:4 } },
      { weight:45, text:'Vous enchaînez pour ne pas penser. Ça marche six mois, puis tout vous tombe dessus d\'un coup.', fx:{ mor:-12, men:5 } }
    ]}
  ]},

{ id:'y_hall', cat:'Reconversion', icon:'🏅', w:10, cond:{aMin:33,minRep:60},
  text:'On vous propose de figurer au panthéon du tennis national. Cérémonie, plaque, discours. Votre premier entraîneur est mort il y a deux ans.',
  options:[
    { label:'Accepter et lui dédier', outcomes:[
      { weight:100, text:'Votre discours ne parle que de lui : le club, les balles usées, les tournois du dimanche. La salle pleure. Vous aussi.', fx:{ mor:18, rep:8 } }
    ]},
    { label:'Refuser les honneurs', outcomes:[
      { weight:100, text:'« Les plaques, c\'est pour ceux qui n\'ont plus rien à faire. » Vous avez tort et ça vous va bien.', fx:{ men:4, rep:-2, mor:3 } }
    ]}
  ]},

/* ═══════════════ INSOLITE ═══════════════ */

{ id:'y_cat2', cat:'Insolite', icon:'🐈', w:8, cond:{flag:'cat'},
  text:'Break, le chat de la pension turque, a été retrouvé. Un joueur du circuit l\'a adopté et lui a fait un compte sur les réseaux. Il a plus d\'abonnés que vous.',
  options:[
    { label:'Réclamer publiquement votre chat', outcomes:[
      { weight:100, text:'La bataille pour la garde de Break est le meilleur feuilleton du circuit cette saison. Vous perdez, mais vous gagnez 40 000 abonnés.', fx:{ rep:8, mor:9 } }
    ]},
    { label:'Le laisser vivre sa vie', outcomes:[
      { weight:100, text:'Break a une belle vie. C\'était un chat de passage, comme tout le monde sur ce circuit.', fx:{ mor:5 } }
    ]}
  ]},

{ id:'y_wasp', cat:'Insolite', icon:'🐝', w:8, cond:{},
  text:'Un nid de guêpes se réveille sous la chaise de l\'arbitre à 5-5 dans le troisième set. L\'arbitre descend le premier. Très vite.',
  options:[
    { label:'Rester sur le court, immobile', hint:'Sang-froid', outcomes:[
      { weight:65, text:'Vous restez planté au fond du court pendant que tout le monde court partout. Votre adversaire ne s\'en remet pas et perd les deux jeux suivants.', fx:{ men:5, mor:9, trait:'zen', rep:3 } },
      { weight:35, text:'Vous restez immobile et vous prenez trois piqûres. La main enfle, le match est perdu.', fx:{ inj:1, mor:-6, fh:-1 } }
    ]},
    { label:'Détaler comme tout le monde', outcomes:[
      { weight:100, text:'Vous courez plus vite que jamais dans votre carrière. Les images font le tour du monde et vous rendent instantanément sympathique.', fx:{ rep:6, mor:6, spd:1 } }
    ]}
  ]},

{ id:'y_proposal', cat:'Insolite', icon:'💍', w:8, cond:{minRep:35},
  text:'Un spectateur profite d\'un changement de côté pour faire sa demande en mariage à sa compagne. Le stade applaudit. Elle dit oui. Vous attendez, raquette à la main.',
  options:[
    { label:'Aller les féliciter', outcomes:[
      { weight:100, text:'Vous montez dans les tribunes leur serrer la main. Le tournoi vous offrira les places pour leur mariage. Vous irez.', fx:{ rep:7, mor:10, form:-2 } }
    ]},
    { label:'Reprendre le jeu', outcomes:[
      { weight:100, text:'Vous servez. On vous reprochera un peu votre froideur, et vous gagnerez le match.', fx:{ men:3, rep:-2 } }
    ]}
  ]},

{ id:'y_scoreboard', cat:'Insolite', icon:'🔢', w:8, cond:{},
  text:'Le tableau d\'affichage est en panne depuis le début du deuxième set. Plus personne ne sait vraiment le score, y compris l\'arbitre, qui consulte discrètement ses notes.',
  options:[
    { label:'Contester le score annoncé', outcomes:[
      { weight:50, text:'Vous aviez raison : deux jeux d\'écart en votre faveur. L\'arbitre s\'excuse et corrige.', fx:{ men:4, mor:6 } },
      { weight:50, text:'Vous aviez tort. Vous passez pour celui qui ne sait pas compter, ce qui est exact.', fx:{ mor:-5, rep:-2 } }
    ]},
    { label:'Faire confiance à l\'arbitre', outcomes:[
      { weight:100, text:'Vous jouez sans jamais savoir précisément où vous en êtes. Étrangement, vous jouez mieux : plus de calcul, juste des balles.', fx:{ men:5, form:4, trait:'zen' } }
    ]}
  ]},

{ id:'y_dogcourt', cat:'Insolite', icon:'🐕‍🦺', w:8, cond:{},
  text:'Un chien s\'échappe des tribunes, traverse le court en diagonale et repart avec une balle. Il revient trois minutes plus tard pour en prendre une deuxième.',
  options:[
    { label:'Jouer avec lui devant tout le stade', outcomes:[
      { weight:100, text:'Vous lui lancez une balle. Il la rapporte. Vous recommencez. Le stade est en larmes de rire et la séquence fait dix millions de vues.', fx:{ rep:9, mor:12, form:-2 } }
    ]},
    { label:'Attendre que la sécurité s\'en occupe', outcomes:[
      { weight:100, text:'Quatre agents en costume poursuivent un chien pendant six minutes. Vous n\'aurez rien fait, et c\'était déjà très drôle.', fx:{ mor:5 } }
    ]}
  ]}

];

/* ─────────────────── MICRO-ÉVÉNEMENTS ─────────────────── */
const MICRO_B = [
  { id:'my1', w:8, text:'Vous changez de marque de balles à l\'entraînement. Trois semaines pour retrouver vos repères.', fx:{ fh:-1, men:1 } },
  { id:'my2', w:8, text:'Un tournoi vous offre une invitation de dernière minute. Deux tours gagnés, et le budget de la semaine sauvé.', fx:{ money:0.002, mor:6 } },
  { id:'my3', w:7, text:'Vous apprenez l\'espagnol pendant les trajets. Six mois plus tard, le vestiaire sud-américain vous adopte.', fx:{ mor:8, rep:2 } },
  { id:'my4', w:8, text:'Vous ratez un tournoi pour un mariage. Le mariage était mieux.', fx:{ mor:9, form:5 } },
  { id:'my5', w:7, text:'Une nouvelle chaussure vous provoque des ampoules pendant six semaines.', fx:{ body:-4, form:-3 } },
  { id:'my6', w:8, text:'Vous réglez enfin votre problème de lancer de balle par vent de face.', fx:{ srv:2 } },
  { id:'my7', w:7, text:'Un ancien numéro un vous prend à l\'entraînement pendant une semaine. Vous en ressortez transformé.', fx:{ men:3, fh:2, mor:8 } },
  { id:'my8', w:8, text:'Le décalage horaire de la tournée asiatique vous détruit pendant un mois.', fx:{ form:-9, mor:-4 } },
  { id:'my9', w:7, text:'Vous découvrez que vous jouez 12 % mieux en session de nuit. Vous en ferez un argument auprès des tournois.', fx:{ men:2, mor:4 } },
  { id:'my10', w:8, text:'Un journaliste écrit que vous êtes « le joueur le plus sous-estimé du circuit ». Vous découpez l\'article.', fx:{ mor:7, rep:2 } },
  { id:'my11', w:7, text:'Vous cassez votre raquette fétiche. Le modèle n\'est plus fabriqué depuis quatre ans.', fx:{ mor:-6, fh:-1 } },
  { id:'my12', w:8, text:'Une préparation hivernale sans la moindre blessure. Ça n\'était pas arrivé depuis longtemps.', fx:{ body:8, form:8 } },
  { id:'my13', w:7, text:'Vous acceptez une séance photo à 6 h du matin. Le résultat est superbe, votre humeur non.', fx:{ money:0.006, mor:-3 } },
  { id:'my14', w:8, text:'Vous prenez un partenaire d\'entraînement gaucher à l\'année. Votre revers vous remercie.', fx:{ bh:2, money:-0.004 } },
  { id:'my15', w:7, text:'Trois nuits blanches à cause d\'un bébé. Vous ne changeriez de vie pour rien au monde.', fx:{ form:-6, mor:10 } },
  { id:'my16', w:8, text:'Un tournoi installe enfin l\'arbitrage électronique. Fini les discussions inutiles.', fx:{ men:2 } },
  { id:'my17', w:7, text:'Vous vous mettez au yoga. Le vestiaire se moque pendant deux mois, puis s\'y met aussi.', fx:{ body:5, spd:1, mor:3 } },
  { id:'my18', w:8, text:'Votre nom apparaît pour la première fois dans un jeu vidéo de tennis. Vos statistiques y sont très en dessous de la réalité.', fx:{ rep:4, mor:5 } },
  { id:'my19', w:7, text:'Vous perdez votre carnet de notes de match, tenu depuis sept ans.', fx:{ men:-2, mor:-6 } },
  { id:'my20', w:8, text:'Un jeune du circuit vous cite comme modèle en conférence de presse. Ça fait quelque chose.', fx:{ mor:9, rep:3 } }
];

EVENTS.push(...EVENTS_B);
MICRO.push(...MICRO_B);


/* ─────────── Micro-moments d'ambiance ───────────
   Sans effet mécanique : ils ne changent rien aux attributs, ils racontent la vie
   du circuit entre deux semaines. C'est le registre le plus fin du jeu — la phrase
   pose un fait et s'arrête, sans venir expliquer ce qu'il faut en penser. */
MICRO.push(
  { id:'a_escale',    w:8, text:'Quatre heures d\'escale, un sandwich à onze euros, et la certitude tranquille que personne au monde ne sait où vous êtes.', fx:{} },
  { id:'a_navette',   w:7, text:'Le bénévole qui conduit la navette vous explique pendant quarante minutes comment il aurait joué votre dernier point. Il n\'a pas complètement tort.', fx:{} },
  { id:'a_14h',       w:8, text:'Le tableau annonçait votre match « pas avant 14 heures ». Il est 21 h 10 et vous vous êtes échauffé quatre fois.', fx:{form:-2} },
  { id:'a_vestiaire', w:7, text:'Un joueur rentre du court, s\'assoit, ne dit rien pendant vingt minutes, puis plie ses affaires. Personne ne demande le score.', fx:{} },
  { id:'a_bache',     w:7, text:'Trois heures sous la bâche, une reprise annoncée, un renvoi au lendemain, et quatre bananes.', fx:{form:-2} },
  { id:'a_chaleur',   w:6, text:'Quarante degrés sur le court. La règle de chaleur s\'applique à partir de quarante et un.', fx:{form:-3} },
  { id:'a_arbitre',   w:7, text:'L\'arbitre de chaise s\'occupe aussi des inscriptions et, depuis ce matin, du cordage.', fx:{} },
  { id:'a_trophee',   w:6, text:'Le vainqueur repart avec un trophée, un bouquet et un bon d\'achat dans un magasin de bricolage.', fx:{} },
  { id:'a_bosse',     w:7, text:'Le court numéro 3 a une bosse près de la ligne de fond, connue de tous les joueurs et signalée à personne.', fx:{} },
  { id:'a_pizza',     w:7, text:'Le seul restaurant ouvert après 22 heures sert des pizzas. Vous y retrouvez la moitié du tableau.', fx:{} },
  { id:'a_raquettes', w:7, text:'Douze raquettes identiques dans le sac, dont deux que vous ne sortez plus depuis qu\'elles ont perdu.', fx:{} },
  { id:'a_chaussures',w:6, text:'Une paire de chaussures tient six semaines sur dur et trois sur terre battue. Le contrat en prévoit quatre par an.', fx:{} },
  { id:'a_box',       w:7, text:'Depuis deux jeux, votre entraîneur mime quelque chose dans le box. Vous acquiescez avec conviction.', fx:{} },
  { id:'a_hotel',     w:7, text:'L\'hôtel du tournoi affiche quatre étoiles. Trois sont peintes sur la façade.', fx:{} },
  { id:'a_wifi',      w:6, text:'Le wifi du site ne fonctionne que dans le couloir, debout, près de la machine à café.', fx:{} },
  { id:'a_public',    w:7, text:'Onze personnes dans les tribunes, dont sept en famille et deux qui attendent le match suivant.', fx:{} },
  { id:'a_question',  w:6, text:'Le journaliste vous pose la même question que l\'an dernier. Vous donnez la même réponse.', fx:{} },
  { id:'a_reveil',    w:7, text:'Réveil à 5 h 40 pour un vol de 8 h 15, pour un match qui sera reporté au lendemain.', fx:{form:-2} },
  { id:'a_kine',      w:7, text:'Le kiné appuie à l\'endroit exact qui fait mal et dit que ce n\'est rien.', fx:{} },
  { id:'a_chambre',   w:7, text:'Chambre 412. La même moquette que la semaine dernière, dans une autre ville.', fx:{mor:-2} }
);
