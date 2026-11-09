/**
 * ELYSIA NO DENSETSU — MASTER IN-GAME MMORPG HUD
 * Japanese Anime Chibi Fantasy UI/UX Architecture
 */

export interface PlayerStats {
  name: string;
  level: number;
  classTitle: string;
  combatPower: number;
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
  currentExp: number;
  maxExp: number;
  avatarUrl: string;
}

export interface SkillConfig {
  id: string;
  name: string;
  hotkey: string;
  icon: string;
  mpCost: number;
  cooldownSec: number;
  vfxKey: string;
  group: 'primary' | 'secondary' | 'ultimate' | 'basic';
}

export class MasterHUD {
  private container: HTMLElement | null = null;
  private minimapCanvas: HTMLCanvasElement | null = null;
  private minimapCtx: CanvasRenderingContext2D | null = null;

  // Player Stats State
  private stats: PlayerStats = {
    name: 'Tada',
    level: 12,
    classTitle: 'Swordsman (Kiếm Sĩ)',
    combatPower: 2480,
    currentHp: 320,
    maxHp: 320,
    currentMp: 180,
    maxMp: 180,
    currentExp: 650,
    maxExp: 1000,
    avatarUrl: '/assets/characters/female/novice/master/novice_female_master_256.png',
  };

  // Cooldown Trackers (skillId -> endTimestamp)
  private cooldowns: Map<string, number> = new Map();

  // Exactly 10 Skills (5 Primary + 4 Secondary + 1 Ultimate) + 1 Basic Attack
  private skills: SkillConfig[] = [
    // GROUP 1: FIVE PRIMARY SKILLS (Keys: 1, 2, 3, 4, 5)
    { id: 'skill_1', name: 'Kiếm Trảm', hotkey: '1', icon: '⚔️', mpCost: 15, cooldownSec: 2.5, vfxKey: 'vfx_sword_slash', group: 'primary' },
    { id: 'skill_2', name: 'Hỏa Cầu', hotkey: '2', icon: '🔥', mpCost: 25, cooldownSec: 4.0, vfxKey: 'vfx_fireball', group: 'primary' },
    { id: 'skill_3', name: 'Băng Sương', hotkey: '3', icon: '❄️', mpCost: 30, cooldownSec: 6.0, vfxKey: 'vfx_frost_nova', group: 'primary' },
    { id: 'skill_4', name: 'Thiên Lôi', hotkey: '4', icon: '⚡', mpCost: 45, cooldownSec: 8.0, vfxKey: 'vfx_lightning_strike', group: 'primary' },
    { id: 'skill_5', name: 'Thánh Quang', hotkey: '5', icon: '✨', mpCost: 50, cooldownSec: 10.0, vfxKey: 'vfx_holy_smite', group: 'primary' },

    // GROUP 2: FOUR SECONDARY SKILLS (Keys: Q, W, E, R)
    { id: 'skill_q', name: 'Tam Liên', hotkey: 'Q', icon: '🗡️', mpCost: 20, cooldownSec: 5.0, vfxKey: 'vfx_sword_combo', group: 'secondary' },
    { id: 'skill_w', name: 'Ám Ảnh Bộ', hotkey: 'W', icon: '🌑', mpCost: 15, cooldownSec: 4.0, vfxKey: 'vfx_shadow_step', group: 'secondary' },
    { id: 'skill_e', name: 'Khiên Thánh', hotkey: 'E', icon: '🛡️', mpCost: 35, cooldownSec: 12.0, vfxKey: 'vfx_divine_shield', group: 'secondary' },
    { id: 'skill_r', name: 'Toàn Phong', hotkey: 'R', icon: '🌀', mpCost: 40, cooldownSec: 9.0, vfxKey: 'vfx_spin_slash', group: 'secondary' },

    // GROUP 3: ONE ULTIMATE SKILL (SPACE / F)
    { id: 'skill_ult', name: 'Tuyệt Kỹ: Long Thần Nộ Hống', hotkey: 'SPACE', icon: '🐉', mpCost: 100, cooldownSec: 30.0, vfxKey: 'vfx_dash_strike', group: 'ultimate' },

    // SEPARATE BASIC ATTACK
    { id: 'skill_basic', name: 'Trảm Kích', hotkey: 'J', icon: '⚔️', mpCost: 0, cooldownSec: 0.6, vfxKey: 'vfx_sword_slash', group: 'basic' },
  ];

  // Exactly 3 Quick Consumable Slots
  private consumables = [
    { id: 'hp_potion', name: 'Bình Máu Nhỏ', hotkey: 'Z', qty: 15, iconUrl: '/assets/weapons/potion_hp_small_icon.png' },
    { id: 'mp_potion', name: 'Bình Mana Nhỏ', hotkey: 'X', qty: 20, iconUrl: '/assets/items/wooden_arrows_icon.png' },
    { id: 'food_buff', name: 'Bánh Mì Lúa Mạch', hotkey: 'C', qty: 8, iconUrl: '/assets/weapons/novice_sword_icon.png' },
  ];

  // Callback listeners
  public onOpenCharacterInventory?: () => void;
  public onOpenShop?: () => void;
  public onOpenWorldMap?: () => void;
  public onOpenQuestLog?: () => void;
  public onOpenEvents?: () => void;
  public onOpenSettings?: () => void;
  public onOpenAuth?: () => void;
  public onCastSkill?: (vfxKey: string) => void;
  public onUseConsumable?: (consumableId: string) => void;

  constructor() {
    this.createDom();
    this.initKeyboardListeners();
    this.startCooldownLoop();
    this.initMinimapLoop();
  }

  private createDom() {
    // Check if master hud already exists
    let root = document.getElementById('master-hud-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'master-hud-root';
      document.body.appendChild(root);
    }
    this.container = root;

    root.innerHTML = `
      <!-- TOP LEFT: PLAYER PROFILE PANEL -->
      <div class="player-profile-panel hud-interactive" id="hud-player-profile" title="Bấm vào để mở Nhân Vật & Túi Đồ [C / I]">
        <div class="player-avatar-wrapper">
          <img src="${this.stats.avatarUrl}" alt="Avatar" class="player-avatar-img" id="hud-avatar-img" />
          <div class="player-avatar-ring"></div>
          <div class="player-level-badge" id="hud-level-badge">Lv.${this.stats.level}</div>
        </div>

        <div class="player-details-col">
          <div class="player-header-row">
            <span class="player-name-text" id="hud-player-name">${this.stats.name}</span>
            <span class="player-class-text" id="hud-player-class">${this.stats.classTitle}</span>
          </div>

          <div class="player-cp-badge" id="hud-combat-power" title="Lực chiến tổng hợp">
            <span>⚔️ Lực chiến:</span>
            <strong id="hud-cp-val">${this.stats.combatPower.toLocaleString()}</strong>
          </div>

          <!-- HP BAR -->
          <div class="bar-track" title="Điểm Sinh Lực (HP)">
            <div class="bar-fill bar-fill-hp" id="hud-hp-bar" style="width: ${(this.stats.currentHp / this.stats.maxHp) * 100}%"></div>
            <div class="bar-text" id="hud-hp-text">HP: ${this.stats.currentHp}/${this.stats.maxHp}</div>
          </div>

          <!-- MP BAR -->
          <div class="bar-track" title="Điểm Năng Lượng (MP)">
            <div class="bar-fill bar-fill-mp" id="hud-mp-bar" style="width: ${(this.stats.currentMp / this.stats.maxMp) * 100}%"></div>
            <div class="bar-text" id="hud-mp-text">MP: ${this.stats.currentMp}/${this.stats.maxMp}</div>
          </div>

          <!-- EXP BAR -->
          <div class="bar-track" style="height: 6px;" title="Kinh Nghiệm Cấp Độ (EXP)">
            <div class="bar-fill bar-fill-exp" id="hud-exp-bar" style="width: ${(this.stats.currentExp / this.stats.maxExp) * 100}%"></div>
          </div>

          <!-- ACTIVE BUFFS -->
          <div class="player-buffs-row">
            <div class="buff-chip" title="Chiến Ý: Tăng 10% Sát Thương Vật Lý (còn 14m)">⚔️ +10% Công</div>
            <div class="buff-chip" title="Khiên Thần Hộ Thể: Tăng 15% Phòng Ngự (còn 28m)">🛡️ +15% Thủ</div>
            <div class="buff-chip" title="Phong Tinh Lạc: Tăng 20% Tốc Độ Di Chuyển (còn 8m)">⚡ +20% Tốc</div>
          </div>
        </div>
      </div>

      <!-- LEFT SIDE: COLLAPSIBLE QUEST TRACKER -->
      <div class="quest-tracker-container hud-interactive" id="hud-quest-tracker">
        <div class="quest-header-bar" id="quest-header-toggle">
          <div class="quest-header-title">
            <span>📜</span>
            <span>NHIỆM VỤ</span>
          </div>
          <button class="quest-collapse-btn" id="btn-toggle-quest" title="Thu gọn / Mở rộng">◀</button>
        </div>

        <div class="quest-body-content">
          <div class="quest-category-badge">✦ MAIN QUEST (CHÍNH TUYẾN)</div>
          <div class="quest-item-title">Ngôi Làng Bình Yên (The Peaceful Village)</div>
          <div class="quest-item-desc">Đến gặp Trưởng Làng Tam tại quảng trường trung tâm làng tân thủ để nhận vũ khí ban đầu.</div>

          <div class="quest-progress-box">
            <span>Trò chuyện với Trưởng Làng Tam:</span>
            <strong style="color: #38bdf8;">0 / 1</strong>
          </div>

          <div class="quest-rewards-preview">
            <span>Phần thưởng:</span>
            <span class="quest-reward-chip">+500 EXP</span>
            <span class="quest-reward-chip">+200 Vàng</span>
            <span class="quest-reward-chip">Kiếm Thép</span>
          </div>

          <button class="quest-autopath-btn" id="btn-quest-autopath">
            <span>🧭</span>
            <span>Tự Tìm Đường (Auto-Path)</span>
          </button>
        </div>
      </div>

      <!-- TOP CENTER: MONSTER TARGET HUD -->
      <div class="monster-target-hud hud-interactive hidden" id="hud-monster-target">
        <div class="monster-avatar-frame">🐺</div>
        <div class="monster-info-col">
          <div class="monster-title-row">
            <span class="monster-name-text" id="target-monster-name">Bù Nhìn Luyện Kiếm (Training Dummy)</span>
            <span class="monster-level-text" id="target-monster-lvl">Lv.10 ELITE</span>
          </div>
          <div class="bar-track" style="height: 12px;">
            <div class="bar-fill bar-fill-hp" id="target-monster-hp" style="width: 85%;"></div>
            <div class="bar-text" id="target-monster-hp-text">850 / 1,000</div>
          </div>
        </div>
      </div>

      <!-- TOP RIGHT: CIRCULAR MINIMAP & UTILITY PANEL -->
      <div class="minimap-container hud-interactive">
        <div class="minimap-frame">
          <canvas class="minimap-canvas" id="minimap-radar-canvas" width="170" height="170"></canvas>
          <div class="minimap-compass-n">N</div>
          <div class="minimap-center-player"></div>
        </div>

        <div class="minimap-info-bar">
          <span class="minimap-map-name">Tân Thủ Thôn (Village)</span>
          <span class="minimap-coords" id="minimap-coords-text">X: 125 | Y: 087</span>
        </div>

        <!-- ACTION BUTTONS UNDER MINIMAP -->
        <div class="minimap-actions-row">
          <button class="mini-action-btn" id="btn-hud-worldmap" title="Bản Đồ Thế Giới [M]">🗺️</button>
          <button class="mini-action-btn" id="btn-hud-events" title="Sự Kiện [F8]">🎉</button>
          <button class="mini-action-btn" id="btn-hud-shop" title="Cửa Hàng Trực Tuyến [F9]">💎</button>
          <button class="mini-action-btn" id="btn-hud-character" title="Nhân Vật & Túi Đồ [C / I]">🎒</button>
          <button class="mini-action-btn" id="btn-hud-settings" title="Cài Đặt Hệ Thống [ESC]">⚙️</button>
          <button class="mini-action-btn" id="btn-hud-auth" title="Đăng Nhập / Đổi Tài Khoản">🔑</button>
        </div>
      </div>

      <!-- BOTTOM CENTER: COMBAT HUD DOCK (5 PRIMARY + 4 SECONDARY + 1 ULTIMATE + 1 BASIC ATTACK + 3 POTIONS) -->
      <div class="combat-hud-dock hud-interactive">
        <!-- EXACTLY 3 QUICK CONSUMABLES -->
        <div class="quick-consumables-box">
          ${this.consumables
            .map(
              (c) => `
            <div class="consumable-slot" data-consumable-id="${c.id}" title="${c.name} (Phím [${c.hotkey}])">
              <span class="consumable-key">${c.hotkey}</span>
              <img src="${c.iconUrl}" alt="${c.name}" class="consumable-icon" onerror="this.src='/assets/weapons/potion_hp_small_icon.png'" />
              <span class="consumable-qty" id="qty-${c.id}">${c.qty}</span>
              <div class="skill-cooldown-overlay" id="cd-con-${c.id}">
                <span class="skill-cooldown-text"></span>
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <!-- MAIN SKILLS DOCK -->
        <div class="main-skills-dock">
          <!-- GROUP 2: 4 SECONDARY SKILLS (Q, W, E, R) -->
          <div class="skills-group-secondary">
            ${this.skills
              .filter((s) => s.group === 'secondary')
              .map(
                (s) => `
              <div class="skill-slot-secondary" data-skill-id="${s.id}" data-vfx="${s.vfxKey}" title="${s.name} (Phím [${s.hotkey}]) - Tiêu hao ${s.mpCost} MP">
                <span class="skill-hotkey-badge">${s.hotkey}</span>
                <span class="skill-icon-emoji">${s.icon}</span>
                <span class="skill-mp-badge">${s.mpCost}</span>
                <div class="skill-cooldown-overlay" id="cd-${s.id}">
                  <span class="skill-cooldown-text"></span>
                </div>
              </div>
            `
              )
              .join('')}
          </div>

          <!-- GROUP 1: 5 PRIMARY SKILLS (1, 2, 3, 4, 5) -->
          <div class="skills-group-primary">
            ${this.skills
              .filter((s) => s.group === 'primary')
              .map(
                (s) => `
              <div class="skill-slot-primary" data-skill-id="${s.id}" data-vfx="${s.vfxKey}" title="${s.name} (Phím [${s.hotkey}]) - Tiêu hao ${s.mpCost} MP">
                <span class="skill-hotkey-badge">${s.hotkey}</span>
                <span class="skill-icon-emoji">${s.icon}</span>
                <span class="skill-mp-badge">${s.mpCost}</span>
                <div class="skill-cooldown-overlay" id="cd-${s.id}">
                  <span class="skill-cooldown-text"></span>
                </div>
              </div>
            `
              )
              .join('')}
          </div>

          <!-- GROUP 3: 1 ULTIMATE SKILL (SPACE) -->
          ${this.skills
            .filter((s) => s.group === 'ultimate')
            .map(
              (s) => `
            <div class="skill-slot-ultimate" data-skill-id="${s.id}" data-vfx="${s.vfxKey}" title="${s.name} (Phím [${s.hotkey}]) - TUYỆT KỸ TỐI THƯỢNG">
              <span class="skill-hotkey-badge" style="font-size: 8px;">SPACE</span>
              <span class="skill-icon-emoji" style="font-size: 32px;">${s.icon}</span>
              <div class="skill-cooldown-overlay" id="cd-${s.id}" style="border-radius: 50%;">
                <span class="skill-cooldown-text"></span>
              </div>
            </div>
          `
            )
            .join('')}

          <!-- SEPARATE BASIC ATTACK BUTTON -->
          ${this.skills
            .filter((s) => s.group === 'basic')
            .map(
              (s) => `
            <div class="skill-slot-basic" data-skill-id="${s.id}" data-vfx="${s.vfxKey}" title="${s.name} (Phím [${s.hotkey}] / Chuột Trái) - Đòn Đánh Thường">
              <span class="skill-hotkey-badge">J</span>
              <span class="skill-icon-emoji" style="font-size: 28px;">${s.icon}</span>
              <div class="skill-cooldown-overlay" id="cd-${s.id}">
                <span class="skill-cooldown-text"></span>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    this.minimapCanvas = document.getElementById('minimap-radar-canvas') as HTMLCanvasElement;
    if (this.minimapCanvas) {
      this.minimapCtx = this.minimapCanvas.getContext('2d');
    }

    this.bindEvents();
  }

  private bindEvents() {
    // Player Profile click -> Open Character Window
    const profile = document.getElementById('hud-player-profile');
    if (profile) {
      profile.addEventListener('click', () => {
        this.onOpenCharacterInventory?.();
      });
    }

    // Quest Tracker toggle
    const questTracker = document.getElementById('hud-quest-tracker');
    const btnToggle = document.getElementById('btn-toggle-quest');
    if (btnToggle && questTracker) {
      btnToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        questTracker.classList.toggle('collapsed');
        btnToggle.textContent = questTracker.classList.contains('collapsed') ? '▶' : '◀';
      });
    }

    // Quest auto-path button
    const btnAutopath = document.getElementById('btn-quest-autopath');
    if (btnAutopath) {
      btnAutopath.addEventListener('click', () => {
        this.showFloatingDamage(window.innerWidth / 2, window.innerHeight / 2 - 80, '🧭 Đang tự tìm đường đến Trưởng Làng Tam...', 'crit');
      });
    }

    // Minimap utility buttons
    document.getElementById('btn-hud-worldmap')?.addEventListener('click', () => this.onOpenWorldMap?.());
    document.getElementById('btn-hud-events')?.addEventListener('click', () => this.onOpenEvents?.());
    document.getElementById('btn-hud-shop')?.addEventListener('click', () => this.onOpenShop?.());
    document.getElementById('btn-hud-character')?.addEventListener('click', () => this.onOpenCharacterInventory?.());
    document.getElementById('btn-hud-settings')?.addEventListener('click', () => this.onOpenSettings?.());
    document.getElementById('btn-hud-auth')?.addEventListener('click', () => this.onOpenAuth?.());

    // Skill Buttons click
    document.querySelectorAll('[data-skill-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const skillId = btn.getAttribute('data-skill-id');
        const vfx = btn.getAttribute('data-vfx');
        if (skillId && vfx) {
          this.triggerSkill(skillId, vfx);
        }
      });
    });

    // Consumable click
    document.querySelectorAll('[data-consumable-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-consumable-id');
        if (id) {
          this.useConsumable(id);
        }
      });
    });
  }

  private initKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();

      // Skills: 1, 2, 3, 4, 5
      const primarySkill = this.skills.find((s) => s.hotkey === key && s.group === 'primary');
      if (primarySkill) {
        this.triggerSkill(primarySkill.id, primarySkill.vfxKey);
        return;
      }

      // Skills: Q, W, E, R
      const secondarySkill = this.skills.find((s) => s.hotkey === key && s.group === 'secondary');
      if (secondarySkill) {
        this.triggerSkill(secondarySkill.id, secondarySkill.vfxKey);
        return;
      }

      // Ultimate: SPACE
      if (e.code === 'Space') {
        const ult = this.skills.find((s) => s.group === 'ultimate');
        if (ult) {
          e.preventDefault();
          this.triggerSkill(ult.id, ult.vfxKey);
          return;
        }
      }

      // Basic Attack: J
      if (key === 'J') {
        const basic = this.skills.find((s) => s.group === 'basic');
        if (basic) {
          this.triggerSkill(basic.id, basic.vfxKey);
          return;
        }
      }

      // Quick Consumables: Z, X, C
      if (key === 'Z') this.useConsumable('hp_potion');
      if (key === 'X') this.useConsumable('mp_potion');
      // Key C opens Character window if not consumable
      if (key === 'C' && !e.shiftKey) {
        this.onOpenCharacterInventory?.();
      }

      // Modals
      if (key === 'M') this.onOpenWorldMap?.();
      if (key === 'I' || key === 'B') this.onOpenCharacterInventory?.();
      if (e.key === 'Escape') this.onOpenSettings?.();
    });
  }

  public triggerSkill(skillId: string, vfxKey: string) {
    const now = Date.now();
    const cdEnd = this.cooldowns.get(skillId) || 0;
    if (now < cdEnd) {
      const remainingSec = ((cdEnd - now) / 1000).toFixed(1);
      this.showFloatingDamage(window.innerWidth / 2, window.innerHeight - 140, `Đang hồi chiêu (${remainingSec}s)`, 'normal');
      return;
    }

    const skill = this.skills.find((s) => s.id === skillId);
    if (!skill) return;

    // Check MP
    if (this.stats.currentMp < skill.mpCost) {
      this.showFloatingDamage(window.innerWidth / 2, window.innerHeight - 140, 'Không đủ MP!', 'normal');
      return;
    }

    // Deduct MP
    this.stats.currentMp -= skill.mpCost;
    this.updateHpMpBars();

    // Start Cooldown
    this.cooldowns.set(skillId, now + skill.cooldownSec * 1000);

    // Trigger VFX
    this.onCastSkill?.(vfxKey);

    // Show floating skill name
    this.showFloatingDamage(window.innerWidth / 2, window.innerHeight / 2 - 50, `✦ ${skill.name} ✦`, 'crit');

    // Simulate hitting dummy
    this.showMonsterTarget('Bù Nhìn Luyện Kiếm (Training Dummy)', 750, 1000, 10);
  }

  public useConsumable(id: string) {
    const item = this.consumables.find((c) => c.id === id);
    if (!item || item.qty <= 0) return;

    item.qty--;
    const qtyEl = document.getElementById(`qty-${id}`);
    if (qtyEl) qtyEl.textContent = `${item.qty}`;

    if (id === 'hp_potion') {
      this.stats.currentHp = Math.min(this.stats.maxHp, this.stats.currentHp + 150);
      this.showFloatingDamage(window.innerWidth / 2, window.innerHeight / 2, '+150 HP', 'heal');
    } else if (id === 'mp_potion') {
      this.stats.currentMp = Math.min(this.stats.maxMp, this.stats.currentMp + 100);
      this.showFloatingDamage(window.innerWidth / 2, window.innerHeight / 2, '+100 MP', 'heal');
    } else {
      this.showFloatingDamage(window.innerWidth / 2, window.innerHeight / 2, '✦ Đã dùng Bánh Mì (+10% Công) ✦', 'heal');
    }

    this.updateHpMpBars();
    this.onUseConsumable?.(id);
  }

  public updateHpMpBars() {
    const hpBar = document.getElementById('hud-hp-bar');
    const hpText = document.getElementById('hud-hp-text');
    if (hpBar && hpText) {
      const pct = Math.max(0, Math.min(100, (this.stats.currentHp / this.stats.maxHp) * 100));
      hpBar.style.width = `${pct}%`;
      hpText.textContent = `HP: ${this.stats.currentHp}/${this.stats.maxHp}`;
    }

    const mpBar = document.getElementById('hud-mp-bar');
    const mpText = document.getElementById('hud-mp-text');
    if (mpBar && mpText) {
      const pct = Math.max(0, Math.min(100, (this.stats.currentMp / this.stats.maxMp) * 100));
      mpBar.style.width = `${pct}%`;
      mpText.textContent = `MP: ${this.stats.currentMp}/${this.stats.maxMp}`;
    }
  }

  public showMonsterTarget(name: string, hp: number, maxHp: number, level: number) {
    const targetHud = document.getElementById('hud-monster-target');
    const targetName = document.getElementById('target-monster-name');
    const targetLvl = document.getElementById('target-monster-lvl');
    const targetHpBar = document.getElementById('target-monster-hp');
    const targetHpText = document.getElementById('target-monster-hp-text');

    if (targetHud && targetName && targetLvl && targetHpBar && targetHpText) {
      targetHud.classList.remove('hidden');
      targetName.textContent = name;
      targetLvl.textContent = `Lv.${level} ELITE`;
      const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
      targetHpBar.style.width = `${pct}%`;
      targetHpText.textContent = `${hp} / ${maxHp}`;
    }
  }

  public updatePlayerCoordinates(x: number, y: number) {
    const coordsEl = document.getElementById('minimap-coords-text');
    if (coordsEl) {
      const gridX = Math.floor(x / 16);
      const gridY = Math.floor(y / 16);
      coordsEl.textContent = `X: ${gridX.toString().padStart(3, '0')} | Y: ${gridY.toString().padStart(3, '0')}`;
    }
  }

  public showFloatingDamage(x: number, y: number, text: string, type: 'normal' | 'crit' | 'heal' = 'normal') {
    const floatEl = document.createElement('div');
    floatEl.className = `combat-floating-number dmg-${type}`;
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;
    floatEl.textContent = text;
    document.body.appendChild(floatEl);

    setTimeout(() => {
      floatEl.remove();
    }, 1100);
  }

  private startCooldownLoop() {
    setInterval(() => {
      const now = Date.now();
      for (const skill of this.skills) {
        const cdOverlay = document.getElementById(`cd-${skill.id}`);
        const cdEnd = this.cooldowns.get(skill.id) || 0;
        if (now < cdEnd) {
          if (cdOverlay) {
            cdOverlay.style.display = 'flex';
            const remaining = ((cdEnd - now) / 1000).toFixed(1);
            const textEl = cdOverlay.querySelector('.skill-cooldown-text');
            if (textEl) textEl.textContent = `${remaining}s`;
          }
        } else {
          if (cdOverlay && cdOverlay.style.display !== 'none') {
            cdOverlay.style.display = 'none';
          }
        }
      }
    }, 100);
  }

  private initMinimapLoop() {
    // Render animated circular minimap radar
    let angle = 0;
    setInterval(() => {
      if (!this.minimapCtx || !this.minimapCanvas) return;
      const ctx = this.minimapCtx;
      const w = this.minimapCanvas.width;
      const h = this.minimapCanvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Radar background
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, cx);
      grad.addColorStop(0, '#101726');
      grad.addColorStop(0.8, '#080d16');
      grad.addColorStop(1, '#04070c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Rings
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();

      // Sweeping radar beam
      angle += 0.04;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, cx, angle, angle + 0.35);
      ctx.closePath();
      const beamGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, cx);
      beamGrad.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
      beamGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fill();
      ctx.restore();

      // Draw NPC markers (Yellow)
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx + 35, cy - 25, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw Monster markers (Red)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx - 45, cy + 30, 3, 0, Math.PI * 2);
      ctx.arc(cx - 30, cy + 45, 3, 0, Math.PI * 2);
      ctx.fill();

      // Quest marker (Exclamation mark / Blue)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx + 40, cy + 20, 4, 0, Math.PI * 2);
      ctx.fill();

      // Teleport portal (Cyan swirl)
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(cx - 15, cy - 50, 4, 0, Math.PI * 2);
      ctx.fill();
    }, 50);
  }

  public updatePlayerProfile(newStats: Partial<PlayerStats>) {
    Object.assign(this.stats, newStats);
    const nameEl = document.getElementById('hud-player-name');
    if (nameEl) nameEl.textContent = this.stats.name;

    const classEl = document.getElementById('hud-player-class');
    if (classEl) classEl.textContent = this.stats.classTitle;

    const lvlEl = document.getElementById('hud-level-badge');
    if (lvlEl) lvlEl.textContent = `Lv.${this.stats.level}`;

    const cpEl = document.getElementById('hud-cp-val');
    if (cpEl) cpEl.textContent = this.stats.combatPower.toLocaleString();

    const avatarEl = document.getElementById('hud-avatar-img') as HTMLImageElement;
    if (avatarEl && this.stats.avatarUrl) avatarEl.src = this.stats.avatarUrl;

    this.updateHpMpBars();
  }
}
