import { useState, useEffect } from 'react';
import { TaskList } from './features/tasks/components/TaskList';
import { useTaskStore } from './features/tasks/store/useTaskStore';
import { useCalendarStore } from './features/calendar/store/useCalendarStore';
import { useThemeStore } from './store/useThemeStore';
import { useSettingsStore } from './store/useSettingsStore';
import { CalendarPage } from './features/calendar/CalendarPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { ListTodo, Calendar, Settings } from 'lucide-react';
import { clsx } from 'clsx';

type Tab = 'tasks' | 'calendar' | 'settings';

function App() {
    const [currentTab, setCurrentTab] = useState<Tab>('tasks');
    const tasks = useTaskStore((state) => state.tasks);
    const cleanupPastEvents = useCalendarStore((state) => state.cleanupPastEvents);
    const theme = useThemeStore((state) => state.theme);

    const {
        themeColor,
        customBgPrimary,
        customBgSecondary,
        customTextPrimary,
        customTextSecondary,
        customBorder
    } = useSettingsStore();

    useEffect(() => {
        // Run cleanup on app mount
        cleanupPastEvents();
    }, [cleanupPastEvents]);

    // Apply theme and accent color to body
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        document.documentElement.style.setProperty('--accent', themeColor);

        if (theme === 'custom') {
            document.documentElement.style.setProperty('--bg-primary', customBgPrimary);
            document.documentElement.style.setProperty('--bg-secondary', customBgSecondary);
            document.documentElement.style.setProperty('--text-primary', customTextPrimary);
            document.documentElement.style.setProperty('--text-secondary', customTextSecondary);
            document.documentElement.style.setProperty('--border', customBorder);
            // Default to dark mode color-scheme for native popups so custom dark UI integrates well
            document.documentElement.style.setProperty('color-scheme', 'dark');
        } else {
            document.documentElement.style.removeProperty('--bg-primary');
            document.documentElement.style.removeProperty('--bg-secondary');
            document.documentElement.style.removeProperty('--text-primary');
            document.documentElement.style.removeProperty('--text-secondary');
            document.documentElement.style.removeProperty('--border');
            document.documentElement.style.removeProperty('color-scheme');
        }
    }, [theme, themeColor, customBgPrimary, customBgSecondary, customTextPrimary, customTextSecondary, customBorder]);

    return (
        <div className="min-h-screen bg-background text-text flex flex-col font-sans transition-colors duration-300">
            {/* Header - Only show on Tasks and Settings, Calendar has its own header */}
            {currentTab !== 'calendar' && (
                <header className="fixed top-0 w-full z-10 bg-surface/80 backdrop-blur-md border-b border-border p-4 transition-colors duration-300">
                    <h1 className="text-2xl font-bold text-center text-primary">
                        {currentTab === 'tasks' ? 'My Tasks' : 'Settings'}
                    </h1>
                    {currentTab === 'tasks' && (
                        <p className="text-xs text-center text-muted mt-1">
                            {tasks.filter((t) => t.status !== 'done').length} left
                        </p>
                    )}
                </header>
            )}

            {/* Main Content */}
            <main className={clsx(
                "flex-1 overflow-y-auto",
                currentTab !== 'calendar' ? "pt-24 pb-20 px-4" : "pb-20" // Calendar handles its own padding/layout
            )}>
                {currentTab === 'tasks' && <TaskList />}
                {currentTab === 'calendar' && <CalendarPage />}
                {currentTab === 'settings' && <SettingsPage />}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full h-[84px] bg-surface border-t border-border px-2 flex justify-around items-center z-20 safe-area-bottom transition-colors duration-300">
                <button
                    onClick={() => setCurrentTab('tasks')}
                    className={clsx(
                        "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[64px]",
                        currentTab === 'tasks' ? "text-primary" : "text-muted hover:text-text"
                    )}
                >
                    <ListTodo size={24} />
                    <span className="text-xs font-semibold">Tasks</span>
                </button>

                <button
                    onClick={() => setCurrentTab('calendar')}
                    className={clsx(
                        "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[64px]",
                        currentTab === 'calendar' ? "text-primary" : "text-muted hover:text-text"
                    )}
                >
                    <Calendar size={24} />
                    <span className="text-xs font-semibold">Calendar</span>
                </button>

                <button
                    onClick={() => setCurrentTab('settings')}
                    className={clsx(
                        "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[64px]",
                        currentTab === 'settings' ? "text-primary" : "text-muted hover:text-text"
                    )}
                >
                    <Settings size={24} />
                    <span className="text-xs font-semibold">Settings</span>
                </button>
            </nav>
        </div>
    );
}

export default App;
