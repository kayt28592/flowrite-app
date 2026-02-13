import React, { useState } from 'react';
import {
    Plus,
    LayoutList,
    Wrench,
    ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
    C,
    TabBar,
    SearchBar,
    NoPermissionBanner,
    LockedBanner
} from '../components/ui/DesignSystem';
import FormBuilder from './components/FormBuilder';
import TemplateList from './components/TemplateList';
import DynamicSubmissionList from './components/DynamicSubmissionList';
import DynamicFormRenderer from './components/DynamicFormRenderer';
import JobFormCreate from './components/JobFormCreate';
import TruckPrestartForm from './components/TruckPrestartForm';
import { formTemplateAPI, dynamicSubmissionAPI } from '../api/axios';
import toast from 'react-hot-toast';

export default function JobForm() {
    const { user, isAuthenticated, canAccessPage, canAccessTab } = useAuth();
    const [activeTab, setActiveTab] = useState('manage');
    const [editTemplate, setEditTemplate] = useState(null);
    const [viewingTemplate, setViewingTemplate] = useState(null);
    const [fillingTemplate, setFillingTemplate] = useState(null);
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const hasJobPerm = isAuthenticated && canAccessPage('jobForms');
    const canDesign = isAuthenticated && canAccessTab('jobForms', 'designTool');

    if (!hasJobPerm && isAuthenticated) {
        return <NoPermissionBanner />;
    }

    if (!isAuthenticated) {
        return <LockedBanner onLogin={() => window.location.href = '/login'} />;
    }

    const handleEditTemplate = (template) => {
        setEditTemplate(template);
        setActiveTab('create');
    };

    const handleViewSubmissions = (template) => {
        setViewingTemplate(template);
    };

    const handleFillForm = (template) => {
        setFillingTemplate(template);
    };

    const handleSaveTemplate = async (templateData) => {
        try {
            if (editTemplate) {
                await formTemplateAPI.update(editTemplate._id, templateData);
                toast.success('Template updated successfully');
            } else {
                await formTemplateAPI.create(templateData);
                toast.success('Template created successfully');
            }
            setEditTemplate(null);
            setActiveTab('manage');
        } catch (error) {
            toast.error('Failed to save template');
        }
    };

    const handleFormSubmission = async (submissionData) => {
        setSubmitting(true);
        try {
            await dynamicSubmissionAPI.create(submissionData);
            toast.success('Form submitted successfully!');
            setFillingTemplate(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error('Failed to submit form. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Determine if we are in a sub-view
    const isSubView = viewingTemplate || fillingTemplate;

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
                <div>
                    {!isSubView ? (
                        <>
                            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8, fontFamily: "'Outfit', sans-serif", letterSpacing: 0.5 }}>JOB FORM SYSTEM</h2>
                            <p style={{ color: C.textDim, fontSize: 14 }}>Create and manage custom digital forms</p>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    setViewingTemplate(null);
                                    setFillingTemplate(null);
                                }}
                                style={{ padding: 10, borderRadius: 12, background: C.bgCard, border: `1px solid ${C.border}`, color: C.textDim, cursor: "pointer" }}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>
                                    {viewingTemplate ? `SUBMISSION LIST: ${viewingTemplate.title.toUpperCase()}` : fillingTemplate?.title.toUpperCase()}
                                </h2>
                                <p style={{ color: C.textDim, fontSize: 13 }}>
                                    {viewingTemplate ? 'View and export data from collected forms' : 'Fill out the form details below'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {!isSubView && canDesign && (
                    <button
                        onClick={() => { setEditTemplate(null); setActiveTab('designTool'); }}
                        style={{
                            padding: "10px 20px",
                            borderRadius: 10,
                            background: C.info,
                            color: "#fff",
                            border: "none",
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "all 0.2s"
                        }}
                    >
                        <Plus size={18} /> {activeTab === 'designTool' ? 'Designing' : 'Create New Form'}
                    </button>
                )}
            </div>

            {!isSubView && (
                <TabBar
                    tabs={[
                        { key: 'manage', label: 'Manage Forms', show: canAccessTab('jobForms', 'manageForms') },
                        { key: 'designTool', label: 'Design Tool', show: canAccessTab('jobForms', 'designTool') }
                    ].filter(t => t.show !== false)}
                    active={activeTab}
                    onChange={setActiveTab}
                />
            )}

            {/* Content Area */}
            <div className="mt-8">
                {activeTab === 'designTool' ? (
                    <div className="max-w-4xl mx-auto">
                        <FormBuilder
                            initialTemplate={editTemplate}
                            onSave={handleSaveTemplate}
                            onCancel={() => setActiveTab('manage')}
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Viewing Submissions */}
                        {viewingTemplate && (
                            <DynamicSubmissionList
                                template={viewingTemplate}
                                onBack={() => setViewingTemplate(null)}
                            />
                        )}

                        {/* Filling Form */}
                        {fillingTemplate && (
                            <div className="max-w-5xl mx-auto pb-20">
                                {fillingTemplate.title === "OPERATOR DAILY PRE-START FORM" ? (
                                    <JobFormCreate
                                        template={fillingTemplate}
                                        onSuccess={() => {
                                            setFillingTemplate(null);
                                            toast.success("Pre-Start Protocol Authorized");
                                        }}
                                    />
                                ) : fillingTemplate.title === "TRUCK PRESTART FORM" ? (
                                    <TruckPrestartForm
                                        template={fillingTemplate}
                                        onSubmit={handleFormSubmission}
                                        loading={submitting}
                                        onSuccess={() => {
                                            setFillingTemplate(null);
                                            toast.success("Truck Prestart Authorized");
                                        }}
                                    />
                                ) : (
                                    <DynamicFormRenderer
                                        template={fillingTemplate}
                                        onSubmit={handleFormSubmission}
                                        loading={submitting}
                                    />
                                )}
                            </div>
                        )}

                        {/* List */}
                        {!isSubView && (
                            <TemplateList
                                onEdit={handleEditTemplate}
                                onViewSubmissions={handleViewSubmissions}
                                onFill={handleFillForm}
                                search={search}
                                isAdmin={canDesign}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
