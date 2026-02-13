import React, { useState, useEffect, useRef } from 'react';
import {
    Camera, Save, Check, X, Calendar, Clock, User, Briefcase,
    AlertTriangle, FileText, Image as ImageIcon, PenTool
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dynamicSubmissionAPI } from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { Logo as FlowLogo } from '../../components/ui/Logo';

export default function JobFormCreate({ onSuccess, initialData, template }) {
    const isEditing = !!initialData;
    const [loading, setLoading] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [activePhotoField, setActivePhotoField] = useState(null); // 'photo1', 'photo2', 'photo3', 'photo4'

    // Form State
    const [formData, setFormData] = useState({
        // Section 1: General Info
        workerName: '',
        plantStr: '', // 'plant' is reserved, using 'plantStr' or just 'plant'
        machineHours: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

        // Section 2: Before Start Up (Declarations)
        declarations: {
            fitForWork: 'I Agree', // Default to 'I Agree' per user request
            covid19: 'I Agree',
            riskAssessment: 'I Agree'
        },

        // Section 3: Pre-Start Checklist (20 items)
        checklist: {
            gauges: { ok: true, notes: '' },
            filters: { ok: true, notes: '' },
            lights: { ok: true, notes: '' },
            pins: { ok: true, notes: '' },
            mirrors: { ok: true, notes: '' },
            spillKit: { ok: true, notes: '' },
            horn: { ok: true, notes: '' },
            fluids: { ok: true, notes: '' },
            steering: { ok: true, notes: '' },
            groundTool: { ok: true, notes: '' },
            tyres: { ok: true, notes: '' },
            brakes: { ok: true, notes: '' },
            hydraulics: { ok: true, notes: '' },
            guards: { ok: true, notes: '' },
            steps: { ok: true, notes: '' },
            safetyCutOut: { ok: true, notes: '' },
            tieDown: { ok: true, notes: '' },
            extinguisher: { ok: true, notes: '' },
            alarm: { ok: true, notes: '' },
            rops: { ok: true, notes: '' }
        },

        // Section 4: Comments & Action
        commentsDefect: '',
        actionTaken: '',

        // Section 5: Photos
        photo1: null, // Damage
        photo2: null,
        photo3: null,
        photo4: null,

        // Section 6: Signature
        signature: null
    });

    // Populate form data if editing
    // Populate form data if editing
    useEffect(() => {
        if (initialData) {
            // Handle both Legacy (JobForm) and New (DynamicSubmission) structures
            const d = initialData.data || initialData;

            // Photos handling
            let p1 = null, p2 = null, p3 = null, p4 = null;
            if (Array.isArray(initialData.photos)) {
                // Dynamic: Array of objects
                p1 = initialData.photos.find(p => p.fieldId === 'photo1')?.url;
                p2 = initialData.photos.find(p => p.fieldId === 'photo2')?.url;
                p3 = initialData.photos.find(p => p.fieldId === 'photo3')?.url;
                p4 = initialData.photos.find(p => p.fieldId === 'photo4')?.url;
            } else if (initialData.photos) {
                // Legacy: Object
                p1 = initialData.photos.photo1;
                p2 = initialData.photos.photo2;
                p3 = initialData.photos.photo3;
                p4 = initialData.photos.photo4;
            }

            setFormData(prev => ({
                ...prev,
                workerName: d.workerName || initialData.workerName || '',
                plantStr: d.plant || d.plantStr || initialData.plant || '',
                machineHours: d.machineHours || initialData.machineHours || '',
                date: d.date || initialData.date || prev.date,
                time: d.time || initialData.time || prev.time,
                declarations: d.declarations || initialData.declarations || prev.declarations,
                checklist: d.checklist || initialData.checklist || prev.checklist,
                commentsDefect: d.commentsDefect || initialData.commentsDefect || '',
                actionTaken: d.actionTaken || initialData.actionTaken || '',
                photo1: p1 || null,
                photo2: p2 || null,
                photo3: p3 || null,
                photo4: p4 || null,
                signature: initialData.signature || null
            }));
        }
    }, [initialData]);

    // Signature Refs
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Camera Refs
    const videoRef = useRef(null);

    // Initial Setup (Date/Time update)
    useEffect(() => {
        // Only auto-update time if NOT editing
        if (!isEditing) {
            const timer = setInterval(() => {
                setFormData(prev => ({
                    ...prev,
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
            }, 60000); // Update every minute
            return () => clearInterval(timer);
        }
    }, [isEditing]);

    // Check canvas resize and redraw signature if present
    useEffect(() => {
        window.addEventListener('resize', resizeCanvas);
        setTimeout(resizeCanvas, 100);

        // If editing and has signature, draw it on canvas
        if (initialData?.signature && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = initialData.signature;
        }

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [initialData]);

    // --- Signature Logic ---
    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.parentElement.getBoundingClientRect();
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                // Save current content
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                tempCtx.drawImage(canvas, 0, 0);

                // Resize
                canvas.width = rect.width;
                canvas.height = rect.height;

                // Restore
                const ctx = canvas.getContext('2d');
                ctx.strokeStyle = '#3B82F6'; // Flow Blue for visibility on dark
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

    // --- Camera Logic ---
    const openCamera = (field) => {
        setActivePhotoField(field);
        setShowCameraModal(true);
        setTimeout(async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                toast.error('Unable to access camera');
                setShowCameraModal(false);
            }
        }, 100);
    };

    const closeCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
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
                const base64data = reader.result;
                setFormData(prev => ({ ...prev, [activePhotoField]: base64data }));
                toast.success('Photo captured!');
                closeCamera();
            };
        }, 'image/jpeg');
    };

    // --- Handlers ---
    const handleDeclarationChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            declarations: { ...prev.declarations, [key]: value }
        }));
    };

    const handleChecklistChange = (key, field, value) => {
        setFormData(prev => ({
            ...prev,
            checklist: {
                ...prev.checklist,
                [key]: { ...prev.checklist[key], [field]: value }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.signature) {
            toast.error('Please sign the form before submitting.');
            return;
        }

        setLoading(true);

        try {
            // Transform photos to array
            const photos = [
                { fieldId: 'photo1', url: formData.photo1 },
                { fieldId: 'photo2', url: formData.photo2 },
                { fieldId: 'photo3', url: formData.photo3 },
                { fieldId: 'photo4', url: formData.photo4 }
            ].filter(p => p.url);

            const submissionPayload = {
                templateId: template?._id,
                data: {
                    workerName: formData.workerName,
                    plant: formData.plantStr, // Consistent with View expectations
                    plantStr: formData.plantStr, // Kept for safety
                    machineHours: formData.machineHours,
                    date: formData.date,
                    time: formData.time,
                    declarations: formData.declarations,
                    checklist: formData.checklist,
                    commentsDefect: formData.commentsDefect,
                    actionTaken: formData.actionTaken
                },
                photos: photos,
                signature: formData.signature,
                submittedBy: { name: formData.workerName },
                location: { lat: 0, lng: 0 } // Placeholder if not using geo-location
            };

            if (isEditing) {
                // Update existing Dynamic Submission
                await dynamicSubmissionAPI.update(initialData._id, submissionPayload);
                toast.success('Form updated successfully!');
            } else {
                // Create new Dynamic Submission
                await dynamicSubmissionAPI.create(submissionPayload);
                toast.success('Form submitted successfully!');
            }

            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    // Helper data for Checklist
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

    return (
        <div className="space-y-8 pb-20">
            {isEditing && (
                <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-lg">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-500">
                                You are editing an existing record from <strong>{formData.date}</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER MATCHING PDF */}
            <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top duration-700">
                <div className="flex justify-between items-center w-full mb-8">
                    <FlowLogo size="sm" withText className="opacity-80" />
                    <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
                        Official Protocol
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white text-center font-heading tracking-tighter mb-2">
                    OPERATOR DAILY PRE-START FORM
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* SECTION 1: GENERAL INFO - GRID 4 COLUMNS */}
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
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Plant</label>
                        <div className="relative">
                            <Briefcase className="absolute left-0 top-1/2 -translate-y-1/2 text-primary/40" size={14} />
                            <input
                                value={formData.plantStr}
                                onChange={(e) => setFormData({ ...formData, plantStr: e.target.value })}
                                placeholder="e.g. Excavator"
                                className="w-full bg-transparent border-none text-white placeholder:text-white/10 text-sm font-bold pl-5 focus:ring-0 focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-4 rounded-2xl space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Machine HRS</label>
                        <div className="relative">
                            <Clock className="absolute left-0 top-1/2 -translate-y-1/2 text-primary/40" size={14} />
                            <input
                                type="number"
                                value={formData.machineHours}
                                onChange={(e) => setFormData({ ...formData, machineHours: e.target.value })}
                                placeholder="0000.0"
                                className="w-full bg-transparent border-none text-white placeholder:text-white/10 text-sm font-bold pl-5 focus:ring-0 focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-4 rounded-2xl space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Date & Time</label>
                        <div className="flex items-center gap-2">
                            <Calendar className="text-primary/40" size={14} />
                            <span className="text-sm font-bold text-white/60">{formData.date} {formData.time}</span>
                        </div>
                    </div>
                </div>


                {/* SECTION 2: BEFORE START UP - TABLE STYLE */}
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                    <div className="px-8 py-6 border-b border-white/10 bg-white/[0.02]">
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <AlertTriangle className="text-primary" size={18} />
                            BEFORE START UP DECLARATIONS
                        </h2>
                    </div>
                    <div className="p-0">
                        <table className="w-full border-collapse">
                            <tbody>
                                {[
                                    { id: 'fitForWork', text: 'I declare that I am Fit for Work. I am not under the influence of drugs, alcohol or any prescribed medications and I am aware of Flowrite Group\'s Zero Tolerance Policy.' },
                                    { id: 'covid19', text: 'I declare that I have taken precautions to mitigate the spread of COVID-19. I have no flu like symptoms.' },
                                    { id: 'riskAssessment', text: 'I have performed a visual risk assessment to determine that my work area is safe to work in.' }
                                ].map((item, idx) => (
                                    <tr key={item.id} className={cn("border-b border-white/5 last:border-0", idx % 2 === 0 ? "bg-white/[0.01]" : "")}>
                                        <td className="p-6 text-sm text-white/70 leading-relaxed font-medium">
                                            {item.text}
                                        </td>
                                        <td className="p-6 text-right w-40">
                                            <button
                                                type="button"
                                                onClick={() => handleDeclarationChange(item.id, formData.declarations[item.id] === 'I Agree' ? 'I Do Not Agree' : 'I Agree')}
                                                className={cn(
                                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                                    formData.declarations[item.id] === 'I Agree'
                                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                        : "bg-white/5 text-white/30 border border-white/10 hover:border-white/20"
                                                )}
                                            >
                                                {formData.declarations[item.id] === 'I Agree' ? 'I AGREE ✓' : 'I AGREE'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* SECTION 3: CHECKLIST - PDF STYLE */}
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                    <div className="px-8 py-6 border-b border-white/10 bg-white/[0.02]">
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <Check className="text-primary" size={18} />
                            PRE-START CHECKLIST
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Item Description</th>
                                    <th className="px-8 py-4 text-center text-[10px] font-black text-white/40 uppercase tracking-widest w-24">Status</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Notes / Defect Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {checklistItems.map((item, idx) => (
                                    <tr key={item.id} className={cn("border-b border-white/5 last:border-0", idx % 2 === 0 ? "bg-white/[0.01]" : "")}>
                                        <td className="px-8 py-4 text-sm font-bold text-white/80">{item.label}</td>
                                        <td className="px-8 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleChecklistChange(item.id, 'ok', !formData.checklist[item.id].ok)}
                                                className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
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
                                                placeholder="Add note if required..."
                                                value={formData.checklist[item.id].notes}
                                                onChange={(e) => handleChecklistChange(item.id, 'notes', e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* SECTION 4 & 5 & 6: BOTTOM GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Notes & Actions */}
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2rem] p-8 shadow-2xl space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Comments & Defect</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm placeholder:text-white/10 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none min-h-[140px] transition-all"
                                placeholder="..."
                                value={formData.commentsDefect}
                                onChange={(e) => setFormData({ ...formData, commentsDefect: e.target.value })}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Action Taken</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm placeholder:text-white/10 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none min-h-[140px] transition-all"
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
                            {[
                                { id: 'photo1', label: 'Damage' },
                                { id: 'photo2', label: 'Photo 2' },
                                { id: 'photo3', label: 'Photo 3' },
                                { id: 'photo4', label: 'Photo 4' }
                            ].map((field) => (
                                <div key={field.id} className="relative aspect-square">
                                    {formData[field.id] ? (
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 group">
                                            <img
                                                src={typeof formData[field.id] === 'string' ? formData[field.id] : URL.createObjectURL(formData[field.id])}
                                                alt="Verification"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                <Button type="button" variant="destructive" size="icon" onClick={() => setFormData({ ...formData, [field.id]: null })} className="rounded-full">
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => openCamera(field.id)}
                                            className="w-full h-full border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/20 hover:bg-white/5 hover:border-primary/50 hover:text-primary transition-all group"
                                        >
                                            <Camera size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">{field.label}</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SIGNATURE SECTION */}
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2rem] p-10 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-4">
                            <h2 className="text-xl font-black text-white font-heading tracking-tight leading-tight">
                                OPERATOR SIGNATURE
                            </h2>
                            <p className="text-sm text-white/40 font-medium leading-relaxed max-w-md">
                                I certify that the above information is true and correct and provided in accordance with the site safety management plan.
                            </p>
                            <div className="pt-4 flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                                <Clock size={14} className="text-primary/30" />
                                Signed at <span className="text-white/40">{formData.time}</span> on <span className="text-white/40">{formData.date}</span>
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


                {/* Submit Button */}
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

            {/* Camera Modal */}
            {showCameraModal && (
                <div className="fixed inset-0 bg-black z-[100] flex flex-col">
                    <div className="relative flex-1 bg-black">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />

                        {/* Camera Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-between items-center z-10">
                            <button
                                type="button"
                                onClick={closeCamera}
                                className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all"
                            >
                                <X size={24} />
                            </button>

                            <button
                                type="button"
                                onClick={capturePhoto}
                                className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center transform active:scale-95 transition-transform shadow-2xl shadow-white/20"
                            >
                                <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-900" />
                            </button>

                            <div className="w-14" /> {/* Spacer for centering */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

