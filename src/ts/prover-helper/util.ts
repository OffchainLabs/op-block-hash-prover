import { toRlp, Hex } from 'viem'

function encodeInt(hex: string): Hex {
  const value = BigInt(hex)
  if (value === 0n) return '0x'
  let hexStr = value.toString(16)
  if (hexStr.length % 2) hexStr = '0' + hexStr
  return `0x${hexStr}`
}

function cleanHex(hex: string): Hex {
  const clean = hex.replace(/^0x/, '')
  return `0x${clean.length % 2 === 0 ? clean : '0' + clean}`
}

export function convertToRlpBlock(rpcBlock: any): Hex {
  // Base fields (always included)
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

  // Optional EIP fields — only include if present in the block object
  if (rpcBlock.baseFeePerGas)
    headerFields.push(encodeInt(rpcBlock.baseFeePerGas))
  if (rpcBlock.withdrawalsRoot)
    headerFields.push(cleanHex(rpcBlock.withdrawalsRoot))
  if (rpcBlock.blobGasUsed) headerFields.push(encodeInt(rpcBlock.blobGasUsed))
  if (rpcBlock.excessBlobGas)
    headerFields.push(encodeInt(rpcBlock.excessBlobGas))
  if (rpcBlock.parentBeaconBlockRoot)
    headerFields.push(cleanHex(rpcBlock.parentBeaconBlockRoot))
  if (rpcBlock.requestsHash) headerFields.push(cleanHex(rpcBlock.requestsHash))

  return toRlp(headerFields)
}
