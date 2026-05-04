import http from '../utils/http';

const BASE_URL = '/api/vehicle';

const vehicleService = {
  getHealth: () => {
    return http.get(`${BASE_URL}/health`);
  },

  getVehicles: () => {
    return http.get(`${BASE_URL}/vehicles`);
  },

  getVehicleById: (id) => {
    return http.get(`${BASE_URL}/vehicles/${id}`);
  },

  createVehicle: (data) => {
    return http.post(`${BASE_URL}/vehicles`, data);
  },

  updateVehicle: (id, data) => {
    return http.put(`${BASE_URL}/vehicles/${id}`, data);
  },

  deleteVehicle: (id) => {
    return http.delete(`${BASE_URL}/vehicles/${id}`);
  },

  getReservations: () => {
    return http.get(`${BASE_URL}/reservations`);
  },

  createReservation: (data) => {
    return http.post(`${BASE_URL}/reservations`, data);
  },

  getMaintenances: () => {
    return http.get(`${BASE_URL}/maintenances`);
  },

  createMaintenance: (data) => {
    return http.post(`${BASE_URL}/maintenances`, data);
  },
};

export default vehicleService;
