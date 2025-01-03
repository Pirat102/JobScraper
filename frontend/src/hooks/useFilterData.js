import { useState, useEffect } from 'react';
import { filterSections } from '../config/filterConfig';
import api from '../api';

export const useFilterData = () => {
  const [sections, setSections] = useState(filterSections);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filterOptionsRes = await api.get("api/jobs/filter-options");
        const { top_skills, available_dates } = filterOptionsRes.data;

        setSections(prev => prev.map(section => {
          if (section.id === 'scraped_date') {
            return { 
              ...section, 
              options: available_dates.map(date => ({
                value: date,
                label: new Date(date).toLocaleDateString()
              }))
            };
          }
          if (section.id === 'skills') {
            return { ...section, topSkills: top_skills };
          }
          return section;
        }));
      } catch (error) {
        console.error("Failed to fetch filter data:", error);
      }
    };

    fetchData();
  }, []);

  return { sections };
};