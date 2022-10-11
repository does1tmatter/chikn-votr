<script setup>
import IconTwitter from '@/assets/icons/twitter.svg'
import IconDiscord from '@/assets/icons/discord.svg'
import IconMedium from '@/assets/icons/medium.svg'

const socials = [
  {
    icon: IconTwitter,
    href: 'https://twitter.com/chiknstitute'
  },
  {
    icon: IconDiscord,
    href: 'https://discord.gg/CvWbwD6Ndh'
  },
  {
    icon: IconMedium,
    href: 'https://medium.com/@chiknstitute/the-1st-annual-chikn-beauty-pageant-4b6e360be5ae'
  }
]
</script>

<template>
  <div class="inline-flex items-center gap-6">
    <a
      v-for="({ href, icon }, index) in socials" :key="index"
      :href="href"
      target="_blank"
      class="text-white transition hover:text-white/70 active:text-white"
    >
      <component
        :is="icon"
        class="w-6 h-6"
      />
    </a>
  </div>
</template>
