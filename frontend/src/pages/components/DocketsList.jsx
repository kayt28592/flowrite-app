import React, { useState, useEffect } from 'react';
import { FileText, Eye, Trash, Search, Hash, User, Calendar, Box, Printer } from 'lucide-react';
import { docketAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import {
    DataTable,
    StatusBadge,
    SearchBar,
    DeleteConfirmationModal
} from '../../components/ui/DesignSystem';
import DocketPrint from '../../components/DocketPrint';
import { useAuth } from '../../contexts/AuthContext';

export default function DocketsList() {
    const { canDoAction } = useAuth();
    const formatUnit = (amount, unit) => {
        const u = unit || 'm³';
        if (u === 'tonne') return amount === 1 ? 'tonne' : 'tonnes';
        return u;
    };
    const [dockets, setDockets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [currentDocket, setCurrentDocket] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await docketAPI.getAll();
            setDockets(res.data.dockets || []);
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to load dockets';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (row) => {
        setDeleteConfirm(row);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await docketAPI.delete(deleteConfirm._id);
            toast.success("Docket deleted successfully");
            setDeleteConfirm(null);
            fetchData();
        } catch (err) {
            toast.error("Failed to delete docket");
        }
    };

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

    const filteredData = dockets.filter(d =>
        (d.docketNumber || '').toLowerCase().includes((search || '').toLowerCase()) ||
        (d.customer || '').toLowerCase().includes((search || '').toLowerCase())
    );

    const columns = [
        {
            key: "docketNumber",
            label: "Reference ID",
            render: (val) => (
                <div className="flex items-center gap-2">
                    <Hash size={12} className="text-white/20" />
                    <span className="font-mono font-black text-primary text-[10px] tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
                        {val}
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
                    <span className="font-bold text-white tracking-tight">{val || 'N/A'}</span>
                </div>
            )
        },
        {
            key: "date",
            label: "Issuance Date",
            render: (_, row) => (
                <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                    <Calendar size={12} className="text-white/20" />
                    {new Date(row.createdAt).toLocaleDateString('en-AU')}
                </div>
            )
        },
        {
            key: "totalAmount",
            label: "Total Volume",
            render: (val, row) => (
                <div className="flex items-baseline gap-1">
                    <Box size={14} className="text-white/20 flex-shrink-0 mr-1" />
                    <span className="font-black text-primary text-lg font-heading">{val?.toFixed(2)}</span>
                    <span className="text-[10px] font-black text-white/20 uppercase">{formatUnit(val, row.submissionUnit || 'm³')}</span>
                </div>
            )
        },
        {
            key: "status",
            label: "Protocol Status",
            render: () => <StatusBadge status="Completed" />
        }
    ];

    const actions = [
        {
            icon: <Eye size={16} />,
            label: "Quick View",
            onClick: handleView,
            show: canDoAction('dockets', 'list', 'view')
        },
        {
            icon: <Printer size={16} />,
            label: "View & Print",
            onClick: handlePrint,
            show: canDoAction('dockets', 'list', 'print')
        },
        {
            icon: <Trash size={16} />,
            label: "Delete Archive",
            onClick: handleDelete,
            show: canDoAction('dockets', 'list', 'delete')
        }
    ].filter(a => a.show !== false);

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
        </div>
    );

    return (
        <>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8 relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                    <div>
                        <h2 className="text-3xl font-heading font-black text-white tracking-tighter uppercase leading-none mb-2">
                            Archive Index
                        </h2>
                        <p className="text-white/40 text-sm font-medium tracking-tight">
                            Viewing <span className="text-primary font-bold">{dockets.length}</span> finalized commerce records
                        </p>
                    </div>
                    <div className="w-full md:w-auto">
                        <SearchBar placeholder="Search archive..." value={search} onChange={setSearch} />
                    </div>
                </div>

                <div className="bg-card/20 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
                    <DataTable columns={columns} data={filteredData} actions={actions} />
                    {filteredData.length === 0 && (
                        <div className="p-32 text-center text-white/20">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white/10">
                                <FileText size={48} />
                            </div>
                            <div className="text-xl font-black text-white/30 mb-2 uppercase tracking-widest font-heading">Void Repository</div>
                            <div className="text-xs font-black uppercase tracking-[0.3em] opacity-30">No generated dockets found in system</div>
                        </div>
                    )}
                </div>

            </div>


            <DeleteConfirmationModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title="Archive Termination"
                itemType="docket"
                itemName={`#${deleteConfirm?.docketNumber}`}
            />

            {showPrintModal && currentDocket && (
                <DocketPrint
                    docket={currentDocket}
                    onClose={() => setShowPrintModal(false)}
                />
            )}
        </>
    );
}
