import hre from 'hardhat'
import {
  Address,
  createPublicClient,
  GetContractReturnType,
  Hash,
  http,
  PublicClient,
} from 'viem'
import {
  ChildToParentProverHelper,
  IProverHelper,
  ParentToChildProverHelper,
} from '../src/ts/'
import { expect } from 'chai'
import { IBlockHashProver$Type } from '../artifacts/broadcast-erc/contracts/standard/interfaces/IBlockHashProver.sol/IBlockHashProver'
import { reset } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'

type TestContext = {
  proverType: 'ChildToParentProver' | 'ParentToChildProver'
  proverContract: GetContractReturnType<
    IBlockHashProver$Type['abi'],
    PublicClient
  >
  forkBlockNumber: bigint
  proverHelper: IProverHelper
  expectedTargetBlockHash: Hash
  knownStorageSlotAccount: Address
  knownStorageSlot: bigint
  knownStorageSlotValue: Hash
}

const gasEstimates = {
  ParentToChildProver: {
    getTargetBlockHash: 0n,
    verifyTargetBlockHash: 0n,
    verifyStorageSlot: 0n,
  },
  ChildToParentProver: {
    getTargetBlockHash: 0n,
    verifyTargetBlockHash: 0n,
    verifyStorageSlot: 0n,
  },
}

let homeClient: PublicClient
let targetClient: PublicClient
describe('Basic Prover Tests', () => {
  describe('ChildToParentProver', () => {
    const testContext = {
      proverType: 'ChildToParentProver',
      // UNIMPLEMENTED: forkBlockNumber
      // replace this with the block number of the home chain fork test block
      forkBlockNumber: 0x13f7f27cn,
      // UNIMPLEMENTED: expectedTargetBlockHash
      // replace this with the most recent target block hash available in the target chain's state
      // this is used to test the prover's ability to prove a block
      expectedTargetBlockHash:
        '0x3bc1a497257a501e84e875bbe3e619bbdde267fc255162329e4b9df2c504386d',
      // UNIMPLEMENTED: knownStorageSlotAccount
      // replace this with a known storage slot value at the specified target chain block hash
      // for example a token account balance
      knownStorageSlotAccount: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
      // UNIMPLEMENTED: knownStorageSlot
      knownStorageSlot: 0n,
      // UNIMPLEMENTED: knownStorageSlotValue
      knownStorageSlotValue:
        '0x00010002d302d3008c0302be0000000000004b2dd1daa19c71b7debef45c53df',
    } as unknown as TestContext

    before(async () => {
      const clients = await initialSetup(
        getEnv('CHILD_RPC_URL'),
        getEnv('PARENT_RPC_URL'),
        testContext.forkBlockNumber
      )
      homeClient = clients.homeClient
      targetClient = clients.targetClient

      testContext.proverContract = (await hre.viem.deployContract(
        'ChildToParentProver'
      )) as any

      testContext.proverHelper = new ChildToParentProverHelper(
        homeClient,
        targetClient
      )
    })

    runBasicTests(testContext)
  })

  describe('ParentToChildProver', () => {
    const testContext = {
      proverType: 'ParentToChildProver',
      // UNIMPLEMENTED: forkBlockNumber
      // replace this with the block number of the home chain fork test block
      forkBlockNumber: 0x1568a70n,
      // UNIMPLEMENTED: expectedTargetBlockHash
      // replace this with the most recent target block hash available in the target chain's state
      // this is used to test the prover's ability to prove a block
      expectedTargetBlockHash:
        '0x3c8f4a1b6599dfa00468e2609bb45f317ba5fa95e7ef198b03b75bebf54dd580',
      // UNIMPLEMENTED: knownStorageSlotAccount
      // replace this with a known storage slot value at the specified target chain block hash
      // for example a token account balance
      knownStorageSlotAccount: '0xC6962004f452bE9203591991D15f6b388e09E8D0',
      // UNIMPLEMENTED: knownStorageSlot
      knownStorageSlot: 0n,
      // UNIMPLEMENTED: knownStorageSlotValue
      knownStorageSlotValue:
        '0x0001002328232812fefcf792000000000000000000032a96d8f8d5f811f7608f',
    } as unknown as TestContext

    before(async () => {
      const clients = await initialSetup(
        getEnv('PARENT_RPC_URL'),
        getEnv('CHILD_RPC_URL'),
        testContext.forkBlockNumber
      )
      homeClient = clients.homeClient
      targetClient = clients.targetClient

      testContext.proverContract = (await hre.viem.deployContract(
        'ParentToChildProver'
      )) as any

      testContext.proverHelper = new ParentToChildProverHelper(
        homeClient,
        targetClient
      )
    })

    runBasicTests(testContext)
  })

  after(() => {
    console.log('\nGas Estimates:', gasEstimates)
  })
})

async function initialSetup(
  homeUrl: string,
  targetUrl: string,
  forkBlockNumber: bigint
) {
  await reset(homeUrl, forkBlockNumber)
  const homeClient = await hre.viem.getPublicClient()
  patchHardhatClient(homeClient, homeUrl, forkBlockNumber)
  const targetClient = createPublicClient({
    transport: http(targetUrl),
  })
  return {
    homeClient,
    targetClient,
  }
}

function runBasicTests(ctx: TestContext) {
  it('getTargetBlockHash should return the correct block hash', async () => {
    const { input, targetBlockHash } =
      await ctx.proverHelper.buildInputForGetTargetBlockHash()
    expect(targetBlockHash).to.equal(ctx.expectedTargetBlockHash)
    expect(await ctx.proverContract.read.getTargetBlockHash([input])).to.equal(
      ctx.expectedTargetBlockHash
    )

    gasEstimates[ctx.proverType].getTargetBlockHash =
      await homeClient.estimateContractGas({
        address: ctx.proverContract.address,
        abi: ctx.proverContract.abi,
        functionName: 'getTargetBlockHash',
        args: [input],
      })
  })

  it('verifyTargetBlockHash should return the correct block hash', async () => {
    const homeBlockHash = (
      await (
        await hre.viem.getPublicClient()
      ).getBlock({ blockNumber: ctx.forkBlockNumber })
    ).hash
    const { input, targetBlockHash } =
      await ctx.proverHelper.buildInputForVerifyTargetBlockHash(homeBlockHash)
    expect(targetBlockHash).to.equal(ctx.expectedTargetBlockHash)
    expect(
      await ctx.proverContract.read.verifyTargetBlockHash([
        homeBlockHash,
        input,
      ])
    ).to.equal(ctx.expectedTargetBlockHash)

    gasEstimates[ctx.proverType].verifyTargetBlockHash =
      await homeClient.estimateContractGas({
        address: ctx.proverContract.address,
        abi: ctx.proverContract.abi,
        functionName: 'verifyTargetBlockHash',
        args: [homeBlockHash, input],
      })
  })

  it('verifyStorageSlot should return the correct slot value', async () => {
    const { input, slotValue } =
      await ctx.proverHelper.buildInputForVerifyStorageSlot(
        ctx.expectedTargetBlockHash,
        ctx.knownStorageSlotAccount,
        ctx.knownStorageSlot
      )
    expect(slotValue).to.equal(
      ctx.knownStorageSlotValue,
      "buildInputForVerifyStorageSlot didn't return the expected slot value"
    )
    const [account, slot, value] =
      await ctx.proverContract.read.verifyStorageSlot([
        ctx.expectedTargetBlockHash,
        input,
      ])
    expect(account).to.equal(
      ctx.knownStorageSlotAccount,
      "verifyStorageSlot didn't return the expected account"
    )
    expect(slot).to.equal(
      ctx.knownStorageSlot,
      "verifyStorageSlot didn't return the expected slot"
    )
    expect(value).to.equal(
      ctx.knownStorageSlotValue,
      "verifyStorageSlot didn't return the expected slot value"
    )

    gasEstimates[ctx.proverType].verifyStorageSlot =
      await homeClient.estimateContractGas({
        address: ctx.proverContract.address,
        abi: ctx.proverContract.abi,
        functionName: 'verifyStorageSlot',
        args: [ctx.expectedTargetBlockHash, input],
      })
  })
}

function getEnv(key: string) {
  const value = process.env[key]
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value
}

// since the hardhat network does not support the `eth_getProof` method,
// we need to patch the client bypass the hardhat network to query the forked RPC directly
function patchHardhatClient(
  hardhatClient: PublicClient,
  forkUrl: string,
  forkBlock: bigint
) {
  const forkClient = createPublicClient({
    transport: http(forkUrl),
  })
  hardhatClient.getProof = async args => {
    // we need to cap the specified block at <= the fork block
    // since the two rpc's will have diverged at the fork block
    const blockTag = args.blockTag || args.blockNumber || forkBlock
    let blockNumber =
      typeof blockTag === 'bigint'
        ? blockTag
        : (await hardhatClient.getBlock({ blockTag })).number
    if (blockNumber === null) {
      throw new Error(`Block number ${blockTag} not found`)
    }

    blockNumber = blockNumber > forkBlock ? forkBlock : blockNumber

    return forkClient.getProof({
      ...args,
      blockTag: undefined,
      blockNumber,
    })
  }
}
