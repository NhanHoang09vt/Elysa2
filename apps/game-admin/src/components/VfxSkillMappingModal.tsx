import React, { useState } from 'react';
import {
  Settings,
  Save,
  X,
  Zap,
  Target,
  Clock,
  Layers,
  Sparkles,
  Shield,
  Activity,
} from 'lucide-react';
import {
  VFXSkillConfig,
  VFXType,
  VFXRegistry,
  VFXPaletteConfig,
} from '@elysia/vfx-engine';

export function VfxSkillMappingModal({
  effectKey,
  existingConfig,
  palette,
  scale,
  onSave,
  onClose,
}: {
  effectKey: string;
  existingConfig?: VFXSkillConfig;
  palette?: VFXPaletteConfig;
  scale?: number;
  onSave: (config: VFXSkillConfig) => void;
  onClose: () => void;
}) {
  const [skillId, setSkillId] = useState(existingConfig?.skill_id || `skill_${effectKey.replace('vfx_', '')}`);
  const [name, setName] = useState(existingConfig?.name || 'Custom Combat Skill');
  const [nameVi, setNameVi] = useState(existingConfig?.name_vi || 'Kỹ Năng Chiến Đấu');
  const [category, setCategory] = useState(existingConfig?.category || 'melee');
  const [vfxType, setVfxType] = useState<VFXType>(existingConfig?.type || 'slash');
  const [castDuration, setCastDuration] = useState(existingConfig?.cast_duration || 0.3);
  const [projectileSpeed, setProjectileSpeed] = useState(existingConfig?.projectile_speed || 500);
  const [explosionRadius, setExplosionRadius] = useState(existingConfig?.explosion_radius || 90);
  const [knockback, setKnockback] = useState(existingConfig?.animation_sync?.knockbackDistance || 35);
  const [hitStopFrames, setHitStopFrames] = useState(existingConfig?.animation_sync?.hitStopFrames || 3);
  const [cooldown, setCooldown] = useState(existingConfig?.cooldown || 4.0);
  const [impactEffect, setImpactEffect] = useState(existingConfig?.impact_effect || 'vfx_impacts_hit_spark');
  const [trailEffect, setTrailEffect] = useState(existingConfig?.trail_effect || 'vfx_projectiles_bullet_tracer');

  const handleSave = () => {
    const config: VFXSkillConfig = {
      skill_id: skillId,
      effect_id: effectKey,
      name,
      name_vi: nameVi,
      category,
      type: vfxType,
      cast_duration: castDuration,
      projectile_speed: vfxType === 'projectile' ? projectileSpeed : undefined,
      explosion_radius: explosionRadius,
      effect_scale: scale || 1.0,
      palette,
      cooldown,
      impact_effect: impactEffect,
      trail_effect: vfxType === 'projectile' ? trailEffect : undefined,
      animation_sync: {
        characterFrame: 2,
        hitStopFrames,
        knockbackDistance: knockback,
        screenShake: { intensity: 5, duration: 0.2 },
      },
    };

    // Register into registry
    VFXRegistry.getInstance().registerSkillConfig(config);
    onSave(config);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-[#10141f] border border-[#2b354d] rounded-xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="p-4 px-6 bg-[#161a28] border-b border-[#232a3d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Thiết Lập Liên Kết Kỹ Năng & VFX</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#20273a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Linked VFX Key Display */}
          <div className="p-3 rounded-lg bg-[#0d1017] border border-[#202638] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Hiệu Ứng VFX Gốc</span>
              <strong className="text-amber-300 font-mono text-sm">{effectKey}</strong>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              256x256 Full HD
            </span>
          </div>

          {/* Skill IDs and Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Mã Định Danh Kỹ Năng (Skill ID)</label>
              <input
                type="text"
                value={skillId}
                onChange={(e) => setSkillId(e.target.value)}
                className="w-full bg-[#161a26] border border-[#262f44] rounded-lg px-3 py-2 text-white font-mono focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Thể Loại VFX (VFX Type)</label>
              <select
                value={vfxType}
                onChange={(e) => setVfxType(e.target.value as VFXType)}
                className="w-full bg-[#161a26] border border-[#262f44] rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
              >
                <option value="slash">⚔️ Cận Chiến & Trảm Kích (Slash)</option>
                <option value="projectile">🏹 Đạn Đạo & Bắn Xa (Projectile)</option>
                <option value="beam">⚡ Chùm Tia Năng Lượng (Beam)</option>
                <option value="explosion">💥 Bộc Phá Diện Rộng (Explosion)</option>
                <option value="impact">🎯 Va Đập & Đòn Trúng (Impact)</option>
                <option value="aura">🛡️ Hộ Thuẫn & Hào Quang (Aura)</option>
                <option value="buff">✨ Tăng Lực & Phước Lành (Buff)</option>
                <option value="debuff">🌀 Trạng Thái Bất Lợi (Debuff)</option>
                <option value="summon">💫 Pháp Trận Triệu Hồi (Summon)</option>
                <option value="ultimate">👑 Tuyệt Kỹ Tối Thượng (Ultimate)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Tên Tiếng Anh</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#161a26] border border-[#262f44] rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Tên Tiếng Việt Hiển Thị</label>
              <input
                type="text"
                value={nameVi}
                onChange={(e) => setNameVi(e.target.value)}
                className="w-full bg-[#161a26] border border-[#262f44] rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Combat Synchronization Parameters */}
          <div className="p-3.5 rounded-lg bg-[#0e121c] border border-[#22283a] space-y-3">
            <span className="text-[11px] font-bold text-amber-300 uppercase block tracking-wider">
              Đồng Bộ Tác Chiến (Combat Synchronization)
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block text-[10px] mb-1">Vận Chiêu (s)</label>
                <input
                  type="number"
                  step={0.1}
                  value={castDuration}
                  onChange={(e) => setCastDuration(Number(e.target.value))}
                  className="w-full bg-[#161a26] border border-[#262f44] rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block text-[10px] mb-1">Hồi Chiêu (s)</label>
                <input
                  type="number"
                  step={0.5}
                  value={cooldown}
                  onChange={(e) => setCooldown(Number(e.target.value))}
                  className="w-full bg-[#161a26] border border-[#262f44] rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block text-[10px] mb-1">Hit-Stop (Frames)</label>
                <input
                  type="number"
                  value={hitStopFrames}
                  onChange={(e) => setHitStopFrames(Number(e.target.value))}
                  className="w-full bg-[#161a26] border border-[#262f44] rounded px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block text-[10px] mb-1">Đẩy Lùi (Knockback px)</label>
                <input
                  type="number"
                  value={knockback}
                  onChange={(e) => setKnockback(Number(e.target.value))}
                  className="w-full bg-[#161a26] border border-[#262f44] rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block text-[10px] mb-1">Phạm Vi Nổ (Radius px)</label>
                <input
                  type="number"
                  value={explosionRadius}
                  onChange={(e) => setExplosionRadius(Number(e.target.value))}
                  className="w-full bg-[#161a26] border border-[#262f44] rounded px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            {vfxType === 'projectile' && (
              <div className="pt-2 border-t border-[#1c2233]">
                <label className="text-slate-400 block text-[10px] mb-1">Tốc Độ Bay Đạn Đạo (px/s)</label>
                <input
                  type="number"
                  step={20}
                  value={projectileSpeed}
                  onChange={(e) => setProjectileSpeed(Number(e.target.value))}
                  className="w-full bg-[#161a26] border border-[#262f44] rounded px-2.5 py-1.5 text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 px-6 bg-[#161a28] border-t border-[#232a3d] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1f2638] hover:bg-[#28324a] text-slate-300 font-semibold transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all"
          >
            <Save className="w-4 h-4" /> Lưu Thiết Lập Kỹ Năng
          </button>
        </div>
      </div>
    </div>
  );
}
