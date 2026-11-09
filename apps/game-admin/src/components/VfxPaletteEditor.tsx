import React from 'react';
import { Palette, Sliders, RefreshCw, Sparkles, Sun, Eye } from 'lucide-react';
import { VFXPaletteConfig } from '@elysia/vfx-engine';

export const PRESET_PALETTES: { name: string; tint: string; hue: number; sat: number; bri: number }[] = [
  { name: 'Nguyên Bản (Default)', tint: '#ffffff', hue: 0, sat: 1.0, bri: 1.0 },
  { name: 'Hỏa Diệm Hoàng Kim', tint: '#f59e0b', hue: -15, sat: 1.3, bri: 1.15 },
  { name: 'Huyết Sát Hồng Liên', tint: '#ef4444', hue: -35, sat: 1.4, bri: 1.1 },
  { name: 'Băng Lam Tuyết Giới', tint: '#38bdf8', hue: 180, sat: 1.25, bri: 1.2 },
  { name: 'Kịch Độc U Minh', tint: '#10b981', hue: 110, sat: 1.3, bri: 1.05 },
  { name: 'Bí Thuật Hư Không', tint: '#c084fc', hue: 270, sat: 1.35, bri: 1.25 },
  { name: 'Hắc Ám Đoạt Mệnh', tint: '#6366f1', hue: 240, sat: 1.1, bri: 0.9 },
  { name: 'Thánh Quang Rực Rỡ', tint: '#fef08a', hue: 45, sat: 1.2, bri: 1.3 },
];

export function VfxPaletteEditor({
  palette,
  scale = 1.0,
  speed = 1.0,
  onChangePalette,
  onChangeScale,
  onChangeSpeed,
  onReset,
}: {
  palette: VFXPaletteConfig;
  scale: number;
  speed: number;
  onChangePalette: (newPalette: VFXPaletteConfig) => void;
  onChangeScale: (newScale: number) => void;
  onChangeSpeed: (newSpeed: number) => void;
  onReset: () => void;
}) {
  const currentTint = palette.tint || '#ffffff';
  const currentHue = palette.hueShift || 0;
  const currentSat = palette.saturation !== undefined ? palette.saturation : 1.0;
  const currentBri = palette.brightness !== undefined ? palette.brightness : 1.0;

  return (
    <div className="bg-[#0b0e17] rounded-xl border border-[#22283a] p-4 flex flex-col gap-4 text-xs">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-white uppercase tracking-wider text-xs">
            Hiệu Chỉnh Màu Sắc & Tốc Độ (Palette & Speed Engine)
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 hover:underline transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Mặc Định
        </button>
      </div>

      {/* QUICK PRESET SWATCHES */}
      <div>
        <span className="text-[10px] text-slate-400 font-semibold block mb-2 uppercase">
          Mẫu Màu Phong Cách Nhanh (Preset LUTs):
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {PRESET_PALETTES.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                onChangePalette({
                  tint: p.tint,
                  hueShift: p.hue,
                  saturation: p.sat,
                  brightness: p.bri,
                });
              }}
              className="p-1.5 rounded-lg bg-[#141824] hover:bg-[#1f2638] border border-[#20273a] text-[10px] text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                style={{ backgroundColor: p.tint }}
              />
              <span className="truncate">{p.name.split(' (')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DETAILED SLIDERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#1c2233]">
        {/* Color Tint Picker */}
        <div className="p-2.5 rounded-lg bg-[#121622] border border-[#1e2538] flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] block">Mã Màu Gốc (Tint Hex)</span>
            <span className="text-white font-mono font-bold">{currentTint}</span>
          </div>
          <input
            type="color"
            value={currentTint}
            onChange={(e) => onChangePalette({ ...palette, tint: e.target.value })}
            className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
          />
        </div>

        {/* Hue Shift Slider */}
        <div className="p-2.5 rounded-lg bg-[#121622] border border-[#1e2538] flex flex-col justify-between">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Độ Lệch Pha Màu (Hue Shift)</span>
            <span className="text-amber-400 font-mono">{currentHue}°</span>
          </div>
          <input
            type="range"
            min={-180}
            max={180}
            step={5}
            value={currentHue}
            onChange={(e) => onChangePalette({ ...palette, hueShift: Number(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer mt-1"
          />
        </div>

        {/* Saturation Slider */}
        <div className="p-2.5 rounded-lg bg-[#121622] border border-[#1e2538] flex flex-col justify-between">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Độ Bão Hòa (Saturation)</span>
            <span className="text-emerald-400 font-mono">{currentSat.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min={0.0}
            max={2.0}
            step={0.05}
            value={currentSat}
            onChange={(e) => onChangePalette({ ...palette, saturation: Number(e.target.value) })}
            className="w-full accent-emerald-500 cursor-pointer mt-1"
          />
        </div>

        {/* Brightness Slider */}
        <div className="p-2.5 rounded-lg bg-[#121622] border border-[#1e2538] flex flex-col justify-between">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Độ Sáng Năng Lượng (Brightness)</span>
            <span className="text-sky-400 font-mono">{currentBri.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={2.0}
            step={0.05}
            value={currentBri}
            onChange={(e) => onChangePalette({ ...palette, brightness: Number(e.target.value) })}
            className="w-full accent-sky-500 cursor-pointer mt-1"
          />
        </div>
      </div>

      {/* SPATIAL SCALE & PLAYBACK SPEED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#1c2233]">
        {/* Effect Scale */}
        <div className="p-2.5 rounded-lg bg-[#121622] border border-[#1e2538]">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Tỉ Lệ Kích Thước (Effect Scale)</span>
            <span className="text-amber-400 font-mono">{scale.toFixed(2)}x (256px native)</span>
          </div>
          <input
            type="range"
            min={0.4}
            max={3.0}
            step={0.1}
            value={scale}
            onChange={(e) => onChangeScale(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer mt-1"
          />
        </div>

        {/* Playback Speed */}
        <div className="p-2.5 rounded-lg bg-[#121622] border border-[#1e2538]">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Tốc Độ Thi Triển (Playback Speed)</span>
            <span className="text-blue-400 font-mono">{speed.toFixed(2)}x (Tốc độ khung)</span>
          </div>
          <input
            type="range"
            min={0.25}
            max={2.5}
            step={0.05}
            value={speed}
            onChange={(e) => onChangeSpeed(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer mt-1"
          />
        </div>
      </div>
    </div>
  );
}
