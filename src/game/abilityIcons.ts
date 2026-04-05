import type { TroopAbilityKey } from "../Units/troopStats";
import type { TroopMechanicType } from "./types";

const B = "/icons/ui";
const r = (file: string) => `${B}/${file}`;

/** Battlefield buff strip + signature-skill list (matches `TroopAbilityKey` in troopStats). */
export const TROOP_ABILITY_BATTLEFIELD_RASTER: Record<TroopAbilityKey, string> = {
  brace: r("ability-shield-ornate.png"),
  charge: r("ui-lightning.png"),
  command: r("unit-horn-herald.png"),
  crush: r("ui-shield-ram.png"),
  deadeye: r("ability-archery-target.png"),
  ferocity: r("ability-fire-rage.png"),
  guarded: r("ui-helm-bronze.png"),
  harrier: r("ui-bow-arrow.png"),
  resolve: r("ability-handshake.png"),
  shieldWall: r("ability-brick-wall.png"),
  shock: r("ability-skull.png"),
  siegeMastery: r("ability-boot-mortar.png"),
  skirmishStep: r("ability-travel-boot.png")
};

export const BUFF_STRIP_RASTER = {
  leaderAura: r("ui-crown-gold.png"),
  commandAura: r("unit-horn-herald.png"),
  formationLink: r("trap-chain-hook.png")
} as const;

export function getTroopAbilityIconSrc(key: TroopAbilityKey): string {
  return TROOP_ABILITY_BATTLEFIELD_RASTER[key];
}

export function getTroopMechanicIconSrc(type: TroopMechanicType | "hybrid"): string {
  switch (type) {
    case "hybrid":
      return r("unit-armored-cavalry-archer.png");
    case "mounted":
      return r("unit-armored-cavalry-a.png");
    case "ranged":
      return r("ui-bow-arrow.png");
    case "sieged":
      return r("ui-catapult.png");
    default:
      return r("ui-crossed-swords.png");
  }
}

/** Mechanics handbook & settings: card title → raster (emoji in copy may still appear in prose). */
export const HANDBOOK_GAME_ICON_SRC: Record<string, string> = {
  "Troop Type Matchups": r("ui-crossed-swords.png"),
  "Formation lines": r("ability-brick-wall.png"),
  "Leader Aura": r("ui-crown-gold.png"),
  "Ranged Shots": r("ui-bow-arrow.png"),
  "Merge (2 per battle)": r("trap-chain-hook.png"),
  "Spy (3 reports per battle)": r("ui-spy-hood.png"),
  "Faction ability (targeted + cooldown)": r("ui-lightning.png"),
  "Skirmish setup (single player)": r("ui-compass.png"),
  "Dynamic Terrain": r("trap-marker-signpost.png")
};

export const HANDBOOK_ADDITIONAL_ICON_SRC: Record<string, string> = {
  "Line weight (Light–Unique)": r("ui-pocket-watch.png"),
  "Hybrid Troops": r("ability-archery-target.png"),
  "Ammo Exhaustion": r("ui-bow-arrow.png"),
  "Civilization Passives": r("ui-banner-heraldry.png"),
  "Faction ability (left rail)": r("ability-archery-target.png"),
  "Battle Sound Cues": r("ui-war-horn.png"),
  "Battlefield Feedback": r("ability-fire-rage.png"),
  "Terrain Lock": r("trap-magic-pedestal.png"),
  "Timed Play (Optional)": r("ui-hourglass.png"),
  "Battle Log": r("ui-scroll-seal.png"),
  "Tutorial lessons": r("ui-sword-in-stone.png")
};

export const HANDBOOK_SIGNATURE_ICON_SRC: Record<string, string> = {
  Brace: TROOP_ABILITY_BATTLEFIELD_RASTER.brace,
  "Shield Wall": TROOP_ABILITY_BATTLEFIELD_RASTER.shieldWall,
  "Shock Assault": TROOP_ABILITY_BATTLEFIELD_RASTER.shock,
  Charge: TROOP_ABILITY_BATTLEFIELD_RASTER.charge,
  Harrier: TROOP_ABILITY_BATTLEFIELD_RASTER.harrier,
  Guarded: TROOP_ABILITY_BATTLEFIELD_RASTER.guarded,
  Ferocity: TROOP_ABILITY_BATTLEFIELD_RASTER.ferocity,
  Deadeye: TROOP_ABILITY_BATTLEFIELD_RASTER.deadeye,
  Crush: TROOP_ABILITY_BATTLEFIELD_RASTER.crush,
  "Command Aura": TROOP_ABILITY_BATTLEFIELD_RASTER.command,
  "Siege Mastery": TROOP_ABILITY_BATTLEFIELD_RASTER.siegeMastery,
  "Skirmish Step": TROOP_ABILITY_BATTLEFIELD_RASTER.skirmishStep,
  Resolve: TROOP_ABILITY_BATTLEFIELD_RASTER.resolve
};

/** Terrain atlas cards (Mechanics → Terrain). */
export const HANDBOOK_TERRAIN_ICON_SRC: Record<string, string> = {
  plain: r("ui-compass.png"),
  forest: r("trap-bear-jaws.png"),
  hill: r("ability-brick-wall.png"),
  river: r("trap-barrel-rope.png"),
  desert: r("ui-sun.png")
};

export const HANDBOOK_FORMATION_ICON_SRC: Record<string, string> = {
  "How linking works": r("trap-chain-hook.png"),
  "Battle line": r("ui-crossed-swords.png"),
  Testudo: r("ability-shield-ornate.png"),
  Phalanx: r("ui-sword-in-stone.png"),
  "Blood Oath": r("ability-skull.png"),
  "Fury Charge": r("ability-fire-rage.png"),
  "Wild Ambush": r("trap-bear-jaws.png"),
  "Battle Cohesion": r("unit-armored-war-elephant.png"),
  "Sun Chariot": r("unit-war-chariot.png"),
  "Rhomphaia Line": r("ui-crossed-swords.png"),
  "Falx Dominion": r("ui-helm-skull-horns.png"),
  "Nomad Strike": r("unit-armored-cavalry-archer.png"),
  "Imperial Cohort": r("ui-banner-heraldry.png"),
  "Iron Shield": r("ability-shield-ornate.png")
};
