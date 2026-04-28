import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  CanvasComponent,
  ComponentTemplate,
  EditorState,
  DeviceType,
  LayoutMode,
  ComponentStyle,
  ComponentProps,
  ComponentType,
} from '../types';
import { deviceConfigs } from '../data/componentTemplates';

type EditorAction =
  | { type: 'ADD_COMPONENT'; payload: { template: ComponentTemplate; position?: { x: number; y: number }; parentId?: string } }
  | { type: 'SELECT_COMPONENT'; payload: { componentId: string | null } }
  | { type: 'UPDATE_COMPONENT_STYLE'; payload: { componentId: string; style: Partial<ComponentStyle> } }
  | { type: 'UPDATE_COMPONENT_PROPS'; payload: { componentId: string; props: Partial<ComponentProps> } }
  | { type: 'DELETE_COMPONENT'; payload: { componentId: string } }
  | { type: 'COPY_COMPONENT'; payload: { componentId: string } }
  | { type: 'PASTE_COMPONENT' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_CANVAS' }
  | { type: 'CHANGE_DEVICE'; payload: { deviceType: DeviceType } }
  | { type: 'CHANGE_LAYOUT_MODE'; payload: { layoutMode: LayoutMode } }
  | { type: 'CHANGE_ZOOM'; payload: { zoom: number } }
  | { type: 'MOVE_COMPONENT'; payload: { componentId: string; position: { x: number; y: number } } }
  | { type: 'BRING_TO_FRONT'; payload: { componentId: string } }
  | { type: 'SEND_TO_BACK'; payload: { componentId: string } }
  | { type: 'TOGGLE_LOCK'; payload: { componentId: string } }
  | { type: 'TOGGLE_VISIBILITY'; payload: { componentId: string } }
  | { type: 'TOGGLE_PREVIEW_MODE' };

const initialState: EditorState = {
  canvasComponents: [],
  selectedComponentId: null,
  clipboardComponents: [],
  history: [[]],
  historyIndex: 0,
  currentDevice: DeviceType.PC,
  layoutMode: LayoutMode.FREE,
  zoom: 100,
  isPreviewMode: false,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'ADD_COMPONENT': {
      const { template, position, parentId } = action.payload;
      const newComponent: CanvasComponent = {
        id: uuidv4(),
        type: template.type,
        name: `${template.name}_${Date.now()}`,
        style: {
          ...template.defaultStyle,
          ...(position && state.layoutMode === LayoutMode.FREE
            ? { position: 'absolute', left: position.x, top: position.y }
            : {}),
        },
        props: { ...template.defaultProps },
        locked: false,
        visible: true,
        parentId: parentId,
        children: [],
      };

      let newComponents: CanvasComponent[];
      
      if (parentId) {
        const addToParent = (components: CanvasComponent[]): CanvasComponent[] => {
          return components.map(comp => {
            if (comp.id === parentId) {
              return {
                ...comp,
                children: [...(comp.children || []), newComponent],
              };
            }
            if (comp.children && comp.children.length > 0) {
              return {
                ...comp,
                children: addToParent(comp.children),
              };
            }
            return comp;
          });
        };
        newComponents = addToParent(state.canvasComponents);
      } else {
        newComponents = [...state.canvasComponents, newComponent];
      }
      
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), newComponents];

      return {
        ...state,
        canvasComponents: newComponents,
        selectedComponentId: newComponent.id,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'SELECT_COMPONENT': {
      return {
        ...state,
        selectedComponentId: action.payload.componentId,
      };
    }

    case 'UPDATE_COMPONENT_STYLE': {
      const { componentId, style } = action.payload;
      const newComponents = state.canvasComponents.map((comp) =>
        comp.id === componentId ? { ...comp, style: { ...comp.style, ...style } } : comp
      );
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), newComponents];

      return {
        ...state,
        canvasComponents: newComponents,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'UPDATE_COMPONENT_PROPS': {
      const { componentId, props } = action.payload;
      const newComponents = state.canvasComponents.map((comp) =>
        comp.id === componentId ? { ...comp, props: { ...comp.props, ...props } } : comp
      );
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), newComponents];

      return {
        ...state,
        canvasComponents: newComponents,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'DELETE_COMPONENT': {
      const { componentId } = action.payload;
      const newComponents = state.canvasComponents.filter((comp) => comp.id !== componentId);
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), newComponents];
      const selectedId =
        state.selectedComponentId === componentId ? null : state.selectedComponentId;

      return {
        ...state,
        canvasComponents: newComponents,
        selectedComponentId: selectedId,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'COPY_COMPONENT': {
      const { componentId } = action.payload;
      const componentToCopy = state.canvasComponents.find((comp) => comp.id === componentId);
      if (!componentToCopy) return state;

      return {
        ...state,
        clipboardComponents: [componentToCopy],
      };
    }

    case 'PASTE_COMPONENT': {
      if (state.clipboardComponents.length === 0) return state;

      const newComponents = state.clipboardComponents.map((comp) => ({
        ...comp,
        id: uuidv4(),
        name: `${comp.name}_copy_${Date.now()}`,
        style: {
          ...comp.style,
          ...(state.layoutMode === LayoutMode.FREE && comp.style.position === 'absolute'
            ? { left: (comp.style.left as number) + 20, top: (comp.style.top as number) + 20 }
            : {}),
        },
      }));

      const allComponents = [...state.canvasComponents, ...newComponents];
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), allComponents];

      return {
        ...state,
        canvasComponents: allComponents,
        selectedComponentId: newComponents[0].id,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        ...state,
        canvasComponents: state.history[newIndex],
        historyIndex: newIndex,
        selectedComponentId: null,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        ...state,
        canvasComponents: state.history[newIndex],
        historyIndex: newIndex,
        selectedComponentId: null,
      };
    }

    case 'CLEAR_CANVAS': {
      const newComponents: CanvasComponent[] = [];
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), newComponents];

      return {
        ...state,
        canvasComponents: newComponents,
        selectedComponentId: null,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'CHANGE_DEVICE': {
      const oldDeviceType = state.currentDevice;
      const newDeviceType = action.payload.deviceType;
      
      const oldDeviceConfig = deviceConfigs.find((d) => d.type === oldDeviceType);
      const newDeviceConfig = deviceConfigs.find((d) => d.type === newDeviceType);
      
      if (!oldDeviceConfig || !newDeviceConfig || oldDeviceType === newDeviceType) {
        return {
          ...state,
          currentDevice: newDeviceType,
        };
      }
      
      const widthRatio = newDeviceConfig.width / oldDeviceConfig.width;
      const heightRatio = newDeviceConfig.height / oldDeviceConfig.height;
      
      const adjustComponent = (component: CanvasComponent, isTopLevel: boolean = true): CanvasComponent => {
        const newStyle = { ...component.style };
        
        if (isTopLevel && state.layoutMode === LayoutMode.FREE) {
          if (typeof newStyle.left === 'number') {
            newStyle.left = Math.round(newStyle.left * widthRatio);
          }
          if (typeof newStyle.top === 'number') {
            newStyle.top = Math.round(newStyle.top * heightRatio);
          }
        }
        
        if (typeof newStyle.width === 'number') {
          const newWidth = Math.round(newStyle.width * widthRatio);
          const minWidth = component.type === ComponentType.IMAGE ? 50 : 80;
          newStyle.width = Math.max(newWidth, minWidth);
        }
        
        if (typeof newStyle.height === 'number') {
          const newHeight = Math.round(newStyle.height * heightRatio);
          const minHeight = component.type === ComponentType.IMAGE ? 40 : 32;
          newStyle.height = Math.max(newHeight, minHeight);
        }
        
        if (isTopLevel && state.layoutMode === LayoutMode.FREE) {
          const compWidth = typeof newStyle.width === 'number' ? newStyle.width : 100;
          const compHeight = typeof newStyle.height === 'number' ? newStyle.height : 100;
          
          if (typeof newStyle.left === 'number') {
            if (newStyle.left < 0) newStyle.left = 0;
            if (newStyle.left + compWidth > newDeviceConfig.width) {
              newStyle.left = newDeviceConfig.width - compWidth;
              if (newStyle.left < 0) newStyle.left = 0;
            }
          }
          
          if (typeof newStyle.top === 'number') {
            if (newStyle.top < 0) newStyle.top = 0;
            if (newStyle.top + compHeight > newDeviceConfig.height) {
              newStyle.top = newDeviceConfig.height - compHeight;
              if (newStyle.top < 0) newStyle.top = 0;
            }
          }
        }
        
        let adjustedChildren: CanvasComponent[] | undefined;
        if (component.children && component.children.length > 0) {
          adjustedChildren = component.children.map((child) => adjustComponent(child, false));
        }
        
        return {
          ...component,
          style: newStyle,
          children: adjustedChildren,
        };
      };
      
      const newCanvasComponents = state.canvasComponents.map((comp) => adjustComponent(comp, true));
      
      return {
        ...state,
        currentDevice: newDeviceType,
        canvasComponents: newCanvasComponents,
      };
    }

    case 'CHANGE_LAYOUT_MODE': {
      return {
        ...state,
        layoutMode: action.payload.layoutMode,
      };
    }

    case 'CHANGE_ZOOM': {
      return {
        ...state,
        zoom: action.payload.zoom,
      };
    }

    case 'MOVE_COMPONENT': {
      const { componentId, position } = action.payload;
      const newComponents = state.canvasComponents.map((comp) =>
        comp.id === componentId
          ? { ...comp, style: { ...comp.style, left: position.x, top: position.y } }
          : comp
      );

      return {
        ...state,
        canvasComponents: newComponents,
      };
    }

    case 'BRING_TO_FRONT': {
      const { componentId } = action.payload;
      const maxZIndex = Math.max(
        ...state.canvasComponents.map((c) => c.style.zIndex || 0),
        0
      );
      const newComponents = state.canvasComponents.map((comp) =>
        comp.id === componentId
          ? { ...comp, style: { ...comp.style, zIndex: maxZIndex + 1 } }
          : comp
      );
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), newComponents];

      return {
        ...state,
        canvasComponents: newComponents,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'SEND_TO_BACK': {
      const { componentId } = action.payload;
      const minZIndex = Math.min(
        ...state.canvasComponents.map((c) => c.style.zIndex || 0),
        0
      );
      const newComponents = state.canvasComponents.map((comp) =>
        comp.id === componentId
          ? { ...comp, style: { ...comp.style, zIndex: minZIndex - 1 } }
          : comp
      );
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), newComponents];

      return {
        ...state,
        canvasComponents: newComponents,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'TOGGLE_LOCK': {
      const { componentId } = action.payload;
      const newComponents = state.canvasComponents.map((comp) =>
        comp.id === componentId ? { ...comp, locked: !comp.locked } : comp
      );
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), newComponents];

      return {
        ...state,
        canvasComponents: newComponents,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'TOGGLE_VISIBILITY': {
      const { componentId } = action.payload;
      const newComponents = state.canvasComponents.map((comp) =>
        comp.id === componentId ? { ...comp, visible: !comp.visible } : comp
      );
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), newComponents];

      return {
        ...state,
        canvasComponents: newComponents,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'TOGGLE_PREVIEW_MODE': {
      return {
        ...state,
        isPreviewMode: !state.isPreviewMode,
        selectedComponentId: state.isPreviewMode ? state.selectedComponentId : null,
      };
    }

    default:
      return state;
  }
}

interface EditorContextType {
  state: EditorState;
  addComponent: (template: ComponentTemplate, position?: { x: number; y: number }, parentId?: string) => void;
  selectComponent: (componentId: string | null) => void;
  updateComponentStyle: (componentId: string, style: Partial<ComponentStyle>) => void;
  updateComponentProps: (componentId: string, props: Partial<ComponentProps>) => void;
  deleteComponent: (componentId: string) => void;
  copyComponent: (componentId: string) => void;
  pasteComponent: () => void;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  changeDevice: (deviceType: DeviceType) => void;
  changeLayoutMode: (layoutMode: LayoutMode) => void;
  changeZoom: (zoom: number) => void;
  moveComponent: (componentId: string, position: { x: number; y: number }) => void;
  bringToFront: (componentId: string) => void;
  sendToBack: (componentId: string) => void;
  toggleLock: (componentId: string) => void;
  toggleVisibility: (componentId: string) => void;
  togglePreviewMode: () => void;
  getSelectedComponent: () => CanvasComponent | null;
  getCurrentDeviceConfig: () => typeof deviceConfigs[0];
  canUndo: boolean;
  canRedo: boolean;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const addComponent = useCallback(
    (template: ComponentTemplate, position?: { x: number; y: number }, parentId?: string) => {
      dispatch({ type: 'ADD_COMPONENT', payload: { template, position, parentId } });
    },
    []
  );

  const selectComponent = useCallback((componentId: string | null) => {
    dispatch({ type: 'SELECT_COMPONENT', payload: { componentId } });
  }, []);

  const updateComponentStyle = useCallback(
    (componentId: string, style: Partial<ComponentStyle>) => {
      dispatch({ type: 'UPDATE_COMPONENT_STYLE', payload: { componentId, style } });
    },
    []
  );

  const updateComponentProps = useCallback(
    (componentId: string, props: Partial<ComponentProps>) => {
      dispatch({ type: 'UPDATE_COMPONENT_PROPS', payload: { componentId, props } });
    },
    []
  );

  const deleteComponent = useCallback((componentId: string) => {
    dispatch({ type: 'DELETE_COMPONENT', payload: { componentId } });
  }, []);

  const copyComponent = useCallback((componentId: string) => {
    dispatch({ type: 'COPY_COMPONENT', payload: { componentId } });
  }, []);

  const pasteComponent = useCallback(() => {
    dispatch({ type: 'PASTE_COMPONENT' });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const clearCanvas = useCallback(() => {
    dispatch({ type: 'CLEAR_CANVAS' });
  }, []);

  const changeDevice = useCallback((deviceType: DeviceType) => {
    dispatch({ type: 'CHANGE_DEVICE', payload: { deviceType } });
  }, []);

  const changeLayoutMode = useCallback((layoutMode: LayoutMode) => {
    dispatch({ type: 'CHANGE_LAYOUT_MODE', payload: { layoutMode } });
  }, []);

  const changeZoom = useCallback((zoom: number) => {
    dispatch({ type: 'CHANGE_ZOOM', payload: { zoom } });
  }, []);

  const moveComponent = useCallback((componentId: string, position: { x: number; y: number }) => {
    dispatch({ type: 'MOVE_COMPONENT', payload: { componentId, position } });
  }, []);

  const bringToFront = useCallback((componentId: string) => {
    dispatch({ type: 'BRING_TO_FRONT', payload: { componentId } });
  }, []);

  const sendToBack = useCallback((componentId: string) => {
    dispatch({ type: 'SEND_TO_BACK', payload: { componentId } });
  }, []);

  const toggleLock = useCallback((componentId: string) => {
    dispatch({ type: 'TOGGLE_LOCK', payload: { componentId } });
  }, []);

  const toggleVisibility = useCallback((componentId: string) => {
    dispatch({ type: 'TOGGLE_VISIBILITY', payload: { componentId } });
  }, []);

  const togglePreviewMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_PREVIEW_MODE' });
  }, []);

  const findComponentById = useCallback((components: CanvasComponent[], id: string): CanvasComponent | null => {
    for (const comp of components) {
      if (comp.id === id) return comp;
      if (comp.children && comp.children.length > 0) {
        const found = findComponentById(comp.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const getSelectedComponent = useCallback(() => {
    return state.selectedComponentId
      ? findComponentById(state.canvasComponents, state.selectedComponentId) || null
      : null;
  }, [state.canvasComponents, state.selectedComponentId, findComponentById]);

  const getCurrentDeviceConfig = useCallback(() => {
    return deviceConfigs.find((d) => d.type === state.currentDevice) || deviceConfigs[0];
  }, [state.currentDevice]);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const value = {
    state,
    addComponent,
    selectComponent,
    updateComponentStyle,
    updateComponentProps,
    deleteComponent,
    copyComponent,
    pasteComponent,
    undo,
    redo,
    clearCanvas,
    changeDevice,
    changeLayoutMode,
    changeZoom,
    moveComponent,
    bringToFront,
    sendToBack,
    toggleLock,
    toggleVisibility,
    togglePreviewMode,
    getSelectedComponent,
    getCurrentDeviceConfig,
    canUndo,
    canRedo,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
