import * as XLSX from 'xlsx';
import { SpreadsheetData, Selection } from '../types';

export function exportToExcel(
  data: SpreadsheetData,
  selection?: Selection,
  fileName: string = 'spreadsheet.xlsx'
): void {
  let exportData: (string | number | boolean | null)[][];
  
  if (selection) {
    exportData = [];
    const startRow = Math.min(selection.startRow, selection.endRow);
    const endRow = Math.max(selection.startRow, selection.endRow);
    const startCol = Math.min(selection.startCol, selection.endCol);
    const endCol = Math.max(selection.startCol, selection.endCol);

    for (let r = startRow; r <= endRow; r++) {
      const row: (string | number | boolean | null)[] = [];
      for (let c = startCol; c <= endCol; c++) {
        row.push(data.data[r]?.[c] ?? null);
      }
      exportData.push(row);
    }
  } else {
    exportData = [...data.data];
    if (data.colHeaders && data.colHeaders.length > 0) {
      exportData.unshift([...data.colHeaders]);
    }
  }

  const worksheet = XLSX.utils.aoa_to_sheet(exportData);
  
  if (data.columnWidths) {
    worksheet['!cols'] = data.columnWidths.map(width => ({ wch: width ? width / 7 : 10 }));
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, fileName);
}

export function printSpreadsheet(elementId: string = 'spreadsheet-container'): void {
  const originalContents = document.body.innerHTML;
  const printContents = document.getElementById(elementId);
  
  if (printContents) {
    document.body.innerHTML = `<div style="padding: 20px;">${printContents.innerHTML}</div>`;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  }
}
