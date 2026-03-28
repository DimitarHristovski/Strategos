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
    description: "Only mounted troops get a type advantage. They deal +10% attack damage against ranged and sieged units."
  },
  {
    icon: "🧱",
    title: "Role Formation Buff",
    description: "Adjacent allied troops with the same role gain scaling max health: 2 units = +5%, 3 = +10%, 4 = +15%, and larger groups keep scaling while connected."
  },
  {
    icon: "👑",
    title: "Leader Aura",
    description: "Troops directly next to a King, Jarl, General, or Leader gain +10% attack."
  },
  {
    icon: "🏹",
    title: "Ranged Shots",
    description: "Ranged and sieged troops have limited shots. When they run dry, they can no longer fire effectively."
  },
  {
    icon: "🧬",
    title: "Merge Limit",
    description: "You can merge adjacent same-role troops into elite units a limited number of times each battle."
  },
  {
    icon: "🗺️",
    title: "Dynamic Terrain",
    description: "Every new battle generates fresh terrain. Forests add cover, hills extend firing lanes, rivers punish heavy crossings, plains favor charges, and deserts wear down non-native armies."
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
    description: "Every shot spends 1 ammo. At 0 ammo, the unit drops to range 1 and attacks at half power, turning ranged hybrids into close-combat fighters."
  },
  {
    icon: "🏴",
    title: "Civilization Passives",
    description: "Each faction applies a passive bonus before battle starts, which can change movement, health, range, or attack depending on the civilization."
  },
  {
    icon: "✨",
    title: "Signature Unit Abilities",
    description: "Selected roles now carry passive signature abilities like Brace, Shield Wall, Charge, Harrier, Shock Assault, Guarded, Deadeye, Crush, Command Aura, Siege Mastery, Skirmish Step, and Resolve that trigger automatically during combat."
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
  }
] as const;

export const UNIT_ABILITY_MECHANICS_INFO = [
  {
    icon: "🛡️",
    title: "Brace",
    detail: "Spear and phalanx troops deal +15% damage into mounted enemies and take 15% less damage when receiving a mounted charge."
  },
  {
    icon: "🧱",
    title: "Shield Wall",
    detail: "Defensive infantry take 10% less damage while standing adjacent to at least 1 allied unit."
  },
  {
    icon: "🔥",
    title: "Shock Assault",
    detail: "Berserker and falx-style shock troops hit 20% harder against targets already at or below half health."
  },
  {
    icon: "🐎",
    title: "Charge",
    detail: "Mounted shock troops gain +15% damage on plains and gain another +10% when crashing into ranged or siege units."
  },
  {
    icon: "🏹",
    title: "Harrier",
    detail: "Skirmishers and horse archers deal +10% damage while they still have ammo against targets with 1 or less move, and against siege crews."
  },
  {
    icon: "🪖",
    title: "Guarded",
    detail: "Heavy line troops take 10% less damage while they stay above half health."
  },
  {
    icon: "🪓",
    title: "Ferocity",
    detail: "Aggressive fighters gain +10% attack when they are not standing next to an allied unit."
  },
  {
    icon: "🎯",
    title: "Deadeye",
    detail: "Precision archers gain +1 range on hills and deal +10% damage into unsupported ranged or siege targets."
  },
  {
    icon: "🐘",
    title: "Crush",
    detail: "Elephants and impact troops deal +15% damage into close-combat units and gain another +5% against Guarded or Shield Wall defenders."
  },
  {
    icon: "🏴",
    title: "Command Aura",
    detail: "Allies adjacent to a command unit gain +5% attack, stacking with the normal +10% leader aura when present."
  },
  {
    icon: "🏰",
    title: "Siege Mastery",
    detail: "Siege engines gain +10% attack from plains or hills and gain +1 extra range on hills."
  },
  {
    icon: "🪶",
    title: "Skirmish Step",
    detail: "Mobile skirmish troops gain +1 move while they still have ammunition."
  },
  {
    icon: "⚡",
    title: "Resolve",
    detail: "Elite troops gain +10% attack when an adjacent allied unit is at or below 50% HP."
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
      "Romans and Vikings gain +5% attack on plains."
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
      "Gauls and Germanic troops gain +10% attack and +1 move in forests."
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
      "Greeks and Egypt gain +10% attack on hills."
    ]
  },
  {
    terrain: "river",
    summary: "Water lanes disrupt combat flow unless a faction is good at crossing.",
    effects: [
      "Closecombat troops suffer -10% attack while fighting through water.",
      "Mounted troops suffer -2 move and -10% attack in rivers.",
      "Sieged troops suffer -2 move and -15% attack in rivers.",
      "Romans and Carthage gain +5% attack and +1 move in rivers."
    ]
  },
  {
    terrain: "desert",
    summary: "Dry, punishing terrain that drains movement and weakens ranged fire.",
    effects: [
      "All non-mounted troops lose 1 move in desert terrain.",
      "Ranged troops suffer -15% attack from dust and heat.",
      "Sieged troops suffer -15% attack in desert sand.",
      "Carthage, Barbarians, Egypt, and Parthians gain +10% attack and +1 move in deserts."
    ]
  }
];
