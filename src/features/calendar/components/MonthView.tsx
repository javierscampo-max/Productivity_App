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
        <div className="flex flex-col h-full bg-surface text-text p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-surface/50 rounded-full transition-colors">
                    <ChevronLeft size={24} className="text-primary" />
                </button>
                <h2 className="text-xl font-bold">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button onClick={nextMonth} className="p-2 hover:bg-surface/50 rounded-full transition-colors">
                    <ChevronRight size={24} className="text-primary" />
                </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 mb-2 text-center text-muted font-medium text-sm">
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
                                'min-h-[60px] relative p-1 border rounded-lg flex flex-col items-center justify-start cursor-pointer transition-all',
                                isToday
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:bg-surface/50',
                                !isCurrentMonth && 'opacity-30'
                            )}
                        >
                            <span className={clsx('text-sm', isToday && 'font-bold text-primary')}>
                                {format(day, 'd')}
                            </span>

                            {/* Event Indicators */}
                            <div className="flex gap-0.5 mt-1 flex-wrap justify-center w-full px-1">
                                {dayEvents.slice(0, 4).map((bgEvent, idx) => ( // Limit dots
                                    <div
                                        key={idx}
                                        className={clsx(
                                            "w-1.5 h-1.5 rounded-full",
                                            bgEvent.type === 'birthday' ? 'bg-pink-400' : 'bg-primary'
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Section: Day's events summary? or just Add Event */}
            <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm text-muted mb-2">Select a day to view details</p>
            </div>
        </div>
    );
};
