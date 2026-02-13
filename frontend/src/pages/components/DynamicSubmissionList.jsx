import React, { useState, useEffect } from 'react';
import {
    Eye,
    Trash,
    Download,
    Calendar,
    User,
    ArrowLeft,
    FileText,
    Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dynamicSubmissionAPI } from '../../api/axios';
import { Button } from '../../components/ui/button';
import {
    C,
    DataTable,
    StatusBadge,
    SearchBar
} from '../../components/ui/DesignSystem';
import DynamicSubmissionViewModal from './DynamicSubmissionViewModal';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';

export default function DynamicSubmissionList({ template, onBack }) {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [viewingSubmission, setViewingSubmission] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchSubmissions();
    }, [template]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await dynamicSubmissionAPI.getByTemplate(template._id);
            setSubmissions(res.data.data || []);
        } catch (error) {
            toast.error('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await dynamicSubmissionAPI.delete(deleteId);
            toast.success('Record deleted');
            setSubmissions(prev => prev.filter(s => s._id !== deleteId));
        } catch (error) {
            toast.error('Delete failed');
        } finally {
            setDeleteId(null);
        }
    };

    const filteredData = submissions.filter(s =>
        (s.submittedBy?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        new Date(s.createdAt).toLocaleDateString().includes(search)
    );

    const columns = [
        { key: "id", label: "ID", render: (_, row) => <span style={{ fontWeight: 600, color: C.accent }}>{row._id?.substring(row._id.length - 6).toUpperCase()}</span> },
        { key: "submittedBy", label: "Submitted By", render: (val) => <div style={{ fontWeight: 600 }}>{val?.name || "Guest"}</div> },
        {
            key: "createdAt", label: "Date Submitted", render: (val) => (
                <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                    <Calendar size={14} style={{ color: C.textDim }} />
                    {new Date(val).toLocaleDateString()}
                    <span style={{ color: C.textDim, fontSize: 11 }}>{new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            )
        },
        { key: "status", label: "Status", render: () => <StatusBadge status="Completed" /> },
    ];

    const handlePrint = (submission) => {
        const width = 1200;
        const height = 900;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);

        try {
            const popup = window.open(
                `/dynamic-submission/print/${submission._id}`,
                `PrintAudit_${submission._id}`,
                `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
            );

            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                // Fallback: just open the modal if popup failed
                setViewingSubmission(submission);
            }
        } catch (e) {
            setViewingSubmission(submission);
        }
    };

    const actions = [
        { icon: <Eye size={16} />, label: "Quick View", onClick: (row) => setViewingSubmission(row) },
        { icon: <Printer size={16} />, label: "View & Print", onClick: (row) => handlePrint(row) },
        { icon: <Download size={16} />, label: "Download", onClick: () => toast.success("Starting download...") },
        { icon: <Trash size={16} />, label: "Delete", onClick: (row) => handleDelete(row._id) },
    ];

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div style={{ width: 30, height: 30, border: "2px solid rgba(245,158,11,0.1)", borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        </div>
    );

    return (
        <div className="space-y-4">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <SearchBar placeholder="Search by sender or date..." value={search} onChange={setSearch} />
                <button
                    onClick={onBack}
                    style={{ padding: "10px 18px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </div>

            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
                <DataTable columns={columns} data={filteredData} actions={actions} />
                {filteredData.length === 0 && (
                    <div style={{ padding: 60, textAlign: "center", color: C.textDim }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>📑</div>
                        <div style={{ fontWeight: 600, color: C.text }}>No data found</div>
                        <div style={{ fontSize: 13 }}>This form has not received any responses yet</div>
                    </div>
                )}
            </div>

            {viewingSubmission && (
                <DynamicSubmissionViewModal
                    submission={viewingSubmission}
                    template={template}
                    onClose={() => setViewingSubmission(null)}
                />
            )}

            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            This action cannot be undone. This will permanently delete the submission.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 pt-4">
                        <Button variant="ghost" className="text-white bg-white/5" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete Record</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
