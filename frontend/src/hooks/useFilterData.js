import { useState, useEffect } from 'react';
import { filterSections } from '../config/filterConfig';
import api from '../api';

export const useFilterData = () => {
  const [sections, setSections] = useState(filterSections);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, datesRes] = await Promise.all([
          api.get("api/jobs/stats"),
          api.get("api/jobs/dates")
        ]);

        const topSkills = Object.keys(statsRes.data.top_skills);
        const formattedDates = datesRes.data.map(date => ({
          value: date,
          label: new Date(date).toLocaleDateString()
        }));

        setSections(prev => prev.map(section => {
          if (section.id === 'scraped_date') {
            return { ...section, options: formattedDates };
          }
          if (section.id === 'skills') {
            return { ...section, topSkills };
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