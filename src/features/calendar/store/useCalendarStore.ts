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

export const useCalendarStore = create<CalendarState>()(
    persist(
        (set) => ({
            events: [],
            addEvent: (eventData) => set((state) => {
                const newEvents: CalendarEvent[] = [];
                const baseEvent = { ...eventData, id: crypto.randomUUID() };
                newEvents.push(baseEvent);

                // Handle Birthdays/Holidays recurrence (simple implementation: generate next 5 years)
                if (eventData.type === 'birthday' || eventData.type === 'holiday') {
                    for (let i = 1; i <= 5; i++) {
                        newEvents.push({
                            ...baseEvent,
                            id: crypto.randomUUID(),
                            startDate: addYears(eventData.startDate, i),
                            endDate: addYears(eventData.endDate, i),
                            isRecurring: true,
                            recurrenceType: 'yearly'
                        });
                    }
                }
                return { events: [...state.events, ...newEvents] };
            }),
            deleteEvent: (id) => set((state) => ({
                events: state.events.filter((e) => e.id !== id),
            })),
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
            storage: createJSONStorage(() => localStorage),
        }
    )
);
