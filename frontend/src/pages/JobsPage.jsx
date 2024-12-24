import { useState, useEffect } from "react";
import api from "../api";
import Job from "../components/Job";
import FilterPanel from "../components/FilterPanel";
import Pagination from "../components/Pagination";
import "../styles/JobsPage.css";
import { useLanguage } from '../contexts/LanguageContext';

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [previousUrl, setPreviousUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  const handleJobUpdate = (updatedJob) => {
    setJobs(prevJobs => ({
      ...prevJobs,
      results: prevJobs.results.map(job => 
        job.id === updatedJob.id ? updatedJob : job
      )
    }));
  };

  const fetchJobs = async (params = "") => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchJobs();
  }, []);

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
            <div className="loading-state">{t('loading')}</div>
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
              <button onClick={() => fetchJobs()}>{t('try_again')}</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-page">
      <div className="jobs-layout">
        <FilterPanel 
          onFilterChange={handleFilterChange} 
          jobCount={jobs.count}
          loading={loading}
        />
        <main className="jobs-container">
          {jobs.count === 0 ? (
            <div className="no-jobs-state">{t('no_results')}</div>
          ) : (
            <>
              <div className="jobs-list">
                {jobs.results.map((job) => (
                  <Job 
                    key={job.id} 
                    job={job} 
                    onJobUpdate={handleJobUpdate}
                  />
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