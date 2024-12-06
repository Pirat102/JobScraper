import { useState } from "react";
import { Filter, X } from "lucide-react";
import { filterSections } from "../config/filterConfig";
import { useFilterHandlers } from "../hooks/useFilterHandlers";
import { useMobileHandler } from "../hooks/useMobileHandler";
import { useFilterData } from "../hooks/useFilterData";
import { FilterSection } from "./FilterSection";
import "../styles/FilterPanel.css";
import { useLanguage } from "../contexts/LanguageContext";

function FilterPanel({ onFilterChange, jobCount }) {
  const { filters, handleFilterChange, clearFilters } =
    useFilterHandlers(onFilterChange);
  const { isOpen, setIsOpen, isMobile } = useMobileHandler();
  const { sections } = useFilterData();
  const { t } = useLanguage();
  const [skillSearch, setSkillSearch] = useState("");
  const [openSections, setOpenSections] = useState(
    filterSections.reduce(
      (acc, section) => ({
        ...acc,
        [section.id]: section.defaultOpen,
      }),
      {}
    )
  );

  const getFilteredSkills = (section) => {
    if (!skillSearch) return section.topSkills.slice(0, 10);
    return section.topSkills.filter((skill) =>
      skill.toLowerCase().includes(skillSearch.toLowerCase())
    );
  };

  const renderSelectedFilters = () => {
    const selectedFilters = Object.entries(filters).flatMap(([key, value]) => {
      if (key === "skills" && value.length > 0) {
        return value.map((skill) => ({
          key: `skill-${skill}`,
          label: skill,
          onClick: () => handleFilterChange("skills", skill),
        }));
      }

      if (!value) return [];

      const section = sections.find((s) => s.id === key);
      const option = section?.options?.find((o) => o.value === value);
      return option
        ? [
            {
              key,
              label: option.label,
              onClick: () => handleFilterChange(key, value),
            },
          ]
        : [];
    });

    if (selectedFilters.length === 0) return null;

    return (
      <div className="selected-filters">
        {selectedFilters.map((filter) => (
          <button
            key={filter.key}
            className="selected-filter"
            onClick={filter.onClick}
          >
            {filter.label} <X size={14} />
          </button>
        ))}
      </div>
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
            {getFilteredSkills(section).map((skill) => (
              <div
                key={skill}
                className={`skill-option ${
                  filters.skills.includes(skill) ? "selected" : ""
                }`}
                onClick={() => handleFilterChange("skills", skill)}
              >
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`option-list ${
          section.id === "scraped_date" ? "date-list" : ""
        }`}
      >
        {section.options.map((option) => (
          <div
            key={option.value}
            className={`option-item ${
              filters[section.id] === option.value ? "selected" : ""
            }`}
            onClick={() => handleFilterChange(section.id, option.value)}
          >
            <span>{option.labelKey ? t(option.labelKey) : option.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {isMobile && (
        <button
          className="mobile-filter-toggle"
          onClick={() => setIsOpen(true)}
        >
          <Filter size={20} />
          <span>{t("filters")}</span>
          {Object.values(filters).some((v) => v && v.length !== 0) && (
            <span className="filter-count">•</span>
          )}
        </button>
      )}

      <div
        className={`filter-panel ${isMobile ? "mobile" : ""} ${
          isOpen ? "open" : ""
        }`}
      >
        {isMobile && (
          <div className="filter-header">
            <h3>{t("filters")}</h3>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>
        )}

        <div className="jobs-count-wrapper">
          <p className="jobs-count">
            {t("found_jobs").replace("{{count}}", jobCount)}
          </p>
        </div>

        {renderSelectedFilters()}

        <div className="filter-content">
          {sections.map((section) => (
            <FilterSection
              key={section.id}
              section={section}
              openSections={openSections}
              setOpenSections={setOpenSections}
            >
              {renderSectionContent(section)}
            </FilterSection>
          ))}
        </div>

        {isMobile && (
          <div className="filter-footer">
            <button className="clear-button" onClick={clearFilters}>
              {t("clear_filters")}
            </button>
            <button
              className="search-button"
              onClick={() => {
                onFilterChange(filters);
                setIsOpen(false);
              }}
            >
              {t("apply_filters")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default FilterPanel;
