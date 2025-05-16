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
import { ChildToParentProverHelper } from '../src/ts/prover-helper/ChildToParentProverHelper'
import { ChildToParentProver$Type } from '../artifacts/src/contracts/ChildToParentProver.sol/ChildToParentProver'
import { basicProverTests } from './basicProverTests'

// replace this with the most recent child block hash available in the parent chain's state
// this is used to test the prover's ability to prove a block
const MOST_RECENT_TARGET_CHAIN_BLOCK_HASH: Hash =
  '0x3bc1a497257a501e84e875bbe3e619bbdde267fc255162329e4b9df2c504386d'

// replace this with a known storage slot value at the specified parent chain block hash
// for example a token account balance
const KNOWN_STORAGE_SLOT_ACCOUNT: Address =
  '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640'
const KNOWN_STORAGE_SLOT: bigint = 0n
const KNOWN_STORAGE_SLOT_VALUE: Hash =
  '0x00010002d302d3008c0302be0000000000004b2dd1daa19c71b7debef45c53df'

describe('ChildToParentProver', function () {
  let prover: GetContractReturnType<
    ChildToParentProver$Type['abi'],
    PublicClient
  >
  let targetClient: PublicClient
  let helper: ChildToParentProverHelper

  beforeEach(async () => {
    await reset(getEnv('CHILD_RPC_URL'), getEnv('CHILD_FORK_TEST_BLOCK'))

    targetClient = createPublicClient({
      transport: http(getEnv('PARENT_RPC_URL')),
    })

    prover = await hre.viem.deployContract('ChildToParentProver')

    helper = new ChildToParentProverHelper(
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
