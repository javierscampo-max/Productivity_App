export type EventType = 'normal' | 'birthday' | 'holiday' | 'task-block';

export interface CalendarEvent {
    id: string;
    title: string;
    startDate: Date; // Start time
    endDate: Date; // End time
    type: EventType;
    isAllDay: boolean;
    relatedTaskId?: string; // If it's a task block
    // Recurrence rule? For now just simple repetitive logic or manual expansion
    isRecurring?: boolean;
    recurrenceType?: 'yearly'; // for birthdays
    seriesId?: string; // To link recurring events together
}
