# Icon reference (Strategos / CodeConq)

The UI uses **Unicode emoji** in many places, plus **PNG icons** from `public/icons/ui/` for the faction rail, main toolbar, deployment chips, and several battlefield highlights. See **`docs/FANTASY_UI_ICONS.md`** (current art) and **`docs/MEDIEVAL_UI_ICONS.md`** (older medieval grid rename / history).

---

## 1. Faction passive (yellow rail)

**In-game art:** `PASSIVE_RAIL_ICON` in `src/game/uiIcons.ts` (raster).  
**Legacy / data:** `PASSIVE_ICONS` in `src/game/unitLifecycle.ts` (emoji) — kept for reference; battle UI uses the PNGs above.

| Faction     | Icon | Role (flavor)        |
|------------|------|----------------------|
| Romans     | 🛡️  | Passive rail marker  |
| Barbarians | 🔥   | Passive rail marker  |
| Greeks     | 🗡️  | Passive rail marker  |
| Gauls      | 🍃   | Passive rail marker  |
| Germanic   | 🪓   | Passive rail marker  |
| Carthage   | 🐘   | Passive rail marker  |
| Egypt      | ☀️   | Passive rail marker  |
| Thracians  | 🗡️  | Passive rail marker  |
| Dacians    | 🐺   | Passive rail marker  |
| Parthians  | 🏹   | Passive rail marker  |
| Seleucids  | 🏺   | Passive rail marker  |
| Vikings    | ⛵   | Passive rail marker  |

---

## 2. Faction active / civilization ability (cyan rail)

**In-game button art:** `getCivActiveRailIcon()` in `src/game/uiIcons.ts` (by `targeting`: volley / reinforce / summon / trap).  
**Data / log text:** `CIV_ACTIVES[].icon` in `src/game/civActives.ts` (emoji) — still used in **battle log** lines for `[Civilization Ability]`.

| Faction     | Icon | Ability flavor (name in game)   |
|------------|------|-----------------------------------|
| Romans     | 🏛️  | Legion Reinforcement (summon)     |
| Carthage   | 🐘   | Beast of the Line (summon)        |
| Seleucids  | 🏺   | Imperial Reserves (summon)        |
| Barbarians | 📣   | Axe Volley                        |
| Parthians  | 🏹   | Parthian Volley                   |
| Germanic   | ⚒️   | Blood Feud Shot                   |
| Greeks     | 🛡️  | Shielded Resupply               |
| Egypt      | ☀️   | Solar Blessing                    |
| Vikings    | 🪓   | War Frenzy                        |
| Gauls      | 🌿   | Hidden Snares (trap)              |
| Dacians    | 🐺   | Falx Trap                         |
| Thracians  | ⛰️   | Terror Trap                       |

**Volley tooltip motion (decorative glyphs in hover card):** `getVolleyTooltipGlyphs()` in `src/game/civActives.ts` — e.g. 🏹➶, 🪨⚙️, 🪓, 🗡️➷ by faction style.

---

## 3. Troop roster icons (catalog)

**Source:** `Icon` on each entry in `AVAILABLE_TROOPS` in `src/game/unitCatalog.ts`; displayed on **setup palette**, **unit tiles**, and via `getUnitDisplayIcon()`.

**Common patterns**

| Icon   | Typical use                                      |
|--------|--------------------------------------------------|
| 👑     | Ruler / leader roles                             |
| ⚔️     | Melee infantry                                   |
| 🐎     | Cavalry (and some chariots)                      |
| 🏹     | Ranged (archers, slingers, some skirmishers)     |
| ⚙️     | Siege engines (ballista, catapult, onager, etc.) |
| 🐘     | War elephant (and some elephant archers)         |
| 🐘🏹   | Elephant archer variants                         |
| 🐎🏹   | Mounted skirmishers / chariots with missiles     |
| 🏹🐎   | Horse archer (order may differ)                  |
| 🐪     | Camel rider                                      |
| 🐪🏹   | Camel-mounted archer                             |
| 🥁     | Support (e.g. war drummer)                       |
| 📯     | Support (e.g. war horn)                          |

**Legacy asset keys → emoji:** `ICON_MAP` in `src/game/unitCatalog.ts` maps old string keys (e.g. `GiSwordman`, `FaCrown`) to the same emoji set for any data that still references them.

---

## 4. Troop **type** (mechanic) icons

**Source:** `TROOP_MECHANIC_ICONS` in `src/game/battleEngine.ts` — used for type labels (e.g. inspector, search), and as the default type icon when not using a hybrid override.

| Type         | Icon | Meaning              |
|-------------|------|----------------------|
| closecombat | ⚔️   | Melee                |
| mounted     | 🐎   | Cavalry / mounts     |
| ranged      | 🏹   | Missile troops       |
| sieged      | ⚙️   | Artillery / siege    |

**Hybrid mounted + ranged:** `getTroopTypeDisplay()` in `src/game/unitCatalog.ts` uses **🐎🏹** when a unit is treated as hybrid.

---

## 5. Signature abilities on the battlefield

When a role’s ability **conditions are met**, a small icon can appear on the unit (see `getBattlefieldBuffStrip` / `getBattlefieldActiveAbilities` in `src/game/battleEngine.ts`).

**Source:** `TROOP_ABILITY_BATTLEFIELD_ICONS`

| Key           | Icon | Ability key (internal) |
|---------------|------|-------------------------|
| brace         | 🛡   | brace                   |
| charge        | ⚡   | charge                  |
| command       | 📯   | command                 |
| crush         | 💥   | crush                   |
| deadeye       | 🎯   | deadeye                 |
| ferocity      | 🔥   | ferocity                |
| guarded       | ✋   | guarded                 |
| harrier       | ↯    | harrier                 |
| resolve       | 🤝   | resolve                 |
| shieldWall    | 🧱   | shieldWall              |
| shock         | ☠    | shock                   |
| siegeMastery  | ⚙    | siegeMastery            |
| skirmishStep  | 👟   | skirmishStep            |

---

## 6. Buff strip (auras & formation)

**Source:** `getBattlefieldBuffStrip()` in `src/game/battleEngine.ts`

| Icon | Meaning |
|------|---------|
| 👑   | **Leader aura** — adjacent king-style leader |
| 🎖️  | **Command aura** — adjacent commander ability |
| 🔗   | **Formation line** — linked formation passive active |

Personal signature abilities in the same strip reuse the icons from **section 5**.

---

## 7. Grid highlights (CSS pseudo-elements)

**Source:** `src/index.css` — overlay emoji on highlighted tiles.

| Class / context        | Icon | Meaning |
|------------------------|------|---------|
| `.merge-highlight`     | 🔗   | Valid merge target / merge mode hint |
| `.spy-target-highlight`| 🕵️  | Spy mode — valid enemy intel target |
| `.civ-volley-highlight`| 🏹   | Armed volley — valid enemy |
| `.civ-reinforce-highlight` | ➕ | Armed reinforce — valid ally |
| `.civ-summon-tile-highlight` | 🏛️ | Summon / trap tile highlight (empty valid tiles) |
| `.civ-trap-cell-placed`| 🪤   | Revealed placed trap (owner / spectator) |
| `.merge-target-highlight` (legacy merge UI) | 🎯 | Merge target marker |

---

## 8. Battle toolbar (floating buttons)

**Source:** `src/CodeConq.tsx` (battlefield chrome)

| Glyph | Action |
|-------|--------|
| 🗖 / 🗗 | Enter / exit fullscreen battlefield |
| ↺     | Restart game |
| 🧭    | Open skirmish setup (single-player, non-tutorial) |
| 📜    | Toggle battle log panel |
| 🪖    | Open troop panel (setup) |
| ▶     | Start battle / start custom or MP setup |
| ✨    | Auto-deploy (custom scenario setup) |
| 🗑    | Reset setup |
| 🔗    | Toggle **merge** mode |
| 🕵️   | Toggle **spy** mode |
| 🗺    | Regenerate terrain |
| ☀️ / 🌙 | Day/night indicator toggle (or ☀️ only if reduced motion) |
| ⏲     | Timed-play clock label (team + seconds) |

---

## 9. Unit cell & inspector hints

**Source:** `src/CodeConq.tsx` (inspector panel, list rows)

| Icon   | Use |
|--------|-----|
| 🚶‍♂️ | Move highlight / move stat |
| ⚔️   | Attack highlight / attack stat / no-ammo melee penalty |
| ❤️   | HP line |
| 🎯   | Range stat |
| ⚖️   | Line weight (light/medium/heavy…) |
| 🗺️   | Terrain label in inspector |

---

## 10. Custom cursors (emoji in SVG data-URIs)

**Source:** `src/index.css` (`:root` variables like `--cc-cursor-*`)

These render as small emoji-based cursors for battlefield interactions (target, hand, boot, sword, scroll, help, text, grab, map pan, deploy pin, blocked, faction rail directions, etc.). The encoded glyphs match the in-game affordances (e.g. 🎯 target, 🤚 hand, 🥾 boot, ⚔️ sword, 📜 scroll, ❓ help, ✏️ text, ✊ grab, 🖐 map grab, 📍 deploy, 🚫 blocked).

---

## 11. Mechanics / help copy

**Source:** `src/game/mechanicsInfo.ts` — section titles and bullets use many emoji as **visual headings** (⚔️, 🧱, 👑, 🏹, 🧬, 🕵️, ⚡, 🧭, 🗺️, etc.). They mirror the topics (combat, terrain, leader, ranged, merge/spy, faction ability, skirmish, and so on). Updating those strings only affects help text, not combat logic.

---

## 12. Terrain in data (not emoji on the map)

**Source:** `src/game/constants.ts` — `TERRAIN_LABELS` are **English words** (Plain, Forest, Hill, River, Desert). The battlefield uses **image / video assets** (`TERRAIN_ASSETS`, tile videos), not emoji tiles.

---

### Maintenance tip

When adding a new **faction** or **troop role**, update:

- `PASSIVE_ICONS` + `CIV_PASSIVES` / `CIV_ACTIVES` as needed  
- `AVAILABLE_TROOPS` icon  
- If the role has signature abilities, keys in `TROOP_ABILITY_BATTLEFIELD_ICONS` must match `troopStats` ability keys.

When adding a **toolbar** or **highlight** control, document the glyph here so designers and translators stay aligned.
