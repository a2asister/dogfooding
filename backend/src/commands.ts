import { fs } from './filesystem';

interface OutputLine {
  type: 'command' | 'result' | 'error' | 'warning' | 'info';
  content: string;
  icon?: string;
}

interface CommandResult {
  output: OutputLine[];
  path: string;
  clear?: boolean;
  completions?: string[];
}

type CommandHandler = (args: string[]) => CommandResult;

const error = (content: string): OutputLine => ({ type: 'error', content });
const result = (content: string, icon?: string): OutputLine => ({ type: 'result', content, icon });
const info = (content: string): OutputLine => ({ type: 'info', content });

const parseArgs = (args: string[]) => {
  const flags: string[] = [];
  const positional: string[] = [];
  for (const arg of args) {
    if (arg.startsWith('-')) {
      flags.push(...arg.slice(1).split(''));
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const commands: Record<string, CommandHandler> = {
  pwd: () => ({
    output: [result(fs.getCurrentPath())],
    path: fs.getCurrentPath(),
  }),

  ls: (args: string[]) => {
    const { flags, positional } = parseArgs(args);
    const showLong = flags.includes('l');
    const showAll = flags.includes('a');
    const targetPath = positional[0] || '';

    if (!fs.exists(targetPath) && targetPath) {
      return {
        output: [error(`ls: cannot access '${targetPath}': No such file or directory`)],
        path: fs.getCurrentPath(),
      };
    }

    if (targetPath && fs.getType(targetPath) === 'file') {
      const info = fs.getNodeInfo(targetPath);
      if (showLong && info) {
        return {
          output: [result(`-  ${String(info.size).padStart(6)}  ${formatDate(info.created_at)}  ${info.name}`)],
          path: fs.getCurrentPath(),
        };
      }
      return {
        output: [result(targetPath)],
        path: fs.getCurrentPath(),
      };
    }

    let items = fs.listDirectory(targetPath);
    if (!showAll) {
      items = items.filter(i => !i.name.startsWith('.'));
    }

    if (items.length === 0) {
      return { output: [], path: fs.getCurrentPath() };
    }

    if (showLong) {
      const lines: OutputLine[] = [];
      lines.push(info(`total ${items.length}`));
      for (const item of items) {
        const info = fs.getNodeInfo(targetPath ? `${targetPath}/${item.name}` : item.name);
        const typeChar = item.type === 'dir' ? 'd' : '-';
        const size = String(info?.size || 0).padStart(6);
        const date = info ? formatDate(info.created_at) : '';
        const icon = item.type === 'dir' ? '📁' : '📄';
        lines.push(result(`${typeChar}  ${size}  ${date}  ${item.name}`, icon));
      }
      return { output: lines, path: fs.getCurrentPath() };
    }

    return {
      output: items.map(item => result(item.name, item.type === 'dir' ? '📁' : '📄')),
      path: fs.getCurrentPath(),
    };
  },

  cd: (args: string[]) => {
    if (args.length === 0) {
      fs.setCurrentPath('/');
      return {
        output: [],
        path: fs.getCurrentPath(),
      };
    }
    const targetPath = args[0];
    if (!fs.exists(targetPath)) {
      return {
        output: [error(`cd: ${targetPath}: No such file or directory`)],
        path: fs.getCurrentPath(),
      };
    }
    if (fs.getType(targetPath) !== 'dir') {
      return {
        output: [error(`cd: ${targetPath}: Not a directory`)],
        path: fs.getCurrentPath(),
      };
    }
    fs.setCurrentPath(targetPath);
    return {
      output: [],
      path: fs.getCurrentPath(),
    };
  },

  mkdir: (args: string[]) => {
    if (args.length === 0) {
      return {
        output: [error('mkdir: missing operand')],
        path: fs.getCurrentPath(),
      };
    }
    const dirName = args[0];
    if (fs.exists(dirName)) {
      return {
        output: [error(`mkdir: cannot create directory '${dirName}': File exists`)],
        path: fs.getCurrentPath(),
      };
    }
    fs.createDirectory(dirName);
    return {
      output: [],
      path: fs.getCurrentPath(),
    };
  },

  touch: (args: string[]) => {
    if (args.length === 0) {
      return {
        output: [error('touch: missing file operand')],
        path: fs.getCurrentPath(),
      };
    }
    const fileName = args[0];
    if (!fs.exists(fileName)) {
      fs.createFile(fileName);
    }
    return {
      output: [],
      path: fs.getCurrentPath(),
    };
  },

  cat: (args: string[]) => {
    if (args.length === 0) {
      return {
        output: [error('cat: missing file operand')],
        path: fs.getCurrentPath(),
      };
    }
    const fileName = args[0];
    if (!fs.exists(fileName)) {
      return {
        output: [error(`cat: ${fileName}: No such file or directory`)],
        path: fs.getCurrentPath(),
      };
    }
    if (fs.getType(fileName) === 'dir') {
      return {
        output: [error(`cat: ${fileName}: Is a directory`)],
        path: fs.getCurrentPath(),
      };
    }
    const content = fs.readFile(fileName);
    return {
      output: content ? [result(content)] : [],
      path: fs.getCurrentPath(),
    };
  },

  rm: (args: string[]) => {
    const { flags, positional } = parseArgs(args);
    const recursive = flags.includes('r') || flags.includes('R');
    const force = flags.includes('f');

    if (positional.length === 0) {
      return {
        output: [error('rm: missing operand')],
        path: fs.getCurrentPath(),
      };
    }

    const target = positional[0];
    if (!fs.exists(target)) {
      if (!force) {
        return {
          output: [error(`rm: cannot remove '${target}': No such file or directory`)],
          path: fs.getCurrentPath(),
        };
      }
      return { output: [], path: fs.getCurrentPath() };
    }

    const type = fs.getType(target);
    if (type === 'dir' && !recursive) {
      return {
        output: [error(`rm: cannot remove '${target}': Is a directory`)],
        path: fs.getCurrentPath(),
      };
    }

    const success = fs.delete(target, recursive);
    if (!success && !force) {
      return {
        output: [error(`rm: failed to remove '${target}'`)],
        path: fs.getCurrentPath(),
      };
    }

    return { output: [], path: fs.getCurrentPath() };
  },

  mv: (args: string[]) => {
    if (args.length < 2) {
      return {
        output: [error('mv: missing operand')],
        path: fs.getCurrentPath(),
      };
    }

    const source = args[0];
    const destination = args[1];

    if (!fs.exists(source)) {
      return {
        output: [error(`mv: cannot stat '${source}': No such file or directory`)],
        path: fs.getCurrentPath(),
      };
    }

    const success = fs.move(source, destination);
    if (!success) {
      return {
        output: [error(`mv: cannot move '${source}' to '${destination}'`)],
        path: fs.getCurrentPath(),
      };
    }

    return { output: [], path: fs.getCurrentPath() };
  },

  cp: (args: string[]) => {
    if (args.length < 2) {
      return {
        output: [error('cp: missing operand')],
        path: fs.getCurrentPath(),
      };
    }

    const source = args[0];
    const destination = args[1];

    if (!fs.exists(source)) {
      return {
        output: [error(`cp: cannot stat '${source}': No such file or directory`)],
        path: fs.getCurrentPath(),
      };
    }

    const success = fs.copy(source, destination);
    if (!success) {
      return {
        output: [error(`cp: cannot copy '${source}' to '${destination}'`)],
        path: fs.getCurrentPath(),
      };
    }

    return { output: [], path: fs.getCurrentPath() };
  },

  echo: (args: string[]) => {
    return {
      output: [result(args.join(' '))],
      path: fs.getCurrentPath(),
    };
  },

  whoami: () => ({
    output: [result('root')],
    path: fs.getCurrentPath(),
  }),

  hostname: () => ({
    output: [result('web-cli')],
    path: fs.getCurrentPath(),
  }),

  uname: () => ({
    output: [result('WebCLI OS 1.0.0')],
    path: fs.getCurrentPath(),
  }),

  date: () => ({
    output: [result(new Date().toString())],
    path: fs.getCurrentPath(),
  }),

  grep: (args: string[]) => {
    if (args.length < 2) {
      return {
        output: [error('grep: missing operand')],
        path: fs.getCurrentPath(),
      };
    }

    const pattern = args[0];
    const fileName = args[1];

    if (!fs.exists(fileName)) {
      return {
        output: [error(`grep: ${fileName}: No such file or directory`)],
        path: fs.getCurrentPath(),
      };
    }

    if (fs.getType(fileName) === 'dir') {
      return {
        output: [error(`grep: ${fileName}: Is a directory`)],
        path: fs.getCurrentPath(),
      };
    }

    const content = fs.readFile(fileName) || '';
    const lines = content.split('\n');
    const regex = new RegExp(pattern);
    const matches = lines.filter(line => regex.test(line));

    return {
      output: matches.map(line => result(line)),
      path: fs.getCurrentPath(),
    };
  },

  head: (args: string[]) => {
    if (args.length === 0) {
      return {
        output: [error('head: missing file operand')],
        path: fs.getCurrentPath(),
      };
    }

    const fileName = args[0];
    const count = parseInt(args[1]) || 10;

    if (!fs.exists(fileName)) {
      return {
        output: [error(`head: ${fileName}: No such file or directory`)],
        path: fs.getCurrentPath(),
      };
    }

    if (fs.getType(fileName) === 'dir') {
      return {
        output: [error(`head: ${fileName}: Is a directory`)],
        path: fs.getCurrentPath(),
      };
    }

    const content = fs.readFile(fileName) || '';
    const lines = content.split('\n').slice(0, count);

    return {
      output: lines.map(line => result(line)),
      path: fs.getCurrentPath(),
    };
  },

  tail: (args: string[]) => {
    if (args.length === 0) {
      return {
        output: [error('tail: missing file operand')],
        path: fs.getCurrentPath(),
      };
    }

    const fileName = args[0];
    const count = parseInt(args[1]) || 10;

    if (!fs.exists(fileName)) {
      return {
        output: [error(`tail: ${fileName}: No such file or directory`)],
        path: fs.getCurrentPath(),
      };
    }

    if (fs.getType(fileName) === 'dir') {
      return {
        output: [error(`tail: ${fileName}: Is a directory`)],
        path: fs.getCurrentPath(),
      };
    }

    const content = fs.readFile(fileName) || '';
    const lines = content.split('\n').slice(-count);

    return {
      output: lines.map(line => result(line)),
      path: fs.getCurrentPath(),
    };
  },

  wc: (args: string[]) => {
    if (args.length === 0) {
      return {
        output: [error('wc: missing file operand')],
        path: fs.getCurrentPath(),
      };
    }

    const fileName = args[0];

    if (!fs.exists(fileName)) {
      return {
        output: [error(`wc: ${fileName}: No such file or directory`)],
        path: fs.getCurrentPath(),
      };
    }

    if (fs.getType(fileName) === 'dir') {
      return {
        output: [error(`wc: ${fileName}: Is a directory`)],
        path: fs.getCurrentPath(),
      };
    }

    const content = fs.readFile(fileName) || '';
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter(Boolean).length;
    const chars = content.length;

    return {
      output: [result(`  ${lines}  ${words}  ${chars} ${fileName}`)],
      path: fs.getCurrentPath(),
    };
  },

  clear: () => ({
    output: [],
    path: fs.getCurrentPath(),
    clear: true,
  }),

  help: () => {
    const helpText = `
Available commands:
  pwd              Print current working directory
  ls [-la] [path]  List directory contents
  cd [path]        Change working directory
  mkdir <name>     Create a new directory
  touch <name>     Create a new empty file
  cat <file>       Display file contents
  rm [-rf] <path>  Remove files or directories
  mv <src> <dest>  Move/rename files or directories
  cp <src> <dest>  Copy files or directories
  echo <text>      Display text
  whoami           Print current user name
  hostname         Print hostname
  uname            Print system information
  date             Print current date and time
  grep <pattern> <file>  Search for pattern in file
  head [-n] <file> Print first lines of file
  tail [-n] <file> Print last lines of file
  wc <file>        Count lines, words, characters
  clear            Clear the terminal screen
  help             Show this help message
    `.trim();
    return {
      output: [info(helpText)],
      path: fs.getCurrentPath(),
    };
  },
};

export function executeCommand(input: string): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { output: [], path: fs.getCurrentPath() };
  }

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  const handler = commands[cmd];
  if (handler === undefined) {
    return {
      output: [error(`${cmd}: command not found`)],
      path: fs.getCurrentPath(),
    };
  }

  return handler(args);
}

export function getCurrentPath(): string {
  return fs.getCurrentPath();
}

export function getCompletions(partial: string, path: string): string[] {
  const commandCompletions = Object.keys(commands).filter(cmd => cmd.startsWith(partial));
  
  const fileCompletions = fs.listDirectory(path)
    .filter(item => item.name.startsWith(partial))
    .map(item => item.type === 'dir' ? `${item.name}/` : item.name);

  return [...new Set([...commandCompletions, ...fileCompletions])];
}
