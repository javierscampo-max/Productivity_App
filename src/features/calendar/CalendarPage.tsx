import React, { useState } from 'react';
import { MonthView } from './components/MonthView';
import { DayView } from './components/DayView';
import { AddEventModal } from './components/AddEventModal';

export const CalendarPage: React.FC = () => {
    const [view, setView] = useState<'month' | 'day'>('month');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setView('day');
    };

    const handleBackToMonth = () => {
        setView('month');
        setSelectedDate(null);
    };

    const handleAddEventClick = () => {
        setIsAddModalOpen(true);
    };

    return (
        <div className="h-full relative">
            {view === 'month' ? (
                <MonthView onDayClick={handleDayClick} />
            ) : (
                selectedDate && (
                    <DayView
                        date={selectedDate}
                        onBack={handleBackToMonth}
                        onAddEvent={() => handleAddEventClick()}
                    />
                )
            )}

            {/* Add Event Modal */}
            <AddEventModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                selectedDate={selectedDate}
            />
        </div>
    );
};
