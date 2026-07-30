# MATCH POINT — simulateur de carrière de tennis

Un jeu de gestion de carrière dans le navigateur, dans l'esprit de Football Manager :
un circuit vivant, un calendrier qu'on traverse **semaine par semaine**, et des matchs
qu'on vit **jeu par jeu**. De vos 16 ans à la retraite.

## Lancer le jeu

```bash
python -m http.server 8123
```

Puis <http://localhost:8123>. Site statique, aucune dépendance, aucun build, aucun compte.
Tout reste dans le navigateur.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Squelette des écrans |
| `style.css` | Design system, mobile-first, thème sombre |
| `data.js` | Nations, noms, formations, traits, badges, **événements narratifs** |
| `tour.js` | Attributs, styles, catégories de tournois, calendrier, staff, entraînement, tactiques, équilibrage |
| `match.js` | **Moteur de match** — points simulés un par un, affichage jeu par jeu |
| `world.js` | **Le circuit** — 1 150 joueurs, classement glissant, tableaux, simulation hebdomadaire |
| `career.js` | Votre carrière — entraînement, corps, blessures, argent, inscriptions, qualifications |
| `save.js` | Sauvegarde — sérialisation du monde par identifiants |
| `events.js`, `events2.js` | Contenu narratif — 140 événements et 64 micro-événements au total |
| `game.js` | Interface |
| `sim.js`, `saison.js` | Bancs d'essai hors interface (voir plus bas) |

## Le monde

À la création d'une partie, le jeu génère **1 150 joueurs** nommés, chacun avec son âge, son
style, ses huit attributs, ses affinités de surface, son potentiel caché et sa trajectoire de
progression. Puis il **joue une saison entière à blanc** : 909 tournois, des dizaines de
milliers de matchs. Le classement mondial que vous découvrez à votre arrivée n'est pas
calculé par une formule — c'est le résultat réel de ce qui s'est passé sur le circuit.

Ce monde continue de vivre : les joueurs vieillissent, progressent, déclinent après leur pic,
se blessent, prennent leur retraite, et une centaine de juniors arrivent chaque année.

**Le classement est glissant sur 46 semaines.** Les points gagnés en semaine 12 disparaissent
en semaine 12 de l'année suivante. D'où la pression de **défendre ses points** : l'écran
Calendrier vous rappelle chaque semaine ce que vous avez à défendre.

## Le calendrier

Le calendrier est celui du vrai circuit, dans l'ordre réel de la saison : la tournée
australienne, Melbourne, le « Sunshine Double » Indian Wells–Miami, la tournée sur terre de
Monte-Carlo à Paris en passant par Madrid et Rome, les quelques semaines de gazon, la tournée
américaine Toronto–Cincinnati–New York, la Coupe Davis, la tournée asiatique, la salle
européenne et le Masters de Turin.

Les Grands Chelems et les grands Masters 1000 (Indian Wells, Miami, Madrid, Rome, Shanghai)
**occupent deux semaines**, comme dans la réalité — s'y engager, c'est renoncer à autre chose.

Les Jeux Olympiques reviennent **tous les quatre ans**, en semaine 30, et changent de ville et
de surface à chaque édition.

### Ce qui est fidèle, et ce qui ne l'est pas

| | dans le jeu | sur le vrai circuit |
|---|---|---|
| Grands Chelems | **4** | 4 |
| Masters 1000 | **9** | 9 |
| Masters de fin d'année | **1** | 1 |
| ATP 500 | **15** | 15 |
| ATP 250 | **36** | ~32 |
| Coupe Davis | groupes + phase finale | idem |
| Challengers et ITF | ~875, **générés** | ~500 réels, différents chaque année |

Le haut du calendrier est donc complet et à sa vraie place dans la saison. Le circuit
secondaire, lui, est inventé : villes tirées d'un réservoir réel et numérotées comme le fait
l'ITF (« Antalya III »). Recopier 500 tournois qui changent tous les ans n'aurait rien apporté
au jeu.

Les tournois portent le **nom de leur ville**, pas leur nom commercial : Melbourne et non
« Australian Open », Londres et non « Wimbledon ». C'est volontaire — ces noms sont des marques
déposées, et un jeu publié ne peut pas s'en servir.

La Coupe Davis se joue **avec ou sans vous** : si votre nation n'est pas qualifiée, le circuit
la dispute quand même et le palmarès s'écrit sans vous.

## Une semaine

Chaque semaine, un choix :

- **Un tournoi** — parmi ceux accessibles à votre classement, de l'ITF M15 au Grand Chelem
- **Un bloc d'entraînement** — service, retour, fond de court, jeu vers l'avant, explosivité,
  foncier, vidéo, mental — en intensité légère, normale ou intense
- **De la récupération** — soins, sommeil, remise en état du corps
- **Donner des cours en club** — humiliant, épuisant, et ça paie le prochain billet d'avion

## L'avance rapide

On peut passer 1, 2, 4, 8 semaines ou toute la fin de la saison d'un coup. Trois réglages :

- **où s'arrêter** : à chaque tournoi, aux Masters 1000 et Chelems, aux Chelems seulement, ou
  jamais
- **quoi faire des semaines libres** : n'importe lequel des dix blocs de travail
- l'inscription aux tournois adaptés se fait toute seule, sauf pour les semaines que vous avez
  déjà planifiées depuis le calendrier

La simulation s'interrompt d'elle-même sur blessure, sur événement narratif et en fin de
saison, avec un récapitulatif de ce qui s'est passé semaine par semaine.

## Les compétitions par nation

**La Coupe Davis** se joue par équipes : les huit meilleures nations, une rencontre en phase
de groupes en semaine 37, la phase finale en semaine 46. Vous êtes sélectionné si vous êtes
dans les quatre meilleurs joueurs de votre pays. Chaque rencontre se joue en trois points :
**votre simple**, que vous disputez vous-même, le simple de votre coéquipier et le double, tous
deux simulés à partir du niveau réel de l'effectif national. Zéro point ATP en jeu, et une
victoire qu'on vous rappellera toute votre vie.

**Les Jeux Olympiques** sont un tableau de 64, avec le vrai quota de quatre joueurs par nation.
Aucun point au classement, une dotation dérisoire, et l'or, l'argent ou le bronze.

## Les têtes de série

Les tableaux sont composés à la manière du circuit : un quart des joueurs est tête de série
(32 pour un Grand Chelem, 16 pour un Masters 1000, 8 pour un tableau de 32), et les têtes sont
réparties pour que les deux premières ne puissent se rencontrer qu'en finale. Votre propre
numéro de série et celui de chaque adversaire sont affichés.

## Le tableau

Le tableau complet est consultable pendant tout le tournoi, tour par tour, avec les vainqueurs
en clair et les éliminés en gris. Par défaut on ne voit que **son propre quart de tableau** —
ceux qu'on peut croiser avant les demi-finales — et un bouton bascule vers l'intégralité.

## Les qualifications

Si votre classement est au-dessous du **cut** du tableau, vous ne rentrez pas directement :
il faut gagner deux matchs de qualifications. C'est la réalité de la vie d'un joueur classé
au-delà de la 300e place — et une bonne partie du jeu en début de carrière.

## Un match

Les points sont simulés un par un en interne, ce qui produit des statistiques réelles ; mais
l'affichage avance **jeu par jeu** :

- Un tableau d'affichage set par set, avec le score du jeu en cours et le serveur
- Un fil de match : chaque jeu, les breaks en évidence, les balles de break sauvées, les
  tie-breaks, les doubles fautes au pire moment
- Six **plans de jeu** modifiables en cours de match : équilibré, prendre la balle tôt,
  reculer et user, miser sur le service, agresser le retour, chercher le filet
- Des statistiques complètes en fin de match : aces, doubles fautes, pourcentage de première
  balle, points gagnés sur 1re et 2e balle, balles de break, coups gagnants, fautes directes
- Trois vitesses : jeu par jeu, set par set, ou simulation du reste du match

La **fatigue s'accumule pendant le match** et ronge le jeu de fond de court : c'est pour ça
que l'endurance compte, que la terre battue use plus que le gazon, et qu'un cinq-sets se joue
autrement qu'un match en deux sets.

## Les moments de décision

Deux à quatre fois par match, aux points qui comptent vraiment — balle de match, balle de
break dans le set décisif, tie-break à 5‑5 — **le match s'arrête** et vous choisissez ce que
vous tentez, avec la probabilité affichée.

Le modèle n'est pas décoratif. Chaque option a un gain brut (`dp`), un attribut qui la rend
crédible, et une **variance** qui rapproche le résultat du pile ou face. Conséquence :

- un gros serveur a raison d'aller chercher l'ace sur balle de match (81 % contre 79 % en
  assurant) ;
- un petit serveur a tort (64 % contre 77 % en jouant le point) ;
- un outsider qui sauve une balle de match doit **tenter** (39 %) plutôt qu'assurer (14 %).

Jouer risqué quand on est mené est la bonne décision ; jouer risqué quand on domine est un
caprice. C'est tout l'arbitrage, et le jeu ne vous l'explique jamais — il vous laisse le
découvrir dans les chiffres.

## La fiche adversaire

Avant chaque match, le staff vous remet un rapport : les huit attributs comparés côte à côte,
son affinité sur la surface du jour, votre face-à-face, et une lecture en clair — « son revers
est nettement en retrait », « son endurance décroche : allongez les échanges », « il tremble
sur les points importants ». Le plan de jeu recommandé est présélectionné, et vous êtes libre
d'en choisir un autre.

Toutes ces données existaient déjà dans le monde ; il ne manquait que de les lire.

## L'objectif de saison

Chaque janvier, votre équipe fixe une cible adaptée à votre niveau réel : marquer vos premiers
points, gagner douze matchs, entrer dans le top 200, décrocher un titre, ou simplement
terminer l'année à l'équilibre. Elle est affichée en permanence sur l'écran de la semaine,
avec son état d'avancement, et jugée en fin de saison — prime et moral à la clé, ou
conversations difficiles.

## Le fil du circuit

Le monde vivait déjà ; désormais il se voit. Chaque semaine, le jeu raconte ce qui s'est passé
ailleurs : qui a gagné quoi, quel joueur de 18 ans vient d'entrer dans le top 100, qui devient
numéro un mondial, quelle nation a remporté la Coupe Davis.

Votre rival, lui, apparaît dans les tableaux (« il est dans votre partie de tableau »), dans le
bilan de saison, et une nouvelle génération prend le relais quand il raccroche.

## Le corps

Sept zones suivies séparément : épaule, coude, poignet, dos, hanche, genou, cheville. Chaque
bloc d'entraînement use les zones qu'il sollicite. Une zone dégradée finit par lâcher, et la
blessure est tirée en quatre niveaux de gravité — de la gêne d'une semaine à l'opération de
huit mois, qui laisse des séquelles définitives.

## Le vieillissement

Les joueurs vieillissent tous — vous compris — selon la même courbe : progression jusqu'au
pic (tiré entre 24 et 29 ans), puis déclin plafonné. Ce sont la vitesse et l'endurance qui
partent en premier, le fond de court ensuite, le service très peu, et le mental continue de
monter.

Du pic à 40 ans, un joueur perd une vingtaine de points de niveau — assez pour glisser du
top 20 au-delà de la 500e place, jamais assez pour devenir immobile.

Aucun attribut ne peut s'envoler seul : chacun bute sur le talent (`potentiel + 6`), ce qui
interdit de pousser un coup droit à 99 avec un potentiel de 78.

Le circuit se renouvelle tout seul : les joueurs prennent leur retraite selon leur âge, leur
classement et un peu de hasard, une centaine de juniors arrivent chaque année, et les départs
marquants sont annoncés dans le fil d'actualité. Sur vingt saisons simulées, l'âge moyen du
top 100 reste stable autour de 27-28 ans, avec une répartition réaliste : ~30 joueurs de 20 à
23 ans, ~75 de 24 à 27, ~65 de 28 à 31, ~30 de 32 à 35.

À partir de 29 ans, si le corps lâche, si le classement s'effondre ou si les comptes ne
suivent plus, **le jeu pose la question de la retraite** en fin de saison — sans jamais
décider à votre place.

## L'argent

Vous démarrez avec 20 000 € et un entraîneur de club. Le staff se recrute poste par poste
(entraîneur, préparateur physique, kiné, préparateur mental, agent), sur quatre à cinq
niveaux, avec un coût hebdomadaire réel. Les charges tournent autour de 60 000 € par an au
départ ; les gains d'un joueur classé 400e sont de l'ordre de 20 000 €.

**Sous la 200e place, on perd de l'argent.** C'est exact, et c'est un vrai problème de jeu :
il faut arbitrer entre un meilleur staff et la survie financière, et parfois passer une
semaine à donner des cours.

## Les 8 attributs

Service · Retour · Coup droit · Revers · Volée · Vitesse · Endurance · Mental

Chacun est réellement utilisé par le moteur de match. Le niveau général est leur moyenne
pondérée par votre style de jeu — un serveur-volleyeur ne valorise pas les mêmes qualités
qu'un contreur.

## Les surfaces

Terre battue, dur, gazon. Les affinités sont **à somme nulle** : être excellent sur terre,
c'est accepter d'être moyen sur gazon. Elles viennent de votre nation, de votre style et de
votre formation, et pèsent environ un point de niveau par unité.

## Équilibrage

Le point délicat du projet. Sur ~150 points, un minuscule avantage par point devient un
énorme avantage de match : les coefficients du moteur ont donc été calibrés numériquement
pour que le moteur détaillé produise **les mêmes probabilités** que le modèle rapide utilisé
pour les milliers de matchs entre PNJ. Sans cette cohérence, le classement du joueur et celui
du circuit ne parleraient pas la même langue.

Cible atteinte : un écart de 3 points de niveau ≈ 68 % de victoires, 6 ≈ 81 %, 10 ≈ 92 %.

Le talent suit une pyramide très raide chez les PNJ (`potMin + potSpread × alea^2,5`). Le
joueur, lui, tire dans une courbe plus généreuse (`^1,7`) : sans espoir crédible d'aller
haut, il n'y a pas de partie. Les carrières observées vont de la 550e place à la 2e mondiale,
avec ou sans Grand Chelem.

## Bancs d'essai

Deux scripts Node, à relancer après tout changement d'équilibrage :

```bash
node sim.js
```
Joue une carrière complète de 18 saisons hors interface et affiche l'évolution saison par
saison, le bilan, le palmarès et le top 10 mondial final.

```bash
node saison.js
```
Détaille une saison semaine par semaine : tournoi joué, catégorie, statut d'entrée, cut du
tableau, parcours match par match, points gagnés. C'est l'outil qui a permis de trouver
pourquoi le joueur perdait tous ses matchs.

## La sauvegarde

Le monde contient 1 150 joueurs qui se référencent entre eux — classement, tableaux,
face-à-face. On sérialise donc **par identifiants** et on reconstruit les références au
chargement. Les semaines vides du classement glissant ne sont pas stockées, ce qui divise la
taille par trois.

Résultat : **406 Ko, 5 ms pour écrire, 400 ms pour recharger le monde entier**. La partie se
sauvegarde toute seule à chaque fin de semaine, après chaque match, et dès que l'onglet passe
en arrière-plan.

On peut sauvegarder **au milieu d'un tournoi** : le tableau, le tour en cours et l'adversaire
exact sont restaurés à l'identique. Quitter au troisième tour et perdre la semaine serait
insupportable.

## L'onglet Progrès

Le jeu produisait une masse de données qu'il jetait. Il les conserve désormais : une
photographie des huit attributs à chaque fin de saison, le bilan par surface et par catégorie
de tournoi, l'état du corps et la notoriété année après année.

L'onglet **Progrès** les met en courbes, en SVG, sans aucune dépendance :

- la trajectoire au classement mondial, en échelle logarithmique inversée ;
- le niveau de jeu, avec le plafond de talent en pointillés — on voit exactement à quel moment
  on s'en approche ;
- chaque attribut : barre claire au départ, barre pleine aujourd'hui, écart chiffré ;
- le bilan par surface, qui finit par désigner votre meilleure surface **en résultats** et pas
  seulement en affinité théorique ;
- l'usure du corps, la notoriété et les gains, saison par saison.

## L'identité visuelle

La surface prend possession de l'écran. Sur terre battue le fond vire à l'ocre, sur gazon au
vert, sur dur au bleu ; le bandeau du match, la bordure du tableau d'affichage et son halo
suivent. Un court vu du dessus apparaît en filigrane derrière l'en-tête, aux couleurs du jour.

Tout est en CSS et en SVG : aucune image, aucun octet supplémentaire à télécharger.

## Les drapeaux

Windows n'affiche pas les emojis drapeaux : 🇫🇷 y devient deux lettres côte à côte. Le jeu le
détecte en mesurant la largeur du glyphe — un vrai drapeau tient en un seul caractère — et
remplace alors tous les drapeaux par une pastille au code du pays (FRA, ESP, SUI…). Le reste
du code continue d'écrire `nation.flag` sans rien savoir de cette histoire.

## Le contenu narratif

**140 événements et 64 micro-événements.** Un événement se déclenche environ une fois toutes les
dix semaines, jamais deux fois dans la même carrière, et seulement si la situation s'y prête
(âge, classement, moral, notoriété, fraîcheur, drapeaux d'histoire).

Le ton est celui du circuit tel qu'il est vraiment : l'hôtel « quatre étoiles selon le site
officiel » au-dessus d'un karaoké, la compagnie aérienne qui perd neuf raquettes la veille
d'un match, le douanier qui vous demande si vous êtes « dans le commerce », le cordeur qui se
trompe de trois kilos quarante minutes avant la finale, le pigeon qui s'installe au milieu du
court à 4-4 dans le troisième set.

Les clins d'œil au circuit sont **des allusions, jamais des joueurs nommés** : celui qui
aligne ses bouteilles étiquettes face au court, celui qui demande la serviette après chaque
point y compris les aces, celui qui ne transpire pas après quatre heures sous 34 °C, l'ancien
qui monte trois clubs de padel parce que « franchement, c'est là que ça se passe maintenant ».
Prêter des comportements inventés à des personnes réelles et identifiables dans un jeu publié
est un problème juridique autant qu'éthique — et l'allusion est de toute façon plus drôle.

Le fichier `events.js` est fait pour être étendu : le moteur ne contient aucun texte, et un
script de validation vérifie que les poids de chaque option font bien 100 et que toutes les
clés d'effet existent.

## Ce qui reste à faire

**Encore du contenu narratif** — 140 événements aujourd'hui. C'est le levier le plus rentable
pour que deux parties ne se ressemblent pas, et `events2.js` est fait pour être prolongé.

**Tête de série et exempts** — le tableau gère les têtes de série, mais l'interface ne les
affiche pas encore.
