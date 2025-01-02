import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import api from '../api';
import '../styles/applications/HeartButton.css';

export function ApplyButton({ jobId, hasApplied, applicationId }) {
    const [loading, setLoading] = useState(false);
    const [isApplied, setIsApplied] = useState(hasApplied);
    const [currentApplicationId, setCurrentApplicationId] = useState(applicationId);
    const navigate = useNavigate();

    const handleClick = async () => {
        if (loading) return;
        
        try {
            setLoading(true);
            if (!isApplied) {
                const response = await api.post('api/applications', { job_id: jobId });
                setCurrentApplicationId(response.data.id);
                setIsApplied(true);
            } else {
                await api.delete(`api/applications/${currentApplicationId}`);
                setIsApplied(false);
                setCurrentApplicationId(null);
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
            className={`heart-button ${isApplied ? 'active' : ''}`}
        >
            <Heart 
                size={24}
                fill={isApplied ? 'currentColor' : 'none'}
            />
        </button>
    );
}