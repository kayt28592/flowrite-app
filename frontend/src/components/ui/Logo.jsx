import React from 'react';

/**
 * Logo Component
 * Focuses on a premium industrial logic aesthetic.
 * Usage: <Logo className="h-10" /> or <Logo withText variant="brand" />
 */
export const Logo = ({
    className = "",
    style = {},
    size = "md", // sm, md, lg, xl, hero
    variant = "light" // "light" or "dark"
}) => {
    const sizeMap = {
        sm: "h-6",
        md: "h-8",
        lg: "h-12",
        xl: "h-16",
        hero: "h-24 md:h-40"
    };

    const currentSizeClass = sizeMap[size] || sizeMap.md;

    return (
        <div className={`flex items-center group select-none ${className}`} style={style}>
            <div className="relative group/logo">
                {/* Subtle gold ombre glow behind the logo - only for light variant on dark bg */}
                {variant === 'light' && (
                    <div className="absolute inset-0 bg-primary/20 blur-[45px] rounded-full scale-[1.6] opacity-60 group-hover/logo:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                )}

                <img
                    src={variant === 'dark' ? '/Flowrite-Full-Logo.png' : '/Flowrite-Brandmark-WHITE.png'}
                    alt="Flowrite"
                    className={`${currentSizeClass} w-auto object-contain transition-transform duration-500 group-hover:scale-105 relative z-10`}
                    onError={(e) => {
                        // Fallback to the other one if this one fails
                        if (variant === 'dark') {
                            e.target.src = '/Flowrite-Brandmark-WHITE.png';
                            e.target.classList.add('invert', 'brightness-0');
                        }
                    }}
                />
            </div>
        </div>
    );
};
