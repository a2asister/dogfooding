import { createRoot, createSignal } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import type { DashboardConfig, ComponentInstance, ComponentType } from '../types';
import { createDefaultComponent } from '../components/registry';

interface EditorState {
  dashboard: DashboardConfig;
  selectedId: string | null;
  zoom: number;
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  history: DashboardConfig[];
  historyIndex: number;
  isDragging: boolean;
  isResizing: boolean;
  dragStart: { x: number; y: number } | null;
  componentStart: { x: number; y: number; width: number; height: number } | null;
}

const initialState: EditorState = {
  dashboard: {
    width: 1920,
    height: 1080,
    components: [],
    backgroundColor: '#0f172a',
  },
  selectedId: null,
  zoom: 0.6,
  snapToGrid: true,
  gridSize: 20,
  showGrid: true,
  history: [],
  historyIndex: -1,
  isDragging: false,
  isResizing: false,
  dragStart: null,
  componentStart: null,
};

function createEditorStore() {
  const [state, setState] = createStore<EditorState>(initialState);
  const [saveStatus, setSaveStatus] = createSignal<'idle' | 'saving' | 'saved'>('idle');

  const setDashboard = (dashboard: DashboardConfig) => {
    setState('dashboard', dashboard);
  };

  const saveHistory = () => {
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state.dashboard)));
    setState({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  };

  const undo = () => {
    if (state.historyIndex > 0) {
      setState({
        historyIndex: state.historyIndex - 1,
        dashboard: state.history[state.historyIndex - 1],
      });
    }
  };

  const redo = () => {
    if (state.historyIndex < state.history.length - 1) {
      setState({
        historyIndex: state.historyIndex + 1,
        dashboard: state.history[state.historyIndex + 1],
      });
    }
  };

  const addComponent = (type: ComponentType, x?: number, y?: number) => {
    const component = createDefaultComponent(type, x, y);
    if (!component) return;

    saveHistory();
    setState(
      produce((s) => {
        s.dashboard.components.push(component);
        s.selectedId = component.id;
      })
    );
  };

  const deleteComponent = (id: string) => {
    saveHistory();
    setState(
      produce((s) => {
        s.dashboard.components = s.dashboard.components.filter((c) => c.id !== id);
        if (s.selectedId === id) {
          s.selectedId = null;
        }
      })
    );
  };

  const copyComponent = (id: string) => {
    const component = state.dashboard.components.find((c) => c.id === id);
    if (!component) return;

    saveHistory();
    const newComponent: ComponentInstance = {
      ...JSON.parse(JSON.stringify(component)),
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      x: component.x + 20,
      y: component.y + 20,
      zIndex: Date.now(),
      name: `${component.name} (副本)`,
    };

    setState(
      produce((s) => {
        s.dashboard.components.push(newComponent);
        s.selectedId = newComponent.id;
      })
    );
  };

  const updateComponent = (id: string, updates: Partial<ComponentInstance>) => {
    setState(
      produce((s) => {
        const index = s.dashboard.components.findIndex((c) => c.id === id);
        if (index !== -1) {
          s.dashboard.components[index] = { ...s.dashboard.components[index], ...updates };
        }
      })
    );
  };

  const updateComponentWithHistory = (id: string, updates: Partial<ComponentInstance>) => {
    saveHistory();
    updateComponent(id, updates);
  };

  const selectComponent = (id: string | null) => {
    setState('selectedId', id);
  };

  const getSelectedComponent = () => {
    return state.dashboard.components.find((c) => c.id === state.selectedId);
  };

  const setZoom = (zoom: number) => {
    setState('zoom', Math.max(0.2, Math.min(2, zoom)));
  };

  const setSnapToGrid = (enabled: boolean) => {
    setState('snapToGrid', enabled);
  };

  const setGridSize = (size: number) => {
    setState('gridSize', size);
  };

  const setShowGrid = (show: boolean) => {
    setState('showGrid', show);
  };

  const updateDashboardStyle = (updates: Partial<{ backgroundColor: string; backgroundImage: string }>) => {
    saveHistory();
    setState(
      produce((s) => {
        Object.assign(s.dashboard, updates);
      })
    );
  };

  const startDrag = (clientX: number, clientY: number) => {
    const component = getSelectedComponent();
    if (!component) return;

    setState({
      isDragging: true,
      dragStart: { x: clientX, y: clientY },
      componentStart: { x: component.x, y: component.y, width: component.width, height: component.height },
    });
  };

  const drag = (clientX: number, clientY: number) => {
    if (!state.isDragging || !state.dragStart || !state.componentStart || !state.selectedId) return;

    const dx = (clientX - state.dragStart.x) / state.zoom;
    const dy = (clientY - state.dragStart.y) / state.zoom;

    let newX = state.componentStart.x + dx;
    let newY = state.componentStart.y + dy;

    if (state.snapToGrid) {
      newX = Math.round(newX / state.gridSize) * state.gridSize;
      newY = Math.round(newY / state.gridSize) * state.gridSize;
    }

    updateComponent(state.selectedId, { x: newX, y: newY });
  };

  const endDrag = () => {
    if (state.isDragging) {
      saveHistory();
    }
    setState({ isDragging: false, dragStart: null, componentStart: null });
  };

  const startResize = (clientX: number, clientY: number) => {
    const component = getSelectedComponent();
    if (!component) return;

    setState({
      isResizing: true,
      dragStart: { x: clientX, y: clientY },
      componentStart: { x: component.x, y: component.y, width: component.width, height: component.height },
    });
  };

  const resize = (clientX: number, clientY: number) => {
    if (!state.isResizing || !state.dragStart || !state.componentStart || !state.selectedId) return;

    const dx = (clientX - state.dragStart.x) / state.zoom;
    const dy = (clientY - state.dragStart.y) / state.zoom;

    let newWidth = Math.max(50, state.componentStart.width + dx);
    let newHeight = Math.max(50, state.componentStart.height + dy);

    if (state.snapToGrid) {
      newWidth = Math.round(newWidth / state.gridSize) * state.gridSize;
      newHeight = Math.round(newHeight / state.gridSize) * state.gridSize;
    }

    updateComponent(state.selectedId, { width: newWidth, height: newHeight });
  };

  const endResize = () => {
    if (state.isResizing) {
      saveHistory();
    }
    setState({ isResizing: false, dragStart: null, componentStart: null });
  };

  return {
    state,
    setDashboard,
    addComponent,
    deleteComponent,
    copyComponent,
    updateComponent,
    updateComponentWithHistory,
    selectComponent,
    getSelectedComponent,
    setZoom,
    setSnapToGrid,
    setGridSize,
    setShowGrid,
    updateDashboardStyle,
    undo,
    redo,
    canUndo: () => state.historyIndex > 0,
    canRedo: () => state.historyIndex < state.history.length - 1,
    startDrag,
    drag,
    endDrag,
    startResize,
    resize,
    endResize,
    saveStatus,
    setSaveStatus,
  };
}

export default createRoot(createEditorStore);
