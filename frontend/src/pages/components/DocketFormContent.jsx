import React from 'react';
import { createPortal } from 'react-dom';
import {
    Camera,
    FileUp,
    Trash2,
    Check,
    User,
    MapPin,
    Package,
    Layers,
    PenTool,
    Save,
    Plus,
    X,
    Truck,
    Info,
    ArrowRight,
    Lock
} from 'lucide-react';

export default function DocketFormContent({
    formData,
    loading,
    editingSubmissionId,
    handleChange,
    handleSubmit,
    customerSearch,
    setCustomerSearch,
    showCustomerResults,
    setShowCustomerResults,
    filteredCustomers,
    customerDropdownRef,
    orderSearch,
    setOrderSearch,
    showOrderResults,
    setShowOrderResults,
    filteredItems,
    orderDropdownRef,
    showCustomerModal,
    setShowCustomerModal,
    newCustomer,
    setNewCustomer,
    handleCreateCustomer,
    showCameraModal,
    openCamera,
    closeCamera,
    capturePhoto,
    videoRef,
    handleFileChange,
    canvasRef,
    startDrawing,
    draw,
    stopDrawing,
    clearSignature,
    canDoAction
}) {
    const formatUnit = (amount, unit) => {
        const u = unit || 'm³';
        if (u === 'tonne') return Number(amount) === 1 ? 'tonne' : 'tonnes';
        return u;
    };
    const FieldLabel = ({ icon: Icon, label, required }) => (
        <label className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 ml-1">
            <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-primary">
                <Icon size={12} />
            </div>
            {label}
            {required && <span className="text-primary ml-0.5">*</span>}
        </label>
    );

    const inputClasses = "w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-white/10 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-primary/5 outline-none transition-all duration-300 font-medium tracking-tight";

    return (
        <>
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Main Form Body */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-8">

                        {/* Summary for Mobile */}
                        <div className="lg:hidden bg-card/60 border border-primary/20 rounded-2xl p-6 mb-4 backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Truck className="text-primary" size={20} />
                                    <h3 className="font-heading font-black text-lg text-white">Fill Docket</h3>
                                </div>
                                <div className="bg-primary/20 px-3 py-1 rounded-full text-[8px] font-black text-primary uppercase">Step 1 of 3</div>
                            </div>
                        </div>

                        {/* Basic Info Section */}
                        <div className="bg-card/40 border border-white/5 rounded-2xl p-8 md:p-12 shadow-2xl relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none w-full h-full flex justify-end items-start overflow-hidden rounded-2xl">
                                <Info size={120} className="translate-x-10 -translate-y-10" />
                            </div>

                            <div className="flex items-center gap-4 mb-10 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/10">
                                    <Truck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white font-heading tracking-tight leading-none mb-1">Logistics Core</h3>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Identify vehicle and destination</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div className="md:col-span-2 space-y-2">
                                    <FieldLabel icon={Truck} label="Vehicle Registration (Rego)" required />
                                    <input
                                        type="text"
                                        name="rego"
                                        required
                                        placeholder="EX: ABC-1234"
                                        value={formData.rego}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2 relative" ref={customerDropdownRef}>
                                    <FieldLabel icon={User} label="Customer Entity" required />
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <User size={18} className="text-white/20" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search customer database..."
                                                value={formData.customer || customerSearch}
                                                onChange={(e) => {
                                                    setCustomerSearch(e.target.value);
                                                    handleChange({ target: { name: 'customer', value: '' } });
                                                    setShowCustomerResults(true);
                                                }}
                                                onFocus={() => setShowCustomerResults(true)}
                                                className={`${inputClasses} pl-12`}
                                            />
                                            {showCustomerResults && filteredCustomers.length > 0 && (
                                                <div className="absolute z-[100] w-full mt-2 bg-card/95 border border-white/10 shadow-2xl rounded-xl max-h-64 overflow-y-auto custom-scrollbar backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {filteredCustomers.map(c => (
                                                        <div
                                                            key={c._id}
                                                            onClick={() => {
                                                                handleChange({ target: { name: 'customer', value: c.name } });
                                                                setCustomerSearch(c.name);
                                                                setShowCustomerResults(false);
                                                            }}
                                                            className="px-6 py-4 hover:bg-primary/10 cursor-pointer text-sm font-bold text-white/80 border-b border-white/[0.03] last:border-none transition-all flex items-center justify-between group/item"
                                                        >
                                                            <span>{c.name}</span>
                                                            <ArrowRight size={14} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all text-primary" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {(canDoAction('dockets', 'customers', 'create') || canDoAction('dockets', 'docketForm', 'create')) && (
                                            <button
                                                type="button"
                                                onClick={() => setShowCustomerModal(true)}
                                                className="btn btn-secondary !py-4"
                                            >
                                                <Plus size={18} /> <span className="inline">NEW</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <FieldLabel icon={MapPin} label="Site Destination" required />
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        placeholder="Full site address..."
                                        value={formData.address}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Item Details Section */}
                        <div className="bg-card/40 border border-white/5 rounded-2xl p-8 md:p-12 shadow-2xl relative group">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/10">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white font-heading tracking-tight leading-none mb-1">Manifest Details</h3>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Material type and requirements</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 relative" ref={orderDropdownRef}>
                                    <FieldLabel icon={Package} label="Material Type" required />
                                    <input
                                        type="text"
                                        placeholder="Search manifest..."
                                        value={formData.order || orderSearch}
                                        onChange={(e) => {
                                            setOrderSearch(e.target.value);
                                            handleChange({ target: { name: 'order', value: '' } });
                                            setShowOrderResults(true);
                                        }}
                                        onFocus={() => setShowOrderResults(true)}
                                        className={inputClasses}
                                    />
                                    {showOrderResults && filteredItems.length > 0 && (
                                        <div className="absolute z-[100] w-full mt-2 bg-card/95 border border-white/10 shadow-2xl rounded-xl max-h-64 overflow-y-auto custom-scrollbar backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-200">
                                            {filteredItems.map(item => (
                                                <div
                                                    key={item._id}
                                                    onClick={() => {
                                                        handleChange({ target: { name: 'order', value: item.name } });
                                                        handleChange({ target: { name: 'unit', value: item.unit || 'tonne' } });
                                                        setOrderSearch(item.name);
                                                        setShowOrderResults(false);
                                                    }}
                                                    className="px-6 py-4 hover:bg-primary/10 cursor-pointer text-sm font-bold text-white/80 border-b border-white/[0.03] last:border-none transition-all flex items-center justify-between group/item"
                                                >
                                                    {item.name}
                                                    <ArrowRight size={14} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all text-primary" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <FieldLabel icon={Layers} label="Quantitative Volume" required />
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="amount"
                                            required
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            className={`${inputClasses} pr-16`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleChange({ target: { name: 'unit', value: formData.unit === 'm³' ? 'tonne' : 'm³' } })}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/30 uppercase bg-white/5 py-1 px-2 rounded-md hover:bg-white/10 hover:text-white transition-all cursor-pointer z-10"
                                            title="Click to toggle unit"
                                        >
                                            {formData.unit || 'm³'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="bg-card/40 border border-white/5 rounded-2xl p-8 md:p-12 shadow-2xl">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/10">
                                    <Camera size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white font-heading tracking-tight leading-none mb-1">Verification</h3>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Visual evidence and signature</p>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <FieldLabel icon={Camera} label="Manifest Ticket Capture" />
                                    <div className="border border-dashed border-white/10 rounded-2xl p-10 text-center bg-white/[0.02] hover:bg-white/[0.04] hover:border-primary/40 transition-all duration-300 group">
                                        {formData.ticketImage ? (
                                            <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
                                                    <Check size={32} />
                                                </div>
                                                <p className="text-white text-lg font-bold mb-1">Visual Captured</p>
                                                <p className="text-white/40 text-[9px] mb-6 uppercase font-black tracking-widest">File securely attached</p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleChange({ target: { name: 'ticketImage', value: null } })}
                                                    className="px-5 py-2 rounded-lg bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                                                >
                                                    Remove data
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-6 animate-in fade-in duration-500">
                                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto text-white/20 group-hover:scale-110 group-hover:text-primary transition-all duration-300">
                                                    <Camera size={24} />
                                                </div>
                                                <p className="text-white/40 text-sm font-medium">Attach delivery ticket or take photo</p>
                                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                    <label className="btn btn-secondary !py-3 !px-8 text-xs">
                                                        <FileUp size={16} /> UPLOAD
                                                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={openCamera}
                                                        className="btn btn-primary !py-3 !px-8 text-xs"
                                                    >
                                                        <Camera size={16} /> CAMERA
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <FieldLabel icon={PenTool} label="Confirmation Protocol" required />
                                    <div className="bg-white rounded-xl p-1 h-64 relative shadow-2xl overflow-hidden group/canvas ring-2 ring-white/10">
                                        <canvas
                                            ref={canvasRef}
                                            className="w-full h-full rounded-lg cursor-crosshair touch-none bg-white"
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseOut={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                        />
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/canvas:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={clearSignature}
                                                className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-center text-white/20 uppercase font-black tracking-[0.3em] pt-2">Authorized dynamic signature area</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Summary Sticky Card */}
                    <div className="lg:col-span-12 xl:col-span-4 relative">
                        <div className="bg-card border border-primary/20 rounded-2xl p-8 sticky top-24 shadow-2xl overflow-hidden backdrop-blur-3xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

                            <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                                    <Check size={20} />
                                </div>
                                <h3 className="text-xl font-black text-white font-heading tracking-tight">Review</h3>
                            </div>

                            <div className="space-y-6 mb-10 relative z-10">
                                <div>
                                    <div className="text-[9px] font-black text-white/30 uppercase mb-1.5 tracking-widest">Client</div>
                                    <div className={`text-lg font-bold transition-all ${formData.customer ? 'text-white' : 'text-white/10'}`}>
                                        {formData.customer || "Pending..."}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-white/30 uppercase mb-1.5 tracking-widest">Manifest</div>
                                    <div className={`text-lg font-bold transition-all ${formData.order ? 'text-primary' : 'text-white/10'}`}>
                                        {formData.order || "Pending..."}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-white/30 uppercase mb-1.5 tracking-widest">Metrics</div>
                                    <div className={`text-2xl font-black font-heading transition-all ${formData.amount ? 'text-white' : 'text-white/10'}`}>
                                        {formData.amount || "0.00"} <span className={`ml-2 text-xs font-black transition-all ${formData.amount ? 'text-amber-500 uppercase tracking-widest' : 'text-white/20'}`}>{formatUnit(formData.amount, formData.unit)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !canDoAction('dockets', 'docketForm', editingSubmissionId ? 'edit' : 'create')}
                                className={`
                                    btn btn-primary w-full !py-5 !rounded-lg !text-lg
                                    ${(loading || !canDoAction('dockets', 'docketForm', editingSubmissionId ? 'edit' : 'create')) ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:shadow-primary/20 shadow-xl'}
                                `}
                            >
                                {loading ? 'SUBMITTING...' : (
                                    <div className="flex items-center gap-2">
                                        {!canDoAction('dockets', 'docketForm', editingSubmissionId ? 'edit' : 'create') ? <Lock size={20} /> : (editingSubmissionId ? 'UPDATE LOG' : 'SUBMIT')}
                                        <ArrowRight size={20} />
                                    </div>
                                )}
                            </button>

                            <p className="text-[8px] text-center text-white/20 font-black uppercase tracking-[0.4em] mt-6">
                                Sec-Encrypted Gateway
                            </p>
                        </div>
                    </div>
                </form>
            </div>

            {/* Modals - Integrated Theme */}
            {showCustomerModal && createPortal(
                <div
                    className="fixed inset-0 bg-navy-950/90 backdrop-blur-3xl flex items-center justify-center z-[1000] p-6 animate-in fade-in duration-300 overflow-y-auto"
                    onClick={() => setShowCustomerModal(false)}
                >
                    <div
                        className="bg-card border border-white/10 rounded-2xl p-8 md:p-12 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-16 h-16 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
                                <User size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-white font-heading tracking-tight mb-1">New Entity</h3>
                            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">Client Registration</p>
                        </div>

                        <form onSubmit={handleCreateCustomer} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Entity Reference Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCustomer.name}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                        className={inputClasses}
                                        placeholder="Enter company ID..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Comm Endpoint</label>
                                    <input
                                        type="email"
                                        required
                                        value={newCustomer.email}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                        className={inputClasses}
                                        placeholder="office@host.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Phone Relay</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newCustomer.phone}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                        className={inputClasses}
                                        placeholder="0400 ..."
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Global HQ Coordinates</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCustomer.address}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                        className={inputClasses}
                                        placeholder="Physical site address..."
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCustomerModal(false)}
                                    className="btn btn-secondary flex-1"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-[1.5]"
                                >
                                    REGISTER
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {showCameraModal && createPortal(
                <div className="fixed inset-0 bg-black/95 z-[1100] animate-in fade-in flex items-center justify-center">
                    <div className="relative w-full h-full flex flex-col p-4 md:p-8">
                        <div className="absolute top-6 right-6 z-[1200]">
                            <button onClick={closeCamera} className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-rose-500 transition-all overflow-hidden group">
                                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="flex-1 relative overflow-hidden rounded-2xl border-4 border-white/5 bg-navy-950 shadow-2xl">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                            <div className="absolute inset-0 pointer-events-none border border-white/10 m-12 rounded-xl flex items-center justify-center opacity-30">
                                <div className="w-8 h-px bg-primary absolute top-0 left-1/2 -translate-x-1/2" />
                            </div>
                        </div>

                        <div className="py-8 flex justify-center items-center">
                            <button
                                onClick={capturePhoto}
                                className="w-20 h-20 rounded-full bg-white p-1.5 group active:scale-90 transition-all shadow-xl shadow-white/10"
                            >
                                <div className="w-full h-full rounded-full border-2 border-navy-950 bg-white" />
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
