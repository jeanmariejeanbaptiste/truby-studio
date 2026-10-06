/* =====================================================================
   TRUBY STUDIO — Contenu méthodologique
   Tous les termes, définitions et exemples sont tirés de
   John Truby, « L'Anatomie du scénario » (traduction française).
   ===================================================================== */
'use strict';

const TRUBY = {};

/* ---------- Ordre du processus d'écriture (chapitre 1) ---------- */
TRUBY.SECTIONS = [
  { id: 'premisse', n: 1, title: 'La prémisse', short: 'Prémisse', ch: 'Chapitre 2',
    intro: "La prémisse, c'est l'histoire formulée en une seule phrase. C'est le lien le plus simple entre le personnage et l'intrigue.",
    keys: [
      "Ce que vous avez choisi d'écrire est bien plus important que toute décision que vous pourrez prendre sur la façon dont vous l'écrirez.",
      "Neuf scénaristes sur dix échouent à l'étape de la prémisse.",
      "Explorez toutes les possibilités qui se présentent à vous. Prenez votre temps : des semaines, pas des heures."
    ] },
  { id: 'structure', n: 2, title: 'La structure narrative : 7 étapes ou 22 étapes', short: 'Structure narrative', ch: 'Chapitres 3 et 8',
    intro: '',
    keys: [
      "Commencez par déterminer la prise de conscience, à la fin de l'histoire ; puis revenez au début et réfléchissez au besoin et au désir de votre héros.",
      "Ne sautez jamais la première étape (faiblesses et besoin). Jamais.",
      "Restez souple : les vingt-deux étapes n'ont pas d'ordre chronologique clairement défini."
    ] },
  { id: 'personnages', n: 3, title: 'Les personnages', short: 'Personnages', ch: 'Chapitre 4',
    intro: "Quand on crée un héros ou un personnage quelconque, la plus importante des étapes consiste à le comparer et à le connecter à tous les autres. Tous les personnages se définissent par leur rôle dans l'histoire, leur archétype, le thème et l'opposition.",
    keys: [
      "Pour avoir un bon personnage principal, il lui faut un bon adversaire.",
      "Chaque personnage devrait présenter au public une approche différente du problème moral central (« variations sur un même thème »).",
      "Une opposition simpliste entre deux personnages anéantit toutes chances de profondeur : créez un réseau d'oppositions."
    ] },
  { id: 'debat', n: 4, title: 'Le débat moral', short: 'Débat moral', ch: 'Chapitre 5',
    intro: "Le thème n'est pas le sujet de l'histoire. Le thème, c'est le point de vue de l'auteur sur la façon dont il convient d'agir dans la vie : votre vision morale, exprimée par un « débat d'actions » entre vos personnages.",
    keys: [
      "La structure ne sert pas simplement à porter un contenu ; elle est du contenu.",
      "L'aboutissement de la ligne morale étant le choix final, commencez par déterminer les oppositions morales en utilisant ce choix.",
      "Votre débat moral paraîtra toujours simpliste si vous utilisez une opposition binaire, comme le bien contre le mal."
    ] },
  { id: 'univers', n: 5, title: "L'univers du récit", short: 'Univers du récit', ch: 'Chapitre 6',
    intro: "On ne crée pas des personnages pour remplir un univers de récit. On crée l'univers du récit pour exprimer ses personnages, en particulier son héros. L'univers est une expression physique de la personnalité du héros et de son développement.",
    keys: [
      "Dans la plupart des histoires, le monde est une expression physique de la personnalité de votre héros et de la façon dont elle se développe.",
      "Demandez-vous toujours comment le monde de l'asservissement est une expression de la faiblesse majeure de votre héros.",
      "La confrontation doit se dérouler dans l'endroit le plus confiné de toute l'histoire."
    ] },
  { id: 'symboles', n: 6, title: 'Le réseau de symboles', short: 'Réseau de symboles', ch: 'Chapitre 7',
    intro: "Un symbole est une image au pouvoir spécial : une haute concentration de sens. Guide d'utilisation : référence et répétition.",
    keys: [
      "Il faut toujours créer un réseau de symboles au sein duquel chaque symbole contribue à définir les autres.",
      "Répétez le symbole, en le modifiant légèrement à chaque fois.",
      "Sentiment → symbole → sentiment chez le lecteur / spectateur."
    ] },
  { id: 'intrigue', n: 7, title: "L'intrigue", short: 'Intrigue', ch: 'Chapitre 8',
    intro: "L'intrigue tisse sous la surface les diverses lignes d'actions. Elle suit la danse complexe du héros et de tous ses adversaires tandis qu'ils se battent pour le même objectif. Votre intrigue dépend de la façon dont vous cachez et révélez des informations.",
    keys: [
      "Intrigue = séquence de conflits + séquence de rebondissements-révélations.",
      "Plus le plan de l'adversaire sera ingénieux, plus l'intrigue sera forte : commencez par le plan de l'adversaire.",
      "Les meilleurs rebondissements sont ceux qui concernent l'adversaire."
    ] },
  { id: 'tissage', n: 8, title: 'Le tissage des scènes', short: 'Tissage des scènes', ch: 'Chapitre 9',
    intro: "Le tissage des scènes est la liste de toutes les scènes de votre histoire, chacune décrite en une phrase, avec l'étape structurelle à laquelle elle correspond. C'est la dernière étape avant l'écriture.",
    keys: [
      "L'ordre des scènes doit être dicté par la structure, et non par la chronologie.",
      "Portez une attention particulière à la juxtaposition des scènes.",
      "Trouvez la ligne et gardez cette ligne. Coupez, fusionnez, ajoutez."
    ] },
  { id: 'scenario', n: 9, title: 'Construction des scènes et dialogues symphoniques', short: 'Scénario', ch: 'Chapitre 10',
    intro: "Le scénario reprend automatiquement le tissage des scènes. Écrivez chaque scène comme une mini-histoire (triangle inversé) et vos dialogues sur trois pistes : dialogue narratif, dialogue moral, mots clefs.",
    keys: [
      "Faites commencer vos scènes le plus tard possible, mais sans sauter aucune des étapes structurelles clefs dont vous avez besoin.",
      "Les dialogues d'une histoire ne sont pas les conversations de la vie.",
      "Pensez la scène comme un triangle pointant vers le bas : le mot clef vient en dernier."
    ] },
  { id: 'export', n: 10, title: 'Exporter et partager', short: 'Exporter', ch: '',
    intro: "Exportez le dossier complet ou seulement le scénario final, en HTML, Markdown (lisible par Claude ou ChatGPT) ou PDF. Enregistrez le fichier projet (.truby) pour reprendre votre travail n'importe où.",
    keys: [] }
];

/* ---------- Champs de la prémisse (Exercice d'écriture n° 1) ---------- */
TRUBY.PREMISSE = [
  { group: "Écrire quelque chose qui pourrait changer votre vie", tone: 'pre', eyebrow: 'Avant la prémisse · travail préparatoire',
    note: "Ces trois listes préparent la prémisse : notez tout, classez par glisser-déposer, notez de une à cinq étoiles ce qui vous plaît le plus.", fields: [
    { k: 'souhaitsL', l: 'Liste de souhaits', t: 'rank',
      h: "Tout ce que vous voudriez voir au cinéma ou lire dans un livre : personnages, rebondissements, répliques, thèmes, genres. Ne rejetez rien, ne cherchez pas à organiser.",
      ph: "Nouveau souhait…" },
    { k: 'premissesL', l: 'Liste de prémisses', t: 'rank',
      h: "Toutes les prémisses auxquelles vous avez jamais pensé — chacune en une seule phrase.",
      ph: "Nouvelle prémisse…" },
    { k: 'recoupements', l: 'Éléments qui se recoupent', t: 'area', rows: 3, ai: 'overlap',
      h: "Étudiez les deux listes ensemble : types de personnages, ton, genres, thèmes, périodes qui reviennent. C'est, dans sa forme la plus brute, votre vision des choses." }
  ]},
  { group: 'La prémisse', tone: 'main', eyebrow: 'Le cœur de la section', fields: [
    { k: 'premisse', l: 'Prémisse', t: 'area', rows: 2, big: true, main: true, meter: true,
      h: "L'histoire formulée en une seule phrase : un événement déclencheur, une indication sur le personnage principal et une indication sur le dénouement. Demandez-vous si cette phrase pourrait devenir une histoire qui changerait le cours de votre vie.",
      ex: [
        ['Le Parrain', "Le cadet d'une famille de mafieux se venge des hommes qui ont tiré sur son père et devient le nouveau Parrain."],
        ['Éclair de lune', "Alors que son fiancé rend visite à sa mère en Italie, une femme tombe amoureuse de son futur beau-frère."],
        ['Casablanca', "Un expatrié américain endurci retrouve un ancien amour, qu'il finit par abandonner pour aller combattre les nazis."],
        ['Un tramway nommé Désir', "Une beauté vieillissante tente de se faire épouser par un homme tout en subissant les attaques constantes du mari violent de sa sœur."],
        ['La Guerre des étoiles', "Alors qu'une princesse court un danger mortel, un jeune homme utilise ses talents de combattant pour la sauver et vaincre les forces maléfiques d'un empire galactique."],
        ['Breaking Bad', "Quand un professeur de chimie découvre qu'il est atteint d'un cancer en phase terminale, il se met à fabriquer et à vendre de la méthamphétamine pour financer ses soins et assurer l'avenir de sa famille."]
      ] },
    { k: 'changerVie', l: 'Cette histoire pourrait-elle changer ma vie ? Pourquoi est-elle si importante pour moi ?', t: 'area', rows: 2,
      h: "Une idée ne peut être fraîche et originale que si l'on est passionné par elle." }
  ]},
  { group: 'Déterminer ce qui est possible', fields: [
    { k: 'possibilites', l: 'Possibilités — « Que se passerait-il si… ? »', t: 'area', rows: 5,
      h: "Déterminez ce qui est promis par l'idée de départ, puis demandez-vous « Que se passerait-il si… ? ». Ne vous censurez pas : les idées « stupides » mènent souvent à des inventions créatives.",
      ex: [
        ['Witness, témoin sous surveillance', "Que se passerait-il si l'on montrait les deux extrêmes de l'usage de la force – la violence et le pacifisme – en faisant passer le petit garçon du monde paisible des amish à la violence de la ville ?"],
        ['Tootsie', "Que se passerait-il si l'on faisait du héros un macho qui est forcé de prendre le déguisement – celui d'une femme – qu'il a le moins envie de porter mais dont il a le plus besoin pour pouvoir évoluer ?"],
        ['Chinatown', "Que se passerait-il si le détective commençait par enquêter sur le plus petit « crime » qui soit, l'adultère, et finissait par découvrir que toute la ville s'est construite sur un meurtre ?"],
        ['Le Crime de l\'Orient-Express', "Que se passerait-il si la victime méritait de mourir et qu'un jury naturel composé de douze hommes et femmes avait été à la fois son juge et son bourreau ?"]
      ] },
    { k: 'defis', l: 'Défis et problèmes soulevés par l\'histoire', t: 'area', rows: 4,
      h: "Chaque histoire a son propre ensemble de règles, ou de défis, profondément ancrés dans l'idée de base. Ce sont des repères qui vous permettront de découvrir votre véritable histoire.",
      ex: [
        ['Les Dents de la mer', "Concevoir une confrontation équitable contre un adversaire dont l'intelligence est limitée, créer une situation dans laquelle le requin peut attaquer souvent, et écrire une fin qui correspond à un duel entre le héros et le requin."],
        ['Forrest Gump', "Créer un héros retardé mental capable de mener l'intrigue, d'avoir des opinions profondes et de faire l'expérience d'une transformation, tout en trouvant un bon équilibre entre la fantaisie et les sentiments authentiques."],
        ['Tootsie', "Comment rendre un homme déguisé en femme crédible, tisser plusieurs intrigues hommes-femmes afin de les unifier en une seule ligne narrative ?"]
      ] }
  ]},
  { group: 'Principe directeur', fields: [
    { k: 'principe', l: 'Principe directeur', t: 'area', rows: 2, big: true,
      h: "Principe directeur = processus de l'histoire + développement original. C'est votre stratégie globale formulée en une seule phrase : la logique interne qui fait de l'histoire une unité. Trouvez-le et tenez-vous-y. (Techniques : le voyage, le grand symbole unique, deux symboles connectés, une unité de temps, le narrateur.)",
      ex: [
        ['Le Parrain', "Utiliser la stratégie classique du conte de fées qui consiste à expliquer comment le plus jeune des trois frères devient le nouveau « roi »."],
        ['Tootsie', "Forcer un macho à vivre dans la peau d'une femme."],
        ['Ulysse', "Une odyssée moderne à travers la ville, où en l'espace d'une seule journée, un homme trouve un père, qui lui-même trouve un fils."],
        ['Les « Harry Potter »', "Un prince magicien apprend à devenir un homme et un roi en passant sept années scolaires dans une école qui forme des sorciers."],
        ['Un chant de Noël', "Suivre la renaissance d'un homme en le forçant à observer son passé, son présent et son futur le soir du réveillon de Noël."],
        ['Citizen Kane', "Se servir de plusieurs narrateurs pour démontrer que l'on ne peut jamais vraiment connaître la vie d'un homme."],
        ['Breaking Bad', "Faire passer le personnage principal « de Mr Chips à Scarface » – « de protagoniste à antagoniste »."]
      ] }
  ]},
  { group: 'Héros, conflit et action principale', fields: [
    { k: 'meilleurPerso', l: 'Meilleur personnage', t: 'area', rows: 2,
      h: "Toujours raconter l'histoire de votre meilleur personnage : « le meilleur » signifie le plus fascinant, stimulant et complexe – pas le plus sympathique. Lequel est celui que j'adore ?",
      ex: [['Tootsie', "La division de Michael, partagé entre son apparence d'homme et son apparence de femme, peut être considérée comme une expression physique et comique d'une contradiction extrême qu'il porte en lui."]] },
    { k: 'conflit', l: 'Conflit central — Qui combat qui pour quoi ?', t: 'area', rows: 2,
      h: "Répondez en une phrase succincte : cela vous donnera le sujet de votre histoire.",
      ex: [['Tootsie', "Michael se bat contre Julie, Ron, Les et Sandy pour l'amour et l'honnêteté."]] },
    { k: 'action', l: 'Action principale (séquence unique de rapports de cause à effet)', t: 'area', rows: 2,
      h: "Quelle est l'action principale de mon héros ? Celle qui domine et unifie toutes les autres – la colonne vertébrale de l'histoire. Une prémisse divisée en deux doit être unifiée.",
      ex: [
        ['La Guerre des étoiles', "« Utiliser ses talents de combattant »."],
        ['Le Parrain', "La vengeance."],
        ['Prémisse unifiée', "« Pour l'amour d'une femme, un homme lutte contre son frère afin de prendre le contrôle d'un vignoble » (au lieu de : « Un homme tombe amoureux et se bat contre son frère pour le contrôle d'un vignoble »)."]
      ] }
  ]},
  { group: 'Transformation du personnage — F × A = T', note: "F représente les faiblesses, à la fois psychologiques et morales ; A est la confrontation pour accomplir l'action principale ; T est la personne transformée. Faites de F et de T les opposés de A.", cols: 3, fields: [
    { k: 'F', l: 'F — faiblesses initiales', t: 'area', rows: 3,
      ex: [['La Guerre des étoiles', 'Naïf, impétueux, manque de concentration et de confiance en soi'], ['Le Parrain', 'Prudent, conventionnel, isolé du reste de la famille'], ['Tootsie', 'Michael est arrogant, menteur et coureur de jupons']] },
    { k: 'A', l: 'A — action principale', t: 'area', rows: 3, ref: 'premisse.action',
      ex: [['La Guerre des étoiles', 'Utilise ses talents de combattant'], ['Le Parrain', 'Vengeance'], ['Tootsie', "Le héros, un homme, se met dans la peau d'une femme"]] },
    { k: 'T', l: 'T — transformation', t: 'area', rows: 3,
      ex: [['La Guerre des étoiles', 'Estime de soi, gagne une place parmi les happy few, devient un combattant confirmé'], ['Le Parrain', 'Tyrannique, devient le chef incontesté de la famille'], ['Tootsie', "Michael apprend à devenir un homme meilleur et capable d'amour"]] }
  ]},
  { group: 'Choix moral et public', fields: [
    { k: 'choixMoral', l: 'Choix moral du héros', t: 'area', rows: 2,
      h: "Évitez le faux choix (positif contre négatif). Votre héros doit soit sélectionner l'une des deux possibilités positives, soit, plus rarement, éviter l'une des deux possibilités négatives. Rendez les deux options aussi égales que possible.",
      ex: [['L\'Adieu aux armes', "L'amour contre l'honneur : le héros choisit l'amour."], ['Le Faucon maltais', "Le héros choisit l'honneur."], ['Tootsie', "Michael sacrifie son travail lucratif au sein de la série et s'excuse auprès de Julie de lui avoir menti."], ['Le Choix de Sophie', "Éviter l'une des deux possibilités négatives."]] },
    { k: 'public', l: 'Réception du public', t: 'area', rows: 2,
      h: "Cette histoire résumée en une seule phrase est-elle assez originale pour intéresser d'autres personnes que moi-même ? Si ce n'est pas le cas, retournez à la case départ." }
  ]}
];

TRUBY.CHECKLIST_PREMISSE = [
  ['orig', "Les idées originales se fabriquent, elles ne se trouvent pas.", "Ai-je déjà lu ou vu cela ? Qu'y a-t-il d'unique dans mon idée ? Pourquoi ai-je envie de raconter cette histoire ?"],
  ['outsider', "Pour un maximum de dynamisme narratif, le héros doit être un outsider doté d'une faiblesse.", "La faiblesse doit être, d'une certaine façon, à l'opposé de l'objectif du héros."],
  ['accroche', "Une bonne phrase d'accroche évoque en une phrase unique l'intégralité de l'intrigue, sans la dévoiler totalement.", ''],
  ['desir', "Il vous faut un désir spécifique extrêmement difficile à assouvir.", "Il doit requérir dix, quinze, vingt actions ou davantage."],
  ['adversaire', "Il vous faut un adversaire principal aussi puissant que possible.", ''],
  ['retournement', "Pour qu'elle soit percutante, la prémisse évoque directement le grand retournement.", "En général à la fin, avec une expression équivalente à « mais il découvre que… »."]
];

/* ---------- Les vingt-deux étapes (les 7 étapes clefs sont marquées « key ») ---------- */
const NEED_HELP = "Une faiblesse ou un besoin psychologique n'affecte que le héros ; une faiblesse ou un besoin moral affecte aussi les autres. Pour qu'il y ait besoin moral, il faut que le personnage blesse au moins une personne au début de l'histoire.";
TRUBY.STEPS = [
  { id: 'cadre', n: 1, title: 'Prise de conscience, besoin et désir',
    d: "L'ensemble de la transformation que vivra votre héros. Commencez par la prise de conscience, puis revenez au début pour trouver sa faiblesse, son besoin et son désir.",
    f: [
      { k: 'priseConscience', l: 'Prise de conscience (ce que le héros apprend à la fin)', t: 'area' },
      { k: 'besoin', l: 'Besoin (psychologique et moral)', t: 'area' },
      { k: 'desir', l: 'Désir', t: 'area' },
      { k: 'erreur', l: 'Erreur initiale (sur quoi le héros se trompe-t-il au début ?)', t: 'area', h: "Votre héros ne peut apprendre quelque chose à la fin de l'histoire s'il ne se trompe pas sur quelque chose au début." }
    ],
    ex: [['Casablanca', "Prise de conscience : Rick comprend qu'il ne peut pas se retirer du combat pour la liberté à cause d'une peine de cœur. Désir : récupérer Ilsa. Erreur initiale : Rick se considère comme un homme mort ; il ne s'intéresse plus aux affaires du monde."],
         ['Tootsie', "Prise de conscience : Michael comprend qu'il a traité les femmes comme des objets sexuels. Erreur initiale : Michael trouve son comportement parfaitement normal et pense qu'il a raison de mentir aux femmes."]] },
  { id: 'spectre', n: 2, title: 'Spectre et univers du récit',
    d: "Le spectre est un événement du passé qui continue de hanter le héros dans le présent : une blessure encore ouverte, l'adversaire interne. L'univers du récit doit exprimer la faiblesse, le besoin, le désir et les obstacles du héros.",
    f: [
      { k: 'spectre', l: 'Spectre', t: 'area', h: "Il agit comme un contre-désir : le désir pousse le héros vers l'avant, le spectre le tire vers l'arrière. Ne « sur-écrivez » pas l'exposition : dissimulez." },
      { k: 'univers', l: 'Univers du récit (le monde où vit le héros)', t: 'area', h: "Si, au début, votre héros est asservi, l'univers du récit doit être asservissant et souligner ou exacerber sa faiblesse majeure.", ref: 'univers.phrase' }
    ],
    ex: [['Hamlet', "Avant la première page, l'oncle de Hamlet a assassiné son père, le roi, puis a épousé sa mère."],
         ['La Vie est belle', "Le désir de George Bailey est de voir le monde ; son spectre – sa peur de ce que Potter ferait à sa famille s'il partait – le retient."],
         ['Casablanca', "Rick est hanté par le souvenir d'Ilsa, qui l'a quitté à Paris. Le bar de Rick est un lieu vénal, parfaite représentation de son cynisme et de son égoïsme."]] },
  { id: 'faiblesse', n: 3, key: 1, title: 'Faiblesse et besoin',
    d: "Le héros a une ou plusieurs faiblesses majeures qui lui gâchent la vie. Le besoin, c'est ce qu'il doit accomplir en lui-même pour améliorer sa vie. Au début de l'histoire, votre héros ne doit pas savoir ce dont il a besoin.",
    grid: true,
    f: [
      { k: 'faiblessePsy', l: 'Faiblesses psychologiques', t: 'area', cls: 'psy', h: "Elles ne font de mal à personne d'autre qu'au héros lui-même." },
      { k: 'faiblesseMorale', l: 'Faiblesses morales', t: 'area', cls: 'mor', h: "Le héros blesse au moins une personne au début de l'histoire." },
      { k: 'besoinPsy', l: 'Besoin psychologique', t: 'area', cls: 'psy', h: "Surmonter une faiblesse qui ne blesse que lui." },
      { k: 'besoinMoral', l: 'Besoin moral', t: 'area', cls: 'mor', h: "Apprendre à se comporter correctement avec les autres." },
      { k: 'probleme', l: 'Problème (la crise de la première page)', t: 'area', h: "Une manifestation externe de la faiblesse du héros. Faites en sorte que votre problème soit simple et bien spécifique.", wide: true }
    ],
    tech: "Créer un besoin moral : 1. Partez de la faiblesse psychologique. 2. Déterminez quel type d'action immorale pourrait naturellement en découler. 3. Identifiez la faiblesse morale et le besoin moral qui sont la source de cette action. — Ou poussez une force au-delà de ses limites pour qu'elle devienne une faiblesse.",
    ex: [['Tootsie', "Faiblesses : Michael est arrogant, égoïste et menteur. Besoin : surmonter son arrogance envers les femmes et cesser de mentir et d'utiliser les femmes pour parvenir à ses fins. Problème : personne ne veut de lui, il est désespéré."],
         ['Le Verdict', "Besoin psychologique de Frank : vaincre son problème d'alcoolisme et recouvrer une certaine estime de soi. Besoin moral : arrêter d'utiliser les autres pour gagner de l'argent et apprendre à agir de façon plus juste (il ment pour s'incruster à l'enterrement d'un inconnu afin de faire des affaires)."],
         ['Le Silence des agneaux', "Faiblesses : Clarice est inexpérimentée, hantée par ses souvenirs d'enfance, une femme dans un monde d'hommes. Besoin : vaincre les spectres de son passé et faire ses preuves."],
         ['Le Parrain', "Besoin psychologique : surmonter son complexe de supériorité et son dogmatisme. Besoin moral : éviter de devenir impitoyable, comme tous les autres chefs de la Mafia, tout en continuant de protéger sa famille."],
         ['Boulevard du crépuscule', "Problème : Joe est ruiné. Deux représentants d'une société de recouvrement viennent saisir sa voiture. Il s'enfuit."]] },
  { id: 'declencheur', n: 4, title: 'Événement déclencheur',
    d: "Un événement de l'extérieur qui entraîne le héros à se fixer un objectif et à agir. Pensez à l'expression « aller de Charybde en Scylla » : le héros croit sortir de la crise, mais vient de se mettre dans le pire pétrin de sa vie.",
    f: [{ k: 'evenement', l: 'Événement déclencheur', t: 'area' }],
    ex: [['Boulevard du crépuscule', "Le pneu de Joe éclate ; il tourne dans l'allée de Norma Desmond et pense s'être sorti de ses problèmes."], ['Casablanca', "Ilsa et Laszlo viennent trouver Rick."], ['Tootsie', "George, l'agent de Michael, lui explique que plus personne ne veut l'embaucher."]] },
  { id: 'desir', n: 5, key: 2, title: 'Désir',
    d: "Ce que le héros souhaite obtenir : son objectif dans l'histoire, et non dans la vie. La colonne vertébrale de l'intrigue. Il doit être unique, précis, et se prolonger quasiment jusqu'à la fin. Au départ, mettez-le en veilleuse pour pouvoir l'intensifier.",
    f: [
      { k: 'desir', l: 'Désir (objectif précis)', t: 'area' },
      { k: 'pointArrivee', l: "Point d'arrivée : à quel moment précis sait-on si le héros a ou non atteint l'objectif ?", t: 'area', h: "« Devenir indépendant » n'est pas un désir : il n'existe pas de moment précis où l'on devient indépendant." },
      { k: 'degre', l: 'Degré de désir', t: 'select', opts: ['', '1. Survivre (s\'échapper)', '2. Prendre sa revanche', '3. Gagner le combat', '4. Accomplir quelque chose', '5. Explorer un monde', '6. Attraper un criminel', '7. Découvrir la vérité', '8. Gagner l\'amour', '9. Rétablir la justice et la liberté', '10. Sauver la république', '11. Sauver le monde'] }
    ],
    ex: [['Il faut sauver le soldat Ryan', "Retrouver le soldat Ryan et le ramener en vie."], ['The Full Monty', "Gagner beaucoup d'argent en dansant nus devant une salle pleine de femmes."], ['Le Verdict', "Gagner le procès."], ['Chinatown', "Trouver qui a tué Hollis et pourquoi."], ['Le Parrain', "Se venger des hommes qui ont tiré sur son père, et, par là même, protéger sa famille."], ['Top Gun', "Point d'arrivée : on sait que le héros a échoué quand le directeur remet le premier prix à quelqu'un d'autre."]] },
  { id: 'allies', n: 6, title: 'Allié(s)',
    d: "L'allié aide le héros et lui sert de porte-parole. Pensez à pourvoir l'allié de sa propre ligne de désir. Ne faites jamais de l'allié un personnage plus intéressant que le héros.",
    f: [{ k: 'allies', l: 'Allié(s)', t: 'area' }, { k: 'desirAllie', l: "Désir propre de l'allié", t: 'area' }, { k: 'intrigueSecondaire', l: 'Intrigue secondaire (facultatif)', t: 'area', h: "Elle compare la façon dont le héros et le personnage secondaire affrontent un même problème. Elle doit avoir un impact sur l'intrigue principale et passer par les sept étapes. Le personnage secondaire n'est généralement pas un allié." }],
    ex: [['Casablanca', "Carl, Sacha, Émile, Abdul et l'acolyte de Rick, Sam, le joueur de piano."], ['Tootsie', "Jeff, le colocataire de Michael, qui écrit une pièce, Retour au canal de l'amour."], ['Hamlet', "Intrigue secondaire : Laërte doit, lui aussi, venger son père."]] },
  { id: 'adversaire', n: 7, key: 3, title: 'Adversaire / mystère',
    d: "Un véritable adversaire cherche à empêcher le héros d'assouvir son désir, mais est également un concurrent du héros, qui tente d'atteindre le même objectif que lui. Le meilleur adversaire est celui qui est nécessaire : le plus à même d'attaquer la faiblesse majeure du héros.",
    f: [
      { k: 'adversaire', l: 'Adversaire principal (et autres adversaires)', t: 'area' },
      { k: 'objectifCommun', l: 'Quelle est la chose la plus importante pour laquelle ils se battent ?', t: 'area' },
      { k: 'valeurs', l: "Valeurs de l'adversaire (en quoi diffèrent-elles de celles du héros ?)", t: 'area' },
      { k: 'attaque', l: "Comment attaque-t-il la faiblesse majeure du héros ?", t: 'area' },
      { k: 'mystere', l: "Mystère : ce qui reste caché (l'adversaire iceberg)", t: 'area', h: "Créez une hiérarchie d'adversaires cachée ; divulguez les informations au compte-gouttes et à un rythme de plus en plus soutenu." }
    ],
    ex: [['Le Parrain', "Le premier adversaire est Sollozzo ; l'adversaire principal est le plus puissant Barzini, la tête pensante de Sollozzo. Ils s'affrontent au sujet de la survie de la famille Corleone et pour le contrôle du crime organisé à New York."],
         ['La Guerre des étoiles', "Luke et Dark Vador sont en compétition pour le contrôle de l'univers."],
         ['Chinatown', "Noah Cross. Les deux protagonistes se battent pour la version de la réalité que les autres croiront."],
         ['Othello', "Iago n'a rien d'un guerrier : il attaque par-derrière, à l'aide de mots et d'insinuations, la faiblesse majeure d'Othello, son inquiétude vis-à-vis de son mariage."]] },
  { id: 'fauxAllie', n: 8, title: 'Faux allié',
    d: "Un personnage qui est en apparence un allié du héros mais qui est en réalité un adversaire. Il est souvent déchiré par un dilemme : il travaille pour l'adversaire, mais finit par vouloir que le héros gagne.",
    f: [{ k: 'fauxAllie', l: 'Faux allié(s)', t: 'area' }, { k: 'dilemme', l: 'Son dilemme', t: 'area' }],
    ex: [['Casablanca', "Le capitaine Renault, sympathique avec Rick, travaille pour les nazis… puis devient un véritable allié à la toute fin."], ['Tootsie', "Sandy devient une fausse alliée quand Michael se déguise en femme pour obtenir le rôle qu'elle souhaitait."], ['Hamlet', "Ophélie, Rosencrantz et Guildenstern."]] },
  { id: 'rev1', n: 9, title: 'Premier rebondissement-révélation et décision : modification du désir et des motivations',
    d: "Le héros découvre une information nouvelle et surprenante qui le force à prendre une décision et à emprunter une nouvelle direction. Le désir modifié doit être une déviation du désir originel, pas une rupture.",
    f: [
      { k: 'revelation', l: 'Rebondissement-révélation', t: 'area' },
      { k: 'decision', l: 'Décision', t: 'area' },
      { k: 'desirModifie', l: 'Désir modifié', t: 'area' },
      { k: 'motivations', l: 'Motivations modifiées', t: 'area' }
    ],
    ex: [['Casablanca', "Ilsa se présente au bar de Rick tard dans la soirée. Décision : Rick décide de la blesser. Désir modifié : qu'Ilsa souffre autant que lui. Motivations : elle lui a brisé le cœur à Paris."], ['Tootsie', "Michael découvre qu'il a un véritable pouvoir quand « Dorothy » envoie balader Ron, le réalisateur."]] },
  { id: 'plan', n: 10, key: 4, title: 'Plan',
    d: "L'ensemble des directives, ou stratégies, que le héros suivra pour vaincre son adversaire et atteindre son objectif. Dans presque toutes les bonnes histoires, le plan initial du héros échoue.",
    f: [{ k: 'plan', l: 'Plan du héros', t: 'area' }, { k: 'adaptation', l: 'Comment le héros s\'adapte-t-il quand le plan échoue ?', t: 'area' }, { k: 'entrainement', l: 'Entraînement (facultatif — sport, guerre, cambriolage)', t: 'area' }],
    ex: [['Chinatown', "Interroger les gens qui connaissaient Hollis et rechercher les preuves matérielles du meurtre."], ['Hamlet', "Mettre en scène une pièce qui reproduira l'assassinat de son père : la réaction du roi prouvera sa culpabilité."], ['Le Parrain', "Tuer Sollozzo et son protecteur, le capitaine de police ; puis tuer en une seule fois les chefs de toutes les autres familles."]] },
  { id: 'planAdv', n: 11, title: "Plan de l'adversaire et principale contre-attaque",
    d: "L'adversaire a lui aussi un plan pour vaincre le héros. Plus le plan de votre adversaire sera complexe et mieux vous le cacherez, plus votre intrigue sera intéressante.",
    f: [{ k: 'planAdv', l: "Plan de l'adversaire", t: 'area' }, { k: 'contreAttaque', l: 'Principale contre-attaque', t: 'area' }],
    ex: [['Casablanca', "Le major Strasser fait pression sur Renault pour retenir Laszlo. Après La Marseillaise, il fait fermer le bar et pousse Renault à arrêter Laszlo."], ['Le Parrain', "Barzini utilise Sollozzo comme homme de main, soudoie Carlo pour piéger Sonny, paie le garde du corps de Michael en Sicile."]] },
  { id: 'dynamisme', n: 12, title: 'Dynamisme narratif',
    d: "La série d'actions entreprises par le héros pour vaincre l'adversaire. Votre intrigue doit se développer, et non se répéter : ne répétez pas sans cesse les mêmes temps forts.",
    f: [{ k: 'actions', l: 'Étapes du dynamisme (une action par ligne)', t: 'area', rows: 6 }],
    ex: [['Tootsie', "Michael s'achète des vêtements de femme… ment à Sandy… s'entraîne à se maquiller… improvise pour éviter d'embrasser un homme… se lie d'amitié avec Julie…"]] },
  { id: 'attaqueAllie', n: 13, title: 'Attaque par un allié',
    d: "Quand le héros se met à agir de façon immorale, l'allié devient sa conscience : « Tu t'y prends de la mauvaise façon. » Le héros tente de se justifier.",
    f: [{ k: 'critique', l: "Critique de l'allié", t: 'area' }, { k: 'justification', l: 'Justification du héros', t: 'area' }],
    ex: [['Tootsie', "Jeff demande à Michael combien de temps encore il compte mentir aux gens. Michael répond qu'il vaut mieux mentir à une femme plutôt que de la blesser en lui disant la vérité."], ['Le Parrain', "Kay reproche à Michael de travailler pour son père. Il promet que la famille sera « réglo » dans cinq ans."]] },
  { id: 'defaite', n: 14, title: 'Apparente défaite',
    d: "Le héros pense qu'il a perdu. Ce n'est pas un petit échec : c'est le point le plus bas. Votre histoire ne doit comprendre qu'une seule apparente défaite. (Si le héros meurt ou finit asservi : apparente victoire.)",
    f: [{ k: 'type', l: 'Type', t: 'select', opts: ['Apparente défaite', 'Apparente victoire (héros qui chute)'] }, { k: 'defaite', l: 'Description', t: 'area' }],
    ex: [['Casablanca', "Ivre, Rick se souvient de Paris et envoie promener Ilsa."], ['Tootsie', "George explique à Michael qu'il ne peut en aucun cas rompre le contrat."], ['Les Affranchis', "Apparente victoire : le cambriolage de la Lufthansa."]] },
  { id: 'rev2', n: 15, title: 'Deuxième rebondissement-révélation et décision : dynamique obsessionnelle, modification du désir et des motivations',
    d: "Juste après l'apparente défaite, une nouvelle information prouve que la victoire est possible. Le héros ne désire plus l'objectif : il en est obsédé.",
    f: [
      { k: 'revelation', l: 'Rebondissement-révélation', t: 'area' }, { k: 'decision', l: 'Décision', t: 'area' },
      { k: 'desirModifie', l: 'Désir modifié', t: 'area' }, { k: 'obsession', l: 'Dynamique obsessionnelle', t: 'area' }, { k: 'motivations', l: 'Motivations modifiées', t: 'area' }
    ],
    ex: [['Casablanca', "Ilsa dit à Rick qu'elle était mariée à Laszlo avant de le rencontrer. Rick a pardonné."], ['Le Parrain', "La voiture de Michael explose avec sa femme. Il est déterminé à se venger."]] },
  { id: 'revPublic', n: 16, title: 'Révélation pour le public',
    d: "Pour la première fois, le public apprend quelque chose avant le héros (souvent la véritable identité du faux allié). Cela crée une distance qui permet au public de voir la transformation du héros.",
    f: [{ k: 'revelation', l: 'Ce que le public apprend', t: 'area' }],
    ex: [['Casablanca', "Rick oblige Renault à appeler la tour de contrôle, mais le public voit que le capitaine appelle en réalité le major Strasser."], ['Le Parrain', "Le public voit Luca Brasi se faire assassiner."]] },
  { id: 'rev3', n: 17, title: 'Troisième rebondissement-révélation et décision',
    d: "Le héros découvre comment vaincre l'adversaire, souvent la véritable identité du faux allié. Cette information doit le rendre plus fort et plus sûr de lui.",
    f: [{ k: 'revelation', l: 'Rebondissement-révélation', t: 'area' }, { k: 'decision', l: 'Décision', t: 'area' }, { k: 'desirModifie', l: 'Désir modifié', t: 'area' }, { k: 'motivations', l: 'Motivations modifiées', t: 'area' }],
    ex: [['Casablanca', "Ilsa avoue à Rick qu'elle l'aime toujours. Rick décide de donner les lettres de transit à Laszlo et Ilsa."], ['Le Parrain', "Michael découvre que Tessio est passé dans l'autre camp. Il décide de frapper le premier."]] },
  { id: 'porte', n: 18, title: 'Porte étroite, fourches Caudines et rencontre avec la mort',
    d: "La pression devient presque insupportable ; l'espace se restreint. Le héros prend conscience de sa propre mortalité, ce qui l'incite à se battre davantage.",
    f: [{ k: 'porte', l: 'Porte étroite / fourches Caudines', t: 'area' }, { k: 'mort', l: 'Rencontre avec la mort', t: 'area' }],
    ex: [['Casablanca', "Rick s'efforce de gagner l'aéroport tandis que Strasser tente de les rattraper."], ['Tootsie', "Escalade de cauchemars : le bébé de Julie qui hurle, Julie qui le repousse, Les qui l'invite à danser, John, Sandy…"]] },
  { id: 'confrontation', n: 19, key: 5, title: 'Confrontation finale',
    d: "Le conflit final qui détermine qui remporte l'objectif. Le point de convergence de l'histoire, dans l'endroit le plus restreint. Le public y apprend quel ensemble de valeurs l'emporte. Elle peut être physique ou une confrontation de mots.",
    f: [{ k: 'confrontation', l: 'Confrontation finale', t: 'area' }, { k: 'lieu', l: 'Lieu (l\'espace le plus confiné)', t: 'area' }, { k: 'valeurs', l: 'Quelles valeurs l\'emportent ?', t: 'area' }],
    ex: [['L\'Odyssée', "Ulysse massacre les soupirants qui ont tourmenté son épouse et détruit sa maison."], ['Le Verdict', "Frank gagne le procès en utilisant de brillants arguments."], ['Le Parrain', "Montage alterné entre le baptême où Michael renonce à Satan et le meurtre des chefs des cinq familles."], ['Casablanca', "À l'aéroport, Rick pousse Ilsa à partir avec Laszlo et tire sur Strasser."]] },
  { id: 'priseConscience', n: 20, key: 6, title: 'Prise de conscience',
    d: "Le héros retire le masque derrière lequel il vivait et se voit tel qu'il est vraiment. Elle doit être soudaine, bouleversante, nouvelle. Ne faites pas dire au héros ce qu'il a appris : suggérez-le par ses actions.",
    grid2: true,
    f: [
      { k: 'psy', l: 'Prise de conscience psychologique', t: 'area', cls: 'psy' },
      { k: 'morale', l: 'Prise de conscience morale', t: 'area', cls: 'mor' },
      { k: 'doubleRetournement', l: 'Double retournement (facultatif) : ce que l\'adversaire apprend du héros', t: 'area', wide: true }
    ],
    ex: [['Casablanca', "Rick oublie son cynisme, retrouve son idéalisme, et sacrifie son amour pour Ilsa afin de devenir un combattant de la liberté. Double retournement : Renault devient lui aussi patriote."], ['Tootsie', "« Quand j'étais une femme, j'étais un homme plus juste avec toi que je ne l'ai jamais été avec une autre femme quand j'étais un homme. »"], ['Chinatown', "Prise de conscience négative : « En faire le moins possible. »"], ['Le Parrain', "Aucune : la prise de conscience est donnée à Kay, qui voit ce que son mari est devenu au moment où la porte se referme."]] },
  { id: 'decisionMorale', n: 21, title: 'Décision morale',
    d: "Le héros choisit entre deux façons d'agir. C'est la preuve de ce qu'il a appris. Facultatif : la révélation thématique, qui touche le public au-delà des personnages.",
    f: [{ k: 'decision', l: 'Décision morale', t: 'area' }, { k: 'revelationThematique', l: 'Révélation thématique', t: 'area', h: "Tirez l'abstrait et le général du concret et du particulier : une action ou un geste spécifique à impact symbolique." }],
    ex: [['Casablanca', "Rick donne les lettres de transit à Laszlo, pousse Ilsa à partir avec lui, et part risquer sa vie."], ['Tootsie', "Michael sacrifie son emploi et s'excuse auprès de Julie et de Les."], ['Les Saisons du cœur', "Révélation thématique : à la communion, tous les personnages, vivants et morts, boivent le vin. « La paix du Christ. »"]] },
  { id: 'equilibre', n: 22, key: 7, title: 'Nouvel équilibre',
    d: "Tout retourne à la normale et tout désir disparaît. Mais le héros est passé à un stade supérieur ou inférieur : une transformation fondamentale et immuable s'est produite en lui.",
    f: [{ k: 'sens', l: 'Le héros…', t: 'select', opts: ['', 's\'élève (ascension)', 'chute', 'ascension et chute à la fois'] }, { k: 'equilibre', l: 'Nouvel équilibre', t: 'area' }],
    ex: [['Le Silence des agneaux', "Clarice a arrêté Buffalo Bill, est devenue un excellent agent du FBI, et a apparemment vaincu les spectres de son passé."], ['Œdipe roi', "Œdipe se crève les yeux lorsqu'il apprend qu'il a tué son père et couché avec sa mère."], ['Le Parrain', "Michael s'est « élevé » à la place de Parrain, mais d'un point de vue moral, il a chuté."]] }
];
TRUBY.KEY_ORDER_TRUBY = ['priseConscience', 'faiblesse', 'desir', 'adversaire', 'plan', 'confrontation', 'equilibre'];

/* Étapes des 22 qui ne peuvent pas être barrées (3, 5, 7, 10, 19, 20, 22) */
TRUBY.MANDATORY22 = ['faiblesse', 'desir', 'adversaire', 'plan', 'confrontation', 'priseConscience', 'equilibre'];

/* ---------- Les sept étapes clefs de la structure narrative (chapitre 3) ----------
   Mêmes identifiants que les étapes correspondantes des 22, mais nomenclature et numérotation propres. */
(() => {
  const by = id => TRUBY.STEPS.find(s => s.id === id);
  const def = (id, n, title, d, keep, extraEx) => {
    const src = by(id);
    return { id, n, key: n, title, d, tech: src.tech, grid: src.grid, grid2: src.grid2,
      f: src.f.filter(f => !keep || keep.includes(f.k)), ex: (src.ex || []).concat(extraEx || []) };
  };
  TRUBY.STEPS7 = [
    def('faiblesse', 1, 'Faiblesses et besoin', "Dès le début de votre histoire, le héros doit avoir une ou plusieurs faiblesses majeures qui tendent à l'entraver. Le besoin, c'est ce que le héros doit accomplir en lui-même pour améliorer sa vie. Au début de l'histoire, votre héros ne doit pas savoir ce dont il a besoin.", null,
      [['Le Parrain', "Faiblesses : Michael est jeune, inexpérimenté, trop sûr de lui et n'a pas encore fait ses preuves. Problème : les membres d'un gang rival tirent sur le père de Michael, le chef de la famille."]]),
    def('desir', 2, 'Désir', "Le désir, c'est ce que votre héros souhaite obtenir, son objectif dans l'histoire. C'est la force conductrice de l'histoire, la ligne à laquelle tout le reste est suspendu. Ne confondez pas besoin et désir : ce sont deux étapes distinctes."),
    def('adversaire', 3, 'Adversaire', "Pensez l'adversaire de façon structurelle : un véritable adversaire cherche à empêcher le héros d'assouvir son désir, mais est également un concurrent du héros, qui tente d'atteindre le même objectif que lui. Cherchez le stade le plus profond du conflit qui les oppose.", ['adversaire', 'objectifCommun', 'valeurs', 'attaque']),
    def('plan', 4, 'Plan du héros', "Aucune action n'est possible sans plan. Le plan, c'est l'ensemble des directives, ou stratégies, que le héros suivra pour vaincre son adversaire et atteindre son objectif. Il doit pousser le héros à entreprendre plusieurs actions, mais aussi à s'adapter lorsqu'il ne fonctionne pas.", ['plan', 'adaptation']),
    def('confrontation', 5, 'Confrontation finale', "Le héros et l'adversaire s'engagent dans une confrontation singulière, chacun essayant d'atteindre l'objectif. Elle détermine lequel des deux personnages atteindra l'objectif. Elle peut être physique et violente, ou une confrontation de mots."),
    def('priseConscience', 6, 'Prise de conscience', "L'épreuve de la confrontation mène le héros à une importante prise de conscience sur la véritable nature de son être. Elle a deux aspects, psychologique et moral. Ne faites pas dire au héros ce qu'il a appris : suggérez-le par ses actions."),
    def('equilibre', 7, 'Nouvel équilibre', "Tout retourne à la normale et tout désir disparaît. Mais le héros est passé à un stade supérieur ou inférieur : une transformation fondamentale et immuable s'est produite en lui.")
  ];
})();

TRUBY.STRUCTURES = {
  '7': { title: 'Structure en 7 étapes', full: 'Les sept étapes clefs de la structure narrative', short: '7 étapes',
    use: "Pour les formes courtes : court métrage, nouvelle, sitcom, spot publicitaire. Truby : une nouvelle ou une sitcom doivent se contenter des sept étapes majeures du fait du temps limité ; même les bons spots publicitaires de trente secondes suivent ces sept étapes." },
  '22': { title: 'Structure en 22 étapes', full: 'Les vingt-deux étapes de la structure narrative', short: '22 étapes',
    use: "Pour les formes longues : un film, un épisode de série d'une heure ou un court roman compteront au minimum vingt-deux étapes. Vous pourrez barrer les étapes non nécessaires à votre histoire, sauf les étapes 3, 5, 7, 10, 19, 20 et 22." }
};

/* ---------- Personnages ---------- */
TRUBY.ROLES = ['Héros', 'Adversaire principal', 'Deuxième adversaire', 'Troisième adversaire', 'Adversaire', 'Allié', 'Faux allié', 'Faux adversaire', 'Personnage secondaire', 'Autre'];
TRUBY.ROLE_HELP = {
  'Héros': "La personne qui a le problème central et qui mène l'action dans le but de le résoudre.",
  'Adversaire principal': "Il désire la même chose que le héros. Ce n'est pas nécessairement un personnage que le héros déteste.",
  'Allié': "Il aide le héros et lui sert de porte-parole. Donnez-lui sa propre ligne de désir.",
  'Faux allié': "Il semble être l'ami du héros mais est en réalité un adversaire. Souvent déchiré par un dilemme.",
  'Faux adversaire': "En apparence il se bat contre le héros, mais il s'agit en réalité d'un allié (Hannibal Lecter).",
  'Personnage secondaire': "Il suit une piste parallèle à celle du héros et obtient un résultat différent. Généralement pas un allié."
};
TRUBY.ARCHETYPES = [
  ['', 'Aucun', '', ''],
  ['roi', 'Le roi ou le père', "Régit sa famille ou son peuple avec sagesse, perspicacité et détermination.", "Peut forcer les siens à se plier à des règles strictes et oppressives, se couper du champ émotionnel, ou les forcer à ne vivre que pour son plaisir."],
  ['reine', 'La reine ou la mère', "Tisse un cocon d'attention et de protection.", "Son besoin de protéger et de contrôler peut devenir tyrannique ; culpabilité, honte."],
  ['mentor', 'Le vieillard sage, le mentor ou le professeur', "Transmet sa sagesse et son savoir.", "Peut obliger ses disciples à penser d'une certaine manière ou faire sa propre apologie."],
  ['guerrier', 'Le guerrier', "Est le champion physique du bien.", "Peut vivre selon le principe « Tuer ou être tué » et devenir le champion du mal."],
  ['magicien', 'Le magicien ou le shaman', "Rend visible la réalité profonde et contrôle les forces cachées de la nature.", "Peut manipuler la réalité profonde pour asservir les autres."],
  ['ruse', 'Le rusé (Trickster)', "Utilise la ruse, la confiance et le pouvoir des mots pour parvenir à ses fins.", "Peut devenir un menteur compulsif qui ne s'intéresse qu'à lui-même."],
  ['artiste', "L'artiste ou le clown", "Définit l'excellence ou montre ce qui ne fonctionne pas.", "Peut devenir un fasciste de la perfection, ou ne plus accorder de valeur à rien."],
  ['amoureux', "L'amoureux", "Procure l'attention, la compréhension et la sensualité.", "Peut se perdre dans l'autre ou le forcer à rester dans l'ombre."],
  ['rebelle', 'Le rebelle', "A le courage de se détacher de la masse pour lutter contre un système oppressif.", "Ne procure souvent pas de meilleure alternative et se contente de détruire."]
];
TRUBY.CHAR_FIELDS = [
  { k: 'desir', l: 'Désir', ph: "Ce qu'il veut dans l'histoire", ex: [['Blanche (Un tramway nommé Désir)', "Se marier avec Mitch afin de se sentir en sécurité."], ['Stanley', "Chasser Blanche de sa maison, puis empêcher Mitch de l'épouser."]] },
  { k: 'valeurs', l: 'Valeurs (versions positives / négatives)', ph: "Ce en quoi il croit…", h: "Ne vous limitez pas à une seule valeur. Recherchez les versions positives et négatives : détermination / agressivité ; honnêteté / insensibilité ; patriotisme / autoritarisme.",
    ex: [['Blanche', 'Beauté, apparences, bonnes manières, raffinement, bonté, Stella.'], ['Stanley', 'Force, pouvoir, femmes, sexe, Stella, ses amis.'], ['Lopakhine (La Cerisaie)', 'Argent, statut social, pouvoir, avenir.']] },
  { k: 'pouvoir', l: 'Pouvoir, statut social et compétences', ex: [['Stanley', "Le meneur de son cercle d'amis, très doué pour obtenir ce qu'il souhaite."], ['Mitch', 'Peu de pouvoir ; un suiveur-né.']] },
  { k: 'approche', l: 'Approche du problème moral central (variation sur le thème)', h: "Chaque personnage affronte le même problème moral de façon différente.",
    ex: [['Tootsie — Ron', "Ment à Julie, la trompe, puis se justifie en disant qu'il lui aurait fait encore plus de mal en lui disant la vérité."], ['Tootsie — Sandy', "A une si piètre opinion d'elle-même que lorsque Michael lui ment, c'est elle qui s'en excuse."], ['Un tramway — Stella', "Pèche par omission."]] },
  { k: 'justification', l: 'Problème moral et justification', ex: [['Stanley', "Il pense que Blanche est une prostituée qui a cherché à le berner ; il pense bien faire en protégeant son ami Mitch."], ['Blanche', "Elle pense que ses mensonges ne blessent personne et qu'ils sont son unique chance de bonheur."]] },
  { k: 'attaque', l: 'Comment attaque-t-il la faiblesse majeure du héros ?', h: "Chaque adversaire doit utiliser une façon différente d'attaquer la faiblesse majeure du héros.", ex: [['Stanley', "Se montre violemment agressif lorsqu'il cherche à forcer Blanche à affronter la « vérité »."], ['Mitch', "En s'intéressant à Blanche, puis en reculant, il anéantit ses derniers espoirs."]] },
  { k: 'similarites', l: 'Similarités avec le héros (le double)', ex: [['Stanley et Blanche', "Ils ont en commun une compréhension profonde du monde ; tous deux sont très doués pour les calculs."]] },
  { k: 'spectre', l: 'Spectre (événement du passé qui le hante)' },
  { k: 'transformation', l: 'Transformation (faiblesses → transformation)', ex: [['Blanche', "Solitude, faux espoirs, bravades, mensonges → folie, désespoir, finit brisée."]] },
  { k: 'notes', l: 'Notes libres' }
];
TRUBY.HERO_CHECKS = [
  ['fascinant', 'Il doit toujours être fascinant', "Le rendre mystérieux : il cache quelque chose."],
  ['identification', "Le public doit s'identifier à lui, mais pas trop", "Le public s'identifie au désir et au problème moral."],
  ['empathie', "Empathie plutôt que sympathie", "Expliquez toujours pourquoi votre héros agit comme il le fait."],
  ['besoins', 'Il a un besoin moral et un besoin psychologique', '']
];
TRUBY.TRANSFO_TYPES = ['', "D'enfant à adulte", "D'adulte à leader", 'De cynique à engagé', 'De leader à tyran', 'De leader à visionnaire', 'La métamorphose', 'Autre'];

TRUBY.PERSO_GLOBAL = [
  { k: 'problemeMoral', l: 'Problème moral central', t: 'area', h: "Le problème moral qui est au cœur de la prémisse. Déployez-en les diverses possibilités à travers l'opposition.",
    ex: [['Un tramway nommé Désir', "Une personne peut-elle utiliser le mensonge et l'illusion pour obtenir l'amour ?"], ['The Dark Knight', "Jusqu'où iriez-vous pour combattre le crime et rétablir la justice ?"], ['Tootsie', "La façon dont un homme doit se comporter envers les femmes."]] },
  { k: 'transfoType', l: 'Type de transformation du héros', t: 'select', opts: TRUBY.TRANSFO_TYPES },
  { k: 'croyancesDebut', l: 'Croyances du héros au début', t: 'area', h: "Une véritable transformation de personnage suppose une remise en question et une modification de ses croyances élémentaires, qui conduisent le héros à adopter un nouveau comportement moral." },
  { k: 'croyancesFin', l: 'Croyances du héros à la fin', t: 'area', ex: [['Blanche', "Blanche cesse de croire qu'elle doit berner les hommes à l'aide de mensonges pour se faire aimer."]] },
  { k: 'preparation', l: 'Préparation de la prise de conscience', t: 'area', h: "Le héros doit être doué de raison ; il doit se cacher quelque chose à lui-même ; ce mensonge doit le blesser au plus profond de son être." },
  { k: 'doubleRetournement', l: 'Double retournement', t: 'area', h: "Le héros apprend quelque chose de l'adversaire et l'adversaire apprend quelque chose du héros. Votre point de vue moral = le meilleur de ce que les deux auront appris." }
];

/* ---------- Débat moral ---------- */
TRUBY.DEBAT = [
  { group: 'La ligne thématique', fields: [
    { k: 'ligneThematique', l: 'Ligne thématique (votre point de vue moral en une phrase)', t: 'area', big: true, ref: 'premisse.principe',
      h: "Transformez votre principe directeur en ligne thématique : réfléchissez aux conséquences morales des actions de l'histoire.",
      ex: [['Casablanca', 'Même le plus grand des amours doit être sacrifié dans le combat contre l\'oppression.'], ['La Vie est belle', "La richesse d'un homme ne se mesure pas à l'argent qu'il gagne mais aux amis et aux membres de sa famille qui l'aiment."], ['Citizen Kane', 'Les gens qui essaient d\'obliger les autres à les aimer finissent seuls.'], ['Un chant de Noël', 'On est plus heureux quand on donne aux autres.']] },
    { k: 'techniques', l: 'Techniques pour la ligne thématique (voyage, grand symbole unique, deux symboles…)', t: 'area', ex: [['Pour qui sonne le glas', "Le symbole de l'homme qui ne vit pas sur une île mais en communauté."], ['King Kong', "Le passage de Manhattan Island à Skull Island, puis le retour."]] },
    { k: 'choixMoral', l: 'Choix moral déterminant (vers la fin)', t: 'area', ref: 'premisse.choixMoral', ex: [['Casablanca', 'Rick doit choisir entre rester avec la femme qu\'il aime et combattre la dictature dans le monde.']] },
    { k: 'problemeMoral', l: 'Problème moral central', t: 'area', ref: 'persoGlobal.problemeMoral', ex: [['Casablanca', 'Quel équilibre trouver entre désirs personnels et sacrifice pour le bien de l\'ensemble de la société ?']] },
    { k: 'type', l: 'Forme de débat moral', t: 'select', opts: ['', 'Stratégie de base', 'Le bien contre le mal', 'La tragédie', 'Le pathos', 'La satire et l\'ironie', 'La comédie noire', 'Combinaison de plusieurs formes', 'Point de vue moral unique'] }
  ]},
  { group: 'Débat moral : la séquence via la structure', note: "Détaillez le débat moral que vous allez élaborer via la structure de l'histoire.", fields: [
    { k: 'croyances', l: 'Croyances et valeurs du héros', t: 'area', ex: [['Le Verdict', "Au début Frank accorde de la valeur à l'alcool, à l'argent et à l'opportunisme."], ['Casablanca', 'Moi, honnêteté, ses amis.']] },
    { k: 'faiblesseMorale', l: 'Faiblesse morale', t: 'area', cls: 'mor', ref: 'structure.data.faiblesse.faiblesseMorale', ex: [['Casablanca', 'Cynisme, égoïsme, cruauté.']] },
    { k: 'besoinMoral', l: 'Besoin moral', t: 'area', cls: 'mor', ref: 'structure.data.faiblesse.besoinMoral', ex: [['Casablanca', 'Cesser de ne s\'intéresser qu\'à soi-même aux dépens des autres. Réintégrer la société.']] },
    { k: 'premiereAction', l: 'Première action immorale', t: 'area', h: "Elle doit découler de la faiblesse morale majeure du héros.", ex: [['Le Verdict', "Frank s'incruste à des funérailles en prétendant être un ami du défunt."], ['Casablanca', "Rick accepte les lettres de transit d'Ugarte bien qu'il les soupçonne de provenir des messagers assassinés."]] },
    { k: 'desir', l: 'Désir', t: 'area', ref: 'structure.data.desir.desir' },
    { k: 'dynamisme', l: 'Dynamisme narratif (actions pour atteindre l\'objectif)', t: 'area' }
  ]},
  { group: 'Actions immorales, critiques et justifications', list: 'actions', itemFields: [
    { k: 'action', l: 'Action immorale' }, { k: 'critique', l: 'Critique' }, { k: 'justification', l: 'Justification' }
  ], ex: [['Casablanca', "Action : Rick refuse d'aider Ugarte. Critique : « J'espère que vous ne serez pas dans les parages si les Allemands viennent vous trouver. » Justification : « Je ne risque ma peau pour personne. »"]] },
  { group: 'Vers la fin', fields: [
    { k: 'attaqueAllie', l: 'Attaque par un allié (et justification du héros)', t: 'area', ref: 'structure.data.attaqueAllie.critique' },
    { k: 'obsession', l: 'Dynamique obsessionnelle', t: 'area', h: "À quel moment votre héros décide-t-il qu'il est prêt à presque tout pour gagner ?" },
    { k: 'confrontation', l: 'Confrontation : quel ensemble de valeurs est supérieur ?', t: 'area' },
    { k: 'actionFinale', l: "Action finale contre l'adversaire", t: 'area' },
    { k: 'priseConscienceMorale', l: 'Prise de conscience morale', t: 'area', cls: 'mor', ref: 'structure.data.priseConscience.morale' },
    { k: 'decisionMorale', l: 'Décision morale', t: 'area', ref: 'structure.data.decisionMorale.decision' },
    { k: 'revelationThematique', l: 'Révélation thématique', t: 'area', ex: [['Casablanca', "Le changement surprise de Renault engendre une révélation thématique : tout le monde doit jouer un rôle dans la lutte contre le fascisme."]] }
  ]}
];

/* ---------- Univers du récit ---------- */
TRUBY.NATURAL = [
  ['ocean', "L'océan", "Surface : compétition, jeu pour la survie. Profondeurs : utopie flottante ou tombeau terrifiant."],
  ['espace', "L'espace", "Aventures sans fin, distinctions humaines fondamentales."],
  ['foret', 'La forêt', "Cathédrale naturelle, lieu contemplatif et des amoureux ; mais aussi lieu où l'on se perd."],
  ['jungle', 'La jungle', "L'état de nature ; suffocation ; supériorité de la nature sur l'homme."],
  ['desert', 'Le désert et la glace', "Agonie et mort ; isolement qui endurcit."],
  ['ile', "L'île", "Laboratoire du genre humain, utopie ou dystopie."],
  ['montagne', 'La montagne', "Grandeur, prise de conscience ; ou hiérarchie et tyrannie. En opposition avec la plaine."],
  ['plaine', 'La plaine', "Égalité, liberté ; ou médiocrité du troupeau."],
  ['riviere', 'La rivière', "Un chemin qui mène à quelque chose ou en éloigne : passage physique, moral et émotionnel."]
];
TRUBY.UNIVERS = [
  { group: "L'univers en une phrase", fields: [
    { k: 'phrase', l: "Univers du récit résumé en une phrase", t: 'area', big: true, ref: 'premisse.principe',
      ex: [['Moïse', "Un homme guide son peuple à travers un monde sauvage jusqu'à ce que la vérité lui soit révélée au sommet d'une montagne."], ['Ulysse', "Une ville, où pendant vingt-quatre heures, chacune de ses parties est la version moderne d'un obstacle mythique."], ['Les « Harry Potter »', "Une école de sorciers dans un château médiéval géant et magique."], ['La Vie est belle', "Deux versions différentes de la même petite ville d'Amérique."]] },
    { k: 'arene', l: "Arène globale", t: 'select', opts: ['', 'Créer un espace général, puis alterner et condenser', 'Périple dans une zone uniforme, selon une ligne unique', 'Périple circulaire dans une zone unifiée', 'Sortir le héros de son élément'] },
    { k: 'areneDesc', l: "Description de l'arène (et du mur qui la sépare du reste)", t: 'area' }
  ]},
  { group: 'Oppositions', fields: [
    { k: 'oppositions', l: 'Oppositions de valeurs → oppositions visuelles', t: 'area', rows: 4, h: "Revenez au réseau de personnages et à leurs conflits de valeurs ; trouvez trois ou quatre oppositions visuelles centrales.",
      ex: [['Boulevard du crépuscule', "L'appartement exigu de Joe vs la villa décrépie de Norma ; Los Angeles ensoleillée vs sombre maison gothique ; jeunesse vs vieillesse."], ['La Vie est belle', 'Pottersville (tyrannie, cupidité) vs Bedford Falls (démocratie, honnêteté, bonté).']] },
    { k: 'tpt', l: 'Territoire, populations et technologie', t: 'area', h: "La combinaison unique de ces trois éléments définit la nature de votre monde." },
    { k: 'systeme', l: 'Système (règles, hiérarchie, place du héros)', t: 'area' }
  ]},
  { group: 'Cadres naturels', natural: true, fields: [
    { k: 'naturelDesc', l: 'Comment ces cadres expriment-ils vos personnages ?', t: 'area', h: "Ne choisissez jamais le cadre naturel au hasard. Attention aux clichés visuels." },
    { k: 'meteo', l: 'Conditions atmosphériques', t: 'area', h: "Éclairs : passion, terreur, mort. Pluie : tristesse, ennui, confort. Vent : désolation. Brouillard : mystère. Soleil : gaieté, ou corruption cachée. Neige : sérénité, mort. Évitez les corrélations prévisibles." }
  ]},
  { group: "Espaces créés par l'homme", fields: [
    { k: 'maison', l: 'La maison (chaleureuse / terrifiante, cave / grenier)', t: 'area', ex: [['Casablanca', "Le Rick's Café Américain : à la fois dystopie et utopie, une grande maison chaleureuse pleine de coins et de recoins."], ['Les Grandes Espérances', "Miss Havisham, esclave de sa villa délabrée."]] },
    { k: 'chemin', l: 'Le chemin et le véhicule', t: 'area', h: "Plus le véhicule sera grand, plus l'arène paraîtra unifiée." },
    { k: 'ville', l: 'La ville (institution, montagne, océan, jungle, forêt)', t: 'area' },
    { k: 'miniatures', l: 'Miniatures', t: 'area', ex: [['Citizen Kane', "Le presse-papier, le reportage, Xanadu."], ['Shining', "La maquette du labyrinthe."]] },
    { k: 'taille', l: 'Taille des personnages (rétrécir / agrandir)', t: 'area' },
    { k: 'passages', l: 'Passages entre les mondes', t: 'area', ex: [['Alice au pays des merveilles', 'Le terrier de lapin, le miroir.'], ['Harry Potter', 'Le quai 9 ¾.']] },
    { k: 'technologie', l: 'Technologie (outils)', t: 'area' }
  ]},
  { group: 'Développement du monde et temps', fields: [
    { k: 'transfoMonde', l: 'Transformation du héros / du monde', t: 'select', opts: ['', "De l'asservissement à la liberté (en passant par un asservissement pire encore)", "De l'asservissement à la mort ou à un asservissement pire encore", "Héros vers la mort, monde vers la liberté (sacrifice)", "Liberté temporaire puis mort / asservissement", "De la liberté à l'asservissement ou à la mort", "De la liberté à la liberté en passant par l'asservissement", "D'une apparente liberté à une véritable liberté", 'Pas de transformation'] },
    { k: 'saisons', l: 'Saisons', t: 'area' },
    { k: 'fetes', l: 'Fêtes et rituels (philosophie soutenue ou rejetée)', t: 'area' },
    { k: 'temps', l: 'Temps naturel (jour unique, jour parfait, compte à rebours)', t: 'area' }
  ]},
  { group: 'Les sept étapes visuelles', note: "Rattachez un sous-monde unique aux étapes structurelles clefs.", fields: [
    { k: 'v_faiblesse', l: 'Faiblesse et besoin (sous-monde de la faiblesse)', t: 'area', cls: 'psy' },
    { k: 'v_desir', l: 'Désir', t: 'area' },
    { k: 'v_adversaire', l: "Adversaire (son sous-monde : version extrême du monde d'asservissement)", t: 'area' },
    { k: 'v_defaite', l: 'Apparente défaite / liberté temporaire', t: 'area' },
    { k: 'v_mort', l: 'Rencontre avec la mort', t: 'area' },
    { k: 'v_confrontation', l: "Confrontation finale (l'espace le plus confiné)", t: 'area' },
    { k: 'v_liberte', l: 'Liberté ou asservissement', t: 'area' }
  ], ex: [['La Guerre des étoiles', "Paysage désertique (faiblesse) → hologramme (désir) → l'Étoile Noire (adversaire) → broyeur de déchets (défaite et mort) → la tranchée (confrontation) → le hall des héros (liberté)."]] }
];

/* ---------- Réseau de symboles ---------- */
TRUBY.SYMBOLES = [
  { group: "Symbole de l'histoire", fields: [
    { k: 'histoire', l: "Symbole de l'histoire", t: 'area', ex: [['La Lettre écarlate', "Le A écarlate : d'abord l'immoralité d'un amour, puis une moralité fondée sur l'amour véritable."], ['Au cœur des ténèbres', "Le fin fond de la jungle."], ['Huckleberry Finn', "Le radeau : sur cette fragile île flottante, un garçon blanc et un esclave noir vivent comme des égaux."]] },
    { k: 'phrase', l: 'Phrase symbolique (relie tous les symboles du réseau)', t: 'area', big: true, ref: 'univers.phrase', ex: [['Quatre mariages et un enterrement', "Le mariage vs l'enterrement."], ['Long voyage vers la nuit', 'Des ténèbres grandissantes vers la petite lumière au cœur de la nuit.'], ['Copenhague', "Le principe d'incertitude."]] }
  ]},
  { group: 'Personnages symboliques', persos: true },
  { group: 'Thème, monde et actions', fields: [
    { k: 'transformation', l: 'Symbole connecté à la transformation du héros', t: 'area', ex: [['Le Parrain', "Le diable : le pacte faustien de la première scène, puis « Renoncez-vous à Satan ? » au baptême, au moment où Michael devient Satan."]] },
    { k: 'theme', l: 'Thème symbolique', t: 'area', ex: [['Gatsby le magnifique', "La lumière verte, le panneau publicitaire devant la décharge, le « sein vert et frais d'un monde nouveau »."]] },
    { k: 'monde', l: 'Monde symbolique', t: 'area', ex: [['Éclair de lune', "La lune, manifestation physique du destin."], ['Cinema Paradiso', 'Le cinéma, cocon de la communauté.']] },
    { k: 'actions', l: 'Actions symboliques', t: 'area', ex: [['Witness', "En participant à la construction d'une grange, John signale sa volonté de quitter le monde violent."], ['Le Conte de deux cités', "Sydney Carton se sacrifie comme le Christ."]] }
  ]},
  { group: 'Objets symboliques et leur développement', list: 'objets', itemFields: [
    { k: 'objet', l: 'Objet / symbole' }, { k: 'sens', l: 'À quoi il fait référence' }, { k: 'occurrences', l: 'Apparitions et modifications' }
  ], ex: [["L'Odyssée", "Hache, mât, rame, arc (objets mâles du bon chemin) vs l'arbre qui soutient le lit conjugal (l'arbre de vie)."], ['Western', "Le six-coups, le chapeau blanc / noir, le badge en étoile, la clôture."]] }
];
TRUBY.SYMBOL_TYPES = ['', 'Divin', 'Animal', 'Mécanique', 'Nom symbolique', 'Autre'];

/* ---------- Intrigue ---------- */
TRUBY.INTRIGUE = [
  { group: "Stratégie d'intrigue", fields: [
    { k: 'type', l: "Type d'intrigue", t: 'select', opts: ['', "L'intrigue périple", "L'intrigue à trois unités", "L'intrigue à rebondissements", "L'anti-intrigue", "L'intrigue de genre", "L'intrigue à fils conducteurs multiples", 'Combinaison'] },
    { k: 'principe', l: "Comment l'intrigue exprime le principe directeur et la ligne thématique", t: 'area', ref: 'premisse.principe' },
    { k: 'genres', l: 'Genre(s) et temps forts du genre à transcender', t: 'area', h: "Douze genres majeurs : action, comédie, suspense, policier, fantasy, épouvante, amour, « chef-d'œuvre », mémoires / histoire vraie, mythe, science-fiction, thriller. Mélangez des genres inattendus ; transcendez le genre en remodelant chaque temps fort." },
    { k: 'planAdv', l: "Plan de l'adversaire (commencez par lui)", t: 'area', ref: 'structure.data.planAdv.planAdv', h: "Pour déterminer la « vaste » intrigue de l'histoire, commencez par déterminer le plan de l'adversaire." },
    { k: 'attaques', l: 'Séquence attaques / contre-attaques', t: 'area', rows: 5, h: "Assurez-vous que les attaques de l'adversaire surviennent en réaction aux actions du héros, et vice versa." },
    { k: 'reversibles', l: 'Personnages réversibles (faux alliés, faux adversaires)', t: 'area' }
  ]},
  { group: 'Le narrateur', fields: [
    { k: 'narrateur', l: 'Utiliser un narrateur ?', t: 'select', rerender: true, h: "Répondez d'abord : les questions sur le narrateur n'apparaissent que si votre histoire en a un.", opts: ['', 'Non (narrateur omniscient non identifiable)', 'Oui, à la première personne', 'Oui, à la troisième personne', 'Plusieurs narrateurs'] },
    { k: 'narrSituation', showIf: o => /^(Oui|Plusieurs)/.test(o.narrateur || ''), l: 'Situation dramatique dans laquelle il est introduit', t: 'area' },
    { k: 'narrRaison', showIf: o => /^(Oui|Plusieurs)/.test(o.narrateur || ''), l: 'Pourquoi raconte-t-il l\'histoire, maintenant ?', t: 'area' },
    { k: 'narrFaiblesse', showIf: o => /^(Oui|Plusieurs)/.test(o.narrateur || ''), l: 'Sa faiblesse (il ne doit pas être omniscient)', t: 'area' },
    { k: 'narrStructure', showIf: o => /^(Oui|Plusieurs)/.test(o.narrateur || ''), l: 'Structure originale du récit / fermeture du cadre', t: 'area' },
    { k: 'narrPrise', showIf: o => /^(Oui|Plusieurs)/.test(o.narrateur || ''), l: 'Prise de conscience et décision produites par l\'acte de raconter', t: 'area' }
  ]},
  { group: 'Séquence de rebondissements-révélations', reveals: true }
];
TRUBY.REVEAL_CHECKS = [
  ['logique', 'La séquence paraît logique'],
  ['intensite', "Chaque rebondissement est plus intense que celui qui l'a précédé"],
  ['desir', 'Chacun pousse le héros à modifier son désir originel'],
  ['rythme', "Les rebondissements se succèdent à un rythme de plus en plus rapide vers la fin"]
];

/* ---------- Construction des scènes (chapitre 10) ---------- */
TRUBY.SCENE_BUILD = [
  { k: 'arc', l: "Position dans l'arc du personnage" },
  { k: 'problemes', l: 'Problèmes à résoudre / objectifs' },
  { k: 'strategie', l: 'Stratégie' },
  { k: 'desir', l: 'Désir (quel personnage mène la scène ?)' },
  { k: 'aboutissement', l: 'Aboutissement (mot ou phrase clef en dernier)' },
  { k: 'adversaire', l: 'Adversaire' },
  { k: 'plan', l: 'Plan (direct ou indirect)' },
  { k: 'conflit', l: 'Conflit (jusqu\'à la rupture ou l\'apaisement)' },
  { k: 'rebondissement', l: 'Rebondissement ou révélation' },
  { k: 'valeurs', l: 'Débat moral et valeurs' },
  { k: 'motsClefs', l: 'Mots clefs (piste 3)' }
];

TRUBY.SCRIPT_TYPES = [
  { t: 'scene', l: 'Intitulé de scène', key: '1' },
  { t: 'action', l: 'Action / didascalie', key: '2' },
  { t: 'character', l: 'Personnage', key: '3' },
  { t: 'paren', l: 'Didascalie de jeu', key: '4' },
  { t: 'dialogue', l: 'Dialogue', key: '5' },
  { t: 'transition', l: 'Transition', key: '6' },
  { t: 'shot', l: 'Plan', key: '7' },
  { t: 'note', l: 'Note (non exportée)', key: '8' }
];
TRUBY.MOMENTS = ['JOUR', 'NUIT', 'AUBE', 'CRÉPUSCULE', 'MATIN', 'SOIR', 'PLUS TARD', 'CONTINU'];
TRUBY.FIL_COLORS = ['#3b6fd8', '#c2410c', '#15803d', '#9333ea', '#b45309', '#0e7490', '#be123c', '#4d7c0f'];

window.TRUBY = TRUBY;
