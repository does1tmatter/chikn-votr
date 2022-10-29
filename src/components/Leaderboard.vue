<script setup>
import { toRefs } from 'vue'
import IconX from '@/assets/icons/x.svg'

const props = defineProps(['scores'])
const { scores } = toRefs(props)
</script>

<template>
  <div class="fixed top-0 left-0 w-full min-h-screen flex justify-center items-center text-center bg-black/10 z-[1000] backdrop-blur" @click.self="$emit('close')">
    <div class="w-full max-w-[440px] mx-auto relative">
      <button
        class="absolute top-[-3px] right-[-3px] rounded-full bg-white text-red-300 p-1 hover:bg-red-100 active:bg-red-200 active:text-white transition"
        @click="$emit('close')"
      >
        <IconX class="h-4 w-4" />
      </button>

      <div class="scrollbar max-h-[90vh] w-full">
        <div class="bg-red-500/80 rounded-xl pt-4 pb-2">
          <div class="flex pb-2">
            <div class="w-full max-w-[70px]">
              Rank
            </div>
            <div class="flex-1 text-left">
              Name
            </div>
            <div class="flex-1">
              Votes
            </div>
          </div>

          <div v-for="(score, i) in scores" :key="i" class="flex w-full border-t border-blue-300 py-2 text-sm transition hover:bg-white/10">
            <div class="w-full max-w-[70px]">
              {{ i + 1 }}
            </div>
            <div class="flex-1 text-left">
              {{score.chiknName}}
            </div>
            <div class="flex-1 text-center">
              {{score.votes}}
            </div>
          </div>
        </div>
      </div>
      
      </div>
  </div>
</template>

<style>
.scrollbar {
  overflow-y: scroll;
}
.scrollbar::-webkit-scrollbar {
background: transparent;
width: 4px;
}
.scrollbar::-webkit-scrollbar-track {
background: transparent;
}
.scrollbar::-webkit-scrollbar-thumb {
background: transparent;
}
.scrollbar::-webkit-scrollbar-thumb:hover {
  background: transparent;
}
</style>
