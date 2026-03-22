import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { Clock } from 'lucide-react';

interface CustomTimePickerProps {
    value: string; // "HH:mm"
    onChange: (val: string) => void;
}

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const [h, m] = value.split(':');

    // 24 hours
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    // 5-minute increments for cleaner UI (12 items)
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Default placement below the button
            let top = rect.bottom + 8;
            let left = rect.left;
            
            // Basic boundary collision detection
            const popoverWidth = 280; // approximate width of our grid
            const popoverHeight = 310; // approximate height of our grid

            if (top + popoverHeight > window.innerHeight) {
                // Not enough space below, place above
                top = rect.top - popoverHeight - 8;
            }

            if (left + popoverWidth > window.innerWidth) {
                // Not enough space right, align to right edge
                left = window.innerWidth - popoverWidth - 16;
            }

            setCoords({ top, left: Math.max(16, left) });
        }
    }, [isOpen]);

    // This handles clicking "off" the popover. We render a full-screen invisible backdrop portal.
    const closePicker = () => setIsOpen(false);

    return (
        <>
            <button
                ref={buttonRef}
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

            {isOpen && createPortal(
                <div className="fixed inset-0 z-[99999]" style={{ isolation: 'isolate' }}>
                    {/* Invisible backdrop to capture outside clicks and block modal scrolling */}
                    <div 
                        className="absolute inset-0 bg-transparent" 
                        onClick={closePicker} 
                        onWheel={(e) => e.stopPropagation()} 
                        onTouchMove={(e) => e.stopPropagation()}
                    />
                    
                    {/* The actual popover grid */}
                    <div 
                        className="absolute bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4 w-[280px] animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/10"
                        style={{ top: coords.top, left: coords.left }}
                    >
                        <div>
                            <h4 className="text-[10px] text-gray-500 font-bold mb-2 uppercase tracking-wider">Hours</h4>
                            <div className="grid grid-cols-6 gap-1 mb-5">
                                {hours.map(hour => (
                                    <button
                                        key={`h-${hour}`}
                                        type="button"
                                        onClick={() => onChange(`${hour}:${m}`)}
                                        className={clsx(
                                            "py-1.5 rounded-md text-xs font-semibold transition-all",
                                            hour === h ? "bg-primary text-white scale-110 shadow-md" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                        )}
                                    >
                                        {hour}
                                    </button>
                                ))}
                            </div>

                            <div className="h-px bg-gray-800 -mx-4 mb-4" />

                            <h4 className="text-[10px] text-gray-500 font-bold mb-2 uppercase tracking-wider">Minutes</h4>
                            <div className="grid grid-cols-6 gap-1">
                                {/* If current minute isn't exactly a 5-min increment, we can still select it, but we offer 5-min snaps in the grid */}
                                {minutes.map(minute => (
                                    <button
                                        key={`m-${minute}`}
                                        type="button"
                                        onClick={() => {
                                            onChange(`${h}:${minute}`);
                                            closePicker(); // Auto-close when picking a minute is usually nice workflow
                                        }}
                                        className={clsx(
                                            "py-1.5 rounded-md text-xs font-semibold transition-all",
                                            minute === m ? "bg-primary text-white scale-110 shadow-md" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                        )}
                                    >
                                        {minute}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
