export type TokenType =
  | 'keyword'
  | 'string'
  | 'comment'
  | 'function'
  | 'number'
  | 'operator'
  | 'punctuation'
  | 'text';

export interface Token {
  type: TokenType;
  value: string;
}

const KEYWORDS = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'import', 'export', 'from', 'class', 'extends', 'new', 'this', 'default',
  'async', 'await', 'try', 'catch', 'throw', 'interface', 'type', 'typeof',
  'instanceof', 'in', 'of', 'null', 'undefined', 'true', 'false',
  'def', 'class', 'def', 'return', 'if', 'elif', 'else', 'for', 'while',
  'import', 'from', 'as', 'try', 'except', 'raise', 'with',
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON',
  'GROUP', 'BY', 'ORDER', 'HAVING', 'AND', 'OR', 'NOT', 'IN', 'AS',
  'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
];

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    let char = code[i];

    if (char === '/' && code[i + 1] === '/') {
      let comment = '';
      while (i < code.length && code[i] !== '\n') {
        comment += code[i];
        i++;
      }
      tokens.push({ type: 'comment', value: comment });
      continue;
    }

    if (char === '/' && code[i + 1] === '*') {
      let comment = '/*';
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) {
        comment += code[i];
        i++;
      }
      comment += '*/';
      i += 2;
      tokens.push({ type: 'comment', value: comment });
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      let string = char;
      i++;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\' && i + 1 < code.length) {
          string += code[i] + code[i + 1];
          i += 2;
        } else {
          string += code[i];
          i++;
        }
      }
      string += quote;
      i++;
      tokens.push({ type: 'string', value: string });
      continue;
    }

    if (char === '#' && code.slice(i).search(/\n/) === -1) {
      let comment = '';
      while (i < code.length && code[i] !== '\n') {
        comment += code[i];
        i++;
      }
      tokens.push({ type: 'comment', value: comment });
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let word = '';
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
        word += code[i];
        i++;
      }
      if (KEYWORDS.includes(word) || KEYWORDS.includes(word.toLowerCase())) {
        tokens.push({ type: 'keyword', value: word });
      } else if (code[i] === '(') {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'text', value: word });
      }
      continue;
    }

    if (/[0-9]/.test(char)) {
      let number = '';
      while (i < code.length && /[0-9.]/.test(code[i])) {
        number += code[i];
        i++;
      }
      tokens.push({ type: 'number', value: number });
      continue;
    }

    if (/[+\-*/%=<>!&|^~?:]/.test(char)) {
      let op = char;
      i++;
      if (/[=|&|]/.test(code[i])) {
        op += code[i];
        i++;
      }
      tokens.push({ type: 'operator', value: op });
      continue;
    }

    if (/[{}()[\];,.]/.test(char)) {
      tokens.push({ type: 'punctuation', value: char });
      i++;
      continue;
    }

    tokens.push({ type: 'text', value: char });
    i++;
  }

  return tokens;
}
