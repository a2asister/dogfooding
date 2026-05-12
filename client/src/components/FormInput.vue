<template>
  <input type="text" class="field-input" :value="value" @input="$emit('input', $event.target.value)" />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class FormInput extends Vue {
  @Prop() value!: string;
}
</script>
