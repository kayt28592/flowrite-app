import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Camera, Trash2, PenTool, Check, AlertTriangle, FileText, X, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function DynamicFormRenderer({ template, onSubmit, loading }) {
    const [formData, setFormData] = useState({});
    const [photos, setPhotos] = useState({});
    const [signature, setSignature] = useState(null);
    const [location, setLocation] = useState(null);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const videoRef = useRef(null);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [activePhotoField, setActivePhotoField] = useState(null);

    // Initialize complex state
    useEffect(() => {
        const initialData = {};
        template.fields.forEach(field => {
            if (field.type === 'checklist') {
                initialData[field.id] = {};
                if (field.items) {
                    field.items.forEach(item => {
                        initialData[field.id][item.id] = { ok: true, notes: '' };
                    });
                }
            } else if (field.type === 'declaration') {
                initialData[field.id] = {};
                if (field.items) {
                    field.items.forEach(item => {
                        initialData[field.id][item.id] = '';
                    });
                }
            } else if (field.type === 'date') {
                initialData[field.id] = new Date().toISOString().split('T')[0];
            }
        });
        setFormData(prev => ({ ...prev, ...initialData }));
    }, [template]);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, (err) => {
                console.warn("Location capture skipped:", err.message);
            });
        }
    }, []);

    const handleInputChange = (fieldId, value) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleComplexChange = (fieldId, itemId, subField, value) => {
        setFormData(prev => {
            if (subField) {
                // Checklist: fieldId -> itemId -> { ok, notes }
                return {
                    ...prev,
                    [fieldId]: {
                        ...prev[fieldId],
                        [itemId]: { ...prev[fieldId]?.[itemId], [subField]: value }
                    }
                };
            } else {
                // Declaration: fieldId -> itemId -> value
                return {
                    ...prev,
                    [fieldId]: {
                        ...prev[fieldId],
                        [itemId]: value
                    }
                };
            }
        });
    };

    // Camera Logic
    const openCamera = (fieldId) => {
        setActivePhotoField(fieldId);
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
                setPhotos(prev => ({ ...prev, [activePhotoField]: reader.result }));
                toast.success('Photo captured!');
                closeCamera();
            };
        }, 'image/jpeg');
    };

    // Signature Logic
    // Signature Logic
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.strokeStyle = '#38bdf8'; // flow-blue / light blue
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

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
            setSignature(canvasRef.current.toDataURL());
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignature(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        const missingFields = template.fields
            .filter(f => f.required && f.type !== 'signature' && f.type !== 'checklist' && f.type !== 'declaration' && !formData[f.id])
            .map(f => f.label);

        if (missingFields.length > 0) {
            toast.error(`Please fill: ${missingFields.join(', ')}`);
            return;
        }

        if (template.fields.some(f => f.type === 'signature' && f.required) && !signature) {
            toast.error('Signature is required');
            return;
        }

        onSubmit({
            templateId: template._id,
            data: formData,
            photos: Object.entries(photos).map(([fieldId, url]) => ({ fieldId, url })),
            signature,
            location,
            submittedBy: { name: formData['worker_name'] || 'Anonymous' }
        });
    };

    // Helper to render field content
    const renderField = (field) => {
        switch (field.type) {
            case 'heading':
                return (
                    <div className="flex flex-col mb-4 pt-8">
                        <h3 className="text-xl font-black font-heading text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <FileText className="text-primary" size={20} />
                            {field.label}
                        </h3>
                        <div className="w-12 h-1 bg-primary/30 mt-2 rounded-full" />
                    </div>
                );

            case 'declaration':
                return (
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                        <div className="px-8 py-6 border-b border-white/10 bg-white/[0.02]">
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                <AlertTriangle className="text-primary" size={18} />
                                {field.label}
                            </h2>
                        </div>
                        <div className="p-0">
                            <table className="w-full border-collapse">
                                <tbody>
                                    {field.items?.map((item, idx) => (
                                        <tr key={item.id} className={cn("border-b border-white/5 last:border-0", idx % 2 === 0 ? "bg-white/[0.01]" : "")}>
                                            <td className="p-6 text-sm text-white/70 leading-relaxed font-medium">
                                                {item.label || item.text}
                                            </td>
                                            <td className="p-6 text-right w-40">
                                                <button
                                                    type="button"
                                                    onClick={() => handleComplexChange(field.id, item.id, null, formData[field.id]?.[item.id] === 'I Agree' ? 'I Do Not Agree' : 'I Agree')}
                                                    className={cn(
                                                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                                        formData[field.id]?.[item.id] === 'I Agree'
                                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                            : "bg-white/5 text-white/30 border border-white/10 hover:border-white/20"
                                                    )}
                                                >
                                                    {formData[field.id]?.[item.id] === 'I Agree' ? 'I AGREE ✓' : 'I AGREE'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'checklist':
                return (
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                        <div className="px-8 py-6 border-b border-white/10 bg-white/[0.02]">
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                <Check className="text-primary" size={18} />
                                {field.label}
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Description</th>
                                        <th className="px-8 py-4 text-center text-[10px] font-black text-white/40 uppercase tracking-widest w-24">Status</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {field.items?.map((item, idx) => (
                                        <tr key={item.id} className={cn("border-b border-white/5 last:border-0", idx % 2 === 0 ? "bg-white/[0.01]" : "")}>
                                            <td className="px-8 py-4 text-sm font-bold text-white/80">{item.label}</td>
                                            <td className="px-8 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleComplexChange(field.id, item.id, 'ok', !formData[field.id]?.[item.id]?.ok)}
                                                    className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all duration-300",
                                                        formData[field.id]?.[item.id]?.ok ?? true
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
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all placeholder:text-white/5 font-medium"
                                                    placeholder="Add note..."
                                                    value={formData[field.id]?.[item.id]?.notes || ''}
                                                    onChange={(e) => handleComplexChange(field.id, item.id, 'notes', e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'image':
                return (
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-6 block">{field.label}</label>
                        <div className="relative aspect-video max-w-lg">
                            {photos[field.id] ? (
                                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 group bg-black/50">
                                    <img
                                        src={photos[field.id]}
                                        alt="Captured"
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => setPhotos(prev => {
                                                const n = { ...prev };
                                                delete n[field.id];
                                                return n;
                                            })}
                                            className="rounded-full"
                                        >
                                            <Trash2 size={20} />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => openCamera(field.id)}
                                    className="w-full h-full border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/20 hover:bg-white/5 hover:border-primary/50 hover:text-primary transition-all group"
                                >
                                    <div className="p-4 rounded-full bg-white/5 group-hover:scale-110 transition-transform mb-3">
                                        <Camera size={32} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Capture Verification Photo</span>
                                </button>
                            )}
                        </div>
                    </div>
                );

            case 'signature':
                return (
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2rem] p-10 shadow-2xl">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 space-y-4">
                                <h2 className="text-xl font-black text-white font-heading tracking-tight leading-tight uppercase tracking-widest">
                                    {field.label}
                                </h2>
                                <p className="text-sm text-white/40 font-medium leading-relaxed max-w-sm">
                                    {field.description || "Authenticate this form with an official digital signature. This serves as a binding verification of all entered data."}
                                </p>
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
                                        width={800}
                                        height={300}
                                    />
                                    {!signature && !isDrawing && (
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
                );

            default:
                return (
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-6 rounded-[2rem] space-y-3 transition-all hover:bg-white/[0.04]">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">
                            {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                            <textarea
                                placeholder={field.placeholder || "Enter details..."}
                                required={field.required}
                                value={formData[field.id] || ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm placeholder:text-white/5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none min-h-[140px] transition-all"
                            />
                        ) : field.type === 'select' ? (
                            <div className="relative">
                                <select
                                    required={field.required}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    value={formData[field.id] || ''}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 h-14 text-white text-sm focus:ring-1 focus:ring-primary appearance-none transition-all cursor-pointer font-bold"
                                >
                                    <option value="" className="bg-slate-900">Select an option</option>
                                    {field.options.map(opt => (
                                        <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type={field.type}
                                    placeholder={field.placeholder || "..."}
                                    required={field.required}
                                    value={formData[field.id] || ''}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 h-14 text-white text-sm font-bold placeholder:text-white/5 focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                                />
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Form Glass Header */}
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-primary/10" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                            <Check className="text-primary" size={12} />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Verified Protocol</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white font-heading tracking-tighter leading-none uppercase">
                            {template.title}
                        </h1>
                        <p className="text-white/40 font-medium text-lg max-w-2xl leading-relaxed">
                            {template.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {template.fields.map((field) => (
                    <div key={field.id} className="w-full">
                        {renderField(field)}
                    </div>
                ))}
            </div>

            {/* Submission Anchor */}
            <div className="pt-10 flex flex-col items-center gap-6">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <Button
                    type="submit"
                    disabled={loading}
                    className="h-20 px-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)] transition-all duration-500 hover:scale-[1.02] active:scale-95 gap-4 group w-full md:w-auto"
                >
                    {loading ? (
                        <div className="flex items-center gap-3">
                            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
                            <span>Processing Protocol</span>
                        </div>
                    ) : (
                        <>
                            Authorize Submission
                            <Check size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" strokeWidth={3} />
                        </>
                    )}
                </Button>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">
                    End of Digital Documentation
                </p>
            </div>

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
                                className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all font-black"
                            >
                                <ArrowLeft size={24} />
                            </button>

                            <button
                                type="button"
                                onClick={capturePhoto}
                                className="w-24 h-24 bg-white rounded-full border-[6px] border-white/20 flex items-center justify-center transform active:scale-90 transition-all shadow-2xl shadow-primary/20 group"
                            >
                                <div className="w-16 h-16 bg-white rounded-full border-2 border-slate-900 group-hover:scale-95 transition-transform" />
                            </button>

                            <div className="w-14" />
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};
