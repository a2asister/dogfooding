import type { TechNode, NodeConnection, TimelineMarker } from '../types';

export const techNodes: TechNode[] = [
  {
    id: 'vanilla-js',
    name: 'vanilla-js',
    displayName: '原生 JavaScript',
    category: 'vanilla',
    description: 'Web 开发的基础，无需任何框架的原生 JavaScript',
    longDescription: '原生 JavaScript 是所有前端开发的基石。从 1995 年诞生以来，JavaScript 不断演进，从简单的脚本语言发展成为强大的全栈开发语言。ES5、ES6+ 等标准的推出，让 JavaScript 成为了现代 Web 开发的核心。',
    color: '#F7DF1E',
    timelineStart: '1995',
    timelineEnd: undefined,
    versions: [
      {
        version: 'ES5',
        releaseDate: '2009',
        features: ['严格模式', 'JSON 支持', 'Array 方法（forEach, map, filter 等）', 'Object.defineProperty'],
        codeSnippets: [
          {
            id: 'es5-array',
            title: 'ES5 数组操作',
            description: '使用 ES5 进行数组遍历和转换',
            language: 'javascript',
            code: `var numbers = [1, 2, 3, 4, 5];

// forEach 遍历
numbers.forEach(function(num) {
  console.log(num);
});

// map 转换
var doubled = numbers.map(function(num) {
  return num * 2;
});

// filter 过滤
var evens = numbers.filter(function(num) {
  return num % 2 === 0;
});`,
          },
        ],
      },
      {
        version: 'ES6+',
        releaseDate: '2015',
        features: ['箭头函数', '解构赋值', '模板字符串', 'Promise', '类（class）', '模块系统', '展开运算符'],
        breakingChanges: ['let/const 块级作用域', '箭头函数的 this 绑定'],
        codeSnippets: [
          {
            id: 'es6-arrow',
            title: 'ES6 箭头函数',
            description: '箭头函数简化函数表达式',
            language: 'javascript',
            code: `const numbers = [1, 2, 3, 4, 5];

// 箭头函数
const doubled = numbers.map(num => num * 2);

// 多行箭头函数
const sum = numbers.reduce((acc, num) => {
  return acc + num;
}, 0);`,
            comparisonTitle: 'ES5 写法对比',
            comparisonCode: `var numbers = [1, 2, 3, 4, 5];

// ES5 函数表达式
var doubled = numbers.map(function(num) {
  return num * 2;
});

var sum = numbers.reduce(function(acc, num) {
  return acc + num;
}, 0);`,
          },
        ],
      },
    ],
    keyApis: ['DOM API', 'fetch API', 'async/await', 'Promise', 'localStorage'],
    useCases: ['所有 Web 应用基础', 'DOM 操作', '事件处理', '异步请求'],
    pros: ['无依赖', '完全控制', '浏览器原生支持', '性能最优'],
    cons: ['需要手动管理 DOM', '缺少大型项目架构', '代码复用困难', '跨浏览器兼容问题'],
    relatedTechIds: [],
    influencedBy: [],
    influenced: ['jquery', 'vue', 'react', 'angularjs'],
    status: 'popular',
    iconEmoji: '⚡',
  },
  {
    id: 'jquery',
    name: 'jquery',
    displayName: 'jQuery',
    category: 'library',
    description: '简化 DOM 操作的 JavaScript 库',
    longDescription: 'jQuery 于 2006 年发布，彻底改变了前端开发方式。它提供了简洁的 API，统一了跨浏览器的 DOM 操作、事件处理、动画效果和 AJAX 请求。在那个浏览器兼容性混乱的年代，jQuery 成为了事实上的标准。',
    color: '#0769AD',
    timelineStart: '2006',
    timelineEnd: '2020',
    versions: [
      {
        version: '1.0',
        releaseDate: '2006',
        features: ['CSS 选择器', 'DOM 操作', '事件绑定', 'AJAX 封装'],
      },
      {
        version: '2.0',
        releaseDate: '2013',
        features: ['移除 IE 6-8 支持', '体积减小 20%', '性能优化'],
      },
      {
        version: '3.0',
        releaseDate: '2016',
        features: ['Promise/A+ 兼容', '更好的性能', '安全性增强'],
        codeSnippets: [
          {
            id: 'jquery-dom',
            title: 'jQuery DOM 操作',
            description: '使用 jQuery 操作 DOM 元素',
            language: 'javascript',
            code: `// DOM 选择和操作
$('#myButton').click(function() {
  $(this)
    .addClass('active')
    .siblings()
    .removeClass('active');
});

// AJAX 请求
$.ajax({
  url: '/api/data',
  method: 'GET',
  success: function(data) {
    $('#content').html(data.html);
  }
});`,
            comparisonTitle: '原生 JS 写法对比',
            comparisonCode: `// 原生 JS DOM 操作
const button = document.getElementById('myButton');
button.addEventListener('click', function() {
  this.classList.add('active');
  const siblings = Array.from(this.parentNode.children);
  siblings.forEach(sibling => {
    if (sibling !== this) {
      sibling.classList.remove('active');
    }
  });
});

// 原生 JS AJAX
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data');
xhr.onload = function() {
  document.getElementById('content').innerHTML = JSON.parse(xhr.responseText).html;
};
xhr.send();`,
          },
        ],
      },
    ],
    keyApis: ['$() 选择器', '.addClass()', '.removeClass()', '.on() 事件绑定', '$.ajax()', '.animate()'],
    useCases: ['DOM 操作', '事件处理', '动画效果', 'AJAX 请求', '跨浏览器兼容'],
    pros: ['简洁的 API', '跨浏览器兼容', '丰富的插件生态', '学习曲线平缓'],
    cons: ['性能开销', '现代浏览器原生 API 已改进', '大型项目架构问题', '逐渐被现代框架替代'],
    relatedTechIds: ['vanilla-js'],
    influencedBy: ['vanilla-js'],
    influenced: ['vue', 'react'],
    status: 'deprecated',
    iconEmoji: '🔮',
  },
  {
    id: 'angularjs',
    name: 'angularjs',
    displayName: 'AngularJS',
    category: 'framework',
    description: 'Google 推出的第一代前端 MVC 框架',
    longDescription: 'AngularJS（Angular 1.x）于 2010 年由 Google 发布，是第一个真正意义上的前端 MVC 框架。它引入了双向数据绑定、依赖注入、指令系统等概念，彻底改变了前端开发的思维方式。',
    color: '#E23237',
    timelineStart: '2010',
    timelineEnd: '2018',
    versions: [
      {
        version: '1.0',
        releaseDate: '2012',
        features: ['双向数据绑定', 'MVC 架构', '依赖注入', '指令系统'],
      },
      {
        version: '1.5',
        releaseDate: '2016',
        features: ['组件化', '生命周期钩子', '性能优化'],
        codeSnippets: [
          {
            id: 'angularjs-controller',
            title: 'AngularJS 控制器',
            description: 'AngularJS MVC 模式示例',
            language: 'javascript',
            code: `angular.module('myApp', [])
  .controller('TodoController', function($scope) {
    $scope.todos = [
      { text: '学习 AngularJS', done: true },
      { text: '构建应用', done: false }
    ];

    $scope.addTodo = function() {
      if ($scope.todoText) {
        $scope.todos.push({
          text: $scope.todoText,
          done: false
        });
        $scope.todoText = '';
      }
    };

    $scope.remaining = function() {
      return $scope.todos.filter(todo => !todo.done).length;
    };
  });`,
          },
        ],
      },
    ],
    keyApis: ['ng-app', 'ng-controller', 'ng-model', 'ng-repeat', '$scope', 'directive'],
    useCases: ['企业级应用', '数据驱动 UI', 'SPA 单页应用'],
    pros: ['完整的框架', '强大的数据绑定', '依赖注入', 'Google 背书'],
    cons: ['性能问题（脏检查机制', '学习曲线陡峭', '与 Angular 2+ 不兼容', '架构复杂'],
    relatedTechIds: ['vanilla-js', 'jquery'],
    influencedBy: ['vanilla-js'],
    influenced: ['angular', 'vue', 'react'],
    status: 'deprecated',
    iconEmoji: '🔴',
  },
  {
    id: 'react',
    name: 'react',
    displayName: 'React',
    category: 'framework',
    description: 'Facebook 推出的声明式 UI 库',
    longDescription: 'React 于 2013 年由 Facebook 开源，引入了虚拟 DOM 和组件化思想。它的声明式编程模型和单向数据流改变了前端开发的范式。React 不仅是一个库，更是一个完整的生态系统。',
    color: '#61DAFB',
    timelineStart: '2013',
    timelineEnd: undefined,
    versions: [
      {
        version: '0.14',
        releaseDate: '2015',
        features: ['ReactDOM 分离', '无状态函数组件', 'JSX 改进'],
      },
      {
        version: '15.0',
        releaseDate: '2016',
        features: ['Fiber 架构预览', 'SVG 支持', '性能优化'],
      },
      {
        version: '16.0',
        releaseDate: '2017',
        features: ['Fiber 架构', '错误边界', 'Portals', 'Fragment'],
      },
      {
        version: '16.8',
        releaseDate: '2019',
        features: ['Hooks', '函数组件状态管理', 'useState', 'useEffect'],
        codeSnippets: [
          {
            id: 'react-hooks',
            title: 'React Hooks',
            description: '使用 Hooks 管理组件状态',
            language: 'typescript',
            code: `import React, { useState, useEffect } from 'react';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputText.trim()) {
      setTodos([
        ...todos,
        { id: Date.now(), text: inputText, done: false }
      ]);
      setInputText('');
    }
  };

  return (
    <div>
      <input
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && addTodo()}
      />
      <button onClick={addTodo}>添加</button>
      <ul>
        {todos.map(todo => (
        <li
          key={todo.id}
          style={{ textDecoration: todo.done ? 'line-through' : 'none' }}
          onClick={() => setTodos(todos.map(t =>
            t.id === todo.id ? { ...t, done: !t.done } : t
          ))}
        >
          {todo.text}
        </li>
      ))}
      </ul>
    </div>
  );
}`,
            comparisonTitle: 'Vue 3 Composition API 对比',
            comparisonCode: `<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

const todos = ref<Todo[]>([]);
const inputText = ref('');

onMounted(() => {
  const saved = localStorage.getItem('todos');
  if (saved) {
    todos.value = JSON.parse(saved);
  }
});

watch(todos, (newTodos) => {
  localStorage.setItem('todos', JSON.stringify(newTodos));
}, { deep: true });

function addTodo() {
  if (inputText.value.trim()) {
    todos.value.push({
      id: Date.now(),
      text: inputText.value,
      done: false
    });
    inputText.value = '';
  }
}

function toggleTodo(todo: Todo) {
  todo.done = !todo.done;
}
</script>

<template>
  <div>
    <input
      v-model="inputText"
      @keyup.enter="addTodo"
    />
    <button @click="addTodo">添加</button>
    <ul>
      <li
        v-for="todo in todos"
        :key="todo.id"
        :style="{ textDecoration: todo.done ? 'line-through' : 'none' }"
        @click="toggleTodo(todo)"
      >
        {{ todo.text }}
      </li>
    </ul>
  </div>
</template>`,
          },
        ],
      },
      {
        version: '18.0',
        releaseDate: '2022',
        features: ['并发渲染', '自动批处理', 'Suspense 改进', 'useTransition', 'useDeferredValue'],
      },
      {
        version: '19.0',
        releaseDate: '2024',
        features: ['Server Components', 'Actions', 'use() Hook', '表单优化'],
      },
    ],
    keyApis: ['useState', 'useEffect', 'useContext', 'useReducer', 'useMemo', 'useCallback', 'React.memo'],
    useCases: ['单页应用', '服务端渲染', '移动应用（React Native）', '渐进式采用'],
    pros: ['虚拟 DOM 性能', '组件化思想', '丰富的生态系统', '强大的工具链', '社区活跃'],
    cons: ['学习曲线（JSX, Hooks）', '需要额外的状态管理库', 'SEO 需要额外处理'],
    relatedTechIds: ['vanilla-js', 'redux', 'nextjs'],
    influencedBy: ['vanilla-js', 'angularjs', 'xhp'],
    influenced: ['vue3', 'svelte', 'solid'],
    status: 'popular',
    iconEmoji: '⚛️',
  },
  {
    id: 'vue',
    name: 'vue',
    displayName: 'Vue.js',
    category: 'framework',
    description: '渐进式 JavaScript 框架',
    longDescription: 'Vue.js 由尤雨溪于 2014 年创建，以其渐进式、易上手的特性深受开发者喜爱。Vue 结合了 Angular 的模板语法和 React 的虚拟 DOM，提供了直观的 API 和优秀的文档。',
    color: '#4FC08D',
    timelineStart: '2014',
    timelineEnd: undefined,
    versions: [
      {
        version: '1.0',
        releaseDate: '2015',
        features: ['响应式数据绑定', '指令系统', '组件系统'],
      },
      {
        version: '2.0',
        releaseDate: '2016',
        features: ['虚拟 DOM', '服务端渲染', '性能提升'],
        codeSnippets: [
          {
            id: 'vue2-component',
            title: 'Vue 2 组件',
            description: 'Vue 2 Options API 示例',
            language: 'javascript',
            code: `<template>
  <div class="counter">
    <p>计数: {{ count }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
  </div>
</template>

<script>
export default {
  name: 'Counter',
  data() {
    return {
      count: 0
    };
  },
  methods: {
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    }
  },
  computed: {
    doubled() {
      return this.count * 2;
    }
  }
};
</script>`,
          },
        ],
      },
      {
        version: '3.0',
        releaseDate: '2020',
        features: ['Composition API', '性能优化', 'TypeScript 支持', 'Teleport', 'Suspense'],
        codeSnippets: [
          {
            id: 'vue3-composition',
            title: 'Vue 3 Composition API',
            description: '使用 Composition API 构建组件',
            language: 'typescript',
            code: `<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const count = ref(0);
const isEven = computed(() => count.value % 2 === 0);

function increment() {
  count.value++;
}

function decrement() {
  count.value--;
}

let timer: number;
onMounted(() => {
  timer = window.setInterval(() => {
    console.log('组件已挂载');
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <div class="counter">
    <p>计数: {{ count }}</p>
    <p>当前是 {{ isEven ? '偶数' : '奇数' }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
  </div>
</template>`,
          },
        ],
      },
      {
        version: '3.4',
        releaseDate: '2024',
        features: ['响应式改进', 'defineModel', '性能提升'],
      },
    ],
    keyApis: ['ref', 'reactive', 'computed', 'watch', 'onMounted', 'provide/inject'],
    useCases: ['单页应用', '服务端渲染（Nuxt）', '渐进式采用', '小型项目'],
    pros: ['学习曲线平缓', '文档完善', '响应式系统', '模板语法直观', '灵活的架构'],
    cons: ['企业级生态相对较小', '大型项目架构需要更多考量'],
    relatedTechIds: ['vanilla-js', 'vuex', 'pinia'],
    influencedBy: ['angularjs', 'react', 'knockout'],
    influenced: ['svelte', 'solid'],
    status: 'popular',
    iconEmoji: '💚',
  },
  {
    id: 'angular',
    name: 'angular',
    displayName: 'Angular',
    category: 'framework',
    description: 'Google 推出的现代前端框架（Angular 2+',
    longDescription: 'Angular（原 Angular 2+）是一个完整的前端框架，完全重写自 AngularJS。它使用 TypeScript 作为默认语言，提供了完整的解决方案，包括路由、表单、HTTP 客户端、动画等模块。',
    color: '#DD0031',
    timelineStart: '2016',
    timelineEnd: undefined,
    versions: [
      {
        version: '2.0',
        releaseDate: '2016',
        features: ['TypeScript 优先', '组件化架构', 'RxJS 集成', '模块化设计'],
      },
      {
        version: '4.0',
        releaseDate: '2017',
        features: ['更小的包体积', '动画改进', 'HttpClient 模块'],
      },
      {
        version: '6.0',
        releaseDate: '2018',
        features: ['Angular Elements', 'CLI 改进', 'RxJS 6'],
      },
      {
        version: '8.0',
        releaseDate: '2019',
        features: ['差异化加载', 'Web Worker 支持', 'CLI 构建优化'],
      },
      {
        version: '9.0',
        releaseDate: '2020',
        features: ['Ivy 编译器', '更小的构建体积', '更快的编译速度'],
      },
      {
        version: '14+',
        releaseDate: '2022',
        features: ['独立组件', '信号（Signals）', '控制流语法'],
        codeSnippets: [
          {
            id: 'angular-standalone',
            title: 'Angular 独立组件',
            description: 'Angular 独立组件与信号示例',
            language: 'typescript',
            code: `import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="todo-container">
      <input
        #todoInput
        (keyup.enter)="addTodo(todoInput.value); todoInput.value = ''"
        placeholder="添加新任务..."
      />
      <button (click)="addTodo(todoInput.value); todoInput.value = ''">
        添加
      </button>

      <ul>
        @for (todo of todos(); track todo.id) {
          <li
            [class.completed]="todo.done"
            (click)="toggleTodo(todo.id)"
          >
            {{ todo.text }}
          </li>
        }
      </ul>

      <p>剩余: {{ remaining() }}</p>
    </div>
  \`
})
export class TodoListComponent {
  private todosSignal = signal<{ id: number; text: string; done: boolean }[]>([
    { id: 1, text: '学习 Angular', done: true },
    { id: 2, text: '使用信号', done: false }
  ]);

  todos = this.todosSignal.asReadonly();
  remaining = computed(() => 
    this.todos().filter(t => !t.done).length
  );

  addTodo(text: string) {
    if (text.trim()) {
      this.todosSignal.update(todos => [
        ...todos,
        { id: Date.now(), text, done: false }
      ]);
    }
  }

  toggleTodo(id: number) {
    this.todosSignal.update(todos =>
      todos.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    );
  }
}`,
          },
        ],
      },
    ],
    keyApis: ['@Component', '@Injectable', 'NgModule', 'HttpClient', 'Router', 'FormsModule', '信号（Signals）'],
    useCases: ['企业级应用', '大型团队协作', '完整的解决方案'],
    pros: ['完整的框架', 'TypeScript 原生支持', '强大的 CLI', '企业级支持'],
    cons: ['学习曲线陡峭', '包体积较大', '灵活性相对较低'],
    relatedTechIds: ['typescript', 'rxjs'],
    influencedBy: ['angularjs', 'typescript'],
    influenced: [],
    status: 'maintaining',
    iconEmoji: '🔺',
  },
  {
    id: 'vite',
    name: 'vite',
    displayName: 'Vite',
    category: 'build-tool',
    description: '下一代前端开发与构建工具',
    longDescription: 'Vite 由尤雨溪于 2020 年创建，利用浏览器原生 ES 模块实现极速的开发体验。它在开发环境中使用 esbuild 进行预构建，生产环境使用 Rollup 打包，彻底改变了前端开发的构建体验。',
    color: '#646CFF',
    timelineStart: '2020',
    timelineEnd: undefined,
    versions: [
      {
        version: '1.0',
        releaseDate: '2021',
        features: ['开发服务器', 'HMR', '预构建优化', '插件系统'],
      },
      {
        version: '2.0',
        releaseDate: '2022',
        features: ['SSR 支持', '库模式', 'CSS 代码分割'],
      },
      {
        version: '3.0',
        releaseDate: '2023',
        features: ['性能优化', '环境变量改进', '插件 API 增强'],
      },
      {
        version: '4.0',
        releaseDate: '2024',
        features: ['Rollup 4', '环境变量改进', '性能提升'],
      },
      {
        version: '5.0',
        releaseDate: '2024',
        features: ['更快的 HMR', '优化的依赖预构建', '热更新改进'],
        codeSnippets: [
          {
            id: 'vite-config',
            title: 'Vite 配置',
            description: 'vite.config.ts 配置示例',
            language: 'typescript',
            code: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";'
      }
    }
  }
});`,
            comparisonTitle: 'Webpack 配置对比',
            comparisonCode: `const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  devServer: {
    port: 3000,
    hot: true,
    open: true
  }
};`,
          },
        ],
      },
    ],
    keyApis: ['defineConfig', '插件 API', 'HMR API', '环境变量'],
    useCases: ['开发服务器', '生产构建', '库打包', 'SSR 支持'],
    pros: ['极速启动', '即时 HMR', '优化的构建', '丰富的插件生态', '多框架支持'],
    cons: ['生态相对较新', '某些场景可能需要配置'],
    relatedTechIds: ['vue', 'react', 'rollup', 'esbuild'],
    influencedBy: ['snowpack', 'webpack', 'rollup'],
    influenced: ['farm', 'rspack'],
    status: 'popular',
    iconEmoji: '⚡',
  },
  {
    id: 'webpack',
    name: 'webpack',
    displayName: 'Webpack',
    category: 'build-tool',
    description: '现代 JavaScript 应用的静态模块打包器',
    longDescription: 'Webpack 于 2012 年发布，是最流行的模块打包工具。它将各种资源（JavaScript、CSS、图片等）视为模块，通过 loader 和 plugin 系统提供强大的构建能力。',
    color: '#8DD6F9',
    timelineStart: '2012',
    timelineEnd: undefined,
    versions: [
      {
        version: '1.0',
        releaseDate: '2014',
        features: ['模块打包', 'loader 系统', '代码分割'],
      },
      {
        version: '2.0',
        releaseDate: '2015',
        features: ['tree shaking', '动态导入', '插件系统'],
      },
      {
        version: '3.0',
        releaseDate: '2017',
        features: ['Scope Hoisting', 'Magic Comments'],
      },
      {
        version: '4.0',
        releaseDate: '2018',
        features: ['零配置', 'mode 选项', '性能优化'],
      },
      {
        version: '5.0',
        releaseDate: '2020',
        features: ['持久化缓存', '模块联邦', '更好的 tree shaking'],
      },
    ],
    keyApis: ['loader', 'plugin', 'code splitting', 'tree shaking'],
    useCases: ['模块打包', '代码分割', '资源优化'],
    pros: ['生态丰富', '高度可配置', '功能强大'],
    cons: ['配置复杂', '构建速度较慢', '学习曲线陡峭'],
    relatedTechIds: ['babel', 'typescript'],
    influencedBy: ['browserify'],
    influenced: ['vite', 'rollup'],
    status: 'maintaining',
    iconEmoji: '📦',
  },
];

export const nodeConnections: NodeConnection[] = [
  { sourceId: 'vanilla-js', targetId: 'jquery', type: 'influence', strength: 1.0 },
  { sourceId: 'vanilla-js', targetId: 'angularjs', type: 'influence', strength: 0.9 },
  { sourceId: 'vanilla-js', targetId: 'react', type: 'influence', strength: 0.9 },
  { sourceId: 'vanilla-js', targetId: 'vue', type: 'influence', strength: 0.9 },
  { sourceId: 'vanilla-js', targetId: 'angular', type: 'influence', strength: 0.8 },

  { sourceId: 'jquery', targetId: 'vue', type: 'influence', strength: 0.5 },
  { sourceId: 'angularjs', targetId: 'react', type: 'competition', strength: 0.7 },
  { sourceId: 'angularjs', targetId: 'vue', type: 'influence', strength: 0.6 },
  { sourceId: 'angularjs', targetId: 'angular', type: 'evolution', strength: 1.0 },

  { sourceId: 'react', targetId: 'vue', type: 'competition', strength: 0.8 },
  { sourceId: 'react', targetId: 'angular', type: 'competition', strength: 0.7 },

  { sourceId: 'vue', targetId: 'angular', type: 'competition', strength: 0.6 },

  { sourceId: 'webpack', targetId: 'vite', type: 'evolution', strength: 0.8 },
  { sourceId: 'webpack', targetId: 'react', type: 'dependency', strength: 0.5 },
  { sourceId: 'webpack', targetId: 'vue', type: 'dependency', strength: 0.5 },
  { sourceId: 'webpack', targetId: 'angular', type: 'dependency', strength: 0.6 },

  { sourceId: 'vite', targetId: 'react', type: 'dependency', strength: 0.7 },
  { sourceId: 'vite', targetId: 'vue', type: 'dependency', strength: 0.9 },
];

export const timelineMarkers: TimelineMarker[] = [
  {
    id: 'marker-1995',
    date: '1995',
    label: 'JavaScript 诞生',
    techNodeIds: ['vanilla-js'],
    importance: 'high'
  },
  {
    id: 'marker-2006',
    date: '2006',
    label: 'jQuery 发布',
    techNodeIds: ['jquery'],
    importance: 'high'
  },
  {
    id: 'marker-2009',
    date: '2009',
    label: 'ES5 标准',
    techNodeIds: ['vanilla-js'],
    importance: 'medium'
  },
  {
    id: 'marker-2010',
    date: '2010',
    label: 'AngularJS 诞生',
    techNodeIds: ['angularjs'],
    importance: 'high'
  },
  {
    id: 'marker-2012',
    date: '2012',
    label: 'Webpack 诞生',
    techNodeIds: ['webpack'],
    importance: 'medium'
  },
  {
    id: 'marker-2013',
    date: '2013',
    label: 'React 开源',
    techNodeIds: ['react'],
    importance: 'high'
  },
  {
    id: 'marker-2014',
    date: '2014',
    label: 'Vue.js 诞生',
    techNodeIds: ['vue'],
    importance: 'high'
  },
  {
    id: 'marker-2015',
    date: '2015',
    label: 'ES6 标准',
    techNodeIds: ['vanilla-js'],
    importance: 'high'
  },
  {
    id: 'marker-2016',
    date: '2016',
    label: 'Angular 2 发布',
    techNodeIds: ['angular'],
    importance: 'high'
  },
  {
    id: 'marker-2019',
    date: '2019',
    label: 'React Hooks',
    techNodeIds: ['react'],
    importance: 'high'
  },
  {
    id: 'marker-2020',
    date: '2020',
    label: 'Vue 3 发布',
    techNodeIds: ['vue'],
    importance: 'high'
  },
  {
    id: 'marker-2020-vite',
    date: '2020',
    label: 'Vite 诞生',
    techNodeIds: ['vite'],
    importance: 'high'
  },
  {
    id: 'marker-2022',
    date: '2022',
    label: 'React 18 并发特性',
    techNodeIds: ['react'],
    importance: 'medium'
  },
];

export const getTechNodeById = (id: string) => techNodes.find(node => node.id === id);

export const getTechNodesByCategory = (category: string) => 
  techNodes.filter(node => node.category === category);

export const searchTechNodes = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return techNodes.filter(node =>
    node.name.toLowerCase().includes(lowerQuery) ||
    node.displayName.toLowerCase().includes(lowerQuery) ||
    node.description.toLowerCase().includes(lowerQuery) ||
    node.keyApis.some(api => api.toLowerCase().includes(lowerQuery))
  );
};
