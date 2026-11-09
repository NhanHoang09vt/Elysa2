# ELYSIA NO DENSETSU – ART & ASSET PRODUCTION GUIDELINES
## Visual Standard for 2D Japanese Anime Chibi MMORPG

### Document Version: 1.0.0
### Art Direction Standard: High-Quality Japanese Anime Chibi

---

## 1. Visual Philosophy & Core Pillars

1. **Clean & High-Definition:** No low-res or blurry pixelation. All sprite assets must be rendered with clean vector-like alpha transparency at 300+ DPI.
2. **Standardized Chibi Proportions:** Characters adhere to a 1:2.2 to 1:2.5 head-to-body proportion ratio (large expressive eyes, anime hairstyles, stylized limbs).
3. **Palette & Shading Hierarchy:** Cel-shaded Japanese anime palette with primary rim lighting, ambient occluded skin shadows, and high-saturation emissive elemental VFX.

---

## 2. Character Sprite Specifications

### 2.1 Standard Canvas & Anchor Dimensions
- **Texture Canvas:** Exactly **$256 \times 256$ pixels** per frame.
- **Character Baseline Anchor (Pivot):**
  - Normalized Pivot: `(X: 0.5, Y: 0.9297)`
  - Pixel Pivot in 256x256 frame: `(X: 128px, Y: 238px)`
  - Ground Shadow Center: Exactly at `(128, 238)` with an ellipse size of `68x20px`.
  - Nameplate Anchor: Centered at `(128, 118)` (offset $-120\text{px}$ from foot pivot).

### 2.2 Standard 7-Action Animation Suite

Every character class must implement the canonical 7-action animation set:

| Action Name | Frame Count | Target Frame Rate | Loop Behavior | Key Poses |
|---|---|---|---|---|
| `idle` | 6 frames | 8 FPS | Infinite Loop | Subtle breathing, gentle hair sway, blinking on frame 4. |
| `walk` | 6 frames | 10 FPS | Infinite Loop | 8-frame rhythmic footstep cycle, swinging arms. |
| `run` | 6 frames | 12 FPS | Infinite Loop | Forward body lean ($15^\circ$), trailing hair velocity. |
| `attack` | 5 frames | 12 FPS | Play Once | Anticipation windup (F1), dynamic slash apex (F2–3), recovery (F4–5). |
| `skill` | 5 frames | 12 FPS | Play Once | Cast preparation crouch, upward thrust, magic release pulse. |
| `hurt` | 5 frames | 10 FPS | Play Once | Backward flinch, flashing white silhouette tint, recovery. |
| `death` | 6 frames | 8 FPS | Play Once (Hold) | Collapse to knees, slump to ground, ethereal spirit dissipate. |

---

## 3. Weapon & Paperdoll Layering Order

When rendering characters with modular equipment, render order must follow strict depth index layering:

```text
Layer 0 (Lowest):  Back Attachment (Cape, Wings, Quiver)
Layer 1:          Off-Hand / Shield (When facing South-East)
Layer 2:          Base Character Body & Undergarments
Layer 3:          Armor / Chestpiece / Robe
Layer 4:          Leggings / Greaves / Boots
Layer 5:          Hair & Faceplate Expression
Layer 6:          Main-Hand Weapon (Sword, Staff, Bow)
Layer 7:          Headwear (Hat, Helm, Ribbons, Horns)
Layer 8 (Top):    Weapon Glow & Elemental Particle Aura
```

---

## 4. Visual Effects (VFX) Pipeline

VFX are generated using a hybrid pipeline:
- **Sprite Animation Sheets:** $256 \times 256$ frames packed into horizontal strips (e.g., $1536 \times 256$ for 6 frames).
- **Pivot Alignment:** Each VFX has its own normalized anchor defined in `SkillVfxConfig.ts`:
  - Slashing trails: Pivot `(0.5, 0.5)` with player forward offset.
  - Pillar strikes (Lightning, Holy Smite): Pivot `(0.5, 0.95)` resting on the ground plane.
  - Projectiles (Fireball, Arrow Shot): Pivot `(0.2, 0.5)` pointing toward target trajectory.
- **Three.js Particle Systems:** Additive blending (`THREE.AdditiveBlending`), dynamic point particle counts ($50\text{–}300$ particles per burst), and GPU-driven color decay curves.

---

## 5. UI/UX Style Guide

- **Theme:** Japanese Anime Fantasy Glassmorphism.
- **Background Fill:** Deep navy glass `rgba(15, 23, 42, 0.85)` with `backdrop-filter: blur(12px)`.
- **Border Trim:** 1px gold gradient `linear-gradient(135deg, #d4af37, #92400e)` with 4px rounded corners.
- **Typography:**
  - Headers: *Cinzel*, *Trajan*, or bold *Segoe UI* (`#f8fafc`, gold text-shadow).
  - Body & Stats: *Segoe UI*, *Inter*, or *Consolas* for numeric precision.
