import React from 'react'
import Editor from '@monaco-editor/react'

const CodeEditor = ({
  value,
  onChange,
  language = 'javascript',
  height = 300,
  theme = 'vs-dark',
  readOnly = false,
  options = {}
}) => {
  const defaultOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    tabSize: 2,
    ...options
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme={theme}
        options={defaultOptions}
        readOnly={readOnly}
        loading={<div style={{ padding: '20px', color: '#6b7280' }}>加载编辑器中...</div>}
      />
    </div>
  )
}

export const ScriptEditor = ({ value, onChange, height = 200 }) => (
  <CodeEditor
    value={value}
    onChange={onChange}
    language="javascript"
    height={height}
  />
)

export const JsonEditor = ({ value, onChange, height = 200 }) => {
  const formattedValue = typeof value === 'string' 
    ? value 
    : JSON.stringify(value, null, 2)

  return (
    <CodeEditor
      value={formattedValue}
      onChange={onChange}
      language="json"
      height={height}
    />
  )
}

export const ExpressionEditor = ({ value, onChange, height = 100 }) => (
  <CodeEditor
    value={value}
    onChange={onChange}
    language="javascript"
    height={height}
    options={{
      lineNumbers: 'off',
      folding: false,
      scrollBeyondLastLine: false
    }}
  />
)

export const TemplateEditor = ({ value, onChange, height = 150 }) => (
  <CodeEditor
    value={value}
    onChange={onChange}
    language="handlebars"
    height={height}
    options={{
      lineNumbers: 'on'
    }}
  />
)

export default CodeEditor
