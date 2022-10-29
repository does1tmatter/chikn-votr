import { ethers } from 'ethers'
import useUser from '@/composables/useUser'
import abi from '@/abi/voting.json'
import useUserStore from '@/stores/user'

export default (address) => {
  const { wallet, isAuthenticated } = useUser()
  const userStore = useUserStore()

  let contract
  const setContract = (payload) => contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_VOTING, abi, payload)

  const voteWithEggByCandidateNumber = async (id, amt) => await contract.voteWithEggByCandidateNumber(id, amt)
  const voteOneEggForEachCandidate = async () => await contract.voteOneEggForEachCandidate()
  const returnTotalVotesForCandidateIDNumber = async (id) => await contract.returnTotalVotesForCandidateIDNumber(id).then(response => Number(response))
  const endTimestamp = async (id) => await contract.endofVotingTime().then(response => Number(response) * 1000)
  
  const prizeMoneyTotalWei = async () => await contract.prizeMoneyTotalWei().then(response => String(ethers.utils.formatEther(response)))
  const eggBurntTotalWei = async () => await contract.eggBurntTotalWei().then(response => String(ethers.utils.formatEther(response)))
  const allVotesTotalBase = async () => await contract.allVotesTotalBase().then(response => String(response))
  const votingTimeLeftBlockTimestampHours = async () => await contract.votingTimeLeftBlockTimestamp().then(response => String(Math.floor(Number(response) / 3600))).catch(() => 0)
  const totalVotesFromVoterAddress = async (payload) => await contract.totalVotesFromVoterAddress(payload ?? address.value).then(response => String(response))
  const addressTotalVotesForIDNumber = async (id, payload) => await contract.addressTotalVotesForIdNumber(payload ?? address.value, id).then(response => String(response))

  
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
    voteOneEggForEachCandidate,
    prizeMoneyTotalWei,
    eggBurntTotalWei,
    allVotesTotalBase,
    totalVotesFromVoterAddress,
    votingTimeLeftBlockTimestampHours,
    addressTotalVotesForIDNumber,
    endTimestamp    
  }
}
