import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

function MeetingForm({ roomId, roomData, selectedDate, onClose, onSubmit }) {
  // 为了保持兼容性，如果传入 roomId 和 roomData，也支持
  const room = roomData; // roomData 是完整的会议室对象
  const { user } = useAuth();
  const { language, t, td } = useLanguage();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    attendeeIds: []
  });
  const [users, setUsers] = useState([]);
  const [cateringServices, setCateringServices] = useState([]);
  const [selectedCaterings, setSelectedCaterings] = useState({}); // { cateringId: quantity }
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 参会人员选择器状态
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // 时间限制
  const [timeLimits, setTimeLimits] = useState({ minBookingTime: '08:00', maxBookingTime: '22:00' });

  useEffect(() => {
    fetchUsers();
    fetchCateringServices();
    fetchTimeLimits();
    if (selectedDate) {
      const defaultStart = new Date(selectedDate);
      defaultStart.setHours(9, 0, 0, 0);
      const defaultEnd = new Date(selectedDate);
      defaultEnd.setHours(10, 0, 0, 0);
      
      setFormData(prev => ({
        ...prev,
        startTime: formatDateTimeForInput(defaultStart),
        endTime: formatDateTimeForInput(defaultEnd),
      }));
    }
  }, [selectedDate]);
  
  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateTimeForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const fetchUsers = async () => {
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchCateringServices = async () => {
    try {
      const data = await api.catering.getActive();
      setCateringServices(data);
    } catch (err) {
      console.error('Error fetching catering:', err);
    }
  };

  const fetchTimeLimits = async () => {
    try {
      const data = await api.systemSettings.getTimeLimits();
      if (data) {
        setTimeLimits({
          minBookingTime: data.minBookingTime || '08:00',
          maxBookingTime: data.maxBookingTime || '22:00'
        });
      }
    } catch (err) {
      console.error('获取时间限制失败，使用默认值:', err);
    }
  };

  const translateBackendError = (errorMessage) => {
    if (!errorMessage) return t('unknownError');
    
    console.log('翻译错误信息:', errorMessage);

    // 处理 null ID 错误
    if (errorMessage.includes('The given id must not be null') || 
        errorMessage.includes('id must not be null')) {
      return t('invalidRoomId') || '会议室ID无效，请重新选择';
    }

    if (errorMessage.includes('会议时长太短')) {
      const match = errorMessage.match(/(\d+)/);
      return t('meetingDurationTooShort').replace('{minutes}', match ? match[1] : '30');
    }
    if (errorMessage.includes('会议时长太长')) {
      const match = errorMessage.match(/(\d+)/);
      return t('meetingDurationTooLong').replace('{minutes}', match ? match[1] : '240');
    }
    if (errorMessage.includes('不能预订过去')) {
      return t('cannotBookPastTime');
    }
    if (errorMessage.includes('至少需要提前')) {
      const match = errorMessage.match(/(\d+)/);
      return t('mustBookInAdvance').replace('{minutes}', match ? match[1] : '30');
    }
    if (errorMessage.includes('最多只能提前')) {
      const match = errorMessage.match(/(\d+)/);
      return t('maxDaysBookingExceeded').replace('{days}', match ? match[1] : '7');
    }
    if (errorMessage.includes('已被其他预订占用') || errorMessage.includes('时间段已被')) {
      return t('timeSlotAlreadyBooked');
    }
    if (errorMessage.includes('not found') || errorMessage.includes('不存在')) {
      return t('roomNotFound') || '会议室不存在';
    }
    if (errorMessage.includes('不能早于') || errorMessage.includes('开始时间不能早于')) {
      const match = errorMessage.match(/(\d{2}:\d{2})/);
      return t('meetingStartTooEarly').replace('{time}', match ? match[1] : '');
    }
    if (errorMessage.includes('不能晚于') || errorMessage.includes('结束时间不能晚于')) {
      const match = errorMessage.match(/(\d{2}:\d{2})/);
      return t('meetingEndTooLate').replace('{time}', match ? match[1] : '');
    }
    return errorMessage;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title || formData.title.trim() === '') {
      setError(t('meetingTitleRequired'));
      setLoading(false);
      return;
    }

    if (!getTimePart(formData.startTime)) {
      setError(t('startTimeRequired'));
      setLoading(false);
      return;
    }

    if (!getTimePart(formData.endTime)) {
      setError(t('endTimeRequired'));
      setLoading(false);
      return;
    }

    if (getTimePart(formData.startTime) && getTimePart(formData.endTime)) {
      const startDateTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${getTimePart(formData.startTime)}`);
      const endDateTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${getTimePart(formData.endTime)}`);

      if (endDateTime <= startDateTime) {
        setError(t('endTimeBeforeStartTime'));
        setLoading(false);
        return;
      }
    }

    try {
      console.log('🟢 开始提交会议...');
      console.log('   selectedCaterings:', selectedCaterings);
      console.log('   uploadedFiles.length:', uploadedFiles.length);
      uploadedFiles.forEach((file, idx) => {
        console.log(`   文件 ${idx + 1}:`, file.name, '是否有真实文件:', !!file.file);
      });

      // 使用传入的 roomId 参数，或者从 roomData 中获取
      const currentRoomId = roomId || room?.id;
      console.log('当前使用的 roomId:', currentRoomId);
      
      const result = await onSubmit({
        ...formData,
        roomId: currentRoomId,
      });

      console.log('🟡 onSubmit 返回:', result);

      if (result.success && result.meeting) {
        const meetingId = result.meeting.id;
        console.log('📋 会议创建成功, 完整会议数据:', result.meeting);
        console.log('📋 会议ID:', meetingId);

        const selectedCateringIds = Object.keys(selectedCaterings);
        let cateringErrors = [];
        
        if (selectedCateringIds.length > 0) {
          console.log('🍵 开始添加茶水服务, 数量:', selectedCateringIds.length);
          
          for (const cateringId of selectedCateringIds) {
            try {
              const quantity = selectedCaterings[cateringId];
              console.log('   正在添加茶水服务:', cateringId, '数量:', quantity);
              const cateringResult = await api.meetingCaterings.addWithQuantity(meetingId, cateringId, quantity);
              console.log('✅ 茶水服务添加成功:', cateringId, '返回结果:', cateringResult);
            } catch (err) {
              const errMsg = err.error || err.message;
              console.error('❌ 茶水服务添加失败:', errMsg);
              cateringErrors.push(errMsg);
            }
          }
        } else {
          console.log('🍵 没有选择茶水服务');
        }

        let filesUploaded = 0;
        let fileErrors = [];
        console.log('📁 准备上传', uploadedFiles.length, '个文件');
        
        for (const file of uploadedFiles) {
          if (file.file) {
            try {
              console.log('📁 开始上传文件:', file.name, '大小:', file.file.size);
              const uploadResult = await api.meetingFiles.upload(meetingId, file.file);
              console.log('✅ 文件上传成功:', file.name, '响应:', uploadResult);
              filesUploaded++;
            } catch (err) {
              const errMsg = err.error || err.message;
              console.error('❌ 文件上传失败:', errMsg);
              fileErrors.push(file.name + ': ' + errMsg);
            }
          }
        }

        const allErrors = [...cateringErrors, ...fileErrors];
        if (allErrors.length > 0) {
          setError((t('partialSaveError') || '部分数据保存失败') + ': ' + allErrors.join('; '));
          setLoading(false);
          return; // 不关闭表单，让用户看到错误
        }

        if (filesUploaded > 0) {
          console.log('🎉 共上传了', filesUploaded, '个文件');
          addToast(t('filesUploadedSuccess').replace('{count}', filesUploaded), 'success');
        }
      }

      // 所有数据保存完成后，关闭表单
      if (result.success) {
        console.log('🟢 所有数据保存成功，关闭表单');
        onClose();
      } else {
        setError(translateBackendError(result.error) || t('createMeetingFailed'));
      }
    } catch (err) {
      setError(translateBackendError(err.message) || t('submitFailed') + ': ' + (err.message || t('unknownError')));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttendeeChange = (userId) => {
    setFormData(prev => ({
      ...prev,
      attendeeIds: prev.attendeeIds.includes(userId)
        ? prev.attendeeIds.filter(id => id !== userId)
        : [...prev.attendeeIds, userId],
    }));
  };

  const handleCateringToggle = (cateringId) => {
    setSelectedCaterings(prev => {
      if (prev[cateringId]) {
        const newSelected = { ...prev };
        delete newSelected[cateringId];
        return newSelected;
      } else {
        return { ...prev, [cateringId]: 1 };
      }
    });
  };

  const handleQuantityChange = (cateringId, quantity) => {
    setSelectedCaterings(prev => ({
      ...prev,
      [cateringId]: Math.max(1, parseInt(quantity) || 1)
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateTimeOptions = () => {
    const min = timeLimits.minBookingTime || '08:00';
    const max = timeLimits.maxBookingTime || '22:00';
    const minHour = parseInt(min.split(':')[0]);
    const minMin = parseInt(min.split(':')[1]);
    const maxHour = parseInt(max.split(':')[0]);
    const maxMin = parseInt(max.split(':')[1]);
    
    const options = [];
    for (let hour = minHour; hour <= maxHour; hour++) {
      const startMin = hour === minHour ? Math.ceil(minMin / 30) * 30 : 0;
      const endMin = hour === maxHour ? maxMin : 60;
      for (let min = startMin; min < endMin; min += 30) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        options.push(timeStr);
      }
    }
    return options;
  };

  const getTimePart = (dateTimeStr) => {
    return dateTimeStr ? dateTimeStr.split('T')[1] : '';
  };

  const updateDateTime = (type, timeStr) => {
    if (!selectedDate) return;
    const date = new Date(selectedDate);
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    setFormData(prev => ({
      ...prev,
      [type]: formatDateTimeForInput(date),
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const formatDateHeader = () => {
    if (!selectedDate) return '';
    
    if (language === 'zh') {
      return selectedDate.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
      });
    } else {
      const weekdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
      const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 
                    'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
      
      return `${weekdays[selectedDate.getDay()]}, ${selectedDate.getDate()} ${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>
            {t('bookRoom')} - {formatDateHeader()}
          </h3>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {/* 显示当前正在预定的会议室 */}
          <div style={styles.roomInfo}>
            {t('bookingForRoom').replace('{roomName}', room?.name ? td('roomName', room.name) : '')}
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('meetingTitle')} *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={styles.input}
              placeholder={t('enterMeetingTitle')}
              required
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>{t('startTime')} *</label>
              <select
                value={getTimePart(formData.startTime)}
                onChange={(e) => updateDateTime('startTime', e.target.value)}
                style={styles.input}
                required
              >
                <option value="">{t('selectStartTime')}</option>
                {generateTimeOptions().map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>{t('endTime')} *</label>
              <select
                value={getTimePart(formData.endTime)}
                onChange={(e) => updateDateTime('endTime', e.target.value)}
                style={styles.input}
                required
              >
                <option value="">{t('selectEndTime')}</option>
                {generateTimeOptions().map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t('meetingDescription')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ ...styles.input, minHeight: '60px' }}
              placeholder={t('enterMeetingDescription')}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t('teaServiceFree')}</label>
            <div style={styles.cateringList}>
              {cateringServices.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{t('noCatering')}</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', flexDirection: 'column' }}>
                  {cateringServices.map(catering => (
                    <div key={catering.id} style={styles.cateringItem}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={!!selectedCaterings[catering.id]}
                          onChange={() => handleCateringToggle(catering.id)}
                        />
                        <span style={{ fontWeight: 500 }}>{td('cateringName', catering.name)}</span>
                        {catering.description && (
                          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            - {catering.description}
                          </span>
                        )}
                      </label>
                      {selectedCaterings[catering.id] && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem' }}>数量:</span>
                          <input
                            type="number"
                            min="1"
                            value={selectedCaterings[catering.id]}
                            onChange={(e) => handleQuantityChange(catering.id, e.target.value)}
                            style={{
                              width: '60px',
                              padding: '0.25rem 0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t('files')}</label>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload" style={styles.fileUploadLabel}>
              + {t('selectFiles')}
            </label>
            {uploadedFiles.length > 0 && (
              <div style={styles.fileList}>
                {uploadedFiles.map((file, index) => (
                  <div key={index} style={styles.fileItem}>
                    <span>{file.name} ({formatFileSize(file.size)})</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      style={styles.removeFileBtn}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('attendees')}</label>
            <div ref={dropdownRef} style={styles.attendeeDropdownContainer}>
              <div 
                style={styles.attendeeSelector}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {formData.attendeeIds.length === 0 ? (
                  <span style={styles.attendeePlaceholder}>
                    {language === 'zh' ? '请选择参会人员' : 'Select attendees'}
                  </span>
                ) : (
                  <div style={styles.selectedAttendeesContainer}>
                    {formData.attendeeIds.slice(0, 3).map(attendeeId => {
                      const attendee = users.find(u => u.id === attendeeId);
                      return attendee ? (
                        <span key={attendeeId} style={styles.attendeeTag}>
                          {attendee.name}
                        </span>
                      ) : null;
                    })}
                    {formData.attendeeIds.length > 3 && (
                      <span style={styles.attendeeTagMore}>
                        +{formData.attendeeIds.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <span style={styles.dropdownArrow}>
                  {isDropdownOpen ? '▲' : '▼'}
                </span>
              </div>
              
              {isDropdownOpen && (
                <div style={styles.attendeeDropdown}>
                  {users.map(user => (
                    <div 
                      key={user.id} 
                      style={styles.attendeeItem}
                      onClick={(e) => {
                        e.stopPropagation();
                        const isSelected = formData.attendeeIds.includes(user.id);
                        setFormData(prev => ({
                          ...prev,
                          attendeeIds: isSelected
                            ? prev.attendeeIds.filter(id => id !== user.id)
                            : [...prev.attendeeIds, user.id]
                        }));
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.attendeeIds.includes(user.id)}
                        onChange={() => {}}
                        style={styles.attendeeCheckbox}
                      />
                      <div style={styles.attendeeInfo}>
                        <div style={styles.attendeeName}>{user.name}</div>
                        <div style={styles.attendeeEmail}>{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>{t('cancel')}</button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? t('submitting') : t('confirmBooking')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
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
    maxWidth: '550px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  roomInfo: {
    padding: '1rem',
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    borderRadius: '6px',
    border: '1px solid #bfdbfe',
    color: '#1e40af',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    margin: 0,
    color: '#1f2937',
    fontSize: '1.1rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6b7280',
  },
  form: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  label: {
    fontWeight: '500',
    color: '#374151',
    fontSize: '0.9rem',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  multiSelect: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    background: 'white',
    minHeight: '120px',
  },
  selectedCount: {
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  attendeeDropdownContainer: {
    position: 'relative',
    width: '100%',
  },
  attendeeSelector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    minHeight: '48px',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: '#2563eb',
    },
  },
  attendeePlaceholder: {
    color: '#9ca3af',
    fontSize: '0.95rem',
  },
  selectedAttendeesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    flex: 1,
  },
  attendeeTag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  attendeeTagMore: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginLeft: '0.5rem',
  },
  attendeeDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '0.5rem',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 100,
  },
  attendeeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    '&:hover': {
      backgroundColor: '#f9fafb',
    },
  },
  attendeeCheckbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#2563eb',
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontWeight: '500',
    color: '#1f2937',
    fontSize: '0.95rem',
  },
  attendeeEmail: {
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  cateringList: {
    padding: '0.5rem 0',
  },
  cateringItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  cateringChip: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#374151',
    transition: 'all 0.2s',
  },
  cateringChipSelected: {
    background: '#2563eb',
    color: 'white',
    borderColor: '#2563eb',
  },
  fileUploadLabel: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#374151',
    width: 'fit-content',
  },
  fileList: {
    marginTop: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem',
    background: '#f9fafb',
    borderRadius: '4px',
    fontSize: '0.875rem',
  },
  removeFileBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    color: '#dc2626',
    padding: '0 0.25rem',
  },
  userList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: '#f3f4f6',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    fontSize: '0.875rem',
  },
  actions: {
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

export default MeetingForm;
