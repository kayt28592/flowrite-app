import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Edit,
    Trash2,
    Check,
    X,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import {
    C,
    DataTable,
    RoleBadge,
    SearchBar,
    StatusBadge
} from '../ui/DesignSystem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { userAPI } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';


export default function UserManagement() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Staff',
        status: 'Active'
    });

    // Delete Confirmation
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                keyword: search,
                role: roleFilter,
                status: statusFilter
            };
            const res = await userAPI.getAll(params);
            setUsers(res.data.data);
            setPagination(prev => ({ ...prev, ...res.data.pagination }));
        } catch (error) {
            console.error(error);
            // Error handling is done in axios interceptor
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, search, roleFilter, statusFilter]);

    const handleCreate = () => {
        setModalType('create');
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'Staff',
            status: 'Active'
        });
        setModalOpen(true);
    };

    const handleEdit = (user) => {
        setModalType('edit');
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Leave blank to not change
            role: user.role,
            status: user.status
        });
        setModalOpen(true);
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteConfirmOpen(true);
    };

    const handleSave = async () => {
        try {
            if (modalType === 'create') {
                await userAPI.create(formData);
                toast.success('User created successfully');
            } else {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await userAPI.update(selectedUser.id, updateData);
                toast.success('User updated successfully');
            }
            setModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };

    const confirmDelete = async () => {
        try {
            await userAPI.delete(userToDelete.id);
            toast.success('User deleted successfully');
            setDeleteConfirmOpen(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };


    const columns = [
        {
            key: "name", label: "Name / Email", render: (val, row) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{val}</div>
                    <div style={{ fontSize: 11, color: C.textDim }}>{row.email}</div>
                </div>
            )
        },
        { key: "role", label: "Operation Role", render: (val) => <RoleBadge role={val} /> },
        {
            key: "status", label: "Status", render: (val) => (
                <span style={{
                    color: val === "Active" ? C.success : C.textDim,
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: val === 'Active' ? C.success : C.textDim }}></span>
                    {val}
                </span>
            )
        }
    ];

    if (user?.role !== 'admin' && user?.role !== 'Administrator') {
        return null;
    }

    return (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 24, overflow: "hidden" }}>
            <div style={{ padding: "24px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: C.info }}>
                        <Users size={20} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>User Management</h3>
                        <p style={{ color: C.textDim, fontSize: 12 }}>{users.length} users found</p>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: 'center' }}>
                    <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: `1px solid ${C.border}`,
                            borderRadius: 10,
                            padding: "10px 14px",
                            color: C.text,
                            fontSize: 14,
                            outline: 'none'
                        }}
                    >
                        <option value="">All Roles</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Staff">Staff</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: `1px solid ${C.border}`,
                            borderRadius: 10,
                            padding: "10px 14px",
                            color: C.text,
                            fontSize: 14,
                            outline: 'none'
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>

                    <button
                        onClick={handleCreate}
                        style={{ padding: "10px 20px", borderRadius: 10, background: C.bgHover, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                        <UserPlus size={16} /> Add User
                    </button>
                </div>
            </div>

            <div style={{ padding: 12 }}>
                {loading ? (
                    <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
                        <Loader2 className="animate-spin" style={{ color: C.info }} />
                    </div>
                ) : (
                    <>
                        <DataTable
                            columns={columns}
                            data={users}
                            actions={[
                                { icon: <Edit size={14} />, label: "Edit", onClick: handleEdit },
                                { icon: <Trash2 size={14} />, label: "Delete", onClick: handleDeleteClick }
                            ]}
                        />

                        {/* Pagination */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 12, color: C.textDim }}>
                                Page {pagination.page} of {pagination.pages || 1}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                                    disabled={pagination.page === 1}
                                    style={{ padding: 8, borderRadius: 8, background: C.bgHover, border: `1px solid ${C.border}`, opacity: pagination.page === 1 ? 0.5 : 1, cursor: pagination.page === 1 ? 'not-allowed' : 'pointer' }}
                                >
                                    <ChevronLeft size={14} color={C.text} />
                                </button>
                                <button
                                    onClick={() => setPagination(p => ({ ...p, page: Math.min(pagination.pages, p.page + 1) }))}
                                    disabled={pagination.page >= pagination.pages}
                                    style={{ padding: 8, borderRadius: 8, background: C.bgHover, border: `1px solid ${C.border}`, opacity: pagination.page >= pagination.pages ? 0.5 : 1, cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer' }}
                                >
                                    <ChevronRight size={14} color={C.text} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{modalType === 'create' ? 'Create New User' : 'Edit User'}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label style={{ fontSize: 13, fontWeight: 600, color: C.textDim }}>Full Name</label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter full name"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label style={{ fontSize: 13, fontWeight: 600, color: C.textDim }}>Email Address</label>
                            <Input
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Enter email"
                                type="email"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label style={{ fontSize: 13, fontWeight: 600, color: C.textDim }}>
                                Password
                                {modalType === 'edit' && <span style={{ fontWeight: 400, fontSize: 11, marginLeft: 8 }}>(Leave blank to keep current)</span>}
                            </label>
                            <Input
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="********"
                                type="password"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label style={{ fontSize: 13, fontWeight: 600, color: C.textDim }}>Role</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Staff">Staff</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Administrator">Administrator</option>
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <label style={{ fontSize: 13, fontWeight: 600, color: C.textDim }}>Status</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors"
                        >
                            {modalType === 'create' ? 'Create User' : 'Save Changes'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-slate-400 text-sm">
                            Are you sure you want to delete <span className="text-white font-semibold">{userToDelete?.name}</span>?
                            This action can be reversed by an admin if needed (soft delete).
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setDeleteConfirmOpen(false)}
                            className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors"
                        >
                            Delete User
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
