import Vue from 'vue';
import App from './App.vue';
import VueApollo from 'vue-apollo';
import ApolloClient from 'apollo-boost';

Vue.config.productionTip = false;

const apolloClient = new ApolloClient({
  uri: 'http://localhost:4321/graphql',
});

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
});

Vue.use(VueApollo);

new Vue({
  apolloProvider,
  render: (h) => h(App),
}).$mount('#app');
