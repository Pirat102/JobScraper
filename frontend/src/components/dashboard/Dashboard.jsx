import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import StatsCard from './StatsCard';
import StatsRow from './StatsRow';
import SkillsTable from './SkillsTable';
import TrendChart from './TrendChart';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('all');
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedView]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedView !== 'all') {
        params.append('skills', selectedView);
      }
      const response = await api.get(`api/jobs/stats?${params}`);
      setStats(response.data);
      
      // Transform trend data for the chart
      const transformedTrendData = [
        { date: 'Last 7 days', count: response.data.trends.last_7_days },
        { date: 'Last 30 days', count: response.data.trends.last_30_days }
      ];
      setTrendData(transformedTrendData);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again later.');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Tabs defaultValue="all" className="w-full space-y-6">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setSelectedView('all')}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="Python" onClick={() => setSelectedView('Python')}>
            Python
          </TabsTrigger>
          <TabsTrigger value="JavaScript" onClick={() => setSelectedView('JavaScript')}>
            JavaScript
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedView}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Market Overview with Trend Chart */}
            <StatsCard title="Market Overview">
              <div className="h-48 mb-4">
                <TrendChart data={trendData} />
              </div>
              <StatsRow 
                label="Last 7 days:"
                value={`${stats.trends.last_7_days} jobs`}
              />
              <StatsRow 
                label="Last 30 days:"
                value={`${stats.trends.last_30_days} jobs`}
              />
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
              <div className="text-2xl font-bold text-center text-gray-900">
                {stats.salary_stats || "Not available"}
              </div>
            </StatsCard>

            <div className="lg:col-span-2">
              <StatsCard title="Most In-Demand Skills">
                <SkillsTable skills={stats.top_skills} />
              </StatsCard>
            </div>

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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;