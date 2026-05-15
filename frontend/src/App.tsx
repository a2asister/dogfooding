import { useState, useEffect, useRef, useCallback } from 'react';

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

function App() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState('/');
  const [isLoading, setIsLoading] = useState(false);
  const [completions, setCompletions] = useState<string[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchInitialPath = useCallback(async () => {
    try {
      const response = await fetch('/api/path');
      const data = await response.json() as { path: string };
      setCurrentPath(data.path);
    } catch (error) {
      console.error('Failed to fetch path:', error);
    }
  }, []);

  useEffect(() => {
    void fetchInitialPath();
  }, [fetchInitialPath]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClick = () => {
      inputRef.current?.focus();
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = async (cmd: string) => {
    if (cmd.trim()) {
      setCommandHistory(prev => [...prev, cmd]);
    }
    setHistoryIndex(-1);
    setIsLoading(true);
    setCompletions([]);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await response.json() as { output: OutputLine[]; path: string; clear?: boolean };
      
      if (data.clear) {
        setHistory([]);
      } else {
        setHistory(prev => [...prev, {
          command: cmd,
          output: data.output,
          path: currentPath,
        }]);
      }
      
      setCurrentPath(data.path);
    } catch (error) {
      setHistory(prev => [...prev, {
        command: cmd,
        output: [{ type: 'error', content: 'Error: Failed to execute command' }],
        path: currentPath,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompletions = useCallback(async (partial: string) => {
    if (!partial) {
      setCompletions([]);
      return;
    }
    try {
      const response = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partial, path: currentPath }),
      });
      const data = await response.json() as { completions: string[] };
      setCompletions(data.completions);
    } catch (error) {
      setCompletions([]);
    }
  }, [currentPath]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const lastWord = input.split(' ').pop() || '';
      void fetchCompletions(lastWord);
    }, 150);
    return () => clearTimeout(timer);
  }, [input, fetchCompletions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const getPrompt = (path: string) => {
    const displayPath = path === '/' ? '~' : path;
    return `root@web-cli:${displayPath}$`;
  };

  const getOutputLineClass = (type: string) => {
    return `output-line output-${type}`;
  };

  return (
    <div className="terminal">
      <div className="output-panel" ref={outputRef}>
        {history.map((item, index) => (
          <div key={index}>
            <div className="output-line output-command">
              <span className="prompt">{getPrompt(item.path)} </span>
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
      
      {completions.length > 0 && (
        <div className="completions-panel">
          {completions.map((comp, index) => (
            <span key={index} className="completion-item">{comp}</span>
          ))}
        </div>
      )}
      
      <div className="input-line">
        <span className="prompt">{getPrompt(currentPath)}</span>
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
  );
}

export default App;
