declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

import VueRouter from 'vue-router'

declare module 'vue/types/vue' {
  interface Vue {
    $apollo: {
      mutate: (options: any) => Promise<any>
      query: (options: any) => Promise<any>
    }
    $router: VueRouter
  }
}

declare module 'apollo-boost'
declare module 'vue-apollo'
declare module 'graphql-tag'
