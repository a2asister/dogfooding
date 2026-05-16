import { useState, useCallback } from 'react';

export const SIDEBAR_WIDTH = 250;
export const ACTIVITY_BAR_WIDTH = 48;
export const STATUS_BAR_HEIGHT = 22;
export const TOP_BAR_HEIGHT = 35;

export function useLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState('explorer');

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const selectPanel = useCallback((id: string) => {
    setActivePanel(id);
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  }, [sidebarCollapsed]);

  return {
    sidebarCollapsed,
    activePanel,
    sidebarWidth: SIDEBAR_WIDTH,
    activityBarWidth: ACTIVITY_BAR_WIDTH,
    toggleSidebar,
    selectPanel,
  };
}
