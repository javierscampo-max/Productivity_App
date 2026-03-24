import React from 'react';
import { clsx } from 'clsx';

interface ApexLogoProps {
    className?: string;
}

export const ApexLogo: React.FC<ApexLogoProps> = ({ className }) => {
    return (
        <svg 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className={clsx("transition-colors duration-300", className)}
        >
            {/* Left large leg */}
            <path d="M48 10 L15 90 L30 90 L55 30 Z" fill="currentColor" />
            {/* Right overlapping leg */}
            <path d="M52 20 L85 90 L70 90 L45 35 Z" fill="currentColor" className="opacity-80" />
            {/* Crossbar */}
            <path d="M35 65 L65 65 L60 55 L40 55 Z" fill="currentColor" className="opacity-60" />
        </svg>
    );
};
