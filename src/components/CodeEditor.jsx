import { useRef, useEffect } from 'react';

function CodeEditor({ value, onChange, placeholder }) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  useEffect(() => {
    if (lineNumbersRef.current && textareaRef.current) {
      const lines = value.split('\n');
      const lineNumbers = lines.map((_, index) => index + 1).join('\n');
      lineNumbersRef.current.innerText = lineNumbers;
    }
  }, [value]);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="relative flex h-full bg-slate-900">
      {/* 行号区域 */}
      <div
        ref={lineNumbersRef}
        className="line-number py-4 px-3 bg-slate-900 text-slate-500 select-none overflow-auto text-sm"
        style={{ minWidth: '50px', lineHeight: '1.6' }}
      />

      {/* 代码编辑区域 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        placeholder={placeholder}
        className="code-editor flex-1 p-4 resize-none outline-none bg-transparent h-full overflow-auto"
        spellCheck={false}
        style={{ lineHeight: '1.6', tabSize: 2 }}
      />
    </div>
  );
}

export default CodeEditor;
