/**
 * ThreeVfxManager
 * Bridges @elysia/vfx-engine into the Phaser 3 render lifecycle.
 * Manages Three.js scene, camera tracking, combat synchronization,
 * and high-performance object pooling at 60 FPS.
 */

import {
  VFXManager,
  VFXSkillConfig,
  VFXCombatCallbacks,
  VFXWorldTarget,
} from '@elysia/vfx-engine';

export class ThreeVfxManager {
  public engine: VFXManager;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new VFXManager(canvas, window.innerWidth, window.innerHeight);
    window.addEventListener('resize', this.onResize.bind(this));
  }

  /**
   * Casts a skill effect through the VFX Engine
   */
  public async castSkill(
    skillId: string,
    source: VFXWorldTarget,
    target?: VFXWorldTarget,
    callbacks?: VFXCombatCallbacks
  ) {
    return this.engine.spawnSkillVfx(skillId, source, target, callbacks);
  }

  /**
   * Spawns floating combat numbers (Damage, Crit, Heal, Miss)
   */
  public spawnCombatNumber(
    x: number,
    y: number,
    amount: number | string,
    type: 'damage' | 'crit' | 'heal' | 'miss' = 'damage'
  ) {
    this.engine.spawnCombatNumber(x, y, amount, type);
  }

  /**
   * Triggers heavy impact hit-stop freeze
   */
  public triggerHitStop(frames: number = 3) {
    this.engine.triggerHitStop(frames);
  }

  /**
   * Triggers camera screenshake
   */
  public triggerScreenShake(intensity: number = 6, duration: number = 0.2) {
    this.engine.triggerScreenShake(intensity, duration);
  }

  /**
   * Spawns monster death disintegrate effect
   */
  public spawnMonsterDeath(worldPos: VFXWorldTarget) {
    this.engine.spawnMonsterDeath(worldPos);
  }

  /**
   * Called by Phaser's update() lifecycle
   */
  public update(deltaSeconds: number, cameraX?: number, cameraY?: number, zoom: number = 1.0) {
    if (cameraX !== undefined && cameraY !== undefined) {
      this.engine.setCameraPosition(cameraX, cameraY, zoom);
    }
    this.engine.update(deltaSeconds);
  }

  private onResize() {
    this.engine.resize(window.innerWidth, window.innerHeight);
  }

  public destroy() {
    window.removeEventListener('resize', this.onResize.bind(this));
    this.engine.dispose();
  }
}
