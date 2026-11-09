# ELYSIA NO DENSETSU – API & REALTIME PROTOCOL DOCUMENTATION
## REST Endpoints & WebSocket Event Specification

### Base URL: `http://localhost:4000/api/v1`
### WebSocket Gateway: `ws://localhost:4000`
### Document Version: 1.0.0

---

## 1. Authentication Endpoints

### 1.1 Register Account
- **Endpoint:** `POST /api/v1/auth/register`
- **Description:** Registers a new player account.
- **Request Body:**
  ```json
  {
    "username": "adventurer01",
    "email": "player@elysia.com",
    "password": "securePassword123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "account": {
        "id": "acc_a81f3...",
        "username": "adventurer01",
        "email": "player@elysia.com",
        "role": "player"
      }
    }
  }
  ```

### 1.2 Login Account
- **Endpoint:** `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  {
    "username": "player",
    "password": "player123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "account": { "id": "acc_002", "username": "player", "role": "player" }
    }
  }
  ```

---

## 2. Character Endpoints

### 2.1 List Account Characters
- **Endpoint:** `GET /api/v1/characters`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "char_001",
        "name": "Airi_Kurogane",
        "classId": "novice",
        "gender": "female",
        "level": 1,
        "regionId": "VIL_STARTER",
        "currentHp": 100,
        "maxHp": 100
      }
    ]
  }
  ```

### 2.2 Create Character
- **Endpoint:** `POST /api/v1/characters`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "Ren_Kurogane",
    "classId": "novice",
    "gender": "male",
    "appearance": {
      "hairStyle": 1,
      "hairColor": "#3b82f6",
      "skinTone": "#fde047"
    },
    "stats": {
      "str": 10,
      "agi": 10,
      "vit": 10,
      "int": 10,
      "dex": 10,
      "luk": 10
    }
  }
  ```
- **Response (201 Created):** Returns the newly created `CharacterEntity`.

---

## 3. World & Content Endpoints

| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/health` | Service health status, uptime, and database latency. | No |
| `GET` | `/api/v1/game/regions` | Complete list of all 5 world regions and boundaries. | No |
| `GET` | `/api/v1/game/monsters` | All 32 frontier monsters with base and combat stats. | No |
| `GET` | `/api/v1/game/spawns` | All 33 monster spawn points across the 4 frontiers. | No |
| `GET` | `/api/v1/game/npcs` | All 13 world NPCs with coordinates and roles. | No |
| `GET` | `/api/v1/game/quests` | All 15 beginner quests (Lv.1 to 15). | No |
| `GET` | `/api/v1/game/classes` | All 8 character classes with base stats & job tiers. | No |

---

## 4. Admin Management Endpoints

All admin endpoints require `Authorization: Bearer <admin_token>`.

- `GET /api/v1/admin/dashboard` – Real-time counts of accounts, characters, items, and active players.
- `GET /api/v1/admin/items?page=1&limit=20` – Paginated list of catalog items.
- `POST /api/v1/admin/items` – Create a new equipment or consumable item.
- `PUT /api/v1/admin/items/:id` – Modify an existing item's stats or properties.
- `DELETE /api/v1/admin/items/:id` – Remove an item from the game catalog.

---

## 5. Socket.IO Realtime Gateway Specification

Connected clients communicate over WebSockets with standard JSON events:

### 5.1 Client -> Server Events

| Event Name | Payload Structure | Description |
|---|---|---|
| `player:join` | `{ characterId, name, classId, gender, level, regionId, x, y }` | Joins a region room and spawns character in world. |
| `player:move` | `{ x, y, animState, direction }` | Broadcasts continuous movement coordinates (20Hz). |
| `player:combat_action` | `{ actionType, skillId, targetId, x, y }` | Casts an attack or skill towards a target location. |
| `player:change_region` | `{ targetRegionId, spawnX, spawnY }` | Requests transfer to an adjacent region via portal. |
| `chat:message` | `{ channel: 'global'\|'region'\|'party', message }` | Dispatches in-game chat to target channel. |

### 5.2 Server -> Client Events

| Event Name | Payload Structure | Description |
|---|---|---|
| `world:players` | `Array<PlayerState>` | List of all players already present in the entered region. |
| `player:joined` | `PlayerState` | Broadcast to others when a new player enters the region. |
| `player:moved` | `{ socketId, characterId, x, y, animState, direction }` | Updates remote player position and animation state. |
| `player:left` | `{ socketId, characterId }` | Emitted when a player leaves the region or disconnects. |
| `player:performed_action` | `{ socketId, characterId, actionType, skillId, targetId }` | Plays remote player skill VFX and animation recoil. |
| `chat:broadcast` | `{ sender, channel, message, timestamp }` | Pushes incoming chat message to HUD chat window. |
| `combat:damage_applied` | `{ targetId, damage, isCrit, hpRemaining }` | Syncs damage dealt and monster HP across all clients. |
