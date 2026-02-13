import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, User, Trash, Eye, X, Hash, Box, Printer } from 'lucide-react';
import { docketAPI, customerAPI } from '../api/axios';
import toast from 'react-hot-toast';
import {
    C,
    DataTable,
    SearchBar,
    StatusBadge,
    DeleteConfirmationModal
} from '../components/ui/DesignSystem';
import DocketPrint from '../components/DocketPrint';

export default function DocketsList({ isTab = false, search: externalSearch = "" }) {
    const [dockets, setDockets] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [currentDocket, setCurrentDocket] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // New Docket State
    const [newDocket, setNewDocket] = useState({
        customer: '',
        startDate: '',
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
        fetchCustomers();
    }, []);

    const fetchData = async () => {
        try {
            const res = await docketAPI.getAll();
            setDockets(res.data.dockets || []);
        } catch (err) {
            toast.error('Failed to load dockets');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await customerAPI.getAll({ limit: 1000 });
            setCustomers(res.data.customers || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!newDocket.customer || !newDocket.startDate || !newDocket.endDate) {
            toast.error('Please fill all fields');
            return;
        }

        setGenerating(true);
        try {
            await docketAPI.generate(newDocket);
            toast.success('Docket generated successfully');
            setShowModal(false);
            fetchData();
            setNewDocket({
                customer: '',
                startDate: '',
                endDate: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate docket');
        } finally {
            setGenerating(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await docketAPI.delete(deleteConfirm._id);
            toast.success("Docket deleted");
            setDeleteConfirm(null);
            fetchData();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const filteredData = dockets.filter(d =>
        (d.customer?.toLowerCase().includes(search.toLowerCase()) ||
            d._id?.toLowerCase().includes(search.toLowerCase())) &&
        (externalSearch === "" || d.customer?.toLowerCase().includes(externalSearch.toLowerCase()))
    );

    const columns = [
        {
            key: "id",
            label: "Reference ID",
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <Hash size={12} className="text-white/20" />
                    <span className="font-mono font-black text-primary text-[10px] tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
                        {row.docketNumber || row._id?.substring(row._id.length - 6).toUpperCase()}
                    </span>
                </div>
            )
        },
        {
            key: "customer",
            label: "Client Entity",
            render: (val) => (
                <div className="flex items-center gap-2">
                    <User size={14} className="text-white/20" />
                    <span className="font-bold text-white tracking-tight">{val}</span>
                </div>
            )
        },
        {
            key: "period",
            label: "Consolidation Period",
            render: (_, row) => (
                <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                    <Calendar size={12} className="text-white/20" />
                    {new Date(row.startDate).toLocaleDateString('en-AU')} - {new Date(row.endDate).toLocaleDateString('en-AU')}
                </div>
            )
        },
        {
            key: "submissions",
            label: "Payload Count",
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-black text-white/40 group-hover:text-primary group-hover:border-primary/20 transition-all">
                        {row.submissions?.length || 0}
                    </div>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Entries</span>
                </div>
            )
        },
        {
            key: "amount",
            label: "Aggregate Volume",
            render: (_, row) => (
                <div className="flex items-baseline gap-1">
                    <Box size={14} className="text-white/20 flex-shrink-0 mr-1" />
                    <span className="font-black text-primary text-lg font-heading">{row.totalAmount?.toFixed(2)}</span>
                    <span className="text-[10px] font-black text-white/20 uppercase">m³</span>
                </div>
            )
        },
        {
            key: "date",
            label: "Issuance Date",
            render: (val, row) => (
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                    {new Date(row.createdAt).toLocaleDateString('en-AU')}
                </span>
            )
        },
    ];

    const handleView = (docket) => {
        setCurrentDocket(docket);
        setShowPrintModal(true);
    };

    const handlePrint = (docket) => {
        const width = 1200;
        const height = 900;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);

        try {
            const popup = window.open(
                `/docket/print/${docket._id}`,
                `Docket_${docket._id}`,
                `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
            );

            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                // Fallback to modal if popup blocked
                setCurrentDocket(docket);
                setShowPrintModal(true);
            }
        } catch (e) {
            setCurrentDocket(docket);
            setShowPrintModal(true);
        }
    };

    const actions = [
        {
            icon: <Eye size={16} />,
            label: "Quick View",
            onClick: handleView
        },
        {
            icon: <Printer size={16} />,
            label: "View & Print",
            onClick: handlePrint
        },
        {
            icon: <Trash size={16} />,
            label: "Delete Archive",
            onClick: (row) => setDeleteConfirm(row)
        },
    ];

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div style={{ width: 40, height: 40, border: "3px solid rgba(245,158,11,0.1)", borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700 pb-16">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8 relative">
                <div className="absolute -left-12 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                <div>
                    <h2 className="text-4xl font-heading font-black text-white tracking-tighter uppercase leading-none mb-2">
                        Commerce Archive
                    </h2>
                    <p className="text-white/40 text-sm font-medium tracking-tight">
                        Managing <span className="text-primary font-bold">{dockets.length}</span> finalized logistics protocols
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <SearchBar placeholder="Filter records..." value={search} onChange={setSearch} />
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary !py-3.5 !px-8 !text-xs !rounded-2xl shadow-2xl shadow-primary/20 border border-white/10"
                    >
                        <Plus size={18} /> INITIALIZE DOCKET
                    </button>
                </div>
            </div>

            <div className="bg-card/20 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
                <DataTable columns={columns} data={filteredData} actions={actions} />
                {filteredData.length === 0 && (
                    <div className="p-32 text-center text-white/20">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white/10">
                            <FileText size={48} />
                        </div>
                        <div className="text-xl font-black text-white/30 mb-2 uppercase tracking-widest font-heading">Empty Data Stream</div>
                        <div className="text-xs font-black uppercase tracking-[0.3em] opacity-30">No dockets matching current logic</div>
                    </div>
                )}
            </div>

            {/* Create Docket Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="animate-in zoom-in-95 duration-200" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 24, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                            <div>
                                <h3 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>New Docket Report</h3>
                                <p style={{ color: C.textDim, fontSize: 14 }}>Generate total submissions for a period.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer" }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase" }}>Customer</label>
                                <select
                                    required
                                    value={newDocket.customer}
                                    onChange={(e) => setNewDocket({ ...newDocket, customer: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "14px 18px",
                                        background: "rgba(255,255,255,0.04)",
                                        border: `1px solid ${C.border}`,
                                        borderRadius: 14,
                                        color: C.text,
                                        fontSize: 15,
                                        outline: "none",
                                        appearance: "none",
                                        cursor: "pointer"
                                    }}
                                >
                                    <option value="" disabled>Select a customer...</option>
                                    {customers.map(c => (
                                        <option key={c._id} value={c.name} style={{ background: C.bgCard }}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase" }}>Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newDocket.startDate}
                                        onChange={(e) => setNewDocket({ ...newDocket, startDate: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "14px 18px",
                                            background: "rgba(255,255,255,0.04)",
                                            border: `1px solid ${C.border}`,
                                            borderRadius: 14,
                                            color: C.text,
                                            fontSize: 15,
                                            outline: "none",
                                            fontFamily: "'DM Sans', sans-serif"
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase" }}>End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newDocket.endDate}
                                        onChange={(e) => setNewDocket({ ...newDocket, endDate: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "14px 18px",
                                            background: "rgba(255,255,255,0.04)",
                                            border: `1px solid ${C.border}`,
                                            borderRadius: 14,
                                            color: C.text,
                                            fontSize: 15,
                                            outline: "none",
                                            fontFamily: "'DM Sans', sans-serif"
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "16px", borderRadius: 14, border: `1px solid ${C.border}`, background: "transparent", color: C.text, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                                <button type="submit" disabled={generating} style={{ flex: 2, padding: "16px", borderRadius: 14, border: "none", background: C.accent, color: "#0B1120", fontWeight: 700, cursor: generating ? "wait" : "pointer", opacity: generating ? 0.7 : 1 }}>
                                    {generating ? "Generating..." : "Generate Docket"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showPrintModal && currentDocket && (
                <DocketPrint
                    docket={currentDocket}
                    onClose={() => setShowPrintModal(false)}
                />
            )}

            <DeleteConfirmationModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title="Archive Termination"
                itemType="docket"
                itemName={`#${deleteConfirm?.docketNumber || deleteConfirm?._id?.slice(-6).toUpperCase()}`}
            />
        </div>
    );
}
