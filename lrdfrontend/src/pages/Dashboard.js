import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMeetings } from '../hooks/useMeetings';
import { useRooms } from '../hooks/useRooms';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import Calendar from '../components/Calendar';
import MeetingForm from '../components/MeetingForm';
import api from '../services/api';

function Dashboard() {
  const { user } = useAuth();
  const { language, t, td } = useLanguage();
  const { addToast } = useToast();
  const { meetings, fetchMeetings, createMeeting } = useMeetings();
  const { rooms, fetchRooms } = useRooms();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [allMeetings, setAllMeetings] = useState([]);

  const translateBackendError = (errorMessage) => {
    if (!errorMessage) return t('unknownError');

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

  useEffect(() => {
    fetchRooms(true);
  }, []);

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0].id);
    }
  }, [rooms]);

  useEffect(() => {
    const fetchAllMeetings = async () => {
      try {
        const data = await api.meetings.getAll();
        console.log('Dashboard: 获取所有会议数量:', data.length);
        setAllMeetings(data || []);
      } catch (err) {
        console.error('获取所有会议失败:', err);
      }
    };
    fetchAllMeetings();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      fetchMeetings({ roomId: selectedRoom, startDate: start.toISOString(), endDate: end.toISOString() });
    }
  }, [selectedDate, selectedRoom]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleBookClick = () => {
    if (!selectedRoom) {
      addToast(t('pleaseSelectRoomFirst'), 'warning');
      return;
    }
    setShowForm(true);
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'ru-RU', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatShortDate = (date) => {
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'ru-RU', {
      month: 'long',
      day: 'numeric'
    });
  };

  const roomMeetings = meetings.filter(m => m.status === 'SCHEDULED').sort((a, b) => 
    new Date(a.startTime) - new Date(b.startTime)
  );

  const selectedRoomData = rooms.find(r => r.id === selectedRoom);
  
  // 只获取当前选中会议室的会议，用于 Calendar 显示
  const selectedRoomMeetings = allMeetings.filter(m => 
    m.room?.id === selectedRoom && m.status === 'SCHEDULED'
  );

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h3 style={styles.sidebarTitle}>{t('selectRoom')}</h3>
        <div style={styles.roomList}>
          {rooms.map(room => (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              style={{
                padding: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '0.75rem',
                backgroundColor: selectedRoom === room.id ? '#eff6ff' : 'white',
                borderColor: selectedRoom === room.id ? '#2563eb' : '#e5e7eb',
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>
                {td('roomName', room.name)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {td('roomLocation', room.location || '-')} · {room.capacity} {t('people')}
              </div>
              {room.equipment && (
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  📺 {td('roomEquipment', room.equipment)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.calendarSection}>
          <Calendar
            meetings={selectedRoomMeetings}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        <div style={styles.scheduleSection}>
          <div style={styles.scheduleHeader}>
            <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1rem' }}>
              {formatDate(selectedDate)} - {selectedRoomData?.name ? td('roomName', selectedRoomData.name) : t('noRoomSelected')}
            </h3>
          </div>
          <div style={styles.scheduleContent}>
            {roomMeetings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <p>{t('noMeetingsToday')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {roomMeetings.map(meeting => (
                  <div key={meeting.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    borderRadius: '8px',
                    borderLeft: '4px solid #2563eb'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                        {meeting.title}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>
                        {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {t('organizer')}: {meeting.organizer?.name}
                      </div>
                    </div>
                    <div style={{
                      background: '#2563eb',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {t('booked')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={styles.actionBar}>
          <div style={styles.selectedInfo}>
            {t('selected')}: {selectedRoomData?.name ? td('roomName', selectedRoomData.name) : t('selectRoom')}
            {' | '}
            {formatShortDate(selectedDate)}
            {' | '}
            {t('todayMeetingsCount')}: {roomMeetings.length}{t('countSuffix')}
          </div>
          <button
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
            }}
            onClick={handleBookClick}
          >
            + {t('bookRoom')}
          </button>
        </div>
      </div>

      {showForm && selectedRoom && (
        <MeetingForm
          roomId={selectedRoom}
          roomData={selectedRoomData}
          selectedDate={selectedDate}
          onClose={() => {
            setShowForm(false);
            const start = new Date(selectedDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(selectedDate);
            end.setHours(23, 59, 59, 999);
            fetchMeetings({ roomId: selectedRoom, startDate: start.toISOString(), endDate: end.toISOString() });
            api.meetings.getAll().then(allData => {
              setAllMeetings(allData || []);
            });
          }}
          onSubmit={async (data) => {
            const result = await createMeeting(data);
            return result;
          }}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: 'calc(100vh - 73px)',
    background: '#f3f4f6',
  },
  sidebar: {
    width: '300px',
    background: 'white',
    borderRight: '1px solid #e5e7eb',
    padding: '1.5rem',
  },
  sidebarTitle: {
    margin: '0 0 1rem 0',
    color: '#1f2937',
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  roomList: {
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  calendarSection: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  scheduleSection: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  scheduleHeader: {
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '1rem',
  },
  scheduleContent: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  actionBar: {
    background: 'white',
    borderRadius: '8px',
    padding: '1rem 1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedInfo: {
    fontSize: '0.95rem',
    color: '#4b5563',
  },
};

export default Dashboard;
