import { createApp, ref } from 'vue';
import { createPinia } from 'pinia';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { DefaultApolloClient } from '@vue/apollo-composable';
import App from './App.vue';
import router from './router';
import './styles/main.scss';

const httpLink = createHttpLink({
  uri: 'http://localhost:4567/graphql',
});

const cache = new InMemoryCache();

const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
});

const currentUser = ref({
  id: 'demo-user-id',
  username: 'demo',
  nickname: '演示用户',
});

const app = createApp(App);

app.provide(DefaultApolloClient, apolloClient);
app.provide('currentUser', currentUser.value);
app.use(createPinia());
app.use(router);
app.mount('#app');
