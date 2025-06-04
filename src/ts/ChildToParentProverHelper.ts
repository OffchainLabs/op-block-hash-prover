import { Address, encodeAbiParameters, Hash, Hex } from 'viem'
import { IProverHelper } from './IProverHelper'
import { BaseProverHelper } from './BaseProverHelper'

/**
 * ChildToParentProverHelper is a class that provides helper methods for interacting
 * with the child to parent IBlockHashProver contract.
 *
 * It extends the BaseProverHelper class and implements the IProverHelper interface.
 *
 * buildInputForGetTargetBlockHash and buildInputForVerifyTargetBlockHash methods
 * are currently not implemented and return a hardcoded block hash.
 *
 * buildInputForVerifyStorageSlot is fully implemented and requires no changes
 * unless the prover's verifyStorageSlot function is modified.
 */
export class ChildToParentProverHelper
  extends BaseProverHelper
  implements IProverHelper
{
  // UNIMPLEMENTED: buildInputForGetTargetBlockHash
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

  // UNIMPLEMENTED: buildInputForVerifyTargetBlockHash
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
}
