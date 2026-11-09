# ELYSIA NO DENSETSU – GAME MASTER & ADMIN GUIDE
## Administration Manual, GM Commands & Operations

### Document Version: 1.0.0
### Access URL: `http://localhost:3001`

---

## 1. Access & Authentication

Game Master access is protected by JSON Web Token (JWT) role-based authorization.
- **Default Super Admin:** `admin`
- **Default Password:** `admin123`
- **Role Identifier:** `'admin'`

Administrators can log in directly at the Game Admin portal (`http://localhost:3001`) or authenticate via the REST endpoint `POST /api/v1/auth/login`.

---

## 2. Admin Dashboard Modules

The Game Admin suite (`apps/game-admin`) contains 6 specialized operational consoles:

### 2.1 Live Dashboard & Telemetry
Displays real-time system metrics:
- **Active Players Online:** Monitored via Socket.IO connection rooms.
- **Registered Accounts & Characters:** Total database counts.
- **System Health:** Server uptime, memory utilization, and JSON store read/write latencies.

### 2.2 Item & Weapon Catalog Manager (`ItemManager.tsx` & `WeaponManager.tsx`)
- **Full Item Catalog:** Search, filter, and paginate through all 57 canonical items.
- **Item Creation & Modification:** Create new weapons, armors, potions, and crafting materials with customizable stats (Attack Power, Defense, Rarity, Sell Price).
- **Paperdoll Equipment Mapping:** Configure equipment attachment offsets, sprite coordinates, and visual glows.

### 2.3 Novice Character Studio (`NoviceCharacterStudio.tsx`)
- Visual real-time preview of male and female Novice character models.
- Interactive testing of all 7 character animation states: *Idle, Walk, Run, Attack, Skill, Hurt, Death*.
- Real-time adjustment of paperdoll weapon layering and anchor offsets.

### 2.4 Skill VFX Manager & Combat Sandbox (`SkillVfxManager.tsx` & `VfxCombatSandbox.tsx`)
- Interactive preview and tuning of all 24+ skill VFX particle animations.
- Dynamic color palette swapping (`VfxPaletteEditor.tsx`).
- Real-time combat dummy testing sandbox allowing GMs to simulate skill impacts, knockbacks, hit-stop durations, and floating damage numbers.

---

## 3. Game Master (GM) Commands

In-game GM commands can be executed via the client chat console (prefixed by `/`):

| Command | Arguments | Effect |
|---|---|---|
| `/heal` | None | Instantly restores character HP and MP to 100%. |
| `/levelup` | `[amount]` | Increases current character level by specified amount (default: +1). |
| `/gold` | `[amount]` | Grants specified amount of Gold to current character. |
| `/item` | `<itemId> [qty]` | Spawns specified item directly into player inventory. |
| `/warp` | `<regionId> [x] [y]` | Teleports character immediately to target region coordinates. |
| `/killall` | None | Clears all hostile monsters in current region. |
| `/announce` | `<message>` | Dispatches high-priority golden server broadcast banner to all players. |

---

## 4. Economy & Balance Tuning

1. **Drop Rate Balancing:**
   - Drop rates are defined in `apps/game-client/public/data/world/monsters/drop_tables.json`.
   - Modifying drop rates takes effect immediately upon server reload or cache refresh.
2. **Stat Scaling:**
   - Progression coefficients are centrally governed in `packages/game-data-schema/src/index.ts` and `packages/shared-utils/src/index.ts`.
