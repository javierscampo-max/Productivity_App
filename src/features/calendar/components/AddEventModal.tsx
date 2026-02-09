import React, { useState } from 'react';
import { useTaskStore } from '../../tasks/store/useTaskStore';
import { useCalendarStore } from '../store/useCalendarStore';
import { EventType } from '../../../types/event';
import { format, set, startOfDay, addDays, isBefore } from 'date-fns';
import { X, Check } from 'lucide-react';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, selectedDate }) => {
    const [activeTab, setActiveTab] = useState<'event' | 'task'>('event');

    // Event Form State
    const [eventTitle, setEventTitle] = useState('');
    const [eventType, setEventType] = useState<EventType>('normal');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');

    // Task Form State
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [showError, setShowError] = useState(false);

    const tasks = useTaskStore((state) => state.tasks);
    const updateTask = useTaskStore((state) => state.updateTask);
    const addEvent = useCalendarStore((state) => state.addEvent);

    if (!isOpen || !selectedDate) return null;

    const handleConfirm = () => {
        // Basic validation
        if (activeTab === 'event' && !eventTitle.trim()) {
            setShowError(true);
            return;
        }
        if (activeTab === 'task' && !selectedTaskId) return;

        // Construct Date objects
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        let start = set(selectedDate, { hours: startH, minutes: startM });
        let end = set(selectedDate, { hours: endH, minutes: endM });

        // Handle "Birthday" -> All Day
        if (eventType === 'birthday' || eventType === 'holiday') {
            start = startOfDay(selectedDate);
            end = set(selectedDate, { hours: 23, minutes: 59 });
        } else {
            // Handle overnight events (e.g. 11 PM to 1 AM)
            if (isBefore(end, start)) {
                end = addDays(end, 1);
            }
        }

        if (activeTab === 'event') {
            addEvent({
                title: eventTitle,
                startDate: start,
                endDate: end,
                type: eventType,
                isAllDay: eventType === 'birthday' || eventType === 'holiday',
            });
        } else {
            const task = tasks.find(t => t.id === selectedTaskId);
            if (task) {
                addEvent({
                    title: task.title,
                    startDate: start,
                    endDate: end,
                    type: 'task-block', // specific type for tasks on calendar
                    isAllDay: false,
                    relatedTaskId: task.id
                });
                // Update the task's due date to reflect the schedule
                updateTask(task.id, { dueDate: start });
            }
        }

        // Reset and Close
        setEventTitle('');
        setEventType('normal');
        setSelectedTaskId('');
        setShowError(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-end sm:items-center justify-center p-4">
            <div className="bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">Add to {format(selectedDate, 'MMM d')}</h3>
                    <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'event' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
                        onClick={() => setActiveTab('event')}
                    >
                        Event
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'task' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
                        onClick={() => setActiveTab('task')}
                    >
                        Tasks
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 overflow-y-auto">
                    {activeTab === 'event' ? (
                        <>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Type</label>
                                <select
                                    value={eventType}
                                    onChange={(e) => setEventType(e.target.value as EventType)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="birthday">Birthday</option>
                                    <option value="holiday">Holiday</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={eventTitle}
                                    onChange={(e) => {
                                        setEventTitle(e.target.value);
                                        if (e.target.value.trim()) setShowError(false);
                                    }}
                                    placeholder="Event Title"
                                    className={`w-full bg-gray-900 border ${showError ? 'border-red-500' : 'border-gray-700'} rounded px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors`}
                                />
                                {showError && <p className="text-red-500 text-xs mt-1">Title is required</p>}
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Select Task</label>
                            <select
                                value={selectedTaskId}
                                onChange={(e) => setSelectedTaskId(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500"
                            >
                                <option value="">-- Choose a task --</option>
                                {tasks.filter(t => t.status !== 'done').map(task => (
                                    <option key={task.id} value={task.id}>{task.title}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Time Picker (Common) */}
                    {(activeTab === 'task' || (eventType !== 'birthday' && eventType !== 'holiday')) && (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Start</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">End</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleConfirm}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        <Check size={20} />
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
