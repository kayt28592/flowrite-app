import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Printer, Check, Loader2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';

export default function JobFormViewModal({ form, onClose }) {
    if (!form) return null;
    const [isGenerating, setIsGenerating] = useState(false);

    const contentRef = useRef(null);

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
        documentTitle: `${(form.date || 'Date').replace(/[^a-z0-9-]/gi, '_')} - ${(form.workerName || 'JobForm').replace(/[^a-z0-9 ]/gi, '_')}`,
        onBeforePrint: async () => {
            await waitForImages(contentRef.current);
            await new Promise(resolve => setTimeout(resolve, 500));
        },
    });

    const handleDownloadPDF = () => {
        handlePrintTrigger();
    };

    // Helper data for Checklist (Same as Create)
    const checklistItems = [
        { id: 'gauges', label: 'Gauges and Warning Lights. (Engine Oil Pressure, Temperature etc)' },
        { id: 'filters', label: 'Blow out Filters/ AC Filters/ Grease Machine' },
        { id: 'lights', label: 'Brake and Indicator Lights Operational' },
        { id: 'pins', label: 'Pins - Pivots, Rams, Lift Arms, Bucket Pins, Quick Release' },
        { id: 'mirrors', label: 'Mirrors & Windows - Clean and Undamaged' },
        { id: 'spillKit', label: 'Spill kit & First Aid on board or available on onsite' },
        { id: 'horn', label: 'Horn & Flashing Lights operational' },
        { id: 'fluids', label: 'Fluid levels checked & topped up as required' },
        { id: 'steering', label: 'Steering Controls, Wipers, Levers, Buckets' },
        { id: 'groundTool', label: 'Ground Engaging Tools' },
        { id: 'tyres', label: 'Tyres/ Tracks - wear and tear' },
        { id: 'brakes', label: 'Check Brakes (park/foot/retarder/emergency)' },
        { id: 'hydraulics', label: 'Hydraulics - Leaks, Damage, Connections' },
        { id: 'guards', label: 'Guards - In Place, Secure, Warnings' },
        { id: 'steps', label: 'Steps, Handrails & Handholds are operational' },
        { id: 'safetyCutOut', label: 'Safety Cut Out ( E STOP)' },
        { id: 'tieDown', label: 'Tie Down Straps/Chains (if applicable) in good condition' },
        { id: 'extinguisher', label: 'In Date Fire Extinguisher on board' },
        { id: 'alarm', label: 'Travel Alarms operational' },
        { id: 'rops', label: 'ROPS & FOPS' }
    ];

    const modalContent = (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto flex flex-col border border-navy-light">

                {/* Header (No Print) */}
                <div className="flex justify-between items-center p-6 bg-[#1a1f3a] text-white print:hidden relative">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold tracking-wider">JOB FORM DETAILS</h2>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
                            {isGenerating ? 'Generating...' : 'Download PDF'}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Printable Content Wrapper with ID */}
                <div className="p-8 bg-white" ref={contentRef}>
                    <style>{`
                        @media print {
                            @page { size: A4; margin: 0 !important; }
                            body { background: white !important; margin: 0 !important; }
                            .print-container { padding: 15mm !important; }
                            .no-print { display: none !important; }
                            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        }
                    `}</style>

                    {/* Brand Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-end border-b-4 border-[#1a1f3a] pb-4 mb-6">
                            <div>
                                <h1 className="text-4xl font-black text-[#1a1f3a] tracking-wider">FLOWRITE GROUP</h1>
                                <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest">PTY LTD | ACN: 632 294 869</p>
                            </div>
                            <div className="text-right">
                                {/* Date hidden on screen, maybe visible in PDF if desired, but user wants exact match */}
                            </div>
                        </div>

                        {/* Form Title - Centered & Larger */}
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-[#1a1f3a] uppercase tracking-wide decoration-2 underline-offset-4">
                                Operator Daily Pre-Start Form
                            </h2>
                        </div>
                    </div>

                    <div className="space-y-8">

                        {/* SECTION 1: GENERAL INFO */}
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-[#1a1f3a] mb-6 uppercase border-b-2 border-gray-200 pb-2">General Information</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Worker Name</label>
                                    <div className="font-semibold text-gray-900 text-lg border-b border-gray-300 pb-1">{form.workerName}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Plant</label>
                                    <div className="font-semibold text-gray-900 text-lg border-b border-gray-300 pb-1">{form.plant}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Machine HRS</label>
                                    <div className="font-semibold text-gray-900 text-lg border-b border-gray-300 pb-1">{form.machineHours}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Date & Time</label>
                                    <div className="font-semibold text-gray-900 text-lg border-b border-gray-300 pb-1">{form.date} <span className="text-sm text-gray-500 ml-1">{form.time}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: BEFORE START UP (TABLE LAYOUT) */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="bg-[#1a1f3a] px-6 py-3">
                                <h2 className="text-lg font-bold text-white uppercase">Before Start Up Declarations</h2>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-100 text-gray-600 text-xs uppercase border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 font-bold w-[70%]">Declaration Question</th>
                                        <th className="px-6 py-3 font-bold w-[30%] text-center border-l border-gray-200">Operator Response</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="px-6 py-4 text-sm text-gray-800">
                                            I declare that I am Fit for Work. I am not under the influence of drugs, alcohol or any prescribed medications and I am aware of Flowrite Group's Zero Tolerance Policy. I am not fatigued and will be taking the regulated breaks required for my hours worked.
                                        </td>
                                        <td className="px-6 py-4 text-center border-l border-gray-100 font-bold">
                                            <span className={form.declarations?.fitForWork?.includes('Agree') || form.declarations?.fitForWork === 'Yes' ? 'text-green-700 bg-green-50 px-3 py-1 rounded-full' : 'text-red-700 bg-red-50 px-3 py-1 rounded-full'}>
                                                {form.declarations?.fitForWork}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-sm text-gray-800">
                                            I declare that I have taken precautions to mitigate the spread of COVID-19. I have no flu like symptoms and have not returned from overseas travel in the past 14 days. I have not had contact with a confirmed case of COVID-19 in the last 24 hours. If you do not agree with this statement, please call the office on 0402 792 900.
                                        </td>
                                        <td className="px-6 py-4 text-center border-l border-gray-100 font-bold">
                                            <span className={form.declarations?.covid19?.includes('Agree') || form.declarations?.covid19 === 'Yes' ? 'text-green-700 bg-green-50 px-3 py-1 rounded-full' : 'text-red-700 bg-red-50 px-3 py-1 rounded-full'}>
                                                {form.declarations?.covid19}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-sm text-gray-800">
                                            I have performed a visual risk assessment to determine that my work area is safe to work in. I hold the relevant tickets and qualifications to perform this task.
                                        </td>
                                        <td className="px-6 py-4 text-center border-l border-gray-100 font-bold">
                                            <span className={form.declarations?.riskAssessment?.includes('Agree') || form.declarations?.riskAssessment === 'Yes' ? 'text-green-700 bg-green-50 px-3 py-1 rounded-full' : 'text-red-700 bg-red-50 px-3 py-1 rounded-full'}>
                                                {form.declarations?.riskAssessment}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* SECTION 3: CHECKLIST */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="bg-[#1a1f3a] px-6 py-3">
                                <h2 className="text-lg font-bold text-white uppercase">Pre-Start Checklist</h2>
                            </div>

                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-gray-100 text-gray-600 text-xs uppercase border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 font-bold w-[60%]">Item</th>
                                        <th className="px-6 py-3 font-bold w-[10%] text-center border-l border-r border-gray-200">Status</th>
                                        <th className="px-6 py-3 font-bold w-[30%]">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {checklistItems.map((item, idx) => {
                                        const itemData = form.checklist?.[item.id] || { ok: false, notes: '' };
                                        return (
                                            <tr key={item.id} className={!itemData.ok ? "bg-red-50" : "even:bg-gray-50/50"}>
                                                <td className="px-6 py-3 font-medium text-gray-900 border-r border-gray-100">
                                                    {item.label}
                                                </td>
                                                <td className="px-6 py-3 text-center border-r border-gray-100">
                                                    {itemData.ok ? (
                                                        <div className="flex justify-center">
                                                            <Check size={20} className="text-green-600 font-bold" strokeWidth={3} />
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-center">
                                                            <X size={20} className="text-red-500 font-bold" strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-gray-600 italic">
                                                    {itemData.notes}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* SECTION 4: COMMENTS & ACTION */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-sm font-bold text-[#1a1f3a] uppercase mb-4 border-b border-gray-200 pb-2">Comments & Defect</h3>
                                <div className="text-gray-800 whitespace-pre-wrap min-h-[80px]">
                                    {form.commentsDefect || <span className="text-gray-400 italic">No comments provided.</span>}
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-sm font-bold text-[#1a1f3a] uppercase mb-4 border-b border-gray-200 pb-2">Action Taken</h3>
                                <div className="text-gray-800 whitespace-pre-wrap min-h-[80px]">
                                    {form.actionTaken || <span className="text-gray-400 italic">No action taken.</span>}
                                </div>
                            </div>
                        </div>

                        {/* SECTION 5: PHOTOS */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-[#1a1f3a] mb-6 uppercase border-b-2 border-gray-200 pb-2">Photos</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { id: 'photo1', label: 'Damage' },
                                    { id: 'photo2', label: 'Photo 2' },
                                    { id: 'photo3', label: 'Photo 3' },
                                    { id: 'photo4', label: 'Photo 4' }
                                ].map((field) => (
                                    <div key={field.id} className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase block">{field.label}</label>
                                        <div className="relative aspect-video bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
                                            {form.photos?.[field.id] ? (
                                                <img
                                                    src={form.photos[field.id]}
                                                    alt={field.label}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No Photo</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SECTION 6: SIGNATURE */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-lg font-bold text-[#1a1f3a] mb-2 uppercase">Operator Signature</h2>
                                    <p className="text-sm text-gray-500">I certify that the above information is true and correct.</p>
                                </div>
                                <div className="w-64 h-32 border-b-2 border-gray-400 relative">
                                    {form.signature && (
                                        <img src={form.signature} alt="Signature" className="w-full h-full object-contain absolute bottom-0" />
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end mt-2">
                                <p className="text-xs text-gray-400">Signed at {form.time} on {form.date}</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer (No Print) */}
                <div className="p-6 bg-[#1a1f3a] text-white print:hidden text-center text-sm">
                    Flowrite Group - Operator Daily Pre-Start Record
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
}
