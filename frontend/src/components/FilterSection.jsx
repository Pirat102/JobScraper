import { ChevronDown } from "lucide-react";
import { useLanguage } from '../contexts/LanguageContext';

export const FilterSection = ({ section, openSections, setOpenSections, children }) => {
  const { t } = useLanguage();
  
  return (
    <div className="filter-section">
      <button
        className={`section-header ${openSections[section.id] ? 'open' : ''}`}
        onClick={() => setOpenSections(prev => ({
          ...prev,
          [section.id]: !prev[section.id]
        }))}
      >
        <span>{t(section.titleKey)}</span>
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