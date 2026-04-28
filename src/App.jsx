import React, { useState, useEffect, useRef, useCallback } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import htmlTags from 'html-tags';
import htmlAttributes from 'html-attributes';
import cssProperties from 'css-properties';

// 默认HTML模板
const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>示例页面</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>欢迎使用 HTML 实时编辑器</h1>
        <p>在左侧编辑代码，右侧实时预览效果！</p>
        <button onclick="alert('Hello World!')">点击我</button>
    </div>
</body>
</html>`;

// 智能提示数据源
const AUTOCOMPLETE_DATA = {
  tags: htmlTags.map(tag => ({ label: tag, type: 'tag' })),
  attributes: Object.keys(htmlAttributes).map(attr => ({ label: attr, type: 'attribute' })),
  cssProperties: cssProperties.map(prop => ({ label: prop, type: 'css' }))
};

// HTML 格式化函数 - 智能处理嵌套和缩进
const formatHTML = (html) => {
  if (!html.trim()) return html;

  // 块级元素 - 这些元素应该独占一行
  const blockElements = [
    'html', 'head', 'body', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'table', 'thead', 'tbody', 'tfoot',
    'tr', 'th', 'td', 'form', 'fieldset', 'legend', 'pre', 'blockquote',
    'address', 'article', 'aside', 'details', 'figcaption', 'figure',
    'footer', 'header', 'main', 'menu', 'nav', 'section', 'summary',
    'script', 'style', 'noscript', 'template'
  ];

  // 自闭合标签
  const selfClosingTags = [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ];

  // 解析 HTML 为 tokens
  const tokens = [];
  let i = 0;
  
  while (i < html.length) {
    // 跳过空白字符
    if (/\s/.test(html[i])) {
      // 收集连续的空白字符
      let whitespace = '';
      while (i < html.length && /\s/.test(html[i])) {
        whitespace += html[i];
        i++;
      }
      // 只保留单个空格（除非是在文本中间）
      if (tokens.length > 0 && tokens[tokens.length - 1].type === 'text') {
        tokens.push({ type: 'whitespace', value: ' ' });
      }
      continue;
    }

    // 处理标签
    if (html[i] === '<') {
      const tagStart = i;
      
      // 检查是否是注释
      if (html.substring(i, i + 4) === '<!--') {
        // 查找注释结束
        const commentEnd = html.indexOf('-->', i);
        if (commentEnd !== -1) {
          tokens.push({
            type: 'comment',
            value: html.substring(i, commentEnd + 3)
          });
          i = commentEnd + 3;
          continue;
        }
      }
      
      // 检查是否是 DOCTYPE
      if (html.substring(i, i + 9).toUpperCase() === '<!DOCTYPE') {
        const doctypeEnd = html.indexOf('>', i);
        if (doctypeEnd !== -1) {
          tokens.push({
            type: 'doctype',
            value: html.substring(i, doctypeEnd + 1)
          });
          i = doctypeEnd + 1;
          continue;
        }
      }
      
      // 检查是否是 CDATA
      if (html.substring(i, i + 9) === '<![CDATA[') {
        const cdataEnd = html.indexOf(']]>', i);
        if (cdataEnd !== -1) {
          tokens.push({
            type: 'cdata',
            value: html.substring(i, cdataEnd + 3)
          });
          i = cdataEnd + 3;
          continue;
        }
      }
      
      // 查找标签结束
      while (i < html.length && html[i] !== '>') {
        i++;
      }
      
      if (i < html.length) {
        i++; // 包含 '>'
        const tagContent = html.substring(tagStart, i);
        
        // 解析标签类型
        let tagType = 'start';
        let tagName = '';
        
        // 检查是否是结束标签
        if (tagContent.startsWith('</')) {
          tagType = 'end';
          const nameMatch = tagContent.match(/^<\/(\w+)/);
          if (nameMatch) tagName = nameMatch[1].toLowerCase();
        }
        // 检查是否是自闭合标签
        else if (tagContent.endsWith('/>')) {
          tagType = 'self-closing';
          const nameMatch = tagContent.match(/^<(\w+)/);
          if (nameMatch) tagName = nameMatch[1].toLowerCase();
        }
        // 开始标签
        else {
          const nameMatch = tagContent.match(/^<(\w+)/);
          if (nameMatch) {
            tagName = nameMatch[1].toLowerCase();
            // 检查是否是已知的自闭合标签
            if (selfClosingTags.includes(tagName)) {
              tagType = 'self-closing';
            }
          }
        }
        
        tokens.push({
          type: 'tag',
          tagType,
          tagName,
          value: tagContent
        });
      }
      continue;
    }

    // 处理文本内容
    let textStart = i;
    while (i < html.length && html[i] !== '<' && !/\s/.test(html[i])) {
      i++;
    }
    
    // 如果是空白字符开头，我们已经在上面处理了
    if (textStart < i) {
      // 检查是否只有空白
      const text = html.substring(textStart, i);
      if (text.trim()) {
        tokens.push({
          type: 'text',
          value: text
        });
      }
    }
  }

  // 现在根据 tokens 生成格式化的 HTML
  let result = '';
  let indentLevel = 0;
  const tab = '  ';
  let lineHasContent = false;
  let currentLineText = '';

  // 辅助函数：添加新行并缩进
  const addNewLine = () => {
    if (lineHasContent) {
      result += currentLineText.trimEnd() + '\n';
      currentLineText = '';
      lineHasContent = false;
    }
  };

  // 辅助函数：添加缩进
  const addIndent = () => {
    if (!lineHasContent) {
      currentLineText = tab.repeat(indentLevel);
    }
  };

  // 辅助函数：添加内容到当前行
  const addToLine = (content) => {
    addIndent();
    currentLineText += content;
    lineHasContent = true;
  };

  tokens.forEach((token, index) => {
    const nextToken = tokens[index + 1];
    const prevToken = tokens[index - 1];

    switch (token.type) {
      case 'doctype':
        addNewLine();
        addToLine(token.value);
        addNewLine();
        break;

      case 'comment':
        addNewLine();
        addToLine(token.value);
        addNewLine();
        break;

      case 'cdata':
        addNewLine();
        addToLine(token.value);
        addNewLine();
        break;

      case 'text':
        // 文本内容直接添加到当前行
        addToLine(token.value);
        break;

      case 'whitespace':
        // 空白字符 - 只在文本之间添加
        if (lineHasContent && currentLineText.trim()) {
          addToLine(' ');
        }
        break;

      case 'tag':
        if (token.tagType === 'start') {
          const isBlock = blockElements.includes(token.tagName);
          
          if (isBlock) {
            // 块级元素 - 新行开始
            addNewLine();
            addToLine(token.value);
            
            // 检查下一个 token 是否是文本或内联元素
            const nextIsText = nextToken && (nextToken.type === 'text');
            const nextIsInline = nextToken && nextToken.type === 'tag' && 
              !blockElements.includes(nextToken.tagName) && 
              nextToken.tagType === 'start';
            
            if (!nextIsText && !nextIsInline) {
              addNewLine();
            }
            
            indentLevel++;
          } else {
            // 内联元素 - 直接添加到当前行
            addToLine(token.value);
            
            // 检查是否是简单的内联标签（如 <span>text</span>）
            const nextIsText = nextToken && nextToken.type === 'text';
            const nextIsMatchingEnd = nextToken && nextToken.type === 'tag' && 
              nextToken.tagType === 'end' && nextToken.tagName === token.tagName;
            
            if (!nextIsText && !nextIsMatchingEnd) {
              indentLevel++;
            }
          }
        } else if (token.tagType === 'end') {
          const isBlock = blockElements.includes(token.tagName);
          
          if (isBlock) {
            indentLevel = Math.max(0, indentLevel - 1);
            addNewLine();
            addToLine(token.value);
            addNewLine();
          } else {
            // 检查前一个 token 是否是文本
            const prevIsText = prevToken && prevToken.type === 'text';
            
            if (!prevIsText) {
              indentLevel = Math.max(0, indentLevel - 1);
            }
            
            addToLine(token.value);
          }
        } else if (token.tagType === 'self-closing') {
          const isBlock = blockElements.includes(token.tagName);
          
          if (isBlock) {
            addNewLine();
            addToLine(token.value);
            addNewLine();
          } else {
            addToLine(token.value);
          }
        }
        break;
    }
  });

  // 添加最后一行
  if (lineHasContent) {
    result += currentLineText.trimEnd() + '\n';
  }

  // 清理多余的空行
  result = result.replace(/\n{3,}/g, '\n\n');
  
  // 确保最后没有多余的换行
  return result.trim();
};

function App() {
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem('html-editor-code');
    return saved || DEFAULT_HTML;
  });
  const [leftWidth, setLeftWidth] = useState(50);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [autocomplete, setAutocomplete] = useState({
    visible: false,
    items: [],
    selectedIndex: 0,
    position: { top: 0, left: 0 }
  });

  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const dragRef = useRef(null);

  // 同步滚动
  const syncScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // 本地缓存和滚动同步
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('html-editor-code', code);
    }, 1000);
    
    // 确保在代码更新时滚动位置同步
    // 使用 requestAnimationFrame 确保 DOM 更新后再同步
    const rafId = requestAnimationFrame(() => {
      syncScroll();
    });
    
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
    };
  }, [code, syncScroll]);

  // 实时预览 - 使用 srcdoc 来确保 script 执行
  useEffect(() => {
    try {
      // 尝试解析 HTML 来检查基本语法
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');
      const parserErrors = doc.querySelector('parsererror');
      
      if (parserErrors) {
        const lineNum = findErrorLine(code, parserErrors.textContent);
        setError({
          message: 'HTML 解析错误',
          line: lineNum
        });
      } else {
        setError(null);
      }
    } catch (err) {
      const lineNum = findErrorLine(code, err.message);
      setError({
        message: err.message,
        line: lineNum
      });
    }
  }, [code]);

  // 查找错误行号
  const findErrorLine = (html, errorMessage) => {
    const lines = html.split('\n');
    let lineNum = 1;
    
    // 简单的错误行号查找逻辑
    for (let i = 0; i < lines.length; i++) {
      // 检查未闭合的标签
      if (lines[i].includes('<') && !lines[i].includes('>')) {
        return i + 1;
      }
      // 检查未闭合的引号
      const quotes = (lines[i].match(/"/g) || []).length;
      if (quotes % 2 !== 0) {
        return i + 1;
      }
    }
    
    // 检查整体标签匹配
    const tagStack = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const openTags = line.match(/<(\w+)/g) || [];
      const closeTags = line.match(/<\/(\w+)/g) || [];
      
      openTags.forEach(tag => {
        tagStack.push(tag.slice(1));
      });
      
      closeTags.forEach(tag => {
        const tagName = tag.slice(2);
        if (tagStack.length > 0 && tagStack[tagStack.length - 1] === tagName) {
          tagStack.pop();
        } else if (tagStack.length > 0) {
          return i + 1;
        }
      });
    }
    
    return lineNum;
  };

  // 代码格式化
  const formatCode = useCallback(() => {
    const formatted = formatHTML(code);
    setCode(formatted);
  }, [code]);

  // 复制代码
  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      // 可以添加复制成功的提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, [code]);

  // 清空代码
  const clearCode = useCallback(() => {
    if (confirm('确定要清空所有代码吗？')) {
      setCode('');
    }
  }, []);

  // 拖拽调整宽度
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const container = editorRef.current?.parentElement;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      
      // 限制宽度范围
      const clampedWidth = Math.max(20, Math.min(80, newWidth));
      setLeftWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // 自动缩进
  const handleAutoIndent = useCallback((e) => {
    const textarea = e.target;
    const { selectionStart, selectionEnd, value } = textarea;
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const newValue = value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd);
      setCode(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;
        syncScroll();
      }, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const currentLine = value.substring(0, selectionStart).split('\n').pop();
      const indent = currentLine.match(/^(\s*)/)[1];
      const currentChar = value[selectionStart - 1];
      const nextChar = value[selectionStart];
      
      let extraIndent = '';
      if (currentChar === '>' && nextChar === '<') {
        extraIndent = '  ';
      }
      
      const newValue = value.substring(0, selectionStart) + '\n' + indent + extraIndent + value.substring(selectionEnd);
      setCode(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + indent.length + extraIndent.length;
        syncScroll();
      }, 0);
    }
  }, [syncScroll]);

  // 计算光标在 textarea 中的像素位置
  const getCaretCoordinates = useCallback((textarea, position) => {
    const lineHeight = 21;
    const charWidth = 8.4;
    const padding = 16;
    
    const textBeforeCursor = textarea.value.substring(0, position);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length - 1;
    const currentLineText = lines[currentLine];
    
    // 计算像素位置
    const top = currentLine * lineHeight + padding;
    const left = currentLineText.length * charWidth + padding;
    
    return {
      top,
      left,
      currentLine,
      scrollTop: textarea.scrollTop,
      scrollLeft: textarea.scrollLeft
    };
  }, []);

  // 自动补全
  const handleAutocomplete = useCallback((e) => {
    const textarea = e.target;
    const { selectionStart, value } = textarea;
    
    // 获取当前输入的单词
    const beforeCursor = value.substring(0, selectionStart);
    const match = beforeCursor.match(/([a-zA-Z0-9-]+)$/);
    
    if (!match) {
      setAutocomplete(prev => ({ ...prev, visible: false }));
      return;
    }
    
    const word = match[1];
    const wordStart = selectionStart - word.length;
    
    if (word.length < 2) {
      setAutocomplete(prev => ({ ...prev, visible: false }));
      return;
    }
    
    // 确定上下文（标签、属性、CSS）
    let context = 'tags';
    const beforeWord = value.substring(0, wordStart);
    
    if (beforeWord.includes('style=')) {
      context = 'cssProperties';
    } else if (beforeWord.match(/<\w+\s+[a-zA-Z0-9-]*$/)) {
      context = 'attributes';
    }
    
    // 过滤匹配项
    const items = AUTOCOMPLETE_DATA[context].filter(item => 
      item.label.toLowerCase().startsWith(word.toLowerCase())
    );
    
    if (items.length > 0) {
      // 计算下拉框位置 - 使用精确的光标位置计算
      const caret = getCaretCoordinates(textarea, selectionStart);
      const lineHeight = 21;
      
      // 计算相对于可见区域的位置
      const visibleTop = caret.top - caret.scrollTop + 8; // 8px 是为了让下拉框在光标下方
      const visibleLeft = caret.left - caret.scrollLeft;
      
      // 限制在编辑器范围内
      const maxTop = textarea.clientHeight - 200;
      const maxLeft = textarea.clientWidth - 200;
      
      setAutocomplete({
        visible: true,
        items,
        selectedIndex: 0,
        position: {
          top: Math.max(40, Math.min(visibleTop, maxTop)),
          left: Math.max(0, Math.min(visibleLeft, maxLeft))
        }
      });
    } else {
      setAutocomplete(prev => ({ ...prev, visible: false }));
    }
  }, [getCaretCoordinates]);

  // 选择自动补全项
  const selectAutocompleteItem = useCallback((index) => {
    if (!autocomplete.visible || !textareaRef.current) return;
    
    const item = autocomplete.items[index];
    const textarea = textareaRef.current;
    const { selectionStart, value } = textarea;
    
    const beforeCursor = value.substring(0, selectionStart);
    const match = beforeCursor.match(/([a-zA-Z0-9-]+)$/);
    
    if (!match) return;
    
    const word = match[1];
    const wordStart = selectionStart - word.length;
    
    let insertText = item.label;
    let cursorOffset = insertText.length;
    
    // 自动闭合标签
    if (item.type === 'tag') {
      insertText = `${item.label}></${item.label}>`;
      cursorOffset = item.label.length + 2;
    }
    
    const newValue = value.substring(0, wordStart) + insertText + value.substring(selectionStart);
    setCode(newValue);
    setAutocomplete(prev => ({ ...prev, visible: false }));
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = wordStart + cursorOffset;
      textarea.focus();
      syncScroll();
    }, 0);
  }, [autocomplete, syncScroll]);

  // 键盘事件处理
  const handleKeyDown = useCallback((e) => {
    // 自动完成导航
    if (autocomplete.visible) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutocomplete(prev => ({
          ...prev,
          selectedIndex: Math.min(prev.selectedIndex + 1, prev.items.length - 1)
        }));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutocomplete(prev => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, 0)
        }));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectAutocompleteItem(autocomplete.selectedIndex);
        return;
      }
      if (e.key === 'Escape') {
        setAutocomplete(prev => ({ ...prev, visible: false }));
        return;
      }
    }
    
    // 其他快捷键
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        // 保存（已经通过localStorage自动保存）
      }
      if (e.key === 'b') {
        e.preventDefault();
        formatCode();
      }
    }
    
    // 自动缩进
    handleAutoIndent(e);
  }, [autocomplete, selectAutocompleteItem, formatCode, handleAutoIndent]);

  // 输入处理
  const handleInput = useCallback((e) => {
    const textarea = e.target;
    const newValue = textarea.value;
    setCode(newValue);
    handleAutocomplete(e);
    // 确保滚动同步
    setTimeout(syncScroll, 0);
  }, [handleAutocomplete, syncScroll]);

  // 语法高亮
  const highlightedCode = Prism.highlight(code, Prism.languages.markup, 'markup');

  return (
    <div className="flex flex-col h-screen bg-secondary">
      {/* 顶部工具栏 */}
      <div className="h-12 bg-primary border-b border-accent flex items-center px-4 gap-2">
        <div className="flex items-center gap-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <h1 className="text-white font-semibold mr-auto">HTML 实时编辑器</h1>
        <button
          onClick={copyCode}
          className="px-3 py-1.5 bg-accent text-white rounded hover:bg-opacity-80 transition-colors text-sm"
        >
          复制代码
        </button>
        <button
          onClick={clearCode}
          className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
        >
          清空
        </button>
        <button
          onClick={formatCode}
          className="px-3 py-1.5 bg-accent text-white rounded hover:bg-opacity-80 transition-colors text-sm"
        >
          格式化
        </button>
      </div>

      {/* 错误提示栏 */}
      {error && (
        <div className="error-bar">
          <span className="error-icon">✕</span>
          <span className="error-message">{error.message}</span>
          <span className="error-location">第 {error.line} 行</span>
        </div>
      )}

      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧编辑区 */}
        <div
          ref={editorRef}
          className="relative bg-primary overflow-hidden"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="absolute top-0 left-0 right-0 h-8 bg-accent bg-opacity-30 flex items-center px-4 z-10">
            <span className="text-white text-sm font-medium">HTML 源代码</span>
          </div>
          
          <div className="code-editor mt-8">
            <pre 
              ref={preRef}
              className="code-highlight" 
              aria-hidden="true"
            >
              <code
                className="language-html"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </pre>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onScroll={syncScroll}
              spellCheck={false}
              placeholder="在此输入 HTML 代码..."
            />
            
            {/* 自动完成下拉框 */}
            {autocomplete.visible && (
              <div
                className="autocomplete-dropdown"
                style={{
                  top: `${autocomplete.position.top}px`,
                  left: `${autocomplete.position.left}px`
                }}
              >
                {autocomplete.items.map((item, index) => (
                  <div
                    key={`${item.label}-${item.type}`}
                    className={`autocomplete-item ${index === autocomplete.selectedIndex ? 'selected' : ''}`}
                    onClick={() => selectAutocompleteItem(index)}
                  >
                    <span className="label">{item.label}</span>
                    <span className="type">{item.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 拖拽分隔条 */}
        <div
          ref={dragRef}
          className={`w-1 bg-accent cursor-col-resize hover:bg-highlight transition-colors ${isDragging ? 'bg-highlight' : ''}`}
          onMouseDown={() => setIsDragging(true)}
        />

        {/* 右侧预览区 */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="h-8 bg-accent bg-opacity-30 flex items-center px-4">
            <span className="text-white text-sm font-medium">实时预览</span>
          </div>
          <div className="flex-1 bg-white">
            {/* 使用 srcdoc 来确保 script 执行 */}
            <iframe
              ref={previewRef}
              title="HTML Preview"
              className="w-full h-full border-none"
              srcDoc={code}
              sandbox="allow-scripts allow-same-origin allow-popups allow-modals"
            />
          </div>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="h-6 bg-primary border-t border-accent flex items-center px-4 text-xs text-gray-400">
        <span className="mr-4">行数: {code.split('\n').length}</span>
        <span className="mr-4">字符数: {code.length}</span>
        <span className="mr-auto">语法: HTML5</span>
        <span>自动保存: 已启用</span>
      </div>
    </div>
  );
}

export default App;
