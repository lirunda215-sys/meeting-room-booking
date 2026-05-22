import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';

function Calendar({ meetings, onDateSelect, selectedDate }) {
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getMeetingsForDate = (date) => {
    if (!date || !meetings) return [];
    return meetings.filter(m => {
      const meetingDate = new Date(m.startTime);
      return meetingDate.toDateString() === date.toDateString() && m.status === 'SCHEDULED';
    });
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.toDateString() === d2.toDateString();
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

  const formatMonthYear = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    if (language === 'zh') {
      return `${year}年${month}月`;
    } else {
      const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
      return `${monthNames[date.getMonth()]} ${year}`;
    }
  };

  const weekdays = language === 'zh' 
    ? ['日', '一', '二', '三', '四', '五', '六']
    : ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={prevMonth} style={styles.navBtn}>←</button>
        <h3 style={styles.title}>
          {formatMonthYear(currentDate)}
        </h3>
        <button onClick={nextMonth} style={styles.navBtn}>→</button>
      </div>
      <div style={styles.weekdays}>
        {weekdays.map((d, index) => (
          <div key={index} style={styles.weekday}>{d}</div>
        ))}
      </div>
      <div style={styles.grid}>
        {days.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const meetingCount = getMeetingsForDate(day).length;

          return (
            <div
              key={index}
              onClick={() => day && onDateSelect(day)}
              style={{
                minHeight: '80px',
                border: isSelected ? '2px solid #2563eb' : '1px solid #e5e7eb',
                borderRadius: '4px',
                padding: '0.5rem',
                cursor: day ? 'pointer' : 'default',
                backgroundColor: isSelected ? '#eff6ff' : (day ? 'white' : '#f9fafb'),
                position: 'relative',
              }}
            >
              {day && (
                <>
                  <div
                    style={{
                      fontWeight: isTodayDate ? 'bold' : 'normal',
                      color: isTodayDate ? '#2563eb' : '#374151',
                      fontSize: '0.95rem',
                    }}
                  >
                    {day.getDate()}
                  </div>
                  {meetingCount > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#2563eb',
                        color: 'white',
                        fontSize: '0.7rem',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {meetingCount}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: 'white',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    margin: 0,
    color: '#1f2937',
    fontSize: '1.2rem',
  },
  navBtn: {
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    background: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  weekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    marginBottom: '0.5rem',
  },
  weekday: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#6b7280',
    padding: '0.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
  },
};

export default Calendar;
