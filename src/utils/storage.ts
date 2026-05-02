import { EditorState } from '../types';

const STORAGE_KEY = 'lightweight-image-editor-state';
const LAYERS_PREFIX = 'lightweight-image-editor-layers-';
const MASKS_PREFIX = 'lightweight-image-editor-masks-';

export const saveEditorState = (state: EditorState): void => {
  try {
    const stateToSave = {
      ...state,
      lastSaved: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Failed to save editor state:', error);
  }
};

export const loadEditorState = (): EditorState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load editor state:', error);
  }
  return null;
};

export const saveLayerCanvas = (layerId: string, canvas: HTMLCanvasElement): void => {
  try {
    const dataUrl = canvas.toDataURL('image/png');
    localStorage.setItem(`${LAYERS_PREFIX}${layerId}`, dataUrl);
  } catch (error) {
    console.error('Failed to save layer canvas:', error);
  }
};

export const loadLayerCanvas = (layerId: string): string | null => {
  try {
    return localStorage.getItem(`${LAYERS_PREFIX}${layerId}`);
  } catch (error) {
    console.error('Failed to load layer canvas:', error);
    return null;
  }
};

export const saveMaskCanvas = (layerId: string, canvas: HTMLCanvasElement): void => {
  try {
    const dataUrl = canvas.toDataURL('image/png');
    localStorage.setItem(`${MASKS_PREFIX}${layerId}`, dataUrl);
  } catch (error) {
    console.error('Failed to save mask canvas:', error);
  }
};

export const loadMaskCanvas = (layerId: string): string | null => {
  try {
    return localStorage.getItem(`${MASKS_PREFIX}${layerId}`);
  } catch (error) {
    console.error('Failed to load mask canvas:', error);
    return null;
  }
};

export const removeLayerStorage = (layerId: string): void => {
  localStorage.removeItem(`${LAYERS_PREFIX}${layerId}`);
  localStorage.removeItem(`${MASKS_PREFIX}${layerId}`);
};

export const clearAllStorage = (): void => {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key === STORAGE_KEY || key.startsWith(LAYERS_PREFIX) || key.startsWith(MASKS_PREFIX))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
};