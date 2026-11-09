/**
 * ELYSIA NO DENSETSU — MASTER WORLD MAP WINDOW
 * Japanese Anime Fantasy Continental Map Architecture
 */

export class WorldMapModal {
  private backdrop: HTMLElement | null = null;
  private isOpen = false;

  private regions = [
    { id: 'region_novice', name: 'Tân Thủ Thôn (Beginner Village)', level: 'Lv.1 - 15', desc: 'Thung lũng trù phú yên bình, nơi mọi nhà thám hiểm đặt những bước chân đầu tiên.', status: 'CURRENT' },
    { id: 'region_forest', name: 'Rừng Tinh Linh (Elf Whispering Forest)', level: 'Lv.15 - 30', desc: 'Khu rừng huyền bí chứa đầy hoa cỏ phát quang và các bộ lạc mộc tinh linh.', status: 'OPEN' },
    { id: 'region_canyon', name: 'Hẻm Núi Hỏa Long (Dragon Fire Canyon)', level: 'Lv.30 - 45', desc: 'Vùng đất dung nham rực lửa, nơi loài rồng cổ xưa ngự trị và bảo vệ bảo vật.', status: 'LOCKED' },
    { id: 'region_capital', name: 'Vương Thành Thánh Quang (Holy Capital Elysia)', level: 'Lv.45 - 60', desc: 'Thủ phủ hùng vĩ của toàn cõi nhân loại, trung tâm thương mại và cung điện hoàng gia.', status: 'LOCKED' },
  ];

  constructor() {
    this.createDom();
  }

  private createDom() {
    const backdrop = document.createElement('div');
    backdrop.className = 'elysia-modal-backdrop';
    backdrop.id = 'modal-world-map';

    backdrop.innerHTML = `
      <div class="elysia-modal-window" style="width: 860px; max-width: 95vw; height: 560px; max-height: 90vh;">
        <!-- HEADER -->
        <div class="elysia-window-header">
          <div class="elysia-window-title">
            <span>🗺️</span>
            <span>BẢN ĐỒ THẾ GIỚI — ĐẠI LỤC ELYSIA (WORLD MAP)</span>
          </div>
          <button class="elysia-btn-close" id="btn-close-map">✕</button>
        </div>

        <!-- CONTINENT MAP DISPLAY -->
        <div style="flex: 1; position: relative; background: radial-gradient(circle, #152238 0%, #070d18 90%); overflow: hidden; display: flex; align-items: center; justify-content: center;">
          <!-- Fantasy Map Grid / Compass Lines -->
          <svg style="position: absolute; width: 100%; height: 100%; opacity: 0.15;" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="50%" r="180" fill="none" stroke="#d4af37" stroke-width="1.5" stroke-dasharray="6 4" />
            <circle cx="50%" cy="50%" r="300" fill="none" stroke="#d4af37" stroke-width="1.5" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#d4af37" stroke-width="1" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#d4af37" stroke-width="1" />
          </svg>

          <!-- REGION PINS -->
          <div style="position: absolute; top: 58%; left: 32%; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #10b981; border: 2.5px solid #ffffff; box-shadow: 0 0 16px #10b981; display: flex; align-items: center; justify-content: center; font-size: 12px;">🌟</div>
            <span style="font-size: 11px; font-weight: 800; color: #facc15; background: rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px; margin-top: 4px; border: 1px solid rgba(212,175,55,0.4);">Tân Thủ Thôn (Hiện Tại)</span>
          </div>

          <div style="position: absolute; top: 38%; left: 52%; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #3b82f6; border: 2px solid #ffffff; box-shadow: 0 0 12px #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 10px;">🌲</div>
            <span style="font-size: 11px; font-weight: 700; color: #93c5fd; background: rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px; margin-top: 4px;">Rừng Tinh Linh (Lv.15+)</span>
          </div>

          <div style="position: absolute; top: 22%; left: 72%; display: flex; flex-direction: column; align-items: center; opacity: 0.7;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #ef4444; border: 2px solid #ffffff; box-shadow: 0 0 12px #ef4444; display: flex; align-items: center; justify-content: center; font-size: 10px;">🌋</div>
            <span style="font-size: 11px; font-weight: 700; color: #fca5a5; background: rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px; margin-top: 4px;">Hẻm Núi Hỏa Long (Lv.30+)</span>
          </div>

          <div style="position: absolute; top: 28%; left: 22%; display: flex; flex-direction: column; align-items: center; opacity: 0.7;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #a855f7; border: 2px solid #ffffff; box-shadow: 0 0 12px #a855f7; display: flex; align-items: center; justify-content: center; font-size: 10px;">🏰</div>
            <span style="font-size: 11px; font-weight: 700; color: #d8b4fe; background: rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px; margin-top: 4px;">Vương Thành Thánh Quang</span>
          </div>
        </div>

        <!-- FOOTER REGIONS SUMMARY -->
        <div style="background: #0d121f; border-top: 1px solid rgba(212, 175, 55, 0.3); padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
          <span style="color: #94a3b8;">Vùng đất hiện tại: <strong style="color: #facc15;">Tân Thủ Thôn (X: 125, Y: 087)</strong></span>
          <span style="color: #64748b;">Nhấp vào vị trí trên bản đồ để tự động di chuyển hoặc dịch chuyển</span>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.backdrop = backdrop;

    document.getElementById('btn-close-map')?.addEventListener('click', () => this.close());
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
