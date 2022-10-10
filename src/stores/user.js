import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { chains } from '@/utils'

const userStore = defineStore('user', () => {
  const address = ref(null)
  const ens = ref(null)
  const chainId = ref(null)

  const addressStorage = useStorage('address', null)

  const isAuthenticated = computed(() => Boolean(address.value))
  const isAppNetwork = computed(() => chainId.value === import.meta.env.VITE_NETWORK)

  const chainName = computed(() => chains[chainId.value].name ?? null)
  const chainEnsSupport = computed(() => chains[chainId.value].ensSupported ?? null)
  const appChainName = computed(() => chains[import.meta.env.VITE_NETWORK].name ?? null)
  const appChain = computed(() => chains[import.meta.env.VITE_NETWORK] ?? null)
  const appBlockExplorer = computed(() => chains[import.meta.env.VITE_NETWORK].explorer ?? null)

  const setUser = (a, e) => {
    address.value = a
    ens.value = e

    addressStorage.value = a
  }

  const setChainId = (c) => {
    chainId.value = c
  }

  const resetUser = () => {
    address.value = null
    ens.value = null

    addressStorage.value = null
  }

  return {
    address,
    ens,
    chainId,
    chainName,
    chainEnsSupport,
    isAuthenticated,
    isAppNetwork,
    setUser,
    resetUser,
    setChainId,
    appChainName,
    appChain,
    appBlockExplorer
  }
})

export default userStore
