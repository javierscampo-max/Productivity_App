import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CalendarEvent } from '../../../types/event';
import { addYears, subYears, isBefore, startOfDay } from 'date-fns';

interface CalendarState {
    events: CalendarEvent[];
    addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
    deleteEvent: (id: string) => void;
    cleanupPastEvents: () => void;
    generateRecurringEvents: () => void; // call periodically?
}

// Safe ID generator for environments where crypto.randomUUID might be missing
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const useCalendarStore = create<CalendarState>()(
    persist(
        (set) => ({
            events: [],
            addEvent: (eventData) => set((state) => {
                const newEvents: CalendarEvent[] = [];
                const seriesId = generateId(); // Generate a series ID for this batch

                const baseEvent = {
                    ...eventData,
                    id: generateId(),
                    seriesId: seriesId
                };
                newEvents.push(baseEvent);

                // Handle Birthdays/Holidays recurrence (simple implementation: generate next 5 years)
                if (eventData.type === 'birthday' || eventData.type === 'holiday') {
                    for (let i = 1; i <= 5; i++) {
                        newEvents.push({
                            ...baseEvent,
                            id: generateId(),
                            seriesId: seriesId, // Share the same series ID
                            startDate: addYears(eventData.startDate, i),
                            endDate: addYears(eventData.endDate, i),
                            isRecurring: true,
                            recurrenceType: 'yearly'
                        });
                    }
                }
                return { events: [...state.events, ...newEvents] };
            }),
            deleteEvent: (id) => set((state) => {
                const eventToDelete = state.events.find((e) => e.id === id);
                if (!eventToDelete) return {};

                // If it has a seriesId, delete all events in that series
                if (eventToDelete.seriesId) {
                    return {
                        events: state.events.filter((e) => e.seriesId !== eventToDelete.seriesId),
                    };
                }

                // Fallback for migration or single events without seriesId
                return {
                    events: state.events.filter((e) => e.id !== id),
                };
            }),
            cleanupPastEvents: () => set((state) => {
                const today = startOfDay(new Date());
                return {
                    events: state.events.filter((event) => {
                        // Keep persistent events (birthdays, holidays)
                        if (event.type === 'birthday' || event.type === 'holiday') {
                            // But remove very old recurring events (> 2 years old)
                            if (isBefore(event.endDate, subYears(today, 2))) {
                                return false;
                            }
                            return true;
                        }
                        // Remove standard events/tasks if they ended before today
                        if (isBefore(event.endDate, today)) {
                            return false;
                        }
                        return true;
                    }),
                };
            }),
            generateRecurringEvents: () => {
                // TODO: Implement logic to ensure future years are populated if app opens next year
            }
        }),
        {
            name: 'calendar-storage',
            storage: createJSONStorage(() => localStorage, {
                reviver: (key, value) => {
                    if (key === 'startDate' || key === 'endDate') {
                        return new Date(value as string);
                    }
                    return value;
                },
                replacer: (key, value) => {
                    if (key === 'startDate' || key === 'endDate') {
                        return value; // Standard stringify works for Date
                    }
                    return value;
                }
            }),
        }
    )
);
