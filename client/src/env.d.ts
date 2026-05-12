/// <reference types="webpack-env" />
/// <reference types="vue" />

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

import 'vue/types/vue';
