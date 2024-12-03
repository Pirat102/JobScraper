import React from 'react';
import '../../styles/SkillsTable.css';

const SkillsTable = ({ skills, maxItems = 10 }) => (
  <div className="skills-table">
    {Object.entries(skills)
      .slice(0, maxItems)
      .map(([skill, count]) => (
        <div key={skill} className="skills-table-row">
          <span className="skill-name">{skill}</span>
          <span className="skill-count">{count}</span>
        </div>
      ))}
  </div>
);

export default SkillsTable;