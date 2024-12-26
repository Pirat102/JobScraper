import { useState } from "react";
import "../styles/Job.css";
import { Calendar } from "lucide-react";
import DOMPurify from "dompurify";
import { useLanguage } from "../contexts/LanguageContext";
import { formatDate } from "../config/DateFormater";
import { ApplyButton } from "./ApplyButton";


function Job({ job }) {
  const [showSummary, setShowSummary] = useState(false);
  const { t, language } = useLanguage();


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
          {formatDate(job.scraped_date, language)}
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

      <div className="job-actions">
        <ApplyButton
          jobId={job.id}
          application={job.application}
          
        />
      </div>
    </div>
  );
}

export default Job;
