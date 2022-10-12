<script setup>
import { toRefs, computed, ref } from 'vue'
import { useAsyncState, useEventBus, useFetch } from '@vueuse/core'
import { useVotingContract, useUser } from '@/composables'
import { notify } from 'notiwind'

const { address } = useUser()
const { on: onAppEvent, emit: emitAppEvent } = useEventBus('app')
const {     prizeMoneyTotalWei,
            eggBurntTotalWei,
            allVotesTotalBase,
            totalVotesFromVoterAddress,
            addressTotalVotesForIDNumber, 
            returnTotalVotesForCandidateIDNumber, 
    voteWithEggByCandidateNumber } = useVotingContract(address)

const props = defineProps(['candidate', 'allowance', 'index'])
const { candidate, allowance, index } = toRefs(props)
const isImageLoaded = ref(false)
const emit = defineEmits(['load'])

const { state: votes, isLoading, execute } = useAsyncState(() => returnTotalVotesForCandidateIDNumber(candidate.value.id), 0, { immediate: false })
const { state: votes, isLoading, execute } = useAsyncState(() => returnTotalVotesForCandidateIDNumber(candidate.value.id), 0, { immediate: false })

execute().then(() => {
  emit('load', { token: candidate.value.token, votes: votes.value })
})

const { data: backend } = useFetch(`https://api.chikn.farm/api/chikn/details/${candidate.value.token}`).get()
const parsedData = computed(() => backend.value ? JSON.parse(backend.value) : {})

const { data: metadata } = useFetch(`https://api.chikn.farm/api/chikn/metadata/${candidate.value.token}`).get()
const parsedMetadata = computed(() => metadata.value ? JSON.parse(metadata.value) : {})

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
    'tokensChanged': () => execute()
  }
  
  events[type]?.() ?? null
})
</script>

<template>
  <div class="relative p-4 bg-gradient-to-tr from-red-200/10 rounded-3xl leading-none flex items-center gap-2">
    <LoadingOverlay v-if="!isImageLoaded || isLoading" />
    <a :href="parsedMetadata.image" target="_blank">
      <Transition name="fade">
        <img
          :src="parsedMetadata.image"
          class="rounded-2xl max-w-[200px]"
          @load="onImageLoad"
          v-show="isImageLoaded"
        />
      </Transition>
    </a>
    <div class="flex-1 grid gap-2">

      <div>
        <span class="text-gold-500 font-shadows">{{ parsedData.name }}</span>
        <div class="mt-1 text-sm">
          Votes: <span class="text-gold-500">{{ votes }}</span>
        </div>
        <div class="text-xs mt-2">
          Candidate ID: <span class="text-gold-500">{{ candidate.id }}</span>
        </div>
        <div class="text-xs">
          Token ID: <span class="text-gold-500">{{ candidate.token }}</span>
        </div>
      </div>
      <div class="text-xs text-justify text-red-100/80 min-h-[30px]">
        {{ parsedData.lore ?? 'No bio present' }}
      </div>

      <div class="flex items-center justify-between gap-1">
        <div class="self-end">
          <div class="text-xs">
            ${{ allowance.symbol }} amount
          </div>
          <div class="text-gold-500 max-w-[100px]">
            <input type="number" class="input input--default" v-model="eggCount" />
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
</template>
