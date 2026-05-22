import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';

function Login() {
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login({ username, password });
    if (result.success) {
      navigate('/');
    } else {
      setError(t('loginFailed'));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (role === 'ADMIN' && adminCode !== '778899') {
      setError(t('internalCodeError'));
      return;
    }

    const result = await register({ username, password, role });

    if (result.success) {
      setActiveTab('login');
      setPassword('');
      setConfirmPassword('');
      setAdminCode('');
      addToast(t('registerSuccess'), 'success');
    } else {
      setError(result.error || t('registerFailed'));
    }
  };

  return (
    <div style={styles.container}>
      {/* 左侧品牌展示区 */}
      <div style={styles.brandSection}>
        <div style={styles.brandContent}>
          <div style={styles.iconContainer}>
            <svg style={styles.icon} viewBox="0 0 24 24" fill="none">
              <path d="M3 5V19H21V5H3ZM19 17H5V7H19V17Z" fill="white"/>
              <path d="M7 9H17V11H7V9ZM7 12H14V14H7V12Z" fill="white"/>
              <path d="M5 3L19 3V5L5 5V3Z" fill="white"/>
            </svg>
          </div>
          <h1 style={styles.brandName}>MeetingHub</h1>
          <p style={styles.brandSlogan}>
            {t('appSlogan')}
          </p>
        </div>
      </div>

      {/* 右侧表单区 */}
      <div style={styles.formSection}>
        {/* 语言切换按钮 */}
        <div style={styles.langSwitchContainer}>
          <button onClick={toggleLanguage} style={styles.langSwitchBtn}>
            {language === 'zh' ? '🇷🇺' : '🇨🇳'}
          </button>
        </div>

        <div style={styles.formCard}>
          {/* 选项卡 */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'login' ? styles.tabActive : styles.tabInactive) }}
              onClick={() => setActiveTab('login')}
            >
              {t('login')}
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'register' ? styles.tabActive : styles.tabInactive) }}
              onClick={() => setActiveTab('register')}
            >
              {t('register')}
            </button>
          </div>

          {/* 登录表单 */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.inputGroup}>
                <div style={styles.inputIcon}>
                  <svg viewBox="0 0 24 24" fill="#9ca3af" style={{ width: '20px', height: '20px' }}>
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t('username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.inputIcon}>
                  <svg viewBox="0 0 24 24" fill="#9ca3af" style={{ width: '20px', height: '20px' }}>
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <button type="submit" style={styles.loginButton}>
                {t('login')}
              </button>

              <div style={styles.switchText}>
                {t('noAccount')}
                <button onClick={() => setActiveTab('register')} style={styles.switchLink}>
                  {t('signUpNow')}
                </button>
              </div>
            </form>
          )}

          {/* 注册表单 */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} style={styles.form}>
              <div style={styles.inputGroup}>
                <div style={styles.inputIcon}>
                  <svg viewBox="0 0 24 24" fill="#9ca3af" style={{ width: '20px', height: '20px' }}>
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t('username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.inputIcon}>
                  <svg viewBox="0 0 24 24" fill="#9ca3af" style={{ width: '20px', height: '20px' }}>
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.inputIcon}>
                  <svg viewBox="0 0 24 24" fill="#9ca3af" style={{ width: '20px', height: '20px' }}>
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder={t('confirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.roleSelector}>
                <label style={styles.label}>{t('selectRole')}</label>
                <div style={styles.roleButtons}>
                  <button
                    type="button"
                    style={{ 
                      ...styles.roleButton, 
                      ...(role === 'EMPLOYEE' ? styles.roleButtonActive : styles.roleButtonInactive) 
                    }}
                    onClick={() => setRole('EMPLOYEE')}
                  >
                    {t('employee')}
                  </button>
                  <button
                    type="button"
                    style={{ 
                      ...styles.roleButton, 
                      ...(role === 'ADMIN' ? styles.roleButtonActive : styles.roleButtonInactive) 
                    }}
                    onClick={() => setRole('ADMIN')}
                  >
                    {t('admin')}
                  </button>
                </div>
              </div>

              {role === 'ADMIN' && (
                <div style={styles.inputGroup}>
                  <div style={styles.inputIcon}>
                    <svg viewBox="0 0 24 24" fill="#9ca3af" style={{ width: '20px', height: '20px' }}>
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder={t('internalCodePlaceholder')}
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              )}

              {error && <div style={styles.error}>{error}</div>}

              <button type="submit" style={styles.registerButton}>
                {t('register')}
              </button>

              <div style={styles.switchText}>
                {t('haveAccount')}
                <button onClick={() => setActiveTab('login')} style={styles.switchLink}>
                  {t('goToLogin')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  brandSection: {
    flex: 1,
    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  brandContent: {
    textAlign: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: '120px',
    height: '120px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 2rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  icon: {
    width: '60px',
    height: '60px',
  },
  brandName: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 1rem 0',
    letterSpacing: '2px',
  },
  brandSlogan: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
    letterSpacing: '4px',
  },
  formSection: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    background: '#f8fafc',
    position: 'relative',
  },
  langSwitchContainer: {
    position: 'absolute',
    top: '2rem',
    right: '2rem',
  },
  langSwitchBtn: {
    width: '44px',
    height: '44px',
    fontSize: '1.5rem',
    border: 'none',
    borderRadius: '50%',
    background: '#4f46e5',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
  },
  formCard: {
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    padding: '3rem',
    width: '100%',
    maxWidth: '450px',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    background: '#f1f5f9',
    borderRadius: '12px',
    padding: '4px',
  },
  tab: {
    flex: 1,
    padding: '0.75rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  tabActive: {
    background: '#1E3A8A',
    color: 'white',
  },
  tabInactive: {
    background: 'transparent',
    color: '#475569',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem 0.875rem 3rem',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box',
  },
  roleSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  roleButtons: {
    display: 'flex',
    gap: '0.75rem',
  },
  roleButton: {
    flex: 1,
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'white',
  },
  roleButtonActive: {
    borderColor: '#1E3A8A',
    background: '#eff6ff',
    color: '#1E3A8A',
  },
  roleButtonInactive: {
    color: '#64748b',
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    fontSize: '0.875rem',
    padding: '0.75rem',
    background: '#fef2f2',
    borderRadius: '8px',
  },
  loginButton: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '0.5rem',
  },
  registerButton: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '0.5rem',
  },
  switchText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.875rem',
    marginTop: '1rem',
  },
  switchLink: {
    color: '#3B82F6',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.875rem',
  },
};

export default Login;
