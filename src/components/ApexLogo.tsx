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
            style={{ filter: "drop-shadow(0px 0px 5px currentColor)" }}
        >
            {/* The Thin Glowing Left Strike */}
            <polygon points="46,16 16,85 21,85 50,16" fill="currentColor" />
            
            {/* The Thick Main Left Body */}
            <polygon points="52,14 24,85 35,85 60,14" fill="currentColor" className="opacity-70" />
            
            {/* The Outer Right Diagonal Beam */}
            <polygon points="55,28 84,85 75,85 48,28" fill="currentColor" className="opacity-50" />
            
            {/* The Central Intersecting Chevron (Crossbar slanting up, folding down) */}
            <polygon points="25,65 65,33 74,85 63,85 56,53 31,73" fill="currentColor" className="opacity-95" />
        </svg>
    );
};
