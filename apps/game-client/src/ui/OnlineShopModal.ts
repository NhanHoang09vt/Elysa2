/**
 * ELYSIA NO DENSETSU — MASTER ONLINE SHOP WINDOW
 * Premium Fantasy Merchant Architecture
 */

export class OnlineShopModal {
  private backdrop: HTMLElement | null = null;
  private isOpen = false;

  private shopItems = [
    { id: 'shop_costume_01', name: 'Thời Trang: Nữ Kiếm Sĩ Hoàng Kim', category: 'costume', price: 880, currency: 'rubies', discount: '-25%', icon: '👘', desc: 'Bộ lễ phục kiếm sĩ hoàng kim lộng lẫy tăng 5% tốc độ chạy và vầng sáng hào quang.' },
    { id: 'shop_mount_01', name: 'Thú Cưỡi: Kỳ Lân Băng Tuyết', category: 'mount', price: 1200, currency: 'rubies', discount: '-15%', icon: '🦄', desc: 'Thú cưỡi thần thoại tăng 60% tốc độ di chuyển trên toàn cõi Elysia.' },
    { id: 'shop_pet_01', name: 'Thú Cưng: Tiểu Hỏa Long', category: 'pet', price: 650, currency: 'rubies', discount: null, icon: '🐲', desc: 'Thú cưng tự động nhặt toàn bộ vật phẩm rơi xung quanh và tăng 5% sát thương hỏa.' },
    { id: 'shop_pkg_01', name: 'Gói Tân Thủ Siêu Cấp', category: 'package', price: 299, currency: 'rubies', discount: '-50%', icon: '🎁', desc: 'Bao gồm 50 Bình Máu Lớn, 50 Bình Mana, 10 Đá Cường Hóa và Vé Mở Rộng Rương Đồ.' },
    { id: 'shop_mat_01', name: 'Đá Cường Hóa Thần Cấp (x10)', category: 'material', price: 50000, currency: 'gold', discount: null, icon: '💎', desc: 'Nguyên liệu rèn đúc bắt buộc để nâng cấp vũ khí lên cấp độ +10 trở lên.' },
    { id: 'shop_pkg_02', name: 'Gói May Mắn Tuần', category: 'package', price: 499, currency: 'rubies', discount: '-30%', icon: '📦', desc: 'Nhận ngay 100,000 Vàng, 5 Rương Trang Bị Sử Thi và 1 Cuộn Dịch Chuyển Thần Tốc.' },
  ];

  public onPurchaseItem?: (item: any) => void;

  constructor() {
    this.createDom();
  }

  private createDom() {
    const backdrop = document.createElement('div');
    backdrop.className = 'elysia-modal-backdrop';
    backdrop.id = 'modal-online-shop';

    backdrop.innerHTML = `
      <div class="elysia-modal-window" style="width: 880px; max-width: 95vw; height: 580px; max-height: 90vh;">
        <!-- HEADER -->
        <div class="elysia-window-header">
          <div class="elysia-window-title">
            <span>💎</span>
            <span>CỬA HÀNG TRỰC TUYẾN (ELYSIA ONLINE SHOP)</span>
          </div>
          <button class="elysia-btn-close" id="btn-close-shop">✕</button>
        </div>

        <!-- SHOP BANNER & BALANCE -->
        <div style="background: linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%); padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(212, 175, 55, 0.3);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 28px;">🛍️</span>
            <div>
              <div style="font-weight: 700; color: #facc15; font-size: 13px;">Ưu Đãi Tân Thủ Tuần Lễ Vàng</div>
              <div style="font-size: 11px; color: #94a3b8;">Giảm giá lên đến 50% cho các gói phục trang và thú cưỡi huyền thoại.</div>
            </div>
          </div>
          <div style="display: flex; gap: 16px; font-size: 12px; font-weight: 700;">
            <span style="color: #facc15;">🪙 Vàng: 125,400</span>
            <span style="color: #f43f5e;">💎 Kim Cương: 1,250</span>
          </div>
        </div>

        <!-- BODY -->
        <div style="flex: 1; padding: 18px; overflow-y: auto; background: #0c101a;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
            ${this.shopItems
              .map(
                (item) => `
              <div style="background: radial-gradient(circle, #1a2338 0%, #0d1220 85%); border: 1.5px solid rgba(212, 175, 55, 0.4); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 8px; position: relative;">
                ${item.discount ? `<span style="position: absolute; top: 8px; right: 8px; background: #ef4444; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">${item.discount}</span>` : ''}
                <div style="font-size: 36px; text-align: center; margin: 4px 0;">${item.icon}</div>
                <div style="font-weight: 700; color: #f1f5f9; font-size: 12.5px;">${item.name}</div>
                <div style="font-size: 10.5px; color: #94a3b8; line-height: 1.35; flex: 1;">${item.desc}</div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 8px;">
                  <span style="font-weight: 800; color: ${item.currency === 'rubies' ? '#f43f5e' : '#facc15'}; font-size: 13px;">
                    ${item.currency === 'rubies' ? '💎' : '🪙'} ${item.price.toLocaleString()}
                  </span>
                  <button class="inv-action-btn" data-buy-id="${item.id}" style="background: linear-gradient(135deg, #d4af37, #b8860b); color: #0b0f19; font-weight: 800; padding: 4px 12px;">Mua</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.backdrop = backdrop;

    document.getElementById('btn-close-shop')?.addEventListener('click', () => this.close());

    backdrop.querySelectorAll('[data-buy-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-buy-id');
        const it = this.shopItems.find((s) => s.id === id);
        if (it) {
          alert(`Chúc mừng! Bạn đã mua thành công vật phẩm [${it.name}] từ Cửa Hàng Trực Tuyến.`);
          this.onPurchaseItem?.(it);
        }
      });
    });
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
    }
  }

  public toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }
}
