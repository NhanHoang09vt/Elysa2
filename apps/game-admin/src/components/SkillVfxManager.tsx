import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Flame,
  Zap,
  Shield,
  Sword,
  Search,
  Filter,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  ExternalLink,
  CheckCircle2,
  Layers,
  Eye,
  Sliders,
  ChevronRight,
  Info,
  Tag,
  Grid,
  FileCode,
  Settings,
  Crosshair,
  Palette,
  Download,
  Upload,
} from 'lucide-react';
import { SkillDefinition, ClassId, ElementType } from '@elysia/game-types';
import { INITIAL_SKILLS, INITIAL_CLASSES } from '@elysia/game-data-schema';
import {
  VFXRegistry,
  VFXSkillConfig,
  VFXPaletteConfig,
  DEFAULT_SKILL_VFX_CONFIGS,
} from '@elysia/vfx-engine';
import { VfxCombatSandbox } from './VfxCombatSandbox';
import { VfxPaletteEditor } from './VfxPaletteEditor';
import { VfxSkillMappingModal } from './VfxSkillMappingModal';
import { VfxJsonModal } from './VfxJsonModal';

export interface VfxManifestItem {
  key: string;
  id: string;
  category: string;
  name: string;
  desc: string;
  frames: number;
  fps: number;
  frameWidth: number;
  frameHeight: number;
  pivot: [number, number];
  pivotNorm: [number, number];
  scale: number | string;
  heroFrame?: number;
  image: string;
  thumbnail: string;
  json: string;
}

export const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  moves: { label: 'Đòn Thế Combo (Moves)', icon: '🥋', color: 'text-amber-400' },
  melee: { label: 'Cận Chiến & Vũ Khí (Melee)', icon: '⚔️', color: 'text-orange-400' },
  fire: { label: 'Ma Pháp Hỏa Hệ (Fire)', icon: '🔥', color: 'text-rose-400' },
  ice: { label: 'Ma Pháp Băng Hệ (Ice)', icon: '❄️', color: 'text-sky-400' },
  lightning: { label: 'Ma Pháp Lôi Hệ (Lightning)', icon: '⚡', color: 'text-teal-400' },
  holy: { label: 'Thánh Quang & Trị Liệu (Holy)', icon: '✨', color: 'text-yellow-300' },
  arcane: { label: 'Bí Thuật Ma Pháp (Arcane)', icon: '🔮', color: 'text-purple-400' },
  shadow: { label: 'Ám Ma & Hắc Ám (Shadow)', icon: '🌑', color: 'text-indigo-400' },
  nature: { label: 'Thiên Nhiên & Địa Chấn (Nature)', icon: '🌿', color: 'text-emerald-400' },
  impacts: { label: 'Va Đập & Đòn Trúng (Impacts)', icon: '💥', color: 'text-amber-500' },
  explosions: { label: 'Bộc Phá & Nổ Lớn (Explosions)', icon: '💣', color: 'text-red-500' },
  projectiles: { label: 'Đạn Đạo & Bắn Xa (Projectiles)', icon: '🏹', color: 'text-cyan-400' },
  status: { label: 'Trạng Thái & Hào Quang (Status)', icon: '🌀', color: 'text-pink-400' },
  scifi: { label: 'Khiên Năng Lượng (Energy Shield)', icon: '🛡️', color: 'text-blue-400' },
  water: { label: 'Thủy Nguyên Tố (Water)', icon: '💧', color: 'text-blue-300' },
  weather: { label: 'Môi Trường & Khí Hậu (Weather)', icon: '☁️', color: 'text-slate-300' },
  spawn: { label: 'Triệu Hồi & Biến Mất (Spawn)', icon: '💫', color: 'text-violet-400' },
  critters: { label: 'Linh Thú & Sinh Vật (Critters)', icon: '🦇', color: 'text-emerald-300' },
  pickups: { label: 'Châu Báu & Chiến Lợi Phẩm (Pickups)', icon: '💎', color: 'text-amber-300' },
  ui: { label: 'Giao Diện Chiến Đấu (Combat UI)', icon: '🎯', color: 'text-slate-400' },
  transitions: { label: 'Chuyển Cảnh Phụ Bản (Transitions)', icon: '🎬', color: 'text-slate-400' },
};

export const getVfxUrl = (path?: string) => {
  if (!path) return '';
  return path.startsWith('/') ? path : `/assets/vfx/${path}`;
};

export function SkillVfxManager() {
  const [manifestItems, setManifestItems] = useState<VfxManifestItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingItem, setInspectingItem] = useState<VfxManifestItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all_vfx' | 'class_skills'>('all_vfx');
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

  // Load manifest index
  useEffect(() => {
    fetch('/assets/vfx/index.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load index');
        return res.json();
      })
      .then((data: VfxManifestItem[]) => {
        if (Array.isArray(data)) {
          setManifestItems(data);
          VFXRegistry.getInstance().loadManifest(data);
        }
      })
      .catch((err) => {
        console.warn('Could not load /assets/vfx/index.json, fallback to INITIAL_SKILLS', err);
      });
  }, []);

  // Map INITIAL_SKILLS by key for quick lookup of rich combat metadata
  const initialSkillsMap = new Map<string, SkillDefinition>(INITIAL_SKILLS.map((s) => [s.vfx.key, s]));

  // Combine manifest items or initial skills
  const displayList: VfxManifestItem[] =
    manifestItems.length > 0
      ? manifestItems
      : INITIAL_SKILLS.map((s) => ({
          key: s.vfx.key,
          id: s.id,
          category: s.classId,
          name: s.name,
          desc: s.description,
          frames: s.vfx.totalFrames,
          fps: s.vfx.fps,
          frameWidth: s.vfx.frameWidth,
          frameHeight: s.vfx.frameHeight,
          pivot: s.vfx.pivot,
          pivotNorm: s.vfx.pivotNorm,
          scale: s.vfx.scale,
          image: `${s.vfx.key}.png`,
          thumbnail: s.vfx.thumbnail,
          json: `${s.vfx.key}.json`,
        }));

  // Filtering
  const filteredList = displayList.filter((item) => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;

    // Check class filter
    let matchClass = true;
    if (selectedClass !== 'all') {
      const boundSkill = initialSkillsMap.get(item.key);
      if (boundSkill) {
        matchClass = boundSkill.classId === selectedClass;
      } else {
        // Approximate category matching for class
        if (selectedClass === 'swordsman') matchClass = ['moves', 'melee'].includes(item.category);
        else if (selectedClass === 'mage') matchClass = ['fire', 'ice', 'lightning', 'arcane'].includes(item.category);
        else if (selectedClass === 'priest') matchClass = ['holy'].includes(item.category);
        else if (selectedClass === 'fighter') matchClass = ['moves', 'nature', 'impacts'].includes(item.category);
        else if (selectedClass === 'assassin') matchClass = ['melee', 'shadow'].includes(item.category);
        else if (selectedClass === 'knight') matchClass = ['holy', 'scifi', 'impacts'].includes(item.category);
        else matchClass = false;
      }
    }

    const q = searchQuery.toLowerCase().trim();
    const boundSkill = initialSkillsMap.get(item.key);
    const matchSearch =
      q === '' ||
      item.name.toLowerCase().includes(q) ||
      item.key.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (boundSkill && boundSkill.nameVi.toLowerCase().includes(q));

    return matchCategory && matchClass && matchSearch;
  });

  // Calculate statistics
  const totalCount = displayList.length;
  const categoriesList = Array.from(new Set(displayList.map((d) => d.category))).sort();

  return (
    <div className="space-y-6">
      {/* HEADER & METRICS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#202533] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Skill & Full HD 256px VFX Master Studio</h2>
              <p className="text-xs text-slate-400">
                Kho Tàng 244 Hiệu Ứng Pixel Art & Kỹ Năng Chiến Đấu Chuẩn Hóa 256x256 px
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <FileCode className="w-4 h-4" /> Quản Lý JSON Config
          </button>
          <div className="px-3 py-1.5 rounded-lg bg-[#141722] border border-[#222738] text-xs">
            <span className="text-slate-400">Tổng kho VFX: </span>
            <strong className="text-amber-400 font-mono text-sm">{totalCount} Hiệu ứng</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Full HD 256px Ready
          </div>
        </div>
      </div>

      {/* CATEGORY QUICK TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin text-xs">
        <button
          onClick={() => {
            setSelectedCategory('all');
            setSelectedClass('all');
          }}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
            selectedCategory === 'all' && selectedClass === 'all'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20'
              : 'bg-[#141722] text-slate-400 hover:text-white border border-[#222738]'
          }`}
        >
          🌟 Tất Cả ({totalCount})
        </button>

        {categoriesList.map((cat) => {
          const catInfo = CATEGORY_LABELS[cat] || { label: cat, icon: '✨', color: 'text-slate-300' };
          const count = displayList.filter((d) => d.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedClass('all');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-[#141722] text-slate-400 hover:text-white border border-[#222738]'
              }`}
            >
              <span>{catInfo.icon}</span>
              <span>{cat.toUpperCase()}</span>
              <span className="text-[10px] opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="p-4 rounded-lg bg-[#141722] border border-[#222738] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo tên kỹ năng, tên tiếng Anh, key VFX (vd: slash, fire, heal, sword)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0d1017] border border-[#222738] rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        {/* Filter by Category Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Nhóm VFX:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0d1017] border border-[#222738] rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500/60"
          >
            <option value="all">Tất Cả Nhóm ({totalCount})</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]?.label || cat}
              </option>
            ))}
          </select>
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Hệ Phái:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-[#0d1017] border border-[#222738] rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500/60"
          >
            <option value="all">Tất Cả Hệ Phái</option>
            {INITIAL_CLASSES.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SKILL & VFX CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredList.map((item) => {
          const boundSkill = initialSkillsMap.get(item.key);
          const catInfo = CATEGORY_LABELS[item.category] || { label: item.category, icon: '✨', color: 'text-amber-400' };

          return (
            <div
              key={item.key}
              onClick={() => setInspectingItem(item)}
              className="p-3.5 rounded-lg bg-[#141722] border border-[#222738] hover:border-amber-500/40 hover:bg-[#161a27] transition-all cursor-pointer flex flex-col justify-between group shadow-lg shadow-black/40"
            >
              <div>
                {/* Header: Category Badge & Hotkey */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1e2332] border border-[#2a3044] flex items-center gap-1 ${catInfo.color}`}>
                    <span>{catInfo.icon}</span>
                    <span className="uppercase">{item.category}</span>
                  </span>
                  {boundSkill?.hotkey && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      [{boundSkill.hotkey}]
                    </span>
                  )}
                </div>

                {/* Main Content: Thumbnail & Name */}
                <div className="flex gap-3 items-center">
                  {/* Action Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-[#080b12] border border-[#232a3d] p-1 flex items-center justify-center relative overflow-hidden group-hover:border-amber-500/50 transition-colors shrink-0">
                    <img
                      src={getVfxUrl(item.thumbnail)}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                      onError={(e) => {
                        (e.target as any).src = getVfxUrl(item.image);
                      }}
                    />
                    <span className="absolute bottom-0.5 right-1 text-[8px] font-mono bg-black/80 px-1 rounded text-slate-400">
                      256
                    </span>
                  </div>

                  {/* Title & Key */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors truncate">
                      {boundSkill ? boundSkill.nameVi : item.name}
                    </h4>
                    <div className="text-[11px] text-slate-400 truncate">{boundSkill ? item.name : item.key}</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-1">
                      {item.frames} frames @ {item.fps}fps
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Meta */}
              <div className="mt-3 pt-2.5 border-t border-[#1d2230] flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-[10px] text-slate-500 font-mono">
                  Scale: {typeof item.scale === 'number' ? item.scale.toFixed(1) : item.scale}x
                </span>
                <span className="flex items-center text-amber-400 group-hover:translate-x-0.5 transition-transform text-[11px] font-medium">
                  Xem Live <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="p-12 text-center rounded-lg bg-[#141722] border border-[#222738] text-slate-400 space-y-2">
          <Search className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-sm">Không tìm thấy hiệu ứng hoặc kỹ năng nào phù hợp.</p>
        </div>
      )}

      {/* INSPECTOR & LIVE ANIMATION PLAYER MODAL */}
      {inspectingItem && (
        <SkillInspectorModal
          item={inspectingItem}
          boundSkill={initialSkillsMap.get(inspectingItem.key)}
          onClose={() => setInspectingItem(null)}
        />
      )}

      {/* JSON IMPORT / EXPORT MODAL */}
      {isJsonModalOpen && (
        <VfxJsonModal
          onClose={() => setIsJsonModalOpen(false)}
          onImportSuccess={() => {
            setManifestItems([...manifestItems]);
          }}
        />
      )}
    </div>
  );
}

/**
 * Interactive Modal for inspecting skill, live animation player, and sprite sheet
 */
function SkillInspectorModal({
  item,
  boundSkill,
  onClose,
}: {
  item: VfxManifestItem;
  boundSkill?: SkillDefinition;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [fps, setFps] = useState(item.fps || 30);
  const [showActorShadow, setShowActorShadow] = useState(true);
  const [activeView, setActiveView] = useState<'player' | 'sandbox' | 'palette' | 'sheet'>('player');
  const [palette, setPalette] = useState<VFXPaletteConfig>({ tint: '#ffffff', hueShift: 0, saturation: 1.0, brightness: 1.0 });
  const [scale, setScale] = useState<number>(typeof item.scale === 'number' ? item.scale : 1.0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isMappingOpen, setIsMappingOpen] = useState(false);
  const [customSkillConfig, setCustomSkillConfig] = useState<VFXSkillConfig | undefined>(() =>
    VFXRegistry.getInstance().getSkillConfig(item.key) || VFXRegistry.getInstance().getSkillConfig(item.id)
  );

  const spriteImgRef = useRef<HTMLImageElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Load sprite sheet image
  useEffect(() => {
    const img = new Image();
    img.src = getVfxUrl(item.image);
    img.onload = () => {
      spriteImgRef.current = img;
    };
  }, [item]);

  // Animation render loop
  useEffect(() => {
    let lastTime = performance.now();
    const frameInterval = 1000 / (fps * speed);

    const tick = (time: number) => {
      if (isPlaying && time - lastTime >= frameInterval) {
        lastTime = time;
        setCurrentFrame((prev) => (prev + 1) % item.frames);
      }
      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, fps, item.frames]);

  // Draw current frame on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spriteImgRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 256;
    const h = 256;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background grid
    ctx.fillStyle = '#080a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Ground Shadow & Character Ground Axis
    if (showActorShadow) {
      const px = canvas.width / 2;
      const py = 224 * (canvas.height / 256);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(px, py, 42, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pivot crosshair
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.beginPath();
      ctx.moveTo(px - 10, py);
      ctx.lineTo(px + 10, py);
      ctx.moveTo(px, py - 10);
      ctx.lineTo(px, py + 10);
      ctx.stroke();
    }

    // Source rect in sprite sheet grid
    const total = item.frames;
    const cols = Math.min(total, Math.max(1, Math.ceil(Math.sqrt(total))));
    const col = currentFrame % cols;
    const row = Math.floor(currentFrame / cols);
    const sx = col * w;
    const sy = row * h;

    ctx.imageSmoothingEnabled = false; // Nearest-neighbor crisp pixel art
    ctx.drawImage(spriteImgRef.current, sx, sy, w, h, 0, 0, canvas.width, canvas.height);
  }, [currentFrame, showActorShadow, item]);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#10141f] border border-[#2d3852] rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-4 px-6 bg-[#151a28] border-b border-[#232a3d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0d1017] border border-[#2a3044] p-1 flex items-center justify-center overflow-hidden">
              <img src={getVfxUrl(item.thumbnail)} alt={item.name} className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{boundSkill ? boundSkill.nameVi : item.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {item.category.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Key: {item.key} • Standard: 256x256 Full HD
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMappingOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" /> Thiết Lập Kỹ Năng
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-[#1a1e2b] hover:bg-[#23293a] text-xs font-semibold"
            >
              Đóng [ESC]
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT: LIVE ANIMATION PLAYER & STUDIOS */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-amber-400" /> Trình Chiếu Hiệu Ứng Trực Tiếp
              </span>

              {/* View Switcher */}
              <div className="flex p-0.5 rounded bg-[#151a28] border border-[#232a3d] text-[11px] overflow-x-auto">
                <button
                  onClick={() => setActiveView('player')}
                  className={`px-2.5 py-1 rounded shrink-0 ${activeView === 'player' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400'}`}
                >
                  Live Player
                </button>
                <button
                  onClick={() => setActiveView('sandbox')}
                  className={`px-2.5 py-1 rounded shrink-0 flex items-center gap-1 ${activeView === 'sandbox' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400'}`}
                >
                  <Crosshair className="w-3 h-3" /> Thử Lửa Quái
                </button>
                <button
                  onClick={() => setActiveView('palette')}
                  className={`px-2.5 py-1 rounded shrink-0 flex items-center gap-1 ${activeView === 'palette' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400'}`}
                >
                  <Palette className="w-3 h-3" /> Bảng Màu & Speed
                </button>
                <button
                  onClick={() => setActiveView('sheet')}
                  className={`px-2.5 py-1 rounded shrink-0 ${activeView === 'sheet' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400'}`}
                >
                  Sprite Sheet
                </button>
              </div>
            </div>

            {activeView === 'player' && (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-[#2a3044] bg-[#080a0f] flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    width={256}
                    height={256}
                    className="w-full max-w-[280px] h-[280px] object-contain image-rendering-pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <div className="absolute top-2 left-2 text-[10px] bg-black/80 font-mono px-2 py-0.5 rounded text-amber-400 border border-amber-500/20">
                    Frame {currentFrame + 1} / {item.frames}
                  </div>
                  <div className="absolute bottom-2 right-2 text-[10px] bg-black/80 font-mono px-2 py-0.5 rounded text-slate-400">
                    Pivot: ({item.pivot[0]}, {item.pivot[1]})
                  </div>
                </div>

                {/* Player Controls */}
                <div className="p-3 rounded-lg bg-[#141722] border border-[#222738] space-y-2.5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-3 py-1.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-500/20"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      {isPlaying ? 'Tạm Dừng' : 'Phát Tiếp'}
                    </button>
                    <button
                      onClick={() => setCurrentFrame(0)}
                      className="px-2.5 py-1.5 rounded bg-[#1e2332] text-slate-300 hover:text-white text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Đầu
                    </button>
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer ml-auto">
                      <input
                        type="checkbox"
                        checked={showActorShadow}
                        onChange={(e) => setShowActorShadow(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      Điểm Tựa Chân (Pivot)
                    </label>
                  </div>

                  {/* Scrubber slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Tiến độ Animation</span>
                      <span className="font-mono text-amber-400">{Math.round(((currentFrame + 1) / item.frames) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={item.frames - 1}
                      value={currentFrame}
                      onChange={(e) => {
                        setIsPlaying(false);
                        setCurrentFrame(parseInt(e.target.value, 10));
                      }}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeView === 'sandbox' && (
              <VfxCombatSandbox
                effectKey={item.key}
                skillConfig={customSkillConfig}
                palette={palette}
                scale={scale}
                speed={speed}
              />
            )}

            {activeView === 'palette' && (
              <VfxPaletteEditor
                palette={palette}
                scale={scale}
                speed={speed}
                onChangePalette={setPalette}
                onChangeScale={setScale}
                onChangeSpeed={setSpeed}
                onReset={() => {
                  setPalette({ tint: '#ffffff', hueShift: 0, saturation: 1.0, brightness: 1.0 });
                  setScale(1.0);
                  setSpeed(1.0);
                }}
              />
            )}

            {activeView === 'sheet' && (
              <div className="rounded-lg overflow-auto border border-[#2a3044] bg-[#080a0f] p-3 max-h-[360px]">
                <img
                  src={getVfxUrl(item.image)}
                  alt="Full Sprite Sheet"
                  className="max-w-none image-rendering-pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            )}
          </div>

          {/* RIGHT: SPECIFICATIONS & REGISTRY METRICS */}
          <div className="md:col-span-6 space-y-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" /> Thông Số Kỹ Thuật VFX 256px
            </span>

            <div className="p-4 rounded-lg bg-[#141722] border border-[#222738] space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded bg-[#0d1017] border border-[#202533]">
                  <span className="text-slate-400 block text-[10px]">Nhóm Hiệu Ứng</span>
                  <strong className="text-amber-300 uppercase">{item.category}</strong>
                </div>
                <div className="p-2.5 rounded bg-[#0d1017] border border-[#202533]">
                  <span className="text-slate-400 block text-[10px]">Tỉ Lệ Phóng Đại</span>
                  <strong className="text-white font-mono">{typeof item.scale === 'number' ? item.scale.toFixed(1) : item.scale}x</strong>
                </div>
                <div className="p-2.5 rounded bg-[#0d1017] border border-[#202533]">
                  <span className="text-slate-400 block text-[10px]">Độ Phân Giải Frame</span>
                  <strong className="text-emerald-400">{item.frameWidth} x {item.frameHeight} px</strong>
                </div>
                <div className="p-2.5 rounded bg-[#0d1017] border border-[#202533]">
                  <span className="text-slate-400 block text-[10px]">Tổng Số Khung Hình</span>
                  <strong className="text-white">{item.frames} frames @ {item.fps} FPS</strong>
                </div>
                <div className="p-2.5 rounded bg-[#0d1017] border border-[#202533]">
                  <span className="text-slate-400 block text-[10px]">Điểm Tiếp Đất (Pivot)</span>
                  <strong className="text-amber-400 font-mono">[{item.pivot[0]}, {item.pivot[1]}]</strong>
                </div>
                <div className="p-2.5 rounded bg-[#0d1017] border border-[#202533]">
                  <span className="text-slate-400 block text-[10px]">Chuẩn Normalized Pivot</span>
                  <strong className="text-blue-400 font-mono">[{item.pivotNorm[0]}, {item.pivotNorm[1]}]</strong>
                </div>
              </div>

              {boundSkill && (
                <div className="pt-2 border-t border-[#202533]">
                  <span className="text-slate-400 block text-[10px] mb-1 font-semibold text-amber-300">Thông Số Tác Chiến MMORPG:</span>
                  <div className="grid grid-cols-3 gap-2 text-[11px] mb-2">
                    <div className="p-1.5 rounded bg-[#0d1017] border border-[#202533]">
                      <span className="text-slate-500 block text-[9px]">MP Cost</span>
                      <span className="text-blue-400 font-bold">{boundSkill.manaCost} MP</span>
                    </div>
                    <div className="p-1.5 rounded bg-[#0d1017] border border-[#202533]">
                      <span className="text-slate-500 block text-[9px]">Hồi Chiêu</span>
                      <span className="text-amber-400 font-bold">{boundSkill.cooldownSeconds}s</span>
                    </div>
                    <div className="p-1.5 rounded bg-[#0d1017] border border-[#202533]">
                      <span className="text-slate-500 block text-[9px]">Sát Thương</span>
                      <span className="text-emerald-400 font-bold">{boundSkill.damageMultiplier}x ATK</span>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed bg-[#0d1017] p-2.5 rounded border border-[#202533]">
                    {boundSkill.description}
                  </p>
                </div>
              )}

              {/* Direct file links */}
              <div className="pt-2 flex gap-2">
                <a
                  href={getVfxUrl(item.image)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-3 rounded bg-[#1e2332] hover:bg-[#283044] text-slate-300 hover:text-white text-center flex items-center justify-center gap-1.5 transition-colors text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Mở File Sprite Sheet
                </a>
                <a
                  href={getVfxUrl(item.json)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-3 rounded bg-[#1e2332] hover:bg-[#283044] text-slate-300 hover:text-white text-center flex items-center justify-center gap-1.5 transition-colors text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Mở File JSON Atlas
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SKILL-TO-VFX MAPPING MODAL */}
      {isMappingOpen && (
        <VfxSkillMappingModal
          effectKey={item.key}
          existingConfig={customSkillConfig}
          palette={palette}
          scale={scale}
          onSave={(cfg) => {
            setCustomSkillConfig(cfg);
            setIsMappingOpen(false);
          }}
          onClose={() => setIsMappingOpen(false)}
        />
      )}
    </div>
  );
}
