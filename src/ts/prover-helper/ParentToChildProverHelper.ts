import { Address, Hash, Hex, PublicClient } from 'viem'
import { IProverHelper } from './IProverHelper'

export class ParentToChildProverHelper implements IProverHelper {
  constructor(
    public readonly childToParentProverAddress: string,
    readonly parentClient: PublicClient,
    readonly childClient: PublicClient
  ) {}

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
        '0x1111111111111111111111111111111111111111111111111111111111111111',
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
        '0x1111111111111111111111111111111111111111111111111111111111111111',
    }
  }

  async buildInputForVerifyStorageSlot(
    targetBlockHash: Hash,
    account: Address,
    slot: BigInt
  ): Promise<{ input: Hex; slotValue: Hash }> {
    return {
      input: '0x',
      slotValue:
        '0x3333333333333333333333333333333333333333333333333333333333333333',
    }
  }
}
