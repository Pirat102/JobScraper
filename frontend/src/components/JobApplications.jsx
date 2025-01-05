import { useState, useEffect } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { Trash2, Calendar } from "lucide-react";
import "../styles/applications/Applications.css";
import "../styles/applications/StatusButtons.css";
import "../styles/applications/Buttons.css";
import "../styles/applications/Notes.css";
import { useLanguage } from "../contexts/LanguageContext";
import { formatDate } from "../config/DateFormater";
import DOMPurify from "dompurify";

function JobApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, language } = useLanguage();
  const [expandedCards, setExpandedCards] = useState({});
  const [noteInputs, setNoteInputs] = useState({});

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

  if (loading) {
    return (
      <div className="applications-container">
        <div className="loading-state">{t("loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applications-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchApplications} className="retry-button">
            {t("try_again")}
          </button>
        </div>
      </div>
    );
  }

  // Only show empty state after loading is complete
  if (!loading && applications.length === 0) {
    return (
      <div className="applications-container">
        <div className="empty-applications">
          <div className="empty-applications-icon">📋</div>
          <h2>{t("no_applications_yet")}</h2>
          <p>{t("no_applications_message")}</p>
          <Link to="/jobs" className="browse-jobs-button">
            {t("browse_jobs")}
          </Link>
        </div>
      </div>
    );
  }

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
    const noteText = noteInputs[applicationId];
    if (!noteText?.trim()) return;

    try {
      await api.post(`api/applications/${applicationId}/notes`, {
        content: noteText,
      });
      setNoteInputs({
        ...noteInputs,
        [applicationId]: "",
      });
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

  const statuses = [
    { key: "APPLIED", icon: "📝" },
    { key: "INTERVIEWING", icon: "💼" },
    { key: "ACCEPTED", icon: "🎉" },
    { key: "REJECTED", icon: "❌" },
  ];

  return (
    <div className="applications-container">
      <div className="applications-grid">
        {applications.map((application) => (
          <div key={application.id} className="application-card">
            <div className="application-header">
              <div className="job-title-section">
                <span className="post-date">
                  <Calendar size={16} className="date-icon" />
                  {formatDate(application.applied_date, language)}
                </span>
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

              <button
                onClick={() => toggleCard(application.id)}
                className="toggle-details-button"
              >
                {expandedCards[application.id]
                  ? t("hide_details")
                  : t("show_details")}
              </button>
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

            <div
              className={`application-details ${
                expandedCards[application.id] ? "expanded" : ""
              }`}
            >
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
              {application.job.summary && (
                <div
                  className="job-summary"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(application.job.summary, {
                      ALLOWED_TAGS: ["strong", "ul", "li", "br", "p"],
                      ALLOWED_ATTR: [],
                    }),
                  }}
                />
              )}

              <div className="skills-section">
                <div className="skills">
                  {Object.entries(application.job.skills).map(
                    ([skill, level]) => (
                      <div
                        key={skill}
                        className={`skill-item ${level.toLowerCase()}`}
                      >
                        {skill}
                        <span className="skill-level">{level}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
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
                  value={noteInputs[application.id] || ""}
                  onChange={(e) =>
                    setNoteInputs({
                      ...noteInputs,
                      [application.id]: e.target.value,
                    })
                  }
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
