import Phaser from 'phaser';
import './ui/MasterUIStyles.css';
import { BootScene } from './scenes/BootScene';
import { WorldScene } from './scenes/WorldScene';
import { checkServerHealth } from './services/apiClient';
import { MasterHUD } from './ui/MasterHUD';
import { CharacterInventoryModal } from './ui/CharacterInventoryModal';
import { OnlineShopModal } from './ui/OnlineShopModal';
import { WorldMapModal } from './ui/WorldMapModal';
import { EventModal } from './ui/EventModal';
import { SettingsModal } from './ui/SettingsModal';
import { CharacterCreationModal } from './ui/CharacterCreationModal';
import { AuthModal, AuthSuccessData } from './ui/AuthModal';
import { fetchCharacters } from './services/apiClient';
import { CharacterEntity, WeaponEntity, ItemEntity } from '@elysia/game-types';
import { INITIAL_CLASSES } from '@elysia/game-data-schema';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#080a0f',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, WorldScene],
};

// Initialize Game Engine
export const game = new Phaser.Game(config);

let worldSceneInstance: WorldScene | null = null;

// Listen for scene readiness
game.events.on('step', () => {
  if (!worldSceneInstance) {
    const scene = game.scene.getScene('WorldScene') as WorldScene;
    if (scene && scene.scene.isActive()) {
      worldSceneInstance = scene;
    }
  }
});

// Initialize UI Windows
export const characterInventoryModal = new CharacterInventoryModal();
export const onlineShopModal = new OnlineShopModal();
export const worldMapModal = new WorldMapModal();
export const eventModal = new EventModal();
export const settingsModal = new SettingsModal();

// Authentication & Title Portal Modal
export const authModal = new AuthModal(async (_auth: AuthSuccessData) => {
  const characters = await fetchCharacters();
  if (!characters || characters.length === 0) {
    characterCreationModal.open();
  } else {
    const primaryChar = characters[0];
    localStorage.setItem('elysia_active_character', JSON.stringify(primaryChar));
    if (worldSceneInstance) {
      worldSceneInstance.updatePlayerCharacter(primaryChar);
    }
    const cls = INITIAL_CLASSES.find((c) => c.id === primaryChar.classId);
    const title = cls ? cls.name.split(' (')[0] : primaryChar.classId;
    masterHud.updatePlayerProfile({
      name: primaryChar.name,
      classTitle: `${title} Lv.${primaryChar.level}`,
      level: primaryChar.level,
    });
  }
});

// Character Creator Modal (for initial generation or detailed appearance customization)
export const characterCreationModal = new CharacterCreationModal((newChar: CharacterEntity) => {
  if (worldSceneInstance) {
    worldSceneInstance.updatePlayerCharacter(newChar);
  }
  const cls = INITIAL_CLASSES.find((c) => c.id === newChar.classId);
  const title = cls ? cls.name.split(' (')[0] : newChar.classId;
  masterHud.updatePlayerProfile({
    name: newChar.name,
    classTitle: `${title} (${newChar.gender === 'female' ? 'Nữ' : 'Nam'})`,
    level: newChar.level,
  });
});

// Wire equipment & consumable callbacks from Inventory
characterInventoryModal.onEquipWeapon = (weapon: WeaponEntity) => {
  if (worldSceneInstance) {
    worldSceneInstance.equipWeapon(weapon);
  }
};

characterInventoryModal.onUseItem = (item: ItemEntity) => {
  if (worldSceneInstance) {
    worldSceneInstance.useConsumable(item);
  }
};

// Initialize Master In-Game HUD
export const masterHud = new MasterHUD();

// Connect HUD Interactions
masterHud.onOpenCharacterInventory = () => characterInventoryModal.toggle();
masterHud.onOpenShop = () => onlineShopModal.toggle();
masterHud.onOpenWorldMap = () => worldMapModal.toggle();
masterHud.onOpenEvents = () => eventModal.toggle();
masterHud.onOpenSettings = () => settingsModal.toggle();
masterHud.onOpenAuth = () => authModal.open();

masterHud.onCastSkill = (vfxKey: string) => {
  if (worldSceneInstance) {
    worldSceneInstance.castSkillVfx(vfxKey);
  }
};

masterHud.onUseConsumable = (consumableId: string) => {
  if (worldSceneInstance) {
    if (consumableId === 'hp_potion') {
      worldSceneInstance.useConsumable({
        id: 'ITEM_POTION_HP_SMALL',
        name: 'Bình Máu Nhỏ',
        category: 'potion',
        properties: { hpRestore: 150 },
      } as any);
    } else {
      worldSceneInstance.useConsumable({
        id: consumableId,
        name: 'Vật Phẩm Hồi Phục',
        category: 'potion',
      } as any);
    }
  }
};

// Listen for scene broadcasts
window.addEventListener('elysia-player-coord', (e: Event) => {
  const custom = e as CustomEvent<{ x: number; y: number }>;
  if (custom.detail) {
    masterHud.updatePlayerCoordinates(custom.detail.x, custom.detail.y);
  }
});

window.addEventListener('elysia-target-hit', (e: Event) => {
  const custom = e as CustomEvent<{ name: string; hp: number; maxHp: number; level: number }>;
  if (custom.detail) {
    masterHud.showMonsterTarget(custom.detail.name, custom.detail.hp, custom.detail.maxHp, custom.detail.level);
  }
});

window.addEventListener('elysia-floating-dmg', (e: Event) => {
  const custom = e as CustomEvent<{ x: number; y: number; damage: number; isCrit: boolean }>;
  if (custom.detail) {
    masterHud.showFloatingDamage(custom.detail.x, custom.detail.y, `-${custom.detail.damage}`, custom.detail.isCrit ? 'crit' : 'normal');
  }
});

// Check if user already has an active character in storage
const savedChar = localStorage.getItem('elysia_active_character');
if (savedChar) {
  try {
    const parsed = JSON.parse(savedChar) as CharacterEntity;
    const cls = INITIAL_CLASSES.find((c) => c.id === parsed.classId);
    const title = cls ? cls.name.split(' (')[0] : parsed.classId;
    masterHud.updatePlayerProfile({
      name: parsed.name,
      classTitle: `${title} Lv.${parsed.level}`,
      level: parsed.level,
    });
  } catch {
    // ignore
  }
}

// Check if user is already authenticated
const token = localStorage.getItem('elysia_token');
if (!token) {
  authModal.open();
}

// Telemetry Polling to Backend
async function pollBackend() {
  const health = await checkServerHealth();
  if (health) {
    // Telemetry OK
  }
}

pollBackend();
setInterval(pollBackend, 5000);
