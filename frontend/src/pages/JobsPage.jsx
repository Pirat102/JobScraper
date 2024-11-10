// pages/JobsPage.jsx
import { useState, useEffect } from "react";
import api from "../api";
import Job from "../components/Job";
import FilterPanel from "../components/FilterPanel";
import '../styles/JobsPage.css';  // Make sure to create this CSS file

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial fetch of all jobs when component mounts
  useEffect(() => {
    fetchJobs();
  }, []);

  // Function to fetch jobs (with or without filters)
  const fetchJobs = async (params = '') => {
    setLoading(true);
    try {
      const response = await api.get(`api/jobs/filter/${params}`);
      setJobs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again later.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes from FilterPanel
  const handleFilterChange = (filters) => {
    const params = new URLSearchParams();
    
    // First add non-skill filters
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'skills' && value) {
        params.append(key, value);
      }
    });
  
    // Then add skills in a specific order
    if (filters.skills && Array.isArray(filters.skills) && filters.skills.length > 0) {
      // Sort skills alphabetically to ensure consistent order
      filters.skills.forEach(skill => {
        params.append('skills', skill);
      });
    }
    console.log('Filters being applied:', filters); // For debugging
    console.log('URL params:', params.toString()); // For debugging

    fetchJobs(`?${params}`);
  };

  return (
    <div className="jobs-page">
      {/* Header section with title and count */}
      <div className="jobs-header">
        <h2>Available Jobs</h2>
        {!loading && !error && (
          <p className="jobs-count">
            Found {jobs.length} job{jobs.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Main content with filters and job listings */}
      <div className="jobs-layout">
        {/* Filters sidebar */}
        <aside className="filters-container">
          <FilterPanel onFilterChange={handleFilterChange} />
        </aside>

        {/* Jobs list main content */}
        <main className="jobs-container">
          {loading ? (
            // Loading state
            <div className="loading-state">
              <p>Loading jobs...</p>
            </div>
          ) : error ? (
            // Error state
            <div className="error-state">
              <p>{error}</p>
              <button onClick={() => fetchJobs()}>Try Again</button>
            </div>
          ) : jobs.length === 0 ? (
            // No jobs found state
            <div className="no-jobs-state">
              <p>No jobs found matching your criteria.</p>
              <p>Try adjusting your filters or clearing them to see more results.</p>
            </div>
          ) : (
            // Jobs list
            <div className="jobs-list">
              {jobs.map((job) => (
                <Job 
                  key={job.id || job.url} // Fallback to url if id is not available
                  job={job} 
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default JobsPage;