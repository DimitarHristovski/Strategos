# Fantasy UI icon pack (`public/icons/ui/`)

The long-named **`Fantasy_*_removebg-preview.png`**, **`Medieval_fantasy_*`**, **`Screenshot_*`**, and **`Fantasy_mounted_*`** files were renamed to short, stable filenames. Wiring lives in `src/game/uiIcons.ts` and `src/index.css` (battlefield highlights).

## Ability & trap art

| File | Source (original) | Used for |
|------|-------------------|----------|
| `ability-shield-ornate.png` | Fantasy_abilities_r2_c2 | Romans passive rail |
| `ability-archery-target.png` | Fantasy_abilities_r3_c2 | Volley rail + `.civ-volley-highlight` |
| `ability-fire-rage.png` | Fantasy_abilities_r3_c3 | Barbarians passive |
| `ability-haste-boot.png` | Fantasy_abilities_r3_c4 | *(reserve / future)* |
| `ability-handshake.png` | Fantasy_abilities_r5_c2 | Reinforce rail + ally pact |
| `ability-brick-wall.png` | Fantasy_abilities_r5_c3 | Greeks passive |
| `ability-skull.png` | Fantasy_abilities_r5_c4 | *(reserve / future)* |
| `ability-travel-boot.png` | Fantasy_abilities_r7_c2 | *(reserve / future)* |
| `trap-pressure-plate.png` | Fantasy_abilities_r7_c3 | Trap rail + `.civ-trap-cell-placed` |
| `ability-boot-mortar.png` | Fantasy_abilities_r7_c4 | *(reserve / future)* |

## Gold & shadow set

| File | Source | Used for |
|------|--------|----------|
| `ui-crown-gold.png` | Fantasy_gold_r2_c2 | *(reserve)* |
| `ui-banner-heraldry.png` | Fantasy_gold_r2_c3 | Seleucids passive |
| `ui-bow-arrow.png` | Fantasy_gold_r4_c4 | Parthians passive |
| `ui-plus-gold.png` | Fantasy_gold_r6_c2 | `.civ-reinforce-highlight` |
| `trap-magic-pedestal.png` | Fantasy_gold_r6_c3 | *(reserve — magic trap variant)* |
| `trap-bear-jaws.png` | Fantasy_gold_r6_c4 | Thracians passive |
| `ui-sun.png` | Fantasy_gold_r8_c2 | Day indicator + Egypt passive |
| `ui-moon.png` | Fantasy_gold_r8_c3 | Night indicator |
| `ui-hourglass.png` | Fantasy_gold_r8_c4 | Cooldown metaphor *(toolbar uses for timed play optional)* |

## Mounted & support portraits

| File | Source | Used for |
|------|--------|----------|
| `unit-camel-archer.png` | Fantasy_mounted_r2_c2 | *(reserve)* |
| `unit-camel-archer-drawn.png` | Fantasy_mounted_r2_c3 | Carthage passive |
| `unit-war-drummer.png` | Fantasy_mounted_r2_c4 | *(reserve)* |
| `unit-horn-herald.png` | Fantasy_mounted_r2_c5 | *(reserve)* |

## Other

| File | Source | Used for |
|------|--------|----------|
| `ui-crossed-swords.png` | Medieval_r2_c3 | Merge toolbar + `.merge-highlight` |
| `ui-catapult.png` | Medieval_r2_c6 | *(reserve — siege)* |
| `ui-lightning.png` | Screenshot_14.17.43 | Vikings passive |
| `ui-war-horn.png` | Screenshot_14.17.53 | *(reserve — rally)* |

Older medieval-only assets (`ui-shield-ram.png`, `ui-pocket-watch.png`, etc.) may remain in the folder for manual reuse; they are not referenced by `uiIcons.ts` after this pass.
