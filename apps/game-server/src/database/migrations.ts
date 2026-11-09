import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { JsonStore } from './jsonStore.js';
import { ENV } from '../config/env.js';
import { INITIAL_CLASSES } from '@elysia/game-data-schema';

export async function runMigrationsAndSeeds() {
  const store = JsonStore.getInstance();

  // 1. Seed Default Admin
  const adminExists = store.users.find((u) => u.username === 'admin');
  if (!adminExists) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    store.users.push({
      id: 'USR_ADMIN_001',
      username: 'admin',
      email: 'admin@elysiandensetsu.com',
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    console.log('[Migration] Created default admin account: admin / admin123');
  }

  // 2. Seed Default Test Player
  const playerExists = store.users.find((u) => u.username === 'player');
  if (!playerExists) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('player123', salt);
    store.users.push({
      id: 'USR_PLAYER_001',
      username: 'player',
      email: 'player@elysiandensetsu.com',
      passwordHash,
      role: 'player',
      createdAt: new Date().toISOString(),
    });
  }

  // 3. Seed World Items from world data if items store is empty
  const worldItemsFile = path.join(ENV.WORLD_DATA_PATH, 'items/world_items.json');
  if (store.items.length === 0 && fs.existsSync(worldItemsFile)) {
    try {
      const worldItems = JSON.parse(fs.readFileSync(worldItemsFile, 'utf-8'));
      for (const item of worldItems) {
        store.items.push({
          ...item,
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      console.log(`[Migration] Seeded ${worldItems.length} items from world data`);
    } catch (err) {
      console.error('[Migration] Failed to seed world items:', err);
    }
  }

  // 4. Seed Default Character if none exists
  if (store.characters.length === 0) {
    const noviceClass = INITIAL_CLASSES[0];
    store.characters.push({
      id: 'CHAR_DEFAULT_001',
      userId: 'USR_PLAYER_001',
      name: 'Airi_Kurogane',
      gender: 'female',
      classId: 'novice',
      level: 1,
      exp: 0,
      gold: 500,
      baseStats: { str: 10, dex: 10, agi: 10, int: 10, con: 10 },
      attributes: { str: 12, dex: 11, agi: 11, int: 10, con: 12 },
      appearance: {
        gender: 'female',
        hairstyleId: 'f_long',
        hairColor: '#1a1a24',
        eyeColor: '#2563eb',
      },
      equipment: {
        mainHand: 'ITEM_SWORD_WOODEN_NOVICE',
      },
      inventory: [
        { slotId: 0, itemId: 'ITEM_POTION_HP_SMALL', quantity: 5 },
      ],
      regionId: 'VIL_STARTER',
      x: 1000,
      y: 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('[Migration] Seeded starter character Airi_Kurogane');
  }

  store.save();
}
