import { generateTroopStats } from "../Units/troopStats";
import { getTerrainAt } from "./terrainEngine";
import type { TeamName, TerrainType } from "./types";

export const TUTORIAL_BATTLEFIELD_SIZE = 8 as const;

const PT: TeamName = "Romans";
const ET: TeamName = "Barbarians";

const makeUnit = (
  id: string,
  team: TeamName,
  name: string,
  role: string,
  x: number,
  y: number,
  Icon: string
) => ({
  id,
  team,
  name,
  ...generateTroopStats(role),
  x,
  y,
  role,
  Icon
});

/** Fixed 8×8 terrain per micro-mission. */
export function buildTutorialTerrain(missionIndex: number): TerrainType[][] {
  const n = TUTORIAL_BATTLEFIELD_SIZE;
  const grid: TerrainType[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => "plain" as TerrainType)
  );
  if (missionIndex === 2) {
    grid[4][4] = "forest";
    grid[4][5] = "hill";
  }
  if (missionIndex === 6) {
    for (let y = 1; y <= 6; y++) {
      grid[y][3] = "river";
    }
  }
  if (missionIndex === 11) {
    grid[4][4] = "hill";
  }
  if (missionIndex === 12) {
    for (let x = 3; x <= 5; x++) {
      grid[4][x] = "desert";
    }
  }
  if (missionIndex === 15) {
    grid[4][4] = "forest";
    grid[4][5] = "forest";
  }
  return grid;
}

/** Romans vs Barbarians tutorial setups — minimal units per lesson. */
export function buildTutorialUnits(missionIndex: number): any[] {
  switch (missionIndex) {
    case 0:
      return [makeUnit("tut_m0_leg", PT, "Legionary", "Legionary", 1, 1, "⚔️")];
    case 1:
      return [
        makeUnit("tut_m1_leg", PT, "Legionary", "Legionary", 2, 4, "⚔️"),
        makeUnit("tut_m1_bar", ET, "Barbarian Warrior", "Barbarian Warrior", 3, 4, "🪓")
      ];
    case 2:
      return [makeUnit("tut_m2_leg", PT, "Legionary", "Legionary", 3, 4, "⚔️")];
    case 3:
      return [
        makeUnit("tut_m3_arch", PT, "Archer", "Archer", 2, 4, "🏹"),
        makeUnit("tut_m3_bar", ET, "Barbarian Warrior", "Barbarian Warrior", 5, 4, "🪓")
      ];
    case 4:
      return [
        makeUnit("tut_m4_a", PT, "Praetorian", "Praetorian", 2, 4, "🪖"),
        makeUnit("tut_m4_b", PT, "Praetorian", "Praetorian", 5, 4, "🪖")
      ];
    case 5:
      return [
        makeUnit("tut_m5_cav", PT, "Cavalry", "Cavalry", 1, 4, "🐎"),
        makeUnit("tut_m5_bar", ET, "Barbarian Warrior", "Barbarian Warrior", 4, 4, "🪓")
      ];
    case 6:
      return [
        makeUnit("tut_m6_leg", PT, "Legionary", "Legionary", 1, 4, "⚔️"),
        makeUnit("tut_m6_bar", ET, "Barbarian Warrior", "Barbarian Warrior", 5, 4, "🪓")
      ];
    case 7:
      return [
        makeUnit("tut_m7_leg_a", PT, "Legionary", "Legionary", 1, 4, "⚔️"),
        makeUnit("tut_m7_leg_b", PT, "Legionary", "Legionary", 2, 4, "⚔️"),
        makeUnit("tut_m7_bar_a", ET, "Barbarian Warrior", "Barbarian Warrior", 5, 4, "🪓"),
        makeUnit("tut_m7_bar_b", ET, "Barbarian Warrior", "Barbarian Warrior", 6, 4, "🪓")
      ];
    case 8:
      return [
        makeUnit("tut_m8_king", PT, "Roman King", "Roman King", 2, 4, "👑"),
        makeUnit("tut_m8_leg", PT, "Legionary", "Legionary", 3, 4, "⚔️"),
        makeUnit("tut_m8_bar", ET, "Barbarian Warrior", "Barbarian Warrior", 6, 4, "🪓")
      ];
    case 9:
      return [
        makeUnit("tut_m9_leg_a", PT, "Legionary", "Legionary", 2, 4, "⚔️"),
        makeUnit("tut_m9_leg_b", PT, "Legionary", "Legionary", 3, 4, "⚔️")
      ];
    case 10:
      return [
        makeUnit("tut_m10_leg", PT, "Legionary", "Legionary", 1, 4, "⚔️"),
        makeUnit("tut_m10_scout", ET, "Barbarian Scout", "Barbarian Scout", 5, 4, "🐎🏹")
      ];
    case 11:
      return [
        makeUnit("tut_m11_arch", PT, "Archer", "Archer", 2, 4, "🏹"),
        makeUnit("tut_m11_bar", ET, "Barbarian Warrior", "Barbarian Warrior", 6, 4, "🪓")
      ];
    case 12:
      return [
        makeUnit("tut_m12_leg", PT, "Legionary", "Legionary", 1, 4, "⚔️"),
        makeUnit("tut_m12_bar", ET, "Barbarian Warrior", "Barbarian Warrior", 6, 4, "🪓")
      ];
    case 13:
      return [
        makeUnit("tut_m13_cav", PT, "Cavalry", "Cavalry", 1, 4, "🐎"),
        makeUnit("tut_m13_arch", ET, "Barbarian Archer", "Barbarian Archer", 6, 4, "🏹")
      ];
    case 14:
      return [
        makeUnit("tut_m14_bal", PT, "Ballista", "Ballista", 1, 4, "⚙️"),
        makeUnit("tut_m14_bar", ET, "Barbarian Warrior", "Barbarian Warrior", 6, 4, "🪓")
      ];
    case 15:
      return [
        makeUnit("tut_m15_arch", PT, "Archer", "Archer", 2, 4, "🏹"),
        makeUnit("tut_m15_bar", ET, "Barbarian Warrior", "Barbarian Warrior", 6, 4, "🪓")
      ];
    default:
      return [];
  }
}

export function isTutorialMissionComplete(
  missionIndex: number,
  units: any[] | null | undefined,
  terrainMap: TerrainType[][],
  playerTeam: TeamName
): boolean {
  if (!units || units.length === 0) return false;

  /** Kills remove units from state — no row with hp ≤ 0. Treat “no living enemies” as a completed strike. */
  const strikeObjectiveMet = () => {
    const living = units.filter((u) => u.team !== playerTeam && u.hp > 0);
    if (living.length === 0) return true;
    return living.some((u) => u.hp < (u.maxHp ?? u.hp));
  };

  const mergedRomanUnit = () =>
    units.some((u) => u.team === playerTeam && String(u.id ?? "").startsWith("merged_"));

  switch (missionIndex) {
    case 0:
      return units.some((u) => u.team === playerTeam && u.hp > 0 && u.x === 4 && u.y === 4);
    case 1:
    case 3:
    case 5:
    case 8:
    case 10:
    case 11:
    case 13:
    case 14:
    case 15:
      return strikeObjectiveMet();
    case 2: {
      const u = units.find((x) => x.team === playerTeam && x.hp > 0);
      if (!u) return false;
      return getTerrainAt(terrainMap, u.x, u.y) === "forest";
    }
    case 4: {
      const mine = units.filter((u) => u.team === playerTeam && u.hp > 0);
      if (mine.length < 2) return false;
      for (let i = 0; i < mine.length; i++) {
        for (let j = i + 1; j < mine.length; j++) {
          const d = Math.abs(mine[i].x - mine[j].x) + Math.abs(mine[i].y - mine[j].y);
          if (d === 1) return true;
        }
      }
      return false;
    }
    case 6: {
      const mine = units.filter((u) => u.team === playerTeam && u.hp > 0);
      const stoodOnRiver = mine.some((u) => getTerrainAt(terrainMap, u.x, u.y) === "river");
      const fordStrike = strikeObjectiveMet();
      return stoodOnRiver || fordStrike;
    }
    case 7: {
      const foes = units.filter((u) => u.team !== playerTeam);
      if (foes.length === 0) return true;
      const woundedAlive = foes.filter((u) => u.hp > 0 && u.hp < (u.maxHp ?? u.hp));
      if (woundedAlive.length >= 2) return true;
      if (foes.length === 1) return woundedAlive.length === 1;
      return false;
    }
    case 9:
      return mergedRomanUnit();
    case 12: {
      const mine = units.filter((u) => u.team === playerTeam && u.hp > 0);
      const onDesert = mine.some((u) => getTerrainAt(terrainMap, u.x, u.y) === "desert");
      return onDesert || strikeObjectiveMet();
    }
    default:
      return false;
  }
}

export const TUTORIAL_MISSION_COUNT = 16;

export type TutorialMissionMeta = {
  id: number;
  title: string;
  subtitle: string;
  instruction: string;
};

export const TUTORIAL_MISSIONS: readonly TutorialMissionMeta[] = [
  {
    id: 0,
    title: "March",
    subtitle: "Movement",
    instruction:
      "Select your legionary, then click a highlighted tile to move. Reach the marked objective tile (4,4)."
  },
  {
    id: 1,
    title: "Strike",
    subtitle: "Melee attack",
    instruction:
      "Select your legionary. The foe is adjacent — click the enemy’s tile to attack (red highlight). Deal damage once."
  },
  {
    id: 2,
    title: "Ground",
    subtitle: "Terrain",
    instruction:
      "Forest and hill change move, defense, and line of sight. Move onto the forest patch ahead (tile east of your start)."
  },
  {
    id: 3,
    title: "Volley",
    subtitle: "Ranged & ammo",
    instruction:
      "Select your archer and shoot the barbarian at range (no need to stand next to them). Watch ammo on the unit card."
  },
  {
    id: 4,
    title: "Shield wall",
    subtitle: "Signature passives",
    instruction:
      "Signature skills passively modify combat. Move your Praetorians so they stand on orthogonally adjacent tiles — Shield Wall applies when a friendly stands beside you."
  },
  {
    id: 5,
    title: "Charge",
    subtitle: "Mounted",
    instruction:
      "Cavalry has extra move on open ground and the Charge passive on plains. Ride up to the barbarian and attack — a killing blow counts; you don’t have to leave them wounded."
  },
  {
    id: 6,
    title: "Ford",
    subtitle: "Rivers",
    instruction:
      "Rivers slow most troops but Romans get a small crossing bonus. The water column blocks the direct lane — step onto any river tile to ford, then close with the barbarian (completing an attack counts too)."
  },
  {
    id: 7,
    title: "Two fronts",
    subtitle: "Focus fire",
    instruction:
      "You have two legionaries and two enemies. Wound or eliminate both barbarian units — use both of your troops to spread pressure and finish the lesson."
  },
  {
    id: 8,
    title: "Crown",
    subtitle: "Leader aura",
    instruction:
      "Kings, generals, and rulers project Leader Aura: orthogonally adjacent allies gain +10% attack. Your king already touches a legionary — advance and attack the warrior; check the unit card for aura notes when a leader is nearby."
  },
  {
    id: 9,
    title: "Combine",
    subtitle: "Merge stacks",
    instruction:
      "Open the battle toolbar and tap Merge (🔗). Select one legionary, then the adjacent legionary of the same role to combine HP and stats. You have a limited number of merges per battle in full games."
  },
  {
    id: 10,
    title: "Brace",
    subtitle: "Vs mounted",
    instruction:
      "Legionaries have Brace: better offense and defense against mounted targets. Close with the barbarian scout (mounted) and strike — the matchup system rewards the right troop type."
  },
  {
    id: 11,
    title: "Ridge",
    subtitle: "High ground & Deadeye",
    instruction:
      "Hills grant ranged units +1 range and extra attack. Move your archer onto the hill tile, then shoot — archers with Deadeye thrive on elevation."
  },
  {
    id: 12,
    title: "Dunes",
    subtitle: "Desert",
    instruction:
      "Desert penalizes most infantry and ranged unless the faction is desert-hardy. Cross the sand strip or fight through it — Romans are not desert-hardy here, so feel the slowdown, then finish the foe."
  },
  {
    id: 13,
    title: "Hunter",
    subtitle: "Type advantage",
    instruction:
      "Mounted troops get a damage edge versus ranged and siege. Use your cavalry to run down the barbarian archer — the troop-type triangle matters when you close the distance."
  },
  {
    id: 14,
    title: "Bolt",
    subtitle: "Siege & signature",
    instruction:
      "Ballistas are siege: long range, limited move, and Siege Mastery on open or high ground. Shell the warrior from afar; at 0 ammo you drop to range 1 with weaker melee — plan shots."
  },
  {
    id: 15,
    title: "Cover",
    subtitle: "Forest shooting",
    instruction:
      "Forests give ranged units a small attack bonus and soft cover. Step into the trees and volley — combine terrain with your role for efficiency."
  }
] as const;

/** Label for the in-battle primary button after completing a step. */
export function getTutorialNextButtonLabel(missionIndex: number): string {
  if (missionIndex < 0 || missionIndex >= TUTORIAL_MISSION_COUNT) return "Next";
  if (missionIndex >= TUTORIAL_MISSION_COUNT - 1) return "Finish";
  const next = TUTORIAL_MISSIONS[missionIndex + 1];
  return `Next · ${next.title}`;
}
