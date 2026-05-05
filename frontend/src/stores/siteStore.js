import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSiteStore = create(
  persist(
    (set, get) => ({
      currentSite: null,
      sites: [],
      
      setSites: (sites) => {
        set({ sites });
      },
      
      setCurrentSite: (site) => {
        set({ currentSite: site });
      },
      
      clearCurrentSite: () => {
        set({ currentSite: null });
      },
      
      addSite: (site) => {
        const { sites } = get();
        set({ sites: [...sites, site] });
      },
      
      updateSite: (siteId, updates) => {
        const { sites, currentSite } = get();
        const updatedSites = sites.map(s => 
          s.id === siteId ? { ...s, ...updates } : s
        );
        set({
          sites: updatedSites,
          currentSite: currentSite?.id === siteId 
            ? { ...currentSite, ...updates } 
            : currentSite
        });
      },
      
      removeSite: (siteId) => {
        const { sites, currentSite } = get();
        const updatedSites = sites.filter(s => s.id !== siteId);
        set({
          sites: updatedSites,
          currentSite: currentSite?.id === siteId ? null : currentSite
        });
      },
    }),
    {
      name: 'site-storage',
    }
  )
);

export default useSiteStore;
