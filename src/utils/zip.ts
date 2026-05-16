import JSZip from 'jszip';
import type { FileItem } from '../types';

export const exportProjectAsZip = async (files: FileItem[]): Promise<void> => {
  const zip = new JSZip();
  
  files.forEach(file => {
    if (file.type === 'file') {
      zip.file(file.name, file.content);
    }
  });
  
  const content = await zip.generateAsync({ type: 'blob' });
  
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'webcode-project.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
