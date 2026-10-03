import React, { useState } from 'react';
import { CalendarEvent, KeepNote } from '../types';
import { Sparkles, Send, Calendar, CheckSquare, RefreshCw, X, Lightbulb } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onApplyKeepNote: (note: Omit<KeepNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  selectedDate: string;
  currentEvents: CalendarEvent[];
  currentNotes: KeepNote[];
  haptics?: boolean;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyEvent,
  onApplyKeepNote,
  selectedDate,
  currentEvents,
  currentNotes,
  haptics = true,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const examplePrompts = [
    'Schedule Moto Edge+ 144Hz display test tomorrow at 2pm',
    'Add a Keep note for groceries: cold brew, avocados, Greek yogurt',
    'Summarize my day and organize my tasks into a schedule',
    'Add an evening gym workout at 6:30pm and a recovery note',
  ];

  const handleSend = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;
    if (haptics) soundManager.playClick();

    setLoading(true);
    setErrorMsg(null);
    setResponse(null);

    try {
      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt.trim(),
          context: {
            currentTime: new Date().toISOString(),
            selectedDate,
            events: currentEvents.slice(0, 10),
            tasks: currentNotes.slice(0, 10),
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
      if (haptics) soundManager.playSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gemini assistance request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyEvent = () => {
    if (!response?.newEvent) return;
    if (haptics) soundManager.playSuccess();
    onApplyEvent({
      title: response.newEvent.title || 'Scheduled Event',
      date: response.newEvent.date || selectedDate,
      startTime: response.newEvent.startTime || '10:00',
      endTime: response.newEvent.endTime || '11:00',
      category: (response.newEvent.category as any) || 'work',
      description: response.newEvent.description || 'Created by Gemini AI',
    });
  };

  const handleApplyKeepNote = () => {
    if (!response?.newKeepNote) return;
    if (haptics) soundManager.playSuccess();
    onApplyKeepNote({
      title: response.newKeepNote.title || 'Keep Task Note',
      content: response.newKeepNote.content || '',
      items: (response.newKeepNote.items || []).map((it: any, idx: number) => ({
        id: `gemini-item-${Date.now()}-${idx}`,
        text: it.text || 'Task',
        completed: false,
      })),
      color: response.newKeepNote.color || 'yellow',
      tags: response.newKeepNote.tags || ['ai-assistant', 'moto'],
      pinned: response.newKeepNote.pinned ?? false,
    });
  };

  const handleApplyBoth = () => {
    if (response?.newEvent) handleApplyEvent();
    if (response?.newKeepNote) handleApplyKeepNote();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900/95 border border-cyan-500/30 p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-bold text-base sm:text-lg text-white">
                Clockander Gemini AI
              </h3>
              <p className="text-[11px] text-cyan-300">
                Natural language schedule & Keep task assistant
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (haptics) soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type: 'Schedule meeting tomorrow at 3pm and create a prep checklist'..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend(prompt);
            }}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            onClick={() => handleSend(prompt)}
            disabled={loading || !prompt.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Send className="w-4 h-4 text-slate-950" />
            )}
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>

        {/* Example Prompt Chips */}
        <div className="flex flex-col gap-1.5">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Suggestions:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {examplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setPrompt(p);
                  handleSend(p);
                }}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 text-[11px] text-slate-300 hover:text-cyan-200 transition-colors text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Gemini Response Display */}
        {response && (
          <div className="flex flex-col gap-3 mt-1 pt-3 border-t border-white/10 animate-in fade-in duration-200">
            {/* AI Message */}
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-xs sm:text-sm text-cyan-100 leading-relaxed">
              <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
                Gemini Response
              </div>
              {response.replyMessage}
            </div>

            {/* Daily Briefing Summary if provided */}
            {response.dailyBriefingSummary && (
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-400/20 text-xs text-purple-200">
                <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                  Moto Glance Daily Briefing
                </div>
                {response.dailyBriefingSummary}
              </div>
            )}

            {/* Extracted Calendar Event Preview */}
            {response.newEvent && (
              <div className="p-3 rounded-2xl bg-white/5 border border-cyan-400/30 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-400/20 text-cyan-300 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-cyan-300 uppercase">
                      New Event Extracted
                    </div>
                    <div className="font-semibold text-xs sm:text-sm text-white">
                      {response.newEvent.title}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {response.newEvent.date} • {response.newEvent.startTime} -{' '}
                      {response.newEvent.endTime}
                    </div>
                    {response.newEvent.description && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {response.newEvent.description}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleApplyEvent}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
                >
                  Add to Schedule
                </button>
              </div>
            )}

            {/* Extracted Keep Note Preview */}
            {response.newKeepNote && (
              <div className="p-3 rounded-2xl bg-white/5 border border-amber-400/30 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 shrink-0">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-amber-300 uppercase">
                      Keep Note & Tasks Extracted
                    </div>
                    <div className="font-semibold text-xs sm:text-sm text-white">
                      {response.newKeepNote.title}
                    </div>
                    {response.newKeepNote.content && (
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {response.newKeepNote.content}
                      </p>
                    )}
                    {response.newKeepNote.items?.length > 0 && (
                      <div className="mt-1.5 flex flex-col gap-1">
                        {response.newKeepNote.items.map((it: any, i: number) => (
                          <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>{it.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleApplyKeepNote}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
                >
                  Save to Keep
                </button>
              </div>
            )}

            {/* Combined Apply All Button */}
            {response.newEvent && response.newKeepNote && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleApplyBoth}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-amber-400 hover:opacity-95 text-slate-950 font-extrabold text-xs transition-transform active:scale-95 cursor-pointer shadow-md"
                >
                  Apply Both to Calendar & Keep
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
