// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ProverUtils} from "./ProverUtils.sol";
import {IBlockHashProver} from "broadcast-erc/contracts/standard/interfaces/IBlockHashProver.sol";

/// @notice Skeleton implementation of a child to parent IBlockHashProver.
/// @dev    verifyTargetBlockHash and getTargetBlockHash are not implemented.
///         verifyStorageSlot is implemented to work against any target chain with a standard Ethereum block header and state trie.
contract ChildToParentProver is IBlockHashProver {
    // UNIMPLEMENTED: verifyTargetBlockHash
    /// @inheritdoc IBlockHashProver
    function verifyTargetBlockHash(bytes32 homeBlockHash, bytes calldata input)
        external
        view
        returns (bytes32 targetBlockHash)
    {
        return 0x3bc1a497257a501e84e875bbe3e619bbdde267fc255162329e4b9df2c504386d;
    }

    // UNIMPLEMENTED: getTargetBlockHash
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
        // decode the input
        bytes memory rlpBlockHeader;
        bytes memory accountProof;
        bytes memory storageProof;
        (rlpBlockHeader, account, slot, accountProof, storageProof) =
            abi.decode(input, (bytes, address, uint256, bytes, bytes));

        // verify proofs and get the value
        value = ProverUtils.getSlotFromBlockHeader(
            targetBlockHash, rlpBlockHeader, account, slot, accountProof, storageProof
        );
    }

    /// @inheritdoc IBlockHashProver
    function version() external pure returns (uint256) {
        return 1;
    }
}
