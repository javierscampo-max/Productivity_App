import React from 'react';
import { useThemeStore, Theme } from '../../store/useThemeStore';
import { Check, Moon, Cloud, Heart } from 'lucide-react';
import { clsx } from 'clsx';

export const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useThemeStore();

    const themes: { id: Theme; name: string; icon: React.ReactNode; color: string }[] = [
        { id: 'midnight', name: 'Midnight', icon: <Moon size={20} />, color: 'bg-gray-950' },
        { id: 'neon-blue', name: 'Neon Night', icon: <span className="text-cyan-400 font-bold">N</span>, color: 'bg-slate-900 border-cyan-500' },
        { id: 'sky', name: 'Sky', icon: <Cloud size={20} />, color: 'bg-sky-100' },
        { id: 'pastel-pink', name: 'Pastel Pink', icon: <Heart size={20} />, color: 'bg-rose-100' },
        { id: 'pastel-blue', name: 'Pastel Blue', icon: <Cloud size={20} className="text-blue-500" />, color: 'bg-blue-100' },
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
                            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shadow-lg", t.color, ['sky', 'pastel-pink', 'pastel-blue'].includes(t.id) ? 'text-black' : 'text-white')}>
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

            {/* Other Settings Placeholders */}
            <section className="space-y-3 pt-4 border-t border-gray-800">
                <h3 className="text-xl font-bold text-gray-200">General</h3>
                <div className="bg-gray-800/40 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-300">Show Completed Tasks</span>
                        <div className="w-10 h-6 bg-gray-700 rounded-full relative cursor-not-allowed opacity-50">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full"></div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">More settings coming soon...</p>
                </div>
            </section>

            <div className="pt-8 text-center">
                <p className="text-xs text-gray-600">Productivity App v0.1.0</p>
            </div>
        </div>
    );
};
