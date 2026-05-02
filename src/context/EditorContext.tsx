import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EditorState, Layer, Selection, Tool, CanvasConfig, BlendMode } from '../types';
import { loadEditorState, saveEditorState, removeLayerStorage } from '../utils/storage';

const BLEND_MODES: BlendMode[] = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light',
];

const initialCanvasConfig: CanvasConfig = {
  width: 800,
  height: 600,
  resolution: 72,
  backgroundColor: '#ffffff',
};

const initialTool: Tool = {
  type: 'select',
  size: 10,
  hardness: 100,
  color: '#000000',
  opacity: 100,
};

const getInitialState = (): EditorState => {
  const saved = loadEditorState();
  if (saved) {
    return saved;
  }
  
  const defaultLayer: Layer = {
    id: uuidv4(),
    name: '背景图层',
    visible: true,
    locked: false,
    opacity: 100,
    blendMode: 'normal',
    hasMask: false,
    maskEnabled: true,
    x: 0,
    y: 0,
    width: initialCanvasConfig.width,
    height: initialCanvasConfig.height,
  };
  
  return {
    canvasConfig: initialCanvasConfig,
    layers: [defaultLayer],
    activeLayerId: defaultLayer.id,
    selection: null,
    currentTool: initialTool,
    zoom: 100,
    panX: 0,
    panY: 0,
    lastSaved: null,
  };
};

type EditorAction =
  | { type: 'SET_CANVAS_CONFIG'; payload: Partial<CanvasConfig> }
  | { type: 'ADD_LAYER'; payload?: Partial<Layer> & { importDataUrl?: string } }
  | { type: 'DUPLICATE_LAYER'; payload: string }
  | { type: 'DELETE_LAYER'; payload: string }
  | { type: 'UPDATE_LAYER'; payload: { id: string; updates: Partial<Layer> } }
  | { type: 'SET_ACTIVE_LAYER'; payload: string | null }
  | { type: 'MOVE_LAYER_UP'; payload: string }
  | { type: 'MOVE_LAYER_DOWN'; payload: string }
  | { type: 'TOGGLE_LAYER_VISIBILITY'; payload: string }
  | { type: 'TOGGLE_LAYER_LOCK'; payload: string }
  | { type: 'ADD_MASK'; payload: string }
  | { type: 'REMOVE_MASK'; payload: string }
  | { type: 'TOGGLE_MASK'; payload: string }
  | { type: 'SET_SELECTION'; payload: Selection | null }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'INVERT_SELECTION' }
  | { type: 'SET_TOOL'; payload: Partial<Tool> }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'RESET_STATE' }
  | { type: 'SAVE_STATE' }
  | { type: 'LOAD_STATE' };

const pendingImportsRef = { current: new Map<string, string>() };

export const addPendingImport = (layerId: string, dataUrl: string) => {
  pendingImportsRef.current.set(layerId, dataUrl);
};

export const getAndClearPendingImport = (layerId: string): string | undefined => {
  const dataUrl = pendingImportsRef.current.get(layerId);
  if (dataUrl) {
    pendingImportsRef.current.delete(layerId);
  }
  return dataUrl;
};

const editorReducer = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case 'SET_CANVAS_CONFIG':
      return { ...state, canvasConfig: { ...state.canvasConfig, ...action.payload } };

    case 'ADD_LAYER': {
      const newLayer: Layer = {
        id: uuidv4(),
        name: `图层 ${state.layers.length + 1}`,
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: 'normal',
        hasMask: false,
        maskEnabled: true,
        x: 0,
        y: 0,
        width: state.canvasConfig.width,
        height: state.canvasConfig.height,
        ...action.payload,
      };
      
      if (action.payload?.importDataUrl) {
        addPendingImport(newLayer.id, action.payload.importDataUrl);
      }
      
      return {
        ...state,
        layers: [newLayer, ...state.layers],
        activeLayerId: newLayer.id,
      };
    }

    case 'DUPLICATE_LAYER': {
      const layerToDuplicate = state.layers.find((l) => l.id === action.payload);
      if (!layerToDuplicate) return state;
      const duplicatedLayer: Layer = {
        ...layerToDuplicate,
        id: uuidv4(),
        name: `${layerToDuplicate.name} 副本`,
      };
      const index = state.layers.findIndex((l) => l.id === action.payload);
      const newLayers = [...state.layers];
      newLayers.splice(index, 0, duplicatedLayer);
      return {
        ...state,
        layers: newLayers,
        activeLayerId: duplicatedLayer.id,
      };
    }

    case 'DELETE_LAYER': {
      if (state.layers.length <= 1) return state;
      const index = state.layers.findIndex((l) => l.id === action.payload);
      if (index === -1) return state;
      removeLayerStorage(action.payload);
      const newLayers = state.layers.filter((l) => l.id !== action.payload);
      return {
        ...state,
        layers: newLayers,
        activeLayerId: state.activeLayerId === action.payload ? newLayers[0]?.id || null : state.activeLayerId,
      };
    }

    case 'UPDATE_LAYER':
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.payload.id ? { ...l, ...action.payload.updates } : l
        ),
      };

    case 'SET_ACTIVE_LAYER':
      return { ...state, activeLayerId: action.payload };

    case 'MOVE_LAYER_UP': {
      const index = state.layers.findIndex((l) => l.id === action.payload);
      if (index <= 0) return state;
      const newLayers = [...state.layers];
      [newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
      return { ...state, layers: newLayers };
    }

    case 'MOVE_LAYER_DOWN': {
      const index = state.layers.findIndex((l) => l.id === action.payload);
      if (index === -1 || index >= state.layers.length - 1) return state;
      const newLayers = [...state.layers];
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      return { ...state, layers: newLayers };
    }

    case 'TOGGLE_LAYER_VISIBILITY':
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.payload ? { ...l, visible: !l.visible } : l
        ),
      };

    case 'TOGGLE_LAYER_LOCK':
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.payload ? { ...l, locked: !l.locked } : l
        ),
      };

    case 'ADD_MASK':
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.payload ? { ...l, hasMask: true, maskEnabled: true } : l
        ),
      };

    case 'REMOVE_MASK':
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.payload ? { ...l, hasMask: false, maskEnabled: true } : l
        ),
      };

    case 'TOGGLE_MASK':
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.payload ? { ...l, maskEnabled: !l.maskEnabled } : l
        ),
      };

    case 'SET_SELECTION':
      return { ...state, selection: action.payload };

    case 'CLEAR_SELECTION':
      return { ...state, selection: null };

    case 'INVERT_SELECTION':
      if (!state.selection) return state;
      return {
        ...state,
        selection: {
          ...state.selection,
          type: state.selection.type,
        },
      };

    case 'SET_TOOL':
      return { ...state, currentTool: { ...state.currentTool, ...action.payload } };

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(10, Math.min(500, action.payload)) };

    case 'SET_PAN':
      return { ...state, panX: action.payload.x, panY: action.payload.y };

    case 'RESET_STATE':
      const defaultLayer: Layer = {
        id: uuidv4(),
        name: '背景图层',
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: 'normal',
        hasMask: false,
        maskEnabled: true,
        x: 0,
        y: 0,
        width: initialCanvasConfig.width,
        height: initialCanvasConfig.height,
      };
      pendingImportsRef.current.clear();
      return {
        canvasConfig: initialCanvasConfig,
        layers: [defaultLayer],
        activeLayerId: defaultLayer.id,
        selection: null,
        currentTool: initialTool,
        zoom: 100,
        panX: 0,
        panY: 0,
        lastSaved: null,
      };

    case 'SAVE_STATE':
      saveEditorState(state);
      return { ...state, lastSaved: Date.now() };

    case 'LOAD_STATE':
      const loaded = loadEditorState();
      return loaded || state;

    default:
      return state;
  }
};

interface EditorContextType {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  getActiveLayer: () => Layer | undefined;
  blendModes: BlendMode[];
  resetEditor: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, getInitialState());

  const getActiveLayer = useCallback(() => {
    return state.layers.find((l) => l.id === state.activeLayerId);
  }, [state.layers, state.activeLayerId]);

  const resetEditor = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const saveToStorage = useCallback(() => {
    dispatch({ type: 'SAVE_STATE' });
  }, []);

  const loadFromStorage = useCallback(() => {
    dispatch({ type: 'LOAD_STATE' });
  }, []);

  return (
    <EditorContext.Provider
      value={{
        state,
        dispatch,
        getActiveLayer,
        blendModes: BLEND_MODES,
        resetEditor,
        saveToStorage,
        loadFromStorage,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
