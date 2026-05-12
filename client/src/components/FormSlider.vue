<template>
  <div class="slider-wrapper" ref="wrapper">
    <input
      ref="slider"
      type="range"
      class="slider-input"
      :min="min"
      :max="max"
      :value="value"
      @input="handleInput"
      @mousedown="createRipple"
    />
    <div class="glow" :style="{ left: glowPosition + '%' }"></div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class FormSlider extends Vue {
  @Prop() value!: number;
  @Prop({ default: 0 }) min!: number;
  @Prop({ default: 100 }) max!: number;

  get glowPosition() {
    return ((this.value - this.min) / (this.max - this.min)) * 100;
  }

  handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.$emit('input', parseInt(target.value, 10));
  }

  createRipple(e: MouseEvent) {
    const wrapper = this.$refs.wrapper as HTMLElement;
    const rect = wrapper.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    wrapper.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }
}
</script>
