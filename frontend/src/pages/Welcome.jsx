import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    Shield,
    User,
    Lock,
    LogIn,
    LogOut,
    ExternalLink,
    Zap,
    ClipboardList,
    Clock
} from "lucide-react";

import { Logo } from "../components/ui/Logo";
import { timesheetAPI } from "../api/axios";

export default function Welcome() {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    const [hovered, setHovered] = useState(null);

    const onNavigate = (path) => {
        if (path === 'docket') navigate('/dashboard/dockets', { state: { tab: 'fill' } });
        if (path === 'job') navigate('/dashboard/job-forms');
        if (path === 'timesheets') navigate('/dashboard/timesheets');
    };

    const [stats, setStats] = useState({ thisWeekHours: 0, pendingCount: 0 });

    useEffect(() => {
        if (isAuthenticated) {
            timesheetAPI.getStats()
                .then(res => setStats(res.data.data))
                .catch(err => console.error("Stats fetch failed", err));
        }
    }, [isAuthenticated]);

    const onLoginClick = () => navigate('/login');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden font-sans bg-background">

            {/* Header / Top Navigation */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-6 md:p-8 z-50 w-full max-w-7xl mx-auto">
                <div />

                {isAuthenticated ? (
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md animate-in slide-in-from-top duration-700">
                        <div className="flex items-center gap-3 pl-3 pr-2 border-r border-white/10 mr-1">
                            <div className="hidden sm:block text-right">
                                <div className="text-[13px] font-black text-white leading-tight">{user?.name || "User"}</div>
                                <div className="text-[10px] text-white/40 font-bold tracking-tight uppercase">{user?.role}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden shadow-inner">
                                {user?.role === "admin" ? <Shield size={20} /> : <User size={20} />}
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-white/5 hover:bg-rose-500/10 text-white/40 hover:text-rose-400 p-2.5 rounded-xl transition-all duration-300 group"
                            title="Sign Out"
                        >
                            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onLoginClick}
                        className="btn btn-primary shadow-xl shadow-primary/20"
                    >
                        <LogIn size={18} /> AGENT LOGIN
                    </button>
                )}
            </div>

            {/* Background Decoration - Navy + Gold highlights */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center">

                <div className="mb-20 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-sm shadow-xl">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Welcome To</span>
                    </div>

                    <div className="relative pt-8 px-6 md:px-0 flex flex-col items-center">
                        <Logo
                            size="hero"
                            withText
                            className="filter drop-shadow-[0_0_80px_rgba(212,175,55,0.2)] animate-float"
                        />
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="mb-20 animate-in fade-in zoom-in duration-800 delay-500">
                    {!isAuthenticated ? (
                        <div className="px-6 py-2 rounded-xl bg-white/[0.01] border border-white/5 text-white/20 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                            <User size={14} className="text-primary/30" /> System access: <span className="text-white/40">GUEST MODE</span>
                        </div>
                    ) : (
                        <div className="px-6 py-2 rounded-xl bg-white/[0.01] border border-primary/10 text-white/30 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                            <Shield size={14} className="text-primary/50" /> Authenticated: <span className="text-primary font-black uppercase tracking-widest">{user?.name}</span>
                        </div>
                    )}
                </div>

                {/* Feature Grid - TRI-SECTION VERSION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-6 animate-in fade-in slide-in-from-bottom-12 duration-1200 delay-300">
                    {[
                        {
                            key: "docket",
                            icon: <Zap size={28} />,
                            badge: "Industrial Log",
                            title: "Docket Form",
                            desc: "Rapid deployment of logistics dockets with automated lookup and secure signature capture.",
                            action: "Open Dashboard"
                        },
                        {
                            key: "job",
                            icon: <ClipboardList size={28} />,
                            badge: "Digital Flow",
                            title: "Job Form",
                            desc: "Convert physical paperwork into flexible digital assets with dynamic logic and cloud sync.",
                            action: "Configure Forms"
                        },
                        {
                            key: "timesheets",
                            icon: <Clock size={28} />,
                            badge: "Time Protocol",
                            title: "Work Hours",
                            desc: `${user?.role === 'user' ? 'Track your active deployment hours' : 'Audit and approve staff deployment hours'}. ${stats.thisWeekHours ? `Total: ${stats.thisWeekHours.toFixed(1)}h` : ''}`,
                            action: stats.pendingCount > 0 ? `${stats.pendingCount} ATTENTION REQD` : "Access Terminal"
                        },
                    ].map((card, idx) => {
                        const isCardHovered = hovered === card.key;

                        return (
                            <div
                                key={card.key}
                                onClick={() => onNavigate(card.key)}
                                onMouseEnter={() => setHovered(card.key)}
                                onMouseLeave={() => setHovered(null)}
                                className={`
                                    group relative cursor-pointer text-left p-8 rounded-[2rem] border transition-all duration-500 overflow-hidden
                                    ${isCardHovered ? 'bg-card/80 border-primary shadow-2xl scale-[1.02]' : 'bg-card/40 border-white/5 shadow-xl'}
                                `}
                            >
                                {/* Subtle gold corner decoration */}
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl transition-opacity duration-500 ${isCardHovered ? 'opacity-100' : 'opacity-0'}`} />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`
                                            w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                                            ${isCardHovered ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 rotate-3' : 'bg-white/5 text-primary'}
                                        `}>
                                            {card.icon}
                                        </div>
                                        <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-white/30">
                                            {card.badge}
                                        </div>
                                    </div>

                                    <h2 className={`text-2xl font-black text-white mb-3 font-heading tracking-tight leading-none transition-colors ${isCardHovered ? 'gold-glow' : ''}`}>
                                        {card.title}
                                    </h2>

                                    <p className="text-white/40 text-sm leading-relaxed mb-8 font-medium line-clamp-2">
                                        {card.desc}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center transition-all duration-500 ${isCardHovered ? 'bg-primary text-primary-foreground border-primary translate-x-1' : 'text-white/20'}`}>
                                                <ArrowRight size={16} />
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isCardHovered ? 'opacity-100 translate-x-1 text-white' : 'opacity-20'}`}>
                                                {card.action}
                                            </span>
                                        </div>
                                        <ExternalLink size={16} className="text-white/10 opacity-0 group-hover:opacity-40 transition-opacity" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer simple - Replaced text with Logo Icon */}
                <div className="mt-24 py-12 flex flex-col items-center gap-6 opacity-30 hover:opacity-100 transition-all duration-700 cursor-default">
                    <Logo iconOnly size="sm" />
                    <p className="text-[8px] font-black uppercase tracking-[0.8em] text-white/20">
                        High Precision Logistics Protocol © 2026
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .gold-glow {
                    text-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
                }
            `}</style>
        </div>
    );
}


const ArrowRight = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);
