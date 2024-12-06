import { useState } from "react";
import "../styles/Job.css";
import { Calendar } from "lucide-react";
import DOMPurify from "dompurify";
import { useLanguage } from "../contexts/LanguageContext";

function Job({ job }) {
  const [showSummary, setShowSummary] = useState(false);
  const { t, language } = useLanguage();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      minute: "numeric",
      hour: "numeric",
      day: "numeric",
      month: "short",
      year: "numeric",
    };

    // Use Polish or English date format based on selected language
    if (language === "pl") {
      return date.toLocaleDateString("pl-PL", options);
    } else {
      return date.toLocaleDateString("en-US", options);
    }
  };

  return (
    <div className="job-container">
      <div className="job-header">
        <div className="job-title-section">
          <a
            href={job.url}
            className="job-title"
            target="_blank"
            rel="noopener noreferrer"
          >
            {job.title}
          </a>
          <span className="company-name">{job.company}</span>
        </div>
        <span className="post-date">
          <Calendar size={16} className="date-icon" />
          {formatDate(job.scraped_date)}
        </span>
      </div>

      <div className="job-details">
        {job.location && (
          <span className="detail-item location">📍 {job.location}</span>
        )}
        {job.operating_mode && (
          <span className="detail-item work-mode">💼 {job.operating_mode}</span>
        )}
        {job.salary && (
          <span className="detail-item salary">💰 {job.salary}</span>
        )}
      </div>

      <button
        onClick={() => setShowSummary(!showSummary)}
        className="toggle-button"
      >
        {showSummary ? t("hide_summary") : t("show_summary")}
      </button>

      {showSummary && job.summary && (
        <div
          className="job-summary"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(job.summary, {
              ALLOWED_TAGS: ["strong", "ul", "li", "br", "p"],
              ALLOWED_ATTR: [],
            }),
          }}
        />
      )}
      <div className="skills-section">
        <div className="skills">
          {Object.entries(job.skills)
            .sort(([, a], [, b]) => b.localeCompare(a))
            .slice(0, showSummary ? undefined : 10)
            .map(([skill, level]) => (
              <div key={skill} className={`skill-item ${level.toLowerCase()}`}>
                {skill}
                <span className="skill-level">{level}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Job;
