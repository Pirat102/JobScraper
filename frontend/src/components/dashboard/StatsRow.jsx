import React from 'react';

const StatsRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600">{label}</span>
    <span className="font-bold text-gray-900">{value}</span>
  </div>
);

export default StatsRow;