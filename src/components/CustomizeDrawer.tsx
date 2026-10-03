import React from 'react';
import { WidgetSettings } from '../types';
import {
  X,
  Palette,
  Type,
  Clock,
  Sliders,
  ExternalLink,
  Plus,
  Calendar,
  Lock,
  Unlock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface CustomizeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WidgetSettings;
  onUpdateSettings: (newSettings: WidgetSettings) => void;
  onDataReload?: () => void;
  onOpenReminderModal?: () => void;
  onOpenCalendarShade?: () => void;
}

export const CustomizeDrawer: React.FC<CustomizeDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onDataReload,
  onOpenReminderModal,
  onOpenCalendarShade,
}) => {
  if (!isOpen) return null;

  const update = (partial: Partial<WidgetSettings>) => {
    if (settings.hapticsEnabled) soundManager.playClick();
    onUpdateSettings({ ...settings, ...partial });
  };

  const handleResetToSketchDefaults = () => {
    if (settings.hapticsEnabled) soundManager.playSuccess();
    update({
      textColor: '#b6ff00',
      fontFamily: 'sketch-serif',
      textOpacity: 0.95,
      transparentBgOnly: true,
      clockStyle: 'text-glance',
      layoutPreset: 'simple',
      textScale: 1.0,
      showDate: true,
      is24Hour: false,
      showSeconds: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-slate-950/95 border-l border-white/10 p-5 flex flex-col justify-between overflow-y-auto text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="font-['Outfit'] font-bold text-base text-white">
              Widget Settings & Appearance
            </h2>
          </div>
          <button
            onClick={() => {
              if (settings.hapticsEnabled) soundManager.playClick();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="flex-1 py-4 flex flex-col gap-5 text-xs">
          {/* Quick Action: Reset to Picture Style */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-lime-500/20 to-cyan-500/20 border border-lime-400/30">
            <div>
              <div className="text-white font-bold text-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                <span>Reset to Picture Style</span>
              </div>
              <div className="text-[10px] text-slate-300">
                Electric Lime, Fraunces Serif Italic, Floating
              </div>
            </div>
            <button
              onClick={handleResetToSketchDefaults}
              className="px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Apply Preset
            </button>
          </div>

          {/* 1. SLIDER FOR SOLID / OPAQUE */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
            <div className="flex justify-between items-center text-slate-200 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Slider for Solid / Opaque</span>
              </span>
              <span className="font-mono text-cyan-300 font-bold">
                {Math.round((settings.textOpacity ?? 0.95) * 100)}% {settings.textOpacity === 1 ? 'Solid' : 'Opaque'}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>15% (Translucent)</span>
                <span>50%</span>
                <span>100% (Solid)</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="1.0"
                step="0.05"
                value={settings.textOpacity ?? 0.95}
                onChange={(e) => update({ textOpacity: parseFloat(e.target.value) })}
                className="w-full accent-lime-400 cursor-pointer"
              />
            </div>

            {/* Background Transparency Mode Toggle */}
            <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer mt-1">
              <div>
                <div className="text-slate-200 font-medium text-xs">Translucent Background (Floating Text)</div>
                <div className="text-[10px] text-slate-400">Pure text floating directly on wallpaper (as in picture)</div>
              </div>
              <input
                type="checkbox"
                checked={settings.transparentBgOnly}
                onChange={(e) => update({ transparentBgOnly: e.target.checked })}
                className="rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
              />
            </label>
          </div>

          {/* 2. LIST OF CHOICES FOR COLOR */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span>Choice of Colors</span>
              </span>
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/30"
                style={{ backgroundColor: settings.textColor || '#b6ff00' }}
              />
            </label>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Electric Lime (Picture)', color: '#b6ff00' },
                { label: 'Pure White', color: '#ffffff' },
                { label: 'Glacier Cyan', color: '#38bdf8' },
                { label: 'Soft Mint', color: '#34d399' },
                { label: 'Amber Gold', color: '#fbbf24' },
                { label: 'Lavender', color: '#c084fc' },
                { label: 'Rose Quartz', color: '#f43f5e' },
                { label: 'Sunset Orange', color: '#f97316' },
              ].map((tc) => (
                <button
                  key={tc.color}
                  onClick={() => update({ textColor: tc.color })}
                  className={`py-2 px-2 rounded-xl border text-[10px] flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    settings.textColor === tc.color
                      ? 'border-white font-bold text-white bg-white/15 ring-2 ring-white/50'
                      : 'border-white/10 text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-md"
                    style={{ backgroundColor: tc.color }}
                  />
                  <span className="truncate text-center w-full">{tc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. LIST OF CHOICES FOR FONT */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Type className="w-4 h-4 text-cyan-400" />
              <span>Choice of Fonts</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'sketch-serif', label: 'Sketch Serif (Fraunces Heavy)', style: "font-['Fraunces',serif] italic font-bold" },
                { id: 'serif', label: 'Playfair Classic Serif', style: "font-['Playfair_Display',serif] italic" },
                { id: 'outfit', label: 'Outfit Modern Rounded', style: "font-['Outfit',sans-serif] italic" },
                { id: 'jakarta', label: 'Plus Jakarta Android Clean', style: "font-['Plus_Jakarta_Sans',sans-serif] italic" },
                { id: 'mono', label: 'JetBrains Tech Mono', style: 'font-mono italic' },
                { id: 'display', label: 'Bold Heavy Display', style: "font-['Fraunces',serif] italic font-black" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => update({ fontFamily: f.id as any })}
                  className={`py-2 px-3 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.fontFamily === f.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold ring-1 ring-cyan-400/50'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={`text-xs ${f.style}`}>{f.label}</div>
                </button>
              ))}
            </div>

            {/* Font Size Scale Slider */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 mt-1">
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>Font Size / Scale</span>
                <span className="font-mono text-cyan-300">
                  {Math.round((settings.textScale ?? 1.0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={settings.textScale ?? 1.0}
                onChange={(e) => update({ textScale: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* 4. 5 OR SO CLOCK STYLES */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>5 Clock Styles</span>
              </span>
              <span className="text-[10px] text-cyan-300 uppercase">{settings.clockStyle}</span>
            </label>

            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: 'text-glance',
                  title: '1. Text Glance (Picture Style: 10:01 / Oct. 16)',
                  desc: 'Clean slanted text with electric glowing numbers and due entries',
                },
                {
                  id: 'orbit',
                  title: '2. Moto Edge Orbit Ring',
                  desc: 'Motorola chronometer dial with battery and weather arc indicators',
                },
                {
                  id: 'digital',
                  title: '3. Clean Digital Clock',
                  desc: 'Bold stacked hours and minutes with high-contrast digits',
                },
                {
                  id: 'analog',
                  title: '4. Neo-Glass Analog Clock',
                  desc: 'Circular glass watchface with live sweep hour and minute hands',
                },
                {
                  id: 'material',
                  title: '5. Material You Stack',
                  desc: 'Android 14 pill-shaped clock widget with soft corners',
                },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => update({ clockStyle: st.id as any })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.clockStyle === st.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-white">{st.title}</div>
                  <div className="text-[10px] text-slate-400">{st.desc}</div>
                </button>
              ))}
            </div>

            {/* Time Format Toggles */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                <span>24-Hour Format</span>
                <input
                  type="checkbox"
                  checked={settings.is24Hour}
                  onChange={(e) => update({ is24Hour: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                <span>Show Live Seconds</span>
                <input
                  type="checkbox"
                  checked={settings.showSeconds}
                  onChange={(e) => update({ showSeconds: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-cyan-400"
                />
              </label>
            </div>
          </div>

          {/* 5. QUICK CALENDAR & REMINDER ACTIONS */}
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-white font-semibold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Calendar & Reminder Shortcuts</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (settings.hapticsEnabled) soundManager.playClick();
                  if (onOpenReminderModal) onOpenReminderModal();
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Reminder</span>
              </button>

              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <span>Google Calendar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {onOpenCalendarShade && (
              <button
                onClick={() => {
                  if (settings.hapticsEnabled) soundManager.playClick();
                  onOpenCalendarShade();
                  onClose();
                }}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Slide Down Win + N Monthly Calendar</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => update({ isLocked: !settings.isLocked })}
              className="flex items-center gap-1 text-slate-300 hover:text-white"
            >
              {settings.isLocked ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{settings.isLocked ? 'Locked' : 'Unlocked'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (settings.hapticsEnabled) soundManager.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all active:scale-95 cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
