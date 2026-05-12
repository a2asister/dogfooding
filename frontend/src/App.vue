<template>
  <div id="app">
    <KanbanBoard />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import KanbanBoard from './components/KanbanBoard.vue';

@Component({
  components: { KanbanBoard },
})
export default class App extends Vue {}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  padding: 20px;
}
</style>
