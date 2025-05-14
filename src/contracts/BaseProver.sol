// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Lib_SecureMerkleTrie} from "@eth-optimism/contracts/libraries/trie/Lib_SecureMerkleTrie.sol";
import {Lib_RLPReader} from "@eth-optimism/contracts/libraries/rlp/Lib_RLPReader.sol";

contract BaseProver {
    using Lib_RLPReader for Lib_RLPReader.RLPItem;

    function _getSlotFromBlockHeader(
        bytes32 blockHash,
        bytes memory rlpBlockHeader,
        address account,
        uint256 slot,
        bytes memory rlpAccountProof,
        bytes memory rlpStorageProof
    ) internal pure returns (bytes32 value) {
        // verify the block header
        require(
            blockHash == keccak256(rlpBlockHeader),
            "Block hash does not match"
        );

        // extract the state root from the block header
        bytes32 stateRoot = _extractStateRootFromBlockHeader(rlpBlockHeader);

        // verify the account and storage proofs
        value = _getStorageSlotFromStateRoot(stateRoot, rlpAccountProof, rlpStorageProof, account, slot);
    }

    function _extractStateRootFromBlockHeader(bytes memory rlpBlockHeader)
        internal
        pure
        returns (bytes32 stateRoot)
    {
        // extract the state root from the block header
        stateRoot = Lib_RLPReader.toRLPItem(rlpBlockHeader).readList()[3].readBytes32();
    }

    function _getStorageSlotFromStateRoot(bytes32 stateRoot, bytes memory rlpAccountProof, bytes memory rlpStorageProof, address account, uint256 slot)
        internal
        pure
        returns (bytes32 value)
    {
        // verify the proof
        (bool accountExists, bytes memory accountValue) =
            Lib_SecureMerkleTrie.get(abi.encodePacked(account), rlpAccountProof, stateRoot);

        require(accountExists, "Account does not exist");

        bytes32 storageRoot = Lib_RLPReader.toRLPItem(accountValue).readList()[2].readBytes32();

        (bool slotExists, bytes memory slotValue) =
            Lib_SecureMerkleTrie.get(abi.encode(slot), rlpStorageProof, storageRoot);

        // decode the slot value
        if (slotExists) value = Lib_RLPReader.readBytes32(slotValue);
    }
}