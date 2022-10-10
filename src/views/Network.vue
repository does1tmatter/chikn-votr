<script setup>
import { ref } from 'vue'
import { useUser } from '@/composables'
import { notify } from 'notiwind'
import { utils } from 'ethers'

const { wallet, appChainName, appChain } = useUser()

const isSwitching = ref(false)
const isAdding = ref(false)

const switchNetwork = async () => {
  try {
    isSwitching.value = true
    await wallet.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: import.meta.env.VITE_NETWORK }]
    })
  } catch (error) {
    notify({
      type: 'error',
      title: 'Network',
      text: error.message
    })
  } finally {
    isSwitching.value = false
  }
}

const addNetwork = async () => {
  try {
    isAdding.value = true
    await wallet.provider.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: import.meta.env.VITE_NETWORK,
        chainName: appChainName.value,
        rpcUrls: [appChain.value.rpc],
        nativeCurrency: {
          name: appChain.value.currency,
          symbol: appChain.value.currency,
          decimals: 18
        },
        blockExplorerUrls: [appChain.value.explorer]
      }]
    })
  } catch (error) {
    notify({
      type: 'error',
      title: 'Network',
      text: error.message
    })
  } finally {
    isAdding.value = false
  }
}
</script>

<template>
  <div class="container flex justify-center text-center">
    <div class="grid gap-6">
      <div class="grid gap-8">
        <template v-if="wallet">
          <div>This dApp requires {{ appChainName }} to be active network</div>
          <div>
            <Button @click="switchNetwork()" :loading="isSwitching" :disabled="isSwitching">Switch Network</Button>
          </div>
          <div>
            <Button @click="addNetwork()" :loading="isAdding" :disabled="isAdding">Add Network to Metamask</Button>
          </div>
        </template>
        <template v-else>
          <div>Unable to detect Ethereum provider</div>
          <div>
            <a href="https://metamask.io/download" target="_blank" class="button button--default button--black">Install MetaMask for your browser</a>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>