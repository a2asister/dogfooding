import { create } from 'zustand';
import type { Job, Company, Favorite, BrowseHistory, FilterOptions, SortOptions, PaginatedResponse } from '@/types';
import { mockJobs, mockCompanies } from '@/data/mockData';

interface JobState {
  jobs: Job[];
  companies: Company[];
  favorites: Favorite[];
  browseHistory: BrowseHistory[];
  loading: boolean;
  currentPage: number;
  hasMore: boolean;

  fetchJobs: (page?: number, filters?: FilterOptions, sort?: SortOptions) => Promise<PaginatedResponse<Job>>;
  fetchJobById: (id: string) => Promise<Job | null>;
  fetchCompanyById: (id: string) => Promise<Company | null>;
  fetchRecommendedJobs: () => Promise<Job[]>;
  fetchSimilarJobs: (jobId: string) => Promise<Job[]>;
  toggleFavorite: (type: 'job' | 'company', targetId: string) => Promise<boolean>;
  fetchFavorites: () => Promise<Favorite[]>;
  addBrowseHistory: (type: 'job' | 'company', targetId: string) => void;
  fetchBrowseHistory: () => Promise<BrowseHistory[]>;
  applyJob: (jobId: string) => Promise<boolean>;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [...mockJobs],
  companies: [...mockCompanies],
  favorites: [],
  browseHistory: [],
  loading: false,
  currentPage: 1,
  hasMore: true,

  fetchJobs: async (page = 1, filters?, sort?) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredJobs = [...get().jobs];

    if (filters?.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(keyword) ||
          job.companyName.toLowerCase().includes(keyword) ||
          job.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    }

    if (filters?.city) {
      filteredJobs = filteredJobs.filter((job) => job.location.includes(filters.city!));
    }

    if (sort) {
      switch (sort.field) {
        case 'newest':
          filteredJobs.sort((a, b) => 
            sort.order === 'desc' 
              ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
              : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
          break;
        case 'salary_desc':
        case 'salary_asc':
          filteredJobs.sort((a, b) => {
            const avgA = (a.salaryMin + a.salaryMax) / 2;
            const avgB = (b.salaryMin + b.salaryMax) / 2;
            return sort.field === 'salary_desc' ? avgB - avgA : avgA - avgB;
          });
          break;
      }
    }

    const pageSize = 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    set({
      jobs: page === 1 ? filteredJobs : get().jobs,
      currentPage: page,
      hasMore: endIndex < filteredJobs.length,
      loading: false,
    });

    return {
      data: paginatedJobs,
      total: filteredJobs.length,
      page,
      pageSize,
      hasMore: endIndex < filteredJobs.length,
    };
  },

  fetchJobById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const job = get().jobs.find((j) => j.id === id);
    return job || null;
  },

  fetchCompanyById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const company = get().companies.find((c) => c.id === id);
    return company || null;
  },

  fetchRecommendedJobs: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const jobs = get().jobs
      .filter((j) => !j.isApplied)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 10);
    return jobs;
  },

  fetchSimilarJobs: async (jobId) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const currentJob = get().jobs.find((j) => j.id === jobId);
    if (!currentJob) return [];

    return get().jobs
      .filter(
        (j) =>
          j.id !== jobId &&
          (j.companyId === currentJob.companyId ||
            j.tags.some((tag) => currentJob.tags.includes(tag)))
      )
      .slice(0, 5);
  },

  toggleFavorite: async (type, targetId) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    set((state) => {
      const existingIndex = state.favorites.findIndex(
        (f) => f.type === type && f.targetId === targetId
      );

      if (existingIndex >= 0) {
        const newFavorites = state.favorites.filter(
          (_, i) => i !== existingIndex
        );
        const updatedJobs = state.jobs.map((job) =>
          type === 'job' && job.id === targetId
            ? { ...job, isFavorite: false }
            : job
        );
        const updatedCompanies = state.companies.map((company) =>
          type === 'company' && company.id === targetId
            ? { ...company, isFollowed: false }
            : company
        );
        return { 
          favorites: newFavorites,
          jobs: updatedJobs,
          companies: updatedCompanies,
        };
      } else {
        const target =
          type === 'job'
            ? state.jobs.find((j) => j.id === targetId)
            : state.companies.find((c) => c.id === targetId);

        if (!target) return state;

        const newFavorite: Favorite = {
          id: `fav_${Date.now()}`,
          type,
          targetId,
          targetData: target as Job | Company,
          createdAt: new Date().toISOString(),
        };

        const updatedJobs = state.jobs.map((job) =>
          type === 'job' && job.id === targetId
            ? { ...job, isFavorite: true }
            : job
        );
        const updatedCompanies = state.companies.map((company) =>
          type === 'company' && company.id === targetId
            ? { ...company, isFollowed: true }
            : company
        );

        return {
          favorites: [...state.favorites, newFavorite],
          jobs: updatedJobs,
          companies: updatedCompanies,
        };
      }
    });

    return true;
  },

  fetchFavorites: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return get().favorites;
  },

  addBrowseHistory: (type, targetId) => {
    set((state) => {
      const existingIndex = state.browseHistory.findIndex(
        (h) => h.type === type && h.targetId === targetId
      );

      const target =
        type === 'job'
          ? state.jobs.find((j) => j.id === targetId)
          : state.companies.find((c) => c.id === targetId);

      if (!target) return state;

      const newHistory: BrowseHistory = {
        id: `hist_${Date.now()}`,
        type,
        targetId,
        targetData: target as Job | Company,
        viewedAt: new Date().toISOString(),
      };

      let newHistoryList = [...state.browseHistory];
      if (existingIndex >= 0) {
        newHistoryList = newHistoryList.filter((_, i) => i !== existingIndex);
      }
      newHistoryList.unshift(newHistory);

      if (newHistoryList.length > 100) {
        newHistoryList = newHistoryList.slice(0, 100);
      }

      return { browseHistory: newHistoryList };
    });
  },

  fetchBrowseHistory: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return get().browseHistory;
  },

  applyJob: async (jobId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    set((state) => {
      const updatedJobs = state.jobs.map((job) =>
        job.id === jobId ? { ...job, isApplied: true } : job
      );
      return { jobs: updatedJobs };
    });

    return true;
  },
}));
