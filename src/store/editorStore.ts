import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  CanvasElement, 
  CanvasState, 
  ElementType, 
  ElementStyle, 
  DEFAULT_STYLE, 
  ELEMENT_DEFAULTS 
} from '../types';

const STORAGE_KEY = 'prd-editor-state';

interface EditorState {
  elements: CanvasElement[];
  selectedElementIds: string[];
  canvas: CanvasState;
  isPreviewMode: boolean;
  
  addElement: (type: ElementType, x: number, y: number) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  updateElementStyle: (id: string, styleUpdates: Partial<ElementStyle>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string, multiSelect?: boolean) => void;
  selectElements: (ids: string[]) => void;
  clearSelection: () => void;
  
  setCanvasState: (updates: Partial<CanvasState>) => void;
  resetCanvas: () => void;
  
  setPreviewMode: (isPreview: boolean) => void;
  togglePreviewMode: () => void;
  
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  clearStorage: () => void;
}

const initialCanvasState: CanvasState = {
  scale: 1,
  panX: 0,
  panY: 0,
  canvasWidth: 1920,
  canvasHeight: 1080
};

export const useEditorStore = create<EditorState>((set, get) => ({
  elements: [],
  selectedElementIds: [],
  canvas: initialCanvasState,
  isPreviewMode: false,

  addElement: (type: ElementType, x: number, y: number) => {
    const defaults = ELEMENT_DEFAULTS[type];
    const newElement: CanvasElement = {
      id: uuidv4(),
      type,
      content: defaults.defaultContent,
      style: {
        ...DEFAULT_STYLE,
        ...defaults,
        x,
        y
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    set((state) => ({
      elements: [...state.elements, newElement],
      selectedElementIds: [newElement.id]
    }));
    
    get().saveToLocalStorage();
  },

  updateElement: (id: string, updates: Partial<CanvasElement>) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id 
          ? { ...el, ...updates, updatedAt: Date.now() } 
          : el
      )
    }));
    get().saveToLocalStorage();
  },

  updateElementStyle: (id: string, styleUpdates: Partial<ElementStyle>) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? {
              ...el,
              style: { ...el.style, ...styleUpdates },
              updatedAt: Date.now()
            }
          : el
      )
    }));
    get().saveToLocalStorage();
  },

  deleteElement: (id: string) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementIds: state.selectedElementIds.filter((selId) => selId !== id)
    }));
    get().saveToLocalStorage();
  },

  selectElement: (id: string, multiSelect = false) => {
    set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedElementIds.includes(id);
        return {
          selectedElementIds: isSelected
            ? state.selectedElementIds.filter((selId) => selId !== id)
            : [...state.selectedElementIds, id]
        };
      }
      return { selectedElementIds: [id] };
    });
  },

  selectElements: (ids: string[]) => {
    set({ selectedElementIds: ids });
  },

  clearSelection: () => {
    set({ selectedElementIds: [] });
  },

  setCanvasState: (updates: Partial<CanvasState>) => {
    set((state) => ({
      canvas: { ...state.canvas, ...updates }
    }));
  },

  resetCanvas: () => {
    set({ canvas: initialCanvasState });
  },

  setPreviewMode: (isPreview: boolean) => {
    set({ isPreviewMode: isPreview });
  },

  togglePreviewMode: () => {
    set((state) => ({ isPreviewMode: !state.isPreviewMode }));
  },

  saveToLocalStorage: () => {
    try {
      const state = get();
      const data = {
        elements: state.elements,
        canvas: state.canvas
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },

  loadFromLocalStorage: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        set({
          elements: data.elements || [],
          canvas: data.canvas || initialCanvasState,
          selectedElementIds: []
        });
        return true;
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return false;
  },

  clearStorage: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      elements: [],
      selectedElementIds: [],
      canvas: initialCanvasState
    });
  }
}));
