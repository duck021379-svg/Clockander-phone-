import React, { useState } from 'react';
import {
  Image as ImageIcon,
  ExternalLink,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface DesignReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceImage: string | null;
  onSetReferenceImage: (imgUrl: string | null) => void;
  overlayOpacity: number;
  onSetOverlayOpacity: (opacity: number) => void;
  isOverlayActive: boolean;
  onToggleOverlay: () => void;
  haptics?: boolean;
}

export const DesignReferenceModal: React.FC<DesignReferenceModalProps> = ({
  isOpen,
  onClose,
  referenceImage,
  onSetReferenceImage,
  overlayOpacity,
  onSetOverlayOpacity,
  isOverlayActive,
  onToggleOverlay,
  haptics = true,
}) => {
  const [pasteUrlInput, setPasteUrlInput] = useState('');

  if (!isOpen) return null;

  const shareLinks = [
    {
      id: '1',
      title: 'Design Visual 1',
      subtitle: 'Moto Edge+ Signature Glance & Orbit Dial',
      url: 'https://share.gemini.google/ftZsQQMKRQ2M',
    },
    {
      id: '2',
      title: 'Design Visual 2',
      subtitle: 'Clockander Matrix & Agenda Schedule',
      url: 'https://share.gemini.google/DUlUoyVSFycC',
    },
    {
      id: '3',
      title: 'Design Visual 3',
      subtitle: 'Google Keep Sticky Tasks & Checklists',
      url: 'https://share.gemini.google/BvpRRD6R6NGE',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (haptics) soundManager.playSuccess();
        onSetReferenceImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!pasteUrlInput.trim()) return;
    if (haptics) soundManager.playSuccess();
    onSetReferenceImage(pasteUrlInput.trim());
    setPasteUrlInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-cyan-500/30 p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-bold text-base sm:text-lg text-white">
                Design Visual Reference
              </h3>
              <p className="text-[11px] text-cyan-300">
                Match & compare against your Gemini shared designs
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (haptics) soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gemini Share Links Section */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Your Gemini Design Shares</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {shareLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (haptics) soundManager.playClick();
                }}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-xs text-white group-hover:text-cyan-300 flex items-center gap-1.5">
                    <span>{link.title}</span>
                    <ExternalLink className="w-3 h-3 text-cyan-400 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="text-[11px] text-slate-400">{link.subtitle}</div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">
                  Open Gemini
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Upload or Attach Reference Picture */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-white/10">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Loaded Visual Image</span>
            </span>
            {referenceImage && (
              <button
                onClick={() => {
                  if (haptics) soundManager.playClick();
                  onSetReferenceImage(null);
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            )}
          </div>

          {referenceImage ? (
            <div className="flex flex-col gap-2">
              <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/40 max-h-48 flex items-center justify-center">
                <img
                  src={referenceImage}
                  alt="Design Visual Reference"
                  className="w-full h-full object-contain max-h-48"
                />
              </div>

              {/* Overlay Toggle & Opacity Slider */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Live Screen Overlay Mode</span>
                  <button
                    onClick={() => {
                      if (haptics) soundManager.playClick();
                      onToggleOverlay();
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isOverlayActive
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isOverlayActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{isOverlayActive ? 'Overlay ON' : 'Overlay OFF'}</span>
                  </button>
                </div>

                {isOverlayActive && (
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Overlay Opacity</span>
                      <span className="font-mono text-cyan-300">{Math.round(overlayOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={overlayOpacity}
                      onChange={(e) => onSetOverlayOpacity(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="p-4 rounded-2xl border-2 border-dashed border-white/15 hover:border-cyan-400/40 bg-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Upload screenshot or design image
                </span>
                <span className="text-[11px] text-slate-400">
                  PNG, JPG, or WEBP from your device
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  placeholder="Or paste image URL (https://...)"
                  value={pasteUrlInput}
                  onChange={(e) => setPasteUrlInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                <button
                  onClick={handleApplyUrl}
                  disabled={!pasteUrlInput.trim()}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-40"
                >
                  Load
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
