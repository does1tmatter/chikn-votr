<script setup>
import { useAsyncState, useEventBus } from '@vueuse/core'
import useUser from '@/composables/useUser'
import { sliceAddress } from '@/utils'
import { useVotingContract, useEggContract} from '@/composables'

const { isAuthenticated, isAppNetwork, isAuthenticating, login, logout, wallet, address, ens, chainName } = useUser()
const { prizeMoneyTotalWei, eggBurntTotalWei, allVotesTotalBase, totalVotesFromVoterAddress, votingTimeLeftBlockTimestampHours} = useVotingContract(address)
const { balanceOf } = useEggContract(address)
const { on: onAppEvent } = useEventBus('app')

const loadContractState = async () => {
  try {
    const [burned, votes, prize, timestamp, user] = await Promise.all([eggBurntTotalWei(), allVotesTotalBase(), prizeMoneyTotalWei(), votingTimeLeftBlockTimestampHours(), loadUserState()])

    return Promise.resolve({
      burned,
      votes,
      prize,
      timestamp,
      ...user
    })
  } catch (error) {
    console.log(error)
  }
}

const loadUserState = async () => {
  if (!isAuthenticated.value) return Promise.resolve({ balance: 0, addressVotes: 0 })
  try {
    const [balance, addressVotes] = await Promise.all([balanceOf(), totalVotesFromVoterAddress()])

    return Promise.resolve({ balance, addressVotes })
  } catch (error) {
    console.log(error)
  }
}

const { state, execute: loadState } = useAsyncState(() => loadContractState(), {}, { resetOnExecute: false })


onAppEvent(({ type }) => {
  const events = {
    'accountsChanged': () => {
      loadState()
    },
    'tokensChanged': () => {
      loadState()
    }
  }
  
  events[type]?.() ?? null
})
</script>

<template>
  <div class="sticky top-0 z-10 h-16 px-6 backdrop-blur border-b border-white/10">
    <div class="flex items-center justify-between h-full">
      <div class="items-start">
        <!-- <a href="https://www.chiknisbeautiful.com/" class="inline-flex text-white transition hover:text-white/70 active:text-white font-shadows text-2xl">
          $EGG Balance: {{ state.balance }}  -  You Voted: {{ state.addressVotes }}  -  Total $EGG burnt: {{ state.burned }}  -  All votes cast:  {{ state.votes }}  -  Prize Wallet: {{ state.prize }} $EGG  - {{ state.timestamp }} Hours left  
        </a> -->
        <div class="grid grid-cols-3 gap-x-4 text-xs relative">
          <div class="truncate">
            You Voted: {{ state.addressVotes }}
          </div>
          <div class="truncate">
            All votes cast:  {{ state.votes }}
          </div>
          <div class="truncate">
            {{ state.timestamp }} Hours left
          </div>
          <div class="truncate">
            $EGG Balance: {{ state.balance }}
          </div>
          <div class="truncate">
            Prize Wallet: {{ state.prize }} $EGG
          </div>
          <div class="truncate">
            Total $EGG burnt: {{ state.burned }}
          </div>
        </div>
      </div>
      <div class="flex items-center justify-end flex-1 gap-4">
        <div v-if="isAuthenticated">
          <div class="text-sm font-semibold text-white text-right">
            {{ ens ?? sliceAddress(address) }}
          </div>
          <div class="flex items-center justify-end gap-2 text-xs text-white text-right whitespace-nowrap">
            {{ chainName }}
          </div>
        </div>
        <Button
          @click="isAuthenticated ? logout() : login()" 
          :disabled="isAuthenticating || !wallet || !isAppNetwork"
          :loading="isAuthenticating"
        >
          {{ wallet ? isAppNetwork ? isAuthenticated ? 'Logout' : 'Connect Wallet' : 'Wrong Network' : 'Unable to detect Avalanche provider' }}
        </Button>
      </div>
    </div>
  </div>
</template>
