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
import { ParentToChildProverHelper } from '../src/ts/prover-helper/ParentToChildProverHelper'
import { ParentToChildProver$Type } from '../artifacts/src/contracts/ParentToChildProver.sol/ParentToChildProver'

// replace this with the most recent child block hash available in the parent chain's state
// this is used to test the prover's ability to prove a block
const MOST_RECENT_CHILD_CHAIN_BLOCK_HASH: Hash =
  '0x3c8f4a1b6599dfa00468e2609bb45f317ba5fa95e7ef198b03b75bebf54dd580'

// replace this with a known storage slot value at the specified child chain block hash
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
  let parentClient: PublicClient
  let childClient: PublicClient
  let helper: ParentToChildProverHelper

  before(async () => {
    await reset(getEnv('PARENT_RPC_URL'), getEnv('PARENT_FORK_TEST_BLOCK'))

    parentClient = await hre.viem.getPublicClient()
    childClient = createPublicClient({
      transport: http(getEnv('CHILD_RPC_URL')),
    })

    prover = await hre.viem.deployContract('ParentToChildProver')

    helper = new ParentToChildProverHelper(
      prover.address,
      parentClient,
      childClient
    )
  })

  it('getTargetBlockHash should return the correct block hash', async () => {
    const { input, targetBlockHash } =
      await helper.buildInputForGetTargetBlockHash()
    expect(targetBlockHash).to.equal(MOST_RECENT_CHILD_CHAIN_BLOCK_HASH)
    expect(await prover.read.getTargetBlockHash([input])).to.equal(
      MOST_RECENT_CHILD_CHAIN_BLOCK_HASH
    )
  })

  it('verifyTargetBlockHash should return the correct block hash', async () => {
    const homeBlockHash = (await parentClient.getBlock()).hash
    const { input, targetBlockHash } =
      await helper.buildInputForVerifyTargetBlockHash(homeBlockHash)
    expect(targetBlockHash).to.equal(MOST_RECENT_CHILD_CHAIN_BLOCK_HASH)
    expect(
      await prover.read.verifyTargetBlockHash([homeBlockHash, input])
    ).to.equal(MOST_RECENT_CHILD_CHAIN_BLOCK_HASH)
  })

  it('verifyStorageSlot should return the correct slot value', async () => {
    const { input, slotValue } = await helper.buildInputForVerifyStorageSlot(
      MOST_RECENT_CHILD_CHAIN_BLOCK_HASH,
      KNOWN_STORAGE_SLOT_ACCOUNT,
      KNOWN_STORAGE_SLOT
    )
    expect(slotValue).to.equal(KNOWN_STORAGE_SLOT_VALUE)
    const [account, slot, value] = await prover.read.verifyStorageSlot([
      MOST_RECENT_CHILD_CHAIN_BLOCK_HASH,
      input,
    ])
    expect(account).to.equal(KNOWN_STORAGE_SLOT_ACCOUNT)
    expect(slot).to.equal(KNOWN_STORAGE_SLOT)
    expect(value).to.equal(KNOWN_STORAGE_SLOT_VALUE)
  })
})
