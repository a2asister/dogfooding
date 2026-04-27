import { create } from 'zustand';
import type { Application, Interview } from '@/types';
import { mockApplications, mockInterviews } from '@/data/mockData';

interface ApplicationState {
  applications: Application[];
  interviews: Interview[];
  loading: boolean;

  fetchApplications: (status?: Application['status']) => Promise<Application[]>;
  fetchInterviews: () => Promise<Interview[]>;
  updateApplicationStatus: (id: string, status: Application['status']) => void;
  updateInterviewStatus: (id: string, status: Interview['status']) => void;
  toggleMarkApplication: (id: string) => void;
  addApplication: (jobId: string, jobData: Partial<Application>) => void;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [...mockApplications],
  interviews: [...mockInterviews],
  loading: false,

  fetchApplications: async (status) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));

    let apps = get().applications;
    if (status) {
      apps = apps.filter((app) => app.status === status);
    }

    set({ loading: false });
    return apps;
  },

  fetchInterviews: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 200));
    set({ loading: false });
    return get().interviews;
  },

  updateApplicationStatus: (id, status) => {
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, status, updatedAt: new Date().toISOString() } : app
      ),
    }));
  },

  updateInterviewStatus: (id, status) => {
    set((state) => ({
      interviews: state.interviews.map((intv) =>
        intv.id === id ? { ...intv, status } : intv
      ),
    }));
  },

  toggleMarkApplication: (id) => {
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, isMarked: !app.isMarked } : app
      ),
    }));
  },

  addApplication: (jobId, jobData) => {
    const newApp: Application = {
      id: `app_${Date.now()}`,
      jobId,
      jobTitle: jobData.jobTitle || '未知职位',
      companyId: jobData.companyId || '',
      companyName: jobData.companyName || '未知公司',
      companyLogo: jobData.companyLogo || '',
      salaryMin: jobData.salaryMin || 0,
      salaryMax: jobData.salaryMax || 0,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMarked: false,
    };

    set((state) => ({
      applications: [newApp, ...state.applications],
    }));
  },
}));
