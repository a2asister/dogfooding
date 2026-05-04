import http from '../utils/http';

const BASE_URL = '/api/reimbursement';

const reimbursementService = {
  getHealth: () => {
    return http.get(`${BASE_URL}/health`);
  },

  getReimbursements: () => {
    return http.get(`${BASE_URL}/reimbursements`);
  },

  getReimbursementById: (id) => {
    return http.get(`${BASE_URL}/reimbursements/${id}`);
  },

  createReimbursement: (data) => {
    return http.post(`${BASE_URL}/reimbursements`, data);
  },

  updateReimbursement: (id, data) => {
    return http.put(`${BASE_URL}/reimbursements/${id}`, data);
  },

  deleteReimbursement: (id) => {
    return http.delete(`${BASE_URL}/reimbursements/${id}`);
  },

  getExpenseItems: () => {
    return http.get(`${BASE_URL}/expense-items`);
  },

  createExpenseItem: (data) => {
    return http.post(`${BASE_URL}/expense-items`, data);
  },

  getApprovals: () => {
    return http.get(`${BASE_URL}/approvals`);
  },

  createApproval: (data) => {
    return http.post(`${BASE_URL}/approvals`, data);
  },
};

export default reimbursementService;
