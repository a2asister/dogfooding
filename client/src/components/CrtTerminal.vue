<template>
  <div class="crt-screen" ref="screenRef">
    <div class="crt-curvature"></div>
    <div class="crt-noise" ref="noiseRef"></div>
    <div class="crt-glow"></div>
    <div v-if="showRefreshWave" class="refresh-wave"></div>
    
    <div class="terminal-content" ref="contentRef" @click="focusInput">
      <div v-for="(line, index) in terminalLines" :key="index" :class="['terminal-line', { error: line.isError }]">
        <span v-if="line.isCommand" class="prompt">guest@crt-terminal:~$</span>
        <span>{{ line.text }}</span>
      </div>
      
      <div class="terminal-input-line">
        <span class="prompt">guest@crt-terminal:~$</span>
        <span class="input-wrapper">
          <span ref="measureRef" class="measure-text">{{ currentCommand }}</span>
          <input
            ref="inputRef"
            v-model="currentCommand"
            class="terminal-input"
            @keydown.enter="executeCommand"
            autocomplete="off"
            spellcheck="false"
          />
          <span class="cursor"></span>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

interface TerminalLine {
  text: string;
  isCommand: boolean;
  isError: boolean;
}

export default Vue.extend({
  name: 'CrtTerminal',
  data() {
    return {
      currentCommand: '',
      terminalLines: [] as TerminalLine[],
      showRefreshWave: false,
    };
  },
  watch: {
    currentCommand() {
      this.updateInputWidth();
    },
  },
  mounted() {
    this.focusInput();
    this.generateNoise();
    this.addWelcomeMessage();
    this.updateInputWidth();
    window.addEventListener('click', this.focusInput);
  },
  beforeDestroy() {
    window.removeEventListener('click', this.focusInput);
  },
  methods: {
    updateInputWidth() {
      this.$nextTick(() => {
        const measure = this.$refs.measureRef as HTMLElement;
        const input = this.$refs.inputRef as HTMLInputElement;
        if (measure && input) {
          const width = this.currentCommand ? measure.offsetWidth : 1;
          input.style.width = width + 'px';
        }
      });
    },
    focusInput() {
      this.$nextTick(() => {
        const input = this.$refs.inputRef as HTMLInputElement;
        input?.focus();
      });
    },
    generateNoise() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 200;
      
      if (ctx) {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const value = Math.random() * 255;
          imageData.data[i] = value;
          imageData.data[i + 1] = value;
          imageData.data[i + 2] = value;
          imageData.data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
        const noiseRef = this.$refs.noiseRef as HTMLElement;
        if (noiseRef) {
          noiseRef.style.backgroundImage = `url(${canvas.toDataURL()})`;
        }
      }
    },
    addWelcomeMessage() {
      const welcomeLines = [
        '  ____ ____  _____                     _             _ ',
        ' / ___|  _ \\|_   _|__ _ __ _   _ _ __ (_)_ __   __ _| |',
        '| |   | |_) | | | |/ _ \\\'__| | | | \'_ \\| | \'_ \\ / _` | |',
        '| |___|  _ <  | |  __/ |  | |_| | | | | | | | | (_| | |',
        ' \\____|_| \\_\\ |_|\\___|_|   \\__,_|_| |_|_|_| |_|\\__,_|_|',
        '',
        'Welcome to CRT Terminal v1.0.0',
        'Type "help" to see available commands.',
        '',
      ];
      
      welcomeLines.forEach((line) => {
        this.terminalLines.push({
          text: line,
          isCommand: false,
          isError: false,
        });
      });
      
      this.scrollToBottom();
    },
    async executeCommand() {
      const command = this.currentCommand.trim();
      if (!command) return;

      this.terminalLines.push({
        text: command,
        isCommand: true,
        isError: false,
      });

      this.currentCommand = '';
      this.updateInputWidth();
      this.showRefreshWave = true;
      setTimeout(() => {
        this.showRefreshWave = false;
      }, 300);

      if (command.toLowerCase().startsWith('echo ')) {
        const echoText = command.substring(5);
        await this.typeText(echoText, false);
        this.scrollToBottom();
        return;
      }

      try {
        const response = await axios.post('/api/command/execute', { command });
        
        if (response.data.response === '[CLEAR]') {
          this.terminalLines = [];
          return;
        }
        
        if (response.data.response === '[DATE]') {
          const now = new Date();
          await this.typeText(now.toString(), response.data.isError);
          this.scrollToBottom();
          return;
        }
        
        await this.typeText(response.data.response, response.data.isError);
      } catch (error) {
        await this.typeText('Error: Unable to connect to server', true);
      }

      this.scrollToBottom();
    },
    async typeText(text: string, isError: boolean) {
      const lines = text.split('\n');
      
      for (const line of lines) {
        const lineObj: TerminalLine = {
          text: '',
          isCommand: false,
          isError,
        };
        this.terminalLines.push(lineObj);
        
        for (let i = 0; i < line.length; i++) {
          lineObj.text += line[i];
          await this.delay(15);
          if (i % 5 === 0) {
            this.scrollToBottom();
          }
        }
        
        await this.delay(30);
      }
    },
    delay(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const content = this.$refs.contentRef as HTMLElement;
        if (content) {
          content.scrollTop = content.scrollHeight;
        }
      });
    },
  },
});
</script>

<style scoped>
</style>
