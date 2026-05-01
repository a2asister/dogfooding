import pdfParse from 'pdf-parse';
import * as XLSX from 'xlsx';
import { Document } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class DocumentParser {
  public async parseFile(buffer: Buffer, filename: string): Promise<{ content: string; type: Document['type'] }> {
    const ext = filename.toLowerCase().split('.').pop();
    
    switch (ext) {
      case 'pdf':
        return {
          content: await this.parsePdf(buffer),
          type: 'pdf'
        };
      case 'xlsx':
      case 'xls':
      case 'csv':
        return {
          content: this.parseExcel(buffer),
          type: 'excel'
        };
      case 'js':
      case 'ts':
      case 'py':
      case 'java':
      case 'go':
      case 'rs':
      case 'c':
      case 'cpp':
      case 'html':
      case 'css':
        return {
          content: buffer.toString('utf-8'),
          type: 'code'
        };
      default:
        return {
          content: buffer.toString('utf-8'),
          type: 'text'
        };
    }
  }

  private async parsePdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error('PDF解析错误:', error);
      return buffer.toString('utf-8');
    }
  }

  private parseExcel(buffer: Buffer): string {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheets: string[] = [];
      
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        sheets.push(
          `Sheet: ${sheetName}\n` +
          jsonData.map(row => row.join('\t')).join('\n')
        );
      }
      
      return sheets.join('\n\n');
    } catch (error) {
      console.error('Excel解析错误:', error);
      return buffer.toString('utf-8');
    }
  }

  public extractTags(content: string, type: Document['type']): string[] {
    const tags: string[] = [];
    const words = content.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const wordCount: Record<string, number> = {};
    
    for (const word of words) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
    
    const stopWords = ['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'will', 'your', 'can', 'are', 'but', 'not', 'you', 'all', 'was', 'one', 'out', 'new', 'now', 'get', 'use', 'see', 'way', 'how', 'our', 'who', 'its', 'her', 'him', 'his', 'she', 'they', 'them', 'their', 'there', 'were', 'been', 'would', 'could', 'should', 'must', 'may', 'might', 'shall', 'than', 'then', 'when', 'what', 'which', 'where', 'why', 'whom', 'whose', 'those', 'these', 'such', 'some', 'any', 'each', 'every', 'both', 'neither', 'either', 'more', 'less', 'most', 'least', 'many', 'much', 'few', 'little', 'only', 'just', 'even', 'also', 'else', 'still', 'yet', 'ever', 'never', 'always', 'often', 'sometimes', 'usually', 'already', 'just', 'once', 'twice', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    
    const frequentWords = Object.entries(wordCount)
      .filter(([word, count]) => count > 2 && !stopWords.includes(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
    
    tags.push(...frequentWords);
    tags.push(type);
    
    if (type === 'code') {
      const codeTags = this.extractCodeTags(content);
      tags.push(...codeTags);
    }
    
    return [...new Set(tags)];
  }

  private extractCodeTags(content: string): string[] {
    const tags: string[] = [];
    
    if (content.includes('function') || content.includes('def') || content.includes('fn')) {
      tags.push('function');
    }
    if (content.includes('class')) {
      tags.push('class');
    }
    if (content.includes('import') || content.includes('require')) {
      tags.push('import');
    }
    if (content.includes('async') || content.includes('await') || content.includes('Promise')) {
      tags.push('async');
    }
    if (content.includes('if') || content.includes('else') || content.includes('switch')) {
      tags.push('condition');
    }
    if (content.includes('for') || content.includes('while') || content.includes('loop')) {
      tags.push('loop');
    }
    if (content.includes('try') || content.includes('catch') || content.includes('error')) {
      tags.push('error-handling');
    }
    
    return tags;
  }
}
