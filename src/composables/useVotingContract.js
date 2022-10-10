import { ethers } from 'ethers'
import useUser from '@/composables/useUser'
import abi from '@/abi/voting.json'
import useUserStore from '@/stores/user'

export default (address) => {
  const { wallet, isAuthenticated } = useUser()
  const userStore = useUserStore()

  let contract
  const setContract = (payload) => contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_VOTING, abi, payload)

  const returnTotalVotesForCandidateIDNumber = async (id) => await contract.returnTotalVotesForCandidateIDNumber(id).then(response => Number(response))
  const voteWithEggByCandidateNumber = async (id, amt) => await contract.voteWithEggByCandidateNumber(id, amt)
  const voteOneEggForEachCandidate = async () => await contract.voteOneEggForEachCandidate()

  userStore.$onAction(({ name, after }) => {
    after(() => {
      const actions = {
        setUser: () => setContract(wallet.getSigner()),
        resetUser: () => setContract(wallet)
      }

      actions[name]?.() || null
    })
  })

  isAuthenticated.value ? setContract(wallet.getSigner()) : setContract(wallet)

  return {
    contract,
    returnTotalVotesForCandidateIDNumber,
    voteWithEggByCandidateNumber,
    voteOneEggForEachCandidate
  }
}
