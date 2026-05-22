const API_BASE_URL = 'http://localhost:8080/api';

const getToken = () => localStorage.getItem('token');

const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();
    
    const headers = {
      ...options.headers,
    };
    
    if (!options.isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Sending request with Authorization header');
    } else {
      console.warn('No token found in localStorage!');
    }
    
    console.log('Request to:', url, 'Method:', options.method || 'GET');
    
    const response = await fetch(url, {
      headers,
      ...options,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Request failed:', errorData);
      const error = new Error(errorData.error || `HTTP error! status: ${response.status}`);
      error.error = errorData.error;
      throw error;
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  },

  auth: {
    login: (credentials) => api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    register: (credentials) => api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    getUser: (id) => api.request(`/auth/user/${id}`),
  },

  users: {
    getAll: () => api.request('/users'),
    getById: (id) => api.request(`/users/${id}`),
    create: (user) => api.request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),
    update: (id, user) => api.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    }),
    delete: (id) => api.request(`/users/${id}`, { method: 'DELETE' }),
  },

  rooms: {
    getAll: () => api.request('/rooms'),
    getActive: () => api.request('/rooms/active'),
    getById: (id) => api.request(`/rooms/${id}`),
    create: (room) => api.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(room),
    }),
    update: (id, room) => api.request(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(room),
    }),
    delete: (id) => api.request(`/rooms/${id}`, { method: 'DELETE' }),
  },

  meetings: {
    getAll: () => api.request('/meetings'),
    getMy: () => api.request('/meetings/my'),
    getByRoom: (roomId) => api.request(`/meetings/room/${roomId}`),
    getByOrganizer: (organizerId) => api.request(`/meetings/organizer/${organizerId}`),
    getByDateRange: (startDate, endDate) => api.request(
      `/meetings/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    ),
    getByRoomAndDateRange: (roomId, startDate, endDate) => api.request(
      `/meetings/room/${roomId}/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    ),
    getById: (id) => api.request(`/meetings/${id}`),
    getWithDetailsById: (id) => api.request(`/meetings/${id}/details`),
    create: (meeting) => api.request('/meetings', {
        method: 'POST',
        body: JSON.stringify(meeting),
    }),
    update: (id, meeting) => api.request(`/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meeting),
    }),
    cancel: (id) => api.request(`/meetings/${id}/cancel`, { method: 'PUT' }),
    delete: (id) => api.request(`/meetings/${id}`, { method: 'DELETE' }),
  },

  settings: {
    get: () => api.request('/settings'),
    update: (settings) => api.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  },

  catering: {
    getAll: () => api.request('/catering'),
    getActive: () => api.request('/catering/active'),
    getById: (id) => api.request(`/catering/${id}`),
    create: (catering) => api.request('/catering', {
      method: 'POST',
      body: JSON.stringify(catering),
    }),
    update: (id, catering) => api.request(`/catering/${id}`, {
      method: 'PUT',
      body: JSON.stringify(catering),
    }),
    delete: (id) => api.request(`/catering/${id}`, { method: 'DELETE' }),
  },

  meetingCaterings: {
    getByMeeting: (meetingId) => api.request(`/meeting-caterings/meeting/${meetingId}`),
    add: (meetingId, cateringId) => api.request('/meeting-caterings', {
      method: 'POST',
      body: JSON.stringify({ meetingId, cateringId }),
    }),
    addWithQuantity: (meetingId, cateringId, quantity) => api.request('/meeting-caterings', {
      method: 'POST',
      body: JSON.stringify({ meetingId, cateringId, quantity }),
    }),
    delete: (id) => api.request(`/meeting-caterings/${id}`, { method: 'DELETE' }),
  },
  systemSettings: {
    getAll: () => api.request('/system-settings'),
    getTimeLimits: () => api.request('/system-settings/time-limits'),
    updateAll: (updates) => api.request('/system-settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    update: (key, value, description) => api.request(`/system-settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, description }),
    }),
  },

  meetingFiles: {
    getByMeeting: (meetingId) => api.request(`/meeting-files/meeting/${meetingId}`),
    upload: (meetingId, file) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.request(`/meeting-files/upload/${meetingId}`, {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
    },
    delete: (id) => api.request(`/meeting-files/${id}`, { method: 'DELETE' }),
  },
};

export default api;
