import { useNavigate, useLocation } from "react-router-dom";
import {
    Home,
    ClipboardList,
    Briefcase,
    Settings,
    LogOut,
    LogIn,
    ChevronLeft,
    Shield,
    User,
    Users,
    Package,
    Archive,
    Box,
    FileText,
    Activity,
    Cpu,
    Clock
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Logo } from "../ui/Logo";

export const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout, hasRole, canAccessPage } = useAuth();

    const navItems = [
        {
            key: "welcome",
            label: "Home Dashboard",
            path: "/",
            icon: <Home size={18} />
        },
        {
            key: "dockets",
            label: "Operations Control",
            path: "/dashboard/dockets",
            icon: <Activity size={18} />
        },
        {
            key: "jobForms",
            label: "Form Engineering",
            path: "/dashboard/job-forms",
            icon: <Cpu size={18} />
        },
        {
            key: "timesheets",
            label: "Work Hours",
            path: "/dashboard/timesheets",
            icon: <Clock size={18} />
        },
        {
            key: "settings",
            label: "Access Control",
            path: "/dashboard/settings",
            icon: <Settings size={18} />,
            allowedRoles: ['admin', 'Administrator']
        },
    ];

    const isActive = (path) => {
        if (path === "/" && location.pathname === "/") return true;
        if (path !== "/" && location.pathname.startsWith(path)) return true;
        return false;
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside
            className={`
                h-full flex flex-col flex-shrink-0 transition-all duration-500 z-[110]
                border-r border-white/5 bg-card/40 backdrop-blur-3xl shadow-[30px_0_60px_-15px_rgba(0,0,0,0.5)]
                ${isOpen ? 'w-72' : 'w-24'}
            `}
        >
            {/* Logo Section */}
            <div className={`
                flex items-center px-6 py-12 mb-4
                ${isOpen ? 'justify-between' : 'justify-center'}
            `}>
                {isOpen ? (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <Logo withText className="scale-110 origin-left" />
                    </div>
                ) : (
                    <div className="cursor-pointer transition-transform hover:scale-110 active:scale-95 duration-500" onClick={toggleSidebar}>
                        <Logo iconOnly className="h-10 w-10" />
                    </div>
                )}
                {isOpen && (
                    <button
                        onClick={toggleSidebar}
                        className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/10 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>
                )}
            </div>

            {/* User Indicator (Condensed) */}
            <div className="px-5 mb-8">
                <div className={`
                    relative rounded-[2rem] border border-white/5 bg-white/[0.01] p-5 transition-all duration-500
                    ${isOpen ? 'opacity-100' : 'opacity-0 scale-90 pointer-events-none absolute -left-full'}
                `}>
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                            {user?.role === 'admin' || user?.role === 'Administrator' ? <Shield size={22} /> : <User size={22} />}
                        </div>
                        <div className="min-w-0">
                            <div className="text-[11px] font-black text-white truncate uppercase tracking-tighter">
                                {user?.name || "Unauthorized"}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{user?.role || "Guest"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map(item => {
                    // Legacy role check
                    if (item.allowedRoles) {
                        const roles = Array.isArray(item.allowedRoles) ? item.allowedRoles : [item.allowedRoles];
                        const hasAccess = roles.some(role => hasRole(role));
                        if (!hasAccess) return null;
                    }

                    // Centralized RBAC check
                    if (!canAccessPage(item.key)) return null;

                    const active = isActive(item.path);

                    return (
                        <button
                            key={item.key}
                            onClick={() => {
                                navigate(item.path);
                                if (window.innerWidth < 1024) toggleSidebar();
                            }}
                            className={`
                                w-full flex items-center gap-4 px-4 py-4 rounded-[1.25rem] transition-all duration-300 group relative
                                ${active
                                    ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/20 font-black'
                                    : 'text-white/20 hover:bg-white/[0.03] hover:text-white font-bold'
                                }
                                ${isOpen ? 'justify-start' : 'justify-center'}
                            `}
                        >
                            <div className={`transition-all duration-300 ${active ? 'scale-110' : 'group-hover:text-primary group-hover:scale-110'}`}>
                                {item.icon}
                            </div>
                            {isOpen && <span className="text-[10px] uppercase tracking-[0.15em]">{item.label}</span>}

                            {active && !isOpen && (
                                <div className="absolute right-0 w-1.5 h-7 bg-primary rounded-l-full shadow-[0_0_20px_rgba(212,175,55,0.6)]" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 space-y-4">
                {isAuthenticated ? (
                    <button
                        onClick={handleLogout}
                        className={`
                            w-full flex items-center gap-4 px-5 py-5 rounded-[1.25rem] text-white/10 hover:bg-red-500/10 hover:text-red-400 transition-all duration-500 font-bold
                            ${isOpen ? 'justify-start' : 'justify-center'}
                        `}
                    >
                        <LogOut size={20} />
                        {isOpen && <span className="text-[10px] uppercase tracking-[0.2em]">Terminate Data Link</span>}
                    </button>
                ) : (
                    <button
                        onClick={() => navigate("/login")}
                        className={`
                            w-full flex items-center gap-4 px-5 py-5 rounded-[1.25rem] bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 font-black
                            ${isOpen ? 'justify-start' : 'justify-center'}
                        `}
                    >
                        <LogIn size={20} />
                        {isOpen && <span className="text-[10px] uppercase tracking-[0.2em]">Establish Link</span>}
                    </button>
                )}

                {isOpen && (
                    <div className="px-2 pt-2 text-[8px] font-black text-white/10 uppercase tracking-[0.6em] text-center">
                        V2.0.1-INDUSTRIAL-STABLE
                    </div>
                )}
            </div>

        </aside>
    );
};
