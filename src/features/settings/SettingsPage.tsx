import React from 'react';
import { useThemeStore, Theme } from '../../store/useThemeStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Check, Moon, Cloud, Heart, Palette } from 'lucide-react';
import { clsx } from 'clsx';

export const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useThemeStore();
    const { 
        autoCompleteParentTask, 
        syncCalendarEventToTask, 
        themeColor, 
        customBgPrimary,
        customBgSecondary,
        customTextPrimary,
        customTextSecondary,
        customBorder,
        setSettings 
    } = useSettingsStore();

    const themes: { id: Theme; name: string; icon: React.ReactNode; color: string }[] = [
        { id: 'midnight', name: 'Midnight', icon: <Moon size={20} />, color: 'bg-gray-950' },
        { id: 'neon-blue', name: 'Neon Night', icon: <span className="text-[#00f0ff] font-bold" style={{ textShadow: '0 0 10px #00f0ff' }}>N</span>, color: 'bg-[#050511] border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]' },
        { id: 'sky', name: 'Sky', icon: <Cloud size={20} />, color: 'bg-sky-100' },
        { id: 'pastel-pink', name: 'Pastel Pink', icon: <Heart size={20} />, color: 'bg-rose-100' },
        { id: 'custom', name: 'Custom', icon: <Palette size={20} />, color: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-none' },
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

                {theme === 'custom' && (
                    <div className="mt-4 p-4 bg-gray-800/40 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-sm font-bold text-gray-300 mb-2">Build Your Theme</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">App Background</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={customBgPrimary} onChange={e => setSettings({customBgPrimary: e.target.value})} className="w-8 h-8 rounded bg-transparent p-0 border-none cursor-pointer" />
                                    <span className="text-xs text-gray-400 font-mono">{customBgPrimary}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">Card Background</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={customBgSecondary} onChange={e => setSettings({customBgSecondary: e.target.value})} className="w-8 h-8 rounded bg-transparent p-0 border-none cursor-pointer" />
                                    <span className="text-xs text-gray-400 font-mono">{customBgSecondary}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">Primary Text</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={customTextPrimary} onChange={e => setSettings({customTextPrimary: e.target.value})} className="w-8 h-8 rounded bg-transparent p-0 border-none cursor-pointer" />
                                    <span className="text-xs text-gray-400 font-mono">{customTextPrimary}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">Secondary Text</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={customTextSecondary} onChange={e => setSettings({customTextSecondary: e.target.value})} className="w-8 h-8 rounded bg-transparent p-0 border-none cursor-pointer" />
                                    <span className="text-xs text-gray-400 font-mono">{customTextSecondary}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">Borders & Lines</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={customBorder} onChange={e => setSettings({customBorder: e.target.value})} className="w-8 h-8 rounded bg-transparent p-0 border-none cursor-pointer" />
                                    <span className="text-xs text-gray-400 font-mono">{customBorder}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">Accent Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={themeColor} onChange={e => setSettings({themeColor: e.target.value})} className="w-8 h-8 rounded bg-transparent p-0 border-none cursor-pointer" />
                                    <span className="text-xs text-gray-400 font-mono">{themeColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
                <p className="text-xs text-gray-600">Apex v2.0.0</p>
            </div>
        </div>
    );
};
