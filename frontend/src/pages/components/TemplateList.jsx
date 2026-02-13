import React, { useState, useEffect } from 'react';
import {
    Eye,
    Trash,
    Edit,
    Link as LinkIcon,
    FileText,
    BarChart3,
    Share2,
    Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formTemplateAPI } from '../../api/axios';
import {
    C,
    DataTable,
    StatusBadge
} from '../../components/ui/DesignSystem';

export default function TemplateList({ onEdit, onViewSubmissions, onFill, search = "", isAdmin = false }) {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await formTemplateAPI.getAll();
            setTemplates(res.data.data || []);
        } catch (error) {
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (row) => {
        setTemplateToDelete(row);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!templateToDelete) return;
        try {
            await formTemplateAPI.delete(templateToDelete._id);
            toast.success('Template deleted');
            setTemplates(templates.filter(t => t._id !== templateToDelete._id));
            setShowDeleteModal(false);
            setTemplateToDelete(null);
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleClone = async (id) => {
        try {
            await formTemplateAPI.clone(id);
            toast.success('Template cloned');
            fetchTemplates();
        } catch (error) {
            toast.error('Clone failed');
        }
    };

    const copyShareLink = (id) => {
        const link = `${window.location.origin}/job-form/${id}`;
        navigator.clipboard.writeText(link);
        toast.success('Share link copied');
    };

    const filteredData = templates.filter(t =>
        t.title?.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { key: "id", label: "ID", render: (_, row) => <span style={{ fontWeight: 600, color: C.accent }}>{row._id?.substring(row._id.length - 6).toUpperCase()}</span> },
        {
            key: "title",
            label: "Form Name",
            render: (val, row) => (
                <div
                    onClick={() => onFill && onFill(row)}
                    style={{ fontWeight: 600, cursor: "pointer", color: C.text, display: "flex", alignItems: "center", gap: 8 }}
                    className="hover:text-blue-400 transition-colors group"
                >
                    {val}
                    <Eye size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )
        },
        { key: "fields", label: "Field Count", render: (val) => <span style={{ fontWeight: 600 }}>{val?.length || 0} fields</span> },
        { key: "createdAt", label: "Created Date", render: (val) => new Date(val).toLocaleDateString() },
        { key: "status", label: "Status", render: (val) => <StatusBadge status={val === 'published' ? 'Published' : 'Draft'} /> },
    ];

    const actions = isAdmin ? [
        { icon: <BarChart3 size={16} />, label: "View Submissions", onClick: (row) => onViewSubmissions(row) },
        { icon: <Edit size={16} />, label: "Edit", onClick: (row) => onEdit(row) },
        { icon: <Copy size={16} />, label: "Clone", onClick: (row) => handleClone(row._id) },
        { icon: <Share2 size={16} />, label: "Copy Link", onClick: (row) => copyShareLink(row._id) },
    ] : null;

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div style={{ width: 30, height: 30, border: "2px solid rgba(245,158,11,0.1)", borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        </div>
    );

    return (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
            <DataTable columns={columns} data={filteredData} actions={actions} />
            {filteredData.length === 0 && (
                <div style={{ padding: 60, textAlign: "center", color: C.textDim }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
                    <div style={{ fontWeight: 600, color: C.text }}>No forms found</div>
                    <div style={{ fontSize: 13 }}>Create your first form in the "Design Tool" tab</div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div className="animate-in zoom-in-95 duration-200" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 24, padding: 32, width: 400, boxShadow: "0 40px 80px rgba(0,0,0,0.6)", textAlign: "center" }}>
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            <Trash size={32} />
                        </div>
                        <h3 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>Delete Template?</h3>
                        <p style={{ color: C.textDim, fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
                            Are you sure you want to delete <strong>{templateToDelete?.title}</strong>? This action cannot be undone.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                style={{ padding: "16px", borderRadius: 14, background: "transparent", border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, cursor: "pointer", fontSize: 15 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{ padding: "16px", borderRadius: 14, background: "#EF4444", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15, boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
