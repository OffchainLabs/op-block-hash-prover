import { AbstractProvider, JsonRpcPayload, JsonRpcProvider, JsonRpcResult, Provider } from 'ethers';
import {ChildToParentProver, ChildToParentProver__factory} from '../../typechain-types';

export type GetTargetBlockHashExtraArguments = undefined

export class ChildToParentProverHelper {
  constructor(public readonly childToParentProverAddress: string, readonly childProvider: Provider, readonly parentProvider: Provider) {}

  // return the newest block hash that can be returned by getTargetBlockHash on the prover
  async buildInputForGetTargetBlockHash(): Promise<{ input: string, targetBlockHash: string }> {
    throw new Error("Not implemented");
  }

  async buildInputForVerifyTargetBlockHash(homeBlockHash: string): Promise<{ input: string, targetBlockHash: string }> {
    throw new Error("Not implemented");
  }
}
