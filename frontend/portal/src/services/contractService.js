import http from '../utils/http';

const BASE_URL = '/api/contract';

const contractService = {
  getHealth: () => {
    return http.get(`${BASE_URL}/health`);
  },

  getContracts: () => {
    return http.get(`${BASE_URL}/contracts`);
  },

  getContractById: (id) => {
    return http.get(`${BASE_URL}/contracts/${id}`);
  },

  createContract: (data) => {
    return http.post(`${BASE_URL}/contracts`, data);
  },

  updateContract: (id, data) => {
    return http.put(`${BASE_URL}/contracts/${id}`, data);
  },

  deleteContract: (id) => {
    return http.delete(`${BASE_URL}/contracts/${id}`);
  },

  getVendors: () => {
    return http.get(`${BASE_URL}/vendors`);
  },

  createVendor: (data) => {
    return http.post(`${BASE_URL}/vendors`, data);
  },

  getPayments: () => {
    return http.get(`${BASE_URL}/payments`);
  },

  createPayment: (data) => {
    return http.post(`${BASE_URL}/payments`, data);
  },
};

export default contractService;
