import React from 'react';
import { WidgetSettings } from '../types';
import { Wifi, Signal, Battery, ChevronDown } from 'lucide-react';
import { HomeScreenDock } from './HomeScreenDock';

interface PhoneFrameProps {
  settings: WidgetSettings;
  children: React.ReactNode;
  onOpenCustomizer: () => void;
  onOpenGemini: () => void;
  onOpenShade?: () => void;
  onOpenKeep?: () => void;
  referenceImage?: string | null;
  isOverlayActive?: boolean;
  overlayOpacity?: number;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  settings,
  children,
  onOpenShade,
  onOpenKeep,
  referenceImage,
  isOverlayActive = false,
  overlayOpacity = 0.5,
}) => {
  // Wallpaper background styles
  const getWallpaperStyle = (): React.CSSProperties => {
    switch (settings.wallpaper) {
      case 'obsidian':
        return {
          backgroundColor: '#030712',
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(30, 41, 59, 0.4) 0%, rgba(3, 7, 18, 1) 100%)',
        };
      case 'aurora':
        return {
          backgroundColor: '#020617',
          backgroundImage:
            'radial-gradient(ellipse at 20% 20%, rgba(16, 185, 129, 0.25) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 60%), radial-gradient(ellipse at 50% 50%, rgba(14, 165, 233, 0.2) 0%, rgba(2, 6, 23, 1) 100%)',
        };
      case 'cyber-sunset':
        return {
          backgroundColor: '#0f051d',
          backgroundImage:
            'radial-gradient(circle at 80% 10%, rgba(244, 63, 94, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 70%, rgba(245, 158, 11, 0.25) 0%, transparent 60%), linear-gradient(180deg, rgba(15, 5, 29, 0.9) 0%, rgba(2, 6, 23, 1) 100%)',
        };
      case 'frost-crystal':
        return {
          backgroundColor: '#081226',
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(186, 230, 253, 0.2) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.25) 0%, rgba(8, 18, 38, 1) 100%)',
        };
      case 'custom':
        if (settings.customWallpaperUrl) {
          return {
            backgroundImage: `url(${settings.customWallpaperUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          };
        }
        return {
          backgroundColor: '#020617',
        };
      case 'cyan-nebula':
      default:
        return {
          backgroundColor: '#020617',
          backgroundImage:
            'radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.35) 0%, transparent 45%), radial-gradient(circle at 90% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 1) 100%)',
        };
    }
  };

  // If user selected Fullscreen mode
  if (settings.viewMode === 'fullscreen') {
    return (
      <div
        style={getWallpaperStyle()}
        className="min-h-screen w-full flex flex-col items-center justify-start p-2 sm:p-6 transition-all duration-500"
      >
        <div className="w-full max-w-xl flex flex-col gap-4">
          {children}
          {settings.showHomeDock && <HomeScreenDock onOpenKeep={onOpenKeep} />}
        </div>
      </div>
    );
  }

  // If user selected Desktop Floating mode
  if (settings.viewMode === 'desktop') {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-950/80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <div
          className={`w-full max-w-md transition-all ${
            settings.isLocked ? 'ring-1 ring-emerald-500/30' : 'ring-1 ring-cyan-500/40'
          }`}
        >
          {children}
        </div>
      </div>
    );
  }

  // Motorola Edge Lighting Glow
  const getEdgeLightingShadow = () => {
    switch (settings.edgeLighting) {
      case 'cyan':
        return 'shadow-[0_0_45px_rgba(6,182,212,0.45)] ring-2 ring-cyan-400/50';
      case 'moto-blue':
        return 'shadow-[0_0_45px_rgba(59,130,246,0.45)] ring-2 ring-blue-500/50';
      case 'purple':
        return 'shadow-[0_0_45px_rgba(168,85,247,0.45)] ring-2 ring-purple-500/50';
      case 'emerald':
        return 'shadow-[0_0_45px_rgba(16,185,129,0.45)] ring-2 ring-emerald-400/50';
      case 'gold':
        return 'shadow-[0_0_45px_rgba(234,179,8,0.45)] ring-2 ring-amber-400/50';
      default:
        return 'shadow-2xl ring-1 ring-white/10';
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-6 px-3 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-x-hidden">
      {/* Phone Chassis (Motorola Edge+ 2022) */}
      <div
        className={`relative w-full max-w-[420px] rounded-[48px] p-3 sm:p-3.5 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-4 border-slate-700/80 transition-all duration-500 ${getEdgeLightingShadow()}`}
      >
        {/* Curved Side Gloss Edge Highlights */}
        <div className="absolute inset-y-12 -left-1 w-1 rounded-l-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent" />
        <div className="absolute inset-y-12 -right-1 w-1 rounded-r-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent" />

        {/* Volume & Power Buttons Emulation */}
        <div className="absolute -right-5 top-28 w-1.5 h-12 rounded-r-md bg-slate-700 border-l border-slate-800" />
        <div className="absolute -right-5 top-44 w-1.5 h-18 rounded-r-md bg-slate-700 border-l border-slate-800" />

        {/* Inner Screen Bezel (20:9 Aspect Ratio) */}
        <div
          style={getWallpaperStyle()}
          className="relative w-full rounded-[40px] overflow-hidden border border-white/10 flex flex-col min-h-[780px] transition-all duration-500 justify-between"
        >
          {/* Top Speaker Earpiece Slit */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-slate-800 z-30 pointer-events-none" />

          {/* Android Status Bar (Motorola Peek Display) - Clickable for Win+N Calendar Shade */}
          <div
            onClick={onOpenShade}
            title="Click or press Win+N to slide open full monthly calendar & notification panel"
            className="group relative z-30 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold text-slate-300 cursor-pointer hover:bg-white/5 transition-colors"
          >
            {/* Left: 5G & 144Hz */}
            <div className="flex items-center gap-1.5 font-medium">
              <span className="font-['Outfit']">5G UW</span>
              <span className="text-cyan-400 font-bold">•</span>
              <span className="text-[10px] text-cyan-300 font-mono">144Hz</span>
            </div>

            {/* Center: Punch-Hole Selfie Camera with Swipe-down cue */}
            <div className="absolute left-1/2 top-2.5 -translate-x-1/2 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-black border-2 border-slate-800/80 shadow-inner flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-blue-900/60" />
              </div>
              <ChevronDown className="w-3 h-3 text-cyan-400/60 group-hover:text-cyan-300 group-hover:translate-y-0.5 transition-all mt-0.5" />
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-2">
              <Signal className="w-3.5 h-3.5 text-slate-300" />
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <div className="flex items-center gap-1">
                <span className="text-[10px]">{settings.batteryLevel}%</span>
                <Battery className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              </div>
            </div>
          </div>

          {/* Screen Content Wrapper: Floating Wallpaper Widget */}
          <div className="relative z-10 flex-1 p-3 sm:p-4 flex flex-col justify-start gap-4">
            {children}
          </div>

          {/* Optional Live Design Overlay Comparison */}
          {referenceImage && isOverlayActive && (
            <div
              className="absolute inset-0 z-40 pointer-events-none transition-opacity"
              style={{ opacity: overlayOpacity }}
            >
              <img
                src={referenceImage}
                alt="Design Overlay"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Bottom Section: Android Favorite Apps Dock & Gesture Pill */}
          <div className="relative z-20 flex flex-col items-center pb-2 px-3">
            {settings.showHomeDock && (
              <HomeScreenDock onOpenKeep={onOpenKeep} haptics={settings.hapticsEnabled} />
            )}

            {/* Android Gesture Navigation Pill Bar */}
            <div className="py-2 flex items-center justify-center">
              <div className="w-32 h-1 rounded-full bg-white/40 shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
