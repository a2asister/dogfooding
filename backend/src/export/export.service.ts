import { Injectable } from '@nestjs/common';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExportService {
  private readonly exportDir: string;

  constructor() {
    this.exportDir = join(process.cwd(), 'exports');
    mkdirSync(this.exportDir, { recursive: true });
  }

  async exportProject(projectId: string, format: string = 'mp4'): Promise<string> {
    const filename = `${projectId}_${uuidv4()}.${format}`;
    const filePath = join(this.exportDir, filename);
    
    const mockData = {
      projectId,
      exportDate: new Date().toISOString(),
      format,
      status: 'completed',
    };
    
    writeFileSync(filePath, JSON.stringify(mockData, null, 2));
    
    return filename;
  }

  getExportPath(filename: string): string {
    return join(this.exportDir, filename);
  }
}
