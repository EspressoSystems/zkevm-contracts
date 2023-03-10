// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.17;

/**
 * @dev Define interface for HotShot contract.
 */
interface IHotShot {
    function commitments(uint256 blockNumber) external view returns (uint256);
}
