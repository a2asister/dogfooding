import { createApp, markRaw } from 'vue';
import { createPinia } from 'pinia';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { DefaultApolloClient } from '@vue/apollo-composable';
import App from './App.vue';
import router from './router';
import './style.css';

const httpLink = createHttpLink({
  uri: '/graphql',
});

const cache = new InMemoryCache();

const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
});

const app = createApp(App);

app.provide(DefaultApolloClient, apolloClient);

const pinia = createPinia();
pinia.use(({ store }) => {
  store.router = markRaw(router);
});

app.use(pinia);
app.use(router);
app.mount('#app');