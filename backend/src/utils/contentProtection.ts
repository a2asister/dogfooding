const ZERO_WIDTH_CHARS = ['\u200B', '\u200C', '\u200D', '\u2060', '\uFEFF'];
const INVISIBLE_CHARS = ['\u00AD', '\u034F', '\u061C', '\u115F', '\u1160', '\u17B4', '\u17B5', '\u180E'];
const CONFUSABLE_CHARS: Record<string, string[]> = {
  'a': ['а', 'ạ', 'ă', 'ą', 'ȃ', 'ɐ'],
  'b': ['Ь', 'Ƅ', 'Ь', 'ɓ', 'β'],
  'c': ['с', 'ċ', 'č', 'ç', 'ȼ'],
  'd': ['ԁ', 'đ', 'ď', 'ɗ', 'ɖ'],
  'e': ['е', 'ẹ', 'ė', 'ę', 'ě'],
  'f': ['ƒ', 'ғ', 'ԁ'],
  'g': ['ɡ', 'ġ', 'ğ', 'ģ', 'ǥ'],
  'h': ['н', 'ħ', 'ɦ', 'ɥ'],
  'i': ['і', 'ї', 'ị', 'ı', 'ǐ'],
  'j': ['ј', 'ʝ', 'ɟ'],
  'k': ['к', 'κ', 'ķ', 'ĸ'],
  'l': ['І', 'ł', 'ĺ', 'ļ', 'ɫ'],
  'm': ['м', 'ṁ', 'ɱ'],
  'n': ['п', 'ń', 'ņ', 'ɲ', 'ŋ'],
  'o': ['о', 'ọ', 'ő', 'ơ', 'ɵ'],
  'p': ['р', 'ρ', 'ƥ', 'þ'],
  'q': ['ԛ', 'ɋ'],
  'r': ['г', 'ŕ', 'ř', 'ɍ', 'ɼ'],
  's': ['ѕ', 'ś', 'ş', 'ș', 'ʂ'],
  't': ['т', 'ţ', 'ť', 'ƭ', 'ʈ'],
  'u': ['ц', 'ụ', 'ű', 'ư', 'ʊ'],
  'v': ['ѵ', 'ṿ', 'ʋ'],
  'w': ['ш', 'ẁ', 'ẃ', 'ŵ'],
  'x': ['х', 'х', 'ẋ', 'ҳ'],
  'y': ['у', 'ý', 'ÿ', 'ŷ', 'ʏ'],
  'z': ['ż', 'ź', 'ž', 'ƶ', 'ʐ'],
  'A': ['А', 'Ą', 'Ă', 'Ǎ', 'Ȧ'],
  'B': ['В', 'Β', 'Ɓ', 'ʙ'],
  'C': ['С', 'Ċ', 'Č', 'Ç', 'Ƈ'],
  'D': ['Д', 'Đ', 'Ď', 'Ɗ', 'Ɖ'],
  'E': ['Е', 'Ė', 'Ę', 'Ě', 'Ȩ'],
  'F': ['Ғ', 'Ƒ', 'Ӻ'],
  'G': ['Ґ', 'Ġ', 'Ğ', 'Ģ', 'Ǥ'],
  'H': ['Н', 'Ħ', 'Η', 'Ң'],
  'I': ['І', 'Ї', 'İ', 'Ǐ', 'Ȋ'],
  'J': ['Ј', 'Ĵ', 'Ɉ'],
  'K': ['К', 'Κ', 'Ķ', 'Ҡ'],
  'L': ['І', 'Ł', 'Ĺ', 'Ļ', 'Ŀ'],
  'M': ['М', 'Ṁ', 'Ӎ'],
  'N': ['Н', 'Ń', 'Ņ', 'Ɲ', 'Ŋ'],
  'O': ['О', 'Ö', 'Ő', 'Ơ', 'Θ'],
  'P': ['Р', 'Ρ', 'Ƥ', 'Ҏ'],
  'Q': ['Ԛ', 'Ɋ'],
  'R': ['Р', 'Ŕ', 'Ř', 'Ɍ', 'Ʀ'],
  'S': ['Ѕ', 'Ś', 'Ş', 'Ș', 'Š'],
  'T': ['Т', 'Ţ', 'Ť', 'Ƭ', 'Ʈ'],
  'U': ['Ц', 'Ű', 'Ư', 'Ǔ', 'Ȕ'],
  'V': ['Ѵ', 'Ṿ', 'Ʋ'],
  'W': ['Ш', 'Ŵ', 'Ẃ'],
  'X': ['Х', 'Ẋ', 'Ӿ'],
  'Y': ['У', 'Ý', 'Ÿ', 'Ŷ'],
  'Z': ['Ż', 'Ź', 'Ž', 'Ƶ', 'Ӂ'],
  '0': ['ο', 'О', 'о', '੦', '೦'],
  '1': ['І', 'І', '۱', 'Ꭵ', 'ɩ'],
  '2': ['ƻ', 'ᒚ', '②'],
  '3': ['Ʒ', 'Ȝ', 'З'],
  '4': ['Ꮞ', '๔'],
  '5': ['Ƽ', '⑤'],
  '6': ['б', 'Ϭ'],
  '7': ['ㄱ', '7'],
  '8': ['Ȣ', '੮'],
  '9': ['৭', '๙'],
};

export const generateZeroWidthSequence = (length: number = 5): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ZERO_WIDTH_CHARS[Math.floor(Math.random() * ZERO_WIDTH_CHARS.length)];
  }
  return result;
};

export const generateInvisibleSequence = (length: number = 3): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += INVISIBLE_CHARS[Math.floor(Math.random() * INVISIBLE_CHARS.length)];
  }
  return result;
};

export const scrambleChar = (char: string): string => {
  const confusables = CONFUSABLE_CHARS[char];
  if (confusables && confusables.length > 0) {
    return confusables[Math.floor(Math.random() * confusables.length)];
  }
  return char;
};

export const scrambleText = (text: string, intensity: number = 0.3): string => {
  if (!text || intensity <= 0) return text;
  
  const chars = text.split('');
  const scrambleCount = Math.floor(chars.length * intensity);
  const indices: number[] = [];
  
  while (indices.length < scrambleCount) {
    const idx = Math.floor(Math.random() * chars.length);
    if (!indices.includes(idx)) {
      indices.push(idx);
    }
  }
  
  for (const idx of indices) {
    const char = chars[idx];
    if (CONFUSABLE_CHARS[char]) {
      chars[idx] = scrambleChar(char);
    }
  }
  
  return chars.join('');
};

export const insertZeroWidthChars = (text: string, density: number = 0.1): string => {
  if (!text || density <= 0) return text;
  
  const chars = text.split('');
  const result: string[] = [];
  
  for (const char of chars) {
    result.push(char);
    if (Math.random() < density) {
      result.push(generateZeroWidthSequence(2));
    }
  }
  
  return result.join('');
};

export const protectContent = (
  content: string,
  options: {
    scrambleIntensity?: number;
    zeroWidthDensity?: number;
    addWatermark?: boolean;
    watermarkText?: string;
  } = {}
): {
  protectedContent: string;
  originalContent: string;
  protectionHash: string;
} => {
  const {
    scrambleIntensity = 0.2,
    zeroWidthDensity = 0.05,
    addWatermark = false,
    watermarkText = ''
  } = options;

  let protectedContent = content;
  
  protectedContent = scrambleText(protectedContent, scrambleIntensity);
  
  protectedContent = insertZeroWidthChars(protectedContent, zeroWidthDensity);
  
  if (addWatermark && watermarkText) {
    const invisibleWatermark = generateZeroWidthSequence(3) + 
      encodeWatermark(watermarkText) + 
      generateZeroWidthSequence(3);
    protectedContent = invisibleWatermark + protectedContent;
  }
  
  const protectionHash = generateProtectionHash(content);
  
  return {
    protectedContent,
    originalContent: content,
    protectionHash
  };
};

export const encodeWatermark = (text: string): string => {
  const binary = text.split('').map(char => 
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
  
  let result = '';
  for (const bit of binary) {
    result += bit === '1' ? ZERO_WIDTH_CHARS[0] : ZERO_WIDTH_CHARS[1];
  }
  
  return result;
};

export const decodeWatermark = (encoded: string): string => {
  let binary = '';
  for (const char of encoded) {
    if (char === ZERO_WIDTH_CHARS[0]) {
      binary += '1';
    } else if (char === ZERO_WIDTH_CHARS[1]) {
      binary += '0';
    }
  }
  
  let text = '';
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.slice(i, i + 8);
    if (byte.length === 8) {
      text += String.fromCharCode(parseInt(byte, 2));
    }
  }
  
  return text;
};

export const generateProtectionHash = (content: string): string => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const detectProtectedContent = (text: string): {
  hasZeroWidthChars: boolean;
  zeroWidthCount: number;
  hasConfusableChars: boolean;
  confusableCount: number;
  potentialWatermark: string | null;
  protectionLevel: 'none' | 'low' | 'medium' | 'high';
} => {
  const zeroWidthRegex = /[\u200B-\u200D\u2060\uFEFF]/g;
  const zeroWidthMatches = text.match(zeroWidthRegex) || [];
  
  let confusableCount = 0;
  for (const char of text) {
    for (const [original, confusables] of Object.entries(CONFUSABLE_CHARS)) {
      if (confusables.includes(char)) {
        confusableCount++;
        break;
      }
    }
  }
  
  const potentialWatermark = detectWatermark(text);
  
  const totalIndicators = zeroWidthMatches.length + confusableCount + (potentialWatermark ? 10 : 0);
  let protectionLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
  if (totalIndicators > 20) protectionLevel = 'high';
  else if (totalIndicators > 10) protectionLevel = 'medium';
  else if (totalIndicators > 0) protectionLevel = 'low';
  
  return {
    hasZeroWidthChars: zeroWidthMatches.length > 0,
    zeroWidthCount: zeroWidthMatches.length,
    hasConfusableChars: confusableCount > 0,
    confusableCount,
    potentialWatermark,
    protectionLevel
  };
};

export const detectWatermark = (text: string): string | null => {
  const zeroWidthRegex = /[\u200B-\u200D\u2060\uFEFF]{8,}/g;
  const matches = text.match(zeroWidthRegex);
  
  if (matches && matches.length > 0) {
    const decoded = decodeWatermark(matches[0]);
    if (decoded.length > 0 && decoded.length < 100) {
      return decoded;
    }
  }
  
  return null;
};

export const cleanProtectedContent = (text: string): string => {
  const zeroWidthRegex = /[\u200B-\u200D\u2060\uFEFF\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E]/g;
  return text.replace(zeroWidthRegex, '');
};

export const encryptContent = (content: string, key: string): string => {
  let result = '';
  for (let i = 0; i < content.length; i++) {
    const charCode = content.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(unescape(encodeURIComponent(result)));
};

export const decryptContent = (encrypted: string, key: string): string => {
  try {
    const decoded = decodeURIComponent(escape(atob(encrypted)));
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return '';
  }
};

export const generateCopyProtectionScript = (noteId: string, options: {
  disableCopy?: boolean;
  disableRightClick?: boolean;
  disableSelect?: boolean;
  watermarkText?: string;
} = {}): string => {
  const {
    disableCopy = true,
    disableRightClick = true,
    disableSelect = true,
    watermarkText = ''
  } = options;

  return `
(function() {
  const noteId = '${noteId}';
  const protectionActive = true;
  
  ${disableCopy ? `
  document.addEventListener('copy', function(e) {
    e.preventDefault();
    const selectedText = window.getSelection().toString();
    if (selectedText.length > 10) {
      const garbledText = garbleText(selectedText);
      e.clipboardData.setData('text/plain', garbledText);
    }
    return false;
  });
  
  document.addEventListener('cut', function(e) {
    e.preventDefault();
    return false;
  });
  ` : ''}
  
  ${disableRightClick ? `
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });
  ` : ''}
  
  ${disableSelect ? `
  document.addEventListener('selectstart', function(e) {
    if (protectionActive) {
      e.preventDefault();
      return false;
    }
  });
  
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
  });
  ` : ''}
  
  function garbleText(text) {
    const chars = text.split('');
    const substitutions = {
      'a': ['а', 'ạ', 'ă', 'ą'],
      'e': ['е', 'ẹ', 'ė', 'ę'],
      'i': ['і', 'ї', 'ị', 'ı'],
      'o': ['о', 'ọ', 'ő', 'ơ'],
      'u': ['ц', 'ụ', 'ű', 'ư'],
      'c': ['с', 'ċ', 'č', 'ç'],
      's': ['ѕ', 'ś', 'ş', 'ș'],
      'p': ['р', 'ρ', 'ƥ', 'þ'],
      'y': ['у', 'ý', 'ÿ', 'ŷ'],
      'h': ['н', 'ħ', 'ɦ', 'ɥ'],
      'k': ['к', 'κ', 'ķ', 'ĸ'],
      'l': ['І', 'ł', 'ĺ', 'ļ'],
      'm': ['м', 'ṁ', 'ɱ'],
      'n': ['п', 'ń', 'ņ', 'ɲ'],
      'r': ['г', 'ŕ', 'ř', 'ɍ'],
      't': ['т', 'ţ', 'ť', 'ƭ'],
      'w': ['ш', 'ẁ', 'ẃ', 'ŵ'],
      'b': ['Ь', 'Ƅ', 'Ь', 'ɓ'],
      'd': ['ԁ', 'đ', 'ď', 'ɗ'],
      'f': ['ƒ', 'ғ', 'ԁ'],
      'g': ['ɡ', 'ġ', 'ğ', 'ģ'],
      'j': ['ј', 'ʝ', 'ɟ'],
      'q': ['ԛ', 'ɋ'],
      'v': ['ѵ', 'ṿ', 'ʋ'],
      'x': ['х', 'х', 'ẋ', 'ҳ'],
      'z': ['ż', 'ź', 'ž', 'ƶ'],
      'A': ['А', 'Ą', 'Ă', 'Ǎ'],
      'B': ['В', 'Β', 'Ɓ', 'ʙ'],
      'C': ['С', 'Ċ', 'Č', 'Ç'],
      'D': ['Д', 'Đ', 'Ď', 'Ɗ'],
      'E': ['Е', 'Ė', 'Ę', 'Ě'],
      'F': ['Ғ', 'Ƒ', 'Ӻ'],
      'G': ['Ґ', 'Ġ', 'Ğ', 'Ģ'],
      'H': ['Н', 'Ħ', 'Η', 'Ң'],
      'I': ['І', 'Ї', 'İ', 'Ǐ'],
      'J': ['Ј', 'Ĵ', 'Ɉ'],
      'K': ['К', 'Κ', 'Ķ', 'Ҡ'],
      'L': ['І', 'Ł', 'Ĺ', 'Ļ'],
      'M': ['М', 'Ṁ', 'Ӎ'],
      'N': ['Н', 'Ń', 'Ņ', 'Ɲ'],
      'O': ['О', 'Ö', 'Ő', 'Ơ'],
      'P': ['Р', 'Ρ', 'Ƥ', 'Ҏ'],
      'R': ['Р', 'Ŕ', 'Ř', 'Ɍ'],
      'S': ['Ѕ', 'Ś', 'Ş', 'Ș'],
      'T': ['Т', 'Ţ', 'Ť', 'Ƭ'],
      'U': ['Ц', 'Ű', 'Ư', 'Ǔ'],
      'V': ['Ѵ', 'Ṿ', 'Ʋ'],
      'W': ['Ш', 'Ŵ', 'Ẃ'],
      'X': ['Х', 'Ẋ', 'Ӿ'],
      'Y': ['У', 'Ý', 'Ÿ', 'Ŷ'],
      'Z': ['Ż', 'Ź', 'Ž', 'Ƶ'],
      '0': ['ο', 'О', 'о', '੦'],
      '1': ['І', 'І', '۱', 'Ꭵ'],
      '2': ['ƻ', 'ᒚ', '②'],
      '3': ['Ʒ', 'Ȝ', 'З'],
      '4': ['Ꮞ', '๔'],
      '5': ['Ƽ', '⑤'],
      '6': ['б', 'Ϭ'],
      '7': ['ㄱ', '7'],
      '8': ['Ȣ', '੮'],
      '9': ['৭', '๙'],
    };
    
    const scrambleChars = ['\\u200B', '\\u200C', '\\u200D', '\\u2060', '\\uFEFF'];
    let result = '';
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (substitutions[char] && Math.random() < 0.4) {
        const subs = substitutions[char];
        result += subs[Math.floor(Math.random() * subs.length)];
      } else {
        result += char;
      }
      if (Math.random() < 0.1) {
        result += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      }
    }
    
    const watermark = '\\n\\n---\\n此内容受版权保护，禁止未经授权复制。原文链接: ' + window.location.href;
    return result + watermark;
  }
  
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && ['c', 'C', 'x', 'X', 's', 'S', 'p', 'P', 'u', 'U'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      e.preventDefault();
      return false;
    }
  });
  
  document.addEventListener('keypress', function(e) {
    if ((e.ctrlKey || e.metaKey) && ['c', 'C', 'x', 'X', 's', 'S', 'p', 'P', 'u', 'U'].includes(e.key)) {
      e.preventDefault();
      return false;
    }
  });
  
  ${watermarkText ? `
  (function addWatermark() {
    const style = document.createElement('style');
    style.textContent = \`
      .note-content::before {
        content: '${watermarkText.replace(/'/g, "\\'")}';
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 60px;
        color: rgba(0, 0, 0, 0.03);
        z-index: 10000;
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
      }
    \`;
    document.head.appendChild(style);
  })();
  ` : ''}
})();
  `.trim();
};

export const generateCopyProtectionCSS = (): string => {
  return `
    .protected-content {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }
    
    .protected-content img {
      -webkit-user-drag: none;
      user-drag: none;
      pointer-events: none;
    }
    
    .protected-content::selection {
      background: transparent;
    }
    
    .protected-content::-moz-selection {
      background: transparent;
    }
  `;
};
