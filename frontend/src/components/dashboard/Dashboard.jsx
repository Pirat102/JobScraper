import React, { useState, useEffect } from 'react';
import api from '../../api';
import StatsCard from './StatsCard';
import StatsRow from './StatsRow';
import SkillsTable from './SkillsTable';
import '../../styles/Dashboard.css';
import { useLanguage } from '../../contexts/LanguageContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('');
  const { t } = useLanguage();

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
            {t('overview')}
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
              {t(level)}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-grid">
        <StatsCard title={t('market_overview')} className="market-overview">
          <div className="market-stats">
            <StatsRow 
              label={t('today')}
              value={`${stats.trends.today} ${t('jobs')}`}
            />
            <StatsRow 
              label={t('last_7_days')}
              value={`${stats.trends.last_7_days} ${t('jobs')}`}
            />
            <StatsRow 
              label={t('last_14_days')}
              value={`${stats.trends.last_14_days} ${t('jobs')}`}
            />
            <StatsRow 
              label={t('last_30_days')}
              value={`${stats.trends.last_30_days} ${t('jobs')}`}
            />
          </div>
        </StatsCard>

        <StatsCard title={t('experience_distribution')}>
          {Object.entries(stats.exp_stats).map(([level, count]) => (
            <StatsRow 
              key={level}
              label={t(level.toLowerCase())}
              value={count}
            />
          ))}
        </StatsCard>

        <StatsCard title={t('average_salary')}>
          <div className="salary-display">
            {stats.salary_stats || t('not_available')}
          </div>
        </StatsCard>

        <StatsCard title={t('most_demanded_skills')} className="skills-card">
          <SkillsTable skills={stats.top_skills} />
        </StatsCard>

        <StatsCard title={t('work_mode_distribution')}>
          {Object.entries(stats.operating_mode_stats).map(([mode, count]) => (
            <StatsRow 
              key={mode}
              label={t(mode.toLowerCase()) || t('not_specified')}
              value={count}
            />
          ))}
        </StatsCard>
      </div>
    </div>
  );
};

export default Dashboard;