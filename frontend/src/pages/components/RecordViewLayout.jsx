import React from 'react';
import { Logo as FlowLogo } from '../../components/ui/Logo';
import { cn } from '../../lib/utils';
import { Clock, Calendar } from 'lucide-react';

/**
 * Unified A4 Layout for Audit Records
 * This component acts as the "Paper Wrapper" (210mm x 297mm)
 * Logic:
 * - Matching the Dockets pattern for 100% parity
 * - One shared component for Screen & Print
 */
export default function RecordViewLayout({
    title,
    code,
    subtitle = "Official Security Protocol",
    metadata = [],
    children,
    footerData
}) {
    return (
        <>
            <style>{`
                /* Print & Screen Parity Styles */
                .record-paper-container {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                @media print {
                    @page {
                        size: A4;
                        margin: 0 !important;
                    }
                    body {
                        background: white !important;
                    }
                    .record-paper {
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 auto !important;
                        padding: 10mm !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: white !important;
                        position: relative !important;
                        box-sizing: border-box !important;
                        border-radius: 0 !important;
                    }
                }

                @media screen {
                    .record-paper {
                        width: 210mm;
                        min-height: 297mm;
                        margin: 0 auto;
                        padding: 15mm;
                        background: white;
                        box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                        border-radius: 1.5rem;
                        box-sizing: border-box;
                    }
                }
            `}</style>

            <div className="record-paper-container w-full bg-slate-100 py-4 md:py-10 print:py-0 print:bg-white min-h-screen no-print:flex no-print:justify-center">
                <div id="record-canvas" className="record-paper flex flex-col gap-3">

                    {/* 1. COMPACT HEADER */}
                    <div className="flex justify-between items-center gap-4 border-b-2 border-slate-900 pb-3 mb-1 break-inside-avoid">
                        <div className="flex flex-col gap-1">
                            <FlowLogo size="md" variant="dark" className="brightness-0" />
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase">
                                <span className="w-5 h-[2px] bg-slate-900" />
                                {subtitle}
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1.5">
                            <div className="px-3 py-1 rounded bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.25em]">
                                {code || 'FRG-RECORD'}
                            </div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
                                {title}
                            </h1>
                        </div>
                    </div>

                    {/* 2. TOP INFO TILES */}
                    <div className="grid grid-cols-4 gap-2 mb-1 break-inside-avoid">
                        {metadata.map((item, i) => (
                            <div key={i} className="bg-slate-50 p-2 rounded-xl border border-slate-200/60 flex flex-col gap-0.5">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                    {item.label}
                                </label>
                                <span className="text-[11px] font-black text-slate-900 block truncate">
                                    {item.value || '-'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* 3. MAIN CONTENT (Tables, Photos, etc.) */}
                    <div className="flex-1 contents">
                        {children}
                    </div>

                    {/* 4. UNIFIED FOOTER */}
                    <div className="mt-auto pt-6 pb-2 border-t border-slate-100 flex flex-col items-center gap-2 opacity-50 break-inside-avoid">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-px bg-slate-300" />
                            <FlowLogo size="xs" variant="dark" className="brightness-0 grayscale" />
                            <div className="w-8 h-px bg-slate-300" />
                        </div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] text-center">
                            Digital Integrity Record • Flowrite Security Protocol • Generated {new Date().toLocaleDateString()}
                        </p>
                        {footerData?.id && (
                            <p className="text-[7px] text-slate-300 font-mono">Reference: {footerData.id}</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
