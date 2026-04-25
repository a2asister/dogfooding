export type PhaseType = 'dev' | 'build';

export type ModuleType = 
  | 'app' 
  | 'component' 
  | 'utility' 
  | 'style' 
  | 'asset' 
  | 'node_module'
  | 'entry';

export interface ModuleNode {
  id: string;
  name: string;
  type: ModuleType;
  isNodeModule?: boolean;
  isOptimized?: boolean;
  size?: number;
  imports: string[];
  position: { x: number; y: number };
}

export interface AnimationStep {
  id: string;
  phase: PhaseType;
  title: string;
  description: string;
  duration: number;
  key: string;
}

export interface Connection {
  from: string;
  to: string;
  type: 'import' | 'dependency' | 'output';
}

export interface ControlState {
  isPlaying: boolean;
  currentStepIndex: number;
  speed: 0.5 | 1 | 1.5 | 2;
  currentPhase: PhaseType;
}

export type ActionType =
  | 'init_project'
  | 'scan_dependencies'
  | 'optimize_deps'
  | 'start_dev_server'
  | 'esbuild_transform'
  | 'module_resolution'
  | 'hmr_file_change'
  | 'hmr_update'
  | 'hmr_reload'
  | 'start_build'
  | 'rollup_analyze'
  | 'code_transform'
  | 'tree_shaking'
  | 'code_splitting'
  | 'chunk_generation'
  | 'asset_optimization'
  | 'dist_output';
