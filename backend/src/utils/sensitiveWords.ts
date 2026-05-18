const defaultSensitiveWords = [
  '色情', '赌博', '毒品', '暴力', '恐怖',
  '反动', '违法', '诈骗', '传销', '走私',
  '枪支', '弹药', '爆炸物', '管制刀具',
  '迷信', '邪教', '非法集会',
  '侮辱', '诽谤', '恐吓', '威胁',
  '淫秽', '低俗', '色情', '卖淫', '嫖娼',
];

let customSensitiveWords: string[] = [];

export const addSensitiveWords = (words: string[]) => {
  customSensitiveWords = [...customSensitiveWords, ...words];
};

export const getAllSensitiveWords = () => {
  return [...defaultSensitiveWords, ...customSensitiveWords];
};

export const filterSensitiveWords = (text: string): { filtered: string; hasSensitive: boolean; foundWords: string[] } => {
  let filtered = text;
  const foundWords: string[] = [];
  const allWords = getAllSensitiveWords();

  for (const word of allWords) {
    const regex = new RegExp(word, 'gi');
    if (regex.test(text)) {
      foundWords.push(word);
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    }
  }

  return {
    filtered,
    hasSensitive: foundWords.length > 0,
    foundWords,
  };
};

export const checkSensitiveWords = (text: string): { hasSensitive: boolean; foundWords: string[] } => {
  const foundWords: string[] = [];
  const allWords = getAllSensitiveWords();

  for (const word of allWords) {
    const regex = new RegExp(word, 'gi');
    if (regex.test(text)) {
      foundWords.push(word);
    }
  }

  return {
    hasSensitive: foundWords.length > 0,
    foundWords,
  };
};
