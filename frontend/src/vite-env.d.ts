/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

import { Router } from 'vue-router';

declare module 'pinia' {
  interface PiniaCustomProperties {
    router: Router;
  }
}