import React, { useState, useEffect } from 'react';
import { Plus, Package, Edit, Trash, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { itemAPI } from '../api/axios';
import toast from 'react-hot-toast';
import {
    DataTable,
    SearchBar,
    DeleteConfirmationModal
} from '../components/ui/DesignSystem';

export default function Items({ search: externalSearch = "" }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Construction Material', // Default
        stock: 'Available',
        unit: 'tonne'
    });
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await itemAPI.getAll();
            setItems(res.data.items || []);
        } catch (err) {
            toast.error('Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingItem(null);
        setFormData({ name: '', price: '', category: 'Construction Material', stock: 'Available', unit: 'tonne' });
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            price: item.price,
            category: item.category || 'Construction Material',
            stock: item.stock || 'Available',
            unit: item.unit || 'tonne'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingItem) {
                await itemAPI.update(editingItem._id, formData);
                toast.success("Item updated");
            } else {
                await itemAPI.create(formData);
                toast.success("Item created");
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
            await itemAPI.delete(deleteConfirm._id);
            toast.success("Deleted");
            setDeleteConfirm(null);
            fetchData();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const filteredData = items.filter(i =>
        (i.name?.toLowerCase().includes(search.toLowerCase())) &&
        (externalSearch === "" || i.name?.toLowerCase().includes(externalSearch.toLowerCase()))
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, externalSearch]);

    const columns = [
        {
            key: "name", label: "Item Name", render: (val) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20">
                        <Package size={18} />
                    </div>
                    <div className="font-bold text-slate-100">{val}</div>
                </div>
            )
        },
        { key: "category", label: "Category", render: (val) => <span className="text-slate-400 text-sm font-medium">{val}</span> },
        { key: "unit", label: "Unit", render: (val) => <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/10">{val || 'tonne'}</span> },
        { key: "price", label: "Unit Price", render: (val, row) => <span className="font-black text-amber-500 tracking-tight">${Number(val).toFixed(2)} <span className="text-[10px] text-slate-500 font-bold">/ {row.unit || 'tonne'}</span></span> },
        { key: "stock", label: "Stock Status", render: (val) => <span className="text-green-400 font-bold text-[10px] uppercase tracking-widest bg-green-400/10 px-2 py-1 rounded-lg border border-green-400/20">{val}</span> },
    ];

    const actions = [
        { icon: <Edit size={16} />, label: "Edit", onClick: handleEdit },
        { icon: <Trash size={16} />, label: "Delete", onClick: handleDelete },
    ];

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
        </div>
    );

    return (
        <>
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-navy-800 pb-6">
                    <div>
                        <h2 className="text-3xl font-heading font-black text-white tracking-tight mb-2 uppercase">
                            Inventory
                        </h2>
                        <p className="text-slate-400 font-medium">
                            Manage {items.length} material catalog items
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <SearchBar placeholder="Search items..." value={search} onChange={setSearch} />
                        <button
                            onClick={handleAdd}
                            className="px-6 py-2.5 rounded-2xl bg-amber-500 text-navy-950 hover:bg-amber-400 transition-all flex items-center gap-2 font-black text-sm shadow-xl shadow-amber-500/20"
                        >
                            <Plus size={20} /> NEW ITEM
                        </button>
                    </div>
                </div>

                <div className="bg-navy-900 border border-navy-800 rounded-[32px] overflow-hidden shadow-2xl">
                    <DataTable columns={columns} data={currentData} actions={actions} />
                    {filteredData.length === 0 && (
                        <div className="p-20 text-center text-slate-500">
                            <div className="text-5xl mb-6 opacity-30">📦</div>
                            <div className="text-xl font-black text-slate-400 mb-2">No items found</div>
                            <div className="text-sm font-medium">Create your first material item</div>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-8 py-5 border-t border-navy-800 bg-navy-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                                Page {currentPage} of {totalPages} <span className="mx-2 opacity-30">|</span> {filteredData.length} total items
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl border border-navy-800 text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-20"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl border border-navy-800 text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-20"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-2xl flex items-start justify-center z-[300] p-4 pt-12 sm:pt-20 animate-in fade-in duration-300 overflow-y-auto">
                    <div className="animate-in zoom-in-95 duration-300 bg-navy-900 border border-navy-800 rounded-[40px] p-10 w-full max-w-md shadow-[0_50px_100px_rgba(0,0,0,0.6)] relative mb-12">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>

                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-3xl font-black text-white font-heading tracking-tighter leading-none mb-2">
                                    {editingItem ? 'Update Item' : 'New Item'}
                                </h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                    {editingItem ? 'Modify existing catalog item' : 'Register a new construction material'}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Material Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-6 py-4 bg-navy-950 border border-navy-800 rounded-2xl text-slate-200 focus:border-amber-500/50 outline-none transition-all font-semibold"
                                        placeholder="e.g. Concrete Mix"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Unit Price ($)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-6 py-4 bg-navy-950 border border-navy-800 rounded-2xl text-slate-200 focus:border-amber-500/50 outline-none transition-all font-semibold"
                                            placeholder="0.00"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, unit: formData.unit === 'm³' ? 'tonne' : 'm³' })}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-amber-500/60 uppercase bg-amber-500/5 py-1 px-2 rounded-md hover:bg-amber-500/10 hover:text-amber-500 transition-all cursor-pointer z-10 border border-amber-500/10"
                                            title="Click to toggle unit"
                                        >
                                            {formData.unit || 'tonne'}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Measurement Unit</label>
                                    <div className="flex gap-2 p-1.5 bg-navy-950 border border-navy-800 rounded-2xl">
                                        {['m³', 'tonne'].map(u => (
                                            <button
                                                key={u}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, unit: u })}
                                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${formData.unit === u ? 'bg-amber-500 text-navy-950' : 'text-slate-500 hover:text-slate-300'}`}
                                            >
                                                {u === 'm³' ? 'm³ (Cubic Meter)' : 'tonne'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-6 py-4 bg-navy-950 border border-navy-800 rounded-2xl text-slate-200 focus:border-amber-500/50 outline-none transition-all font-semibold"
                                        placeholder="e.g. Construction Material"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-navy-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 rounded-2xl border border-navy-800 text-slate-500 font-bold hover:bg-white/5 transition-all text-sm"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] py-4 rounded-2xl bg-amber-500 text-navy-950 font-black hover:bg-amber-400 transition-all disabled:opacity-50 shadow-xl shadow-amber-500/20 text-sm"
                                >
                                    {submitting ? "SAVING..." : (editingItem ? "UPDATE ITEM" : "CREATE ITEM")}
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
                title="Delete Item"
                itemType="item"
                itemName={deleteConfirm?.name}
            />
        </>
    );
}
