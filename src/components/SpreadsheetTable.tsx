import { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import Handsontable from 'handsontable';
import { useSpreadsheet } from '../context/SpreadsheetContext';
import { validateCellValue, ValidationResult } from '../utils';
import { CellType, ColumnConfig, CellChange } from '../types';
import './SpreadsheetTable.css';
import 'handsontable/dist/handsontable.full.min.css';

registerAllModules();

interface SpreadsheetTableProps {
  className?: string;
}

function getHandsontableType(cellType: CellType): string {
  switch (cellType) {
    case 'dropdown':
      return 'dropdown';
    case 'date':
      return 'date';
    case 'number':
      return 'numeric';
    default:
      return 'text';
  }
}

function mapColumnsToHotSettings(
  columns: ColumnConfig[]
): Handsontable.ColumnSettings[] {
  return columns.map((col) => {
    const settings: Handsontable.ColumnSettings = {
      type: getHandsontableType(col.type) as Handsontable.CellType,
      width: col.width || 120,
      readOnly: col.readOnly || false,
      source: col.dropdownOptions,
      allowInvalid: true,
      dateFormat: 'YYYY-MM-DD',
      correctFormat: true,
    };

    if (col.type === 'date') {
      settings.defaultDate = new Date().getFullYear() + '-' + 
        String(new Date().getMonth() + 1).padStart(2, '0') + '-' + 
        String(new Date().getDate()).padStart(2, '0');
      settings.datePickerConfig = {
        firstDay: 1,
        showWeekNumber: true,
      } as Handsontable.CellValue;
    }

    if (col.type === 'number') {
      settings.numericFormat = {
        pattern: '0',
        culture: 'zh-CN',
      } as Handsontable.CellValue;
    }

    return settings;
  });
}

export function SpreadsheetTable({ className = '' }: SpreadsheetTableProps) {
  const hotTableRef = useRef<HotTable>(null);
  const {
    state,
    loadSpreadsheet,
    updateCell,
    batchEdit,
    saveSpreadsheet,
    getColumnType,
    getColumnConfig,
    currentUserId,
    addRow,
    deleteRow,
    deleteColumn,
  } = useSpreadsheet();

  const [validationErrors, setValidationErrors] = useState<
    Map<string, ValidationResult>
  >(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const isProcessingSync = useRef(false);
  const skipNextAfterChange = useRef(false);
  const previousUndoStackLength = useRef(0);
  const previousRedoStackLength = useRef(0);

  useEffect(() => {
    loadSpreadsheet().then(() => {
      setIsInitialized(true);
    });
  }, [loadSpreadsheet]);

  useEffect(() => {
    if (state.undoStack.length > 0 && !isSaving && isInitialized) {
      const timer = setTimeout(() => {
        if (state.undoStack.length > 0 && !isSaving) {
          setIsSaving(true);
          saveSpreadsheet().finally(() => {
            setIsSaving(false);
          });
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [state.undoStack.length, saveSpreadsheet, isSaving, isInitialized]);

  const columnSettings = useMemo(() => {
    const columns = state.data.columns || [];
    return mapColumnsToHotSettings(columns);
  }, [state.data.columns]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveSpreadsheet();
      }
    },
    [saveSpreadsheet]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const syncDataToHotInstance = useCallback(() => {
    if (hotTableRef.current && isInitialized) {
      const hotInstance = (hotTableRef.current as unknown as { hotInstance: Handsontable | null }).hotInstance;
      if (hotInstance) {
        isProcessingSync.current = true;
        skipNextAfterChange.current = true;
        hotInstance.loadData(state.data.data);
        hotInstance.render();
        setTimeout(() => {
          isProcessingSync.current = false;
          skipNextAfterChange.current = false;
        }, 100);
      }
    }
  }, [state.data.data, isInitialized]);

  const handleAfterChange = useCallback(
    (
      changes: Handsontable.CellChange[] | null,
      source: Handsontable.ChangeSource
    ) => {
      const sourceStr = String(source);
      
      if (skipNextAfterChange.current || isProcessingSync.current) {
        return;
      }
      
      if (
        !changes ||
        sourceStr === 'loadData' ||
        sourceStr === 'ObserveChanges.change'
      ) {
        return;
      }

      const validChanges: CellChange[] = [];
      const errors = new Map(validationErrors);

      changes.forEach(([row, prop, oldValue, newValue]) => {
        if (oldValue === newValue) return;

        const colIndex = typeof prop === 'number' ? prop : 0;
        const cellType = getColumnType(colIndex);
        const columnConfig = getColumnConfig(colIndex);

        let processedValue = newValue;
        if (cellType === 'date' && newValue instanceof Date) {
          processedValue =
            newValue.getFullYear() +
            '-' +
            String(newValue.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(newValue.getDate()).padStart(2, '0');
        }

        const validation = validateCellValue(
          processedValue,
          cellType,
          columnConfig?.validation
        );
        const cellKey = `${row}-${colIndex}`;

        if (!validation.isValid) {
          errors.set(cellKey, validation);
          const hotInstance = (hotTableRef.current as unknown as { hotInstance: Handsontable | null })?.hotInstance;
          if (hotInstance && oldValue !== undefined) {
            hotInstance.setDataAtCell(row, colIndex, oldValue);
          }
        } else {
          errors.delete(cellKey);
          validChanges.push({
            row,
            col: colIndex,
            oldValue,
            newValue: processedValue,
            timestamp: Date.now(),
            userId: currentUserId,
          });
        }
      });

      setValidationErrors(errors);

      if (validChanges.length === 1) {
        const change = validChanges[0];
        updateCell(change.row, change.col, change.newValue);
      } else if (validChanges.length > 1) {
        batchEdit(validChanges);
      }
    },
    [
      validationErrors,
      getColumnType,
      getColumnConfig,
      updateCell,
      batchEdit,
      currentUserId,
    ]
  );

  const handleAfterRemoveRow = useCallback(
    (index: number, amount: number) => {
      if (isProcessingSync.current || !isInitialized) return;
      
      for (let i = 0; i < amount; i++) {
        deleteRow(index);
      }
      saveSpreadsheet();
    },
    [deleteRow, saveSpreadsheet, isInitialized]
  );

  const handleAfterRemoveCol = useCallback(
    (index: number, amount: number) => {
      if (isProcessingSync.current || !isInitialized) return;
      
      for (let i = 0; i < amount; i++) {
        deleteColumn(index);
      }
      saveSpreadsheet();
    },
    [deleteColumn, saveSpreadsheet, isInitialized]
  );

  const handleAfterCreateRow = useCallback(
    (index: number, amount: number) => {
      if (isProcessingSync.current || !isInitialized) return;
      
      for (let i = 0; i < amount; i++) {
        addRow(index + i);
      }
    },
    [addRow, isInitialized]
  );

  const hotSettings = useMemo(() => {
    const settings: Handsontable.GridSettings = {
      data: state.data.data,
      colHeaders: state.data.colHeaders,
      rowHeaders: true,
      columns: columnSettings.length > 0 ? columnSettings : undefined,
      fixedRowsTop: state.data.fixedRowsTop || 0,
      fixedColumnsLeft: state.data.fixedColumnsLeft || 0,
      licenseKey: 'non-commercial-and-evaluation',
      height: 'calc(100vh - 130px)',
      width: '100%',
      stretchH: 'all' as const,
      autoWrapRow: true,
      autoWrapCol: true,
      wordWrap: true,
      allowEmpty: true,
      fillHandle: true,
      enterBeginsEditing: true,
      afterChange: handleAfterChange,
      afterRemoveRow: handleAfterRemoveRow,
      afterRemoveCol: handleAfterRemoveCol,
      afterCreateRow: handleAfterCreateRow,
      contextMenu: [
        'row_above',
        'row_below',
        '---------',
        'col_left',
        'col_right',
        '---------',
        'remove_row',
        'remove_col',
        '---------',
        'copy',
        'cut',
        '---------',
        'alignment',
      ],
      copyPaste: true,
      manualRowResize: true,
      manualColumnResize: true,
      manualRowMove: false,
      manualColumnMove: false,
      filters: true,
      dropdownMenu: [
        'filter_by_condition',
        'filter_operators',
        '---------',
        'filter_by_value',
        'filter_action_bar',
      ],
      columnSorting: {
        indicator: true,
        headerAction: true,
        sortEmptyCells: true,
      },
      search: true,
      undo: false,
      trimWhitespace: true,
    };

    return settings;
  }, [
    state.data,
    columnSettings,
    handleAfterChange,
    handleAfterRemoveRow,
    handleAfterRemoveCol,
    handleAfterCreateRow,
  ]);

  useEffect(() => {
    if (isInitialized && !isProcessingSync.current) {
      const currentUndoLength = state.undoStack.length;
      const currentRedoLength = state.redoStack.length;
      
      const isUndo = currentUndoLength < previousUndoStackLength.current && currentUndoLength > 0;
      const isRedo = currentRedoLength < previousRedoStackLength.current && currentRedoLength > 0;
      
      if (isUndo || isRedo) {
        syncDataToHotInstance();
      }
      
      previousUndoStackLength.current = currentUndoLength;
      previousRedoStackLength.current = currentRedoLength;
    }
  }, [state.undoStack.length, state.redoStack.length, isInitialized, syncDataToHotInstance]);

  if (!isInitialized || state.isLoading) {
    return (
      <div className={`spreadsheet-loading ${className}`}>
        <div className="loading-spinner"></div>
        <p>正在加载表格数据...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={`spreadsheet-error ${className}`}>
        <p className="error-message">{state.error}</p>
        <button onClick={() => loadSpreadsheet()} className="retry-button">
          重试
        </button>
      </div>
    );
  }

  if (!state.data.data || state.data.data.length === 0) {
    return (
      <div className={`spreadsheet-empty ${className}`}>
        <div className="empty-icon">📊</div>
        <h2>暂无数据</h2>
        <p>点击下方按钮创建新表格</p>
        <button onClick={() => loadSpreadsheet('new')} className="create-button">
          创建表格
        </button>
      </div>
    );
  }

  return (
    <div className={`spreadsheet-container ${className}`} id="spreadsheet-container">
      {isSaving && (
        <div className="saving-indicator">
          <span className="saving-dot"></span>
          正在保存...
        </div>
      )}
      <div className="hot-wrapper">
        {/* @ts-ignore - Handsontable React 类型定义不匹配 */}
        <HotTable ref={hotTableRef} settings={hotSettings} />
      </div>
    </div>
  );
}
