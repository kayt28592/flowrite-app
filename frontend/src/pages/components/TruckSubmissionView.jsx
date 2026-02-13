import React from 'react';
import RecordViewLayout from './RecordViewLayout';
import RecordTable from './RecordTable';
import { cn } from '../../lib/utils';
import { ShieldCheck, ClipboardCheck, Camera } from 'lucide-react';

export default function TruckSubmissionView({ submission }) {
    if (!submission) return null;
    const data = submission.data || {};
    const checklist = data.checklist || {};
    const covid = data.covid || {};
    const photos = submission.photos || [];

    const checklistItems = [
        { id: 'tyres', label: 'TYRES' },
        { id: 'airCompressor', label: 'AIR COMPRESSOR' },
        { id: 'battery', label: 'BATTERY' },
        { id: 'brakes', label: 'BRAKES' },
        { id: 'clutch', label: 'CLUTCH' },
        { id: 'driveLine', label: 'DRIVE LINE' },
        { id: 'engine', label: 'ENGINE' },
        { id: 'exhaust', label: 'EXHAUST' },
        { id: 'fluidLevels', label: 'FLUID LEVELS' },
        { id: 'axels', label: 'AXELS' },
        { id: 'fuelTanks', label: 'FUEL TANKS' },
        { id: 'mirrors', label: 'MIRRORS' },
        { id: 'suspension', label: 'SUSPENSION' },
        { id: 'starter', label: 'STARTER' },
        { id: 'transmission', label: 'TRANSMISSION' },
        { id: 'wheelsRims', label: 'WHEELS & RIMS/WHEEL NUTS' },
        { id: 'allLights', label: 'ALL LIGHTS' },
        { id: 'fireExtinguisher', label: 'FIRE EXTINGUISHER' },
        { id: 'reflectiveTriangles', label: 'REFLECTIVE TRIANGLES' },
        { id: 'trailerBrakeConnections', label: 'TRAILER BRAKE CONNECTIONS' },
        { id: 'windshieldWipers', label: 'WIPERS & WINDSHIELD' },
        { id: 'oilPressure', label: 'OIL PRESSURE' },
        { id: 'safetyBeacon', label: 'SAFETY BEACON' },
        { id: 'reverseSquawkers', label: 'REVERSE & TIPPING SQUAWKERS' },
        { id: 'firstAidKit', label: 'FIRST AID KIT' },
        { id: 'greasedMachine', label: 'GREASED MACHINE/AIR FILTERS CLEAN' }
    ];

    const covidQuestions = [
        { id: 'q1', text: 'I am not experiencing any flu like signs/symptoms e.g fever, shortness of breath, sore throat or body aches?' },
        { id: 'q2', text: 'I have not been in contact with anyone that has tested positive to COVID-19?' },
        { id: 'q3', text: 'I have not recently traveled or have been in contact with anyone that has traveled to any known hot spots in the last 14 days?' },
        { id: 'q4', text: 'I declare that I am Fit for Work and aware of Flowrite Group\'s Zero Tolerance Policy regarding drugs and alcohol.' },
        { id: 'q5', text: 'I have performed a visual risk assessment to determine that my work area and vehicle are safe for operation.' }
    ];

    // 1. DATA MODELING FOR RecordViewLayout
    const metadata = [
        { label: 'Driver', value: data.workerName || submission.submittedBy?.name },
        { label: 'Asset ID', value: data.asset },
        { label: 'Odometer', value: data.odometer ? `${data.odometer} km` : '-' },
        { label: 'Date/Time', value: `${data.date} ${data.time}` }
    ];

    // 2. DATA MODELING FOR RecordTable
    const tableHeaders = [
        { label: 'System Component', width: 'w-1/2' },
        { label: 'Status', align: 'center', width: 'w-24' },
        { label: 'Audit Notes / Faults' }
    ];

    const tableRows = checklistItems.map(item => {
        const val = checklist[item.id] || { ok: false, notes: '' };
        return [
            { value: item.label, className: "text-[10px] font-bold text-slate-700 uppercase" },
            { value: val.ok, type: 'status', align: 'center' },
            { value: val.notes || 'No faults recorded', className: cn("text-[10px]", !val.notes && "text-slate-300 italic") }
        ];
    });

    return (
        <RecordViewLayout
            title="Truck Pre-Start"
            code="FRG-TP-001"
            subtitle="Official Transport Protocol"
            metadata={metadata}
            footerData={{ id: submission._id }}
        >
            {/* COMPLIANCE DECLARATIONS */}
            <div className="bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden break-inside-avoid">
                <div className="px-3 py-1.5 border-b border-slate-200 bg-white flex items-center gap-2">
                    <ShieldCheck className="text-slate-400" size={12} />
                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Compliance & Health Declarations</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {covidQuestions.map((q) => {
                        const val = covid[q.id] || { ok: false };
                        return (
                            <div key={q.id} className="p-3 flex justify-between items-center gap-4">
                                <p className="text-[10px] text-slate-600 font-medium italic leading-relaxed max-w-2xl">"{q.text}"</p>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0",
                                    val.ok ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                )}>
                                    {val.ok ? '✓ AGREED' : '✗ DECLINED'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CHECKLIST TABLE */}
            <RecordTable headers={tableHeaders} rows={tableRows} />

            {/* COMMENTS & PHOTOS */}
            <div className="grid grid-cols-2 gap-3 break-inside-avoid">
                <div className="space-y-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 h-full">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Fault Description</label>
                        <p className="text-[10px] text-slate-700 font-medium leading-relaxed italic">
                            {data.commentsDefect || 'No defects reported for this inspection cycle.'}
                        </p>
                        {data.actionTaken && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2 block">Corrective Actions</label>
                                <p className="text-[10px] text-slate-700 font-medium leading-relaxed">{data.actionTaken}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Inspection Imagery</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['photo1', 'photo2', 'photo3', 'photo4'].map((id, idx) => {
                            const p = photos.find(photo => photo.fieldId === id);
                            return (
                                <div key={idx} className="aspect-video bg-white rounded-lg border border-slate-200 overflow-hidden relative">
                                    {p ? (
                                        <img src={p.url} className="w-full h-full object-cover" alt="Verification" />
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

            {/* SIGNATURE */}
            <div className="w-1/2 space-y-2 break-inside-avoid">
                <div className="h-20 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-2">
                    {submission.signature ? (
                        <img src={submission.signature} className="max-h-full mix-blend-multiply" alt="Signature" />
                    ) : (
                        <span className="text-[9px] font-black text-slate-300 uppercase italic">Awaiting Signature</span>
                    )}
                </div>
                <div className="text-center">
                    <div className="text-[10px] font-black text-slate-900 uppercase">{data.workerName || 'Driver'}</div>
                    <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Certified Professional Verification</div>
                </div>
            </div>
        </RecordViewLayout>
    );
}
