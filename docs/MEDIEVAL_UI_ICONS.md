# Medieval fantasy raster icons (`public/icons/ui/`)

**Note:** Many on-screen icons now use the **fantasy ability / gold-shadow / mounted** pack with short filenames — see **`docs/FANTASY_UI_ICONS.md`**. The table below is the original medieval grid rename; files such as `ui-crossed-spears.png` and `trap-snare-boulder.png` were **replaced** by the fantasy pack (`ui-crossed-swords.png`, `trap-pressure-plate.png`, etc.).

Source files were **`dist/icons/UIIcons/Medieval fantasy icon collection (1)_r*_c*.png`**. Vite serves `public/` at the site root, e.g. `/icons/ui/ui-compass.png`.

## Rename map (original → public)

| Original file | Renamed asset | Typical use |
|---------------|---------------|-------------|
| `_r1_c4.png` | `ui-refresh-cycle.png` | Restart / cycle |
| `_r3_c1.png` | `ui-compass.png` | Navigation / skirmish / map |
| `_r3_c2.png` | `ui-crossed-spears-framed.png` | Volley / framed war emblem |
| `_r3_c3.png` | `ui-scroll-seal.png` | Battle log / decree |
| `_r3_c4.png` | `ui-helm-bronze.png` | Troops panel / armor |
| `_r4_c1.png` | `ui-shield-ram.png` | Defense / passive rail |
| `_r4_c2.png` | `ui-crossed-spears.png` | Combat / merge |
| `_r4_c3.png` | `trap-chain-hook.png` | Chain trap / hook hazard |
| `_r4_c4.png` | `ui-helm-skull-horns.png` | Brutal / barbarian tone |
| `_r5_c1.png` | `ui-sword-in-stone.png` | Claim / strike / marker |
| `_r5_c2.png` | `ui-play-gold.png` | Start battle / deploy |
| `_r5_c3.png` | `ui-hourglass.png` | Cooldown / time / sustain |
| `_r5_c4.png` | `ui-loot-sack.png` | Supplies / auto-deploy |
| `_r6_c1.png` | `ui-sun.png` | Day overlay toggle |
| `_r6_c2.png` | `ui-moon.png` | Night overlay toggle |
| `_r6_c3.png` | `ui-spy-hood.png` | Spy mode |
| `_r6_c4.png` | `trap-marker-signpost.png` | Woodland trap / sign |
| `_r7_c1.png` | `trap-barrel-rope.png` | Snare supplies |
| `_r7_c2.png` | `ui-raven-bones.png` | Omen / Thracian tone |
| `_r7_c3.png` | `ui-pocket-watch.png` | Timer / cooldown metaphor |
| `_r7_c4.png` | `trap-snare-boulder.png` | Placed trap cell marker |

Constants and faction mappings: `src/game/uiIcons.ts`.
