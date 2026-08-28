// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IPythMinimal.sol";
import "./interfaces/IOracleRouter.sol";

/// @notice Thin Pyth Core pull-oracle adapter.
/// @dev PYTH address is owner-upgradeable because Pyth contract addresses can migrate.
contract PythOracleRouter is Ownable, IOracleRouter {
    address public pyth;

    error InvalidPyth();
    error InsufficientOracleFee(uint256 required, uint256 supplied);
    error InvalidPrice();
    error UnsupportedExponent(int32 expo);
    error RefundFailed();

    event PythAddressUpdated(address indexed previousPyth, address indexed newPyth);

    constructor(address initialPyth, address initialOwner) Ownable(initialOwner) {
        if (initialPyth == address(0)) revert InvalidPyth();
        pyth = initialPyth;
    }

    function setPyth(address newPyth) external onlyOwner {
        if (newPyth == address(0)) revert InvalidPyth();
        address previous = pyth;
        pyth = newPyth;
        emit PythAddressUpdated(previous, newPyth);
    }

    function getUpdateFee(bytes[] calldata updateData) public view returns (uint256) {
        return IPythMinimal(pyth).getUpdateFee(updateData);
    }

    function updatePriceFeeds(bytes[] calldata updateData)
        external
        payable
        returns (uint256 feePaid)
    {
        feePaid = IPythMinimal(pyth).getUpdateFee(updateData);
        if (msg.value < feePaid) {
            revert InsufficientOracleFee(feePaid, msg.value);
        }

        IPythMinimal(pyth).updatePriceFeeds{value: feePaid}(updateData);

        uint256 refund = msg.value - feePaid;
        if (refund > 0) {
            (bool ok, ) = payable(msg.sender).call{value: refund}("");
            if (!ok) revert RefundFailed();
        }
    }

    function getPrice18(bytes32 feedId, uint256 maxAge)
        external
        view
        returns (uint256 price18, uint256 conf18, uint256 publishTime)
    {
        IPythMinimal.Price memory p =
            IPythMinimal(pyth).getPriceNoOlderThan(feedId, maxAge);

        if (p.price <= 0) revert InvalidPrice();

        price18 = _scaleTo18(uint256(uint64(p.price)), p.expo);
        conf18 = _scaleTo18(uint256(p.conf), p.expo);
        publishTime = p.publishTime;

        if (price18 == 0) revert InvalidPrice();
    }

    function _scaleTo18(uint256 value, int32 expo) internal pure returns (uint256) {
        int256 target = int256(18) + int256(expo);

        // Real Pyth feeds generally use negative exponents such as -8.
        // Bounds protect exponentiation from absurd values.
        if (target > 36 || target < -36) {
            revert UnsupportedExponent(expo);
        }

        if (target >= 0) {
            return value * (10 ** uint256(target));
        }

        return value / (10 ** uint256(-target));
    }
}
