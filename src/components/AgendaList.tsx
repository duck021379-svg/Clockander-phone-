import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { Plus, Clock, Trash2, CalendarCheck, Tag, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface AgendaListProps {
  selectedDate: string; // YYYY-MM-DD
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (eventId: string, isGoogleEvent?: boolean, googleEventId?: string) => void;
  haptics?: boolean;
  onOpenGemini?: () => void;
}

export const AgendaList: React.FC<AgendaListProps> = ({
  selectedDate,
  events,
  onAddEvent,
  onDeleteEvent,
  haptics = true,
  onOpenGemini,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form state for adding an event
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [category, setCategory] = useState<CalendarEvent['category']>('work');
  const [description, setDescription] = useState('');

  // Filter events for the selected day or overall
  const dayEvents = events.filter((evt) => {
    const matchesDate = evt.date === selectedDate;
    if (!matchesDate) return false;
    if (filterCategory === 'all') return true;
    return evt.category === filterCategory;
  });

  const handleOpenAdd = () => {
    if (haptics) soundManager.playClick();
    setIsModalOpen(true);
  };

  const handleCloseAdd = () => {
    if (haptics) soundManager.playClick();
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (haptics) soundManager.playSuccess();
    onAddEvent({
      title: title.trim(),
      date: selectedDate,
      startTime,
      endTime,
      category,
      description: description.trim(),
    });

    handleCloseAdd();
  };

  // Helper to format date label
  const parsedDate = new Date(`${selectedDate}T00:00:00`);
  const dateFormatted = parsedDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const getCategoryBadge = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'google':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'meeting':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'fitness':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'personal':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header & Controls */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h4 className="font-['Outfit'] font-bold text-sm text-white flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-cyan-400" />
            <span>Schedule for {dateFormatted}</span>
          </h4>
          <p className="text-[11px] text-slate-400">
            {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} planned
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenGemini && (
            <button
              onClick={() => {
                if (haptics) soundManager.playClick();
                onOpenGemini();
              }}
              title="Schedule with Gemini AI"
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-cyan-200 border border-cyan-400/30 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">AI Assist</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="p-1.5 px-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Event</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        {['all', 'work', 'meeting', 'personal', 'fitness', 'google'].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              if (haptics) soundManager.playClick();
              setFilterCategory(cat);
            }}
            className={`px-2.5 py-0.5 rounded-lg capitalize transition-colors cursor-pointer shrink-0 ${
              filterCategory === cat
                ? 'bg-white/20 text-white font-semibold border border-white/30'
                : 'bg-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Event Items List */}
      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        {dayEvents.length === 0 ? (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center gap-1.5">
            <Clock className="w-6 h-6 text-slate-500" />
            <div className="text-xs font-medium text-slate-300">No events on this day</div>
            <div className="text-[11px] text-slate-500">
              Tap + Event or use Gemini AI to add one
            </div>
          </div>
        ) : (
          dayEvents.map((evt) => (
            <div
              key={evt.id}
              className="group p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-start justify-between gap-2.5"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border uppercase tracking-wider ${getCategoryBadge(
                      evt.category
                    )}`}
                  >
                    {evt.category}
                  </span>
                  <span className="text-[11px] text-cyan-300/90 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {evt.startTime} - {evt.endTime}
                  </span>
                </div>
                <div className="font-semibold text-xs sm:text-sm text-white truncate">
                  {evt.title}
                </div>
                {evt.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {evt.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  if (haptics) soundManager.playClick();
                  onDeleteEvent(evt.id, evt.isGoogleEvent, evt.googleEventId);
                }}
                title="Delete event"
                className="opacity-60 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-white/20 p-5 shadow-2xl text-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-['Outfit'] font-bold text-base text-white">Add Schedule Event</h3>
              <button
                onClick={handleCloseAdd}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Motorola 144Hz Calibration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="work">Work</option>
                  <option value="meeting">Meeting</option>
                  <option value="personal">Personal</option>
                  <option value="fitness">Fitness / Health</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Details, location, or notes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseAdd}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:bg-white/15 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
