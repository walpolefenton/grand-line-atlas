// Grand Line Atlas — world data.
// Every item carries the chapter it first appears in, so the spoiler shield can
// hide anything past a reader's chapter. Facts summarised from the manga and the
// One Piece Wiki (CC BY-SA). Positions are approximate: Oda never published an
// exact map, so islands follow the order of the story along the canon layout.

export const W = 4000; // world width; the map wraps east–west like a globe
export const H = 2200;
export const REVERSE_X = 1000; // Red Line crossing at Reverse Mountain
export const MARY_X = 3000; // Red Line crossing at Mary Geoise
export const GL_TOP = 1000; // Grand Line band
export const GL_BOTTOM = 1200;
export const BELT = 80; // Calm Belt width either side
export const LATEST_CHAPTER = 1150; // data runs to here

export type SagaId =
  | "eastblue" | "arabasta" | "sky" | "water7" | "thriller" | "summit"
  | "fishman" | "dressrosa" | "emperors" | "final";

export const SAGAS: Record<SagaId, { name: string; hue: string }> = {
  eastblue: { name: "East Blue", hue: "#3d8fc4" },
  arabasta: { name: "Arabasta", hue: "#d9a441" },
  sky: { name: "Sky Island", hue: "#7cc3d8" },
  water7: { name: "Water 7", hue: "#4a9d8e" },
  thriller: { name: "Thriller Bark", hue: "#7b6aa8" },
  summit: { name: "Summit War", hue: "#c8473b" },
  fishman: { name: "Fish-Man Island", hue: "#3fa6a0" },
  dressrosa: { name: "Dressrosa", hue: "#d46a8c" },
  emperors: { name: "Four Emperors", hue: "#b5823c" },
  final: { name: "Final", hue: "#5d6fb8" },
};

export interface Arc {
  id: string;
  name: string;
  saga: SagaId;
  ch: [number, number];
  ep: [number, number] | null; // anime episodes (approximate); null = not yet mapped
  island: string; // main island id
  summary: string; // shown only once the reader has finished the arc
}

export const ARCS: Arc[] = [
  { id: "romance-dawn", name: "Romance Dawn", saga: "eastblue", ch: [1, 7], ep: [1, 3], island: "dawn", summary: "Luffy sets out to become King of the Pirates, rescues Koby, and frees Roronoa Zoro from the Marines at Shells Town." },
  { id: "orange-town", name: "Orange Town", saga: "eastblue", ch: [8, 21], ep: [4, 8], island: "orange", summary: "Luffy meets the thief Nami and defeats Buggy the Clown, who had seized the town." },
  { id: "syrup", name: "Syrup Village", saga: "eastblue", ch: [22, 41], ep: [9, 18], island: "syrup", summary: "Usopp's lies turn true when Captain Kuro plots against Kaya. The crew wins the Going Merry." },
  { id: "baratie", name: "Baratie", saga: "eastblue", ch: [42, 68], ep: [19, 30], island: "baratie", summary: "At a sea restaurant Zoro loses to Mihawk, Luffy beats Don Krieg, and Sanji leaves his mentor Zeff to join." },
  { id: "arlong", name: "Arlong Park", saga: "eastblue", ch: [69, 95], ep: [31, 44], island: "cocoyasi", summary: "Nami's secret comes out. Luffy topples Arlong and frees her village; Luffy's first bounty follows." },
  { id: "loguetown", name: "Loguetown", saga: "eastblue", ch: [96, 100], ep: [45, 53], island: "logue", summary: "In the town where Roger died, Buggy and Smoker close in on Luffy before a storm lets the crew slip away to the Grand Line." },
  { id: "reverse", name: "Reverse Mountain", saga: "arabasta", ch: [101, 105], ep: [61, 63], island: "reverse", summary: "The crew climbs the Red Line on the current, meets Laboon and Crocus, and picks up Vivi and Mr. 9." },
  { id: "whisky", name: "Whisky Peak", saga: "arabasta", ch: [106, 114], ep: [64, 67], island: "whisky", summary: "A welcoming town turns out to be a nest of Baroque Works bounty hunters. Vivi asks for help saving Arabasta." },
  { id: "little-garden", name: "Little Garden", saga: "arabasta", ch: [115, 129], ep: [70, 77], island: "littlegarden", summary: "Two giant warriors of Elbaph fight an endless duel; the crew beats Baroque Works' Mr. 3." },
  { id: "drum", name: "Drum Island", saga: "arabasta", ch: [130, 154], ep: [78, 91], island: "drum", summary: "Nami falls ill. On a snowy island without a king, Tony Tony Chopper joins as ship's doctor." },
  { id: "arabasta", name: "Arabasta", saga: "arabasta", ch: [155, 217], ep: [92, 130], island: "arabasta", summary: "Luffy defeats Warlord Crocodile and ends the civil war his Baroque Works stirred. Vivi stays; Nico Robin stows away." },
  { id: "jaya", name: "Jaya", saga: "sky", ch: [218, 236], ep: [144, 152], island: "jaya", summary: "The crew hears the legend of a City of Gold in the sky and rides the Knock Up Stream to find it." },
  { id: "skypiea", name: "Skypiea", saga: "sky", ch: [237, 302], ep: [153, 195], island: "skypiea", summary: "On an island in the clouds Luffy defeats the self-proclaimed god Enel and rings the Golden Bell of Shandora." },
  { id: "long-ring", name: "Long Ring Long Land", saga: "water7", ch: [303, 321], ep: [207, 219], island: "longring", summary: "The Foxy Pirates' Davy Back Fight, then Admiral Aokiji freezes Luffy and warns about Robin's past." },
  { id: "water7", name: "Water 7", saga: "water7", ch: [322, 374], ep: [229, 263], island: "water7", summary: "The Going Merry can't be saved, Usopp leaves, and Robin gives herself up to CP9." },
  { id: "enies", name: "Enies Lobby", saga: "water7", ch: [375, 430], ep: [264, 312], island: "enies", summary: "The crew declares war on the World Government and storms its judicial island to bring Robin back. The Merry's farewell." },
  { id: "post-enies", name: "Post-Enies Lobby", saga: "water7", ch: [431, 441], ep: [313, 325], island: "water7", summary: "New bounties, the Thousand Sunny, and Franky joins. Luffy's family reveals itself." },
  { id: "thriller", name: "Thriller Bark", saga: "thriller", ch: [442, 489], ep: [337, 381], island: "thriller", summary: "Warlord Gecko Moria steals shadows on a ghost-ship island. Brook joins; Zoro takes Luffy's pain from Kuma." },
  { id: "sabaody", name: "Sabaody Archipelago", saga: "summit", ch: [490, 513], ep: [385, 405], island: "sabaody", summary: "The Supernovas gather, Luffy punches a Celestial Dragon, and Bartholomew Kuma scatters the crew across the world." },
  { id: "amazon-lily", name: "Amazon Lily", saga: "summit", ch: [514, 524], ep: [408, 417], island: "amazonlily", summary: "Luffy lands on the island of women and wins Boa Hancock's help to reach Ace." },
  { id: "impel-down", name: "Impel Down", saga: "summit", ch: [525, 549], ep: [422, 452], island: "impel", summary: "Luffy breaks into the great prison to save Ace and breaks out with an army of inmates." },
  { id: "marineford", name: "Marineford", saga: "summit", ch: [550, 580], ep: [457, 489], island: "marineford", summary: "The Summit War. Whitebeard and Ace fall; the age turns." },
  { id: "post-war", name: "Post-War", saga: "summit", ch: [581, 597], ep: [490, 516], island: "rusukaina", summary: "Luffy mourns, learns of Sabo's past, and sends a message: the crew will train for two years." },
  { id: "return-sabaody", name: "Return to Sabaody", saga: "fishman", ch: [598, 602], ep: [517, 522], island: "sabaody", summary: "Two years later the crew reunites and dives for Fish-Man Island." },
  { id: "fishman", name: "Fish-Man Island", saga: "fishman", ch: [603, 653], ep: [523, 574], island: "fishman", summary: "Luffy defeats Hody Jones, makes Fish-Man Island his territory, and challenges Big Mom." },
  { id: "punk-hazard", name: "Punk Hazard", saga: "dressrosa", ch: [654, 699], ep: [579, 625], island: "punkhazard", summary: "Luffy and Law form an alliance against Caesar Clown and the SAD supply behind Kaido's army." },
  { id: "dressrosa", name: "Dressrosa", saga: "dressrosa", ch: [700, 801], ep: [629, 746], island: "dressrosa", summary: "Luffy defeats Doflamingo, frees the toys, and gains a grand fleet of pirate subordinates." },
  { id: "zou", name: "Zou", saga: "emperors", ch: [802, 824], ep: [751, 779], island: "zou", summary: "On a giant elephant the crew meets the Minks, learns of Road Poneglyphs, and plans Wano's liberation." },
  { id: "whole-cake", name: "Whole Cake Island", saga: "emperors", ch: [825, 902], ep: [783, 877], island: "wholecake", summary: "Luffy invades Big Mom's Totto Land to bring Sanji back from a wedding trap." },
  { id: "levely", name: "Levely", saga: "emperors", ch: [903, 908], ep: [878, 889], island: "marygeoise", summary: "Kings meet at Mary Geoise. Luffy is named a 'Fifth Emperor', and a hidden ruler is glimpsed." },
  { id: "wano", name: "Wano Country", saga: "emperors", ch: [909, 1057], ep: [890, 1085], island: "wano", summary: "The samurai and the alliance storm Onigashima. Luffy awakens his fruit and defeats Kaido; Wano opens its borders." },
  { id: "egghead", name: "Egghead", saga: "final", ch: [1058, 1125], ep: [1086, 1155], island: "egghead", summary: "On Vegapunk's island of the future, the World Government moves to silence him and the crew fights its way out." },
  { id: "elbaph", name: "Elbaph", saga: "final", ch: [1126, LATEST_CHAPTER], ep: null, island: "elbaph", summary: "The Straw Hats reach the land of giants." },
];

export type IslandKind = "island" | "sky" | "undersea" | "ship" | "mystery" | "mountain";

export interface Island {
  id: string;
  name: string;
  x: number;
  y: number;
  r: number; // drawn radius
  imp: 1 | 2 | 3; // 3 = always labelled
  kind?: IslandKind;
  first: number; // chapter it first appears or is named
  notes: [number, string][]; // [chapter revealed, text]
  control?: [number, FactionId | null][]; // [from chapter, faction]
}

export type FactionId =
  | "wg" | "marines" | "revolutionary" | "strawhat" | "whitebeard" | "bigmom"
  | "kaido" | "shanks" | "blackbeard" | "donquixote" | "crossguild";

export const FACTIONS: Record<FactionId, { name: string; color: string }> = {
  wg: { name: "World Government", color: "#8f8f99" },
  marines: { name: "Marines", color: "#3a73c9" },
  revolutionary: { name: "Revolutionary Army", color: "#2f8f5b" },
  strawhat: { name: "Straw Hat Pirates", color: "#d6312b" },
  whitebeard: { name: "Whitebeard Pirates", color: "#c9a227" },
  bigmom: { name: "Big Mom Pirates", color: "#d65fa0" },
  kaido: { name: "Beasts Pirates", color: "#7a4fb5" },
  shanks: { name: "Red Hair Pirates", color: "#b2302a" },
  blackbeard: { name: "Blackbeard Pirates", color: "#3b3b46" },
  donquixote: { name: "Donquixote Family", color: "#e0779b" },
  crossguild: { name: "Cross Guild", color: "#d98a2b" },
};

export const ISLANDS: Island[] = [
  // ── East Blue ───────────────────────────────────────────────
  { id: "dawn", name: "Dawn Island", x: 2470, y: 360, r: 34, imp: 3, first: 1,
    notes: [[1, "Luffy's home. In Foosha Village, Shanks gave him the straw hat and the promise to return it as a great pirate."],
      [582, "Luffy, Ace and Sabo grew up here as sworn brothers, in the forests of Mount Corvo beyond the walls of the Goa Kingdom."]] },
  { id: "shimotsuki", name: "Shimotsuki Village", x: 2360, y: 610, r: 18, imp: 1, first: 5,
    notes: [[5, "Zoro's home village, where he trained at Koshiro's dojo and made his promise to Kuina."]] },
  { id: "shells", name: "Shells Town", x: 2260, y: 470, r: 20, imp: 2, first: 3,
    notes: [[3, "Marine 153rd Branch. Luffy freed Roronoa Zoro from Captain Morgan's execution post; Koby stayed to join the Marines."]],
    control: [[3, "marines"]] },
  { id: "orange", name: "Orange Town", x: 2120, y: 290, r: 20, imp: 2, first: 8,
    notes: [[8, "Buggy the Clown's crew held the town hostage. Luffy met Nami here."]] },
  { id: "syrup", name: "Syrup Village", x: 1980, y: 520, r: 24, imp: 2, first: 23,
    notes: [[23, "Usopp's home in the Gecko Islands. Captain Kuro's plot against the heiress Kaya was stopped, and Kaya gave the crew the Going Merry."]] },
  { id: "baratie", name: "Baratie", x: 1800, y: 370, r: 14, imp: 2, kind: "ship", first: 43,
    notes: [[43, "A floating restaurant run by the former pirate chef Zeff, where Sanji cooked."], [51, "Dracule Mihawk defeated Zoro here, and Zoro vowed never to lose again."]] },
  { id: "cocoyasi", name: "Cocoyasi Village", x: 1630, y: 560, r: 26, imp: 2, first: 69,
    notes: [[69, "Nami's home in the Conomi Islands, ruled for eight years from Arlong Park by the Fish-Man pirate Arlong."], [93, "Luffy brought Arlong Park down and freed the islands."]] },
  { id: "logue", name: "Loguetown", x: 1250, y: 760, r: 24, imp: 3, first: 96,
    notes: [[96, "The town of the beginning and the end, where Gol D. Roger was executed. The last stop before the Grand Line."], [100, "Smoker nearly captured Luffy; a cloaked man and a sudden storm let the crew escape."]],
    control: [[96, "marines"]] },

  // ── Red Line crossings ──────────────────────────────────────
  { id: "reverse", name: "Reverse Mountain", x: REVERSE_X, y: 1100, r: 22, imp: 3, kind: "mountain", first: 101,
    notes: [[101, "The currents of all four Blues climb the Red Line here and pour down together into the Grand Line."]] },
  { id: "twincape", name: "Twin Cape", x: 1070, y: 1060, r: 12, imp: 1, first: 102,
    notes: [[102, "Crocus' lighthouse, where the whale Laboon has waited fifty years for a crew that promised to return."], [489, "Laboon's crew was the Rumbar Pirates. Brook is its last survivor."]] },
  { id: "marygeoise", name: "Mary Geoise", x: MARY_X, y: 1080, r: 22, imp: 3, kind: "mountain", first: 233,
    notes: [[233, "The holy land atop the Red Line, home of the Celestial Dragons and seat of the World Government."], [903, "At the Levely the kings of the world gathered here, and a hidden ruler on the Empty Throne was glimpsed."]],
    control: [[233, "wg"]] },
  { id: "fishman", name: "Fish-Man Island", x: 3070, y: 1165, r: 22, imp: 3, kind: "undersea", first: 496,
    notes: [[496, "The Ryugu Kingdom, 10,000 metres down at the foot of the Red Line: the only way into the New World for most ships."], [610, "With Whitebeard dead, Big Mom claimed the island as her territory."], [651, "After defeating Hody Jones, Luffy declared Fish-Man Island his own territory."]],
    control: [[496, "whitebeard"], [577, null], [610, "bigmom"], [651, "strawhat"]] },

  // ── Paradise ────────────────────────────────────────────────
  { id: "whisky", name: "Whisky Peak", x: 1170, y: 1040, r: 18, imp: 2, first: 106,
    notes: [[106, "A town of cactus mountains that welcomes pirates, then hunts them. Its people are Baroque Works agents."]] },
  { id: "littlegarden", name: "Little Garden", x: 1300, y: 1150, r: 26, imp: 2, first: 115,
    notes: [[115, "A prehistoric island where the giants Dorry and Brogy of Elbaph have fought a duel for a hundred years."]] },
  { id: "drum", name: "Drum Island", x: 1440, y: 1035, r: 26, imp: 2, first: 131,
    notes: [[131, "A snowy kingdom abandoned by its tyrant king Wapol. Dr. Kureha lives on the peak."], [153, "Chopper joined the crew here."]] },
  { id: "arabasta", name: "Arabasta", x: 1610, y: 1125, r: 46, imp: 3, first: 155,
    notes: [[155, "An ancient desert kingdom ruled by the Nefertari family, pushed toward civil war by drought and Baroque Works."], [211, "Luffy defeated Crocodile, the Warlord secretly running Baroque Works."]] },
  { id: "jaya", name: "Jaya", x: 1790, y: 1060, r: 30, imp: 2, first: 218,
    notes: [[218, "A lawless island around Mock Town. Legend says half of it holds a lost City of Gold."], [223, "Marshall D. Teach first crossed paths with Luffy in Mock Town."]] },
  { id: "skypiea", name: "Skypiea", x: 1800, y: 930, r: 30, imp: 3, kind: "sky", first: 237,
    notes: [[237, "A sky island 10,000 metres above Jaya, reached by the Knock Up Stream."], [286, "Upper Yard is the missing half of Jaya, blasted into the sky 400 years ago."], [300, "Luffy defeated Enel and the Golden Bell of Shandora rang again."]] },
  { id: "longring", name: "Long Ring Long Land", x: 1960, y: 1150, r: 26, imp: 1, first: 303,
    notes: [[303, "Ring-shaped islands where everything grows long. Site of the Davy Back Fight."], [319, "Admiral Aokiji appeared here and froze Luffy."]] },
  { id: "water7", name: "Water 7", x: 2130, y: 1050, r: 32, imp: 3, first: 322,
    notes: [[322, "A city of canals and shipwrights, home of the Galley-La Company."], [436, "Franky built the Thousand Sunny here for the crew."]] },
  { id: "enies", name: "Enies Lobby", x: 2260, y: 1150, r: 22, imp: 2, first: 375,
    notes: [[375, "The World Government's judicial island, with the Gates of Justice leading to Impel Down and Marineford."], [398, "The crew burned the World Government's flag and declared war to save Robin."]],
    control: [[375, "wg"]] },
  { id: "thriller", name: "Thriller Bark", x: 2460, y: 1085, r: 30, imp: 2, first: 442,
    notes: [[442, "Gecko Moria's ghost ship, as big as an island, drifting in the Florian Triangle."], [489, "Brook joined the crew."]] },
  { id: "kuraigana", name: "Kuraigana Island", x: 2560, y: 1170, r: 18, imp: 1, first: 592,
    notes: [[592, "A ruined kingdom where Dracule Mihawk lives. Zoro trained here for two years."]] },
  { id: "weatheria", name: "Weatheria", x: 2380, y: 925, r: 18, imp: 1, kind: "sky", first: 592,
    notes: [[592, "A small sky island of weather scientists. Nami studied here for two years."]] },
  { id: "momoiro", name: "Momoiro Island", x: 2340, y: 1265, r: 16, imp: 1, first: 520,
    notes: [[520, "Kamabakka Kingdom, where Sanji landed and trained for two years."]] },
  { id: "sabaody", name: "Sabaody Archipelago", x: 2760, y: 1060, r: 32, imp: 3, first: 490,
    notes: [[490, "Giant mangroves at the foot of the Red Line, where ships are coated to dive to Fish-Man Island."], [503, "Luffy punched a Celestial Dragon, and Bartholomew Kuma scattered the crew across the world."], [598, "The crew reunited here two years later."]],
    control: [[490, "wg"]] },
  { id: "amazonlily", name: "Amazon Lily", x: 2600, y: 1250, r: 22, imp: 2, first: 514,
    notes: [[514, "The kingdom of women in the Calm Belt, ruled by the Warlord Boa Hancock."]] },
  { id: "impel", name: "Impel Down", x: 2720, y: 1240, r: 18, imp: 2, kind: "undersea", first: 525,
    notes: [[525, "The World Government's great prison, built mostly under the sea in the Calm Belt."], [548, "Luffy broke out with an army of prisoners."]],
    control: [[525, "wg"]] },
  { id: "rusukaina", name: "Rusukaina", x: 2660, y: 1300, r: 14, imp: 1, first: 590,
    notes: [[590, "A wild island in the Calm Belt where Rayleigh trained Luffy."]] },
  { id: "marineford", name: "Marineford", x: 2875, y: 1160, r: 22, imp: 3, first: 550,
    notes: [[550, "Marine Headquarters, where Portgas D. Ace was to be executed."], [576, "The Summit War: Whitebeard and Ace died here."], [597, "After the war the Marines moved their headquarters to the New World."]],
    control: [[550, "marines"], [597, null]] },

  // ── New World (x beyond 3000 wraps round to Reverse Mountain) ───
  { id: "punkhazard", name: "Punk Hazard", x: 3170, y: 1040, r: 24, imp: 2, first: 654,
    notes: [[654, "Half blazing, half frozen after an admirals' duel. Caesar Clown's laboratory made SAD for Kaido here."]] },
  { id: "g1", name: "Marine HQ (G-1)", x: 3150, y: 1250, r: 16, imp: 2, first: 597,
    notes: [[597, "The new Marine Headquarters, moved into the New World after the Summit War."]],
    control: [[597, "marines"]] },
  { id: "dressrosa", name: "Dressrosa", x: 3360, y: 1115, r: 34, imp: 3, first: 700,
    notes: [[700, "A kingdom of passion, flowers and living toys, ruled by the Warlord Donquixote Doflamingo."], [791, "Luffy defeated Doflamingo and the Riku family returned to the throne."]],
    control: [[700, "donquixote"], [791, null]] },
  { id: "zou", name: "Zou", x: 3540, y: 1045, r: 30, imp: 2, first: 802,
    notes: [[802, "The Mokomo Dukedom on the back of Zunesha, an elephant that has walked the sea for a thousand years. Home of the Minks."]] },
  { id: "wholecake", name: "Whole Cake Island", x: 3710, y: 1165, r: 34, imp: 3, first: 651,
    notes: [[651, "Heart of Totto Land, Big Mom's archipelago of sweets."], [825, "Luffy came to bring Sanji home from his arranged wedding."]],
    control: [[651, "bigmom"], [1053, null]] },
  { id: "wano", name: "Wano Country", x: 3910, y: 1075, r: 38, imp: 3, first: 655,
    notes: [[655, "A closed country of samurai behind waterfalls and cliffs."], [909, "Ruled by Kaido and the shogun Kurozumi Orochi, its people starving."], [1049, "Luffy defeated Kaido on Onigashima. Momonosuke became shogun."]],
    control: [[655, "kaido"], [1049, null]] },
  { id: "lulusia", name: "Lulusia Kingdom", x: 3820, y: 1255, r: 16, imp: 1, first: 1060,
    notes: [[1060, "Wiped off the map by a light from the sky, in an instant."]] },
  { id: "egghead", name: "Egghead", x: 4130, y: 1140, r: 26, imp: 3, first: 1061,
    notes: [[1061, "The Island of the Future, Dr. Vegapunk's laboratory, years ahead of the rest of the world."], [1125, "The crew escaped as the World Government closed in."]],
    control: [[1061, "wg"], [1125, null]] },
  { id: "elbaph", name: "Elbaph", x: 4340, y: 1055, r: 36, imp: 3, first: 115,
    notes: [[115, "Homeland of the giants, spoken of by Dorry and Brogy as a land of warriors."], [1126, "The Straw Hats reach the land of giants."]] },
  { id: "laughtale", name: "Laugh Tale", x: 4880, y: 1100, r: 22, imp: 3, kind: "mystery", first: 967,
    notes: [[967, "The final island. Only Roger's crew ever reached it; Roger gave it its name."]] },

  // ── North Blue ──────────────────────────────────────────────
  { id: "flevance", name: "Flevance", x: 3420, y: 500, r: 22, imp: 2, first: 762,
    notes: [[762, "The White City. Amber Lead poisoning, covered up by the World Government, killed its people. Law was its last survivor."]] },
  { id: "minion", name: "Minion Island", x: 3700, y: 360, r: 16, imp: 1, first: 767,
    notes: [[767, "A snowy island where Corazon died protecting young Law."]] },
  { id: "spidermiles", name: "Spider Miles", x: 3880, y: 620, r: 18, imp: 1, first: 761,
    notes: [[761, "The scrap town where young Doflamingo built his family."]] },
  { id: "lvneel", name: "Lvneel Kingdom", x: 4300, y: 420, r: 22, imp: 1, first: 228,
    notes: [[228, "Home of Montblanc Noland, the explorer who claimed to have seen a City of Gold."]] },

  // ── West Blue ───────────────────────────────────────────────
  { id: "ohara", name: "Ohara", x: 3600, y: 1720, r: 22, imp: 2, first: 391,
    notes: [[391, "An island of scholars destroyed by a Buster Call for studying the Void Century. Nico Robin was its only survivor."]] },

  // ── South Blue ──────────────────────────────────────────────
  { id: "baterilla", name: "Baterilla", x: 2200, y: 1650, r: 18, imp: 1, first: 550,
    notes: [[550, "Where Portgas D. Rouge hid her child with Roger, Ace, for twenty months."]] },
];

// Islands are drawn a little larger than their raw radius so they read at overview zoom.
for (const i of ISLANDS) i.r = Math.round(i.r * 1.5);

/** The Straw Hats' voyage: [island id, chapter they arrive]. */
export const ROUTE: [string, number][] = [
  ["dawn", 1], ["shells", 3], ["orange", 8], ["syrup", 23], ["baratie", 43],
  ["cocoyasi", 69], ["logue", 96], ["reverse", 101], ["twincape", 102],
  ["whisky", 106], ["littlegarden", 115], ["drum", 131], ["arabasta", 155],
  ["jaya", 218], ["skypiea", 237], ["longring", 303], ["water7", 322],
  ["enies", 375], ["water7", 431], ["thriller", 442], ["sabaody", 490],
  ["fishman", 603], ["punkhazard", 654], ["dressrosa", 700], ["zou", 802],
  ["wholecake", 825], ["wano", 909], ["egghead", 1061], ["elbaph", 1126],
];

export interface Character {
  id: string;
  name: string;
  first: number;
  crew: [number, string][]; // [from chapter, crew name]
  bounty: [number, number][]; // [chapter revealed, berries]
  epithet?: string;
}

const SH = "Straw Hat Pirates";

export const CHARACTERS: Character[] = [
  { id: "luffy", name: "Monkey D. Luffy", epithet: "Straw Hat", first: 1, crew: [[1, SH]],
    bounty: [[96, 30e6], [225, 100e6], [435, 300e6], [598, 400e6], [801, 500e6], [903, 1.5e9], [1053, 3e9]] },
  { id: "zoro", name: "Roronoa Zoro", epithet: "Pirate Hunter", first: 3, crew: [[3, SH]],
    bounty: [[225, 60e6], [435, 120e6], [801, 320e6], [1053, 1.111e9]] },
  { id: "nami", name: "Nami", epithet: "Cat Burglar", first: 8, crew: [[8, SH]],
    bounty: [[801, 16e6], [903, 66e6], [1053, 366e6]] },
  { id: "usopp", name: "Usopp", epithet: "God", first: 23, crew: [[23, SH]],
    bounty: [[435, 30e6], [801, 200e6], [1053, 500e6]] },
  { id: "sanji", name: "Sanji", epithet: "Black Leg", first: 43, crew: [[43, SH]],
    bounty: [[435, 77e6], [801, 177e6], [903, 330e6], [1053, 1.032e9]] },
  { id: "chopper", name: "Tony Tony Chopper", epithet: "Cotton Candy Lover", first: 134, crew: [[153, SH]],
    bounty: [[435, 50], [801, 100], [1053, 1000]] },
  { id: "robin", name: "Nico Robin", epithet: "Devil Child", first: 167, crew: [[167, "Baroque Works"], [218, SH]],
    bounty: [[200, 79e6], [435, 80e6], [801, 130e6], [1053, 930e6]] },
  { id: "franky", name: "Franky", epithet: "Iron Man", first: 329, crew: [[329, "Franky Family"], [439, SH]],
    bounty: [[435, 44e6], [801, 94e6], [1053, 394e6]] },
  { id: "brook", name: "Brook", epithet: "Soul King", first: 442, crew: [[442, "Rumbar Pirates"], [489, SH]],
    bounty: [[456, 33e6], [801, 83e6], [1053, 383e6]] },
  { id: "jinbe", name: "Jinbe", epithet: "Knight of the Sea", first: 528, crew: [[528, "Sun Pirates"], [976, SH]],
    bounty: [[1053, 1.1e9]] },

  { id: "roger", name: "Gol D. Roger", epithet: "Pirate King", first: 1, crew: [[1, "Roger Pirates"]], bounty: [[957, 5.564e9]] },
  { id: "whitebeard", name: "Edward Newgate", epithet: "Whitebeard", first: 234, crew: [[234, "Whitebeard Pirates"]], bounty: [[957, 5.046e9]] },
  { id: "kaido", name: "Kaido", epithet: "of the Beasts", first: 434, crew: [[434, "Beasts Pirates"]], bounty: [[957, 4.611e9]] },
  { id: "bigmom", name: "Charlotte Linlin", epithet: "Big Mom", first: 610, crew: [[610, "Big Mom Pirates"]], bounty: [[957, 4.388e9]] },
  { id: "shanks", name: "Shanks", epithet: "Red-Haired", first: 1, crew: [[1, "Red Hair Pirates"]], bounty: [[957, 4.048e9]] },
  { id: "mihawk", name: "Dracule Mihawk", epithet: "Hawk-Eye", first: 49, crew: [[49, "Warlord of the Sea"], [1058, "Cross Guild"]], bounty: [[1058, 3.59e9]] },
  { id: "buggy", name: "Buggy", epithet: "the Clown", first: 9, crew: [[9, "Buggy Pirates"], [1058, "Cross Guild"]], bounty: [[9, 15e6], [1058, 3.189e9]] },
  { id: "law", name: "Trafalgar D. Water Law", epithet: "Surgeon of Death", first: 498, crew: [[498, "Heart Pirates"]], bounty: [[498, 200e6], [700, 440e6], [801, 500e6], [1053, 3e9]] },
  { id: "kid", name: "Eustass Kid", epithet: "Captain", first: 498, crew: [[498, "Kid Pirates"]], bounty: [[498, 315e6], [801, 470e6], [1053, 3e9]] },
  { id: "blackbeard", name: "Marshall D. Teach", epithet: "Blackbeard", first: 223, crew: [[223, "Blackbeard Pirates"]], bounty: [[957, 2.247e9]] },
  { id: "crocodile", name: "Crocodile", epithet: "Sir", first: 155, crew: [[155, "Baroque Works"], [1058, "Cross Guild"]], bounty: [[1058, 1.965e9]] },
  { id: "hancock", name: "Boa Hancock", epithet: "Pirate Empress", first: 516, crew: [[516, "Kuja Pirates"]], bounty: [[1058, 1.659e9]] },
  { id: "marco", name: "Marco", epithet: "the Phoenix", first: 434, crew: [[434, "Whitebeard Pirates"]], bounty: [[957, 1.374e9]] },
  { id: "katakuri", name: "Charlotte Katakuri", epithet: "Sweet Commander", first: 832, crew: [[832, "Big Mom Pirates"]], bounty: [[862, 1.057e9]] },
  { id: "sabo", name: "Sabo", epithet: "Flame Emperor", first: 583, crew: [[583, "Revolutionary Army"]], bounty: [[1058, 602e6]] },
  { id: "ace", name: "Portgas D. Ace", epithet: "Fire Fist", first: 154, crew: [[154, "Whitebeard Pirates"]], bounty: [[552, 550e6]] },
  { id: "arlong", name: "Arlong", epithet: "the Saw", first: 69, crew: [[69, "Arlong Pirates"]], bounty: [[69, 20e6]] },
];

/** Emperors of the Sea: who holds the title, and when a reader learns it. */
export const EMPERORS: { id: string; name: string; faction: FactionId; known: number; from: number; to?: number }[] = [
  { id: "whitebeard", name: "Whitebeard", faction: "whitebeard", known: 234, from: 0, to: 576 },
  { id: "shanks", name: "Shanks", faction: "shanks", known: 234, from: 0 },
  { id: "kaido", name: "Kaido", faction: "kaido", known: 434, from: 0, to: 1053 },
  { id: "bigmom", name: "Big Mom", faction: "bigmom", known: 610, from: 0, to: 1053 },
  { id: "blackbeard", name: "Blackbeard", faction: "blackbeard", known: 594, from: 594 },
  { id: "luffy", name: "Monkey D. Luffy", faction: "strawhat", known: 1053, from: 1053 },
  { id: "buggy", name: "Buggy", faction: "crossguild", known: 1053, from: 1053 },
];

export const SEAS: { name: string; x: number; y: number; first: number; size: number }[] = [
  { name: "EAST BLUE", x: 1980, y: 160, first: 1, size: 64 },
  { name: "NORTH BLUE", x: 3980, y: 160, first: 1, size: 64 },
  { name: "SOUTH BLUE", x: 1980, y: 2010, first: 1, size: 64 },
  { name: "WEST BLUE", x: 3980, y: 2010, first: 1, size: 64 },
];
