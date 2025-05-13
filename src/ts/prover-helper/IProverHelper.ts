export interface IProverHelper {
  // return the newest block hash that can be returned by getTargetBlockHash on the prover
  buildInputForGetTargetBlockHash(): Promise<{
    input: string
    targetBlockHash: string
  }>

  // return the input for verifyTargetBlockHash
  buildInputForVerifyTargetBlockHash(
    homeBlockHash: string
  ): Promise<{ input: string; targetBlockHash: string }>
}
