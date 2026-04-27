import React, { createContext, useContext, useReducer, ReactNode, useCallback, useMemo } from 'react';
import { SpreadsheetData, OperationRecord, TableVersion, ColumnConfig, CellType, CellChange } from '../types';
import { generateId, deepClone, isEqual } from '../utils';
import { db } from '../store/database';

const USER_ID = generateId();
const USER_NAME = '当前用户';

interface SpreadsheetState {
  spreadsheetId: string;
  spreadsheetName: string;
  data: SpreadsheetData;
  undoStack: OperationRecord[];
  redoStack: OperationRecord[];
  versions: TableVersion[];
  isLoading: boolean;
  error: string | null;
  onlineUsers: Map<string, { name: string; color: string; lastActive: number }>;
  lockedCells: Set<string>;
  selectedCell: { row: number; col: number } | null;
}

type SpreadsheetAction =
  | { type: 'SET_DATA'; payload: SpreadsheetData }
  | { type: 'UPDATE_CELL'; payload: { row: number; col: number; value: unknown } }
  | { type: 'ADD_ROW'; payload: { index: number } }
  | { type: 'DELETE_ROW'; payload: { index: number } }
  | { type: 'ADD_COLUMN'; payload: { index: number; config: ColumnConfig } }
  | { type: 'DELETE_COLUMN'; payload: { index: number } }
  | { type: 'UPDATE_COLUMN_WIDTH'; payload: { index: number; width: number } }
  | { type: 'UPDATE_ROW_HEIGHT'; payload: { index: number; height: number } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_VERSION'; payload: { description: string } }
  | { type: 'RESTORE_VERSION'; payload: { versionId: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'BATCH_EDIT'; payload: { changes: CellChange[] } }
  | { type: 'SET_SELECTED_CELL'; payload: { row: number; col: number } | null }
  | { type: 'LOCK_CELL'; payload: { row: number; col: number; userId: string } }
  | { type: 'UNLOCK_CELL'; payload: { row: number; col: number } }
  | { type: 'INIT_SPREADSHEET'; payload: { id: string; name: string; data: SpreadsheetData; versions: TableVersion[] } };

const initialState: SpreadsheetState = {
  spreadsheetId: '',
  spreadsheetName: '新建表格',
  data: {
    data: [],
    colHeaders: [],
    columns: [],
    fixedRowsTop: 1,
    fixedColumnsLeft: 0
  },
  undoStack: [],
  redoStack: [],
  versions: [],
  isLoading: false,
  error: null,
  onlineUsers: new Map(),
  lockedCells: new Set(),
  selectedCell: null
};

function createDefaultSpreadsheetData(): SpreadsheetData {
  const rows = 20;
  const cols = 10;
  
  const data: (string | number | boolean | null)[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: (string | number | boolean | null)[] = [];
    for (let j = 0; j < cols; j++) {
      row.push(null);
    }
    data.push(row);
  }

  const columns: ColumnConfig[] = [
    { id: 'col_0', title: '序号', type: 'number', width: 80 },
    { id: 'col_1', title: '姓名', type: 'text', width: 120 },
    { id: 'col_2', title: '年龄', type: 'number', width: 80 },
    { id: 'col_3', title: '出生日期', type: 'date', width: 120 },
    { id: 'col_4', title: '性别', type: 'dropdown', width: 80, dropdownOptions: ['男', '女', '其他'] },
    { id: 'col_5', title: '部门', type: 'dropdown', width: 120, dropdownOptions: ['技术部', '市场部', '人事部', '财务部'] },
    { id: 'col_6', title: '薪资', type: 'number', width: 100 },
    { id: 'col_7', title: '入职日期', type: 'date', width: 120 },
    { id: 'col_8', title: '状态', type: 'dropdown', width: 80, dropdownOptions: ['在职', '离职', '休假'] },
    { id: 'col_9', title: '备注', type: 'text', width: 200 }
  ];

  const colHeaders = columns.map(col => col.title);

  return {
    data,
    colHeaders,
    columns,
    fixedRowsTop: 1,
    fixedColumnsLeft: 0
  };
}

function createInitialData(): SpreadsheetData {
  const baseData = createDefaultSpreadsheetData();
  
  const sampleData = [
    [1, '张三', 28, '1997-03-15', '男', '技术部', 15000, '2020-07-01', '在职', '核心开发人员'],
    [2, '李四', 32, '1993-11-22', '女', '市场部', 12000, '2019-03-15', '在职', '市场经理'],
    [3, '王五', 25, '1999-08-08', '男', '技术部', 12000, '2021-01-10', '在职', '前端开发'],
    [4, '赵六', 35, '1990-05-20', '男', '人事部', 18000, '2015-09-01', '在职', '人事总监'],
    [5, '钱七', 29, '1996-12-01', '女', '财务部', 13000, '2018-06-20', '在职', '财务主管']
  ];

  sampleData.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (rowIndex < baseData.data.length && colIndex < baseData.data[0].length) {
        baseData.data[rowIndex][colIndex] = value as string | number | boolean | null;
      }
    });
  });

  return baseData;
}

function spreadsheetReducer(state: SpreadsheetState, action: SpreadsheetAction): SpreadsheetState {
  switch (action.type) {
    case 'INIT_SPREADSHEET': {
      return {
        ...state,
        spreadsheetId: action.payload.id,
        spreadsheetName: action.payload.name,
        data: action.payload.data,
        versions: action.payload.versions,
        undoStack: [],
        redoStack: []
      };
    }

    case 'SET_DATA': {
      return { ...state, data: action.payload, undoStack: [], redoStack: [] };
    }

    case 'UPDATE_CELL': {
      const { row, col, value } = action.payload;
      const oldValue = state.data.data[row]?.[col];
      
      if (isEqual(oldValue, value)) {
        return state;
      }

      const newData = deepClone(state.data);
      if (!newData.data[row]) {
        newData.data[row] = [];
      }
      newData.data[row][col] = value as string | number | boolean | null;

      const operation: OperationRecord = {
        id: generateId(),
        type: 'cell_edit',
        data: {
          row,
          col,
          oldValue,
          newValue: value,
          timestamp: Date.now(),
          userId: USER_ID
        },
        timestamp: Date.now(),
        userId: USER_ID
      };

      return {
        ...state,
        data: newData,
        undoStack: [...state.undoStack, operation],
        redoStack: []
      };
    }

    case 'BATCH_EDIT': {
      const { changes } = action.payload;
      if (changes.length === 0) return state;

      const newData = deepClone(state.data);
      const actualChanges: CellChange[] = [];

      changes.forEach(change => {
        const oldValue = newData.data[change.row]?.[change.col];
        if (!isEqual(oldValue, change.newValue)) {
          if (!newData.data[change.row]) {
            newData.data[change.row] = [];
          }
          newData.data[change.row][change.col] = change.newValue as string | number | boolean | null;
          actualChanges.push({
            ...change,
            oldValue,
            timestamp: Date.now(),
            userId: USER_ID
          });
        }
      });

      if (actualChanges.length === 0) return state;

      const operation: OperationRecord = {
        id: generateId(),
        type: 'batch_edit',
        data: actualChanges,
        timestamp: Date.now(),
        userId: USER_ID
      };

      return {
        ...state,
        data: newData,
        undoStack: [...state.undoStack, operation],
        redoStack: []
      };
    }

    case 'ADD_ROW': {
      const { index } = action.payload;
      const newData = deepClone(state.data);
      const colCount = newData.data[0]?.length || 10;
      const newRow: (string | number | boolean | null)[] = Array(colCount).fill(null);
      
      newData.data.splice(index, 0, newRow);

      const operation: OperationRecord = {
        id: generateId(),
        type: 'row_add',
        data: {
          row: index,
          col: 0,
          oldValue: null,
          newValue: newRow,
          timestamp: Date.now(),
          userId: USER_ID
        },
        timestamp: Date.now(),
        userId: USER_ID
      };

      return {
        ...state,
        data: newData,
        undoStack: [...state.undoStack, operation],
        redoStack: []
      };
    }

    case 'DELETE_ROW': {
      const { index } = action.payload;
      const newData = deepClone(state.data);
      const deletedRow = newData.data.splice(index, 1)[0];

      const operation: OperationRecord = {
        id: generateId(),
        type: 'row_delete',
        data: {
          row: index,
          col: 0,
          oldValue: deletedRow,
          newValue: null,
          timestamp: Date.now(),
          userId: USER_ID
        },
        timestamp: Date.now(),
        userId: USER_ID
      };

      return {
        ...state,
        data: newData,
        undoStack: [...state.undoStack, operation],
        redoStack: []
      };
    }

    case 'ADD_COLUMN': {
      const { index, config } = action.payload;
      const newData = deepClone(state.data);
      
      newData.colHeaders?.splice(index, 0, config.title);
      newData.columns?.splice(index, 0, config);
      newData.columnWidths?.splice(index, 0, config.width || 100);
      
      newData.data.forEach(row => {
        row.splice(index, 0, null);
      });

      const operation: OperationRecord = {
        id: generateId(),
        type: 'col_add',
        data: {
          row: 0,
          col: index,
          oldValue: null,
          newValue: config,
          timestamp: Date.now(),
          userId: USER_ID
        },
        timestamp: Date.now(),
        userId: USER_ID
      };

      return {
        ...state,
        data: newData,
        undoStack: [...state.undoStack, operation],
        redoStack: []
      };
    }

    case 'DELETE_COLUMN': {
      const { index } = action.payload;
      const newData = deepClone(state.data);
      
      const deletedHeader = newData.colHeaders?.splice(index, 1)[0];
      const deletedColumn = newData.columns?.splice(index, 1)[0];
      const deletedWidth = newData.columnWidths?.splice(index, 1)[0];
      
      newData.data.forEach(row => {
        row.splice(index, 1);
      });

      const operation: OperationRecord = {
        id: generateId(),
        type: 'col_delete',
        data: {
          row: 0,
          col: index,
          oldValue: { header: deletedHeader, column: deletedColumn, width: deletedWidth },
          newValue: null,
          timestamp: Date.now(),
          userId: USER_ID
        },
        timestamp: Date.now(),
        userId: USER_ID
      };

      return {
        ...state,
        data: newData,
        undoStack: [...state.undoStack, operation],
        redoStack: []
      };
    }

    case 'UPDATE_COLUMN_WIDTH': {
      const { index, width } = action.payload;
      const newData = deepClone(state.data);
      if (!newData.columnWidths) {
        newData.columnWidths = [];
      }
      const oldWidth = newData.columnWidths[index];
      newData.columnWidths[index] = width;

      if (oldWidth === width) return state;

      const operation: OperationRecord = {
        id: generateId(),
        type: 'col_width',
        data: {
          row: 0,
          col: index,
          oldValue: oldWidth,
          newValue: width,
          timestamp: Date.now(),
          userId: USER_ID
        },
        timestamp: Date.now(),
        userId: USER_ID
      };

      return {
        ...state,
        data: newData,
        undoStack: [...state.undoStack, operation],
        redoStack: []
      };
    }

    case 'UPDATE_ROW_HEIGHT': {
      const { index, height } = action.payload;
      const newData = deepClone(state.data);
      if (!newData.rowHeights) {
        newData.rowHeights = [];
      }
      const oldHeight = newData.rowHeights[index];
      newData.rowHeights[index] = height;

      if (oldHeight === height) return state;

      const operation: OperationRecord = {
        id: generateId(),
        type: 'row_height',
        data: {
          row: index,
          col: 0,
          oldValue: oldHeight,
          newValue: height,
          timestamp: Date.now(),
          userId: USER_ID
        },
        timestamp: Date.now(),
        userId: USER_ID
      };

      return {
        ...state,
        data: newData,
        undoStack: [...state.undoStack, operation],
        redoStack: []
      };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      
      const lastOperation = state.undoStack[state.undoStack.length - 1];
      const newUndoStack = state.undoStack.slice(0, -1);
      
      let newData = deepClone(state.data);
      let inverseOperation: OperationRecord | null = null;

      switch (lastOperation.type) {
        case 'cell_edit': {
          const change = lastOperation.data as CellChange;
          newData.data[change.row][change.col] = change.oldValue as string | number | boolean | null;
          inverseOperation = {
            ...lastOperation,
            data: {
              ...change,
              oldValue: change.newValue,
              newValue: change.oldValue
            }
          };
          break;
        }
        case 'batch_edit': {
          const changes = lastOperation.data as CellChange[];
          const inverseChanges: CellChange[] = [];
          changes.forEach(change => {
            newData.data[change.row][change.col] = change.oldValue as string | number | boolean | null;
            inverseChanges.push({
              ...change,
              oldValue: change.newValue,
              newValue: change.oldValue
            });
          });
          inverseOperation = {
            ...lastOperation,
            data: inverseChanges.reverse()
          };
          break;
        }
        case 'row_add': {
          const change = lastOperation.data as CellChange;
          newData.data.splice(change.row, 1);
          inverseOperation = {
            ...lastOperation,
            type: 'row_delete',
            data: {
              ...change,
              oldValue: change.newValue,
              newValue: null
            }
          };
          break;
        }
        case 'row_delete': {
          const change = lastOperation.data as CellChange;
          newData.data.splice(change.row, 0, change.oldValue as (string | number | boolean | null)[]);
          inverseOperation = {
            ...lastOperation,
            type: 'row_add',
            data: {
              ...change,
              oldValue: null,
              newValue: change.oldValue
            }
          };
          break;
        }
      }

      return {
        ...state,
        data: newData,
        undoStack: newUndoStack,
        redoStack: inverseOperation ? [...state.redoStack, inverseOperation] : state.redoStack
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      
      const nextOperation = state.redoStack[state.redoStack.length - 1];
      const newRedoStack = state.redoStack.slice(0, -1);
      
      let newData = deepClone(state.data);
      let inverseOperation: OperationRecord | null = null;

      switch (nextOperation.type) {
        case 'cell_edit': {
          const change = nextOperation.data as CellChange;
          const oldValue = newData.data[change.row][change.col];
          newData.data[change.row][change.col] = change.newValue as string | number | boolean | null;
          inverseOperation = {
            ...nextOperation,
            data: {
              ...change,
              oldValue: change.newValue,
              newValue: oldValue
            }
          };
          break;
        }
        case 'batch_edit': {
          const changes = nextOperation.data as CellChange[];
          const inverseChanges: CellChange[] = [];
          changes.forEach(change => {
            const oldValue = newData.data[change.row][change.col];
            newData.data[change.row][change.col] = change.newValue as string | number | boolean | null;
            inverseChanges.push({
              ...change,
              oldValue: change.newValue,
              newValue: oldValue
            });
          });
          inverseOperation = {
            ...nextOperation,
            data: inverseChanges.reverse()
          };
          break;
        }
      }

      return {
        ...state,
        data: newData,
        undoStack: inverseOperation ? [...state.undoStack, inverseOperation] : state.undoStack,
        redoStack: newRedoStack
      };
    }

    case 'SAVE_VERSION': {
      const version: TableVersion = {
        id: generateId(),
        snapshot: JSON.stringify(state.data),
        timestamp: Date.now(),
        userId: USER_ID,
        description: action.payload.description,
        changesCount: state.undoStack.length
      };

      return {
        ...state,
        versions: [...state.versions, version]
      };
    }

    case 'RESTORE_VERSION': {
      const version = state.versions.find(v => v.id === action.payload.versionId);
      if (!version) return state;

      const restoredData = JSON.parse(version.snapshot) as SpreadsheetData;
      
      return {
        ...state,
        data: restoredData,
        undoStack: [],
        redoStack: []
      };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_SELECTED_CELL':
      return { ...state, selectedCell: action.payload };

    case 'LOCK_CELL': {
      const { row, col } = action.payload;
      const cellKey = `${row}-${col}`;
      const newLockedCells = new Set(state.lockedCells);
      newLockedCells.add(cellKey);
      return { ...state, lockedCells: newLockedCells };
    }

    case 'UNLOCK_CELL': {
      const { row, col } = action.payload;
      const cellKey = `${row}-${col}`;
      const newLockedCells = new Set(state.lockedCells);
      newLockedCells.delete(cellKey);
      return { ...state, lockedCells: newLockedCells };
    }

    default:
      return state;
  }
}

interface SpreadsheetContextType {
  state: SpreadsheetState;
  dispatch: React.Dispatch<SpreadsheetAction>;
  loadSpreadsheet: (id?: string) => Promise<void>;
  saveSpreadsheet: () => Promise<void>;
  updateCell: (row: number, col: number, value: unknown) => void;
  batchEdit: (changes: CellChange[]) => void;
  addRow: (index: number) => void;
  deleteRow: (index: number) => void;
  addColumn: (index: number, config: ColumnConfig) => void;
  deleteColumn: (index: number) => void;
  updateColumnWidth: (index: number, width: number) => void;
  updateRowHeight: (index: number, height: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveVersion: (description: string) => void;
  restoreVersion: (versionId: string) => void;
  getColumnType: (colIndex: number) => CellType;
  getColumnConfig: (colIndex: number) => ColumnConfig | undefined;
  lockCell: (row: number, col: number) => void;
  unlockCell: (row: number, col: number) => void;
  isCellLocked: (row: number, col: number) => boolean;
  currentUserId: string;
  currentUserName: string;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | null>(null);

export function SpreadsheetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(spreadsheetReducer, initialState);

  const loadSpreadsheet = useCallback(async (id?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      let spreadsheetId = id || 'default_spreadsheet';
      let spreadsheet = await db.spreadsheets.get(spreadsheetId);

      if (!spreadsheet) {
        const initialData = createInitialData();
        spreadsheet = {
          id: spreadsheetId,
          name: '员工信息表',
          data: initialData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          createdBy: USER_ID,
          updatedBy: USER_ID,
          versions: []
        };
        await db.spreadsheets.put(spreadsheet);
      }

      dispatch({
        type: 'INIT_SPREADSHEET',
        payload: {
          id: spreadsheet.id,
          name: spreadsheet.name,
          data: spreadsheet.data,
          versions: spreadsheet.versions
        }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : '加载表格失败' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const saveSpreadsheet = useCallback(async () => {
    try {
      const spreadsheet = await db.spreadsheets.get(state.spreadsheetId);
      if (spreadsheet) {
        spreadsheet.data = state.data;
        spreadsheet.updatedAt = Date.now();
        spreadsheet.updatedBy = USER_ID;
        spreadsheet.versions = state.versions;
        await db.spreadsheets.put(spreadsheet);
      }
    } catch (error) {
      console.error('保存表格失败:', error);
    }
  }, [state.spreadsheetId, state.data, state.versions]);

  const updateCell = useCallback((row: number, col: number, value: unknown) => {
    dispatch({ type: 'UPDATE_CELL', payload: { row, col, value } });
  }, []);

  const batchEdit = useCallback((changes: CellChange[]) => {
    dispatch({ type: 'BATCH_EDIT', payload: { changes } });
  }, []);

  const addRow = useCallback((index: number) => {
    dispatch({ type: 'ADD_ROW', payload: { index } });
  }, []);

  const deleteRow = useCallback((index: number) => {
    dispatch({ type: 'DELETE_ROW', payload: { index } });
  }, []);

  const addColumn = useCallback((index: number, config: ColumnConfig) => {
    dispatch({ type: 'ADD_COLUMN', payload: { index, config } });
  }, []);

  const deleteColumn = useCallback((index: number) => {
    dispatch({ type: 'DELETE_COLUMN', payload: { index } });
  }, []);

  const updateColumnWidth = useCallback((index: number, width: number) => {
    dispatch({ type: 'UPDATE_COLUMN_WIDTH', payload: { index, width } });
  }, []);

  const updateRowHeight = useCallback((index: number, height: number) => {
    dispatch({ type: 'UPDATE_ROW_HEIGHT', payload: { index, height } });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const canUndo = useMemo(() => state.undoStack.length > 0, [state.undoStack]);
  const canRedo = useMemo(() => state.redoStack.length > 0, [state.redoStack]);

  const saveVersion = useCallback((description: string) => {
    dispatch({ type: 'SAVE_VERSION', payload: { description } });
  }, []);

  const restoreVersion = useCallback((versionId: string) => {
    dispatch({ type: 'RESTORE_VERSION', payload: { versionId } });
  }, []);

  const getColumnType = useCallback((colIndex: number): CellType => {
    return state.data.columns?.[colIndex]?.type || 'text';
  }, [state.data.columns]);

  const getColumnConfig = useCallback((colIndex: number): ColumnConfig | undefined => {
    return state.data.columns?.[colIndex];
  }, [state.data.columns]);

  const lockCell = useCallback((row: number, col: number) => {
    dispatch({ type: 'LOCK_CELL', payload: { row, col, userId: USER_ID } });
  }, []);

  const unlockCell = useCallback((row: number, col: number) => {
    dispatch({ type: 'UNLOCK_CELL', payload: { row, col } });
  }, []);

  const isCellLocked = useCallback((row: number, col: number): boolean => {
    return state.lockedCells.has(`${row}-${col}`);
  }, [state.lockedCells]);

  const contextValue: SpreadsheetContextType = {
    state,
    dispatch,
    loadSpreadsheet,
    saveSpreadsheet,
    updateCell,
    batchEdit,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    updateColumnWidth,
    updateRowHeight,
    undo,
    redo,
    canUndo,
    canRedo,
    saveVersion,
    restoreVersion,
    getColumnType,
    getColumnConfig,
    lockCell,
    unlockCell,
    isCellLocked,
    currentUserId: USER_ID,
    currentUserName: USER_NAME
  };

  return (
    <SpreadsheetContext.Provider value={contextValue}>
      {children}
    </SpreadsheetContext.Provider>
  );
}

export function useSpreadsheet() {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error('useSpreadsheet must be used within a SpreadsheetProvider');
  }
  return context;
}
