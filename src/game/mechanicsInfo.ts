import { TURN_ACTION_BUDGET_MS } from "./constants";
import type { TerrainType, TroopMechanicType } from "./types";

export const getBattleLogAppearance = (entry: string) => {
  const normalizedEntry = String(entry ?? "").toLowerCase();
  if (normalizedEntry.includes(" was killed")) {
    return {
      accent: "border-red-500/70",
      text: "text-red-100",
      bg: "bg-red-950/45"
    };
  }
  if (normalizedEntry.includes(" attacked ")) {
    return {
      accent: "border-orange-400/70",
      text: "text-orange-100",
      bg: "bg-orange-950/35"
    };
  }
  if (normalizedEntry.includes("charge") || normalizedEntry.includes("crashed into")) {
    return {
      accent: "border-amber-400/70",
      text: "text-amber-100",
      bg: "bg-amber-950/35"
    };
  }
  if (normalizedEntry.includes("shaken") || normalizedEntry.includes("morale")) {
    return {
      accent: "border-violet-400/70",
      text: "text-violet-100",
      bg: "bg-violet-950/35"
    };
  }
  if (normalizedEntry.includes("moved onto") || normalizedEntry.includes("repositioned") || normalizedEntry.includes("advanced")) {
    return {
      accent: "border-sky-400/70",
      text: "text-sky-100",
      bg: "bg-sky-950/35"
    };
  }
  if (normalizedEntry.includes("merge")) {
    return {
      accent: "border-fuchsia-400/70",
      text: "text-fuchsia-100",
      bg: "bg-fuchsia-950/35"
    };
  }
  if (normalizedEntry.includes("move clock")) {
    return {
      accent: "border-amber-400/70",
      text: "text-amber-100",
      bg: "bg-amber-950/35"
    };
  }
  return {
    accent: "border-yellow-500/60",
    text: "text-yellow-100",
    bg: "bg-black/25"
  };
};

export const GAME_MECHANICS_INFO = [
  {
    icon: "⚔️",
    title: "Troop Type Matchups",
    description: "Only mounted troops get a type advantage: +10% attack (×1.1) against ranged and sieged units."
  },
  {
    icon: "🧱",
    title: "Role Formation Buff",
    description:
      "Adjacent allied troops with the same role gain scaling max HP: each extra linked unit adds +5% max HP (2 = +5%, 3 = +10%, 4 = +15%, …)."
  },
  {
    icon: "👑",
    title: "Leader Aura",
    description: "Troops orthogonally adjacent to a King, Jarl, General, or Leader gain +10% attack (×1.1)."
  },
  {
    icon: "🏹",
    title: "Ranged Shots",
    description:
      "Ranged and siege troops have limited ammo. At 0 ammo they drop to range 1 and attack at −50% (×0.5), except Nomad Strike units which keep full melee attack."
  },
  {
    icon: "🧬",
    title: "Merge Limit",
    description: "You can merge adjacent same-role troops into elite units a limited number of times each battle."
  },
  {
    icon: "🗺️",
    title: "Dynamic Terrain",
    description:
      "Every new battle generates fresh terrain. Desert-hardy factions all fight well in sand; each also has one other home-ground bonus (Parthians plains, Barbarians forest, Egypt and Seleucids hills, Carthage rivers). Turn on Terrain Effects in Graphics for combat modifiers."
  }
] as const;

export const ADDITIONAL_MECHANICS_INFO = [
  {
    icon: "🐎🏹",
    title: "Hybrid Troops",
    description: "Mounted-ranged units are shown as Hybrid in the UI. While they still have ammo, they fight as ranged attackers and keep their two-icon identity."
  },
  {
    icon: "🪫",
    title: "Ammo Exhaustion",
    description:
      "Each ranged/siege shot spends 1 ammo. At 0 ammo: range 1, attack ×0.5 (unless Nomad Strike — full melee damage)."
  },
  {
    icon: "🏴",
    title: "Civilization Passives",
    description: "Each faction applies a passive bonus before battle starts, which can change movement, health, range, or attack depending on the civilization."
  },
  {
    icon: "✨",
    title: "Signature & Faction Skills",
    description:
      "Each role has core signature passives (Brace, Shield Wall, Charge, Harrier, and others). Many units also carry a second faction skill—Testudo, Phalanx, Blood Oath, Fury Charge, Wild Ambush, Battle Cohesion, Sun Chariot, Rhomphaia Fury, Falx Dominion, Nomad Strike, Imperial Cohort, or Iron Shield—that layers extra attack, defense, or movement rules in combat."
  },
  {
    icon: "🎺",
    title: "Battle Sound Cues",
    description: "Music and battle SFX are now separated. Turn stingers, impact sounds, charge hits, projectile releases, and morale breaks help you read combat momentum by ear."
  },
  {
    icon: "💥",
    title: "Battlefield Feedback",
    description: "Temporary hit, death, ranged, charge, projectile, and morale effects pulse directly on the grid so critical events stand out without slowing the battle down."
  },
  {
    icon: "🔒",
    title: "Terrain Lock",
    description: "Terrain settings and regeneration are only available before combat starts. Once the battle begins, the battlefield is locked for the rest of the match."
  },
  {
    icon: "⏱",
    title: "Timed Play (Optional)",
    description: `Enable under Options before the battle starts (locked mid-match). Each living faction gets a chess-style total bank—5 minutes on an 8×8 map, +1 minute per +2 grid steps—that only ticks on that side’s turn; hitting zero forfeits the match on time (survivors tie-break by army HP). A ${TURN_ACTION_BUDGET_MS / 1000}s move clock resets every turn; when it runs out, that turn auto-passes. The header and fullscreen overlay group both timers under “Timed play” while a battle is running.`
  },
  {
    icon: "📜",
    title: "Battle Log",
    description:
      "Use the scroll button on the floating toolbar to open a centered battle log modal; tap the same button again to close. Entries are color-coded (attacks, kills, moves, charges, morale, merges, time events). With Turn Banner on, the panel also shows whose turn it is and—when timed play is on—the active move clock."
  }
] as const;

export const UNIT_ABILITY_MECHANICS_INFO = [
  {
    icon: "🛡️",
    title: "Brace",
    detail: "+15% attack vs mounted (×1.15); −15% damage taken from mounted (incoming ×0.85)."
  },
  {
    icon: "🧱",
    title: "Shield Wall",
    detail: "With ≥1 adjacent ally: −10% damage taken (×0.9)."
  },
  {
    icon: "🔥",
    title: "Shock Assault",
    detail: "+20% attack vs targets at ≤50% HP (×1.2)."
  },
  {
    icon: "🐎",
    title: "Charge",
    detail: "Mounted: +15% attack on plains (×1.15); +10% vs ranged or siege (×1.1), multiplicative."
  },
  {
    icon: "🏹",
    title: "Harrier",
    detail: "With ammo left: +10% attack vs move ≤1 or siege (×1.1)."
  },
  {
    icon: "🪖",
    title: "Guarded",
    detail: "Above 50% HP: −10% damage taken (×0.9)."
  },
  {
    icon: "🪓",
    title: "Ferocity",
    detail: "No adjacent allies: +10% attack (×1.1)."
  },
  {
    icon: "🎯",
    title: "Deadeye",
    detail: "On hills: +1 range; +10% vs unsupported ranged/siege (×1.1)."
  },
  {
    icon: "🐘",
    title: "Crush",
    detail: "+15% vs close combat (×1.15); +5% extra vs Guarded or Shield Wall (×1.05)."
  },
  {
    icon: "🏴",
    title: "Command Aura",
    detail: "Adjacent allies: +5% attack (×1.05); stacks with Leader Aura +10% (×1.1)."
  },
  {
    icon: "🏰",
    title: "Siege Mastery",
    detail: "Siege on plains or hills: +10% attack (×1.1); on hills also +1 range."
  },
  {
    icon: "🪶",
    title: "Skirmish Step",
    detail: "With ammo: +1 move (not stacking with Nomad Strike +1)."
  },
  {
    icon: "⚡",
    title: "Resolve",
    detail: "Adjacent ally at ≤50% HP: +10% attack (×1.1)."
  },
  {
    icon: "🐢",
    title: "Testudo",
    detail:
      "Vs ranged: −35% damage taken (×0.65). Vs skirmisher-style attackers: −15% more (×0.85). Adjacent Testudo ally: −10% taken (×0.9). Multiplicative."
  },
  {
    icon: "🔱",
    title: "Phalanx",
    detail: "+20% attack vs mounted (×1.2); +10% with adjacent Phalanx ally (×1.1). Vs close combat: −20% damage taken (×0.8)."
  },
  {
    icon: "🩸",
    title: "Blood Oath",
    detail: "Round 1: +20% attack (×1.2) and +1 move. At ≤50% HP: +10% attack (×1.1)."
  },
  {
    icon: "🔥",
    title: "Fury Charge",
    detail: "When attacking: +15% (×1.15); vs target with no adjacent allies: +10% extra (×1.1). On plains tile: +1 move."
  },
  {
    icon: "🌲",
    title: "Wild Ambush",
    detail: "On forest: +15% attack (×1.15), +1 move. In forest or on hill vs ranged: −15% damage taken (×0.85)."
  },
  {
    icon: "🐘",
    title: "Battle Cohesion",
    detail:
      "Adjacent different ally role: +10% attack (×1.1), −10% taken (×0.9). War Elephant with any adjacent ally: +10% attack (×1.1)."
  },
  {
    icon: "☀️",
    title: "Sun Chariot",
    detail:
      "Ranged unit adjacent to Sun Chariot ally: −20% damage taken (×0.8). Chariot role after moving before attack: +15% (×1.15). On desert: +1 move."
  },
  {
    icon: "🗡️",
    title: "Rhomphaia Fury",
    detail:
      "Vs Shield Wall or Guarded abilities: +20% (×1.2). As close combat: +10% (×1.1). Pierce: vs active Guarded/Shield Wall, incoming damage ×1.15 from defenses."
  },
  {
    icon: "🪓",
    title: "Falx Dominion",
    detail:
      "Vs elite infantry (role match): +25% (×1.25). Adjacent Falx Dominion ally: +10% (×1.1). Pierce: vs active Guarded, Shield Wall, or Brace vs mounted — ×1.2 damage through defensive mitigation."
  },
  {
    icon: "🏹",
    title: "Nomad Strike",
    detail:
      "After moving, same turn attack: +10% (×1.1). With ammo: +1 move (skipped if Skirmish Step already grants +1). At 0 ammo: no −50% melee attack penalty."
  },
  {
    icon: "🏛️",
    title: "Imperial Cohort",
    detail:
      "Adjacent Seleucid cohort role: +10% (×1.1). Cataphract or elephant with any adjacent ally: +10% (×1.1). Adjacent cohort ally of different troop class: −10% taken (×0.9)."
  },
  {
    icon: "🛡️",
    title: "Iron Shield",
    detail:
      "Vs close combat: −20% damage taken (×0.8). Vs ranged with adjacent Iron Shield ally: −15% taken (×0.85). With adjacent Iron Shield ally: +10% attack (×1.1)."
  }
] as const;

export const AI_MECHANICS_INFO = [
  "Front-line melee units now push harder and value moves that create an immediate attack on the next turn.",
  "The AI focuses wounded enemies, exposed ranged units, siege crews, and isolated leaders more aggressively.",
  "Ranged and siege troops still prefer safer firing ground, but they now step into pressure range sooner instead of drifting too far back.",
  "Mounted units prefer flank lanes, open ground, and fast collapses onto fragile back-line targets.",
  "Leaders stay more disciplined than other roles, but the army as a whole is less hesitant and avoids sideways stalling.",
  "If the advanced scorer cannot find a premium action, the AI still falls back to a nearest-target attack or direct advance."
] as const;

export const TROOP_MECHANICS_INFO: Array<{ type: TroopMechanicType; summary: string; pros: string[]; cons: string[] }> = [
  {
    type: "closecombat",
    summary: "Front-line fighters built to hold ground and finish broken enemies up close.",
    pros: ["Gets a hill bonus from elevated footing.", "Reliable front-line presence in direct combat."],
    cons: ["Usually slower than mounted troops.", "Loses attack power while fighting in rivers."]
  },
  {
    type: "mounted",
    summary: "Fast flankers that exploit open ground and pressure fragile back lines.",
    pros: ["Strong against ranged and sieged units.", "Gain +1 move on plains."],
    cons: ["Lose power and speed in forests and rivers.", "Climbing hills slows them down."]
  },
  {
    type: "ranged",
    summary: "Flexible missile troops that chip away at enemies before they can close in.",
    pros: ["Gain attack bonuses in forests and on hills.", "Useful for softening enemies before contact."],
    cons: ["Vulnerable to mounted flanks.", "Dusty desert terrain weakens their attacks."]
  },
  {
    type: "sieged",
    summary: "Heavy engines that hit hard from distance but hate rough terrain and close pressure.",
    pros: ["Benefit from stable firing positions, especially hills.", "Can hit hard from long range."],
    cons: ["Weak to mounted flanks.", "Forests, rivers, and deserts slow or weaken them."]
  }
];

export const TERRAIN_MECHANICS_INFO: Array<{ terrain: TerrainType; summary: string; effects: string[] }> = [
  {
    terrain: "plain",
    summary: "Open ground that connects the other biomes and favors mobility.",
    effects: [
      "Mounted troops gain +1 move on open ground.",
      "Sieged troops gain +5% attack from stable firing lanes.",
      "Romans and Vikings gain +5% attack on plains; Parthians (desert-hardy) gain +5% on open ground."
    ]
  },
  {
    terrain: "forest",
    summary: "Wet, dense terrain that rewards cover and punishes fast movement.",
    effects: [
      "Ranged troops gain +5% attack in forest cover.",
      "Mounted troops suffer -1 move and -15% attack in dense woods.",
      "Sieged troops suffer -1 move and -10% attack in forests.",
      "Non-mounted defenders take 8% less incoming damage in forest cover.",
      "Gauls and Germanic troops gain +10% attack and +1 move in forests.",
      "Barbarians (desert-hardy) gain +5% attack and +1 move in forests and rough scrub."
    ]
  },
  {
    terrain: "hill",
    summary: "Elevated ground that improves firing positions and slows rapid troops.",
    effects: [
      "Ranged troops gain +15% attack and +1 range from high ground.",
      "Closecombat troops gain +5% attack on hills.",
      "Mounted troops lose 1 move climbing hills.",
      "Sieged troops gain +10% attack and +1 range from elevated positions.",
      "Greeks, Egypt, and Seleucids gain +10% attack on hills (Egypt and Seleucids as desert-hardy hill fighters)."
    ]
  },
  {
    terrain: "river",
    summary: "Water lanes disrupt combat flow unless a faction is good at crossing.",
    effects: [
      "Closecombat troops suffer -10% attack while fighting through water.",
      "Mounted troops suffer -2 move and -10% attack in rivers.",
      "Sieged troops suffer -2 move and -15% attack in rivers.",
      "Romans and Carthage gain +5% attack and +1 move in rivers (Carthage as desert-hardy river crossing)."
    ]
  },
  {
    terrain: "desert",
    summary: "Dry, punishing terrain—unless your faction is built for it.",
    effects: [
      "All desert-hardy factions (Carthage, Barbarians, Egypt, Parthians, Seleucids): +12% attack and +1 move on sand; no desert penalties. Their other terrain bonuses are split: see plains, forest, hill, and river above.",
      "All other non-mounted troops lose 1 move in desert terrain.",
      "Other ranged troops suffer -15% attack from dust and heat.",
      "Other sieged troops suffer -15% attack in shifting sand.",
      "Other mounted troops skip the foot move penalty; only hardy mounted also get the +12% / +1 move bonus."
    ]
  }
];
