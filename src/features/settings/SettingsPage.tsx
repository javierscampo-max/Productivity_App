import React from 'react';
import { useThemeStore, Theme } from '../../store/useThemeStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Check, Moon, Cloud, Heart } from 'lucide-react';
import { clsx } from 'clsx';

export const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useThemeStore();
    const { autoCompleteParentTask, syncCalendarEventToTask, themeColor, setSettings } = useSettingsStore();

    const themes: { id: Theme; name: string; icon: React.ReactNode; color: string }[] = [
        { id: 'midnight', name: 'Midnight', icon: <Moon size={20} />, color: 'bg-gray-950' },
        { id: 'neon-blue', name: 'Neon Night', icon: <span className="text-cyan-400 font-bold">N</span>, color: 'bg-slate-900 border-cyan-500' },
        { id: 'sky', name: 'Sky', icon: <Cloud size={20} />, color: 'bg-sky-100' },
        { id: 'pastel-pink', name: 'Pastel Pink', icon: <Heart size={20} />, color: 'bg-rose-100' },
    ];

    return (
        <div className="p-4 space-y-6 max-w-md mx-auto">
            {/* Theme Section */}
            <section className="space-y-3">
                <h3 className="text-xl font-bold text-gray-200">Appearance</h3>
                <div className="grid grid-cols-2 gap-3">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={clsx(
                                "relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                                theme === t.id
                                    ? "border-blue-500 bg-gray-800/80"
                                    : "border-transparent bg-gray-800/40 hover:bg-gray-800/60"
                            )}
                        >
                            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shadow-lg", t.color, ['sky', 'pastel-pink'].includes(t.id) ? 'text-black' : 'text-white')}>
                                {t.icon}
                            </div>
                            <span className="font-medium text-sm text-gray-300">{t.name}</span>

                            {theme === t.id && (
                                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-0.5">
                                    <Check size={12} className="text-white" strokeWidth={3} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* Accent Color Section */}
            <section className="space-y-3 pt-4 border-t border-gray-800">
                <h3 className="text-xl font-bold text-gray-200">Accent Color</h3>
                <div className="flex flex-wrap gap-4">
                    {[
                        { id: 'blue', hex: '#3b82f6', bg: 'bg-blue-500' },
                        { id: 'purple', hex: '#8b5cf6', bg: 'bg-purple-500' },
                        { id: 'pink', hex: '#ec4899', bg: 'bg-pink-500' },
                        { id: 'red', hex: '#ef4444', bg: 'bg-red-500' },
                        { id: 'orange', hex: '#f97316', bg: 'bg-orange-500' },
                        { id: 'green', hex: '#22c55e', bg: 'bg-green-500' },
                        { id: 'teal', hex: '#14b8a6', bg: 'bg-teal-500' },
                    ].map((color) => (
                        <button
                            key={color.id}
                            onClick={() => setSettings({ themeColor: color.hex })}
                            className={clsx(
                                "w-10 h-10 rounded-full transition-all flex items-center justify-center shadow-md hover:scale-110",
                                color.bg,
                                themeColor === color.hex ? "ring-4 ring-offset-2 ring-offset-gray-900 ring-white" : "ring-0"
                            )}
                            aria-label={`Select ${color.id} accent color`}
                        >
                            {themeColor === color.hex && <Check size={16} className="text-white" strokeWidth={3} />}
                        </button>
                    ))}
                </div>
            </section>

            {/* General Settings */}
            <section className="space-y-3 pt-4 border-t border-gray-800">
                <h3 className="text-xl font-bold text-gray-200">General</h3>
                <div className="bg-gray-800/40 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm font-medium">Auto-complete Parent Task</span>
                        <button
                            onClick={() => setSettings({ autoCompleteParentTask: !autoCompleteParentTask })}
                            className={clsx("w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none", autoCompleteParentTask ? "bg-blue-500" : "bg-gray-600")}
                        >
                            <div className={clsx("absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200", autoCompleteParentTask ? "left-7" : "left-1")}></div>
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 mb-4">When all subtasks are marked as done, the parent task is automatically completed.</p>

                    <div className="flex items-center justify-between mt-4">
                        <span className="text-gray-300 text-sm font-medium">Sync Calendar Completion</span>
                        <button
                            onClick={() => setSettings({ syncCalendarEventToTask: !syncCalendarEventToTask })}
                            className={clsx("w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none", syncCalendarEventToTask ? "bg-blue-500" : "bg-gray-600")}
                        >
                            <div className={clsx("absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200", syncCalendarEventToTask ? "left-7" : "left-1")}></div>
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Completing a linked event in the calendar automatically completes the task.</p>
                </div>
            </section>

            <div className="pt-8 text-center">
                <p className="text-xs text-gray-600">Productivity App v1.9.12</p>
            </div>
        </div>
    );
};
