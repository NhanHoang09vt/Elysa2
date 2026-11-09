# GLOBAL ART DIRECTION & VISUAL CONSISTENCY STYLE BIBLE
## "ELYSIA FRONTIER: MIỀN MỘNG" – MASTER PRODUCTION STANDARD

### Document Version: 1.0.0
### Scope: Studio-Wide Art Direction, 3D Assets, Animation, VFX & UI/UX

---

## 🌟 MASTER VISUAL COHESION LINEUP & STYLE BIBLE SHEET

![Elysia Frontier Master Visual Cohesion Lineup Sheet](file:///C:/Users/ACER/.gemini/antigravity/brain/a9b0653d-840b-4447-b166-aa0837272ada/elysia_art_direction_lineup_1794238682030.jpg)

---

## 1. THE ART MANIFESTO: UNIFIED VISUAL IDENTITY

The visual core of **ELYSIA FRONTIER** harmonizes three distinct pillars into one single, cohesive aesthetic:

$$\mathbf{Unified\ Visual\ Identity} = \mathbf{Anime\ Chibi\ Fantasy} + \mathbf{Classic\ Asian\ MMORPG} + \mathbf{2.5D\ Isometric\ Stylized\ 3D}$$

```
                           [ UNIFIED ART IDENTITY ]
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
  [ ANIME CHIBI ]             [ CLASSIC ASIAN ]            [ 2.5D ISOMETRIC ]
  - 2.8 Heads Proportions     - Timber & Terracotta        - Fixed 45° / 30° Camera
  - Large expressive eyes     - Flowing silk & linen       - Ground readability
  - Chunky stylized shapes    - Soft lanterns & tea houses - Anti-occlusion cutouts
```

Every character, NPC, monster, boss, building, weapon, VFX particle, and UI element must look like it was conceived by the same lead artist and crafted for the same fantasy world.

---

## 2. THE 10 INVIOLABLE VISUAL CONSISTENCY RULES

Every asset created for this project must pass all 10 consistency checks prior to approval:

### Rule 1: Canonical Chibi Proportions for All Humanoid Characters
- **The Standard:** All playable classes (Novice, Swordsman, Mage, Archer, etc.) strictly use the **2.8-Head height ratio** (Head: $1.0\text{H}$, Torso: $0.9\text{H}$, Legs: $0.9\text{H}$).
- **Prohibited:** Realistic anatomy (7–8 heads tall), bobblehead extremes ($1.5\text{H}$ or $4.0\text{H}$), or stretched limb variations.

### Rule 2: Unified NPC Styling & Scale Matching
- **The Standard:** Village elders, shopkeepers, maidens, and guards share the exact same 2.8-head chibi proportions, facial geometry structure, and stylized shading as player characters.
- **Prohibited:** Realistic quest-givers standing next to chibi heroes; hyper-exaggerated comedic caricatures.

### Rule 3: Stylized Fantasy Monster Ecology
- **The Standard:** Monsters (Slimes, Boars, Thorn Wolves, Bats) must feel native to the world. They feature chunky readable silhouettes, vibrant colors, expressive eyes, and soft cel-shaded lighting.
- **Prohibited:** Photorealistic blood/gore, horror-movie textures, or flat pixel-art retro sprites.

### Rule 4: Boss Hierarchy with Visual Cohesion
- **The Standard:** Elite dungeon bosses and world raid bosses (e.g., *Hắc Long Ma Vương / Dark Dragon*) scale in physical size ($2.0\times\text{ to }3.5\times$) and detail density, but retain the stylized hand-painted textures, chunky anatomy, and anime silhouette balance.
- **Prohibited:** Introducing dark-fantasy hyper-realistic monsters that clash with the village aesthetic.

### Rule 5: Unified Materiality Across Terrain, Architecture & Nature
- **The Standard:** Wood, stone, cloth, and foliage across all 10 zones share identical surface treatment: hand-painted diffuse texturing with baked ambient occlusion, subtle edge highlights, and zero noisy high-frequency photo grain.
- **Prohibited:** Mixing photorealistic PBR scanned textures with hand-painted stylized assets.

### Rule 6: Global Directional Lighting & Shadow Angle
- **The Standard:** Sunlight is consistently cast from **Top-Left at $45.0^\circ$ Azimuth, $50.0^\circ$ Elevation** with a warm color temperature ($5200\text{–}5500\text{K}$). Shadows are soft, directional, and tinted in ambient slate-blue (`#2c394b`).
- **Prohibited:** Mismatched shadow orientations where buildings cast shadows to the east while characters cast shadows to the south.

### Rule 7: Strict World Metric Scale & Bounding Volumes
- **The Standard:** 
  - Standard Humanoid Height: Exactly $1.6\text{m}$ in world space ($2.8\text{H}$ chibi scale).
  - Standard Building Doorway: $2.4\text{m}$ height $\times$ $1.4\text{m}$ width.
  - Standard Road Width: $3.0\text{m}\text{ to }4.0\text{m}$ (allowing two mounted players to pass comfortably).
- **Prohibited:** Buildings where doors are smaller than the character's head, or props with inconsistent physical scale.

### Rule 8: High Isometric Silhouette Readability for Equipment
- **The Standard:** Weapons and armor must be legible from a camera distance of $18\text{–}25\text{m}$. Silhouettes feature exaggerated primary blade curves, distinct shoulder pauldrons, and recognizable material contrasts.
- **Prohibited:** Microscopic engravings, thin wireframes, or low-contrast equipment invisible from the gameplay camera.

### Rule 9: 1:1 UI Illustration & In-Game World Alignment
- **The Standard:** 2D portraits, inventory icon art, and world maps must directly reflect the in-game 3D models. When Tada equips the *Oak Buckler*, the inventory icon displays the exact same circular wood grain and brass rivets.
- **Prohibited:** Generic stock fantasy icons, photorealistic UI thumbnails, or flat modern minimalist vector symbols.

### Rule 10: Single Universe Cohesion (The "Elysia DNA" Rule)
- **The Standard:** Every asset must feel like it belongs to the fantasy continent of Elysia. Even dangerous volcanic dungeons share the same stylized hand-painted stone fractures and lighting treatment as the tranquil Beginner Village.
- **Prohibited:** Sci-fi elements, modern military gear, or incompatible artistic crossovers.

---

## 3. MASTER PROPORTIONS & ENTITY LINEUP SPECIFICATION

```
Height Scale:
3.5m ──────────────────────────────────────────────────────── World Boss (Dark Dragon)
3.0m ──────────────────────────────────────────────────────── [2.2x Scale Hero]
2.5m ──────────────────────────────────────────────────────── Minotaur / Elite Brute
2.0m ──────────────────────────────────────────────────────── Mounted Player / Large Steed
1.6m ─────────────────────────────────── Player Hero / NPC ── [1.0x Scale Standard - 2.8 Heads]
1.0m ──────────────── Small Critter / Slime
0.0m ════════════════════════════════════════════════════════ Ground Plane
```

### 3.1 Head-to-Body Breakdown (Humanoids: 1.6m Height)

| Anatomical Segment | Relative Height | Metric Height | Key Artistic Guidance |
|---|---|---|---|
| **Head & Hair** | $1.00\text{H}$ ($35.7\%$) | $0.57\text{m}$ | Large expressive eyes ($32\%$ of face), pointed fantasy/half-elf ears, spiky chunky hair clumps. |
| **Torso & Pelvis** | $0.90\text{H}$ ($32.1\%$) | $0.51\text{m}$ | Compact chest with wide shoulders ($1.25\times$ head width); high waistline with broad utility belt. |
| **Legs & Boots** | $0.90\text{H}$ ($32.1\%$) | $0.51\text{m}$ | Chunky thighs, tapering to oversized folded-cuff traveler boots ($0.38\text{m}$ foot length for ground stability). |

---

## 4. MASTER COLOR PALETTE & MATERIAL PALETTE HIERARCHY

The game’s color philosophy balances **pastoral natural tones with rich anime fantasy accents**:

```
[ PRIMARY NATURE & CIVILIZATION ]
█ Forest Emerald    #2D7A4B  (Hero Tunics, Foliage, Moss)
█ Toasted Almond    #DFD3B8  (Linen Linings, Paper Lanterns, Plaster Walls)
█ Saddle Leather    #6F4325  (Belts, Boots, Scabbards, Furniture)
█ Weathered Cedar   #4A3324  (Timber Posts, Roof Trusses, Waterwheel)
█ Terracotta Red    #B34A36  (Curved Roof Tiles, Merchant Canopies)
█ River Cobble      #8F9AA6  (Stone Bridges, Masonry Walls, Pavements)

[ ACCENTS & NOBILITY ]
█ Celestial Gold    #F5D061  (Hair Highlights, Brass Buckles, Lantern Glow)
█ Antique Brass     #D8A83D  (Shield Bosses, Sword Guards, Metal Rivets)
█ Refined Steel     #CAD5E2  (Weapon Blades, Armor Plates, Tools)
█ Lotus Blossom     #F472B6  (Canal Lilies, Peach Tree Blossoms)
█ River Cyan        #38BDF8  (Canal Water, Shallow Shallows, Healing Magic)
```

---

## 5. CAMERA MATHEMATICS & 2.5D ISOMETRIC PROJECTION

To ensure zero perspective distortion and visual stability:

```
                           [ CAMERA CONFIGURATION ]
  Azimuth (Horizontal Yaw)     : 45.0° (True Diagonal Screen Axis)
  Elevation (Vertical Pitch)   : 30.0° (True Dimetric / Isometric Perspective)
  Roll                         : 0.0° (Strictly Level)
  Projection Mode              : Orthographic (or Perspective with FOV = 15° at 22m Distance)
  Character Screen Footprint   : Exactly 18% to 22% of Vertical Screen Height
```

### 5.1 Anti-Occlusion Shader Protocol
- Any object categorized as `Building_Roof`, `Awning`, or `Tree_Canopy` must utilize the custom `Elysia/URP_Stylized_Cutout` shader.
- When an object intersects the camera frustum line-of-sight to the active player, an **inverse spherical dither mask** ($3.5\text{m}$ radius) fades the obstruction to $20\%$ opacity, preventing blindness during navigation.

---

## 6. UNITY 6 TECHNICAL SPECIFICATIONS

### 6.1 Geometry Budgets & LOD Policy

| Asset Category | LOD0 (Close-up / UI) | LOD1 (Gameplay Frustum) | LOD2 (Distant / Mobile) |
|---|---|---|---|
| **Player Hero (with Gear)** | $12,000\text{–}15,000$ tris | $6,000\text{–}8,000$ tris | $3,000\text{–}4,000$ tris |
| **Standard NPC** | $8,000\text{–}10,000$ tris | $4,500\text{–}6,000$ tris | $2,000\text{–}3,000$ tris |
| **Field Monster** | $4,000\text{–}7,000$ tris | $2,500\text{–}4,000$ tris | $1,200\text{–}1,800$ tris |
| **World Boss** | $25,000\text{–}35,000$ tris | $14,000\text{–}18,000$ tris | $6,000\text{–}8,000$ tris |
| **Modular Building (2x2)** | $1,200\text{–}2,500$ tris | $800\text{–}1,400$ tris | $400\text{–}600$ tris |

### 6.2 Universal Render Pipeline (URP) Shader Standards
- **Master Shading Model:** Single unified shader graph `Elysia_Stylized_Toon_URP`.
- **Lighting Model:**
  - 2-Step Cel Shadow Ramp with smoothed terminator threshold ($0.45\text{–}0.52$).
  - Screen-space warm walnut inverted hull outline (`#321f14`, $1.8\text{px}$ width).
  - Subtle fresnel rim light driven by directional sun orientation.
  - Zero specular high-frequency noise; specular is masked to stylized anisotropic bands on hair and blade edges.
