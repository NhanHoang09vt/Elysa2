import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Search,
  Filter,
  Plus,
  Copy,
  Archive,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
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
  Layers,
  DollarSign,
  Shield,
  Heart,
  Droplet,
  Info,
} from 'lucide-react';
import { ItemEntity, ItemCategory, ItemRarity, ContentStatus, ClassId } from '@elysia/game-types';
import {
  fetchAdminItems,
  createAdminItem,
  updateAdminItem,
  deleteAdminItem,
  duplicateAdminItem,
  archiveAdminItem,
  publishAdminItem,
  uploadAssetFile,
  replaceAssetFile,
  rollbackAssetVersion,
} from '../services/apiClient';

const RARITY_COLORS: Record<ItemRarity, { border: string; bg: string; text: string; glow: string }> = {
  common: { border: 'border-slate-500/50', bg: 'bg-slate-500/10', text: 'text-slate-300', glow: 'shadow-slate-500/20' },
  uncommon: { border: 'border-emerald-500/50', bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' },
  rare: { border: 'border-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
  epic: { border: 'border-purple-500/50', bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'shadow-purple-500/30' },
  legendary: { border: 'border-amber-500/60', bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'shadow-amber-500/40' },
  mythic: { border: 'border-rose-500/70', bg: 'bg-rose-500/15', text: 'text-rose-400', glow: 'shadow-rose-500/50' },
};

const CATEGORIES: { id: ItemCategory; name: string }[] = [
  { id: 'equipment', name: 'Trang Bị (Equipment)' },
  { id: 'weapon', name: 'Vũ Khí (Weapon)' },
  { id: 'armor', name: 'Giáp Trụ (Armor)' },
  { id: 'accessory', name: 'Phụ Kiện (Accessory)' },
  { id: 'consumable', name: 'Tiêu Hao (Consumable)' },
  { id: 'potion', name: 'Dược Phẩm (Potion)' },
  { id: 'material', name: 'Nguyên Liệu (Material)' },
  { id: 'quest_item', name: 'Nhiệm Vụ (Quest Item)' },
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

export function ItemManager() {
  const [items, setItems] = useState<ItemEntity[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Zoom Image Modal
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'assets' | 'properties' | 'economy' | 'preview'>('basic');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<ItemEntity>>({
    itemId: '',
    name: '',
    internalName: '',
    description: '',
    category: 'equipment',
    subcategory: '',
    rarity: 'common',
    itemType: 'general',
    requiredLevel: 1,
    requiredClasses: [],
    stackLimit: 1,
    weight: 1.0,
    buyPrice: 10,
    sellPrice: 2,
    isTradable: true,
    isSellable: true,
    isDroppable: true,
    isAccountBound: false,
    isCharacterBound: false,
    status: 'DRAFT',
    primaryAssetUrl: '',
    inventoryAssetUrl: '',
    groundAssetUrl: '',
    properties: {},
  });

  // Asset Upload State
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadDimensions, setUploadDimensions] = useState<{ width?: number; height?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Version History State
  const [assetVersions, setAssetVersions] = useState<any[]>([]);

  // Load items from API
  const loadItems = async (page = 1) => {
    setLoading(true);
    setErrorBanner(null);
    try {
      const res = await fetchAdminItems({
        q: searchQuery,
        category: selectedCategory,
        rarity: selectedRarity,
        status: selectedStatus,
        classRestriction: selectedClass,
        page,
        limit: meta.limit,
      });
      if (res?.data) {
        setItems(res.data);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Lỗi khi tải danh sách vật phẩm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(1);
  }, [searchQuery, selectedCategory, selectedRarity, selectedStatus, selectedClass]);

  // Notifications helper
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
      itemId: `ITEM_${Date.now()}`,
      name: '',
      internalName: '',
      description: '',
      category: 'equipment',
      subcategory: '',
      rarity: 'common',
      itemType: 'weapon_single_handed',
      requiredLevel: 1,
      requiredClasses: [],
      stackLimit: 1,
      weight: 1.0,
      buyPrice: 20,
      sellPrice: 5,
      isTradable: true,
      isSellable: true,
      isDroppable: true,
      isAccountBound: false,
      isCharacterBound: false,
      status: 'DRAFT',
      primaryAssetUrl: '',
      inventoryAssetUrl: '',
      groundAssetUrl: '',
      properties: {},
    });
    setUploadDimensions(null);
    setAssetVersions([]);
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: ItemEntity) => {
    setIsEditing(true);
    setFormData({ ...item });
    setUploadDimensions(null);
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  // Handle File Upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadProgress('Đang kiểm tra và tải lên...');
    setErrorBanner(null);

    try {
      const result = await uploadAssetFile(
        file,
        formData.category === 'weapon' ? 'weapons' : 'items',
        'PRIMARY',
        isEditing ? `Thay thế ảnh item ${formData.itemId}` : `Tạo ảnh item mới ${formData.itemId}`
      );

      setFormData((prev) => ({
        ...prev,
        primaryAssetUrl: result.publicUrl,
        inventoryAssetUrl: prev.inventoryAssetUrl || result.publicUrl,
      }));

      setUploadDimensions({ width: result.width, height: result.height });
      if (result.versions) {
        setAssetVersions(result.versions);
      }
      setUploadProgress('Tải lên thành công!');
      setTimeout(() => setUploadProgress(null), 2500);
    } catch (err: any) {
      setUploadProgress(null);
      notifyError(err.message || 'Tải ảnh thất bại.');
    }
  };

  // Handle Save
  const handleSave = async (statusOverride?: ContentStatus) => {
    if (!formData.name || formData.name.trim().length === 0) {
      notifyError('Vui lòng nhập Tên vật phẩm.');
      setActiveTab('basic');
      return;
    }
    if (!formData.primaryAssetUrl) {
      notifyError('Bắt buộc phải upload Hình Ảnh Đại Diện (Primary Image) trước khi lưu!');
      setActiveTab('assets');
      return;
    }

    try {
      const payload = {
        ...formData,
        status: statusOverride || formData.status || 'DRAFT',
      };

      if (isEditing) {
        await updateAdminItem(formData.itemId!, payload);
        notifySuccess(`Đã cập nhật vật phẩm "${formData.name}" thành công!`);
      } else {
        await createAdminItem(payload);
        notifySuccess(`Đã tạo mới vật phẩm "${formData.name}" thành công!`);
      }

      setIsModalOpen(false);
      loadItems(meta.page);
    } catch (err: any) {
      notifyError(err.message || 'Lỗi khi lưu vật phẩm.');
    }
  };

  // Duplicate Item
  const handleDuplicate = async (item: ItemEntity) => {
    try {
      const res = await duplicateAdminItem(item.itemId);
      notifySuccess(`Đã nhân bản "${item.name}" -> "${res.data.name}"!`);
      loadItems(meta.page);
    } catch (err: any) {
      notifyError(err.message || 'Không thể nhân bản.');
    }
  };

  // Archive Item
  const handleArchive = async (item: ItemEntity) => {
    try {
      await archiveAdminItem(item.itemId);
      notifySuccess(`Đã chuyển vật phẩm "${item.name}" sang lưu trữ (Archived).`);
      loadItems(meta.page);
    } catch (err: any) {
      notifyError(err.message || 'Không thể archive vật phẩm.');
    }
  };

  // Publish Item
  const handlePublish = async (item: ItemEntity) => {
    try {
      await publishAdminItem(item.itemId);
      notifySuccess(`Đã xuất bản (Publish) "${item.name}" lên Game Client!`);
      loadItems(meta.page);
    } catch (err: any) {
      notifyError(err.message || 'Không thể publish vật phẩm.');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#141722] p-6 rounded-lg border border-[#222738]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-serif tracking-wide">Item Manager</h2>
              <p className="text-xs text-slate-400">
                Quản lý vật phẩm, kho ảnh Visual Asset, thông số gameplay và đồng bộ với Game Client
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
              const a = document.createElement('a');
              a.href = dataStr;
              a.download = `elysia_items_export_${Date.now()}.json`;
              a.click();
            }}
            className="px-3.5 py-2 rounded-lg bg-[#1a202e] hover:bg-[#252d40] text-slate-300 border border-[#2a3449] text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            Export JSON
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Tạo Vật Phẩm Mới
          </button>
        </div>
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
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên vật phẩm, Item ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0e111a] border border-[#252c3d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-[#0e111a] border border-[#252c3d] text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">Tất cả Phân Loại</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Rarity Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-[#0e111a] border border-[#252c3d] text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">Tất cả Độ Hiếm</option>
              <option value="common">Common (Trắng)</option>
              <option value="uncommon">Uncommon (Lục)</option>
              <option value="rare">Rare (Lam)</option>
              <option value="epic">Epic (Tím)</option>
              <option value="legendary">Legendary (Cam)</option>
              <option value="mythic">Mythic (Đỏ)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-[#0e111a] border border-[#252c3d] text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">Tất cả Trạng Thái</option>
              <option value="DRAFT">Bản Thảo (Draft)</option>
              <option value="PUBLISHED">Đã Xuất Bản (Published)</option>
              <option value="ARCHIVED">Lưu Trữ (Archived)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="md:col-span-2 flex justify-end gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded border transition-colors ${
                viewMode === 'grid'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#0e111a] text-slate-400 border-[#252c3d] hover:text-white'
              }`}
              title="Xem dạng lưới card"
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
              title="Xem dạng bảng"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ITEMS LIST / GRID */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-[#141722] rounded-lg border border-[#222738]">
          Đang nạp danh sách vật phẩm từ database...
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-[#141722] rounded-lg border border-[#222738]">
          <Package className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">Không tìm thấy vật phẩm phù hợp</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy thử điều chỉnh bộ lọc hoặc tạo vật phẩm mới với đầy đủ ảnh đại diện.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const rarityStyle = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
            return (
              <div
                key={item.itemId}
                className={`p-4 rounded-lg bg-[#141722] border transition-all hover:border-amber-500/50 flex flex-col justify-between space-y-3 ${rarityStyle.border} shadow-lg ${rarityStyle.glow}`}
              >
                <div>
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-mono text-slate-400 uppercase">{item.category}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : item.status === 'ARCHIVED'
                          ? 'bg-slate-500/20 text-slate-400 border border-slate-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Thumbnail & Image */}
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() =>
                        item.primaryAssetUrl &&
                        setZoomedImage({ url: item.primaryAssetUrl, title: item.name })
                      }
                      className={`w-16 h-16 rounded-lg bg-[#0c0e16] border flex items-center justify-center p-1 relative overflow-hidden group cursor-pointer ${rarityStyle.border}`}
                    >
                      {item.primaryAssetUrl ? (
                        <>
                          <img
                            src={item.primaryAssetUrl}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-110 transition-transform"
                            onError={(e) => {
                              (e.target as any).style.display = 'none';
                              (e.target as any).nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden absolute inset-0 items-center justify-center text-[9px] text-rose-400 text-center p-1 bg-black/80 font-mono">
                            Missing Image
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Maximize2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        </>
                      ) : (
                        <span className="text-[9px] text-amber-400 text-center font-mono">Missing Image</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm truncate ${rarityStyle.text}`}>{item.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400 truncate">{item.itemId}</p>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>Cấp: <strong className="text-white">Lv.{item.requiredLevel}</strong></span>
                        <span>•</span>
                        <span>Max Stack: <strong className="text-white">{item.stackLimit}</strong></span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 italic">
                    {item.description || 'Không có mô tả chi tiết.'}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-[#202638] flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400">
                    Giá: <strong className="text-amber-400 font-mono">{item.buyPrice}G</strong>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded bg-[#1c2233] hover:bg-[#252e44] text-slate-300 hover:text-white"
                      title="Chỉnh sửa vật phẩm"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(item)}
                      className="p-1.5 rounded bg-[#1c2233] hover:bg-[#252e44] text-slate-300 hover:text-white"
                      title="Nhân bản (Duplicate)"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {item.status !== 'PUBLISHED' && (
                      <button
                        onClick={() => handlePublish(item)}
                        className="p-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300"
                        title="Xuất bản lên Game (Publish)"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {item.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => handleArchive(item)}
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
                <th className="py-3 px-4">Mã Item ID</th>
                <th className="py-3 px-4">Tên Vật Phẩm</th>
                <th className="py-3 px-4">Phân Loại</th>
                <th className="py-3 px-4">Độ Hiếm</th>
                <th className="py-3 px-4">Cấp Y/C</th>
                <th className="py-3 px-4">Stack</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2332]">
              {items.map((item) => {
                const rarityStyle = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
                return (
                  <tr key={item.itemId} className="hover:bg-[#181d2c] transition-colors">
                    <td className="py-2.5 px-4">
                      <div
                        onClick={() =>
                          item.primaryAssetUrl &&
                          setZoomedImage({ url: item.primaryAssetUrl, title: item.name })
                        }
                        className="w-10 h-10 rounded bg-[#0c0e16] border border-[#262f44] p-0.5 flex items-center justify-center cursor-pointer hover:border-amber-400"
                      >
                        {item.primaryAssetUrl ? (
                          <img
                            src={item.primaryAssetUrl}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[8px] text-amber-400 text-center">Missing</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">{item.itemId}</td>
                    <td className={`py-2.5 px-4 font-semibold ${rarityStyle.text}`}>{item.name}</td>
                    <td className="py-2.5 px-4 capitalize font-mono text-[11px]">{item.category}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rarityStyle.bg} ${rarityStyle.text} border ${rarityStyle.border}`}>
                        {item.rarity}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">Lv.{item.requiredLevel}</td>
                    <td className="py-2.5 px-4">{item.stackLimit}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : item.status === 'ARCHIVED'
                            ? 'bg-slate-500/20 text-slate-400'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 rounded bg-[#1e2538] hover:bg-[#28324a] text-slate-300"
                          title="Sửa"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(item)}
                          className="p-1 rounded bg-[#1e2538] hover:bg-[#28324a] text-slate-300"
                          title="Nhân bản"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {item.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handlePublish(item)}
                            className="p-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                            title="Xuất bản"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>
            Hiển thị trang {meta.page} / {meta.totalPages} (Tổng {meta.total} vật phẩm)
          </span>
          <div className="flex gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => loadItems(meta.page - 1)}
              className="px-3 py-1.5 rounded bg-[#141722] border border-[#222738] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1e2332]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => loadItems(meta.page + 1)}
              className="px-3 py-1.5 rounded bg-[#141722] border border-[#222738] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1e2332]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ZOOM IMAGE MODAL */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="p-6 rounded-xl bg-[#121622] border border-[#2a3449] max-w-lg w-full flex flex-col items-center space-y-4 shadow-2xl"
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
            <span className="text-[11px] text-slate-400 font-mono break-all">{zoomedImage.url}</span>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* ITEM CREATION / EDIT MULTI-TAB MODAL                 */}
      {/* ==================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121622] border border-[#2f3950] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 px-6 bg-[#161a29] border-b border-[#252d40] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  {isEditing ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-serif">
                    {isEditing ? `Chỉnh Sửa Vật Phẩm: ${formData.name}` : 'Tạo Vật Phẩm Mới (Item Creation)'}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">{formData.itemId}</span>
                </div>
              </div>

              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-Tabs Navigation */}
            <div className="flex border-b border-[#22293c] px-6 bg-[#10131e] gap-4">
              {[
                { id: 'basic', label: 'Tab A — Thông Tin Cơ Bản' },
                { id: 'assets', label: 'Tab B — Ảnh & Assets (*Bắt buộc)' },
                { id: 'properties', label: 'Tab C — Chỉ Số & Gameplay' },
                { id: 'economy', label: 'Tab D — Kinh Tế & Drop' },
                { id: 'preview', label: 'Tab E — Xem Trước (Preview)' },
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

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* TAB A: BASIC INFORMATION */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">
                        Mã Item ID <span className="text-amber-400">* (Duy nhất)</span>
                      </label>
                      <input
                        type="text"
                        disabled={isEditing}
                        value={formData.itemId || ''}
                        onChange={(e) => setFormData({ ...formData, itemId: e.target.value.toUpperCase() })}
                        placeholder="VD: ITEM_SWORD_STEEL_001"
                        className="w-full p-2.5 rounded-lg bg-[#0c0e16] border border-[#262f44] text-xs text-amber-300 font-mono disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">
                        Tên Vật Phẩm <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="VD: Thánh Kiếm Khởi Đầu"
                        className="w-full p-2.5 rounded-lg bg-[#0c0e16] border border-[#262f44] text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Phân Loại (Category) *</label>
                      <select
                        value={formData.category || 'equipment'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full p-2.5 rounded-lg bg-[#0c0e16] border border-[#262f44] text-xs text-white"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Độ Hiếm (Rarity)</label>
                      <select
                        value={formData.rarity || 'common'}
                        onChange={(e) => setFormData({ ...formData, rarity: e.target.value as any })}
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
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Cấp Độ Yêu Cầu (Level)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.requiredLevel || 1}
                        onChange={(e) => setFormData({ ...formData, requiredLevel: parseInt(e.target.value, 10) })}
                        className="w-full p-2.5 rounded-lg bg-[#0c0e16] border border-[#262f44] text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">Mô Tả Vật Phẩm</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Mô tả công dụng, truyền thuyết hoặc lưu ý khi sử dụng..."
                      className="w-full p-2.5 rounded-lg bg-[#0c0e16] border border-[#262f44] text-xs text-white"
                    />
                  </div>

                  {/* Class Restrictions Multi-checkbox */}
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Giới Hạn Hệ Phái (Class Restriction - Để trống nếu mọi class đều dùng được)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {ALL_CLASSES.map((cls) => {
                        const checked = formData.requiredClasses?.includes(cls.id);
                        return (
                          <label
                            key={cls.id}
                            className={`p-2 rounded border flex items-center gap-2 cursor-pointer text-xs ${
                              checked
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                : 'bg-[#0c0e16] border-[#22293c] text-slate-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const list = formData.requiredClasses || [];
                                if (e.target.checked) {
                                  setFormData({ ...formData, requiredClasses: [...list, cls.id] });
                                } else {
                                  setFormData({ ...formData, requiredClasses: list.filter((c) => c !== cls.id) });
                                }
                              }}
                              className="accent-amber-500"
                            />
                            <span>{cls.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB B: ITEM IMAGE & ASSETS (MANDATORY) */}
              {activeTab === 'assets' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300 leading-relaxed">
                      <strong>Quy tắc hệ thống ELYSIA:</strong> Mỗi vật phẩm bắt buộc phải có một hình ảnh đại diện (Primary Item Image).
                      Hỗ trợ định dạng <strong>PNG</strong> hoặc <strong>WebP</strong> (tối đa 5MB). File tải lên được lưu trữ an toàn,
                      tính toán mã băm SHA-256 chống trùng lặp và hỗ trợ lịch sử phiên bản đầy đủ.
                    </div>
                  </div>

                  {/* DROPZONE */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center space-y-3 transition-colors ${
                      dragOver
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-[#2e374d] bg-[#0c0e16] hover:border-amber-500/40'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png,image/webp"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    <div className="w-12 h-12 rounded-full bg-[#161a29] border border-[#2b3449] flex items-center justify-center text-amber-400">
                      <Upload className="w-6 h-6" />
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-semibold text-white">Kéo & Thả tệp ảnh vào đây</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">hoặc nhấn để duyệt tệp từ máy tính</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-1.5 rounded-lg bg-[#1c2233] hover:bg-[#252e44] text-amber-300 border border-[#2f3a52] text-xs font-semibold transition-all"
                    >
                      Duyệt Tệp Ảnh (PNG / WebP)
                    </button>

                    {uploadProgress && (
                      <div className="text-xs text-amber-400 font-mono animate-pulse">{uploadProgress}</div>
                    )}
                  </div>

                  {/* CURRENT PRIMARY IMAGE PREVIEW CARD */}
                  {formData.primaryAssetUrl && (
                    <div className="p-4 rounded-lg bg-[#0e111a] border border-[#252c3d] flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-24 h-24 rounded-lg bg-[#07090f] border border-[#20273a] flex items-center justify-center p-2">
                        <img
                          src={formData.primaryAssetUrl}
                          alt="Primary Preview"
                          className="max-h-full max-w-full object-contain filter drop-shadow"
                        />
                      </div>

                      <div className="flex-1 space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">Ảnh Đại Diện Hiện Tại</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Primary Image Active
                          </span>
                        </div>
                        <p className="font-mono text-[11px] text-slate-400 break-all">{formData.primaryAssetUrl}</p>
                        {uploadDimensions && (
                          <p className="text-[11px] text-amber-400 font-mono">
                            Kích thước: {uploadDimensions.width}x{uploadDimensions.height}px
                          </p>
                        )}
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1 rounded bg-[#1c2233] hover:bg-[#28324a] text-slate-300 text-[11px]"
                          >
                            Thay Thế Ảnh Mới
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, primaryAssetUrl: '' })}
                            className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px]"
                          >
                            Xóa Ảnh
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ADDITIONAL ASSETS: INVENTORY & GROUND SPRITE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-lg bg-[#0c0e16] border border-[#22293c] space-y-2">
                      <label className="text-xs font-semibold text-slate-300 block">Inventory Icon URL (Túi đồ)</label>
                      <input
                        type="text"
                        value={formData.inventoryAssetUrl || ''}
                        onChange={(e) => setFormData({ ...formData, inventoryAssetUrl: e.target.value })}
                        placeholder="Để trống sẽ tự dùng Primary Image"
                        className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-white font-mono"
                      />
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#0c0e16] border border-[#22293c] space-y-2">
                      <label className="text-xs font-semibold text-slate-300 block">Ground Drop Sprite (Rơi trên map)</label>
                      <input
                        type="text"
                        value={formData.groundAssetUrl || ''}
                        onChange={(e) => setFormData({ ...formData, groundAssetUrl: e.target.value })}
                        placeholder="VD: /assets/items/drop_sprite.png"
                        className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB C: GAMEPLAY PROPERTIES */}
              {activeTab === 'properties' && (
                <div className="space-y-4">
                  {formData.category === 'potion' || formData.category === 'consumable' ? (
                    <div className="p-4 rounded-lg bg-[#0c0e16] border border-[#22293c] space-y-3">
                      <h4 className="font-semibold text-xs text-amber-300">Thông Số Tiêu Hao (Consumable / Potion)</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">HP Hồi Phục</label>
                          <input
                            type="number"
                            value={formData.properties?.hpRestore || 0}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                properties: { ...formData.properties, hpRestore: parseInt(e.target.value, 10) },
                              })
                            }
                            className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-emerald-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">MP Hồi Phục</label>
                          <input
                            type="number"
                            value={formData.properties?.mpRestore || 0}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                properties: { ...formData.properties, mpRestore: parseInt(e.target.value, 10) },
                              })
                            }
                            className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-blue-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Hồi Chiêu (Giây)</label>
                          <input
                            type="number"
                            value={formData.properties?.cooldown || 0}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                properties: { ...formData.properties, cooldown: parseInt(e.target.value, 10) },
                              })
                            }
                            className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-[#0c0e16] border border-[#22293c] space-y-3">
                      <h4 className="font-semibold text-xs text-amber-300">Chỉ Số Trang Bị Cơ Bản</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Công Vật Lý (ATK)</label>
                          <input
                            type="number"
                            value={formData.properties?.atk || 0}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                properties: { ...formData.properties, atk: parseInt(e.target.value, 10) },
                              })
                            }
                            className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-amber-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Công Phép (MATK)</label>
                          <input
                            type="number"
                            value={formData.properties?.matk || 0}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                properties: { ...formData.properties, matk: parseInt(e.target.value, 10) },
                              })
                            }
                            className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-blue-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Chính Xác (HIT)</label>
                          <input
                            type="number"
                            value={formData.properties?.hit || 0}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                properties: { ...formData.properties, hit: parseInt(e.target.value, 10) },
                              })
                            }
                            className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Chí Mạng (Crit Rate %)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.properties?.critRate || 0}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                properties: { ...formData.properties, critRate: parseFloat(e.target.value) },
                              })
                            }
                            className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-purple-400 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB D: ECONOMY & DROP */}
              {activeTab === 'economy' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[#0c0e16] border border-[#22293c] space-y-3">
                      <h4 className="font-semibold text-xs text-amber-300">Giá Giao Dịch & NPC</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Giá Mua NPC (Gold)</label>
                          <input
                            type="number"
                            value={formData.buyPrice || 0}
                            onChange={(e) => setFormData({ ...formData, buyPrice: parseInt(e.target.value, 10) })}
                            className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-amber-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Giá Bán Lại (Gold)</label>
                          <input
                            type="number"
                            value={formData.sellPrice || 0}
                            onChange={(e) => setFormData({ ...formData, sellPrice: parseInt(e.target.value, 10) })}
                            className="w-full p-2 rounded bg-[#07090f] border border-[#202636] text-xs text-slate-300 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#0c0e16] border border-[#22293c] space-y-2">
                      <h4 className="font-semibold text-xs text-amber-300">Quyền Hạn Giao Dịch</h4>
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isTradable}
                          onChange={(e) => setFormData({ ...formData, isTradable: e.target.checked })}
                          className="accent-amber-500"
                        />
                        <span>Có thể giao dịch giữa người chơi (Tradable)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isDroppable}
                          onChange={(e) => setFormData({ ...formData, isDroppable: e.target.checked })}
                          className="accent-amber-500"
                        />
                        <span>Có thể vứt bỏ / rơi ra đất (Droppable)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isCharacterBound}
                          onChange={(e) => setFormData({ ...formData, isCharacterBound: e.target.checked })}
                          className="accent-amber-500"
                        />
                        <span>Khóa theo nhân vật (Character Bound)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB E: PREVIEW */}
              {activeTab === 'preview' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Xem trước thẻ vật phẩm & tooltip trong túi đồ MMORPG</span>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
                      className="px-3 py-1 rounded bg-[#1c2233] text-xs text-slate-300 hover:text-white border border-[#2f3a52]"
                    >
                      Chuyển nền: {previewTheme === 'dark' ? 'Nền Sáng' : 'Nền Tối'}
                    </button>
                  </div>

                  <div className={`p-8 rounded-xl flex items-center justify-center transition-colors ${previewTheme === 'dark' ? 'bg-[#0a0d16]' : 'bg-[#e2e8f0]'}`}>
                    {/* MMORPG ITEM TOOLTIP CARD */}
                    <div className="w-80 rounded-xl bg-[#121624] border border-[#2e3a54] p-4 text-white shadow-2xl space-y-3">
                      <div className="flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-lg bg-[#07090f] border border-amber-500/40 p-1 flex items-center justify-center">
                          {formData.primaryAssetUrl ? (
                            <img src={formData.primaryAssetUrl} alt="Preview" className="max-h-full max-w-full object-contain filter drop-shadow" />
                          ) : (
                            <span className="text-[9px] text-amber-400">No Image</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-amber-300 leading-tight">{formData.name || 'Tên Vật Phẩm'}</h4>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">{formData.rarity} {formData.category}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-[#0a0d14] text-[11px] space-y-1 font-mono">
                        <div className="flex justify-between text-slate-400">
                          <span>Cấp yêu cầu:</span>
                          <span className="text-white font-bold">Lv.{formData.requiredLevel}</span>
                        </div>
                        {formData.properties?.atk && (
                          <div className="flex justify-between text-amber-400">
                            <span>Công vật lý:</span>
                            <span>+{formData.properties.atk} ATK</span>
                          </div>
                        )}
                        {formData.properties?.matk && (
                          <div className="flex justify-between text-blue-400">
                            <span>Công phép:</span>
                            <span>+{formData.properties.matk} MATK</span>
                          </div>
                        )}
                        {formData.properties?.hpRestore && (
                          <div className="flex justify-between text-emerald-400">
                            <span>Hồi máu:</span>
                            <span>+{formData.properties.hpRestore} HP</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        {formData.description || 'Không có mô tả chi tiết.'}
                      </p>

                      <div className="flex justify-between text-[10px] text-slate-400 pt-2 border-t border-[#1e2536]">
                        <span>Giá bán: {formData.buyPrice} Gold</span>
                        <span>{formData.isTradable ? 'Có thể giao dịch' : 'Không thể giao dịch'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
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
                  {isEditing ? 'Cập Nhật & Publish' : 'Tạo & Xuất Bản Ngay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
