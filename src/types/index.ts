export type AnimationPhase = 
  | 'idle'
  | 'register'
  | 'match_route'
  | 'load_resources'
  | 'create_sandbox'
  | 'mount_app'
  | 'lifecycle_running'
  | 'route_switch'
  | 'communication'
  | 'unmount'
  | 'destroy';

export type ArchitectureType = 'monolith' | 'microfrontend';

export interface SubApp {
  id: string;
  name: string;
  route: string;
  color: string;
  status: 'idle' | 'loading' | 'active' | 'unmounted';
}

export interface AnimationStep {
  id: string;
  phase: AnimationPhase;
  title: string;
  description: string;
  duration: number;
  details: string[];
}

export interface AnimationState {
  currentStep: number;
  isPlaying: boolean;
  isPaused: boolean;
  speed: number;
  architectureType: ArchitectureType;
  activeApp: string | null;
  communicationData: { from: string; to: string; message: string } | null;
}

export const ANIMATION_STEPS: AnimationStep[] = [
  {
    id: 'register',
    phase: 'register',
    title: '子应用注册',
    description: '主应用加载子应用配置信息',
    duration: 2000,
    details: [
      '主应用启动，读取子应用注册表',
      '解析各子应用的 entry、路由规则',
      '建立子应用路由映射表',
      '初始化应用管理容器'
    ]
  },
  {
    id: 'match_route',
    phase: 'match_route',
    title: '路由匹配',
    description: '主应用路由系统匹配子应用',
    duration: 1500,
    details: [
      '用户访问 /app1/xxx 路由',
      '主应用 Router 捕获路由变化',
      '查询路由映射表，匹配到 App1',
      '触发子应用激活逻辑'
    ]
  },
  {
    id: 'load_resources',
    phase: 'load_resources',
    title: '动态资源加载',
    description: '加载子应用的 JS/CSS 资源',
    duration: 2500,
    details: [
      '请求子应用入口 HTML/JS/CSS',
      '解析资源依赖，创建 script/link 标签',
      '通过 JSONP 或 SystemJS 加载模块',
      '资源加载完成，准备执行'
    ]
  },
  {
    id: 'create_sandbox',
    phase: 'create_sandbox',
    title: 'JS 沙箱创建',
    description: '创建隔离的 JavaScript 执行环境',
    duration: 2000,
    details: [
      '创建 Proxy 代理 window 对象',
      '拦截全局变量读写操作',
      '建立样式隔离机制（Shadow DOM）',
      '配置事件监听隔离'
    ]
  },
  {
    id: 'mount_app',
    phase: 'mount_app',
    title: '子应用挂载',
    description: '子应用渲染到指定 DOM 节点',
    duration: 2000,
    details: [
      '调用子应用 bootstrap 生命周期',
      '调用子应用 mount 方法',
      '子应用渲染到 #micro-app-container',
      '触发 mounted 生命周期钩子'
    ]
  },
  {
    id: 'lifecycle_running',
    phase: 'lifecycle_running',
    title: '生命周期运行',
    description: '子应用独立运行，主应用监控',
    duration: 3000,
    details: [
      '子应用内部路由独立管理',
      '沙箱内 JS 独立执行',
      '样式隔离互不干扰',
      '主应用可获取子应用状态'
    ]
  },
  {
    id: 'route_switch',
    phase: 'route_switch',
    title: '路由切换',
    description: '切换到另一个子应用',
    duration: 2000,
    details: [
      '用户点击导航切换到 /app2',
      '主应用路由系统捕获变化',
      '匹配到 App2，准备切换',
      '触发应用切换流程'
    ]
  },
  {
    id: 'communication',
    phase: 'communication',
    title: '跨应用通信',
    description: '主应用与子应用间数据传递',
    duration: 2500,
    details: [
      '基于 CustomEvent 建立通信总线',
      '主应用发布全局状态变化事件',
      '子应用订阅并响应事件',
      '子应用可发布事件给主应用'
    ]
  },
  {
    id: 'unmount',
    phase: 'unmount',
    title: '子应用卸载',
    description: '子应用从 DOM 中移除',
    duration: 2000,
    details: [
      '调用子应用 unmount 生命周期',
      '移除子应用 DOM 节点',
      '清理事件监听器和定时器',
      '重置路由状态'
    ]
  },
  {
    id: 'destroy',
    phase: 'destroy',
    title: '资源销毁',
    description: '彻底清理子应用资源',
    duration: 1500,
    details: [
      '销毁 JS 沙箱 Proxy',
      '释放样式隔离容器',
      '卸载动态加载的脚本和样式',
      '从应用注册表中移除'
    ]
  }
];

export const SUB_APPS: SubApp[] = [
  { id: 'app1', name: '商品中心', route: '/app1', color: '#6366f1', status: 'idle' },
  { id: 'app2', name: '订单系统', route: '/app2', color: '#10b981', status: 'idle' },
  { id: 'app3', name: '用户中心', route: '/app3', color: '#f59e0b', status: 'idle' },
];

export const MONOLITH_VS_MICROFRONTEND = {
  monolith: {
    title: '单体架构',
    characteristics: [
      '所有功能模块打包在一起',
      '共享同一个 DOM 和全局作用域',
      '部署时需要整体重新打包',
      '技术栈必须统一',
      '模块间耦合度高',
      '维护成本随规模增大而激增'
    ],
    pros: ['开发初期效率高', '部署简单', '调试方便'],
    cons: ['构建时间长', '部署风险大', '技术债务累积快', '团队协作困难']
  },
  microfrontend: {
    title: '微前端架构',
    characteristics: [
      '各子应用独立开发、独立构建',
      '每个子应用有独立的运行环境',
      '按需加载，动态挂载',
      '技术栈无关，可混用 React/Vue/Angular',
      '团队自治，各自负责独立业务域',
      '增量升级，风险可控'
    ],
    pros: ['独立部署', '技术栈灵活', '团队自治', '按需加载', '增量升级'],
    cons: ['增加一定的复杂度', '需要处理应用间通信', '样式隔离需要额外处理']
  }
};
