import Phaser from 'phaser';
import { ThreeVfxManager } from '../vfx/ThreeVfxManager';
import { CharacterEntity, WeaponEntity, ItemEntity } from '@elysia/game-types';
import { INITIAL_CLASSES } from '@elysia/game-data-schema';
import { SKILL_VFX_REGISTRY, SkillVfxDefinition } from '../vfx/SkillVfxConfig';
import { networkService, RemotePlayer } from '../services/networkService';
import { fetchMonsters, fetchSpawns } from '../services/apiClient';

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private nameplate!: Phaser.GameObjects.Text;
  private titleplate!: Phaser.GameObjects.Text;
  private shadow!: Phaser.GameObjects.Ellipse;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private keyC!: Phaser.Input.Keyboard.Key;
  private keyJ!: Phaser.Input.Keyboard.Key;
  private keyH!: Phaser.Input.Keyboard.Key;
  private keyK!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;

  private isActionLocked = false;
  private isDead = false;
  private skillKeys: { key: string; phaserKey: Phaser.Input.Keyboard.Key; vfxKey: string }[] = [];
  private threeVfx!: ThreeVfxManager;
  private moveSpeed = 160;
  private debugText!: Phaser.GameObjects.Text;
  private lastCastTime = 0;

  private currentCharacter: CharacterEntity | null = null;
  private dummies: any[] = [];
  private remotePlayers: Map<string, {
    sprite: Phaser.GameObjects.Sprite;
    shadow: Phaser.GameObjects.Ellipse;
    nameplate: Phaser.GameObjects.Text;
    titleplate: Phaser.GameObjects.Text;
    targetX: number;
    targetY: number;
  }> = new Map();
  private lastNetworkSync = 0;
  private currentRegionId = 'VIL_STARTER';

  constructor() {
    super({ key: 'WorldScene' });
  }

  create() {
    const mapWidth = 2000;
    const mapHeight = 2000;

    // Set world physics and camera bounds
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // Draw fantasy test map terrain
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0d14, 1);
    bg.fillRect(0, 0, mapWidth, mapHeight);

    // Grid tiles (48x48)
    bg.lineStyle(1, 0x182030, 0.5);
    const step = 48;
    for (let x = 0; x <= mapWidth; x += step) {
      bg.lineBetween(x, 0, x, mapHeight);
    }
    for (let y = 0; y <= mapHeight; y += step) {
      bg.lineBetween(0, y, mapWidth, y);
    }

    // Central Town Square / Village Plaza marker
    const plaza = this.add.graphics();
    plaza.lineStyle(2, 0xd4af37, 0.4);
    plaza.strokeCircle(mapWidth / 2, mapHeight / 2, 220);
    plaza.lineStyle(1, 0x1c69d4, 0.3);
    plaza.strokeCircle(mapWidth / 2, mapHeight / 2, 140);

    // Ground Shadow for character
    const spawnX = mapWidth / 2;
    const spawnY = mapHeight / 2;
    this.shadow = this.add.ellipse(spawnX, spawnY, 68, 20, 0x000000, 0.45);

    // Initialize character 7-action animations
    this.initCharacterAnimations();

    // Check stored active character
    let initialName = 'ELYSIA_NOVICE_FEMALE_001';
    let initialTitle = '<Tân Thủ Lv.1>';
    const stored = localStorage.getItem('elysia_active_character');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CharacterEntity;
        this.currentCharacter = parsed;
        initialName = parsed.name;
        const cls = INITIAL_CLASSES.find((c) => c.id === parsed.classId);
        initialTitle = `<${cls ? cls.name.split(' (')[0] : parsed.classId} Lv.${parsed.level}>`;
      } catch {
        // use default
      }
    }

    // Create Animated Character Sprite (Standardized 256x256 anchored at (128, 238))
    this.player = this.add.sprite(spawnX, spawnY, 'char_swordsman_anim_idle', 0);
    this.player.setOrigin(0.5, 0.9297);
    this.player.setScale(1.0);
    this.player.play('char_novice_idle');

    // Character Nameplate & Title
    this.nameplate = this.add.text(spawnX, spawnY - 120, initialName, {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#d4af37',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.titleplate = this.add.text(spawnX, spawnY - 105, initialTitle, {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '11px',
      color: '#94a3b8',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Camera following character
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Setup input keys
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.keyShift = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    // Hotkey [C] for character creation modal
    this.keyC = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.keyC.on('down', () => {
      const openBtn = document.getElementById('btn-open-character-creator');
      if (openBtn) openBtn.click();
    });

    // Hotkey [J] for basic normal attack
    this.keyJ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keyJ.on('down', () => {
      this.performBasicAttack();
    });

    // Hotkey [H] for Hurt animation test
    this.keyH = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.keyH.on('down', () => {
      this.performHurt();
    });

    // Hotkey [K] for Death / Revive toggle
    this.keyK = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.keyK.on('down', () => {
      this.toggleDeath();
    });

    // FPS / Debug Text Overlay (fixed to camera)
    this.debugText = this.add.text(16, window.innerHeight - 36, '', {
      fontFamily: 'Consolas, monospace',
      fontSize: '12px',
      color: '#38bdf8',
      backgroundColor: 'rgba(10, 14, 24, 0.8)',
      padding: { x: 8, y: 4 },
    }).setScrollFactor(0).setDepth(100);

    // Initialize Three.js VFX overlay
    const threeCanvas = document.getElementById('three-vfx-canvas') as HTMLCanvasElement;
    if (threeCanvas) {
      this.threeVfx = new ThreeVfxManager(threeCanvas);
    }

    // Register all 256px Skill VFX Animations
    this.initSkillAnimations();

    // Register Skill Hotkeys
    this.initSkillHotkeys();

    // Listen for custom skill cast events from DOM Skill Hotbar
    window.addEventListener('elysia-cast-skill', (e: Event) => {
      const customEvent = e as CustomEvent<{ skillKey: string }>;
      if (customEvent.detail && customEvent.detail.skillKey) {
        this.castSkillVfx(customEvent.detail.skillKey);
      }
    });

    // Spawn Sample Ground Loot Item in Plaza (Excalibur Holy Blade)
    const lootX = spawnX + 90;
    const lootY = spawnY + 50;
    const lootShadow = this.add.ellipse(lootX, lootY + 14, 32, 10, 0x000000, 0.45);
    const lootItem = this.add.sprite(lootX, lootY, 'char_novice_anim_idle', 0).setScale(0.6);
    lootItem.setTint(0xfef08a);
    lootItem.setInteractive({ useHandCursor: true });

    const lootBanner = this.add.text(lootX, lootY - 24, '✦ [Loot Rơi] Thánh Kiếm Excalibur (Bấm để nhặt) ✦', {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#fef08a',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [lootItem, lootBanner],
      y: '-=6',
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    lootItem.on('pointerdown', () => {
      this.showSkillBanner('Đã nhặt: Thánh Kiếm Excalibur vào túi đồ!');
      lootItem.destroy();
      lootShadow.destroy();
      lootBanner.destroy();
    });

    // Spawn Sample Training Dummies in Town Square for Skill Impact Testing
    this.initTrainingDummies(spawnX, spawnY);

    // Initialize Realtime Multiplayer Network
    this.initMultiplayerNetwork(spawnX, spawnY);

    // Populate World Monsters & Spawns dynamically
    this.initWorldMonsters(spawnX, spawnY);
  }

  /**
   * Initializes 7 Standardized Character Action Animations (256x256)
   */
  private initCharacterAnimations() {
    const animConfigs = [
      { key: 'char_novice_idle', sheet: 'char_swordsman_anim_idle', end: 5, fps: 8, repeat: -1 },
      { key: 'char_novice_walk', sheet: 'char_swordsman_anim_walk', end: 5, fps: 10, repeat: -1 },
      { key: 'char_novice_run', sheet: 'char_swordsman_anim_run', end: 5, fps: 12, repeat: -1 },
      { key: 'char_novice_attack', sheet: 'char_swordsman_anim_attack', end: 4, fps: 12, repeat: 0 },
      { key: 'char_novice_skill', sheet: 'char_swordsman_anim_skill', end: 4, fps: 12, repeat: 0 },
      { key: 'char_novice_hurt', sheet: 'char_swordsman_anim_hurt', end: 4, fps: 10, repeat: 0 },
      { key: 'char_novice_death', sheet: 'char_swordsman_anim_death', end: 5, fps: 8, repeat: 0 },
    ];

    for (const ac of animConfigs) {
      if (!this.anims.exists(ac.key)) {
        this.anims.create({
          key: ac.key,
          frames: this.anims.generateFrameNumbers(ac.sheet, { start: 0, end: ac.end }),
          frameRate: ac.fps,
          repeat: ac.repeat,
        });
      }
    }
  }

  /**
   * Initializes Phaser animations for each 256px Full HD VFX
   */
  private initSkillAnimations() {
    for (const [key, def] of Object.entries(SKILL_VFX_REGISTRY)) {
      const animKey = `anim_${key}`;
      if (!this.anims.exists(animKey)) {
        this.anims.create({
          key: animKey,
          frames: this.anims.generateFrameNumbers(key, { start: 0, end: def.frames - 1 }),
          frameRate: def.fps,
          repeat: 0,
        });
      }
    }
  }

  /**
   * Registers keyboard listeners for combat skills
   */
  private initSkillHotkeys() {
    const keyboard = this.input.keyboard!;
    const hotkeyMap: { code: number; vfxKey: string }[] = [
      { code: Phaser.Input.Keyboard.KeyCodes.ONE, vfxKey: 'vfx_sword_slash' },
      { code: Phaser.Input.Keyboard.KeyCodes.TWO, vfxKey: 'vfx_fireball' },
      { code: Phaser.Input.Keyboard.KeyCodes.THREE, vfxKey: 'vfx_frost_nova' },
      { code: Phaser.Input.Keyboard.KeyCodes.FOUR, vfxKey: 'vfx_lightning_strike' },
      { code: Phaser.Input.Keyboard.KeyCodes.FIVE, vfxKey: 'vfx_holy_smite' },
      { code: Phaser.Input.Keyboard.KeyCodes.SIX, vfxKey: 'vfx_divine_heal' },
      { code: Phaser.Input.Keyboard.KeyCodes.Q, vfxKey: 'vfx_sword_combo' },
      { code: Phaser.Input.Keyboard.KeyCodes.E, vfxKey: 'vfx_divine_shield' },
      { code: Phaser.Input.Keyboard.KeyCodes.R, vfxKey: 'vfx_spin_slash' },
      { code: Phaser.Input.Keyboard.KeyCodes.F, vfxKey: 'vfx_earth_stomp' },
      { code: Phaser.Input.Keyboard.KeyCodes.V, vfxKey: 'vfx_shadow_step' },
      { code: Phaser.Input.Keyboard.KeyCodes.SPACE, vfxKey: 'vfx_dash_strike' },
    ];

    for (const binding of hotkeyMap) {
      const keyObj = keyboard.addKey(binding.code);
      keyObj.on('down', () => {
        // Prevent rapid overlapping spam under 150ms
        const now = Date.now();
        if (now - this.lastCastTime < 150) return;
        this.lastCastTime = now;
        this.castSkillVfx(binding.vfxKey);
      });
    }
  }

  /**
   * Casts a Full HD 256px Skill VFX with exact pivot alignment
   */
  public castSkillVfx(vfxKey: string) {
    const def: SkillVfxDefinition | undefined = SKILL_VFX_REGISTRY[vfxKey];
    if (!def) {
      console.warn(`[SkillVFX] Unknown skill VFX: ${vfxKey}`);
      return;
    }

    const facingLeft = this.player.flipX;
    const spawnX = this.player.x;
    const spawnY = this.player.y;

    // Find nearest active training dummy target
    const activeDummies = this.dummies.filter((d) => !d.isDead);
    let nearestDummy = activeDummies.find(
      (d) => Phaser.Math.Distance.Between(spawnX, spawnY, d.sprite.x, d.sprite.y) < 480
    );

    // Three.js Modular VFX Engine integration
    const skillIdMap: Record<string, string> = {
      vfx_sword_slash: 'skill_sword_slash',
      vfx_fireball: 'skill_fireball',
      vfx_frost_nova: 'skill_frost_nova',
      vfx_lightning_strike: 'skill_lightning_strike',
      vfx_holy_smite: 'skill_holy_smite',
      vfx_divine_heal: 'skill_divine_heal',
      vfx_sword_combo: 'skill_sword_combo',
      vfx_divine_shield: 'skill_divine_shield',
      vfx_spin_slash: 'skill_spin_slash',
      vfx_earth_stomp: 'skill_heavy_cleave',
      vfx_shadow_step: 'skill_homing_missile',
      vfx_dash_strike: 'skill_arrow_shot',
    };

    const mappedSkillId = skillIdMap[vfxKey];
    networkService.sendCombatAction('skill', mappedSkillId || vfxKey, nearestDummy?.id, spawnX, spawnY);
    if (mappedSkillId && this.threeVfx) {
      const sourcePos = { x: spawnX, y: spawnY };
      const targetPos = nearestDummy
        ? { x: nearestDummy.sprite.x, y: nearestDummy.sprite.y }
        : { x: spawnX + (facingLeft ? -220 : 220), y: spawnY };

      this.threeVfx.castSkill(mappedSkillId, sourcePos, targetPos, {
        onImpact: () => {
          if (nearestDummy && !nearestDummy.isDead) {
            this.hitDummy(nearestDummy, def.name);
          }
        },
        onDamageFrame: () => {
          if (nearestDummy && !nearestDummy.isDead) {
            this.hitDummy(nearestDummy, def.name);
          }
        },
      });
    }

    // Create 256x256 sprite
    const vfxSprite = this.add.sprite(spawnX, spawnY, vfxKey);
    vfxSprite.setOrigin(def.pivotNorm[0], def.pivotNorm[1]);
    vfxSprite.setFlipX(facingLeft);
    vfxSprite.setDepth(20);

    // Play animation
    vfxSprite.play(`anim_${vfxKey}`);
    vfxSprite.once('animationcomplete', () => {
      vfxSprite.destroy();
    });

    // Character physical recoil / cast squash & stretch
    this.tweens.add({
      targets: this.player,
      scaleX: facingLeft ? -1.5 : 1.5,
      scaleY: 1.25,
      duration: 90,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    // Play skill character animation if available
    if (!this.isDead && this.anims.exists('char_novice_skill')) {
      this.isActionLocked = true;
      this.player.play('char_novice_skill', true);
      this.player.once('animationcomplete', () => {
        this.isActionLocked = false;
        if (this.player.active && !this.isDead) {
          this.player.play('char_novice_idle', true);
        }
      });
    }

    // Floating combat announcement banner
    this.showSkillBanner(def.name);

    // Camera rumble on high-impact skills
    if (['vfx_lightning_strike', 'vfx_earth_stomp', 'vfx_ground_slam', 'vfx_holy_smite'].includes(vfxKey)) {
      this.cameras.main.shake(160, 0.005);
    }

    // Highlight button in HUD if present
    const btn = document.querySelector(`[data-vfx-key="${vfxKey}"]`) as HTMLElement | null;
    if (btn) {
      btn.classList.add('active-cast');
      setTimeout(() => btn.classList.remove('active-cast'), 300);
    }
  }

  /**
   * Normal basic sword attack with [J] key
   */
  private performBasicAttack() {
    if (this.isActionLocked || this.isDead) return;
    this.isActionLocked = true;
    if (this.anims.exists('char_novice_attack')) {
      this.player.play('char_novice_attack', true);
      this.player.once('animationcomplete', () => {
        this.isActionLocked = false;
        if (this.player.active && !this.isDead) {
          this.player.play('char_novice_idle', true);
        }
      });
    } else {
      this.isActionLocked = false;
    }
    this.castSkillVfx('vfx_sword_slash');
  }

  /**
   * Hurt reaction with [H] key
   */
  private performHurt() {
    if (this.isDead) return;
    this.isActionLocked = true;
    if (this.anims.exists('char_novice_hurt')) {
      this.player.play('char_novice_hurt', true);
      this.player.once('animationcomplete', () => {
        this.isActionLocked = false;
        if (this.player.active && !this.isDead) {
          this.player.play('char_novice_idle', true);
        }
      });
    }
    this.showSkillBanner('Bị Thương! -35 HP');
    this.cameras.main.shake(120, 0.003);
  }

  /**
   * Death / Revive toggle with [K] key
   */
  private toggleDeath() {
    if (!this.isDead) {
      this.isDead = true;
      this.isActionLocked = true;
      if (this.anims.exists('char_novice_death')) {
        this.player.play('char_novice_death', true);
      }
      this.showSkillBanner('Tử Trận! Nhấn [K] để Hồi Sinh');
    } else {
      this.isDead = false;
      this.isActionLocked = false;
      if (this.anims.exists('char_novice_idle')) {
        this.player.play('char_novice_idle', true);
      }
      this.showSkillBanner('✦ Hồi Sinh Thành Công! ✦');
    }
  }

  /**
   * Shows a floating skill name banner over player
   */
  private showSkillBanner(text: string) {
    const bannerY = (!this.currentCharacter || this.currentCharacter.classId === 'novice') ? this.player.y - 145 : this.player.y - 235;
    const banner = this.add.text(this.player.x, bannerY, `✦ ${text} ✦`, {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fef08a',
      stroke: '#05070a',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: banner,
      y: bannerY - 45,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => banner.destroy(),
    });
  }

  /**
   * Initializes practice combat dummy monsters in town square
   */
  private initTrainingDummies(spawnX: number, spawnY: number) {
    const dummyData = [
      { id: 'slime', name: 'Thảo Nguyên Slime [Lv.5]', x: spawnX + 160, y: spawnY - 20, color: 0x22c55e, hp: 500, radius: 24 },
      { id: 'goblin', name: 'Goblin Thiết Giáp [Lv.25]', x: spawnX + 280, y: spawnY + 40, color: 0xeab308, hp: 1400, radius: 28 },
      { id: 'dragon', name: 'Hắc Long Ma Vương [Boss]', x: spawnX + 420, y: spawnY - 60, color: 0xa855f7, hp: 6000, radius: 36 },
    ];

    for (const data of dummyData) {
      const shadow = this.add.ellipse(data.x, data.y + data.radius * 0.7, data.radius * 1.8, 12, 0x000000, 0.45);
      const circle = this.add.circle(data.x, data.y, data.radius, data.color);
      circle.setStrokeStyle(2, 0xffffff, 0.6);

      const nameText = this.add.text(data.x, data.y - data.radius - 22, data.name, {
        fontFamily: 'Segoe UI, Arial, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#f8fafc',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);

      const hpBar = this.add.graphics();

      const dummyObj = {
        id: data.id,
        name: data.name,
        sprite: circle,
        shadow,
        hp: data.hp,
        maxHp: data.hp,
        hpBar,
        nameText,
        isDead: false,
        origX: data.x,
        origY: data.y,
        radius: data.radius,
        color: data.color,
      };

      this.dummies.push(dummyObj);
      this.updateDummyHpBar(dummyObj);
    }
  }

  private updateDummyHpBar(dummy: any) {
    const bar = dummy.hpBar;
    bar.clear();
    if (dummy.isDead) return;

    const barW = 60;
    const barH = 5;
    const x = dummy.sprite.x - barW / 2;
    const y = dummy.sprite.y - dummy.radius - 10;

    // Background
    bar.fillStyle(0x0f172a, 0.8);
    bar.fillRect(x, y, barW, barH);

    // HP Fill
    const ratio = Math.max(0, dummy.hp / dummy.maxHp);
    const color = ratio > 0.5 ? 0x22c55e : ratio > 0.2 ? 0xf59e0b : 0xef4444;
    bar.fillStyle(color, 1.0);
    bar.fillRect(x, y, barW * ratio, barH);

    bar.lineStyle(1, 0x000000, 0.8);
    bar.strokeRect(x, y, barW, barH);
  }

  private hitDummy(dummy: any, skillName: string) {
    if (dummy.isDead) return;

    const isCrit = Math.random() < 0.35;
    const damage = Math.floor((160 + Math.random() * 80) * (isCrit ? 1.8 : 1.0));

    // Flash hit
    dummy.sprite.setFillStyle(0xffffff);
    this.time.delayedCall(80, () => {
      dummy.sprite.setFillStyle(dummy.color);
    });

    // Knockback
    const kx = dummy.sprite.x > this.player.x ? 25 : -25;
    this.tweens.add({
      targets: [dummy.sprite, dummy.nameText, dummy.shadow],
      x: dummy.sprite.x + kx,
      duration: 120,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    // Floating damage text in Phaser scene
    this.showDamageNumber(dummy.sprite.x, dummy.sprite.y - 30, damage, isCrit);

    // Three.js Hit-stop
    if (this.threeVfx) {
      this.threeVfx.triggerHitStop(3);
    }

    dummy.hp = Math.max(0, dummy.hp - damage);
    this.updateDummyHpBar(dummy);

    // Broadcast target hit to Master HUD monster bar & floating damage text
    window.dispatchEvent(new CustomEvent('elysia-target-hit', {
      detail: { name: dummy.name, hp: dummy.hp, maxHp: dummy.maxHp, level: 10 }
    }));
    window.dispatchEvent(new CustomEvent('elysia-floating-dmg', {
      detail: {
        x: window.innerWidth / 2 + (Math.random() * 60 - 30),
        y: window.innerHeight / 2 - 50,
        damage,
        isCrit
      }
    }));

    if (dummy.hp <= 0) {
      dummy.isDead = true;
      if (this.threeVfx) {
        this.threeVfx.spawnMonsterDeath({ x: dummy.sprite.x, y: dummy.sprite.y });
      }
      dummy.sprite.setVisible(false);
      dummy.hpBar.setVisible(false);
      dummy.nameText.setText(`[TỬ TRẬN - HỒI SINH TRONG 3S]`);

      this.time.delayedCall(3500, () => {
        dummy.hp = dummy.maxHp;
        dummy.isDead = false;
        dummy.sprite.setVisible(true);
        dummy.hpBar.setVisible(true);
        dummy.sprite.setPosition(dummy.origX, dummy.origY);
        dummy.shadow.setPosition(dummy.origX, dummy.origY + dummy.radius * 0.7);
        dummy.nameText.setPosition(dummy.origX, dummy.origY - dummy.radius - 22);
        dummy.nameText.setText(dummy.name);
        this.updateDummyHpBar(dummy);
      });
    }
  }

  private showDamageNumber(x: number, y: number, amount: number, isCrit: boolean) {
    const text = this.add.text(x + (Math.random() - 0.5) * 20, y, isCrit ? `CRIT! ${amount}` : `${amount}`, {
      fontFamily: 'Consolas, monospace',
      fontSize: isCrit ? '16px' : '13px',
      fontStyle: 'bold',
      color: isCrit ? '#facc15' : '#f87171',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(250);

    this.tweens.add({
      targets: text,
      y: y - 55,
      alpha: 0,
      scaleX: isCrit ? 1.6 : 1.2,
      scaleY: isCrit ? 1.6 : 1.2,
      duration: 850,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  public updatePlayerCharacter(char: CharacterEntity) {
    this.currentCharacter = char;
    if (this.nameplate) {
      this.nameplate.setText(char.name);
    }
    if (this.titleplate) {
      const cls = INITIAL_CLASSES.find((c) => c.id === char.classId);
      const title = cls ? cls.name.split(' (')[0] : char.classId;
      this.titleplate.setText(`<${title} Lv.${char.level}>`);
    }

    // Update Sprite texture
    if (this.player) {
      if (char.classId === 'swordsman') {
        this.player.stop();
        this.player.setTexture('char_swordsman_female_master');
        this.player.setOrigin(0.5, 0.9297);
        this.player.setScale(0.85);
      } else {
        this.player.setOrigin(0.5, 0.875);
        this.player.setScale(1.4);
        this.player.play('char_novice_idle', true);
      }
    }

    // Update HUD
    const hudDisplay = document.getElementById('active-character-display');
    if (hudDisplay) {
      const cls = INITIAL_CLASSES.find((c) => c.id === char.classId);
      const title = cls ? cls.name.split(' (')[0] : char.classId;
      hudDisplay.innerHTML = `Nhân vật: <strong>${char.name}</strong> (${title} Lv.${char.level})`;
    }
  }

  /**
   * Equips a weapon in real-time
   */
  public equipWeapon(weapon: WeaponEntity) {
    const weaponName = weapon.item?.name || weapon.weaponId;
    this.showSkillBanner(`Trang Bị: ${weaponName} (+${weapon.attackPower} ATK)`);

    // Aura Flash Tween
    this.tweens.add({
      targets: this.player,
      tint: 0xfef08a,
      duration: 160,
      yoyo: true,
      onComplete: () => {
        this.player.clearTint();
      },
    });
  }

  /**
   * Uses a consumable / potion
   */
  public useConsumable(item: ItemEntity) {
    if (item.properties?.hpRestore) {
      this.showSkillBanner(`Hồi Phục: +${item.properties.hpRestore} HP!`);
      this.castSkillVfx('vfx_divine_heal');
    } else {
      this.showSkillBanner(`Đã dùng: ${item.name}`);
    }
  }

  update(_time: number, delta: number) {
    const dt = delta / 1000;

    if (this.isDead) {
      // Character is dead, freeze movement
      if (this.threeVfx) {
        this.threeVfx.update(dt);
      }
      return;
    }

    // Movement logic (8-direction)
    let vx = 0;
    let vy = 0;

    if (!this.isActionLocked) {
      if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;
      if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;
      if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;
      if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;
    }

    const isRunning = this.keyShift && this.keyShift.isDown;
    const currentSpeed = isRunning ? 250 : 160;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    // Flip sprite according to horizontal move direction
    if (vx < 0) {
      this.player.setFlipX(true);
    } else if (vx > 0) {
      this.player.setFlipX(false);
    }

    const isMoving = vx !== 0 || vy !== 0;

    // Animation state update for novice character
    const isNovice = !this.currentCharacter || this.currentCharacter.classId === 'novice';
    if (isNovice && !this.isActionLocked) {
      if (isMoving) {
        if (isRunning) {
          if (this.player.anims.currentAnim?.key !== 'char_novice_run') {
            this.player.play('char_novice_run', true);
          }
        } else {
          if (this.player.anims.currentAnim?.key !== 'char_novice_walk') {
            this.player.play('char_novice_walk', true);
          }
        }
      } else {
        if (this.player.anims.currentAnim?.key !== 'char_novice_idle') {
          this.player.play('char_novice_idle', true);
        }
      }
    }

    this.player.x += vx * currentSpeed * dt;
    this.player.y += vy * currentSpeed * dt;

    // Keep nameplate and shadow aligned with player position
    const nameplateOffsetY = isNovice ? 120 : 200;
    const titleplateOffsetY = isNovice ? 105 : 182;
    if (this.nameplate) {
      this.nameplate.setPosition(this.player.x, this.player.y - nameplateOffsetY);
    }
    if (this.titleplate) {
      this.titleplate.setPosition(this.player.x, this.player.y - titleplateOffsetY);
    }
    if (this.shadow) {
      this.shadow.setPosition(this.player.x, this.player.y);
    }

    // Update Debug Metrics
    if (this.debugText) {
      const fps = Math.round(this.game.loop.actualFps);
      const charName = this.currentCharacter ? this.currentCharacter.name : 'ELYSIA_NOVICE_FEMALE_001';
      this.debugText.setText(
        `FPS: ${fps} | ${charName} | WASD/Mũi tên: Di chuyển (Giữ Shift: Chạy) | [J]: Đánh kiếm | [1-6,Q,E,R,F,V]: Skill VFX | [H]: Bị thương | [K]: Tử trận`
      );
    }

    // Direct Phaser render loop drives Three.js updates with synchronized world camera
    if (this.threeVfx) {
      const camX = this.cameras.main.scrollX + this.cameras.main.width / 2;
      const camY = this.cameras.main.scrollY + this.cameras.main.height / 2;
      const zoom = this.cameras.main.zoom;
      this.threeVfx.update(dt, camX, camY, zoom);
    }

    // Broadcast coordinate updates to Master HUD minimap
    if (isMoving && Math.random() < 0.2) {
      window.dispatchEvent(new CustomEvent('elysia-player-coord', { detail: { x: this.player.x, y: this.player.y } }));
    }

    // Realtime Multiplayer Movement Sync (20Hz throttled)
    const now = Date.now();
    if (isMoving && now - this.lastNetworkSync > 50) {
      this.lastNetworkSync = now;
      networkService.sendMovement(
        Math.round(this.player.x),
        Math.round(this.player.y),
        isRunning ? 'run' : 'walk',
        vx < 0 ? 'west' : vx > 0 ? 'east' : vy < 0 ? 'north' : 'south'
      );
    }

    // Smoothly interpolate remote players
    for (const [_, remote] of this.remotePlayers) {
      remote.sprite.x = Phaser.Math.Linear(remote.sprite.x, remote.targetX, 0.25);
      remote.sprite.y = Phaser.Math.Linear(remote.sprite.y, remote.targetY, 0.25);
      remote.shadow.setPosition(remote.sprite.x, remote.sprite.y);
      remote.nameplate.setPosition(remote.sprite.x, remote.sprite.y - 120);
      remote.titleplate.setPosition(remote.sprite.x, remote.sprite.y - 105);
    }

    // Roaming AI for active monsters
    for (const m of this.dummies) {
      if (m.isDead || !m.roam) continue;
      m.roamTimer = (m.roamTimer || 0) + dt;
      if (m.roamTimer > m.nextRoam) {
        m.roamTimer = 0;
        m.nextRoam = 3 + Math.random() * 4;
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 60;
        const targetX = m.origX + Math.cos(angle) * dist;
        const targetY = m.origY + Math.sin(angle) * dist;
        this.tweens.add({
          targets: [m.sprite, m.shadow, m.nameText],
          x: targetX,
          y: (target: any) => target === m.shadow ? targetY + m.radius * 0.7 : target === m.nameText ? targetY - m.radius - 22 : targetY,
          duration: 1200 + Math.random() * 600,
          ease: 'Sine.easeInOut',
          onUpdate: () => this.updateDummyHpBar(m)
        });
      }
    }
  }

  /**
   * Connects to Authoritative Socket.IO Gateway
   */
  private initMultiplayerNetwork(spawnX: number, spawnY: number) {
    networkService.connect();

    const charId = this.currentCharacter?.id || 'char_local_001';
    const charName = this.currentCharacter?.name || 'ELYSIA_NOVICE_FEMALE_001';
    const classId = this.currentCharacter?.classId || 'novice';
    const gender = this.currentCharacter?.gender || 'female';
    const level = this.currentCharacter?.level || 1;

    networkService.joinGame({
      characterId: charId,
      name: charName,
      classId,
      gender,
      level,
      regionId: this.currentRegionId,
      x: spawnX,
      y: spawnY,
    });

    networkService.onWorldPlayers = (players: RemotePlayer[]) => {
      for (const p of players) {
        this.addRemotePlayer(p);
      }
    };

    networkService.onPlayerJoined = (player: RemotePlayer) => {
      this.addRemotePlayer(player);
      this.showSkillBanner(`[Đồng hành] ${player.name} vừa xuất hiện!`);
    };

    networkService.onPlayerMoved = (data) => {
      const remote = this.remotePlayers.get(data.socketId);
      if (remote) {
        remote.targetX = data.x;
        remote.targetY = data.y;
        if (data.direction === 'west') remote.sprite.setFlipX(true);
        if (data.direction === 'east') remote.sprite.setFlipX(false);
      }
    };

    networkService.onPlayerLeft = (data) => {
      const remote = this.remotePlayers.get(data.socketId);
      if (remote) {
        remote.sprite.destroy();
        remote.shadow.destroy();
        remote.nameplate.destroy();
        remote.titleplate.destroy();
        this.remotePlayers.delete(data.socketId);
      }
    };

    networkService.onPlayerAction = (data) => {
      const remote = this.remotePlayers.get(data.socketId);
      if (remote && data.skillId && this.threeVfx) {
        this.threeVfx.castSkill(
          data.skillId,
          { x: remote.sprite.x, y: remote.sprite.y },
          { x: remote.sprite.x + (remote.sprite.flipX ? -150 : 150), y: remote.sprite.y }
        );
      }
    };
  }

  private addRemotePlayer(player: RemotePlayer) {
    if (this.remotePlayers.has(player.socketId)) return;

    const shadow = this.add.ellipse(player.x, player.y, 68, 20, 0x000000, 0.45);
    const sprite = this.add.sprite(player.x, player.y, 'char_swordsman_anim_idle', 0);
    sprite.setOrigin(0.5, 0.9297);
    sprite.play('char_novice_idle');
    sprite.setTint(0x93c5fd);

    const cls = INITIAL_CLASSES.find((c) => c.id === player.classId);
    const title = cls ? cls.name.split(' (')[0] : player.classId;

    const nameplate = this.add.text(player.x, player.y - 120, player.name, {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#38bdf8',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const titleplate = this.add.text(player.x, player.y - 105, `<${title} Lv.${player.level}>`, {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '11px',
      color: '#cbd5e1',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.remotePlayers.set(player.socketId, {
      sprite,
      shadow,
      nameplate,
      titleplate,
      targetX: player.x,
      targetY: player.y,
    });
  }

  /**
   * Ingests canonical world monsters from backend or local database
   */
  private async initWorldMonsters(spawnX: number, spawnY: number) {
    try {
      const monsters = await fetchMonsters();
      const hasMonsters = Array.isArray(monsters) && monsters.length > 0;
      if (!hasMonsters) return;

      const fieldMonsters = [
        { id: 'MON_SLIME_GREEN', name: 'Slime Xanh [Lv.1]', offX: -260, offY: -180, color: 0x4ade80, hp: 120, radius: 22 },
        { id: 'MON_HORN_SLIME', name: 'Slime Sừng Nhọn [Lv.3]', offX: 320, offY: -220, color: 0x2dd4bf, hp: 280, radius: 25 },
        { id: 'MON_SPROUTLING', name: 'Mầm Cây Tinh Linh [Lv.4]', offX: -340, offY: 190, color: 0xa3e635, hp: 360, radius: 24 },
        { id: 'MON_WOLF_THORN', name: 'Sói Gai Rừng Sâu [Lv.8]', offX: 480, offY: 260, color: 0xf59e0b, hp: 850, radius: 28 },
        { id: 'MON_FOREST_BOAR', name: 'Heo Rừng Thiết Bì [Lv.9]', offX: -460, offY: 340, color: 0xd97706, hp: 1100, radius: 30 },
        { id: 'MON_CAVE_BAT', name: 'Dơi Bóng Tối [Lv.11]', offX: 580, offY: -320, color: 0x818cf8, hp: 1350, radius: 26 },
        { id: 'MON_SKELETON_MINER', name: 'Thợ Mỏ Xương Khô [Lv.13]', offX: -600, offY: -280, color: 0x94a3b8, hp: 1750, radius: 28 },
        { id: 'MON_FROST_DRAKE', name: 'Băng Long Con [Lv.16]', offX: 680, offY: 420, color: 0x38bdf8, hp: 2800, radius: 34 },
      ];

      for (const m of fieldMonsters) {
        const mx = spawnX + m.offX;
        const my = spawnY + m.offY;

        const shadow = this.add.ellipse(mx, my + m.radius * 0.7, m.radius * 1.8, 12, 0x000000, 0.45);
        const circle = this.add.circle(mx, my, m.radius, m.color);
        circle.setStrokeStyle(2, 0xffffff, 0.6);

        const nameText = this.add.text(mx, my - m.radius - 22, m.name, {
          fontFamily: 'Segoe UI, Arial, sans-serif',
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#f8fafc',
          stroke: '#000000',
          strokeThickness: 3,
        }).setOrigin(0.5);

        const hpBar = this.add.graphics();

        const dummyObj = {
          id: m.id,
          name: m.name,
          sprite: circle,
          shadow,
          hp: m.hp,
          maxHp: m.hp,
          hpBar,
          nameText,
          isDead: false,
          origX: mx,
          origY: my,
          radius: m.radius,
          color: m.color,
          roam: true,
          roamTimer: 0,
          nextRoam: 2 + Math.random() * 3,
        };

        this.dummies.push(dummyObj);
        this.updateDummyHpBar(dummyObj);
      }
    } catch {
      console.warn('[WorldScene] Could not fetch remote monsters, keeping training dummies.');
    }
  }
}
