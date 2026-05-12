import { Component, createSignal, createEffect, For, onCleanup } from 'solid-js';
import { tokenize, Token } from '../utils/tokenizer';

interface TypewriterCodeProps {
  code: string;
  language: string;
  speed?: number;
}

const TypewriterCode: Component<TypewriterCodeProps> = (props) => {
  const [displayedChars, setDisplayedChars] = createSignal<number>(0);
  const [tokens, setTokens] = createSignal<Token[]>([]);
  const [selectedLine, setSelectedLine] = createSignal<number | null>(null);

  createEffect(() => {
    setDisplayedChars(0);
    setTokens(tokenize(props.code));
  });

  createEffect(() => {
    const speed = props.speed || 30;
    const totalChars = props.code.length;

    if (displayedChars() < totalChars) {
      const timer = setTimeout(() => {
        setDisplayedChars((prev) => Math.min(prev + 1, totalChars));
      }, speed);
      onCleanup(() => clearTimeout(timer));
    }
  });

  const lines = () => {
    const codeLines = props.code.split('\n');
    let charCount = 0;
    return codeLines.map((line, lineIndex) => {
      const lineStart = charCount;
      charCount += line.length + 1;
      return {
        text: line,
        index: lineIndex,
        start: lineStart,
        end: charCount - 1,
      };
    });
  };

  const getTokenForChar = (charIndex: number): Token | null => {
    const currentTokens = tokens();
    let pos = 0;
    for (const token of currentTokens) {
      if (charIndex >= pos && charIndex < pos + token.value.length) {
        return token;
      }
      pos += token.value.length;
    }
    return null;
  };

  return (
    <div class="code-container" style={{
      background: '#1e1e2e',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #313244' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f38ba8' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f9e2af' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#a6e3a1' }}></div>
        </div>
        <span style={{ color: '#6c7086', fontSize: '14px' }}>{props.language}</span>
      </div>

      <div style={{ display: 'flex', position: 'relative' }}>
        <div 
          class="line-numbers"
          style={{
            flexShrink: 0,
            paddingRight: '16px',
            color: '#6c7086',
            textAlign: 'right',
            userSelect: 'none',
            fontSize: '14px',
            lineHeight: '1.6',
            fontFamily: 'inherit',
          }}
        >
          <For each={lines()}>
            {(_, i) => (
              <div 
                style={{ 
                  height: '25.6px',
                  transform: `translateY(${Math.sin(i() * 0.5)}px)`,
                  transition: 'transform 0.3s ease',
                }}
              >
                {i() + 1}
              </div>
            )}
          </For>
        </div>

        <div style={{ flex: 1, overflowX: 'auto' }}>
          <For each={lines()}>
            {(line, lineIndex) => (
              <div
                class={`code-line ${selectedLine() === lineIndex() ? 'selected' : ''}`}
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  cursor: 'pointer',
                  minHeight: '25.6px',
                }}
                onClick={() => setSelectedLine(selectedLine() === lineIndex() ? null : lineIndex())}
              >
                <For each={Array.from(line.text).map((char, i) => ({
                  char,
                  globalIndex: line.start + i,
                }))}>
                  {({ char, globalIndex }) => {
                    if (globalIndex >= displayedChars()) {
                      return <span>&nbsp;</span>;
                    }
                    const token = getTokenForChar(globalIndex);
                    const isGlowing = globalIndex === displayedChars() - 1;
                    return (
                      <span
                        class={`code-char ${token ? `token-${token.type}` : 'token-text'} ${isGlowing ? 'glowing' : ''}`}
                      >
                        {char}
                      </span>
                    );
                  }}
                </For>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default TypewriterCode;
