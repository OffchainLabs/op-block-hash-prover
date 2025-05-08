// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IBlockHashProver} from "broadcast-erc/contracts/standard/interfaces/IBlockHashProver.sol";

contract ParentToChildProver is IBlockHashProver {
    /// @inheritdoc IBlockHashProver
    function verifyTargetBlockHash(bytes32 homeBlockHash, bytes calldata input)
        external
        view
        returns (bytes32 targetBlockHash)
    {
        revert("ParentToChildProver: verifyTargetBlockHash not implemented");
    }

    /// @inheritdoc IBlockHashProver
    function getTargetBlockHash(bytes calldata input) external view returns (bytes32 targetBlockHash) {
        revert("ParentToChildProver: getTargetBlockHash not implemented");
    }

    /// @inheritdoc IBlockHashProver
    function verifyStorageSlot(bytes32 targetBlockHash, bytes calldata input)
        external
        view
        returns (address account, uint256 slot, bytes32 value)
    {
        revert("ParentToChildProver: verifyStorageSlot not implemented");
    }

    /// @inheritdoc IBlockHashProver
    function version() external pure returns (uint256) {
        return 1;
    }
}
