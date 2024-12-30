import { useState, useEffect, useCallback } from "react";
import api from "../api";
import Job from "../components/Job";
import FilterPanel from "../components/FilterPanel";
import Pagination from "../components/Pagination";
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import "../styles/JobsPage.css";

function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [nextUrl, setNextUrl] = useState(null);
    const [previousUrl, setPreviousUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { t } = useLanguage();
    const { isAuthorized } = useAuth();

    const fetchJobs = useCallback(async (params = "") => {
        try {
            setLoading(true);
            const requests = [api.get(`api/jobs/filter${params}`)];
            
            if (isAuthorized) {
                requests.push(api.get('api/applications'));
            }

            const responses = await Promise.all(requests);
            const jobs = responses[0].data;

            if (isAuthorized && responses[1]) {
                const applications = responses[1].data;
                const applicationMap = applications.reduce((map, app) => {
                    map[app.job.id] = app;
                    return map;
                }, {});

                jobs.results = jobs.results.map(job => ({
                    ...job,
                    application: applicationMap[job.id] || null
                }));
            }

            setJobs(jobs);
            setNextUrl(jobs.next ? `?${jobs.next.split("?")[1]}` : null);
            setPreviousUrl(jobs.previous ? `?${jobs.previous.split("?")[1]}` : null);
            setError(null);
        } catch (err) {
            setError(t("error_message"));
        } finally {
            setLoading(false);
        }
    }, [isAuthorized]);

    const handleFilterChange = useCallback((filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (key === "skills" && value?.length > 0) {
                value.forEach(skill => params.append("skills", skill));
            } else if (value) {
                params.append(key, value);
            }
        });

        fetchJobs(`?${params}`);
    }, [fetchJobs]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

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

  const renderContent = () => {
    if (error) {
      return (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => fetchJobs()}>{t('try_again')}</button>
        </div>
      );
    }

    if (jobs.count === 0) {
      return <div className="no-jobs-state">{t('no_results')}</div>;
    }

    return (
      <>
        <div className="jobs-list">
          {jobs.results?.map((job) => (
            <Job key={job.id} job={job} />
          ))}
        </div>
        <Pagination
          next={nextUrl}
          previous={previousUrl}
          onPageChange={fetchJobs}
        />
      </>
    );
  };

  return (
    <div className="jobs-page">
      <div className="jobs-layout">
        <FilterPanel 
          onFilterChange={handleFilterChange} 
          jobCount={jobs.count}
          loading={loading}
        />
        <main className="jobs-container">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default JobsPage;