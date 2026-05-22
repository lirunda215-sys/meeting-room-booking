import { useState, useEffect } from 'react';
import api from '../services/api';

export function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async (activeOnly = false) => {
    setLoading(true);
    try {
      const data = activeOnly ? await api.rooms.getActive() : await api.rooms.getAll();
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (room) => {
    try {
      const newRoom = await api.rooms.create(room);
      setRooms(prev => [...prev, newRoom]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateRoom = async (id, room) => {
    try {
      const updatedRoom = await api.rooms.update(id, room);
      setRooms(prev => prev.map(r => r.id === id ? updatedRoom : r));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteRoom = async (id) => {
    try {
      await api.rooms.delete(id);
      setRooms(prev => prev.filter(r => r.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    rooms,
    loading,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
  };
}