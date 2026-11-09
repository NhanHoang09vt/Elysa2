import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env.js';

export class WorldService {
  private cache: Record<string, any> = {};

  private readJson(relativePath: string) {
    if (this.cache[relativePath]) return this.cache[relativePath];
    const fullPath = path.join(ENV.WORLD_DATA_PATH, relativePath);
    if (!fs.existsSync(fullPath)) return [];
    try {
      let raw = fs.readFileSync(fullPath, 'utf-8');
      // Strip UTF-8 BOM if present
      raw = raw.replace(/^\uFEFF/, '');
      const data = JSON.parse(raw);
      this.cache[relativePath] = data;
      return data;
    } catch (err: any) {
      console.error(`[WorldService] Failed to parse ${relativePath}:`, err.message);
      return [];
    }
  }

  getRegions() {
    return this.readJson('regions.json');
  }

  getWorldConfig() {
    return this.readJson('world_config.json');
  }

  getConnections() {
    return this.readJson('connections.json');
  }

  getMonsters() {
    return this.readJson('monsters/monsters.json');
  }

  getMonsterSkills() {
    return this.readJson('monsters/monster_skills.json');
  }

  getDropTables() {
    return this.readJson('monsters/drop_tables.json');
  }

  getNpcs() {
    return this.readJson('npcs/npcs.json');
  }

  getDialogues() {
    return this.readJson('npcs/dialogues.json');
  }

  getSpawnPoints() {
    return this.readJson('spawns/spawn_points.json');
  }

  getQuests() {
    return this.readJson('quests/quests.json');
  }

  getQuestChains() {
    return this.readJson('quests/quest_chains.json');
  }
}
