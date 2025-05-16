import { reset } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import hre from 'hardhat'
import {
  Address,
  createPublicClient,
  GetContractReturnType,
  Hash,
  http,
  PublicClient,
} from 'viem'
import { getEnv } from '../src/ts/util'
import { ParentToChildProverHelper } from '../src/ts/prover-helper/ParentToChildProverHelper'
import { ParentToChildProver$Type } from '../artifacts/src/contracts/ParentToChildProver.sol/ParentToChildProver'
import { basicProverTests } from './basicProverTests'

// replace this with the block number of the home chain fork test block
const FORK_TEST_BLOCK=0x1568a70

// replace this with the most recent target block hash available in the target chain's state
// this is used to test the prover's ability to prove a block
const MOST_RECENT_TARGET_CHAIN_BLOCK_HASH: Hash =
  '0x3c8f4a1b6599dfa00468e2609bb45f317ba5fa95e7ef198b03b75bebf54dd580'

// replace this with a known storage slot value at the specified target chain block hash
// for example a token account balance
const KNOWN_STORAGE_SLOT_ACCOUNT: Address =
  '0xC6962004f452bE9203591991D15f6b388e09E8D0'
const KNOWN_STORAGE_SLOT: bigint = 0n
const KNOWN_STORAGE_SLOT_VALUE: Hash =
  '0x0001002328232812fefcf792000000000000000000032a96d8f8d5f811f7608f'

describe('ParentToChildProver', function () {
  let prover: GetContractReturnType<
    ParentToChildProver$Type['abi'],
    PublicClient
  >
  let targetClient: PublicClient
  let helper: ParentToChildProverHelper

  beforeEach(async () => {
    await reset(getEnv('PARENT_RPC_URL'), FORK_TEST_BLOCK)

    targetClient = createPublicClient({
      transport: http(getEnv('CHILD_RPC_URL')),
    })

    prover = await hre.viem.deployContract('ParentToChildProver')

    helper = new ParentToChildProverHelper(
      prover.address,
      await hre.viem.getPublicClient(),
      targetClient
    )
  })

  basicProverTests(() => {
    return {
      proverAddress: prover.address,
      proverHelper: helper,
      expectedTargetBlockHash: MOST_RECENT_TARGET_CHAIN_BLOCK_HASH,
      knownStorageSlotAccount: KNOWN_STORAGE_SLOT_ACCOUNT,
      knownStorageSlot: KNOWN_STORAGE_SLOT,
      knownStorageSlotValue: KNOWN_STORAGE_SLOT_VALUE,
    }
  })
})
