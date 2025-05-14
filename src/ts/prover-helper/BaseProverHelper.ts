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

export class BaseProverHelper {
  constructor(
    public readonly proverAddress: string,
    readonly homeChainClient: PublicClient,
    readonly targetChainClient: PublicClient
  ) {}

  protected async _getRlpBlockHeader(targetBlockHash: Hash): Promise<Hex> {
    const block: any = await this.targetChainClient.transport.request({
      method: 'eth_getBlockByHash',
      params: [targetBlockHash, false],
    })

    if (!block) {
      throw new Error('Block not found')
    }

    return this._convertToRlpBlock(block)
  }

  protected async _getRlpStorageAndAccountProof(
    targetBlockHash: Hash,
    account: Address,
    slot: bigint
  ): Promise<{ rlpAccountProof: Hex; rlpStorageProof: Hex; slotValue: Hash }> {
    const block: any = await this.targetChainClient.transport.request({
      method: 'eth_getBlockByHash',
      params: [targetBlockHash, true],
    })

    if (!block) {
      throw new Error('Block not found')
    }

    const proof = await this.targetChainClient.getProof({
      address: account,
      storageKeys: [toHex(slot, { size: 32 })],
      blockNumber: block.number,
    })

    const slotValue = toHex(proof.storageProof[0].value, { size: 32 })
    const rlpAccountProof = toRlp(proof.accountProof)
    const rlpStorageProof = toRlp(proof.storageProof[0].proof)

    return {
      rlpAccountProof,
      rlpStorageProof,
      slotValue,
    }
  }

  protected _convertToRlpBlock(rpcBlock: any): Hex {
    const encodeInt = (hex: string) => {
      const value = BigInt(hex)
      if (value === 0n) return '0x'
      return cleanHex(value.toString(16)) as Hex
    }

    const cleanHex = (hex: string) => {
      const clean = hex.replace(/^0x/, '')
      return `0x${clean.length % 2 === 0 ? clean : '0' + clean}` as Hex
    }

    const headerFields: Hex[] = [
      cleanHex(rpcBlock.parentHash),
      cleanHex(rpcBlock.sha3Uncles),
      cleanHex(rpcBlock.miner),
      cleanHex(rpcBlock.stateRoot),
      cleanHex(rpcBlock.transactionsRoot),
      cleanHex(rpcBlock.receiptsRoot),
      cleanHex(rpcBlock.logsBloom),
      encodeInt(rpcBlock.difficulty),
      encodeInt(rpcBlock.number),
      encodeInt(rpcBlock.gasLimit),
      encodeInt(rpcBlock.gasUsed),
      encodeInt(rpcBlock.timestamp),
      cleanHex(rpcBlock.extraData),
      cleanHex(rpcBlock.mixHash),
      cleanHex(rpcBlock.nonce),
    ]

    if (rpcBlock.baseFeePerGas)
      headerFields.push(encodeInt(rpcBlock.baseFeePerGas))
    if (rpcBlock.withdrawalsRoot)
      headerFields.push(cleanHex(rpcBlock.withdrawalsRoot))
    if (rpcBlock.blobGasUsed) headerFields.push(encodeInt(rpcBlock.blobGasUsed))
    if (rpcBlock.excessBlobGas)
      headerFields.push(encodeInt(rpcBlock.excessBlobGas))
    if (rpcBlock.parentBeaconBlockRoot)
      headerFields.push(cleanHex(rpcBlock.parentBeaconBlockRoot))
    if (rpcBlock.requestsHash)
      headerFields.push(cleanHex(rpcBlock.requestsHash))

    return toRlp(headerFields)
  }

  // protected async _buildInputForVerifyStorageSlot(
  //   targetBlockHash: Hash,
  //   account: Address,
  //   slot: bigint
  // ): Promise<{ input: Hex; slotValue: Hash }> {
  //   const block: any = await this.targetChainClient.transport.request({
  //     method: 'eth_getBlockByHash',
  //     params: [targetBlockHash, true],
  //   })

  //   if (!block) {
  //     throw new Error('Block not found')
  //   }

  //   const rlpBlockHeader = this._convertToRlpBlock(block)

  //   const proof = await this.targetChainClient.getProof({
  //     address: account,
  //     storageKeys: [toHex(slot, { size: 32 })],
  //     blockNumber: block.number,
  //   })

  //   const slotValue = toHex(proof.storageProof[0].value, { size: 32 })

  //   const rlpAccountProof = toRlp(proof.accountProof)
  //   const rlpStorageProof = toRlp(proof.storageProof[0].proof)

  //   const input = encodeAbiParameters(
  //     [
  //       { type: 'bytes' }, // block header
  //       { type: 'address' }, // account
  //       { type: 'uint256' }, // slot
  //       { type: 'bytes' }, // account proof
  //       { type: 'bytes' }, // storage proof
  //     ],
  //     [rlpBlockHeader, account, slot, rlpAccountProof, rlpStorageProof]
  //   )

  //   return {
  //     input,
  //     slotValue,
  //   }
  // }
}
