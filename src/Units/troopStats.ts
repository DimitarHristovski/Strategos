export type TroopStats = {
  hp: number;
  maxHp: number;
  attack: number;
  ammo: number;
  range: number;
  move: number;
};

type TroopStatTemplate = {
  hp: [number, number];
  attack: [number, number];
  ammo: number;
  range: number;
  move: number;
};

const ensureRangedAmmo = (role: string, stats: TroopStats): TroopStats => {
  const normalizedRole = role.toLowerCase();
  const projectileKeywords = [
    "archer",
    "slinger",
    "crossbow",
    "velites",
    "shaman",
    "skirmisher",
    "peltast",
    "psiloi",
    "turcopole",
    "thureophoroi",
    "ballista",
    "scorpion",
    "catapult",
    "trebuchet",
    "polybolos",
    "onager",
    "bombard"
  ];
  const isProjectileUnit = projectileKeywords.some((keyword) => normalizedRole.includes(keyword));

  if (!isProjectileUnit) {
    return { ...stats, ammo: 0, range: 1 };
  }

  const isSiegeUnit = ["ballista", "scorpion", "catapult", "trebuchet", "polybolos", "onager", "bombard"].some((keyword) =>
    normalizedRole.includes(keyword)
  );
  const isLongbowUnit = normalizedRole.includes("longbow");
  const isCrossbowUnit = normalizedRole.includes("crossbow");
  const isSlingerUnit = normalizedRole.includes("slinger");

  let minimumRange = 4;
  let minimumAmmo = 12;

  if (isSiegeUnit) {
    minimumRange = 6;
    minimumAmmo = 8;
  } else if (isLongbowUnit) {
    minimumRange = 6;
    minimumAmmo = 14;
  } else if (isCrossbowUnit) {
    minimumRange = 5;
    minimumAmmo = 12;
  } else if (isSlingerUnit) {
    minimumRange = 5;
    minimumAmmo = 14;
  }

  return {
    ...stats,
    ammo: Math.max(minimumAmmo, stats.ammo),
    range: Math.max(minimumRange, stats.range)
  };
};

const EXTRA_TROOP_STATS: Record<string, TroopStatTemplate> = {
  Hastati: { hp: [260, 310], attack: [115, 145], ammo: 0, range: 1, move: 1 },
  Principes: { hp: [300, 350], attack: [130, 160], ammo: 0, range: 1, move: 1 },
  Equites: { hp: [220, 270], attack: [135, 165], ammo: 0, range: 1, move: 3 },
  Onager: { hp: [60, 90], attack: [150, 190], ammo: 6, range: 6, move: 0 },
  Falxman: { hp: [240, 300], attack: [180, 220], ammo: 0, range: 1, move: 1 },
  "Barbarian Noble Rider": { hp: [230, 280], attack: [145, 175], ammo: 0, range: 1, move: 3 },
  "Barbarian Slinger": { hp: [140, 180], attack: [75, 100], ammo: 12, range: 4, move: 1 },
  "Chosen Spearman": { hp: [250, 300], attack: [120, 150], ammo: 0, range: 1, move: 1 },
  Oathsworn: { hp: [300, 360], attack: [190, 230], ammo: 0, range: 1, move: 2 },
  Psiloi: { hp: [130, 170], attack: [70, 95], ammo: 10, range: 2, move: 2 },
  Xystophoroi: { hp: [240, 290], attack: [160, 190], ammo: 0, range: 1, move: 3 },
  "Celtic Oathsworn": { hp: [300, 360], attack: [185, 225], ammo: 0, range: 1, move: 1 },
  Gaesatae: { hp: [270, 330], attack: [200, 240], ammo: 0, range: 1, move: 2 },
  "Celtic Noble Horseman": { hp: [220, 280], attack: [150, 180], ammo: 0, range: 1, move: 3 },
  "Celtic Slinger": { hp: [140, 180], attack: [70, 95], ammo: 12, range: 4, move: 1 },
  "Chariot Noble": { hp: [220, 270], attack: [160, 190], ammo: 0, range: 1, move: 4 },
  Fianna: { hp: [240, 290], attack: [155, 185], ammo: 0, range: 1, move: 2 },
  "Noble Spearman": { hp: [240, 290], attack: [120, 145], ammo: 0, range: 1, move: 1 },
  "Chosen Axeman": { hp: [300, 350], attack: [180, 220], ammo: 0, range: 1, move: 1 },
  "Tribal Slinger": { hp: [140, 180], attack: [70, 95], ammo: 10, range: 3, move: 1 },
  "Suebi Rider": { hp: [220, 270], attack: [150, 180], ammo: 0, range: 1, move: 3 },
  "Cherusci Spearman": { hp: [240, 290], attack: [120, 145], ammo: 0, range: 1, move: 1 },
  "Marcomanni Raider": { hp: [220, 270], attack: [150, 185], ammo: 0, range: 1, move: 2 },
  "Gothic Lancer": { hp: [250, 300], attack: [165, 195], ammo: 0, range: 1, move: 3 },
  "Lombard Archer": { hp: [150, 190], attack: [80, 105], ammo: 10, range: 3, move: 1 },
  Hearthguard: { hp: [320, 380], attack: [170, 210], ammo: 0, range: 1, move: 1 },
  "Sacred Band": { hp: [340, 400], attack: [170, 205], ammo: 0, range: 1, move: 1 },
  "Liby-Phoenician Infantry": { hp: [260, 320], attack: [125, 155], ammo: 0, range: 1, move: 1 },
  "Numidian Skirmisher": { hp: [150, 190], attack: [80, 105], ammo: 10, range: 3, move: 2 },
  "Elephant Archer": { hp: [320, 380], attack: [120, 150], ammo: 8, range: 3, move: 2 },
  "Iberian Swordsman": { hp: [230, 290], attack: [145, 180], ammo: 0, range: 1, move: 1 },
  "African Pikeman": { hp: [260, 320], attack: [120, 145], ammo: 0, range: 1, move: 1 },
  "Punic Spearman": { hp: [250, 300], attack: [120, 145], ammo: 0, range: 1, move: 1 },
  "Punic Marine": { hp: [230, 280], attack: [130, 160], ammo: 0, range: 1, move: 1 },
  "Campanian Mercenary": { hp: [280, 340], attack: [150, 180], ammo: 0, range: 1, move: 1 },
  "Phoenician Militia": { hp: [210, 260], attack: [100, 125], ammo: 0, range: 1, move: 1 },
  Huscarl: { hp: [320, 380], attack: [170, 205], ammo: 0, range: 1, move: 1 },
  "Bondi Spearman": { hp: [220, 270], attack: [110, 135], ammo: 0, range: 1, move: 1 },
  Hirdman: { hp: [280, 340], attack: [145, 175], ammo: 0, range: 1, move: 1 },
  Ulfhednar: { hp: [260, 320], attack: [210, 250], ammo: 0, range: 1, move: 2 },
  "Varangian Guard": { hp: [340, 400], attack: [175, 215], ammo: 0, range: 1, move: 1 },
  Jomsviking: { hp: [300, 360], attack: [160, 195], ammo: 0, range: 1, move: 2 },
  "Viking Spearman": { hp: [230, 280], attack: [115, 140], ammo: 0, range: 1, move: 1 },
  "Viking Skirmisher": { hp: [150, 190], attack: [75, 100], ammo: 10, range: 3, move: 2 },
  "Karl Warrior": { hp: [210, 260], attack: [110, 140], ammo: 0, range: 1, move: 1 },
  "Teutonic Marshal": { hp: [420, 470], attack: [240, 280], ammo: 0, range: 1, move: 1 },
  Ritterbruder: { hp: [310, 360], attack: [170, 205], ammo: 0, range: 1, move: 3 },
  Sergeant: { hp: [250, 300], attack: [125, 155], ammo: 0, range: 1, move: 1 },
  Halberdier: { hp: [240, 290], attack: [130, 160], ammo: 0, range: 1, move: 1 },
  "Pavise Crossbowman": { hp: [180, 220], attack: [95, 125], ammo: 8, range: 4, move: 1 },
  Turcopole: { hp: [210, 260], attack: [110, 140], ammo: 6, range: 3, move: 3 },
  Bombard: { hp: [70, 100], attack: [170, 210], ammo: 5, range: 7, move: 0 },
  "Foot Sergeant": { hp: [260, 320], attack: [130, 160], ammo: 0, range: 1, move: 1 }
};

const generateTemplateStats = (template: TroopStatTemplate) => ({
  hp: Math.floor(Math.random() * (template.hp[1] - template.hp[0]) + template.hp[0]),
  attack: Math.floor(Math.random() * (template.attack[1] - template.attack[0]) + template.attack[0]),
  ammo: template.ammo,
  range: template.range,
  move: template.move
});

export const generateTroopStats = (role: string): TroopStats => {
  let hp;
  let maxHp;
  let attack;
  let ammo;
  let range;
  let move;
  const extraTemplate = EXTRA_TROOP_STATS[role];

  if (extraTemplate) {
    const templateStats = generateTemplateStats(extraTemplate);
    hp = templateStats.hp;
    maxHp = hp;
    attack = templateStats.attack;
    ammo = templateStats.ammo;
    range = templateStats.range;
    move = templateStats.move;

    return ensureRangedAmmo(role, { hp, maxHp, attack, ammo, range, move });
  }

  switch (role) {
    case "Roman King":
      hp = Math.floor(Math.random() * (450 - 420) + 420);
      maxHp = hp;
      attack = Math.floor(Math.random() * (270 - 240) + 240);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Legionary":
      hp = Math.floor(Math.random() * (340 - 280) + 280);
      maxHp = hp;
      attack = Math.floor(Math.random() * (140 - 110) + 110);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Centurion":
      hp = Math.floor(Math.random() * (420 - 340) + 340);
      maxHp = hp;
      attack = Math.floor(Math.random() * (180 - 150) + 150);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Archer":
      hp = Math.floor(Math.random() * (200 - 150) + 150);
      maxHp = hp;
      attack = Math.floor(Math.random() * (90 - 65) + 65);
      ammo = 10;
      range = 3;
      move = 1;
      break;
    case "Cavalry":
      hp = Math.floor(Math.random() * (260 - 220) + 220);
      maxHp = hp;
      attack = Math.floor(Math.random() * (150 - 120) + 120);
      ammo = 0;
      range = 1;
      move = 3;
      break;
    case "Praetorian":
      hp = Math.floor(Math.random() * (520 - 440) + 440);
      maxHp = hp;
      attack = Math.floor(Math.random() * (220 - 180) + 180);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Ballista":
      hp = Math.floor(Math.random() * (50 - 10) + 10);
      maxHp = hp;
      attack = Math.floor(Math.random() * (100 - 50) + 50);
      ammo = 10;
      range = 6;
      move = 0;
      break;
    case "Scorpion":
      hp = Math.floor(Math.random() * (20 - 10) + 10);
      maxHp = hp;
      attack = Math.floor(Math.random() * (80 - 30) + 30);
      ammo = 10;
      range = 3;
      move = 1;
      break;
    case "Auxiliary":
      hp = Math.floor(Math.random() * (220 - 170) + 170);
      maxHp = hp;
      attack = Math.floor(Math.random() * (120 - 90) + 90);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Velites":
      hp = Math.floor(Math.random() * (130 - 90) + 90);
      maxHp = hp;
      attack = Math.floor(Math.random() * (75 - 50) + 50);
      ammo = 10;
      range = 3;
      move = 2;
      break;
    case "Triarii":
      hp = Math.floor(Math.random() * (380 - 320) + 320);
      maxHp = hp;
      attack = Math.floor(Math.random() * (150 - 120) + 120);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Barbarian Warrior":
      hp = Math.floor(Math.random() * (270 - 220) + 220);
      maxHp = hp;
      attack = Math.floor(Math.random() * (170 - 130) + 130);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Barbarian Archer":
      hp = Math.floor(Math.random() * (140 - 90) + 90);
      maxHp = hp;
      attack = Math.floor(Math.random() * (85 - 60) + 60);
      ammo = 10;
      range = 2;
      move = 1;
      break;
    case "Barbarian Chief":
      hp = Math.floor(Math.random() * (420 - 360) + 360);
      maxHp = hp;
      attack = Math.floor(Math.random() * (290 - 250) + 250);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Barbarian Berserker":
      hp = Math.floor(Math.random() * (310 - 240) + 240);
      maxHp = hp;
      attack = Math.floor(Math.random() * (260 - 220) + 220);
      ammo = 0;
      range = 1;
      move = 2;
      break;
    case "Barbarian Scout":
      hp = Math.floor(Math.random() * (220 - 170) + 170);
      maxHp = hp;
      attack = Math.floor(Math.random() * (150 - 120) + 120);
      ammo = 0;
      range = 1;
      move = 3;
      break;
    case "Barbarian Shaman":
      hp = Math.floor(Math.random() * (170 - 120) + 120);
      maxHp = hp;
      attack = Math.floor(Math.random() * (150 - 110) + 110);
      ammo = 10;
      range = 2;
      move = 1;
      break;
    case "Barbarian Axeman":
      hp = Math.floor(Math.random() * (340 - 260) + 260);
      maxHp = hp;
      attack = Math.floor(Math.random() * (210 - 170) + 170);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Barbarian Spearman":
      hp = Math.floor(Math.random() * (230 - 180) + 180);
      maxHp = hp;
      attack = Math.floor(Math.random() * (120 - 90) + 90);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Barbarian Raider":
      hp = Math.floor(Math.random() * (190 - 140) + 140);
      maxHp = hp;
      attack = Math.floor(Math.random() * (165 - 130) + 130);
      ammo = 0;
      range = 1;
      move = 2;
      break;
    case "Barbarian Warlord":
      hp = Math.floor(Math.random() * (520 - 420) + 420);
      maxHp = hp;
      attack = Math.floor(Math.random() * (290 - 240) + 240);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Hoplite":
      hp = Math.floor(Math.random() * (360 - 300) + 300);
      maxHp = hp;
      attack = Math.floor(Math.random() * (140 - 110) + 110);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Phalangite":
      hp = Math.floor(Math.random() * (400 - 340) + 340);
      maxHp = hp;
      attack = Math.floor(Math.random() * (155 - 125) + 125);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Hypaspist":
      hp = Math.floor(Math.random() * (340 - 280) + 280);
      maxHp = hp;
      attack = Math.floor(Math.random() * (175 - 140) + 140);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Companion Cavalry":
      hp = Math.floor(Math.random() * (300 - 240) + 240);
      maxHp = hp;
      attack = Math.floor(Math.random() * (210 - 170) + 170);
      ammo = 0;
      range = 1;
      move = 3;
      break;
    case "Thessalian Cavalry":
      hp = Math.floor(Math.random() * (280 - 230) + 230);
      maxHp = hp;
      attack = Math.floor(Math.random() * (175 - 145) + 145);
      ammo = 0;
      range = 1;
      move = 3;
      break;
    case "Peltast":
      hp = Math.floor(Math.random() * (180 - 140) + 140);
      maxHp = hp;
      attack = Math.floor(Math.random() * (100 - 75) + 75);
      ammo = 12;
      range = 3;
      move = 2;
      break;
    case "Thureophoroi":
      hp = Math.floor(Math.random() * (250 - 200) + 200);
      maxHp = hp;
      attack = Math.floor(Math.random() * (125 - 95) + 95);
      ammo = 6;
      range = 2;
      move = 2;
      break;
    case "Cretan Archer":
      hp = Math.floor(Math.random() * (170 - 130) + 130);
      maxHp = hp;
      attack = Math.floor(Math.random() * (120 - 90) + 90);
      ammo = 12;
      range = 4;
      move = 1;
      break;
    case "Rhodian Slinger":
      hp = Math.floor(Math.random() * (160 - 120) + 120);
      maxHp = hp;
      attack = Math.floor(Math.random() * (105 - 80) + 80);
      ammo = 14;
      range = 4;
      move = 1;
      break;
    case "Greek Catapult":
      hp = Math.floor(Math.random() * (60 - 30) + 30);
      maxHp = hp;
      attack = Math.floor(Math.random() * (160 - 110) + 110);
      ammo = 8;
      range = 6;
      move = 0;
      break;
    case "Polybolos":
      hp = Math.floor(Math.random() * (70 - 40) + 40);
      maxHp = hp;
      attack = Math.floor(Math.random() * (140 - 90) + 90);
      ammo = 16;
      range = 5;
      move = 0;
      break;
    case "Agema":
      hp = Math.floor(Math.random() * (380 - 320) + 320);
      maxHp = hp;
      attack = Math.floor(Math.random() * (200 - 160) + 160);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Macedonian King":
      hp = Math.floor(Math.random() * (440 - 400) + 400);
      maxHp = hp;
      attack = Math.floor(Math.random() * (285 - 250) + 250);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Celtic King":
      hp = Math.floor(Math.random() * (390 - 340) + 340);
      maxHp = hp;
      attack = Math.floor(Math.random() * (255 - 220) + 220);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Celtic Warrior":
      hp = Math.floor(Math.random() * (250 - 200) + 200);
      maxHp = hp;
      attack = Math.floor(Math.random() * (145 - 115) + 115);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Celtic Berserker":
      hp = Math.floor(Math.random() * (280 - 220) + 220);
      maxHp = hp;
      attack = Math.floor(Math.random() * (220 - 180) + 180);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Celtic Spearman":
      hp = Math.floor(Math.random() * (230 - 180) + 180);
      maxHp = hp;
      attack = Math.floor(Math.random() * (125 - 95) + 95);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Celtic Archer":
      hp = Math.floor(Math.random() * (160 - 120) + 120);
      maxHp = hp;
      attack = Math.floor(Math.random() * (100 - 75) + 75);
      ammo = 10;
      range = 3;
      move = 1;
      break;
    case "Celtic Skirmisher":
      hp = Math.floor(Math.random() * (150 - 110) + 110);
      maxHp = hp;
      attack = Math.floor(Math.random() * (90 - 65) + 65);
      ammo = 12;
      range = 3;
      move = 1;
      break;
    case "Celtic Cavalry":
      hp = Math.floor(Math.random() * (230 - 180) + 180);
      maxHp = hp;
      attack = Math.floor(Math.random() * (150 - 120) + 120);
      ammo = 0;
      range = 1;
      move = 4;
      break;
    case "Celtic Chariot":
      hp = Math.floor(Math.random() * (220 - 170) + 170);
      maxHp = hp;
      attack = Math.floor(Math.random() * (160 - 130) + 130);
      ammo = 0;
      range = 1;
      move = 4;
      break;
    case "Germanic King":
      hp = Math.floor(Math.random() * (440 - 400) + 400);
      maxHp = hp;
      attack = Math.floor(Math.random() * (305 - 270) + 270);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Germanic Warrior":
      hp = Math.floor(Math.random() * (320 - 260) + 260);
      maxHp = hp;
      attack = Math.floor(Math.random() * (170 - 135) + 135);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Germanic Spearman":
      hp = Math.floor(Math.random() * (290 - 240) + 240);
      maxHp = hp;
      attack = Math.floor(Math.random() * (130 - 100) + 100);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Germanic Berserker":
      hp = Math.floor(Math.random() * (330 - 270) + 270);
      maxHp = hp;
      attack = Math.floor(Math.random() * (245 - 205) + 205);
      ammo = 0;
      range = 1;
      move = 2;
      break;
    case "Germanic Raider":
      hp = Math.floor(Math.random() * (230 - 180) + 180);
      maxHp = hp;
      attack = Math.floor(Math.random() * (170 - 135) + 135);
      ammo = 0;
      range = 1;
      move = 2;
      break;
    case "Germanic Archer":
      hp = Math.floor(Math.random() * (190 - 150) + 150);
      maxHp = hp;
      attack = Math.floor(Math.random() * (95 - 70) + 70);
      ammo = 10;
      range = 2;
      move = 1;
      break;
    case "Germanic Wolf Rider":
      hp = Math.floor(Math.random() * (260 - 220) + 220);
      maxHp = hp;
      attack = Math.floor(Math.random() * (175 - 140) + 140);
      ammo = 0;
      range = 1;
      move = 2;
      break;
    case "Carthaginian General":
      hp = Math.floor(Math.random() * (430 - 390) + 390);
      maxHp = hp;
      attack = Math.floor(Math.random() * (265 - 230) + 230);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Libyan Infantry":
      hp = Math.floor(Math.random() * (290 - 240) + 240);
      maxHp = hp;
      attack = Math.floor(Math.random() * (140 - 110) + 110);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Numidian Cavalry":
      hp = Math.floor(Math.random() * (230 - 180) + 180);
      maxHp = hp;
      attack = Math.floor(Math.random() * (140 - 110) + 110);
      ammo = 0;
      range = 1;
      move = 3;
      break;
    case "War Elephant":
      hp = Math.floor(Math.random() * (560 - 480) + 480);
      maxHp = hp;
      attack = Math.floor(Math.random() * (270 - 220) + 220);
      ammo = 0;
      range = 1;
      move = 2;
      break;
    case "Balearic Slinger":
      hp = Math.floor(Math.random() * (170 - 130) + 130);
      maxHp = hp;
      attack = Math.floor(Math.random() * (100 - 75) + 75);
      ammo = 12;
      range = 4;
      move = 1;
      break;
    case "Carthaginian Archer":
      hp = Math.floor(Math.random() * (170 - 130) + 130);
      maxHp = hp;
      attack = Math.floor(Math.random() * (100 - 75) + 75);
      ammo = 10;
      range = 3;
      move = 1;
      break;
    case "Jarl":
      hp = Math.floor(Math.random() * (410 - 360) + 360);
      maxHp = hp;
      attack = Math.floor(Math.random() * (290 - 250) + 250);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Viking Raider":
      hp = Math.floor(Math.random() * (240 - 190) + 190);
      maxHp = hp;
      attack = Math.floor(Math.random() * (185 - 150) + 150);
      ammo = 0;
      range = 1;
      move = 2;
      break;
    case "Berserker":
      hp = Math.floor(Math.random() * (280 - 220) + 220);
      maxHp = hp;
      attack = Math.floor(Math.random() * (250 - 210) + 210);
      ammo = 0;
      range = 1;
      move = 2;
      break;
    case "Shieldmaiden":
      hp = Math.floor(Math.random() * (260 - 210) + 210);
      maxHp = hp;
      attack = Math.floor(Math.random() * (155 - 125) + 125);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Viking Archer":
      hp = Math.floor(Math.random() * (160 - 120) + 120);
      maxHp = hp;
      attack = Math.floor(Math.random() * (95 - 70) + 70);
      ammo = 10;
      range = 3;
      move = 1;
      break;
    case "Scout":
      hp = Math.floor(Math.random() * (200 - 150) + 150);
      maxHp = hp;
      attack = Math.floor(Math.random() * (140 - 110) + 110);
      ammo = 0;
      range = 1;
      move = 3;
      break;
    case "King":
      hp = Math.floor(Math.random() * (470 - 430) + 430);
      maxHp = hp;
      attack = Math.floor(Math.random() * (250 - 220) + 220);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Knight":
      hp = Math.floor(Math.random() * (330 - 280) + 280);
      maxHp = hp;
      attack = Math.floor(Math.random() * (160 - 130) + 130);
      ammo = 0;
      range = 1;
      move = 3;
      break;
    case "Man-at-Arms":
      hp = Math.floor(Math.random() * (380 - 320) + 320);
      maxHp = hp;
      attack = Math.floor(Math.random() * (145 - 115) + 115);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Spearman":
      hp = Math.floor(Math.random() * (340 - 290) + 290);
      maxHp = hp;
      attack = Math.floor(Math.random() * (120 - 90) + 90);
      ammo = 0;
      range = 1;
      move = 1;
      break;
    case "Longbowman":
      hp = Math.floor(Math.random() * (200 - 150) + 150);
      maxHp = hp;
      attack = Math.floor(Math.random() * (110 - 85) + 85);
      ammo = 10;
      range = 5;
      move = 1;
      break;
    case "Crossbowman":
      hp = Math.floor(Math.random() * (220 - 170) + 170);
      maxHp = hp;
      attack = Math.floor(Math.random() * (125 - 100) + 100);
      ammo = 8;
      range = 4;
      move = 1;
      break;
    case "Trebuchet":
      hp = Math.floor(Math.random() * (90 - 60) + 60);
      maxHp = hp;
      attack = Math.floor(Math.random() * (190 - 150) + 150);
      ammo = 6;
      range = 7;
      move = 0;
      break;
    default:
      hp = 1;
      maxHp = 1;
      attack = 1;
      ammo = 0;
      range = 1;
      move = 1;
  }

  return ensureRangedAmmo(role, { hp, maxHp, attack, ammo, range, move });
};
