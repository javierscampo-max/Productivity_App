import React from 'react';
import {
    format,
    addDays,
    subDays,
    startOfDay,
    endOfDay,
    isWithinInterval,
    differenceInMinutes
} from 'date-fns';
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useCalendarStore } from '../store/useCalendarStore';
import { clsx } from 'clsx';

interface DayViewProps {
    date: Date;
    onBack: () => void;
    onAddEvent: () => void;
}

export const DayView: React.FC<DayViewProps> = ({ date, onBack, onAddEvent }) => {
    const [currentDate, setCurrentDate] = React.useState(date);
    const events = useCalendarStore((state) => state.events);

    // Filter events for this day
    const dayEvents = events.filter((event) => {
        const dayStart = startOfDay(currentDate);
        const dayEnd = endOfDay(currentDate);
        // Check if event overlaps with this day
        return (
            isWithinInterval(event.startDate, { start: dayStart, end: dayEnd }) ||
            isWithinInterval(event.endDate, { start: dayStart, end: dayEnd })
        );
    });

    const nextDay = () => setCurrentDate(addDays(currentDate, 1));
    const prevDay = () => setCurrentDate(subDays(currentDate, 1));

    // Time grid generation (Example: 00:00 to 23:00)
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourHeight = 60; // 60px per hour

    const getEventStyle = (event: any) => {
        const start = event.startDate;
        const end = event.endDate;
        const dayStart = startOfDay(currentDate);

        // Calculate minutes from start of day
        let startMinutes = differenceInMinutes(start, dayStart);
        let duration = differenceInMinutes(end, start);

        // Clamp to 0 if starts before today (multi-day event handling simplified)
        if (startMinutes < 0) {
            duration += startMinutes;
            startMinutes = 0;
        }

        return {
            top: `${(startMinutes / 60) * hourHeight}px`,
            height: `${(duration / 60) * hourHeight}px`,
        };
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="bg-black/90 p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full text-gray-400">
                    <X size={24} />
                </button>

                <div className="flex items-center gap-4">
                    <button onClick={prevDay}><ChevronLeft size={20} className="text-gray-500" /></button>
                    <h2 className="text-xl font-bold text-white">
                        {format(currentDate, 'EEE d, MMM')}
                    </h2>
                    <button onClick={nextDay}><ChevronRight size={20} className="text-gray-500" /></button>
                </div>

                <div className="w-8" /> {/* Spacer for centering */}
            </div>

            {/* Timeline Content */}
            <div className="flex-1 overflow-y-auto relative bg-gray-900/10">
                {/* Grid Lines */}
                {hours.map((hour) => (
                    <div
                        key={hour}
                        className="flex items-start border-b border-gray-800/50"
                        style={{ height: `${hourHeight}px` }}
                    >
                        <span className="w-16 text-xs text-gray-500 text-right pr-2 pt-1">
                            {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                        </span>
                        <div className="flex-1 border-l border-gray-800 h-full relative" />
                    </div>
                ))}

                {/* Events Overlay */}
                <div className="absolute top-0 left-16 right-0 bottom-0 pointer-events-none">
                    {dayEvents.map((event) => (
                        <div
                            key={event.id}
                            className={clsx(
                                "absolute left-1 right-2 rounded px-2 py-1 text-xs border overflow-hidden pointer-events-auto shadow-sm hover:shadow-md transition-shadow cursor-pointer",
                                event.type === 'birthday'
                                    ? 'bg-pink-900/80 border-pink-500 text-pink-100'
                                    : event.type === 'holiday'
                                        ? 'bg-green-900/80 border-green-500 text-green-100'
                                        : 'bg-blue-900/80 border-blue-500 text-blue-100'
                            )}
                            style={getEventStyle(event)}
                            onClick={() => alert(`Event: ${event.title}`)} // Placeholder action
                        >
                            <div className="font-semibold">{event.title}</div>
                            <div>{format(event.startDate, 'HH:mm')} - {format(event.endDate, 'HH:mm')}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Add Button (Middle) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform pointer-events-auto">
                <button
                    onClick={onAddEvent}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-4 shadow-lg active:scale-95 transition-transform"
                >
                    <Plus size={32} />
                </button>
            </div>
        </div>
    );
};
