import Vue from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $apollo: {
      mutate: (options: {
        mutation: any
        variables?: any
      }) => Promise<{ data: any }>
      query: (options: {
        query: any
        variables?: any
        fetchPolicy?: string
      }) => Promise<{ data: any }>
    }
  }
}
