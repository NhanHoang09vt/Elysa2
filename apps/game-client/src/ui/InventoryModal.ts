import { ItemEntity, WeaponEntity, ItemRarity } from '@elysia/game-types';

const RARITY_COLORS: Record<ItemRarity, { border: string; bg: string; text: string; glow: string }> = {
  common: { border: 'rgba(148, 163, 184, 0.4)', bg: 'rgba(148, 163, 184, 0.1)', text: '#cbd5e1', glow: 'rgba(148, 163, 184, 0.2)' },
  uncommon: { border: 'rgba(52, 211, 153, 0.5)', bg: 'rgba(52, 211, 153, 0.1)', text: '#34d399', glow: 'rgba(52, 211, 153, 0.3)' },
  rare: { border: 'rgba(96, 165, 250, 0.5)', bg: 'rgba(96, 165, 250, 0.1)', text: '#60a5fa', glow: 'rgba(96, 165, 250, 0.3)' },
  epic: { border: 'rgba(192, 132, 252, 0.6)', bg: 'rgba(192, 132, 252, 0.15)', text: '#c084fc', glow: 'rgba(192, 132, 252, 0.4)' },
  legendary: { border: 'rgba(251, 191, 36, 0.7)', bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)' },
  mythic: { border: 'rgba(244, 63, 94, 0.8)', bg: 'rgba(244, 63, 94, 0.2)', text: '#f43f5e', glow: 'rgba(244, 63, 94, 0.6)' },
};

export interface InventorySlotItem {
  slotId: number;
  itemId: string;
  quantity: number;
  item: ItemEntity;
  weaponData?: WeaponEntity;
}

export class InventoryModal {
  private backdrop: HTMLElement | null = null;
  private isOpen = false;
  private inventoryItems: InventorySlotItem[] = [];
  private equippedWeapon: WeaponEntity | null = null;
  private selectedItem: InventorySlotItem | null = null;
  private publishedItems: ItemEntity[] = [];
  private publishedWeapons: WeaponEntity[] = [];

  private onEquipCallback?: (weapon: WeaponEntity) => void;
  private onUseItemCallback?: (item: ItemEntity) => void;

  constructor(
    onEquip?: (weapon: WeaponEntity) => void,
    onUseItem?: (item: ItemEntity) => void
  ) {
    this.onEquipCallback = onEquip;
    this.onUseItemCallback = onUseItem;
    this.init();
  }

  private async init() {
    this.createDomStructure();
    await this.fetchPublishedData();
    this.loadInventoryFromStorage();
  }

  private async fetchPublishedData() {
    try {
      const itemRes = await fetch('http://localhost:4000/api/v1/game/items');
      const itemJson = await itemRes.json();
      if (itemJson?.data) {
        this.publishedItems = itemJson.data;
      }

      const wpRes = await fetch('http://localhost:4000/api/v1/game/weapons');
      const wpJson = await wpRes.json();
      if (wpJson?.data) {
        this.publishedWeapons = wpJson.data;
      }
    } catch {
      // Fallback if offline
    }
  }

  private loadInventoryFromStorage() {
    const stored = localStorage.getItem('elysia_player_inventory');
    if (stored) {
      try {
        this.inventoryItems = JSON.parse(stored);
      } catch {
        this.seedStarterInventory();
      }
    } else {
      this.seedStarterInventory();
    }

    const equippedStored = localStorage.getItem('elysia_equipped_weapon');
    if (equippedStored) {
      try {
        this.equippedWeapon = JSON.parse(equippedStored);
      } catch {
        // default
      }
    }
  }

  private seedStarterInventory() {
    // Seed default items from published list
    const starterSeed = [
      { id: 'ITEM_SWORD_WOODEN_NOVICE', qty: 1 },
      { id: 'ITEM_SWORD_NOVICE', qty: 1 },
      { id: 'ITEM_BOW_NOVICE', qty: 1 },
      { id: 'ITEM_EXCALIBUR_HOLY', qty: 1 },
      { id: 'ITEM_POTION_HP_SMALL', qty: 15 },
      { id: 'ITEM_ARROW_WOODEN', qty: 250 },
    ];

    this.inventoryItems = starterSeed.map((s, idx) => {
      const item = this.publishedItems.find((p) => p.itemId === s.id) || {
        id: s.id,
        itemId: s.id,
        name: s.id.replace('ITEM_', ''),
        category: 'equipment',
        rarity: 'common',
        requiredLevel: 1,
        requiredClasses: [],
        stackLimit: 99,
        weight: 1,
        buyPrice: 10,
        sellPrice: 2,
        isTradable: true,
        isSellable: true,
        isDroppable: true,
        isAccountBound: false,
        isCharacterBound: false,
        status: 'PUBLISHED',
        primaryAssetUrl: '/assets/weapons/wooden_sword_icon.png',
        createdAt: '',
        updatedAt: '',
      };

      const weapon = this.publishedWeapons.find((w) => w.itemId === s.id);
      return {
        slotId: idx,
        itemId: s.id,
        quantity: s.qty,
        item,
        weaponData: weapon,
      };
    });

    this.saveInventory();
  }

  private saveInventory() {
    localStorage.setItem('elysia_player_inventory', JSON.stringify(this.inventoryItems));
    if (this.equippedWeapon) {
      localStorage.setItem('elysia_equipped_weapon', JSON.stringify(this.equippedWeapon));
    }
  }

  private createDomStructure() {
    const existing = document.getElementById('inventory-modal-backdrop');
    if (existing) existing.remove();

    this.backdrop = document.createElement('div');
    this.backdrop.id = 'inventory-modal-backdrop';
    this.backdrop.className = 'char-creator-backdrop';
    this.backdrop.style.display = 'none';

    this.backdrop.innerHTML = `
      <div class="char-creator-card" style="width: 820px; max-width: 95vw; background: #0f131e; border: 1px solid #2e384e; box-shadow: 0 16px 40px rgba(0,0,0,0.85);">
        <!-- Header -->
        <div class="creator-header" style="background: #141824; border-bottom: 1px solid #252d3e; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">
              🎒
            </div>
            <div>
              <h3 style="font-size: 15px; font-weight: bold; color: #f5d061; letter-spacing: 0.5px;">Túi Đồ Nhân Vật (Inventory)</h3>
              <p style="font-size: 11px; color: #94a3b8; font-mono: true;">Nhấn [I] hoặc [B] để đóng/mở</p>
            </div>
          </div>
          <button id="btn-close-inv" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 4px 8px;">✕</button>
        </div>

        <!-- Body -->
        <div style="display: flex; flex-direction: row; min-height: 420px; max-height: 70vh;">
          <!-- Left: Equipment & Character Paperdoll Preview -->
          <div style="width: 280px; background: #0c0e16; border-right: 1px solid #202738; padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 12px; font-weight: bold; color: #e2e8f0; margin-bottom: 10px; display: flex; items-center; justify-content: space-between;">
                <span>Trang Bị Trên Người</span>
                <span style="font-size: 10px; color: #10b981; font-mono: true;">Active Slots</span>
              </div>

              <!-- Weapon Equipped Slot -->
              <div id="inv-equipped-weapon-slot" style="padding: 10px; border-radius: 8px; background: #131724; border: 1px solid #2a3449; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s;">
                <div id="equipped-weapon-icon-box" style="width: 44px; height: 44px; border-radius: 6px; background: #090b10; border: 1px solid #323d54; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                  <span style="font-size: 20px;">🗡</span>
                </div>
                <div style="flex: 1; min-width: 0;">
                  <span style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-mono: true; display: block;">Vũ Khí Chính (Main Hand)</span>
                  <strong id="equipped-weapon-name" style="font-size: 12px; color: #f5d061; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Kiếm Gỗ Tân Thủ</strong>
                  <span id="equipped-weapon-atk" style="font-size: 10px; color: #34d399; font-mono: true;">+5 ATK</span>
                </div>
              </div>
            </div>

            <!-- Detail / Selected Item Tooltip Panel -->
            <div id="inv-item-detail-panel" style="padding: 12px; border-radius: 8px; background: #111522; border: 1px solid #252e42; margin-top: 12px; min-height: 180px; display: flex; flex-direction: column; justify-content: space-between;">
              <div id="inv-item-detail-content" style="font-size: 11px; color: #cbd5e1; line-height: 1.5;">
                <span style="color: #64748b; font-style: italic;">Nhấp chọn một vật phẩm trong túi đồ để xem chi tiết...</span>
              </div>
              <div id="inv-item-actions-box" style="display: none; gap: 8px; margin-top: 10px;">
                <button id="btn-inv-use-item" style="flex: 1; padding: 7px 12px; border-radius: 6px; background: linear-gradient(135deg, #d4af37, #b8860b); color: #0c0e14; border: none; font-size: 11px; font-weight: bold; cursor: pointer;">
                  Trang Bị / Sử Dụng
                </button>
              </div>
            </div>
          </div>

          <!-- Right: 24 Inventory Grid Slots -->
          <div style="flex: 1; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; background: #121520;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 12px; font-weight: bold; color: #e2e8f0;">Túi Đồ (24 Ngăn)</span>
                <span style="font-size: 11px; color: #fbbf24; font-mono: true;">Tiền Vàng: 1,250 Gold</span>
              </div>

              <!-- 4 columns x 6 rows = 24 slots -->
              <div id="inventory-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
                <!-- Generated dynamically -->
              </div>
            </div>

            <!-- Footer Quick Hint -->
            <div style="font-size: 11px; color: #64748b; padding-top: 10px; border-top: 1px solid #202636; display: flex; justify-content: space-between;">
              <span>Double click vào vũ khí để trang bị ngay lập tức.</span>
              <span>Dung lượng: 6 / 24</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.backdrop);

    // Close button
    document.getElementById('btn-close-inv')?.addEventListener('click', () => {
      this.close();
    });

    // Close on backdrop click outside card
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    // Use / Equip button listener
    document.getElementById('btn-inv-use-item')?.addEventListener('click', () => {
      this.handleUseSelectedItem();
    });
  }

  public open() {
    this.isOpen = true;
    if (this.backdrop) {
      this.backdrop.style.display = 'flex';
      this.renderSlots();
      this.renderEquippedSlot();
    }
  }

  public close() {
    this.isOpen = false;
    if (this.backdrop) {
      this.backdrop.style.display = 'none';
    }
  }

  public toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  private renderSlots() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const TOTAL_SLOTS = 24;
    for (let i = 0; i < TOTAL_SLOTS; i++) {
      const slotItem = this.inventoryItems.find((item) => item.slotId === i);
      const slotEl = document.createElement('div');
      slotEl.style.cssText = `
        width: 64px;
        height: 64px;
        border-radius: 8px;
        background: #090b12;
        border: 1px solid #232b3d;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s;
        box-shadow: inset 0 2px 6px rgba(0,0,0,0.6);
      `;

      if (slotItem) {
        const rarity = slotItem.item.rarity || 'common';
        const rStyle = RARITY_COLORS[rarity] || RARITY_COLORS.common;
        slotEl.style.borderColor = rStyle.border;
        slotEl.style.background = rStyle.bg;

        const isSelected = this.selectedItem?.slotId === i;
        if (isSelected) {
          slotEl.style.outline = '2px solid #f5d061';
          slotEl.style.boxShadow = `0 0 10px ${rStyle.glow}`;
        }

        // Image
        const iconSrc = slotItem.item.primaryAssetUrl || '/assets/weapons/wooden_sword_icon.png';
        const img = document.createElement('img');
        img.src = iconSrc;
        img.alt = slotItem.item.name;
        img.style.cssText = 'max-height: 48px; max-width: 48px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.7)); pointer-events: none;';
        slotEl.appendChild(img);

        // Quantity badge
        if (slotItem.quantity > 1) {
          const qtyBadge = document.createElement('span');
          qtyBadge.innerText = String(slotItem.quantity);
          qtyBadge.style.cssText = 'position: absolute; bottom: 2px; right: 4px; font-size: 10px; font-weight: bold; color: #ffffff; text-shadow: 0 1px 2px #000; font-family: monospace;';
          slotEl.appendChild(qtyBadge);
        }

        // Click to select
        slotEl.addEventListener('click', () => {
          this.selectedItem = slotItem;
          this.renderSlots();
          this.renderDetailPanel(slotItem);
        });

        // Double click to quick use/equip
        slotEl.addEventListener('dblclick', () => {
          this.selectedItem = slotItem;
          this.handleUseSelectedItem();
        });
      } else {
        slotEl.addEventListener('mouseenter', () => {
          slotEl.style.borderColor = '#384560';
        });
        slotEl.addEventListener('mouseleave', () => {
          slotEl.style.borderColor = '#232b3d';
        });
      }

      grid.appendChild(slotEl);
    }
  }

  private renderEquippedSlot() {
    const nameEl = document.getElementById('equipped-weapon-name');
    const atkEl = document.getElementById('equipped-weapon-atk');
    const iconBox = document.getElementById('equipped-weapon-icon-box');

    if (this.equippedWeapon) {
      if (nameEl) nameEl.innerText = this.equippedWeapon.item?.name || this.equippedWeapon.weaponId;
      if (atkEl) atkEl.innerText = `+${this.equippedWeapon.attackPower} ATK (${this.equippedWeapon.weaponType})`;
      if (iconBox && this.equippedWeapon.iconAssetUrl) {
        iconBox.innerHTML = `<img src="${this.equippedWeapon.iconAssetUrl}" style="max-height: 38px; max-width: 38px; object-fit: contain;" />`;
      }
    } else {
      if (nameEl) nameEl.innerText = 'Chưa trang bị';
      if (atkEl) atkEl.innerText = '+0 ATK';
      if (iconBox) iconBox.innerHTML = `<span style="font-size: 20px;">🗡</span>`;
    }
  }

  private renderDetailPanel(slotItem: InventorySlotItem) {
    const content = document.getElementById('inv-item-detail-content');
    const actionBox = document.getElementById('inv-item-actions-box');
    const useBtn = document.getElementById('btn-inv-use-item');

    if (!content || !actionBox || !useBtn) return;

    const { item, weaponData } = slotItem;
    const rarity = item.rarity || 'common';
    const rStyle = RARITY_COLORS[rarity] || RARITY_COLORS.common;

    let statsHtml = '';
    if (weaponData) {
      statsHtml = `
        <div style="margin: 8px 0; padding: 6px 8px; border-radius: 4px; background: rgba(0,0,0,0.4); font-family: monospace; font-size: 10px; color: #34d399;">
          <div>Công vật lý: +${weaponData.attackPower} ATK</div>
          <div>Công phép: +${weaponData.magicAttackPower} MATK</div>
          <div>Độ chính xác: +${weaponData.hit} HIT</div>
          <div>Tốc độ đánh: x${weaponData.attackSpeed} ASPD</div>
          <div>Hệ: ${weaponData.element.toUpperCase()}</div>
        </div>
      `;
      useBtn.innerText = 'Trang Bị Vũ Khí (Equip)';
    } else if (item.properties?.hpRestore) {
      statsHtml = `
        <div style="margin: 8px 0; padding: 6px 8px; border-radius: 4px; background: rgba(0,0,0,0.4); font-family: monospace; font-size: 10px; color: #f87171;">
          <div>Hồi Phục: +${item.properties.hpRestore} HP</div>
          <div>Thời gian hồi: ${item.properties.cooldown || 3} giây</div>
        </div>
      `;
      useBtn.innerText = 'Uống Thuốc (Use)';
    } else {
      useBtn.innerText = 'Sử Dụng';
    }

    content.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
        <div style="width: 38px; height: 38px; border-radius: 6px; background: #07090e; border: 1px solid ${rStyle.border}; display: flex; align-items: center; justify-content: center; padding: 2px;">
          <img src="${item.primaryAssetUrl}" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
        </div>
        <div>
          <strong style="color: ${rStyle.text}; font-size: 12px; display: block;">${item.name}</strong>
          <span style="font-size: 9px; text-transform: uppercase; color: #94a3b8; font-family: monospace;">${item.rarity} ${item.category}</span>
        </div>
      </div>
      <div style="font-size: 10px; color: #94a3b8;">Yêu cầu cấp độ: <strong style="color: #ffffff;">Lv.${item.requiredLevel}</strong></div>
      ${statsHtml}
      <p style="font-size: 11px; color: #cbd5e1; font-style: italic; margin-top: 6px;">${item.description || 'Vật phẩm thần bí trong thế giới Elysia.'}</p>
    `;

    actionBox.style.display = 'flex';
  }

  private handleUseSelectedItem() {
    if (!this.selectedItem) return;

    const { item, weaponData } = this.selectedItem;

    if (weaponData) {
      // Equip weapon
      this.equippedWeapon = weaponData;
      this.renderEquippedSlot();
      this.saveInventory();
      if (this.onEquipCallback) {
        this.onEquipCallback(weaponData);
      }
      this.showToast(`Đã trang bị vũ khí: ${item.name}!`);
    } else if (item.properties?.hpRestore) {
      // Consume potion
      if (this.selectedItem.quantity > 1) {
        this.selectedItem.quantity -= 1;
      } else {
        this.inventoryItems = this.inventoryItems.filter((i) => i.slotId !== this.selectedItem!.slotId);
        this.selectedItem = null;
      }
      this.saveInventory();
      this.renderSlots();
      if (this.onUseItemCallback) {
        this.onUseItemCallback(item);
      }
      this.showToast(`Đã sử dụng ${item.name}: +${item.properties.hpRestore} HP!`);
    }
  }

  private showToast(msg: string) {
    const toast = document.createElement('div');
    toast.innerText = msg;
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(14, 20, 32, 0.95);
      border: 1px solid #d4af37;
      color: #fef08a;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: bold;
      z-index: 2000;
      box-shadow: 0 4px 16px rgba(0,0,0,0.8);
      pointer-events: none;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
}
