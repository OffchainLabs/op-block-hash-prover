import {
  Address,
  encodeAbiParameters,
  Hash,
  Hex,
  PublicClient,
  toHex,
  toRlp,
} from 'viem'
import { IProverHelper } from './IProverHelper'
import { convertToRlpBlock } from './util'

export class ChildToParentProverHelper implements IProverHelper {
  constructor(
    public readonly childToParentProverAddress: string,
    readonly childClient: PublicClient,
    readonly parentClient: PublicClient
  ) {}

  // return the newest block hash that can be returned by getTargetBlockHash on the prover
  async buildInputForGetTargetBlockHash(): Promise<{
    input: Hex
    targetBlockHash: Hash
  }> {
    return {
      input: '0x',
      targetBlockHash:
        '0x3bc1a497257a501e84e875bbe3e619bbdde267fc255162329e4b9df2c504386d',
    }
  }

  async buildInputForVerifyTargetBlockHash(
    homeBlockHash: Hash
  ): Promise<{ input: Hex; targetBlockHash: Hash }> {
    return {
      input: '0x',
      targetBlockHash:
        '0x3bc1a497257a501e84e875bbe3e619bbdde267fc255162329e4b9df2c504386d',
    }
  }

  async buildInputForVerifyStorageSlot(
    targetBlockHash: Hash,
    account: Address,
    slot: bigint
  ): Promise<{ input: Hex; slotValue: Hash }> {
    const block: any = await this.parentClient.transport.request({
      method: 'eth_getBlockByHash',
      params: [targetBlockHash, true],
    })

    if (!block) {
      throw new Error('Block not found')
    }

    const rlpBlockHeader = convertToRlpBlock(block)

    const proof = await this.parentClient.getProof({
      address: account,
      storageKeys: [toHex(slot, { size: 32 })],
      blockNumber: block.number,
    })

    const slotValue = toHex(proof.storageProof[0].value, { size: 32 })

    const rlpAccountProof = toRlp(proof.accountProof)
    const rlpStorageProof = toRlp(proof.storageProof[0].proof)

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

    return {
      input,
      slotValue,
    }
  }
}
