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
import { BaseProverHelper } from './BaseProverHelper'

export class ChildToParentProverHelper
  extends BaseProverHelper
  implements IProverHelper
{
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
    const rlpBlockHeader = await this._getRlpBlockHeader(targetBlockHash)
    const { rlpAccountProof, rlpStorageProof, slotValue } =
      await this._getRlpStorageAndAccountProof(targetBlockHash, account, slot)

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
}
