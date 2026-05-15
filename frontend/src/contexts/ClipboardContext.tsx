import React, { createContext, useContext, useState } from 'react';
import { FileItem } from '../types';

interface ClipboardItem {
  file: FileItem;
  operation: 'copy' | 'cut';
}

interface ClipboardContextType {
  clipboardItems: ClipboardItem[];
  copyFiles: (files: FileItem[]) => void;
  cutFiles: (files: FileItem[]) => void;
  clearClipboard: () => void;
  hasClipboardItems: () => boolean;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export const ClipboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([]);

  const copyFiles = (files: FileItem[]) => {
    setClipboardItems(files.map(file => ({ file, operation: 'copy' })));
  };

  const cutFiles = (files: FileItem[]) => {
    setClipboardItems(files.map(file => ({ file, operation: 'cut' })));
  };

  const clearClipboard = () => {
    setClipboardItems([]);
  };

  const hasClipboardItems = () => {
    return clipboardItems.length > 0;
  };

  return (
    <ClipboardContext.Provider
      value={{
        clipboardItems,
        copyFiles,
        cutFiles,
        clearClipboard,
        hasClipboardItems,
      }}
    >
      {children}
    </ClipboardContext.Provider>
  );
};

export const useClipboard = () => {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
};
