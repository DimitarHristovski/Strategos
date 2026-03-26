import {
    GiSwordman,
    GiArcher,
    GiCavalry,
    GiCrossedSwords,
    GiHelmet,
    GiBo,
    GiAce,
    GiCrown,
  } from "react-icons/gi";
  import { FaCrown } from "react-icons/fa";
  
//
const ensureRangedAmmo = (stats: {
  hp: number;
  maxHp: number;
  attack: number;
  ammo: number;
  range: number;
  move: number;
}) => {
  if (stats.range > 1 && stats.ammo <= 0) {
    return { ...stats, ammo: Math.max(6, Math.min(16, stats.range * 4)) };
  }

  return stats;
};

const getIconComponent = (IconComponent: React.ElementType) => () => <IconComponent />;

// Function to merge troops of the same type
export const mergeTroops = (troops: any[]) => {
  const mergedTroops: any[] = [];
  const processedTroops = new Set<string>();

  // Helper function to check if two troops are adjacent
  const areAdjacent = (a: any, b: any) => {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  };

  // Find the first pair of adjacent troops of the same type to merge
  let foundMerge = false;
  
  for (const troop1 of troops) {
    if (processedTroops.has(troop1.id) || foundMerge) continue;
    
    for (const troop2 of troops) {
      if (processedTroops.has(troop2.id) || troop1.id === troop2.id) continue;
      
      // Check if troops are adjacent and can be merged
      if (areAdjacent(troop1, troop2) && 
          troop1.team === troop2.team && 
          troop1.role === troop2.role) {
        
        // Merge these two troops
        const mergedTroop = { ...troop1 };
        mergedTroop.hp = troop1.hp + troop2.hp;
        mergedTroop.maxHp = troop1.maxHp + troop2.maxHp;
        mergedTroop.attack = Math.floor((troop1.attack + troop2.attack) * 1.5); // Bonus for merging
        mergedTroop.id = `${mergedTroop.team}_merged_${mergedTroop.role}_${Date.now()}`;
        
        // Position the merged troop at the center of the two troops
        mergedTroop.x = Math.round((troop1.x + troop2.x) / 2);
        mergedTroop.y = Math.round((troop1.y + troop2.y) / 2);
        
        mergedTroops.push(mergedTroop);
        processedTroops.add(troop1.id);
        processedTroops.add(troop2.id);
        foundMerge = true;
        break;
      }
    }
    
    if (foundMerge) break;
  }
  
  // Add all remaining unprocessed troops
  troops.forEach(troop => {
    if (!processedTroops.has(troop.id)) {
      mergedTroops.push(troop);
    }
  });

  return mergedTroops;
};

// Function to generate random stats based on role
const generateRandomStats = (role: string) => {
  let hp, maxHp, attack, ammo, range, move;

  switch (role) {
    // Roman Units
    case "Roman King":
      hp = Math.floor(Math.random() * (440 - 400) + 400);
      maxHp = hp;
      attack = Math.floor(Math.random() * (310 - 280) + 280);
      ammo = 0; // Melee unit
      range = 1;
      move = 1;
      break;
      case "Legionary":
        hp = Math.floor(Math.random() * (300 - 200) + 200);
        maxHp = hp;
        attack = Math.floor(Math.random() * (150 - 100) + 100);
        ammo = 0; // Melee unit
        range = 1;
        move = 1;
        break;
    case "Centurion":
      hp = Math.floor(Math.random() * (400 - 300) + 300);
      maxHp = hp;
      attack = Math.floor(Math.random() * (200 - 150) + 150);
      ammo = 0; // Melee unit
      range = 1;
      move = 1;
      break;
    case "Archer":
      hp = Math.floor(Math.random() * (200 - 100) + 100);
      maxHp = hp;
      attack = Math.floor(Math.random() * (100 - 50) + 50);
      ammo = 10; // Ranged unit with 10 shots
      range = 3;
      move = 1;
      break;
    case "Cavalry":
      hp = Math.floor(Math.random() * (250 - 200) + 200);
      maxHp = hp;
      attack = Math.floor(Math.random() * (150 - 100) + 100);
      ammo = 0; // Melee unit
      range = 1;
      move = 3;
      break;
    case "Praetorian":
      hp = Math.floor(Math.random() * (500 - 400) + 400);
      maxHp = hp;
      attack = Math.floor(Math.random() * (250 - 200) + 200);
      ammo = 0; // Melee unit
      range = 1;
      move = 1;
      break;
    case "Ballista":
      hp = Math.floor(Math.random() * (50 - 10) + 10);
      maxHp = hp;
      attack = Math.floor(Math.random() * (100 - 50) + 50);
      ammo = 10; // Ranged unit with 10 shots
      range = 6;
      move = 0;
      break;
    case "Scorpion":
      hp = Math.floor(Math.random() * (20 - 10) + 10);
      maxHp = hp;
      attack = Math.floor(Math.random() * (80 - 30) + 30);
      ammo = 10; // Ranged unit with 10 shots
      range = 3;
      move = 1;
      break;
    case "Auxiliary":
      hp = Math.floor(Math.random() * (180 - 130) + 130);
      maxHp = hp;
      attack = Math.floor(Math.random() * (120 - 80) + 80);
      ammo = 0; // Melee unit
      range = 1;
      move = 1;
      break;
    case "Velites":
      hp = Math.floor(Math.random() * (100 - 60) + 60);
      maxHp = hp;
      attack = Math.floor(Math.random() * (80 - 40) + 40);
      ammo = 10; // Ranged unit with 10 shots
      range = 3;
      move = 1;
      break;
    case "Triarii":
      hp = Math.floor(Math.random() * (350 - 250) + 250);
      maxHp = hp;
      attack = Math.floor(Math.random() * (180 - 130) + 130);
      ammo = 0; // Melee unit
      range = 1;
      move = 1;
      break;
      // Barbarian Units
    case "Barbarian Warrior":
      hp = Math.floor(Math.random() * (300 - 270) + 270);
      maxHp = hp;
      attack = Math.floor(Math.random() * (150 - 100) + 100);
      ammo = 0; // Melee unit
      range = 1;
      move = 1;
      break;
      case "Barbarian Archer":
        hp = Math.floor(Math.random() * (150 - 100) + 100);
        maxHp = hp;
        attack = Math.floor(Math.random() * (100 - 50) + 50);
        ammo = 10; // Ranged unit with 10 shots
        range = 3;
        move = 1;
        break;
      case "Barbarian Chief":
        hp = Math.floor(Math.random() * (440 - 400) + 400);
        maxHp = hp;
        attack = Math.floor(Math.random() * (310 - 280) + 280);
        ammo = 0; // Melee unit
        range = 1;
        move = 1;
        break;
        case "Barbarian Berserker":
          hp = Math.floor(Math.random() * (350 - 300) + 300);
          maxHp = hp;
          attack = Math.floor(Math.random() * (250 - 200) + 200);
          ammo = 0; // Melee unit
          range = 1;
          move = 2;
          break;
       
      case "Barbarian Scout":
        hp = Math.floor(Math.random() * (300 - 250) + 250);
        maxHp = hp;
        attack = Math.floor(Math.random() * (250 - 200) + 200);
        ammo = 5; // Melee unit
        range = 3;
        move = 3;
        break;
      case "Barbarian Shaman":
        hp = Math.floor(Math.random() * (200 - 150) + 150);
        maxHp = hp;
        attack = Math.floor(Math.random() * (180 - 130) + 130);
        ammo = 10; // Ranged unit with 10 shots
        range = 3;
        move = 1;
        break;
      case "Barbarian Axeman":
        hp = Math.floor(Math.random() * (400 - 300) + 300);
        maxHp = hp;
        attack = Math.floor(Math.random() * (200 - 150) + 150);
        ammo = 0; // Melee unit
        range = 1;
        move = 1;
        break;
      case "Barbarian Spearman":
        hp = Math.floor(Math.random() * (250 - 200) + 200);
        maxHp = hp;
        attack = Math.floor(Math.random() * (120 - 80) + 80);
        ammo = 0; // Melee unit
        range = 1;
        move = 1;
        break;
      case "Barbarian Raider":
        hp = Math.floor(Math.random() * (180 - 130) + 130);
        maxHp = hp;
        attack = Math.floor(Math.random() * (160 - 110) + 110);
        ammo = 0; // Melee unit
        range = 1;
        move = 2;
        break;
      case "Barbarian Warlord":
        hp = Math.floor(Math.random() * (600 - 450) + 450);
        maxHp = hp;
        attack = Math.floor(Math.random() * (300 - 250) + 250);
        ammo = 0; // Melee unit
        range = 1;
        move = 1;
        break;
        // === Greek / Macedonian Units ===
case "Hoplite":
  hp = Math.floor(Math.random() * (320 - 240) + 240);
  maxHp = hp;
  attack = Math.floor(Math.random() * (150 - 110) + 110);
  ammo = 0;        // spear + shield wall
  range = 1;
  move = 1;
  break;

case "Phalangite": // sarissa phalanx
  hp = Math.floor(Math.random() * (360 - 280) + 280);
  maxHp = hp;
  attack = Math.floor(Math.random() * (170 - 130) + 130);
  ammo = 0;
  range = 2;       // long reach of sarissa
  move = 1;        // slow formation
  break;

case "Hypaspist":
  hp = Math.floor(Math.random() * (340 - 260) + 260);
  maxHp = hp;
  attack = Math.floor(Math.random() * (200 - 150) + 150);
  ammo = 0;        // elite guard, flexible
  range = 1;
  move = 2;        // quicker than phalanx
  break;

case "Companion Cavalry":
  hp = Math.floor(Math.random() * (300 - 240) + 240);
  maxHp = hp;
  attack = Math.floor(Math.random() * (230 - 180) + 180);
  ammo = 0;        // shock cavalry
  range = 1;
  move = 3;
  break;

case "Thessalian Cavalry":
  hp = Math.floor(Math.random() * (280 - 220) + 220);
  maxHp = hp;
  attack = Math.floor(Math.random() * (200 - 150) + 150);
  ammo = 0;
  range = 1;
  move = 3;
  break;

case "Peltast":
  hp = Math.floor(Math.random() * (180 - 120) + 120);
  maxHp = hp;
  attack = Math.floor(Math.random() * (110 - 70) + 70);
  ammo = 12;       // javelins
  range = 2;
  move = 2;
  break;

case "Thureophoroi":
  hp = Math.floor(Math.random() * (220 - 160) + 160);
  maxHp = hp;
  attack = Math.floor(Math.random() * (140 - 100) + 100);
  ammo = 6;        // mixed javelin + spear
  range = 2;
  move = 2;
  break;

case "Cretan Archer":
  hp = Math.floor(Math.random() * (170 - 120) + 120);
  maxHp = hp;
  attack = Math.floor(Math.random() * (130 - 90) + 90);
  ammo = 12;       // elite archers
  range = 4;
  move = 1;
  break;

case "Rhodian Slinger":
  hp = Math.floor(Math.random() * (160 - 110) + 110);
  maxHp = hp;
  attack = Math.floor(Math.random() * (120 - 80) + 80);
  ammo = 14;       // high ammo, long arc
  range = 4;
  move = 1;
  break;

case "Greek Catapult":
  hp = Math.floor(Math.random() * (60 - 30) + 30);
  maxHp = hp;
  attack = Math.floor(Math.random() * (160 - 110) + 110);
  ammo = 8;        // heavy stones/bolts
  range = 6;
  move = 0;        // static
  break;

case "Polybolos":
  hp = Math.floor(Math.random() * (70 - 40) + 40);
  maxHp = hp;
  attack = Math.floor(Math.random() * (140 - 90) + 90);
  ammo = 16;       // repeating ballista
  range = 5;
  move = 0;
  break;

case "Agema":
  hp = Math.floor(Math.random() * (380 - 300) + 300);
  maxHp = hp;
  attack = Math.floor(Math.random() * (220 - 170) + 170);
  ammo = 0;        // elite assault infantry
  range = 1;
  move = 2;
  break;

case "Greek Standard Bearer":
  hp = Math.floor(Math.random() * (240 - 200) + 200);
  maxHp = hp;
  attack = Math.floor(Math.random() * (110 - 80) + 80);
  ammo = 0;
  range = 1;
  move = 1;
  break;

  case "Macedonian King":
  hp = Math.floor(Math.random() * (440 - 400) + 400);
  maxHp = hp;
  attack = Math.floor(Math.random() * (310 - 280) + 280);
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
  move = 2;
  break;

case "Celtic Warrior":
  hp = Math.floor(Math.random() * (250 - 200) + 200);
  maxHp = hp;
  attack = Math.floor(Math.random() * (145 - 115) + 115);
  ammo = 0;
  range = 1;
  move = 2;
  break;

case "Celtic Spearman":
  hp = Math.floor(Math.random() * (230 - 180) + 180);
  maxHp = hp;
  attack = Math.floor(Math.random() * (125 - 95) + 95);
  ammo = 0;
  range = 1;
  move = 2;
  break;

case "Celtic Archer":
  hp = Math.floor(Math.random() * (160 - 120) + 120);
  maxHp = hp;
  attack = Math.floor(Math.random() * (100 - 75) + 75);
  ammo = 10;
  range = 3;
  move = 2;
  break;

case "Celtic Cavalry":
  hp = Math.floor(Math.random() * (230 - 180) + 180);
  maxHp = hp;
  attack = Math.floor(Math.random() * (150 - 120) + 120);
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

case "Sacred Band":
  hp = Math.floor(Math.random() * (360 - 300) + 300);
  maxHp = hp;
  attack = Math.floor(Math.random() * (180 - 145) + 145);
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
  range = 2;
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

case "Berserker":
  hp = Math.floor(Math.random() * (280 - 220) + 220);
  maxHp = hp;
  attack = Math.floor(Math.random() * (250 - 210) + 210);
  ammo = 0;
  range = 1;
  move = 2;
  break;

case "Longship Crew":
  hp = Math.floor(Math.random() * (250 - 200) + 200);
  maxHp = hp;
  attack = Math.floor(Math.random() * (165 - 135) + 135);
  ammo = 0;
  range = 1;
  move = 2;
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
  move = 2;
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

case "Siege Tower":
  hp = Math.floor(Math.random() * (380 - 320) + 320);
  maxHp = hp;
  attack = Math.floor(Math.random() * (120 - 90) + 90);
  ammo = 0;
  range = 1;
  move = 0;
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

  return ensureRangedAmmo({ hp, maxHp, attack, ammo, range, move });
}; 

const createUnit = (
  id: string,
  team: string,
  name: string,
  role: string,
  x: number,
  y: number,
  Icon: React.ElementType | string
) => ({
  id,
  team,
  name,
  ...generateRandomStats(role),
  x,
  y,
  role,
  Icon: typeof Icon === "string" ? Icon : getIconComponent(Icon)
});

export const formations = {
  Phalanx: [
    createUnit("roman_king", "Romans", "Roman King", "Roman King", 3, 0, GiCrown),
    createUnit("roman_archer_left", "Romans", "Archer", "Archer", 2, 0, GiArcher),
    createUnit("roman_archer_right", "Romans", "Archer", "Archer", 5, 0, GiArcher),
    createUnit("roman_cavalry_left", "Romans", "Cavalry", "Cavalry", 1, 0, GiCavalry),
    createUnit("roman_cavalry_right", "Romans", "Cavalry", "Cavalry", 6, 0, GiCavalry),
    createUnit("roman_praetorian", "Romans", "Praetorian", "Praetorian", 4, 0, GiHelmet),
    createUnit("roman_ballista_left", "Romans", "Ballista", "Ballista", 0, 0, GiCrossedSwords),
    createUnit("roman_ballista_right", "Romans", "Ballista", "Ballista", 7, 0, GiCrossedSwords),
    createUnit("roman_legionary_1", "Romans", "Legionary", "Legionary", 0, 1, GiSwordman),
    createUnit("roman_legionary_2", "Romans", "Legionary", "Legionary", 1, 1, GiSwordman),
    createUnit("roman_legionary_3", "Romans", "Legionary", "Legionary", 2, 1, GiSwordman),
    createUnit("roman_legionary_4", "Romans", "Legionary", "Legionary", 3, 1, GiSwordman),
    createUnit("roman_legionary_5", "Romans", "Legionary", "Legionary", 4, 1, GiSwordman),
    createUnit("roman_legionary_6", "Romans", "Legionary", "Legionary", 5, 1, GiSwordman),
    createUnit("roman_legionary_7", "Romans", "Legionary", "Legionary", 6, 1, GiSwordman),
    createUnit("roman_legionary_8", "Romans", "Legionary", "Legionary", 7, 1, GiSwordman),
    createUnit("barbarian_chief", "Barbarians", "Barbarian Chief", "Barbarian Chief", 3, 7, FaCrown),
    createUnit("barbarian_archer_left", "Barbarians", "Barbarian Archer", "Barbarian Archer", 2, 7, GiArcher),
    createUnit("barbarian_archer_right", "Barbarians", "Barbarian Archer", "Barbarian Archer", 5, 7, GiArcher),
    createUnit("barbarian_scout_left", "Barbarians", "Barbarian Scout", "Barbarian Scout", 1, 7, GiCavalry),
    createUnit("barbarian_scout_right", "Barbarians", "Barbarian Scout", "Barbarian Scout", 6, 7, GiCavalry),
    createUnit("barbarian_berserker", "Barbarians", "Barbarian Berserker", "Barbarian Berserker", 4, 7, GiCrossedSwords),
    createUnit("barbarian_axeman_left", "Barbarians", "Barbarian Axeman", "Barbarian Axeman", 0, 7, GiCrossedSwords),
    createUnit("barbarian_axeman_right", "Barbarians", "Barbarian Axeman", "Barbarian Axeman", 7, 7, GiCrossedSwords),
    createUnit("barbarian_warrior_1", "Barbarians", "Barbarian Warrior", "Barbarian Warrior", 0, 6, GiAce),
    createUnit("barbarian_warrior_2", "Barbarians", "Barbarian Warrior", "Barbarian Warrior", 1, 6, GiAce),
    createUnit("barbarian_warrior_3", "Barbarians", "Barbarian Warrior", "Barbarian Warrior", 2, 6, GiAce),
    createUnit("barbarian_warrior_4", "Barbarians", "Barbarian Warrior", "Barbarian Warrior", 3, 6, GiAce),
    createUnit("barbarian_warrior_5", "Barbarians", "Barbarian Warrior", "Barbarian Warrior", 4, 6, GiAce),
    createUnit("barbarian_warrior_6", "Barbarians", "Barbarian Warrior", "Barbarian Warrior", 5, 6, GiAce),
    createUnit("barbarian_warrior_7", "Barbarians", "Barbarian Warrior", "Barbarian Warrior", 6, 6, GiAce),
    createUnit("barbarian_warrior_8", "Barbarians", "Barbarian Warrior", "Barbarian Warrior", 7, 6, GiAce)
  ],
  Arch: [
    createUnit("greek_king", "Greeks", "Macedonian King", "Macedonian King", 3, 0, "👑"),
    createUnit("greek_hoplite_1", "Greeks", "Hoplite", "Hoplite", 1, 0, "⚔️"),
    createUnit("greek_hoplite_2", "Greeks", "Hoplite", "Hoplite", 2, 0, "⚔️"),
    createUnit("greek_hoplite_3", "Greeks", "Hoplite", "Hoplite", 4, 0, "⚔️"),
    createUnit("greek_hoplite_4", "Greeks", "Hoplite", "Hoplite", 5, 0, "⚔️"),
    createUnit("greek_archer_1", "Greeks", "Cretan Archer", "Cretan Archer", 2, 1, "🏹"),
    createUnit("greek_archer_2", "Greeks", "Cretan Archer", "Cretan Archer", 4, 1, "🏹"),
    createUnit("greek_cavalry", "Greeks", "Companion Cavalry", "Companion Cavalry", 3, 2, "🐎"),
    createUnit("celt_king", "Celts", "Celtic King", "Celtic King", 3, 7, "👑"),
    createUnit("celt_warrior_1", "Celts", "Celtic Warrior", "Celtic Warrior", 1, 7, "⚔️"),
    createUnit("celt_warrior_2", "Celts", "Celtic Warrior", "Celtic Warrior", 2, 7, "⚔️"),
    createUnit("celt_warrior_3", "Celts", "Celtic Warrior", "Celtic Warrior", 4, 7, "⚔️"),
    createUnit("celt_warrior_4", "Celts", "Celtic Warrior", "Celtic Warrior", 5, 7, "⚔️"),
    createUnit("celt_archer_1", "Celts", "Celtic Archer", "Celtic Archer", 2, 6, "🏹"),
    createUnit("celt_archer_2", "Celts", "Celtic Archer", "Celtic Archer", 4, 6, "🏹"),
    createUnit("celt_cavalry", "Celts", "Celtic Cavalry", "Celtic Cavalry", 3, 5, "🐎")
  ],
  Testudo: [
    createUnit("carthage_general", "Carthage", "Carthaginian General", "Carthaginian General", 3, 0, "👑"),
    createUnit("sacred_band", "Carthage", "Sacred Band", "Sacred Band", 2, 1, "🛡️"),
    createUnit("libyan_1", "Carthage", "Libyan Infantry", "Libyan Infantry", 3, 1, "⚔️"),
    createUnit("libyan_2", "Carthage", "Libyan Infantry", "Libyan Infantry", 4, 1, "⚔️"),
    createUnit("libyan_3", "Carthage", "Libyan Infantry", "Libyan Infantry", 1, 2, "⚔️"),
    createUnit("numidian", "Carthage", "Numidian Cavalry", "Numidian Cavalry", 5, 2, "🐎"),
    createUnit("slinger", "Carthage", "Balearic Slinger", "Balearic Slinger", 3, 3, "🏹"),
    createUnit("elephant", "Carthage", "War Elephant", "War Elephant", 4, 3, "🐘"),
    createUnit("jarl", "Vikings", "Jarl", "Jarl", 3, 7, "👑"),
    createUnit("shieldmaiden_1", "Vikings", "Shieldmaiden", "Shieldmaiden", 2, 6, "🛡️"),
    createUnit("shieldmaiden_2", "Vikings", "Shieldmaiden", "Shieldmaiden", 3, 6, "🛡️"),
    createUnit("raider_1", "Vikings", "Viking Raider", "Viking Raider", 4, 6, "🪓"),
    createUnit("raider_2", "Vikings", "Viking Raider", "Viking Raider", 1, 5, "🪓"),
    createUnit("raider_3", "Vikings", "Viking Raider", "Viking Raider", 5, 5, "🪓"),
    createUnit("viking_archer", "Vikings", "Viking Archer", "Viking Archer", 3, 4, "🏹"),
    createUnit("viking_scout", "Vikings", "Scout", "Scout", 4, 4, "🐎")
  ],
  Circle: [
    createUnit("germanic_king", "Germanic", "Germanic King", "Germanic King", 3, 0, "👑"),
    createUnit("germanic_warrior_1", "Germanic", "Germanic Warrior", "Germanic Warrior", 1, 0, "🪓"),
    createUnit("germanic_warrior_2", "Germanic", "Germanic Warrior", "Germanic Warrior", 2, 0, "🪓"),
    createUnit("germanic_warrior_3", "Germanic", "Germanic Warrior", "Germanic Warrior", 4, 0, "🪓"),
    createUnit("germanic_warrior_4", "Germanic", "Germanic Warrior", "Germanic Warrior", 5, 0, "🪓"),
    createUnit("germanic_archer_1", "Germanic", "Germanic Archer", "Germanic Archer", 2, 1, "🏹"),
    createUnit("germanic_archer_2", "Germanic", "Germanic Archer", "Germanic Archer", 4, 1, "🏹"),
    createUnit("wolf_rider", "Germanic", "Germanic Wolf Rider", "Germanic Wolf Rider", 3, 2, "🐎"),
    createUnit("teuton_king", "Teutons", "King", "King", 3, 7, "👑"),
    createUnit("manarms_1", "Teutons", "Man-at-Arms", "Man-at-Arms", 1, 7, "⚔️"),
    createUnit("manarms_2", "Teutons", "Man-at-Arms", "Man-at-Arms", 2, 7, "⚔️"),
    createUnit("manarms_3", "Teutons", "Man-at-Arms", "Man-at-Arms", 4, 7, "⚔️"),
    createUnit("manarms_4", "Teutons", "Man-at-Arms", "Man-at-Arms", 5, 7, "⚔️"),
    createUnit("longbow_1", "Teutons", "Longbowman", "Longbowman", 2, 6, "🏹"),
    createUnit("longbow_2", "Teutons", "Longbowman", "Longbowman", 4, 6, "🏹"),
    createUnit("knight", "Teutons", "Knight", "Knight", 3, 5, "🐎")
  ],
  Staggered: [
    createUnit("roman_legionary_a", "Romans", "Legionary", "Legionary", 1, 0, GiSwordman),
    createUnit("roman_legionary_b", "Romans", "Legionary", "Legionary", 3, 0, GiSwordman),
    createUnit("roman_legionary_c", "Romans", "Legionary", "Legionary", 5, 0, GiSwordman),
    createUnit("roman_centurion", "Romans", "Centurion", "Centurion", 2, 1, GiHelmet),
    createUnit("roman_legionary_d", "Romans", "Legionary", "Legionary", 4, 1, GiSwordman),
    createUnit("roman_archer_a", "Romans", "Archer", "Archer", 1, 2, GiArcher),
    createUnit("roman_archer_b", "Romans", "Archer", "Archer", 3, 2, GiArcher),
    createUnit("roman_archer_c", "Romans", "Archer", "Archer", 5, 2, GiArcher),
    createUnit("roman_cavalry_a", "Romans", "Cavalry", "Cavalry", 2, 3, GiCavalry),
    createUnit("roman_cavalry_b", "Romans", "Cavalry", "Cavalry", 4, 3, GiCavalry),
    createUnit("carthage_general_b", "Carthage", "Carthaginian General", "Carthaginian General", 2, 7, "👑"),
    createUnit("libyan_a", "Carthage", "Libyan Infantry", "Libyan Infantry", 1, 7, "⚔️"),
    createUnit("libyan_b", "Carthage", "Libyan Infantry", "Libyan Infantry", 3, 7, "⚔️"),
    createUnit("libyan_c", "Carthage", "Libyan Infantry", "Libyan Infantry", 5, 7, "⚔️"),
    createUnit("sacred_band_b", "Carthage", "Sacred Band", "Sacred Band", 4, 6, "🛡️"),
    createUnit("archer_carthage_a", "Carthage", "Carthaginian Archer", "Carthaginian Archer", 1, 5, "🏹"),
    createUnit("archer_carthage_b", "Carthage", "Carthaginian Archer", "Carthaginian Archer", 3, 5, "🏹"),
    createUnit("slinger_b", "Carthage", "Balearic Slinger", "Balearic Slinger", 5, 5, "🏹"),
    createUnit("numidian_a", "Carthage", "Numidian Cavalry", "Numidian Cavalry", 2, 4, "🐎"),
    createUnit("elephant_b", "Carthage", "War Elephant", "War Elephant", 4, 4, "🐘")
  ],
  Delta: [
    createUnit("greek_king_delta", "Greeks", "Macedonian King", "Macedonian King", 3, 0, "👑"),
    createUnit("hoplite_1", "Greeks", "Hoplite", "Hoplite", 1, 0, "⚔️"),
    createUnit("hoplite_2", "Greeks", "Hoplite", "Hoplite", 2, 0, "⚔️"),
    createUnit("hoplite_3", "Greeks", "Hoplite", "Hoplite", 4, 0, "⚔️"),
    createUnit("hoplite_4", "Greeks", "Hoplite", "Hoplite", 5, 0, "⚔️"),
    createUnit("greek_archer_delta_1", "Greeks", "Cretan Archer", "Cretan Archer", 2, 1, "🏹"),
    createUnit("greek_archer_delta_2", "Greeks", "Cretan Archer", "Cretan Archer", 4, 1, "🏹"),
    createUnit("greek_cavalry_delta", "Greeks", "Thessalian Cavalry", "Thessalian Cavalry", 3, 2, "🐎"),
    createUnit("germanic_king_delta", "Germanic", "Germanic King", "Germanic King", 3, 7, "👑"),
    createUnit("germanic_warrior_a", "Germanic", "Germanic Warrior", "Germanic Warrior", 1, 7, "🪓"),
    createUnit("germanic_warrior_b", "Germanic", "Germanic Warrior", "Germanic Warrior", 2, 7, "🪓"),
    createUnit("germanic_warrior_c", "Germanic", "Germanic Warrior", "Germanic Warrior", 4, 7, "🪓"),
    createUnit("germanic_warrior_d", "Germanic", "Germanic Warrior", "Germanic Warrior", 5, 7, "🪓"),
    createUnit("germanic_archer_a", "Germanic", "Germanic Archer", "Germanic Archer", 2, 6, "🏹"),
    createUnit("germanic_archer_b", "Germanic", "Germanic Archer", "Germanic Archer", 4, 6, "🏹"),
    createUnit("wolf_rider_delta", "Germanic", "Germanic Wolf Rider", "Germanic Wolf Rider", 3, 5, "🐎")
  ],
  Tercio: [
    createUnit("celt_king_tercio", "Celts", "Celtic King", "Celtic King", 3, 0, "👑"),
    createUnit("celt_spear_1", "Celts", "Celtic Spearman", "Celtic Spearman", 2, 0, "⚔️"),
    createUnit("celt_spear_2", "Celts", "Celtic Spearman", "Celtic Spearman", 4, 0, "⚔️"),
    createUnit("celt_warrior_t1", "Celts", "Celtic Warrior", "Celtic Warrior", 1, 1, "⚔️"),
    createUnit("celt_warrior_t2", "Celts", "Celtic Warrior", "Celtic Warrior", 3, 1, "⚔️"),
    createUnit("celt_warrior_t3", "Celts", "Celtic Warrior", "Celtic Warrior", 5, 1, "⚔️"),
    createUnit("celt_archer_t", "Celts", "Celtic Archer", "Celtic Archer", 2, 2, "🏹"),
    createUnit("celt_cavalry_t", "Celts", "Celtic Cavalry", "Celtic Cavalry", 4, 2, "🐎"),
    createUnit("jarl_tercio", "Vikings", "Jarl", "Jarl", 3, 7, "👑"),
    createUnit("raider_t1", "Vikings", "Viking Raider", "Viking Raider", 2, 7, "🪓"),
    createUnit("raider_t2", "Vikings", "Viking Raider", "Viking Raider", 4, 7, "🪓"),
    createUnit("raider_t3", "Vikings", "Viking Raider", "Viking Raider", 1, 6, "🪓"),
    createUnit("raider_t4", "Vikings", "Viking Raider", "Viking Raider", 3, 6, "🪓"),
    createUnit("raider_t5", "Vikings", "Viking Raider", "Viking Raider", 5, 6, "🪓"),
    createUnit("viking_archer_t", "Vikings", "Viking Archer", "Viking Archer", 2, 5, "🏹"),
    createUnit("viking_scout_t", "Vikings", "Scout", "Scout", 4, 5, "🐎")
  ],
  Pincer: [
    createUnit("barbarian_king_p", "Barbarians", "Barbarian Chief", "Barbarian Chief", 3, 0, FaCrown),
    createUnit("barbarian_w1_p", "Barbarians", "Barbarian Warrior", "Barbarian Warrior", 1, 0, GiAce),
    createUnit("barbarian_w2_p", "Barbarians", "Barbarian Warrior", "Barbarian Warrior", 2, 0, GiAce),
    createUnit("barbarian_w3_p", "Barbarians", "Barbarian Warrior", "Barbarian Warrior", 4, 0, GiAce),
    createUnit("barbarian_w4_p", "Barbarians", "Barbarian Warrior", "Barbarian Warrior", 5, 0, GiAce),
    createUnit("barbarian_archer_p1", "Barbarians", "Barbarian Archer", "Barbarian Archer", 2, 1, GiBo),
    createUnit("barbarian_archer_p2", "Barbarians", "Barbarian Archer", "Barbarian Archer", 4, 1, GiBo),
    createUnit("barbarian_scout_p", "Barbarians", "Barbarian Scout", "Barbarian Scout", 3, 2, GiCavalry),
    createUnit("teuton_king_p", "Teutons", "King", "King", 3, 7, "👑"),
    createUnit("teuton_spear_1", "Teutons", "Spearman", "Spearman", 1, 7, "⚔️"),
    createUnit("teuton_spear_2", "Teutons", "Spearman", "Spearman", 2, 7, "⚔️"),
    createUnit("teuton_arms_1", "Teutons", "Man-at-Arms", "Man-at-Arms", 4, 7, "⚔️"),
    createUnit("teuton_arms_2", "Teutons", "Man-at-Arms", "Man-at-Arms", 5, 7, "⚔️"),
    createUnit("teuton_longbow_1", "Teutons", "Longbowman", "Longbowman", 2, 6, "🏹"),
    createUnit("teuton_longbow_2", "Teutons", "Longbowman", "Longbowman", 4, 6, "🏹"),
    createUnit("teuton_trebuchet", "Teutons", "Trebuchet", "Trebuchet", 3, 5, "⚔️")
  ]
};