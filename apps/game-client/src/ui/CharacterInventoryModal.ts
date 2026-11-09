/**
 * ELYSIA NO DENSETSU — MASTER CHARACTER & INVENTORY WINDOW
 * 3-Column Japanese Fantasy Architecture:
 * Col 1: Character Profile & 9 Core Attributes
 * Col 2: Full-body Paperdoll & 9 Equipment Slots
 * Col 3: 24-Slot Inventory with Categories & Currencies
 */

import { ItemEntity, WeaponEntity, ItemRarity } from '@elysia/game-types';

export interface AttributeData {
  key: string;
  name: string;
  abbr: string;
  val: number;
  allocated: number;
  desc: string;
}

export interface EquipSlotItem {
  slotKey: string;
  name: string;
  silhouette: string;
  item: ItemEntity | null;
}

export class CharacterInventoryModal {
  private backdrop: HTMLElement | null = null;
  private isOpen = false;

  // Available stat points to distribute
  private availableStatPoints = 15;

  // 9 Core MMORPG Attributes
  private attributes: AttributeData[] = [
    { key: 'str', name: 'Sức Mạnh', abbr: 'STR', val: 14, allocated: 0, desc: 'Tăng Sát Thương Vật Lý (+2.5 ATK / điểm)' },
    { key: 'vit', name: 'Thể Lực', abbr: 'VIT', val: 12, allocated: 0, desc: 'Tăng Lượng Máu Tối Đa (+18 HP / điểm) & Giáp Cơ Bản' },
    { key: 'agi', name: 'Nhanh Nhẹn', abbr: 'AGI', val: 13, allocated: 0, desc: 'Tăng Tốc Độ Đánh (+1.2%) & Khả Năng Né Tránh' },
    { key: 'dex', name: 'Khéo Léo', abbr: 'DEX', val: 10, allocated: 0, desc: 'Tăng Độ Chính Xác Đòn Đánh & Xuyên Thấu Giáp' },
    { key: 'int', name: 'Trí Tuệ', abbr: 'INT', val: 9, allocated: 0, desc: 'Tăng Sát Thương Ma Pháp (+3 MATK) & Năng Lượng Tối Đa (+12 MP)' },
    { key: 'per', name: 'Cảm Nhận', abbr: 'PER', val: 11, allocated: 0, desc: 'Tăng Tỷ Lệ Đòn Đánh Bạo Kích (+0.3% Crit Rate)' },
    { key: 'wil', name: 'Ý Chí', abbr: 'WIL', val: 10, allocated: 0, desc: 'Tăng Kháng Hiệu Ứng Bất Lợi & Kháng Sát Thương Phép (+1.5%)' },
    { key: 'cha', name: 'Mê Lực', abbr: 'CHA', val: 8, allocated: 0, desc: 'Giảm Tiêu Hao Mana Khi Thi Triển Chiêu Thức & Tăng Điểm Uy Tín' },
    { key: 'luk', name: 'May Mắn', abbr: 'LUK', val: 9, allocated: 0, desc: 'Tăng Tỷ Lệ Rơi Vật Phẩm Hiếm (+0.5%) & Thành Công Rèn Đúc' },
  ];

  // 9 Equipment Slots
  private equipmentSlots: Record<string, EquipSlotItem> = {
    helmet: { slotKey: 'helmet', name: 'Mũ / Nón', silhouette: '👑', item: null },
    necklace: { slotKey: 'necklace', name: 'Dây Chuyền', silhouette: '📿', item: null },
    weapon: { slotKey: 'weapon', name: 'Vũ Khí Chính', silhouette: '⚔️', item: null },
    ring: { slotKey: 'ring', name: 'Nhẫn Thánh', silhouette: '💍', item: null },
    armor: { slotKey: 'armor', name: 'Áo Giáp', silhouette: '🛡️', item: null },
    shield: { slotKey: 'shield', name: 'Khiên / Phụ Khí', silhouette: '🔰', item: null },
    gloves: { slotKey: 'gloves', name: 'Găng Tay', silhouette: '🧤', item: null },
    boots: { slotKey: 'boots', name: 'Bốt Chiến Binh', silhouette: '👢', item: null },
    accessory: { slotKey: 'accessory', name: 'Phụ Kiện', silhouette: '💎', item: null },
  };

  // 24 Inventory Slots
  private inventorySlots: (ItemEntity | null)[] = [];
  private activeCategory = 'all';
  private selectedSlotIndex: number | null = null;

  // Currencies
  private gold = 125400;
  private rubies = 1250;

  // Callbacks
  public onEquipWeapon?: (weapon: WeaponEntity) => void;
  public onUseItem?: (item: ItemEntity) => void;

  constructor() {
    this.createDom();
    this.seedDefaultInventory();
    this.initTooltip();
  }

  private createDom() {
    const backdrop = document.createElement('div');
    backdrop.className = 'elysia-modal-backdrop';
    backdrop.id = 'modal-character-inventory';

    backdrop.innerHTML = `
      <div class="elysia-modal-window char-inv-3col-window">
        <!-- HEADER -->
        <div class="elysia-window-header">
          <div class="elysia-window-title">
            <span>⚜️</span>
            <span>THÔNG TIN NHÂN VẬT & TÚI ĐỒ (CHARACTER & INVENTORY)</span>
          </div>
          <button class="elysia-btn-close" id="btn-close-char-inv">✕</button>
        </div>

        <!-- 3-COLUMN BODY -->
        <div class="char-inv-body">
          <!-- COLUMN 1: CHARACTER STATS & 9 ATTRIBUTES -->
          <div class="char-stats-col">
            <div class="char-profile-header-card">
              <img src="/assets/characters/female/novice/master/novice_female_master_256.png" class="char-thumb-avatar" alt="Avatar" />
              <div class="char-profile-info">
                <span style="font-family: var(--elysia-font-title); font-size: 15px; font-weight: 700; color: var(--elysia-gold);">Tada</span>
                <span style="font-size: 11px; color: #94a3b8;">Lv.12 | Kiếm Sĩ Tân Thủ</span>
                <span style="font-size: 11.5px; font-weight: 700; color: #fde047;">⚔️ Lực chiến: 2,480</span>
              </div>
            </div>

            <!-- STAT POINTS BADGE -->
            <div class="stat-points-badge">
              <span>Điểm tiềm năng:</span>
              <strong style="color: #4ade80; font-size: 13px;" id="stat-points-counter">${this.availableStatPoints} điểm</strong>
            </div>

            <!-- 9 ATTRIBUTES LIST -->
            <div class="attributes-list" id="attributes-list-container">
              ${this.attributes
                .map(
                  (a) => `
                <div class="attribute-row" data-attr-key="${a.key}" title="${a.desc}">
                  <span class="attr-name-tag">
                    <strong>${a.abbr}</strong>
                    <span>${a.name}</span>
                  </span>
                  <div class="attr-val-box">
                    <span class="attr-val-num" id="attr-val-${a.key}">${a.val + a.allocated}</span>
                    <button class="attr-btn-plus" data-plus-key="${a.key}" title="Cộng 1 điểm ${a.name}">+</button>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>

            <!-- ALLOCATION BUTTONS -->
            <div style="display: flex; gap: 8px; margin-top: auto;">
              <button class="inv-action-btn" id="btn-confirm-stats" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; border-color: #34d399;">Xác Nhận</button>
              <button class="inv-action-btn" id="btn-reset-stats">Thiết Lập Lại</button>
            </div>
          </div>

          <!-- COLUMN 2: FULL-BODY PAPERDOLL & 9 EQUIPMENT SLOTS -->
          <div class="char-paperdoll-col">
            <div style="text-align: center;">
              <span style="font-family: var(--elysia-font-title); font-size: 12px; font-weight: 700; color: var(--elysia-gold); letter-spacing: 0.8px;">
                TRANG BỊ CHIẾN ĐẤU (EQUIPMENT)
              </span>
            </div>

            <div class="equipment-layout-grid">
              <!-- LEFT SLOTS: HELMET, NECKLACE, WEAPON, RING -->
              <div class="equip-slots-left">
                <div class="equip-slot-box" data-equip-slot="helmet" title="Mũ / Nón">
                  <span class="equip-slot-silhouette">👑</span>
                </div>
                <div class="equip-slot-box" data-equip-slot="necklace" title="Dây Chuyền">
                  <span class="equip-slot-silhouette">📿</span>
                </div>
                <div class="equip-slot-box" data-equip-slot="weapon" title="Vũ Khí Chính">
                  <span class="equip-slot-silhouette">⚔️</span>
                </div>
                <div class="equip-slot-box" data-equip-slot="ring" title="Nhẫn">
                  <span class="equip-slot-silhouette">💍</span>
                </div>
              </div>

              <!-- CENTER: FULL-BODY PAPERDOLL SHOWCASE -->
              <div class="paperdoll-center-stage">
                <img src="/assets/characters/female/novice/master/novice_female_master_256.png" class="paperdoll-full-chibi" id="paperdoll-chibi-render" alt="Master Character" />
              </div>

              <!-- RIGHT SLOTS: ARMOR, SHIELD, GLOVES, BOOTS, ACCESSORY -->
              <div class="equip-slots-right">
                <div class="equip-slot-box" data-equip-slot="armor" title="Áo Giáp">
                  <span class="equip-slot-silhouette">🛡️</span>
                </div>
                <div class="equip-slot-box" data-equip-slot="shield" title="Khiên / Tay Phụ">
                  <span class="equip-slot-silhouette">🔰</span>
                </div>
                <div class="equip-slot-box" data-equip-slot="gloves" title="Găng Tay">
                  <span class="equip-slot-silhouette">🧤</span>
                </div>
                <div class="equip-slot-box" data-equip-slot="boots" title="Bốt Chiến Binh">
                  <span class="equip-slot-silhouette">👢</span>
                </div>
              </div>
            </div>

            <div style="font-size: 10px; color: #64748b; text-align: center; margin-top: 6px;">
              Double-click vào vật phẩm trong túi đồ để trang bị / tháo gỡ
            </div>
          </div>

          <!-- COLUMN 3: 24-SLOT INVENTORY (6x4) & CURRENCIES -->
          <div class="char-inventory-col">
            <!-- TABS -->
            <div class="inventory-tabs-row">
              <button class="inv-tab-btn active" data-cat="all">Tất Cả</button>
              <button class="inv-tab-btn" data-cat="weapon">Trang Bị</button>
              <button class="inv-tab-btn" data-cat="potion">Tiêu Hao</button>
              <button class="inv-tab-btn" data-cat="material">Nguyên Liệu</button>
              <button class="inv-tab-btn" data-cat="quest">Nhiệm Vụ</button>
            </div>

            <!-- 24 INVENTORY SLOTS GRID (6x4) -->
            <div class="inventory-slots-grid" id="inventory-slots-grid-root">
              <!-- Dynamically populated -->
            </div>

            <!-- INVENTORY ACTIONS -->
            <div class="inv-controls-row">
              <button class="inv-action-btn" id="btn-inv-sort" title="Tự động sắp xếp">⚡ Sắp Xếp</button>
              <button class="inv-action-btn" id="btn-inv-split" title="Tách số lượng vật phẩm">Tách Ô</button>
              <button class="inv-action-btn" id="btn-inv-lock" title="Khóa vật phẩm giá trị">🔒 Khóa</button>
              <button class="inv-action-btn" id="btn-inv-expand" style="color: #facc15;" title="Mở rộng thêm ô">+6 Ô</button>
            </div>

            <!-- CURRENCY FOOTER -->
            <div class="inv-currency-footer">
              <div class="currency-badge currency-gold">
                <span>🪙 Vàng:</span>
                <span id="inv-gold-display">${this.gold.toLocaleString()}</span>
              </div>
              <div class="currency-badge currency-rubies">
                <span>💎 Kim Cương:</span>
                <span id="inv-rubies-display">${this.rubies.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.backdrop = backdrop;

    this.bindEvents();
  }

  private seedDefaultInventory() {
    this.inventorySlots = new Array(24).fill(null);

    // Initial items in inventory
    this.inventorySlots[0] = {
      id: 'ITEM_SWORD_NOVICE',
      itemId: 'ITEM_SWORD_NOVICE',
      name: 'Kiếm Thép Tân Thủ',
      description: 'Thanh kiếm thép tôi luyện sắc bén, trang bị khởi đầu tuyệt hảo cho kiếm sĩ.',
      category: 'weapon',
      rarity: 'common',
      requiredLevel: 1,
      requiredClasses: ['swordsman', 'knight'],
      buyPrice: 50,
      sellPrice: 15,
      stackLimit: 1,
      weight: 2,
      isTradable: true,
      isSellable: true,
      isDroppable: true,
      isAccountBound: false,
      isCharacterBound: false,
      status: 'PUBLISHED',
      primaryAssetUrl: '/assets/weapons/novice_sword_icon.png',
      inventoryAssetUrl: '/assets/weapons/novice_sword_icon.png',
    } as any;

    this.inventorySlots[1] = {
      id: 'ITEM_EXCALIBUR_HOLY',
      itemId: 'ITEM_EXCALIBUR_HOLY',
      name: 'Thánh Kiếm Excalibur',
      description: 'Thần khí hoàng kim tỏa hào quang chói lọi, ban sức mạnh thánh quang vô địch thiên hạ.',
      category: 'weapon',
      rarity: 'mythic',
      requiredLevel: 50,
      requiredClasses: ['swordsman', 'knight'],
      buyPrice: 50000,
      sellPrice: 15000,
      stackLimit: 1,
      weight: 3.5,
      isTradable: true,
      isSellable: true,
      isDroppable: false,
      isAccountBound: false,
      isCharacterBound: false,
      status: 'PUBLISHED',
      primaryAssetUrl: '/assets/weapons/excalibur_sword_icon.png',
      inventoryAssetUrl: '/assets/weapons/excalibur_sword_icon.png',
    } as any;

    this.inventorySlots[2] = {
      id: 'ITEM_BOW_NOVICE',
      itemId: 'ITEM_BOW_NOVICE',
      name: 'Cung Gỗ Tân Thủ',
      description: 'Cung gỗ phong dẻo dai đàn hồi cao, vũ khí khởi đầu dành cho xạ thủ.',
      category: 'weapon',
      rarity: 'common',
      requiredLevel: 1,
      requiredClasses: ['archer'],
      buyPrice: 45,
      sellPrice: 12,
      stackLimit: 1,
      weight: 1.5,
      isTradable: true,
      isSellable: true,
      isDroppable: true,
      isAccountBound: false,
      isCharacterBound: false,
      status: 'PUBLISHED',
      primaryAssetUrl: '/assets/weapons/novice_bow_icon.png',
      inventoryAssetUrl: '/assets/weapons/novice_bow_icon.png',
    } as any;

    this.inventorySlots[3] = {
      id: 'ITEM_POTION_HP_SMALL',
      itemId: 'ITEM_POTION_HP_SMALL',
      name: 'Bình Máu Nhỏ (HP)',
      description: 'Dược thảo tinh luyện giúp phục hồi ngay 150 điểm sinh lực khi sử dụng.',
      category: 'potion',
      rarity: 'common',
      requiredLevel: 1,
      requiredClasses: [],
      buyPrice: 20,
      sellPrice: 5,
      stackLimit: 99,
      weight: 0.1,
      isTradable: true,
      isSellable: true,
      isDroppable: true,
      isAccountBound: false,
      isCharacterBound: false,
      status: 'PUBLISHED',
      primaryAssetUrl: '/assets/weapons/potion_hp_small_icon.png',
      inventoryAssetUrl: '/assets/weapons/potion_hp_small_icon.png',
    } as any;

    this.inventorySlots[4] = {
      id: 'ITEM_ARROW_WOODEN',
      itemId: 'ITEM_ARROW_WOODEN',
      name: 'Bao Tên Gỗ (250x)',
      description: 'Tên gỗ chuẩn xác có đầu bịt thép, sử dụng tiêu hao cho các kỹ năng cung thuật.',
      category: 'material',
      rarity: 'common',
      requiredLevel: 1,
      requiredClasses: ['archer'],
      buyPrice: 10,
      sellPrice: 2,
      stackLimit: 999,
      weight: 0.01,
      isTradable: true,
      isSellable: true,
      isDroppable: true,
      isAccountBound: false,
      isCharacterBound: false,
      status: 'PUBLISHED',
      primaryAssetUrl: '/assets/items/wooden_arrows_icon.png',
      inventoryAssetUrl: '/assets/items/wooden_arrows_icon.png',
    } as any;

    this.renderInventoryGrid();
  }

  private renderInventoryGrid() {
    const grid = document.getElementById('inventory-slots-grid-root');
    if (!grid) return;

    grid.innerHTML = '';
    this.inventorySlots.forEach((item, index) => {
      const slot = document.createElement('div');
      slot.className = `inv-item-slot ${this.selectedSlotIndex === index ? 'selected' : ''}`;
      slot.setAttribute('data-slot-idx', `${index}`);

      if (item) {
        const iconSrc = item.primaryAssetUrl || item.inventoryAssetUrl || '/assets/weapons/novice_sword_icon.png';
        const qtyText = item.stackLimit && item.stackLimit > 1 ? '15' : '';
        slot.innerHTML = `
          <img src="${iconSrc}" class="inv-item-img" alt="${item.name}" onerror="this.src='/assets/weapons/novice_sword_icon.png'" />
          <span class="inv-item-qty">${qtyText}</span>
        `;
        slot.addEventListener('mouseenter', (e) => this.showTooltip(item, e));
        slot.addEventListener('mouseleave', () => this.hideTooltip());
        slot.addEventListener('dblclick', () => this.handleEquipOrUse(item, index));
      }

      slot.addEventListener('click', () => {
        this.selectedSlotIndex = index;
        this.renderInventoryGrid();
      });

      grid.appendChild(slot);
    });
  }

  private handleEquipOrUse(item: ItemEntity, index: number) {
    if (item.category === 'weapon') {
      // Equip weapon
      this.equipmentSlots.weapon.item = item;
      this.updateEquipmentSlotsDisplay();

      // Trigger callback
      this.onEquipWeapon?.({
        id: `WP_${item.itemId}`,
        weaponId: `WP_${item.itemId}`,
        itemId: item.itemId,
        name: item.name,
        weaponType: 'sword',
        attackPower: 25,
        attackRange: 60,
        status: 'PUBLISHED',
        iconAssetUrl: item.primaryAssetUrl || item.inventoryAssetUrl || '',
        spriteAssetUrl: '/assets/weapons/novice_sword_sprite.png',
        paperdollConfig: { offsetX: 50, offsetY: 70, scale: 1.0, rotation: -25, anchorX: 0.5, anchorY: 0.85 },
      } as any);
    } else if (item.category === 'potion') {
      this.onUseItem?.(item);
    }
  }

  private updateEquipmentSlotsDisplay() {
    for (const [slotKey, data] of Object.entries(this.equipmentSlots)) {
      const el = document.querySelector(`[data-equip-slot="${slotKey}"]`) as HTMLElement;
      if (!el) continue;

      if (data.item) {
        el.classList.add('equipped');
        const iconSrc = data.item.primaryAssetUrl || data.item.inventoryAssetUrl || '';
        el.innerHTML = `<img src="${iconSrc}" class="equip-item-icon" alt="${data.item.name}" />`;
      } else {
        el.classList.remove('equipped');
        el.innerHTML = `<span class="equip-slot-silhouette">${data.silhouette}</span>`;
      }
    }
  }

  private bindEvents() {
    // Close button
    document.getElementById('btn-close-char-inv')?.addEventListener('click', () => this.close());

    // Stat allocation buttons
    document.querySelectorAll('[data-plus-key]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-plus-key');
        const attr = this.attributes.find((a) => a.key === key);
        if (attr && this.availableStatPoints > 0) {
          attr.allocated++;
          this.availableStatPoints--;
          this.updateStatsDisplay();
        }
      });
    });

    // Reset stats
    document.getElementById('btn-reset-stats')?.addEventListener('click', () => {
      for (const attr of this.attributes) {
        this.availableStatPoints += attr.allocated;
        attr.allocated = 0;
      }
      this.updateStatsDisplay();
    });

    // Confirm stats
    document.getElementById('btn-confirm-stats')?.addEventListener('click', () => {
      for (const attr of this.attributes) {
        attr.val += attr.allocated;
        attr.allocated = 0;
      }
      this.updateStatsDisplay();
    });

    // Tabs filter
    document.querySelectorAll('.inv-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.inv-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.getAttribute('data-cat') || 'all';
      });
    });

    // Expand slots button
    document.getElementById('btn-inv-expand')?.addEventListener('click', () => {
      for (let i = 0; i < 6; i++) {
        this.inventorySlots.push(null);
      }
      this.renderInventoryGrid();
    });
  }

  private updateStatsDisplay() {
    const counter = document.getElementById('stat-points-counter');
    if (counter) counter.textContent = `${this.availableStatPoints} điểm`;

    for (const attr of this.attributes) {
      const valEl = document.getElementById(`attr-val-${attr.key}`);
      if (valEl) {
        valEl.textContent = `${attr.val + attr.allocated}`;
        valEl.style.color = attr.allocated > 0 ? '#4ade80' : '#ffffff';
      }
    }
  }

  private initTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'elysia-item-tooltip';
    tooltip.id = 'elysia-item-tooltip';
    document.body.appendChild(tooltip);
  }

  private showTooltip(item: ItemEntity, e: MouseEvent) {
    const tooltip = document.getElementById('elysia-item-tooltip');
    if (!tooltip) return;

    tooltip.innerHTML = `
      <div class="tooltip-title">${item.name}</div>
      <div class="tooltip-meta-row">
        <span>Loại: ${item.category.toUpperCase()}</span>
        <span style="color: #fbbf24;">Độ hiếm: ${item.rarity.toUpperCase()}</span>
      </div>
      <div class="tooltip-desc">${item.description}</div>
      <div class="tooltip-stats">
        <span>✦ Cấp yêu cầu: Lv.${item.requiredLevel}</span>
        <span>✦ Giá bán: ${item.sellPrice} Vàng</span>
      </div>
    `;

    tooltip.style.display = 'block';
    tooltip.style.left = `${e.clientX + 16}px`;
    tooltip.style.top = `${e.clientY - 30}px`;
  }

  private hideTooltip() {
    const tooltip = document.getElementById('elysia-item-tooltip');
    if (tooltip) tooltip.style.display = 'none';
  }

  public open() {
    if (this.backdrop) {
      this.backdrop.style.display = 'flex';
      this.isOpen = true;
    }
  }

  public close() {
    if (this.backdrop) {
      this.backdrop.style.display = 'none';
      this.isOpen = false;
      this.hideTooltip();
    }
  }

  public toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}
