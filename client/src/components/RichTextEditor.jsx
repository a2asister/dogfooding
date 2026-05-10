import { onMount } from 'solid-js'

const toolbarButtons = [
  { command: 'bold', label: 'B', title: '加粗', style: 'font-weight: bold' },
  { command: 'italic', label: 'I', title: '斜体', style: 'font-style: italic' },
  { command: 'underline', label: 'U', title: '下划线', style: 'text-decoration: underline' },
  { command: 'strikeThrough', label: 'S', title: '删除线', style: 'text-decoration: line-through' },
  { divider: true },
  { command: 'formatBlock', value: 'h1', label: 'H1', title: '标题1' },
  { command: 'formatBlock', value: 'h2', label: 'H2', title: '标题2' },
  { command: 'formatBlock', value: 'h3', label: 'H3', title: '标题3' },
  { command: 'formatBlock', value: 'p', label: '¶', title: '段落' },
  { divider: true },
  { command: 'insertUnorderedList', label: '•', title: '无序列表' },
  { command: 'insertOrderedList', label: '1.', title: '有序列表' },
  { divider: true },
  { command: 'justifyLeft', label: '⬅', title: '左对齐' },
  { command: 'justifyCenter', label: '⬌', title: '居中对齐' },
  { command: 'justifyRight', label: '➡', title: '右对齐' },
  { divider: true },
  { command: 'blockquote', label: '❝', title: '引用' },
  { command: 'insertCode', label: '</>', title: '代码块', custom: true },
  { command: 'insertTable', label: '⊞', title: '插入表格', custom: true },
  { divider: true },
  { command: 'undo', label: '↩', title: '撤销' },
  { command: 'redo', label: '↪', title: '重做' },
  { command: 'removeFormat', label: '✕', title: '清除格式' }
]

export default function RichTextEditor({ value, onChange }) {
  let editorRef

  onMount(() => {
    if (editorRef && value) {
      editorRef.innerHTML = value
    }
  })

  const executeCommand = (command, value = null) => {
    if (command === 'insertCode') {
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const selectedText = range.toString()
        document.execCommand('insertHTML', false, `<pre><code>${selectedText || '// 代码'}</code></pre>`)
      }
    } else if (command === 'insertTable') {
      document.execCommand('insertHTML', false, 
        '<table><tr><th>标题1</th><th>标题2</th></tr><tr><td>内容1</td><td>内容2</td></tr></table>')
    } else {
      document.execCommand(command, false, value)
    }
    editorRef.focus()
    handleInput()
  }

  const handleInput = () => {
    if (onChange && editorRef) {
      onChange(editorRef.innerHTML)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  return (
    <div class="richtext-editor">
      <div class="richtext-toolbar">
        {toolbarButtons.map((btn, idx) => 
          btn.divider ? (
            <div class="toolbar-divider" />
          ) : (
            <button
              type="button"
              class="toolbar-btn"
              title={btn.title}
              onClick={() => executeCommand(btn.command, btn.value)}
              style={btn.style}
            >
              {btn.label}
            </button>
          )
        )}
      </div>
      <div
        ref={editorRef}
        class="editor-content"
        contenteditable="true"
        onInput={handleInput}
        onPaste={handlePaste}
        placeholder="开始编写内容..."
      />
    </div>
  )
}
