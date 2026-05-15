import { useState, useEffect, useRef, useCallback } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Sidebar } from './components/Sidebar';

interface OutputLine {
  type: 'command' | 'result' | 'error' | 'warning' | 'info';
  content: string;
  icon?: string;
}

interface HistoryItem {
  command: string;
  output: OutputLine[];
  path: string;
}

interface VimState {
  active: boolean;
  fileName: string;
  content: string;
  mode: 'normal' | 'insert' | 'command';
  cursorLine: number;
  cursorCol: number;
}

type AuthMode = 'login' | 'register';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [currentContext, setCurrentContext] = useState<{ type: string; id: number }>({ type: 'user', id: 0 });

  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState('/');
  const [isLoading, setIsLoading] = useState(false);
  const [completions, setCompletions] = useState<string[]>([]);
  const [theme, setTheme] = useState('dark');
  const [promptFormat, setPromptFormat] = useState('%user@%host:%path$ ');
  const [vim, setVim] = useState<VimState>({
    active: false,
    fileName: '',
    content: '',
    mode: 'normal',
    cursorLine: 0,
    cursorCol: 0,
  });
  const [vimCommand, setVimCommand] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vimContentRef = useRef<HTMLTextAreaElement>(null);
  const vimCommandRef = useRef<HTMLInputElement>(null);

  const handleLogin = useCallback((newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    setCurrentContext({ type: 'user', id: newUser.id });
    localStorage.setItem('webcli_token', newToken);
    localStorage.setItem('webcli_user', JSON.stringify(newUser));
  }, []);

  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    setHistory([]);
    setCommandHistory([]);
    localStorage.removeItem('webcli_token');
    localStorage.removeItem('webcli_user');
  }, []);

  const handleThemeChange = useCallback((newTheme: string) => {
    setTheme(newTheme);
    setUser((prev: any) => {
      if (prev) {
        const updated = { ...prev, theme: newTheme };
        localStorage.setItem('webcli_user', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('webcli_token');
    const savedUser = localStorage.getItem('webcli_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setCurrentContext({ type: 'user', id: userData.id });
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    if (!token) return;
    try {
      const [pathRes, configRes] = await Promise.all([
        fetch('http://localhost:3950/api/path', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:3950/api/config', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const pathData = await pathRes.json();
      const configData = await configRes.json();
      setCurrentPath(pathData.path);
      setTheme(configData.theme);
      setPromptFormat(configData.prompt);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      void fetchInitialData();
    }
  }, [token, fetchInitialData]);

  useEffect(() => {
    const themeName = theme.startsWith('{') ? 'dark' : theme;
    document.body.className = `theme-${themeName}`;
  }, [theme]);

  useEffect(() => {
    if (!vim.active) {
      inputRef.current?.focus();
    }
  }, [vim.active]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (vim.active && vim.mode === 'command') {
      vimCommandRef.current?.focus();
    }
  }, [vim.active, vim.mode]);

  const executeCommand = async (cmd: string) => {
    if (vim.active || !token) return;

    if (cmd.startsWith('vim ')) {
      const fileName = cmd.substring(4).trim();
      const exists = await checkFileExists(fileName);
      const content = exists ? await readFileContent(fileName) : '';
      setVim({
        active: true,
        fileName,
        content: content || '',
        mode: 'normal',
        cursorLine: 0,
        cursorCol: 0,
      });
      return;
    }

    if (cmd.startsWith('export ')) {
      const fileName = cmd.substring(7).trim();
      void exportFile(fileName);
      return;
    }

    if (cmd === 'import') {
      fileInputRef.current?.click();
      return;
    }

    if (cmd.trim()) {
      setCommandHistory((prev) => [...prev, cmd]);
    }
    setHistoryIndex(-1);
    setIsLoading(true);
    setCompletions([]);

    try {
      const response = await fetch('http://localhost:3950/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          command: cmd,
          contextType: currentContext.type,
          contextId: currentContext.id,
        }),
      });
      const data = (await response.json()) as {
        output: OutputLine[];
        path: string;
        clear?: boolean;
      };

      if (data.clear) {
        setHistory([]);
      } else {
        setHistory((prev) => [
          ...prev,
          {
            command: cmd,
            output: data.output,
            path: currentPath,
          },
        ]);
      }

      setCurrentPath(data.path);

      if (cmd.startsWith('theme') || cmd.startsWith('prompt')) {
        const configRes = await fetch('http://localhost:3950/api/config', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const configData = (await configRes.json()) as { theme: string; prompt: string };
        setTheme(configData.theme);
        setPromptFormat(configData.prompt);
      }
    } catch (error) {
      setHistory((prev) => [
        ...prev,
        {
          command: cmd,
          output: [{ type: 'error', content: 'Error: Failed to execute command' }],
          path: currentPath,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFileExists = async (fileName: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch('http://localhost:3950/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          command: `cat ${fileName}`,
          contextType: currentContext.type,
          contextId: currentContext.id,
        }),
      });
      const data = (await response.json()) as { output: OutputLine[] };
      return !data.output.some((o) => o.type === 'error');
    } catch {
      return false;
    }
  };

  const readFileContent = async (fileName: string): Promise<string | null> => {
    if (!token) return null;
    try {
      const response = await fetch('http://localhost:3950/api/file/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: fileName,
          contextType: currentContext.type,
          contextId: currentContext.id,
        }),
      });
      if (!response.ok) {
        return null;
      }
      const data = (await response.json()) as { content: string };
      return data.content;
    } catch {
      return null;
    }
  };

  const exportFile = async (fileName: string) => {
    const content = await readFileContent(fileName);
    if (!content) {
      setHistory((prev) => [
        ...prev,
        {
          command: `export ${fileName}`,
          output: [{ type: 'error', content: `File '${fileName}' not found` }],
          path: currentPath,
        },
      ]);
      return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setHistory((prev) => [
      ...prev,
      {
        command: `export ${fileName}`,
        output: [{ type: 'result', content: `File '${fileName}' exported successfully` }],
        path: currentPath,
      },
    ]);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const content = await file.text();
    const fileName = file.name;

    try {
      await fetch('http://localhost:3950/api/file/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: fileName,
          content,
          contextType: currentContext.type,
          contextId: currentContext.id,
        }),
      });

      setHistory((prev) => [
        ...prev,
        {
          command: `import ${fileName}`,
          output: [{ type: 'result', content: `File '${fileName}' imported successfully` }],
          path: currentPath,
        },
      ]);
    } catch (error) {
      setHistory((prev) => [
        ...prev,
        {
          command: `import ${fileName}`,
          output: [{ type: 'error', content: 'Failed to import file' }],
          path: currentPath,
        },
      ]);
    }

    e.target.value = '';
  };

  const handleVimContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (vim.mode !== 'insert') return;
    setVim((prev) => ({ ...prev, content: e.target.value }));
  };

  const handleVimKeyDown = (e: React.KeyboardEvent) => {
    if (vim.mode === 'insert') {
      if (e.key === 'Escape') {
        e.preventDefault();
        setVim((prev) => ({ ...prev, mode: 'normal' }));
      }
      return;
    }

    if (vim.mode === 'command') {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (vimCommand === 'w' || vimCommand === 'wq') {
          void saveVimFile();
        }
        if (vimCommand === 'q' || vimCommand === 'wq' || vimCommand === 'q!') {
          setVim((prev) => ({ ...prev, active: false, mode: 'normal' }));
          setVimCommand('');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setVim((prev) => ({ ...prev, mode: 'normal' }));
        setVimCommand('');
      }
      return;
    }

    e.preventDefault();
    switch (e.key) {
      case 'i':
        setVim((prev) => ({ ...prev, mode: 'insert' }));
        break;
      case ':':
        setVim((prev) => ({ ...prev, mode: 'command' }));
        setVimCommand('');
        break;
      case 'h':
      case 'ArrowLeft':
        setVim((prev) => ({ ...prev, cursorCol: Math.max(0, prev.cursorCol - 1) }));
        break;
      case 'l':
      case 'ArrowRight':
        setVim((prev) => ({ ...prev, cursorCol: prev.cursorCol + 1 }));
        break;
      case 'j':
      case 'ArrowDown':
        setVim((prev) => ({ ...prev, cursorLine: prev.cursorLine + 1 }));
        break;
      case 'k':
      case 'ArrowUp':
        setVim((prev) => ({ ...prev, cursorLine: Math.max(0, prev.cursorLine - 1) }));
        break;
    }
  };

  const saveVimFile = async () => {
    if (!token) return;
    try {
      await fetch('http://localhost:3950/api/file/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: vim.fileName,
          content: vim.content,
          contextType: currentContext.type,
          contextId: currentContext.id,
        }),
      });
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  const fetchCompletions = useCallback(
    async (partial: string) => {
      if (!partial || !token) {
        setCompletions([]);
        return;
      }
      try {
        const response = await fetch('http://localhost:3950/api/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            partial,
            path: currentPath,
            contextType: currentContext.type,
            contextId: currentContext.id,
          }),
        });
        const data = (await response.json()) as { completions?: string[] };
        setCompletions(data.completions || []);
      } catch (error) {
        setCompletions([]);
      }
    },
    [token, currentPath, currentContext]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const lastWord = input.split(' ').pop() || '';
      void fetchCompletions(lastWord);
    }, 150);
    return () => clearTimeout(timer);
  }, [input, fetchCompletions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setInput('');
      setIsLoading(false);
      return;
    }

    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      setInput('');
      return;
    }

    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      e.currentTarget.setSelectionRange(0, 0);
      return;
    }

    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
      return;
    }

    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistory([]);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (completions.length === 1) {
        const parts = input.split(' ');
        parts[parts.length - 1] = completions[0];
        setInput(parts.join(' '));
        setCompletions([]);
      } else if (completions.length > 1) {
        const commonPrefix = completions.reduce((a, b) => {
          let i = 0;
          while (a[i] && b[i] && a[i] === b[i]) i++;
          return a.slice(0, i);
        });
        if (commonPrefix) {
          const parts = input.split(' ');
          const lastPart = parts[parts.length - 1] || '';
          parts[parts.length - 1] = lastPart + commonPrefix.slice(lastPart.length);
          setInput(parts.join(' '));
        }
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = input;
      setInput('');
      void executeCommand(cmd);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const formatPrompt = (path: string): string => {
    const displayPath = path === '/' ? '~' : path;
    const now = new Date();
    const time = now.toTimeString().slice(0, 8);
    const date = now.toLocaleDateString();

    return promptFormat
      .replace(/%user/g, user?.username?.slice(0, 8) || 'user')
      .replace(/%host/g, currentContext.type === 'team' ? 'team' : 'webcli')
      .replace(/%path/g, displayPath)
      .replace(/%time/g, time)
      .replace(/%date/g, date);
  };

  const getOutputLineClass = (type: string) => {
    return `output-line output-${type}`;
  };

  const getThemeClass = () => {
    if (theme.startsWith('{')) {
      return 'theme-dark';
    }
    return `theme-${theme}`;
  };

  if (!token || !user) {
    return authMode === 'login' ? (
      <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <Register onRegister={handleLogin} onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  if (vim.active) {
    return (
      <div className="app-layout">
        <Sidebar
          user={user}
          token={token}
          onLogout={handleLogout}
          currentContext={currentContext}
          onContextChange={setCurrentContext}
          onThemeChange={handleThemeChange}
        />
        <div className={`vim-editor ${getThemeClass()}`}>
          <div className="vim-header">
            <span>{vim.fileName} - {vim.mode.toUpperCase()} MODE</span>
            <span>Lines: {vim.content.split('\n').length}</span>
          </div>
          <textarea
            ref={vimContentRef}
            className="vim-content"
            value={vim.content}
            onChange={handleVimContentChange}
            onKeyDown={handleVimKeyDown}
            readOnly={vim.mode !== 'insert'}
            autoFocus
          />
          <div className="vim-footer">
            {vim.mode === 'command' ? (
              <>
                <span>:</span>
                <input
                  ref={vimCommandRef}
                  className="vim-input"
                  value={vimCommand}
                  onChange={(e) => setVimCommand(e.target.value)}
                  onKeyDown={handleVimKeyDown}
                  autoFocus
                />
              </>
            ) : (
              <span style={{ opacity: 0.6 }}>
                {vim.mode === 'normal' ? 'Press : for command, i for insert' : 'Press ESC to exit insert mode'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        token={token}
        onLogout={handleLogout}
        currentContext={currentContext}
        onContextChange={setCurrentContext}
        onThemeChange={handleThemeChange}
      />
      <div className={`terminal ${getThemeClass()}`}>
        <label className="file-upload-zone">
          📁 Import File
          <input
            ref={fileInputRef}
            type="file"
            className="hidden-input"
            onChange={handleFileImport}
          />
        </label>

        <div className="output-panel" ref={outputRef}>
          {history.map((item, index) => (
            <div key={index}>
              <div className="output-line output-command">
                <span className="prompt">{formatPrompt(item.path)} </span>
                {item.command}
              </div>
              {item.output.map((line, lineIndex) => (
                <div key={lineIndex} className={getOutputLineClass(line.type)}>
                  {line.icon && <span className="line-icon">{line.icon}</span>}
                  {line.content}
                </div>
              ))}
            </div>
          ))}
          {isLoading && (
            <div className="output-line output-loading">
              <span className="spinner">⟳</span> Executing...
            </div>
          )}
        </div>

        {(completions || []).length > 0 && (
          <div className="completions-panel">
            {(completions || []).map((comp, index) => (
              <span
                key={index}
                className="completion-item"
                onClick={() => {
                  const parts = input.split(' ');
                  parts[parts.length - 1] = comp;
                  setInput(parts.join(' '));
                  setCompletions([]);
                  inputRef.current?.focus();
                }}
              >
                {comp}
              </span>
            ))}
          </div>
        )}

        <div className="input-line">
          <span className="prompt">{formatPrompt(currentPath)}</span>
          <input
            ref={inputRef}
            type="text"
            className="command-input"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
