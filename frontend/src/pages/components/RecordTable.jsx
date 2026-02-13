import React from 'react';
import { cn } from '../../lib/utils';
import { Check, X } from 'lucide-react';

/**
 * Shared Table Component for High-Density Audit Records
 * Logic:
 * - One shared component for Screen & Print
 * - Accepts a 'model' with columns and rows
 */
export default function RecordTable({ headers, rows, className }) {
    return (
        <div className={cn("border border-slate-200/60 rounded-[1rem] overflow-hidden shadow-sm bg-white", className)}>
            <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">
                            {headers.map((header, i) => (
                                <th
                                    key={i}
                                    className={cn(
                                        "px-4 py-2.5 border-b border-slate-100",
                                        header.align === 'center' ? 'text-center' : '',
                                        header.align === 'right' ? 'text-right' : '',
                                        header.width ? header.width : ''
                                    )}
                                >
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, idx) => (
                            <tr
                                key={idx}
                                className={cn(
                                    "group transition-colors break-inside-avoid",
                                    idx % 2 === 1 ? "bg-slate-50/20" : "bg-white"
                                )}
                            >
                                {row.map((cell, cIdx) => (
                                    <td
                                        key={cIdx}
                                        className={cn(
                                            "px-4 py-1.5 text-slate-700",
                                            cell.align === 'center' ? 'text-center' : '',
                                            cell.align === 'right' ? 'text-right' : '',
                                            cell.className || "text-[11px] font-bold"
                                        )}
                                    >
                                        {cell.type === 'status' ? (
                                            <div className={cn(
                                                "w-6 h-6 rounded-md flex items-center justify-center mx-auto transition-all shadow-sm font-black text-white text-[10px]",
                                                cell.value ? "bg-emerald-500 shadow-emerald-500/20" : "bg-rose-500 shadow-rose-500/20"
                                            )}>
                                                {cell.value ? <Check size={12} strokeWidth={4} /> : <X size={12} strokeWidth={4} />}
                                            </div>
                                        ) : cell.type === 'badge' ? (
                                            <div className={cn(
                                                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block",
                                                cell.ok ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                            )}>
                                                {cell.value}
                                            </div>
                                        ) : (
                                            cell.value
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
