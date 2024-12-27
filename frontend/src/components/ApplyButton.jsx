import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import api from '../api';
import '../styles/applications/HeartButton.css';

export function ApplyButton({ jobId, application: initialApplication}) {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
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
                console.log(application);
                setApplication(null);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
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
        >
            <Heart 
                size={24}
                fill={application ? 'currentColor' : 'none'}
            />
        </button>
    );
}