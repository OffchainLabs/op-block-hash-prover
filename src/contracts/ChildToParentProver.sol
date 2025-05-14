// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IBlockHashProver} from "broadcast-erc/contracts/standard/interfaces/IBlockHashProver.sol";
import {Lib_SecureMerkleTrie} from "@eth-optimism/contracts/libraries/trie/Lib_SecureMerkleTrie.sol";
import {Lib_RLPReader} from "@eth-optimism/contracts/libraries/rlp/Lib_RLPReader.sol";

contract ChildToParentProver is IBlockHashProver {
    using Lib_RLPReader for Lib_RLPReader.RLPItem;

    /// @inheritdoc IBlockHashProver
    function verifyTargetBlockHash(bytes32 homeBlockHash, bytes calldata input)
        external
        view
        returns (bytes32 targetBlockHash)
    {
        return 0x3bc1a497257a501e84e875bbe3e619bbdde267fc255162329e4b9df2c504386d;
    }

    /// @inheritdoc IBlockHashProver
    function getTargetBlockHash(bytes calldata input) external view returns (bytes32 targetBlockHash) {
        return 0x3bc1a497257a501e84e875bbe3e619bbdde267fc255162329e4b9df2c504386d;
    }

    /// @notice Verify a storage slot given a target chain block hash and a proof.
    /// @param  targetBlockHash The block hash of the target chain.
    /// @param  input ABI encoded (bytes blockHeader, address account, uint256 slot, bytes accountProof, bytes storageProof)
    function verifyStorageSlot(bytes32 targetBlockHash, bytes calldata input)
        external
        pure
        returns (address account, uint256 slot, bytes32 value)
    {
        bytes memory blockHeader;
        bytes memory accountProof;
        bytes memory storageProof;
        (blockHeader, account, slot, accountProof, storageProof) =
            abi.decode(input, (bytes, address, uint256, bytes, bytes));

        // ensure the block header is valid
        require(keccak256(blockHeader) == targetBlockHash, "Invalid block header");

        // extract the state root from the block header
        bytes32 stateRoot = Lib_RLPReader.toRLPItem(blockHeader).readList()[3].readBytes32();

        // verify the proof
        (bool accountExists, bytes memory accountValue) =
            Lib_SecureMerkleTrie.get(abi.encodePacked(account), accountProof, stateRoot);

        require(accountExists, "Account does not exist");

        bytes32 storageRoot = Lib_RLPReader.toRLPItem(accountValue).readList()[2].readBytes32();

        (bool slotExists, bytes memory slotValue) =
            Lib_SecureMerkleTrie.get(abi.encode(slot), storageProof, storageRoot);

        // decode the slot value
        if (slotExists) value = Lib_RLPReader.readBytes32(slotValue);
    }

    /// @inheritdoc IBlockHashProver
    function version() external pure returns (uint256) {
        return 1;
    }
}
