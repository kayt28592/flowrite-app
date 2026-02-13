import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Edit, Calendar, Clock, User, Briefcase, Search, Filter, RefreshCw, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobFormAPI } from '../../api/axios';
import JobFormViewModal from './JobFormViewModal';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';

export default function JobFormList({ onEdit }) {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedForm, setSelectedForm] = useState(null);

    // Deletion State
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Filter States
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredForms, setFilteredForms] = useState([]);

    useEffect(() => {
        fetchForms();
    }, []);

    // Filter Effect
    useEffect(() => {
        if (!forms.length) {
            setFilteredForms([]);
            return;
        }

        let result = [...forms];

        // Date Range
        if (dateFrom) {
            result = result.filter(f => f.date >= dateFrom);
        }
        if (dateTo) {
            result = result.filter(f => f.date <= dateTo);
        }

        // Search (Worker or Plant)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(f =>
                (f.workerName && f.workerName.toLowerCase().includes(query)) ||
                (f.plant && f.plant.toLowerCase().includes(query))
            );
        }

        setFilteredForms(result);
    }, [forms, dateFrom, dateTo, searchQuery]);

    const fetchForms = async () => {
        setLoading(true);
        try {
            const res = await jobFormAPI.getAll();
            setForms(res.data.data);
        } catch (error) {
            toast.error('Failed to load job forms');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (e, id) => {
        e.stopPropagation();
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleExecuteDelete = async () => {
        if (!deleteId) return;
        try {
            await jobFormAPI.delete(deleteId);
            toast.success('Form deleted successfully');
            setForms(prevForms => prevForms.filter(f => f._id !== deleteId));
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete form');
        } finally {
            setDeleteId(null);
            setShowDeleteModal(false);
        }
    };

    const clearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setSearchQuery('');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flow-blue mb-4"></div>
                <p className="text-slate-500 font-medium">Loading Job Forms...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filters Bar */}
            <Card className="border-white/5 bg-navy-900/50 backdrop-blur-sm shadow-xl">
                <div className="p-4 flex flex-col md:flex-row gap-4 items-end">

                    {/* Search */}
                    <div className="flex-1 w-full space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <Input
                                type="text"
                                placeholder="Search worker or plant..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-navy-950 border-white/10 text-white placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Date From */}
                    <div className="w-full md:w-48 space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">From Date</label>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="bg-navy-950 border-white/10 text-white"
                        />
                    </div>

                    {/* Date To */}
                    <div className="w-full md:w-48 space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">To Date</label>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="bg-navy-950 border-white/10 text-white"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={fetchForms}
                            onClickCapture={() => toast.success('Refreshed')}
                            title="Refresh List"
                        >
                            <RefreshCw size={18} />
                        </Button>

                        {(dateFrom || dateTo || searchQuery) && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={clearFilters}
                                className="flex items-center gap-2"
                            >
                                <X size={16} /> Clear
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Results Info */}
            <div className="flex justify-between items-center px-2">
                <p className="text-sm font-medium text-slate-400">
                    Showing <span className="text-white font-bold">{filteredForms.length}</span> records
                    {(dateFrom || dateTo || searchQuery) && <span className="text-flow-blue ml-1">(Filtered)</span>}
                </p>
            </div>

            {/* Table View */}
            <Card className="border-white/5 bg-navy-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-slate-400 text-xs uppercase border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4 font-bold tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Worker Details</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Plant / Equipment</th>
                                    <th className="px-6 py-4 font-bold tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredForms.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-white/5 p-4 rounded-full mb-4">
                                                    <Filter className="text-slate-600" size={24} />
                                                </div>
                                                <p className="text-lg font-medium text-slate-400">No forms found</p>
                                                <p className="text-sm text-slate-600 mt-1">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredForms.map((form) => (
                                        <tr
                                            key={form._id}
                                            onClick={() => setSelectedForm(form)}
                                            className="hover:bg-white/5 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white flex items-center gap-2">
                                                        <Calendar size={14} className="text-flow-blue" /> {form.date}
                                                    </span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-2 mt-1 font-medium">
                                                        <Clock size={14} /> {form.time}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-flow-blue/20 border border-flow-blue/30 flex items-center justify-center text-flow-blue font-bold text-xs">
                                                        {form.workerName?.charAt(0) || 'U'}
                                                    </div>
                                                    <span className="font-medium text-slate-200">{form.workerName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-200 flex items-center gap-2">
                                                        <Briefcase size={14} className="text-slate-500" />
                                                        {form.plant}
                                                    </span>
                                                    <span className="text-xs text-slate-500 ml-6">{form.machineHours} hours</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {form.declarations?.fitForWork === 'I Agree' || form.declarations?.fitForWork === 'Yes' ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
                                                        <CheckCircle2 size={12} className="mr-1.5" /> FIT
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
                                                        <AlertTriangle size={12} className="mr-1.5" /> UNFIT
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => { e.stopPropagation(); onEdit(form); }}
                                                        className="hover:bg-blue-500/20 hover:text-blue-400"
                                                    >
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => confirmDelete(e, form._id)}
                                                        className="hover:bg-red-500/20 hover:text-red-400"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* View Modal */}
            {selectedForm && (
                <JobFormViewModal
                    form={selectedForm}
                    onClose={() => setSelectedForm(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="bg-navy-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle size={20} /> Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Are you sure you want to permanently delete this form? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleExecuteDelete}>Delete Permanently</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
