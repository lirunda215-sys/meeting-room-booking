import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { useDialog } from '../hooks/useDialog';
import api from '../services/api';

function AdminDashboard() {
  const { user } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [meetings, rooms, users] = await Promise.all([
        api.meetings.getAll(),
        api.rooms.getAll(),
        api.users.getAll()
      ]);
      
      const today = new Date();
      const todayMeetings = meetings.filter(m => {
        const mDate = new Date(m.startTime);
        return mDate.toDateString() === today.toDateString() && m.status === 'SCHEDULED';
      });

      setStats({
        todayMeetings: todayMeetings.length,
        totalRooms: rooms.filter(r => r.isActive).length,
        totalUsers: users.length,
        upcomingMeetings: meetings.filter(m => 
          new Date(m.startTime) > new Date() && m.status === 'SCHEDULED'
        ).slice(0, 5)
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', nameKey: 'dashboard', icon: '📊' },
    { id: 'rooms', nameKey: 'rooms', icon: '🏢' },
    { id: 'catering', nameKey: 'catering', icon: '🍵' },
    { id: 'users', nameKey: 'users', icon: '👥' },
    { id: 'bookings', nameKey: 'bookings', icon: '📅' },
    { id: 'settings', nameKey: 'settings', icon: '⚙️' }
  ];

  return (
    <div style={styles.container}>
      <nav style={styles.sidebar}>
        <div style={styles.logo}>
          <h2 style={styles.logoText}>MeetingHub</h2>
          <span style={styles.logoSub}>{t('adminPanel')}</span>
        </div>

        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div style={styles.userName}>{user?.name || t('admin')}</div>
            <div style={styles.userRole}>{user?.role === 'ADMIN' ? t('admin') : t('employee')}</div>
          </div>
        </div>

        <div style={styles.menu}>
          {menuItems.map(item => (
            <button
              key={item.id}
              style={{
                ...styles.menuItem,
                ...(activeTab === item.id ? styles.menuItemActive : {})
              }}
              onClick={() => setActiveTab(item.id)}
            >
              <span style={styles.menuIcon}>{item.icon}</span>
              <span>{t(item.nameKey)}</span>
            </button>
          ))}
        </div>

        <div style={styles.langSwitch}>
          <button onClick={toggleLanguage} style={styles.langBtn}>
            {language === 'zh' ? '🇷🇺 RU' : '🇨🇳 中'}
          </button>
        </div>

        <button 
          style={styles.logoutBtn}
          onClick={() => navigate('/')}
        >
          ← {t('backToHome')}
        </button>
      </nav>

      <main style={styles.main}>
        {activeTab === 'dashboard' && (
          <DashboardContent stats={stats} loading={loading} />
        )}
        {activeTab === 'rooms' && (
          <RoomsManagement refreshStats={fetchStats} />
        )}
        {activeTab === 'catering' && (
          <CateringManagement />
        )}
        {activeTab === 'users' && (
          <UsersManagement />
        )}
        {activeTab === 'bookings' && (
          <BookingsManagement />
        )}
        {activeTab === 'settings' && (
          <SystemSettings />
        )}
      </main>
    </div>
  );
}

function DashboardContent({ stats, loading }) {
  const { language, t } = useLanguage();

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}>⏳</div>
        <div>{t('loading')}</div>
      </div>
    );
  }

  const statCards = [
    { 
      labelKey: 'today', 
      value: stats?.todayMeetings || 0, 
      color: '#3B82F6', 
      icon: '📅' 
    },
    { 
      labelKey: 'availableRooms', 
      value: stats?.totalRooms || 0, 
      color: '#10B981', 
      icon: '🏢' 
    },
    { 
      labelKey: 'totalUsers', 
      value: stats?.totalUsers || 0, 
      color: '#F59E0B', 
      icon: '👥' 
    },
    { 
      labelKey: 'upcomingMeetings', 
      value: stats?.upcomingMeetings?.length || 0, 
      color: '#EF4444', 
      icon: '⏰' 
    }
  ];

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>{t('dashboard')}</h1>
        <p style={styles.pageDesc}>{t('systemOverview')}</p>
      </div>

      <div style={styles.statsGrid}>
        {statCards.map((card, index) => (
          <div key={index} style={{ ...styles.statCard, borderTopColor: card.color }}>
            <div style={styles.statIcon}>{card.icon}</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{card.value}</div>
              <div style={styles.statLabel}>{t(card.labelKey)}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>{t('upcomingMeetings')}</h3>
        </div>
        <div style={styles.tableContainer}>
          {stats?.upcomingMeetings?.length === 0 ? (
            <div style={styles.emptyState}>
              {t('noUpcomingMeetings')}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t('meeting')}</th>
                  <th style={styles.th}>{t('room')}</th>
                  <th style={styles.th}>{t('startTime')}</th>
                  <th style={styles.th}>{t('bookedBy')}</th>
                </tr>
              </thead>
              <tbody>
                {stats?.upcomingMeetings?.map(meeting => (
                  <tr key={meeting.id} style={styles.tr}>
                    <td style={styles.td}>{meeting.title}</td>
                    <td style={styles.td}>{meeting.room?.name || t('unknown')}</td>
                    <td style={styles.td}>
                      {new Date(meeting.startTime).toLocaleString(language === 'zh' ? 'zh-CN' : 'ru-RU')}
                    </td>
                    <td style={styles.td}>{meeting.organizer?.name || t('unknown')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function RoomsManagement({ refreshStats }) {
  const { language, t } = useLanguage();
  const { addToast } = useToast();
  const { showConfirm } = useDialog();
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    equipment: '',
    isActive: true
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await api.rooms.getAll();
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.rooms.update(editing.id, formData);
        addToast(t('roomUpdated'), 'success');
      } else {
        await api.rooms.create(formData);
        addToast(t('roomAdded'), 'success');
      }
      setShowForm(false);
      setEditing(null);
      setFormData({ name: '', location: '', capacity: '', equipment: '', isActive: true });
      fetchRooms();
      refreshStats();
    } catch (err) {
      addToast(t('operationFailed'), 'error');
    }
  };

  const handleEdit = (room) => {
    setEditing(room);
    setFormData(room);
    setShowForm(true);
  };

  const handleDelete = async (roomId) => {
    const confirmed = await showConfirm({
      title: t('confirmDelete'),
      message: t('confirmDeleteRoom'),
      confirmText: t('delete'),
      cancelText: t('cancel'),
      confirmColor: '#dc2626'
    });
    if (confirmed) {
      try {
        await api.rooms.delete(roomId);
        fetchRooms();
        refreshStats();
        addToast(t('roomDeleted'), 'success');
      } catch (err) {
        addToast(t('operationFailed'), 'error');
      }
    }
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>{t('rooms')}</h1>
        <button style={styles.addButton} onClick={() => setShowForm(true)}>
          + {t('addRoom')}
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{t('roomName')}</th>
                <th style={styles.th}>{t('location')}</th>
                <th style={styles.th}>{t('capacity')}</th>
                <th style={styles.th}>{t('roomEquipment')}</th>
                <th style={styles.th}>{t('roomStatus')}</th>
                <th style={styles.th}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.roomName}>{room.name}</div>
                  </td>
                  <td style={styles.td}>{room.location || '-'}</td>
                  <td style={styles.td}>{room.capacity} {t('people')}</td>
                  <td style={styles.td}>{room.equipment || '-'}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      background: room.isActive ? '#D1FAE5' : '#FEE2E2',
                      color: room.isActive ? '#059669' : '#DC2626'
                    }}>
                      {room.isActive ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button style={styles.editButton} onClick={() => handleEdit(room)}>
                        {t('edit')}
                      </button>
                      <button style={styles.deleteButton} onClick={() => handleDelete(room.id)}>
                        {t('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={styles.modal} onClick={() => setShowForm(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>{editing ? t('editRoom') : t('addRoom')}</h3>
              <button style={styles.closeButton} onClick={() => setShowForm(false)}>×</button>
            </div>
            <form style={styles.form} onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>{t('roomName')} *</label>
                <input
                  style={styles.input}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>{t('location')}</label>
                  <input
                    style={styles.input}
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>{t('capacity')} *</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={formData.capacity}
                    onChange={e => setFormData({...formData, capacity: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>{t('roomEquipment')}</label>
                <input
                  style={styles.input}
                  value={formData.equipment}
                  onChange={e => setFormData({...formData, equipment: e.target.value})}
                  placeholder={t('equipmentPlaceholder')}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  />
                  {t('active')}
                </label>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelButton} onClick={() => setShowForm(false)}>
                  {t('cancel')}
                </button>
                <button type="submit" style={styles.submitButton}>
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CateringManagement() {
  const { language, t } = useLanguage();
  const { addToast } = useToast();
  const { showConfirm } = useDialog();
  const [caterings, setCaterings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    imageUrl: '',
    price: 0
  });

  useEffect(() => {
    fetchCaterings();
  }, []);

  const fetchCaterings = async () => {
    try {
      const data = await api.catering.getAll();
      setCaterings(data);
    } catch (err) {
      console.error('Error fetching catering:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 前端验证
    if (!formData.name || formData.name.trim() === '') {
      addToast(t('pleaseEnterServiceName'), 'warning');
      return;
    }
    if (formData.name.length > 100) {
      addToast(t('serviceNameTooLong'), 'warning');
      return;
    }
    
    try {
      console.log('Submitting catering:', formData);
      // 确保数据格式正确
      const submitData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        isActive: !!formData.isActive,
        imageUrl: formData.imageUrl?.trim() || null,
        price: formData.price || 0
      };
      console.log('Submit data:', submitData);
      
      if (editing) {
        await api.catering.update(editing.id, submitData);
        addToast(t('serviceUpdated'), 'success');
      } else {
        await api.catering.create(submitData);
        addToast(t('serviceAdded'), 'success');
      }
      setShowForm(false);
      setEditing(null);
      setFormData({ name: '', description: '', isActive: true, imageUrl: '', price: 0 });
      fetchCaterings();
    } catch (err) {
      console.error('Error submitting catering:', err);
      const errorMsg = err.error || err.message || t('operationFailed');
      addToast(errorMsg, 'error');
    }
  };

  const handleEdit = (catering) => {
    setEditing(catering);
    setFormData(catering);
    setShowForm(true);
  };

  const handleDelete = async (cateringId) => {
    const confirmed = await showConfirm({
      title: t('confirmDelete'),
      message: t('deleteMessage'),
      confirmText: t('delete'),
      cancelText: t('cancel'),
      confirmColor: '#dc2626'
    });
    if (confirmed) {
      try {
        await api.catering.delete(cateringId);
        fetchCaterings();
        addToast(t('serviceDeleted'), 'success');
      } catch (err) {
        console.error('Error deleting catering:', err);
        const errorMsg = err.error || err.message || t('deleteFailed');
        addToast(errorMsg, 'error');
      }
    }
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>{t('cateringManagement')}</h1>
        <button style={styles.addButton} onClick={() => setShowForm(true)}>
          + {t('addCatering')}
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{t('cateringName')}</th>
                <th style={styles.th}>{t('description')}</th>
                <th style={styles.th}>{t('cateringStatus')}</th>
                <th style={styles.th}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {caterings.map(catering => (
                <tr key={catering.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.roomName}>{catering.name}</div>
                  </td>
                  <td style={styles.td}>{catering.description || '-'}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      background: catering.isActive ? '#D1FAE5' : '#FEE2E2',
                      color: catering.isActive ? '#059669' : '#DC2626'
                    }}>
                      {catering.isActive ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button style={styles.editButton} onClick={() => handleEdit(catering)}>
                        {t('edit')}
                      </button>
                      <button style={styles.deleteButton} onClick={() => handleDelete(catering.id)}>
                        {t('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={styles.modal} onClick={() => setShowForm(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>{editing ? t('editCatering') : t('addCatering')}</h3>
              <button style={styles.closeButton} onClick={() => setShowForm(false)}>×</button>
            </div>
            <form style={styles.form} onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>{t('cateringName')} *</label>
                <input
                  style={styles.input}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>{t('description')}</label>
                <textarea
                  style={{...styles.input, minHeight: '60px', resize: 'vertical'}}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder={t('descriptionPlaceholder')}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>{t('imageUrl')}</label>
                <input
                  style={styles.input}
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder={t('imageUrlPlaceholder')}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  />
                  {t('active')}
                </label>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelButton} onClick={() => setShowForm(false)}>
                  {t('cancel')}
                </button>
                <button type="submit" style={styles.submitButton}>
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersManagement() {
  const { language, t } = useLanguage();
  const { addToast } = useToast();
  const { showConfirm } = useDialog();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.users.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'EMPLOYEE' : 'ADMIN';
    let roleLabel = newRole === 'ADMIN' ? t('admin') : t('employee');
    const message = t('confirmChangeRoleMessage').replace('{name}', user.name).replace('{role}', roleLabel);
    
    const confirmed = await showConfirm({
      title: t('confirmChangeRole'),
      message: message,
      confirmText: t('confirm'),
      cancelText: t('cancel')
    });
    if (confirmed) {
      try {
        await api.users.update(user.id, { role: newRole });
        fetchUsers();
        addToast(t('roleUpdated'), 'success');
      } catch (err) {
        addToast(t('operationFailed'), 'error');
      }
    }
  };

  const handleResetPassword = async (user) => {
    const message1 = t('confirmResetPasswordMessage').replace('{name}', user.name);
    
    const confirmed1 = await showConfirm({
      title: t('confirmResetPassword'),
      message: message1,
      confirmText: t('resetPassword'),
      cancelText: t('cancel')
    });
    if (confirmed1) {
      try {
        const newPassword = Math.random().toString(36).slice(-8);
        // 对于密码这种重要信息，需要特殊处理，让用户记住后再提示
        const message2 = t('newPasswordMessage') + newPassword + t('newPasswordHint');
        
        const confirmed2 = await showConfirm({
          title: t('newPasswordGenerated'),
          message: message2,
          confirmText: t('iUnderstand'),
          cancelText: t('cancel')
        });
        if (confirmed2) {
          addToast(t('passwordReset'), 'success');
        }
      } catch (err) {
        addToast(t('operationFailed'), 'error');
      }
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.id) {
      addToast(t('cannotDeleteOwnAccount'), 'warning');
      return;
    }
    
    const message = t('confirmDeleteUser').replace('{name}', user.name);
    
    const confirmed = await showConfirm({
      title: t('confirmDelete'),
      message: message,
      confirmText: t('delete'),
      cancelText: t('cancel'),
      confirmColor: '#dc2626'
    });
    if (confirmed) {
      try {
        await api.users.delete(user.id);
        fetchUsers();
        addToast(t('userDeleted'), 'success');
      } catch (err) {
        addToast(t('deleteFailed'), 'error');
      }
    }
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>{t('users')}</h1>
      </div>

      <div style={styles.card}>
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loading}>{t('loading')}</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t('user')}</th>
                  <th style={styles.th}>{t('username')}</th>
                  <th style={styles.th}>{t('email')}</th>
                  <th style={styles.th}>{t('userRole')}</th>
                  <th style={styles.th}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userRow}>
                        <div style={styles.userAvatar}>
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>{user.name}</div>
                      </div>
                    </td>
                    <td style={styles.td}>{user.username}</td>
                    <td style={styles.td}>{user.email || '-'}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: user.role === 'ADMIN' ? '#E0E7FF' : '#F3F4F6',
                        color: user.role === 'ADMIN' ? '#4F46E5' : '#6B7280'
                      }}>
                        {user.role === 'ADMIN' ? t('admin') : t('employee')}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button style={styles.editButton} onClick={() => handleToggleRole(user)}>
                          {t('changeRoleLabel')}
                        </button>
                        <button style={styles.editButton} onClick={() => handleResetPassword(user)}>
                          {t('resetPasswordLabel')}
                        </button>
                        <button style={styles.deleteButton} onClick={() => handleDeleteUser(user)}>
                          {t('delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingsManagement() {
  const { language, t } = useLanguage();
  const { addToast } = useToast();
  const { showConfirm } = useDialog();
  const [meetings, setMeetings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await api.meetings.getAll();
      setMeetings(data);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (meeting) => {
    const message = t('confirmCancelMeetingMessage') + meeting.title + t('confirmCancelMeetingMessageEnd');
    
    const confirmed = await showConfirm({
      title: t('confirmCancelMeeting'),
      message: message,
      confirmText: t('cancel'),
      cancelText: t('keep'),
      confirmColor: '#dc2626'
    });
    if (confirmed) {
      try {
        await api.meetings.cancel(meeting.id);
        fetchMeetings();
        addToast(t('meetingCancelled'), 'success');
      } catch (err) {
        addToast(t('cancelFailed'), 'error');
      }
    }
  };

  const filteredMeetings = meetings.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const getFilterLabel = (f) => {
    switch (f) {
      case 'all': return t('all');
      case 'SCHEDULED': return t('scheduled');
      case 'CANCELLED': return t('cancelled');
      case 'COMPLETED': return t('completed');
      default: return f;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'SCHEDULED': return t('scheduled');
      case 'CANCELLED': return t('cancelled');
      case 'COMPLETED': return t('completed');
      default: return status;
    }
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>{t('bookings')}</h1>
        <div style={styles.filterButtons}>
          {['all', 'SCHEDULED', 'CANCELLED', 'COMPLETED'].map(f => (
            <button
              key={f}
              style={{
                ...styles.filterButton,
                ...(filter === f ? styles.filterButtonActive : {})
              }}
              onClick={() => setFilter(f)}
            >
              {getFilterLabel(f)}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loading}>{t('loading')}</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t('meeting')}</th>
                  <th style={styles.th}>{t('room')}</th>
                  <th style={styles.th}>{t('time')}</th>
                  <th style={styles.th}>{t('bookedBy')}</th>
                  <th style={styles.th}>{t('status')}</th>
                  <th style={styles.th}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeetings.map(meeting => (
                  <tr key={meeting.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.meetingTitle}>{meeting.title}</div>
                      {meeting.description && (
                        <div style={styles.meetingDesc}>{meeting.description}</div>
                      )}
                    </td>
                    <td style={styles.td}>{meeting.room?.name || t('unknown')}</td>
                    <td style={styles.td}>
                      <div>{new Date(meeting.startTime).toLocaleString(language === 'zh' ? 'zh-CN' : 'ru-RU')}</div>
                      <div style={styles.smallText}>{t('to')}{new Date(meeting.endTime).toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'ru-RU')}</div>
                    </td>
                    <td style={styles.td}>{meeting.organizer?.name || t('unknown')}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(meeting.status === 'SCHEDULED' ? { background: '#DBEAFE', color: '#1E40AF' } :
                          meeting.status === 'CANCELLED' ? { background: '#FEE2E2', color: '#991B1B' } :
                          { background: '#D1FAE5', color: '#065F46' })
                      }}>
                        {getStatusLabel(meeting.status)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {meeting.status === 'SCHEDULED' && (
                        <button style={styles.deleteButton} onClick={() => handleCancel(meeting)}>
                          {t('cancel')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function SystemSettings() {
  const { language, t } = useLanguage();
  const { addToast } = useToast();
  const { showConfirm } = useDialog();
  const [settings, setSettings] = useState(null);
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [timeLimits, setTimeLimits] = useState({ minBookingTime: '08:00', maxBookingTime: '22:00' });

  useEffect(() => {
    fetchSettings();
    fetchTimeLimits();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.settings.get();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchTimeLimits = async () => {
    try {
      const data = await api.systemSettings.getTimeLimits();
      if (data) {
        setTimeLimits(data);
      }
    } catch (err) {
      console.error('获取时间限制失败:', err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.settings.update(settings);
      await api.systemSettings.updateAll(timeLimits);
      addToast(t('settingsSaved'), 'success');
    } catch (err) {
      addToast(t('saveFailed'), 'error');
    }
  };

  const handleChangeCode = async () => {
    if (newCode !== confirmCode) {
      addToast(t('codesDoNotMatch'), 'warning');
      return;
    }
    if (!newCode || newCode.length < 4) {
      addToast(t('newCodeTooShort'), 'warning');
      return;
    }
    
    const message1 = t('confirmChangeCodeMessage') + newCode + t('confirmChangeCodeMessageEnd');
    
    const confirmed1 = await showConfirm({
      title: t('confirmChangeCode'),
      message: message1,
      confirmText: t('confirm'),
      cancelText: t('cancel')
    });
    if (confirmed1) {
      // 先让用户确认记住新代码，再关闭表单
      const message2 = t('rememberNewCodeMessage') + newCode + t('rememberNewCodeHint');
      
      const confirmed2 = await showConfirm({
        title: t('rememberNewCode'),
        message: message2,
        confirmText: t('iRemember'),
        cancelText: t('cancel')
      });
      if (confirmed2) {
        addToast(t('codeChanged'), 'success');
        setShowCodeForm(false);
        setNewCode('');
        setConfirmCode('');
      }
    }
  };

  const getSettingLabel = (key) => {
    switch (key) {
      case 'minDuration': return t('minDuration');
      case 'maxDuration': return t('maxDuration');
      case 'maxDaysAhead': return t('maxDaysAhead');
      case 'minBookingAdvance': return t('minBookingAdvance');
      default: return key;
    }
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>{t('settings')}</h1>
      </div>

      <div style={styles.card}>
        <div style={styles.settingsSection}>
          <h3 style={styles.sectionTitle}>{language === 'zh' ? '时间限制' : 'Ограничения по времени'}</h3>
          <div style={styles.settingsGrid}>
            <div style={styles.settingItem}>
              <label style={styles.label}>{t('minBookingTime') || '最早可预订时间'}</label>
              <input
                style={styles.input}
                type="time"
                value={timeLimits.minBookingTime}
                onChange={e => setTimeLimits({...timeLimits, minBookingTime: e.target.value})}
              />
            </div>
            <div style={styles.settingItem}>
              <label style={styles.label}>{t('maxBookingTime') || '最晚可预订时间'}</label>
              <input
                style={styles.input}
                type="time"
                value={timeLimits.maxBookingTime}
                onChange={e => setTimeLimits({...timeLimits, maxBookingTime: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div style={styles.settingsSection}>
          <h3 style={styles.sectionTitle}>{t('bookingRules')}</h3>
          <div style={styles.settingsGrid}>
            <div style={styles.settingItem}>
              <label style={styles.label}>{getSettingLabel('minDuration')}</label>
              <input
                style={styles.input}
                type="number"
                value={settings?.minDurationMinutes || ''}
                onChange={e => setSettings({...settings, minDurationMinutes: parseInt(e.target.value)})}
              />
            </div>
            <div style={styles.settingItem}>
              <label style={styles.label}>{getSettingLabel('maxDuration')}</label>
              <input
                style={styles.input}
                type="number"
                value={settings?.maxDurationMinutes || ''}
                onChange={e => setSettings({...settings, maxDurationMinutes: parseInt(e.target.value)})}
              />
            </div>
            <div style={styles.settingItem}>
              <label style={styles.label}>{getSettingLabel('maxDaysAhead')}</label>
              <input
                style={styles.input}
                type="number"
                value={settings?.maxBookingDaysAhead || ''}
                onChange={e => setSettings({...settings, maxBookingDaysAhead: parseInt(e.target.value)})}
              />
            </div>
            <div style={styles.settingItem}>
              <label style={styles.label}>{getSettingLabel('minBookingAdvance')}</label>
              <input
                style={styles.input}
                type="number"
                value={settings?.minBookingAdvanceMinutes || ''}
                onChange={e => setSettings({...settings, minBookingAdvanceMinutes: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <button style={styles.submitButton} onClick={handleSaveSettings}>
            {t('save')}
          </button>
        </div>

        <div style={styles.settingsSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>{t('internalCodeManagement')}</h3>
            <button style={styles.addButton} onClick={() => setShowCodeForm(!showCodeForm)}>
              {t('changeCode')}
            </button>
          </div>
          <p style={styles.hint}>
            {t('internalCodeHint')}<strong>778899</strong>
          </p>

          {showCodeForm && (
            <div style={styles.codeForm}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>{t('newInternalCode')}</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    placeholder={t('enterNewCodePlaceholder')}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>{t('confirmNewCode')}</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={confirmCode}
                    onChange={e => setConfirmCode(e.target.value)}
                    placeholder={t('confirmCodePlaceholder')}
                  />
                </div>
              </div>
              <div style={styles.formActions}>
                <button style={styles.cancelButton} onClick={() => setShowCodeForm(false)}>
                  {t('cancel')}
                </button>
                <button style={styles.submitButton} onClick={handleChangeCode}>
                  {t('confirmChange')}
                </button>
              </div>
            </div>
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
    background: '#F3F4F6'
  },
  sidebar: {
    width: '260px',
    background: 'linear-gradient(180deg, #1E3A8A 0%, #3B82F6 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    left: 0,
    top: 0
  },
  logo: {
    padding: '24px',
    textAlign: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  logoText: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700
  },
  logoSub: {
    fontSize: '12px',
    opacity: 0.8,
    display: 'block'
  },
  userInfo: {
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '18px'
  },
  userName: {
    fontSize: '14px',
    fontWeight: 500
  },
  userRole: {
    fontSize: '12px',
    opacity: 0.8
  },
  menu: {
    flex: 1,
    padding: '16px 0'
  },
  menuItem: {
    width: '100%',
    padding: '14px 24px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  menuItemActive: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    borderLeft: '3px solid white'
  },
  menuIcon: {
    fontSize: '18px'
  },
  langSwitch: {
    padding: '12px 24px',
    borderTop: '1px solid rgba(255,255,255,0.1)'
  },
  langBtn: {
    width: '100%',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    transition: 'all 0.2s'
  },
  logoutBtn: {
    padding: '16px 24px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.2s'
  },
  main: {
    flex: 1,
    marginLeft: '260px',
    padding: '24px'
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  pageTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#1F2937'
  },
  pageDesc: {
    margin: '4px 0 0 0',
    color: '#6B7280',
    fontSize: '14px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #E5E7EB'
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#1F2937'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '24px'
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderTop: '4px solid #3B82F6'
  },
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    background: '#F3F4F6'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1F2937',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6B7280'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '12px 20px',
    background: '#F9FAFB',
    fontWeight: 600,
    fontSize: '12px',
    color: '#6B7280',
    textTransform: 'uppercase',
    borderBottom: '1px solid #E5E7EB'
  },
  tr: {
    borderBottom: '1px solid #F3F4F6'
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#374151'
  },
  roomName: {
    fontWeight: 500,
    color: '#1F2937'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 500,
    display: 'inline-block'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  addButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '14px'
  },
  editButton: {
    padding: '6px 12px',
    background: '#F3F4F6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  deleteButton: {
    padding: '6px 12px',
    background: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #E5E7EB'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6B7280'
  },
  form: {
    padding: '24px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 500,
    fontSize: '14px',
    color: '#374151'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '8px'
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#F3F4F6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500
  },
  submitButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#E0E7FF',
    color: '#4F46E5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '14px'
  },
  meetingTitle: {
    fontWeight: 500,
    color: '#1F2937'
  },
  meetingDesc: {
    fontSize: '13px',
    color: '#6B7280',
    marginTop: '4px'
  },
  smallText: {
    fontSize: '13px',
    color: '#6B7280'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#6B7280'
  },
  spinner: {
    fontSize: '40px',
    marginBottom: '12px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#6B7280'
  },
  filterButtons: {
    display: 'flex',
    gap: '8px'
  },
  filterButton: {
    padding: '8px 16px',
    background: '#F3F4F6',
    color: '#6B7280',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500
  },
  filterButtonActive: {
    background: '#1E3A8A',
    color: 'white'
  },
  settingsSection: {
    padding: '24px',
    borderBottom: '1px solid #E5E7EB'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#1F2937'
  },
  settingsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px'
  },
  settingItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  hint: {
    margin: '0 0 16px 0',
    color: '#6B7280',
    fontSize: '14px'
  },
  codeForm: {
    padding: '20px',
    background: '#F9FAFB',
    borderRadius: '8px'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px'
  }
};

export default AdminDashboard;
