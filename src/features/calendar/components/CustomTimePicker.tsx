import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Clock } from 'lucide-react';

interface CustomTimePickerProps {
    value: string; // "HH:mm"
    onChange: (val: string) => void;
}

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [h, m] = value.split(':');

    // Generate 24 hours and 60 minutes (padded with 0)
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    // Handle clicking outside to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleHourClick = (newH: string) => {
        onChange(`${newH}:${m}`);
    };

    const handleMinuteClick = (newM: string) => {
        onChange(`${h}:${newM}`);
    };

    // Scroll to the selected time when opened
    const hourScrollRef = useRef<HTMLDivElement>(null);
    const minuteScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Give it a tiny delay to ensure the DOM is painted
            setTimeout(() => {
                const hIndex = parseInt(h, 10);
                const mIndex = parseInt(m, 10);
                if (hourScrollRef.current) {
                    hourScrollRef.current.scrollTop = hIndex * 36; // Approx 36px per item
                }
                if (minuteScrollRef.current) {
                    minuteScrollRef.current.scrollTop = mIndex * 36;
                }
            }, 10);
        }
    }, [isOpen, h, m]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-full bg-gray-900 border rounded py-2 px-3 text-white outline-none text-sm flex items-center justify-between transition-colors",
                    isOpen ? "border-primary" : "border-gray-700 hover:border-gray-600"
                )}
            >
                <span className="font-medium tracking-wider">{value}</span>
                <Clock size={14} className={isOpen ? "text-primary" : "text-gray-400"} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 flex overflow-hidden h-48 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/10">
                    {/* Hours Column */}
                    <div
                        ref={hourScrollRef}
                        className="flex-1 overflow-y-auto border-r border-gray-800 scroll-smooth pb-32"
                    >
                        {hours.map(hour => (
                            <button
                                key={`h-${hour}`}
                                type="button"
                                onClick={() => handleHourClick(hour)}
                                className={clsx(
                                    "w-full text-center py-2 text-sm transition-colors",
                                    hour === h ? "bg-primary text-white font-bold" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                )}
                            >
                                {hour}
                            </button>
                        ))}
                    </div>
                    {/* Minutes Column */}
                    <div
                        ref={minuteScrollRef}
                        className="flex-1 overflow-y-auto scroll-smooth pb-32"
                    >
                        {minutes.map(minute => (
                            <button
                                key={`m-${minute}`}
                                type="button"
                                onClick={() => handleMinuteClick(minute)}
                                className={clsx(
                                    "w-full text-center py-2 text-sm transition-colors",
                                    minute === m ? "bg-primary text-white font-bold" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                )}
                            >
                                {minute}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
