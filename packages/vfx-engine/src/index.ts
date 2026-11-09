export type VFXType = 'projectile' | 'aoe' | 'slash' | 'impact' | 'buff' | 'beam' | 'summon' | string;

export interface VFXPaletteConfig {
  primaryColor?: string;
  glowColor?: string;
  tint?: string;
  intensity?: number;
  hueShift?: number;
  saturation?: number;
  brightness?: number;
}

export interface VFXSkillConfig {
  key?: string;
  id?: string;
  skill_id?: string;
  effect_id?: string;
  effect_scale?: number;
  name: string;
  name_vi?: string;
  desc?: string;
  category?: string;
  type?: VFXType;
  cast_duration?: number;
  projectile_speed?: number;
  explosion_radius?: number;
  animation_sync?: any;
  cooldown?: number;
  impact_effect?: any;
  trail_effect?: any;
  frames?: number;
  totalFrames?: number;
  fps?: number;
  frameWidth?: number;
  frameHeight?: number;
  pivot?: [number, number];
  pivotNorm?: [number, number];
  scale?: number;
  hotkey?: string;
  classTag?: string;
  thumbnail?: string;
  spriteSheet?: string;
  palette?: VFXPaletteConfig;
}

export interface VFXWorldTarget {
  x: number;
  y: number;
  z?: number;
}

export interface VFXCombatCallbacks {
  onHit?: (target?: VFXWorldTarget) => void;
  onImpact?: (target?: VFXWorldTarget) => void;
  onDamageFrame?: (target?: VFXWorldTarget) => void;
  onComplete?: () => void;
}

export const DEFAULT_SKILL_VFX_CONFIGS: Record<string, VFXSkillConfig> = {
  vfx_slash: {
    key: 'vfx_slash',
    id: 'vfx_slash',
    skill_id: 'skill_slash',
    name: 'Kiếm Khí Trảm',
    name_vi: 'Kiếm Khí Trảm',
    desc: 'Lưỡi đao kiếm khí sắc bén.',
    frames: 24,
    fps: 30,
    frameWidth: 256,
    frameHeight: 256,
    pivotNorm: [0.5, 0.875],
    hotkey: '1',
    classTag: 'swordsman',
  },
  vfx_sword_combo: {
    key: 'vfx_sword_combo',
    id: 'vfx_sword_combo',
    skill_id: 'skill_sword_combo',
    name: 'Tam Liên Kiếm (Sword Combo)',
    name_vi: 'Tam Liên Kiếm',
    desc: 'Chuỗi 3 thức kiếm liên hoàn: trảm, song đao, và bổ đất cực mạnh.',
    frames: 90,
    fps: 30,
    frameWidth: 256,
    frameHeight: 256,
    pivotNorm: [0.5, 0.875],
    hotkey: '2',
    classTag: 'swordsman',
  },
  vfx_fireball: {
    key: 'vfx_fireball',
    id: 'vfx_fireball',
    skill_id: 'skill_fireball',
    name: 'Hỏa Cầu Thuật (Fireball)',
    name_vi: 'Hỏa Cầu Thuật',
    desc: 'Cầu lửa bùng nổ phân tán sát thương hỏa.',
    frames: 30,
    fps: 30,
    frameWidth: 256,
    frameHeight: 256,
    pivotNorm: [0.5, 0.875],
    hotkey: '3',
    classTag: 'mage',
  },
  vfx_divine_heal: {
    key: 'vfx_divine_heal',
    id: 'vfx_divine_heal',
    skill_id: 'skill_heal',
    name: 'Thánh Ân Trị Liệu',
    name_vi: 'Thánh Ân Trị Liệu',
    desc: 'Hào quang thánh khiết chữa lành sinh lực.',
    frames: 28,
    fps: 30,
    frameWidth: 256,
    frameHeight: 256,
    pivotNorm: [0.5, 0.875],
    hotkey: '4',
    classTag: 'monk',
  },
};

export class VFXRegistry {
  private static instance: VFXRegistry;
  private configs = new Map<string, VFXSkillConfig>(
    Object.entries(DEFAULT_SKILL_VFX_CONFIGS)
  );

  static getInstance(): VFXRegistry {
    if (!VFXRegistry.instance) {
      VFXRegistry.instance = new VFXRegistry();
    }
    return VFXRegistry.instance;
  }

  static register(config: VFXSkillConfig) {
    if (config.key) {
      VFXRegistry.getInstance().configs.set(config.key, config);
    }
  }

  static get(key: string): VFXSkillConfig | undefined {
    return VFXRegistry.getInstance().configs.get(key);
  }

  static getAll(): VFXSkillConfig[] {
    return Array.from(VFXRegistry.getInstance().configs.values());
  }

  register(config: VFXSkillConfig) {
    if (config.key) {
      this.configs.set(config.key, config);
    }
  }

  registerSkillConfig(config: VFXSkillConfig) {
    if (config.key) {
      this.configs.set(config.key, config);
    }
  }

  get(key: string): VFXSkillConfig | undefined {
    return this.configs.get(key);
  }

  getSkillConfig(key: string): VFXSkillConfig | undefined {
    return this.configs.get(key);
  }

  getAll(): VFXSkillConfig[] {
    return Array.from(this.configs.values());
  }

  getAllSkillConfigs(): VFXSkillConfig[] {
    return Array.from(this.configs.values());
  }

  async loadManifest(manifest?: any): Promise<any> {
    return manifest || {};
  }

  exportToJSON(): string {
    return JSON.stringify(Array.from(this.configs.values()), null, 2);
  }

  importFromJSON(json: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        let count = 0;
        for (const item of parsed) {
          if (item && item.key) {
            this.configs.set(item.key, item);
            count++;
          }
        }
        return { success: true, count };
      }
      return { success: false, count: 0, error: 'JSON phải là một mảng danh sách hiệu ứng.' };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Lỗi cú pháp JSON.' };
    }
  }
}

export class VFXManager {
  private canvas: HTMLCanvasElement;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
  }

  public async spawnSkillVfx(
    skillId: string,
    source: VFXWorldTarget,
    target?: VFXWorldTarget,
    callbacks?: VFXCombatCallbacks
  ): Promise<void> {
    if (callbacks?.onHit) {
      setTimeout(() => callbacks.onHit!(target || source), 150);
    }
    if (callbacks?.onImpact) {
      setTimeout(() => callbacks.onImpact!(target || source), 200);
    }
    if (callbacks?.onDamageFrame) {
      setTimeout(() => callbacks.onDamageFrame!(target || source), 250);
    }
    if (callbacks?.onComplete) {
      setTimeout(() => callbacks.onComplete!(), 400);
    }
  }

  public spawnCombatNumber(
    x: number,
    y: number,
    amount: number | string,
    type: 'damage' | 'crit' | 'heal' | 'miss' = 'damage'
  ): void {
    // Combat number overlay handler
  }

  public triggerHitStop(frames: number = 3): void {
    // Hit stop freeze frame logic
  }

  public triggerScreenShake(intensity: number = 6, duration: number = 0.2): void {
    // Screen shake logic
  }

  public spawnMonsterDeath(worldPos: VFXWorldTarget): void {
    // Monster death disintegration particles
  }

  public setCameraPosition(cameraX: number, cameraY: number, zoom: number = 1.0): void {
    // Camera sync
  }

  public update(deltaSeconds: number): void {
    // Update active particle effects
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public dispose(): void {
    // Cleanup
  }
}
