import '../styles/Pagination.css';
import { useLanguage } from '../contexts/LanguageContext';

const Pagination = ({ next, previous, onPageChange }) => {
  if (!next && !previous) return null;
  const { t } = useLanguage();

  return (
    <nav className="pagination-nav">
      <button
        onClick={() => onPageChange(previous)}
        disabled={!previous}
        className="pagination-button"
      >
        {t('previous')}
      </button>
      
      <button
        onClick={() => onPageChange(next)}
        disabled={!next}
        className="pagination-button"
      >
        {t('next')}
      </button>
    </nav>
  );
};

export default Pagination;