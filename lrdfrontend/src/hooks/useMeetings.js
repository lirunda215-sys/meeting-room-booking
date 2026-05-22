import { useState, useEffect } from 'react';
import api from '../services/api';

export function useMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMeetings = async (options = {}) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (options.roomId && options.startDate && options.endDate) {
        data = await api.meetings.getByRoomAndDateRange(
          options.roomId,
          options.startDate,
          options.endDate
        );
      } else if (options.startDate && options.endDate) {
        data = await api.meetings.getByDateRange(options.startDate, options.endDate);
      } else if (options.roomId) {
        data = await api.meetings.getByRoom(options.roomId);
      } else if (options.organizerId) {
        data = await api.meetings.getByOrganizer(options.organizerId);
      } else if (options.my) {
        data = await api.meetings.getMy();
      } else {
        data = await api.meetings.getAll();
      }
      setMeetings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createMeeting = async (meeting) => {
    try {
      const newMeeting = await api.meetings.create(meeting);
      setMeetings(prev => [...prev, newMeeting]);
      return { success: true, meeting: newMeeting };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateMeeting = async (id, meeting) => {
    try {
      const updatedMeeting = await api.meetings.update(id, meeting);
      setMeetings(prev => prev.map(m => m.id === id ? updatedMeeting : m));
      return { success: true, data: updatedMeeting };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const cancelMeeting = async (id) => {
    try {
      const cancelledMeeting = await api.meetings.cancel(id);
      setMeetings(prev => prev.map(m => 
        m.id === id ? { ...m, status: 'CANCELLED' } : m
      ));
      return { success: true, data: cancelledMeeting };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    meetings,
    loading,
    error,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    cancelMeeting,
  };
}
