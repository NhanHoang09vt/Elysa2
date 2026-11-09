/**
 * ELYSIA NO DENSETSU — MASTER EVENTS WINDOW
 * Daily Login & World Boss Event Architecture
 */

export class EventModal {
  private backdrop: HTMLElement | null = null;
  private isOpen = false;

  private days = [
    { day: 1, reward: '10,000 Vàng', icon: '🪙', claimed: true },
    { day: 2, reward: '50 Bình Máu Nhỏ', icon: '🧪', claimed: true },
    { day: 3, reward: '5 Đá Cường Hóa', icon: '💎', claimed: false, current: true },
    { day: 4, reward: 'Thời Trang Tân Thủ', icon: '👘', claimed: false },
    { day: 5, reward: '100 Kim Cương', icon: '💠', claimed: false },
    { day: 6, reward: 'Bao Tên Hoàng Kim', icon: '🏹', claimed: false },
    { day: 7, reward: 'Thần Kiếm Tuyệt Phẩm', icon: '⚔️', claimed: false },
  ];

  constructor() {
    this.createDom();
  }

  private createDom() {
    const backdrop = document.createElement('div');
    backdrop.className = 'elysia-modal-backdrop';
    backdrop.id = 'modal-events';

    backdrop.innerHTML = `
      <div class="elysia-modal-window" style="width: 820px; max-width: 95vw; height: 540px; max-height: 90vh;">
        <!-- HEADER -->
        <div class="elysia-window-header">
          <div class="elysia-window-title">
            <span>🎉</span>
            <span>TRUNG TÂM HOẠT ĐỘNG & SỰ KIỆN (EVENTS CENTER)</span>
          </div>
          <button class="elysia-btn-close" id="btn-close-events">✕</button>
        </div>

        <!-- BODY -->
        <div style="flex: 1; padding: 20px; background: #0c101a; display: flex; flex-direction: column; gap: 16px; overflow-y: auto;">
          <!-- EVENT 1: 7-DAY LOGIN REWARDS -->
          <div style="background: radial-gradient(circle, #1a243b 0%, #0d1322 85%); border: 1.5px solid var(--elysia-gold-border); border-radius: 12px; padding: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div>
                <span style="font-family: var(--elysia-font-title); font-size: 14px; font-weight: 700; color: var(--elysia-gold);">Điểm Danh 7 Ngày Nhận Thần Khí</span>
                <span style="font-size: 11px; color: #94a3b8; margin-left: 8px;">Đăng nhập mỗi ngày để nhận quà tặng giá trị</span>
              </div>
              <button class="inv-action-btn" id="btn-claim-today" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; border-color: #34d399; font-weight: 700;">Nhận Quà Ngày 3</button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">
              ${this.days
                .map(
                  (d) => `
                <div style="background: rgba(0,0,0,0.4); border: 1.5px solid ${d.current ? '#facc15' : d.claimed ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 8px; padding: 10px 6px; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; position: relative;">
                  ${d.claimed ? '<span style="position: absolute; top: 4px; right: 4px; color: #10b981; font-size: 10px;">✓</span>' : ''}
                  <span style="font-size: 10px; font-weight: 700; color: #94a3b8;">Ngày ${d.day}</span>
                  <span style="font-size: 24px;">${d.icon}</span>
                  <span style="font-size: 10px; color: #e2e8f0; font-weight: 600; line-height: 1.2;">${d.reward}</span>
                </div>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- EVENT 2: WORLD BOSS & DUNGEONS -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div style="background: radial-gradient(circle, #2d1218 0%, #130a0d 85%); border: 1.5px solid rgba(239, 68, 68, 0.5); border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 36px;">🐉</span>
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 700; color: #fca5a5;">Ma Long Thức Tỉnh (World Boss)</div>
                <div style="font-size: 11px; color: #94a3b8;">Xuất hiện tại Hẻm Núi Hỏa Long lúc 20:00 hằng ngày.</div>
                <div style="font-size: 11px; font-weight: 700; color: #facc15; margin-top: 4px;">Đếm ngược: 04:35:12</div>
              </div>
            </div>

            <div style="background: radial-gradient(circle, #1a1e38 0%, #0a0d18 85%); border: 1.5px solid rgba(96, 165, 250, 0.5); border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 36px;">🏰</span>
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 700; color: #93c5fd;">Hầm Ngục Tinh Tú (Dungeon)</div>
                <div style="font-size: 11px; color: #94a3b8;">Vượt ải tổ đội săn trang bị thần thoại (3/3 lượt/ngày).</div>
                <div style="font-size: 11px; font-weight: 700; color: #34d399; margin-top: 4px;">Trạng thái: Đang Mở</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.backdrop = backdrop;

    document.getElementById('btn-close-events')?.addEventListener('click', () => this.close());
    document.getElementById('btn-claim-today')?.addEventListener('click', () => {
      alert('Đã nhận thành công quà tặng Ngày 3: [5 Đá Cường Hóa Thần Cấp]!');
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
