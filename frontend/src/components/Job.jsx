import React from "react";

function Job({ job }) {
  return (
    <div className="job-container">
        <div>
            <p className="job-title">{job.title} </p>
            <p className="job-content">{job.scraped_date}</p>
        </div>
    </div>
  );
}

export default Job
