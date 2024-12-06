import { useState, useEffect } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import api from "../api";
import "../styles/FilterPanel.css";

function FilterPanel({ onFilterChange, jobCount }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    operating_mode: "",
    experience: "",
    skills: [],
    location: "",
    scraped_date: "",
    source: "",
  });
  // Set default open sections for the first three filters
  const [openSections, setOpenSections] = useState({
    operating_mode: true,
    experience: true,
    skills: true,
    location: false,
    scraped_date: false,
    source: false
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [skillSearch, setSkillSearch] = useState("");
  const [sections, setSections] = useState([
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
      topSkills: []
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
      options: []
    },
    {
      id: 'source',
      title: 'Źródło',
      options: [
        { value: 'Pracuj.pl', label: 'Pracuj.pl' },
        { value: 'NoFluffJobs', label: 'NoFluffJobs' },
        { value: 'JustJoinIT', label: 'JustJoinIT' },
        { value: 'TheProtocol', label: 'TheProtocol' },
      ]
    }
  ]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add body scroll lock for mobile filters
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    Promise.all([
      api.get("api/jobs/stats"),
      api.get("api/jobs/dates")
    ]).then(([statsRes, datesRes]) => {
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
    }).catch(error => {
      console.error("Failed to fetch initial data:", error);
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
    
    onFilterChange(newFilters);
    
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
    if (isMobile) {
      setIsOpen(false);
    }
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

  const getFilteredSkills = (section) => {
    if (!skillSearch) return section.topSkills.slice(0, 10);
    return section.topSkills.filter(skill => 
      skill.toLowerCase().includes(skillSearch.toLowerCase())
    );
  };

  const renderSectionContent = (section) => {
    if (section.isSkillSection) {
      return (
        <div className="skills-section">
          <input
            type="text"
            placeholder="Wpisz nazwę technologii..."
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            className="skill-search-input"
          />
          <div className="skills-list">
            {getFilteredSkills(section).map(skill => (
              <div
                key={skill}
                className={`skill-option ${filters.skills.includes(skill) ? 'selected' : ''}`}
                onClick={() => handleFilterChange('skills', skill)}
              >
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className={`option-list ${section.id === 'scraped_date' ? 'date-list' : ''}`}>
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

        <div className="jobs-count-wrapper">
          <p className="jobs-count">Found {jobCount} jobs</p>
        </div>

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
                <ChevronDown 
                  size={20} 
                  className={openSections[section.id] ? 'rotate-180' : ''}
                  style={{ transition: 'transform 0.2s' }}
                />
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