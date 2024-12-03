import React from 'react';
import '../../styles/SkillsTable.css';

const SkillsTable = ({ skills, maxItems = 10 }) => {
  const skillsArray = Object.entries(skills)
    .slice(0, maxItems)
    .map(([skill, count], index) => ({
      skill,
      count,
      rank: index + 1
    }));

  const midPoint = Math.ceil(skillsArray.length / 2);
  const firstColumn = skillsArray.slice(0, midPoint);
  const secondColumn = skillsArray.slice(midPoint);

  return (
    <div className="skills-table">
      <div className="skills-column">
        {firstColumn.map(({ skill, count, rank }) => (
          <div key={skill} className="skills-table-row">
            <span className="skill-rank">{rank}.</span>
            <span className="skill-name">{skill}</span>
            <span className="skill-count">{count}</span>
          </div>
        ))}
      </div>
      <div className="skills-column">
        {secondColumn.map(({ skill, count, rank }) => (
          <div key={skill} className="skills-table-row">
            <span className="skill-rank">{rank}.</span>
            <span className="skill-name">{skill}</span>
            <span className="skill-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsTable;