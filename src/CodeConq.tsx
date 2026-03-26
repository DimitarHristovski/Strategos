// CodeConq - Grid Strategy Game with Highlights and Expanded Features
// Now includes: Health Bars, Kill Counters, Special Ability Tooltips, and Custom Drag & Drop Setup

import { useState, useEffect } from "react";
import { formations } from "./Units/InitialUnits";

const GRID_SIZE = 8;

// Available troop types for custom setup - using existing definitions
const AVAILABLE_TROOPS = {
  Romans: [
    { role: "Roman King", name: "Roman King", Icon: "👑" },
    { role: "Legionary", name: "Legionary", Icon: "⚔️" },
    { role: "Centurion", name: "Centurion", Icon: "🪖" },
    { role: "Archer", name: "Archer", Icon: "🏹" },
    { role: "Cavalry", name: "Cavalry", Icon: "🐎" },
    { role: "Praetorian", name: "Praetorian", Icon: "🪖" },
    { role: "Ballista", name: "Ballista", Icon: "⚔️" },
    { role: "Scorpion", name: "Scorpion", Icon: "⚔️" },
    { role: "Auxiliary", name: "Auxiliary", Icon: "⚔️" },
    { role: "Velites", name: "Velites", Icon: "🏹" },
    { role: "Triarii", name: "Triarii", Icon: "⚔️" }
  ],
  Barbarians: [
    { role: "Barbarian Warrior", name: "Barbarian Warrior", Icon: "🪓" },
    { role: "Barbarian Archer", name: "Barbarian Archer", Icon: "🏹" },
    { role: "Barbarian Chief", name: "Barbarian Chief", Icon: "👑" },
    { role: "Barbarian Berserker", name: "Barbarian Berserker", Icon: "⚔️" },
    { role: "Barbarian Scout", name: "Barbarian Scout", Icon: "🐎" },
    { role: "Barbarian Shaman", name: "Barbarian Shaman", Icon: "🏹" },
    { role: "Barbarian Axeman", name: "Barbarian Axeman", Icon: "⚔️" },
    { role: "Barbarian Spearman", name: "Barbarian Spearman", Icon: "⚔️" },
    { role: "Barbarian Raider", name: "Barbarian Raider", Icon: "⚔️" },
    { role: "Barbarian Warlord", name: "Barbarian Warlord", Icon: "🪓" }
  ],
  Greeks: [
    { role: "Hoplite", name: "Hoplite", Icon: "⚔️" },
    { role: "Phalangite", name: "Phalangite", Icon: "⚔️" },
    { role: "Hypaspist", name: "Hypaspist", Icon: "⚔️" },
    { role: "Companion Cavalry", name: "Companion Cavalry", Icon: "🐎" },
    { role: "Thessalian Cavalry", name: "Thessalian Cavalry", Icon: "🐎" },
    { role: "Peltast", name: "Peltast", Icon: "🏹" },
    { role: "Thureophoroi", name: "Thureophoroi", Icon: "⚔️" },
    { role: "Cretan Archer", name: "Cretan Archer", Icon: "🏹" },
    { role: "Rhodian Slinger", name: "Rhodian Slinger", Icon: "🏹" },
    { role: "Greek Catapult", name: "Greek Catapult", Icon: "⚔️" },
    { role: "Polybolos", name: "Polybolos", Icon: "⚔️" },
    { role: "Agema", name: "Agema", Icon: "⚔️" },
    { role: "Greek Standard Bearer", name: "Greek Standard Bearer", Icon: "🪖" },
    { role: "Macedonian King", name: "Macedonian King", Icon: "👑" }
  ]
};

// Function to generate stats for custom troops (similar to InitialUnits.tsx)
const generateCustomTroopStats = (role: string) => {
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

    default:
      hp = 1;
      maxHp = 1;
      attack = 1;
      ammo = 0;
      range = 1;
      move = 1;
  }

  return { hp, maxHp, attack, ammo, range, move };
};

// Icon mapping
const ICON_MAP = {
  GiSwordman: "⚔️",
  GiArcher: "🏹",
  GiCavalry: "🐎",
  GiCrossedSwords: "⚔️",
  GiHelmet: "🪖",
  GiBo: "🏹",
  GiAce: "🪓",
  FaCrown: "👑"
};

const FORMATION_LEVEL_LABELS: Record<keyof typeof formations, string> = {
  Phalanx: "Level 1",
  Arch: "Level 2",
  Testudo: "Level 3",
  Circle: "Level 4",
  Staggered: "Level 5",
  Delta: "Level 6",
  Tercio: "Level 7",
  Pincer: "Level 8"
};

type GameMode = "single-player" | "multiplayer" | "custom-scenario";
type TeamName = "Romans" | "Barbarians" | "Greeks";

function CodeConq() {
  const [currentFormation, setCurrentFormation] = useState<keyof typeof formations>("Phalanx");
  const [units, setUnits] = useState(formations["Phalanx"]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [turn, setTurn] = useState("Romans");
  const [log, setLog] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  
  // Custom setup mode states
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [customUnits, setCustomUnits] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamName>("Romans");
  const [draggedTroop, setDraggedTroop] = useState<any>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeCount, setMergeCount] = useState(0);
  const [selectedForMerge, setSelectedForMerge] = useState<any>(null);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [multiplayerTeams, setMultiplayerTeams] = useState<[TeamName, TeamName]>(["Romans", "Barbarians"]);

  // Update units when formation changes
  useEffect(() => {
    if (formations[currentFormation]) {
      setUnits(formations[currentFormation]);
      setSelectedId(null);
      setTurn("Romans");
      setRound(1);
      setLog([]);
      setGameStarted(true); // Enable merging immediately in formation mode
      setIsSetupMode(false);
      setCustomUnits([]);
      setMergeCount(0); // Reset merge count for new formation
    }
  }, [currentFormation]);

  const getUnit = (x: number, y: number) => {
    const currentUnits = isSetupMode ? customUnits : units;
    return currentUnits?.find((u: any) => u.x === x && u.y === y);
  };
  
  const getUnitById = (id: string | null) => {
    const currentUnits = isSetupMode ? customUnits : units;
    return currentUnits?.find((u: any) => u.id === id);
  };
  
  const isInRange = (a: any, b: any, range: number) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= range;
  const selected = getUnitById(selectedId);
  const activeTeam = gameMode === "multiplayer" ? turn : "Romans";
  const setupTeams: TeamName[] = gameMode === "multiplayer" ? [multiplayerTeams[0], multiplayerTeams[1]] : ["Romans", "Barbarians", "Greeks"];
  const isTeamAllowedInSetup = (team: TeamName) => setupTeams.includes(team);

  const advanceTurn = () => {
    if (gameMode === "multiplayer") {
      if (turn === multiplayerTeams[0]) {
        setTurn(multiplayerTeams[1]);
      } else {
        setTurn(multiplayerTeams[0]);
        setRound((r) => r + 1);
      }
      return;
    }

    setTurn("Barbarians");
  };

  // Safety check - don't render if units is not properly initialized
  if (!units || units.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading formation...</div>
      </div>
    );
  }

  const highlightMove = selected && (isSetupMode ? customUnits : units) ? [...Array(GRID_SIZE)].flatMap((_, y) =>
    [...Array(GRID_SIZE)].map((_, x) => {
      const distance = Math.abs(x - selected.x) + Math.abs(y - selected.y);
      return (distance <= selected.move && !getUnit(x, y)) ? `${x},${y}` : null;
    }).filter(Boolean)
  ) : [];

  const highlightAttack = selected && (isSetupMode ? customUnits : units) ? [...Array(GRID_SIZE)].flatMap((_, y) =>
    [...Array(GRID_SIZE)].map((_, x) => {
      const target = getUnit(x, y);
      const distance = Math.abs(x - selected.x) + Math.abs(y - selected.y);
      return (target && target.team !== selected.team && distance <= selected.range) ? `${x},${y}` : null;
    }).filter(Boolean)
  ) : [];

  const handleClick = (x: number, y: number) => {
    if (isSetupMode) {
      handleSetupClick(x, y);
      return;
    }
    
    if (turn !== activeTeam || !units) return;
    
    const clicked = getUnit(x, y);

    if (clicked && clicked.team === activeTeam) {
      if (mergeMode) {
        // In merge mode, select first troop for merging
        if (!selectedForMerge) {
          setSelectedForMerge(clicked);
          setLog((prevLog) => [`Selected ${clicked.name} for merging. Click on another ${clicked.role} to merge.`, ...prevLog]);
        } else if (selectedForMerge.id !== clicked.id && selectedForMerge.role === clicked.role) {
          // Check if troops are adjacent
          if (!areAdjacent(selectedForMerge, clicked)) {
            setLog((prevLog) => [`Troops must be adjacent to merge! Move them next to each other first.`, ...prevLog]);
            setSelectedForMerge(null);
            setMergeMode(false);
            setSelectedId(null);
            return;
          }
          
          // Second troop selected, perform merge
          if (mergeCount < 3) {
            const mergedTroop = {
              ...selectedForMerge,
              hp: Math.min(selectedForMerge.hp + clicked.hp, selectedForMerge.maxHp + clicked.maxHp),
              maxHp: selectedForMerge.maxHp + clicked.maxHp,
              attack: Math.floor((selectedForMerge.attack + clicked.attack) * 1),
              range: Math.max(selectedForMerge.range, clicked.range),
              move: Math.max(selectedForMerge.move, clicked.move),
              ammo: Math.max(selectedForMerge.ammo || 0, clicked.ammo || 0),
              id: `merged_${selectedForMerge.role}_${Date.now()}`,
              name: `Elite ${selectedForMerge.role}`
            };
            
            // Remove both original troops and add merged troop
            setUnits((prev) => {
              const filtered = prev.filter((u: any) => u.id !== selectedForMerge.id && u.id !== clicked.id);
              return [...filtered, mergedTroop];
            });
            
            setMergeCount(prev => prev + 1);
            setLog((prevLog) => [`Merged ${selectedForMerge.name} and ${clicked.name} into Elite ${mergedTroop.role}! (${3 - mergeCount - 1} merges remaining)`, ...prevLog]);
            
            // Reset merge state
            setSelectedForMerge(null);
            setMergeMode(false);
            setSelectedId(null);
          } else {
            setLog((prevLog) => [`No more merges allowed this game!`, ...prevLog]);
            setSelectedForMerge(null);
            setMergeMode(false);
            setSelectedId(null);
          }
        } else if (selectedForMerge.role !== clicked.role) {
          setLog((prevLog) => [`Can only merge troops of the same role! Selected: ${selectedForMerge.role}, Clicked: ${clicked.role}`, ...prevLog]);
          setSelectedForMerge(null);
          setMergeMode(false);
          setSelectedId(null);
        } else {
          setLog((prevLog) => [`Cannot merge the same troop with itself!`, ...prevLog]);
          setSelectedForMerge(null);
          setMergeMode(false);
          setSelectedId(null);
        }
      } else {
        // Normal selection mode
        setSelectedId(clicked.id);
      }
    } else if (selected) {
      if (clicked && clicked.team !== selected.team && isInRange(selected, clicked, selected.range)) {
        // Check if target is alive
        if (clicked.hp <= 0) {
          setLog((prevLog) => [`${clicked.name} is already dead!`, ...prevLog]);
          return;
        }
        
        // Attack enemy (Barbarians or Greeks)
        const dmg = selected.attack;
        clicked.hp -= dmg;
        
        // If this is a ranged attack, reduce ammunition
        if (selected.ammo && selected.ammo > 0) {
          selected.ammo -= 1;
          setLog((prevLog) => [`${selected.name} (${selected.team}) attacked ${clicked.name} (${clicked.team}) for ${dmg} (${selected.ammo} shots remaining)`, ...prevLog]);
          
          // If out of ammo, switch to melee
          if (selected.ammo === 0) {
            selected.range = 1; // Switch to melee range
            setLog((prevLog) => [`${selected.name} is out of ammo! Switching to melee combat.`, ...prevLog]);
          }
        } else {
          setLog((prevLog) => [`${selected.name} (${selected.team}) attacked ${clicked.name} (${clicked.team}) for ${dmg}`, ...prevLog]);
        }
        
        // Check if target was killed
        if (clicked.hp <= 0) {
          setLog((prevLog) => [`${clicked.name} (${clicked.team}) was killed!`, ...prevLog]);
          // Immediately remove dead unit
          setUnits((prev) => prev.filter((u: any) => u.hp > 0));
        }
        
        setSelectedId(null);
        advanceTurn();
      } else if (!clicked && isInRange(selected, { x, y }, selected.move)) {
        // Move to empty space
        setUnits((prev) => prev.map((u: any) => u.id === selected.id ? { ...u, x, y } : u));
        setSelectedId(null);
        advanceTurn();
      }
    }
  };

  const handleSetupClick = (x: number, y: number) => {
    if (draggedTroop) {
      if (!isTeamAllowedInSetup(selectedTeam)) return;
      // Check if position is valid (not occupied)
      if (!getUnit(x, y)) {
        // Check team limits
        const teamCount = customUnits.filter(u => u.team === selectedTeam).length;
        if (teamCount < 16) {
          const stats = generateCustomTroopStats(draggedTroop.role);
          const newTroop = {
            ...draggedTroop,
            ...stats,
            id: `${selectedTeam}_${draggedTroop.role}_${Date.now()}`,
            team: selectedTeam,
            x,
            y,
            Icon: draggedTroop.Icon
          };
          
          setCustomUnits(prev => [...prev, newTroop]);
          setDraggedTroop(null);
        }
      }
    } else {
      // Select existing unit for removal
      const existingUnit = getUnit(x, y);
      if (existingUnit) {
        setCustomUnits(prev => prev.filter(u => u.id !== existingUnit.id));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    if (draggedTroop) {
      if (!isTeamAllowedInSetup(selectedTeam)) return;
      // Check if position is valid (not occupied)
      if (!getUnit(x, y)) {
        // Check team limits
        const teamCount = customUnits.filter(u => u.team === selectedTeam).length;
        if (teamCount < 16) {
          const stats = generateCustomTroopStats(draggedTroop.role);
          const newTroop = {
            ...draggedTroop,
            ...stats,
            id: `${selectedTeam}_${draggedTroop.role}_${Date.now()}`,
            team: selectedTeam,
            x,
            y,
            Icon: draggedTroop.Icon
          };
          
          setCustomUnits(prev => [...prev, newTroop]);
          setDraggedTroop(null);
        }
      }
    } else if (isSetupMode) {
      // Handle troop removal in setup mode
      const existingUnit = getUnit(x, y);
      if (existingUnit) {
        setCustomUnits(prev => prev.filter(u => u.id !== existingUnit.id));
      }
    } else if (!isSetupMode && mergeMode) {
      // Handle troop merging only in formation mode
      const existingUnit = getUnit(x, y);
      const draggedUnit = units?.find(u => u.id === selectedId);
      
      if (draggedUnit && (draggedUnit.team === "Romans" || draggedUnit.team === "Barbarians" || draggedUnit.team === "Greeks")) {
        if (!existingUnit) {
          // Select first troop for merging
          setSelectedForMerge(draggedUnit);
          setLog((prevLog) => [`Selected ${draggedUnit.name} for merging. Now drag another ${draggedUnit.role} onto it to merge.`, ...prevLog]);
        } else if (existingUnit.team === draggedUnit.team && existingUnit.role === draggedUnit.role && existingUnit.id !== draggedUnit.id) {
          // Check if troops are adjacent
          const dx = Math.abs(draggedUnit.x - existingUnit.x);
          const dy = Math.abs(draggedUnit.y - existingUnit.y);
          const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
          
          if (isAdjacent && mergeCount < 2) {
            const mergedTroop = {
              ...draggedUnit,
              hp: Math.min(draggedUnit.hp + existingUnit.hp, draggedUnit.maxHp + existingUnit.maxHp),
              maxHp: draggedUnit.maxHp + existingUnit.maxHp,
              attack: Math.floor((draggedUnit.attack + existingUnit.attack) * 1.2),
              range: Math.max(draggedUnit.range, existingUnit.range),
              move: Math.max(draggedUnit.move, existingUnit.move),
              ammo: Math.max(draggedUnit.ammo || 0, existingUnit.ammo || 0),
              id: `merged_${draggedUnit.role}_${Date.now()}`,
              name: `Elite ${draggedUnit.role}`,
              x,
              y
            };
            
            // Remove both original troops and add merged troop
            setUnits((prev) => {
              const filtered = prev.filter((u: any) => u.id !== draggedUnit.id && u.id !== existingUnit.id);
              return [...filtered, mergedTroop];
            });
            
            setMergeCount(prev => prev + 1);
            setLog((prevLog) => [`Merged ${draggedUnit.name} and ${existingUnit.name} into Elite ${draggedUnit.role}! (${2 - mergeCount - 1} merges remaining)`, ...prevLog]);
            
            setSelectedId(null);
            setSelectedForMerge(null);
            setMergeMode(false);
          } else if (!isAdjacent) {
            setLog((prevLog) => [`Troops must be adjacent to merge!`, ...prevLog]);
          } else {
            setLog((prevLog) => [`No more merges allowed this game!`, ...prevLog]);
          }
        } else if (existingUnit.team === draggedUnit.team && existingUnit.role === draggedUnit.role && existingUnit.id === draggedUnit.id) {
          setLog((prevLog) => [`Cannot merge a troop with itself!`, ...prevLog]);
        } else if (existingUnit.team === draggedUnit.team && existingUnit.role !== draggedUnit.role) {
          setLog((prevLog) => [`Can only merge troops of the same role!`, ...prevLog]);
        } else if (existingUnit.team !== draggedUnit.team) {
          setLog((prevLog) => [`Cannot merge with enemy troops!`, ...prevLog]);
        }
      }
    }
  };

  const startCustomGame = () => {
    if (customUnits.length === 0) return;
    
    setIsSetupMode(false);
    setUnits(customUnits);
    setGameStarted(true);
    setMergeCount(0); // Reset merge count for new game
  };

  const resetCustomSetup = () => {
    setCustomUnits([]);
    setDraggedTroop(null);
    setSelectedTeam(gameMode === "multiplayer" ? multiplayerTeams[0] : "Romans");
  };

  const startSinglePlayerMode = () => {
    setGameMode("single-player");
    setIsSetupMode(false);
    setUnits(formations[currentFormation]);
    setTurn("Romans");
    setRound(1);
    setSelectedId(null);
    setLog([]);
    setGameStarted(true);
    setMergeCount(0);
    setMergeMode(false);
    setSelectedForMerge(null);
  };

  const startMultiplayerMode = () => {
    setGameMode("multiplayer");
    setIsSetupMode(true);
    setUnits(formations[currentFormation]);
    setCustomUnits([]);
    setSelectedTeam(multiplayerTeams[0]);
    setTurn(multiplayerTeams[0]);
    setRound(1);
    setSelectedId(null);
    setLog(["Multiplayer setup: choose 2 teams, place troops, then start."]);
    setGameStarted(false);
    setMergeCount(0);
    setMergeMode(false);
    setSelectedForMerge(null);
  };

  const startMultiplayerGame = () => {
    if (customUnits.length === 0) return;
    const teamAUnits = customUnits.filter((u: any) => u.team === multiplayerTeams[0]).length;
    const teamBUnits = customUnits.filter((u: any) => u.team === multiplayerTeams[1]).length;
    if (teamAUnits === 0 || teamBUnits === 0) {
      setLog((prev) => [`Both selected teams need at least 1 troop before starting.`, ...prev]);
      return;
    }

    setIsSetupMode(false);
    setUnits(customUnits);
    setTurn(multiplayerTeams[0]);
    setRound(1);
    setGameStarted(true);
    setMergeCount(0);
  };

  const startCustomScenarioMode = () => {
    setGameMode("custom-scenario");
    setIsSetupMode(true);
    setTurn("Romans");
    setRound(1);
    setSelectedId(null);
    setLog([]);
    setGameStarted(false);
    setMergeCount(0);
    setMergeMode(false);
    setSelectedForMerge(null);
    resetCustomSetup();
  };

  const backToMainMenu = () => {
    setGameMode(null);
    setIsSetupMode(false);
    setCurrentFormation("Phalanx");
    setUnits(formations["Phalanx"]);
    setCustomUnits([]);
    setDraggedTroop(null);
    setSelectedTeam("Romans");
    setSelectedId(null);
    setTurn("Romans");
    setRound(1);
    setLog([]);
    setGameStarted(false);
    setMergeMode(false);
    setMergeCount(0);
    setSelectedForMerge(null);
    setMultiplayerTeams(["Romans", "Barbarians"]);
  };

  const getTeamCount = (team: string) => {
    return customUnits.filter(u => u.team === team).length;
  };

  // Check if two troops are adjacent
  const areAdjacent = (troop1: any, troop2: any) => {
    const dx = Math.abs(troop1.x - troop2.x);
    const dy = Math.abs(troop1.y - troop2.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  };

  // Automatic movement for AI teams (Barbarians and Greeks) - one unit at a time
  useEffect(() => {
    if (isSetupMode || gameMode === "multiplayer" || (turn !== "Barbarians" && turn !== "Greeks") || !units) return;
    
    const timeout = setTimeout(() => {
      const currentTeam = turn;
      const enemies = units.filter((u: any) => u.team === currentTeam);
      const players = units.filter((u: any) => u.team !== currentTeam);
      
      if (enemies.length === 0 || players.length === 0) {
        // Move to next team's turn
        if (currentTeam === "Barbarians") {
          setTurn("Greeks");
        } else if (currentTeam === "Greeks") {
          setTurn("Romans");
        }
        return;
      }

      // Find the current team's unit that's closest to any enemy
      let bestEnemy = enemies[0];
      let bestDistance = Infinity;
      
      enemies.forEach((enemy) => {
        const closestPlayer = players.reduce((prev, curr) => {
          const prevDist = Math.abs(enemy.x - prev.x) + Math.abs(enemy.y - prev.y);
          const currDist = Math.abs(enemy.x - curr.x) + Math.abs(enemy.y - curr.y);
          return currDist < prevDist ? curr : prev;
        });
        
        const distance = Math.abs(enemy.x - closestPlayer.x) + Math.abs(enemy.y - closestPlayer.y);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestEnemy = enemy;
        }
      });
      
      // Move or attack with the best unit
      const target = players.reduce((prev, curr) => {
        const prevDist = Math.abs(bestEnemy.x - prev.x) + Math.abs(bestEnemy.y - prev.y);
        const currDist = Math.abs(bestEnemy.x - curr.x) + Math.abs(bestEnemy.y - curr.y);
        return currDist < prevDist ? curr : prev;
      });
      
      // Check if target is alive
      if (target.hp <= 0) {
        // Target is dead, move to next team's turn
        if (currentTeam === "Barbarians") {
          setTurn("Greeks");
        } else if (currentTeam === "Greeks") {
          setTurn("Romans");
          setRound((r) => r + 1);
        }
        return;
      }
      
      const distX = target.x - bestEnemy.x;
      const distY = target.y - bestEnemy.y;
      
      if (Math.abs(distX) + Math.abs(distY) <= bestEnemy.range) {
        // Attack if in range
        target.hp -= bestEnemy.attack;
        
        // Check if target was killed
        if (target.hp <= 0) {
          setLog((log) => [`${target.name} (${target.team}) was killed by ${bestEnemy.name} (${currentTeam})!`, ...log]);
          // Immediately remove dead unit
          setUnits((prev) => prev.filter((u: any) => u.hp > 0));
        }
        
        // If this is a ranged attack, reduce ammunition
        if (bestEnemy.ammo && bestEnemy.ammo > 0) {
          bestEnemy.ammo -= 1;
          setLog((log) => [`${bestEnemy.name} (${currentTeam}) attacked ${target.name} (${target.team}) for ${bestEnemy.attack} (${bestEnemy.ammo} shots remaining)`, ...log]);
          
          // If out of ammo, switch to melee
          if (bestEnemy.ammo === 0) {
            bestEnemy.range = 1; // Switch to melee range
            setLog((log) => [`${bestEnemy.name} is out of ammo! Switching to melee combat.`, ...log]);
          }
        } else {
          setLog((log) => [`${bestEnemy.name} (${currentTeam}) attacked ${target.name} (${target.team}) for ${bestEnemy.attack}`, ...log]);
        }
      } else {
        // Move towards enemy
        let moveX = 0, moveY = 0;
        if (Math.abs(distX) > Math.abs(distY)) {
          moveX = Math.sign(distX);
        } else {
          moveY = Math.sign(distY);
        }
        
        const newX = bestEnemy.x + moveX;
        const newY = bestEnemy.y + moveY;
        const alreadyOccupied = getUnit(newX, newY);
        
        if (!alreadyOccupied) {
          bestEnemy.x = newX;
          bestEnemy.y = newY;
          setLog((log) => [`${bestEnemy.name} (${currentTeam}) moved`, ...log]);
        }
      }
      
      setUnits([...units].filter((u: any) => u.hp > 0));
      
      // Move to next team's turn
      if (currentTeam === "Barbarians") {
        setTurn("Greeks");
      } else if (currentTeam === "Greeks") {
        setTurn("Romans");
        setRound((r) => r + 1);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [turn, units, isSetupMode, gameMode]);

  const checkEnd = () => {
    const currentUnits = isSetupMode ? customUnits : units;
    if (!currentUnits || currentUnits.length === 0) return null;

    if (gameMode === "multiplayer") {
      const teamA = multiplayerTeams[0];
      const teamB = multiplayerTeams[1];
      const teamALeft = currentUnits.some((u: any) => u.team === teamA);
      const teamBLeft = currentUnits.some((u: any) => u.team === teamB);
      if (!teamALeft && !teamBLeft) return "Game Over - Both teams eliminated!";
      if (!teamALeft) return `Victory - ${teamB} Win!`;
      if (!teamBLeft) return `Victory - ${teamA} Win!`;
      return null;
    }
    
    const romansLeft = currentUnits.some((u: any) => u.team === "Romans");
    const barbariansLeft = currentUnits.some((u: any) => u.team === "Barbarians");
    const greeksLeft = currentUnits.some((u: any) => u.team === "Greeks");
    
    // Check for team elimination
    if (!romansLeft && !barbariansLeft && !greeksLeft) return "Game Over - All teams eliminated!";
    if (!romansLeft && !barbariansLeft) return "Victory - Greeks Win!";
    if (!romansLeft && !greeksLeft) return "Victory - Barbarians Win!";
    if (!barbariansLeft && !greeksLeft) return "Victory - Romans Win!";
    
    // Check for single team victory (only one team left)
    if (romansLeft && !barbariansLeft && !greeksLeft) return "Victory - Romans Win!";
    if (barbariansLeft && !romansLeft && !greeksLeft) return "Victory - Barbarians Win!";
    if (greeksLeft && !romansLeft && !barbariansLeft) return "Victory - Greeks Win!";
    
    return null;
  };

  if (!gameMode) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-gradient-to-br from-green-800 via-green-700 to-green-900 min-h-screen">
        <div className="game-ui p-8 text-center max-w-2xl w-full">
          <h1 className="text-5xl font-bold text-yellow-200 mb-4 drop-shadow-lg">Battlecry</h1>
          <p className="text-yellow-100 text-lg mb-8">Choose your mode to enter the battlefield</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={startSinglePlayerMode}
              className="battle-button px-6 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
            >
              Single Player
            </button>
            <button
              onClick={startMultiplayerMode}
              className="battle-button px-6 py-4 text-lg font-semibold bg-red-600 hover:bg-red-700"
            >
              Multiplayer
            </button>
            <button
              onClick={startCustomScenarioMode}
              className="battle-button px-6 py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-700"
            >
              Custom Scenario
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 space-y-6 bg-gradient-to-br from-green-800 via-green-700 to-green-900 min-h-screen">
      {/* Game Header */}
      <div className="game-ui p-6 text-center relative">
        {/* Decorative SVG elements */}
        <svg className="absolute top-2 left-4 w-12 h-12 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
        </svg>
        <svg className="absolute top-2 right-4 w-12 h-12 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
        </svg>
        
        <h1 className="text-4xl font-bold text-yellow-200 mb-2 drop-shadow-lg">Battlecry</h1>
        <p className="text-yellow-100 text-lg">
          {gameMode === "multiplayer" ? "Local Multiplayer Battle" : "Player vs AI Battle"}
        </p>
        <p className="text-green-200 text-sm mt-2">
          {isSetupMode
            ? "Custom Setup Mode - Drag troops to place them on the field"
            : gameMode === "multiplayer"
              ? "Pass-and-play mode: Romans and Barbarians take turns on the same device. No AI."
              : "You control the Romans! Click to select and move/attack Barbarians OR Greeks. All teams fight each other in a three-way battle."}
        </p>
        
        {/* Decorative swords */}
        <svg className="absolute bottom-2 left-8 w-8 h-8 text-red-400 opacity-50" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.92 5H5.14c-.47 0-.92.21-1.18.56L3.04 7H2v1h1.04l.92 1.44c.26.35.71.56 1.18.56h1.78c.47 0 .92-.21 1.18-.56L9.96 7H11V6H9.96L8.1 4.56C7.84 4.21 7.39 4 6.92 4z"/>
        </svg>
        <svg className="absolute bottom-2 right-8 w-8 h-8 text-blue-400 opacity-50" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.92 5H5.14c-.47 0-.92.21-1.18.56L3.04 7H2v1h1.04l.92 1.44c.26.35.71.56 1.18.56h1.78c.47 0 .92-.21 1.18-.56L9.96 7H11V6H9.96L8.1 4.56C7.84 4.21 7.39 4 6.92 4z"/>
        </svg>
      </div>

      {/* Game Controls */}
      <div className="game-ui p-4 flex flex-wrap gap-4 items-center justify-center relative">
        {/* Decorative helmet */}
        <svg className="absolute -top-2 left-2 w-8 h-8 text-yellow-400 opacity-40" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        
        <button
          onClick={backToMainMenu}
          className="battle-button px-6 py-3 text-lg font-semibold bg-gray-700 hover:bg-gray-800 relative"
        >
          <svg className="absolute -left-2 -top-2 w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          ↩️ Back to Menu
        </button>

        {gameMode === "custom-scenario" && isSetupMode && (
          <>
            <button
              onClick={startCustomGame}
              disabled={customUnits.length === 0}
              className="battle-button px-6 py-3 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              <svg className="absolute -left-2 -top-2 w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              🚀 Start Custom Game
            </button>
            
            <button
              onClick={resetCustomSetup}
              className="battle-button px-6 py-3 text-lg font-semibold bg-red-600 hover:bg-red-700 relative"
            >
              <svg className="absolute -left-2 -top-2 w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              🔄 Reset Setup
            </button>
            
            <button
              onClick={() => setIsSetupMode(false)}
              className="battle-button px-6 py-3 text-lg font-semibold bg-gray-600 hover:bg-gray-700 relative"
            >
              <svg className="absolute -left-2 -top-2 w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              ↩️ Back to Scenario
            </button>
          </>
        )}

        {gameMode === "multiplayer" && isSetupMode && (
          <>
            <button
              onClick={startMultiplayerGame}
              disabled={customUnits.length === 0}
              className="battle-button px-6 py-3 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              <svg className="absolute -left-2 -top-2 w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              🚀 Start Multiplayer Game
            </button>
            
            <button
              onClick={resetCustomSetup}
              className="battle-button px-6 py-3 text-lg font-semibold bg-red-600 hover:bg-red-700 relative"
            >
              <svg className="absolute -left-2 -top-2 w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              🔄 Reset Setup
            </button>
          </>
        )}
        
        {!isSetupMode && ((gameMode === "multiplayer" && gameStarted) || (gameMode !== "multiplayer" && turn === "Romans" && gameStarted)) && (
          <>
            <button
              onClick={advanceTurn}
              className="battle-button px-6 py-3 text-lg font-semibold bg-yellow-600 hover:bg-yellow-700 relative"
            >
              <svg className="absolute -left-2 -top-2 w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              ⏭️ End Turn
            </button>
            
            {/* Merge count display */}
            {!isSetupMode && gameStarted && (
              <div className="text-blue-200 font-semibold bg-blue-900 bg-opacity-50 px-3 py-2 rounded border border-blue-600">
                <span className="block text-sm">Merges Used:</span>
                <span className="block text-lg">{mergeCount}/2</span>
              </div>
            )}
            
            {/* Always visible merge button when game is started */}
            {!isSetupMode && gameStarted && (
              <button
                onClick={() => {
                  if (mergeCount < 2) {
                    setMergeMode(!mergeMode);
                    setSelectedForMerge(null);
                    setSelectedId(null);
                    if (!mergeMode) {
                      setLog((prevLog) => [`Merge mode activated! All teams can now merge their troops. Click on two adjacent troops of the same role to merge them. (${2 - mergeCount} merges remaining)`, ...prevLog]);
                    } else {
                      setLog((prevLog) => [`Merge mode deactivated.`, ...prevLog]);
                    }
                  } else {
                    setLog((prevLog) => [`No more merges allowed this game!`, ...prevLog]);
                  }
                }}
                disabled={mergeCount >= 2}
                className={`battle-button px-6 py-3 text-lg font-semibold relative ${
                  mergeMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <svg className="absolute -left-2 -top-2 w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {mergeMode ? '🔄 Cancel Merge' : '🔗 Merge Troops'}
              </button>
            )}
          </>
        )}
        
        <div className="text-yellow-200 font-semibold">
          <span className="block">
            {gameMode === "custom-scenario"
              ? (isSetupMode ? "Custom Setup" : "Mode: Custom Scenario")
              : gameMode === "multiplayer"
                ? `Mode: Multiplayer (${multiplayerTeams[0]} vs ${multiplayerTeams[1]})`
                : `Level: ${FORMATION_LEVEL_LABELS[currentFormation]}`}
          </span>
          {!isSetupMode && <span className="block">Round: {round}</span>}
          
          {/* Formation Selector */}
          {!isSetupMode && gameMode !== "custom-scenario" && (
            <div className="mt-3">
              <label htmlFor="formation-select" className="block text-sm text-yellow-100 mb-1">
                Switch Level:
              </label>
              <select
                id="formation-select"
                value={currentFormation}
                onChange={(e) => setCurrentFormation(e.target.value as keyof typeof formations)}
                className="bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-yellow-400"
              >
                <option value="Phalanx">Level 1 (16v16)</option>
                <option value="Arch">Level 2 (8v8)</option>
                <option value="Testudo">Level 3 (8v8)</option>
                <option value="Circle">Level 4 (8v8)</option>
                <option value="Staggered">Level 5 (10v10)</option>
                <option value="Delta">Level 6 (8v8)</option>
                <option value="Tercio">Level 7 (8v8)</option>
                <option value="Pincer">Level 8 (8v8)</option>
              </select>
            </div>
          )}
        </div>
        
        {/* Decorative shield */}
        <svg className="absolute -bottom-2 right-2 w-8 h-8 text-yellow-400 opacity-40" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-9-4z"/>
        </svg>
      </div>

      {/* Setup Mode Controls */}
      {isSetupMode && (
        <div className="game-ui p-4 w-full max-w-6xl relative">
          {/* Decorative cross swords */}
          <svg className="absolute -top-4 left-4 w-10 h-10 text-red-400 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.92 5H5.14c-.47 0-.92.21-1.18.56L3.04 7H2v1h1.04l.92 1.44c.26.35.71.56 1.18.56h1.78c.47 0 .92-.21 1.18-.56L9.96 7H11V6H9.96L8.1 4.56C7.84 4.21 7.39 4 6.92 4z"/>
          </svg>
          
          {gameMode === "multiplayer" && (
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-yellow-200 text-sm mb-1">Player 1 Team</label>
                <select
                  value={multiplayerTeams[0]}
                  onChange={(e) => {
                    const next = e.target.value as TeamName;
                    if (next === multiplayerTeams[1]) return;
                    setMultiplayerTeams([next, multiplayerTeams[1]]);
                    setCustomUnits((prev) => prev.filter((u: any) => u.team === next || u.team === multiplayerTeams[1]));
                    if (selectedTeam !== next && selectedTeam !== multiplayerTeams[1]) setSelectedTeam(next);
                  }}
                  className="w-full bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
                >
                  <option value="Romans">Romans</option>
                  <option value="Barbarians">Barbarians</option>
                  <option value="Greeks">Greeks</option>
                </select>
              </div>
              <div>
                <label className="block text-yellow-200 text-sm mb-1">Player 2 Team</label>
                <select
                  value={multiplayerTeams[1]}
                  onChange={(e) => {
                    const next = e.target.value as TeamName;
                    if (next === multiplayerTeams[0]) return;
                    setMultiplayerTeams([multiplayerTeams[0], next]);
                    setCustomUnits((prev) => prev.filter((u: any) => u.team === multiplayerTeams[0] || u.team === next));
                    if (selectedTeam !== next && selectedTeam !== multiplayerTeams[0]) setSelectedTeam(multiplayerTeams[0]);
                  }}
                  className="w-full bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
                >
                  <option value="Romans">Romans</option>
                  <option value="Barbarians">Barbarians</option>
                  <option value="Greeks">Greeks</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 items-center justify-center mb-4">
            {setupTeams.map((team) => (
              <div key={team} className="text-center">
                <button
                  onClick={() => setSelectedTeam(team)}
                  className={`px-4 py-2 rounded font-semibold ${selectedTeam === team ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-300"} relative`}
                >
                  <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {team} ({getTeamCount(team)}/16)
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center text-yellow-200 text-sm">
            <p>Drag troops from the panel below to place them on the field</p>
            <p>Click on placed troops to remove them</p>
            <p>Maximum 16 troops per team</p>
          </div>
          
          {/* Decorative helmet */}
          <svg className="absolute -bottom-4 right-4 w-10 h-10 text-blue-400 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      )}

      {/* Turn Info */}
      {!isSetupMode && (
        <div className="game-ui p-4 text-center relative">
          {/* Decorative crown for turn display */}
          <svg className="absolute -top-2 left-4 w-8 h-8 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8l3 4h2l-3 4-3-4H9l3-4z"/>
          </svg>
          
          <div className="text-2xl font-bold text-yellow-200">
            {checkEnd() || `${turn.toUpperCase()} TURN`}
          </div>
          <div className="text-sm text-yellow-100 mt-1">
            {gameMode === "multiplayer"
              ? `${turn} player's turn`
              : turn === "Romans" ? "Your turn - Click to select and move/attack"
                : turn === "Barbarians" ? "Barbarians are thinking..."
                  : turn === "Greeks" ? "Greeks are thinking..." : ""}
          </div>
          
          {/* Decorative sword */}
          <svg className="absolute -bottom-2 right-4 w-8 h-8 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.92 5H5.14c-.47 0-.92.21-1.18.56L3.04 7H2v1h1.04l.92 1.44c.26.35.71.56 1.18.56h1.78c.47 0 .92-.21 1.18-.56L9.96 7H11V6H9.96L8.1 4.56C7.84 4.21 7.39 4 6.92 4z"/>
          </svg>
        </div>
      )}
      
      {/* Three-Column Layout: Battle Log (Left) | Battlefield Grid (Center) | Selected Unit/Troop Panel (Right) */}
      <div className="flex flex-col xl:flex-row gap-6 w-full max-w-8xl">
        {/* Battle Log - Left Side */}
        {!isSetupMode && (
          <div className="game-ui p-4 xl:w-80 flex-shrink-0 relative">
            {/* Decorative scroll */}
            <svg className="absolute -top-2 left-2 w-6 h-6 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
            </svg>
            
            <h3 className="text-yellow-200 font-bold mb-3 text-lg border-b border-yellow-600 pb-2">Battle Log</h3>
            <div className="max-h-96 overflow-y-auto space-y-1">
              {log && log.map((line, i) => (
                <div key={i} className="text-green-200 text-sm bg-black bg-opacity-30 p-2 rounded border-l-2 border-yellow-600">
                  {line}
                </div>
              ))}
            </div>
            
            {/* Decorative quill */}
            <svg className="absolute -bottom-2 right-2 w-6 h-6 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </div>
        )}
        
        {/* Battlefield Grid - Center */}
        <div className="battlefield-container relative flex-1">
          {/* Decorative battlefield elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-600 rounded-full opacity-60"></div>
          <div className="absolute -top-4 -right-4 w-6 h-6 bg-yellow-600 rounded-full opacity-60"></div>
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-yellow-600 rounded-full opacity-60"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-yellow-600 rounded-full opacity-60"></div>
          
          <div className="battlefield-grid grid grid-cols-8 grid-rows-8 gap-1 w-fit p-6 rounded-lg mx-auto">
            {[...Array(GRID_SIZE)].flatMap((_, y) =>
              [...Array(GRID_SIZE)].map((_, x) => {
                const u = getUnit(x, y);
                const isSelected = u?.id === selectedId;
                const key = `${x},${y}`;
                const isMove = highlightMove && highlightMove.includes(key);
                const isAttack = highlightAttack && highlightAttack.includes(key);
                const percent = u ? (u.hp / u.maxHp) * 100 : 0;
                
                // Determine cell type for visual variety
                const isPath = (x === 3 || x === 4) && (y === 3 || y === 4); // Center paths
                const cellClass = isPath ? "cobblestone-path" : "grass-cell";
                
                return (
                  <div
                    key={key}
                    onClick={() => handleClick(x, y)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, x, y)}
                    draggable={!isSetupMode && mergeMode && u && (u.team === "Romans" || u.team === "Barbarians" || u.team === "Greeks")}
                    onDragStart={(e: React.DragEvent) => {
                      if (!isSetupMode && mergeMode && u && (u.team === "Romans" || u.team === "Barbarians" || u.team === "Greeks")) {
                        setSelectedId(u.id);
                        e.dataTransfer.setData('text/plain', u.id);
                      }
                    }}
                    className={`w-16 h-20 sm:w-20 sm:h-24 flex flex-col items-center justify-center text-xs sm:text-sm cursor-pointer transition-all duration-200 relative
                    ${cellClass}
                    ${isSelected ? "unit-selected" : ""}
                    ${isMove ? "movement-highlight" : ""}
                    ${isAttack ? "attack-highlight" : ""}
                    ${u ? (u.team === "Romans" ? "unit-roman" : u.team === "Greeks" ? "unit-greek" : "unit-barbarian") : ""}
                    ${isSetupMode && draggedTroop && !u ? "drag-over" : ""}
                    ${mergeMode && u && u.team === turn && selectedForMerge && u.role === selectedForMerge.role ? "merge-highlight" : ""}
                    ${mergeMode && u && u.team === turn && selectedForMerge && u.id === selectedForMerge.id ? "merge-selected" : ""}
                    ${!isSetupMode && mergeMode && u && (u.team === "Romans" || u.team === "Barbarians" || u.team === "Greeks") ? "cursor-grab active:cursor-grabbing" : ""}`}
                  >
                    {u ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                          {/* Unit Icon */}
                          <div className="text-2xl mb-1">
                            {typeof u.Icon === 'string' ? u.Icon : <u.Icon />}
                          </div>
                          
                          {/* Unit Name */}
                          <div className="text-xs text-center font-semibold text-yellow-200 leading-tight">
                            {u.name}
                          </div>
                          
                          {/* Health Display */}
                          <div className="text-xs text-white font-bold">
                            {u.hp} HP
                          </div>
                          
                          {/* Health Bar */}
                          <div className="w-full bg-gray-800 rounded-full h-1 mt-1 border border-gray-600">
                            <div 
                              className="health-bar rounded-full h-full" 
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                          
                          {/* Ammo Display for Ranged Units */}
                          {u.ammo && u.ammo > 0 && (
                            <div className="text-xs text-cyan-400 mt-1">
                              🏹{u.ammo}
                            </div>
                          )}
                          
                          {/* Out of Ammo Indicator */}
                          {u.ammo === 0 && u.role && (u.role.includes("Archer") || u.role.includes("Ballista") || u.role.includes("Scorpion") || u.role.includes("Velites") || u.role.includes("Shaman")) && (
                            <div className="text-xs text-red-400 mt-1">
                              ⚔️
                            </div>
                          )}
                          
                          {/* Movement and Attack Indicators */}
                          {isMove && <div className="text-green-400 text-lg">🚶‍♂️</div>}
                          {isAttack && <div className="text-red-400 text-lg">⚔️</div>}
                        </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-gray-600 text-xs"></div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Right Side Panel */}
        <div className="game-ui p-4 xl:w-80 flex-shrink-0 relative">
          {/* Decorative shield */}
          <svg className="absolute -top-2 left-2 w-6 h-6 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-9-4z"/>
          </svg>
          
          {isSetupMode ? (
            // Troop Selection Panel
            <>
              <h2 className="text-yellow-200 font-bold mb-3 text-xl border-b border-yellow-600 pb-2">
                {selectedTeam} Troops
              </h2>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {AVAILABLE_TROOPS[selectedTeam].map((troop, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => setDraggedTroop(troop)}
                    onDragEnd={() => setDraggedTroop(null)}
                    className="bg-gray-700 p-3 rounded cursor-move hover:bg-gray-600 transition-colors border border-gray-600 relative"
                  >
                    {/* Decorative star for draggable troops */}
                    <svg className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 opacity-70" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">{ICON_MAP[troop.Icon as keyof typeof ICON_MAP] || "⚔️"}</div>
                      <div className="flex-1">
                        <div className="text-yellow-200 font-semibold">{troop.name}</div>
                        <div className="text-xs text-gray-300">
                          {troop.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-600">
                <div className="text-yellow-200 font-semibold mb-2">Team Counts:</div>
                <div className="text-sm text-gray-300">
                  {setupTeams.map((team) => (
                    <div key={team}>{team}: {getTeamCount(team)}/16</div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Selected Unit Display
            selected ? (
              <>
                <h2 className="text-yellow-200 font-bold mb-3 text-xl border-b border-yellow-600 pb-2">Selected Unit</h2>
                <div className="space-y-2 text-sm text-yellow-200">
                  <p><span className="text-yellow-300">🧱</span> <strong>{selected.name}</strong></p>
                  <p><span className="text-red-400">❤️</span> HP: {selected.hp}/{selected.maxHp}</p>
                  <p><span className="text-orange-400">⚔️</span> Attack: {selected.attack}</p>
                  <p><span className="text-blue-400">🎯</span> Range: {selected.range}</p>
                  <p><span className="text-green-400">🚶‍♂️</span> Move: {selected.move}</p>
                  <p><span className="text-purple-400">🏷️</span> Role: {selected.role}</p>
                  
                  {/* Ammunition display for ranged units */}
                  {selected.ammo && selected.ammo > 0 && (
                    <p><span className="text-cyan-400">🏹</span> Ammo: {selected.ammo} shots</p>
                  )}
                  
                  {/* Out of ammo indicator */}
                  {selected.ammo === 0 && selected.role && (selected.role.includes("Archer") || selected.role.includes("Ballista") || selected.role.includes("Scorpion") || selected.role.includes("Velites") || selected.role.includes("Shaman")) && (
                    <p><span className="text-red-400">⚔️</span> <strong>Out of ammo - Melee only</strong></p>
                  )}
                </div>
                
                {/* Health Bar */}
                <div className="mt-3">
                  <div className="text-xs text-yellow-200 mb-1">Health</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 border border-gray-600">
                    <div 
                      className="health-bar rounded-full h-full" 
                      style={{ width: `${(selected.hp / selected.maxHp) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-yellow-200 font-bold mb-3 text-xl border-b border-yellow-600 pb-2">No Unit Selected</h2>
                <p className="text-green-200 text-sm opacity-70">Click on a unit to see its details</p>
              </>
            )
          )}
          
          {/* Decorative helmet */}
          <svg className="absolute -bottom-2 right-2 w-6 h-6 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default CodeConq;
