import { fs } from './filesystem';

interface CommandResult {
  output: string;
  path: string;
  clear?: boolean;
}

type CommandHandler = (args: string[]) => CommandResult;

const commands: Record<string, CommandHandler> = {
  pwd: () => ({
    output: fs.getCurrentPath(),
    path: fs.getCurrentPath(),
  }),

  ls: (args: string[]) => {
    const targetPath = args[0] || '';
    if (!fs.exists(targetPath) && targetPath) {
      return {
        output: `ls: cannot access '${targetPath}': No such file or directory`,
        path: fs.getCurrentPath(),
      };
    }
    if (targetPath && fs.getType(targetPath) === 'file') {
      return {
        output: targetPath,
        path: fs.getCurrentPath(),
      };
    }
    const items = fs.listDirectory(targetPath);
    const output = items.map(item => 
      item.type === 'dir' ? `${item.name}/` : item.name
    ).join('  ');
    return {
      output: output || '',
      path: fs.getCurrentPath(),
    };
  },

  cd: (args: string[]) => {
    if (args.length === 0) {
      fs.setCurrentPath('/');
      return {
        output: '',
        path: fs.getCurrentPath(),
      };
    }
    const targetPath = args[0];
    if (!fs.exists(targetPath)) {
      return {
        output: `cd: ${targetPath}: No such file or directory`,
        path: fs.getCurrentPath(),
      };
    }
    if (fs.getType(targetPath) !== 'dir') {
      return {
        output: `cd: ${targetPath}: Not a directory`,
        path: fs.getCurrentPath(),
      };
    }
    fs.setCurrentPath(targetPath);
    return {
      output: '',
      path: fs.getCurrentPath(),
    };
  },

  mkdir: (args: string[]) => {
    if (args.length === 0) {
      return {
        output: 'mkdir: missing operand',
        path: fs.getCurrentPath(),
      };
    }
    const dirName = args[0];
    if (fs.exists(dirName)) {
      return {
        output: `mkdir: cannot create directory '${dirName}': File exists`,
        path: fs.getCurrentPath(),
      };
    }
    fs.createDirectory(dirName);
    return {
      output: '',
      path: fs.getCurrentPath(),
    };
  },

  touch: (args: string[]) => {
    if (args.length === 0) {
      return {
        output: 'touch: missing file operand',
        path: fs.getCurrentPath(),
      };
    }
    const fileName = args[0];
    if (fs.exists(fileName)) {
      return {
        output: '',
        path: fs.getCurrentPath(),
      };
    }
    fs.createFile(fileName);
    return {
      output: '',
      path: fs.getCurrentPath(),
    };
  },

  cat: (args: string[]) => {
    if (args.length === 0) {
      return {
        output: 'cat: missing file operand',
        path: fs.getCurrentPath(),
      };
    }
    const fileName = args[0];
    if (!fs.exists(fileName)) {
      return {
        output: `cat: ${fileName}: No such file or directory`,
        path: fs.getCurrentPath(),
      };
    }
    if (fs.getType(fileName) === 'dir') {
      return {
        output: `cat: ${fileName}: Is a directory`,
        path: fs.getCurrentPath(),
      };
    }
    const content = fs.readFile(fileName);
    return {
      output: content ?? '',
      path: fs.getCurrentPath(),
    };
  },

  clear: () => ({
    output: '',
    path: fs.getCurrentPath(),
    clear: true,
  }),

  help: () => {
    const helpText = `
Available commands:
  pwd              Print current working directory
  ls [path]        List directory contents
  cd [path]        Change working directory
  mkdir <name>     Create a new directory
  touch <name>     Create a new empty file
  cat <file>       Display file contents
  clear            Clear the terminal screen
  help             Show this help message
    `.trim();
    return {
      output: helpText,
      path: fs.getCurrentPath(),
    };
  },
};

export function executeCommand(input: string): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { output: '', path: fs.getCurrentPath() };
  }

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  const handler = commands[cmd];
  if (handler === undefined) {
    return {
      output: `${cmd}: command not found`,
      path: fs.getCurrentPath(),
    };
  }

  return handler(args);
}

export function getCurrentPath(): string {
  return fs.getCurrentPath();
}
