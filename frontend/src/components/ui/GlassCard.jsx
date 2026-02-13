import React from 'react';

/**
 * GlassCard Component
 * Reusable glassmorphism card with hover effects
 * Based on Welcome Page design system
 */
export default function GlassCard({
    children,
    className = '',
    hover = true,
    onClick,
    ...props
}) {
    const baseStyles = `
    bg-white/[0.08] 
    backdrop-blur-[20px] 
    border-2 
    border-white/10 
    rounded-[24px] 
    p-8
    transition-all 
    duration-[400ms] 
    ease-[cubic-bezier(0.4,0,0.2,1)]
    relative
    overflow-hidden
  `;

    const hoverStyles = hover ? `
    hover:translate-y-[-15px] 
    hover:scale-[1.02] 
    hover:border-[#60a5fa]/60
    hover:shadow-[0_30px_60px_rgba(96,165,250,0.3)]
    cursor-pointer
  ` : '';

    return (
        <div
            className={`${baseStyles} ${hoverStyles} ${className}`}
            onClick={onClick}
            {...props}
        >
            {/* Gradient overlay on hover */}
            {hover && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#60a5fa]/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
            )}

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
