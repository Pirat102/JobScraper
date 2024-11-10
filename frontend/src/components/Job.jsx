import { useState } from "react";
import "../styles/Skills.css";
import '../styles/Job.css';
import DOMPurify from 'dompurify';

function Job({ job }) {
  const [showSkills, setShowSkills] = useState(true);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };
  return (
    <div className="job-container">
      <div className="job-header">
        <div className="job-title-section">
          <a href={job.url} className="job-title" target="_blank" rel="noopener noreferrer">
            {job.title}
          </a>
          <span className="company-name">{job.company}</span>
        </div>
        <span className="post-date">Posted: {formatDate(job.scraped_date)}</span>
      </div>

      <div className="job-details">
        {job.location && (
          <span className="detail-item location">
            📍 {job.location}
          </span>
        )}
        {job.operating_mode && (
          <span className="detail-item work-mode">
            💼 {job.operating_mode}
          </span>
        )}
        {job.salary && (
          <span className="detail-item salary">
            💰 {job.salary}
          </span>
        )}
      </div>

      {job.summary && (
        <div 
          className="job-summary"
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(job.summary, {
              ALLOWED_TAGS: ['strong', 'ul', 'li', 'br', 'p'],
              ALLOWED_ATTR: []
            })
          }}
        />
      )}

      <div className="skills-section">
        <button
          onClick={() => setShowSkills(!showSkills)}
          className="toggle-button"
        >
          {showSkills ? "Hide skills" : `Show skills (${Object.keys(job.skills).length})`}
        </button>
        
        {showSkills && (
          <div className="skills">
            {Object.entries(job.skills).map(([skill, level]) => (
              <div key={skill} className={`skill-item ${level.toLowerCase()}`}>
                {skill}
                <span className="skill-level">{level}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Job;