/**
 * ELYSIA NO DENSETSU — AUTHENTICATION & TITLE MODAL
 * Japanese Anime Fantasy Style Portal
 */

import { loginApi, registerApi } from '../services/apiClient';

export interface AuthSuccessData {
  token: string;
  account: {
    id: string;
    username: string;
    email?: string;
    role: string;
  };
}

export class AuthModal {
  private container: HTMLElement;
  private currentTab: 'login' | 'register' = 'login';
  private onAuthenticated: (auth: AuthSuccessData) => void;
  private errorMessage = '';
  private successMessage = '';
  private isLoading = false;

  constructor(onAuthenticated: (auth: AuthSuccessData) => void) {
    this.onAuthenticated = onAuthenticated;
    this.container = document.createElement('div');
    this.container.id = 'elysia-auth-modal-root';
    this.container.className = 'elysia-auth-backdrop';
    document.body.appendChild(this.container);
    this.render();
  }

  public open() {
    this.container.style.display = 'flex';
    this.errorMessage = '';
    this.successMessage = '';
    this.render();
  }

  public close() {
    this.container.style.display = 'none';
  }

  public isOpen(): boolean {
    return this.container.style.display !== 'none';
  }

  private setTab(tab: 'login' | 'register') {
    this.currentTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
    this.render();
  }

  private async handleLogin(u?: string, p?: string) {
    const usernameInput = (document.getElementById('auth-login-username') as HTMLInputElement)?.value.trim();
    const passwordInput = (document.getElementById('auth-login-password') as HTMLInputElement)?.value;

    const username = u || usernameInput;
    const password = p || passwordInput;

    if (!username || !password) {
      this.errorMessage = 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!';
      this.render();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.render();

    const res = await loginApi(username, password);
    this.isLoading = false;

    if (res.success && res.data) {
      localStorage.setItem('elysia_token', res.data.token);
      localStorage.setItem('elysia_user', JSON.stringify(res.data.account));
      this.successMessage = `Đăng nhập thành công! Chào mừng ${res.data.account.username}.`;
      this.render();
      setTimeout(() => {
        this.close();
        this.onAuthenticated(res.data!);
      }, 500);
    } else {
      this.errorMessage = res.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      this.render();
    }
  }

  private async handleRegister() {
    const username = (document.getElementById('auth-reg-username') as HTMLInputElement)?.value.trim();
    const email = (document.getElementById('auth-reg-email') as HTMLInputElement)?.value.trim();
    const password = (document.getElementById('auth-reg-password') as HTMLInputElement)?.value;
    const confirm = (document.getElementById('auth-reg-confirm') as HTMLInputElement)?.value;

    if (!username || !email || !password) {
      this.errorMessage = 'Vui lòng điền đầy đủ các thông tin bắt buộc!';
      this.render();
      return;
    }

    if (username.length < 3) {
      this.errorMessage = 'Tên đăng nhập phải có ít nhất 3 ký tự!';
      this.render();
      return;
    }

    if (password.length < 6) {
      this.errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự!';
      this.render();
      return;
    }

    if (password !== confirm) {
      this.errorMessage = 'Mật khẩu xác nhận không trùng khớp!';
      this.render();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.render();

    const res = await registerApi(username, email, password);
    this.isLoading = false;

    if (res.success && res.data) {
      localStorage.setItem('elysia_token', res.data.token);
      localStorage.setItem('elysia_user', JSON.stringify(res.data.account));
      this.successMessage = `Tạo tài khoản thành công! Đang chuyển vào thế giới...`;
      this.render();
      setTimeout(() => {
        this.close();
        this.onAuthenticated(res.data!);
      }, 600);
    } else {
      this.errorMessage = res.error || 'Đăng ký không thành công. Tên hoặc email có thể đã được sử dụng!';
      this.render();
    }
  }

  private render() {
    this.container.innerHTML = `
      <div class="elysia-auth-card">
        <!-- TITLE BANNER -->
        <div class="auth-card-banner">
          <div class="auth-logo-badge">⚔️</div>
          <h1 class="auth-main-title">ELYSIA NO DENSETSU</h1>
          <div class="auth-sub-title">エリシアの伝説 • ELYSIA FRONTIER</div>
          <div class="auth-server-status">
            <span class="status-pulse-dot"></span>
            <span>Máy Chủ: <strong>Elysia-01 (Frontier)</strong> — Trực Tuyến 🟢</span>
          </div>
        </div>

        <!-- TABS -->
        <div class="auth-tabs-row">
          <button id="tab-auth-login" class="auth-tab-btn ${this.currentTab === 'login' ? 'active' : ''}">
            🔑 Đăng Nhập
          </button>
          <button id="tab-auth-register" class="auth-tab-btn ${this.currentTab === 'register' ? 'active' : ''}">
            ✨ Đăng Ký Tài Khoản
          </button>
        </div>

        <!-- FEEDBACK MESSAGES -->
        ${this.errorMessage ? `<div class="auth-msg-box error">⚠️ ${this.errorMessage}</div>` : ''}
        ${this.successMessage ? `<div class="auth-msg-box success">✓ ${this.successMessage}</div>` : ''}

        <!-- TAB CONTENT: LOGIN -->
        ${
          this.currentTab === 'login'
            ? `
          <div class="auth-form-body">
            <div class="auth-input-group">
              <label>Tên Đăng Nhập hoặc Email</label>
              <input type="text" id="auth-login-username" placeholder="Nhập tên tài khoản..." value="player" />
            </div>

            <div class="auth-input-group">
              <label>Mật Khẩu</label>
              <input type="password" id="auth-login-password" placeholder="Nhập mật khẩu..." value="player123" />
            </div>

            <button id="btn-submit-login" class="auth-btn-primary" ${this.isLoading ? 'disabled' : ''}>
              ${this.isLoading ? 'Đang xác thực...' : '⚔️ Đăng Nhập Vào Game'}
            </button>

            <div class="auth-divider"><span>Hoặc Chọn Đăng Nhập Nhanh</span></div>

            <div class="auth-quick-actions">
              <button id="btn-quick-player" class="auth-btn-quick" title="Đăng nhập tài khoản tân thủ test">
                ⚡ Tân Thủ (player / player123)
              </button>
              <button id="btn-quick-admin" class="auth-btn-quick" title="Đăng nhập tài khoản quản trị">
                👑 Quản Trị Viên (admin / admin123)
              </button>
            </div>
          </div>
        `
            : `
          <!-- TAB CONTENT: REGISTER -->
          <div class="auth-form-body">
            <div class="auth-input-group">
              <label>Tên Tài Khoản (3 - 20 ký tự)</label>
              <input type="text" id="auth-reg-username" placeholder="Ví dụ: HiệpSĩElysia_01" />
            </div>

            <div class="auth-input-group">
              <label>Email Liên Kết</label>
              <input type="email" id="auth-reg-email" placeholder="Ví dụ: player@elysia.com" />
            </div>

            <div class="auth-input-group">
              <label>Mật Khẩu (Tối thiểu 6 ký tự)</label>
              <input type="password" id="auth-reg-password" placeholder="Nhập mật khẩu an toàn..." />
            </div>

            <div class="auth-input-group">
              <label>Xác Nhận Mật Khẩu</label>
              <input type="password" id="auth-reg-confirm" placeholder="Nhập lại mật khẩu..." />
            </div>

            <button id="btn-submit-register" class="auth-btn-primary" ${this.isLoading ? 'disabled' : ''}>
              ${this.isLoading ? 'Đang khởi tạo tài khoản...' : '✨ Tạo Tài Khoản & Bước Vào Thế Giới'}
            </button>
          </div>
        `
        }

        <!-- FOOTER -->
        <div class="auth-card-footer">
          <span>Phiên bản: 1.0.0 Production | HTML5 MMORPG 2D Anime Chibi</span>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents() {
    document.getElementById('tab-auth-login')?.addEventListener('click', () => this.setTab('login'));
    document.getElementById('tab-auth-register')?.addEventListener('click', () => this.setTab('register'));

    // Submit actions
    document.getElementById('btn-submit-login')?.addEventListener('click', () => this.handleLogin());
    document.getElementById('btn-submit-register')?.addEventListener('click', () => this.handleRegister());

    // Enter key submit
    const loginPass = document.getElementById('auth-login-password') as HTMLInputElement;
    if (loginPass) {
      loginPass.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleLogin();
      });
    }

    const regConfirm = document.getElementById('auth-reg-confirm') as HTMLInputElement;
    if (regConfirm) {
      regConfirm.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleRegister();
      });
    }

    // Quick Play buttons
    document.getElementById('btn-quick-player')?.addEventListener('click', () => {
      this.handleLogin('player', 'player123');
    });

    document.getElementById('btn-quick-admin')?.addEventListener('click', () => {
      this.handleLogin('admin', 'admin123');
    });
  }
}
