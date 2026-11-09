import Phaser from 'phaser';
import { SKILL_VFX_REGISTRY } from '../vfx/SkillVfxConfig';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Master Character 001 - Female Swordsman (256x256)
    this.load.image(
      'char_swordsman_female_master',
      '/assets/characters/classes/swordsman/female/reference/swordsman_female_master_256.png'
    );

    // Standardized 256x256 7-Action Animation Sprite Sheets for Female Swordsman / Novice
    this.load.spritesheet(
      'char_swordsman_anim_idle',
      '/assets/characters/classes/swordsman/female/animations/idle.png',
      { frameWidth: 256, frameHeight: 256 }
    );
    this.load.spritesheet(
      'char_swordsman_anim_walk',
      '/assets/characters/classes/swordsman/female/animations/walk.png',
      { frameWidth: 256, frameHeight: 256 }
    );
    this.load.spritesheet(
      'char_swordsman_anim_run',
      '/assets/characters/classes/swordsman/female/animations/run.png',
      { frameWidth: 256, frameHeight: 256 }
    );
    this.load.spritesheet(
      'char_swordsman_anim_attack',
      '/assets/characters/classes/swordsman/female/animations/attack.png',
      { frameWidth: 256, frameHeight: 256 }
    );
    this.load.spritesheet(
      'char_swordsman_anim_skill',
      '/assets/characters/classes/swordsman/female/animations/skill.png',
      { frameWidth: 256, frameHeight: 256 }
    );
    this.load.spritesheet(
      'char_swordsman_anim_hurt',
      '/assets/characters/classes/swordsman/female/animations/hurt.png',
      { frameWidth: 256, frameHeight: 256 }
    );
    this.load.spritesheet(
      'char_swordsman_anim_death',
      '/assets/characters/classes/swordsman/female/animations/death.png',
      { frameWidth: 256, frameHeight: 256 }
    );

    // Preload Full HD 256px Skill VFX Sprite Sheets
    for (const [key, def] of Object.entries(SKILL_VFX_REGISTRY)) {
      this.load.spritesheet(
        key,
        `/assets/vfx/${key}.png`,
        {
          frameWidth: def.frameWidth,
          frameHeight: def.frameHeight,
        }
      );
    }
  }

  create() {
    this.scene.start('WorldScene');
  }
}
