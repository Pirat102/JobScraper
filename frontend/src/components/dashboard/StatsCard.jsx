import React from 'react';
import '../../styles/StatsCard.css';

const StatsCard = ({ title, children, className }) => {
  return (
    <div className={`stats-card ${className || ''}`}>
      <h3 className="stats-card-title">{title}</h3>
      <div className="stats-card-content">
        {children}
      </div>
    </div>
  );
};
export default StatsCard;