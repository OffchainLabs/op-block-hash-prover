import { Address, Hash, Hex, PublicClient } from 'viem'
import { IProverHelper } from './IProverHelper'

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
        '0x2222222222222222222222222222222222222222222222222222222222222222',
    }
  }

  async buildInputForVerifyTargetBlockHash(
    homeBlockHash: Hash
  ): Promise<{ input: Hex; targetBlockHash: Hash }> {
    return {
      input: '0x',
      targetBlockHash:
        '0x2222222222222222222222222222222222222222222222222222222222222222',
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
        '0x4444444444444444444444444444444444444444444444444444444444444444',
    }
  }
}
