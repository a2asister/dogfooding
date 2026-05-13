import { createApp, provide, h } from 'vue';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { DefaultApolloClient } from '@vue/apollo-composable';
import App from './App.vue';
import './style.css';

const httpLink = createHttpLink({
  uri: 'http://localhost:52345/graphql',
});

const cache = new InMemoryCache();

const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
});

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
    return () => h(App);
  },
});

app.mount('#app');
