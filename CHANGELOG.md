# ELYSIA NO DENSETSU – CHANGELOG & RELEASE HISTORY

All notable changes to the Elysia no Densetsu project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-09

### Added
- **Monorepo Architecture:** Established root `pnpm-workspace.yaml` and unified build scripts across `apps/*` and `packages/*`.
- **Shared Packages Rebuilt & Validated:**
  - `@elysia/game-types`: Complete entity, weapon, class, item, and stat interfaces.
  - `@elysia/game-data-schema`: Canonical definitions for 8 classes, starter skills, and stat allocation boundaries.
  - `@elysia/validation`: Pure validators for character names and primary attribute allocation.
  - `@elysia/vfx-engine`: Three.js WebGL particle runtime, particle decay curves, and VFX registry singleton.
  - `@elysia/api-contracts`: REST and WebSocket payload contracts.
  - `@elysia/shared-utils`: Combat power calculations, formatters, and damage math.
- **Authoritative Server Engine (`@elysia/game-server`):**
  - Express + TypeScript + Socket.IO server running on port 4000.
  - Zero-dependency atomic JSON document store (`server_db.json`) with auto-running migrations.
  - Default super admin account (`admin / admin123`) and test player account (`player / player123`).
  - Seeded 57 canonical items from `world_items.json`.
  - Complete REST endpoints for health, auth, character management, world regions, monsters, spawns, NPCs, and quests.
  - Realtime WebSocket gateway managing region rooms, movement sync, action broadcasts, and chat.
- **Client Application (`@elysia/game-client`):**
  - Dual-canvas architecture: 2D Phaser 3 game world synchronized with Three.js WebGL VFX overlay.
  - Standardized 256x256 chibi character rendering with `(128, 238)` pivot anchor.
  - 7 standardized character animations (Idle, Walk, Run, Attack, Skill, Hurt, Death).
  - Master HUD with HP/MP/EXP globes, 10 skill combo hotbars, 3 potion slots, and dynamic minimap.
  - Interactive training dummies with health bars, hit-stop, knockback, and floating damage numbers.
  - Character creation and inventory management modals.
- **Admin Studio (`@elysia/game-admin`):**
  - React + Vite dashboard with live telemetry.
  - Full item catalog editor with paperdoll visualizer.
  - Novice Character Studio with animation and paperdoll layering previews.
  - Skill VFX Sandbox with particle parameter tuning and color palette editor.
- **Documentation Suite:**
  - Authored all 12 core documentation files specified in Part 21.

### Fixed
- Fixed monorepo module resolution by creating concrete `@elysia/*` packages under `packages/` with `"type": "module"`.
- Resolved esbuild execution approvals via `pnpm approve-builds --all`.
- Fixed UTF-8 BOM (`\uFEFF`) parse error in `monsters.json` by implementing automatic BOM stripping in `WorldService`.
- Terminated legacy orphaned backend process on port 4000 (PID 14588) to permit clean routing.
- Fixed TypeScript compiler errors in `@elysia/vfx-engine` regarding missing properties on `ItemEntity` and `SkillVfxConfig`.
