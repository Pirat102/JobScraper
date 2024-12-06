import { ChevronDown } from "lucide-react";

export const FilterSection = ({ section, openSections, setOpenSections, children }) => {
  return (
    <div className="filter-section">
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
        />
      </button>
      <div className={`section-content ${openSections[section.id] ? 'open' : ''}`}>
        {children}
      </div>
    </div>
  );
};