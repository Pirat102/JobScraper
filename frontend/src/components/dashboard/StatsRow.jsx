import React from 'react';
import '../../styles/StatsRow.css';

const StatsRow = ({ label, value }) => (
  <div className="stats-row">
    <span className="stats-label">{label}</span>
    <span className="stats-value">{value}</span>
  </div>
);

export default StatsRow;