import { Component, createSignal, For } from 'solid-js';
import TypewriterCode from './TypewriterCode';

interface CodeSnippet {
  title: string;
  code: string;
  language: string;
}

interface CodeFlipCardProps {
  snippets: CodeSnippet[];
}

const CodeFlipCard: Component<CodeFlipCardProps> = (props) => {
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [isFlipping, setIsFlipping] = createSignal(false);

  const flip = () => {
    if (isFlipping()) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % props.snippets.length);
      setIsFlipping(false);
    }, 400);
  };

  const current = () => props.snippets[currentIndex()];
  const nextIndex = () => (currentIndex() + 1) % props.snippets.length;
  const next = () => props.snippets[nextIndex()];

  return (
    <div style={{ position: 'relative' }}>
      <div class="flip-container" style={{ height: '400px', marginBottom: '20px' }}>
        <div class={`flip-inner ${isFlipping() ? 'flipped' : ''}`} style={{ height: '100%' }}>
          <div class="flip-front">
            <TypewriterCode code={current().code} language={current().language} />
          </div>
          <div class="flip-back">
            <TypewriterCode code={next().code} language={next().language} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
        <button
          onClick={flip}
          disabled={isFlipping()}
          style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: isFlipping() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            opacity: isFlipping() ? 0.7 : 1,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!isFlipping()) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          ↻ 切换语言 ({currentIndex() + 1}/{props.snippets.length})
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <For each={props.snippets}>
            {(_, i) => (
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: i() === currentIndex() ? '#667eea' : '#313244',
                  transition: 'background 0.3s ease',
                }}
              />
            )}
          </For>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px', color: '#a6adc8' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '4px', color: '#cdd6f4' }}>{current().title}</h3>
        <p style={{ fontSize: '14px' }}>下一个: {next().title}</p>
      </div>
    </div>
  );
};

export default CodeFlipCard;
