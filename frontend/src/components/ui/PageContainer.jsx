import React from 'react';

/**
 * PageContainer Component
 * Consistent page wrapper with navy gradient background and optional particles
 * Based on Welcome Page design system
 */
export default function PageContainer({
    children,
    showParticles = false,
    centered = true,
    className = ''
}) {
    return (
        <div className={`min-h-screen bg-gradient-to-br from-[#0a1628] to-[#1a2f4a] relative overflow-hidden ${className}`}>
            {/* Floating Particles */}
            {showParticles && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="particle absolute w-20 h-20 bg-[#60a5fa]/30 rounded-full animate-float-1" style={{ left: '10%' }} />
                    <div className="particle absolute w-15 h-15 bg-[#60a5fa]/30 rounded-full animate-float-2" style={{ left: '80%' }} />
                    <div className="particle absolute w-25 h-25 bg-[#60a5fa]/30 rounded-full animate-float-3" style={{ left: '50%' }} />
                    <div className="particle absolute w-10 h-10 bg-[#60a5fa]/30 rounded-full animate-float-4" style={{ left: '30%' }} />
                    <div className="particle absolute w-[70px] h-[70px] bg-[#60a5fa]/30 rounded-full animate-float-5" style={{ left: '70%' }} />
                </div>
            )}

            {/* Content */}
            <div className={centered ? 'min-h-screen flex flex-col items-center justify-center' : 'min-h-screen'}>
                {children}
            </div>
        </div>
    );
}
