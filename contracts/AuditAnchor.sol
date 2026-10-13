// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AuditAnchor
 * @notice Immutable, tamper-evident proof registry on Arc Network for BizFlow Pilot.
 * @dev Compiled with evmVersion "paris" to avoid the PUSH0 opcode on Arc.
 *      Stores cryptographic commitments without leaking private company data.
 */
contract AuditAnchor {
    /// @notice Tracks whether an invoice hash has already been anchored to prevent replay attacks
    mapping(bytes32 => bool) public isInvoiceAnchored;

    /// @notice Emitted whenever a payment settlement proof is permanently anchored
    event Anchored(
        bytes32 indexed invoiceHash,
        bytes32 indexed decisionHash,
        bytes32 indexed paymentRef,
        address sender,
        uint256 timestamp
    );

    /// @notice Error thrown when an invoice hash has already been registered
    error InvoiceAlreadyAnchored(bytes32 invoiceHash);

    /// @notice Error thrown when an empty zero hash is supplied
    error InvalidZeroHash();

    /**
     * @notice Records an immutable proof anchor for an approved settlement
     * @param invoiceHash Cryptographic SHA-256 hash of the verified invoice document
     * @param decisionHash Cryptographic SHA-256 hash of the policy evaluation result
     * @param paymentRef Cryptographic reference or transaction identifier
     */
    function anchor(
        bytes32 invoiceHash,
        bytes32 decisionHash,
        bytes32 paymentRef
    ) external {
        if (invoiceHash == bytes32(0) || decisionHash == bytes32(0)) {
            revert InvalidZeroHash();
        }

        if (isInvoiceAnchored[invoiceHash]) {
            revert InvoiceAlreadyAnchored(invoiceHash);
        }

        isInvoiceAnchored[invoiceHash] = true;

        emit Anchored(
            invoiceHash,
            decisionHash,
            paymentRef,
            msg.sender,
            block.timestamp
        );
    }
}
