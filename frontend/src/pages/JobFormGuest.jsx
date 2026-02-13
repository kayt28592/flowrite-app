import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../components/layout/GuestLayout';
import JobFormCreate from './components/JobFormCreate';
import toast from 'react-hot-toast';

export default function JobFormGuest() {
    const navigate = useNavigate();

    const handleSuccess = () => {
        toast.success("Job Form Submitted Successfully!");
        // Optionally redirect to home or show a success state
        setTimeout(() => navigate('/'), 2000);
    };

    return (
        <GuestLayout title="OPERATOR DAILY PRE-START FORM">
            <div className="max-w-5xl mx-auto">
                <JobFormCreate
                    onSuccess={handleSuccess}
                    initialData={null} // Always new for guests
                />
            </div>
        </GuestLayout>
    );
}
