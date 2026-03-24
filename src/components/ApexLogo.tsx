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
            style={{ filter: "drop-shadow(0px 0px 4px currentColor)" }}
        >
            {/* Main Left Pillar */}
            <path d="M52 12 L20 85 h13 L59 12 Z" fill="currentColor" />
            
            {/* Secondary Right Pillar/Crossbar */}
            <path d="M42 62 L60 22 L82 85 h-12 L57 42 L48 60 Z" fill="currentColor" className="opacity-80" />
            
            {/* Accent Shard Left */}
            <path d="M22 65 L32 40 h5 L25 65 Z" fill="currentColor" className="opacity-60" />
        </svg>
    );
};
