import http from '../utils/http';

const BASE_URL = '/api/meeting';

const meetingService = {
  getHealth: () => {
    return http.get(`${BASE_URL}/health`);
  },

  getRooms: () => {
    return http.get(`${BASE_URL}/rooms`);
  },

  getRoomById: (id) => {
    return http.get(`${BASE_URL}/rooms/${id}`);
  },

  createRoom: (data) => {
    return http.post(`${BASE_URL}/rooms`, data);
  },

  updateRoom: (id, data) => {
    return http.put(`${BASE_URL}/rooms/${id}`, data);
  },

  deleteRoom: (id) => {
    return http.delete(`${BASE_URL}/rooms/${id}`);
  },

  getBookings: () => {
    return http.get(`${BASE_URL}/bookings`);
  },

  createBooking: (data) => {
    return http.post(`${BASE_URL}/bookings`, data);
  },

  getEquipments: () => {
    return http.get(`${BASE_URL}/equipments`);
  },

  createEquipment: (data) => {
    return http.post(`${BASE_URL}/equipments`, data);
  },
};

export default meetingService;
