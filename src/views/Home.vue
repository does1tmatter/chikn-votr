<script setup>
import { ref, computed } from 'vue'
import { useAsyncState, useEventBus, useToggle } from '@vueuse/core'
import { useEggContract, useUser, useVotingContract } from '@/composables'
import { notify } from 'notiwind'
import { candidateIds, randomize } from '@/utils'

const candidates = ref(randomize(candidateIds))

const { on: onAppEvent, emit: emitAppEvent } = useEventBus('app')
const { address, isAuthenticated, isAuthenticating, login } = useUser()
const { symbol, allowance, approve, balanceOf } = useEggContract(address)
const { voteOneEggForEachCandidate, prizeMoneyTotalWei, eggBurntTotalWei, allVotesTotalBase, totalVotesFromVoterAddress, votingTimeLeftBlockTimestampHours } = useVotingContract(address)

const loadAllowanceState = async () => {
  try {
    const [ _symbol, _allowance] = await Promise.all([symbol(), loadUserAllowance()])

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

const loadUserAllowance = async () => {
  if (!isAuthenticated.value) return 0

  const _allowance = await allowance()
  return Promise.resolve(_allowance)
}

const { state: allowanceState, execute: loadAllowance } = useAsyncState(() => loadAllowanceState(), {}, { resetOnExecute: false })

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

const { state, execute: loadStats } = useAsyncState(() => loadContractState(), {}, { resetOnExecute: false })


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
      loadAllowance()
      loadStats()
    },
    'tokensChanged': () => {
      loadAllowance()
      loadStats()
    }
  }
  
  events[type]?.() ?? null
})
</script>

<template>
  <div class="self-center w-full py-12 px-2 max-w-[1400px] mx-auto px-4">
    <div class="flex flex-wrap justify-between items-center">
      <div class="text-center mx-auto md:mx-0">
        <div class="font-shadows text-5xl text-blue-300">
          Chikn Beauty Pageant
        </div>
        <div class="font-shadows text-2xl text-blue-300">
          Community $EGG Burn Vote
        </div>
        <div class="mt-2 mb-8 text-xs text-blue-200">
          Voting Ends on October 18th at 1:30am UTC
        </div>
      </div>
      
      <template v-if="isAuthenticated">
        <div class="max-w-[300px] text-center grid gap-4 mx-auto md:mx-0">
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
            Vote 1 $EGG for every candidate
          </Button>
          <Button @click="toggleLeaderboard()">
            Open leaderboard
          </Button>
        </div>
      </template>
      <template v-else>
        <div class="max-w-[300px] grid gap-4 text-center mx-auto md:mx-0">
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
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs italic">You voted</div>
        <div class="font-bold">{{ state.addressVotes }}</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs italic">All votes cast</div>
        <div class="font-bold">{{ state.votes }}</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs italic">Hours left</div>
        <div class="font-bold">{{ state.timestamp }}</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs italic">$EGG balance</div>
        <div class="font-bold">{{ state.balance }} $EGG</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs italic">Prize wallet</div>
        <div class="font-bold">{{ Number(state.prize).toFixed(0) }} $EGG</div>
      </div>
      <div class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center">
        <div class="text-xs italic">Total $EGG burnt</div>
        <div class="font-bold">{{ Number(state.burned).toFixed(0) }} $EGG</div>
      </div>
    </div>
    <div class="mt-4 text-xs text-center flex flex-wrap gap-2 md:gap-6 italic">
      <div class="text-blue-200">
        One $EGG = One Vote
      </div>
      <div class="text-blue-200">
        Top 10 Chikns with the most votes advance to the final round
      </div>
    </div>
    <div class="mt-2 grid md:grid-cols-2 xl:grid-cols-3 gap-2">
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
