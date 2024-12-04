import { useState, useEffect } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import api from "../api";
import "../styles/FilterPanel.css";

function FilterPanel({ onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    operating_mode: "",
    experience: "",
    skills: [],
    location: "",
    scraped_date: "",
    source: "",
  });
  const [openSections, setOpenSections] = useState({});
  const [availableDates, setAvailableDates] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const sections = [
    {
      id: 'operating_mode',
      title: 'Tryb pracy',
      options: [
        { value: 'Remote', label: 'Remote' },
        { value: 'Hybrid', label: 'Hybrid' },
        { value: 'Office', label: 'Office' },
      ]
    },
    {
      id: 'experience',
      title: 'Poziom stanowiska',
      options: [
        { value: 'trainee', label: 'Trainee' },
        { value: 'junior', label: 'Junior' },
        { value: 'mid', label: 'Mid' },
        { value: 'senior', label: 'Senior' },
        { value: 'expert', label: 'Expert' },
      ]
    },
    {
      id: 'skills',
      title: 'Technologie',
      isSkillSection: true,
      topSkills: ['Python', 'JavaScript', 'React', 'Django', 'SQL', 'AWS', 'Docker', 'TypeScript', 'Node.js', 'Git']
    },
    {
      id: 'location',
      title: 'Lokalizacja',
      options: [
        { value: 'Warszawa', label: 'Warszawa' },
        { value: 'Kraków', label: 'Kraków' },
        { value: 'Wrocław', label: 'Wrocław' },
        { value: 'Poznań', label: 'Poznań' },
        { value: 'Gdańsk', label: 'Gdańsk' },
      ]
    },
    {
      id: 'scraped_date',
      title: 'Daty od',
      options: [] // Will be populated with dates
    },
    {
      id: 'source',
      title: 'Źródło',
      options: [
        { value: 'Pracuj.pl', label: 'Pracuj.pl' },
        { value: 'NoFluffJobs', label: 'NoFluffJobs' },
        { value: 'JustJoinIt', label: 'JustJoinIt' },
        { value: 'TheProtocol', label: 'TheProtocol' },
      ]
    }
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    api.get("api/jobs/dates").then(res => {
      const formattedDates = res.data.map(date => ({
        value: date,
        label: new Date(date).toLocaleDateString()
      }));
      sections.find(s => s.id === 'scraped_date').options = formattedDates;
      setAvailableDates(formattedDates);
    });
  }, []);

  const handleFilterChange = async (section, value) => {
    let newFilters = { ...filters };

    if (section === 'skills') {
      newFilters.skills = filters.skills.includes(value)
        ? filters.skills.filter(s => s !== value)
        : [...filters.skills, value];
    } else {
      newFilters[section] = filters[section] === value ? "" : value;
    }

    setFilters(newFilters);
    
    if (!isMobile) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    const emptyFilters = {
      operating_mode: "",
      experience: "",
      skills: [],
      location: "",
      scraped_date: "",
      source: "",
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const renderSelectedFilters = () => {
    const selectedFilters = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'skills' && value.length > 0) {
        value.forEach(skill => {
          selectedFilters.push(
            <button 
              key={`skill-${skill}`} 
              className="selected-filter"
              onClick={() => handleFilterChange('skills', skill)}
            >
              {skill} <X size={14} />
            </button>
          );
        });
      } else if (value) {
        const section = sections.find(s => s.id === key);
        const option = section?.options?.find(o => o.value === value);
        if (option) {
          selectedFilters.push(
            <button
              key={key}
              className="selected-filter"
              onClick={() => handleFilterChange(key, value)}
            >
              {option.label} <X size={14} />
            </button>
          );
        }
      }
    });

    return selectedFilters.length > 0 && (
      <div className="selected-filters">
        {selectedFilters}
      </div>
    );
  };

  const renderSectionContent = (section) => {
    if (section.isSkillSection) {
      return (
        <div className="skills-list">
          {section.topSkills.map(skill => (
            <div
              key={skill}
              className={`skill-option ${filters.skills.includes(skill) ? 'selected' : ''}`}
              onClick={() => handleFilterChange('skills', skill)}
            >
              <span>{skill}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="option-list">
        {section.options.map(option => (
          <div
            key={option.value}
            className={`option-item ${filters[section.id] === option.value ? 'selected' : ''}`}
            onClick={() => handleFilterChange(section.id, option.value)}
          >
            <span>{option.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {isMobile && (
        <button className="mobile-filter-toggle" onClick={() => setIsOpen(true)}>
          <Filter size={20} />
          Filtry
        </button>
      )}

      <div className={`filter-panel ${isMobile ? 'mobile' : ''} ${isOpen ? 'open' : ''}`}>
        {isMobile && (
          <div className="filter-header">
            <h3>Filtry</h3>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>
        )}

        {renderSelectedFilters()}

        <div className="filter-content">
          {sections.map(section => (
            <div key={section.id} className="filter-section">
              <button
                className={`section-header ${openSections[section.id] ? 'open' : ''}`}
                onClick={() => setOpenSections(prev => ({
                  ...prev,
                  [section.id]: !prev[section.id]
                }))}
              >
                <span>{section.title}</span>
                <ChevronDown size={20} />
              </button>
              
              <div className={`section-content ${openSections[section.id] ? 'open' : ''}`}>
                {renderSectionContent(section)}
              </div>
            </div>
          ))}
        </div>

        {isMobile && (
          <div className="filter-footer">
            <button className="clear-button" onClick={clearFilters}>
              Wyczyść
            </button>
            <button 
              className="search-button" 
              onClick={() => {
                onFilterChange(filters);
                setIsOpen(false);
              }}
            >
              Zastosuj filtry
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default FilterPanel;