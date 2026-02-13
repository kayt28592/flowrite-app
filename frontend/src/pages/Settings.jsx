import React, { useState } from 'react';
import {
    Users,
    ShieldAlert,
    UserPlus,
    Settings,
    Trash2,
    Edit
} from 'lucide-react';
import {
    C,
    DataTable,
    RoleBadge
} from '../components/ui/DesignSystem';
import UserManagement from '../components/settings/UserManagement';
import RBACManager from '../components/settings/RBACManager';

export default function SettingsPage() {
    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-12">
                <h2 className="text-4xl font-black text-white font-heading tracking-tighter uppercase leading-none mb-2">SYSTEM ARCHITECTURE</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Administrative Access Terminal</p>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {/* User Registry */}
                <UserManagement />

                {/* Authority Matrix */}
                <RBACManager />
            </div>
        </div>
    );
}
