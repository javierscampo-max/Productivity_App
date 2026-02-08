import React from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useCalendarStore } from '../store/useCalendarStore';

interface MonthViewProps {
    onDayClick: (day: Date) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({ onDayClick }) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const events = useCalendarStore((state) => state.events);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    // Get events for specific day (just count or presence)
    const getDayEvents = (day: Date) => events.filter(e => isSameDay(e.startDate, day));

    return (
        <div className="flex flex-col h-full bg-black text-white p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-800 rounded-full">
                    <ChevronLeft size={24} className="text-blue-500" />
                </button>
                <h2 className="text-xl font-bold">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-800 rounded-full">
                    <ChevronRight size={24} className="text-blue-500" />
                </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 mb-2 text-center text-gray-500 font-medium text-sm">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
                    <div key={day} className="py-2">{day}</div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 flex-1">
                {calendarDays.map((day) => {
                    const dayEvents = getDayEvents(day);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => onDayClick(day)}
                            className={clsx(
                                'min-h-[60px] relative p-1 border border-gray-800 rounded-lg flex flex-col items-center justify-start cursor-pointer hover:bg-gray-900 transition-colors',
                                !isCurrentMonth && 'opacity-30',
                                isToday && 'border-blue-500 bg-blue-900/20'
                            )}
                        >
                            <span className={clsx('text-sm', isToday && 'font-bold text-blue-400')}>
                                {format(day, 'd')}
                            </span>

                            {/* Event Indicators */}
                            <div className="flex gap-0.5 mt-1 flex-wrap justify-center w-full px-1">
                                {dayEvents.slice(0, 4).map((bgEvent, idx) => ( // Limit dots
                                    <div
                                        key={idx}
                                        className={clsx(
                                            "w-1.5 h-1.5 rounded-full",
                                            bgEvent.type === 'birthday' ? 'bg-pink-500' : 'bg-blue-500'
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Section: Day's events summary? or just Add Event */}
            <div className="mt-4 border-t border-gray-800 pt-4">
                <p className="text-sm text-gray-500 mb-2">Select a day to view details</p>
            </div>
        </div>
    );
};
