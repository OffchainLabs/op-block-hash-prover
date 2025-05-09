import { Hash, Hex, PublicClient } from "viem";

export type GetTargetBlockHashExtraArguments = undefined

export class ChildToParentProverHelper {
  constructor(public readonly childToParentProverAddress: string, readonly childClient: PublicClient, readonly parentClient: PublicClient) {}

  // return the newest block hash that can be returned by getTargetBlockHash on the prover
  async buildInputForGetTargetBlockHash(): Promise<{ input: Hex, targetBlockHash: Hash }> {
    throw new Error("Not implemented");
  }

  async buildInputForVerifyTargetBlockHash(homeBlockHash: Hash): Promise<{ input: Hex, targetBlockHash: Hash }> {
    throw new Error("Not implemented");
  }
}
