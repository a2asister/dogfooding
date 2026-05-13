import { Injectable } from '@nestjs/common';
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ProjectService } from '../project/project.service';

@Injectable()
export class AudioService {
  private readonly uploadDir: string;

  constructor(private readonly projectService: ProjectService) {
    this.uploadDir = join(process.cwd(), 'uploads', 'audio');
    mkdirSync(this.uploadDir, { recursive: true });
  }

  async uploadAudio(projectId: string, file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.split('.').pop() as string;
    const savedFilename = `${uuidv4()}.${ext}`;
    const filePath = join(this.uploadDir, savedFilename);

    await new Promise((resolve, reject) => {
      createWriteStream(filePath)
        .write(file.buffer, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        });
    });

    await this.projectService.update(projectId, { audioFile: savedFilename });
    return savedFilename;
  }

  getAudioPath(filename: string): string {
    return join(this.uploadDir, filename);
  }
}
