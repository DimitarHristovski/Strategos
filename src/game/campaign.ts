import { levels } from "../Units/InitialUnits";
import { ALL_TEAMS, LEVEL_MATCHUP_LABELS } from "./constants";
import type { TeamName } from "./types";

export const CAMPAIGN_PLAYABLE_FACTIONS = ALL_TEAMS;

export const CAMPAIGN_STAGE_COUNT = 30;

const STORAGE_KEY_V2 = "strategos-campaign-progress-v2";
const LEGACY_STORAGE_KEY_V1 = "strategos-campaign-next-mission-v1";

const LEVEL_KEYS = [
  "Level1",
  "Level2",
  "Level3",
  "Level4",
  "Level5",
  "Level6",
  "Level7",
  "Level8",
  "Level9",
  "Level10",
  "Level11",
  "Level12",
  "Level13",
  "Level14",
  "Level15",
  "Level16"
] as const satisfies readonly (keyof typeof levels)[];

/** Each faction gets a different 30-mission level order (rotate base list by faction index). */
function missionLevelKey(faction: TeamName, missionIndex: number): keyof typeof levels {
  const fi = Math.max(0, ALL_TEAMS.indexOf(faction));
  const rotated = [...LEVEL_KEYS.slice(fi % 16), ...LEVEL_KEYS.slice(0, fi % 16)];
  if (missionIndex < 16) return rotated[missionIndex]!;
  return rotated[(missionIndex - 16) % 16]!;
}

/** Six act titles per faction — same structure, different names per culture. */
const FACTION_ACTS: Record<TeamName, readonly [string, string, string, string, string, string]> = {
  Romans: [
    "Act I — The Northern Watch",
    "Act II — Sea Roads",
    "Act III — Sand and Spears",
    "Act IV — Eastern Thunder",
    "Act V — The Eagle Returns",
    "Act VI — Imperium Redeemed"
  ],
  Barbarians: [
    "Act I — Frost Shores",
    "Act II — Raiding Season",
    "Act III — Blood Debts",
    "Act IV — Breaking Shields",
    "Act V — Wolf Pack",
    "Act VI — Last Reaving"
  ],
  Greeks: [
    "Act I — Cities of the Aegean",
    "Act II — Phalanx Roads",
    "Act III — Oracle’s Shadow",
    "Act IV — Silver Shields",
    "Act V — Macedon’s Reach",
    "Act VI — Hellenic Crown"
  ],
  Gauls: [
    "Act I — Tribal Fires",
    "Act II — Trade Knives",
    "Act III — Oak and Iron",
    "Act IV — Border Storm",
    "Act V — Druid’s Bargain",
    "Act VI — Gallic Twilight"
  ],
  Germanic: [
    "Act I — Dark Forest",
    "Act II — Tribal Oaths",
    "Act III — River Blood",
    "Act IV — Shield Wall",
    "Act V — Winter March",
    "Act VI — Old Gods"
  ],
  Carthage: [
    "Act I — African Coast",
    "Act II — Punic Sea",
    "Act III — Mercenary Gold",
    "Act IV — Elephant Road",
    "Act V — Sicilian Gambit",
    "Act VI — Final Punic Fire"
  ],
  Egypt: [
    "Act I — Nile Rising",
    "Act II — Temple Guard",
    "Act III — Desert Crown",
    "Act IV — Alexandria’s Will",
    "Act V — Pharaoh’s Bargain",
    "Act VI — Sun’s Edge"
  ],
  Thracians: [
    "Act I — Mountain Knives",
    "Act II — Horse Blood",
    "Act III — Border Kings",
    "Act IV — Thracian Thunder",
    "Act V — Broken Chains",
    "Act VI — Last Hill"
  ],
  Dacians: [
    "Act I — Carpathian Dawn",
    "Act II — Wolf Standards",
    "Act III — River Forts",
    "Act IV — King’s Gambit",
    "Act V — Iron Crown",
    "Act VI — Stone Legacy"
  ],
  Parthians: [
    "Act I — Desert Horse",
    "Act II — Silk and Spear",
    "Act III — Eastern Wind",
    "Act IV — Cataphract Road",
    "Act V — King of Kings",
    "Act VI — Sand Throne"
  ],
  Seleucids: [
    "Act I — Successor Steel",
    "Act II — Syrian Road",
    "Act III — Phalanx Empire",
    "Act IV — Elephant Crown",
    "Act V — Babylon’s Heir",
    "Act VI — Last Diadochi"
  ],
  Vikings: [
    "Act I — Longship Dawn",
    "Act II — Salt Raid",
    "Act III — Ice Coast",
    "Act IV — Shield Maiden’s Oath",
    "Act V — Jarl’s Gambit",
    "Act VI — Twilight Sagas"
  ]
};

export const FACTION_CAMPAIGN_NAME: Record<TeamName, string> = {
  Romans: "Eagle’s Road",
  Barbarians: "Wolf’s Reaving",
  Greeks: "Crown of the Aegean",
  Gauls: "Oaken League",
  Germanic: "Black Forest Wars",
  Carthage: "Punic Tide",
  Egypt: "Throne of the Nile",
  Thracians: "Edge of the World",
  Dacians: "Carpathian Blood",
  Parthians: "Desert of Kings",
  Seleucids: "Heirs of Alexander",
  Vikings: "Saga of Salt"
};

/** Mission title hooks — cycle by index for variety (faction-colored campaign). */
const TITLE_HOOKS: Record<TeamName, readonly string[]> = {
  Romans: ["Frontier seal", "Senate mandate", "Consular strike", "Provincial trial", "Legion proof", "Imperial hinge", "Border ledger", "Civic steel"],
  Barbarians: ["Cold raid", "Blood price", "Shield oath", "War band", "Chieftain’s test", "Frost bite", "Axe line", "Wild hunt"],
  Greeks: ["Phalanx answer", "Polis honor", "Trireme oath", "Hoplite proof", "Agema strike", "Aegean verdict", "Shield wall", "Olive and iron"],
  Gauls: ["Tribal vote", "Carnyx call", "Oak shield", "Trade blood", "Druid’s price", "Gallic hinge", "Clan edge", "Spear circle"],
  Germanic: ["Forest law", "Tribal night", "River oath", "Shield truth", "Winter edge", "Blood root", "Clan fire", "Dark march"],
  Carthage: ["Punic ledger", "African sea", "Mercenary coin", "Elephant road", "Sicilian knife", "Harbor war", "Salt fleet", "Twin crowns"],
  Egypt: ["Nile decree", "Temple shield", "Desert crown", "Alexandria’s will", "Pharaoh’s move", "Sand verdict", "Lotus steel", "Solar edge"],
  Thracians: ["Mountain edge", "Horse court", "Border king", "Thracian storm", "Knife pass", "Hill crown", "Raid truth", "Last stand"],
  Dacians: ["Wolf sign", "Carpathian gate", "River fort", "King’s test", "Iron hill", "Dacian crown", "Stone oath", "Blood line"],
  Parthians: ["Desert wind", "Horse archer", "Silk war", "Cataphract law", "Eastern crown", "Sand throne", "King’s road", "Last quiver"],
  Seleucids: ["Successor law", "Phalanx dream", "Syrian sun", "Elephant crown", "Babylon’s heir", "Silver shield", "Diadochi edge", "Empire proof"],
  Vikings: ["Longship law", "Salt raid", "Ice coast", "Shield saga", "Jarl’s strike", "Norse edge", "Saga fire", "Twilight run"]
};

function missionTitle(faction: TeamName, index: number, levelKey: keyof typeof levels): string {
  const hooks = TITLE_HOOKS[faction];
  const hook = hooks[index % hooks.length]!;
  const book = FACTION_CAMPAIGN_NAME[faction];
  return `${book} · ${hook} (${LEVEL_MATCHUP_LABELS[levelKey]})`;
}

function missionBlurb(faction: TeamName, index: number, levelKey: keyof typeof levels): string {
  const matchup = LEVEL_MATCHUP_LABELS[levelKey];
  return `Chapter ${index + 1}: lead ${faction} through ${matchup} — your house’s path diverges from every other faction’s.`;
}

function missionBriefing(faction: TeamName, index: number, levelKey: keyof typeof levels): string {
  const matchup = LEVEL_MATCHUP_LABELS[levelKey];
  const act = Math.floor(index / 5);
  const actCap = ["opening", "middle", "turning", "deepening", "penultimate", "final"][Math.min(5, act)]!;
  const stakes = [
    "Winning reshapes who fears your banners and who pays your tolls.",
    "Defeat emboldens rivals who already doubt your lineage.",
    "The field is a sentence in your house chronicle — make it read victory."
  ];
  const voice: Record<TeamName, string> = {
    Romans: "The republic’s ledger is written in wheat, iron, and order.",
    Barbarians: "Glory is loot, song, and the memory of teeth on shields.",
    Greeks: "Arete is proven where spear meets spear, not in scrolls alone.",
    Gauls: "The tribes remember who broke the line and who held the oak.",
    Germanic: "The forest judges oaths by smoke and by blood on snow.",
    Carthage: "Trade and terror are twin engines — balance them or sink.",
    Egypt: "The river gives life; the throne decides who channels it.",
    Thracians: "Mountains do not forgive hesitation — only momentum.",
    Dacians: "Wolf standards mean nothing if the pack will not follow.",
    Parthians: "The desert teaches distance: of bow, of nerve, of throne.",
    Seleucids: "Empire is a phalanx of dreams — close the gaps or be flanked.",
    Vikings: "Sagas are paid in salt spray and the silence after the charge."
  };
  return `This is the ${actCap} stretch of ${FACTION_CAMPAIGN_NAME[faction]} — mission ${index + 1} of ${CAMPAIGN_STAGE_COUNT}. You command ${faction} in ${matchup}. ${stakes[index % 3]} ${voice[faction]}`;
}

export type CampaignStage = {
  faction: TeamName;
  index: number;
  act: string;
  title: string;
  blurb: string;
  briefing: string;
  levelKey: keyof typeof levels;
};

export function getCampaignStage(faction: TeamName, index: number): CampaignStage | null {
  if (index < 0 || index >= CAMPAIGN_STAGE_COUNT) return null;
  if (!ALL_TEAMS.includes(faction)) return null;
  const levelKey = missionLevelKey(faction, index);
  const act = FACTION_ACTS[faction][Math.min(5, Math.floor(index / 5))]!;
  return {
    faction,
    index,
    act,
    title: missionTitle(faction, index, levelKey),
    blurb: missionBlurb(faction, index, levelKey),
    briefing: missionBriefing(faction, index, levelKey),
    levelKey
  };
}

function migrateLegacyV1Progress(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const v2 = window.localStorage.getItem(STORAGE_KEY_V2);
    if (v2) return JSON.parse(v2) as Record<string, number>;
    const v1 = window.localStorage.getItem(LEGACY_STORAGE_KEY_V1);
    if (v1) {
      const n = parseInt(v1, 10);
      if (Number.isFinite(n) && n >= 0) {
        const migrated: Record<string, number> = { Romans: Math.min(CAMPAIGN_STAGE_COUNT, Math.floor(n)) };
        window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {
    /* ignore */
  }
  return {};
}

function readAllProgress(): Record<string, number> {
  const base = migrateLegacyV1Progress();
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_V2);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, number> = { ...base };
    for (const t of ALL_TEAMS) {
      const v = parsed[t];
      if (typeof v === "number" && Number.isFinite(v)) {
        out[t] = Math.max(0, Math.min(CAMPAIGN_STAGE_COUNT, Math.floor(v)));
      }
    }
    return out;
  } catch {
    return base;
  }
}

/** Next mission index to unlock for this faction (0–30). 30 = all cleared. */
export function readCampaignNextMission(faction: TeamName): number {
  const all = readAllProgress();
  const n = all[faction];
  return typeof n === "number" && Number.isFinite(n)
    ? Math.max(0, Math.min(CAMPAIGN_STAGE_COUNT, Math.floor(n)))
    : 0;
}

export function persistCampaignProgressIfBetter(faction: TeamName, completedMissionIndex: number): void {
  if (typeof window === "undefined") return;
  const next = completedMissionIndex + 1;
  const all = readAllProgress();
  const prev = all[faction] ?? 0;
  if (next > prev) {
    all[faction] = Math.min(CAMPAIGN_STAGE_COUNT, next);
    try {
      window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }
}

export function isCampaignMissionUnlocked(
  _faction: TeamName,
  missionIndex: number,
  nextUnlocked: number
): boolean {
  if (missionIndex < 0 || missionIndex >= CAMPAIGN_STAGE_COUNT) return false;
  if (nextUnlocked >= CAMPAIGN_STAGE_COUNT) return true;
  return missionIndex <= nextUnlocked;
}
