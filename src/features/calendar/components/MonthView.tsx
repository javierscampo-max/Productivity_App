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
    subMonths,
    startOfDay,
    endOfDay,
    areIntervalsOverlapping
} from 'date-fns';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useCalendarStore } from '../store/useCalendarStore';

interface MonthViewProps {
    onDayClick: (day: Date) => void;
    onDayDoubleClick: (day: Date) => void;
    selectedDate: Date | null;
}

export const MonthView: React.FC<MonthViewProps> = ({ onDayClick, onDayDoubleClick, selectedDate }) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const { events, deleteEvent } = useCalendarStore((state) => ({
        events: state.events,
        deleteEvent: state.deleteEvent
    }));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    // Get events for specific day (check for overlap)
    const getDayEvents = (day: Date) => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);

        return events.filter(e => {
            return areIntervalsOverlapping(
                { start: e.startDate, end: e.endDate },
                { start: dayStart, end: dayEnd }
            );
        });
    };

    // Get events for the selected date
    const selectedDayEvents = selectedDate
        ? events.filter(e => {
            return areIntervalsOverlapping(
                { start: e.startDate, end: e.endDate },
                { start: startOfDay(selectedDate), end: endOfDay(selectedDate) }
            );
        }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        : [];

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
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => onDayClick(day)}
                            onDoubleClick={() => onDayDoubleClick(day)}
                            className={clsx(
                                'min-h-[60px] relative p-1 border rounded-lg flex flex-col items-center justify-start cursor-pointer transition-all',
                                isSelected
                                    ? 'border-primary bg-primary/20 ring-1 ring-primary'
                                    : isToday
                                        ? 'border-primary/50 bg-primary/5'
                                        : 'border-border hover:bg-surface/50',
                                !isCurrentMonth && 'opacity-30'
                            )}
                        >
                            <span className={clsx('text-sm', isToday && 'font-bold text-primary', isSelected && 'font-bold')}>
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

            {/* Bottom Section: Day's events summary */}
            <div className="mt-4 border-t border-border pt-4 min-h-[100px]">
                {selectedDate ? (
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-text mb-2">
                            Events for {format(selectedDate, 'MMMM d, yyyy')}
                        </h3>
                        {selectedDayEvents.length > 0 ? (
                            <div className="space-y-1">
                                {selectedDayEvents.map(event => (
                                    <div key={event.id} className="flex items-center justify-between gap-2 text-sm bg-surface/50 p-2 rounded border border-border group">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={clsx("w-2 h-2 rounded-full flex-shrink-0", event.type === 'birthday' ? 'bg-pink-400' : 'bg-primary')} />
                                            <span className="text-muted text-xs whitespace-nowrap">
                                                {format(event.startDate, 'HH:mm')} - {format(event.endDate, 'HH:mm')}
                                            </span>
                                            <span className="text-text font-medium truncate">{event.title}</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Delete this event?')) deleteEvent(event.id);
                                            }}
                                            className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted italic">No events scheduled.</p>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted mb-2">Select a day to view details</p>
                )}
            </div>
        </div>
    );
};
