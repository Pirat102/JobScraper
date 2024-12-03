import React, { useState, useEffect } from "react";
import api from "../../api";
import StatsCard from "./StatsCard";
import StatsRow from "./StatsRow";
import SkillsTable from "./SkillsTable";
import "../../styles/Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState("all");

  const fetchDashboardData = async (view) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (view !== "all") {
        params.append("skills", view);
      }
      const response = await api.get(`api/jobs/stats?${params}`);
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again later.");
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedView);
  }, [selectedView]);

  const handleViewChange = (view) => {
    setSelectedView(view);
  };

  if (loading) {
    return <div className="dashboard-loader">Loading...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button
          onClick={() => fetchDashboardData(selectedView)}
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="dashboard">
      <div className="dashboard-filters">
        <button
          className={`filter-button ${selectedView === "all" ? "active" : ""}`}
          onClick={() => handleViewChange("all")}
        >
          Overview
        </button>
        <button
          className={`filter-button ${
            selectedView === "Python" ? "active" : ""
          }`}
          onClick={() => handleViewChange("Python")}
        >
          Python
        </button>
        <button
          className={`filter-button ${
            selectedView === "JavaScript" ? "active" : ""
          }`}
          onClick={() => handleViewChange("JavaScript")}
        >
          JavaScript
        </button>
      </div>
      <div className="dashboard-grid">
        <StatsCard title="Market Overview" className="market-overview">
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
            <StatsRow key={level} label={level} value={count} />
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
            <StatsRow key={mode} label={mode || "Unspecified"} value={count} />
          ))}
        </StatsCard>
      </div>
    </div>
  );
};

export default Dashboard;
