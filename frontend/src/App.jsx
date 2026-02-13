import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
// import Layout from './components/layout/Layout';

import Customers from './pages/Customers';
import Submissions from './pages/Submissions';
import Items from './pages/Items';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import JobForm from './pages/JobForm';
import Timesheets from './pages/Timesheets';
import JobFormGuest from './pages/JobFormGuest';
import DynamicFormGuest from './pages/DynamicFormGuest';
import DocketDashboard from './pages/DocketDashboard';
import Settings from './pages/Settings';
import DocketPrintPage from './pages/DocketPrintPage';
import SubmissionPrintPage from './pages/SubmissionPrintPage';
import DynamicSubmissionPrintPage from './pages/DynamicSubmissionPrintPage';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles, pageKey, tabKey }) => {
    const { isAuthenticated, user, loading, hasRole, canAccessPage, canAccessTab } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-navy-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const hasPageAccess = pageKey ? canAccessPage(pageKey) : false;
    const hasTabAccess = (pageKey && tabKey) ? canAccessTab(pageKey, tabKey) : true;

    // Redirection Logic
    if (!isAuthenticated) {
        // If guest has NO access to the page, redirect to login
        if (pageKey && !hasPageAccess) {
            return <Navigate to="/login" replace />;
        }
        // If no pageKey specified, protect by default
        if (!pageKey) {
            return <Navigate to="/login" replace />;
        }
    }

    // Role check (Legacy fallback for authenticated users)
    if (isAuthenticated && allowedRoles) {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        const hasRequiredRole = roles.some(role => hasRole(role));
        if (!hasRequiredRole) {
            return <Navigate to="/dashboard/dockets" replace />;
        }
    }

    // RBAC Page Check
    if (pageKey && !hasPageAccess) {
        return <Navigate to="/dashboard/dockets" replace />;
    }

    // RBAC Tab Check
    if (pageKey && tabKey && !hasTabAccess) {
        return <Navigate to="/dashboard/dockets" replace />;
    }

    return children;
};

function App() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-navy-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Welcome />} />

                <Route path="/job-form" element={<JobFormGuest />} />
                <Route path="/job-form/:templateId" element={<DynamicFormGuest />} />

                <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
                <Route path="/docket/print/:id" element={<DocketPrintPage />} />
                <Route path="/submission/print/:id" element={<SubmissionPrintPage />} />
                <Route path="/dynamic-submission/print/:id" element={<DynamicSubmissionPrintPage />} />

                {/* Dashboard Layout */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/dashboard/dockets" replace />} />

                    {/* Operational Routes (Authorized Access Only) */}
                    <Route
                        path="dockets"
                        element={
                            <ProtectedRoute pageKey="dockets">
                                <DocketDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="job-forms"
                        element={
                            <ProtectedRoute pageKey="jobForms">
                                <JobForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="timesheets"
                        element={
                            <ProtectedRoute pageKey="timesheets">
                                <Timesheets />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin/Manager Routes */}
                    <Route
                        path="submissions"
                        element={
                            <ProtectedRoute pageKey="dockets" tabKey="submissions">
                                <Submissions />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="customers"
                        element={
                            <ProtectedRoute pageKey="dockets" tabKey="customers">
                                <Customers />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="items"
                        element={
                            <ProtectedRoute pageKey="dockets" tabKey="items">
                                <Items />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Only Routes */}
                    <Route
                        path="settings"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'Administrator']}>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ErrorBoundary>
    );
}

export default App;
