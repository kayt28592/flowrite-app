import React, { useState, useEffect } from 'react';
import {
    Shield,
    User,
    Briefcase,
    Check,
    X,
    Save,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    Lock,
    AlertCircle,
    Globe
} from 'lucide-react';
import { C } from '../ui/DesignSystem';
import { settingsAPI } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const MODULES = [
    {
        id: 'dockets',
        label: 'Operations & Dockets',
        tabs: [
            { id: 'docketForm', label: 'Docket Form' },
            { id: 'list', label: 'Dockets Archive' },
            { id: 'submissions', label: 'Submissions Registry' },
            { id: 'customers', label: 'Client Registry' },
            { id: 'items', label: 'Asset/Item Matrix' }
        ]
    },
    {
        id: 'jobForms',
        label: 'Form Engineering',
        tabs: [
            { id: 'manageForms', label: 'Manage Forms' },
            { id: 'designTool', label: 'Design Terminal' }
        ]
    },
    {
        id: 'timesheets',
        label: 'Temporal Protocol (Timesheets)',
        tabs: [
            { id: 'my', label: 'Personal Logs' },
            { id: 'team', label: 'Fleet Audit' }
        ]
    }
];

const ACTIONS = [
    { id: 'view', label: 'View' },
    { id: 'create', label: 'Create' },
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete' },
    { id: 'print', label: 'Print' },
    { id: 'submit', label: 'Submit' },
    { id: 'approve', label: 'Approve' }
];

export default function RBACManager() {
    const { user, refreshSettings } = useAuth();
    const [matrix, setMatrix] = useState(null);
    const [originalMatrix, setOriginalMatrix] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedModule, setExpandedModule] = useState('dockets');

    const isAdmin = user?.role === 'admin' || user?.role === 'Administrator';

    useEffect(() => {
        fetchMatrix();
    }, []);

    const fetchMatrix = async () => {
        try {
            const res = await settingsAPI.getAll();
            if (res.data.data.rbac_matrix) {
                setMatrix(res.data.data.rbac_matrix);
                setOriginalMatrix(JSON.parse(JSON.stringify(res.data.data.rbac_matrix)));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isLocked = (role, moduleId, tabId, actionId) => {
        // Unlocking timesheets as per user request to "fix lỗi không chỉnh được quyền"
        // But preventing Admin column from being toggled as it has a god role override anyway
        if (role === 'Administrator' || role === 'admin') return true;
        return false;
    };

    const togglePermission = (role, moduleId, tabId, actionId) => {
        if (isLocked(role, moduleId, tabId, actionId)) return;

        setMatrix(prev => {
            const newMatrix = JSON.parse(JSON.stringify(prev));
            if (!newMatrix[role]) newMatrix[role] = {};
            if (!newMatrix[role][moduleId]) newMatrix[role][moduleId] = {};
            if (!newMatrix[role][moduleId][tabId]) newMatrix[role][moduleId][tabId] = {};

            const currentState = !!newMatrix[role][moduleId][tabId][actionId];
            const nextState = !currentState;

            // Enforcement logic
            if (actionId === 'view' && nextState === false) {
                // If turning view OFF, turn everything else in that tab OFF
                newMatrix[role][moduleId][tabId] = { view: false };
            } else if (actionId !== 'view' && nextState === true) {
                // If turning any action ON, auto-turn view ON
                newMatrix[role][moduleId][tabId].view = true;
                newMatrix[role][moduleId][tabId][actionId] = true;
            } else {
                newMatrix[role][moduleId][tabId][actionId] = nextState;
            }

            return newMatrix;
        });
    };

    const saveMatrix = async () => {
        try {
            await settingsAPI.update({ key: 'rbac_matrix', value: matrix });
            setOriginalMatrix(JSON.parse(JSON.stringify(matrix)));
            await refreshSettings();
            toast.success('Authority Matrix Synchronized');
        } catch (err) {
            toast.error('Synchronization Fault');
        }
    };

    const revertChanges = () => {
        setMatrix(JSON.parse(JSON.stringify(originalMatrix)));
        toast('Changes Reverted', { icon: '🔄' });
    };

    const resetToFactory = () => {
        const FACTORY_RBAC = {
            Staff: {
                dockets: { docketForm: { view: true, create: true }, list: { view: true }, submissions: { view: true }, customers: { view: true }, items: { view: true } },
                jobForms: { manageForms: { view: true }, designTool: { view: false } },
                timesheets: { my: { view: true, create: true, submit: true }, team: { view: false } }
            },
            Supervisor: {
                dockets: { docketForm: { view: true, create: true }, list: { view: true, edit: true }, submissions: { view: true, edit: true, approve: true, print: true } },
                jobForms: { manageForms: { view: true, edit: true }, designTool: { view: true } },
                timesheets: { my: { view: false }, team: { view: false } }
            },
            Guest: {
                dockets: {},
                jobForms: {},
                timesheets: {}
            }
        };
        setMatrix(FACTORY_RBAC);
        toast.success('Matrix Reset to Factory Specs');
    };

    if (!isAdmin) {
        return (
            <div className="p-12 text-center bg-card/20 border border-white/5 rounded-[2rem]">
                <Lock size={48} className="mx-auto text-white/10 mb-6" />
                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Unauthorized Access</h3>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">Restricted to Administrative Personnel Only</p>
            </div>
        );
    }

    if (loading || !matrix) return null;

    const hasChanges = JSON.stringify(matrix) !== JSON.stringify(originalMatrix);

    const RoleRow = ({ role, label, icon: Icon, colorClass, moduleId, tabId }) => (
        <tr className="hover:bg-white/[0.02] transition-colors group">
            <td className="px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${colorClass}/10 ${colorClass.replace('bg-', 'text-')} border ${colorClass.replace('bg-', 'border-')}/20`}>
                        <Icon size={10} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white/70">{tabId ? '' : label}</span>
                        <span className={`text-[8px] font-black ${colorClass.replace('bg-', 'text-')} uppercase tracking-tighter`}>{label} Clearance</span>
                    </div>
                </div>
            </td>
            {ACTIONS.map(action => {
                const isChecked = matrix[role]?.[moduleId]?.[tabId]?.[action.id];
                const locked = isLocked(role, moduleId, tabId, action.id);
                const dependsOnView = action.id !== 'view' && !matrix[role]?.[moduleId]?.[tabId]?.view;

                return (
                    <td key={action.id} className="p-0 text-center relative group/btn border-b border-white/5">
                        <button
                            disabled={locked}
                            onClick={() => togglePermission(role, moduleId, tabId, action.id)}
                            className={`w-full h-full py-5 flex items-center justify-center transition-all ${locked ? 'cursor-not-allowed opacity-20' : isChecked ? colorClass.replace('bg-', 'text-') : 'text-white/5 hover:text-white/20'} ${dependsOnView && !isChecked ? 'opacity-20 hover:opacity-100' : ''}`}
                        >
                            {locked ? <Lock size={12} /> : isChecked ? <Check size={16} strokeWidth={4} /> : <X size={14} />}
                        </button>
                    </td>
                );
            })}
        </tr>
    );

    return (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 24, overflow: "hidden shadow-2xl shadow-black/50" }}>
            {/* Header */}
            <div style={{ padding: "24px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(212,175,55,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: C.accent }}>
                        <Shield size={20} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>Authority Matrix</h3>
                        <p style={{ color: C.textDim, fontSize: 12 }}>Configuring operational clearance for Guest, Staff & Supervisors</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={resetToFactory} className="px-4 py-2 hover:bg-white/5 text-white/20 text-[9px] uppercase font-black transition-all rounded-lg border border-white/5">
                        Factory Reset
                    </button>
                    {hasChanges && (
                        <button onClick={revertChanges} className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-white/60 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                            <RotateCcw size={14} /> Revert
                        </button>
                    )}
                    <button onClick={saveMatrix} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20">
                        <Save size={14} /> Commit Matrix
                    </button>
                </div>
            </div>

            {/* Matrix Content */}
            <div style={{ padding: 28 }} className="space-y-6">
                {MODULES.map(module => (
                    <div key={module.id} className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01]">
                        <button
                            onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                            className="w-full flex justify-between items-center p-5 hover:bg-white/[0.02] transition-colors"
                        >
                            <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] font-heading">{module.label}</span>
                            {expandedModule === module.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {expandedModule === module.id && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest min-w-[200px]">Logical Protocol</th>
                                            {ACTIONS.map(action => (
                                                <th key={action.id} className="px-4 py-4 text-center text-[9px] font-black text-white/20 uppercase tracking-widest">{action.label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {module.tabs.map(tab => (
                                            <React.Fragment key={tab.id}>
                                                <tr className="bg-white/[0.01] border-b border-white/5">
                                                    <td colSpan={ACTIONS.length + 1} className="px-6 py-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                                                        {tab.label}
                                                    </td>
                                                </tr>
                                                <RoleRow role="Supervisor" label="Supervisor" icon={Briefcase} colorClass="bg-blue-400" moduleId={module.id} tabId={tab.id} />
                                                <RoleRow role="Staff" label="Staff" icon={User} colorClass="bg-emerald-400" moduleId={module.id} tabId={tab.id} />
                                                <RoleRow role="Guest" label="Guest" icon={Globe} colorClass="bg-slate-400" moduleId={module.id} tabId={tab.id} />
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
