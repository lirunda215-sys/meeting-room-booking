import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import api from '../services/api';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'EMPLOYEE',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      console.log('发送注册请求:', {
        username: formData.username,
        password: formData.password,
        role: formData.role,
      });

      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          role: formData.role,
        }),
      });

      console.log('响应状态:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('注册失败:', errorData);
        setError(errorData.error || t('registrationFailed'));
      } else {
        const data = await response.json();
        console.log('注册成功:', data);
        navigate('/login');
      }
    } catch (err) {
      console.error('请求异常:', err);
      setError(err.message || t('requestError') + ', ' + t('backendNotRunning'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h2 style={styles.title}>{t('registerAccount')}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('usernameLabel')} *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('passwordLabel')} *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('confirmPasswordLabel')} *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('roleLabel')}</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="EMPLOYEE">{t('employee')}</option>
              <option value="ADMIN">{t('admin')}</option>
            </select>
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? t('registering') : t('register')}
          </button>
        </form>
        <div style={styles.footer}>
          {t('alreadyHaveAccount')}<Link to="/login" style={styles.link}>{t('goToLogin')}</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  formBox: {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#1f2937',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
  },
  button: {
    padding: '0.75rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    '&:disabled': { opacity: 0.7, cursor: 'not-allowed' },
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    color: '#6b7280',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

export default Register;
