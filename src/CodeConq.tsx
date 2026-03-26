// CodeConq - Grid Strategy Game with Highlights and Expanded Features
// Now includes: Health Bars, Kill Counters, Special Ability Tooltips, and Custom Drag & Drop Setup

import { useState, useEffect, useRef } from "react";
import { formations } from "./Units/InitialUnits";

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
  ],
  Celts: [
    { role: "Celtic King", name: "Celtic King", Icon: "👑" },
    { role: "Celtic Warrior", name: "Celtic Warrior", Icon: "⚔️" },
    { role: "Celtic Berserker", name: "Celtic Berserker", Icon: "🪓" },
    { role: "Celtic Spearman", name: "Celtic Spearman", Icon: "⚔️" },
    { role: "Celtic Archer", name: "Celtic Archer", Icon: "🏹" },
    { role: "Celtic Skirmisher", name: "Celtic Skirmisher", Icon: "🏹" },
    { role: "Celtic Cavalry", name: "Celtic Cavalry", Icon: "🐎" },
    { role: "Celtic Chariot", name: "Celtic Chariot", Icon: "🐎" }
  ],
  Germanic: [
    { role: "Germanic King", name: "Germanic King", Icon: "👑" },
    { role: "Germanic Warrior", name: "Germanic Warrior", Icon: "🪓" },
    { role: "Germanic Spearman", name: "Germanic Spearman", Icon: "⚔️" },
    { role: "Germanic Berserker", name: "Germanic Berserker", Icon: "⚔️" },
    { role: "Germanic Raider", name: "Germanic Raider", Icon: "⚔️" },
    { role: "Germanic Archer", name: "Germanic Archer", Icon: "🏹" },
    { role: "Germanic Wolf Rider", name: "Germanic Wolf Rider", Icon: "🐎" }
  ],
  Carthage: [
    { role: "Carthaginian General", name: "Carthaginian General", Icon: "👑" },
    { role: "Libyan Infantry", name: "Libyan Infantry", Icon: "⚔️" },
    { role: "Sacred Band", name: "Sacred Band", Icon: "🛡️" },
    { role: "Numidian Cavalry", name: "Numidian Cavalry", Icon: "🐎" },
    { role: "War Elephant", name: "War Elephant", Icon: "🐘" },
    { role: "Balearic Slinger", name: "Balearic Slinger", Icon: "🏹" },
    { role: "Carthaginian Archer", name: "Carthaginian Archer", Icon: "🏹" }
  ],
  Vikings: [
    { role: "Jarl", name: "Jarl", Icon: "👑" },
    { role: "Viking Raider", name: "Viking Raider", Icon: "🪓" },
    { role: "Berserker", name: "Berserker", Icon: "⚔️" },
    { role: "Shieldmaiden", name: "Shieldmaiden", Icon: "🛡️" },
    { role: "Viking Archer", name: "Viking Archer", Icon: "🏹" },
    { role: "Scout", name: "Scout", Icon: "🐎" },
    { role: "Longship Crew", name: "Longship Crew", Icon: "⚔️" }
  ],
  Teutons: [
    { role: "King", name: "King", Icon: "👑" },
    { role: "Knight", name: "Knight", Icon: "🐎" },
    { role: "Man-at-Arms", name: "Man-at-Arms", Icon: "⚔️" },
    { role: "Spearman", name: "Spearman", Icon: "⚔️" },
    { role: "Longbowman", name: "Longbowman", Icon: "🏹" },
    { role: "Crossbowman", name: "Crossbowman", Icon: "🏹" },
    { role: "Siege Tower", name: "Siege Tower", Icon: "🏰" },
    { role: "Trebuchet", name: "Trebuchet", Icon: "⚔️" }
  ]
};

// Function to generate stats for custom troops (similar to InitialUnits.tsx)
const generateCustomTroopStats = (role: string) => {
  let hp, maxHp, attack, ammo, range, move;

  switch (role) {
    // Roman Units
    case "Roman King":
      hp = Math.floor(Math.random() * (450 - 420) + 420);
      maxHp = hp;
      attack = Math.floor(Math.random() * (270 - 240) + 240);
      ammo = 0; // Melee unit
      range = 1;
      move = 1;
      break;
      case "Legionary":
        hp = Math.floor(Math.random() * (340 - 280) + 280);
        maxHp = hp;
        attack = Math.floor(Math.random() * (140 - 110) + 110);
        ammo = 0; // Melee unit
        range = 1;
        move = 1;
        break;
    case "Centurion":
      hp = Math.floor(Math.random() * (420 - 340) + 340);
      maxHp = hp;
      attack = Math.floor(Math.random() * (180 - 150) + 150);
      ammo = 0; // Melee unit
      range = 1;
      move = 1;
      break;
    case "Archer":
      hp = Math.floor(Math.random() * (200 - 150) + 150);
      maxHp = hp;
      attack = Math.floor(Math.random() * (90 - 65) + 65);
      ammo = 10; // Ranged unit with 10 shots
      range = 3;
      move = 1;
      break;
    case "Cavalry":
      hp = Math.floor(Math.random() * (260 - 220) + 220);
      maxHp = hp;
      attack = Math.floor(Math.random() * (150 - 120) + 120);
      ammo = 0; // Melee unit
      range = 1;
      move = 3;
      break;
    case "Praetorian":
      hp = Math.floor(Math.random() * (520 - 440) + 440);
      maxHp = hp;
      attack = Math.floor(Math.random() * (220 - 180) + 180);
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
      hp = Math.floor(Math.random() * (220 - 170) + 170);
      maxHp = hp;
      attack = Math.floor(Math.random() * (120 - 90) + 90);
      ammo = 0; // Melee unit
      range = 1;
      move = 1;
      break;
    case "Velites":
      hp = Math.floor(Math.random() * (130 - 90) + 90);
      maxHp = hp;
      attack = Math.floor(Math.random() * (75 - 50) + 50);
      ammo = 10; // Ranged unit with 10 shots
      range = 3;
      move = 2;
      break;
    case "Triarii":
      hp = Math.floor(Math.random() * (380 - 320) + 320);
      maxHp = hp;
      attack = Math.floor(Math.random() * (150 - 120) + 120);
      ammo = 0; // Melee unit
      range = 1;
      move = 1;
      break;
      // Barbarian Units
    case "Barbarian Warrior":
      hp = Math.floor(Math.random() * (270 - 220) + 220);
      maxHp = hp;
      attack = Math.floor(Math.random() * (170 - 130) + 130);
      ammo = 0; // Melee unit
      range = 1;
      move = 1;
      break;
      case "Barbarian Archer":
        hp = Math.floor(Math.random() * (140 - 90) + 90);
        maxHp = hp;
        attack = Math.floor(Math.random() * (85 - 60) + 60);
        ammo = 10; // Ranged unit with 10 shots
        range = 2;
        move = 1;
        break;
      case "Barbarian Chief":
        hp = Math.floor(Math.random() * (420 - 360) + 360);
        maxHp = hp;
        attack = Math.floor(Math.random() * (290 - 250) + 250);
        ammo = 0; // Melee unit
        range = 1;
        move = 1;
        break;
        case "Barbarian Berserker":
          hp = Math.floor(Math.random() * (310 - 240) + 240);
          maxHp = hp;
          attack = Math.floor(Math.random() * (260 - 220) + 220);
          ammo = 0; // Melee unit
          range = 1;
          move = 2;
          break;
       
      case "Barbarian Scout":
        hp = Math.floor(Math.random() * (220 - 170) + 170);
        maxHp = hp;
        attack = Math.floor(Math.random() * (150 - 120) + 120);
        ammo = 0;
        range = 1;
        move = 3;
        break;
      case "Barbarian Shaman":
        hp = Math.floor(Math.random() * (170 - 120) + 120);
        maxHp = hp;
        attack = Math.floor(Math.random() * (150 - 110) + 110);
        ammo = 10; // Ranged unit with 10 shots
        range = 2;
        move = 1;
        break;
      case "Barbarian Axeman":
        hp = Math.floor(Math.random() * (340 - 260) + 260);
        maxHp = hp;
        attack = Math.floor(Math.random() * (210 - 170) + 170);
        ammo = 0; // Melee unit
        range = 1;
        move = 1;
        break;
      case "Barbarian Spearman":
        hp = Math.floor(Math.random() * (230 - 180) + 180);
        maxHp = hp;
        attack = Math.floor(Math.random() * (120 - 90) + 90);
        ammo = 0; // Melee unit
        range = 1;
        move = 1;
        break;
      case "Barbarian Raider":
        hp = Math.floor(Math.random() * (190 - 140) + 140);
        maxHp = hp;
        attack = Math.floor(Math.random() * (165 - 130) + 130);
        ammo = 0; // Melee unit
        range = 1;
        move = 2;
        break;
      case "Barbarian Warlord":
        hp = Math.floor(Math.random() * (520 - 420) + 420);
        maxHp = hp;
        attack = Math.floor(Math.random() * (290 - 240) + 240);
        ammo = 0; // Melee unit
        range = 1;
        move = 1;
        break;
        // === Greek / Macedonian Units ===
case "Hoplite":
  hp = Math.floor(Math.random() * (360 - 300) + 300);
  maxHp = hp;
  attack = Math.floor(Math.random() * (140 - 110) + 110);
  ammo = 0;        // spear + shield wall
  range = 1;
  move = 1;
  break;

case "Phalangite": // sarissa phalanx
  hp = Math.floor(Math.random() * (400 - 340) + 340);
  maxHp = hp;
  attack = Math.floor(Math.random() * (155 - 125) + 125);
  ammo = 0;
  range = 2;       // long reach of sarissa
  move = 1;        // slow formation
  break;

case "Hypaspist":
  hp = Math.floor(Math.random() * (340 - 280) + 280);
  maxHp = hp;
  attack = Math.floor(Math.random() * (175 - 140) + 140);
  ammo = 0;        // elite guard, flexible
  range = 1;
  move = 1;
  break;

case "Companion Cavalry":
  hp = Math.floor(Math.random() * (300 - 240) + 240);
  maxHp = hp;
  attack = Math.floor(Math.random() * (210 - 170) + 170);
  ammo = 0;        // shock cavalry
  range = 1;
  move = 3;
  break;

case "Thessalian Cavalry":
  hp = Math.floor(Math.random() * (280 - 230) + 230);
  maxHp = hp;
  attack = Math.floor(Math.random() * (175 - 145) + 145);
  ammo = 0;
  range = 1;
  move = 3;
  break;

case "Peltast":
  hp = Math.floor(Math.random() * (180 - 140) + 140);
  maxHp = hp;
  attack = Math.floor(Math.random() * (100 - 75) + 75);
  ammo = 12;       // javelins
  range = 3;
  move = 2;
  break;

case "Thureophoroi":
  hp = Math.floor(Math.random() * (250 - 200) + 200);
  maxHp = hp;
  attack = Math.floor(Math.random() * (125 - 95) + 95);
  ammo = 6;        // mixed javelin + spear
  range = 2;
  move = 2;
  break;

case "Cretan Archer":
  hp = Math.floor(Math.random() * (170 - 130) + 130);
  maxHp = hp;
  attack = Math.floor(Math.random() * (120 - 90) + 90);
  ammo = 12;       // elite archers
  range = 4;
  move = 1;
  break;

case "Rhodian Slinger":
  hp = Math.floor(Math.random() * (160 - 120) + 120);
  maxHp = hp;
  attack = Math.floor(Math.random() * (105 - 80) + 80);
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
  hp = Math.floor(Math.random() * (380 - 320) + 320);
  maxHp = hp;
  attack = Math.floor(Math.random() * (200 - 160) + 160);
  ammo = 0;        // elite assault infantry
  range = 1;
  move = 1;
  break;

case "Greek Standard Bearer":
  hp = Math.floor(Math.random() * (260 - 220) + 220);
  maxHp = hp;
  attack = Math.floor(Math.random() * (95 - 70) + 70);
  ammo = 0;
  range = 1;
  move = 1;
  break;

  case "Macedonian King":
  hp = Math.floor(Math.random() * (440 - 400) + 400);
  maxHp = hp;
  attack = Math.floor(Math.random() * (285 - 250) + 250);
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

case "Celtic Berserker":
  hp = Math.floor(Math.random() * (280 - 220) + 220);
  maxHp = hp;
  attack = Math.floor(Math.random() * (220 - 180) + 180);
  ammo = 0;
  range = 1;
  move = 3;
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

case "Celtic Skirmisher":
  hp = Math.floor(Math.random() * (150 - 110) + 110);
  maxHp = hp;
  attack = Math.floor(Math.random() * (90 - 65) + 65);
  ammo = 12;
  range = 3;
  move = 3;
  break;

case "Celtic Cavalry":
  hp = Math.floor(Math.random() * (230 - 180) + 180);
  maxHp = hp;
  attack = Math.floor(Math.random() * (150 - 120) + 120);
  ammo = 0;
  range = 1;
  move = 4;
  break;

case "Celtic Chariot":
  hp = Math.floor(Math.random() * (220 - 170) + 170);
  maxHp = hp;
  attack = Math.floor(Math.random() * (160 - 130) + 130);
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

case "Germanic Spearman":
  hp = Math.floor(Math.random() * (290 - 240) + 240);
  maxHp = hp;
  attack = Math.floor(Math.random() * (130 - 100) + 100);
  ammo = 0;
  range = 1;
  move = 1;
  break;

case "Germanic Berserker":
  hp = Math.floor(Math.random() * (330 - 270) + 270);
  maxHp = hp;
  attack = Math.floor(Math.random() * (245 - 205) + 205);
  ammo = 0;
  range = 1;
  move = 2;
  break;

case "Germanic Raider":
  hp = Math.floor(Math.random() * (230 - 180) + 180);
  maxHp = hp;
  attack = Math.floor(Math.random() * (170 - 135) + 135);
  ammo = 0;
  range = 1;
  move = 2;
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

case "Carthaginian Archer":
  hp = Math.floor(Math.random() * (170 - 130) + 130);
  maxHp = hp;
  attack = Math.floor(Math.random() * (100 - 75) + 75);
  ammo = 10;
  range = 3;
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

case "Berserker":
  hp = Math.floor(Math.random() * (280 - 220) + 220);
  maxHp = hp;
  attack = Math.floor(Math.random() * (250 - 210) + 210);
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

case "Crossbowman":
  hp = Math.floor(Math.random() * (220 - 170) + 170);
  maxHp = hp;
  attack = Math.floor(Math.random() * (125 - 100) + 100);
  ammo = 8;
  range = 4;
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
  Phalanx: "Romans vs Barbarians",
  Arch: "Greeks vs Celts",
  Testudo: "Carthage vs Vikings",
  Circle: "Germanic vs Teutons",
  Staggered: "Romans vs Carthage",
  Delta: "Greeks vs Germanic",
  Tercio: "Celts vs Vikings",
  Pincer: "Barbarians vs Teutons"
};

const BACKGROUND_MUSIC_SRC = "/Crown%20of%20Ashes.mp3";
const ALL_TEAMS = ["Romans", "Barbarians", "Greeks", "Celts", "Germanic", "Carthage", "Vikings", "Teutons"] as const;

type GameMode = "single-player" | "multiplayer" | "custom-scenario";
type TeamName = "Romans" | "Barbarians" | "Greeks" | "Celts" | "Germanic" | "Carthage" | "Vikings" | "Teutons";
type BattlefieldSize = 8 | 10 | 12 | 14 | 16 | 18 | 20;
type HoverScrollDirection = "up" | "down" | "left" | "right" | null;
type TroopMechanicType = "melee" | "move" | "ammo";
type GameOptions = {
  musicEnabled: boolean;
  showMoveHighlights: boolean;
  showAttackHighlights: boolean;
  showBattleLog: boolean;
  showTurnBanner: boolean;
  showUnitPanel: boolean;
  battlefieldSize: BattlefieldSize;
};

const getFormationTeams = (formationKey: keyof typeof formations): TeamName[] =>
  Array.from(new Set(formations[formationKey].map((unit: any) => unit.team))) as TeamName[];

const getValidFormationPlayerTeam = (formationKey: keyof typeof formations, preferredTeam: TeamName): TeamName => {
  const formationTeams = getFormationTeams(formationKey);
  return formationTeams.includes(preferredTeam) ? preferredTeam : formationTeams[0] ?? "Romans";
};

const getAliveTeams = (battleUnits: any[]): TeamName[] =>
  ALL_TEAMS.filter((team) => battleUnits.some((unit: any) => unit.team === team && unit.hp > 0)) as TeamName[];

const ensureRangedAmmo = (unit: any) => {
  if (!unit) return unit;

  const normalizedUnit = { ...unit };
  if ((normalizedUnit.range ?? 1) > 1 && (normalizedUnit.ammo ?? 0) <= 0) {
    normalizedUnit.ammo = Math.max(6, Math.min(16, normalizedUnit.range * 4));
  }

  return normalizedUnit;
};

const getTroopMechanicType = (unit: any): TroopMechanicType => {
  if (!unit) return "melee";

  const role = String(unit.role ?? "").toLowerCase();

  if ((unit.ammo ?? 0) > 0 && (unit.range ?? 1) > 1) {
    return "ammo";
  }

  const moveKeywords = ["cavalry", "chariot", "rider", "scout", "knight", "elephant"];
  if (moveKeywords.some((keyword) => role.includes(keyword)) || (unit.move ?? 0) >= 3) {
    return "move";
  }

  return "melee";
};

const getAttackDamage = (attacker: any, defender: any) => {
  const attackerType = getTroopMechanicType(attacker);
  const defenderType = getTroopMechanicType(defender);
  const hasAdvantage = TROOP_MECHANIC_ADVANTAGE[attackerType] === defenderType;
  const damage = hasAdvantage
    ? Math.round(attacker.attack * TROOP_MECHANIC_ADVANTAGE_MULTIPLIER)
    : attacker.attack;

  return {
    damage,
    attackerType,
    defenderType,
    hasAdvantage
  };
};

const ROLE_HEALTH_BUFF_MULTIPLIER = 1.1;
const ROLE_HEALTH_BUFF_MIN_GROUP_SIZE = 3;

const applyRoleHealthBuffs = (units: any[]) => {
  if (!Array.isArray(units) || units.length === 0) return units;

  const aliveUnits = units.filter((unit) => unit && unit.hp > 0);
  const qualifyingIds = new Set<string>();
  const visited = new Set<string>();

  aliveUnits.forEach((unit) => {
    if (visited.has(unit.id)) return;

    const component: any[] = [];
    const stack = [unit];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || visited.has(current.id)) continue;

      visited.add(current.id);
      component.push(current);

      aliveUnits.forEach((candidate) => {
        if (visited.has(candidate.id)) return;
        if (candidate.team !== current.team || candidate.role !== current.role) return;

        const distance = Math.abs(candidate.x - current.x) + Math.abs(candidate.y - current.y);
        if (distance === 1) stack.push(candidate);
      });
    }

    if (component.length >= ROLE_HEALTH_BUFF_MIN_GROUP_SIZE) {
      component.forEach((member) => qualifyingIds.add(member.id));
    }
  });

  return units.map((unit) => {
    if (!unit) return unit;

    const baseMaxHp = unit.baseMaxHp ?? unit.maxHp;
    const desiredBuff = unit.hp > 0 && qualifyingIds.has(unit.id);
    const desiredMaxHp = desiredBuff ? Math.round(baseMaxHp * ROLE_HEALTH_BUFF_MULTIPLIER) : baseMaxHp;
    const currentMaxHp = unit.maxHp ?? baseMaxHp;
    const stateChanged =
      currentMaxHp !== desiredMaxHp ||
      Boolean(unit.roleHealthBuffActive) !== desiredBuff ||
      unit.baseMaxHp !== baseMaxHp;

    let nextHp = unit.hp;
    if (unit.hp > 0 && stateChanged) {
      const hpRatio = currentMaxHp > 0 ? unit.hp / currentMaxHp : 1;
      nextHp = Math.max(1, Math.min(desiredMaxHp, Math.round(desiredMaxHp * hpRatio)));
    }

    return {
      ...unit,
      baseMaxHp,
      maxHp: desiredMaxHp,
      hp: unit.hp <= 0 ? unit.hp : nextHp,
      roleHealthBuffActive: desiredBuff
    };
  });
};

const didRoleHealthBuffStateChange = (currentUnits: any[], updatedUnits: any[]) => {
  if (currentUnits.length !== updatedUnits.length) return true;

  return updatedUnits.some((unit, index) => {
    const current = currentUnits[index];
    return (
      current?.hp !== unit?.hp ||
      current?.maxHp !== unit?.maxHp ||
      current?.baseMaxHp !== unit?.baseMaxHp ||
      current?.roleHealthBuffActive !== unit?.roleHealthBuffActive
    );
  });
};

const CIV_PASSIVES: Record<TeamName, { name: string; effect: string }> = {
  Romans: { name: "Roman Discipline", effect: "+10% hp, +10% attack" },
  Barbarians: { name: "Barbarian Fury", effect: "+20% attack, -10% hp" },
  Greeks: { name: "Phalanx Mastery", effect: "+1 range (infantry), -1 move" },
  Celts: { name: "Swift Warriors", effect: "+1 move, -10% hp" },
  Germanic: { name: "Brutal Strength", effect: "+15% attack" },
  Carthage: { name: "Mercenary Tactics", effect: "+10% hp, +10% attack, -10% move" },
  Vikings: { name: "Relentless Raiders", effect: "+1 move, +10% attack, -10% hp" },
  Teutons: { name: "Heavy Armor", effect: "+25% hp, -1 move" }
};

const PASSIVE_ICONS: Record<TeamName, string> = {
  Romans: "🛡️",
  Barbarians: "🔥",
  Greeks: "🗡️",
  Celts: "🍃",
  Germanic: "🪓",
  Carthage: "🐘",
  Vikings: "⛵",
  Teutons: "🏰"
};

const TROOP_MECHANIC_ADVANTAGE: Record<TroopMechanicType, TroopMechanicType> = {
  melee: "move",
  move: "ammo",
  ammo: "melee"
};

const TROOP_MECHANIC_LABELS: Record<TroopMechanicType, string> = {
  melee: "Melee",
  move: "Move",
  ammo: "Ammo"
};

const TROOP_MECHANIC_ICONS: Record<TroopMechanicType, string> = {
  melee: "⚔️",
  move: "🐎",
  ammo: "🏹"
};

const TROOP_MECHANIC_ADVANTAGE_MULTIPLIER = 1.1;

const GAME_STATE_STORAGE_KEY = "battlecry-game-state";
const BATTLEFIELD_SIZE_OPTIONS: BattlefieldSize[] = [8, 10, 12, 14, 16, 18, 20];
const DEFAULT_GAME_OPTIONS: GameOptions = {
  musicEnabled: true,
  showMoveHighlights: true,
  showAttackHighlights: true,
  showBattleLog: true,
  showTurnBanner: true,
  showUnitPanel: true,
  battlefieldSize: 8
};

const ROLE_ICON_LOOKUP = Object.values(AVAILABLE_TROOPS).flat().reduce((lookup, troop) => {
  lookup[troop.role] = troop.Icon;
  return lookup;
}, {} as Record<string, string>);

const adjustStatPercent = (value: number, percent: number) => Math.max(0, Math.round(value * (1 + percent)));
const adjustMovePercent = (value: number, percent: number) => {
  if (value <= 0) return 0;
  return Math.max(1, Math.floor(value * (1 + percent)));
};

const isInfantryRole = (role: string) => {
  const lowerRole = role.toLowerCase();
  const nonInfantryKeywords = [
    "archer",
    "slinger",
    "ballista",
    "scorpion",
    "catapult",
    "polybolos",
    "trebuchet",
    "siege tower",
    "cavalry",
    "chariot",
    "elephant",
    "rider",
    "scout",
    "knight",
    "king",
    "jarl",
    "general"
  ];

  return !nonInfantryKeywords.some((keyword) => lowerRole.includes(keyword));
};

const stripUnitForStorage = (unit: any) => {
  if (!unit) return null;
  const { Icon, ...serializableUnit } = unit;
  return serializableUnit;
};

const restoreUnitFromStorage = (unit: any) => {
  if (!unit) return null;
  return {
    ...unit,
    Icon: typeof unit.Icon === "string" ? unit.Icon : (ROLE_ICON_LOOKUP[unit.role] ?? "⚔️")
  };
};

const applyCivilizationPassive = (unit: any) => {
  if (!unit) return null;

  const normalizedUnit = ensureRangedAmmo(unit);
  if (normalizedUnit.civPassiveApplied) return normalizedUnit;

  const team = normalizedUnit.team as TeamName;
  const passive = CIV_PASSIVES[team];
  if (!passive) return normalizedUnit;

  switch (team) {
    case "Romans":
      normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, 0.1);
      normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, 0.1);
      normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.1);
      break;
    case "Barbarians":
      normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, -0.1);
      normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, -0.1);
      normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.2);
      break;
    case "Greeks":
      if (isInfantryRole(normalizedUnit.role)) {
        normalizedUnit.range += 1;
        normalizedUnit.move = Math.max(0, normalizedUnit.move - 1);
      }
      break;
    case "Celts":
      normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, -0.1);
      normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, -0.1);
      normalizedUnit.move += 1;
      break;
    case "Germanic":
      normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.15);
      break;
    case "Carthage":
      normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, 0.1);
      normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, 0.1);
      normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.1);
      normalizedUnit.move = adjustMovePercent(normalizedUnit.move, -0.1);
      break;
    case "Vikings":
      normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, -0.1);
      normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, -0.1);
      normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.1);
      normalizedUnit.move += 1;
      break;
    case "Teutons":
      normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, 0.25);
      normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, 0.25);
      normalizedUnit.move = Math.max(0, normalizedUnit.move - 1);
      break;
  }

  normalizedUnit.civPassiveApplied = true;
  normalizedUnit.civPassiveName = passive.name;
  normalizedUnit.civPassiveEffect = passive.effect;

  return ensureRangedAmmo(normalizedUnit);
};

const prepareUnitsForBattle = (units: any[]) => units.map((unit) => applyCivilizationPassive({ ...unit }));

function CodeConq() {
  const [currentFormation, setCurrentFormation] = useState<keyof typeof formations>("Phalanx");
  const [units, setUnits] = useState(() => prepareUnitsForBattle(formations["Phalanx"]));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [turn, setTurn] = useState("Romans");
  const [log, setLog] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  
  // Custom setup mode states
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [customUnits, setCustomUnits] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamName>("Romans");
  const [playerTeam, setPlayerTeam] = useState<TeamName>("Romans");
  const [draggedTroop, setDraggedTroop] = useState<any>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeCount, setMergeCount] = useState(0);
  const [selectedForMerge, setSelectedForMerge] = useState<any>(null);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [multiplayerTeams, setMultiplayerTeams] = useState<[TeamName, TeamName]>(["Romans", "Barbarians"]);
  const [isBattlefieldFullscreen, setIsBattlefieldFullscreen] = useState(false);
  const battlefieldRef = useRef<HTMLDivElement | null>(null);
  const battlefieldViewportRef = useRef<HTMLDivElement | null>(null);
  const battlefieldPanStateRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number; moved: boolean } | null>(null);
  const battlefieldPanCleanupRef = useRef<(() => void) | null>(null);
  const skipNextGridClickRef = useRef(false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const isRestoringSavedGameRef = useRef(false);
  const hasLoadedSavedGameRef = useRef(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [gameOptions, setGameOptions] = useState<GameOptions>(DEFAULT_GAME_OPTIONS);
  const [isPanningGrid, setIsPanningGrid] = useState(false);
  const [hoverScrollDirection, setHoverScrollDirection] = useState<HoverScrollDirection>(null);

  // Update units when formation changes
  useEffect(() => {
    if (isRestoringSavedGameRef.current) {
      isRestoringSavedGameRef.current = false;
      return;
    }

    if (formations[currentFormation]) {
      const nextPlayerTeam = getValidFormationPlayerTeam(currentFormation, playerTeam);
      setUnits(prepareUnitsForBattle(formations[currentFormation]));
      setSelectedId(null);
      setPlayerTeam(nextPlayerTeam);
      setTurn(nextPlayerTeam);
      setRound(1);
      setLog([]);
      setGameStarted(false);
      setIsSetupMode(false);
      setCustomUnits([]);
      setMergeCount(0);
      setMergeMode(false);
      setSelectedForMerge(null);
    }
  }, [currentFormation]);

  useEffect(() => {
    if (!units.length) return;

    const updatedUnits = applyRoleHealthBuffs(units);
    if (didRoleHealthBuffStateChange(units, updatedUnits)) {
      setUnits(updatedUnits);
    }
  }, [units]);

  useEffect(() => {
    if (!customUnits.length) return;

    const updatedUnits = applyRoleHealthBuffs(customUnits);
    if (didRoleHealthBuffStateChange(customUnits, updatedUnits)) {
      setCustomUnits(updatedUnits);
    }
  }, [customUnits]);

  useEffect(() => {
    if (typeof window === "undefined") {
      hasLoadedSavedGameRef.current = true;
      return;
    }

    try {
      const savedStateRaw = window.localStorage.getItem(GAME_STATE_STORAGE_KEY);
      if (!savedStateRaw) {
        hasLoadedSavedGameRef.current = true;
        return;
      }

      const savedState = JSON.parse(savedStateRaw);
      const savedFormation = savedState.currentFormation;

      if (savedFormation && savedFormation in formations) {
        isRestoringSavedGameRef.current = true;
        setCurrentFormation(savedFormation as keyof typeof formations);
      }

      setUnits(
        Array.isArray(savedState.units)
          ? savedState.units.map(restoreUnitFromStorage).map(applyCivilizationPassive)
          : prepareUnitsForBattle(formations["Phalanx"])
      );
      setSelectedId(savedState.selectedId ?? null);
      setTurn(savedState.turn ?? "Romans");
      setLog(Array.isArray(savedState.log) ? savedState.log : []);
      setRound(typeof savedState.round === "number" ? savedState.round : 1);
      setIsSetupMode(Boolean(savedState.isSetupMode));
      setCustomUnits(
        Array.isArray(savedState.customUnits)
          ? savedState.customUnits.map(restoreUnitFromStorage).map(applyCivilizationPassive)
          : []
      );
      setSelectedTeam(savedState.selectedTeam ?? "Romans");
      setPlayerTeam(savedState.playerTeam ?? "Romans");
      setDraggedTroop(null);
      setGameStarted(Boolean(savedState.gameStarted));
      setMergeMode(Boolean(savedState.mergeMode));
      setMergeCount(typeof savedState.mergeCount === "number" ? savedState.mergeCount : 0);
      setSelectedForMerge(savedState.selectedForMerge ? applyCivilizationPassive(restoreUnitFromStorage(savedState.selectedForMerge)) : null);
      setGameMode(savedState.gameMode ?? null);
      setMultiplayerTeams(Array.isArray(savedState.multiplayerTeams) ? savedState.multiplayerTeams : ["Romans", "Barbarians"]);
      const mergedOptions = savedState.gameOptions ? { ...DEFAULT_GAME_OPTIONS, ...savedState.gameOptions } : DEFAULT_GAME_OPTIONS;
      setGameOptions({
        ...mergedOptions,
        battlefieldSize: BATTLEFIELD_SIZE_OPTIONS.includes(mergedOptions.battlefieldSize)
          ? mergedOptions.battlefieldSize
          : DEFAULT_GAME_OPTIONS.battlefieldSize
      });
    } catch {
      // Ignore invalid saved state and fall back to a fresh session.
    } finally {
      hasLoadedSavedGameRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedGameRef.current || typeof window === "undefined") return;

    const savedState = {
      currentFormation,
      units: units.map(stripUnitForStorage),
      selectedId,
      turn,
      log,
      round,
      isSetupMode,
      customUnits: customUnits.map(stripUnitForStorage),
      selectedTeam,
      playerTeam,
      gameStarted,
      mergeMode,
      mergeCount,
      selectedForMerge: stripUnitForStorage(selectedForMerge),
      gameMode,
      multiplayerTeams,
      gameOptions
    };

    window.localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(savedState));
  }, [
    currentFormation,
    units,
    selectedId,
    turn,
    log,
    round,
    isSetupMode,
    customUnits,
    selectedTeam,
    playerTeam,
    gameStarted,
    mergeMode,
    mergeCount,
    selectedForMerge,
    gameMode,
    multiplayerTeams,
    gameOptions
  ]);

  useEffect(() => {
    const audio = new Audio(BACKGROUND_MUSIC_SRC);
    audio.loop = true;
    audio.volume = 0.35;
    backgroundMusicRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      backgroundMusicRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;

    if (!gameMode || !gameOptions.musicEnabled) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    void audio.play().catch(() => {
      // Ignore autoplay rejections; the user can start music with the toggle.
    });
  }, [gameMode, gameOptions.musicEnabled]);

  useEffect(() => {
    if (gameMode !== "single-player") return;

    const validPlayerTeam = getValidFormationPlayerTeam(currentFormation, playerTeam);
    if (validPlayerTeam === playerTeam) return;

    setPlayerTeam(validPlayerTeam);
    setTurn(validPlayerTeam);
    setSelectedId(null);
  }, [currentFormation, gameMode, playerTeam]);

  useEffect(() => {
    if (isSetupMode || gameMode === "multiplayer" || !gameStarted) return;

    const aliveTeams = getAliveTeams(units);
    if (aliveTeams.length <= 1 || aliveTeams.includes(turn as TeamName)) return;

    if (aliveTeams.includes(playerTeam)) {
      setTurn(playerTeam);
      return;
    }

    const nextAiTeam = aliveTeams.find((team) => team !== playerTeam);
    if (nextAiTeam) setTurn(nextAiTeam);
  }, [gameMode, gameStarted, isSetupMode, playerTeam, turn, units]);

  const getUnit = (x: number, y: number) => {
    const currentUnits = isSetupMode ? customUnits : units;
    return currentUnits?.find((u: any) => u.x === x && u.y === y);
  };
  
  const getUnitById = (id: string | null) => {
    const currentUnits = isSetupMode ? customUnits : units;
    return currentUnits?.find((u: any) => u.id === id);
  };
  
  const isWithinBattlefield = (x: number, y: number) => x >= 0 && x < battlefieldSize && y >= 0 && y < battlefieldSize;
  const isInRange = (a: any, b: any, range: number) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= range;
  const getMeleeAttackDestination = (attacker: any, target: any) => {
    if (!attacker || !target || attacker.range !== 1) return null;

    const candidates = [
      { x: target.x + 1, y: target.y },
      { x: target.x - 1, y: target.y },
      { x: target.x, y: target.y + 1 },
      { x: target.x, y: target.y - 1 }
    ]
      .filter(({ x, y }) => isWithinBattlefield(x, y))
      .filter(({ x, y }) => !getUnit(x, y))
      .filter(({ x, y }) => Math.abs(attacker.x - x) + Math.abs(attacker.y - y) <= attacker.move)
      .sort((a, b) => {
        const distanceA = Math.abs(attacker.x - a.x) + Math.abs(attacker.y - a.y);
        const distanceB = Math.abs(attacker.x - b.x) + Math.abs(attacker.y - b.y);
        return distanceA - distanceB;
      });

    return candidates[0] ?? null;
  };
  const selected = getUnitById(selectedId);
  const battlefieldSize = gameOptions.battlefieldSize;
  const useEightByEightViewport = !isBattlefieldFullscreen;
  const useFullscreenNavigationViewport = isBattlefieldFullscreen && battlefieldSize > 14;
  const showGridNavigation = (!isBattlefieldFullscreen && battlefieldSize > 8) || useFullscreenNavigationViewport;
  const formationTeams = getFormationTeams(currentFormation);
  const aliveBattleTeams = getAliveTeams(units);
  const aiTeams = aliveBattleTeams.filter((team) => team !== playerTeam) as TeamName[];
  const activeTeam = gameMode === "multiplayer" ? turn : playerTeam;
  const setupTeamsInPlay = (() => {
    if (gameMode === "multiplayer") return multiplayerTeams;
    if (gameMode === "single-player") return formationTeams;

    const customScenarioTeams = getAliveTeams(customUnits);
    return customScenarioTeams.length > 0 ? customScenarioTeams : [playerTeam];
  })();
  const passiveTeams = (isSetupMode ? setupTeamsInPlay : aliveBattleTeams).filter((team, index, arr) => arr.indexOf(team) === index);
  const setupTeams: TeamName[] = gameMode === "multiplayer" ? [multiplayerTeams[0], multiplayerTeams[1]] : [...ALL_TEAMS];
  const isTeamAllowedInSetup = (team: TeamName) => setupTeams.includes(team);
  const centerStart = Math.floor(battlefieldSize / 2) - 1;
  const centerEnd = Math.floor(battlefieldSize / 2);
  const advanceAiTurn = (currentTeam: TeamName) => {
    const nextAiIndex = aiTeams.indexOf(currentTeam);
    if (nextAiIndex >= 0 && nextAiIndex < aiTeams.length - 1) {
      setTurn(aiTeams[nextAiIndex + 1]);
      return;
    }

    setTurn(playerTeam);
    setRound((r) => r + 1);
  };

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

    setTurn(aiTeams[0] ?? playerTeam);
  };

  // Safety check - don't render if units is not properly initialized
  if (!units || units.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading formation...</div>
      </div>
    );
  }

  const highlightMove = selected && gameOptions.showMoveHighlights && (isSetupMode ? customUnits : units) ? [...Array(battlefieldSize)].flatMap((_, y) =>
    [...Array(battlefieldSize)].map((_, x) => {
      const distance = Math.abs(x - selected.x) + Math.abs(y - selected.y);
      return (distance <= selected.move && !getUnit(x, y)) ? `${x},${y}` : null;
    }).filter(Boolean)
  ) : [];

  const highlightAttack = selected && gameOptions.showAttackHighlights && (isSetupMode ? customUnits : units) ? [...Array(battlefieldSize)].flatMap((_, y) =>
    [...Array(battlefieldSize)].map((_, x) => {
      const target = getUnit(x, y);
      const distance = Math.abs(x - selected.x) + Math.abs(y - selected.y);
      const canAttackFromRange = target && target.team !== selected.team && distance <= selected.range;
      const canMoveIntoMelee = target && target.team !== selected.team && selected.range === 1 && Boolean(getMeleeAttackDestination(selected, target));
      return (canAttackFromRange || canMoveIntoMelee) ? `${x},${y}` : null;
    }).filter(Boolean)
  ) : [];

  const handleClick = (x: number, y: number) => {
    if (skipNextGridClickRef.current) {
      skipNextGridClickRef.current = false;
      return;
    }

    if (isSetupMode) {
      handleSetupClick(x, y);
      return;
    }
    
    if (!gameStarted || turn !== activeTeam || !units) return;
    
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
      const meleeAttackDestination = clicked && clicked.team !== selected.team && selected.range === 1 && !isInRange(selected, clicked, selected.range)
        ? getMeleeAttackDestination(selected, clicked)
        : null;

      if (clicked && clicked.team !== selected.team && (isInRange(selected, clicked, selected.range) || meleeAttackDestination)) {
        // Check if target is alive
        if (clicked.hp <= 0) {
          setLog((prevLog) => [`${clicked.name} is already dead!`, ...prevLog]);
          return;
        }

        if (meleeAttackDestination) {
          selected.x = meleeAttackDestination.x;
          selected.y = meleeAttackDestination.y;
        }
        
        // Attack enemy with troop-mechanic matchup bonus
        const attackOutcome = getAttackDamage(selected, clicked);
        const dmg = attackOutcome.damage;
        clicked.hp -= dmg;
        
        // If this is a ranged attack, reduce ammunition
        if (selected.ammo && selected.ammo > 0) {
          selected.ammo -= 1;
          setLog((prevLog) => [
            `${selected.name} (${selected.team}) attacked ${clicked.name} (${clicked.team}) for ${dmg}${attackOutcome.hasAdvantage ? ` [${TROOP_MECHANIC_LABELS[attackOutcome.attackerType]} > ${TROOP_MECHANIC_LABELS[attackOutcome.defenderType]}]` : ""} (${selected.ammo} shots remaining)`,
            ...prevLog
          ]);
          
          // If out of ammo, switch to melee
          if (selected.ammo === 0) {
            selected.range = 1; // Switch to melee range
            setLog((prevLog) => [`${selected.name} is out of ammo! Switching to melee combat.`, ...prevLog]);
          }
        } else {
          setLog((prevLog) => [
            `${selected.name} (${selected.team})${meleeAttackDestination ? " moved into melee and" : ""} attacked ${clicked.name} (${clicked.team}) for ${dmg}${attackOutcome.hasAdvantage ? ` [${TROOP_MECHANIC_LABELS[attackOutcome.attackerType]} > ${TROOP_MECHANIC_LABELS[attackOutcome.defenderType]}]` : ""}`,
            ...prevLog
          ]);
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
          
          setCustomUnits(prev => [...prev, applyCivilizationPassive(newTroop)]);
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
          
          setCustomUnits(prev => [...prev, applyCivilizationPassive(newTroop)]);
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
      
      if (draggedUnit && ALL_TEAMS.includes(draggedUnit.team as TeamName)) {
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
    const playerUnits = customUnits.filter((u: any) => u.team === playerTeam).length;
    const enemyUnits = customUnits.filter((u: any) => u.team !== playerTeam).length;
    if (playerUnits === 0 || enemyUnits === 0) {
      setLog((prev) => [`${playerTeam} needs at least 1 troop and there must be at least 1 enemy troop before starting.`, ...prev]);
      return;
    }
    
    setIsSetupMode(false);
    setUnits(prepareUnitsForBattle(customUnits));
    setTurn(playerTeam);
    setRound(1);
    setSelectedId(null);
    setGameStarted(true);
    setMergeCount(0); // Reset merge count for new game
    setMergeMode(false);
    setSelectedForMerge(null);
  };

  const startSinglePlayerBattle = () => {
    const nextPlayerTeam = getValidFormationPlayerTeam(currentFormation, playerTeam);
    setUnits(prepareUnitsForBattle(formations[currentFormation]));
    setPlayerTeam(nextPlayerTeam);
    setTurn(nextPlayerTeam);
    setRound(1);
    setSelectedId(null);
    setLog([]);
    setGameStarted(true);
    setMergeCount(0);
    setMergeMode(false);
    setSelectedForMerge(null);
  };

  const resetCustomSetup = () => {
    setCustomUnits([]);
    setDraggedTroop(null);
    setSelectedTeam(gameMode === "multiplayer" ? multiplayerTeams[0] : playerTeam);
  };

  const startSinglePlayerMode = () => {
    const nextPlayerTeam = getValidFormationPlayerTeam(currentFormation, playerTeam);
    setGameMode("single-player");
    setIsSetupMode(false);
    setUnits(prepareUnitsForBattle(formations[currentFormation]));
    setPlayerTeam(nextPlayerTeam);
    setTurn(nextPlayerTeam);
    setRound(1);
    setSelectedId(null);
    setLog([]);
    setGameStarted(false);
    setMergeCount(0);
    setMergeMode(false);
    setSelectedForMerge(null);
  };

  const startMultiplayerMode = () => {
    setGameMode("multiplayer");
    setIsSetupMode(true);
    setUnits(prepareUnitsForBattle(formations[currentFormation]));
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
    setUnits(prepareUnitsForBattle(customUnits));
    setTurn(multiplayerTeams[0]);
    setRound(1);
    setGameStarted(true);
    setMergeCount(0);
  };

  const startCustomScenarioMode = () => {
    setGameMode("custom-scenario");
    setIsSetupMode(true);
    setTurn(playerTeam);
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
    setUnits(prepareUnitsForBattle(formations["Phalanx"]));
    setCustomUnits([]);
    setDraggedTroop(null);
    setSelectedTeam("Romans");
    setPlayerTeam("Romans");
    setSelectedId(null);
    setTurn("Romans");
    setRound(1);
    setLog([]);
    setGameStarted(false);
    setMergeMode(false);
    setMergeCount(0);
    setSelectedForMerge(null);
    setMultiplayerTeams(["Romans", "Barbarians"]);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleBattlefieldFullscreen = async () => {
    if (!battlefieldRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await battlefieldRef.current.requestFullscreen();
    }
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

  // Automatic movement for AI teams - one unit at a time
  useEffect(() => {
    if (isSetupMode || gameMode === "multiplayer" || !aiTeams.includes(turn as TeamName) || !units) return;
    
    const timeout = setTimeout(() => {
      const currentTeam = turn;
      const enemies = units.filter((u: any) => u.team === currentTeam);
      const players = units.filter((u: any) => u.team !== currentTeam);
      
      if (enemies.length === 0 || players.length === 0) {
        advanceAiTurn(currentTeam as TeamName);
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
        advanceAiTurn(currentTeam as TeamName);
        return;
      }
      
      const distX = target.x - bestEnemy.x;
      const distY = target.y - bestEnemy.y;
      
      if (Math.abs(distX) + Math.abs(distY) <= bestEnemy.range) {
        // Attack if in range
        const attackOutcome = getAttackDamage(bestEnemy, target);
        target.hp -= attackOutcome.damage;
        
        // Check if target was killed
        if (target.hp <= 0) {
          setLog((log) => [`${target.name} (${target.team}) was killed by ${bestEnemy.name} (${currentTeam})!`, ...log]);
          // Immediately remove dead unit
          setUnits((prev) => prev.filter((u: any) => u.hp > 0));
        }
        
        // If this is a ranged attack, reduce ammunition
        if (bestEnemy.ammo && bestEnemy.ammo > 0) {
          bestEnemy.ammo -= 1;
          setLog((log) => [
            `${bestEnemy.name} (${currentTeam}) attacked ${target.name} (${target.team}) for ${attackOutcome.damage}${attackOutcome.hasAdvantage ? ` [${TROOP_MECHANIC_LABELS[attackOutcome.attackerType]} > ${TROOP_MECHANIC_LABELS[attackOutcome.defenderType]}]` : ""} (${bestEnemy.ammo} shots remaining)`,
            ...log
          ]);
          
          // If out of ammo, switch to melee
          if (bestEnemy.ammo === 0) {
            bestEnemy.range = 1; // Switch to melee range
            setLog((log) => [`${bestEnemy.name} is out of ammo! Switching to melee combat.`, ...log]);
          }
        } else {
          setLog((log) => [
            `${bestEnemy.name} (${currentTeam}) attacked ${target.name} (${target.team}) for ${attackOutcome.damage}${attackOutcome.hasAdvantage ? ` [${TROOP_MECHANIC_LABELS[attackOutcome.attackerType]} > ${TROOP_MECHANIC_LABELS[attackOutcome.defenderType]}]` : ""}`,
            ...log
          ]);
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
      
      advanceAiTurn(currentTeam as TeamName);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [turn, units, isSetupMode, gameMode, aiTeams, playerTeam]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsBattlefieldFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      battlefieldPanCleanupRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (!showGridNavigation || !hoverScrollDirection || isPanningGrid) return;

    const viewport = battlefieldViewportRef.current;
    if (!viewport) return;

    const interval = window.setInterval(() => {
      const amount = 24;
      if (hoverScrollDirection === "up") viewport.scrollBy({ top: -amount });
      if (hoverScrollDirection === "down") viewport.scrollBy({ top: amount });
      if (hoverScrollDirection === "left") viewport.scrollBy({ left: -amount });
      if (hoverScrollDirection === "right") viewport.scrollBy({ left: amount });
    }, 30);

    return () => window.clearInterval(interval);
  }, [hoverScrollDirection, isPanningGrid, showGridNavigation]);

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
    
    const teamsStillAlive = ALL_TEAMS.filter((team) => currentUnits.some((u: any) => u.team === team));

    if (teamsStillAlive.length === 0) return "Game Over - All teams eliminated!";
    if (teamsStillAlive.length === 1) return `Victory - ${teamsStillAlive[0]} Win!`;

    return null;
  };

  const toggleOption = (option: keyof GameOptions) => {
    setGameOptions((prev) => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const setBattlefieldSize = (size: BattlefieldSize) => {
    setGameOptions((prev) => ({
      ...prev,
      battlefieldSize: size
    }));
  };

  const beginGridPan = (clientX: number, clientY: number) => {
    const viewport = battlefieldViewportRef.current;
    if (!viewport || !showGridNavigation) return;

    battlefieldPanStateRef.current = {
      startX: clientX,
      startY: clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      moved: false
    };
    setIsPanningGrid(true);
  };

  const updateGridPan = (clientX: number, clientY: number) => {
    const viewport = battlefieldViewportRef.current;
    const panState = battlefieldPanStateRef.current;
    if (!viewport || !panState) return;

    const deltaX = clientX - panState.startX;
    const deltaY = clientY - panState.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      panState.moved = true;
      skipNextGridClickRef.current = true;
    }

    viewport.scrollLeft = panState.scrollLeft - deltaX;
    viewport.scrollTop = panState.scrollTop - deltaY;
  };

  const endGridPan = () => {
    battlefieldPanStateRef.current = null;
    setIsPanningGrid(false);
  };

  const handleViewportPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!showGridNavigation) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    battlefieldPanCleanupRef.current?.();
    e.currentTarget.setPointerCapture(e.pointerId);
    beginGridPan(e.clientX, e.clientY);

    const pointerId = e.pointerId;
    const pointerTarget = e.currentTarget;

    const handleWindowPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      event.preventDefault();
      updateGridPan(event.clientX, event.clientY);
    };

    const stopPointerPan = (event?: PointerEvent) => {
      if (event && event.pointerId !== pointerId) return;

      if (pointerTarget.hasPointerCapture(pointerId)) {
        pointerTarget.releasePointerCapture(pointerId);
      }

      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", stopPointerPan);
      window.removeEventListener("pointercancel", stopPointerPan);
      battlefieldPanCleanupRef.current = null;
      endGridPan();
    };

    window.addEventListener("pointermove", handleWindowPointerMove, { passive: false });
    window.addEventListener("pointerup", stopPointerPan);
    window.addEventListener("pointercancel", stopPointerPan);
    battlefieldPanCleanupRef.current = () => stopPointerPan();
  };

  if (!gameMode) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-gradient-to-br from-green-800 via-green-700 to-green-900 min-h-screen">
        <div className="game-ui p-8 text-center max-w-2xl w-full">
          <h1 className="text-5xl font-bold text-yellow-200 mb-4 drop-shadow-lg">Battlecry</h1>
          <p className="text-yellow-100 text-lg mb-8">Choose your mode to enter the battlefield</p>

          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <button
              onClick={startSinglePlayerMode}
              className="battle-button w-full px-6 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
            >
              Single Player
            </button>
            <button
              onClick={startMultiplayerMode}
              className="battle-button w-full px-6 py-4 text-lg font-semibold bg-red-600 hover:bg-red-700"
            >
              Multiplayer
            </button>
            <button
              onClick={startCustomScenarioMode}
              className="battle-button w-full px-6 py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-700"
            >
              Custom Scenario
            </button>
          </div>

          <div className="mt-6 max-w-md mx-auto">
            <button
              onClick={() => setIsOptionsOpen((open) => !open)}
              className={`battle-button w-full px-6 py-3 text-lg font-semibold ${
                isOptionsOpen ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isOptionsOpen ? "Hide Options" : "Show Options"}
            </button>
          </div>

          {isOptionsOpen && (
            <div className="mt-6 text-left bg-black bg-opacity-20 rounded-lg border border-yellow-700 p-4 max-w-md mx-auto">
              <h3 className="text-yellow-200 font-bold mb-3 text-lg border-b border-yellow-600 pb-2">Game Options</h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => toggleOption("musicEnabled")}
                  className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.musicEnabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-700 hover:bg-gray-800"}`}
                >
                  {gameOptions.musicEnabled ? "Music: On" : "Music: Off"}
                </button>
                <button
                  onClick={() => toggleOption("showMoveHighlights")}
                  className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showMoveHighlights ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-800"}`}
                >
                  {gameOptions.showMoveHighlights ? "Move Highlights: On" : "Move Highlights: Off"}
                </button>
                <button
                  onClick={() => toggleOption("showAttackHighlights")}
                  className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showAttackHighlights ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-800"}`}
                >
                  {gameOptions.showAttackHighlights ? "Attack Highlights: On" : "Attack Highlights: Off"}
                </button>
                <button
                  onClick={() => toggleOption("showBattleLog")}
                  className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showBattleLog ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-700 hover:bg-gray-800"}`}
                >
                  {gameOptions.showBattleLog ? "Battle Log: On" : "Battle Log: Off"}
                </button>
                <button
                  onClick={() => toggleOption("showTurnBanner")}
                  className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showTurnBanner ? "bg-yellow-600 hover:bg-yellow-700" : "bg-gray-700 hover:bg-gray-800"}`}
                >
                  {gameOptions.showTurnBanner ? "Turn Banner: On" : "Turn Banner: Off"}
                </button>
                <button
                  onClick={() => toggleOption("showUnitPanel")}
                  className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showUnitPanel ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-700 hover:bg-gray-800"}`}
                >
                  {gameOptions.showUnitPanel ? "Unit Panel: On" : "Unit Panel: Off"}
                </button>
                <div className="bg-black bg-opacity-20 border border-yellow-700 rounded-lg px-4 py-3">
                  <label htmlFor="battlefield-size" className="block text-yellow-200 text-sm font-semibold mb-2">
                    Battlefield Size
                  </label>
                  <select
                    id="battlefield-size"
                    value={gameOptions.battlefieldSize}
                    onChange={(e) => setBattlefieldSize(Number(e.target.value) as BattlefieldSize)}
                    className="w-full bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
                  >
                    {BATTLEFIELD_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>{size} x {size}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${isBattlefieldFullscreen ? "p-2 sm:p-3" : "p-3 sm:p-4"} space-y-3 sm:space-y-4 bg-gradient-to-br from-green-800 via-green-700 to-green-900 min-h-screen`}>
      <div
        ref={battlefieldRef}
        className={`fullscreen-battlefield-shell w-full flex flex-col items-center ${isBattlefieldFullscreen ? "space-y-3 h-full justify-start" : "space-y-3 sm:space-y-4"}`}
      >
      {/* Game Controls */}
      <div className={`game-ui w-full max-w-6xl px-3 py-3 flex flex-wrap gap-2 sm:gap-3 items-center justify-center relative ${isBattlefieldFullscreen ? "w-full sticky top-0 z-20" : ""}`}>
        {/* Decorative helmet */}
        <svg className="absolute -top-1 left-2 w-5 h-5 text-yellow-400 opacity-30" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>

        {!isBattlefieldFullscreen && (
          <div className="mr-auto min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-yellow-200 drop-shadow-lg">Battlecry</h1>
              <span className="rounded-full border border-yellow-700 bg-black bg-opacity-20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-yellow-100">
                {gameMode === "multiplayer" ? "Local Multiplayer" : "Player vs AI"}
              </span>
            </div>
            <p className="text-green-200 text-[11px] sm:text-xs mt-1 max-w-md">
              {isSetupMode
                ? gameMode === "custom-scenario"
                  ? `Build the battlefield and choose who you control as ${playerTeam}.`
                  : "Drag troops to place them on the field."
                : gameMode === "multiplayer"
                  ? "Pass-and-play mode on one device."
                  : gameStarted
                    ? `You control ${playerTeam}.`
                    : `You control ${playerTeam}. Press Start Battle when ready.`}
            </p>
          </div>
        )}
        
        <button
          onClick={backToMainMenu}
          className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800 relative"
        >
          <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          ↩️ Back to Menu
        </button>

        {!isSetupMode && (
          <button
            onClick={toggleBattlefieldFullscreen}
            className="battle-button px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 relative"
          >
            <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {isBattlefieldFullscreen ? "🗗 Exit Fullscreen" : "🗖 Fullscreen"}
          </button>
        )}

        {gameMode === "single-player" && !isSetupMode && !gameStarted && (
          <button
            onClick={startSinglePlayerBattle}
            className="battle-button px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 relative"
          >
            <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            🚀 Start Battle
          </button>
        )}

        {gameMode === "custom-scenario" && isSetupMode && (
          <>
            <button
              onClick={startCustomGame}
              disabled={customUnits.length === 0}
              className="battle-button px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              🚀 Start Custom Game
            </button>
            
            <button
              onClick={resetCustomSetup}
              className="battle-button px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 relative"
            >
              <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              🔄 Reset Setup
            </button>
            
            <button
              onClick={() => setIsSetupMode(false)}
              className="battle-button px-4 py-2 text-sm font-semibold bg-gray-600 hover:bg-gray-700 relative"
            >
              <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
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
              className="battle-button px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              🚀 Start Multiplayer Game
            </button>
            
            <button
              onClick={resetCustomSetup}
              className="battle-button px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 relative"
            >
              <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              🔄 Reset Setup
            </button>
          </>
        )}
        
        {!isSetupMode && ((gameMode === "multiplayer" && gameStarted) || (gameMode !== "multiplayer" && turn === playerTeam && gameStarted)) && (
          <>
            <button
              onClick={advanceTurn}
              className="battle-button px-4 py-2 text-sm font-semibold bg-yellow-600 hover:bg-yellow-700 relative"
            >
              <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              ⏭️ End Turn
            </button>
            
            {/* Merge count display */}
            {!isSetupMode && gameStarted && (
              <div className="text-blue-200 font-semibold bg-blue-900 bg-opacity-50 px-3 py-2 rounded border border-blue-600 text-center">
                <span className="block text-[11px] uppercase tracking-wide">Merges</span>
                <span className="block text-sm">{mergeCount}/2</span>
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
                className={`battle-button px-4 py-2 text-sm font-semibold relative ${
                  mergeMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {mergeMode ? '🔄 Cancel Merge' : '🔗 Merge Troops'}
              </button>
            )}
          </>
        )}

        {isBattlefieldFullscreen && !isSetupMode && (
          <div className="text-yellow-100 border border-yellow-700 rounded px-3 py-2 text-sm font-semibold">
            {checkEnd() || `${turn.toUpperCase()} TURN`}
          </div>
        )}
        
        <div className="ml-auto flex flex-wrap items-center justify-center gap-2 text-yellow-200 text-xs sm:text-sm font-semibold">
          <span className="rounded-full border border-yellow-700 bg-black bg-opacity-20 px-3 py-1">
            {gameMode === "custom-scenario"
              ? (isSetupMode ? `Custom Setup (${playerTeam})` : `Mode: Custom Scenario (${playerTeam} vs AI)`)
              : gameMode === "multiplayer"
                ? `Mode: Multiplayer (${multiplayerTeams[0]} vs ${multiplayerTeams[1]})`
                : `Level: ${FORMATION_LEVEL_LABELS[currentFormation]} (${playerTeam})`}
          </span>
          {!isSetupMode && <span className="rounded-full border border-yellow-700 bg-black bg-opacity-20 px-3 py-1">Round {round}</span>}
          
          {/* Formation Selector */}
          {!isSetupMode && gameMode !== "custom-scenario" && (
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="formation-select" className="text-xs uppercase tracking-wide text-yellow-100">
                Matchup
              </label>
              <select
                id="formation-select"
                value={currentFormation}
                onChange={(e) => setCurrentFormation(e.target.value as keyof typeof formations)}
                className="bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-2 py-1 text-xs sm:text-sm focus:outline-none focus:border-yellow-400"
              >
                <option value="Phalanx">Level 1: Romans vs Barbarians</option>
                <option value="Arch">Level 2: Greeks vs Celts</option>
                <option value="Testudo">Level 3: Carthage vs Vikings</option>
                <option value="Circle">Level 4: Germanic vs Teutons</option>
                <option value="Staggered">Level 5: Romans vs Carthage</option>
                <option value="Delta">Level 6: Greeks vs Germanic</option>
                <option value="Tercio">Level 7: Celts vs Vikings</option>
                <option value="Pincer">Level 8: Barbarians vs Teutons</option>
              </select>
              {gameMode === "single-player" && (
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor="single-player-team" className="text-xs uppercase tracking-wide text-yellow-100">
                    Faction
                  </label>
                  <select
                    id="single-player-team"
                    value={playerTeam}
                    onChange={(e) => {
                      const nextTeam = e.target.value as TeamName;
                      setPlayerTeam(nextTeam);
                      setUnits(prepareUnitsForBattle(formations[currentFormation]));
                      setTurn(nextTeam);
                      setRound(1);
                      setSelectedId(null);
                      setLog([]);
                      setGameStarted(false);
                      setMergeCount(0);
                      setMergeMode(false);
                      setSelectedForMerge(null);
                    }}
                    className="bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-2 py-1 text-xs sm:text-sm focus:outline-none focus:border-yellow-400"
                  >
                    {formationTeams.map((team) => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
              )}
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
          
          {(gameMode === "multiplayer" || gameMode === "custom-scenario") && (
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gameMode === "custom-scenario" ? (
                <div className="sm:col-span-2">
                  <label className="block text-yellow-200 text-sm mb-1">Your Team</label>
                  <select
                    value={playerTeam}
                    onChange={(e) => {
                      const next = e.target.value as TeamName;
                      setPlayerTeam(next);
                      if (selectedTeam === playerTeam) setSelectedTeam(next);
                    }}
                    className="w-full bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
                  >
                    <option value="Romans">Romans</option>
                    <option value="Barbarians">Barbarians</option>
                    <option value="Greeks">Greeks</option>
                    <option value="Celts">Celts</option>
                    <option value="Germanic">Germanic</option>
                    <option value="Carthage">Carthage</option>
                    <option value="Vikings">Vikings</option>
                    <option value="Teutons">Teutons</option>
                  </select>
                </div>
              ) : (
                <>
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
                  <option value="Celts">Celts</option>
                  <option value="Germanic">Germanic</option>
                  <option value="Carthage">Carthage</option>
                  <option value="Vikings">Vikings</option>
                  <option value="Teutons">Teutons</option>
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
                  <option value="Celts">Celts</option>
                  <option value="Germanic">Germanic</option>
                  <option value="Carthage">Carthage</option>
                  <option value="Vikings">Vikings</option>
                  <option value="Teutons">Teutons</option>
                </select>
              </div>
                </>
              )}
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

      {!isSetupMode && !isBattlefieldFullscreen && passiveTeams.length > 0 && (
        <div className="flex w-full justify-center">
          <div className="flex w-fit flex-wrap items-center justify-center gap-2">
            {passiveTeams.map((team) => {
              const passive = CIV_PASSIVES[team];
              return (
                <div key={team} className="relative group">
                  <button
                    type="button"
                    className="game-ui flex items-center justify-center border border-yellow-600 text-2xl"
                    style={{ width: "50px", height: "50px" }}
                    aria-label={`${team} passive: ${passive.name}. ${passive.effect}`}
                    title={`${team} - ${passive.name}: ${passive.effect}`}
                  >
                    {PASSIVE_ICONS[team]}
                  </button>
                  <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-56 -translate-x-1/2 rounded-lg border border-yellow-700 bg-gray-900 px-3 py-2 text-center shadow-lg group-hover:block">
                    <div className="text-yellow-200 text-sm font-bold">{team}</div>
                    <div className="text-amber-300 text-xs font-semibold mt-1">{passive.name}</div>
                    <div className="text-yellow-100 text-xs mt-1">{passive.effect}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Three-Column Layout: Battle Log (Left) | Battlefield Grid (Center) | Selected Unit/Troop Panel (Right) */}
      <div className={`flex gap-3 w-full ${isBattlefieldFullscreen ? "flex-row max-w-none items-stretch" : "flex-col xl:flex-row max-w-8xl"}`}>
        {/* Left Side: Turn Info + Battle Log */}
        {!isSetupMode && (gameOptions.showTurnBanner || gameOptions.showBattleLog) && (
          <div className={`flex-shrink-0 space-y-3 ${isBattlefieldFullscreen ? "w-56" : "xl:w-80"}`}>
            {gameOptions.showTurnBanner && (
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
                    : turn === playerTeam ? "Your turn - Click to select and move/attack"
                      : turn === "Barbarians" ? "Barbarians are thinking..."
                        : turn === "Greeks" ? "Greeks are thinking..."
                          : turn === "Celts" ? "Celts are thinking..."
                          : turn === "Germanic" ? "Germanic tribes are thinking..."
                          : turn === "Carthage" ? "Carthage is thinking..."
                          : turn === "Vikings" ? "Vikings are thinking..."
                          : turn === "Teutons" ? "Teutons are thinking..." : ""}
                </div>
                
                {/* Decorative sword */}
                <svg className="absolute -bottom-2 right-4 w-8 h-8 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.92 5H5.14c-.47 0-.92.21-1.18.56L3.04 7H2v1h1.04l.92 1.44c.26.35.71.56 1.18.56h1.78c.47 0 .92-.21 1.18-.56L9.96 7H11V6H9.96L8.1 4.56C7.84 4.21 7.39 4 6.92 4z"/>
                </svg>
              </div>
            )}

            {gameOptions.showBattleLog && (
              <div className={`game-ui p-4 relative ${isBattlefieldFullscreen ? "max-h-[72vh] overflow-y-auto" : ""}`}>
                {/* Decorative scroll */}
                <svg className="absolute -top-2 left-2 w-6 h-6 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                </svg>
                
                <h3 className="text-yellow-200 font-bold mb-3 text-lg border-b border-yellow-600 pb-2">Battle Log</h3>
                <div className={`${isBattlefieldFullscreen ? "max-h-[58vh]" : "max-h-96"} overflow-y-auto space-y-1`}>
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
          </div>
        )}
        
        {/* Battlefield Grid - Center */}
        <div className={`battlefield-container relative flex-1 ${isBattlefieldFullscreen ? "min-w-0 flex items-center justify-center" : ""}`}>
          {/* Decorative battlefield elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-600 rounded-full opacity-60"></div>
          <div className="absolute -top-4 -right-4 w-6 h-6 bg-yellow-600 rounded-full opacity-60"></div>
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-yellow-600 rounded-full opacity-60"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-yellow-600 rounded-full opacity-60"></div>

          <div className="relative mx-auto w-fit max-w-full">
            {showGridNavigation && (
              <>
                <div
                  className="absolute left-12 right-12 top-0 z-10 flex h-12 items-start justify-center pt-2"
                  onMouseEnter={() => setHoverScrollDirection("up")}
                  onMouseLeave={() => setHoverScrollDirection(null)}
                >
                  <div className="battlefield-nav-rail battlefield-nav-rail-horizontal" aria-hidden="true" />
                </div>
                <div
                  className="absolute bottom-0 left-12 right-12 z-10 flex h-12 items-end justify-center pb-2"
                  onMouseEnter={() => setHoverScrollDirection("down")}
                  onMouseLeave={() => setHoverScrollDirection(null)}
                >
                  <div className="battlefield-nav-rail battlefield-nav-rail-horizontal" aria-hidden="true" />
                </div>
                <div
                  className="absolute bottom-12 left-0 top-12 z-10 flex w-12 items-center justify-start pl-2"
                  onMouseEnter={() => setHoverScrollDirection("left")}
                  onMouseLeave={() => setHoverScrollDirection(null)}
                >
                  <div className="battlefield-nav-rail battlefield-nav-rail-vertical" aria-hidden="true" />
                </div>
                <div
                  className="absolute bottom-12 right-0 top-12 z-10 flex w-12 items-center justify-end pr-2"
                  onMouseEnter={() => setHoverScrollDirection("right")}
                  onMouseLeave={() => setHoverScrollDirection(null)}
                >
                  <div className="battlefield-nav-rail battlefield-nav-rail-vertical" aria-hidden="true" />
                </div>
              </>
            )}

            <div
              ref={battlefieldViewportRef}
              className={
                useEightByEightViewport
                  ? "battlefield-scroll-viewport battlefield-scroll-viewport-8x8"
                  : useFullscreenNavigationViewport
                    ? "battlefield-scroll-viewport battlefield-scroll-viewport-fullscreen-large"
                    : ""
              }
              onPointerDownCapture={handleViewportPointerDown}
              style={showGridNavigation ? { cursor: isPanningGrid ? "grabbing" : "grab" } : undefined}
            >
              <div
                className={`battlefield-grid inline-grid gap-1 ${isBattlefieldFullscreen ? "p-2" : "p-6"} rounded-lg`}
                style={{
                  width: "max-content",
                  gridTemplateColumns: `repeat(${battlefieldSize}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${battlefieldSize}, minmax(0, 1fr))`
                }}
              >
                {[...Array(battlefieldSize)].flatMap((_, y) =>
                  [...Array(battlefieldSize)].map((_, x) => {
                const u = getUnit(x, y);
                const isSelected = u?.id === selectedId;
                const key = `${x},${y}`;
                const isMove = highlightMove && highlightMove.includes(key);
                const isAttack = highlightAttack && highlightAttack.includes(key);
                const percent = u ? (u.hp / u.maxHp) * 100 : 0;
                
                // Determine cell type for visual variety
                const isPath = (x === centerStart || x === centerEnd) && (y === centerStart || y === centerEnd); // Center paths
                const cellClass = isPath ? "cobblestone-path" : "grass-cell";
                
                return (
                  <div
                    key={key}
                    onClick={() => handleClick(x, y)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, x, y)}
                    draggable={!isSetupMode && mergeMode && u && ALL_TEAMS.includes(u.team)}
                    onDragStart={(e: React.DragEvent) => {
                      if (!isSetupMode && mergeMode && u && ALL_TEAMS.includes(u.team)) {
                        setSelectedId(u.id);
                        e.dataTransfer.setData('text/plain', u.id);
                      }
                    }}
                    className={`${isBattlefieldFullscreen ? "w-14 h-16 sm:w-16 sm:h-20" : "w-16 h-20 sm:w-20 sm:h-24"} flex flex-col items-center justify-center text-xs sm:text-sm cursor-pointer transition-all duration-200 relative
                    ${cellClass}
                    ${isSelected ? "unit-selected" : ""}
                    ${isMove ? "movement-highlight" : ""}
                    ${isAttack ? "attack-highlight" : ""}
                    ${u ? (u.team === "Romans" ? "unit-roman" : u.team === "Greeks" ? "unit-greek" : u.team === "Celts" ? "unit-celtic" : u.team === "Germanic" ? "unit-germanic" : u.team === "Carthage" ? "unit-carthage" : u.team === "Vikings" ? "unit-viking" : u.team === "Teutons" ? "unit-teuton" : "unit-barbarian") : ""}
                    ${isSetupMode && draggedTroop && !u ? "drag-over" : ""}
                    ${mergeMode && u && u.team === turn && selectedForMerge && u.role === selectedForMerge.role ? "merge-highlight" : ""}
                    ${mergeMode && u && u.team === turn && selectedForMerge && u.id === selectedForMerge.id ? "merge-selected" : ""}
                    ${!isSetupMode && mergeMode && u && ALL_TEAMS.includes(u.team) ? "cursor-grab active:cursor-grabbing" : ""}`}
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
          </div>
        </div>
        
        {/* Right Side Panel */}
        {gameOptions.showUnitPanel && (
        <div className={`game-ui p-4 flex-shrink-0 relative ${isBattlefieldFullscreen ? "w-56 max-h-[72vh] overflow-y-auto" : "xl:w-80"}`}>
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
                      <div className="text-2xl">
                        {typeof troop.Icon === "string" && troop.Icon.length <= 2
                          ? troop.Icon
                          : ICON_MAP[troop.Icon as keyof typeof ICON_MAP] || troop.Icon || "⚔️"}
                      </div>
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
                  <p><span className="text-sky-300">🏴</span> Team: {selected.team}</p>
                  <p><span className="text-red-400">❤️</span> HP: {selected.hp}/{selected.maxHp}</p>
                  <p><span className="text-orange-400">⚔️</span> Attack: {selected.attack}</p>
                  <p><span className="text-blue-400">🎯</span> Range: {selected.range}</p>
                  <p><span className="text-green-400">🚶‍♂️</span> Move: {selected.move}</p>
                  <p><span className="text-purple-400">🏷️</span> Role: {selected.role}</p>
                  <p>
                    <span className="text-cyan-300">{TROOP_MECHANIC_ICONS[getTroopMechanicType(selected)]}</span>{" "}
                    Mechanic: {TROOP_MECHANIC_LABELS[getTroopMechanicType(selected)]}
                  </p>
                  {selected.civPassiveName && (
                    <p><span className="text-amber-300">✨</span> Passive: <strong>{selected.civPassiveName}</strong></p>
                  )}
                  {selected.civPassiveEffect && (
                    <p className="text-xs text-yellow-100 opacity-90">{selected.civPassiveEffect}</p>
                  )}
                  
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
        )}
      </div>
      </div>
    </div>
  );
}

export default CodeConq;
