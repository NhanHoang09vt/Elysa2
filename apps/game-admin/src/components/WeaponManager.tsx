import React, { useState, useEffect, useRef } from 'react';
import {
  Sword,
  Search,
  Plus,
  Copy,
  Archive,
  CheckCircle,
  Edit,
  Upload,
  RotateCcw,
  Maximize2,
  X,
  Sparkles,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sliders,
  User,
  Shield,
  Zap,
  RefreshCw,
} from 'lucide-react';
import {
  WeaponEntity,
  WeaponType,
  ElementType,
  ContentStatus,
  ClassId,
  WeaponPaperdollConfig,
} from '@elysia/game-types';
import {
  fetchAdminWeapons,
  createAdminWeapon,
  updateAdminWeapon,
  duplicateAdminWeapon,
  archiveAdminWeapon,
  publishAdminWeapon,
  uploadAssetFile,
} from '../services/apiClient';

const WEAPON_TYPES: { id: WeaponType; name: string }[] = [
  { id: 'sword', name: 'Kiếm Đơn (Sword)' },
  { id: 'greatsword', name: 'Đại Kiếm (Greatsword)' },
  { id: 'shield', name: 'Khiên Hộ Vệ (Shield)' },
  { id: 'spear', name: 'Thương (Spear)' },
  { id: 'halberd', name: 'Kích Chiến (Halberd)' },
  { id: 'lance', name: 'Trọng Thương (Lance)' },
  { id: 'staff', name: 'Pháp Trượng (Staff)' },
  { id: 'spellbook', name: 'Sách Phép (Spellbook)' },
  { id: 'dual_dagger', name: 'Song Đao (Dual Dagger)' },
  { id: 'bow', name: 'Cung Tên (Bow)' },
  { id: 'crossbow', name: 'Nỏ Chiến (Crossbow)' },
  { id: 'fist', name: 'Bao Tay Quyền (Fist)' },
];

const ALL_CLASSES: { id: ClassId; name: string }[] = [
  { id: 'novice', name: 'Tân Thủ (Novice)' },
  { id: 'swordsman', name: 'Kiếm Sĩ (Swordsman)' },
  { id: 'spearman', name: 'Thương Thủ (Spearman)' },
  { id: 'knight', name: 'Hiệp Sĩ (Knight)' },
  { id: 'priest', name: 'Tu Sĩ (Priest)' },
  { id: 'mage', name: 'Pháp Sư (Mage)' },
  { id: 'assassin', name: 'Thích Khách (Assassin)' },
  { id: 'fighter', name: 'Đấu Sĩ (Fighter)' },
  { id: 'archer', name: 'Cung Thủ (Archer)' },
];

export function WeaponManager() {
  const [weapons, setWeapons] = useState<WeaponEntity[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Zoom Modal
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'assets' | 'stats' | 'classes' | 'paperdoll' | 'upgrade'>('basic');
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<WeaponEntity>>({
    weaponId: '',
    weaponType: 'sword',
    attackPower: 12,
    magicAttackPower: 0,
    hit: 10,
    criticalRate: 0.03,
    criticalDamage: 1.5,
    attackSpeed: 1.0,
    element: 'neutral',
    elementalBonus: 0,
    physicalBonus: 0,
    magicalBonus: 0,
    durability: 100,
    maxDurability: 100,
    refinementLevel: 0,
    requirements: { str: 10, dex: 10, agi: 10, int: 8, con: 10 },
    upgradeConfig: { maxUpgrade: 10, successRate: 0.8 },
    paperdollConfig: {
      offsetX: 50,
      offsetY: 75,
      scale: 1.0,
      rotation: -25,
      anchorX: 0.5,
      anchorY: 0.85,
    },
    status: 'DRAFT',
    iconAssetUrl: '',
    spriteAssetUrl: '',
  });

  // Additional Item fields attached to Weapon Form
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLevel, setFormLevel] = useState(1);
  const [formRarity, setFormRarity] = useState<'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'>('common');
  const [formClasses, setFormClasses] = useState<ClassId[]>(['swordsman', 'novice']);

  // Paperdoll Preview Options
  const [previewChar, setPreviewChar] = useState<'novice_female' | 'swordsman_female'>('novice_female');
  const [flipWeapon, setFlipWeapon] = useState(false);

  // File Upload Handlers
  const iconInputRef = useRef<HTMLInputElement | null>(null);
  const spriteInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const loadWeapons = async (page = 1) => {
    setLoading(true);
    setErrorBanner(null);
    try {
      const res = await fetchAdminWeapons({
        q: searchQuery,
        weaponType: selectedType,
        classRestriction: selectedClass,
        status: selectedStatus,
        page,
        limit: meta.limit,
      });
      if (res?.data) {
        setWeapons(res.data);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Lỗi khi tải danh sách vũ khí.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeapons(1);
  }, [searchQuery, selectedType, selectedClass, selectedStatus]);

  const notifySuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const notifyError = (msg: string) => {
    setErrorBanner(msg);
    setTimeout(() => setErrorBanner(null), 5000);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      weaponId: `WEAPON_${Date.now()}`,
      weaponType: 'sword',
      attackPower: 15,
      magicAttackPower: 0,
      hit: 8,
      criticalRate: 0.03,
      criticalDamage: 1.5,
      attackSpeed: 1.0,
      element: 'neutral',
      elementalBonus: 0,
      physicalBonus: 0,
      magicalBonus: 0,
      durability: 100,
      maxDurability: 100,
      refinementLevel: 0,
      requirements: { str: 10, dex: 10, agi: 10, int: 8, con: 10 },
      upgradeConfig: { maxUpgrade: 10 },
      paperdollConfig: {
        offsetX: 50,
        offsetY: 75,
        scale: 1.0,
        rotation: -25,
        anchorX: 0.5,
        anchorY: 0.85,
      },
      status: 'DRAFT',
      iconAssetUrl: '',
      spriteAssetUrl: '',
    });
    setFormName('');
    setFormDesc('');
    setFormLevel(1);
    setFormRarity('common');
    setFormClasses(['swordsman', 'novice']);
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (wp: WeaponEntity) => {
    setIsEditing(true);
    setFormData({ ...wp });
    setFormName(wp.item?.name || wp.weaponId);
    setFormDesc(wp.item?.description || '');
    setFormLevel(wp.item?.requiredLevel || 1);
    setFormRarity((wp.item?.rarity as any) || 'common');
    setFormClasses(wp.item?.requiredClasses || ['swordsman']);
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  // Upload Icon
  const handleUploadIcon = async (file: File) => {
    setUploadStatus('Đang upload icon...');
    try {
      const res = await uploadAssetFile(file, 'weapons', 'INVENTORY', `Weapon Icon: ${formData.weaponId}`);
      setFormData((prev) => ({
        ...prev,
        iconAssetUrl: res.publicUrl,
      }));
      setUploadStatus(null);
      notifySuccess('Upload Inventory Icon thành công!');
    } catch (err: any) {
      setUploadStatus(null);
      notifyError(err.message || 'Lỗi khi upload icon.');
    }
  };

  // Upload Sprite
  const handleUploadSprite = async (file: File) => {
    setUploadStatus('Đang upload sprite...');
    try {
      const res = await uploadAssetFile(file, 'weapons', 'WEAPON_SPRITE', `Weapon Sprite: ${formData.weaponId}`);
      setFormData((prev) => ({
        ...prev,
        spriteAssetUrl: res.publicUrl,
      }));
      setUploadStatus(null);
      notifySuccess('Upload Weapon Sprite thành công!');
    } catch (err: any) {
      setUploadStatus(null);
      notifyError(err.message || 'Lỗi khi upload sprite.');
    }
  };

  // Save Weapon
  const handleSave = async (statusOverride?: ContentStatus) => {
    if (!formName || formName.trim().length === 0) {
      notifyError('Vui lòng nhập tên vũ khí.');
      setActiveTab('basic');
      return;
    }
    if (!formData.iconAssetUrl) {
      notifyError('Quy tắc bắt buộc: Phải upload Inventory Icon cho vũ khí.');
      setActiveTab('assets');
      return;
    }
    if (!formData.spriteAssetUrl) {
      notifyError('Quy tắc bắt buộc: Phải upload Weapon Sprite cho vũ khí.');
      setActiveTab('assets');
      return;
    }

    try {
      const payload = {
        ...formData,
        name: formName,
        description: formDesc,
        requiredLevel: formLevel,
        rarity: formRarity,
        requiredClasses: formClasses,
        status: statusOverride || formData.status || 'DRAFT',
      };

      if (isEditing) {
        await updateAdminWeapon(formData.weaponId!, payload);
        notifySuccess(`Đã cập nhật vũ khí "${formName}" thành công!`);
      } else {
        await createAdminWeapon(payload);
        notifySuccess(`Đã tạo vũ khí "${formName}" thành công!`);
      }

      setIsModalOpen(false);
      loadWeapons(meta.page);
    } catch (err: any) {
      notifyError(err.message || 'Lỗi khi lưu vũ khí.');
    }
  };

  // Duplicate Weapon
  const handleDuplicate = async (wp: WeaponEntity) => {
    try {
      const res = await duplicateAdminWeapon(wp.weaponId);
      notifySuccess(`Đã nhân bản vũ khí "${wp.item?.name || wp.weaponId}"!`);
      loadWeapons(meta.page);
    } catch (err: any) {
      notifyError(err.message || 'Không thể nhân bản vũ khí.');
    }
  };

  // Publish Weapon
  const handlePublish = async (wp: WeaponEntity) => {
    try {
      await publishAdminWeapon(wp.weaponId);
      notifySuccess(`Đã xuất bản (Publish) vũ khí "${wp.item?.name || wp.weaponId}" lên Game Client!`);
      loadWeapons(meta.page);
    } catch (err: any) {
      notifyError(err.message || 'Không thể publish vũ khí.');
    }
  };

  // Archive Weapon
  const handleArchive = async (wp: WeaponEntity) => {
    try {
      await archiveAdminWeapon(wp.weaponId);
      notifySuccess(`Đã lưu trữ (Archive) vũ khí "${wp.item?.name || wp.weaponId}".`);
      loadWeapons(meta.page);
    } catch (err: any) {
      notifyError(err.message || 'Không thể archive vũ khí.');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#141722] p-6 rounded-lg border border-[#222738]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sword className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-serif tracking-wide">Weapon Manager</h2>
            <p className="text-xs text-slate-400">
              Quản lý kho vũ khí, Paperdoll Equipment Preview, chỉ số ATK/MATK và đồng bộ hệ phái
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Tạo Vũ Khí Mới
        </button>
      </div>

      {/* ALERT BANNERS */}
      {errorBanner && (
        <div className="p-3.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successBanner && (
        <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-lg bg-[#141722] border border-[#222738] space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm vũ khí theo tên, Weapon ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0e111a] border border-[#252c3d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-[#0e111a] border border-[#252c3d] text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">Tất cả Loại Vũ Khí</option>
              {WEAPON_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-[#0e111a] border border-[#252c3d] text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">Tất cả Hệ Phái</option>
              {ALL_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded border transition-colors ${
                viewMode === 'grid'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#0e111a] text-slate-400 border-[#252c3d] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded border transition-colors ${
                viewMode === 'table'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#0e111a] text-slate-400 border-[#252c3d] hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* WEAPON CARDS / GRID */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-[#141722] rounded-lg border border-[#222738]">
          Đang nạp danh sách vũ khí...
        </div>
      ) : weapons.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-[#141722] rounded-lg border border-[#222738]">
          <Sword className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">Không tìm thấy vũ khí</h4>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {weapons.map((wp) => {
            const itemName = wp.item?.name || wp.weaponId;
            return (
              <div
                key={wp.weaponId}
                className="p-4 rounded-lg bg-[#141722] border border-[#252c3d] hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-mono text-amber-400 uppercase font-bold">{wp.weaponType}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        wp.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {wp.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      onClick={() =>
                        wp.iconAssetUrl && setZoomedImage({ url: wp.iconAssetUrl, title: itemName })
                      }
                      className="w-16 h-16 rounded-lg bg-[#0c0e16] border border-[#262f44] flex items-center justify-center p-1 cursor-pointer group"
                    >
                      {wp.iconAssetUrl ? (
                        <img
                          src={wp.iconAssetUrl}
                          alt={itemName}
                          className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <span className="text-[9px] text-amber-400 font-mono text-center">Missing Icon</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{itemName}</h4>
                      <p className="text-[10px] font-mono text-slate-400 truncate">{wp.weaponId}</p>
                      <div className="text-[11px] text-amber-300 font-mono mt-1">
                        ATK: <strong>+{wp.attackPower}</strong> | MATK: <strong>+{wp.magicAttackPower}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap gap-1">
                    {wp.item?.requiredClasses && wp.item.requiredClasses.length > 0 ? (
                      wp.item.requiredClasses.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded bg-[#10141f] text-blue-400 border border-[#202738] font-mono text-[10px]">
                          {c}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-[10px]">Mọi Class</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#202638] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Lv.{wp.item?.requiredLevel || 1} • {wp.element}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(wp)}
                      className="p-1.5 rounded bg-[#1c2233] hover:bg-[#252e44] text-slate-300 hover:text-white"
                      title="Chỉnh sửa & Cân chỉnh Paperdoll"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(wp)}
                      className="p-1.5 rounded bg-[#1c2233] hover:bg-[#252e44] text-slate-300 hover:text-white"
                      title="Nhân bản vũ khí"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {wp.status !== 'PUBLISHED' && (
                      <button
                        onClick={() => handlePublish(wp)}
                        className="p-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300"
                        title="Xuất bản vũ khí"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {wp.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => handleArchive(wp)}
                        className="p-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                        title="Lưu trữ (Archive)"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-lg border border-[#222738] bg-[#141722]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0e111a] text-slate-400 text-[11px] uppercase border-b border-[#222738]">
              <tr>
                <th className="py-3 px-4">Ảnh</th>
                <th className="py-3 px-4">Mã Weapon ID</th>
                <th className="py-3 px-4">Tên Vũ Khí</th>
                <th className="py-3 px-4">Loại</th>
                <th className="py-3 px-4">ATK / MATK</th>
                <th className="py-3 px-4">Hệ Phái Y/C</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2332]">
              {weapons.map((wp) => (
                <tr key={wp.weaponId} className="hover:bg-[#181d2c] transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="w-10 h-10 rounded bg-[#0c0e16] border border-[#262f44] p-0.5 flex items-center justify-center">
                      {wp.iconAssetUrl ? (
                        <img src={wp.iconAssetUrl} alt={wp.weaponId} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[8px] text-amber-400">Missing</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">{wp.weaponId}</td>
                  <td className="py-2.5 px-4 font-semibold text-white">{wp.item?.name || wp.weaponId}</td>
                  <td className="py-2.5 px-4 font-mono uppercase text-amber-400">{wp.weaponType}</td>
                  <td className="py-2.5 px-4 font-mono text-emerald-400">
                    +{wp.attackPower} / +{wp.magicAttackPower}
                  </td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-400">
                    {wp.item?.requiredClasses?.join(', ') || 'Tất cả'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        wp.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {wp.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => openEditModal(wp)}
                      className="p-1 rounded bg-[#1e2538] hover:bg-[#28324a] text-slate-300"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ZOOM MODAL */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="p-6 rounded-xl bg-[#121622] border border-[#2a3449] max-w-lg w-full flex flex-col items-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center border-b border-[#22293b] pb-2">
              <h3 className="font-bold text-sm text-white font-serif">{zoomedImage.title}</h3>
              <button onClick={() => setZoomedImage(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-64 h-64 bg-[#0a0c14] rounded-lg border border-[#232b3e] flex items-center justify-center p-4">
              <img src={zoomedImage.url} alt={zoomedImage.title} className="max-h-full max-w-full object-contain filter drop-shadow-lg" />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* WEAPON MULTI-TAB MODAL                               */}
      {/* ==================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121622] border border-[#2f3950] rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 px-6 bg-[#161a29] border-b border-[#252d40] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  <Sword className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-serif">
                    {isEditing ? `Cấu Hình Vũ Khí: ${formName}` : 'Tạo Vũ Khí Mới (Weapon Creation)'}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">{formData.weaponId}</span>
                </div>
              </div>

              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Tabs */}
            <div className="flex border-b border-[#22293c] px-6 bg-[#10131e] gap-4">
              {[
                { id: 'basic', label: 'Tab A — Thông Tin Cơ Bản' },
                { id: 'assets', label: 'Tab B — Ảnh & Sprites' },
                { id: 'stats', label: 'Tab C — Chỉ Số Tấn Công' },
                { id: 'classes', label: 'Tab D — Tương Thích Class' },
                { id: 'paperdoll', label: 'Tab E — Căn Vị Trí Paperdoll (Live Preview)' },
                { id: 'upgrade', label: 'Tab F — Cường Hóa & Hiệu Ứng' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`py-3 text-xs font-semibold tracking-wide border-b-2 transition-all ${
                    activeTab === t.id
                      ? 'text-amber-400 border-amber-400'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* TAB A: BASIC */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Mã Weapon ID *</label>
                      <input
                        type="text"
                        disabled={isEditing}
                        value={formData.weaponId || ''}
                        onChange={(e) => setFormData({ ...formData, weaponId: e.target.value.toUpperCase() })}
                        className="w-full p-2.5 rounded-lg bg-[#0c0e16] border border-[#262f44] text-xs text-amber-300 font-mono disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Tên Vũ Khí *</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="VD: Thánh Kiếm Khởi Đầu"
                        className="w-full p-2.5 rounded-lg bg-[#0c0e16] border border-[#262f44] text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Loại Vũ Khí (Weapon Type)</label>
                      <select
                        value={formData.weaponType || 'sword'}
                        onChange={(e) => setFormData({ ...formData, weaponType: e.target.value as any })}
                        className="w-full p-2.5 rounded-lg bg-[#0c0e16] border border-[#262f44] text-xs text-white"
                      >
                        {WEAPON_TYPES.map((wt) => (
                          <option key={wt.id} value={wt.id}>{wt.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Độ Hiếm</label>
                      <select
                        value={formRarity}
                        onChange={(e) => setFormRarity(e.target.value as any)}
                        className="w-full p-2.5 rounded-lg bg-[#0c0e16] border border-[#262f44] text-xs text-white capitalize"
                      >
                        <option value="common">Common</option>
                        <option value="uncommon">Uncommon</option>
                        <option value="rare">Rare</option>
                        <option value="epic">Epic</option>
                        <option value="legendary">Legendary</option>
                        <option value="mythic">Mythic</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Cấp Độ Yêu Cầu</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formLevel}
                        onChange={(e) => setFormLevel(parseInt(e.target.value, 10))}
                        className="w-full p-2.5 rounded-lg bg-[#0c0e16] border border-[#262f44] text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">Mô Tả Vũ Khí</label>
                    <textarea
                      rows={3}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Truyền thuyết về thanh vũ khí..."
                      className="w-full p-2.5 rounded-lg bg-[#0c0e16] border border-[#262f44] text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB B: ASSETS */}
              {activeTab === 'assets' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* INVENTORY ICON (128x128) */}
                    <div className="p-4 rounded-xl bg-[#0c0e16] border border-[#262f44] space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-amber-300">1. Inventory Icon (128x128 PNG) *</span>
                        {formData.iconAssetUrl && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            Đã có ảnh
                          </span>
                        )}
                      </div>

                      <div className="w-full h-36 rounded-lg bg-[#07090f] border border-[#1e2332] flex items-center justify-center p-2 relative">
                        {formData.iconAssetUrl ? (
                          <img
                            src={formData.iconAssetUrl}
                            alt="Inventory Icon"
                            className="max-h-full max-w-full object-contain filter drop-shadow"
                          />
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">Chưa upload icon</span>
                        )}
                      </div>

                      <input
                        type="file"
                        ref={iconInputRef}
                        accept="image/png,image/webp"
                        onChange={(e) => e.target.files?.[0] && handleUploadIcon(e.target.files[0])}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => iconInputRef.current?.click()}
                        className="w-full py-2 rounded-lg bg-[#1c2233] hover:bg-[#252e44] text-amber-300 border border-[#2f3a52] text-xs font-semibold flex items-center justify-center gap-2"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Inventory Icon
                      </button>
                    </div>

                    {/* WEAPON SPRITE */}
                    <div className="p-4 rounded-xl bg-[#0c0e16] border border-[#262f44] space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-amber-300">2. Weapon In-Game Sprite *</span>
                        {formData.spriteAssetUrl && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            Đã có sprite
                          </span>
                        )}
                      </div>

                      <div className="w-full h-36 rounded-lg bg-[#07090f] border border-[#1e2332] flex items-center justify-center p-2 relative">
                        {formData.spriteAssetUrl ? (
                          <img
                            src={formData.spriteAssetUrl}
                            alt="Weapon Sprite"
                            className="max-h-full max-w-full object-contain filter drop-shadow"
                          />
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">Chưa upload sprite</span>
                        )}
                      </div>

                      <input
                        type="file"
                        ref={spriteInputRef}
                        accept="image/png,image/webp"
                        onChange={(e) => e.target.files?.[0] && handleUploadSprite(e.target.files[0])}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => spriteInputRef.current?.click()}
                        className="w-full py-2 rounded-lg bg-[#1c2233] hover:bg-[#252e44] text-amber-300 border border-[#2f3a52] text-xs font-semibold flex items-center justify-center gap-2"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Weapon Sprite
                      </button>
                    </div>
                  </div>

                  {uploadStatus && (
                    <div className="p-2.5 rounded bg-amber-500/10 text-amber-300 text-xs text-center font-mono animate-pulse">
                      {uploadStatus}
                    </div>
                  )}
                </div>
              )}

              {/* TAB C: STATS */}
              {activeTab === 'stats' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3.5 rounded-lg bg-[#0c0e16] border border-[#22293c]">
                      <label className="text-[11px] text-slate-400 block mb-1">Công Vật Lý (ATK)</label>
                      <input
                        type="number"
                        value={formData.attackPower || 0}
                        onChange={(e) => setFormData({ ...formData, attackPower: parseInt(e.target.value, 10) })}
                        className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-amber-400 font-mono font-bold"
                      />
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#0c0e16] border border-[#22293c]">
                      <label className="text-[11px] text-slate-400 block mb-1">Công Phép (MATK)</label>
                      <input
                        type="number"
                        value={formData.magicAttackPower || 0}
                        onChange={(e) => setFormData({ ...formData, magicAttackPower: parseInt(e.target.value, 10) })}
                        className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-blue-400 font-mono font-bold"
                      />
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#0c0e16] border border-[#22293c]">
                      <label className="text-[11px] text-slate-400 block mb-1">Độ Chính Xác (HIT)</label>
                      <input
                        type="number"
                        value={formData.hit || 0}
                        onChange={(e) => setFormData({ ...formData, hit: parseInt(e.target.value, 10) })}
                        className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-white font-mono"
                      />
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#0c0e16] border border-[#22293c]">
                      <label className="text-[11px] text-slate-400 block mb-1">Tốc Độ Đánh (ASPD)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={formData.attackSpeed || 1.0}
                        onChange={(e) => setFormData({ ...formData, attackSpeed: parseFloat(e.target.value) })}
                        className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-emerald-400 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3.5 rounded-lg bg-[#0c0e16] border border-[#22293c]">
                      <label className="text-[11px] text-slate-400 block mb-1">Tỉ Lệ Chí Mạng (CRIT %)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.criticalRate || 0}
                        onChange={(e) => setFormData({ ...formData, criticalRate: parseFloat(e.target.value) })}
                        className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-purple-400 font-mono"
                      />
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#0c0e16] border border-[#22293c]">
                      <label className="text-[11px] text-slate-400 block mb-1">Hệ Nguyên Tố</label>
                      <select
                        value={formData.element || 'neutral'}
                        onChange={(e) => setFormData({ ...formData, element: e.target.value as any })}
                        className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-white capitalize font-mono"
                      >
                        <option value="neutral">Neutral (Vô Tính)</option>
                        <option value="fire">Fire (Hỏa)</option>
                        <option value="water">Water (Thủy)</option>
                        <option value="wind">Wind (Phong)</option>
                        <option value="earth">Earth (Địa)</option>
                        <option value="holy">Holy (Thánh)</option>
                        <option value="shadow">Shadow (Ám)</option>
                      </select>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#0c0e16] border border-[#22293c]">
                      <label className="text-[11px] text-slate-400 block mb-1">Độ Bền (Durability)</label>
                      <input
                        type="number"
                        value={formData.durability || 100}
                        onChange={(e) => setFormData({ ...formData, durability: parseInt(e.target.value, 10) })}
                        className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-white font-mono"
                      />
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#0c0e16] border border-[#22293c]">
                      <label className="text-[11px] text-slate-400 block mb-1">Cấp Tinh Luyện (+)</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={formData.refinementLevel || 0}
                        onChange={(e) => setFormData({ ...formData, refinementLevel: parseInt(e.target.value, 10) })}
                        className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-amber-400 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB D: CLASS COMPATIBILITY */}
              {activeTab === 'classes' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-300 font-semibold">Chọn các hệ phái được phép trang bị vũ khí này:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormClasses(ALL_CLASSES.map((c) => c.id))}
                        className="px-2.5 py-1 rounded bg-[#1e2436] text-[11px] text-slate-300 hover:text-white"
                      >
                        Chọn Tất Cả
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormClasses([])}
                        className="px-2.5 py-1 rounded bg-[#1e2436] text-[11px] text-slate-300 hover:text-white"
                      >
                        Bỏ Chọn Hết
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ALL_CLASSES.map((cls) => {
                      const checked = formClasses.includes(cls.id);
                      return (
                        <label
                          key={cls.id}
                          className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                            checked
                              ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10'
                              : 'bg-[#0c0e16] border-[#22293c] text-slate-400 hover:bg-[#121622]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) setFormClasses([...formClasses, cls.id]);
                                else setFormClasses(formClasses.filter((c) => c !== cls.id));
                              }}
                              className="accent-amber-500"
                            />
                            <span className="text-xs font-semibold">{cls.name}</span>
                          </div>
                          <span className="text-[10px] font-mono uppercase text-slate-500">{cls.id}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB E: PAPERDOLL LIVE PREVIEW */}
              {activeTab === 'paperdoll' && (
                <div className="space-y-4">
                  <div className="p-3 rounded bg-[#0c0e16] border border-[#22293c] flex items-center justify-between text-xs">
                    <span className="text-slate-300">
                      <strong>Công cụ Paperdoll:</strong> Điều chỉnh vị trí tay cầm, góc xoay và tỉ lệ hiển thị vũ khí trực tiếp trên nhân vật.
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewChar('novice_female')}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          previewChar === 'novice_female'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-[#181d2c] text-slate-400'
                        }`}
                      >
                        Nữ Tân Thủ
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewChar('swordsman_female')}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          previewChar === 'swordsman_female'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-[#181d2c] text-slate-400'
                        }`}
                      >
                        Nữ Kiếm Sĩ
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* LIVE CANVAS STAGE */}
                    <div className="md:col-span-6 bg-[#07090f] rounded-xl border border-[#262f44] h-96 relative overflow-hidden flex items-center justify-center shadow-inner">
                      {/* Character Base Sprite */}
                      <img
                        src={
                          previewChar === 'novice_female'
                            ? '/assets/characters/female/novice/master/novice_female_master_256.png'
                            : '/assets/characters/female/swordsman/swordsman_female_idle_front.png'
                        }
                        alt="Character Paperdoll Base"
                        className="h-72 object-contain pointer-events-none filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
                      />

                      {/* Overlaid Weapon Sprite */}
                      {formData.spriteAssetUrl ? (
                        <div
                          className="absolute pointer-events-none transition-transform"
                          style={{
                            transform: `translate(${formData.paperdollConfig?.offsetX || 0}px, ${
                              formData.paperdollConfig?.offsetY || 0
                            }px) rotate(${formData.paperdollConfig?.rotation || 0}deg) scale(${
                              (formData.paperdollConfig?.scale || 1.0) * (flipWeapon ? -1 : 1)
                            }, ${formData.paperdollConfig?.scale || 1.0})`,
                          }}
                        >
                          <img
                            src={formData.spriteAssetUrl}
                            alt="Weapon Paperdoll"
                            className="max-h-24 max-w-24 object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
                          />
                        </div>
                      ) : (
                        <div className="absolute text-center bg-black/80 p-2 rounded text-rose-400 text-xs font-mono">
                          ⚠ Chưa có Weapon Sprite để preview
                        </div>
                      )}

                      {/* Overlay Crosshair Info */}
                      <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-500 bg-black/60 px-2 py-1 rounded">
                        X: {formData.paperdollConfig?.offsetX} | Y: {formData.paperdollConfig?.offsetY} | Scale:{' '}
                        {formData.paperdollConfig?.scale} | Rot: {formData.paperdollConfig?.rotation}°
                      </div>
                    </div>

                    {/* OFFSET CONTROLS */}
                    <div className="md:col-span-6 space-y-4 p-4 rounded-xl bg-[#0c0e16] border border-[#22293c]">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 font-semibold">Tọa Độ X (Offset X)</span>
                          <span className="font-mono text-amber-400">{formData.paperdollConfig?.offsetX || 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="120"
                          value={formData.paperdollConfig?.offsetX || 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paperdollConfig: {
                                ...formData.paperdollConfig!,
                                offsetX: parseInt(e.target.value, 10),
                              },
                            })
                          }
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 font-semibold">Tọa Độ Y (Offset Y)</span>
                          <span className="font-mono text-amber-400">{formData.paperdollConfig?.offsetY || 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="120"
                          value={formData.paperdollConfig?.offsetY || 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paperdollConfig: {
                                ...formData.paperdollConfig!,
                                offsetY: parseInt(e.target.value, 10),
                              },
                            })
                          }
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 font-semibold">Tỉ Lệ Kích Cỡ (Scale)</span>
                          <span className="font-mono text-amber-400">
                            {((formData.paperdollConfig?.scale || 1.0) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.05"
                          value={formData.paperdollConfig?.scale || 1.0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paperdollConfig: {
                                ...formData.paperdollConfig!,
                                scale: parseFloat(e.target.value),
                              },
                            })
                          }
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 font-semibold">Góc Xoay (Rotation)</span>
                          <span className="font-mono text-amber-400">{formData.paperdollConfig?.rotation || 0}°</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={formData.paperdollConfig?.rotation || 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paperdollConfig: {
                                ...formData.paperdollConfig!,
                                rotation: parseInt(e.target.value, 10),
                              },
                            })
                          }
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#22293c]">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={flipWeapon}
                            onChange={(e) => setFlipWeapon(e.target.checked)}
                            className="accent-amber-500"
                          />
                          <span>Lật vũ khí theo chiều ngang (Flip X)</span>
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              paperdollConfig: {
                                offsetX: 50,
                                offsetY: 75,
                                scale: 1.0,
                                rotation: -25,
                                anchorX: 0.5,
                                anchorY: 0.85,
                              },
                            })
                          }
                          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Reset vị trí
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB F: UPGRADE */}
              {activeTab === 'upgrade' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#0c0e16] border border-[#22293c] space-y-3">
                    <h4 className="font-semibold text-xs text-amber-300">Quy Tắc Cường Hóa (Refinement Rules)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Cấp Cường Hóa Tối Đa (+Max)</label>
                        <input
                          type="number"
                          value={formData.upgradeConfig?.maxUpgrade || 10}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              upgradeConfig: {
                                ...formData.upgradeConfig,
                                maxUpgrade: parseInt(e.target.value, 10) || 10,
                              },
                            })
                          }
                          className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Tỉ Lệ Thành Công Cơ Bản (%)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={(formData.upgradeConfig?.successRate || 0.8) * 100}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              upgradeConfig: {
                                maxUpgrade: formData.upgradeConfig?.maxUpgrade || 10,
                                ...formData.upgradeConfig,
                                successRate: parseFloat(e.target.value) / 100,
                              },
                            })
                          }
                          className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-emerald-400 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 px-6 bg-[#161a29] border-t border-[#252d40] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#1c2233] hover:bg-[#252e44] text-slate-300 text-xs font-semibold"
              >
                Hủy Bỏ
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSave('DRAFT')}
                  className="px-4 py-2 rounded-lg bg-[#222a3d] hover:bg-[#2c364d] text-slate-200 text-xs font-semibold border border-[#344059]"
                >
                  Lưu Bản Thảo (Draft)
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('PUBLISHED')}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  {isEditing ? 'Cập Nhật & Publish Vũ Khí' : 'Tạo & Xuất Bản Ngay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
