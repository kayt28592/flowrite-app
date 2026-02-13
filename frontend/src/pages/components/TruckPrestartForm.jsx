import React, { useState, useEffect, useRef } from 'react';
import {
    Camera, Save, Check, X, Calendar, Clock, User, Briefcase,
    AlertTriangle, FileText, Image as ImageIcon, PenTool, Hash, Truck, ClipboardCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobFormAPI, dynamicSubmissionAPI } from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { Logo as FlowLogo } from '../../components/ui/Logo';

// Checklist item names from PDF
const TRUCK_CHECKLIST_ITEMS = [
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

const COVID_QUESTIONS = [
    { id: 'q1', text: 'I am not experiencing any flu like signs/sympton e.g fever, shortness of breath, sore throat or body aches?' },
    { id: 'q2', text: 'I have not been in contact with anyone that has tested positive to Covid-19?' },
    { id: 'q3', text: 'I have not recently traveled or have been in contact with anyone that has traveled to any known hot spots either domestically or internationally in the last 14 days?' },
    { id: 'q4', text: 'I have not recently traveled or have been in contact with anyone that has traveled to any known hot spots either domestically or internally in the last 14 days?' },
    { id: 'q5', text: 'I have not recently traveled or have been in contact with anyone that has traveled to any known hot spots either domestically or internally in the last 14 days?' }
];

export default function TruckPrestartForm({ template, onSubmit, loading: submitting, initialData, onSuccess }) {
    const isEditing = !!initialData;
    const [loading, setLoading] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [activePhotoField, setActivePhotoField] = useState(null);

    // Initial state matching PDF data structure but mapped to Backend
    const [formData, setFormData] = useState({
        workerName: '',
        client: '',
        project: '',
        asset: '',
        odometer: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        checklist: TRUCK_CHECKLIST_ITEMS.reduce((acc, item) => ({
            ...acc, [item.id]: { ok: true, notes: '' }
        }), {}),
        covid: COVID_QUESTIONS.reduce((acc, q) => ({
            ...acc, [q.id]: { ok: true }
        }), {}),
        commentsDefect: '',
        actionTaken: '',
        photo1: null,
        photo2: null,
        photo3: null,
        photo4: null,
        signature: null
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                workerName: initialData.workerName || initialData.submittedBy?.name || '',
                client: initialData.data?.client || '',
                project: initialData.data?.project || '',
                asset: initialData.data?.asset || '',
                odometer: initialData.data?.odometer || '',
                date: initialData.data?.date || prev.date,
                time: initialData.data?.time || prev.time,
                checklist: initialData.data?.checklist || prev.checklist,
                covid: initialData.data?.covid || prev.covid,
                commentsDefect: initialData.data?.commentsDefect || '',
                actionTaken: initialData.data?.actionTaken || '',
                photo1: initialData.photos?.find(p => p.fieldId === 'photo1')?.url || null,
                photo2: initialData.photos?.find(p => p.fieldId === 'photo2')?.url || null,
                photo3: initialData.photos?.find(p => p.fieldId === 'photo3')?.url || null,
                photo4: initialData.photos?.find(p => p.fieldId === 'photo4')?.url || null,
                signature: initialData.signature || null
            }));
        }
    }, [initialData]);

    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        if (!isEditing) {
            const timer = setInterval(() => {
                setFormData(prev => ({
                    ...prev,
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
            }, 60000);
            return () => clearInterval(timer);
        }
    }, [isEditing]);

    useEffect(() => {
        window.addEventListener('resize', resizeCanvas);
        setTimeout(resizeCanvas, 100);
        if (initialData?.signature && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            img.src = initialData.signature;
        }
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [initialData]);

    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.parentElement.getBoundingClientRect();
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                tempCtx.drawImage(canvas, 0, 0);
                canvas.width = rect.width;
                canvas.height = rect.height;
                const ctx = canvas.getContext('2d');
                ctx.strokeStyle = '#3B82F6';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
            }
        }
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            const canvas = canvasRef.current;
            setFormData(prev => ({ ...prev, signature: canvas.toDataURL() }));
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setFormData(prev => ({ ...prev, signature: null }));
    };

    const openCamera = (field) => {
        setActivePhotoField(field);
        setShowCameraModal(true);
        setTimeout(async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                toast.error('Unable to access camera');
                setShowCameraModal(false);
            }
        }, 100);
    };

    const closeCamera = () => {
        if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        setShowCameraModal(false);
        setActivePhotoField(null);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [activePhotoField]: reader.result }));
                toast.success('Photo captured!');
                closeCamera();
            };
        }, 'image/jpeg');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.signature) {
            toast.error('Please sign the form before submitting.');
            return;
        }

        const submissionPayload = {
            templateId: template?._id,
            data: {
                workerName: formData.workerName,
                client: formData.client,
                project: formData.project,
                asset: formData.asset,
                odometer: formData.odometer,
                date: formData.date,
                time: formData.time,
                checklist: formData.checklist,
                covid: formData.covid,
                commentsDefect: formData.commentsDefect,
                actionTaken: formData.actionTaken
            },
            photos: [
                { fieldId: 'photo1', url: formData.photo1 },
                { fieldId: 'photo2', url: formData.photo2 },
                { fieldId: 'photo3', url: formData.photo3 },
                { fieldId: 'photo4', url: formData.photo4 }
            ].filter(p => p.url),
            signature: formData.signature,
            submittedBy: { name: formData.workerName }
        };

        if (onSubmit) {
            // Use the passed onSubmit (DynamicForm handler)
            onSubmit(submissionPayload);
        } else {
            // Fallback to internal API call (if rendered directly)
            setLoading(true);
            try {
                if (isEditing) {
                    await dynamicSubmissionAPI.update(initialData._id, submissionPayload);
                    toast.success('Truck Prestart Updated');
                } else {
                    await dynamicSubmissionAPI.create(submissionPayload);
                    toast.success('Truck Prestart Authorized');
                }
                if (onSuccess) onSuccess();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to submit form');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* HEADER MATCHING OPERATOR FORM */}
            <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top duration-700">
                <div className="flex justify-between items-center w-full mb-8">
                    <FlowLogo size="sm" withText className="opacity-80" />
                    <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
                        Official Protocol
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white text-center font-heading tracking-tighter mb-2">
                    TRUCK PRESTART FORM
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* SECTION 1: GENERAL INFO - GRID 4 COLUMNS (Matching Operator Layout) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-4 rounded-2xl space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Worker Name</label>
                        <div className="relative">
                            <User className="absolute left-0 top-1/2 -translate-y-1/2 text-primary/40" size={14} />
                            <input
                                value={formData.workerName}
                                onChange={(e) => setFormData({ ...formData, workerName: e.target.value })}
                                placeholder="Enter name"
                                className="w-full bg-transparent border-none text-white placeholder:text-white/10 text-sm font-bold pl-5 focus:ring-0 focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-4 rounded-2xl space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Client / Project</label>
                        <div className="relative">
                            <Briefcase className="absolute left-0 top-1/2 -translate-y-1/2 text-primary/40" size={14} />
                            <input
                                value={formData.client}
                                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                placeholder="Client name"
                                className="w-full bg-transparent border-none text-white placeholder:text-white/10 text-sm font-bold pl-5 focus:ring-0 focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-4 rounded-2xl space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Asset (Truck)</label>
                        <div className="relative">
                            <Truck className="absolute left-0 top-1/2 -translate-y-1/2 text-primary/40" size={14} />
                            <input
                                value={formData.asset}
                                onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                                placeholder="Rego / ID"
                                className="w-full bg-transparent border-none text-white placeholder:text-white/10 text-sm font-bold pl-5 focus:ring-0 focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-4 rounded-2xl space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Odometer / Date</label>
                        <div className="flex items-center gap-2">
                            <Hash className="text-primary/40" size={14} />
                            <input
                                value={formData.odometer}
                                onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                                placeholder="KMs"
                                className="w-20 bg-transparent border-none text-white placeholder:text-white/10 text-sm font-bold focus:ring-0 focus:outline-none"
                                required
                            />
                            <span className="text-white/10">|</span>
                            <span className="text-[10px] font-bold text-white/40">{formData.date}</span>
                        </div>
                    </div>
                </div>

                {/* COVID SECTION - TABLE STYLE (Matching Operator Declarations) */}
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                    <div className="px-8 py-6 border-b border-white/10 bg-white/[0.02]">
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            COVID-19 DECLARATIONS
                        </h2>
                    </div>
                    <table className="w-full border-collapse">
                        <tbody>
                            {COVID_QUESTIONS.map((q, idx) => (
                                <tr key={q.id} className={cn("border-b border-white/5 last:border-0", idx % 2 === 0 ? "bg-white/[0.01]" : "")}>
                                    <td className="p-6 text-sm text-white/70 leading-relaxed font-medium italic">
                                        "{q.text}"
                                    </td>
                                    <td className="p-6 text-right w-40">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                covid: { ...formData.covid, [q.id]: { ok: !formData.covid[q.id].ok } }
                                            })}
                                            className={cn(
                                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                                formData.covid[q.id].ok
                                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                    : "bg-white/5 text-white/30 border border-white/10 hover:border-white/20"
                                            )}
                                        >
                                            {formData.covid[q.id].ok ? 'AGREE' : 'DISAGREE'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* CHECKLIST TABLE - (Matching Operator Checklist Layout) */}
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                    <div className="px-8 py-6 border-b border-white/10 bg-white/[0.02]">
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <AlertTriangle className="text-primary" size={18} />
                            SAFETY PRE-START CHECKLIST
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Description</th>
                                    <th className="px-8 py-4 text-center text-[10px] font-black text-white/40 uppercase tracking-widest w-24">OK</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Defect / Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {TRUCK_CHECKLIST_ITEMS.map((item, idx) => (
                                    <tr key={item.id} className={cn("border-b border-white/5 last:border-0", idx % 2 === 0 ? "bg-white/[0.01]" : "")}>
                                        <td className="px-8 py-4 text-sm font-bold text-white/80">{item.label}</td>
                                        <td className="px-8 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    checklist: { ...formData.checklist, [item.id]: { ...formData.checklist[item.id], ok: !formData.checklist[item.id].ok } }
                                                })}
                                                className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 mx-auto",
                                                    formData.checklist[item.id].ok
                                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                        : "bg-white/5 border border-white/10 text-white/10"
                                                )}
                                            >
                                                <Check size={18} strokeWidth={4} />
                                            </button>
                                        </td>
                                        <td className="px-8 py-4">
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                                                placeholder="..."
                                                value={formData.checklist[item.id].notes}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    checklist: { ...formData.checklist, [item.id]: { ...formData.checklist[item.id], notes: e.target.value } }
                                                })}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* BOTTOM GRID (Matching Operator Bottom Sections) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Comments & Actions */}
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2rem] p-8 shadow-2xl space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Comments & Defects</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm placeholder:text-white/10 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none min-h-[140px] transition-all resize-none shadow-inner"
                                placeholder="..."
                                value={formData.commentsDefect}
                                onChange={(e) => setFormData({ ...formData, commentsDefect: e.target.value })}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Action Taken</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm placeholder:text-white/10 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none min-h-[140px] transition-all resize-none shadow-inner"
                                placeholder="..."
                                value={formData.actionTaken}
                                onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Photos Grid */}
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-6 block">Verification Photos</label>
                        <div className="grid grid-cols-2 gap-4">
                            {['photo1', 'photo2', 'photo3', 'photo4'].map((id, idx) => (
                                <div key={id} className="relative aspect-square">
                                    {formData[id] ? (
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 group">
                                            <img src={formData[id]} alt="Verification" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                <Button type="button" variant="destructive" size="icon" onClick={() => setFormData({ ...formData, [id]: null })} className="rounded-full">
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => openCamera(id)}
                                            className="w-full h-full border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/20 hover:bg-white/5 hover:border-primary/50 hover:text-primary transition-all group"
                                        >
                                            <Camera size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Slot {idx + 1}</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SIGNATURE SECTION (Matching Operator Signature Layout) */}
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2rem] p-10 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-4">
                            <h2 className="text-xl font-black text-white font-heading tracking-tight leading-tight uppercase italic">
                                Final Certification
                            </h2>
                            <p className="text-sm text-white/40 font-medium leading-[2] border-l-4 border-primary/20 pl-8 bg-primary/[0.02] py-6 rounded-r-2xl">
                                I certify that the above information is true and correct and provided in accordance with site safety protocols. I am fit for work and have checked all equipment.
                            </p>
                            <div className="pt-4 flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                                <Clock size={14} className="text-primary/30" />
                                Logged at <span className="text-white/40">{formData.time}</span> on <span className="text-white/40">{formData.date}</span>
                            </div>
                        </div>

                        <div className="w-full md:w-[400px]">
                            <div className="relative h-48 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-inner group transition-all duration-500 hover:border-primary/30">
                                <canvas
                                    ref={canvasRef}
                                    className="w-full h-full cursor-crosshair z-10 relative"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseOut={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                                {!formData.signature && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                                        <PenTool size={32} className="text-primary mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">SIGN HERE</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={clearSignature}
                                    className="text-[10px] font-black text-rose-500/50 hover:text-rose-500 uppercase tracking-widest transition-colors"
                                >
                                    Clear Signature
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button (Matching Operator Submit Style) */}
                <div className="pt-10 pb-20 max-w-lg mx-auto">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 group"
                    >
                        {loading ? (
                            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
                        ) : (
                            <>
                                {isEditing ? 'COMMIT UPDATES' : 'AUTHORIZE SUBMISSION'}
                                <Check size={20} className="group-hover:scale-110 transition-transform" strokeWidth={3} />
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* Camera Overlay */}
            {showCameraModal && (
                <div className="fixed inset-0 bg-black z-[100] flex flex-col">
                    <div className="relative flex-1 bg-black">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-between items-center z-10">
                            <button type="button" onClick={closeCamera} className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all">
                                <X size={24} />
                            </button>
                            <button type="button" onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center transform active:scale-95 transition-transform shadow-2xl shadow-white/20">
                                <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-900" />
                            </button>
                            <div className="w-14" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
