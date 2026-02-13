import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash, Download, X, FileText, Calendar, Box, Hash, Clock, Layers } from 'lucide-react';
import { submissionAPI } from '../api/axios';
import toast from 'react-hot-toast';
import {
  DataTable,
  SearchBar,
  DeleteConfirmationModal
} from '../components/ui/DesignSystem';
import DocketPrint from '../components/DocketPrint';
import { format, startOfWeek, startOfMonth, endOfWeek, endOfMonth, parseISO } from 'date-fns';
import { docketAPI } from '../api/axios';

export default function Submissions({ search: externalSearch = "" }) {
  const formatUnit = (amount, unit) => {
    const u = unit || 'm³';
    if (u === 'tonne') return amount === 1 ? 'tonne' : 'tonnes';
    return u;
  };
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [aggregation, setAggregation] = useState('none'); // none, day, week, month
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [updating, setUpdating] = useState(false);

  // Delete Modal State
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await submissionAPI.getAll();
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load submissions';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    if (row.isGroup) {
      toast.error("Cannot edit aggregated rows. Switch to 'All' view to edit.");
      return;
    }
    setEditFormData({
      id: row._id,
      customer: row.customer,
      date: row.date,
      time: row.time,
      order: row.order,
      amount: row.amount,
      rego: row.rego
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await submissionAPI.update(editFormData.id, editFormData);
      toast.success("Submission updated successfully");
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (row) => {
    if (row.isGroup) {
      toast.error("Cannot delete aggregated rows. Switch to 'All' view to delete.");
      return;
    }
    setDeleteConfirm(row);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await submissionAPI.delete(deleteConfirm._id);
      toast.success("Submission deleted");
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const getAggregatedData = (data) => {
    if (aggregation === 'none') return data;

    const groups = {};
    data.forEach(s => {
      let periodKey;
      let displayDate;
      let startDate, endDate;
      try {
        const dateObj = parseISO(s.date);
        if (aggregation === 'day') {
          periodKey = format(dateObj, 'yyyy-MM-dd');
          displayDate = periodKey;
          startDate = periodKey;
          endDate = periodKey;
        } else if (aggregation === 'week') {
          const start = startOfWeek(dateObj, { weekStartsOn: 1 });
          const end = endOfWeek(dateObj, { weekStartsOn: 1 });
          periodKey = format(start, 'yyyy-ww');
          displayDate = `Week of ${format(start, 'MMM dd')}`;
          startDate = format(start, 'yyyy-MM-dd');
          endDate = format(end, 'yyyy-MM-dd');
        } else if (aggregation === 'month') {
          const start = startOfMonth(dateObj);
          const end = endOfMonth(dateObj);
          periodKey = format(dateObj, 'yyyy-MM');
          displayDate = format(dateObj, 'MMMM yyyy');
          startDate = format(start, 'yyyy-MM-dd');
          endDate = format(end, 'yyyy-MM-dd');
        }
      } catch (e) {
        periodKey = 'Invalid Date';
        displayDate = s.date;
        startDate = s.date;
        endDate = s.date;
      }

      const groupKey = `${s.customer}-${periodKey}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          ...s,
          _id: `group-${groupKey}`,
          isGroup: true,
          date: displayDate,
          startDate,
          endDate,
          time: "-",
          amount: 0,
          count: 0,
          orders: new Set(),
          originalSubmissions: []
        };
      }
      groups[groupKey].amount = Number((groups[groupKey].amount + s.amount).toFixed(2));
      groups[groupKey].count += 1;
      groups[groupKey].unit = s.unit || 'm³';
      groups[groupKey].orders.add(s.order);
      groups[groupKey].originalSubmissions.push(s);
    });

    return Object.values(groups).map(g => ({
      ...g,
      order: Array.from(g.orders).join(", ")
    })).sort((a, b) => b.startDate?.localeCompare(a.startDate || ""));
  };

  const filteredData = getAggregatedData(submissions.filter(s =>
    ((s.customer || '').toLowerCase().includes((search || '').toLowerCase()) ||
      (s.order || '').toLowerCase().includes((search || '').toLowerCase())) &&
    (externalSearch === "" || (s.customer || '').toLowerCase().includes(externalSearch.toLowerCase()))
  ));

  const columns = [
    {
      key: "id",
      label: "Reference ID",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Hash size={12} className="text-white/20" />
          <span className="font-mono font-black text-primary text-[10px] tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
            {row.isGroup ? "AGGR" : row._id?.substring(row._id.length - 6).toUpperCase()}
          </span>
        </div>
      )
    },
    {
      key: "customer",
      label: "Client Entity",
      render: (val) => <div className="font-bold text-white tracking-tight">{val}</div>
    },
    {
      key: "date",
      label: aggregation === 'none' ? "Timestamp" : "Summary Period",
      render: (val, row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
            <Calendar size={12} className="text-white/20" />
            {val}
          </div>
          {row.time !== "-" && (
            <div className="flex items-center gap-2 text-white/30 text-[10px] font-black tracking-widest uppercase">
              <Clock size={10} className="text-white/20" />
              {row.time}
            </div>
          )}
          {row.count > 1 && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 mt-1">
              <Layers size={10} className="text-primary" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter">{row.count} Consolidated Entries</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: "order",
      label: "Commodity / Order",
      render: (val) => (
        <div className="flex items-center gap-2 text-sm text-white/60 font-medium">
          <Box size={14} className="text-white/20 flex-shrink-0" />
          <span className="truncate max-w-[200px]">{val}</span>
        </div>
      )
    },
    {
      key: "amount",
      label: "Volume Metric",
      render: (val, row) => (
        <div className="flex items-baseline gap-1">
          <span className="font-black text-primary text-lg font-heading">{val}</span>
          <span className="text-[10px] font-black text-white/20 uppercase">{formatUnit(val, row.unit)}</span>
        </div>
      )
    },
  ];

  const actions = [
    {
      icon: <Eye size={16} />,
      label: "Inspect Report",
      onClick: (row) => {
        if (row.isGroup) {
          setCurrentGroup(row);
          setShowGroupModal(true);
        } else {
          window.open(`/submission/print/${row._id}`, '_blank', 'noreferrer');
        }
      }
    },
    { icon: <Edit size={16} />, label: "Modify Protocol", onClick: handleEdit },
    { icon: <Trash size={16} />, label: "Delete Archive", onClick: handleDelete },
  ];

  if (loading) return (
    <div className="flex items-center justify-center p-24">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20 border-t-primary"></div>
    </div>
  );

  return (
    <>
      <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8 relative">
          <div className="absolute -left-12 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
          <div>
            <h2 className="text-4xl font-heading font-black text-white tracking-tighter uppercase leading-none mb-2">
              {aggregation === 'none' ? 'Archive Core' : `Consolidated: ${aggregation}`}
            </h2>
            <p className="text-white/40 text-sm font-medium tracking-tight">
              Monitoring <span className="text-primary font-bold">{submissions.length}</span> active logistics protocols
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex bg-white/5 border border-white/5 p-1.5 rounded-2xl backdrop-blur-3xl shadow-inner">
              {['none', 'day', 'week', 'month'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setAggregation(mode)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${aggregation === mode
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-white/30 hover:text-white/60'
                    }`}
                >
                  {mode === 'none' ? 'Live' : mode}
                </button>
              ))}
            </div>
            <SearchBar placeholder="Filter database..." value={search} onChange={setSearch} />
            <button className="btn btn-secondary !py-3 !px-6 text-xs !rounded-2xl border border-white/5">
              <Download size={16} /> DATA EXPORT
            </button>
          </div>
        </div>

        <div className="bg-card/20 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
          <DataTable columns={columns} data={filteredData} actions={actions} />
          {filteredData.length === 0 && (
            <div className="p-32 text-center text-white/20">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white/10 group-hover:scale-110 transition-transform duration-500">
                <Layers size={48} />
              </div>
              <div className="text-xl font-black text-white/30 mb-2 uppercase tracking-widest font-heading">Empty Data Stream</div>
              <div className="text-xs font-black uppercase tracking-[0.3em] opacity-30">No submissions matching current logic</div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-3xl flex items-center justify-center z-[1000] p-6 animate-in fade-in duration-300 overflow-y-auto" onClick={() => setShowEditModal(false)}>
          <div className="bg-card border border-white/10 rounded-[3rem] p-10 md:p-14 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-white font-heading tracking-tighter leading-none mb-1">Update Protocol</h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Modification terminal for archive ID: {editFormData.id?.slice(-6).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-10 h-10 rounded-xl bg-white/5 text-white/30 hover:text-white transition-colors flex items-center justify-center"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Client Authorization</label>
                  <input
                    type="text"
                    required
                    value={editFormData.customer || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, customer: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/10 focus:border-primary/50 focus:bg-white/10 outline-none transition-all font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Temporal Entry</label>
                    <input
                      type="date"
                      required
                      value={editFormData.date || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Entry Time</label>
                    <input
                      type="time"
                      required
                      value={editFormData.time || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Commodity / Material ID</label>
                  <input
                    type="text"
                    required
                    value={editFormData.order || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, order: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none transition-all font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Volume Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editFormData.amount || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Deployment Vehicle</label>
                    <input
                      type="text"
                      required
                      value={editFormData.rego || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, rego: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-white/40 font-bold hover:bg-white/10 transition-all text-xs"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-[2] py-4 rounded-2xl bg-primary text-primary-foreground font-black hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 shadow-xl shadow-primary/20 text-xs"
                >
                  {updating ? "SYNCHRONIZING..." : "OVERWRITE ARCHIVE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Aggregate Group Modal */}
      {showGroupModal && currentGroup && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-3xl flex items-center justify-center z-[1000] p-6 animate-in fade-in duration-500 overflow-y-auto" onClick={() => setShowGroupModal(false)}>
          <div className="bg-card border border-white/10 rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-500" onClick={e => e.stopPropagation()}>
            <div className="p-10 md:p-14 border-b border-white/5 flex flex-col md:flex-row justify-between items-start gap-8 relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                  <Layers size={14} /> {aggregation} BATCH ANALYSIS
                </div>
                <div>
                  <h3 className="text-5xl font-black text-white font-heading tracking-tighter leading-tight">
                    {currentGroup.customer}
                  </h3>
                  <div className="flex flex-wrap items-center gap-6 mt-2 text-white/40 font-bold text-sm tracking-tight">
                    <span className="flex items-center gap-2 text-white/60"><Box size={16} className="text-primary" /> {currentGroup.count} Aggregated Entries</span>
                    <span className="w-2 h-2 rounded-full bg-white/5"></span>
                    <span className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> {currentGroup.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 relative z-10 flex-shrink-0">
                <button
                  onClick={async () => {
                    setGenerating(true);
                    try {
                      await docketAPI.generate({
                        customer: currentGroup.customer,
                        startDate: currentGroup.startDate,
                        endDate: currentGroup.endDate
                      });
                      toast.success("Consolidated docket finalized");
                      setShowGroupModal(false);
                      fetchData();
                    } catch (err) {
                      toast.error("Generation protocol failed");
                    } finally {
                      setGenerating(false);
                    }
                  }}
                  disabled={generating}
                  className="btn btn-primary !py-4 !px-10 !text-sm !rounded-[2rem] shadow-2xl shadow-primary/30"
                >
                  <FileText size={20} /> {generating ? "REFINING..." : "GENERATE COMPOSITE DOCKET"}
                </button>
                <button onClick={() => setShowGroupModal(false)} className="w-14 h-14 bg-white/5 border border-white/5 rounded-[2rem] text-white/30 hover:text-white transition-all flex items-center justify-center">
                  <X size={28} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white/[0.01]">
              <DataTable
                columns={[
                  { key: "id", label: "Protocol ID", render: (_, r) => <span className="font-mono text-[10px] font-black text-white/20 uppercase tracking-widest">{r._id?.slice(-8)}</span> },
                  { key: "date", label: "Submission Date", render: (v) => <span className="font-bold text-white/80">{v}</span> },
                  { key: "order", label: "Order Data", render: (v) => <span className="font-medium text-white/40 truncate block max-w-[200px]">{v}</span> },
                  { key: "rego", label: "Fleet ID", render: (v) => <span className="font-mono bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs font-black text-white/60">{v}</span> },
                  { key: "amount", label: "Quantity", render: (v, r) => <div className="font-black text-primary text-xl flex items-baseline gap-1">{v}<span className="text-[10px] text-white/20">{formatUnit(v, r.unit)}</span></div> },
                ]}
                data={currentGroup.originalSubmissions}
              />
            </div>

            <div className="p-10 border-t border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">
                Consolidated Metric Terminal
              </div>
              <div className="px-10 py-5 bg-navy-950 border border-white/5 rounded-[2.5rem] flex items-center gap-14 shadow-inner">
                <div className="space-y-1">
                  <div className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-none">Record Count</div>
                  <div className="text-2xl font-black text-white leading-none">{currentGroup.count}</div>
                </div>
                <div className="w-px h-10 bg-white/5"></div>
                <div className="text-right space-y-1">
                  <div className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-none">Total Flow-Volume</div>
                  <div className="text-5xl font-black text-primary font-heading tracking-tighter leading-none">{currentGroup.amount} <span className="text-sm tracking-normal">{formatUnit(currentGroup.amount, currentGroup.unit)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      <DeleteConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Protocol Termination"
        itemType="submission"
        itemName={`#${deleteConfirm?._id?.slice(-6).toUpperCase()}`}
      />
    </>
  );
}
