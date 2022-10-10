<script setup>
import { toRefs } from 'vue'

const props = defineProps(['modelValue'])
const { modelValue  } = toRefs(props)

const emit = defineEmits(['update:modelValue'])

const onInput = ($event) => {
  emit('update:modelValue', $event.target.value)
}
</script>

<template>
  <input
    :value="modelValue"
    @input="onInput"
    class="input input--default"
  >
</template>
