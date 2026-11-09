import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Play,
  Pause,
  Eye,
  EyeOff,
  RotateCcw,
  Film,
  Download,
  Info,
  CheckSquare,
  Square,
  ChevronRight,
} from 'lucide-react';

export const NOVICE_ELEMENTS = [
  { id: '01_hair_back_ponytail', name: 'Tóc Đuôi Ngựa Sau', zIndex: 5, bone: 'head_hair_tail', category: 'hair' },
  { id: '02_shadow_ground', name: 'Bóng Tiếp Đất', zIndex: 0, bone: 'root_shadow', category: 'shadow' },
  { id: '03_legs_thighs_skin', name: 'Đùi & Chân Da', zIndex: 16, bone: 'pelvis_legs', category: 'body' },
  { id: '04_boots_armored', name: 'Bốt Da Nẹp Kim Loại', zIndex: 18, bone: 'feet_boots', category: 'equipment' },
  { id: '05_arm_left_glove', name: 'Tay Trái & Găng Cụt Ngón', zIndex: 25, bone: 'arm_l', category: 'body' },
  { id: '06_body_torso_skin', name: 'Khung Thân Người', zIndex: 30, bone: 'chest_root', category: 'body' },
  { id: '07_under_tunic_white', name: 'Váy Áo Lót Trắng', zIndex: 35, bone: 'pelvis_tunic', category: 'costume' },
  { id: '08_hip_sash_blue', name: 'Dải Lụa Hông Lam', zIndex: 38, bone: 'hip_sash', category: 'costume' },
  { id: '09_waist_belt', name: 'Thắt Lưng Da Nâu & Khóa', zIndex: 40, bone: 'waist_belt', category: 'costume' },
  { id: '10_shoulder_guards', name: 'Giáp Vai Đôi', zIndex: 45, bone: 'shoulders', category: 'equipment' },
  { id: '11_chest_cuirass', name: 'Giáp Ngực Vảy Kim Loại', zIndex: 50, bone: 'chest_armor', category: 'equipment' },
  { id: '12_head_base_neck', name: 'Khuôn Mặt & Cổ', zIndex: 55, bone: 'head_base', category: 'head' },
  { id: '13_face_eyes_violet', name: 'Đôi Mắt Tím Thạch Anh', zIndex: 60, bone: 'eyes', category: 'head' },
  { id: '14_face_mouth_eyebrows', name: 'Miệng, Má Hồng, Mày', zIndex: 62, bone: 'expression', category: 'head' },
  { id: '15_hair_front_bangs', name: 'Tóc Mái & Lọn Mai', zIndex: 70, bone: 'hair_front', category: 'hair' },
  { id: '16_hair_ribbon', name: 'Nơ Đỏ Ruby Cài Tóc', zIndex: 72, bone: 'ribbon', category: 'hair' },
  { id: '17_arm_right_hand', name: 'Tay Phải & Khớp Cầm', zIndex: 85, bone: 'arm_r', category: 'body' },
  { id: '18_weapon_wood_sword', name: 'Kiếm Gỗ Tân Thủ', zIndex: 90, bone: 'weapon_main', category: 'weapon' },
];

export const NOVICE_ANIMATIONS = [
  { id: 'idle', name: 'Đứng Chờ (Idle)', frames: 6, fps: 8, description: 'Tư thế đứng chuẩn bị chiến đấu, nhấp nhô nhịp thở' },
  { id: 'walk', name: 'Đi Bộ (Walk)', frames: 6, fps: 10, description: 'Bước đi tiến công nhịp nhàng, hạ trọng tâm' },
  { id: 'run', name: 'Chạy (Run)', frames: 6, fps: 12, description: 'Chạy nước rút, tóc và dải lụa tung bay ngang' },
  { id: 'attack', name: 'Tấn Công (Attack)', frames: 5, fps: 12, description: 'Vung kiếm gỗ tạo vệt chém hình trăng khuyết' },
  { id: 'skill', name: 'Kỹ Năng (Skill)', frames: 5, fps: 12, description: 'Phóng kiếm khí lam quang xung kích tầm xa' },
  { id: 'hurt', name: 'Bị Thương (Hurt)', frames: 5, fps: 10, description: 'Trúng đòn, lùi bước nhắm mắt chống chịu' },
  { id: 'death', name: 'Chết (Death)', frames: 6, fps: 8, description: 'Khuỵu gối, ngã buông vũ khí xuống mặt đất' },
];

export function NoviceCharacterStudio() {
  const [activeSubTab, setActiveSubTab] = useState<'layers' | 'animations' | 'atlas'>('layers');

  // Layer Visibility State (all true by default)
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NOVICE_ELEMENTS.forEach((el) => {
      init[el.id] = true;
    });
    return init;
  });

  // Animation Player State
  const [currentAnimId, setCurrentAnimId] = useState('idle');
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);

  const activeAnim = NOVICE_ANIMATIONS.find((a) => a.id === currentAnimId) || NOVICE_ANIMATIONS[0];

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = 1000 / activeAnim.fps;
    const timer = setInterval(() => {
      setCurrentFrame((prev) => (prev >= activeAnim.frames ? 1 : prev + 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, activeAnim]);

  const toggleLayer = (id: string) => {
    setVisibleLayers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setAllLayers = (val: boolean) => {
    const next: Record<string, boolean> = {};
    NOVICE_ELEMENTS.forEach((el) => {
      next[el.id] = val;
    });
    setVisibleLayers(next);
  };

  return (
    <div className="space-y-6">
      {/* CHARACTER HEADER CARD */}
      <div className="p-6 rounded-lg bg-[#141722] border border-amber-500/40 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
        <div className="w-52 h-56 rounded-lg bg-[#0e1017] border border-[#2a3044] flex items-center justify-center p-2 relative overflow-hidden group">
          <img
            src="/assets/characters/female/novice/master/novice_female_master_256.png"
            alt="ELYSIA_NOVICE_FEMALE_001"
            className="max-h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.target as any).src = '/assets/characters/female/novice/master/novice_female_showcase.png';
            }}
          />
          <span className="absolute bottom-2 right-2 text-[10px] bg-black/80 px-1.5 py-0.5 rounded text-amber-400 font-mono">
            256x256 Master
          </span>
          <span className="absolute top-2 left-2 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
            Chibi 2.8 Heads
          </span>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              ELYSIA_NOVICE_FEMALE_001
            </span>
            <h3 className="font-bold text-lg text-white font-serif">Nữ Tân Thủ (Master Novice Swordswoman)</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Mẫu nhân vật nữ khởi đầu chuẩn anime JRPG chibi 2.8 heads. Tóc buộc đuôi ngựa cao lệch phải cài nơ đỏ ruby, mắt tím thạch anh,
            áo giáp ngực vảy kim loại nhẹ, váy lót trắng viền lam, thắt lưng da nâu đôi, dải lụa xanh phất phơ bên hông và kiếm gỗ tập luyện.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs pt-1">
            <div className="p-2.5 rounded bg-[#0f1118] border border-[#222738]">
              <span className="text-slate-400 block text-[10px]">Tách Layer (Elements)</span>
              <span className="font-semibold text-amber-300">18 Element Layers</span>
            </div>
            <div className="p-2.5 rounded bg-[#0f1118] border border-[#222738]">
              <span className="text-slate-400 block text-[10px]">Chuỗi Hoạt Họa</span>
              <span className="font-semibold text-blue-400">7 Actions (39 Frames)</span>
            </div>
            <div className="p-2.5 rounded bg-[#0f1118] border border-[#222738]">
              <span className="text-slate-400 block text-[10px]">Vũ Khí Khởi Điểm</span>
              <span className="font-semibold text-white">Kiếm Gỗ Tân Thủ</span>
            </div>
            <div className="p-2.5 rounded bg-[#0f1118] border border-[#222738]">
              <span className="text-slate-400 block text-[10px]">Chuẩn Xuất Bản</span>
              <span className="font-semibold text-emerald-400">Spine 2D / Phaser 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex border-b border-[#222738] gap-4">
        <button
          onClick={() => setActiveSubTab('layers')}
          className={`flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide transition-all border-b-2 ${
            activeSubTab === 'layers'
              ? 'text-amber-400 border-amber-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" /> 1. Bóc Tách Layer & Element (18 Layers)
        </button>

        <button
          onClick={() => setActiveSubTab('animations')}
          className={`flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide transition-all border-b-2 ${
            activeSubTab === 'animations'
              ? 'text-amber-400 border-amber-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Film className="w-4 h-4" /> 2. Bộ Hoạt Họa 7 Động Tác (Animation Player)
        </button>

        <button
          onClick={() => setActiveSubTab('atlas')}
          className={`flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide transition-all border-b-2 ${
            activeSubTab === 'atlas'
              ? 'text-amber-400 border-amber-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Info className="w-4 h-4" /> 3. Đặc Tả Xương Spine & Atlas JSON
        </button>
      </div>

      {/* SUB-TAB 1: MODULAR LAYER BREAKDOWN */}
      {activeSubTab === 'layers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: LIVE STACKED LAYER VIEWPORT */}
          <div className="lg:col-span-5 p-5 rounded-lg bg-[#141722] border border-[#222738] flex flex-col items-center justify-between space-y-4">
            <div className="w-full flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" /> Live Modular Layer Stacking
              </span>
              <span className="text-[11px] text-slate-400">
                {Object.values(visibleLayers).filter(Boolean).length} / {NOVICE_ELEMENTS.length} layers bật
              </span>
            </div>

            {/* STACKED CANVAS CONTAINER */}
            <div className="w-72 h-96 rounded-lg bg-[#0c0e16] border border-[#262f44] relative overflow-hidden flex items-center justify-center p-2 shadow-inner">
              <div className="absolute inset-0 bg-radial-at-c from-amber-500/10 via-transparent to-transparent pointer-events-none" />

              {/* RENDER ALIGNED LAYERS BASED ON VISIBILITY & Z-INDEX */}
              {NOVICE_ELEMENTS.sort((a, b) => a.zIndex - b.zIndex).map((el) => {
                const isVisible = visibleLayers[el.id];
                return (
                  <img
                    key={el.id}
                    src={`/assets/characters/female/novice/elements_aligned/${el.id}.png`}
                    alt={el.name}
                    className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-150 ${
                      isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ zIndex: el.zIndex }}
                  />
                );
              })}
            </div>

            {/* QUICK CONTROL BUTTONS */}
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setAllLayers(true)}
                className="flex-1 text-xs py-1.5 px-3 rounded bg-[#1e2538] hover:bg-[#28324a] text-slate-200 border border-[#2f3a52] transition-colors"
              >
                Bật Tất Cả
              </button>
              <button
                onClick={() => setAllLayers(false)}
                className="flex-1 text-xs py-1.5 px-3 rounded bg-[#1e2538] hover:bg-[#28324a] text-slate-200 border border-[#2f3a52] transition-colors"
              >
                Tắt Tất Cả
              </button>
              <button
                onClick={() => {
                  const baseOnly: Record<string, boolean> = {};
                  NOVICE_ELEMENTS.forEach((el) => {
                    baseOnly[el.id] = ['06_body_torso_skin', '12_head_base_neck', '13_face_eyes_violet', '14_face_mouth_eyebrows', '03_legs_thighs_skin'].includes(el.id);
                  });
                  setVisibleLayers(baseOnly);
                }}
                className="flex-1 text-xs py-1.5 px-3 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors"
              >
                Chỉ Thân & Mặt
              </button>
            </div>
          </div>

          {/* RIGHT: ELEMENT TOGGLE LIST & METADATA */}
          <div className="lg:col-span-7 p-5 rounded-lg bg-[#141722] border border-[#222738] space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-[#222738] pb-2">
              <h4 className="font-semibold text-sm text-white">Danh Sách 18 Element Bóc Tách (Z-Order Hierarchy)</h4>
              <span className="text-[11px] text-slate-400">Nhấp để ẩn / hiện từng bộ phận</span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[460px] space-y-1.5 pr-1">
              {NOVICE_ELEMENTS.slice().reverse().map((el) => {
                const isChecked = visibleLayers[el.id];
                return (
                  <div
                    key={el.id}
                    onClick={() => toggleLayer(el.id)}
                    className={`flex items-center justify-between p-2.5 rounded cursor-pointer border transition-all ${
                      isChecked
                        ? 'bg-[#0f121b] border-[#293248] text-slate-200 hover:border-amber-500/40'
                        : 'bg-[#0a0c12]/60 border-[#1a1f2c] text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#161a26] border border-[#2a3246] flex items-center justify-center p-0.5 overflow-hidden">
                        <img
                          src={`/assets/characters/female/novice/elements/${el.id}.png`}
                          alt={el.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as any).style.display = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          {el.name}
                          <span className="text-[10px] text-slate-500 font-mono">[{el.id}]</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>Khớp xương: <code className="text-blue-400">{el.bone}</code></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#1c2233] text-amber-300 border border-[#2b344c]">
                        Z: {el.zIndex}
                      </span>
                      {isChecked ? (
                        <Eye className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ANIMATION PLAYER */}
      {activeSubTab === 'animations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ANIMATION VIEWPORT */}
            <div className="lg:col-span-5 p-6 rounded-lg bg-[#141722] border border-[#222738] flex flex-col items-center justify-between space-y-4">
              <div className="w-full flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-blue-400" /> Real-time Sprite Player
                </span>
                <span className="text-[11px] text-amber-400 font-mono">
                  {activeAnim.fps} FPS | Khung hình {currentFrame} / {activeAnim.frames}
                </span>
              </div>

              {/* SPRITE STAGE */}
              <div className="w-64 h-64 rounded-lg bg-[#0a0d16] border border-[#252f44] relative flex items-center justify-center p-3 shadow-inner">
                {/* Ground guide line */}
                <div className="absolute bottom-10 left-6 right-6 h-[1px] bg-slate-800/80 dashed" />
                <img
                  src={`/assets/characters/female/novice/frames/${activeAnim.id}_${String(currentFrame).padStart(2, '0')}.png`}
                  alt={`${activeAnim.name} frame ${currentFrame}`}
                  className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* CONTROLS */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex-1 py-2 px-4 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isPlaying
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Tạm Dừng (Pause)' : 'Phát (Play)'}
                </button>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrame((prev) => (prev >= activeAnim.frames ? 1 : prev + 1));
                  }}
                  className="py-2 px-3 rounded bg-[#1e2436] text-slate-300 hover:text-white border border-[#2c354e] text-xs"
                  title="Bước khung hình kế tiếp"
                >
                  Từng Khung ⏭
                </button>
              </div>
            </div>

            {/* ACTION SELECTOR LIST */}
            <div className="lg:col-span-7 p-6 rounded-lg bg-[#141722] border border-[#222738] space-y-4">
              <h4 className="font-semibold text-sm text-white">7 Chuỗi Động Tác Chiến Đấu (Animation States)</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {NOVICE_ANIMATIONS.map((anim) => {
                  const isSelected = anim.id === currentAnimId;
                  return (
                    <button
                      key={anim.id}
                      onClick={() => {
                        setCurrentAnimId(anim.id);
                        setCurrentFrame(1);
                      }}
                      className={`text-left p-3.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                          : 'bg-[#0f121b] border-[#22293a] text-slate-300 hover:bg-[#171d2b]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs">{anim.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1a2131] text-slate-400">
                          {anim.frames} frames
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">{anim.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ACTIVE STRIP PREVIEW */}
          <div className="p-5 rounded-lg bg-[#141722] border border-[#222738] space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-xs text-white">
                Sprite Sheet Strip: <span className="text-amber-400">{activeAnim.name}</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeAnim.frames * 128} x 128 px
              </span>
            </div>

            <div className="overflow-x-auto p-3 bg-[#0a0d16] rounded border border-[#202738] flex items-center justify-center">
              <img
                src={`/assets/characters/female/novice/animations/anim_${activeAnim.id}_strip.png`}
                alt={`Strip ${activeAnim.id}`}
                className="max-h-24 object-contain filter drop-shadow"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ATLAS & SPINE SPECIFICATION */}
      {activeSubTab === 'atlas' && (
        <div className="space-y-4">
          <div className="p-6 rounded-lg bg-[#141722] border border-[#222738] space-y-4">
            <div className="flex justify-between items-center border-b border-[#222738] pb-3">
              <h4 className="font-semibold text-sm text-white">Spine 2D / DragonBones Skeletal Rigging Tree</h4>
              <span className="text-xs text-emerald-400">18 Attachment Slots Mapped</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Mỗi bộ phận được gán vào một khớp xương (Bone Joint) trong cây khung xương phân cấp của Spine 2D.
              Cấu trúc này cho phép hoán đổi trang bị (Paperdoll skinning), tạo hoạt họa biến dạng lưới (Mesh Deform)
              và tích hợp trực tiếp vào Phaser 3 via <code className="text-amber-300">@esotericsoftware/spine-phaser</code>.
            </p>

            <div className="bg-[#0b0e16] p-4 rounded border border-[#1f2638] font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
              <div>root_ground (X: 128, Y: 238)</div>
              <div>├── bone_pelvis_legs (Z: 16) ➔ [03_legs_thighs_skin]</div>
              <div>│   ├── bone_feet_boots (Z: 18) ➔ [04_boots_armored]</div>
              <div>│   └── bone_hip_sash (Z: 38) ➔ [08_hip_sash_blue]</div>
              <div>├── bone_chest_root (Z: 30) ➔ [06_body_torso_skin]</div>
              <div>│   ├── bone_pelvis_tunic (Z: 35) ➔ [07_under_tunic_white]</div>
              <div>│   ├── bone_waist_belt (Z: 40) ➔ [09_waist_belt]</div>
              <div>│   ├── bone_chest_armor (Z: 50) ➔ [11_chest_cuirass]</div>
              <div>│   ├── bone_shoulders (Z: 45) ➔ [10_shoulder_guards]</div>
              <div>│   ├── bone_arm_l (Z: 25) ➔ [05_arm_left_glove]</div>
              <div>│   ├── bone_arm_r (Z: 85) ➔ [17_arm_right_hand]</div>
              <div>│   │   └── bone_weapon_main (Z: 90) ➔ [18_weapon_wood_sword]</div>
              <div>│   └── bone_head_base (Z: 55) ➔ [12_head_base_neck]</div>
              <div>│       ├── bone_head_hair_tail (Z: 5) ➔ [01_hair_back_ponytail]</div>
              <div>│       ├── bone_ribbon (Z: 72) ➔ [16_hair_ribbon]</div>
              <div>│       ├── bone_eyes (Z: 60) ➔ [13_face_eyes_violet]</div>
              <div>│       ├── bone_mouth_brows (Z: 62) ➔ [14_face_mouth_eyebrows]</div>
              <div>│       └── bone_hair_front (Z: 70) ➔ [15_hair_front_bangs]</div>
              <div>└── bone_root_shadow (Z: 0) ➔ [02_shadow_ground]</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
