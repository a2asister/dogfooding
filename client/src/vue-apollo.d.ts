import Vue from 'vue';
import { ApolloClient } from 'apollo-client';

declare module 'vue/types/vue' {
  interface Vue {
    $apollo: {
      query: <T = any>(options: { query: any; variables?: any }) => Promise<{ data: T }>;
      mutate: <T = any>(options: { mutation: any; variables?: any }) => Promise<{ data: T }>;
    };
  }
}
