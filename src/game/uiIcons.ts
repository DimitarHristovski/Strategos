import { CIV_ACTIVES } from "./civActives";
import type { TeamName } from "./types";

/** Vite `public/` root — raster UI in `public/icons/ui/` (see `docs/MEDIEVAL_UI_ICONS.md`, `docs/FANTASY_UI_ICONS.md`). */
export const UI_ICON_BASE = "/icons/ui";

const u = (name: string) => `${UI_ICON_BASE}/${encodeURIComponent(name)}`;

export const UI_ICON = {
  refreshCycle: u("ui-refresh-cycle.png"),
  compass: u("ui-compass.png"),
  /** Volley targeting / framed ranged strike */
  volleyTarget: u("ability-archery-target.png"),
  scrollSeal: u("ui-scroll-seal.png"),
  helmBronze: u("ui-helm-bronze.png"),
  crossedSwords: u("ui-crossed-swords.png"),
  /** Elite line-weight close combat (matches `getTroopRasterIconSrc` for elite melee). */
  eliteCloseCombat: u("Golden swords in radiant cross formation_r2_c5.png"),
  /** Merge mode toolbar */
  mergeKnights: u("Armored knights merging into power_r2_c2.png"),
  chainHook: u("trap-chain-hook.png"),
  helmSkullHorns: u("ui-helm-skull-horns.png"),
  swordInStone: u("ui-sword-in-stone.png"),
  playGold: u("ui-play-gold.png"),
  hourglass: u("ui-hourglass.png"),
  lootSack: u("ui-loot-sack.png"),
  sun: u("ui-sun.png"),
  moon: u("ui-moon.png"),
  spyHood: u("ui-spy-hood.png"),
  trapSignpost: u("trap-marker-signpost.png"),
  barrelRope: u("trap-barrel-rope.png"),
  ravenBones: u("ui-raven-bones.png"),
  pocketWatch: u("ui-pocket-watch.png"),
  /** Visible trap cell overlay */
  trapPlaced: u("trap-pressure-plate.png"),
  reinforcePlus: u("ui-plus-gold.png"),
  allyPact: u("ability-handshake.png"),
  /** Siege crew / mortar (abilities, handbook) */
  siegeMortar: u("ability-boot-mortar.png"),
  travelBoot: u("ability-travel-boot.png"),
  hybridHorseArcher: u("unit-armored-cavalry-archer.png"),
  camelRider: u("unit-camel-archer.png"),
  /** Troop details / stat rows */
  statTeam: u("ui-banner-heraldry.png"),
  statHp: u("ui-helm-bronze.png"),
  /** Generic attack row fallback only — troop panels should use `getTroopRasterIconSrc(unit)` for role-accurate art. */
  statAttack: u("ui-crossed-swords.png"),
  statRange: u("ability-archery-target.png"),
  statMove: u("ability-haste-boot.png"),
  statTerrain: u("ui-compass.png"),
  statWeight: u("ui-pocket-watch.png"),
  statAmmo: u("ui-bow-arrow.png"),
  statTile: u("trap-marker-signpost.png")
} as const;

/** Left-rail passive (yellow): fantasy / medieval raster per faction. */
export const PASSIVE_RAIL_ICON: Record<TeamName, string> = {
  Romans: u("ability-shield-ornate.png"),
  Barbarians: u("ability-fire-rage.png"),
  Greeks: u("ability-brick-wall.png"),
  Gauls: UI_ICON.trapSignpost,
  Germanic: UI_ICON.crossedSwords,
  Carthage: u("unit-camel-archer-drawn.png"),
  Egypt: UI_ICON.sun,
  Thracians: u("trap-bear-jaws.png"),
  Dacians: UI_ICON.chainHook,
  Parthians: u("ui-bow-arrow.png"),
  Seleucids: u("ui-banner-heraldry.png"),
  Vikings: u("ui-lightning.png")
};

/** Cyan active button art by ability targeting. */
export function getCivActiveRailIcon(team: TeamName): string {
  const targeting = CIV_ACTIVES[team]?.targeting;
  switch (targeting) {
    case "enemy_volley":
      return UI_ICON.volleyTarget;
    case "ally_reinforce":
      return UI_ICON.allyPact;
    case "summon_unit":
      return UI_ICON.playGold;
    case "place_trap":
      return UI_ICON.trapPlaced;
    default:
      return UI_ICON.crossedSwords;
  }
}
