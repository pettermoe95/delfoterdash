# Delfoter TD: AI Takeover

The game runs locally in the admin frontend without backend services. Characters are configured in two registries: `enemies.ts` and `towers.ts`. Their keys define `EnemyKind` and `TowerKind` automatically. Adding a character does not require updating an ID union, shop, guide, renderer, or combat switch.

## Add an enemy

Add an entry inside `definitions` in `enemies.ts`. Use `BASE_ENEMY` for defaults and override what makes the enemy different:

```ts
reefGuard: {
    ...BASE_ENEMY,
    name: 'Reef Guard',
    description: 'A shielded robot with a weakness for a good soaking.',
    health: 120,
    armor: 8,
    speed: 36,
    shield: 30,
    reward: 25,
    leak: 2,
    regeneration: 3,
    resistances: { electric: 0.5 },
    slowResistance: 0.25,
    color: '#22b8a5',
    appearance: {
        ...BASE_ENEMY.appearance,
        sprite: { type: 'robot', shape: 'armored' },
        scale: 0.85,
    },
},
```

Then reference `kind: 'reefGuard'` in a group in `waves.ts`. The enemy guide and lobby counts update automatically. Reuse an existing robot shape, add a shape in `robotArtwork.ts`, or attach a sprite sheet as shown below. The roster and campaign are tuned for a 50-wave siege; new definitions still need playtesting.

## Add a friendly Delfoter

Add an entry inside `definitions` in `towers.ts`:

```ts
reefRanger: {
    ...BASE_TOWER,
    name: 'Pebble · Reef Ranger',
    role: 'Splash + armor piercing',
    description: 'A precise little defender with a powerful water blaster.',
    cost: 180,
    color: '#fb923c',
    stats: {
        ...BASE_TOWER.stats,
        damage: 35,
        range: 190,
        cooldown: 1,
        splash: 45,
        armorPierce: 0.5,
    },
    appearance: {
        ...BASE_TOWER.appearance,
        sprite: { type: 'defender', equipment: 'blaster' },
    },
    audio: { fire: 'soaker' },
    projectile: { ...BASE_TOWER.projectile, width: 6 },
    upgrades: [
        { name: 'Precision nozzle', cost: 100, stats: { armorPierce: 1, damage: 50 } },
    ],
},
```

The shop discovers the new entry. Upgrades apply their partial stats in order, including changes to slowing, splash and armor piercing. There is no fixed upgrade count. Reusable equipment visuals are `squirt`, `blaster`, and `rifle`; artwork selection is independent of combat behavior and character ID.

## Attach artwork and animation

Both sides share `CharacterAppearance` in `appearance.ts`: sprite, scale, portrait framing, bob/sway/hover animation, shadow size, and health-bar layout. Built-in robot shapes and equipment work in both canvas and SVG portraits. Robot `color` controls the body tint; individual artwork parts can retain their own highlights.

For custom images, put a PNG, WebP or SVG sheet under `apps/brilliant-view-admin/public/` and set `appearance.sprite`:

```ts
sprite: {
    type: 'image',
    src: '/delfoter-td/example-robot.svg',
    frameWidth: 128,
    frameHeight: 128,
    frames: 2,
    fps: 4,
    width: 100,
    height: 100,
},
```

The included example has two horizontal frames and is not added to the roster. Frames must be equal-sized, in one horizontal row, with positive dimensions and frame count. Use `frames: 1` and `fps: 0` for a static image. `width` and `height` are display dimensions before appearance scale. Portraits show the first frame. For oversized artwork, also set `portraitViewBox`, for example `'-60 -60 120 120'`. Images load once per URL; failed or incorrectly sized assets show a placeholder on the battlefield.

Layered defender weapons optionally use `sprite.bodySrc` and `sprite.weapon` alongside the complete portrait `src`. Both layers use the same frame dimensions. Configure `weapon.src`, `pivot` (the hand position in source-frame pixels), `muzzle` (barrel tip in source-frame pixels), `recoil` (display units before appearance scale), `recoilDuration` (seconds) and `effect` (`water`, `snow` or `rocket`). Finn, Mira, Bjørn and Astrid use separate SVG body/weapon layers. `weaponAim.ts` shares geometry between engine projectile origins and canvas weapon rendering; it aims around the hand and keeps left-facing equipment upright. Pip, Mochi and Skipper share calibrated mouth/barrel positions for their procedural artwork. Tower firing timestamps drive recoil and muzzle effects, including rockets.

## Combat properties

-   `onDeath` can release a configured payload: `{ spawns: [{ kind: 'drone', count: 6 }], spacing: 12, burst: { color: '#e9ae67', radius: 65 } }`. Crew inherit the current wave's health scaling and start at or behind the carrier's last position. Release happens after the killing volley, so its splash cannot hit the newly released crew. Escaping carriers deal leak damage and do not release cargo. Registry payload IDs are checked against the actual enemy registry.
-   The Norwegian sjark **MS Skranglefjord** carries six Rustbytes, four Skitters, and two Ironflukes. It has 1,600 base HP, eight armor, and first appears in wave six (then nine and twelve, and in later convoys). Its artwork uses the same configurable sprite-sheet pipeline as any other character.

-   Enemy `health`, `armor`, `speed`, `regeneration`, `reward` and `leak` configure its basic behavior. Optional `shield` defaults to zero.
-   `resistances` are fractions per damage type (`water`, `ice`, `electric`): 0 means no reduction and 1 means immunity. Unspecified types have no resistance.
-   Defender `armorPierce` is a fraction: 0 respects armor, 0.5 ignores half, and 1 ignores all armor. Armor subtracts flat damage, with a minimum of one damage **before** resistance. Shields absorb the resulting damage before health.
-   `splash` is a radius in map units; zero means single-target. Every affected robot applies its own defenses.
-   `slow` is a fraction and `slowDuration` is in seconds. Enemy `slowResistance` reduces the slow's strength. Each tower refreshes its own timed effect; ordinary slows use the strongest active effect. Opt-in `slowStackFactor`, `slowStackCap` and `slowMaxStacks` combine the strongest distinct sources with diminishing returns. Each source expires independently, so a weaker shot cannot prolong another tower's stronger slow.
-   `combat.ts` implements movement, regeneration, shields, resistance, damage and slowing without character-ID checks. A genuinely new mechanic belongs here once, then definitions can reuse it.
-   Tower `audio.fire` and enemy `audio.death`/`audio.leak` select existing cues from `audio.ts`. New sound synthesis belongs in that module; it does not require engine changes.
-   `projectile` controls water-trail color, core color, width and splash-particle color independently of the character sprite.

## Other modules

-   `engine.ts`: simulation, spawning, economy and free placement. Selling returns 80% of all invested shells immediately; the narrow recruit dock stays visible, while `TowerInspector.tsx` opens upgrades and selling over the map. `projectiles.ts` owns shared damage resolution and homing rockets. Rockets carry a snapshot of their attack stats and continue after their launcher is sold. The `placeTower` helper uses a map's suggested positions for campaign simulations; players use `deployTower` with arbitrary clear-ground coordinates.
-   `maps.ts`: 1100 × 650 maps, with explicit dimensions and lighthouse positions. Roads have space for two rows of defenders. Scenery is authored in a normalized 900 × 520 space and scaled into the map cache; placement, combat, drawing and pointer conversion use actual map coordinates. Placement reserves space around paths, towers, map edges, and the lighthouse.
-   `waves.ts`: enemy groups, spawn intervals and campaign waves. The first twelve waves are authored introductions; waves 13–50 are deterministic escalating mixes, with sjark convoys, boss duels every five rounds, spaced armor columns, runner streams, swarm bursts and carrier convoys. Upcoming wave names, formations and counter advice are hidden; wave names appear only once a wave starts. `difficulty.ts` controls compound HP growth, speed, armor and wave-clear bonuses. Shields inherit HP scaling. Formation profiles control extra health, speed and kill rewards: swarm kills pay less, scarce heavy targets pay more. The first five waves retain their opening balance.
-   `Battlefield.tsx`: high-DPI canvas, pointer coordinate conversion and keyboard placement. The canvas backing store follows its measured size and device pixel ratio. `arenaLayout` fits the map proportionally between the compact HUD, wave controls and 184px recruit dock; rendering and pointer conversion share that layout.
-   `canvasRenderer.ts`, `canvasScenery.ts`: frame rendering, cached scenery and effects.
-   `characterRenderer.ts`, `canvasCharacters.ts`, `robotArtwork.ts`, `Delfoter.tsx`: shared visual dispatch, procedural characters, image caching and portraits.
-   `useTowerDefense.ts`: simulation lifetime, visibility, pause, speed and sound. Hidden tabs do not catch up elapsed time.
-   `DelfoterTDPage.tsx`, `TowerShop.tsx`, `TowerInspector.tsx`, `GameMenu.tsx`, `arena.css`: game shell and accessible HTML controls over the canvas. Purchase previews are charged only after valid placement. Menus suspend simulation. The defender workshop is temporary and nonmodal: select a tower to open it, then close it with its button, Escape, or a click on clear ground. Ocean-blue and moonlit map palettes flow through CSS variables into the HUD, dock, workshop and menus.
-   `arcade.css`: lobby and shared portrait styles.

Run the admin `test` and `typecheck` scripts after content or combat changes. Campaign benchmarks check that legacy sniper-heavy armies cannot coast through the endgame. A 12,650-shell mixed army clears the isolated wave-30 introduction on both maps without losing lives. These are targeted checks, not proof that every wave or full campaign route is balanced; human playtesting still matters.

## Premium defenders and progression

-   **Bjørn · Big Spritz** costs 650 shells. Its pressure cannon hits crowds and has three upgrades (500 / 1100 / 2100), ending in a fast North Sea monsoon.
-   **Astrid · Aqua-RPG** costs 1200 shells. Its homing water warheads apply damage on impact, with upgrades costing 900 / 1800 / 3200. `projectile.mode: 'rocket'` and `projectile.speed` select travelling rockets; omitted mode keeps immediate water streams.
-   **DelfIver · Epoq courier** arrives in wave eight. The clearly marked nicotine-free, 0 mg Epoq tin is a shield; its slow resistance makes it a priority target.
-   The original cheap-tower strategy is intentionally insufficient for the late campaign. The cheap-tower strategy loses before wave 35. After the sniper rebalance, the legacy mixed-defense benchmark fails in the later chapters; this is tracked as a difficulty benchmark, not a proof of full-campaign winnability.

## Formation rebalance

`FORMATIONS` in `waves.ts` configures health, speed, reward multipliers and internal formation descriptions. The game does not show formation hints to the player. Spaced columns use 2.8–3.8 second intervals; boss duels separate bosses by 12 seconds. Swarms still arrive in tight bursts, with explicit `Group.pause` breaks between packs. `difficulty.ts` applies additional midgame pressure beginning after wave six.

Premium splash is no longer full damage everywhere: `stats.splashEdgeDamage` is the fraction dealt at the radius edge (default 1). Damage falls off linearly from the direct hit; Big Spritz uses 0.4, Aqua-RPG uses 0.5. Big Spritz's maximum direct DPS is reduced from 1400 to 560, and Aqua-RPG's from about 2526 to 1250. Reef Sniper's top upgrade now deals 480 damage every 1.6 seconds and costs 360 shells, making it a cost-efficient counter to individually spaced armored targets. Bosses and carriers resist slowing, so cheap permanent slows cannot hold them in the spawn area.

## Reduced income and robot sjarks

`income.ts` applies an 80% multiplier to kill rewards and wave-clear bonuses. Fractional shells carry between payouts, keeping the overall reduction at 20% instead of rounding every small kill down independently. Starting money and the 80% selling refund are not taxed.

Both sjarks use configurable `targetPriority: 1`. A default tower first filters enemies by range, then prioritizes these threatening carriers before ordinary runners; priority ties retain furthest-along-path targeting. Towers with `targeting: 'fastest'` instead choose the fastest current movement speed (including slows), ignoring carrier taunts; progress breaks speed ties. Runner and convoy waves lead with carriers, then send faster enemies while the boats draw fire. Later waves can lead with two ordinary sjarks.

**MS Nattmørke · Reaper Sjark** first appears on wave 30, returns with two hulls on waves 40 and 50, and has 4,200 base HP, 28 armor, a 300-point shield, 90% slow resistance and 15 reef damage if it escapes. Its larger black-and-silver sprite has red eyes. Breaking its hull releases exactly 30 enemies: eight Rustbytes, eight Skitters, six Ironflukes, four Patchworks and four DelfIvers. Its `durabilityScaling: 0.18` softens hull and shield growth to `1 + (waveHealth - 1) × 0.18`: on wave 30, approximately 41,991 HP and 2,999 shield. Cargo retains current-wave scaling, with `onDeath.durabilityMultiplier: 0.45` applied to its HP and shields. Crew count, armor and movement are preserved. Wave 30 has just 12 skitters and four DelfIvers, beginning ten seconds after the hull appears; they are spaced at 0.65s and 1.3s. Waves 40 and 50 retain their larger escorts and two hulls.

## Runner counters and selling

-   **Finn · Riptide Repeater** costs exactly 500 shells, deals 24 damage per water bullet, fires every 0.1 seconds and starts with 300 range. Upgrades are Pressurized drum (250, 44 damage), Horizon sight (450, 600 range, 64 damage) and Fjord-wide coverage (850, 700 range, 88 damage every 0.075 seconds). Its `pellet` projectile mode draws rapid water droplets; hits resolve immediately. Short, quieter sound cues keep the stream of bullets from overwhelming other sounds.
-   **Mira · Frost Mist** costs 400 shells and deals only five base damage. Its splash strips 80 shield points before ordinary damage and slows by 50%, bypassing half of slow resistance. Its three upgrades cost 250 / 500 / 750, improving shield stripping, range and slows. Its `snow` projectile draws spinning snowflakes, temporary ice on the ground, and frost crystals on chilled robots, with a dedicated synthesized freeze sound. Ground ice is cosmetic; the slow follows the robot. Up to three distinct Miras contribute their resistance-adjusted slows at 100%, 25% and 6.25% strength, capped at 75% combined slow. One Mira cannot stack her own shots. Expiration is tracked per source. It is support for the repeater and other damage dealers.
-   Both new defenders use `targeting: 'fastest'`, so sjarks do not distract them from runners. `targeting.ts` owns this reusable policy; no targeting code names a specific character.
-   `stats.shieldDamage` removes only shield points and never spills excess into hull HP. `stats.slowPierce` is the fraction of slow resistance bypassed. Both default to zero, preserving existing attackers.
-   Selling refunds **80% of purchase plus every upgrade**, rounded down once. It is not reduced by the earned-income multiplier; a fully upgraded repeater has 2050 shells invested and sells for 1640.

### Upgrade information

`TowerUpgrades.tsx` presents every upgrade in the selected tower's workshop, with the next stage expanded. `upgradeDetails.ts` generates exact before/after values from cumulative stats for damage, range, firing interval, splash, slow strength/duration, armor piercing, shield stripping and slow resistance piercing. New towers automatically share this panel. Slow strength is explicitly shown before enemy resistance is applied.
