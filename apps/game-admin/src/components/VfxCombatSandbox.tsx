import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Zap,
  Shield,
  Flame,
  Swords,
  Crosshair,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { VFXSkillConfig, VFXPaletteConfig } from '@elysia/vfx-engine';

export interface SampleMonster {
  id: string;
  name: string;
  nameVi: string;
  level: number;
  hp: number;
  maxHp: number;
  color: string;
  size: number;
  isBoss?: boolean;
}

export const SAMPLE_MONSTERS: SampleMonster[] = [
  {
    id: 'monster_slime',
    name: 'Green Grass Slime',
    nameVi: 'Thảo Nguyên Slime',
    level: 5,
    hp: 450,
    maxHp: 450,
    color: '#22c55e',
    size: 42,
  },
  {
    id: 'monster_goblin',
    name: 'Goblin Armored Warrior',
    nameVi: 'Goblin Thiết Giáp',
    level: 25,
    hp: 1600,
    maxHp: 1600,
    color: '#eab308',
    size: 54,
  },
  {
    id: 'monster_dragon',
    name: 'Abyssal Dark Dragon (Boss)',
    nameVi: 'Hắc Long Ma Vương (Boss)',
    level: 85,
    hp: 8500,
    maxHp: 8500,
    color: '#a855f7',
    size: 78,
    isBoss: true,
  },
];

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
}

export function VfxCombatSandbox({
  effectKey,
  skillConfig,
  palette,
  scale = 1.0,
  speed = 1.0,
  onTriggerCast,
}: {
  effectKey: string;
  skillConfig?: VFXSkillConfig;
  palette?: VFXPaletteConfig;
  scale?: number;
  speed?: number;
  onTriggerCast?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedMonsterId, setSelectedMonsterId] = useState<string>('monster_slime');
  const [monsters, setMonsters] = useState<SampleMonster[]>(SAMPLE_MONSTERS);
  const [isAutoAttack, setIsAutoAttack] = useState<boolean>(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);

  // Simulation internal state
  const monsterRef = useRef<SampleMonster>(SAMPLE_MONSTERS[0]);
  const currentMonster = monsters.find((m) => m.id === selectedMonsterId) || monsters[0];
  useEffect(() => {
    monsterRef.current = currentMonster;
  }, [currentMonster]);

  // Projectile & impact animation state
  const animStateRef = useRef<{
    projectile?: { x: number; y: number; startX: number; startY: number; targetX: number; targetY: number; progress: number };
    impact?: { x: number; y: number; frame: number; maxFrames: number };
    hitStop: number;
    knockback: number;
    floatingTexts: FloatingText[];
  }>({
    hitStop: 0,
    knockback: 0,
    floatingTexts: [],
  });

  // Load sprite sheet
  const spriteImgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = `/assets/vfx/${effectKey}.png`;
    img.onload = () => {
      spriteImgRef.current = img;
    };
  }, [effectKey]);

  // Execute an attack on the monster
  const executeAttack = () => {
    const target = monsterRef.current;
    if (target.hp <= 0) return;

    if (onTriggerCast) onTriggerCast();

    const isCrit = Math.random() < 0.35;
    const baseDamage = 180 + Math.floor(Math.random() * 90);
    const damage = isCrit ? Math.floor(baseDamage * 1.8) : baseDamage;

    const skillType = skillConfig?.type || 'slash';

    if (skillType === 'projectile') {
      // Spawn flying projectile from player to monster
      animStateRef.current.projectile = {
        startX: 70,
        startY: 150,
        x: 70,
        y: 150,
        targetX: 250,
        targetY: 150,
        progress: 0,
      };
    } else {
      // Immediate impact on monster
      applyHitToMonster(damage, isCrit);
    }
  };

  const applyHitToMonster = (damage: number, isCrit: boolean) => {
    const target = monsterRef.current;

    // Hit-stop freeze
    animStateRef.current.hitStop = 4;
    // Knockback
    animStateRef.current.knockback = 20;

    // Spawn impact
    animStateRef.current.impact = {
      x: 250,
      y: 150,
      frame: 0,
      maxFrames: 18,
    };

    // Spawn floating damage text
    const textId = Date.now() + Math.random();
    animStateRef.current.floatingTexts.push({
      id: textId,
      text: isCrit ? `CRIT! -${damage}` : `-${damage}`,
      x: 250 + (Math.random() - 0.5) * 20,
      y: 110,
      color: isCrit ? '#facc15' : '#f87171',
      alpha: 1.0,
      scale: isCrit ? 1.4 : 1.1,
    });

    // Update HP
    setMonsters((prev) =>
      prev.map((m) => {
        if (m.id === target.id) {
          const newHp = Math.max(0, m.hp - damage);
          return { ...m, hp: newHp };
        }
        return m;
      })
    );

    // Combat Log
    const logEntry = isCrit
      ? `💥 [BẠO KÍCH] Gây ${damage} sát thương lên ${target.nameVi}!`
      : `⚔️ Đòn đánh trúng ${target.nameVi}: -${damage} HP`;
    setCombatLog((prev) => [logEntry, ...prev.slice(0, 5)]);

    // Check monster death
    if (target.hp - damage <= 0) {
      setCombatLog((prev) => [
        `☠️ ${target.nameVi} đã gục ngã! Kích hoạt hiệu ứng Disintegrate...`,
        ...prev.slice(0, 5),
      ]);
    }
  };

  // Reset Monster HP
  const resetMonsterHp = () => {
    setMonsters((prev) =>
      prev.map((m) => (m.id === selectedMonsterId ? { ...m, hp: m.maxHp } : m))
    );
  };

  // Auto attack interval
  useEffect(() => {
    if (!isAutoAttack) return;
    const interval = setInterval(() => {
      executeAttack();
    }, 1200 / (speed || 1.0));
    return () => clearInterval(interval);
  }, [isAutoAttack, speed, selectedMonsterId]);

  // Main canvas animation loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // 1. Draw Arena Background
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Ground stone tiles
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
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

          // Arena boundary circle
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(170, 165, 140, 50, 0, 0, Math.PI * 2);
          ctx.stroke();

          // 2. Draw Player Avatar (Left)
          const playerX = 70;
          const playerY = 150;
          // Player shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.beginPath();
          ctx.ellipse(playerX, playerY + 20, 20, 7, 0, 0, Math.PI * 2);
          ctx.fill();

          // Player chibi placeholder
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(playerX, playerY - 10, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(playerX - 10, playerY + 4, 20, 16);

          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Player (Lv.50)', playerX, playerY - 30);

          // 3. Draw Monster (Right)
          const st = animStateRef.current;
          let monsterX = 250;
          const monsterY = 150;

          // Apply knockback recovery
          if (st.knockback > 0) {
            monsterX += st.knockback;
            st.knockback = Math.max(0, st.knockback - dt * 90);
          }

          // Hit stop handling
          const isHitFlashing = st.hitStop > 0;
          if (st.hitStop > 0) {
            st.hitStop--;
          }

          const target = monsterRef.current;
          const isDead = target.hp <= 0;

          // Monster shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.beginPath();
          ctx.ellipse(monsterX, monsterY + target.size * 0.4, target.size * 0.5, 9, 0, 0, Math.PI * 2);
          ctx.fill();

          if (!isDead) {
            // Draw monster body
            ctx.fillStyle = isHitFlashing ? '#ffffff' : target.color;
            ctx.beginPath();
            if (target.isBoss) {
              // Dragon boss triangle/spikes
              ctx.moveTo(monsterX, monsterY - target.size * 0.7);
              ctx.lineTo(monsterX - target.size * 0.6, monsterY + target.size * 0.3);
              ctx.lineTo(monsterX + target.size * 0.6, monsterY + target.size * 0.3);
            } else {
              // Cute chibi slime / goblin circle
              ctx.arc(monsterX, monsterY, target.size * 0.45, 0, Math.PI * 2);
            }
            ctx.fill();

            // Monster eyes
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(monsterX - 8, monsterY - 4, 3, 0, Math.PI * 2);
            ctx.arc(monsterX + 8, monsterY - 4, 3, 0, Math.PI * 2);
            ctx.fill();

            // Monster Name & Health Bar
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${target.nameVi} [Lv.${target.level}]`, monsterX, monsterY - target.size * 0.65);

            // HP Bar Background
            const barW = 70;
            const barH = 6;
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(monsterX - barW / 2, monsterY - target.size * 0.55, barW, barH);

            // HP Fill
            const hpRatio = Math.max(0, target.hp / target.maxHp);
            ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.2 ? '#f59e0b' : '#ef4444';
            ctx.fillRect(monsterX - barW / 2, monsterY - target.size * 0.55, barW * hpRatio, barH);
            ctx.strokeStyle = '#000000';
            ctx.strokeRect(monsterX - barW / 2, monsterY - target.size * 0.55, barW, barH);

            // HP Text
            ctx.fillStyle = '#ffffff';
            ctx.font = '8px monospace';
            ctx.fillText(`${target.hp}/${target.maxHp}`, monsterX, monsterY - target.size * 0.55 + 5);
          } else {
            // Dead Monster Disintegrate text
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'italic 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('☠️ [TỬ TRẬN - HỒI SINH TRONG 3S]', monsterX, monsterY);
          }

          // 4. Update and Draw Projectile
          if (st.projectile) {
            const p = st.projectile;
            p.progress += dt * 3.5 * (speed || 1.0);
            p.x = p.startX + (p.targetX - p.startX) * p.progress;
            p.y = p.startY + (p.targetY - p.startY) * p.progress;

            // Projectile glow
            ctx.fillStyle = palette?.tint || '#f97316';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8 * scale, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4 * scale, 0, Math.PI * 2);
            ctx.fill();

            if (p.progress >= 1.0) {
              st.projectile = undefined;
              const isCrit = Math.random() < 0.35;
              const baseDmg = 210 + Math.floor(Math.random() * 80);
              applyHitToMonster(isCrit ? Math.floor(baseDmg * 1.8) : baseDmg, isCrit);
            }
          }

          // 5. Draw Impact Effect
          if (st.impact) {
            const imp = st.impact;
            imp.frame++;
            const progress = imp.frame / imp.maxFrames;
            const radius = progress * 32 * scale;

            ctx.strokeStyle = palette?.tint || '#facc15';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(imp.x, imp.y, radius, 0, Math.PI * 2);
            ctx.stroke();

            if (imp.frame >= imp.maxFrames) {
              st.impact = undefined;
            }
          }

          // 6. Draw Floating Combat Texts
          for (let i = st.floatingTexts.length - 1; i >= 0; i--) {
            const ft = st.floatingTexts[i];
            ft.y -= dt * 45;
            ft.alpha -= dt * 1.2;

            ctx.save();
            ctx.fillStyle = ft.color;
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.font = `bold ${Math.round(12 * ft.scale)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();

            if (ft.alpha <= 0) {
              st.floatingTexts.splice(i, 1);
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [selectedMonsterId, scale, speed, palette]);

  return (
    <div className="bg-[#0b0e17] rounded-xl border border-[#22283a] p-4 flex flex-col gap-3">
      {/* HEADER & TARGET SELECTOR */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Phòng Thử Nghiệm Tác Chiến (Combat Sandbox)
          </span>
        </div>

        {/* Monster Selector Buttons */}
        <div className="flex gap-1.5">
          {monsters.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMonsterId(m.id)}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                selectedMonsterId === m.id
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                  : 'bg-[#161a26] text-slate-300 hover:bg-[#202638] border border-[#23293c]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: m.color }}
              />
              {m.nameVi}
            </button>
          ))}
        </div>
      </div>

      {/* CANVAS VIEWPORT */}
      <div className="relative rounded-lg overflow-hidden border border-[#232a3d] bg-[#080a0f] shadow-inner">
        <canvas
          ref={canvasRef}
          width={340}
          height={210}
          className="w-full h-[210px] block"
        />

        {/* Action Controls Floating Over Viewport */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 pointer-events-auto">
          <div className="flex gap-2">
            <button
              onClick={executeAttack}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/30 transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" /> Tung Chiêu Thử Nghiệm
            </button>

            <button
              onClick={() => setIsAutoAttack(!isAutoAttack)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                isAutoAttack
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-[#1a2030] text-slate-300 hover:bg-[#242c42] border border-[#2b354d]'
              }`}
            >
              <Play className="w-3 h-3" /> {isAutoAttack ? 'Dừng Tự Đánh' : 'Tự Đánh Liên Tục'}
            </button>
          </div>

          <button
            onClick={resetMonsterHp}
            title="Hồi phục 100% HP quái vật"
            className="p-1.5 rounded-lg bg-[#141824] hover:bg-[#1e2436] text-slate-400 hover:text-white border border-[#23293c] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* COMBAT REACTION LOG */}
      <div className="bg-[#0e121c] p-2.5 rounded-lg border border-[#1e2436] text-[11px] font-mono space-y-1">
        <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold block mb-1">
          Nhật ký va đập & phản hồi:
        </span>
        {combatLog.length === 0 ? (
          <span className="text-slate-600 italic">Nhấn "Tung Chiêu Thử Nghiệm" để bắt đầu thử lửa...</span>
        ) : (
          combatLog.map((log, idx) => (
            <div key={idx} className="text-slate-300 truncate">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
