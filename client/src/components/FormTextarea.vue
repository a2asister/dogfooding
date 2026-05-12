<template>
  <textarea class="field-input" :value="value" @input="$emit('input', $event.target.value)"></textarea>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class FormTextarea extends Vue {
  @Prop() value!: string;
}
</script>
