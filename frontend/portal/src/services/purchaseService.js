import http from '../utils/http';

const BASE_URL = '/api/purchase';

const purchaseService = {
  getHealth: () => {
    return http.get(`${BASE_URL}/health`);
  },

  getPurchases: () => {
    return http.get(`${BASE_URL}/purchases`);
  },

  getPurchaseById: (id) => {
    return http.get(`${BASE_URL}/purchases/${id}`);
  },

  createPurchase: (data) => {
    return http.post(`${BASE_URL}/purchases`, data);
  },

  updatePurchase: (id, data) => {
    return http.put(`${BASE_URL}/purchases/${id}`, data);
  },

  deletePurchase: (id) => {
    return http.delete(`${BASE_URL}/purchases/${id}`);
  },

  getSuppliers: () => {
    return http.get(`${BASE_URL}/suppliers`);
  },

  createSupplier: (data) => {
    return http.post(`${BASE_URL}/suppliers`, data);
  },

  getApprovals: () => {
    return http.get(`${BASE_URL}/approvals`);
  },

  createApproval: (data) => {
    return http.post(`${BASE_URL}/approvals`, data);
  },
};

export default purchaseService;
