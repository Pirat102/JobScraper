// JobApplications.jsx
import { useState, useEffect } from 'react';
import api from '../api';
import { Trash2, Edit2 } from 'lucide-react';
import '../styles/Applications.css';
import { useLanguage } from '../contexts/LanguageContext';

function JobApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newNote, setNewNote] = useState('');
    const { t } = useLanguage();

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await api.get('api/applications');
            setApplications(response.data);
        } catch (error) {
            setError(t('failed_load_applications'));
        } finally {
            setLoading(false);
        }
    };

    const addNote = async (applicationId) => {
        if (!newNote.trim()) return;

        try {
            await api.post(`api/applications/${applicationId}/notes`, {
                content: newNote,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            setNewNote('');
            fetchApplications();
        } catch (error) {
            alert(t('failed_add_note'));
        }
    };

    const deleteNote = async (applicationId, noteId) => {
        try {
            await api.delete(`api/applications/${applicationId}/notes/${noteId}`);
            fetchApplications();
        } catch (error) {
            alert(t('failed_delete_note'));
        }
    };

    const deleteApplication = async (applicationId) => {
        if (window.confirm(t('confirm_delete_application'))) {
            try {
                await api.delete(`api/applications/${applicationId}`);
                fetchApplications();
            } catch (error) {
                alert(t('failed_delete_application'));
            }
        }
    };

    const updateApplicationStatus = async (applicationId, newStatus) => {
        try {
            await api.patch(`api/applications/${applicationId}`, {
                status: newStatus
            });
            fetchApplications();
        } catch (error) {
            alert(t('failed_update_status'));
        }
    };

    const statusOptions = ['APPLIED', 'INTERVIEWING', 'REJECTED', 'ACCEPTED'];

    if (loading) {
        return <div className="applications-loading">{t('loading')}</div>;
    }

    if (error) {
        return <div className="applications-error">{error}</div>;
    }

    return (
        <div className="applications-container">
            <h1 className="applications-title">{t('my_applications')}</h1>
            <div className="applications-grid">
                {applications.map(application => (
                    <div key={application.id} className="application-card">
                        <div className="application-header">
                            <h2 className="application-job-title">{application.job.title}</h2>
                            <span className="application-date">
                                {t('applied')}: {new Date(application.applied_date).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <div className="application-details">
                            <div className="detail-item">
                                <span className="detail-label">{t('status')}:</span>
                                <select
                                    value={application.status}
                                    onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                                    className={`status-select status-${application.status.toLowerCase()}`}
                                >
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>
                                            {t(status.toLowerCase())}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">{t('company')}:</span>
                                <span>{application.job.company}</span>
                            </div>
                            <button 
                                onClick={() => deleteApplication(application.id)}
                                className="delete-application-button"
                            >
                                <Trash2 size={16} />
                                {t('delete_application')}
                            </button>
                        </div>
                        
                        <div className="notes-section">
                            <h3 className="notes-title">{t('notes')}</h3>
                            <div className="notes-list">
                                {application.notes?.map(note => (
                                    <div key={note.id} className="note-item">
                                        <p className="note-content">{note.content}</p>
                                        <div className="note-footer">
                                            <span className="note-date">
                                                {new Date(note.created_at).toLocaleString()}
                                            </span>
                                            <button 
                                                onClick={() => deleteNote(application.id, note.id)}
                                                className="delete-note-button"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="add-note-form">
                                <textarea 
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="note-input"
                                    placeholder={t('add_note_placeholder')}
                                />
                                <button 
                                    onClick={() => addNote(application.id)}
                                    className="add-note-button"
                                >
                                    {t('add_note')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default JobApplications;