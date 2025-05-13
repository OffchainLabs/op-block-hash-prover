import { reset } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
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

// replace this with the most recent child block hash available in the parent chain's state
// this is used to test the prover's ability to prove a block
const MOST_RECENT_PARENT_CHAIN_BLOCK_HASH: Hash =
  '0x2222222222222222222222222222222222222222222222222222222222222222'

// replace this with a known storage slot value at the specified parent chain block hash
// for example a token account balance
const KNOWN_STORAGE_SLOT_ACCOUNT: Address =
  '0x4444444444444444444444444444444444444444'
const KNOWN_STORAGE_SLOT: bigint = 4n
const KNOWN_STORAGE_SLOT_VALUE: Hash =
  '0x4444444444444444444444444444444444444444444444444444444444444444'

describe('ChildToParentProver', function () {
  let prover: GetContractReturnType<
    ChildToParentProver$Type['abi'],
    PublicClient
  >
  let childClient: PublicClient
  let parentClient: PublicClient
  let helper: ChildToParentProverHelper

  before(async () => {
    await reset(getEnv('CHILD_RPC_URL'), getEnv('CHILD_FORK_TEST_BLOCK'))

    childClient = await hre.viem.getPublicClient()
    parentClient = createPublicClient({
      transport: http(getEnv('PARENT_RPC_URL')),
    })

    prover = await hre.viem.deployContract('ChildToParentProver')

    helper = new ChildToParentProverHelper(
      prover.address,
      parentClient,
      childClient
    )
  })

  it('getTargetBlockHash should return the correct block hash', async () => {
    const { input, targetBlockHash } =
      await helper.buildInputForGetTargetBlockHash()
    expect(targetBlockHash).to.equal(MOST_RECENT_PARENT_CHAIN_BLOCK_HASH)
    expect(await prover.read.getTargetBlockHash([input])).to.equal(
      MOST_RECENT_PARENT_CHAIN_BLOCK_HASH
    )
  })

  it('verifyTargetBlockHash should return the correct block hash', async () => {
    const homeBlockHash = (await parentClient.getBlock()).hash
    const { input, targetBlockHash } =
      await helper.buildInputForVerifyTargetBlockHash(homeBlockHash)
    expect(targetBlockHash).to.equal(MOST_RECENT_PARENT_CHAIN_BLOCK_HASH)
    expect(
      await prover.read.verifyTargetBlockHash([homeBlockHash, input])
    ).to.equal(MOST_RECENT_PARENT_CHAIN_BLOCK_HASH)
  })

  it('verifyStorageSlot should return the correct slot value', async () => {
    const { input, slotValue } = await helper.buildInputForVerifyStorageSlot(
      MOST_RECENT_PARENT_CHAIN_BLOCK_HASH,
      KNOWN_STORAGE_SLOT_ACCOUNT,
      KNOWN_STORAGE_SLOT
    )
    expect(slotValue).to.equal(KNOWN_STORAGE_SLOT_VALUE)
    const [account, slot, value] = await prover.read.verifyStorageSlot([
      MOST_RECENT_PARENT_CHAIN_BLOCK_HASH,
      input,
    ])
    expect(account).to.equal(KNOWN_STORAGE_SLOT_ACCOUNT)
    expect(slot).to.equal(KNOWN_STORAGE_SLOT)
    expect(value).to.equal(KNOWN_STORAGE_SLOT_VALUE)
  })
})
