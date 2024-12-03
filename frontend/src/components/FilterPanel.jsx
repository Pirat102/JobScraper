import { useState, useEffect } from "react";
import "../styles/FilterPanel.css";
import api from "../api";

function FilterPanel({ onFilterChange }) {
  const [filters, setFilters] = useState({
    title: "",
    location: "",
    scraped_date: "",
    experience: "",
    operating_mode: "",
    skills: [],
    source: "",
  });
  const [availableDates, setAvailableDates] = useState([]);
  
  // Add stats state to avoid multiple API calls
  const [stats, setStats] = useState({
    skills: [],
    sources: [],
    experiences: [],
    workModes: []
  });

  // State for available options
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
  const [topSkills, setTopSkills] = useState([]); // New state for top skills

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".multi-select-container")) {
        setIsSkillsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  // Fetch skills when component mounts
  useEffect(() => {
    Promise.all([
      api.get("api/jobs/stats"),
      api.get("api/jobs/dates")
    ]).then(([statsRes, datesRes]) => {
      setStats({
        skills: Object.keys(statsRes.data.top_skills),
        sources: Object.keys(statsRes.data.source_stats),
        experiences: Object.keys(statsRes.data.exp_stats),
        workModes: Object.keys(statsRes.data.operating_mode_stats)
      });
      setAvailableDates(datesRes.data);
      setAvailableSkills(Object.keys(statsRes.data.top_skills).sort());
      setTopSkills(Object.keys(statsRes.data.top_skills).slice(0, 10));
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSkillSelect = (skill) => {
    const newSkills = [...filters.skills, skill];
    const newFilters = {
      ...filters,
      skills: newSkills,
    };
    setFilters(newFilters);
    setSkillSearch("");
    setIsSkillsDropdownOpen(false);
    onFilterChange(newFilters);
  };

  // New function for filtering skills
  const getFilteredSkills = () => {
    if (skillSearch) {
      // If user is searching, filter through all available skills
      return availableSkills.filter(
        (skill) =>
          skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
          !filters.skills.includes(skill)
      );
    } else {
      // If no search term, show only top 10 skills that haven't been selected
      return topSkills.filter((skill) => !filters.skills.includes(skill));
    }
  };

  return (
    <div className="filter-panel">
      <h3>Filters</h3>

      {/* Search by title */}
      <div className="filter-section">
        <label htmlFor="title">Search by title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={filters.title}
          onChange={handleInputChange}
          placeholder="Search job titles..."
        />
      </div>
      {/* Search by source */}
      <div className="filter-section">
        <label htmlFor="source">Source</label>
        <select
          id="source"
          name="source"
          value={filters.source}
          onChange={handleInputChange}
        >
          <option value="">All Types</option>
          <option value="Pracuj.pl">Pracuj.pl</option>
          <option value="NoFluffJobs">NoFluffJobs</option>
          <option value="JustJoinIt">JustJoinIt</option>
          <option value="TheProtocol">TheProtocol</option>

        </select>
      </div>

      {/* Experience dropdown */}
      <div className="filter-section">
        <label htmlFor="experience">Experience</label>
        <select
          id="experience"
          name="experience"
          value={filters.experience}
          onChange={handleInputChange}
        >
          <option value="">All Types</option>
          <option value="trainee">Trainee</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      {/* Location dropdown */}
      <div className="filter-section">
        <label htmlFor="location">Location</label>
        <select
          id="location"
          name="location"
          value={filters.location}
          onChange={handleInputChange}
        >
          <option value="">All Locations</option>
          <option value="Gdańsk">Gdańsk</option>
          <option value="Katowice">Katowice</option>
          <option value="Kraków">Kraków</option>
          <option value="Łódź">Łódź</option>
          <option value="Poznań">Poznań</option>
          <option value="Warszawa">Warszawa</option>
          <option value="Wrocław">Wrocław</option>
        </select>
      </div>

      {/* Date dropdown */}
      <div className="filter-section">
        <label htmlFor="date">Date</label>
        <select
          id="scraped_date"
          name="scraped_date"
          value={filters.scraped_date}
          onChange={handleInputChange}
        >
          <option value="">All Dates</option>
          {availableDates.map(date => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString("en-GB")}
            </option>
          ))}
        </select>
      </div>

      {/* Operating Mode dropdown */}
      <div className="filter-section">
        <label htmlFor="operating_mode">Work Mode</label>
        <select
          id="operating_mode"
          name="operating_mode"
          value={filters.operating_mode}
          onChange={handleInputChange}
        >
          <option value="">All Types</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Office">Office</option>
        </select>
      </div>

      {/* Skills filter with search */}
      <div className="filter-section">
        <label>Skills (Top 10 Most Common)</label>
        <div className="multi-select-container">
          <input
            type="text"
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            onFocus={() => setIsSkillsDropdownOpen(true)}
            placeholder="Search skills or select from top 10..."
          />

          {isSkillsDropdownOpen && (
            <div className="skills-dropdown">
              {getFilteredSkills().length > 0 ? (
                getFilteredSkills().map((skill) => (
                  <div
                    key={skill}
                    className="skill-option"
                    onClick={() => handleSkillSelect(skill)}
                  >
                    {skill}
                    {!skillSearch && topSkills.includes(skill) && (
                      <span className="popular-tag">Popular</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-results">
                  {skillSearch
                    ? "No matching skills found"
                    : "No more top skills available"}
                </div>
              )}
            </div>
          )}

          {/* Selected skills tags */}
          <div className="skills-tags">
            {filters.skills.map((skill) => (
              <span key={skill} className="skill-tag">
                {skill}
                <span
                  className="remove-skill"
                  onClick={() => {
                    const newSkills = filters.skills.filter((s) => s !== skill);
                    const newFilters = { ...filters, skills: newSkills };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                >
                  ×
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Clear filters button */}
      {(filters.title ||
        filters.location ||
        filters.scraped_date ||
        filters.experience ||
        filters.operating_mode ||
        filters.source ||
        filters.skills.length > 0) && (
        <button
          className="clear-filters"
          onClick={() => {
            setFilters({
              title: "",
              location: "",
              scraped_date: "",
              experience: "",
              operating_mode: "",
              source: "",
              skills: [],
              
            });
            setSkillSearch("");
            onFilterChange("");
          }}
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

export default FilterPanel;
