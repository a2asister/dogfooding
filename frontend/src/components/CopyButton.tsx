import { Component, createSignal, For } from 'solid-js';

interface CopyButtonProps {
  text: string;
}

const CopyButton: Component<CopyButtonProps> = (props) => {
  const [copied, setCopied] = createSignal(false);
  const [ripples, setRipples] = createSignal<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLButtonElement;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    navigator.clipboard.writeText(props.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      class="copy-btn"
      onClick={handleClick}
      style={{
        padding: '8px 16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <For each={ripples()}>
        {(ripple) => (
          <span
            class="ripple"
            style={{
              left: ripple.x - 10 + 'px',
              top: ripple.y - 10 + 'px',
              width: '20px',
              height: '20px',
            }}
          />
        )}
      </For>
      {copied() ? '已复制!' : '复制代码'}
    </button>
  );
};

export default CopyButton;
