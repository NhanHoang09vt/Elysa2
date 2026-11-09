import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Film,
  Save,
  X,
} from 'lucide-react';
import { INITIAL_CLASSES } from '@elysia/game-data-schema';

export interface CharacterAssetCreatorProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CharacterAssetCreator({ onSuccess, onCancel }: CharacterAssetCreatorProps) {
  const [characterId, setCharacterId] = useState('ELYSIA_MAGE_F001');
  const [name, setName] = useState('Pháp Sư Nữ (Female Mage)');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [classId, setClassId] = useState('mage');
  const [headRatio, setHeadRatio] = useState(2.8);
  const [anchorAxisX, setAnchorAxisX] = useState(128);
  const [baselineY, setBaselineY] = useState(238);
  const [masterSpritePath, setMasterSpritePath] = useState('/assets/characters/female/mage/mage_female_master_256.png');
  const [description, setDescription] = useState('Chibi anime mage with staff, wizard robe and amethyst eyes.');

  const [elements, setElements] = useState([
    { id: '01_hair_back', name: 'Tóc Phía Sau', zIndex: 5, bone: 'head_hair_tail', category: 'hair' },
    { id: '02_shadow_ground', name: 'Bóng Đổ Tiếp Đất', zIndex: 0, bone: 'root_shadow', category: 'shadow' },
    { id: '03_body_torso_skin', name: 'Khung Thân Người', zIndex: 30, bone: 'chest_root', category: 'body' },
    { id: '04_costume_robe', name: 'Áo Choàng Pháp Sư', zIndex: 40, bone: 'pelvis_robe', category: 'costume' },
    { id: '05_head_base', name: 'Khuôn Mặt & Cổ', zIndex: 55, bone: 'head_base', category: 'head' },
    { id: '06_face_eyes', name: 'Đôi Mắt Tím', zIndex: 60, bone: 'eyes', category: 'head' },
    { id: '07_hair_front_bangs', name: 'Tóc Mái Trước', zIndex: 70, bone: 'hair_front', category: 'hair' },
    { id: '08_weapon_staff', name: 'Trượng Phép Thuật', zIndex: 90, bone: 'weapon_main', category: 'weapon' },
  ]);

  const [animations, setAnimations] = useState([
    { action: 'idle', name: 'Đứng Chờ', frames: 6, fps: 8 },
    { action: 'walk', name: 'Đi Bộ', frames: 6, fps: 10 },
    { action: 'run', name: 'Chạy', frames: 6, fps: 12 },
    { action: 'attack', name: 'Đánh Thường', frames: 5, fps: 12 },
    { action: 'cast', name: 'Niệm Phép (Cast)', frames: 6, fps: 10 },
    { action: 'hurt', name: 'Bị Thương', frames: 5, fps: 10 },
    { action: 'death', name: 'Tử Trận', frames: 6, fps: 8 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadStandard18Layers = () => {
    setElements([
      { id: '01_hair_back_ponytail', name: 'Tóc Đuôi Ngựa Sau', zIndex: 5, bone: 'head_hair_tail', category: 'hair' },
      { id: '02_shadow_ground', name: 'Bóng Tiếp Đất', zIndex: 0, bone: 'root_shadow', category: 'shadow' },
      { id: '03_legs_thighs_skin', name: 'Đùi & Chân Da', zIndex: 16, bone: 'pelvis_legs', category: 'body' },
      { id: '04_boots_armored', name: 'Bốt Da Nẹp Kim Loại', zIndex: 18, bone: 'feet_boots', category: 'equipment' },
      { id: '05_arm_left_glove', name: 'Tay Trái & Găng', zIndex: 25, bone: 'arm_l', category: 'body' },
      { id: '06_body_torso_skin', name: 'Khung Thân Người', zIndex: 30, bone: 'chest_root', category: 'body' },
      { id: '07_under_tunic_white', name: 'Váy Áo Lót Trắng', zIndex: 35, bone: 'pelvis_tunic', category: 'costume' },
      { id: '08_hip_sash_blue', name: 'Dải Lụa Hông Lam', zIndex: 38, bone: 'hip_sash', category: 'costume' },
      { id: '09_waist_belt', name: 'Thắt Lưng Da Nâu', zIndex: 40, bone: 'waist_belt', category: 'costume' },
      { id: '10_shoulder_guards', name: 'Giáp Vai Đôi', zIndex: 45, bone: 'shoulders', category: 'equipment' },
      { id: '11_chest_cuirass', name: 'Giáp Ngực Vảy Kim Loại', zIndex: 50, bone: 'chest_armor', category: 'equipment' },
      { id: '12_head_base_neck', name: 'Khuôn Mặt & Cổ', zIndex: 55, bone: 'head_base', category: 'head' },
      { id: '13_face_eyes_violet', name: 'Đôi Mắt Tím', zIndex: 60, bone: 'eyes', category: 'head' },
      { id: '14_face_mouth_eyebrows', name: 'Miệng, Má Hồng, Mày', zIndex: 62, bone: 'expression', category: 'head' },
      { id: '15_hair_front_bangs', name: 'Tóc Mái & Lọn Mai', zIndex: 70, bone: 'hair_front', category: 'hair' },
      { id: '16_hair_ribbon', name: 'Nơ Đỏ Ruby Cài Tóc', zIndex: 72, bone: 'ribbon', category: 'hair' },
      { id: '17_arm_right_hand', name: 'Tay Phải & Khớp Cầm', zIndex: 85, bone: 'arm_r', category: 'body' },
      { id: '18_weapon_wood_sword', name: 'Vũ Khí Chính', zIndex: 90, bone: 'weapon_main', category: 'weapon' },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('http://localhost:4000/api/v1/assets/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          name,
          gender,
          classId,
          headRatio,
          anchorAxisX,
          baselineY,
          masterSpritePath,
          description,
          elements,
          animations,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Lỗi đăng ký asset từ server.');
      }

      alert(`Đăng ký thành công Character Asset: ${characterId}!`);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-lg bg-[#141722] border border-[#262f44] space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#222738] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Character Asset Studio — Đăng Ký Asset Nhân Vật Mới</h3>
            <p className="text-xs text-slate-400">
              Quy chuẩn 2.8 Heads, cấu trúc phân tầng 18 Modular Layers & chuỗi Action Sprite Sheets
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1f2638] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: IDENTITY & GEOMETRY */}
        <div className="p-4 rounded-lg bg-[#0e111a] border border-[#202738] space-y-4">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            1. Định Danh & Tọa Độ Gốc Chuẩn (Asset Identity & Pivot Anchors)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Mã Character ID (Unique)</label>
              <input
                type="text"
                value={characterId}
                onChange={(e) => setCharacterId(e.target.value.toUpperCase())}
                className="w-full bg-[#161a26] border border-[#283248] rounded px-3 py-1.5 text-xs text-white font-mono uppercase focus:border-amber-400 outline-none"
                placeholder="ELYSIA_MAGE_F001"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Tên Hiển Thị</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#161a26] border border-[#283248] rounded px-3 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
                placeholder="Pháp Sư Nữ (Female Mage)"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Hệ Phái (Class ID)</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full bg-[#161a26] border border-[#283248] rounded px-3 py-1.5 text-xs text-white focus:border-amber-400 outline-none capitalize"
              >
                {INITIAL_CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Giới Tính</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold border ${
                    gender === 'female'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-[#161a26] text-slate-400 border-[#283248]'
                  }`}
                >
                  ♀ Nữ
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold border ${
                    gender === 'male'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-[#161a26] text-slate-400 border-[#283248]'
                  }`}
                >
                  ♂ Nam
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Tỷ Lệ Đầu (Head Ratio)</label>
              <input
                type="number"
                step="0.1"
                value={headRatio}
                onChange={(e) => setHeadRatio(parseFloat(e.target.value))}
                className="w-full bg-[#161a26] border border-[#283248] rounded px-3 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Trục X Neo Gốc (Axis X)</label>
              <input
                type="number"
                value={anchorAxisX}
                onChange={(e) => setAnchorAxisX(parseInt(e.target.value, 10))}
                className="w-full bg-[#161a26] border border-[#283248] rounded px-3 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Đường Chân Tiếp Đất (Y)</label>
              <input
                type="number"
                value={baselineY}
                onChange={(e) => setBaselineY(parseInt(e.target.value, 10))}
                className="w-full bg-[#161a26] border border-[#283248] rounded px-3 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Đường Dẫn Master Sprite (256x256 RGBA)</label>
            <input
              type="text"
              value={masterSpritePath}
              onChange={(e) => setMasterSpritePath(e.target.value)}
              className="w-full bg-[#161a26] border border-[#283248] rounded px-3 py-1.5 text-xs text-white font-mono focus:border-amber-400 outline-none"
              placeholder="/assets/characters/female/mage/mage_female_master_256.png"
            />
          </div>
        </div>

        {/* SECTION 2: MODULAR LAYER ARCHITECTURE */}
        <div className="p-4 rounded-lg bg-[#0e111a] border border-[#202738] space-y-4">
          <div className="flex items-center justify-between border-b border-[#222738] pb-2">
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                2. Cấu Trúc Bóc Tách Layer Mô-đun (Modular Elements & Z-Order)
              </h4>
              <p className="text-[11px] text-slate-400">
                Định nghĩa các lớp hiển thị phục vụ Paperdoll và gắn xương Spine 2D ({elements.length} layers)
              </p>
            </div>

            <button
              type="button"
              onClick={loadStandard18Layers}
              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
            >
              + Nạp Bộ 18 Layer Tiêu Chuẩn
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {elements.map((el, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2 rounded bg-[#141824] border border-[#232c40] text-xs text-slate-300"
              >
                <span className="w-16 font-mono text-[10px] text-amber-400">Z: {el.zIndex}</span>
                <span className="w-40 font-mono text-white text-[11px] truncate">{el.id}</span>
                <span className="flex-1 font-medium">{el.name}</span>
                <span className="w-32 text-slate-400 font-mono text-[10px]">
                  Bone: <code className="text-blue-400">{el.bone}</code>
                </span>
                <button
                  type="button"
                  onClick={() => setElements(elements.filter((_, i) => i !== idx))}
                  className="p-1 rounded text-slate-500 hover:text-rose-400"
                  title="Xóa layer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: ANIMATION SEQUENCES */}
        <div className="p-4 rounded-lg bg-[#0e111a] border border-[#202738] space-y-4">
          <div className="flex items-center justify-between border-b border-[#222738] pb-2">
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                3. Chuỗi Hoạt Họa Động Tác (Animation Action States)
              </h4>
              <p className="text-[11px] text-slate-400">
                Định nghĩa các trạng thái động tác, số lượng khung hình và FPS ({animations.length} actions)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {animations.map((anim, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-[#141824] border border-[#232c40] text-xs text-slate-300 space-y-1"
              >
                <div className="flex justify-between items-center font-bold text-white">
                  <span>{anim.name}</span>
                  <span className="text-[10px] text-amber-400 font-mono">{anim.action}</span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>{anim.frames} frames</span>
                  <span className="text-emerald-400">{anim.fps} FPS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded text-xs text-slate-300 hover:text-white bg-[#1a1f2e] border border-[#2c364c]"
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Đang Đăng Ký Asset...' : 'Đăng Ký & Xuất Bản Character Asset'}
          </button>
        </div>
      </form>
    </div>
  );
}
