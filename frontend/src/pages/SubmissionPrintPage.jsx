import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { submissionAPI } from '../api/axios';
import DocketPrint from '../components/DocketPrint';
import { Loader2 } from 'lucide-react';

/**
 * Standalone page for printing a single submission as a docket.
 * Accessible via /submission/print/:id
 */
export default function SubmissionPrintPage() {
    const { id } = useParams();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const res = await submissionAPI.getById(id);
                setSubmission(res.data.data || res.data);
            } catch (err) {
                console.error("Failed to fetch submission", err);
                setError("Failed to load submission data.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchSubmission();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-white gap-4">
                <Loader2 className="animate-spin text-amber-500" size={48} />
                <p className="font-bold tracking-widest text-sm opacity-50 uppercase">Syncing Submission Data...</p>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-white p-10 text-center">
                <div className="text-6xl mb-6">⚠️</div>
                <h1 className="text-2xl font-black mb-2 uppercase tracking-tight">{error || "Entry Not Found"}</h1>
                <p className="text-slate-400 mb-8 max-w-md">The submission record could not be retrieved from the archive.</p>
                <button
                    onClick={() => window.close()}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-all"
                >
                    CLOSE WINDOW
                </button>
            </div>
        );
    }

    const pseudoDocket = {
        docketNumber: `SUB-${submission._id?.substring(submission._id.length - 6).toUpperCase()}`,
        customer: submission.customer,
        totalAmount: submission.amount,
        submissions: [submission],
        createdAt: submission.createdAt
    };

    return (
        <DocketPrint
            docket={pseudoDocket}
            onClose={() => window.close()}
            standalone={true}
        />
    );
}
