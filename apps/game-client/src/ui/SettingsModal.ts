/**
 * ELYSIA NO DENSETSU — MASTER SYSTEM SETTINGS & KEYBINDINGS WINDOW
 * Commercial MMORPG Settings Architecture
 */

export class SettingsModal {
  private backdrop: HTMLElement | null = null;
  private isOpen = false;

  constructor() {
    this.createDom();
  }

  private createDom() {
    const backdrop = document.createElement('div');
    backdrop.className = 'elysia-modal-backdrop';
    backdrop.id = 'modal-settings';

    backdrop.innerHTML = `
      <div class="elysia-modal-window" style="width: 740px; max-width: 95vw; height: 520px; max-height: 90vh;">
        <!-- HEADER -->
        <div class="elysia-window-header">
          <div class="elysia-window-title">
            <span>⚙️</span>
            <span>CÀI ĐẶT HỆ THỐNG & PHÍM TẮT (SETTINGS & CONTROLS)</span>
          </div>
          <button class="elysia-btn-close" id="btn-close-settings">✕</button>
        </div>

        <!-- BODY -->
        <div style="flex: 1; padding: 20px; background: #0c101a; display: flex; flex-direction: column; gap: 16px; overflow-y: auto;">
          <!-- AUDIO & GRAPHICS -->
          <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 12px;">
            <div style="font-weight: 700; color: var(--elysia-gold); font-size: 13px;">Âm Thanh & Đồ Họa</div>

            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
              <span>Âm lượng Nhạc Nền (BGM):</span>
              <input type="range" min="0" max="100" value="80" style="width: 200px; accent-color: #d4af37;" />
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
              <span>Âm lượng Hiệu Ứng Chiêu Thức (SFX):</span>
              <input type="range" min="0" max="100" value="90" style="width: 200px; accent-color: #d4af37;" />
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
              <span>Tốc độ khung hình mục tiêu:</span>
              <span style="color: #34d399; font-weight: 700;">60 FPS (Đã bật V-Sync)</span>
            </div>
          </div>

          <!-- KEYBINDINGS REFERENCE -->
          <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-weight: 700; color: var(--elysia-gold); font-size: 13px;">Bảng Phím Tắt Điều Khiển Chuẩn (Keybindings)</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11.5px; color: #cbd5e1;">
              <div><strong>[W, A, S, D]:</strong> Di chuyển 8 hướng</div>
              <div><strong>[J] / Chuột Trái:</strong> Đòn đánh cơ bản</div>
              <div><strong>[1, 2, 3, 4, 5]:</strong> 5 Kỹ năng chính (Primary)</div>
              <div><strong>[Q, W, E, R]:</strong> 4 Kỹ năng phụ trợ (Secondary)</div>
              <div><strong>[SPACE]:</strong> Tuyệt Kỹ Tối Thượng (Ultimate)</div>
              <div><strong>[Z, X, C]:</strong> 3 Ô Dược phẩm nhanh</div>
              <div><strong>[C] / [I] / [B]:</strong> Mở Nhân Vật & Túi Đồ</div>
              <div><strong>[M]:</strong> Bản Đồ Thế Giới</div>
              <div><strong>[ESC]:</strong> Đóng cửa sổ / Cài đặt</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.backdrop = backdrop;

    document.getElementById('btn-close-settings')?.addEventListener('click', () => this.close());
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
