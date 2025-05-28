// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BaseProver} from "./BaseProver.sol";
import {IBlockHashProver} from "broadcast-erc/contracts/standard/interfaces/IBlockHashProver.sol";
import {Bytes} from "@openzeppelin/contracts/utils/Bytes.sol";

interface IAnchorStateRegistry {
    function anchorGame() external view returns (address);
}

interface IFaultDisputeGame {
    function rootClaim() external view returns (bytes32);
    function l2BlockNumber() external view returns (uint256);
}

/// @notice Skeleton implementation of a child to parent IBlockHashProver.
/// @dev    verifyTargetBlockHash and getTargetBlockHash are not implemented.
///         verifyStorageSlot is implemented to work against any target chain with a standard Ethereum block header and state trie.
contract ParentToChildProver is BaseProver, IBlockHashProver {
    struct OutputRootProof {
        bytes32 version;
        bytes32 stateRoot;
        bytes32 messagePasserStorageRoot;
        bytes32 latestBlockhash;
    }

    uint256 public constant ANCHOR_GAME_SLOT = 3;
    address public immutable anchorStateRegistry;

    constructor(address _anchorStateRegistry) {
        anchorStateRegistry = _anchorStateRegistry;
    }

    /// @inheritdoc IBlockHashProver
    function verifyTargetBlockHash(bytes32 homeBlockHash, bytes calldata input)
        external
        view
        returns (bytes32 targetBlockHash)
    {
        return 0xec98a8261b7f7acc46b468859859ccf1c428d5b08d36c937878adc0b14055302;
    }

    /// @notice todo
    /// @param  input ABI encoded (OutputRootProof rootClaimPreimage)
    function getTargetBlockHash(bytes calldata input) external view returns (bytes32 targetBlockHash) {
        // decode the input
        OutputRootProof memory rootClaimPreimage = abi.decode(input, (OutputRootProof));

        address gameProxy = IAnchorStateRegistry(anchorStateRegistry).anchorGame();
        bytes32 rootClaim = IFaultDisputeGame(gameProxy).rootClaim();

        require(rootClaim == keccak256(input), "Invalid root claim preimage");

        return rootClaimPreimage.latestBlockhash;
    }

    // THIS FUNCTION WORKS AND IS TESTED ON ITS OWN
    function _getRootClaimFromGameProxyCode(bytes memory bytecode) internal pure returns (bytes32 rootClaim) {
        // CWIA Calldata Layout:
        // ┌──────────────┬────────────────────────────────────┐
        // │    Bytes     │            Description             │
        // ├──────────────┼────────────────────────────────────┤
        // │ [0, 20)      │ Game creator address               │
        // │ [20, 52)     │ Root claim                         │
        // │ [52, 84)     │ Parent block hash at creation time │
        // │ [84, 84 + n) │ Extra data (opaque)                │
        // └──────────────┴────────────────────────────────────┘

        // grab the root claim from the CWIA data which starts at 0x62
        return abi.decode(Bytes.slice(bytecode, 0x62 + 20, 0x62 + 52), (bytes32));
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
        value = _getSlotFromBlockHeader(targetBlockHash, rlpBlockHeader, account, slot, accountProof, storageProof);
    }

    /// @inheritdoc IBlockHashProver
    function version() external pure returns (uint256) {
        return 1;
    }
}
