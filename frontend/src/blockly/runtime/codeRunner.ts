export interface TurtleState {
  x: number;
  y: number;
  angle: number;
  penDown: boolean;
  color: string;
}

export interface RunOptions {
  onLog?: (message: string) => void;
  onError?: (error: string) => void;
  onTurtleUpdate?: (state: TurtleState) => void;
  onComplete?: () => void;
  canvas?: HTMLCanvasElement;
}

export class CodeRunner {
  private isRunning = false;
  private isPaused = false;
  private shouldStop = false;
  private pauseResolve: (() => void) | null = null;
  private turtleState: TurtleState = {
    x: 200,
    y: 200,
    angle: 0,
    penDown: true,
    color: '#ff0000',
  };
  private canvasCtx: CanvasRenderingContext2D | null = null;

  constructor(private options: RunOptions = {}) {
    if (options.canvas) {
      this.canvasCtx = options.canvas.getContext('2d');
      this.resetCanvas();
    }
  }

  private resetCanvas() {
    if (this.canvasCtx && this.options.canvas) {
      const width = this.options.canvas.width;
      const height = this.options.canvas.height;
      this.canvasCtx.fillStyle = '#ffffff';
      this.canvasCtx.fillRect(0, 0, width, height);
      this.turtleState = {
        x: width / 2,
        y: height / 2,
        angle: 0,
        penDown: true,
        color: '#ff0000',
      };
    }
  }

  private createTurtleAPI() {
    return {
      move: (steps: number) => {
        const radians = (this.turtleState.angle * Math.PI) / 180;
        const newX = this.turtleState.x + Math.cos(radians) * steps;
        const newY = this.turtleState.y + Math.sin(radians) * steps;

        if (this.turtleState.penDown && this.canvasCtx) {
          this.canvasCtx.beginPath();
          this.canvasCtx.strokeStyle = this.turtleState.color;
          this.canvasCtx.lineWidth = 2;
          this.canvasCtx.moveTo(this.turtleState.x, this.turtleState.y);
          this.canvasCtx.lineTo(newX, newY);
          this.canvasCtx.stroke();
        }

        this.turtleState.x = newX;
        this.turtleState.y = newY;
        this.options.onTurtleUpdate?.(this.turtleState);
      },
      turn: (direction: 'left' | 'right', angle: number) => {
        if (direction === 'left') {
          this.turtleState.angle -= angle;
        } else {
          this.turtleState.angle += angle;
        }
        this.options.onTurtleUpdate?.(this.turtleState);
      },
      pen: (state: 'up' | 'down') => {
        this.turtleState.penDown = state === 'down';
      },
      setColor: (color: string) => {
        this.turtleState.color = color;
      },
      reset: () => {
        this.resetCanvas();
        this.options.onTurtleUpdate?.(this.turtleState);
      },
    };
  }

  async run(code: string) {
    this.isRunning = true;
    this.isPaused = false;
    this.shouldStop = false;
    this.resetCanvas();

    const originalLog = console.log;
    const logs: string[] = [];

    console.log = (...args: unknown[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      logs.push(message);
      this.options.onLog?.(message);
      originalLog.apply(console, args);
    };

    try {
      const turtleAPI = this.createTurtleAPI();
      const wrappedCode = `
        "use strict";
        return (async function(__turtle__) {
          ${code}
        })(__turtle__);
      `;

      const asyncFunction = new Function('__turtle__', wrappedCode);
      const result = await asyncFunction(turtleAPI);
      
      this.options.onComplete?.();
      return { success: true, logs, result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.options.onError?.(errorMessage);
      return { success: false, logs, error: errorMessage };
    } finally {
      console.log = originalLog;
      this.isRunning = false;
    }
  }

  pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
    }
  }

  resume() {
    if (this.isPaused && this.pauseResolve) {
      this.isPaused = false;
      this.pauseResolve();
      this.pauseResolve = null;
    }
  }

  stop() {
    this.shouldStop = true;
    if (this.pauseResolve) {
      this.pauseResolve();
      this.pauseResolve = null;
    }
  }

  getState() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      turtleState: this.turtleState,
    };
  }

  private async checkPause() {
    if (this.isPaused) {
      await new Promise<void>((resolve) => {
        this.pauseResolve = resolve;
      });
    }
    if (this.shouldStop) {
      throw new Error('Execution stopped');
    }
  }
}

export const createCodeRunner = (options?: RunOptions) => {
  return new CodeRunner(options);
};
