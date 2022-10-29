<script setup>
import { toRefs, computed, ref } from 'vue'
import { useAsyncState, useEventBus, useFetch } from '@vueuse/core'
import { useVotingContract, useUser } from '@/composables'
import { notify } from 'notiwind'

const { address, isAuthenticated } = useUser()
const { on: onAppEvent, emit: emitAppEvent } = useEventBus('app')
const { addressTotalVotesForIDNumber, returnTotalVotesForCandidateIDNumber, voteWithEggByCandidateNumber } = useVotingContract(address)

const props = defineProps(['candidate', 'allowance'])
const { candidate, allowance } = toRefs(props)
const isImageLoaded = ref(false)
const emit = defineEmits(['load'])


const loadUserState = async () => {
  if (!isAuthenticated.value) return Promise.resolve(0)

  const data = await addressTotalVotesForIDNumber(candidate.value.id)
  return Promise.resolve(data)
}

const loadState = async () => {
  try {
    const [userState, votes] = await Promise.all([
      loadUserState(),
      returnTotalVotesForCandidateIDNumber(candidate.value.id),
    ])

    return Promise.resolve({
      votes,
      userState
    })
  } catch (error) {
    console.log(error)
  }
}

const { state, isLoading, execute } = useAsyncState(() => loadState(), 0, { immediate: false })

execute().then(() => {
  emit('load', { chiknName: candidate.value.name, votes: state.value.votes, id: candidate.value.id })
})

const onImageLoad = () => isImageLoaded.value = true

const eggCount = ref(0)

const votePending = ref(false)
const vote = async (_id, _eggs) => {
  votePending.value = true
  try {
    const tx = await voteWithEggByCandidateNumber(Number(_id), Number(_eggs))
    const receipt = await tx.wait()

    notify({
      type: 'success',
      title: 'Voting',
      text: `Voted ${_eggs} $${allowance.value.symbol} for #${_id}`
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

onAppEvent(({ type, payload }) => {
  const events = {
    'tokensChanged': () => execute(),
    'accountsChanged': () => {
      if (isAuthenticated.value) execute()
    }
  }
  
  events[type]?.() ?? null
})
</script>

<template>
  <div class="relative p-2 bg-gradient-to-tr from-red-200/10 rounded-3xl leading-none min-h-[200px] grid items-center">
    <LoadingOverlay v-if="isLoading" />

    <div v-else class="flex items-center gap-2">
      <a :href="`judges/${candidate.id}.jpg`" target="_blank" class="sm:min-w-[200px] flex-1">
        <Transition name="fade">
          <img
            :src="`judges/${candidate.id}.jpg`"
            class="rounded-2xl mx-auto"
            @load="onImageLoad"
            v-show="isImageLoaded"
          />
        </Transition>
      </a>

      <div class="flex-1 grid gap-2 w-full">
        <div>
          <span class="text-gold-500 font-celaraz font-light">{{ candidate.name }}</span>
          <div class="text-xs">
            Candidate ID: <span class="text-gold-500">{{ candidate.id }}</span>
          </div>
          <div class="mt-1 text-xs">
            Total votes: <span class="text-gold-500">{{ state.votes }}</span>
          </div>
          <div v-if="isAuthenticated" class="text-xs">
            My votes: <span class="text-gold-500">{{ state.userState }}</span>
          </div>
        </div>
        <div class="text-xs text-red-100/80 min-h-[30px] italic">
          {{ candidate.bio ?? 'No bio present' }}
        </div>

        <div class="flex items-center justify-between gap-1">
          <div class="self-end">
            <div class="text-xs">
              ${{ allowance.symbol }} amount
            </div>
            <div class="text-gold-500 max-w-[100px]">
              <input type="number" min="0" class="input input--default text-center" v-model="eggCount" />
            </div>
          </div>
          <div class="text-right self-end">
            <Button
              :disabled="!eggCount || !allowance.allowance || votePending"
              :loading="votePending"
              @click="vote(candidate.id, eggCount)"
            >
              Vote
            </Button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
