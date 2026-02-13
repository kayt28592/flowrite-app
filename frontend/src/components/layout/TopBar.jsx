import { useLocation, Link } from "react-router-dom";
import { Bell, Search, User, ChevronRight, Settings, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";

export const TopBar = ({ toggleSidebar }) => {
    const location = useLocation();

    // Simple breadcrumb logic
    const pathnames = location.pathname.split("/").filter((x) => x);

    return (
        <header className="sticky top-0 z-30 w-full h-16 bg-[#0B0F14]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                >
                    <span className="sr-only">Toggle Sidebar</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </button>

                {/* Breadcrumbs */}
                <nav className="hidden sm:flex items-center gap-2 text-sm font-medium">
                    <Link to="/" className="text-slate-500 hover:text-white transition-colors">Home</Link>
                    {pathnames.map((name, index) => {
                        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                        const isLast = index === pathnames.length - 1;
                        const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");

                        return (
                            <div key={name} className="flex items-center gap-2">
                                <ChevronRight size={14} className="text-slate-700" />
                                {isLast ? (
                                    <span className="text-flow-blue font-bold tracking-wide uppercase text-xs">{displayName}</span>
                                ) : (
                                    <Link to={routeTo} className="text-slate-500 hover:text-white transition-colors">
                                        {displayName}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative group hidden lg:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-flow-blue transition-colors" />
                    <input
                        type="text"
                        placeholder="Quick search (⌘K)"
                        className="w-64 h-9 bg-navy-950/50 border border-white/10 rounded-lg pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-flow-blue focus:border-flow-blue transition-all"
                    />
                </div>

                <div className="h-6 w-[1px] bg-white/5 mx-2" />

                <button className="relative p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors group">
                    <Bell className="w-5 h-5 group-hover:animate-pulse" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-flow-blue rounded-full ring-2 ring-[#0B0F14]" />
                </button>

                <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-navy-800 border border-white/10 flex items-center justify-center text-flow-blue font-bold group-hover:border-flow-blue/50 transition-colors">
                        KT
                    </div>
                </div>
            </div>
        </header>
    );
};
