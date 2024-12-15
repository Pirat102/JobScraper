import { useState } from 'react';
import api from '../api';
import '../styles/Applications.css';

function ApplyButton({ jobId, onApply }) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        try {
            setLoading(true);
            await api.post('api/applications', { job_id: jobId });
            onApply?.();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to apply');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleClick}
            disabled={loading}
            className="apply-button"
        >
            {loading ? 'Applying...' : 'Apply'}
        </button>
    );
}