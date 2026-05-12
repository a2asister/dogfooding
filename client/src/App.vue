<template>
  <div class="crt-container">
    <CrtTerminal />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CrtTerminal from './components/CrtTerminal.vue';

export default Vue.extend({
  name: 'App',
  components: {
    CrtTerminal,
  },
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #000;
  overflow: hidden;
}

.crt-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
