import { HealthResponse, CharacterEntity, Gender, ClassId, PrimaryAttributes, CharacterAppearance } from '@elysia/game-types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export async function loginApi(username: string, password: string): Promise<{ success: boolean; data?: { token: string; account: any }; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || json.message || 'Tài khoản hoặc mật khẩu không chính xác.' };
    }
    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể kết nối đến máy chủ xác thực.' };
  }
}

export async function registerApi(username: string, email: string, password: string): Promise<{ success: boolean; data?: { token: string; account: any }; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || json.message || 'Đăng ký tài khoản thất bại.' };
    }
    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể kết nối đến máy chủ xác thực.' };
  }
}

export async function checkServerHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface CreateCharacterPayload {
  name: string;
  gender: Gender;
  classId: ClassId;
  appearance?: CharacterAppearance;
  stats?: PrimaryAttributes;
}

export async function createCharacter(payload: CreateCharacterPayload): Promise<{ success: boolean; data?: CharacterEntity; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.message || 'Lỗi tạo nhân vật từ máy chủ.' };
    }
    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể kết nối đến máy chủ API.' };
  }
}

export async function fetchCharacters(): Promise<CharacterEntity[]> {
  try {
    const res = await fetch(`${API_BASE}/characters`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchMonsters(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/game/monsters`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchRegions(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/game/regions`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchSpawns(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/game/spawns`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchNpcs(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/game/npcs`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchQuests(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/game/quests`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}
