import React, { useState, useEffect } from 'react';
import {
    Plus,
    ClipboardList,
    FileText,
    DollarSign,
    Package,
    Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
    C,
    StatCard,
    LockedBanner,
    NoPermissionBanner,
    TabBar // Exported from DesignSystem
} from '../components/ui/DesignSystem';
import DocketForm from './components/DocketForm';
import DocketsList from './components/DocketsList'; // Newly created
import Submissions from './Submissions';
import Customers from './Customers';
import Items from './Items';
import { docketAPI } from '../api/axios';

export default function DocketDashboard() {
    const { user, isAuthenticated, canAccessPage, canAccessTab } = useAuth();
    const [activeTab, setActiveTab] = useState('new-docket');

    // Permission Check
    const hasDocketPerm = canAccessPage('dockets');

    const [stats, setStats] = useState({
        totalDockets: 0,
        revenue: 0,
        customers: 0,
        items: 0
    });

    useEffect(() => {
        if (isAuthenticated && (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'Administrator' || user?.role === 'Supervisor')) {
            const fetchStats = async () => {
                try {
                    const res = await docketAPI.getStats();
                    setStats(res.data.data);
                } catch (error) {
                    console.error("Failed to fetch stats", error);
                }
            };
            fetchStats();
        }
    }, [isAuthenticated, user]);

    if (!hasDocketPerm) {
        return <NoPermissionBanner />;
    }

    const tabs = [
        { key: 'new-docket', label: 'Docket Form', show: canAccessTab('dockets', 'docketForm') },
        { key: 'dockets', label: 'Dockets', show: canAccessTab('dockets', 'list') },
        { key: 'submissions', label: 'Submissions', show: canAccessTab('dockets', 'submissions') },
        { key: 'customers', label: 'Customers', show: canAccessTab('dockets', 'customers') },
        { key: 'items', label: 'Items', show: canAccessTab('dockets', 'items') },
    ].filter(t => t.show !== false);

    return (
        <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-8">
            {/* Header / Stats Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8 relative">
                <div className="absolute -left-12 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                <div>
                    <h2 className="text-4xl font-heading font-black text-white tracking-tighter uppercase leading-none mb-2">
                        Central Command
                    </h2>
                    <p className="text-white/40 text-sm font-medium tracking-tight">
                        Orchestrating <span className="text-primary font-bold">logistics clusters</span> and commerce protocols
                    </p>
                </div>
            </div>

            {/* Admin Stats (Only visible to those with list access) */}
            {canAccessTab('dockets', 'list') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Dockets" value={stats.totalDockets} icon={<FileText size={24} />} />
                    <StatCard
                        label="Revenue Flux"
                        value={`$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon={<DollarSign size={24} />}
                    />
                    <StatCard label="Manifest Items" value={stats.items} icon={<Package size={24} />} />
                    <StatCard label="Registered Entities" value={stats.customers} icon={<Users size={24} />} />
                </div>
            )}

            {/* Navigation Tabs */}
            <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

            {/* Content Area */}
            <div className="bg-card/20 border border-white/5 rounded-[2.5rem] p-1 backdrop-blur-3xl min-h-[600px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50" />
                {activeTab === 'new-docket' && <DocketForm isDashboard={true} />}
                {activeTab === 'dockets' && <div className="p-6"><DocketsList /></div>}
                {activeTab === 'submissions' && <div className="p-6"><Submissions /></div>}
                {activeTab === 'customers' && <div className="p-6"><Customers /></div>}
                {activeTab === 'items' && <div className="p-6"><Items /></div>}
            </div>
        </div>
    );
}
