import { useState, useEffect } from "react";
import api from "../api";
import { Trash2, Calendar } from "lucide-react";
import "../styles/applications/Applications.css";
import "../styles/applications/StatusButtons.css";
import "../styles/applications/Buttons.css";
import "../styles/applications/Notes.css";
import { useLanguage } from "../contexts/LanguageContext";
import { formatDate } from "../config/DateFormater";

function JobApplications() {
  const [applications, setApplications] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get("api/applications");
      setApplications(response.data);
    } catch (error) {
      setError(t("failed_load_applications"));
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await api.patch(`api/applications/${applicationId}`, {
        status: newStatus,
      });
      fetchApplications();
    } catch (error) {
      alert(t("failed_update_status"));
    }
  };

  const deleteApplication = async (applicationId) => {
    if (window.confirm(t("confirm_delete_application"))) {
      try {
        await api.delete(`api/applications/${applicationId}`);
        fetchApplications();
      } catch (error) {
        alert(t("failed_delete_application"));
      }
    }
  };

  const addNote = async (applicationId, e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await api.post(`api/applications/${applicationId}/notes`, {
        content: newNote,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setNewNote("");
      fetchApplications();
    } catch (error) {
      alert(t("failed_add_note"));
    }
  };

  const deleteNote = async (applicationId, noteId) => {
    try {
      await api.delete(`api/applications/${applicationId}/notes/${noteId}`);
      fetchApplications();
    } catch (error) {
      alert(t("failed_delete_note"));
    }
  };

  if (loading)
    return <div className="applications-loading">{t("loading")}</div>;
  if (error) return <div className="applications-error">{error}</div>;

  const statuses = [
    { key: "APPLIED", icon: "📝" },
    { key: "INTERVIEWING", icon: "💼" },
    { key: "ACCEPTED", icon: "🎉" },
    { key: "REJECTED", icon: "❌" },
  ];

  return (
    <div className="applications-container">
      <h1 className="applications-title">{t("my_applications")}</h1>
      <div className="applications-grid">
        {applications.map((application) => (
          <div key={application.id} className="application-card">
            <div className="job-header">
              <div className="job-title-section">
                <a
                  href={application.job.url}
                  className="job-title"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {application.job.title}
                </a>
                <span className="company-name">{application.job.company}</span>
              </div>
              <span className="post-date">
                <Calendar size={16} className="date-icon" />
                {formatDate(application.applied_date, language)}
              </span>
            </div>

            <div className="job-details">
              {application.job.location && (
                <span className="detail-item location">
                  📍 {application.job.location}
                </span>
              )}
              {application.job.operating_mode && (
                <span className="detail-item work-mode">
                  💼 {application.job.operating_mode}
                </span>
              )}
              {application.job.salary && (
                <span className="detail-item salary">
                  💰 {application.job.salary}
                </span>
              )}
            </div>

            <div className="status-buttons">
              {statuses.map(({ key, icon }) => (
                <button
                  key={key}
                  onClick={() => updateApplicationStatus(application.id, key)}
                  className={`status-button ${key.toLowerCase()} ${
                    application.status === key ? "active" : ""
                  }`}
                >
                  {icon} {t(key.toLowerCase())}
                </button>
              ))}
            </div>

            <div className="notes-section">
              <h3 className="notes-title">{t("notes")}</h3>

              <div className="notes-list">
                {application.notes?.map((note) => (
                  <div key={note.id} className="note-item">
                    <div className="note-content">{note.content}</div>
                    <div className="note-footer">
                      <span className="note-date">
                        {formatDate(note.created_at, language)}
                      </span>
                      <button
                        onClick={() => deleteNote(application.id, note.id)}
                        className="delete-note-button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => addNote(application.id, e)}
                className="add-note-form"
              >
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={t("add_note_placeholder")}
                  className="note-input"
                />
                <button type="submit" className="add-note-button">
                  {t("add_note")}
                </button>
              </form>
            </div>

            <button
              onClick={() => deleteApplication(application.id)}
              className="delete-application-button"
            >
              <Trash2 size={20} />
              {t("delete_application")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobApplications;
