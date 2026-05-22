import { useState, useEffect } from 'react';
import { useRooms } from '../hooks/useRooms';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../hooks/useLanguage';
import api from '../services/api';

function Admin() {
  const { rooms, fetchRooms, createRoom, updateRoom, deleteRoom } = useRooms();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    equipment: '',
    isActive: true,
  });

  useEffect(() => {
    fetchRooms(false);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.settings.get();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.settings.update(settings);
      addToast(t('settingsSaved'), 'success');
    } catch (err) {
      addToast(t('saveFailed'), 'error');
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...roomFormData,
      capacity: parseInt(roomFormData.capacity),
    };

    let result;
    if (editingRoom) {
      result = await updateRoom(editingRoom.id, data);
    } else {
      result = await createRoom(data);
    }

    if (result.success) {
      setShowRoomForm(false);
      setEditingRoom(null);
      setRoomFormData({
        name: '',
        location: '',
        capacity: '',
        equipment: '',
        isActive: true,
      });
      fetchRooms(false);
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomFormData(room);
    setShowRoomForm(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm(t('deleteRoomConfirm'))) {
      await deleteRoom(roomId);
      fetchRooms(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>{t('rooms')}</h2>
          <button onClick={() => setShowRoomForm(true)} style={styles.addBtn}>
            + {t('addRoom')}
          </button>
        </div>
        <div style={styles.roomList}>
          {rooms.map(room => (
            <div key={room.id} style={styles.roomCard}>
              <div style={styles.roomInfo}>
                <div style={styles.roomName}>{room.name}</div>
                <div style={styles.roomMeta}>
                  <span>{t('location')}：{room.location}</span>
                  <span>{t('capacity')}：{room.capacity}{t('people')}</span>
                  <span>{t('equipment')}：{room.equipment || t('none')}</span>
                  <span style={room.isActive ? styles.active : styles.inactive}>
                    {room.isActive ? t('active') : t('inactive')}
                  </span>
                </div>
              </div>
              <div style={styles.roomActions}>
                <button onClick={() => handleEditRoom(room)} style={styles.editBtn}>
                  编辑
                </button>
                <button onClick={() => handleDeleteRoom(room.id)} style={styles.deleteBtn}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>预订设置</h2>
        <div style={styles.settingsForm}>
          <div style={styles.formGroup}>
            <label style={styles.label}>最短预订时长（分钟）</label>
            <input
              type="number"
              value={settings?.minDurationMinutes || ''}
              onChange={(e) => setSettings({ ...settings, minDurationMinutes: parseInt(e.target.value) })}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>最长预订时长（分钟）</label>
            <input
              type="number"
              value={settings?.maxDurationMinutes || ''}
              onChange={(e) => setSettings({ ...settings, maxDurationMinutes: parseInt(e.target.value) })}
              style={styles.input}
            />
          </div>
          <button onClick={handleSaveSettings} style={styles.saveBtn}>
            保存设置
          </button>
        </div>
      </div>

      {showRoomForm && (
        <div style={styles.overlay} onClick={() => setShowRoomForm(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>{editingRoom ? '编辑会议室' : '添加会议室'}</h3>
              <button onClick={() => setShowRoomForm(false)} style={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleRoomSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>会议室名称 *</label>
                <input
                  type="text"
                  value={roomFormData.name}
                  onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>位置</label>
                <input
                  type="text"
                  value={roomFormData.location}
                  onChange={(e) => setRoomFormData({ ...roomFormData, location: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>容量（人） *</label>
                <input
                  type="number"
                  value={roomFormData.capacity}
                  onChange={(e) => setRoomFormData({ ...roomFormData, capacity: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>设备</label>
                <input
                  type="text"
                  value={roomFormData.equipment}
                  onChange={(e) => setRoomFormData({ ...roomFormData, equipment: e.target.value })}
                  style={styles.input}
                  placeholder="投影仪、白板等"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={roomFormData.isActive}
                    onChange={(e) => setRoomFormData({ ...roomFormData, isActive: e.target.checked })}
                  />
                  启用
                </label>
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowRoomForm(false)} style={styles.cancelBtn}>
                  取消
                </button>
                <button type="submit" style={styles.submitBtn}>
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    background: '#f3f4f6',
    minHeight: 'calc(100vh - 73px)',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    margin: 0,
    color: '#1f2937',
  },
  section: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    margin: 0,
    color: '#1f2937',
    fontSize: '1.25rem',
  },
  addBtn: {
    padding: '0.5rem 1rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  roomList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  roomCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  roomMeta: {
    display: 'flex',
    gap: '1.5rem',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  active: {
    color: '#10b981',
    fontWeight: '500',
  },
  inactive: {
    color: '#dc2626',
    fontWeight: '500',
  },
  roomActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    padding: '0.5rem 1rem',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '0.5rem 1rem',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  settingsForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '400px',
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
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  saveBtn: {
    padding: '0.75rem 1.5rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '450px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  form: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1rem',
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    border: '1px solid #d1d5db',
    background: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '0.75rem 1.5rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Admin;