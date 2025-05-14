import { Address, encodeAbiParameters, Hash, Hex, PublicClient } from 'viem'
import { IProverHelper } from './IProverHelper'
import { BaseProverHelper } from './BaseProverHelper'

export class ParentToChildProverHelper
  extends BaseProverHelper
  implements IProverHelper
{
  // return the newest block hash that can be returned by getTargetBlockHash on the prover
  async buildInputForGetTargetBlockHash(): Promise<{
    input: Hex
    targetBlockHash: Hash
  }> {
    // determine the most recent child block hash available in the parent chain's state
    // build input for getTargetBlockHash to return this block hash
    return {
      input: '0x',
      targetBlockHash:
        '0x3c8f4a1b6599dfa00468e2609bb45f317ba5fa95e7ef198b03b75bebf54dd580',
    }
  }

  async buildInputForVerifyTargetBlockHash(
    homeBlockHash: Hash
  ): Promise<{ input: Hex; targetBlockHash: Hash }> {
    // determine the most recent child block hash available in the parent chain's state
    // build input for getTargetBlockHash to return this block hash
    return {
      input: '0x',
      targetBlockHash:
        '0x3c8f4a1b6599dfa00468e2609bb45f317ba5fa95e7ef198b03b75bebf54dd580',
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
