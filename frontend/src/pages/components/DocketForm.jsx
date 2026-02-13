import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { submissionAPI, customerAPI, itemAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import DocketFormContent from './DocketFormContent';
import { useAuth } from '../../contexts/AuthContext';

export default function DocketForm() {
    const { canDoAction } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [editingSubmissionId, setEditingSubmissionId] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [items, setItems] = useState([]);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        hour: new Date().getHours().toString().padStart(2, '0'),
        minute: new Date().getMinutes().toString().padStart(2, '0'),
        period: new Date().getHours() >= 12 ? 'PM' : 'AM',
        customer: '',
        address: '',
        order: '',
        amount: '',
        unit: 'tonne',
        rego: '',
        ticketImage: null, // Base64 string
        signature: null
    });

    const [customerSearch, setCustomerSearch] = useState('');
    const [orderSearch, setOrderSearch] = useState('');
    const [showCustomerResults, setShowCustomerResults] = useState(false);
    const [showOrderResults, setShowOrderResults] = useState(false);

    const customerDropdownRef = useRef(null);
    const orderDropdownRef = useRef(null);

    const canvasRef = useRef(null);
    const videoRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const fetchInitialData = async () => {
        try {
            const [custRes, itemRes] = await Promise.all([
                customerAPI.getAll({ limit: 1000 }),
                itemAPI.getAll({ limit: 1000 })
            ]);
            setCustomers(custRes.data.customers || []);
            setItems(itemRes.data.items || []);
        } catch (err) {
            console.error('Failed to fetch data', err);
        }
    };

    useEffect(() => {
        if (location.state?.editSubmission) {
            const sub = location.state.editSubmission;
            setEditingSubmissionId(sub._id);

            let hourValue = '12';
            let minuteValue = '00';
            let periodValue = 'PM';

            if (sub.time) {
                const timeMatch = sub.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                if (timeMatch) {
                    hourValue = timeMatch[1].padStart(2, '0');
                    minuteValue = timeMatch[2];
                    periodValue = timeMatch[3].toUpperCase();
                }
            }

            setFormData({
                date: sub.date,
                hour: hourValue,
                minute: minuteValue,
                period: periodValue,
                customer: sub.customer || '',
                address: sub.address || '',
                order: sub.order || '',
                amount: sub.amount ? sub.amount.toString() : '',
                rego: sub.rego || '',
                unit: sub.unit || 'tonne',
                ticketImage: sub.ticketImage || null,
                signature: sub.signature || null
            });

            setCustomerSearch(sub.customer || '');
            setOrderSearch(sub.order || '');
        }
    }, [location.state]);

    useEffect(() => {
        fetchInitialData();
        const handleClickOutside = (event) => {
            if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) setShowCustomerResults(false);
            if (orderDropdownRef.current && !orderDropdownRef.current.contains(event.target)) setShowOrderResults(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const tempImage = canvas.toDataURL(); // Save current drawing
                const rect = canvas.getBoundingClientRect();
                if (canvas.width === rect.width && canvas.height === rect.height) return;
                canvas.width = rect.width;
                canvas.height = rect.height;
                const img = new Image();
                img.onload = () => ctx.drawImage(img, 0, 0);
                img.src = tempImage; // Restore drawing
            }
        };

        // Delay slightly to ensure layout is steady (especially with animations)
        const timer = setTimeout(resizeCanvas, 500);
        window.addEventListener('resize', resizeCanvas);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    const filteredCustomers = useMemo(() =>
        customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())),
        [customers, customerSearch]
    );

    const filteredItems = useMemo(() =>
        items.filter(i => i.name.toLowerCase().includes(orderSearch.toLowerCase())),
        [items, orderSearch]
    );

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        try {
            const res = await customerAPI.create(newCustomer);
            toast.success('Customer created!');
            setCustomers(prev => [...prev, res.data.data]);
            setFormData(prev => ({ ...prev, customer: res.data.data.name, address: res.data.data.address }));
            setShowCustomerModal(false);
            setNewCustomer({ name: '', email: '', phone: '', address: '' });
        } catch (err) {
            toast.error('Failed to create customer');
        }
    };

    const openCamera = async () => {
        setShowCameraModal(true);
        setTimeout(async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                toast.error('Unable to access camera');
                setShowCameraModal(false);
            }
        }, 100);
    };

    const closeCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        setShowCameraModal(false);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Compress slightly
        setFormData(prev => ({ ...prev, ticketImage: dataUrl }));
        toast.success('Photo captured!');
        closeCamera();
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            const canvas = canvasRef.current;
            setFormData(prev => ({ ...prev, signature: canvas.toDataURL() }));
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setFormData(prev => ({ ...prev, signature: null }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size too large. Max 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, ticketImage: reader.result }));
                toast.success(`Attached: ${file.name}`);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submissionData = { ...formData, time: `${formData.hour}:${formData.minute} ${formData.period}` };
            if (editingSubmissionId) {
                await submissionAPI.update(editingSubmissionId, submissionData);
                toast.success('Submission updated successfully!');
                navigate('/dashboard/dockets');
            } else {
                await submissionAPI.create(submissionData);
                toast.success('Form submitted successfully!');
                setFormData(prev => ({
                    ...prev,
                    customer: '',
                    address: '',
                    order: '',
                    amount: '',
                    unit: 'tonne',
                    rego: '',
                    ticketImage: null,
                    signature: null
                }));
                clearSignature();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <DocketFormContent
                formData={formData}
                loading={loading}
                editingSubmissionId={editingSubmissionId}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                customerSearch={customerSearch}
                setCustomerSearch={setCustomerSearch}
                showCustomerResults={showCustomerResults}
                setShowCustomerResults={setShowCustomerResults}
                filteredCustomers={filteredCustomers}
                customerDropdownRef={customerDropdownRef}
                orderSearch={orderSearch}
                setOrderSearch={setOrderSearch}
                showOrderResults={showOrderResults}
                setShowOrderResults={setShowOrderResults}
                filteredItems={filteredItems}
                orderDropdownRef={orderDropdownRef}
                showCustomerModal={showCustomerModal}
                setShowCustomerModal={setShowCustomerModal}
                newCustomer={newCustomer}
                setNewCustomer={setNewCustomer}
                handleCreateCustomer={handleCreateCustomer}
                showCameraModal={showCameraModal}
                openCamera={openCamera}
                closeCamera={closeCamera}
                capturePhoto={capturePhoto}
                videoRef={videoRef}
                handleFileChange={handleFileChange}
                canvasRef={canvasRef}
                startDrawing={startDrawing}
                draw={draw}
                stopDrawing={stopDrawing}
                clearSignature={clearSignature}
                canDoAction={canDoAction}
            />
        </div>
    );
}
