import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuestLayout from '../components/layout/GuestLayout';
import DynamicFormRenderer from './components/DynamicFormRenderer';
import JobFormCreate from './components/JobFormCreate';
import TruckPrestartForm from './components/TruckPrestartForm';
import { formTemplateAPI, dynamicSubmissionAPI } from '../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle2, Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function DynamicFormGuest() {
    const { templateId } = useParams();
    const navigate = useNavigate();
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchTemplate();
    }, [templateId]);

    const fetchTemplate = async () => {
        try {
            const res = await formTemplateAPI.getById(templateId);
            setTemplate(res.data.data);
        } catch (error) {
            toast.error('Form not found or has been disabled.');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmission = async (submissionData) => {
        setSubmitting(true);
        try {
            await dynamicSubmissionAPI.create(submissionData);
            setSubmitted(true);
            toast.success('Form submitted successfully!');
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error('Failed to submit form. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <GuestLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flow-blue"></div>
                </div>
            </GuestLayout>
        );
    }

    if (submitted) {
        return (
            <GuestLayout title="SUBMISSION COMPLETE">
                <div className="max-w-xl mx-auto py-20 text-center animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>
                    <h2 className="text-4xl font-bold font-heading text-white mb-4 uppercase tracking-tight">Thank You!</h2>
                    <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
                        Your submission for <span className="text-white font-bold">{template.title}</span> has been successfully recorded.
                        You can now close this window or return home.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={() => navigate('/')} className="h-14 px-8 bg-white/5 border border-white/10 hover:bg-white/10 gap-2 font-bold uppercase tracking-widest">
                            <Home size={18} /> Return Home
                        </Button>
                    </div>
                </div>
            </GuestLayout>
        );
    }

    return (
        <GuestLayout title={template?.title?.toUpperCase() || "JOB FORM"}>
            <div className="max-w-4xl mx-auto py-10">
                {template?.title === "OPERATOR DAILY PRE-START FORM" ? (
                    <JobFormCreate
                        onSuccess={() => setSubmitted(true)}
                    />
                ) : template?.title === "TRUCK PRESTART FORM" ? (
                    <TruckPrestartForm
                        template={template}
                        onSubmit={handleSubmission}
                        loading={submitting}
                    />
                ) : (
                    <DynamicFormRenderer
                        template={template}
                        onSubmit={handleSubmission}
                        loading={submitting}
                    />
                )}
            </div>
        </GuestLayout>
    );
}
