import http from '../utils/http';

const BASE_URL = '/api/finance';

const financeService = {
  getHealth: () => {
    return http.get(`${BASE_URL}/health`);
  },

  getBudgets: () => {
    return http.get(`${BASE_URL}/budgets`);
  },

  getBudgetById: (id) => {
    return http.get(`${BASE_URL}/budgets/${id}`);
  },

  createBudget: (data) => {
    return http.post(`${BASE_URL}/budgets`, data);
  },

  updateBudget: (id, data) => {
    return http.put(`${BASE_URL}/budgets/${id}`, data);
  },

  deleteBudget: (id) => {
    return http.delete(`${BASE_URL}/budgets/${id}`);
  },

  getExpenses: () => {
    return http.get(`${BASE_URL}/expenses`);
  },

  createExpense: (data) => {
    return http.post(`${BASE_URL}/expenses`, data);
  },

  getIncomes: () => {
    return http.get(`${BASE_URL}/incomes`);
  },

  createIncome: (data) => {
    return http.post(`${BASE_URL}/incomes`, data);
  },
};

export default financeService;
