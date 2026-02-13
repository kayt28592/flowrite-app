import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Shield, Search, Lock, LogIn } from 'lucide-react';

export const C = {
    bg: "#0B0D10",         /* Near-Black */
    bgCard: "#12151B",     /* Surface */
    bgHover: "#161B22",    /* Surface-2 */
    bgSidebar: "#0B0D10",
    border: "rgba(255,255,255,0.08)",
    accent: "#D4AF37",     /* Gold base */
    accentHover: "#F5D76E", /* Gold highlight */
    accentDeep: "#B9962E",  /* Gold deep */
    accentMuted: "rgba(212,175,55,0.1)",
    text: "#F2F4F8",
    textMuted: "#AAB2C0",
    textDim: "#7A8598",
    success: "#22c55e",
    danger: "#ef4444",
    info: "#D4AF37",
};

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, itemType, itemName }) {
    if (!isOpen) return null;
    return createPortal(
        <div
            className="fixed inset-0 bg-background/90 backdrop-blur-3xl flex items-center justify-center z-[1000] p-6 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-card border border-white/5 rounded-[2.5rem] p-10 max-w-sm w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-500 relative overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/20" />
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-8 text-red-500 mx-auto group shadow-inner">
                    <Trash2 size={24} className="group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" />
                </div>
                <h3 className="text-2xl font-black text-white text-center mb-3 font-heading tracking-tighter uppercase leading-none">{title || "Terminate Record"}</h3>
                <p className="text-white/30 text-[11px] font-black uppercase tracking-[0.2em] text-center mb-10 leading-relaxed px-4">
                    Confirm deletion of <br />
                    <span className="text-red-400 mt-2 block bg-red-500/5 py-2 rounded-xl border border-red-500/10">“{itemName}”</span>
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        className="w-full py-4 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 active:scale-[0.98] transition-all shadow-xl shadow-red-500/20 text-xs"
                    >
                        CONFIRM WIPE
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl bg-white/[0.03] text-white/30 font-bold hover:bg-white/[0.08] active:scale-[0.98] transition-all text-xs"
                    >
                        ABORT
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export function StatCard({ label, value, icon, trend }) {
    return (
        <div className="bg-card/40 border border-white/5 rounded-[2rem] p-8 flex items-center gap-6 group hover:bg-card/60 transition-all duration-500 relative overflow-hidden animate-lift">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                {icon}
            </div>
            <div className="flex-1 min-w-0 relative z-10">
                <div className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] mb-2 truncate">{label}</div>
                <div className="text-3xl font-black text-white font-heading truncate tracking-tighter">{value}</div>
            </div>
            {trend != null && (
                <div className={`
                    ml-auto text-[10px] font-black px-3 py-1 rounded-full relative z-10 border transition-all
                    ${trend > 0 ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/5 text-rose-400 border-rose-500/20'}
                `}>
                    {trend > 0 ? "+" : ""}{trend}%
                </div>
            )}
        </div>
    );
}

export function StatusBadge({ status }) {
    const styles = {
        Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        Pending: "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]",
        Draft: "bg-white/[0.02] text-white/20 border-white/5",
        Published: "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]",
        Cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20"
    };

    const style = styles[status] || styles.Draft;

    return (
        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${style} transition-all`}>
            {status}
        </span>
    );
}

export function RoleBadge({ role }) {
    const displayRole = role === 'user' ? 'Staff' : role === 'manager' ? 'Supervisor' : role;

    const getStyles = () => {
        switch (displayRole) {
            case 'admin':
            case 'Administrator':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/30 font-black';
            case 'Supervisor':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
            case 'Staff':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
            default:
                return 'bg-white/[0.02] text-white/30 border-white/5';
        }
    };

    return (
        <span className={`
            inline-flex items-center px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.3em] border transition-all
            ${getStyles()}
        `}>
            {displayRole}
        </span>
    );
}

export function DataTable({ columns, data, actions }) {
    return (
        <div className="bg-card/20 border border-white/5 rounded-[2rem] overflow-hidden shadow-inner">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-white/[0.01] border-b border-white/5">
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className="text-left px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]"
                                >
                                    {col.label}
                                </th>
                            ))}
                            {actions && (
                                <th className="text-right px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                                    Protocol
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {data.length > 0 ? (
                            data.map((row, ri) => (
                                <tr key={ri} className="group hover:bg-white/[0.02] transition-colors duration-200">
                                    {columns.map((col, ci) => (
                                        <td key={ci} className="px-8 py-6 text-sm font-bold text-white/80 tracking-tight">
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-8 py-6 text-right whitespace-nowrap">
                                            <div className="flex justify-end gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all transform lg:translate-x-4 lg:group-hover:translate-x-0">
                                                {actions.filter(a => !a.condition || a.condition(row)).map((a, ai) => (
                                                    <button
                                                        key={ai}
                                                        onClick={() => a.onClick(row)}
                                                        title={a.label}
                                                        className="p-3 rounded-xl bg-white/[0.03] text-white/20 hover:text-primary hover:bg-primary/10 hover:border-primary/20 border border-white/5 transition-all duration-300 active:scale-95 group/btn"
                                                    >
                                                        {React.cloneElement(a.icon, { size: 16, className: "group-hover/btn:scale-110 transition-transform" })}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-8 py-32 text-center">
                                    <div className="flex flex-col items-center gap-6 opacity-10">
                                        <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center">
                                            <Shield size={40} />
                                        </div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.6em]">Zero Frequency Detected</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function SearchBar({ placeholder, value, onChange }) {
    return (
        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 flex-1 max-w-md focus-within:border-primary/30 focus-within:bg-white/[0.04] focus-within:ring-8 focus-within:ring-primary/5 transition-all duration-500 shadow-inner group">
            <Search size={18} className="text-white/10 group-focus-within:text-primary transition-colors duration-500" />
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder || "Search database..."}
                className="bg-transparent border-none outline-none text-white text-sm font-bold w-full placeholder-white/10 font-sans tracking-tight"
            />
        </div>
    );
}

export function TabBar({ tabs, active, onChange }) {
    return (
        <div className="inline-flex gap-2 bg-white/[0.01] rounded-2xl p-2 mb-10 border border-white/5">
            {tabs.map(t => (
                <button
                    key={t.key}
                    onClick={() => !t.locked && onChange(t.key)}
                    disabled={t.locked}
                    className={`
                        px-6 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3 relative overflow-hidden group
                        ${active === t.key
                            ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/20'
                            : t.locked
                                ? 'text-white/5 cursor-not-allowed'
                                : 'text-white/20 hover:text-white hover:bg-white/5'
                        }
                    `}
                >
                    {t.locked ? <Lock size={14} className="opacity-50" /> : <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${active === t.key ? 'bg-primary-foreground shadow-[0_0_10px_white]' : 'bg-white/10 group-hover:bg-primary'}`} />}
                    {t.label}
                </button>
            ))}
        </div>
    );
}

export function LockedBanner({ onLogin }) {
    return (
        <div className="bg-card/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-16 text-center max-w-xl mx-auto my-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group animate-lift">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-10 text-primary relative transform group-hover:rotate-12 transition-transform duration-700 shadow-inner">
                <Shield size={32} />
            </div>
            <h3 className="text-4xl font-black text-white mb-4 font-heading tracking-tighter uppercase leading-none">Access Restricted</h3>
            <p className="text-white/30 text-[11px] font-black uppercase tracking-[0.3em] mb-12 px-12 leading-relaxed">
                Auth Protocol Required — Establish connection to gain system clearance.
            </p>
            <button
                onClick={onLogin}
                className="btn btn-primary inline-flex px-12 py-5 shadow-2xl shadow-primary/20 scale-110"
            >
                <LogIn size={20} /> AUTHORIZE ACCESS
            </button>
        </div>
    );
}

export function NoPermissionBanner() {
    return (
        <div className="bg-rose-500/[0.02] border border-rose-500/10 rounded-[3rem] p-16 text-center max-w-xl mx-auto my-16 shadow-2xl animate-lift">
            <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 flex items-center justify-center mx-auto mb-10 text-rose-500 shadow-inner">
                <Lock size={32} />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 font-heading tracking-tighter uppercase leading-none">Clearance Denied</h3>
            <p className="text-white/20 text-[10px] font-black tracking-[0.6em] px-12 uppercase">
                Insufficient Authorization Level
            </p>
        </div>
    );
}
