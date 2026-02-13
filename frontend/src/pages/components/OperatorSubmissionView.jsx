import React from 'react';
import { ShieldCheck, ClipboardCheck, Camera, Clock, User, Briefcase, Calendar } from 'lucide-react';
import RecordViewLayout from './RecordViewLayout';
import RecordTable from './RecordTable';
import { cn } from '../../lib/utils';

export default function OperatorSubmissionView({ submission }) {
    if (!submission) return null;
    const data = submission.data || {};
    const photos = Array.isArray(submission.photos) ? submission.photos : [];

    const checklistItems = [
        { id: 'gauges', label: 'Gauges and Warning Lights' },
        { id: 'filters', label: 'Blow out Filters/ AC Filters/ Grease Machine' },
        { id: 'lights', label: 'Brake and Indicator Lights Operational' },
        { id: 'pins', label: 'Pins - Pivots, Rams, Lift Arms, Bucket Pins, Quick Release' },
        { id: 'mirrors', label: 'Mirrors & Windows - Clean and Undamaged' },
        { id: 'spillKit', label: 'Spill kit & First Aid on board or available on onsite' },
        { id: 'horn', label: 'Horn & Flashing Lights operational' },
        { id: 'fluids', label: 'Fluid levels checked & topped up as required (coolant, oils, water, air, fuel)' },
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

    const declarations = [
        { id: 'fitForWork', text: 'I declare that I am Fit for Work. I am not under the influence of drugs, alcohol or any prescribed medications and I am aware of Flowrite Group\'s Zero Tolerance Policy.' },
        { id: 'covid19', text: 'I declare that I have taken precautions to mitigate the spread of COVID-19. I have no flu like symptoms.' },
        { id: 'riskAssessment', text: 'I have performed a visual risk assessment to determine that my work area is safe to work in.' }
    ];

    const isAgreed = (key) => {
        const val = data.declarations?.[key];
        return val === true || val === 'I Agree';
    };

    // 1. DATA MODELING FOR RecordViewLayout
    const metadata = [
        { label: 'Operator', value: data.workerName },
        { label: 'Plant #', value: data.plant || data.plantStr },
        { label: 'Machine HRS', value: data.machineHours },
        { label: 'Date', value: data.date }
    ];

    // 2. DATA MODELING FOR RecordTable
    const tableHeaders = [
        { label: 'Inspection Item', width: 'w-1/2' },
        { label: 'Status', align: 'center', width: 'w-24' },
        { label: 'Notes / Defects' }
    ];

    const tableRows = checklistItems.map(item => {
        const check = data.checklist?.[item.id] || { ok: false, notes: '' };
        return [
            { value: item.label, className: "text-[10px] font-bold text-slate-700 uppercase" },
            { value: check.ok, type: 'status', align: 'center' },
            { value: check.notes || 'No defects observed', className: cn("text-[10px]", !check.notes && "text-slate-300 italic") }
        ];
    });

    return (
        <RecordViewLayout
            title="Operator Daily Pre-Start"
            code="FRG-OPS-001"
            subtitle="Machine Safety & Integrity Protocol"
            metadata={metadata}
            footerData={{ id: submission._id }}
        >
            {/* DECLARATIONS SECTION */}
            <div className="bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden break-inside-avoid">
                <div className="px-3 py-1.5 border-b border-slate-200 bg-white flex items-center gap-2">
                    <ShieldCheck className="text-slate-400" size={12} />
                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Compliance Declarations</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {declarations.map(q => (
                        <div key={q.id} className="p-3 flex justify-between items-center gap-4">
                            <p className="text-[10px] text-slate-600 font-medium italic leading-relaxed max-w-2xl">"{q.text}"</p>
                            <div className={cn(
                                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0",
                                isAgreed(q.id) ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                            )}>
                                {isAgreed(q.id) ? '✓ AGREED' : '✗ DECLINED'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CHECKLIST TABLE */}
            <RecordTable headers={tableHeaders} rows={tableRows} />

            {/* COMMENTS & PHOTOS GRID */}
            <div className="grid grid-cols-2 gap-3 break-inside-avoid">
                <div className="space-y-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 h-full">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Operator Comments</label>
                        <p className="text-[10px] text-slate-700 font-medium leading-relaxed italic">
                            {data.commentsDefect || 'No additional comments or defects reported.'}
                        </p>
                        {data.actionTaken && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2 block">Rectification Actions</label>
                                <p className="text-[10px] text-slate-700 font-medium leading-relaxed">{data.actionTaken}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Visual Evidence</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['photo1', 'photo2', 'photo3', 'photo4'].map(id => {
                            const url = photos.find(p => p.fieldId === id)?.url;
                            return (
                                <div key={id} className="aspect-video bg-white rounded-lg border border-slate-200 overflow-hidden relative">
                                    {url ? (
                                        <img src={url} className="w-full h-full object-cover" alt="Inspection" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-10">
                                            <Camera size={16} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* SIGNATURE BLOCK */}
            <div className="grid grid-cols-2 gap-4 mt-2 break-inside-avoid">
                <div className="space-y-2">
                    <div className="h-20 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-2">
                        {submission.signature ? (
                            <img src={submission.signature} className="max-h-full mix-blend-multiply" alt="Signature" />
                        ) : (
                            <span className="text-[9px] font-black text-slate-300 uppercase italic">Pending Signature</span>
                        )}
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] font-black text-slate-900 uppercase">{data.workerName || 'Operator'}</div>
                        <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Digital Auth : {data.time}</div>
                    </div>
                </div>

                {(data.supervisorSignature || submission.supervisorSignature) && (
                    <div className="space-y-2">
                        <div className="h-20 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-2">
                            <img src={data.supervisorSignature || submission.supervisorSignature} className="max-h-full mix-blend-multiply" alt="Supervisor" />
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Verified by Site Manager</div>
                            <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Official Supervisor</div>
                        </div>
                    </div>
                )}
            </div>
        </RecordViewLayout>
    );
}
