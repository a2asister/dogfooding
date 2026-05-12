import { Component, createSignal, createEffect, For } from 'solid-js';
import TypewriterCode from './components/TypewriterCode';
import CopyButton from './components/CopyButton';
import CodeFlipCard from './components/CodeFlipCard';

interface CodeSnippet {
  id: number;
  title: string;
  code: string;
  language: string;
  description: string;
  tags: string[];
}

const App: Component = () => {
  const [snippets, setSnippets] = createSignal<CodeSnippet[]>([]);
  const [searchQuery, setSearchQuery] = createSignal('');
  const [loading, setLoading] = createSignal(true);
  const [selectedSnippet, setSelectedSnippet] = createSignal<CodeSnippet | null>(null);

  createEffect(() => {
    fetchSnippets();
  });

  const fetchSnippets = async () => {
    try {
      const response = await fetch('/api/code-snippets');
      const data = await response.json();
      setSnippets(data);
      if (data.length > 0) {
        setSelectedSnippet(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch snippets:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: Event) => {
    const query = (e.target as HTMLInputElement).value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const response = await fetch(`/api/code-snippets/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSnippets(data);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      fetchSnippets();
    }
  };

  const flipSnippets = () => {
    return snippets().slice(0, Math.min(3, snippets().length));
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 800,
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          ✨ 代码展示工具
        </h1>
        <p style={{ color: '#a6adc8', fontSize: '16px' }}>
          逐字符打字机效果 · 语法高亮 · 3D 翻转 · 流光动画
        </p>
      </header>

      <div style={{
        maxWidth: '500px',
        margin: '0 auto 40px',
      }}>
        <input
          type="text"
          placeholder="搜索代码片段..."
          value={searchQuery()}
          onInput={handleSearch}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: '#1e1e2e',
            border: '2px solid #313244',
            borderRadius: '12px',
            color: '#cdd6f4',
            fontSize: '16px',
            outline: 'none',
            transition: 'border-color 0.3s ease',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#313244';
          }}
        />
      </div>

      {loading() ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#a6adc8' }}>
          加载中...
        </div>
      ) : (
        <>
          {flipSnippets().length > 0 && (
            <section style={{ marginBottom: '60px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#cdd6f4' }}>
                🎴 3D 翻转展示
              </h2>
              <CodeFlipCard snippets={flipSnippets()} />
            </section>
          )}

          <section>
            <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#cdd6f4' }}>
              📚 代码片段列表
            </h2>
            <div style={{ display: 'grid', gap: '20px' }}>
              <For each={snippets()}>
                {(snippet) => (
                  <div style={{
                    background: '#1e1e2e',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    border: selectedSnippet()?.id === snippet.id 
                      ? '2px solid #667eea' 
                      : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => setSelectedSnippet(snippet)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', color: '#cdd6f4', marginBottom: '4px' }}>{snippet.title}</h3>
                        <span style={{ color: '#6c7086', fontSize: '12px' }}>{snippet.language}</span>
                      </div>
                      <CopyButton text={snippet.code} />
                    </div>
                    <p style={{ color: '#a6adc8', fontSize: '14px', marginBottom: '12px' }}>
                      {snippet.description}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <For each={snippet.tags || []}>
                        {(tag) => (
                          <span style={{
                            padding: '4px 10px',
                            background: 'rgba(102, 126, 234, 0.2)',
                            color: '#b4befe',
                            borderRadius: '6px',
                            fontSize: '12px',
                          }}>
                            #{tag}
                          </span>
                        )}
                      </For>
                    </div>

                    {selectedSnippet()?.id === snippet.id && (
                      <div style={{ marginTop: '20px' }}>
                        <TypewriterCode code={snippet.code} language={snippet.language} speed={15} />
                      </div>
                    )}
                  </div>
                )}
              </For>
            </div>
          </section>
        </>
      )}

      <footer style={{ textAlign: 'center', marginTop: '60px', padding: '20px', color: '#6c7086' }}>
        <p style={{ fontSize: '14px' }}>
          Built with SolidJS + NestJS + SQLite 🚀
        </p>
      </footer>
    </div>
  );
};

export default App;
