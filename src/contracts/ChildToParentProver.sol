// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ProverUtils} from "./ProverUtils.sol";
import {IBlockHashProver} from "broadcast-erc/contracts/standard/interfaces/IBlockHashProver.sol";

interface IL1Block {
    function hash() external view returns (bytes32);
}

/// @notice OP-stack implementation of a child to parent IBlockHashProver.
/// @dev    verifyTargetBlockHash and getTargetBlockHash get block hashes from the L1Block predeploy.
///         verifyStorageSlot is implemented to work against any target chain with a standard Ethereum block header and state trie.
contract ChildToParentProver is IBlockHashProver {
    address public constant l1BlockPredeploy = 0x4200000000000000000000000000000000000015;
    uint256 public constant l1BlockHashSlot = 2;

    /// @notice Verify the latest available target block hash given a home chain block hash and a storage proof of the L1Block predeploy.
    /// @param  homeBlockHash The block hash of the home chain.
    /// @param  input ABI encoded (bytes blockHeader, bytes accountProof, bytes storageProof)
    function verifyTargetBlockHash(bytes32 homeBlockHash, bytes calldata input)
        external
        pure
        returns (bytes32 targetBlockHash)
    {
        // decode the input
        bytes memory rlpBlockHeader;
        bytes memory accountProof;
        bytes memory storageProof;
        (rlpBlockHeader, accountProof, storageProof) = abi.decode(input, (bytes, bytes, bytes));

        // verify proofs and get the value
        targetBlockHash = ProverUtils.getSlotFromBlockHeader(
            homeBlockHash, rlpBlockHeader, l1BlockPredeploy, l1BlockHashSlot, accountProof, storageProof
        );
    }

    /// @notice Get the latest parent chain block hash from the L1Block predeploy. Bytes argument is ignored.
    /// @dev    OP stack does not provide access to historical block hashes, so this function can only return the latest.
    ///
    ///         Calls to the Receiver contract could revert because proofs can become stale after the predeploy's block hash is updated.
    ///         In this case, failing calls may need to be retried with a new proof.
    ///
    ///         If the L1Block is consistently updated too frequently, calls to the Receiver may be DoS'd.
    ///         In this case, this prover contract may need to be modified to use a different source of block hashes,
    ///         such as a backup contract that calls the L1Block predeploy and caches the latest block hash.
    function getTargetBlockHash(bytes calldata) external view returns (bytes32 targetBlockHash) {
        return IL1Block(l1BlockPredeploy).hash();
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
