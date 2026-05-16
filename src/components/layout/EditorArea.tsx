import type { EditorAreaProps } from '@/types/layout';

export function EditorArea({ children }: EditorAreaProps) {
  return (
    <div className="flex-1 bg-[#1e1e1e] overflow-hidden">
      {children}
    </div>
  );
}

export function EditorWelcome() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-[#6e6e6e]">
      <div className="text-6xl mb-6 opacity-30">
        <svg viewBox="0 0 24 24" width="100" height="100" fill="currentColor">
          <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.08-.7-1.66-.94l-.38-2.65c-.03-.24-.24-.42-.48-.42h-4c-.24 0-.45.18-.48.42l-.38 2.65c-.58.24-1.14.55-1.66.94l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.39 1.08.7 1.66.94l.38 2.65c.03.24.24.42.48.42h4c.24 0 .45-.18.48-.42l.38-2.65c.58-.24 1.14-.55 1.66-.94l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-medium mb-2 text-[#cccccc]">Web VSCode Editor</h2>
      <p className="text-sm">打开文件或创建新项目开始编辑</p>
    </div>
  );
}
