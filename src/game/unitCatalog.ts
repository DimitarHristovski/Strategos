import { getTroopAbilities } from "../Units/troopStats";
import { getTroopMechanicType, isLeaderRole, TROOP_MECHANIC_ICONS, TROOP_MECHANIC_LABELS } from "./battleEngine";
import type { TeamName, TroopCatalogEntry } from "./types";

export const AVAILABLE_TROOPS: Record<TeamName, TroopCatalogEntry[]> = {
  Romans: [
    { role: "Roman King", name: "Roman King", Icon: "👑" },
    { role: "Legionary", name: "Legionary", Icon: "⚔️" },
    { role: "Centurion", name: "Centurion", Icon: "⚔️" },
    { role: "Praetorian", name: "Praetorian", Icon: "⚔️" },
    { role: "Auxiliary", name: "Auxiliary", Icon: "⚔️" },
    { role: "Triarii", name: "Triarii", Icon: "⚔️" },
    { role: "Cavalry", name: "Cavalry", Icon: "🐎" },
    { role: "Archer", name: "Archer", Icon: "🏹" },
    { role: "Velites", name: "Velites", Icon: "🏹" },
    { role: "Ballista", name: "Ballista", Icon: "⚙️" },
    { role: "Scorpion", name: "Scorpion", Icon: "⚙️" },
    { role: "Onager", name: "Onager", Icon: "⚙️" }
  ],
  Barbarians: [
    { role: "Barbarian Chief", name: "Barbarian Chief", Icon: "👑" },
    { role: "Barbarian Warrior", name: "Barbarian Warrior", Icon: "⚔️" },
    { role: "Barbarian Berserker", name: "Barbarian Berserker", Icon: "⚔️" },
    { role: "Barbarian Axeman", name: "Barbarian Axeman", Icon: "⚔️" },
    { role: "Barbarian Spearman", name: "Barbarian Spearman", Icon: "⚔️" },
    { role: "Barbarian Raider", name: "Barbarian Raider", Icon: "⚔️" },
    { role: "Barbarian Warlord", name: "Barbarian Warlord", Icon: "⚔️" },
    { role: "Oathsworn", name: "Oathsworn", Icon: "⚔️" },
    { role: "Barbarian Scout", name: "Barbarian Scout", Icon: "🐎🏹" },
    { role: "Barbarian Noble Rider", name: "Barbarian Noble Rider", Icon: "🐎" },
    { role: "Barbarian Archer", name: "Barbarian Archer", Icon: "🏹" },
    { role: "Barbarian Shaman", name: "Barbarian Shaman", Icon: "🏹" }
  ],
  Greeks: [
    { role: "Macedonian King", name: "Macedonian King", Icon: "👑" },
    { role: "Hoplite", name: "Hoplite", Icon: "⚔️" },
    { role: "Phalangite", name: "Phalangite", Icon: "⚔️" },
    { role: "Hypaspist", name: "Hypaspist", Icon: "⚔️" },
    { role: "Thureophoroi", name: "Thureophoroi", Icon: "⚔️" },
    { role: "Agema", name: "Agema", Icon: "⚔️" },
    { role: "Companion Cavalry", name: "Companion Cavalry", Icon: "🐎" },
    { role: "Thessalian Cavalry", name: "Thessalian Cavalry", Icon: "🐎" },
    { role: "Peltast", name: "Peltast", Icon: "🏹" },
    { role: "Cretan Archer", name: "Cretan Archer", Icon: "🏹" },
    { role: "Greek Catapult", name: "Greek Catapult", Icon: "⚙️" },
    { role: "Polybolos", name: "Polybolos", Icon: "⚙️" }
  ],
  Gauls: [
    { role: "Gallic King", name: "Gallic King", Icon: "👑" },
    { role: "Gallic Warrior", name: "Gallic Warrior", Icon: "⚔️" },
    { role: "Gallic Berserker", name: "Gallic Berserker", Icon: "⚔️" },
    { role: "Gallic Spearman", name: "Gallic Spearman", Icon: "⚔️" },
    { role: "Gallic Oathsworn", name: "Gallic Oathsworn", Icon: "⚔️" },
    { role: "Gaesatae", name: "Gaesatae", Icon: "⚔️" },
    { role: "Fianna", name: "Fianna", Icon: "⚔️" },
    { role: "Gallic Cavalry", name: "Gallic Cavalry", Icon: "🐎" },
    { role: "Gallic Chariot", name: "Gallic Chariot", Icon: "🐎🏹" },
    { role: "Gallic Noble Horseman", name: "Gallic Noble Horseman", Icon: "🐎" },
    { role: "Gallic Archer", name: "Gallic Archer", Icon: "🏹" },
    { role: "Gallic Skirmisher", name: "Gallic Skirmisher", Icon: "🏹" }
  ],
  Germanic: [
    { role: "Germanic King", name: "Germanic King", Icon: "👑" },
    { role: "Germanic Warrior", name: "Germanic Warrior", Icon: "⚔️" },
    { role: "Germanic Spearman", name: "Germanic Spearman", Icon: "⚔️" },
    { role: "Germanic Berserker", name: "Germanic Berserker", Icon: "⚔️" },
    { role: "Germanic Raider", name: "Germanic Raider", Icon: "⚔️" },
    { role: "Chosen Axeman", name: "Chosen Axeman", Icon: "⚔️" },
    { role: "Hearthguard", name: "Hearthguard", Icon: "⚔️" },
    { role: "Germanic Wolf Rider", name: "Germanic Wolf Rider", Icon: "🐎" },
    { role: "Suebi Rider", name: "Suebi Rider", Icon: "🐎" },
    { role: "Gothic Lancer", name: "Gothic Lancer", Icon: "🐎" },
    { role: "Germanic Archer", name: "Germanic Archer", Icon: "🏹" },
    { role: "Tribal Slinger", name: "Tribal Slinger", Icon: "🏹" }
  ],
  Carthage: [
    { role: "Carthaginian General", name: "Carthaginian General", Icon: "👑" },
    { role: "Libyan Infantry", name: "Libyan Infantry", Icon: "⚔️" },
    { role: "Sacred Band", name: "Sacred Band", Icon: "⚔️" },
    { role: "Liby-Phoenician Infantry", name: "Liby-Phoenician Infantry", Icon: "⚔️" },
    { role: "Iberian Swordsman", name: "Iberian Swordsman", Icon: "⚔️" },
    { role: "African Pikeman", name: "African Pikeman", Icon: "⚔️" },
    { role: "Punic Spearman", name: "Punic Spearman", Icon: "⚔️" },
    { role: "Numidian Cavalry", name: "Numidian Cavalry", Icon: "🐎" },
    { role: "War Elephant", name: "War Elephant", Icon: "🐘" },
    { role: "Balearic Slinger", name: "Balearic Slinger", Icon: "🏹" },
    { role: "Carthaginian Archer", name: "Carthaginian Archer", Icon: "🏹" },
    { role: "Elephant Archer", name: "Elephant Archer", Icon: "🐘🏹" }
  ],
  Egypt: [
    { role: "Pharaoh", name: "Pharaoh", Icon: "👑" },
    { role: "Egyptian Warrior", name: "Egyptian Warrior", Icon: "⚔️" },
    { role: "Medjay", name: "Medjay", Icon: "⚔️" },
    { role: "Khopesh Warrior", name: "Khopesh Warrior", Icon: "⚔️" },
    { role: "Shield Bearer", name: "Shield Bearer", Icon: "⚔️" },
    { role: "Royal Guard", name: "Royal Guard", Icon: "⚔️" },
    { role: "Egyptian Archer", name: "Egyptian Archer", Icon: "🏹" },
    { role: "Nubian Archer", name: "Nubian Archer", Icon: "🏹" },
    { role: "War Chariot", name: "War Chariot", Icon: "🐎" },
    { role: "Royal Chariot", name: "Royal Chariot", Icon: "🐎🏹" },
    { role: "Desert Scout", name: "Desert Scout", Icon: "🐎🏹" },
    { role: "Egyptian Catapult", name: "Egyptian Catapult", Icon: "⚙️" }
  ],
  Thracians: [
    { role: "Thracian King", name: "Thracian King", Icon: "👑" },
    { role: "Thracian Warrior", name: "Thracian Warrior", Icon: "⚔️" },
    { role: "Rhomphaia Fighter", name: "Rhomphaia Fighter", Icon: "⚔️" },
    { role: "Falx Warrior", name: "Falx Warrior", Icon: "⚔️" },
    { role: "Thracian Spearman", name: "Thracian Spearman", Icon: "⚔️" },
    { role: "Thracian Guard", name: "Thracian Guard", Icon: "⚔️" },
    { role: "Thracian Peltast", name: "Thracian Peltast", Icon: "🏹" },
    { role: "Thracian Archer", name: "Thracian Archer", Icon: "🏹" },
    { role: "Thracian Rider", name: "Thracian Rider", Icon: "🐎" },
    { role: "Thracian Noble Rider", name: "Thracian Noble Rider", Icon: "🐎" },
    { role: "War Drummer", name: "War Drummer", Icon: "🥁" },
    { role: "Thracian Catapult", name: "Thracian Catapult", Icon: "⚙️" }
  ],
  Dacians: [
    { role: "Dacian King", name: "Dacian King", Icon: "👑" },
    { role: "Dacian Warrior", name: "Dacian Warrior", Icon: "⚔️" },
    { role: "Falxman", name: "Falxman", Icon: "⚔️" },
    { role: "Dacian Spearman", name: "Dacian Spearman", Icon: "⚔️" },
    { role: "Dacian Shield Bearer", name: "Dacian Shield Bearer", Icon: "⚔️" },
    { role: "Dacian Guard", name: "Dacian Guard", Icon: "⚔️" },
    { role: "Dacian Slinger", name: "Dacian Slinger", Icon: "🏹" },
    { role: "Dacian Archer", name: "Dacian Archer", Icon: "🏹" },
    { role: "Dacian Rider", name: "Dacian Rider", Icon: "🐎" },
    { role: "Dacian Noble Rider", name: "Dacian Noble Rider", Icon: "🐎" },
    { role: "War Horn", name: "War Horn", Icon: "📯" },
    { role: "Dacian Catapult", name: "Dacian Catapult", Icon: "⚙️" }
  ],
  Parthians: [
    { role: "Parthian King", name: "Parthian King", Icon: "👑" },
    { role: "Parthian Warrior", name: "Parthian Warrior", Icon: "⚔️" },
    { role: "Parthian Spearman", name: "Parthian Spearman", Icon: "⚔️" },
    { role: "Parthian Cataphract", name: "Cataphract", Icon: "🐎" },
    { role: "Parthian Noble Rider", name: "Parthian Noble Rider", Icon: "🐎" },
    { role: "Horse Archer", name: "Horse Archer", Icon: "🏹🐎" },
    { role: "Elite Horse Archer", name: "Elite Horse Archer", Icon: "🏹🐎" },
    { role: "Parthian Archer", name: "Parthian Archer", Icon: "🏹" },
    { role: "Scout Rider", name: "Scout Rider", Icon: "🐎" },
    { role: "Camel Rider", name: "Camel Rider", Icon: "🐪" },
    { role: "Camel Rider Archer", name: "Camel Rider Archer", Icon: "🐪🏹" },
    { role: "Parthian Ballista", name: "Parthian Ballista", Icon: "⚙️" }
  ],
  Seleucids: [
    { role: "Seleucid King", name: "Seleucid King", Icon: "👑" },
    { role: "Seleucid Phalangite", name: "Phalangite", Icon: "⚔️" },
    { role: "Silver Shield Infantry", name: "Silver Shield Infantry", Icon: "⚔️" },
    { role: "Thorakitai", name: "Thorakitai", Icon: "⚔️" },
    { role: "Eastern Spearman", name: "Eastern Spearman", Icon: "⚔️" },
    { role: "Seleucid War Elephant", name: "War Elephant", Icon: "🐘" },
    { role: "Seleucid Cataphract", name: "Cataphract", Icon: "🐎" },
    { role: "Seleucid Light Cavalry", name: "Light Cavalry", Icon: "🐎" },
    { role: "Eastern Archer", name: "Eastern Archer", Icon: "🏹" },
    { role: "Seleucid Slinger", name: "Slinger", Icon: "🏹" },
    { role: "Seleucid Elephant Archer", name: "Seleucid Elephant Archer", Icon: "🐘🏹" },
    { role: "Seleucid Catapult", name: "Seleucid Catapult", Icon: "⚙️" }
  ],
  Vikings: [
    { role: "Jarl", name: "Viking Jarl", Icon: "👑" },
    { role: "Viking Raider", name: "Viking Raider", Icon: "⚔️" },
    { role: "Berserker", name: "Berserker", Icon: "⚔️" },
    { role: "Shieldmaiden", name: "Shieldmaiden", Icon: "⚔️" },
    { role: "Huscarl", name: "Huscarl", Icon: "⚔️" },
    { role: "Bondi Spearman", name: "Bondi Spearman", Icon: "⚔️" },
    { role: "Hirdman", name: "Hirdman", Icon: "⚔️" },
    { role: "Ulfhednar", name: "Ulfhednar", Icon: "⚔️" },
    { role: "Varangian Guard", name: "Varangian Guard", Icon: "⚔️" },
    { role: "Jomsviking", name: "Jomsviking", Icon: "⚔️" },
    { role: "Scout", name: "Scout", Icon: "🐎🏹" },
    { role: "Viking Archer", name: "Viking Archer", Icon: "🏹" }
  ]
};

export const ICON_MAP = {
  GiSwordman: "⚔️",
  GiArcher: "🏹",
  GiCavalry: "🐎",
  GiCrossedSwords: "⚔️",
  GiHelmet: "🪖",
  GiBo: "🏹",
  GiAce: "🪓",
  FaCrown: "👑"
};

const isHybridMountedRangedUnit = (unit: any) => {
  const normalizedRole = String(unit?.role ?? unit?.name ?? "").toLowerCase();
  const mountedKeywords = ["cavalry", "chariot", "rider", "scout", "knight", "elephant", "horse", "camel", "cataphract"];
  const hasMountedTrait = mountedKeywords.some((keyword) => normalizedRole.includes(keyword));
  return hasMountedTrait && (unit?.ammo ?? 0) > 0 && (unit?.range ?? 1) > 1;
};

export const getTroopTypeDisplay = (unit: any) => {
  if (isHybridMountedRangedUnit(unit)) {
    return {
      icon: "🐎🏹",
      label: "Hybrid",
      type: "hybrid"
    } as const;
  }

  const troopType = getTroopMechanicType(unit);
  return {
    icon: TROOP_MECHANIC_ICONS[troopType],
    label: TROOP_MECHANIC_LABELS[troopType],
    type: troopType
  } as const;
};

export const getTroopSearchKeywords = (unit: any, team?: TeamName) => {
  const troopTypeDisplay = getTroopTypeDisplay(unit);
  const abilityKeywords = getTroopAbilities(String(unit?.role ?? unit?.name ?? ""))
    .flatMap((ability) => [ability.name.toLowerCase(), ability.key.toLowerCase(), "skill", "skills", "ability", "abilities", "passive", "passives"]);
  const keywords = [
    String(unit?.name ?? "").toLowerCase(),
    String(unit?.role ?? "").toLowerCase(),
    String(team ?? unit?.team ?? "").toLowerCase(),
    troopTypeDisplay.label.toLowerCase(),
    troopTypeDisplay.type.toLowerCase(),
    ...abilityKeywords
  ];

  if (troopTypeDisplay.type === "hybrid") {
    keywords.push("mounted", "ranged", "mounted ranged", "mounted+ranged", "horse archer", "hybrid");
  }

  if (troopTypeDisplay.type === "ranged") {
    keywords.push("archer", "projectile", "missile");
  }

  if (troopTypeDisplay.type === "mounted") {
    keywords.push("cavalry", "horse", "mobile");
  }

  if (troopTypeDisplay.type === "closecombat") {
    keywords.push("melee", "close combat", "infantry");
  }

  if (troopTypeDisplay.type === "sieged") {
    keywords.push("siege", "artillery", "engine");
  }

  if (isLeaderRole(String(unit?.role ?? unit?.name ?? ""))) {
    keywords.push("leader", "commander", "king", "general");
  }

  return Array.from(new Set(keywords.filter(Boolean)));
};

const ROLE_ICON_LOOKUP = Object.values(AVAILABLE_TROOPS).flat().reduce((lookup, troop) => {
  lookup[troop.role] = troop.Icon;
  return lookup;
}, {} as Record<string, string>);

export const getUnitDisplayIcon = (unit: any) => {
  if (!unit) return "⚔️";
  return ROLE_ICON_LOOKUP[unit.role] ?? unit.Icon ?? "⚔️";
};

export const getBattlefieldUnitLabel = (unit: any) => {
  const baseLabel = String(unit?.name ?? unit?.role ?? "").trim();
  if (!baseLabel) return "Unit";

  const compactLabel = baseLabel.split(" ").slice(0, 2).join(" ");
  return compactLabel.length > 14 ? `${compactLabel.slice(0, 13)}...` : compactLabel;
};
