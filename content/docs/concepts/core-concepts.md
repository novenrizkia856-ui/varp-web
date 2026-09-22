# Core Concepts

Varp is built around five simple concepts.

## 1. Asset Identity

Every supported asset starts with an onchain identity:

- chain,
- token contract address,
- token standard,
- symbol and name,
- underlying asset,
- asset type.

The contract address is the primary lookup input.

## 2. Rights Profile

A Rights Profile is the normalized description of what the token represents and what the holder can or cannot do.

It contains ownership, economic, governance, transfer, DeFi, lifecycle, and verification information.

## 3. Evidence

Every important field should be supported by evidence.

Varp uses two evidence families:

- **Onchain evidence**: contract code, state, permissions, roles, events, transfer controls, upgradeability, and related technical behavior.
- **Offchain evidence**: issuer documents, custody terms, offering documents, legal disclosures, eligibility requirements, redemption terms, and corporate action documentation.

## 4. Verification

Varp does not treat all information as equally certain.

Each profile receives a verification state:

- `VERIFIED`
- `PARTIALLY_VERIFIED`
- `UNVERIFIED`
- `CONFLICT`

## 5. Change History

Rights can change.

Contracts can be upgraded. Admin roles can change. Issuer terms can be updated. Transfer restrictions can be enabled or disabled.

Varp therefore treats rights as versioned information, not a permanent label.
