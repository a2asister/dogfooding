import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import { DataSeries } from '../entities/data-series.entity';

@Injectable()
export class ReportService {
  async generateExcelReport(series: DataSeries[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Report');

    worksheet.columns = [
      { header: 'Series Name', key: 'seriesName', width: 20 },
      { header: 'X', key: 'x', width: 15 },
      { header: 'Y', key: 'y', width: 15 },
      { header: 'Inflection', key: 'isInflection', width: 10 },
      { header: 'Peak', key: 'isPeak', width: 10 },
      { header: 'Outlier', key: 'isOutlier', width: 10 },
    ];

    series.forEach((s) => {
      s.points.forEach((p) => {
        worksheet.addRow({
          seriesName: s.name,
          x: p.x,
          y: p.y,
          isInflection: p.isInflection ? 'Yes' : 'No',
          isPeak: p.isPeak ? 'Yes' : 'No',
          isOutlier: p.isOutlier ? 'Yes' : 'No',
        });
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generatePDFReport(series: DataSeries[]): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', (buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text('Data Visualization Report', { align: 'center' });
      doc.moveDown();

      series.forEach((s, index) => {
        doc.fontSize(14).text(`${index + 1}. ${s.name}`);
        doc.fontSize(10).text(`Formula: ${s.formula || 'N/A'}`);
        doc.text(`Total Points: ${s.points.length}`);

        const stats = this.calculateStats(s.points);
        doc.text(`Min Y: ${stats.minY.toFixed(4)}`);
        doc.text(`Max Y: ${stats.maxY.toFixed(4)}`);
        doc.text(`Avg Y: ${stats.avgY.toFixed(4)}`);
        doc.moveDown();
      });

      doc.end();
    });
  }

  private calculateStats(points: DataSeries['points']) {
    const yValues = points.map((p) => p.y);
    return {
      minY: Math.min(...yValues),
      maxY: Math.max(...yValues),
      avgY: yValues.reduce((a, b) => a + b, 0) / yValues.length,
    };
  }
}
