import { HealthResponse, ItemEntity, WeaponEntity } from '@elysia/game-types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      status: 'unhealthy',
      game: 'ELYSIA NO DENSETSU',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: 0,
      environment: 'offline',
      services: {
        server: {
          status: 'unhealthy',
          message: `Backend unreachable at ${API_BASE} (${err.message})`,
        },
        database: { status: 'unhealthy', message: 'Unknown' },
        redis: { status: 'unhealthy', message: 'Unknown' },
      },
    };
  }
}

export async function fetchClasses() {
  const res = await fetch(`${API_BASE}/game/classes`);
  return res.json();
}

export async function fetchMonsters() {
  const res = await fetch(`${API_BASE}/game/monsters`);
  return res.json();
}

export async function fetchCharacters() {
  try {
    const res = await fetch(`${API_BASE}/characters`);
    if (!res.ok) return { data: [] };
    return await res.json();
  } catch {
    return { data: [] };
  }
}

// ==========================================
// ADMIN ITEM APIS
// ==========================================

export async function fetchAdminItems(params: Record<string, any> = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      query.append(key, String(value));
    }
  }
  const res = await fetch(`${API_BASE}/admin/items?${query.toString()}`);
  return res.json();
}

export async function fetchAdminItemById(id: string) {
  const res = await fetch(`${API_BASE}/admin/items/${id}`);
  return res.json();
}

export async function createAdminItem(dto: any) {
  const res = await fetch(`${API_BASE}/admin/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi khi tạo vật phẩm.');
  return data;
}

export async function updateAdminItem(id: string, dto: any) {
  const res = await fetch(`${API_BASE}/admin/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi khi cập nhật vật phẩm.');
  return data;
}

export async function deleteAdminItem(id: string) {
  const res = await fetch(`${API_BASE}/admin/items/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function duplicateAdminItem(id: string) {
  const res = await fetch(`${API_BASE}/admin/items/${id}/duplicate`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi khi nhân bản vật phẩm.');
  return data;
}

export async function archiveAdminItem(id: string) {
  const res = await fetch(`${API_BASE}/admin/items/${id}/archive`, { method: 'POST' });
  return res.json();
}

export async function publishAdminItem(id: string) {
  const res = await fetch(`${API_BASE}/admin/items/${id}/publish`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi khi xuất bản vật phẩm.');
  return data;
}

// ==========================================
// ADMIN WEAPON APIS
// ==========================================

export async function fetchAdminWeapons(params: Record<string, any> = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      query.append(key, String(value));
    }
  }
  const res = await fetch(`${API_BASE}/admin/weapons?${query.toString()}`);
  return res.json();
}

export async function fetchAdminWeaponById(id: string) {
  const res = await fetch(`${API_BASE}/admin/weapons/${id}`);
  return res.json();
}

export async function createAdminWeapon(dto: any) {
  const res = await fetch(`${API_BASE}/admin/weapons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi khi tạo vũ khí.');
  return data;
}

export async function updateAdminWeapon(id: string, dto: any) {
  const res = await fetch(`${API_BASE}/admin/weapons/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi khi cập nhật vũ khí.');
  return data;
}

export async function deleteAdminWeapon(id: string) {
  const res = await fetch(`${API_BASE}/admin/weapons/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function duplicateAdminWeapon(id: string) {
  const res = await fetch(`${API_BASE}/admin/weapons/${id}/duplicate`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi khi nhân bản vũ khí.');
  return data;
}

export async function archiveAdminWeapon(id: string) {
  const res = await fetch(`${API_BASE}/admin/weapons/${id}/archive`, { method: 'POST' });
  return res.json();
}

export async function publishAdminWeapon(id: string) {
  const res = await fetch(`${API_BASE}/admin/weapons/${id}/publish`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi khi xuất bản vũ khí.');
  return data;
}

// ==========================================
// ASSET MANAGEMENT & UPLOAD APIS
// ==========================================

export async function uploadAssetFile(
  file: File,
  category: string,
  assetRole: string = 'INVENTORY',
  changeNote: string = 'Upload qua Admin'
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  formData.append('assetRole', assetRole);
  formData.append('changeNote', changeNote);

  const res = await fetch(`${API_BASE}/admin/assets/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi khi tải ảnh lên máy chủ.');
  return data.data;
}

export async function replaceAssetFile(assetId: string, file: File, changeNote: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('changeNote', changeNote);

  const res = await fetch(`${API_BASE}/admin/assets/${assetId}/replace`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi khi thay thế hình ảnh.');
  return data.data;
}

export async function rollbackAssetVersion(assetId: string, versionNumber: number) {
  const res = await fetch(`${API_BASE}/admin/assets/${assetId}/rollback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ versionNumber }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi khi rollback phiên bản ảnh.');
  return data.data;
}
