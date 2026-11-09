import { JsonStore } from '../database/jsonStore.js';
import { validateCharacterName, validateStatAllocation } from '@elysia/validation';
import { INITIAL_CLASSES } from '@elysia/game-data-schema';
import { CharacterEntity, Gender, ClassId, PrimaryAttributes, CharacterAppearance } from '@elysia/game-types';

export class CharacterService {
  private store = JsonStore.getInstance();

  async createCharacter(
    userId: string,
    payload: {
      name: string;
      gender: Gender;
      classId: ClassId;
      appearance?: CharacterAppearance;
      stats?: PrimaryAttributes;
    }
  ): Promise<CharacterEntity> {
    const { name, gender, classId, appearance, stats } = payload;

    // 1. Validate name
    const nameCheck = validateCharacterName(name);
    if (!nameCheck.isValid) {
      throw new Error(nameCheck.error || 'Tên nhân vật không hợp lệ.');
    }

    // Check duplicate character name
    const cleanName = name.trim();
    if (this.store.characters.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
      throw new Error(`Tên nhân vật "${cleanName}" đã có người sử dụng.`);
    }

    // 2. Validate class
    const classDef = INITIAL_CLASSES.find((c) => c.id === classId);
    if (!classDef) {
      throw new Error(`Chức nghiệp "${classId}" không tồn tại.`);
    }

    // 3. Validate stat allocation
    const base = classDef.baseStats;
    const finalStats: PrimaryAttributes = stats || { ...base };
    const statCheck = validateStatAllocation(finalStats);
    if (!statCheck.isValid) {
      throw new Error(statCheck.error || 'Phân bổ chỉ số không hợp lệ.');
    }

    // 4. Maximum 4 character slots per account
    const userChars = this.store.characters.filter((c) => c.userId === userId);
    if (userChars.length >= 4) {
      throw new Error('Tài khoản đã đạt giới hạn tối đa 4 nhân vật.');
    }

    const defaultAppearance: CharacterAppearance = {
      gender,
      hairstyleId: appearance?.hairstyleId || (gender === 'female' ? 'f_long' : 'm_short'),
      hairColor: appearance?.hairColor || '#1a1a24',
      eyeColor: appearance?.eyeColor || '#2563eb',
      outfitId: appearance?.outfitId || 'novice_tunic',
    };

    const newChar: CharacterEntity = {
      id: `CHAR_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId,
      name: cleanName,
      gender,
      classId,
      level: 1,
      exp: 0,
      gold: 500,
      baseStats: { ...base },
      attributes: { ...finalStats },
      appearance: defaultAppearance,
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
    };

    this.store.characters.push(newChar);
    this.store.save();

    return newChar;
  }

  async getCharactersByUserId(userId?: string): Promise<CharacterEntity[]> {
    if (userId) {
      return this.store.characters.filter((c) => c.userId === userId);
    }
    return this.store.characters;
  }

  async getCharacterById(id: string): Promise<CharacterEntity | null> {
    return this.store.characters.find((c) => c.id === id) || null;
  }

  async updateCharacter(id: string, updates: Partial<CharacterEntity>): Promise<CharacterEntity> {
    const idx = this.store.characters.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error('Nhân vật không tồn tại.');
    }

    this.store.characters[idx] = {
      ...this.store.characters[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.store.save();
    return this.store.characters[idx];
  }

  async deleteCharacter(id: string, userId: string): Promise<boolean> {
    const idx = this.store.characters.findIndex((c) => c.id === id && c.userId === userId);
    if (idx === -1) {
      throw new Error('Không tìm thấy nhân vật hoặc bạn không có quyền xóa.');
    }
    this.store.characters.splice(idx, 1);
    this.store.save();
    return true;
  }
}
