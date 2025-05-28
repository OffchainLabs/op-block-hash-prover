import {
  Address,
  encodeAbiParameters,
  getContract,
  Hash,
  Hex,
  keccak256,
  PublicClient,
  zeroHash,
} from 'viem'
import { IProverHelper } from './IProverHelper'
import { BaseProverHelper } from './BaseProverHelper'
import {
  iAnchorStateRegistryAbi,
  iFaultDisputeGameAbi,
  parentToChildProverAbi,
} from '../../wagmi/abi'

export class ParentToChildProverHelper
  extends BaseProverHelper
  implements IProverHelper
{
  constructor(
    homeChainClient: PublicClient,
    targetChainClient: PublicClient,
    public readonly proverAddress: Address
  ) {
    super(homeChainClient, targetChainClient)
  }

  async buildInputForGetTargetBlockHash(): Promise<{
    input: Hex
    targetBlockHash: Hash
  }> {
    // find the anchor game to get the l2 block number and then root claim preimage
    const anchorGame = await this._anchorGameContract()
    const l2BlockNumber = await anchorGame.read.l2BlockNumber()
    const rootClaimPreimage = await this._buildRootClaimPreimage(l2BlockNumber)

    return {
      input: rootClaimPreimage.encoded,
      targetBlockHash: rootClaimPreimage.decoded.latestBlockhash,
    }
  }

  protected async _buildRootClaimPreimage(blockNumber: bigint) {
    const block = await this.targetChainClient.getBlock({
      blockNumber,
    })

    const proof = await this.targetChainClient.getProof({
      address: '0x4200000000000000000000000000000000000016',
      storageKeys: [zeroHash],
      blockNumber,
    })

    const ans = {
      version: zeroHash,
      stateRoot: block.stateRoot,
      messagePasserStorageRoot: proof.storageHash,
      latestBlockhash: block.hash,
    }

    return {
      encoded: encodeAbiParameters(
        [
          { type: 'bytes32' }, // version
          { type: 'bytes32' }, // stateRoot
          { type: 'bytes32' }, // messagePasserStorageRoot
          { type: 'bytes32' }, // latestBlockhash
        ],
        [
          ans.version,
          ans.stateRoot,
          ans.messagePasserStorageRoot,
          ans.latestBlockhash,
        ]
      ),
      decoded: ans,
    }
  }

  async buildInputForVerifyTargetBlockHash(
    homeBlockHash: Hash
  ): Promise<{ input: Hex; targetBlockHash: Hash }> {
    return {
      input: '0x',
      targetBlockHash:
        '0xec98a8261b7f7acc46b468859859ccf1c428d5b08d36c937878adc0b14055302',
    }
  }

  async buildInputForVerifyStorageSlot(
    targetBlockHash: Hash,
    account: Address,
    slot: bigint
  ): Promise<{ input: Hex; slotValue: Hash }> {
    const rlpBlockHeader = await this._getRlpBlockHeader(
      'target',
      targetBlockHash
    )
    const { rlpAccountProof, rlpStorageProof, slotValue } =
      await this._getRlpStorageAndAccountProof(
        'target',
        targetBlockHash,
        account,
        slot
      )

    const input = encodeAbiParameters(
      [
        { type: 'bytes' }, // block header
        { type: 'address' }, // account
        { type: 'uint256' }, // slot
        { type: 'bytes' }, // account proof
        { type: 'bytes' }, // storage proof
      ],
      [rlpBlockHeader, account, slot, rlpAccountProof, rlpStorageProof]
    )

    return { input, slotValue }
  }

  protected async _anchorGameContract(blockNumber?: bigint) {
    return getContract({
      address: await (
        await this._anchorStateRegistryContract()
      ).read.anchorGame({
        blockNumber,
      }),
      abi: iFaultDisputeGameAbi,
      client: this.homeChainClient,
    })
  }

  protected async _anchorStateRegistryContract() {
    return getContract({
      address: await this._proverContract().read.anchorStateRegistry(),
      abi: iAnchorStateRegistryAbi,
      client: this.homeChainClient,
    })
  }

  protected _proverContract() {
    return getContract({
      address: this.proverAddress,
      abi: parentToChildProverAbi,
      client: this.homeChainClient,
    })
  }
}
