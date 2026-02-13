import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { docketAPI } from '../api/axios';
import DocketPrint from '../components/DocketPrint';
import { Loader2 } from 'lucide-react';

/**
 * Standalone page for printing a docket.
 * Accessible via /docket/print/:id
 */
export default function DocketPrintPage() {
    const { id } = useParams();
    const [docket, setDocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDocket = async () => {
            try {
                const res = await docketAPI.getById(id);
                setDocket(res.data.data || res.data); // Support both nested and flat responses
            } catch (err) {
                console.error("Failed to fetch docket", err);
                setError("Failed to load docket. It may have been deleted.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDocket();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-white gap-4">
                <Loader2 className="animate-spin text-amber-500" size={48} />
                <p className="font-bold tracking-widest text-sm opacity-50 uppercase">Loading Docket Details...</p>
            </div>
        );
    }

    if (error || !docket) {
        return (
            <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-white p-10 text-center">
                <div className="text-6xl mb-6">⚠️</div>
                <h1 className="text-2xl font-black mb-2 uppercase tracking-tight">{error || "Docket Not Found"}</h1>
                <p className="text-slate-400 mb-8 max-w-md">The docket reporting link is invalid or the data is no longer available.</p>
                <button
                    onClick={() => window.close()}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-all"
                >
                    CLOSE WINDOW
                </button>
            </div>
        );
    }

    return (
        <DocketPrint
            docket={docket}
            onClose={() => window.close()}
            standalone={true}
        />
    );
}
