import axios from 'axios';
import type { SimulationRecord, ExperimentRecord } from '@/types';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const api = {
  async getSimulations(): Promise<SimulationRecord[]> {
    const response = await apiClient.get<ApiResponse<SimulationRecord[]>>('/simulations');
    if (!response.data.success) {
      throw new Error(response.data.error ?? 'Failed to load simulations');
    }
    return response.data.data;
  },

  async getSimulation(id: number): Promise<SimulationRecord> {
    const response = await apiClient.get<ApiResponse<SimulationRecord>>(`/simulations/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error ?? 'Failed to load simulation');
    }
    return response.data.data;
  },

  async createSimulation(name: string, type: string, config: string): Promise<number> {
    const response = await apiClient.post<ApiResponse<SimulationRecord>>('/simulations', {
      name,
      type,
      config,
    });
    if (!response.data.success) {
      throw new Error(response.data.error ?? 'Failed to create simulation');
    }
    return response.data.data.id;
  },

  async updateSimulation(id: number, name: string, config: string): Promise<void> {
    const response = await apiClient.put<ApiResponse<SimulationRecord>>(`/simulations/${id}`, {
      name,
      config,
    });
    if (!response.data.success) {
      throw new Error(response.data.error ?? 'Failed to update simulation');
    }
  },

  async deleteSimulation(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(`/simulations/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error ?? 'Failed to delete simulation');
    }
  },

  async getExperiments(simulationId: number): Promise<ExperimentRecord[]> {
    const response = await apiClient.get<ApiResponse<ExperimentRecord[]>>(
      `/simulations/${simulationId}/experiments`
    );
    if (!response.data.success) {
      throw new Error(response.data.error ?? 'Failed to load experiments');
    }
    return response.data.data;
  },

  async createExperiment(
    simulationId: number,
    name: string,
    parameters: string,
    result: string
  ): Promise<number> {
    const response = await apiClient.post<ApiResponse<ExperimentRecord>>(
      `/simulations/${simulationId}/experiments`,
      {
        name,
        parameters,
        result,
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.error ?? 'Failed to create experiment');
    }
    return response.data.data.id;
  },
};
