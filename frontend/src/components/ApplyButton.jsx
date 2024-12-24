import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import api from '../api';
import '../styles/HeartButton.css';

export function ApplyButton({ jobId, application: initialApplication, onApply }) {
    const [loading, setLoading] = useState(false);
    const [application, setApplication] = useState(initialApplication);

    // Update local state when prop changes
    useEffect(() => {
        setApplication(initialApplication);
    }, [initialApplication]);

    const handleClick = async () => {
        if (loading) return;
        
        try {
            setLoading(true);
            if (!application) {
                const response = await api.post('api/applications', { job_id: jobId });
                setApplication(response.data);
            } else {
                await api.delete(`api/applications/${application.id}`);
                setApplication(null);
            }
            onApply?.();
        } catch (error) {
            if (error.response?.status === 401) {
                window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <button 
            onClick={handleClick}
            disabled={loading}
            className={`heart-button ${application ? 'active' : ''}`}
            title={application ? 'Remove application' : 'Apply for job'}
        >
            <Heart 
                size={24}
                fill={application ? 'currentColor' : 'none'}
            />
        </button>
    );
}