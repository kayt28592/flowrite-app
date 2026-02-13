import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { dynamicSubmissionAPI, formTemplateAPI } from '../api/axios';
import OperatorSubmissionView from './components/OperatorSubmissionView';
import TruckSubmissionView from './components/TruckSubmissionView';
import { Loader2, Printer, FileDown, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';

export default function DynamicSubmissionPrintPage() {
    const { id } = useParams();
    const [submission, setSubmission] = useState(null);
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const contentRef = useRef(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const subRes = await dynamicSubmissionAPI.getById(id);
                const subData = subRes.data.data || subRes.data;
                setSubmission(subData);

                if (subData.templateId && typeof subData.templateId === 'object') {
                    setTemplate(subData.templateId);
                } else if (subData.templateId) {
                    const tempRes = await formTemplateAPI.getById(subData.templateId);
                    const tempData = tempRes.data.data || tempRes.data.template || tempRes.data;
                    setTemplate(tempData);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
                setError("Failed to load audit data.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchAll();
    }, [id]);

    const waitForImages = async (element) => {
        if (!element) return;
        const images = Array.from(element.getElementsByTagName('img'));
        await Promise.all(images.map(img => {
            if (img.complete) return img.decode ? img.decode().catch(() => { }) : Promise.resolve();
            return new Promise(resolve => {
                img.onload = async () => {
                    if (img.decode) await img.decode().catch(() => { });
                    resolve();
                };
                img.onerror = resolve;
            });
        }));
    };

    const handlePrintTrigger = useReactToPrint({
        contentRef,
        documentTitle: template ? `${template.title.replace(/\s+/g, '_')}_${id.slice(-6)}` : 'Audit_Record',
        onBeforePrint: async () => {
            await waitForImages(contentRef.current);
            // Small delay to ensure layout has settled after images are decoded
            await new Promise(resolve => setTimeout(resolve, 500));
        },
    });

    const handlePrint = () => {
        handlePrintTrigger();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 gap-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="font-bold tracking-widest text-sm opacity-50 uppercase">Loading Audit Record...</p>
            </div>
        );
    }

    if (error || !submission || !template) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 p-10 text-center">
                <div className="text-6xl mb-6">⚠️</div>
                <h1 className="text-2xl font-black mb-2 uppercase tracking-tight">Audit Not Found</h1>
                <button onClick={() => window.close()} className="px-8 py-3 bg-slate-200 rounded-2xl font-bold">CLOSE</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center relative">
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0 !important;
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* FIX CLIPPING: Ensure all parents allow natural height */
                    #root, .min-h-screen {
                        height: auto !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* FLOATING ACTION BAR */}
            <div className="fixed top-6 right-10 flex gap-2 z-[250] no-print">
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-xl bg-white text-slate-900 border border-slate-200 font-bold text-[11px] hover:bg-slate-50 flex items-center gap-2 shadow-sm uppercase tracking-widest"
                >
                    <FileDown size={14} />
                    Export PDF
                </button>
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-[11px] hover:bg-slate-800 flex items-center gap-2 shadow-xl shadow-slate-900/10 uppercase tracking-widest"
                >
                    <Printer size={14} /> Print Audit
                </button>
                <button
                    onClick={() => window.close()}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                >
                    <X size={18} />
                </button>
            </div>

            {/* AUDIT CONTENT */}
            <div ref={contentRef} className="w-full flex justify-center">
                {template.title === "OPERATOR DAILY PRE-START FORM" ? (
                    <OperatorSubmissionView submission={submission} />
                ) : template.title === "TRUCK PRESTART FORM" ? (
                    <TruckSubmissionView submission={submission} />
                ) : (
                    <div className="p-20 text-center max-w-5xl bg-white m-10 rounded-3xl shadow-xl">
                        <h1 className="text-2xl font-black mb-4 uppercase tracking-tight">{template.title}</h1>
                        <div className="text-left bg-slate-50 p-8 rounded-3xl border border-slate-100 font-mono text-sm overflow-auto">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(submission.data, null, 2)}</pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
