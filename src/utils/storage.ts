import { MEIOSIS_PHASES } from '../types';
import type { LocalStorageSettings, MeiosisPhaseId } from '../types';

const STORAGE_KEY = 'meiosis-demo-settings';

const DEFAULT_SETTINGS: LocalStorageSettings = {
  playbackSpeed: 1,
  showAnnotations: true,
  lastViewedPhase: MEIOSIS_PHASES[0].id
};

export const saveSettings = (settings: Partial<LocalStorageSettings>): void => {
  try {
    const existingSettings = loadSettings();
    const updatedSettings = { ...existingSettings, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
  }
};

export const loadSettings = (): LocalStorageSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  return DEFAULT_SETTINGS;
};

export const clearSettings = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear settings from localStorage:', error);
  }
};

export const validatePhaseId = (phaseId: string): MeiosisPhaseId => {
  const isValid = MEIOSIS_PHASES.some(p => p.id === phaseId);
  if (isValid) {
    return phaseId as MeiosisPhaseId;
  }
  return MEIOSIS_PHASES[0].id;
};
