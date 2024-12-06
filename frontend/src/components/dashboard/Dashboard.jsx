import React, { useState, useEffect } from 'react';
import api from '../../api';
import StatsCard from './StatsCard';
import StatsRow from './StatsRow';
import SkillsTable from './SkillsTable';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('');

  const experienceLevels = ['trainee', 'junior', 'mid', 'senior', 'expert'];

  const fetchDashboardData = async (view, experience) => {
    try {
      const params = new URLSearchParams();
      
      if (view !== 'all') {
        params.append('skills', view);
      }
      
      if (experience.length > 0) {
        params.append('experience', experience);
      }
      
      const response = await api.get(`api/jobs/stats?${params}`);
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again later.');
      console.error('Dashboard data fetch error:', err);
    } finally {
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedView, selectedExperience);
  }, [selectedView, selectedExperience]);



  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={() => fetchDashboardData(selectedView, selectedExperience)} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="dashboard">
      <div className="dashboard-filters">
        <div className="main-filters">
          <button 
            className={`filter-button ${selectedView === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedView('all')}
          >
            Overview
          </button>
          <button 
            className={`filter-button ${selectedView === 'Python' ? 'active' : ''}`}
            onClick={() => setSelectedView('Python')}
          >
            Python
          </button>
          <button 
            className={`filter-button ${selectedView === 'JavaScript' ? 'active' : ''}`}
            onClick={() => setSelectedView('JavaScript')}
          >
            JavaScript
          </button>
        </div>
        <div className="experience-filters">
          {experienceLevels.map(level => (
            <button
              key={level}
              className={`experience-button ${selectedExperience === level ? 'active' : ''}`}
              onClick={() => setSelectedExperience(selectedExperience === level ? '' : level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-grid">
        <StatsCard title="Market Overview" className="market-overview">
          <div className="market-stats">
            <StatsRow 
              label="Today"
              value={`${stats.trends.today} jobs`}
            />
            <StatsRow 
              label="Last 7 days"
              value={`${stats.trends.last_7_days} jobs`}
            />
            <StatsRow 
              label="Last 14 days"
              value={`${stats.trends.last_14_days} jobs`}
            />
            <StatsRow 
              label="Last 30 days"
              value={`${stats.trends.last_30_days} jobs`}
            />
          </div>
        </StatsCard>

        <StatsCard title="Experience Distribution">
          {Object.entries(stats.exp_stats).map(([level, count]) => (
            <StatsRow 
              key={level}
              label={level}
              value={count}
            />
          ))}
        </StatsCard>

        <StatsCard title="Average Salary">
          <div className="salary-display">
            {stats.salary_stats || "Not available"}
          </div>
        </StatsCard>

        <StatsCard title="Most In-Demand Skills" className="skills-card">
          <SkillsTable skills={stats.top_skills} />
        </StatsCard>

        <StatsCard title="Work Mode Distribution">
          {Object.entries(stats.operating_mode_stats).map(([mode, count]) => (
            <StatsRow 
              key={mode}
              label={mode || 'Unspecified'}
              value={count}
            />
          ))}
        </StatsCard>
      </div>
    </div>
  );
};

export default Dashboard;