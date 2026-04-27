export const MIN_YEAR = 1995;
export const MAX_YEAR = 2026;
export const TOTAL_YEARS = MAX_YEAR - MIN_YEAR + 1;

export const MILLISECONDS_PER_YEAR = 2000;
export const TOTAL_DURATION = TOTAL_YEARS * MILLISECONDS_PER_YEAR;

export const yearToPosition = (year: number, containerWidth: number): number => {
  const ratio = (year - MIN_YEAR) / TOTAL_YEARS;
  return ratio * containerWidth;
};

export const positionToYear = (position: number, containerWidth: number): number => {
  const ratio = position / containerWidth;
  return Math.round(MIN_YEAR + ratio * TOTAL_YEARS);
};

export const formatDate = (dateString: string): string => {
  return dateString;
};

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

export const easeInCubic = (t: number): number => {
  return t * t * t;
};

export const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, wait);
  };
};

export const getYearsBetween = (startYear: string, endYear?: string): number[] => {
  const start = parseInt(startYear);
  const end = endYear ? parseInt(endYear) : MAX_YEAR;
  const years: number[] = [];
  
  for (let year = start; year <= end; year++) {
    years.push(year);
  }
  
  return years;
};
