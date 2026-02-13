import { useState, useEffect, useMemo, useRef } from "react";
import {
    Clock,
    Plus,
    Calendar,
    User,
    Download,
    CheckCircle,
    XCircle,
    AlertCircle,
    Filter,
    ChevronRight,
    Search,
    Trash2,
    Edit3,
    FileText,
    ArrowRight,
    Loader2,
    Briefcase
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { timesheetAPI, userAPI } from "../api/axios";
import {
    C,
    StatCard,
    StatusBadge,
    TabBar,
    DataTable,
    SearchBar,
    DeleteConfirmationModal
} from "../components/ui/DesignSystem";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function Timesheets() {
    const { user, canAccessTab, canDoAction } = useAuth();
    const [activeTab, setActiveTab] = useState(canAccessTab('timesheets', 'team') ? 'team' : 'my');
    const [loading, setLoading] = useState(true);
    const [timesheets, setTimesheets] = useState([]);
    const [users, setUsers] = useState([]); // For supervisor staff selector
    const [stats, setStats] = useState({ thisWeekHours: 0, thisMonthHours: 0, pendingCount: 0 });

    // Filters
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [timeRange, setTimeRange] = useState("Month"); // Day, Week, Month
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedStaff, setSelectedStaff] = useState("All");

    // Modal states
    const [showForm, setShowForm] = useState(false);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [showDelete, setShowDelete] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(null);
    const [showReportPreview, setShowReportPreview] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [editingRecord, setEditingRecord] = useState(null);

    // Form state (Submission)
    const [formData, setFormData] = useState({
        staffId: user?.id || user?._id || "",
        date: new Date().toISOString().split('T')[0],
        startTime: "07:00",
        endTime: "16:00",
        breakMinutes: 30,
        notes: ""
    });

    // Request state (Supervisor Order)
    const [requestData, setRequestData] = useState({
        staffId: "",
        date: new Date().toISOString().split('T')[0],
        notes: ""
    });

    const isSupervisorOrAdmin = useMemo(() => {
        return ['Supervisor', 'admin', 'Administrator'].includes(user?.role);
    }, [user]);

    useEffect(() => {
        fetchData();
        fetchStats();
        if (isSupervisorOrAdmin) {
            fetchUsers();
        }
    }, [activeTab, timeRange, selectedDate, selectedStaff]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                viewMode: activeTab === 'my' ? 'my' : 'team',
                startDate: getStartDate(),
                endDate: getEndDate(),
                staffId: selectedStaff !== 'All' ? selectedStaff : undefined
            };
            const res = await timesheetAPI.getAll(params);
            setTimesheets(res.data.timesheets || []);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await timesheetAPI.getStats();
            setStats(res.data.data);
        } catch (err) {
            console.error("Stats fetch failed", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await userAPI.getAll({ limit: 1000 });
            setUsers(res.data.data || []);
        } catch (err) {
            console.error("Users fetch failed", err);
        }
    };

    const getStartDate = () => {
        const d = new Date(selectedDate);
        if (timeRange === 'Day') return selectedDate;
        if (timeRange === 'Week') {
            const day = d.getDay() || 7; // ISO week
            if (day !== 1) d.setHours(-24 * (day - 1));
            return d.toISOString().split('T')[0];
        }
        if (timeRange === 'Month') {
            return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
        }
        return undefined;
    };

    const getEndDate = () => {
        const d = new Date(selectedDate);
        if (timeRange === 'Day') return selectedDate;
        if (timeRange === 'Week') {
            const day = d.getDay() || 7;
            if (day !== 7) d.setHours(24 * (7 - day));
            return d.toISOString().split('T')[0];
        }
        if (timeRange === 'Month') {
            return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
        }
        return undefined;
    };

    const calculateHours = (start, end, breakMin) => {
        if (!start || !end) return 0;
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);

        let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diffMinutes < 0) diffMinutes += 24 * 60;

        diffMinutes -= (breakMin || 0);
        return Math.max(0, diffMinutes);
    };

    const toggleAMPM = (timeStr) => {
        if (!timeStr) return "08:00";
        let [h, m] = (timeStr.split(':').map(Number));
        h = (h + 12) % 24;
        return `${h.toString().padStart(2, '0')}:${(m || 0).toString().padStart(2, '0')}`;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const totalMin = calculateHours(formData.startTime, formData.endTime, formData.breakMinutes);
        const payload = {
            ...formData,
            totalMinutes: totalMin,
            totalHours: Number((totalMin / 60).toFixed(2))
        };

        try {
            if (editingRecord) {
                await timesheetAPI.update(editingRecord._id, payload);
                toast.success("Record Updated");
            } else {
                await timesheetAPI.create(payload);
                toast.success("Timesheet Submitted");
            }
            setShowForm(false);
            setEditingRecord(null);
            fetchData();
            fetchStats();
        } catch (err) {
            toast.error("Process Failed");
        }
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        try {
            await timesheetAPI.create({
                ...requestData,
                startTime: "00:00", // Placeholder for request
                endTime: "00:00",
                totalMinutes: 0,
                totalHours: 0
            });
            toast.success("Instruction Dispatched");
            setShowRequestForm(false);
            fetchData();
        } catch (err) {
            toast.error("Dispatch Failed");
        }
    };

    const handleAction = async (id, status, notes = "") => {
        try {
            await timesheetAPI.approve(id, { status, managerNotes: notes });
            toast.success(`Record ${status}`);
            setShowRejectModal(null);
            setRejectionReason("");
            fetchData();
            fetchStats();
        } catch (err) {
            toast.error("Action denied");
        }
    };

    const handleDelete = async () => {
        if (!showDelete) return;
        try {
            await timesheetAPI.delete(showDelete._id);
            toast.success("Record Purged");
            setShowDelete(null);
            fetchData();
            fetchStats();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const generateSingleReport = (row) => {
        try {
            console.log("Generating report for:", row);
            toast.loading("Generating report...", { id: "report-gen" });

            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();

            // Header & Logo
            try {
                // Ensure image path is absolute or correct relative to public
                doc.addImage('/Flowrite-Full-Logo.png', 'PNG', 15, 15, 40, 15);
            } catch (e) {
                console.warn("Logo failed to load for single report PDF", e);
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.text("Temporal Deployment Report", 15, 45);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(150);
            const entries = row.entries || [row];
            const refId = (row._id || row.id || "TEMP").toString().slice(-6).toUpperCase();
            doc.text(`Reference: TS-${refId}`, 15, 52);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 57);

            // Employee Card
            doc.setFillColor(245, 247, 250);
            doc.roundedRect(15, 65, pageWidth - 30, 40, 3, 3, 'F');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(50);
            doc.text("Personnel Identity", 20, 75);

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text(row.staffName || "Unknown Personnel", 20, 85);

            // Details Table
            autoTable(doc, {
                startY: 115,
                head: [['Date', 'Start Time', 'End Time', 'Break', 'Hours']],
                body: entries.map(e => [
                    new Date(e.date).toLocaleDateString(),
                    e.startTime || '—',
                    e.endTime || '—',
                    `${e.breakMinutes || 0}m`,
                    `${(e.totalHours || 0).toFixed(2)}`
                ]),
                theme: 'grid',
                headStyles: { fillColor: [40, 45, 50] },
                styles: { fontSize: 9, cellPadding: 4 }
            });

            const finalY = doc.lastAutoTable.finalY;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text(`Aggregate Load: ${(row.totalHours || 0).toFixed(2)} HRS`, pageWidth - 60, finalY + 15);

            // Notes Section
            let notesY = finalY + 25;
            if (row.notes || entries.some(e => e.notes)) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text("Deployment Annotations:", 15, notesY);
                doc.setFont("helvetica", "normal");
                const allNotes = entries.map(e => e.notes).filter(Boolean).join(' | ');
                const splitNotes = doc.splitTextToSize(allNotes, pageWidth - 30);
                doc.text(splitNotes, 15, notesY + 7);
            }

            // Approval Section
            if (row.status === 'Approved') {
                const certY = doc.internal.pageSize.getHeight() - 50;
                doc.setDrawColor(46, 204, 113);
                doc.setLineWidth(0.5);
                doc.line(15, certY, pageWidth - 15, certY);

                doc.setFont("helvetica", "bold");
                doc.setTextColor(39, 174, 96);
                doc.text("Certification Validated", 15, certY + 10);

                doc.setFontSize(9);
                doc.setTextColor(100);
                doc.setFont("helvetica", "normal");
                doc.text(`Authorized by: ${row.managerName || 'System'}`, 15, certY + 18);
                doc.text(`Confirmation Date: ${row.confirmedAt ? new Date(row.confirmedAt).toLocaleString() : 'N/A'}`, 15, certY + 23);
            }

            doc.save(`Report_${(row.staffName || 'Staff').replace(/\s+/g, '_')}_${row.date || 'Record'}.pdf`);
            toast.success("Report Generated", { id: "report-gen" });
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Failed to generate report", { id: "report-gen" });
        }
    };

    const filteredData = timesheets.filter(t => {
        const matchesSearch = t.staffName?.toLowerCase().includes(search.toLowerCase()) || (t.notes || "").toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filterStatus === "All" || t.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Aggregate data for Team tab
    const displayData = useMemo(() => {
        if (activeTab === 'my') return filteredData;

        const groups = {};
        filteredData.forEach(t => {
            const key = t.staffId || t.staffName;
            if (!groups[key]) {
                groups[key] = {
                    ...t,
                    entries: [],
                    totalHours: 0,
                    entryCount: 0
                };
            }
            groups[key].entries.push(t);
            groups[key].totalHours += t.totalHours;
            groups[key].entryCount += 1;
        });
        return Object.values(groups);
    }, [filteredData, activeTab]);

    const columns = [
        {
            key: "staffName",
            label: "Personnel",
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary font-black border border-white/5 text-xs">
                        {val ? val.charAt(0) : '?'}
                    </div>
                    <div>
                        <div className="text-white font-bold leading-none mb-1">{val}</div>
                        {activeTab === 'team' ? (
                            <div className="text-[8px] text-white/20 font-black uppercase tracking-widest">{row.entryCount} Entries Logged</div>
                        ) : (
                            row.type === 'Request' && <div className="text-[8px] text-amber-500 font-black uppercase tracking-widest">Awaiting Response</div>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: "date",
            label: activeTab === 'team' ? "Period" : "Stamp",
            render: (val, row) => activeTab === 'team' ? (
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-tight">
                    {timeRange} View / {new Date(selectedDate).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-white/20" />
                    <span className="text-xs font-bold text-white/60">{new Date(val).toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })}</span>
                </div>
            )
        },
        {
            key: "duration",
            label: "Flow",
            render: (_, row) => activeTab === 'team' ? (
                <div className="text-[10px] font-bold text-emerald-500/50">
                    Aggregated Summary
                </div>
            ) : row.type === 'Request' ? (
                <span className="text-[10px] text-white/20 italic">Hours not specified</span>
            ) : (
                <div className="text-[10px] font-bold text-white/40">
                    {row.startTime} — {row.endTime} ({row.breakMinutes}m)
                </div>
            )
        },
        {
            key: "totalHours",
            label: "Hours",
            render: (val, row) => (
                <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-black font-heading ${row.status === 'Approved' ? 'text-emerald-400' : 'text-primary'}`}>{val.toFixed(2)}</span>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">HRS</span>
                </div>
            )
        },
        {
            key: "status",
            label: "State",
            render: (val) => <StatusBadge status={val} />
        }
    ];

    const actions = useMemo(() => {
        return [
            // Supervisor/Admin Approval Actions - Only for 'Submitted' logs
            ...(isSupervisorOrAdmin && activeTab === 'team' ? [
                {
                    icon: <CheckCircle size={14} />,
                    label: "Approve",
                    onClick: (row) => row.status === 'Submitted' ? handleAction(row._id, 'Approved') : toast.error("Record not in submission state")
                },
                {
                    icon: <XCircle size={14} />,
                    label: "Reject",
                    onClick: (row) => row.status === 'Submitted' ? setShowRejectModal(row) : toast.error("Record not in submission state")
                }
            ] : []),

            // Staff Response Action - Quick fulfill request
            {
                icon: <ArrowRight size={14} />,
                label: "Fulfill Request",
                onClick: (row) => {
                    setEditingRecord(row);
                    setFormData({
                        date: row.date,
                        startTime: "07:00",
                        endTime: "16:00",
                        breakMinutes: 30,
                        notes: row.notes || ""
                    });
                    setShowForm(true);
                },
                condition: (row) => row.status === 'Requested' && (row.staffId === user.id || row.staffId === user._id)
            },

            {
                icon: <FileText size={14} />,
                label: "View Report",
                onClick: (row) => setShowReportPreview(row)
            },
            {
                icon: <Edit3 size={14} />,
                label: "Modify",
                onClick: (row) => {
                    if (row.status === 'Approved' && user?.role !== 'Administrator' && user?.role !== 'admin') {
                        toast.error("Record Immutable");
                        return;
                    }
                    setEditingRecord(row);
                    setFormData({
                        staffId: row.staffId,
                        date: row.date,
                        startTime: row.startTime,
                        endTime: row.endTime,
                        breakMinutes: row.breakMinutes,
                        notes: row.notes || ""
                    });
                    setShowForm(true);
                }
            },

            {
                icon: <Trash2 size={14} />,
                label: "Purge",
                onClick: (row) => setShowDelete(row)
            }
        ];
    }, [activeTab, user, isSupervisorOrAdmin]);

    // Filter out actions based on condition
    const getRowActions = (row) => {
        return actions.filter(a => !a.condition || a.condition(row));
    };

    // Handle role restrictions for tabs
    const availableTabs = [
        { key: 'my', label: 'Create Timesheet' },
        ...(isSupervisorOrAdmin ? [{ key: 'team', label: 'Manage Hourly Load' }] : [])
    ];

    return (
        <div className="animate-in fade-in duration-700 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12 relative">
                <div className="absolute -left-12 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-transparent rounded-full hidden lg:block" />
                <div>
                    <h1 className="text-6xl font-black text-white font-heading tracking-tighter uppercase leading-none mb-3">
                        Employee Time Tracking System
                    </h1>
                    <p className="text-white/40 text-sm font-medium tracking-tight">
                        Standardized temporal synchronization for personnel deployments.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setEditingRecord(null);
                            setFormData({
                                staffId: user?.id || user?._id || "",
                                date: new Date().toISOString().split('T')[0],
                                startTime: "07:00",
                                endTime: "16:00",
                                breakMinutes: 30,
                                notes: ""
                            });
                            setShowForm(true);
                        }}
                        className="btn btn-primary shadow-2xl shadow-primary/20 !px-8 !py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase"
                    >
                        <Plus size={20} /> New Entry
                    </button>
                    {isSupervisorOrAdmin && (
                        <button
                            onClick={() => setShowRequestForm(true)}
                            className="bg-white/5 border border-white/5 hover:bg-white/10 text-white/50 hover:text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3"
                        >
                            <ArrowRight size={18} className="text-primary" /> Request Log
                        </button>
                    )}
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard
                    label="Current Weekly Output"
                    value={`${stats.thisWeekHours} HRS`}
                    icon={<Clock size={20} />}
                />
                <StatCard
                    label="Monthly Cumulative"
                    value={`${stats.thisMonthHours} HRS`}
                    icon={<Calendar size={20} />}
                />
                <StatCard
                    label="Verification Queue"
                    value={stats.pendingCount}
                    icon={<AlertCircle size={20} />}
                />
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                <TabBar
                    tabs={availableTabs}
                    active={activeTab}
                    onChange={setActiveTab}
                />

                <div className="flex items-center gap-4 bg-white/[0.01] border border-white/5 p-2 rounded-2xl">
                    {["Day", "Week", "Month"].map(t => (
                        <button
                            key={t}
                            onClick={() => setTimeRange(t)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${timeRange === t ? 'bg-white/10 text-white shadow-inner' : 'text-white/20 hover:text-white/40'}`}
                        >
                            {t}
                        </button>
                    ))}
                    <div className="w-[1px] h-6 bg-white/10 mx-2" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="bg-transparent border-none text-[11px] font-black text-white/60 outline-none uppercase tracking-widest cursor-pointer"
                    />
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col lg:flex-row gap-6 mb-10 items-center">
                <div className="flex-1 w-full">
                    <SearchBar
                        placeholder="Filter by name or annotations..."
                        value={search}
                        onChange={setSearch}
                    />
                </div>

                <div className="flex gap-4 items-center">
                    {activeTab === 'team' && isSupervisorOrAdmin && (
                        <select
                            value={selectedStaff}
                            onChange={e => setSelectedStaff(e.target.value)}
                            className="bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-xs font-black text-white/40 uppercase tracking-widest outline-none focus:border-primary/20 transition-all min-w-[200px]"
                        >
                            <option value="All">All Personnel</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    )}

                    <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl shrink-0">
                        {["All", "Submitted", "Approved", "Rejected", "Requested"].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-primary text-primary-foreground shadow-lg' : 'text-white/20 hover:text-white'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-6 bg-card/10 rounded-[3rem] border border-white/5">
                    <Loader2 size={40} className="animate-spin text-primary" />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Acquiring Temporal Data</p>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={displayData}
                    actions={actions}
                />
            )}

            {/* --- Modals --- */}

            {/* Submission Form */}
            {showForm && (
                <div className="fixed inset-0 bg-background/95 backdrop-blur-3xl flex items-center justify-center z-[1000] p-6 animate-in fade-in duration-300">
                    <div className="bg-card border border-white/10 rounded-[3rem] p-12 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/20" />

                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h3 className="text-4xl font-black text-white font-heading tracking-tighter uppercase leading-none mb-2">
                                    {editingRecord ? "Protocol Overwrite" : "Initialize Log"}
                                </h3>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">Temporal Deployment Entry</p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-xl bg-white/5 text-white/20 hover:text-white flex items-center justify-center">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                {isSupervisorOrAdmin && (
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Target Personnel</label>
                                        <select
                                            required
                                            value={formData.staffId}
                                            disabled={!!editingRecord}
                                            onChange={e => setFormData({ ...formData, staffId: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value={user?.id || user?._id}>Logged in User ({user?.name})</option>
                                            {users.filter(u => (u.id || u._id) !== (user.id || user._id)).map(u => (
                                                <option key={u.id || u._id} value={u.id || u._id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary/50 transition-all cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Start Time</label>
                                    <div className="relative group/time">
                                        <input
                                            type="time"
                                            required
                                            value={formData.startTime}
                                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary/50 transition-all font-mono pr-16"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, startTime: toggleAMPM(prev.startTime) }))}
                                            className="absolute right-2 top-2 bottom-2 px-3 rounded-xl bg-white/5 hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
                                        >
                                            {parseInt(formData.startTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">End Time</label>
                                    <div className="relative group/time">
                                        <input
                                            type="time"
                                            required
                                            value={formData.endTime}
                                            onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary/50 transition-all font-mono pr-16"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, endTime: toggleAMPM(prev.endTime) }))}
                                            className="absolute right-2 top-2 bottom-2 px-3 rounded-xl bg-white/5 hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
                                        >
                                            {parseInt(formData.endTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Break Duration (Minutes)</label>
                                    <input
                                        type="number"
                                        value={formData.breakMinutes}
                                        onChange={e => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) })}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary/50 transition-all"
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Deployment Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white font-medium outline-none focus:border-primary/50 transition-all resize-none"
                                        placeholder="..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-2xl shadow-primary/20 text-xs tracking-[0.2em] uppercase"
                            >
                                {editingRecord ? "COMMIT CHANGES" : "AUTHORIZE LOG SUBMISSION"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Request Order Form */}
            {showRequestForm && (
                <div className="fixed inset-0 bg-background/95 backdrop-blur-3xl flex items-center justify-center z-[1000] p-6 animate-in fade-in duration-300">
                    <div className="bg-card border border-white/10 rounded-[3rem] p-12 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-500 relative" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h3 className="text-4xl font-black text-white font-heading tracking-tighter uppercase leading-none mb-2">Dispatch Order</h3>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">Timesheet Instruction Request</p>
                            </div>
                            <button onClick={() => setShowRequestForm(false)} className="w-10 h-10 rounded-xl bg-white/5 text-white/20 hover:text-white flex items-center justify-center">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleRequestSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Target Personnel</label>
                                    <select
                                        required
                                        value={requestData.staffId}
                                        onChange={e => setRequestData({ ...requestData, staffId: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled className="bg-slate-900">Select Personnel...</option>
                                        {users.map(u => <option key={u.id} value={u.id} className="bg-slate-900">{u.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Temporal Window</label>
                                    <input
                                        type="date"
                                        required
                                        value={requestData.date}
                                        onChange={e => setRequestData({ ...requestData, date: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary/50 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Instruction Details</label>
                                    <textarea
                                        value={requestData.notes}
                                        onChange={e => setRequestData({ ...requestData, notes: e.target.value })}
                                        rows={4}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white font-medium outline-none focus:border-primary/50 transition-all resize-none"
                                        placeholder="Enter deployment instructions..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 rounded-2xl bg-white text-slate-900 font-black hover:bg-white/90 active:scale-[0.99] transition-all shadow-2xl text-xs uppercase tracking-widest"
                            >
                                DISPATCH REQUEST
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-background/95 backdrop-blur-3xl flex items-center justify-center z-[1000] p-6 animate-in fade-in duration-300">
                    <div className="bg-card border border-rose-500/10 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-8 text-rose-500 mx-auto border border-rose-500/10 shadow-inner">
                            <XCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white text-center mb-6 font-heading uppercase tracking-tighter">Declare Conflict</h3>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] text-center mb-8 px-4 leading-relaxed">
                            Specify reason for verification failure:
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white text-sm mb-6 outline-none focus:border-rose-500/30 transition-all min-h-[100px] resize-none"
                            placeholder="Rejection justification..."
                        />
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleAction(showRejectModal._id, 'Rejected', rejectionReason)}
                                className="w-full py-4 rounded-xl bg-rose-500 text-white font-black hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 text-xs uppercase tracking-widest"
                            >
                                CONFIRM REJECTION
                            </button>
                            <button
                                onClick={() => setShowRejectModal(null)}
                                className="w-full py-4 rounded-xl bg-white/5 text-white/30 font-bold hover:bg-white/10 transition-all text-xs"
                            >
                                ABORT
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={!!showDelete}
                onClose={() => setShowDelete(null)}
                onConfirm={handleDelete}
                title="Wipe Protocol Record"
                itemType="Timesheet"
                itemName={showDelete?.date}
            />
            {/* Report Preview Modal */}
            {showReportPreview && (
                <div className="fixed inset-0 bg-background/95 backdrop-blur-3xl flex items-center justify-center z-[1000] p-6 animate-in fade-in duration-300">
                    <div className="bg-card border border-white/10 rounded-[3rem] p-0 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-white/[0.02] border-b border-white/5 p-8 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/10">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white font-heading tracking-tighter uppercase leading-none mb-1">Report Visualization</h3>
                                    <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em]">Personnel Deployment Breakdown</p>
                                </div>
                            </div>
                            <button onClick={() => setShowReportPreview(null)} className="w-10 h-10 rounded-xl bg-white/5 text-white/20 hover:text-white flex items-center justify-center transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>

                        {/* Modal Content - Styled like a document */}
                        <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
                            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-10 relative overflow-hidden mb-8">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />

                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-y-8 gap-x-12 relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Target Individual</p>
                                        <p className="text-lg font-black text-white">{showReportPreview.staffName}</p>
                                    </div>
                                    <div /> {/* Spacer */}

                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Report Period</p>
                                        <p className="text-sm font-bold text-white/80">{timeRange} View / {new Date(selectedDate).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</p>
                                    </div>

                                    <div className="col-span-2 h-[1px] bg-white/5 my-2" />

                                    <div className="col-span-2 space-y-4">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Temporal Log Breakdown</p>
                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                                            <table className="w-full text-left text-[11px]">
                                                <thead className="bg-white/5 border-b border-white/5">
                                                    <tr>
                                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-white/30">Date</th>
                                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-white/30">Shift</th>
                                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-white/30">Hours</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {(showReportPreview.entries || [showReportPreview]).map((e, idx) => (
                                                        <tr key={idx} className="hover:bg-white/[0.02]">
                                                            <td className="px-6 py-4 text-white/70 font-bold">{new Date(e.date).toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })}</td>
                                                            <td className="px-6 py-4 text-white/40">{e.startTime}—{e.endTime}</td>
                                                            <td className="px-6 py-4 text-primary font-black">{e.totalHours.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="col-span-2 bg-primary/5 border border-primary/10 rounded-2xl p-6 flex justify-between items-center shadow-inner">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Aggregate Hourly Load</p>
                                        <p className="text-3xl font-black text-primary font-heading tracking-tighter">{(showReportPreview.totalHours || 0).toFixed(2)} HRS</p>
                                    </div>
                                </div>

                                {/* Notes if any */}
                                {(showReportPreview.notes || (showReportPreview.entries && showReportPreview.entries.some(e => e.notes))) && (
                                    <div className="mt-10 space-y-3">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Deployment Annotations</p>
                                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-sm text-white/50 leading-relaxed italic">
                                            {showReportPreview.notes || showReportPreview.entries.map(e => e.notes).filter(Boolean).join(' | ')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Manager Certification Section */}
                            {showReportPreview.status === 'Approved' && (
                                <div className="border-t border-white/5 pt-8 mb-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Authorization Certified</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">Confirmer Identity</p>
                                            <p className="text-xs font-bold text-white/40">{showReportPreview.managerName || 'System'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">Confirmation Stamp</p>
                                            <p className="text-xs font-bold text-white/40">{showReportPreview.confirmedAt ? new Date(showReportPreview.confirmedAt).toLocaleString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer (Action) */}
                        <div className="p-8 bg-white/[0.02] border-t border-white/5 shrink-0">
                            <button
                                onClick={() => generateSingleReport(showReportPreview)}
                                className="w-full py-5 rounded-2xl bg-white text-slate-900 font-black hover:bg-white/90 active:scale-[0.99] transition-all shadow-2xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                            >
                                <Download size={18} /> Download Official Transcript (PDF)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
