import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ChevronRight, LogIn, Bell, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const getCrumbs = () => {
        const path = location.pathname;
        if (path.includes("/dashboard/submissons")) return ["Home", "Archive Core"];
        if (path.includes("/dashboard/customers")) return ["Home", "Client Registry"];
        if (path.includes("/dashboard/items")) return ["Home", "Commodity Assets"];
        if (path.includes("/dashboard/job-forms")) return ["Home", "Form Engineering"];
        if (path.includes("/dashboard/settings")) return ["Home", "System Protocol"];
        return ["Home", "Operations Control"];
    };

    const crumbs = getCrumbs();

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-slate-200">
            <style>{`
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
            `}</style>

            {/* Sidebar Overlay */}
            <div className={`
                fixed inset-0 z-[100] transition-all duration-500 lg:relative lg:z-10 lg:block
                ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible lg:opacity-100 lg:visible'}
            `}>
                <div
                    className="absolute inset-0 bg-black/80 backdrop-blur-md lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
                <Sidebar
                    isOpen={sidebarOpen}
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Global Background Glows */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                {/* Glass Header */}
                <header className="flex items-center justify-between px-6 lg:px-12 py-5 bg-card/60 backdrop-blur-3xl border-b border-white/5 flex-shrink-0 z-50">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/10 hover:text-white hover:bg-primary/10 hover:border-primary/30 transition-all lg:hidden shadow-inner active:scale-90"
                        >
                            <ChevronRight size={18} className={sidebarOpen ? "rotate-180" : ""} />
                        </button>

                        {/* Breadcrumbs */}
                        <div className="hidden sm:flex items-center gap-4">
                            {crumbs.map((c, i, a) => (
                                <span key={i} className="flex items-center gap-4">
                                    <span
                                        onClick={() => i === 0 && navigate("/")}
                                        className={`text-[9px] font-black uppercase tracking-[0.35em] transition-all ${i === a.length - 1 ? 'text-white' : 'text-white/20 cursor-pointer hover:text-primary'}`}
                                    >
                                        {c}
                                    </span>
                                    {i < a.length - 1 && <div className="w-1 h-1 rounded-full bg-white/5" />}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-5">
                        <button className="hidden sm:flex w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 items-center justify-center text-white/10 hover:text-white hover:bg-white/[0.08] transition-all relative active:scale-95">
                            <Bell size={18} />
                            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                        </button>

                        {!isAuthenticated ? (
                            <button
                                onClick={() => navigate("/login")}
                                className="btn btn-primary !py-2.5 !px-6 !text-[10px] !rounded-2xl"
                            >
                                <LogIn size={15} /> AUTHORIZE
                            </button>
                        ) : (
                            <div className="flex items-center gap-4 pl-5 border-l border-white/5">
                                <div className="text-right hidden md:block">
                                    <div className="text-[11px] font-black text-white leading-none mb-1.5 tracking-tighter uppercase">{user?.name}</div>
                                    <div className="text-[8px] font-black text-white/10 tracking-[0.3em] uppercase leading-none truncate max-w-[120px]">{user?.role} Protocol</div>
                                </div>
                                <div className="group relative">
                                    <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm font-heading shadow-[0_10px_20px_-5px_rgba(212,175,55,0.15)] group-hover:scale-105 group-hover:shadow-primary/20 transition-all cursor-pointer">
                                        {user?.role === 'admin' ? <Shield size={22} /> : user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-4 border-background" />
                                </div>
                            </div>
                        )}
                    </div>
                </header>


                {/* Content */}
                <main className="flex-1 overflow-auto p-6 lg:p-12 custom-scrollbar relative scroll-smooth bg-background">
                    <div className="max-w-7xl mx-auto h-full relative z-10">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
