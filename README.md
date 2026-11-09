# ELYSIA NO DENSETSU – ELYSIA FRONTIER
### 2D Browser Japanese Fantasy Anime MMORPG

[![Version](https://img.shields.io/badge/version-1.0.0-gold.svg)](https://github.com/elysia-frontier/elysia-no-densetsu)
[![Engine](https://img.shields.io/badge/engine-Phaser_3_%2B_Three.js-blue.svg)](https://phaser.io/)
[![Runtime](https://img.shields.io/badge/runtime-Node.js_20_%7C_TypeScript_5.7-green.svg)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

**ELYSIA NO DENSETSU (Elysia Frontier)** is a production-ready, high-fidelity 2D browser MMORPG crafted in the Japanese Chibi Anime aesthetic. Featuring real-time multiplayer networking, client-side predictive motion with server-authoritative validation, 8 distinct classes with 2-tier job advancements, hybrid canvas/WebGL VFX rendering, data-driven world generation, and an enterprise game master administration dashboard.

---

## 🌟 Key Features

- **High-Fidelity Anime Presentation:** Standardized 256×256 chibi character sprites, multi-layered paperdoll equipment rendering, and custom Three.js GPU particle VFX.
- **Data-Driven Architecture:** Entire world layout, monsters, spawn distributions, loot drop tables, quests, dialogues, and items are modular JSON datasets validated by schema.
- **Server-Authoritative Realtime Networking:** Node.js + TypeScript Express REST API paired with Socket.IO real-time state synchronization (player movement, combat actions, region transitions, chat channels).
- **8 Distinct Character Classes:** Novice, Swordsman, Mage, Archer, Acolyte, Thief, Knight, and Wizard with specialized skill trees and stat scaling.
- **Master In-Game HUD:** Anime fantasy UI with HP/MP/EXP status orbs, 10-skill combo hotbar, 3 quick consumable slots, real-time minimap with coordinate telemetry, dynamic combat damage numbers, and floating announcements.
- **Game Master Administration Suite:** React + Vite admin dashboard featuring character inspection, real-time item catalog manager, Novice Character Studio, Skill VFX Sandbox, and live player telemetry.

---

## 🏗️ Repository Architecture

This repository is organized as a high-performance **pnpm monorepo**:

```text
ELYSIA NO DENSETSU/
├── apps/
│   ├── game-client/       # HTML5 Phaser 3 + Three.js Game Client (Port 3000)
│   ├── game-admin/        # React + TypeScript GM & Content Studio (Port 3001)
│   └── game-server/       # Express + Socket.IO Authoritative Engine (Port 4000)
├── packages/
│   ├── game-types/        # Canonical TypeScript definitions & interfaces
│   ├── game-data-schema/  # Default classes, starter skills, stat progression rules
│   ├── validation/        # Character naming & stat allocation validators
│   ├── vfx-engine/        # Modular Three.js VFX particle runtime & registries
│   ├── api-contracts/     # REST and WebSocket communication schemas
│   └── shared-utils/      # Combat power math, gold formatters, combat formulas
├── data/                  # Persistent database storage (JSON store & seeds)
└── docs/                  # Architecture & operational guides
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js:** `>= 18.0.0` (LTS recommended)
- **pnpm:** `>= 9.0.0`
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/elysia-frontier/elysia-no-densetsu.git
cd "ELYSIA NO DENSETSU"

# Install all workspace dependencies
pnpm install

# Approve build scripts (if prompted by pnpm for esbuild)
pnpm approve-builds --all

# Build shared packages
pnpm build:packages
```

### Running Development Servers

```bash
# Terminal 1: Start Backend Game Server (Port 4000)
pnpm --filter @elysia/game-server dev

# Terminal 2: Start Game Client (Port 3000)
pnpm --filter @elysia/game-client dev

# Terminal 3: Start Admin & GM Dashboard (Port 3001)
pnpm --filter @elysia/game-admin dev
```

Visit the applications in your browser:
- **Game Client:** [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard:** [http://localhost:3001](http://localhost:3001) (Default credentials: `admin` / `admin123`)
- **Backend API Health:** [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

---

## 🎮 Default Controls & Hotkeys

| Action | Primary Key | Secondary Key |
|---|---|---|
| **Movement** | `W`, `A`, `S`, `D` | Arrow Keys (`↑`, `←`, `↓`, `→`) |
| **Sprint / Run** | Hold `Shift` | - |
| **Normal Attack** | `J` | HUD Attack Icon |
| **Primary Skills** | `1`, `2`, `3`, `4`, `5` | Skill Slots 1–5 |
| **Secondary Skills**| `Q`, `W`, `E`, `R` | Skill Slots 6–9 |
| **Ultimate Skill** | `SPACE` / `F` | Ultimate Hotbar Slot |
| **Inventory / Character** | `I` / `C` | HUD Top Menu |
| **World Map** | `M` | HUD Map Button |
| **Quick Potions** | `Z` (HP), `X` (MP), `C` (Buff) | Consumable Slots |
| **Hurt / Death Debug** | `H` (Hurt), `K` (Death/Revive)| - |

---

## 📚 Complete Project Documentation

- [ARCHITECTURE.md](file:///d:/Build/ELYSIA%20NO%20DENSETSU/ARCHITECTURE.md) – Monorepo design, data flow, and networking topology.
- [GAME_DESIGN_DOCUMENT.md](file:///d:/Build/ELYSIA%20NO%20DENSETSU/GAME_DESIGN_DOCUMENT.md) – Game mechanics, class balance, monster progression, and world lore.
- [DATABASE_SCHEMA.md](file:///d:/Build/ELYSIA%20NO%20DENSETSU/DATABASE_SCHEMA.md) – JSON & SQL data models, entity relationships, and schemas.
- [API_DOCUMENTATION.md](file:///d:/Build/ELYSIA%20NO%20DENSETSU/API_DOCUMENTATION.md) – Complete REST and Socket.IO real-time event specification.
- [ASSET_GUIDELINES.md](file:///d:/Build/ELYSIA%20NO%20DENSETSU/ASSET_GUIDELINES.md) – 2D Chibi anime sprite standard, canvas pivots, and VFX pipelines.
- [ADMIN_GUIDE.md](file:///d:/Build/ELYSIA%20NO%20DENSETSU/ADMIN_GUIDE.md) – GM controls, item management, and server administration.
- [DEPLOYMENT_GUIDE.md](file:///d:/Build/ELYSIA%20NO%20DENSETSU/DEPLOYMENT_GUIDE.md) – Production builds, Docker containers, and cloud deployment.
- [DEVELOPMENT_ROADMAP.md](file:///d:/Build/ELYSIA%20NO%20DENSETSU/DEVELOPMENT_ROADMAP.md) – Milestone progress and roadmap phases.
- [CHANGELOG.md](file:///d:/Build/ELYSIA%20NO%20DENSETSU/CHANGELOG.md) – Version history and deliverable notes.
- [TEST_REPORT.md](file:///d:/Build/ELYSIA%20NO%20DENSETSU/TEST_REPORT.md) – Verification outputs, coverage, and API benchmarks.
- [IMPLEMENTATION_STATUS.md](file:///d:/Build/ELYSIA%20NO%20DENSETSU/IMPLEMENTATION_STATUS.md) – Module completion matrix.

---

## 📜 License & Copyright

Copyright © 2026 ELYSIA NO DENSETSU Production Committee. All rights reserved.
Developed with passion by the Advanced Game Architecture Team.
