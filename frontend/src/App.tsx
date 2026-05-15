import { useState, useEffect, useRef, useCallback } from 'react';

interface HistoryItem {
  command: string;
  output: string;
  path: string;
}

function App() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
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
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await response.json() as { output: string; path: string; clear?: boolean };
      
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
        output: 'Error: Failed to execute command',
        path: currentPath,
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = input;
      setInput('');
      void executeCommand(cmd);
    } else if (e.key === 'Backspace') {
      setInput(prev => prev.slice(0, -1));
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const getPrompt = (path: string) => {
    const displayPath = path === '/' ? '~' : path;
    return `root@web-cli:${displayPath}$`;
  };

  return (
    <div className="terminal">
      <div className="output-panel" ref={outputRef}>
        {history.map((item, index) => (
          <div key={index}>
            <div className="output-line">
              <span className="prompt">{getPrompt(item.path)} </span>
              {item.command}
            </div>
            {item.output && (
              <div className="output-line">{item.output}</div>
            )}
          </div>
        ))}
      </div>
      
      <div className="input-line">
        <span className="prompt">{getPrompt(currentPath)}</span>
        <div className="input-wrapper">
          <span className="input-text">
            {input}
            <span className="cursor" />
          </span>
          <input
            ref={inputRef}
            type="text"
            className="hidden-input"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

export default App;
