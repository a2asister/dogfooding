export interface MicroApp {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: string;
  author: string;
  status: AppStatus;
  createdAt: string;
  updatedAt: string;
  currentVersion: string;
  versions: AppVersion[];
  routes: AppRoute[];
  sandboxConfig: SandboxConfig;
}

export interface AppVersion {
  id: string;
  version: string;
  name: string;
  description: string;
  entry: string;
  status: VersionStatus;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  changelog: string;
  dependencies: Record<string, string>;
}

export interface AppRoute {
  id: string;
  path: string;
  name: string;
  title: string;
  icon: string;
  order: number;
  visibleInMenu: boolean;
  parentId?: string;
  meta: Record<string, unknown>;
}

export interface SandboxConfig {
  enabled: boolean;
  strictStyleIsolation: boolean;
  experimentalStyleIsolation: boolean;
  excludeAssetFilter?: (assetUrl: string) => boolean;
  props: Record<string, unknown>;
}

export type AppStatus = 
  | 'developing'
  | 'testing'
  | 'staging'
  | 'production'
  | 'disabled';

export type VersionStatus = 
  | 'draft'
  | 'published'
  | 'archived'
  | 'deprecated';

export interface AppRegistry {
  apps: MicroApp[];
  getAppById(id: string): MicroApp | undefined;
  getAppByName(name: string): MicroApp | undefined;
  registerApp(app: MicroApp): void;
  updateApp(app: MicroApp): void;
  removeApp(id: string): void;
}

export interface RouteRegistry {
  routes: Map<string, AppRoute[]>;
  registerRoutes(appName: string, routes: AppRoute[]): void;
  getRoutes(appName: string): AppRoute[];
  getAllRoutes(): Map<string, AppRoute[]>;
}

export interface LifecycleProps {
  container?: HTMLElement;
  [key: string]: unknown;
}

export interface MicroAppLifecycle {
  bootstrap: (props: LifecycleProps) => Promise<void>;
  mount: (props: LifecycleProps) => Promise<void>;
  unmount: (props: LifecycleProps) => Promise<void>;
  update?: (props: LifecycleProps) => Promise<void>;
}
