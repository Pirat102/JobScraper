import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import '../styles/ThemeToggle.css';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('access');
  const { t } = useLanguage();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">IT Job Board</Link>
        </div>
        <div className="navbar-links">
          <Link to="/" className="nav-link">{t('home')}</Link>
          <Link to="/jobs" className="nav-link">{t('jobs')}</Link>
          <Link to="/applications" className="nav-link">'Applications'</Link>
          {isAuthenticated ? (
            <Link onClick={handleLogout} className="nav-link">
              {t('logout')}
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav-link">{t('login')}</Link>
              <Link to="/register" className="nav-link">{t('register')}</Link>
            </>
          )}
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;