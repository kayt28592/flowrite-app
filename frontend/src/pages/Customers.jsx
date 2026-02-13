import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, User, X, ChevronLeft, ChevronRight, MapPin, Phone, Mail } from 'lucide-react';
import { customerAPI } from '../api/axios';
import toast from 'react-hot-toast';
import {
  DataTable,
  SearchBar,
  DeleteConfirmationModal
} from '../components/ui/DesignSystem';

export default function Customers({ search: externalSearch = "" }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await customerAPI.getAll({ limit: 1000 });
      setCustomers(res.data.customers || []);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    setShowModal(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCustomer) {
        await customerAPI.update(editingCustomer._id, formData);
        toast.success("Customer record updated");
      } else {
        await customerAPI.create(formData);
        toast.success("New customer registered");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (row) => {
    setDeleteConfirm(row);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await customerAPI.delete(deleteConfirm._id);
      toast.success("Customer deleted");
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredData = customers.filter(c =>
    (c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())) &&
    (externalSearch === "" || c.name?.toLowerCase().includes(externalSearch.toLowerCase()))
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, externalSearch]);

  const columns = [
    {
      key: "name", label: "Entity Identity", render: (val) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner flex-shrink-0">
            <User size={18} />
          </div>
          <div className="font-bold text-white tracking-tight">{val}</div>
        </div>
      )
    },
    {
      key: "email", label: "Communications", render: (val, row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
            <Mail size={12} className="text-white/20" />
            {val}
          </div>
          <div className="flex items-center gap-2 text-white/40 text-[10px] font-black tracking-wider uppercase">
            <Phone size={10} className="text-white/20" />
            {row.phone}
          </div>
        </div>
      )
    },
    {
      key: "address", label: "Base Operations", render: (val) => (
        <div className="flex items-center gap-2 text-sm text-white/50 max-w-xs truncate font-medium">
          <MapPin size={14} className="text-white/20 flex-shrink-0" />
          {val}
        </div>
      )
    },
  ];

  const actions = [
    { icon: <Edit size={16} />, label: "Edit Record", onClick: handleEdit },
    { icon: <Trash size={16} />, label: "Delete Entity", onClick: handleDelete },
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
          <div className="space-y-2">
            <h2 className="text-4xl font-heading font-black text-white tracking-tighter uppercase leading-none">
              Client Registry
            </h2>
            <p className="text-white/40 text-sm font-medium tracking-tight">
              Orchestrating <span className="text-primary font-bold">{customers.length}</span> verified industry partners
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <SearchBar placeholder="Scan database..." value={search} onChange={setSearch} />
            <button
              onClick={handleAddKey}
              className="btn btn-primary !py-3.5 !px-8 shadow-xl shadow-primary/20 text-sm"
            >
              <Plus size={18} /> NEW ENTITY
            </button>
          </div>
        </div>

        <div className="bg-card/20 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-3xl group">
          <DataTable columns={columns} data={currentData} actions={actions} />

          {filteredData.length === 0 && (
            <div className="p-32 text-center text-white/20">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white/10 group-hover:scale-110 transition-transform duration-500">
                <User size={48} />
              </div>
              <div className="text-xl font-black text-white/30 mb-2 uppercase tracking-widest font-heading">Zero Records Detected</div>
              <div className="text-xs font-black uppercase tracking-[0.3em] opacity-30">Security Clearance: Cleared — Database Empty</div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-10 py-6 border-t border-white/5 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                Page <span className="text-white">{currentPage}</span> of {totalPages} <span className="mx-4 text-white/10">/</span> {filteredData.length} records total
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/5 text-white/30 hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-10"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === pageNum
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                            : 'text-white/30 hover:text-white hover:bg-white/5'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="text-white/10 px-1 font-black">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/5 text-white/30 hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-10"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-navy-950/90 backdrop-blur-3xl flex items-center justify-center z-[1000] p-6 animate-in fade-in duration-300 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-card border border-white/10 rounded-[3rem] p-10 md:p-14 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <User size={120} />
            </div>

            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-white font-heading tracking-tighter leading-none mb-1">
                  {editingCustomer ? 'Modify Entity' : 'New Entity'}
                </h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
                  {editingCustomer ? 'Update infrastructure records' : 'Initialize client logistics protocol'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-xl bg-white/5 text-white/30 hover:text-white transition-colors flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Entity Reference Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/10 focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/5 outline-none transition-all duration-300 font-bold"
                    placeholder="Enter company ID..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Comm Endpoint</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/10 focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/5 outline-none transition-all duration-300 font-bold"
                      placeholder="office@host.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Phone Relay</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/10 focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/5 outline-none transition-all duration-300 font-bold"
                      placeholder="0400 ..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Global HQ Coordinates</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/10 focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/5 outline-none transition-all duration-300 font-bold"
                    placeholder="Physical site address..."
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-10 mt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-white/40 font-bold hover:bg-white/10 transition-all text-xs"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-4 rounded-2xl bg-primary text-primary-foreground font-black hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 shadow-xl shadow-primary/20 text-xs"
                >
                  {submitting ? "SYNCHRONIZING..." : (editingCustomer ? "UPDATE REGISTRY" : "INITIALIZE ENTITY")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Wipe Entity Data"
        itemType="customer record"
        itemName={deleteConfirm?.name}
      />
    </>
  );
}
