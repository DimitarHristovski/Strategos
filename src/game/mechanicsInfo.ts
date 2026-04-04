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
  if (normalizedEntry.includes("spy")) {
    return {
      accent: "border-slate-400/70",
      text: "text-slate-100",
      bg: "bg-slate-950/40"
    };
  }
  if (normalizedEntry.includes("[civilization ability]")) {
    return {
      accent: "border-cyan-500/65",
      text: "text-cyan-50",
      bg: "bg-cyan-950/40"
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
    title: "Formation lines",
    description:
      "Orthogonally adjacent allies (cardinal neighbors) form a line. With at least two linked units on the same team and the same formation, bonuses apply. Generic Battle line (any role not in a named faction list) requires matching role and grants +5% max HP per extra linked unit. Named faction lines can mix listed roles; most use combat/move passives instead of HP—see the handbook Formation lines entry."
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
      "Ranged and siege troops have limited ammo. At 0 ammo they drop to range 1 and melee attacks deal −50% damage (×0.5)."
  },
  {
    icon: "🧬",
    title: "Merge (2 per battle)",
    description:
      "On your turn, use the 🔗 toolbar button to enter merge mode (single-player, campaign, custom scenario, hot-seat, or AI vs AI). Click two orthogonally adjacent friendly units of the same role to combine them. **Two merges per battle** (HUD counter). Merge mode and Spy mode cancel each other."
  },
  {
    icon: "🕵️",
    title: "Spy (3 reports per battle)",
    description:
      "On your turn, use 🕵️ to enter Spy mode: living enemies highlight; click one to file a **spy report** and unlock full stats, skills, and effects for that unit in the side panel for the rest of the match. **Three reports per battle** (HUD counter). Unspied enemies show **classified** intel (hidden numbers) until reported. Re-opening a unit you already spied costs nothing."
  },
  {
    icon: "⚡",
    title: "Faction ability (targeted + cooldown)",
    description:
      "Each civilization has a **targeted** ability on the **cyan** button beside its passive on the **left rail**. Tap to **arm** it (again to cancel): **volley** factions pick **one enemy** in range of any ally (≤5 tiles)—damage uses a **fixed volley attack value** for that civ (then terrain, matchup, and mitigation as normal); **reinforcement** picks **one living ally** to restore **250 HP** (capped at that unit’s max HP) plus **flat attack** on the card where listed (no % of max HP); **Romans** **summon** one **Legionary** on an empty tile in range. Resolving it **ends your turn**. **Cooldown:** every faction uses a **full battle-round** timer (each time the turn order wraps to the first side again); values differ by civ—see the **cyan hover tooltip** and the **live table** under **Game Menu → Mechanics → Special Systems**. When a cooldown ends, the **battle log** and a short **cyan button pulse** recommend arming the skill again (human play only). Hover also shows **preview motion** (arrows, siege stones, axes, javelins; heal sparks; deploy streak). Not in the tutorial or **AI vs AI** watch. Log lines: **[Civilization Ability]** (cyan)."
  },
  {
    icon: "🧭",
    title: "Skirmish setup (single player)",
    description:
      "Main menu **Single player** opens a setup screen: choose any skirmish map (original scenarios plus extra faction pairings), pick your faction, then start. During skirmish, **🧭** returns to that screen (confirms if a battle is in progress). Skirmish **level** is chosen there or via 🧭—not from a header dropdown. The header can still set **faction** and **AI difficulty** for skirmish when you are not in the tutorial."
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
    icon: "⚖️",
    title: "Line weight (Light–Unique)",
    description:
      "Every role is tagged Light, Medium, Heavy, Elite, or Unique (faction rulers only) for roster balance and the unit reference. This is separate from troop type (melee, mounted, ranged, siege): weight describes typical durability and cost tier, not how the unit attacks. Search the roster by light, medium, heavy, elite, or unique."
  },
  {
    icon: "🐎🏹",
    title: "Hybrid Troops",
    description: "Mounted-ranged units are shown as Hybrid in the UI. While they still have ammo, they fight as ranged attackers and keep their two-icon identity."
  },
  {
    icon: "🪫",
    title: "Ammo Exhaustion",
    description:
      "Each ranged/siege shot spends 1 ammo. At 0 ammo: range 1, melee attack ×0.5."
  },
  {
    icon: "🏴",
    title: "Civilization Passives",
    description:
      "Each faction applies a **passive bonus before battle starts** (movement, health, range, or attack depending on the civ). **Yellow-bordered icons** on the **left rail** are the in-battle reference—hover for the full tooltip (passive aura + icon motion). The **cyan** button is the **cooldown-based targeted** ability (see **Faction ability** in core rules); its hover tooltip adds **faction-themed motion** (volley projectiles, reinforcement sparks, Roman deploy drop)."
  },
  {
    icon: "⚡",
    title: "Faction ability (left rail)",
    description:
      "Full wording under **Core rules → Faction ability**. Map: **yellow** = passive · **cyan** = arm **volley** (fixed attack power per civ), **reinforcement** (**250 HP** per use, capped at max, plus attack on the card where listed), or **Roman summon** · valid targets **pulse** on the grid · **amber** cyan = targeting armed · ends turn on resolve · **cooldown = battle rounds** per faction (tooltip + **Mechanics → Special Systems** table). **Ready-again** log + pulse when the cooldown expires (human modes)."
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
      "Use the scroll button on the floating toolbar to open a centered battle log modal; tap the same button again to close. Entries are color-coded (attacks, kills, moves, charges, morale, merges, spy, **civilization abilities**, **ability ready again** reminders, time events). With Turn Banner on, the panel also shows whose turn it is and—when timed play is on—the active move clock."
  },
  {
    icon: "📚",
    title: "Tutorial lessons",
    description:
      "Sixteen short missions on an 8×8 field teach movement, melee, terrain, ranged ammo, signatures, rivers, merge, and more. Enemy turns auto-skip. Lesson 1 (March) completes in **one move** onto the goal tile—no combat. Strike-style lessons count **any damaging hit** (wound or kill). The handbook here matches what you see in-game."
  }
] as const;

/** Per-role combat passives (shown on unit cards). */
export const SIGNATURE_ABILITY_MECHANICS_INFO = [
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
    detail: "With ammo: +1 move."
  },
  {
    icon: "⚡",
    title: "Resolve",
    detail: "Adjacent ally at ≤50% HP: +10% attack (×1.1)."
  }
] as const;

/** One card per formation rule or faction line (handbook Formations tab). */
export const FORMATION_BUFF_MECHANICS_INFO: ReadonlyArray<{
  icon: string;
  title: string;
  subtitle?: string;
  detail: string;
}> = [
  {
    icon: "🔗",
    title: "How linking works",
    subtitle: "Applies to every formation below",
    detail:
      "You need at least two living allies on the same team, standing in an orthogonal chain (up, down, left, right—no diagonals). Every unit in the chain must share the same formation: either a named line (mixed roles allowed where listed) or the generic Battle line (same unit role only). Disconnected groups do not share bonuses; moving or casualties can break the chain."
  },
  {
    icon: "⚔️",
    title: "Battle line",
    subtitle: "Default line · all factions",
    detail:
      "Who gets it: any unit whose role is not on that faction’s named formation card below (e.g. Roman Velites, Auxiliary, Triarii—not Legionary/Praetorian/Centurion who use Testudo; Greek Archers or Cavalry—not Hoplite/Phalangite/Agema who use Phalanx; same idea for every team). Only units of the same role can link. Buff: +5% max HP for each extra linked ally after the first (two of the same role = +5% max HP, three in a chain = +10%, and so on). No extra attack or damage reduction from this formation alone."
  },
  {
    icon: "🐢",
    title: "Testudo",
    subtitle: "Romans",
    detail:
      "Roles: Legionary, Praetorian, Centurion. Buff: same max HP scaling as Battle line (+5% per extra linked ally in the chain). While linked, additionally −10% damage taken from ranged troop attacks (archers, slingers, etc.—not siege engines). Log tag: Testudo (ranged)."
  },
  {
    icon: "🔱",
    title: "Phalanx",
    subtitle: "Greeks",
    detail:
      "Roles: Phalangite, Hoplite, Agema. No HP from formation. While linked: +12% attack when attacking mounted troops; −12% damage taken when defending against close-combat attackers. Log tags: Phalanx (vs mounted), Phalanx (hold)."
  },
  {
    icon: "🩸",
    title: "Blood Oath",
    subtitle: "Barbarians",
    detail:
      "Roles: Barbarian Warrior, Barbarian Berserker, Barbarian Axeman, Oathsworn, Barbarian Warlord. While linked: +12% attack when your unit is at or below 50% HP. Log tag: Blood Oath (low HP)."
  },
  {
    icon: "🔥",
    title: "Fury Charge",
    subtitle: "Gauls",
    detail:
      "Roles: Gallic Warrior, Gaesatae, Gallic Berserker, Gallic Oathsworn. While linked: +8% attack when attacking. Log tag: Fury Charge."
  },
  {
    icon: "🌲",
    title: "Wild Ambush",
    subtitle: "Germanic",
    detail:
      "Roles: Germanic Warrior, Germanic Spearman, Germanic Raider, Chosen Axeman, Hearthguard. While linked: +10% attack when your tile is forest; when defending on forest or hill, −12% damage taken from ranged attackers. Log tags: Wild Ambush, Wild Ambush Cover."
  },
  {
    icon: "🐘",
    title: "Battle Cohesion",
    subtitle: "Carthage",
    detail:
      "Roles: Libyan Infantry, Sacred Band, African Pikeman, Numidian Cavalry, Balearic Slinger, War Elephant. While linked: +6% attack when attacking; −6% damage taken when defending. Log tags: Battle Cohesion."
  },
  {
    icon: "☀️",
    title: "Sun Chariot",
    subtitle: "Egypt",
    detail:
      "Roles: War Chariot, Royal Chariot, Nubian Archer, Egyptian Archer, Medjay. While linked: +8% attack after moving this turn when attacking with a chariot role; −15% damage taken from ranged attackers; +1 move on desert tiles. Log tags: Sun Chariot, Sun Chariot Cover."
  },
  {
    icon: "🗡️",
    title: "Rhomphaia Line",
    subtitle: "Thracians",
    detail:
      "Roles: Rhomphaia Fighter, Falx Warrior, Thracian Guard. While linked: +12% attack when the defender has Guarded or Shield Wall (ability active). Log tag: Rhomphaia Line."
  },
  {
    icon: "🪓",
    title: "Falx Dominion",
    subtitle: "Dacians",
    detail:
      "Roles: Falxman, Dacian Warrior, Dacian Guard. While linked: +12% attack when attacking close-combat troops. Log tag: Falx Dominion."
  },
  {
    icon: "🏹",
    title: "Nomad Strike",
    subtitle: "Parthians",
    detail:
      "Roles: Horse Archer, Elite Horse Archer, Camel Rider Archer. While linked: +10% attack when you moved earlier this turn before attacking. Log tag: Nomad Strike."
  },
  {
    icon: "🏛️",
    title: "Imperial Cohort",
    subtitle: "Seleucids",
    detail:
      "Roles: Seleucid Phalangite, Silver Shield Infantry, Thorakitai, Seleucid Cataphract, Seleucid War Elephant. While linked: +6% attack when attacking; −8% damage taken when defending. Log tags: Imperial Cohort."
  },
  {
    icon: "🛡️",
    title: "Iron Shield",
    subtitle: "Vikings",
    detail:
      "Roles: Huscarl, Hirdman, Shieldmaiden, Jomsviking, Varangian Guard. While linked: +6% attack when attacking; −18% damage taken when defending against close-combat attackers. Log tags: Iron Shield."
  }
] as const;

export const AI_MECHANICS_INFO = [
  "AI-controlled factions **use civilization abilities** on cooldown when a good target exists (volley vs exposed enemies using the same fixed volley power as players, reinforcement with the same **250 HP** restore and card attack bonuses, Roman summon toward the fight). **Human** players get a **battle-log line and cyan-button pulse** when their civ ability comes off cooldown (not tutorial / AI watch).",
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
