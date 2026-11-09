import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Shield,
  Sword,
  Sparkles,
  Map as MapIcon,
  FolderOpen,
  FlaskConical,
  Activity,
  Database,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Sliders,
  UserPlus,
  Scale,
  Package,
} from 'lucide-react';
import { HealthResponse, CharacterEntity, PrimaryAttributes } from '@elysia/game-types';
import { fetchHealth, fetchCharacters } from './services/apiClient';
import {
  INITIAL_CLASSES,
  INITIAL_SKILLS,
  INITIAL_ITEMS,
  INITIAL_MONSTERS,
  STAT_ALLOCATION_RULES,
} from '@elysia/game-data-schema';
import { validateStatAllocation } from '@elysia/validation';
import { NoviceCharacterStudio } from './components/NoviceCharacterStudio';
import { CharacterAssetCreator } from './components/CharacterAssetCreator';
import { SkillVfxManager } from './components/SkillVfxManager';
import { ItemManager } from './components/ItemManager';
import { WeaponManager } from './components/WeaponManager';

export function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'characters' | 'classes' | 'skills' | 'monsters' | 'items' | 'weapons' | 'testlab'>('dashboard');
  const [activeMasterChar, setActiveMasterChar] = useState<'novice_female' | 'swordsman_female'>('novice_female');
  const [isCreatingAsset, setIsCreatingAsset] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [characters, setCharacters] = useState<CharacterEntity[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Anti-stacking simulation in admin (Starter Novice range: 8 - 15 pts)
  const [simStats, setSimStats] = useState<PrimaryAttributes>({
    str: 14,
    dex: 12,
    agi: 10,
    int: 9,
    con: 13,
  });

  const refreshHealth = async () => {
    setIsRefreshing(true);
    const data = await fetchHealth();
    setHealth(data);
    const charsData = await fetchCharacters();
    if (charsData?.data) {
      setCharacters(charsData.data);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
          </span>
        );
      case 'degraded':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Degraded
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Offline
          </span>
        );
    }
  };

  // Sim validation
  const simValidation = validateStatAllocation(simStats);
  const simSum = simStats.str + simStats.dex + simStats.agi + simStats.int + simStats.con;
  const simMax = Math.max(simStats.str, simStats.dex, simStats.agi, simStats.int, simStats.con);
  const simSorted = [simStats.str, simStats.dex, simStats.agi, simStats.int, simStats.con].sort((a, b) => b - a);
  const simTop2 = simSorted[0] + simSorted[1];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c0e14] text-slate-200">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#12151e] border-r border-[#202533] flex flex-col justify-between select-none">
        <div>
          {/* Logo */}
          <div className="p-5 border-b border-[#202533] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-black shadow-lg shadow-amber-500/20">
              EL
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white uppercase font-serif">Elysia Studio</h1>
              <p className="text-[11px] text-amber-500/80 tracking-wider">MMORPG ADMIN v1.0</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'characters', label: 'Character Manager', icon: Users },
              { id: 'classes', label: 'Class Manager', icon: Shield },
              { id: 'skills', label: 'Skill & VFX Manager', icon: Zap },
              { id: 'monsters', label: 'Monster Manager', icon: Sparkles },
              { id: 'items', label: 'Item Manager', icon: Package },
              { id: 'weapons', label: 'Weapon Manager', icon: Sword },
              { id: 'testlab', label: 'Game Test Lab', icon: FlaskConical },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1e2b]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Telemetry Status Bar */}
        <div className="p-4 border-t border-[#202533] bg-[#0f1118]/60 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Server className="w-3.5 h-3.5 text-blue-400" /> Backend API
            </span>
            {getStatusBadge(health?.services.server.status)}
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> PostgreSQL
            </span>
            {getStatusBadge(health?.services.database.status)}
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Redis Cache
            </span>
            {getStatusBadge(health?.services.redis.status)}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-14 border-b border-[#202533] bg-[#12151e]/80 backdrop-blur px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Active Scope</span>
            <span className="text-xs bg-[#1d2230] text-slate-300 px-2.5 py-1 rounded border border-[#2d3448]">
              Authoritative Master Runtime (Phase 1)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={refreshHealth}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded bg-[#1a1e2b] border border-[#2a3044] hover:bg-[#23293a] transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              Refresh Telemetry
            </button>
            <div className="text-right">
              <div className="text-xs font-semibold text-white">System Admin</div>
              <div className="text-[10px] text-emerald-400">Root Access (SuperAdmin)</div>
            </div>
          </div>
        </header>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="p-5 rounded-lg bg-[#141722] border border-[#222738] relative overflow-hidden">
                  <div className="text-xs text-slate-400 font-medium">Master Classes</div>
                  <div className="text-2xl font-bold text-white mt-1">{INITIAL_CLASSES.length}</div>
                  <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> All {INITIAL_CLASSES.length} Classes
                  </div>
                </div>

                <div
                  onClick={() => setCurrentTab('skills')}
                  className="p-5 rounded-lg bg-[#141722] border border-amber-500/40 relative overflow-hidden cursor-pointer hover:bg-[#181d2c] transition-all shadow-md shadow-amber-500/5 group"
                >
                  <div className="text-xs text-amber-400 font-semibold flex items-center justify-between">
                    <span>Skills & 256px VFX</span>
                    <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-1">{INITIAL_SKILLS.length}</div>
                  <div className="text-[11px] text-amber-300 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Full HD 256px Sheets
                  </div>
                </div>

                <div className="p-5 rounded-lg bg-[#141722] border border-[#222738]">
                  <div className="text-xs text-slate-400 font-medium">Items & Equipment</div>
                  <div className="text-2xl font-bold text-white mt-1">{INITIAL_ITEMS.length}</div>
                  <div className="text-[11px] text-blue-400 mt-2">Authoritative templates</div>
                </div>

                <div className="p-5 rounded-lg bg-[#141722] border border-[#222738]">
                  <div className="text-xs text-slate-400 font-medium">Active Characters</div>
                  <div className="text-2xl font-bold text-white mt-1">{characters.length}</div>
                  <div className="text-[11px] text-amber-400 mt-2">Registered characters</div>
                </div>

                <div className="p-5 rounded-lg bg-[#141722] border border-[#222738]">
                  <div className="text-xs text-slate-400 font-medium">Server Uptime</div>
                  <div className="text-2xl font-bold text-white mt-1">{health?.uptimeSeconds ?? 0}s</div>
                  <div className="text-[11px] text-purple-400 mt-2">Uptime telemetry active</div>
                </div>
              </div>

              {/* Service Health Diagnostic Box */}
              <div className="p-6 rounded-lg bg-[#141722] border border-[#222738] space-y-4">
                <div className="flex items-center justify-between border-b border-[#222738] pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <h3 className="font-semibold text-sm text-white">System Infrastructure Health Matrix</h3>
                  </div>
                  <span className="text-xs text-slate-400">REST: /api/v1/health</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-md bg-[#0f1118] border border-[#202533] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-xs text-slate-300">NestJS Core Gateway</span>
                      {getStatusBadge(health?.services.server.status)}
                    </div>
                    <p className="text-xs text-slate-400">{health?.services.server.message || 'Connecting...'}</p>
                  </div>

                  <div className="p-4 rounded-md bg-[#0f1118] border border-[#202533] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-xs text-slate-300">PostgreSQL Authoritative DB</span>
                      {getStatusBadge(health?.services.database.status)}
                    </div>
                    <p className="text-xs text-slate-400">{health?.services.database.message || 'Connecting...'}</p>
                    {health?.services.database.latencyMs !== undefined && (
                      <span className="text-[10px] text-emerald-400">Latency: {health.services.database.latencyMs}ms</span>
                    )}
                  </div>

                  <div className="p-4 rounded-md bg-[#0f1118] border border-[#202533] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-xs text-slate-300">Redis In-Memory State</span>
                      {getStatusBadge(health?.services.redis.status)}
                    </div>
                    <p className="text-xs text-slate-400">{health?.services.redis.message || 'Connecting...'}</p>
                    {health?.services.redis.latencyMs !== undefined && (
                      <span className="text-[10px] text-emerald-400">Latency: {health.services.redis.latencyMs}ms</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'characters' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Character & Template Manager</h2>
                  <p className="text-xs text-slate-400">Master 2D Anime Chibi Models, Modular Element Layers & Active Characters</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsCreatingAsset(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md shadow-amber-500/20 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> + Tạo Asset Nhân Vật Mới
                  </button>

                  {/* Character Model Switcher */}
                  <div className="flex p-1 rounded-lg bg-[#141722] border border-[#222738] gap-1">
                    <button
                      onClick={() => { setActiveMasterChar('novice_female'); setIsCreatingAsset(false); }}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        activeMasterChar === 'novice_female' && !isCreatingAsset
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ✨ Nữ Tân Thủ
                    </button>
                    <button
                      onClick={() => { setActiveMasterChar('swordsman_female'); setIsCreatingAsset(false); }}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        activeMasterChar === 'swordsman_female' && !isCreatingAsset
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Kiếm Sĩ Nữ
                    </button>
                  </div>
                </div>
              </div>

              {isCreatingAsset ? (
                <CharacterAssetCreator
                  onSuccess={() => {
                    setIsCreatingAsset(false);
                    refreshHealth();
                  }}
                  onCancel={() => setIsCreatingAsset(false)}
                />
              ) : activeMasterChar === 'novice_female' ? (
                <NoviceCharacterStudio />
              ) : (
                /* Master Character Card - Swordsman */
                <div className="p-6 rounded-lg bg-[#141722] border border-amber-500/30 flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-56 h-56 rounded-lg bg-[#0e1017] border border-[#2a3044] flex items-center justify-center p-3 relative overflow-hidden">
                    <img
                      src="/assets/characters/female/swordsman/swordsman_female_idle_front.png"
                      alt="ELYSIA_PLAYER_F001"
                      className="max-h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                      onError={(e) => {
                        (e.target as any).src = 'https://placehold.co/256x256/1c2030/d4af37?text=ELYSIA_PLAYER_F001';
                      }}
                    />
                    <span className="absolute bottom-2 right-2 text-[10px] bg-black/70 px-1.5 py-0.5 rounded text-amber-400 font-mono">
                      256x256
                    </span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ELYSIA_PLAYER_F001
                      </span>
                      <h3 className="font-bold text-base text-white">Master Female Swordswoman (Chibi Base)</h3>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Gold master character reference for Elysia no Densetsu. 2.8 heads tall Japanese JRPG Chibi proportion with
                      long black hair, sapphire blue eyes, white/silver breastplate with eagle crest, deep navy tunic & cape, and
                      single-handed fantasy sword in right hand.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
                      <div className="p-2.5 rounded bg-[#0f1118] border border-[#222738]">
                        <span className="text-slate-400 block text-[10px]">Head Ratio</span>
                        <span className="font-semibold text-white">2.8 Heads Tall</span>
                      </div>
                      <div className="p-2.5 rounded bg-[#0f1118] border border-[#222738]">
                        <span className="text-slate-400 block text-[10px]">Alignment Axis</span>
                        <span className="font-semibold text-white">Spine at X: 128</span>
                      </div>
                      <div className="p-2.5 rounded bg-[#0f1118] border border-[#222738]">
                        <span className="text-slate-400 block text-[10px]">Ground Baseline</span>
                        <span className="font-semibold text-white">Boots at Y: 238</span>
                      </div>
                      <div className="p-2.5 rounded bg-[#0f1118] border border-[#222738]">
                        <span className="text-slate-400 block text-[10px]">Pipeline Ready</span>
                        <span className="font-semibold text-emerald-400">Spine 2D / 8-Dir</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Anti-Stacking & Stat Balancing Rule Engine */}
              <div className="p-6 rounded-lg bg-[#141722] border border-[#222738] space-y-4">
                <div className="flex items-center justify-between border-b border-[#222738] pb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <h3 className="font-semibold text-sm text-white">Anti-Stat Stacking Policy Simulator</h3>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border ${simValidation.isValid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                    {simValidation.isValid ? '✓ Allocation Valid' : '⚠ Cap Violation'}
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Quy tắc tân thủ: Mỗi chỉ số dao động từ <strong>8 đến 15 điểm gốc</strong>. Chống dồn điểm: Chỉ số đơn lẻ không quá <strong>40%</strong>, top 2 kết hợp không quá <strong>65%</strong>.
                </p>

                {/* Stat Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                  {(['str', 'dex', 'agi', 'int', 'con'] as (keyof PrimaryAttributes)[]).map((stat) => (
                    <div key={stat} className="p-3 rounded bg-[#0f1118] border border-[#222738] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="uppercase font-bold text-slate-300">{stat}</span>
                        <span className="text-amber-400 font-mono">{simStats[stat]}</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="15"
                        value={simStats[stat]}
                        onChange={(e) => setSimStats({ ...simStats, [stat]: parseInt(e.target.value, 10) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 text-slate-400">
                  <div>Tổng điểm: <strong className="text-white">{simSum} pts</strong></div>
                  <div>Chỉ số cao nhất: <strong className="text-white">{Math.round((simMax / simSum) * 100)}%</strong> (Limit: 40%)</div>
                  <div>Top 2 chỉ số: <strong className="text-white">{Math.round((simTop2 / simSum) * 100)}%</strong> (Limit: 65%)</div>
                </div>

                {!simValidation.isValid && (
                  <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {simValidation.errors.join(' | ')}
                  </div>
                )}
              </div>

              {/* Registered Characters Table */}
              <div className="p-6 rounded-lg bg-[#141722] border border-[#222738] space-y-4">
                <div className="flex items-center justify-between border-b border-[#222738] pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <h3 className="font-semibold text-sm text-white">Registered Player Characters ({characters.length})</h3>
                  </div>
                  <span className="text-xs text-slate-400">API: /api/v1/characters</span>
                </div>

                {characters.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Chưa có nhân vật nào được lưu trong cơ sở dữ liệu.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="text-[11px] uppercase bg-[#0f1118] text-slate-400 border-b border-[#222738]">
                        <tr>
                          <th className="py-2.5 px-3">Tên Nhân Vật</th>
                          <th className="py-2.5 px-3">Giới Tính</th>
                          <th className="py-2.5 px-3">Class</th>
                          <th className="py-2.5 px-3">Cấp Độ</th>
                          <th className="py-2.5 px-3">Vị Trí</th>
                          <th className="py-2.5 px-3">STR/DEX/AGI/INT/CON</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2332]">
                        {characters.map((char) => (
                          <tr key={char.id} className="hover:bg-[#181d2c] transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-amber-300">{char.name}</td>
                            <td className="py-2.5 px-3 capitalize">{char.gender}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-300 uppercase">{char.classId}</td>
                            <td className="py-2.5 px-3">Lv.{char.level}</td>
                            <td className="py-2.5 px-3 text-slate-400">({char.x}, {char.y})</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-blue-400">
                              {char.stats ? `${char.stats.str}/${char.stats.dex}/${char.stats.agi}/${char.stats.int}/${char.stats.con}` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentTab === 'classes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{INITIAL_CLASSES.length} Master Classes</h2>
                  <p className="text-xs text-slate-400">Các hệ phái với trang bị và bộ kỹ năng VFX 256px khởi đầu tương ứng</p>
                </div>
                <button
                  onClick={() => setCurrentTab('skills')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" /> Quản Lý Tất Cả Kỹ Năng & VFX
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INITIAL_CLASSES.map((cls) => (
                  <div key={cls.id} className="p-4 rounded-lg bg-[#141722] border border-[#222738] space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-amber-300">{cls.name}</h4>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1e2332] text-slate-300">
                        {cls.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{cls.description}</p>
                    <div className="text-xs text-slate-300">
                      <span className="text-slate-500">Vũ khí cho phép: </span>
                      <span className="text-slate-200">{cls.allowedWeapons.join(', ')}</span>
                    </div>

                    {/* Starting Skills & 256px VFX */}
                    <div className="pt-2 border-t border-[#1e2332]">
                      <span className="text-[11px] text-slate-400 block mb-2 font-medium">Kỹ năng khởi đầu & Hiệu ứng 256px:</span>
                      <div className="flex flex-wrap gap-2">
                        {cls.startingSkills.map((skillId) => {
                          const sk = INITIAL_SKILLS.find((s) => s.id === skillId);
                          return (
                            <div
                              key={skillId}
                              onClick={() => setCurrentTab('skills')}
                              className="flex items-center gap-2 p-1.5 px-2.5 rounded bg-[#0d1017] border border-[#252c3d] hover:border-amber-500/50 cursor-pointer transition-all text-xs"
                            >
                              {sk && (
                                <img
                                  src={sk.vfx.thumbnail}
                                  alt={sk.name}
                                  className="w-5 h-5 object-contain rounded bg-[#07090f] p-0.5 border border-[#1e2332]"
                                  onError={(e) => {
                                    (e.target as any).src = sk?.vfx.spriteSheet;
                                  }}
                                />
                              )}
                              <div>
                                <span className="text-amber-300 font-semibold block leading-tight">{sk ? sk.nameVi : skillId}</span>
                                <span className="text-[10px] text-slate-400 font-mono">[{sk ? sk.vfx.key : 'vfx'}]</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'skills' && <SkillVfxManager />}

          {currentTab === 'monsters' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Monsters & Bosses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INITIAL_MONSTERS.map((mon) => (
                  <div key={mon.id} className="p-4 rounded-lg bg-[#141722] border border-[#222738] space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-amber-300">{mon.name}</h4>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1e2332] text-slate-300">
                        {mon.id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      <div>Level: {mon.level} | Race: {mon.race} | Element: {mon.element}</div>
                      <div>HP: {mon.stats.hp} | ATK: {mon.stats.atk} | DEF: {mon.stats.def}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'items' && <ItemManager />}

          {currentTab === 'weapons' && <WeaponManager />}

          {currentTab === 'testlab' && (
            <div className="p-8 rounded-lg bg-[#141722] border border-[#222738] text-center space-y-4">
              <FlaskConical className="w-12 h-12 text-amber-400 mx-auto" />
              <h2 className="text-lg font-bold text-white">Isolated Game Test Lab</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Simulation environment for verifying combat damage formulas, monster AI behaviors, drop tables, and level progression
                without impacting production player records.
              </p>
              <div className="inline-block text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                Formula Engine Active: @elysia/game-formulas
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
