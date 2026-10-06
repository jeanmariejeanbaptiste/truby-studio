/* =====================================================================
   TRUBY STUDIO — Projet d'exemple : Casablanca, décortiqué par Truby
   (toutes les analyses viennent de « L'Anatomie du scénario »)
   ===================================================================== */
'use strict';

const Sample = (() => {
  function make(newProject) {
    const p = newProject('Exemple — Casablanca', 'Analyse selon John Truby');
    const id = () => App.uid();
    const ch = (name, role, archetype, o) => Object.assign({ id: id(), name, role, archetype }, o);
    const rick = ch('Rick', 'Héros', 'rebelle', {
      faiblessePsy: "Cynique, passif, amer ; il a perdu ses illusions et se considère comme un homme mort.",
      faiblesseMorale: "Égoïste et cruel : il ne s'intéresse qu'à lui-même aux dépens des autres (il refuse d'aider Ugarte).",
      besoinPsy: "Surmonter son amertume vis-à-vis d'Ilsa, retrouver une raison de vivre et renouveler sa foi en ses idéaux.",
      besoinMoral: "Cesser de ne s'intéresser qu'à lui-même aux dépens des autres ; réintégrer la société et devenir un leader du combat contre le fascisme.",
      desir: 'Récupérer Ilsa.', valeurs: 'Moi, honnêteté, ses amis.', pouvoir: "Roi de son bar, le Rick's Café Américain, entouré de sa cour.",
      approche: "Pendant la plus grande partie de l'histoire, Rick ne se soucie que de lui-même, ne s'intéresse pas aux problèmes du monde.",
      spectre: "Il s'est battu contre les fascistes en Espagne ; il est hanté par le souvenir d'Ilsa, qui l'a quitté à Paris.",
      transformation: 'De cynique à engagé.'
    });
    const ilsa = ch('Ilsa', 'Adversaire principal', 'amoureux', { desir: 'Obtenir les lettres de transit pour que Laszlo puisse fuir.', valeurs: 'Loyauté envers son mari, amour pour Rick, combat contre les nazis.', approche: "Ilsa essaie de bien faire mais, au bout du compte, l'amour est trop fort pour elle.", attaque: "Elle ravive la blessure de Paris et lui reproche de ne plus être l'homme qu'elle a connu." });
    const laszlo = ch('Laszlo', 'Deuxième adversaire', 'guerrier', { valeurs: "Combat contre les nazis, amour pour Ilsa, amour pour le genre humain.", approche: "Laszlo est prêt à sacrifier n'importe quoi, y compris son amour, pour mener le combat contre le fascisme." });
    const renault = ch('Renault', 'Faux allié', 'ruse', { valeurs: 'Femmes, argent, pouvoir.', approche: "Un véritable opportuniste qui ne s'intéresse qu'à lui-même et à l'argent.", transformation: "Double retournement : il rejoint Rick dans son combat." });
    const strasser = ch('Strasser', 'Troisième adversaire', 'guerrier', { desir: 'Retenir Laszlo à Casablanca.' });
    const sam = ch('Sam', 'Allié', 'artiste', { desir: 'Protéger Rick.', approche: "Il conseille à Rick d'arrêter de s'accrocher à son amour perdu." });
    p.characters = [rick, ilsa, laszlo, renault, strasser, sam];
    p.premisse = {
      check: { outsider: true, desir: true, adversaire: true }, souhaitsL: [], premissesL: [],
      premisse: "Un expatrié américain endurci retrouve un ancien amour, qu'il finit par abandonner pour aller combattre les nazis.",
      principe: "Un ancien combattant de la liberté marginalisé retrouve un amour perdu mais choisit de reprendre le combat quand cet amour revient vers lui.",
      conflit: "Rick se bat contre Ilsa, Laszlo et Strasser pour Ilsa et pour les lettres de transit.",
      action: 'Rick cherche à récupérer Ilsa, puis choisit de l\'aider à fuir avec Laszlo.',
      F: 'Cynique, passif, égoïste, amer.', A: 'Reconquérir Ilsa (et disposer des lettres de transit).', T: 'Combattant de la liberté, idéaliste retrouvé.',
      choixMoral: "Rick doit choisir entre rester avec la femme qu'il aime et combattre la dictature dans le monde."
    };
    p.structure.mode = '22';
    p.structure.data = {
      cadre: { priseConscience: "Rick comprend qu'il ne peut pas se retirer du combat pour la liberté à cause d'une peine de cœur.", desir: 'Récupérer Ilsa.', erreur: "Rick se considère comme un homme mort, immobile. Il ne s'intéresse plus aux affaires du monde." },
      spectre: { spectre: "Rick a combattu en Espagne et vendu des armes aux Éthiopiens ; il est hanté par le souvenir d'Ilsa, qui l'a quitté à Paris.", univers: "Casablanca, monde de limbes où tous attendent un visa de sortie ; le Rick's Café Américain, à la fois dystopie et utopie." },
      faiblesse: { faiblessePsy: rick.faiblessePsy, faiblesseMorale: rick.faiblesseMorale, besoinPsy: rick.besoinPsy, besoinMoral: rick.besoinMoral, probleme: "Rick est enfermé à Casablanca et enfermé dans son monde d'amertume." },
      declencheur: { evenement: 'Ilsa et Laszlo viennent trouver Rick.' },
      desir: { desir: 'Récupérer Ilsa.', pointArrivee: "À l'aéroport : Ilsa part-elle avec Rick ou avec Laszlo ?", degre: "8. Gagner l'amour" },
      allies: { allies: 'Carl, Sacha, Émile, Abdul et Sam, le joueur de piano.' },
      adversaire: { adversaire: "Ilsa (l'être aimé), puis Laszlo, l'autre prétendant ; Strasser et les nazis.", objectifCommun: 'Ilsa, et les lettres de transit.' },
      fauxAllie: { fauxAllie: "Le capitaine Renault, sympathique avec Rick, mais qui se protège en travaillant pour les nazis." },
      rev1: { revelation: 'Ilsa se présente au bar de Rick tard dans la soirée.', decision: 'Rick décide de la blesser au plus profond de son être.', desirModifie: "Qu'Ilsa souffre autant que lui.", motivations: 'Elle le mérite car elle lui a brisé le cœur à Paris.' },
      plan: { plan: "Rick sait qu'Ilsa reviendra à lui ; plus tard, il utilise les lettres d'Ugarte pour aider Ilsa et Laszlo à s'échapper." },
      defaite: { type: 'Apparente défaite', defaite: "Ivre, Rick se souvient de Paris et envoie promener Ilsa." },
      rev2: { revelation: "Ilsa dit à Rick qu'elle était mariée à Laszlo avant de le rencontrer.", motivations: 'Rick a pardonné à Ilsa.' },
      revPublic: { revelation: 'Rick oblige Renault à appeler la tour de contrôle, mais le public voit que le capitaine appelle en réalité le major Strasser.' },
      rev3: { revelation: "Ilsa vient demander les lettres et avoue à Rick qu'elle l'aime toujours.", decision: 'Rick décide de donner les lettres à Laszlo et Ilsa, mais le cache.' },
      confrontation: { confrontation: "À l'aéroport, Rick braque une arme sur Renault, dit à Ilsa de partir avec Laszlo et tire sur Strasser.", lieu: "La piste de l'aéroport, dans le brouillard." },
      priseConscience: { psy: "Rick renoue avec son idéalisme.", morale: "Il doit se sacrifier pour sauver Ilsa et Laszlo et rejoindre le combat pour la liberté.", doubleRetournement: 'Renault annonce qu\'il est lui aussi devenu patriote.' },
      decisionMorale: { decision: "Rick donne les lettres de transit à Laszlo et pousse Ilsa à partir avec lui.", revelationThematique: 'Tout le monde doit jouer un rôle dans la lutte contre le fascisme.' },
      equilibre: { sens: "s'élève (ascension)", equilibre: 'Rick a retrouvé son idéalisme et sacrifié son amour pour une cause plus noble.' }
    };
    p.persoGlobal = { heroChecks: { fascinant: true, besoins: true }, coins: { tl: rick.id, tr: ilsa.id, bl: laszlo.id, br: renault.id }, problemeMoral: "Quel équilibre trouver entre désirs personnels et sacrifice pour le bien de l'ensemble de la société ?", transfoType: 'De cynique à engagé' };
    p.debat = { actions: [{ id: id(), action: "Rick refuse d'aider Ugarte à échapper à la police.", critique: "« J'espère que vous ne serez pas dans les parages si les Allemands viennent vous trouver. »", justification: '« Je ne risque ma peau pour personne. »' }], variations: {},
      ligneThematique: "Même le plus grand des amours doit être sacrifié dans le combat contre l'oppression.", type: 'Stratégie de base',
      croyances: 'Moi, honnêteté, ses amis.', premiereAction: "Rick accepte les lettres de transit d'Ugarte bien qu'il les soupçonne de provenir des messagers assassinés.", revelationThematique: 'Tout le monde doit jouer un rôle dans la lutte contre le fascisme.' };
    p.univers = { nat: { desert: true }, phrase: "Casablanca, ville d'attente aux confins du désert, et le bar de Rick, royaume nocturne dont il est le roi.", arene: 'Créer un espace général, puis alterner et condenser', maison: "Le Rick's Café Américain : une grande maison chaleureuse pleine de coins et de recoins, mais aussi un lieu vénal." };
    p.symboles = { objets: [{ id: id(), objet: 'Les lettres de transit', sens: 'La liberté, la fuite', occurrences: 'Cachées dans le piano de Sam, puis données à Laszlo.' }], persos: {}, histoire: 'Les lettres de transit.' };
    const fil = p.fils[0].id;
    const sc = (ie, lieu, moment, action, step, persos, blocks) => ({ id: id(), ie, lieu, moment, action, step, fil, persos, notes: '', build: {}, blocks: blocks.length ? blocks : undefined });
    const b = (t, h) => ({ t, h });
    p.scenes = [
      sc('EXT.', 'Casablanca, marché', 'JOUR', "Les réfugiés de toute l'Europe attendent un visa de sortie ; deux messagers allemands ont été assassinés.", 'spectre', [], [b('action', "La foule des réfugiés se presse dans les ruelles. La police fait une rafle.")]),
      sc('INT.', "Rick's Café Américain", 'NUIT', "Rick, roi de son bar, refuse d'entrer au casino un client indésirable.", 'faiblesse', [rick.id, sam.id], [b('action', "Rick joue seul aux échecs. Il ne boit jamais avec les clients."), b('character', 'RICK'), b('dialogue', 'Je ne risque ma peau pour personne.')]),
      sc('INT.', "Rick's Café Américain", 'NUIT', "Ugarte confie à Rick les lettres de transit volées.", 'faiblesse', [rick.id], []),
      sc('INT.', "Rick's Café Américain", 'NUIT', 'Ilsa et Laszlo entrent dans le bar ; Ilsa demande à Sam de jouer leur chanson.', 'declencheur', [ilsa.id, laszlo.id, sam.id], []),
      sc('INT.', "Rick's Café Américain", 'NUIT', 'Après la fermeture, Rick ivre se souvient de Paris et envoie promener Ilsa.', 'defaite', [rick.id, ilsa.id], []),
      sc('EXT.', 'Marché', 'JOUR', "Rick fait des avances à Ilsa ; elle lui apprend qu'elle était mariée à Laszlo.", 'rev2', [rick.id, ilsa.id], []),
      sc('INT.', "Appartement de Rick", 'NUIT', "Ilsa menace Rick d'une arme, puis lui avoue qu'elle l'aime toujours.", 'rev3', [rick.id, ilsa.id], []),
      sc('EXT.', 'Aéroport', 'NUIT', "Rick pousse Ilsa à partir avec Laszlo et tire sur Strasser.", 'confrontation', [rick.id, ilsa.id, laszlo.id, renault.id, strasser.id], []),
      sc('EXT.', 'Aéroport', 'NUIT', "Renault jette l'eau de Vichy ; les deux hommes s'éloignent ensemble.", 'equilibre', [rick.id, renault.id], [])
    ];
    p.script.title = 'Casablanca (exemple d\'analyse)'; p.script.author = 'D\'après l\'analyse de John Truby';
    p.progress = { premisse: true };
    return p;
  }
  return { make };
})();
