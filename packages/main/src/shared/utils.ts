import { MicroApp, AppRoute, AppVersion } from './types';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateShort = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const validateAppName = (name: string): boolean => {
  const regex = /^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]$|^[a-zA-Z]$/;
  return regex.test(name);
};

export const validateSemanticVersion = (version: string): boolean => {
  const regex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
  return regex.test(version);
};

export const sortRoutesByOrder = (routes: AppRoute[]): AppRoute[] => {
  return [...routes].sort((a, b) => a.order - b.order);
};

export const sortVersionsByVersion = (versions: AppVersion[]): AppVersion[] => {
  return [...versions].sort((a, b) => {
    const partsA = a.version.split('.').map(Number);
    const partsB = b.version.split('.').map(Number);
    
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const partA = partsA[i] || 0;
      const partB = partsB[i] || 0;
      if (partA !== partB) {
        return partB - partA;
      }
    }
    return 0;
  });
};

export const filterAppsByStatus = (
  apps: MicroApp[],
  status?: MicroApp['status']
): MicroApp[] => {
  if (!status) return apps;
  return apps.filter((app) => app.status === status);
};

export const filterAppsByCategory = (
  apps: MicroApp[],
  category?: string
): MicroApp[] => {
  if (!category) return apps;
  return apps.filter((app) => app.category === category);
};

export const searchApps = (
  apps: MicroApp[],
  keyword: string
): MicroApp[] => {
  if (!keyword.trim()) return apps;
  const lowerKeyword = keyword.toLowerCase();
  return apps.filter(
    (app) =>
      app.name.toLowerCase().includes(lowerKeyword) ||
      app.displayName.toLowerCase().includes(lowerKeyword) ||
      app.description.toLowerCase().includes(lowerKeyword)
  );
};

export const getDefaultVersion = (versions: AppVersion[]): AppVersion | undefined => {
  return versions.find((v) => v.isDefault) || sortVersionsByVersion(versions)[0];
};
