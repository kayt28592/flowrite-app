import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

export default function GuestLayout({ children, title }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[#0B0F14] text-white flex flex-col font-sans selection:bg-flow-blue/30">
            {/* Header */}
            <header className="bg-navy-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

                    {/* Left: Back Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 text-slate-400 hover:text-white group"
                        title="Back to Welcome Page"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline font-medium text-sm uppercase tracking-wide">Back</span>
                    </button>

                    {/* Center: Brand */}
                    <div
                        className="flex flex-col items-center cursor-pointer group"
                        onClick={() => navigate('/')}
                    >
                        <h1 className="text-2xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform">
                            FLOW<span className="text-flow-blue">RITE</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase hidden sm:block">
                            Flowrite Group Pty Ltd | ACN: 632 294 869
                        </p>
                    </div>

                    {/* Right: Admin Login */}
                    <button
                        onClick={() => navigate('/login', { state: { from: location } })}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:border-white/20"
                    >
                        <Lock size={14} />
                        <span className="hidden sm:inline">Portal Login</span>
                    </button>
                </div>
            </header>

            {/* Page Title Bar */}
            {title && (
                <div className="bg-navy-900/50 border-b border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-1 bg-flow-blue rounded-full"></div>
                            <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider">
                                {title}
                            </h2>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 mt-auto py-8 bg-navy-900/30">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-slate-500 text-xs font-medium tracking-wide"> &copy; {new Date().getFullYear()} Flowrite Group. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
