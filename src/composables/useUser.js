import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import useUserStore from '@/stores/user'
import { notify } from 'notiwind'
import { sliceAddress } from '@/utils'
import { useEventBus } from '@vueuse/core'

export default () => {
  const wallet = inject('wallet')
  const router = useRouter()
  const userStore = useUserStore()
  const { address, ens, isAuthenticated, chainName, chainEnsSupport, isAppNetwork, appChainName, appChain, appBlockExplorer } = storeToRefs(userStore)
  const { setUser, resetUser } = userStore
  const isAuthenticating = ref(false)

  const { emit: emitAppEvent } = useEventBus('app')

  const login = async (route = { name: 'Home' }) => {
    try {
      isAuthenticating.value = true
      const [a] = await wallet.provider.request({ method: 'eth_requestAccounts' })
      const e = chainEnsSupport.value ? await wallet.lookupAddress(a) : null
      setUser(a, e)
      emitAppEvent({ type: 'accountsChanged' })
      notify({
        type: 'success',
        title: 'Authorization',
        text: `Successfully connected as ${e || sliceAddress(a)}`
      })
      if (route) router.replace(route)
    } catch (error) {
      console.log(error)
      notify({
        type: 'error',
        title: 'Authorization',
        text: error.message
      })
    } finally {
      isAuthenticating.value = false
    }
  }

  const logout = async () => {
    resetUser()
    emitAppEvent({ type: 'accountsChanged' })
    router.replace({ name: 'Home' })
    notify({
      type: 'success',
      title: 'Authorization',
      text: `User disconnected successfully`
    })
  }

  return {
    wallet,
    address,
    ens,
    isAuthenticated,
    isAuthenticating,
    setUser,
    resetUser,
    login,
    logout,
    chainName,
    isAppNetwork,
    appChainName,
    appChain,
    appBlockExplorer
  }
}