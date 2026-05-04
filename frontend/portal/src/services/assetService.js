import http from '../utils/http';

const BASE_URL = '/api/asset';

const assetService = {
  getHealth: () => {
    return http.get(`${BASE_URL}/health`);
  },

  getAssets: () => {
    return http.get(`${BASE_URL}/assets`);
  },

  getAssetById: (id) => {
    return http.get(`${BASE_URL}/assets/${id}`);
  },

  createAsset: (data) => {
    return http.post(`${BASE_URL}/assets`, data);
  },

  updateAsset: (id, data) => {
    return http.put(`${BASE_URL}/assets/${id}`, data);
  },

  deleteAsset: (id) => {
    return http.delete(`${BASE_URL}/assets/${id}`);
  },

  getInventories: () => {
    return http.get(`${BASE_URL}/inventories`);
  },

  createInventory: (data) => {
    return http.post(`${BASE_URL}/inventories`, data);
  },

  getMaintenances: () => {
    return http.get(`${BASE_URL}/maintenances`);
  },

  createMaintenance: (data) => {
    return http.post(`${BASE_URL}/maintenances`, data);
  },
};

export default assetService;
