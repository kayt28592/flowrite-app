import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/ui/PageContainer';
import Button from '../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <PageContainer showParticles centered>
            <div className="text-center px-4">
                {/* 404 Text with Glow */}
                <div className="relative inline-block mb-8">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 blur-[120px] bg-[#60a5fa]/50 -z-10" />

                    {/* 404 */}
                    <h1
                        className="text-[180px] md:text-[240px] font-bold text-white leading-none"
                        style={{ textShadow: '0 0 80px rgba(96, 165, 250, 0.8)' }}
                    >
                        404
                    </h1>
                </div>

                {/* Message */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-wide">
                    Page Not Found
                </h2>
                <p className="text-white/70 text-lg mb-12 max-w-md mx-auto">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        variant="primary"
                        size="lg"
                        icon={<Home size={20} />}
                        onClick={() => navigate('/')}
                    >
                        Go Home
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        icon={<ArrowLeft size={20} />}
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        </PageContainer>
    );
}
