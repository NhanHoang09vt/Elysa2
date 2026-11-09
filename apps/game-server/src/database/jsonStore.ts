import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env.js';

export interface DatabaseStore {
  users: any[];
  characters: any[];
  items: any[];
  weapons: any[];
  monsters: any[];
  quests: any[];
  logs: any[];
}

const DEFAULT_STORE: DatabaseStore = {
  users: [],
  characters: [],
  items: [],
  weapons: [],
  monsters: [],
  quests: [],
  logs: [],
};

export class JsonStore {
  private static instance: JsonStore;
  private dbFilePath: string;
  private data: DatabaseStore;
  private isWriting = false;

  private constructor() {
    const dir = ENV.DATA_DIR;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.dbFilePath = path.join(dir, 'server_db.json');
    this.data = this.load();
  }

  public static getInstance(): JsonStore {
    if (!JsonStore.instance) {
      JsonStore.instance = new JsonStore();
    }
    return JsonStore.instance;
  }

  private load(): DatabaseStore {
    if (fs.existsSync(this.dbFilePath)) {
      try {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        return { ...DEFAULT_STORE, ...JSON.parse(raw) };
      } catch (err) {
        console.error('[JsonStore] Error reading DB file, restoring defaults:', err);
      }
    }
    const store = { ...DEFAULT_STORE };
    this.saveImmediate(store);
    return store;
  }

  private saveImmediate(data: DatabaseStore) {
    try {
      const tempPath = `${this.dbFilePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.dbFilePath);
    } catch (err) {
      console.error('[JsonStore] Save error:', err);
    }
  }

  public save() {
    if (this.isWriting) return;
    this.isWriting = true;
    setImmediate(() => {
      this.saveImmediate(this.data);
      this.isWriting = false;
    });
  }

  // --- Entity Accessors ---
  public get users(): any[] {
    return this.data.users;
  }

  public get characters(): any[] {
    return this.data.characters;
  }

  public get items(): any[] {
    return this.data.items;
  }

  public get weapons(): any[] {
    return this.data.weapons;
  }

  public get monsters(): any[] {
    return this.data.monsters;
  }

  public get quests(): any[] {
    return this.data.quests;
  }

  public get logs(): any[] {
    return this.data.logs;
  }
}
