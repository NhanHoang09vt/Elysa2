import { JsonStore } from '../database/jsonStore.js';
import { ItemEntity, WeaponEntity } from '@elysia/game-types';

export class ItemService {
  private store = JsonStore.getInstance();

  // --- ITEM METHODS ---
  async getItems(params: Record<string, any> = {}) {
    let items = [...this.store.items];

    if (params.search) {
      const q = String(params.search).toLowerCase();
      items = items.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.id?.toLowerCase().includes(q) ||
          i.itemId?.toLowerCase().includes(q)
      );
    }
    if (params.category && params.category !== 'all') {
      items = items.filter((i) => i.category === params.category || i.itemType === params.category);
    }
    if (params.rarity && params.rarity !== 'all') {
      items = items.filter((i) => i.rarity === params.rarity);
    }
    if (params.status && params.status !== 'all') {
      items = items.filter((i) => i.status === params.status);
    }

    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '12', 10);
    const total = items.length;
    const paginated = items.slice((page - 1) * limit, page * limit);

    return {
      data: paginated,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getItemById(id: string): Promise<ItemEntity | null> {
    return this.store.items.find((i) => i.id === id || i.itemId === id) || null;
  }

  async createItem(dto: any): Promise<ItemEntity> {
    const id = dto.id || dto.itemId || `ITEM_${Date.now()}`;
    const newItem: ItemEntity = {
      id,
      itemId: id,
      name: dto.name || 'Vật Phẩm Mới',
      description: dto.description || '',
      category: dto.category || dto.itemType || 'material',
      itemType: dto.category || dto.itemType || 'material',
      rarity: dto.rarity || 'common',
      requiredLevel: dto.requiredLevel || 1,
      sellPrice: dto.sellPrice || 0,
      buyPrice: dto.buyPrice || 0,
      enabled: dto.enabled !== false,
      status: dto.status || 'published',
      ...dto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.store.items.push(newItem);
    this.store.save();
    return newItem;
  }

  async updateItem(id: string, dto: any): Promise<ItemEntity> {
    const idx = this.store.items.findIndex((i) => i.id === id || i.itemId === id);
    if (idx === -1) throw new Error(`Không tìm thấy vật phẩm ${id}`);

    this.store.items[idx] = {
      ...this.store.items[idx],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.store.save();
    return this.store.items[idx];
  }

  async deleteItem(id: string): Promise<boolean> {
    const idx = this.store.items.findIndex((i) => i.id === id || i.itemId === id);
    if (idx === -1) throw new Error(`Không tìm thấy vật phẩm ${id}`);
    this.store.items.splice(idx, 1);
    this.store.save();
    return true;
  }

  async duplicateItem(id: string): Promise<ItemEntity> {
    const source = await this.getItemById(id);
    if (!source) throw new Error(`Không tìm thấy vật phẩm ${id}`);

    const newId = `${source.id}_COPY_${Date.now().toString().slice(-4)}`;
    return this.createItem({
      ...source,
      id: newId,
      itemId: newId,
      name: `${source.name} (Bản sao)`,
      status: 'draft',
    });
  }

  async archiveItem(id: string): Promise<ItemEntity> {
    return this.updateItem(id, { status: 'archived' });
  }

  async publishItem(id: string): Promise<ItemEntity> {
    return this.updateItem(id, { status: 'published' });
  }

  // --- WEAPON METHODS ---
  async getWeapons(params: Record<string, any> = {}) {
    let weapons = [...this.store.weapons];

    if (params.search) {
      const q = String(params.search).toLowerCase();
      weapons = weapons.filter(
        (w) =>
          w.name?.toLowerCase().includes(q) ||
          w.id?.toLowerCase().includes(q) ||
          w.weaponId?.toLowerCase().includes(q)
      );
    }
    if (params.weaponType && params.weaponType !== 'all') {
      weapons = weapons.filter((w) => w.weaponType === params.weaponType);
    }
    if (params.rarity && params.rarity !== 'all') {
      weapons = weapons.filter((w) => w.rarity === params.rarity);
    }

    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '12', 10);
    const total = weapons.length;
    const paginated = weapons.slice((page - 1) * limit, page * limit);

    return {
      data: paginated,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getWeaponById(id: string): Promise<WeaponEntity | null> {
    return this.store.weapons.find((w) => w.id === id || w.weaponId === id) || null;
  }

  async createWeapon(dto: any): Promise<WeaponEntity> {
    const id = dto.id || dto.weaponId || `WEAPON_${Date.now()}`;
    const newWeapon: WeaponEntity = {
      id,
      itemId: id,
      weaponId: id,
      name: dto.name || 'Vũ Khí Mới',
      category: 'weapon',
      weaponType: dto.weaponType || 'sword',
      element: dto.element || 'neutral',
      rarity: dto.rarity || 'common',
      requiredLevel: dto.requiredLevel || 1,
      attackPower: dto.attackPower || 10,
      magicAttackPower: dto.magicAttackPower || 0,
      hit: dto.hit || 5,
      attackSpeed: dto.attackSpeed || 1.0,
      attackRange: dto.attackRange || 50,
      sellPrice: dto.sellPrice || 5,
      buyPrice: dto.buyPrice || 25,
      enabled: dto.enabled !== false,
      status: dto.status || 'published',
      item: {} as any,
      ...dto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newWeapon.item = { ...newWeapon };

    this.store.weapons.push(newWeapon);
    this.store.save();
    return newWeapon;
  }

  async updateWeapon(id: string, dto: any): Promise<WeaponEntity> {
    const idx = this.store.weapons.findIndex((w) => w.id === id || w.weaponId === id);
    if (idx === -1) throw new Error(`Không tìm thấy vũ khí ${id}`);

    this.store.weapons[idx] = {
      ...this.store.weapons[idx],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.store.save();
    return this.store.weapons[idx];
  }

  async deleteWeapon(id: string): Promise<boolean> {
    const idx = this.store.weapons.findIndex((w) => w.id === id || w.weaponId === id);
    if (idx === -1) throw new Error(`Không tìm thấy vũ khí ${id}`);
    this.store.weapons.splice(idx, 1);
    this.store.save();
    return true;
  }

  async duplicateWeapon(id: string): Promise<WeaponEntity> {
    const source = await this.getWeaponById(id);
    if (!source) throw new Error(`Không tìm thấy vũ khí ${id}`);

    const newId = `${source.id}_COPY_${Date.now().toString().slice(-4)}`;
    return this.createWeapon({
      ...source,
      id: newId,
      weaponId: newId,
      name: `${source.name} (Bản sao)`,
      status: 'draft',
    });
  }

  async archiveWeapon(id: string): Promise<WeaponEntity> {
    return this.updateWeapon(id, { status: 'archived' });
  }

  async publishWeapon(id: string): Promise<WeaponEntity> {
    return this.updateWeapon(id, { status: 'published' });
  }
}
