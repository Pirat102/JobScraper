import { useState, useCallback } from 'react';
import { initialFilters } from '../config/filterConfig';

export const useFilterHandlers = (onFilterChange) => {
  const [filters, setFilters] = useState(initialFilters);

  const handleFilterChange = useCallback((section, value) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      
      if (section === 'skills') {
        newFilters.skills = prevFilters.skills.includes(value)
          ? prevFilters.skills.filter(s => s !== value)
          : [...prevFilters.skills, value];
      } else {
        newFilters[section] = prevFilters[section] === value ? "" : value;
      }

      onFilterChange(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    onFilterChange(initialFilters);
  }, [onFilterChange]);

  return {
    filters,
    handleFilterChange,
    clearFilters
  };
};