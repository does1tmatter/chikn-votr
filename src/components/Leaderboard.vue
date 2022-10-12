<script setup>
import { toRefs } from 'vue'
const props = defineProps(['scores'])
const { scores } = toRefs(props)
</script>

<template>
  <div class="fixed top-0 left-0 w-full min-h-screen flex justify-center items-center text-center bg-white/10 z-[1000] backdrop-blur" @click.self="$emit('close')">

    <div class="w-full max-w-[400px] max-h-[90vh] scrollbar mx-auto">
      <div class="bg-red-500/80 rounded-xl pt-4 pb-2">
        <div class="flex pb-2">
          <div class="flex-1">
            Rank
          </div>
          <div class="flex-1">
            Chikn ID#
          </div>
          <div class="flex-1">
            Name
          </div>
          <div class="flex-1">
            Votes
          </div>
        </div>

        <div v-for="(score, i) in scores" :key="i" class="flex w-full border-t border-blue-300 py-2">
          <div class="flex-1">
            {{ i + 1 }}
          </div>
          <div class="flex-1">
            {{score.token}}
          </div>
          <div class="flex-1">
            {{score.chiknName}}
          </div>
          <div class="flex-1">
            {{score.votes}}
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
