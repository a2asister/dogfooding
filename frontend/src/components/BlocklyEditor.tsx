import { useEffect, useRef, useState, useCallback } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { initCustomBlocks } from '../blockly/blocks/customBlocks';
import { initJavascriptGenerator } from '../blockly/generators/javascriptGenerator';
import { initPythonGenerator } from '../blockly/generators/pythonGenerator';
import { initTheme, blocklyOptions } from '../blockly/theme';
import { getToolbox } from '../blockly/toolbox';
import { createCodeRunner, CodeRunner } from '../blockly/runtime/codeRunner';
import 'blockly/blockly.css';

interface BlocklyEditorProps {
  level?: 'beginner' | 'basic' | 'advanced';
  initialXml?: string;
  onCodeChange?: (code: string) => void;
  onBlocksChange?: (xml: string) => void;
  readOnly?: boolean;
}

export const BlocklyEditor = ({
  level = 'basic',
  initialXml,
  onCodeChange,
  onBlocksChange,
  readOnly = false,
}: BlocklyEditorProps) => {
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const codeRunnerRef = useRef<CodeRunner | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [codeLanguage, setCodeLanguage] = useState<'javascript' | 'python'>('javascript');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initCustomBlocks();
    initJavascriptGenerator();
    initPythonGenerator();
    initTheme();
  }, []);

  useEffect(() => {
    if (!blocklyDivRef.current) return;

    const toolbox = getToolbox(level);
    
    workspaceRef.current = Blockly.inject(blocklyDivRef.current, {
      ...blocklyOptions,
      toolbox,
      readOnly,
    });

    if (initialXml) {
      try {
        const xml = Blockly.utils.xml.textToDom(initialXml);
        Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
      } catch (err) {
        console.error('Failed to load blocks:', err);
      }
    }

    const handleChange = () => {
      if (workspaceRef.current) {
        const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
        const xmlText = Blockly.Xml.domToText(xml);
        onBlocksChange?.(xmlText);

        const code = codeLanguage === 'javascript'
          ? javascriptGenerator.workspaceToCode(workspaceRef.current)
          : pythonGenerator.workspaceToCode(workspaceRef.current);
        onCodeChange?.(code);
      }
    };

    workspaceRef.current.addChangeListener(handleChange);
    handleChange();

    return () => {
      workspaceRef.current?.dispose();
    };
  }, [level, readOnly]);

  useEffect(() => {
    if (workspaceRef.current) {
      const code = codeLanguage === 'javascript'
        ? javascriptGenerator.workspaceToCode(workspaceRef.current)
        : pythonGenerator.workspaceToCode(workspaceRef.current);
      onCodeChange?.(code);
    }
  }, [codeLanguage]);

  const getCurrentCode = useCallback(() => {
    if (!workspaceRef.current) return '';
    return javascriptGenerator.workspaceToCode(workspaceRef.current);
  }, []);

  const runCode = async () => {
    if (!workspaceRef.current) return;

    const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
    setLogs([]);
    setError(null);
    setIsRunning(true);
    setIsPaused(false);

    codeRunnerRef.current = createCodeRunner({
      canvas: canvasRef.current || undefined,
      onLog: (msg) => setLogs((prev) => [...prev, msg]),
      onError: (err) => setError(err),
      onComplete: () => setIsRunning(false),
    });

    await codeRunnerRef.current.run(code);
  };

  const pauseCode = () => {
    codeRunnerRef.current?.pause();
    setIsPaused(true);
  };

  const resumeCode = () => {
    codeRunnerRef.current?.resume();
    setIsPaused(false);
  };

  const stopCode = () => {
    codeRunnerRef.current?.stop();
    setIsRunning(false);
    setIsPaused(false);
  };

  const resetWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
    }
  };

  const getWorkspaceXml = () => {
    if (!workspaceRef.current) return '';
    const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
    return Blockly.Xml.domToText(xml);
  };

  const loadWorkspaceXml = (xmlText: string) => {
    if (!workspaceRef.current) return;
    try {
      const xml = Blockly.utils.xml.textToDom(xmlText);
      workspaceRef.current.clear();
      Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
    } catch (err) {
      console.error('Failed to load blocks:', err);
    }
  };

  return (
    <div className="blockly-editor flex flex-col h-full">
      <div className="editor-toolbar flex items-center gap-2 p-3 bg-gray-50 border-b">
        <button
          onClick={runCode}
          disabled={isRunning && !isPaused}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 flex items-center gap-1"
        >
          ▶️ 运行
        </button>
        {isRunning && (
          <>
            {isPaused ? (
              <button
                onClick={resumeCode}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
              >
                ▶️ 继续
              </button>
            ) : (
              <button
                onClick={pauseCode}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center gap-1"
              >
                ⏸️ 暂停
              </button>
            )}
            <button
              onClick={stopCode}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
            >
              ⏹️ 停止
            </button>
          </>
        )}
        <button
          onClick={resetWorkspace}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-1"
        >
          🔄 重置
        </button>
        <select
          value={codeLanguage}
          onChange={(e) => setCodeLanguage(e.target.value as 'javascript' | 'python')}
          className="px-3 py-2 border rounded ml-auto"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>

      <div className="editor-content flex flex-1 overflow-hidden">
        <div className="blockly-workspace flex-1" ref={blocklyDivRef} />
        
        <div className="output-panel w-80 border-l flex flex-col">
          <div className="tabs flex border-b">
            <button className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 font-medium">
              📤 输出
            </button>
            {level === 'advanced' && (
              <button className="flex-1 py-2 px-4 hover:bg-gray-50">
                🐢 画布
              </button>
            )}
          </div>
          
          <div className="output-content flex-1 overflow-y-auto p-3 bg-gray-900 text-green-400 font-mono text-sm">
            {logs.length === 0 && !error ? (
              <div className="text-gray-500">运行代码后输出将显示在这里...</div>
            ) : (
              <>
                {logs.map((log, idx) => (
                  <div key={idx} className="mb-1">{log}</div>
                ))}
                {error && (
                  <div className="text-red-400 mt-2">❌ 错误: {error}</div>
                )}
              </>
            )}
          </div>
          
          {level === 'advanced' && (
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="border-t bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BlocklyEditor;
