<script setup>
import { ref, computed } from 'vue'
import { useAsyncState, useEventBus, useToggle } from '@vueuse/core'
import { useEggContract, useUser, useVotingContract } from '@/composables'
import { notify } from 'notiwind'
import { candidateIds } from '@/utils'

const candidates = ref([...candidateIds])

const { on: onAppEvent, emit: emitAppEvent } = useEventBus('app')
const { address, isAuthenticated, isAuthenticating, login } = useUser()
const { symbol, allowance, approve } = useEggContract(address)
const { voteOneEggForEachCandidate } = useVotingContract(address)

const loadAllowanceState = async () => {
  try {
    const [ _symbol, _allowance] = await Promise.all([symbol(), loadUserState()])

    return Promise.resolve({
      symbol: _symbol,
      allowance: _allowance
    })
  } catch (error) {
    notify({
      type: 'error',
      title: 'Allowance State',
      text: error.reason ?? error.message
    })
  }
}

const loadUserState = async () => {
  if (!isAuthenticated.value) return 0

  const _allowance = await allowance()
  return Promise.resolve(_allowance)
}

const { state: allowanceState, execute: loadState } = useAsyncState(() => loadAllowanceState(), {}, { resetOnExecute: false })

const approvalPending = ref(false)

const setApprove = async (_count) => {
  approvalPending.value = true
  try {
    const tx = await approve(_count)
    const receipt = await tx.wait()

    notify({
      type: 'success',
      title: 'Allowance',
      text: `${_count === 0 ? 'Revoked' : 'Approved'} $${allowanceState.value.symbol} allowance`
    })
    emitAppEvent({ type: 'tokensChanged' })

    return Promise.resolve(receipt)
  } catch (error) {
    notify({
      type: 'error',
      title: 'Allowance',
      text: error.reason ?? error.message
    })
  } finally {
    approvalPending.value = false
  }
}

const votePending = ref(false)
const vote1Egg = async () => {
  votePending.value = true
  try {
    const tx = await voteOneEggForEachCandidate()
    const receipt = await tx.wait()

    notify({
      type: 'success',
      title: 'Voting',
      text: `Voted 1 $EGG for each candidate`
    })
    emitAppEvent({ type: 'tokensChanged' })

    return Promise.resolve(receipt)
  } catch (error) {
    notify({
      type: 'error',
      title: 'Voting',
      text: error.reason ?? error.message
    })
  } finally {
    votePending.value = false
  }
}

const onCandidateLoad = (candidate) => {
  const index = candidates.value.findIndex(t => t.token === candidate.token)
  candidates.value[index] = {
    ...candidates.value[index],
    ...candidate
  }
}

const candidatesSorted = computed(() => candidates.value.sort((a, b) => b.votes - a.votes))

const [leaderboard, toggleLeaderboard] = useToggle(false)

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
  <div class="self-center w-full py-12 px-2">
    <div class="text-center mb-8">
      <div class="font-shadows text-5xl text-blue-300">
        Chikn Beauty Pageant
      </div>
      <div class="font-shadows text-2xl text-blue-300">
        Community $EGG Burn Vote
      </div>
      <div class="mt-2 mb-8 text-xs text-blue-200">
        Voting Ends on October 18th at 1:30am UTC
      </div>
      <div class="text-3xl text-blue-300 font-shadows">
        One $EGG = One Vote
      </div>
      <div class="mt-2 text-xs text-blue-200">
        Top 10 Chikns with the most votes advance to the final round
      </div>
    </div>
    <template v-if="isAuthenticated">
      <div class="max-w-[300px] mx-auto text-center grid gap-4">
        <Button
          :loading="approvalPending"
          :disabled="approvalPending || !isAuthenticated || isAuthenticating"
          @click="allowanceState.allowance === 0 ? setApprove(1000) : setApprove(0)"
        >
          {{ allowanceState.allowance === 0 ? 'Approve' : 'Revoke' }} ${{ allowanceState.symbol }} spending
        </Button>
        <Button
          :disabled="!allowanceState.allowance"
          @click="vote1Egg()"
        >
          Vote 1 $EGG for each candidate
        </Button>
        <Button @click="toggleLeaderboard()">
          Open leaderboard
        </Button>
      </div>
    </template>
    <template v-else>
      <div class="max-w-[300px] mx-auto grid gap-4 text-center">
        <Button
          :loading="isAuthenticating"
          :disabled="isAuthenticating"
          @click="login()"
        >
          Connect to vote
        </Button>
        <Button @click="toggleLeaderboard()">
          Open leaderboard
        </Button>
      </div>
    </template>
    <div class="max-w-[1400px] mx-auto mt-16 grid md:grid-cols-2 xl:grid-cols-3 gap-2">
      <Candidate 
        v-for="candidate in candidateIds"
        :key="candidate.id"
        :candidate="candidate"
        :allowance="allowanceState"
        @load="onCandidateLoad"
      />
    </div>
    <Transition name="fade">
      <Leaderboard v-if="leaderboard" :scores="candidatesSorted" @close="toggleLeaderboard()" />
    </Transition>
  </div>
</template>