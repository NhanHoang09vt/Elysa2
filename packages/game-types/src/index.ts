// ==========================================
// ELYSIA NO DENSETSU – MASTER GAME TYPES
// ==========================================

export type ClassId =
  | 'novice'
  | 'swordsman'
  | 'spearman'
  | 'knight'
  | 'monk'
  | 'priest'
  | 'mage'
  | 'assassin'
  | 'fighter'
  | 'archer';

export type Gender = 'male' | 'female';

export type ElementType =
  | 'neutral'
  | 'fire'
  | 'water'
  | 'earth'
  | 'wind'
  | 'holy'
  | 'shadow';

export type ContentStatus =
  | 'draft'
  | 'published'
  | 'archived'
  | 'DRAFT'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type ItemRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export type ItemCategory =
  | 'equipment'
  | 'weapon'
  | 'armor'
  | 'accessory'
  | 'consumable'
  | 'potion'
  | 'material'
  | 'quest_item'
  | string;

export type WeaponType =
  | 'sword'
  | 'greatsword'
  | 'shield'
  | 'spear'
  | 'halberd'
  | 'lance'
  | 'staff'
  | 'book'
  | 'dagger'
  | 'bow'
  | 'fist'
  | string;

export interface PrimaryAttributes {
  str: number;
  dex: number;
  agi: number;
  int: number;
  con: number;
}

export interface SecondaryStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  matk: number;
  def: number;
  mdef: number;
  hit: number;
  flee: number;
  crit: number;
  aspd: number;
  moveSpeed: number;
  accuracy?: number;
  resistance?: number;
}

export interface CharacterAppearance {
  gender?: Gender;
  faceId?: string;
  hairstyleId: string;
  hairColor: string;
  eyeColor: string;
  skinTone?: string;
  outfitId?: string;
  costumeId?: string;
}

export interface CharacterEntity {
  id: string;
  userId?: string;
  name: string;
  gender: Gender;
  classId: ClassId;
  level: number;
  exp: number;
  gold: number;
  baseStats: PrimaryAttributes;
  attributes: PrimaryAttributes;
  stats?: PrimaryAttributes;
  appearance: CharacterAppearance;
  equipment?: Record<string, string>;
  inventory?: any[];
  regionId?: string;
  x?: number;
  y?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WeaponPaperdollConfig {
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  rotationDeg?: number;
  rotation?: number;
  zIndexOrder?: number;
  anchorX?: number;
  anchorY?: number;
}

export interface ItemEntity {
  id: string;
  itemId: string;
  internalName?: string;
  name: string;
  description?: string;
  itemType?: ItemCategory;
  category: string | ItemCategory;
  subcategory?: string;
  itemSubtype?: string;
  rarity: ItemRarity;
  requiredLevel: number;
  icon?: string;
  image?: string;
  primaryAssetUrl?: string;
  inventoryAssetUrl?: string;
  iconAssetUrl?: string;
  groundAssetUrl?: string;
  stackable?: boolean;
  stackLimit?: number;
  maxStack?: number;
  weight?: number;
  sellPrice: number;
  buyPrice: number;
  equipmentStats?: Record<string, number>;
  properties?: Record<string, any>;
  effects?: Record<string, any>;
  usable?: boolean;
  tradable?: boolean;
  isTradable?: boolean;
  isDroppable?: boolean;
  isSellable?: boolean;
  isCharacterBound?: boolean;
  isAccountBound?: boolean;
  enabled?: boolean;
  status?: ContentStatus;
  allowedClasses?: ClassId[];
  requiredClasses?: ClassId[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WeaponEntity extends ItemEntity {
  weaponType: WeaponType;
  element: ElementType;
  minAtk?: number;
  maxAtk?: number;
  attackPower?: number;
  magicAttackPower?: number;
  attackSpeed?: number;
  attackRange?: number;
  hit?: number;
  critRate?: number;
  criticalRate?: number;
  criticalDamage?: number;
  elementalBonus?: number;
  physicalBonus?: number;
  magicalBonus?: number;
  requirements?: any;
  durability?: number;
  maxDurability?: number;
  paperdollConfig?: WeaponPaperdollConfig;
  twoHanded?: boolean;
  item: ItemEntity;
  weaponId: string;
  spriteAssetUrl?: string;
  refinementLevel?: number;
  upgradeConfig?: any;
}

export interface SkillVfxObject {
  thumbnail?: string;
  spriteSheet?: string;
  key?: string;
  totalFrames?: number;
  fps?: number;
  frameWidth?: number;
  frameHeight?: number;
  pivot?: [number, number];
  pivotNorm?: [number, number];
  scale?: number;
}

export interface SkillDefinition {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  classId: ClassId;
  requiredLevel: number;
  hotkey?: string;
  spCost?: number;
  mpCost?: number;
  manaCost?: number;
  cooldown: number;
  cooldownSeconds?: number;
  castTime: number;
  range: number;
  targetType: 'single' | 'aoe' | 'self' | 'directional' | 'ground';
  damageMultiplier: number;
  element: ElementType;
  icon: string;
  vfxKey?: string;
  vfx?: string | SkillVfxObject | any;
}

export interface ClassDefinition {
  id: ClassId;
  name: string;
  role: string;
  description: string;
  baseStats: PrimaryAttributes;
  weaponProficiency?: WeaponType[];
  allowedWeapons: string[];
  armorProficiency?: string[];
  startingSkills: string[];
}

export interface HealthServiceStatus {
  status: string;
  message: string;
  latencyMs?: number;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  game: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    server: HealthServiceStatus;
    database: HealthServiceStatus;
    redis: HealthServiceStatus;
    [key: string]: HealthServiceStatus;
  };
}
