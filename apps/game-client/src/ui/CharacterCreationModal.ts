import {
  CharacterEntity,
  Gender,
  ClassId,
  PrimaryAttributes,
  CharacterAppearance,
} from '@elysia/game-types';
import { INITIAL_CLASSES } from '@elysia/game-data-schema';
import { validateCharacterName, validateStatAllocation } from '@elysia/validation';
import { createCharacter } from '../services/apiClient';

const RANDOM_NAMES = [
  'Airi_Kurogane',
  'Rin_Valkyrie',
  'Kaelen_Dawn',
  'Sylvia_Star',
  'Ren_Takahashi',
  'Yuna_Solaria',
  'Kazuto_Hayate',
  'Ayame_Frost',
  'Shion_Arcadia',
  'Leon_Valerius',
];

const HAIR_COLORS = [
  { name: 'Đen Tuyền (Jet Black)', value: '#1a1a24', filter: 'brightness(0.9) contrast(1.1)' },
  { name: 'Bạch Kim (Silver)', value: '#e2e8f0', filter: 'brightness(1.5) contrast(0.9) hue-rotate(180deg)' },
  { name: 'Hoàng Kim (Blonde)', value: '#f59e0b', filter: 'sepia(0.8) saturate(2) hue-rotate(5deg)' },
  { name: 'Hỏa Diễm (Crimson)', value: '#dc2626', filter: 'sepia(0.8) hue-rotate(320deg) saturate(3)' },
  { name: 'Lam Dạ (Navy)', value: '#2563eb', filter: 'hue-rotate(190deg) saturate(1.8)' },
];

const EYE_COLORS = [
  { name: 'Lam Sapphire', value: '#2563eb' },
  { name: 'Đỏ Ruby', value: '#e11d48' },
  { name: 'Ngọc Lục Bảo', value: '#10b981' },
  { name: 'Hổ Phách Amber', value: '#f59e0b' },
  { name: 'Tím Thạch Anh', value: '#8b5cf6' },
];

export class CharacterCreationModal {
  private container: HTMLElement;
  private onCharacterCreated: (character: CharacterEntity) => void;

  // State
  private name: string = 'Airi_Kurogane';
  private gender: Gender = 'female';
  private selectedClassId: ClassId = 'novice';
  private selectedHairColor = HAIR_COLORS[0].value;
  private selectedEyeColor = EYE_COLORS[0].value;
  private hairstyleId = 'f_long';
  private availableBonusPoints = 6;
  private allocatedBonus: PrimaryAttributes = { str: 2, dex: 1, agi: 1, int: 0, con: 2 };

  constructor(onCharacterCreated: (character: CharacterEntity) => void) {
    this.onCharacterCreated = onCharacterCreated;
    this.container = document.createElement('div');
    this.container.id = 'char-creator-modal';
    this.container.className = 'char-creator-backdrop';
    document.body.appendChild(this.container);
    this.render();
  }

  public open() {
    this.container.style.display = 'flex';
    this.render();
  }

  public close() {
    this.container.style.display = 'none';
  }

  private getClassDef() {
    return INITIAL_CLASSES.find((c) => c.id === this.selectedClassId) || INITIAL_CLASSES[0];
  }

  private getTotalStats(): PrimaryAttributes {
    const base = this.getClassDef().baseStats;
    return {
      str: base.str + this.allocatedBonus.str,
      dex: base.dex + this.allocatedBonus.dex,
      agi: base.agi + this.allocatedBonus.agi,
      int: base.int + this.allocatedBonus.int,
      con: base.con + this.allocatedBonus.con,
    };
  }

  private getSpentPoints(): number {
    return (
      this.allocatedBonus.str +
      this.allocatedBonus.dex +
      this.allocatedBonus.agi +
      this.allocatedBonus.int +
      this.allocatedBonus.con
    );
  }

  private getRemainingPoints(): number {
    return this.availableBonusPoints - this.getSpentPoints();
  }

  private randomizeName() {
    const random = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    this.name = random;
    this.render();
  }

  private changeStat(stat: keyof PrimaryAttributes, delta: number) {
    const totalStats = this.getTotalStats();
    const currentVal = totalStats[stat];

    if (delta > 0) {
      if (this.getRemainingPoints() <= 0) return;
      if (currentVal >= 15) return; // Strict ceiling: max 15 base points
    }
    if (delta < 0) {
      if (currentVal <= 8) return; // Strict floor: min 8 base points
      if (this.allocatedBonus[stat] <= 0) return;
    }

    this.allocatedBonus[stat] += delta;
    this.render();
  }

  private async submit() {
    const nameCheck = validateCharacterName(this.name);
    if (!nameCheck.isValid) {
      alert(`Lỗi tên: ${nameCheck.error}`);
      return;
    }

    const totalStats = this.getTotalStats();
    const statCheck = validateStatAllocation(totalStats);
    if (!statCheck.isValid) {
      alert(`Lỗi phân bổ chỉ số (Anti-Stacking): \n${statCheck.errors.join('\n')}`);
      return;
    }

    const appearance: CharacterAppearance = {
      gender: this.gender,
      hairstyleId: this.hairstyleId,
      hairColor: this.selectedHairColor,
      faceId: 'face_01',
      costumeId: 'c_novice',
      eyeColor: this.selectedEyeColor,
    };

    const submitBtn = document.getElementById('btn-submit-character') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Đang khởi tạo nhân vật...';
    }

    const res = await createCharacter({
      name: this.name,
      gender: this.gender,
      classId: this.selectedClassId,
      appearance,
      stats: totalStats,
    });

    if (res.success && res.data) {
      // Save locally
      localStorage.setItem('elysia_active_character', JSON.stringify(res.data));
      this.close();
      this.onCharacterCreated(res.data);
    } else {
      alert(`Không thể tạo nhân vật: ${res.error}`);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Bước Vào Thế Giới Elysia ⚔️';
      }
    }
  }

  private render() {
    const curClass = this.getClassDef();
    const totalStats = this.getTotalStats();
    const statValidation = validateStatAllocation(totalStats);
    const nameValidation = validateCharacterName(this.name);
    const remaining = this.getRemainingPoints();

    // Calculate stat anti-stacking percentages
    const statValues = [totalStats.str, totalStats.dex, totalStats.agi, totalStats.int, totalStats.con];
    const statSum = statValues.reduce((a, b) => a + b, 0);
    const maxSingle = Math.max(...statValues);
    const singlePct = Math.round((maxSingle / statSum) * 100);
    const sortedStats = [...statValues].sort((a, b) => b - a);
    const top2Sum = sortedStats[0] + sortedStats[1];
    const top2Pct = Math.round((top2Sum / statSum) * 100);

    const activeHair = HAIR_COLORS.find((h) => h.value === this.selectedHairColor) || HAIR_COLORS[0];

    this.container.innerHTML = `
      <div class="char-creator-card">
        <!-- HEADER -->
        <div class="creator-header">
          <div class="creator-title-badge">
            <span class="badge-icon">✨</span>
            <div>
              <h2>ELYSIA NO DENSETSU — TẠO NHÂN VẬT</h2>
              <p>Khởi tạo nhân vật Anime Chibi & Thiết lập chỉ số bản quyền</p>
            </div>
          </div>
          <button id="btn-close-creator" class="btn-icon-close">✕</button>
        </div>

        <!-- BODY SPLIT -->
        <div class="creator-body">
          <!-- LEFT: LIVE PREVIEW -->
          <div class="creator-preview-col">
            <div class="preview-box">
              <div class="preview-glow"></div>
              <img
                id="preview-character-sprite"
                src="${this.selectedClassId === 'novice' ? '/assets/characters/female/novice/master/novice_female_master_256.png' : '/assets/characters/female/swordsman/swordsman_female_idle_front.png'}"
                alt="Character Preview"
                style="filter: ${activeHair.filter};"
                class="chibi-sprite-render"
              />
              <div class="preview-tag">Master 2.8 Heads Chibi</div>
              <div class="eye-color-indicator" style="background: ${this.selectedEyeColor};" title="Màu mắt: ${this.selectedEyeColor}"></div>
            </div>

            <div class="preview-info-card">
              <div class="preview-name">${this.name || 'Chưa đặt tên'}</div>
              <div class="preview-class">&lt;${curClass.name} Lv.1&gt;</div>
              <div class="preview-weapons">
                <span>Vũ khí:</span> ${curClass.allowedWeapons.join(', ')}
              </div>
            </div>

            <button id="btn-randomize-name" class="btn-random-name">
              🎲 Xúc Xắc Tên Ngẫu Nhiên
            </button>
          </div>

          <!-- RIGHT: CONTROLS & STATS -->
          <div class="creator-controls-col">
            <!-- 1. NAME & GENDER -->
            <div class="control-section">
              <div class="section-title">1. Danh Tính & Giới Tính</div>
              <div class="name-input-group">
                <input
                  type="text"
                  id="input-char-name"
                  value="${this.name}"
                  placeholder="Nhập tên nhân vật (3 - 16 ký tự)..."
                  class="name-input ${!nameValidation.isValid ? 'input-error' : ''}"
                />
                ${
                  !nameValidation.isValid
                    ? `<span class="validation-msg error">${nameValidation.error}</span>`
                    : `<span class="validation-msg success">✓ Tên nhân vật hợp lệ</span>`
                }
              </div>

              <div class="gender-toggle-group">
                <button class="btn-toggle ${this.gender === 'female' ? 'active' : ''}" id="btn-gender-female">
                  ♀ Nữ (Female)
                </button>
                <button class="btn-toggle ${this.gender === 'male' ? 'active' : ''}" id="btn-gender-male">
                  ♂ Nam (Male)
                </button>
              </div>
            </div>

            <!-- 2. CLASS SELECTION -->
            <div class="control-section">
              <div class="section-title">2. Chọn Hệ Phái (${INITIAL_CLASSES.length} Master Classes)</div>
              <div class="class-grid">
                ${INITIAL_CLASSES.map((c) => {
                  const isSel = c.id === this.selectedClassId;
                  return `
                    <button class="class-card ${isSel ? 'active' : ''}" data-class-id="${c.id}">
                      <div class="class-card-name">${c.name.split(' (')[0]}</div>
                      <div class="class-card-sub">${c.id.toUpperCase()}</div>
                    </button>
                  `;
                }).join('')}
              </div>
              <div class="class-desc-box">
                <p>${curClass.description}</p>
                <div class="class-skills-list">
                  Kỹ năng khởi đầu: <strong>${curClass.startingSkills.join(', ')}</strong>
                </div>
              </div>
            </div>

            <!-- 3. APPEARANCE (HAIR & EYE) -->
            <div class="control-section">
              <div class="section-title">3. Tùy Chỉnh Màu Sắc (Anime Style)</div>
              <div class="appearance-row">
                <div class="appearance-group">
                  <label>Màu Tóc:</label>
                  <div class="color-swatches">
                    ${HAIR_COLORS.map(
                      (h) => `
                      <button
                        class="swatch ${this.selectedHairColor === h.value ? 'selected' : ''}"
                        style="background: ${h.value};"
                        data-hair-color="${h.value}"
                        title="${h.name}"
                      ></button>
                    `
                    ).join('')}
                  </div>
                </div>

                <div class="appearance-group">
                  <label>Màu Mắt:</label>
                  <div class="color-swatches">
                    ${EYE_COLORS.map(
                      (e) => `
                      <button
                        class="swatch ${this.selectedEyeColor === e.value ? 'selected' : ''}"
                        style="background: ${e.value};"
                        data-eye-color="${e.value}"
                        title="${e.name}"
                      ></button>
                    `
                    ).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. ATTRIBUTE DISTRIBUTION (ANTI-STACKING PROTECTED) -->
            <div class="control-section">
              <div class="section-header-row">
                <div class="section-title">4. Phân Bổ Tiềm Năng (Giới hạn: 8 - 15 Điểm Gốc)</div>
                <div class="bonus-points-badge ${remaining === 0 ? 'balanced' : 'pending'}">
                  Điểm tự do còn: <strong>${remaining} pts</strong>
                </div>
              </div>

              <div class="stats-allocator-grid">
                ${(['str', 'dex', 'agi', 'int', 'con'] as (keyof PrimaryAttributes)[])
                  .map((statKey) => {
                    const labelMap = {
                      str: 'STR (Sức mạnh)',
                      dex: 'DEX (Khéo léo)',
                      agi: 'AGI (Nhanh nhẹn)',
                      int: 'INT (Trí tuệ)',
                      con: 'CON (Thể chất)',
                    };
                    const baseVal = curClass.baseStats[statKey];
                    const bonusVal = this.allocatedBonus[statKey];
                    const totalVal = totalStats[statKey];

                    return `
                    <div class="stat-row">
                      <div class="stat-meta">
                        <span class="stat-name">${labelMap[statKey]}</span>
                        <span class="stat-details">${baseVal} + <span class="bonus-highlight">${bonusVal}</span> = <strong>${totalVal}</strong> <span style="font-size: 10px; color: #38bdf8;">(8-15)</span></span>
                      </div>
                      <div class="stat-actions">
                        <button class="btn-stat-adj" data-stat="${statKey}" data-dir="-1" ${totalVal <= 8 || bonusVal <= 0 ? 'disabled' : ''}>-</button>
                        <button class="btn-stat-adj" data-stat="${statKey}" data-dir="1" ${totalVal >= 15 || remaining <= 0 ? 'disabled' : ''}>+</button>
                      </div>
                    </div>
                  `;
                  })
                  .join('')}
              </div>

              <!-- Anti-Stacking Status Meter -->
              <div class="anti-stacking-panel ${statValidation.isValid ? 'valid' : 'warning'}">
                <div class="anti-stacking-header">
                  <span>Quy Tắc Điểm Gốc (8 - 15 Điểm) & Anti-Stacking:</span>
                  <span class="badge ${statValidation.isValid ? 'badge-ok' : 'badge-alert'}">
                    ${statValidation.isValid ? '✓ Hợp Lệ (8 - 15 pts)' : '⚠ Vi Phạm Giới Hạn'}
                  </span>
                </div>
                <div class="meter-details">
                  <div>Giới hạn điểm gốc: <strong>8 - 15 pts/chỉ số</strong></div>
                  <div>Chỉ số cao nhất: <strong>${singlePct}%</strong> / Max 40%</div>
                  <div>Top 2 chỉ số: <strong>${top2Pct}%</strong> / Max 65%</div>
                </div>
                ${
                  !statValidation.isValid
                    ? `<div class="error-msg-box">${statValidation.errors[0]}</div>`
                    : ''
                }
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER ACTIONS -->
        <div class="creator-footer">
          <div class="footer-note">
            🛡️ Dữ liệu nhân vật được xác thực Authoritative bởi NestJS Server trước khi kích hoạt.
          </div>
          <div class="footer-buttons">
            <button id="btn-cancel-creator" class="btn-secondary">Đóng</button>
            <button
              id="btn-submit-character"
              class="btn-primary"
              ${!nameValidation.isValid || !statValidation.isValid ? 'disabled' : ''}
            >
              Bước Vào Thế Giới Elysia ⚔️
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    // Close button
    document.getElementById('btn-close-creator')?.addEventListener('click', () => this.close());
    document.getElementById('btn-cancel-creator')?.addEventListener('click', () => this.close());

    // Submit
    document.getElementById('btn-submit-character')?.addEventListener('click', () => this.submit());

    // Randomize name
    document.getElementById('btn-randomize-name')?.addEventListener('click', () => this.randomizeName());

    // Name input change
    const nameInput = document.getElementById('input-char-name') as HTMLInputElement;
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        this.name = (e.target as HTMLInputElement).value;
        const nameValidation = validateCharacterName(this.name);
        const submitBtn = document.getElementById('btn-submit-character') as HTMLButtonElement;
        const totalStats = this.getTotalStats();
        const statValidation = validateStatAllocation(totalStats);
        if (submitBtn) {
          submitBtn.disabled = !nameValidation.isValid || !statValidation.isValid;
        }
      });
      nameInput.addEventListener('blur', () => this.render());
    }

    // Gender buttons
    document.getElementById('btn-gender-female')?.addEventListener('click', () => {
      this.gender = 'female';
      this.render();
    });
    document.getElementById('btn-gender-male')?.addEventListener('click', () => {
      this.gender = 'male';
      this.render();
    });

    // Class selection
    this.container.querySelectorAll('.class-card').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const classId = (e.currentTarget as HTMLElement).getAttribute('data-class-id') as ClassId;
        if (classId) {
          this.selectedClassId = classId;
          this.render();
        }
      });
    });

    // Hair color swatches
    this.container.querySelectorAll('[data-hair-color]').forEach((swatch) => {
      swatch.addEventListener('click', (e) => {
        this.selectedHairColor = (e.currentTarget as HTMLElement).getAttribute('data-hair-color') || '';
        this.render();
      });
    });

    // Eye color swatches
    this.container.querySelectorAll('[data-eye-color]').forEach((swatch) => {
      swatch.addEventListener('click', (e) => {
        this.selectedEyeColor = (e.currentTarget as HTMLElement).getAttribute('data-eye-color') || '';
        this.render();
      });
    });

    // Stat adjustments (+/-)
    this.container.querySelectorAll('.btn-stat-adj').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const el = e.currentTarget as HTMLElement;
        const stat = el.getAttribute('data-stat') as keyof PrimaryAttributes;
        const dir = parseInt(el.getAttribute('data-dir') || '0', 10);
        if (stat && dir) {
          this.changeStat(stat, dir);
        }
      });
    });
  }
}
