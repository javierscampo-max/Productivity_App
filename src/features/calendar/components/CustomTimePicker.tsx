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
    // 60 minutes
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            let top = rect.bottom + 8;
            let left = rect.left;
            
            const popoverWidth = 200; 
            const popoverHeight = 240; 

            if (top + popoverHeight > window.innerHeight) {
                top = rect.top - popoverHeight - 8;
            }

            if (left + popoverWidth > window.innerWidth) {
                left = window.innerWidth - popoverWidth - 16;
            }

            setCoords({ top, left: Math.max(16, left) });
        }
    }, [isOpen]);

    const hourScrollRef = useRef<HTMLDivElement>(null);
    const minuteScrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to center the currently selected time so user doesn't have to scroll
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                const hourEl = document.getElementById(`hour-${h}`);
                if (hourEl && hourScrollRef.current) {
                    const topPos = hourEl.offsetTop - (hourScrollRef.current.offsetHeight / 2) + (hourEl.offsetHeight / 2);
                    hourScrollRef.current.scrollTop = topPos;
                }
                const minEl = document.getElementById(`min-${m}`);
                if (minEl && minuteScrollRef.current) {
                    const topPos = minEl.offsetTop - (minuteScrollRef.current.offsetHeight / 2) + (minEl.offsetHeight / 2);
                    minuteScrollRef.current.scrollTop = topPos;
                }
            }, 10);
        }
    }, [isOpen, h, m]);

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
                    <div 
                        className="absolute inset-0 bg-transparent" 
                        onClick={closePicker} 
                        onWheel={(e) => e.stopPropagation()} 
                        onTouchMove={(e) => e.stopPropagation()}
                    />
                    
                    <div 
                        className="absolute bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden w-[200px] h-[240px] flex animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/10"
                        style={{ top: coords.top, left: coords.left }}
                    >
                        {/* Hours */}
                        <div 
                            ref={hourScrollRef}
                            className="flex-1 overflow-y-auto border-r border-gray-800 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        >
                            <div className="h-[100px]" /> {/* Padding so first items can be visually centered */}
                            {hours.map(hour => (
                                <button
                                    id={`hour-${hour}`}
                                    key={`h-${hour}`}
                                    type="button"
                                    onClick={() => onChange(`${hour}:${m}`)}
                                    className={clsx(
                                        "w-full text-center py-2.5 text-sm transition-colors cursor-pointer",
                                        hour === h ? "bg-primary text-white font-bold text-base shadow-inner" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    )}
                                >
                                    {hour}
                                </button>
                            ))}
                            <div className="h-[100px]" /> {/* Padding so last items can be visually centered */}
                        </div>
                        
                        {/* Minutes */}
                        <div 
                            ref={minuteScrollRef}
                            className="flex-1 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        >
                            <div className="h-[100px]" />
                            {minutes.map(minute => (
                                <button
                                    id={`min-${minute}`}
                                    key={`m-${minute}`}
                                    type="button"
                                    onClick={() => onChange(`${h}:${minute}`)}
                                    className={clsx(
                                        "w-full text-center py-2.5 text-sm transition-colors cursor-pointer",
                                        minute === m ? "bg-primary text-white font-bold text-base shadow-inner" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    )}
                                >
                                    {minute}
                                </button>
                            ))}
                            <div className="h-[100px]" />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
