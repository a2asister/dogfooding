import { createSignal, onMount } from 'solid-js';

export default function TypewriterText({ text, onComplete, speed = 40, delay = 0 }) {
  const [displayText, setDisplayText] = createSignal('');
  const [showCursor, setShowCursor] = createSignal(true);

  onMount(() => {
    let currentIndex = 0;
    
    const typeChar = () => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
        if (currentIndex <= text.length) {
          setTimeout(typeChar, speed);
        } else {
          setTimeout(() => {
            setShowCursor(false);
            onComplete?.();
          }, 500);
        }
      }
    };

    setTimeout(typeChar, delay);
  });

  return (
    <span class="typewriter-text">
      {displayText()}
      {showCursor() && <span class="cursor"></span>}
    </span>
  );
}
