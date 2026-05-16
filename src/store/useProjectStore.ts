import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileItem, ProjectState, ProjectType, Language } from '../types';
import { 
  htmlTemplate, 
  cssTemplate, 
  jsTemplate, 
  generateId, 
  getLanguageFromFileName,
  getProjectTemplates
} from '../utils/templates';

const getInitialFiles = (): FileItem[] => [
  {
    id: generateId(),
    name: 'index.html',
    type: 'file',
    content: htmlTemplate,
    language: 'html',
    parentId: null,
  },
  {
    id: generateId(),
    name: 'style.css',
    type: 'file',
    content: cssTemplate,
    language: 'css',
    parentId: null,
  },
  {
    id: generateId(),
    name: 'app.js',
    type: 'file',
    content: jsTemplate,
    language: 'javascript',
    parentId: null,
  },
];

interface ProjectStore extends ProjectState {
  setActiveFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  createFile: (name: string, parentId?: string | null) => void;
  createFolder: (name: string, parentId?: string | null) => void;
  renameFile: (id: string, newName: string) => void;
  deleteFile: (id: string) => void;
  toggleFolder: (id: string) => void;
  resetProject: () => void;
  createProject: (type: ProjectType) => void;
  getActiveFile: () => FileItem | undefined;
  getFileByName: (name: string) => FileItem | undefined;
  getChildren: (parentId: string | null) => FileItem[];
  moveFile: (fileId: string, newParentId: string | null) => void;
  installedPackages: string[];
  installPackage: (name: string) => void;
  uninstallPackage: (name: string) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      files: getInitialFiles(),
      activeFileId: null,
      isDirty: false,
      lastSaved: null,
      projectType: 'vanilla' as ProjectType,
      installedPackages: [],

      setActiveFile: (id: string) => {
        set({ activeFileId: id });
      },

      updateFileContent: (id: string, content: string) => {
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id ? { ...file, content } : file
          ),
          isDirty: true,
          lastSaved: new Date(),
        }));
      },

      createFile: (name: string, parentId: string | null = null) => {
        const newFile: FileItem = {
          id: generateId(),
          name,
          type: 'file',
          content: '',
          language: getLanguageFromFileName(name),
          parentId,
        };
        set((state) => ({
          files: [...state.files, newFile],
          activeFileId: newFile.id,
          isDirty: true,
        }));
      },

      createFolder: (name: string, parentId: string | null = null) => {
        const newFolder: FileItem = {
          id: generateId(),
          name,
          type: 'folder',
          content: '',
          language: 'json' as Language,
          parentId,
          isExpanded: true,
        };
        set((state) => ({
          files: [...state.files, newFolder],
          isDirty: true,
        }));
      },

      renameFile: (id: string, newName: string) => {
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id
              ? { ...file, name: newName, language: getLanguageFromFileName(newName) }
              : file
          ),
          isDirty: true,
        }));
      },

      deleteFile: (id: string) => {
        set((state) => {
          const deleteRecursive = (fileId: string): string[] => {
            const children = state.files.filter(f => f.parentId === fileId);
            const childrenIds = children.flatMap(c => deleteRecursive(c.id));
            return [fileId, ...childrenIds];
          };
          const idsToDelete = deleteRecursive(id);
          const newFiles = state.files.filter((file) => !idsToDelete.includes(file.id));
          return {
            files: newFiles,
            activeFileId: state.activeFileId === id ? newFiles[0]?.id || null : state.activeFileId,
            isDirty: true,
          };
        });
      },

      toggleFolder: (id: string) => {
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id ? { ...file, isExpanded: !file.isExpanded } : file
          ),
        }));
      },

      resetProject: () => {
        const initialFiles = getInitialFiles();
        set({
          files: initialFiles,
          activeFileId: initialFiles[0]?.id || null,
          isDirty: false,
          lastSaved: null,
          projectType: 'vanilla',
          installedPackages: [],
        });
      },

      createProject: (type: ProjectType) => {
        const templates = getProjectTemplates(type);
        set({
          files: templates,
          activeFileId: templates[0]?.id || null,
          isDirty: false,
          lastSaved: null,
          projectType: type,
          installedPackages: [],
        });
      },

      getActiveFile: () => {
        const { files, activeFileId } = get();
        return files.find((file) => file.id === activeFileId);
      },

      getFileByName: (name: string) => {
        const { files } = get();
        return files.find((file) => file.name === name);
      },

      getChildren: (parentId: string | null) => {
        const { files } = get();
        return files.filter((file) => file.parentId === parentId);
      },

      moveFile: (fileId: string, newParentId: string | null) => {
        set((state) => ({
          files: state.files.map((file) =>
            file.id === fileId ? { ...file, parentId: newParentId } : file
          ),
          isDirty: true,
        }));
      },

      installPackage: (name: string) => {
        set((state) => ({
          installedPackages: [...state.installedPackages, name],
          isDirty: true,
        }));
      },

      uninstallPackage: (name: string) => {
        set((state) => ({
          installedPackages: state.installedPackages.filter((p) => p !== name),
          isDirty: true,
        }));
      },
    }),
    {
      name: 'webcode-project-storage',
    }
  )
);
