import React from 'react';

const SkillsTable = ({ skills, maxItems = 10 }) => (
  <div className="grid grid-cols-2 gap-4">
    {Object.entries(skills)
      .slice(0, maxItems)
      .map(([skill, count]) => (
        <div key={skill} className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-700">{skill}</span>
          <span className="font-semibold text-gray-900">{count}</span>
        </div>
      ))}
  </div>
);

export default SkillsTable;