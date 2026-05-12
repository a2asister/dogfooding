<template>
  <div class="toggle-wrapper">
    <span class="toggle-label">{{ value ? '已启用' : '已禁用' }}</span>
    <div class="toggle-switch" @click="$emit('input', !value)">
      <div :class="['toggle-inner', { active: value }]">
        <div class="toggle-face toggle-off">
          <div class="toggle-knob"></div>
        </div>
        <div class="toggle-face toggle-on">
          <div class="toggle-knob"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class FormToggle extends Vue {
  @Prop() value!: boolean;
}
</script>
