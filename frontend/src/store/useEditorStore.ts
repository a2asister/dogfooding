import { create } from 'zustand';
import { PageElement, AnimationConfig, PageStructure, DeviceType } from '../types';

interface EditorState {
  selectedElementId: string | null;
  elements: PageElement[];
  animationConfig: AnimationConfig;
  deviceType: DeviceType;
  scrollProgress: number;
  isPlaying: boolean;
  projectName: string;
  projectId: string | null;
  autoSave: boolean;
  isDirty: boolean;

  setSelectedElementId: (id: string | null) => void;
  addElement: (element: PageElement) => void;
  updateElement: (id: string, updates: Partial<PageElement>) => void;
  removeElement: (id: string) => void;
  setElements: (elements: PageElement[]) => void;

  addAnimationTrigger: (trigger: AnimationConfig['triggers'][0]) => void;
  updateAnimationTrigger: (id: string, updates: Partial<AnimationConfig['triggers'][0]>) => void;
  removeAnimationTrigger: (id: string) => void;
  setAnimationConfig: (config: AnimationConfig) => void;

  setDeviceType: (type: DeviceType) => void;
  setScrollProgress: (progress: number) => void;
  setScrollProgressManually: (progress: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setProjectName: (name: string) => void;
  setProjectId: (id: string | null) => void;
  setAutoSave: (autoSave: boolean) => void;
  setIsDirty: (dirty: boolean) => void;

  getPageStructure: () => PageStructure;
  loadProject: (project: any) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  selectedElementId: null,
  elements: [],
  animationConfig: {
    triggers: [],
    globalSettings: {
      scrub: 1,
      pinSpacing: true,
    },
  },
  deviceType: 'desktop',
  scrollProgress: 0,
  isPlaying: false,
  projectName: '未命名项目',
  projectId: null,
  autoSave: true,
  isDirty: false,

  setSelectedElementId: (id) => set({ selectedElementId: id }),
  addElement: (element) => set((state) => ({ elements: [...state.elements, element], isDirty: true })),
  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    isDirty: true,
  })),
  removeElement: (id) => set((state) => ({
    elements: state.elements.filter((el) => el.id !== id),
    animationConfig: {
      ...state.animationConfig,
      triggers: state.animationConfig.triggers.filter((t) => t.elementId !== id),
    },
    selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    isDirty: true,
  })),
  setElements: (elements) => set({ elements, isDirty: true }),

  addAnimationTrigger: (trigger) => set((state) => ({
    animationConfig: {
      ...state.animationConfig,
      triggers: [...state.animationConfig.triggers, trigger],
    },
    isDirty: true,
  })),
  updateAnimationTrigger: (id, updates) => set((state) => ({
    animationConfig: {
      ...state.animationConfig,
      triggers: state.animationConfig.triggers.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    },
    isDirty: true,
  })),
  removeAnimationTrigger: (id) => set((state) => ({
    animationConfig: {
      ...state.animationConfig,
      triggers: state.animationConfig.triggers.filter((t) => t.id !== id),
    },
    isDirty: true,
  })),
  setAnimationConfig: (config) => set({ animationConfig: config, isDirty: true }),

  setDeviceType: (type) => set({ deviceType: type }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setScrollProgressManually: (progress) => {
    set({ scrollProgress: progress });
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: progress * scrollHeight, behavior: 'smooth' });
  },
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setProjectName: (name) => set({ projectName: name, isDirty: true }),
  setProjectId: (id) => set({ projectId: id }),
  setAutoSave: (autoSave) => set({ autoSave }),
  setIsDirty: (dirty) => set({ isDirty: dirty }),

  getPageStructure: () => {
    const { elements } = get();
    return {
      elements,
      sections: [
        {
          id: 'section-1',
          name: 'Section 1',
          height: 1000,
          elementIds: elements.map((el) => el.id),
        },
      ],
    };
  },

  loadProject: (project) => {
    try {
      const pageStructure = JSON.parse(project.pageStructure);
      const animationConfig = JSON.parse(project.animationConfig);

      set({
        projectId: project.id,
        projectName: project.name,
        elements: pageStructure.elements || [],
        animationConfig,
        isDirty: false,
      });
    } catch (e) {
      console.error('Failed to load project:', e);
    }
  },
}));
