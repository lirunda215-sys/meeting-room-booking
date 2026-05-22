import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || location.pathname === '/admin') return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        {t('appName')}
      </div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>{t('calendar')}</Link>
        <Link to="/my-meetings" style={styles.link}>{t('myMeetings')}</Link>
        {isAdmin() && <Link to="/admin" style={styles.link}>{t('admin')}</Link>}
        <span style={styles.userInfo}>
          {t('welcome')}, {user.name} ({user.role === 'ADMIN' ? t('admin') : t('employee')})
        </span>
        <button onClick={toggleLanguage} style={styles.langBtn}>
          {language === 'zh' ? '🇷🇺 RU' : '🇨🇳 中文'}
        </button>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          {t('logout')}
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: '#2563eb',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
  },
  userInfo: {
    marginLeft: '1rem',
  },
  langBtn: {
    padding: '0.35rem 0.75rem',
    background: '#4f46e5',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    background: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
  },
};

export default Navbar;
