import { useState, useEffect } from "react";
import api from "../api";
import Job from "../components/Job";
import FilterPanel from "../components/FilterPanel";
import Pagination from "../components/Pagination";
import "../styles/JobsPage.css";

function JobsPage() {
  const [jobs, setJobs] = useState({ results: [], count: 0 });
  const [nextUrl, setNextUrl] = useState(null);
  const [previousUrl, setPreviousUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (params = "") => {
    try {
      const response = await api.get(`api/jobs/filter${params}`);
      setJobs(response.data);
      setNextUrl(response.data.next ? `?${response.data.next.split("?")[1]}` : null);
      setPreviousUrl(response.data.previous ? `?${response.data.previous.split("?")[1]}` : null);
      setError(null);
    } catch (err) {
      setError("Failed to fetch jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (key !== "skills" && value) {
        params.append(key, value);
      }
    });

    if (filters.skills?.length > 0) {
      filters.skills.forEach((skill) => {
        params.append("skills", skill);
      });
    }

    fetchJobs(`?${params}`);
  };

  if (loading) {
    return (
      <div className="jobs-page">
        <div className="jobs-layout">
          <FilterPanel onFilterChange={handleFilterChange} />
          <main className="jobs-container">
            <div className="loading-state">Loading jobs...</div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jobs-page">
        <div className="jobs-layout">
          <FilterPanel onFilterChange={handleFilterChange} />
          <main className="jobs-container">
            <div className="error-state">
              <p>{error}</p>
              <button onClick={() => fetchJobs()}>Try Again</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-page">
      <div className="jobs-layout">
        <FilterPanel onFilterChange={handleFilterChange} />
        <main className="jobs-container">
          {jobs.count === 0 ? (
            <div className="no-jobs-state">
              <p>No jobs found matching your criteria.</p>
              <p>Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            <>
              <div className="jobs-header">
                <p className="jobs-count">Found {jobs.count} jobs</p>
              </div>
              <div className="jobs-list">
                {jobs.results.map((job) => (
                  <Job key={job.id || job.url} job={job} />
                ))}
              </div>
              <Pagination
                next={nextUrl}
                previous={previousUrl}
                onPageChange={fetchJobs}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default JobsPage;