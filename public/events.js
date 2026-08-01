/* ══════════════════════════════════════════════════════════════════════════
   VAMONOS TENNIS — Contenu narratif additionnel
   Ces événements s'ajoutent à ceux de data.js. Le moteur ne contient aucun
   texte : pour enrichir le jeu, il suffit d'écrire ici.

   cond : aMin/aMax (âge) · rMin (classement au moins aussi mauvais que)
          rMax (classement au moins aussi bon que) · minMor/maxMor (moral)
          minRep (notoriété) · maxForm (fraîcheur) · maxDisc · flag/noFlag
   fx   : srv ret fh bh vol spd sta men · rep mor form disc body
          money (en M€) · inj (semaines) · clay/hard/grass · trait · flag
   ══════════════════════════════════════════════════════════════════════════ */

const EVENTS_EXTRA = [

/* ═══════════════ LE CIRCUIT SECONDAIRE, DANS TOUTE SA SPLENDEUR ═══════════════ */

{ id:'x_hotel', cat:'Voyages', icon:'🛏️', w:16, cond:{rMin:250, aMax:30},
  text:'L\'hôtel du tournoi ITF, quatre étoiles selon le site officiel, se révèle être une pension au-dessus d\'un karaoké. Eau froide, matelas en contreplaqué, et un chat qui a manifestement des droits acquis sur votre lit.',
  options:[
    { label:'Prendre une chambre ailleurs à vos frais', hint:'Confort', outcomes:[
      { weight:60, text:'Quatre-vingts euros la nuit pour dormir enfin. Vous gagnez deux tours. Votre comptable, lui, ne rit pas.', fx:{ money:-0.0004, form:6, mor:5 } },
      { weight:40, text:'Vous changez d\'hôtel, et découvrez que le nouveau est à quarante minutes du club. Vous passez la semaine dans les taxis.', fx:{ money:-0.0006, form:-3 } }
    ]},
    { label:'Rester et faire ami avec le chat', hint:'Économe', outcomes:[
      { weight:55, text:'Le chat s\'appelle désormais Break. Il dort sur vos raquettes et vous portez chance. Trois tours gagnés.', fx:{ mor:9, men:1, flag:'cat' } },
      { weight:45, text:'Deux nuits à quatre heures de sommeil. Vous jouez le premier tour dans un état second.', fx:{ form:-9, mor:-4 } }
    ]}
  ]},

{ id:'x_luggage', cat:'Voyages', icon:'🧳', w:14, cond:{aMax:34},
  text:'La compagnie aérienne a perdu votre housse. Neuf raquettes, vos chaussures, votre grip préféré : quelque part entre Francfort et un entrepôt d\'Istanbul. Vous jouez dans trente heures.',
  options:[
    { label:'Emprunter des raquettes à un adversaire', hint:'Débrouille', outcomes:[
      { weight:55, text:'Un vétéran turc vous prête deux cadres et refuse tout paiement : « Un jour tu feras pareil. » Vous jouez avec une tension inconnue et vous gagnez quand même.', fx:{ men:2, mor:8, form:-3 } },
      { weight:45, text:'Vous jouez avec un cadre trop lourd de 20 grammes. Le coude proteste dès le deuxième set.', fx:{ body:-5, form:-6, fh:-1 } }
    ]},
    { label:'Racheter du matériel en urgence', outcomes:[
      { weight:100, text:'Le magasin de sport du centre commercial. 620 € pour trois raquettes que vous n\'auriez jamais choisies. La housse arrivera trois jours après le tournoi.', fx:{ money:-0.0007, mor:-6 } }
    ]},
    { label:'Déclarer forfait', hint:'Rageant', outcomes:[
      { weight:100, text:'Forfait avant même de commencer. Le voyage, l\'hôtel, l\'inscription : tout ça pour une étiquette de bagage mal collée.', fx:{ mor:-12, form:8, flag:'wd_luggage' } }
    ]}
  ]},

{ id:'x_customs', cat:'Voyages', icon:'🛂', w:10, cond:{aMax:36},
  text:'Le douanier examine vos douze raquettes, vos quatre kilos de cordage et vos compléments alimentaires. Il vous demande, très sérieusement, si vous êtes « dans le commerce ».',
  options:[
    { label:'Expliquer patiemment', outcomes:[
      { weight:70, text:'Vingt minutes d\'explications, une photo avec sa fille qui joue en club, et vous repartez avec tout votre matériel.', fx:{ rep:1, mor:3 } },
      { weight:30, text:'Il ne vous croit pas. Deux heures de fouille, et vos gels énergétiques finissent à la poubelle.', fx:{ mor:-5, form:-3 } }
    ]},
    { label:'Sortir votre classement mondial sur le téléphone', hint:'Orgueil', outcomes:[
      { weight:50, text:'Il regarde l\'écran, remonte la liste, remonte encore… et lâche : « Ah oui, quand même, c\'est loin. » Vous passez, humilié mais libre.', fx:{ mor:-4, men:2 } },
      { weight:50, text:'Il est impressionné et vous laisse passer avec un salut militaire. C\'était votre meilleur moment de la semaine.', fx:{ mor:6, rep:1 } }
    ]}
  ]},

{ id:'x_food', cat:'Voyages', icon:'🍽️', w:12, cond:{rMin:180},
  text:'Le buffet des joueurs propose : du riz blanc, du riz blanc, et une salade qui a connu des jours meilleurs. Le tournoi est fier de préciser que c\'est inclus.',
  options:[
    { label:'Manger le riz, encore', outcomes:[
      { weight:100, text:'Onzième repas de riz blanc du mois. Vous ne savez plus si vous êtes un athlète ou un moine bouddhiste.', fx:{ mor:-4, sta:1 } }
    ]},
    { label:'Cuisiner vous-même à l\'hôtel', hint:'Pro', outcomes:[
      { weight:65, text:'Une plaque électrique, des pâtes, du thon. Vous mangez correctement pour la première fois depuis dix jours.', fx:{ form:5, body:3, money:-0.0002 } },
      { weight:35, text:'Vous déclenchez le détecteur de fumée à 23 h. L\'hôtel entier évacue. Vous jouez à 9 h le lendemain.', fx:{ form:-6, mor:-3 } }
    ]}
  ]},

{ id:'x_stringer', cat:'Matériel', icon:'🕸️', w:12, cond:{aMin:17},
  text:'Le cordeur du tournoi vous rend vos raquettes tendues trois kilos au-dessus de ce que vous aviez demandé. Vous vous en apercevez à l\'échauffement, quarante minutes avant le match.',
  options:[
    { label:'Jouer avec, sans rien dire', hint:'Fataliste', outcomes:[
      { weight:50, text:'Le bras encaisse mal, mais bizarrement la balle sort plus vite. Vous gagnez et vous gardez la tension.', fx:{ srv:2, body:-3 } },
      { weight:50, text:'Aucun contrôle, aucune sensation. Vous perdez en deux sets sans avoir jamais compris où partaient vos balles.', fx:{ form:-6, mor:-6 } }
    ]},
    { label:'Le faire refaire en urgence', outcomes:[
      { weight:60, text:'Il refait tout en trente minutes, s\'excuse platement, et refuse d\'être payé. Le match commence avec dix minutes de retard.', fx:{ mor:2 } },
      { weight:40, text:'Il n\'a pas le temps. Vous entrez sur le court avec une seule raquette correcte — et vous cassez une corde au deuxième jeu.', fx:{ form:-8, mor:-7 } }
    ]}
  ]},

/* ═══════════════ RITUELS ET SUPERSTITIONS ═══════════════ */

{ id:'x_bottles', cat:'Rituels', icon:'🧴', w:13, cond:{aMin:18, aMax:34},
  text:'Vous avez commencé, un peu par jeu, à aligner vos deux bouteilles exactement parallèles devant votre chaise, étiquettes face au court. Vous avez gagné six matchs d\'affilée. Un ramasseur vient d\'en déplacer une.',
  options:[
    { label:'Tout réaligner, calmement, sans un mot', hint:'Sacré', outcomes:[
      { weight:65, text:'Vous réalignez. Le stade entier regarde. La série continue, et le rituel est désormais officiel : les ramasseurs n\'y toucheront plus jamais.', fx:{ men:3, mor:5, flag:'bottles' } },
      { weight:35, text:'Vous réalignez trois fois. Les commentateurs en font tout un sujet, un montage circule, vous devenez « le gars des bouteilles ».', fx:{ rep:5, men:2, flag:'bottles' } }
    ]},
    { label:'Décider que c\'est ridicule et arrêter', hint:'Rationnel', outcomes:[
      { weight:55, text:'Vous laissez la bouteille de travers. Vous gagnez quand même. Vous êtes libéré d\'un poids que vous vous étiez inventé.', fx:{ men:4, mor:4 } },
      { weight:45, text:'Vous perdez ce match-là. Vous savez parfaitement que ça n\'a aucun rapport. Vous réalignez les bouteilles au tournoi suivant.', fx:{ mor:-4, flag:'bottles' } }
    ]}
  ]},

{ id:'x_lines', cat:'Rituels', icon:'🚷', w:10, cond:{aMin:17},
  text:'Vous ne marchez jamais sur les lignes. Jamais. Un jeune du circuit vous a vu faire trois pas de côté pour éviter une ligne de couloir, et il ne s\'en remet pas.',
  options:[
    { label:'Assumer totalement', outcomes:[
      { weight:100, text:'« Chacun ses trucs. » Il commence à faire pareil deux semaines plus tard. La superstition est contagieuse sur ce circuit.', fx:{ mor:4, men:2, rep:2 } }
    ]},
    { label:'Vous forcer à marcher sur toutes les lignes', hint:'Exposition', outcomes:[
      { weight:60, text:'Trois jours d\'inconfort, puis plus rien. Vous récupérez un peu d\'espace mental.', fx:{ men:4, mor:3 } },
      { weight:40, text:'Vous n\'y arrivez pas. Vous vous surprenez à contourner les lignes dans le couloir de l\'hôtel.', fx:{ men:-1, mor:-2 } }
    ]}
  ]},

{ id:'x_towel', cat:'Rituels', icon:'🧻', w:11, cond:{aMin:18},
  text:'Vous demandez la serviette après chaque point. Absolument chaque point. Y compris les aces. Un adversaire s\'en est plaint à l\'arbitre en direct : « Il transpire pas, il fait ça pour m\'endormir. »',
  options:[
    { label:'Accélérer un peu, par correction', outcomes:[
      { weight:70, text:'Vous réduisez à un point sur deux. Le rythme du match change, et pas en votre faveur.', fx:{ men:-2, rep:2 } },
      { weight:30, text:'Vous accélérez et vous jouez mieux. Il fallait juste qu\'on vous le dise.', fx:{ form:4, men:2 } }
    ]},
    { label:'Ralentir encore, exprès', hint:'Vicieux', outcomes:[
      { weight:55, text:'Il explose au troisième set, prend un avertissement, et perd le fil. La guerre des nerfs a été gagnée à la serviette.', fx:{ men:4, rep:3, trait:'clutch' } },
      { weight:45, text:'L\'arbitre vous met l\'avertissement pour dépassement de temps. Deux fois. Vous perdez un point sur seconde balle.', fx:{ men:-2, rep:2, mor:-4 } }
    ]}
  ]},

/* ═══════════════ LE VESTIAIRE DU CIRCUIT ═══════════════ */

{ id:'x_veteran', cat:'Vestiaire', icon:'🧓', w:14, cond:{aMax:22},
  text:'Dans le vestiaire, un joueur de 38 ans, toujours classé, enroule ses chevilles depuis vingt minutes. Il vous regarde et lâche : « Profite. À ton âge je pensais avoir le temps. »',
  options:[
    { label:'Lui demander comment il tient encore', outcomes:[
      { weight:70, text:'Deux heures de conversation. Il vous explique tout : la charge, le sommeil, les impasses à faire, et surtout à qui ne pas faire confiance.', fx:{ men:5, sta:2, mor:7, disc:5 } },
      { weight:30, text:'Il vous répond « anti-inflammatoires et mauvaise foi » et retourne à ses bandages. Vous ne saurez pas s\'il plaisantait.', fx:{ mor:3, men:1 } }
    ]},
    { label:'Sourire poliment et mettre vos écouteurs', outcomes:[
      { weight:100, text:'Vous avez 19 ans et le temps devant vous. Vous repenserez à cette phrase à 31 ans, sur une table de kiné.', fx:{ mor:1 } }
    ]}
  ]},

{ id:'x_swiss', cat:'Vestiaire', icon:'😐', w:11, cond:{rMax:200, aMin:18},
  text:'Vous partagez le vestiaire avec un joueur qui vient de disputer quatre heures sous 34 °C. Il ne transpire pas. Il ne respire pas fort. Il plie sa serviette. Vous, vous avez perdu deux kilos en vous échauffant.',
  options:[
    { label:'Lui demander son secret', outcomes:[
      { weight:60, text:'« Je bois de l\'eau. » C\'est tout ce que vous obtiendrez. Vous soupçonnez qu\'il ne soit pas entièrement humain.', fx:{ mor:4 } },
      { weight:40, text:'Il vous parle vraiment : hydratation, respiration nasale, économie de déplacement. Vous notez tout dans votre téléphone.', fx:{ sta:3, spd:1, mor:3 } }
    ]},
    { label:'Décider de travailler le foncier tout l\'hiver', hint:'Souffrance', outcomes:[
      { weight:100, text:'Vous ne serez jamais lui. Mais vous ne serez plus celui qui s\'écroule au troisième set.', fx:{ sta:4, body:-3, form:-4 } }
    ]}
  ]},

{ id:'x_padel', cat:'Vestiaire', icon:'🥎', w:12, cond:{aMin:26},
  text:'Un ancien du circuit, retraité depuis deux ans, vous envoie un message : il monte trois clubs de padel et cherche des associés. « Franchement, c\'est là que ça se passe maintenant. »',
  options:[
    { label:'Investir', hint:'Reconversion', outcomes:[
      { weight:55, text:'80 000 € placés dans du gazon synthétique et des parois vitrées. Deux ans plus tard, c\'est votre placement le plus rentable.', fx:{ money:-0.08, flag:'padel' } },
      { weight:45, text:'80 000 € dans un projet qui prend l\'eau dès la première saison. Le padel, c\'est comme le tennis : tout le monde croit que c\'est facile.', fx:{ money:-0.08, mor:-6 } }
    ]},
    { label:'Refuser poliment', outcomes:[
      { weight:100, text:'« Je joue encore au tennis, moi. » Il rit. Vous vous demandez, une seconde, lequel des deux a raison.', fx:{ men:2 } }
    ]},
    { label:'Y jouer une fois pour voir', hint:'Curiosité', outcomes:[
      { weight:100, text:'Deux heures de padel. Vous perdez contre des cadres commerciaux de 45 ans et vous avez des courbatures partout. Le sport est une leçon d\'humilité permanente.', fx:{ mor:5, form:-2, vol:1 } }
    ]}
  ]},

{ id:'x_junior_autograph', cat:'Vestiaire', icon:'✍️', w:11, cond:{rMax:300, aMin:22},
  text:'Un junior de 16 ans vous demande un autographe après votre entraînement. Charmant. Vous le retrouvez trois mois plus tard au premier tour d\'un Challenger.',
  options:[
    { label:'Le prendre très au sérieux', hint:'Lucide', outcomes:[
      { weight:70, text:'Vous jouez comme si c\'était une finale. Vous gagnez 6-2 6-1. Il vous serre la main en disant « merci ». Vous vous sentez vieux et vivant à la fois.', fx:{ men:3, mor:5 } },
      { weight:30, text:'Vous jouez à fond et vous perdez quand même 7-5 au troisième. Il a l\'âge d\'être votre petit frère et il vient de vous passer dessus.', fx:{ mor:-9, men:4 } }
    ]},
    { label:'Le prendre de haut', hint:'Erreur classique', outcomes:[
      { weight:45, text:'6-1 6-0. Il apprendra. Le circuit est cruel avec les gentils.', fx:{ mor:4, rep:1 } },
      { weight:55, text:'Il vous démonte en deux sets, célèbre poing serré, et vous salue à peine. Vous venez de créer votre propre bête noire.', fx:{ mor:-12, men:3, flag:'nemesis_kid' } }
    ]}
  ]},

/* ═══════════════ ARBITRAGE ET TECHNOLOGIE ═══════════════ */

{ id:'x_shotclock', cat:'Arbitrage', icon:'⏱️', w:12, cond:{aMin:18},
  text:'Le chronomètre des 25 secondes se déclenche avant même que le public ait fini d\'applaudir le point précédent. Troisième avertissement du match. Vous n\'avez pas encore repris votre souffle.',
  options:[
    { label:'Discuter avec l\'arbitre au changement de côté', outcomes:[
      { weight:60, text:'Conversation calme, argument imparable, il ajuste son déclenchement. Rien de spectaculaire, tout de gagné.', fx:{ men:3, rep:1 } },
      { weight:40, text:'Il vous répond « c\'est la règle » quatorze fois avec exactement la même intonation. Vous abandonnez.', fx:{ mor:-4 } }
    ]},
    { label:'Servir vite, très vite, sans réfléchir', hint:'Chaos', outcomes:[
      { weight:50, text:'Vous prenez tout le monde de vitesse, y compris votre adversaire, qui n\'est jamais prêt. Quatre jeux gagnés à la suite.', fx:{ form:5, men:2, srv:1 } },
      { weight:50, text:'Servir sans routine, ça donne 61 % de premières balles et deux doubles fautes par jeu. Mauvaise idée.', fx:{ srv:-1, mor:-4 } }
    ]}
  ]},

{ id:'x_hawkeye', cat:'Arbitrage', icon:'📺', w:11, cond:{aMin:18, rMax:250},
  text:'L\'arbitrage électronique annonce votre balle faute de deux millimètres. Deux. Le stade voit l\'image géante. Vous aussi. C\'était balle de set.',
  options:[
    { label:'Applaudir la machine, ironiquement', hint:'Théâtre', outcomes:[
      { weight:60, text:'Applaudissements lents face à l\'écran géant. Le public adore, l\'arbitre moins. Vous prenez un avertissement et vous vous en fichez.', fx:{ rep:6, mor:3, men:-1 } },
      { weight:40, text:'Le geste passe mal. « Mauvais perdant », titre un site le lendemain. Deux millimètres, et une réputation.', fx:{ rep:2, mor:-6 } }
    ]},
    { label:'Ne rien montrer et servir', hint:'Marbre', outcomes:[
      { weight:65, text:'Aucune réaction. Vous gagnez les cinq points suivants. C\'est là que les adversaires commencent à vous craindre.', fx:{ men:5, trait:'zen' } },
      { weight:35, text:'Vous ne montrez rien mais vous y pensez pendant vingt minutes. La machine ne se trompe pas ; vous, si.', fx:{ men:-2, form:-4 } }
    ]}
  ]},

{ id:'x_crowdnoise', cat:'Public', icon:'📣', w:11, cond:{aMin:18},
  text:'Un spectateur crie systématiquement pendant votre lancer de balle. Uniquement pendant le vôtre. L\'arbitre a demandé le silence trois fois, sans effet.',
  options:[
    { label:'Faire expulser le spectateur', outcomes:[
      { weight:55, text:'La sécurité l\'accompagne dehors sous les huées. Le silence revient, et vous avec.', fx:{ form:4, men:2 } },
      { weight:45, text:'Le public prend son parti. Vous jouez la fin du match contre quinze mille personnes.', fx:{ form:-7, men:3, mor:-5 } }
    ]},
    { label:'Le regarder droit dans les yeux et sourire', hint:'Sang-froid', outcomes:[
      { weight:60, text:'Il se tait immédiatement. Personne n\'aime être regardé. Le stade rit, vous enchaînez.', fx:{ men:4, rep:4, mor:5 } },
      { weight:40, text:'Il redouble. Mais quelque chose s\'est débloqué : vous jouez la fin du match dans une bulle.', fx:{ men:5, trait:'zen' } }
    ]}
  ]},

/* ═══════════════ MÉDIAS ET RÉSEAUX ═══════════════ */

{ id:'x_influencer', cat:'Médias', icon:'📱', w:12, cond:{minRep:30, aMax:32},
  text:'Un influenceur à 4 millions d\'abonnés vous propose un « défi tennis » filmé : s\'il vous prend un jeu, vous lui offrez une raquette. Il n\'a jamais tenu une raquette de sa vie.',
  options:[
    { label:'Accepter et jouer le jeu', hint:'Visibilité', outcomes:[
      { weight:55, text:'La vidéo fait 11 millions de vues. Vous êtes drôle, humain, et soudain trois fois plus suivi qu\'avant. Votre agent pleure de joie.', fx:{ rep:14, money:0.012, mor:5 } },
      { weight:45, text:'Il vous prend un jeu — sur trois doubles fautes de votre part. Le montage insiste lourdement. Vous êtes le gars qui a perdu contre un youtubeur.', fx:{ rep:8, mor:-8 } }
    ]},
    { label:'Refuser', hint:'Sérieux', outcomes:[
      { weight:100, text:'Vous êtes un athlète professionnel, pas un accessoire de tournage. Il fait la vidéo avec quelqu\'un d\'autre. Elle fait 14 millions de vues.', fx:{ form:3, mor:-2 } }
    ]}
  ]},

{ id:'x_oldtweet', cat:'Médias', icon:'💀', w:10, cond:{minRep:40, aMin:21},
  text:'Un message que vous avez publié à 15 ans ressort. Il ne contient rien de grave, mais il contient sept fautes d\'orthographe et une opinion très ferme sur un dessin animé.',
  options:[
    { label:'En rire publiquement', outcomes:[
      { weight:80, text:'Vous le republiez avec « je maintiens ». Trois cent mille j\'aime. Le circuit vous trouve enfin sympathique.', fx:{ rep:8, mor:6 } },
      { weight:20, text:'Vous en riez, mais votre agent vous appelle à 7 h du matin pour vous expliquer que non, on n\'en rit pas.', fx:{ rep:3, mor:-2 } }
    ]},
    { label:'Tout effacer et ne rien dire', outcomes:[
      { weight:100, text:'Effacé en huit minutes. Les captures d\'écran, elles, sont éternelles. Vous le savez.', fx:{ rep:-2, mor:-3 } }
    ]}
  ]},

{ id:'x_presser', cat:'Médias', icon:'🎙️', w:13, cond:{aMin:23, aMax:28},
  text:'Conférence de presse après une défaite au premier tour. Un journaliste ouvre par : « Est-ce qu\'on peut dire que vous êtes en fin de cycle ? » Vous avez {age} ans.',
  options:[
    { label:'Répondre du tac au tac', hint:'Piquant', outcomes:[
      { weight:60, text:'« En fin de cycle à {age} ans, c\'est vous qui l\'écrivez, moi je joue encore huit ans. » La phrase tourne partout. Vous venez de vous fabriquer une obligation.', fx:{ rep:8, men:3, mor:4 } },
      { weight:40, text:'Votre réponse est cinglante et un peu trop personnelle. Ce journaliste écrira sur vous pendant dix ans.', fx:{ rep:5, mor:-4, flag:'presse_hostile' } }
    ]},
    { label:'Rester factuel', outcomes:[
      { weight:100, text:'« J\'ai mal joué, il a bien joué, je vais travailler. » Sept mots par phrase, aucun risque. Personne ne cite personne.', fx:{ men:2 } }
    ]},
    { label:'Quitter la salle', hint:'Fracas', outcomes:[
      { weight:100, text:'Vous vous levez au bout de quarante secondes. Amende de 12 000 €, et la vidéo est vue deux millions de fois avant le dîner.', fx:{ money:-0.012, rep:7, mor:-3, trait:'hothead' } }
    ]}
  ]},

/* ═══════════════ ARGENT ET SPONSORS ═══════════════ */

{ id:'x_crypto', cat:'Argent', icon:'🪙', w:10, cond:{aMin:20, minRep:35},
  text:'Une plateforme d\'échange vous propose 300 000 € pour porter leur logo sur la manche pendant deux ans. Votre agent est enthousiaste. Un joueur du top 20 a signé le même contrat il y a six mois.',
  options:[
    { label:'Signer', hint:'Argent', outcomes:[
      { weight:50, text:'Deux ans, 600 000 €, aucun problème. Vous avez eu de la chance et vous le savez.', fx:{ money:0.55, rep:3 } },
      { weight:50, text:'La plateforme s\'effondre au bout de neuf mois. Votre logo est sur toutes les photos de l\'affaire. Vous passez six mois à vous expliquer.', fx:{ money:0.22, rep:-9, mor:-8 } }
    ]},
    { label:'Refuser', hint:'Prudent', outcomes:[
      { weight:100, text:'Vous refusez sans savoir si vous avez raison. Votre agent parle de « manque d\'ambition » pendant trois semaines.', fx:{ men:3, mor:-2 } }
    ]}
  ]},

{ id:'x_watch', cat:'Sponsors', icon:'⌚', w:10, cond:{rMax:80, aMin:21},
  text:'Un horloger suisse vous offre une montre à 40 000 € et vous demande de la porter « en dehors des courts, naturellement ». Elle pèse 190 grammes et brille comme un phare.',
  options:[
    { label:'La porter partout, y compris à l\'entraînement', hint:'Contrat', outcomes:[
      { weight:60, text:'Photos, tapis rouges, une campagne mondiale. 180 000 € par an pour porter une montre. Le métier a ses moments.', fx:{ money:0.16, rep:7 } },
      { weight:40, text:'Vous la perdez dans un vestiaire à Bâle au bout de cinq semaines. La conversation avec la marque est mémorable.', fx:{ money:-0.02, rep:-3, mor:-5 } }
    ]},
    { label:'La ranger dans un coffre', outcomes:[
      { weight:100, text:'Vous portez votre montre à 30 € en plastique. La marque le remarque. Le contrat ne sera pas renouvelé.', fx:{ mor:3, money:0.04 } }
    ]}
  ]},

{ id:'x_appearance', cat:'Argent', icon:'🧾', w:11, cond:{rMax:60, aMin:22},
  text:'Un tournoi vous propose une prime d\'engagement de 120 000 € pour venir jouer. Il se dispute à l\'autre bout du monde, une semaine avant un Grand Chelem, sur une surface qui ne vous convient pas.',
  options:[
    { label:'Prendre l\'argent', outcomes:[
      { weight:55, text:'120 000 € pour deux matchs et 26 heures d\'avion. Vous arrivez au Grand Chelem décalé de sept fuseaux.', fx:{ money:0.12, form:-14, body:-4 } },
      { weight:45, text:'Vous prenez l\'argent et vous gagnez le tournoi par-dessus le marché. Personne n\'a rien à dire.', fx:{ money:0.15, rep:4, form:-8 } }
    ]},
    { label:'Refuser et préparer le Chelem', hint:'Pro', outcomes:[
      { weight:100, text:'Trois semaines de préparation sur la bonne surface pendant que les autres encaissent des chèques. On saura dans quinze jours qui avait raison.', fx:{ form:10, bestSurf:1, mor:2 } }
    ]}
  ]},

{ id:'x_taxman', cat:'Argent', icon:'🏛️', w:9, cond:{aMin:23, minRep:35},
  text:'Votre comptable vous explique que vous avez été imposé dans onze pays différents cette année. Il utilise le mot « inextricable » deux fois en une phrase.',
  options:[
    { label:'Payer un fiscaliste spécialisé', outcomes:[
      { weight:75, text:'25 000 € d\'honoraires qui vous en font économiser 90 000. La meilleure dépense de votre saison.', fx:{ money:0.065, mor:3 } },
      { weight:25, text:'Le fiscaliste est cher et pas très bon. Vous payez deux fois : lui, et l\'impôt.', fx:{ money:-0.03, mor:-4 } }
    ]},
    { label:'Gérer ça vous-même', hint:'Optimiste', outcomes:[
      { weight:100, text:'Vous passez neuf soirées sur des formulaires que vous ne comprenez pas. Vous faites une erreur. Vous l\'apprendrez dans deux ans.', fx:{ money:-0.02, form:-4, mor:-5 } }
    ]}
  ]},

/* ═══════════════ LE CORPS, ENCORE ET TOUJOURS ═══════════════ */

{ id:'x_blister', cat:'Corps', icon:'🦶', w:12, cond:{aMin:17},
  text:'Une ampoule sous l\'avant-pied, au troisième jour d\'un tournoi. Le kiné la perce, la protège, et vous regarde avec le sourire de quelqu\'un qui sait que ça va faire très mal.',
  options:[
    { label:'Jouer avec, et ne rien montrer', outcomes:[
      { weight:55, text:'Deux heures debout sur une plaie ouverte. Vous gagnez. Vous ne remarcherez normalement que dans quatre jours.', fx:{ body:-4, men:3, mor:5, trait:'warrior' } },
      { weight:45, text:'Vous compensez, vous déplacez votre appui, et vous vous tordez la cheville au deuxième set.', fx:{ inj:3, body:-6, mor:-6 } }
    ]},
    { label:'Abandonner et soigner', hint:'Raison', outcomes:[
      { weight:100, text:'Abandon au deuxième set. Trois jours de soins, et un pied intact pour la suite de la tournée.', fx:{ body:6, mor:-5 } }
    ]}
  ]},

{ id:'x_cramp', cat:'Corps', icon:'🥵', w:12, cond:{aMin:18},
  text:'Crampes généralisées au cinquième set. Vous ne pouvez plus plier la jambe gauche. Le règlement est clair : pas de soin pour les crampes.',
  options:[
    { label:'Servir-volleyer sur tous les points', hint:'Désespoir', outcomes:[
      { weight:45, text:'Points de trois secondes maximum. Ça marche. Vous gagnez le match en boitant, et le public se lève.', fx:{ vol:2, men:4, mor:10, rep:5 } },
      { weight:55, text:'Vous montez douze fois, vous êtes passé douze fois. Fin du match, et de la dignité.', fx:{ mor:-8, form:-8 } }
    ]},
    { label:'Tenir jusqu\'au bout, quoi qu\'il arrive', outcomes:[
      { weight:50, text:'Vous finissez le match à quatre à l\'heure. Vous perdez, mais l\'adversaire vous prend dans les bras au filet.', fx:{ rep:4, sta:2, body:-6, trait:'warrior' } },
      { weight:50, text:'Vous vous effondrez à 4-4. Abandon sur civière. Les images tournent partout.', fx:{ inj:2, body:-8, rep:3, mor:-6 } }
    ]}
  ]},

{ id:'x_shoulder', cat:'Corps', icon:'💪', w:11, cond:{aMin:22},
  text:'L\'épaule tire depuis six semaines. L\'imagerie ne montre rien de net. Le médecin dit « tendinopathie chronique », ce qui veut dire : on ne sait pas trop, et ça ne partira pas tout seul.',
  options:[
    { label:'Modifier le mouvement de service', outcomes:[
      { weight:60, text:'Trois mois à réapprendre. Vous perdez 8 km/h et vous gagnez dix ans d\'épaule.', fx:{ srv:-3, body:14, sta:2 } },
      { weight:40, text:'Le nouveau geste ne prend pas. Vous naviguez entre deux services et vous n\'en maîtrisez plus aucun.', fx:{ srv:-4, mor:-7 } }
    ]},
    { label:'Infiltration et on continue', hint:'Court terme', outcomes:[
      { weight:50, text:'Six semaines sans douleur. Six semaines de gagnées, six semaines d\'usure en plus.', fx:{ body:-9, form:6 } },
      { weight:50, text:'L\'infiltration ne prend pas. Vous jouez avec la douleur, et votre service perd toute sa vitesse.', fx:{ srv:-3, body:-6, mor:-6 } }
    ]}
  ]},

{ id:'x_sleep', cat:'Corps', icon:'🌙', w:11, cond:{aMin:18},
  text:'Match programmé en session de nuit, fini à 2 h 47 du matin. Vous rejouez à 11 h. Le tournoi trouve ça normal ; votre corps beaucoup moins.',
  options:[
    { label:'Le dire publiquement', outcomes:[
      { weight:60, text:'Votre sortie sur la programmation est reprise par les autres joueurs. Le tournoi change ses règles l\'année suivante.', fx:{ rep:7, men:2, flag:'syndicat' } },
      { weight:40, text:'On vous répond « c\'est le spectacle ». Vous passez pour un râleur professionnel.', fx:{ rep:-3, mor:-4 } }
    ]},
    { label:'Ne rien dire et encaisser', outcomes:[
      { weight:55, text:'Quatre heures de sommeil et vous gagnez quand même. Vous découvrez que vous êtes plus dur que vous ne pensiez.', fx:{ men:4, sta:1, form:-8, mor:5 } },
      { weight:45, text:'Vous jouez dans le coton et vous perdez 6-1 6-2. Personne n\'en parlera.', fx:{ form:-10, mor:-5 } }
    ]}
  ]},

/* ═══════════════ MENTAL ═══════════════ */

{ id:'x_yips', cat:'Mental', icon:'🫨', w:10, cond:{aMin:20, rMax:400},
  text:'Votre lancer de balle s\'est déréglé. Pas au point de rater, mais assez pour que vous y pensiez à chaque service. Et dès qu\'on y pense, c\'est fini.',
  options:[
    { label:'Tout reconstruire avec un spécialiste', outcomes:[
      { weight:60, text:'Six semaines à relancer des balles dans un gymnase vide. Ça revient, lentement, et ça ne repartira plus.', fx:{ srv:3, men:5, money:-0.008 } },
      { weight:40, text:'Ça revient à l\'entraînement et ça repart en match. Le problème n\'était pas dans le bras.', fx:{ men:-3, mor:-6 } }
    ]},
    { label:'Changer complètement de routine', hint:'Rupture', outcomes:[
      { weight:55, text:'Nouveau rythme, nouveau rebond, nouveau tout. Le cerveau n\'a plus de repère pour s\'inquiéter.', fx:{ srv:2, men:4 } },
      { weight:45, text:'Vous ajoutez une couche de confusion à un problème de confiance. Neuf doubles fautes au tour suivant.', fx:{ srv:-2, mor:-6 } }
    ]}
  ]},

{ id:'x_hate', cat:'Mental', icon:'💬', w:10, cond:{minRep:40, aMin:19},
  text:'Après une défaite, votre téléphone déborde de messages de parieurs mécontents. Certains sont très créatifs, la plupart sont juste ignobles.',
  options:[
    { label:'Tout couper pendant un mois', hint:'Hygiène', outcomes:[
      { weight:80, text:'Applications supprimées. Vous dormez mieux en trois jours. Vous vous demandez pourquoi vous ne l\'avez pas fait plus tôt.', fx:{ mor:12, men:4, rep:-2 } },
      { weight:20, text:'Vous coupez tout et vous vous sentez coupé du monde. Les hôtels sont longs sans téléphone.', fx:{ mor:3, men:2 } }
    ]},
    { label:'Publier des captures d\'écran', hint:'Frontal', outcomes:[
      { weight:55, text:'Vous publiez les pires messages. Immense vague de soutien, plusieurs comptes fermés, et un vrai débat lancé sur le circuit.', fx:{ rep:10, mor:6, men:2 } },
      { weight:45, text:'Vous publiez, et ça redouble. Vous avez donné une audience à des gens qui ne cherchaient que ça.', fx:{ rep:4, mor:-9 } }
    ]}
  ]},

{ id:'x_ritualloss', cat:'Mental', icon:'🎭', w:9, cond:{aMin:21, maxMor:42},
  text:'Vous venez de perdre huit matchs d\'affilée au premier tour. Votre entraîneur vous propose un exercice : écrire sur un papier ce que vous ferez si vous n\'y arrivez jamais.',
  options:[
    { label:'Écrire honnêtement', hint:'Courageux', outcomes:[
      { weight:70, text:'Vous écrivez trois lignes. Ce n\'est pas si terrible, en fait. Le lendemain vous jouez libéré et vous gagnez.', fx:{ men:7, mor:14, form:5 } },
      { weight:30, text:'Vous écrivez, et vous réalisez que vous n\'avez absolument aucun plan B. Ça ne vous rassure pas du tout.', fx:{ men:3, mor:-6, flag:'no_planb' } }
    ]},
    { label:'Refuser l\'exercice', outcomes:[
      { weight:100, text:'« Je n\'ai pas besoin de penser à ça. » Votre entraîneur range le papier sans insister. Il le ressortira dans trois ans.', fx:{ men:2, mor:-2 } }
    ]}
  ]},

/* ═══════════════ VIE PERSONNELLE ═══════════════ */

{ id:'x_wedding', cat:'Vie perso', icon:'💒', w:11, cond:{aMin:22},
  text:'Votre meilleur ami d\'enfance se marie. La date tombe pile entre deux tournois, à 4 000 km. Il vous a demandé d\'être témoin il y a un an.',
  options:[
    { label:'Y aller, coûte que coûte', outcomes:[
      { weight:100, text:'Deux vols, quatorze heures de trajet, six heures sur place, et un discours improvisé qui fait pleurer sa mère. Vous jouez le lundi suivant à plat, et vous ne regrettez rien.', fx:{ mor:18, form:-9, money:-0.003 } }
    ]},
    { label:'Envoyer une vidéo et rester en tournoi', outcomes:[
      { weight:50, text:'La vidéo est très réussie. Il comprend parfaitement. Vous, un peu moins.', fx:{ mor:-8, form:4 } },
      { weight:50, text:'Il dit qu\'il comprend. Vous entendez à sa voix que non. Vous ne vous parlerez plus beaucoup après ça.', fx:{ mor:-14, men:2, flag:'friend_lost' } }
    ]}
  ]},

{ id:'x_parents', cat:'Vie perso', icon:'👨‍👩‍👦', w:12, cond:{aMin:19, aMax:29},
  text:'Vos parents viennent vous voir jouer pour la première fois depuis trois ans. Ils ont pris deux jours de congé et un vol à 400 € qu\'ils n\'avaient pas prévu.',
  options:[
    { label:'Les installer dans la loge des joueurs', outcomes:[
      { weight:60, text:'Votre père ne dit pas un mot de tout le match. À la fin il vous serre la main, très fort, longtemps. C\'est déjà énorme.', fx:{ mor:14, men:3 } },
      { weight:40, text:'Vous jouez pour eux, trop, et vous craquez au troisième set. Ils repartent en disant que c\'était magnifique quand même.', fx:{ mor:-4, men:3 } }
    ]},
    { label:'Leur demander de rester à l\'hôtel', hint:'Concentration', outcomes:[
      { weight:100, text:'Vous jouez sereinement, et vous gagnez. Ils ont regardé sur un téléphone dans le hall. Vous y penserez longtemps.', fx:{ form:5, mor:-7 } }
    ]}
  ]},

{ id:'x_dog', cat:'Vie perso', icon:'🐕', w:9, cond:{aMin:23},
  text:'Vous adoptez un chien. Le circuit vous emmène 32 semaines par an loin de chez vous. Ces deux phrases sont difficilement compatibles.',
  options:[
    { label:'L\'emmener sur le circuit', hint:'Chaos', outcomes:[
      { weight:55, text:'Il devient la mascotte du vestiaire, dort dans les salles de kiné et apparaît dans trois reportages. Vous ne rentrez plus jamais seul.', fx:{ mor:16, rep:5, form:-2, flag:'dog' } },
      { weight:45, text:'Quarantaines, papiers, compagnies aériennes. Après quatre mois de cauchemar administratif, vous renoncez.', fx:{ mor:-6, money:-0.006 } }
    ]},
    { label:'Le laisser chez vos parents', outcomes:[
      { weight:100, text:'Il vit très bien. Il vous fait la tête pendant vingt minutes à chaque retour, puis vous pardonne. C\'est plus que ce qu\'on peut dire de la plupart des gens.', fx:{ mor:8 } }
    ]}
  ]},

/* ═══════════════ FÉDÉRATION ET SÉLECTION ═══════════════ */

{ id:'x_wildcard_nephew', cat:'Fédération', icon:'🎫', w:11, cond:{rMin:120, aMax:26},
  text:'La wild-card du tournoi national, que tout le monde vous promettait, est attribuée à un joueur classé 300 places derrière vous. Il se trouve que son père siège au comité directeur.',
  options:[
    { label:'Le dire publiquement', hint:'Casse-cou', outcomes:[
      { weight:50, text:'Votre message est repris partout. La fédération recule et vous donne finalement une invitation. Vous venez aussi de vous faire des ennemis à vie.', fx:{ rep:8, mor:5, flag:'fede_ennemi' } },
      { weight:50, text:'La fédération ne bouge pas et vous raye discrètement de toutes ses listes pour deux ans.', fx:{ rep:4, mor:-10, flag:'fede_ennemi' } }
    ]},
    { label:'Passer par les qualifications sans rien dire', hint:'Classe', outcomes:[
      { weight:60, text:'Vous passez les qualifs, et vous éliminez le fils du dirigeant au premier tour. Il n\'y a pas de meilleure réponse possible.', fx:{ men:6, rep:6, mor:12 } },
      { weight:40, text:'Vous perdez au dernier tour des qualifications. Personne ne saura jamais.', fx:{ mor:-8, men:3 } }
    ]}
  ]},

{ id:'x_davis_captain', cat:'Sélection', icon:'🎽', w:12, cond:{rMax:120, aMin:20},
  text:'Le capitaine national vous appelle. Il ne vous a jamais sélectionné, et il commence par : « Je sais que tu m\'en veux. » Il a raison.',
  options:[
    { label:'Vider votre sac', outcomes:[
      { weight:55, text:'Quarante minutes de franchise brutale. À la fin, il vous sélectionne — et vous vous découvrez une relation de travail honnête.', fx:{ mor:10, men:4, rep:3 } },
      { weight:45, text:'La conversation tourne mal. Vous ne serez pas sélectionné cette année non plus.', fx:{ mor:-8, men:2 } }
    ]},
    { label:'Faire comme si de rien n\'était', outcomes:[
      { weight:100, text:'« Aucun souci, capitaine. » Vous êtes sélectionné, et vous portez ce non-dit tout le week-end.', fx:{ rep:4, mor:3, men:-1 } }
    ]}
  ]},

/* ═══════════════ SUR LE COURT ═══════════════ */

{ id:'x_lefty', cat:'Terrain', icon:'🫲', w:11, cond:{aMin:18},
  text:'Troisième gaucher d\'affilée dans votre tableau. Votre revers ne s\'en remet pas : ces balles liftées qui remontent sur l\'extérieur vous rendent fou depuis dix jours.',
  options:[
    { label:'Passer l\'hiver à travailler ça', hint:'Fastidieux', outcomes:[
      { weight:70, text:'Deux mille balles liftées sur le revers, par un partenaire d\'entraînement gaucher payé pour ça. Le problème disparaît définitivement.', fx:{ bh:4, money:-0.004 } },
      { weight:30, text:'Vous travaillez trois mois et vous ne progressez presque pas. Certains blocages ne sont pas techniques.', fx:{ bh:1, men:2, mor:-3 } }
    ]},
    { label:'Contourner : tout jouer en coup droit', hint:'Bricolage', outcomes:[
      { weight:55, text:'Vous vous décalez systématiquement. Ça marche, et ça découvre tout votre côté droit. Les bons adversaires le verront.', fx:{ fh:3, bh:-1, spd:1 } },
      { weight:45, text:'Vous vous décalez, ils vous punissent, vous courez trois fois plus. Deux matchs et vous êtes cuit.', fx:{ sta:-1, form:-6, mor:-3 } }
    ]}
  ]},

{ id:'x_slide', cat:'Terrain', icon:'🩰', w:11, cond:{aMin:17, aMax:30},
  text:'Premier tournoi sur terre battue de la saison. Vous tentez votre première glissade. Votre pied s\'arrête, votre corps continue. Le public retient un cri.',
  options:[
    { label:'Y passer la semaine entière', hint:'Apprentissage', outcomes:[
      { weight:65, text:'Six jours à tomber, à recommencer, à tomber encore. Au septième, ça vient. La terre s\'ouvre enfin à vous.', fx:{ clay:3, spd:1, body:-4 } },
      { weight:35, text:'Vous tombez une fois de trop et vous vous ouvrez le genou. Trois semaines d\'arrêt pour une glissade.', fx:{ inj:3, clay:1, body:-6 } }
    ]},
    { label:'Renoncer à glisser cette saison', hint:'Assumé', outcomes:[
      { weight:100, text:'Vous jouerez la terre debout, comme un joueur de dur. Ça se voit, et vos adversaires en profitent — mais vous rentrez entier.', fx:{ clay:-2, body:5, hard:1 } }
    ]}
  ]},

{ id:'x_grasswhite', cat:'Terrain', icon:'👕', w:10, cond:{aMin:17},
  text:'Le référent tenue du tournoi sur gazon vous arrête à l\'entrée du court : la bande bleue de vos chaussettes dépasse d\'un centimètre le règlement du blanc intégral.',
  options:[
    { label:'Changer de chaussettes en vitesse', outcomes:[
      { weight:80, text:'Vous empruntez des chaussettes blanches à un joueur croisé dans le couloir. Elles sont deux tailles trop grandes. Vous jouez comme ça.', fx:{ mor:-2, form:-2 } },
      { weight:20, text:'Vous en trouvez à la boutique du tournoi. 34 € la paire. Elles sont excellentes, vous les garderez dix ans.', fx:{ money:-0.00004, mor:2 } }
    ]},
    { label:'Discuter le règlement', hint:'Perdu d\'avance', outcomes:[
      { weight:100, text:'Vous discutez le blanc intégral avec quelqu\'un dont c\'est littéralement le métier depuis vingt-deux ans. Vous perdez, et vous entrez sur le court avec dix minutes de retard et de mauvaise humeur.', fx:{ form:-4, mor:-4 } }
    ]}
  ]},

{ id:'x_doubles', cat:'Terrain', icon:'👥', w:12, cond:{rMin:150, aMax:32},
  text:'Un joueur que vous connaissez à peine vous propose de jouer le double. Ça double les chances de gagner un peu d\'argent dans la semaine, et ça use les jambes.',
  options:[
    { label:'Accepter', outcomes:[
      { weight:55, text:'Vous atteignez la finale. 3 400 € chacun, et un partenaire pour toute la saison. Le double paie mieux que la vérité.', fx:{ money:0.0034, vol:2, mor:6, form:-5 } },
      { weight:45, text:'Éliminés d\'entrée. Vous avez perdu deux heures et un peu de fraîcheur pour 180 €.', fx:{ money:0.00018, form:-4, vol:1 } }
    ]},
    { label:'Refuser et se garder pour le simple', outcomes:[
      { weight:100, text:'Vous économisez vos jambes. Il trouve un autre partenaire et ils gagnent le tournoi. C\'est comme ça.', fx:{ form:4 } }
    ]}
  ]},

{ id:'x_bagel', cat:'Terrain', icon:'🥯', w:9, cond:{aMin:18},
  text:'Vous menez 6-0 5-0 contre un joueur qui a manifestement quelque chose de cassé. Il reste debout par pure fierté. Vous servez pour le double 6-0.',
  options:[
    { label:'Aller au bout, sans état d\'âme', hint:'Froid', outcomes:[
      { weight:100, text:'6-0 6-0 en 48 minutes. Le vestiaire remarque ce genre de choses, et pas toujours en bien.', fx:{ men:3, rep:2, mor:4 } }
    ]},
    { label:'Lui laisser un jeu', hint:'Humain', outcomes:[
      { weight:60, text:'Vous jouez deux points un peu mous, il prend le jeu, et vous concluez. Personne n\'est dupe, tout le monde apprécie.', fx:{ rep:3, mor:5 } },
      { weight:40, text:'Vous levez le pied, il prend le jeu — puis le suivant, puis le set. Le match dure encore une heure et demie.', fx:{ form:-7, men:-2, mor:-5 } }
    ]}
  ]},

/* ═══════════════ ENTRAÎNEMENT ET STAFF ═══════════════ */

{ id:'x_hitter', cat:'Équipe', icon:'🎯', w:11, cond:{rMax:200, aMin:19},
  text:'Votre partenaire d\'entraînement, classé 600e, vous bat trois fois de suite en set d\'entraînement. Il a 24 ans et il n\'a jamais eu les moyens de faire une saison complète.',
  options:[
    { label:'Le prendre dans votre équipe à plein temps', outcomes:[
      { weight:70, text:'Vous financez sa saison, il vous suit partout. Le niveau de vos entraînements change du tout au tout — et vous avez enfin quelqu\'un à qui parler.', fx:{ money:-0.02, fh:2, bh:2, mor:9 } },
      { weight:30, text:'Vous le prenez, et six mois plus tard il repart jouer sa propre carrière. C\'était la bonne décision pour lui.', fx:{ money:-0.012, fh:1, mor:-3 } }
    ]},
    { label:'Changer de partenaire', hint:'Ego', outcomes:[
      { weight:100, text:'Vous trouvez quelqu\'un qui vous laisse gagner. Vos entraînements sont beaucoup plus agréables et beaucoup moins utiles.', fx:{ mor:4, fh:-1, men:-2 } }
    ]}
  ]},

{ id:'x_coachbox', cat:'Équipe', icon:'🙌', w:10, cond:{aMin:19},
  text:'Votre entraîneur, depuis la loge, vous fait un geste incompréhensible pendant tout le deuxième set. Vous hésitez entre « monte au filet », « respire » et « appelle ta mère ».',
  options:[
    { label:'L\'ignorer complètement', outcomes:[
      { weight:60, text:'Vous jouez votre tennis et vous gagnez. À la sortie il vous dit qu\'il essayait de vous signaler que votre lacet était défait.', fx:{ men:3, mor:6 } },
      { weight:40, text:'Vous perdez, et il vous explique que son geste voulait dire « il ne tient plus, attaque ». Vous ne le saurez jamais.', fx:{ mor:-4, men:1 } }
    ]},
    { label:'Mettre au point de vrais signaux', hint:'Méthode', outcomes:[
      { weight:100, text:'Cinq gestes, cinq consignes, une feuille plastifiée. Vous devenez nettement plus dangereux dans les fins de set serrées.', fx:{ men:4, ret:1, flag:'signaux' } }
    ]}
  ]},

{ id:'x_analytics', cat:'Équipe', icon:'📈', w:10, cond:{rMax:150, aMin:20},
  text:'Un analyste vidéo vous montre 40 pages de données. Conclusion principale : vous gagnez 71 % des points quand vous servez à l\'extérieur sur le point important, et vous le faites 12 % du temps.',
  options:[
    { label:'Appliquer religieusement les données', outcomes:[
      { weight:65, text:'Vous suivez le plan à la lettre pendant trois mois. Le pourcentage de balles de break sauvées grimpe en flèche.', fx:{ srv:2, men:4, money:-0.006 } },
      { weight:35, text:'Vous devenez tellement prévisible que les adversaires anticipent au bout de deux tournois. Les données marchent dans les deux sens.', fx:{ srv:1, men:-2, mor:-3 } }
    ]},
    { label:'Garder votre instinct', hint:'À l\'ancienne', outcomes:[
      { weight:100, text:'« Le jour où je saurai où je sers avant de servir, l\'autre le saura aussi. » L\'analyste range son ordinateur, vexé et pas totalement convaincu du contraire.', fx:{ men:3, mor:2 } }
    ]}
  ]},

/* ═══════════════ MOMENTS DE CARRIÈRE ═══════════════ */

{ id:'x_first100', cat:'Étapes', icon:'💯', w:16, cond:{rMax:100, rMin:60, aMax:32},
  text:'Le classement est tombé ce lundi matin. Pour la première fois de votre vie, il y a deux chiffres à côté de votre nom, et pas trois.',
  options:[
    { label:'Appeler tous ceux qui y ont cru', outcomes:[
      { weight:100, text:'Vos parents, votre premier entraîneur de club, le partenaire qui vous a prêté des raquettes à Antalya. Sept appels, deux heures, et pas un œil sec.', fx:{ mor:20, men:3 } }
    ]},
    { label:'Ne rien dire et retourner s\'entraîner', hint:'Faim', outcomes:[
      { weight:100, text:'Le top 100 n\'est pas un but, c\'est un péage. Vous êtes sur le court à 8 h le lendemain.', fx:{ disc:8, form:5, men:4 } }
    ]}
  ]},

{ id:'x_firstslam', cat:'Étapes', icon:'🏟️', w:15, cond:{rMax:110, aMax:34},
  text:'Premier tableau principal de Grand Chelem. Vous entrez sur un court annexe qui contient plus de monde que tous les tournois de votre carrière réunis. Vos jambes ne vous appartiennent plus.',
  options:[
    { label:'Prendre trente secondes pour tout regarder', hint:'Présent', outcomes:[
      { weight:70, text:'Vous vous arrêtez au bord du court et vous regardez. Vraiment. Le trac retombe d\'un coup et vous jouez votre match.', fx:{ men:6, mor:12, form:3 } },
      { weight:30, text:'Vous regardez, vous réalisez où vous êtes, et le trac double. Premier set perdu 6-1.', fx:{ mor:6, form:-6, men:2 } }
    ]},
    { label:'Se mettre en mode automatique', outcomes:[
      { weight:60, text:'Casque, routine, rien d\'autre n\'existe. Vous jouez comme à l\'entraînement, et vous passez le tour.', fx:{ men:4, form:4 } },
      { weight:40, text:'Vous jouez sans rien ressentir, vous perdez, et vous vous en voulez de ne pas avoir profité.', fx:{ mor:-6, men:3 } }
    ]}
  ]},

{ id:'x_firsttitle', cat:'Étapes', icon:'🏆', w:14, cond:{rMax:250, aMax:34, minRep:12},
  text:'Le soir de votre premier titre professionnel, l\'organisateur vous remet un trophée en plastique, un chèque et un bouquet. Il n\'y a plus personne dans les tribunes. C\'est le plus beau moment de votre vie.',
  options:[
    { label:'Fêter ça avec l\'équipe', outcomes:[
      { weight:100, text:'Une pizzeria, quatre personnes, le trophée posé au milieu de la table. Vous rentrerez à l\'hôtel à 2 h en chantant. Vous vous souviendrez de cette soirée-là plus que de la finale.', fx:{ mor:18, disc:-3, form:-3 } }
    ]},
    { label:'Repartir à l\'aéroport le soir même', hint:'Pro', outcomes:[
      { weight:100, text:'Vol de 23 h 10, tournoi suivant lundi. Le trophée voyage en soute. Vous le poserez chez vos parents dans quatre mois.', fx:{ men:4, disc:6, mor:6 } }
    ]}
  ]},

{ id:'x_topten', cat:'Étapes', icon:'🔟', w:13, cond:{rMax:10, aMax:36},
  text:'Top 10 mondial. Le téléphone n\'arrête plus. Des gens que vous n\'avez pas vus depuis douze ans vous « ont toujours soutenu ». Une marque vous propose un contrat qui vaut plus que toute votre carrière jusqu\'ici.',
  options:[
    { label:'Ne rien changer à votre équipe', hint:'Fidélité', outcomes:[
      { weight:100, text:'Les mêmes personnes qu\'en Challenger, mieux payées. Le vestiaire trouve ça rare, et le dit.', fx:{ mor:12, rep:5, men:3 } }
    ]},
    { label:'Tout professionnaliser', outcomes:[
      { weight:60, text:'Nouveau staff, nouvelle structure, nouveau niveau d\'exigence. C\'était nécessaire et ça fait mal à certains.', fx:{ fh:1, sta:1, men:2, mor:-4, money:-0.04 } },
      { weight:40, text:'Vous remerciez les gens du début. Six mois plus tard vous jouez moins bien et vous n\'osez pas les rappeler.', fx:{ mor:-10, form:-5, money:-0.04 } }
    ]}
  ]},

{ id:'x_no1', cat:'Étapes', icon:'👑', w:12, cond:{rMax:1, aMax:38},
  text:'Numéro un mondial. Vous vous réveillez à l\'hôtel, vous regardez le plafond, et vous ne ressentez pas du tout ce que vous aviez imaginé ressentir.',
  options:[
    { label:'Appeler votre premier entraîneur', outcomes:[
      { weight:100, text:'Il a 71 ans, il vous a mis une raquette dans la main à 5 ans, et il pleure au téléphone. Voilà. C\'est ça, le sentiment que vous cherchiez.', fx:{ mor:22, men:5, rep:3 } }
    ]},
    { label:'Aller s\'entraîner comme si de rien n\'était', outcomes:[
      { weight:100, text:'Deux heures de panier à 9 h du matin. Le classement change ; le travail non. C\'est probablement pour ça que vous y êtes arrivé.', fx:{ disc:10, form:5, men:4 } }
    ]}
  ]},

/* ═══════════════ FIN DE PARCOURS ═══════════════ */

{ id:'x_lastdance', cat:'Retraite', icon:'🌇', w:13, cond:{aMin:31},
  text:'Vous regardez le tableau et vous ne reconnaissez plus personne. Le plus jeune est né l\'année de votre premier tournoi professionnel. Il vous appelle « monsieur » en toute sincérité.',
  options:[
    { label:'Le trouver drôle', outcomes:[
      { weight:100, text:'Vous lui répondez « appelle-moi par mon prénom, je ne suis pas encore mort » et vous le battez en trois sets. Le vestiaire en parle encore une semaine après.', fx:{ mor:12, men:4, rep:4 } }
    ]},
    { label:'Le prendre comme un signal', outcomes:[
      { weight:100, text:'Ce n\'est pas le corps qui lâche en premier. C\'est le sentiment de ne plus être de cette génération-là.', fx:{ mor:-8, men:3, flag:'signal_fin' } }
    ]}
  ]},

{ id:'x_commentator', cat:'Reconversion', icon:'🎧', w:12, cond:{aMin:30, minRep:40},
  text:'Une chaîne vous propose de commenter un Grand Chelem pendant votre convalescence. Deux semaines, correctement payées, dans une cabine surchauffée à côté d\'un ancien qui parle beaucoup.',
  options:[
    { label:'Essayer', outcomes:[
      { weight:65, text:'Vous êtes bon. Vraiment bon. Précis, drôle, généreux. La chaîne vous rappellera le jour où vous raccrocherez — et vous savez maintenant que l\'après existe.', fx:{ money:0.035, rep:8, mor:10, flag:'micro' } },
      { weight:35, text:'Vous êtes tétanisé, vous parlez trop vite, et vous critiquez un joueur que vous croiserez au vestiaire six semaines plus tard.', fx:{ money:0.03, rep:-2, mor:-4 } }
    ]},
    { label:'Refuser : un joueur ne commente pas les autres', outcomes:[
      { weight:100, text:'Vous refusez par principe. Vous passez deux semaines à regarder le tournoi depuis votre canapé, ce qui est nettement moins bien payé.', fx:{ mor:-3, men:2 } }
    ]}
  ]},

{ id:'x_academy2', cat:'Reconversion', icon:'🏫', w:11, cond:{aMin:29, minRep:45},
  text:'Un investisseur veut créer une académie à votre nom. Il parle de « marque », de « pipeline de talents » et de « scalabilité ». Vous, vous pensez au club où vous avez appris à jouer, qui ferme faute de moyens.',
  options:[
    { label:'Faire sa proposition à lui', outcomes:[
      { weight:55, text:'L\'académie ouvre avec 90 pensionnaires et un logo à votre nom. C\'est rentable, propre, et vous n\'y mettez les pieds que trois fois par an.', fx:{ money:0.09, rep:6, flag:'academy' } },
      { weight:45, text:'Le projet s\'enlise dans les permis pendant deux ans et vous coûte plus qu\'il ne rapporte.', fx:{ money:-0.05, mor:-5 } }
    ]},
    { label:'Sauver votre club d\'enfance à la place', hint:'Cœur', outcomes:[
      { weight:100, text:'Deux courts refaits, un éducateur salarié, quarante gamins qui jouent. Zéro rentabilité, et la seule chose dont vous parlerez encore dans vingt ans.', fx:{ money:-0.06, mor:20, rep:9, flag:'club_sauve' } }
    ]}
  ]},

{ id:'x_bodygone', cat:'Retraite', icon:'⌛', w:14, cond:{aMin:32},
  text:'Le kiné pose le bilan sans détour : « Trois zones sont usées jusqu\'à la corde. Tu peux continuer. Mais tu marcheras mal à 50 ans. »',
  options:[
    { label:'Continuer quand même', hint:'Tout, maintenant', outcomes:[
      { weight:100, text:'Vous continuez. Vous savez exactement ce que vous échangez, et contre quoi. Ça s\'appelle un choix.', fx:{ form:10, body:-16, men:5, flag:'burn_fast' } }
    ]},
    { label:'Réduire drastiquement le calendrier', hint:'Longévité', outcomes:[
      { weight:100, text:'Douze tournois par an, ciblés, préparés. Vous jouerez trois ans de plus et vous porterez vos enfants sur les épaules.', fx:{ body:18, form:-4, flag:'long_career' } }
    ]}
  ]},

{ id:'x_farewell', cat:'Retraite', icon:'👋', w:12, cond:{aMin:33},
  text:'Si vous annonciez maintenant que ce sera votre dernière saison, chaque tournoi deviendrait un adieu. Cadeaux, discours, standing ovations. Ou bien vous pouvez ne rien dire et partir un mardi, après une défaite au premier tour.',
  options:[
    { label:'Annoncer la dernière saison', outcomes:[
      { weight:100, text:'Vous l\'annoncez. Chaque ville vous réserve quelque chose, chaque adversaire vous serre la main un peu plus longtemps. C\'est épuisant et c\'est magnifique.', fx:{ rep:12, mor:16, form:-4, flag:'farewell' } }
    ]},
    { label:'Ne rien dire', hint:'Discret', outcomes:[
      { weight:100, text:'Vous partirez sans prévenir. Un mardi, un court annexe, trois cents personnes. Comme le premier jour, en somme.', fx:{ men:6, mor:4 } }
    ]}
  ]},

/* ═══════════════ INSOLITE ═══════════════ */

{ id:'x_pigeon', cat:'Insolite', icon:'🐦', w:8, cond:{},
  text:'Un pigeon s\'installe au milieu du court à 4-4 dans le troisième set. Il ne bouge pas. Le juge-arbitre est appelé. Quinze minutes d\'interruption. Le pigeon reste.',
  options:[
    { label:'Aller le chasser vous-même', outcomes:[
      { weight:70, text:'Vous approchez lentement, il s\'envole, le stade applaudit debout. Vous êtes l\'homme qui a vaincu le pigeon, et vous gagnez le match dans la foulée.', fx:{ mor:9, rep:4, men:2 } },
      { weight:30, text:'Il vous esquive quatre fois. Vous vous retrouvez à courir après un pigeon devant six mille personnes et une caméra.', fx:{ rep:6, mor:3, form:-2 } }
    ]},
    { label:'S\'asseoir et attendre', hint:'Zen', outcomes:[
      { weight:100, text:'Vous vous asseyez sur votre chaise et vous attendez. Votre adversaire, lui, s\'agite, discute, s\'énerve. Il perd le fil et le match.', fx:{ men:4, trait:'zen', mor:5 } }
    ]}
  ]},

{ id:'x_blackout', cat:'Insolite', icon:'💡', w:8, cond:{},
  text:'Panne d\'éclairage en pleine session de nuit. Noir complet, six mille téléphones qui s\'allument, et une ambiance de concert. Vous meniez d\'un break.',
  options:[
    { label:'Faire le show pendant la panne', outcomes:[
      { weight:100, text:'Jonglages, échanges avec le public, une imitation très réussie de l\'arbitre. Quand la lumière revient, le stade est à vous — et vous concluez.', fx:{ rep:9, mor:10, men:2, trait:'showman' } }
    ]},
    { label:'Rester assis et garder le rythme', outcomes:[
      { weight:60, text:'Serviette sur la tête, écouteurs, immobile. Quarante minutes plus tard vous reprenez exactement où vous en étiez.', fx:{ men:5, form:2 } },
      { weight:40, text:'Quarante minutes assis et le corps est froid. Vous perdez votre service à la reprise.', fx:{ form:-6, mor:-4 } }
    ]}
  ]},

{ id:'x_wrongball', cat:'Insolite', icon:'🎾', w:8, cond:{},
  text:'Vous vous apercevez au milieu d\'un jeu que vous jouez depuis quatre points avec une balle d\'entraînement récupérée par erreur. Elle est morte depuis 2019.',
  options:[
    { label:'Le signaler', outcomes:[
      { weight:100, text:'L\'arbitre fait rejouer le jeu. Vous le regagnez, plus lentement. L\'honnêteté vous a coûté douze minutes et rien d\'autre.', fx:{ rep:4, men:2 } }
    ]},
    { label:'Ne rien dire, vous gagnez ces points', hint:'Malin', outcomes:[
      { weight:55, text:'Vous gagnez le jeu. Personne ne saura jamais. Vous non plus, vous n\'en parlerez jamais.', fx:{ mor:2, rep:-1 } },
      { weight:45, text:'Votre adversaire s\'en rend compte au point suivant et fait un esclandre. Vous passez pour un tricheur pour une balle de 2 €.', fx:{ rep:-6, mor:-5 } }
    ]}
  ]},

{ id:'x_ballkid', cat:'Insolite', icon:'🧒', w:9, cond:{aMin:19},
  text:'Un ramasseur de balles de dix ans se prend votre service en pleine poitrine. Il ne pleure pas, il se relève, et il refuse de sortir du court.',
  options:[
    { label:'Interrompre et aller le voir', outcomes:[
      { weight:100, text:'Vous traversez le court, vous vous accroupissez, vous lui offrez votre grip et vous lui demandez son prénom. Le stade fond. Lui aussi.', fx:{ rep:8, mor:12, form:-2 } }
    ]},
    { label:'Un geste d\'excuse et on reprend', outcomes:[
      { weight:100, text:'Main levée, excuse, on rejoue. Correct, professionnel, oubliable.', fx:{ rep:1 } }
    ]}
  ]},

{ id:'x_rainrain', cat:'Insolite', icon:'🌧️', w:10, cond:{},
  text:'Quatrième interruption pour pluie de la journée. Vous avez joué onze jeux en sept heures. Le bâchage du court est devenu le moment le plus intense de votre semaine.',
  options:[
    { label:'Jouer aux cartes avec l\'adversaire', outcomes:[
      { weight:100, text:'Trois heures de belote dans le vestiaire des joueurs. Vous devenez amis. Vous le battez quand même, mais vous dînez ensemble le soir.', fx:{ mor:10, men:3, rep:2 } }
    ]},
    { label:'Rester dans votre bulle', outcomes:[
      { weight:55, text:'Échauffements toutes les quarante minutes, alimentation calée, aucune conversation. Quand ça reprend enfin, vous êtes prêt et lui non.', fx:{ men:4, form:3, disc:4 } },
      { weight:45, text:'Vous vous échauffez six fois pour rien. Quand le match reprend à 21 h, vous n\'avez plus de jambes.', fx:{ form:-9, mor:-4 } }
    ]}
  ]},

{ id:'x_pickleball', cat:'Insolite', icon:'🥒', w:8, cond:{aMin:24},
  text:'Le club où vous vous entraînez depuis six ans a converti trois de ses courts en terrains de pickleball. Le bruit des raquettes en plastique est audible depuis votre court restant.',
  options:[
    { label:'Vous y mettre par curiosité', outcomes:[
      { weight:100, text:'Vous perdez contre un retraité nommé Gérard qui vous explique ensuite pendant vingt minutes ce que vous auriez dû faire. Le sport reste le sport.', fx:{ mor:6, vol:1 } }
    ]},
    { label:'Changer de club', hint:'Principe', outcomes:[
      { weight:100, text:'Vous partez. Trois mois plus tard, votre nouveau club convertit deux courts. On n\'arrête pas le progrès, même quand il fait « ploc ».', fx:{ mor:-3, form:-2 } }
    ]}
  ]}

];

/* ─────────────────── MICRO-ÉVÉNEMENTS ADDITIONNELS ─────────────────── */
const MICRO_EXTRA = [
  { id:'mx1', w:8, text:'Votre nouveau cordage tient trois jeux de plus que l\'ancien. C\'est peu, et c\'est tout.', fx:{ fh:1 } },
  { id:'mx2', w:8, text:'Un vol annulé vous fait rater les qualifications d\'un tournoi. Merci la compagnie.', fx:{ mor:-5, money:-0.001 } },
  { id:'mx3', w:7, text:'Vous croisez votre bête noire dans un ascenseur d\'hôtel. Vingt-deux étages de silence.', fx:{ men:1, mor:-2 } },
  { id:'mx4', w:8, text:'Un mois entier sans douleur nulle part. Vous aviez oublié que c\'était possible.', fx:{ body:6, mor:6 } },
  { id:'mx5', w:7, text:'Le kiné vous trouve un déséquilibre de bassin vieux de six ans. Tout s\'explique.', fx:{ body:7, spd:1 } },
  { id:'mx6', w:8, text:'Vous passez la trêve à jouer au foot avec des amis. Votre préparateur ne doit jamais l\'apprendre.', fx:{ mor:8, body:-3 } },
  { id:'mx7', w:7, text:'Une marque vous envoie 40 paires de chaussures. Vous en portez deux.', fx:{ mor:4, money:0.002 } },
  { id:'mx8', w:8, text:'Vous vous découvrez une aversion nouvelle et totale pour les courts couverts.', fx:{ mor:-3 } },
  { id:'mx9', w:7, text:'Trois semaines à travailler l\'amortie. Elle rentre désormais deux fois sur trois.', fx:{ vol:2 } },
  { id:'mx10', w:8, text:'Un supporter vous suit sur trois tournois consécutifs avec la même banderole mal orthographiée.', fx:{ mor:6, rep:2 } },
  { id:'mx11', w:7, text:'Vous cassez trois cordes en un match. Le cordeur vous regarde comme un ennemi personnel.', fx:{ money:-0.0002, fh:1 } },
  { id:'mx12', w:8, text:'Vous apprenez à dormir dans les avions. Cela change une vie de joueur.', fx:{ form:5, sta:1 } },
  { id:'mx13', w:7, text:'Un entraîneur adverse vous complimente sincèrement dans le couloir. Ça vaut trois victoires.', fx:{ mor:7, men:1 } },
  { id:'mx14', w:8, text:'Votre nom est mal orthographié sur le tableau officiel toute la semaine.', fx:{ mor:-2 } },
  { id:'mx15', w:7, text:'Vous changez de grip pour un modèle plus fin. Sensations décuplées, ampoules aussi.', fx:{ fh:1, bh:1, body:-2 } },
  { id:'mx16', w:8, text:'Un stage à l\'altitude avant la tournée sur terre : les jambes suivent enfin.', fx:{ sta:2, clay:1 } },
  { id:'mx17', w:7, text:'Vous perdez quatre matchs de suite en ayant mené 5-2 au troisième. Statistiquement improbable.', fx:{ men:-3, mor:-7 } },
  { id:'mx18', w:8, text:'Vous découvrez que vous jouez nettement mieux quand vous ne regardez pas le tableau d\'affichage.', fx:{ men:3 } },
  { id:'mx19', w:7, text:'Le tournoi vous loge chez l\'habitant. Vous repartez avec des confitures et un ami de 74 ans.', fx:{ mor:9, money:0.0005 } },
  { id:'mx20', w:7, text:'Un journaliste vous confond avec un autre joueur pendant toute l\'interview. Vous le laissez faire.', fx:{ mor:3, rep:-1 } }
];

EVENTS.push(...EVENTS_EXTRA);
MICRO.push(...MICRO_EXTRA);
