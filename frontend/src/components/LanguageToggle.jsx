import { useLanguage } from '../contexts/LanguageContext';
import '../styles/LanguageToggle.css';

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button onClick={toggleLanguage} className="language-toggle">
      {language === 'pl' ? 'EN' : 'PL'}
    </button>
  );
};