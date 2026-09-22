# Rights Model

The Rights Model is the common language used by Varp.

The first version intentionally uses a small set of categories so the system stays understandable and practical.

## Ownership

Describes the relationship between the token holder and the underlying asset.

Possible values:

- **Direct ownership**: the token itself represents direct ownership under the relevant structure.
- **Indirect ownership**: the holder owns a token whose rights are mediated through an issuer, custodian, SPV, or similar structure.
- **Beneficial interest**: the holder has an economic or beneficial claim without direct registered ownership.
- **Synthetic exposure**: the token tracks exposure without representing ownership of the underlying asset.
- **Unknown**: the available evidence is insufficient.

## Economic Rights

Economic rights may include:

- dividends,
- interest,
- yield,
- redemption,
- distributions,
- other cash flow rights.

A right can be present, absent, conditional, restricted, or unknown.

## Governance Rights

Governance information may include:

- voting rights,
- governance participation,
- corporate action participation.

A token can provide economic exposure without voting rights.

## Transfer Rights

Transfer rules describe who can receive or move the token.

Important states include:

- permissionless,
- permissioned,
- whitelist required,
- geographic restrictions,
- investor eligibility restrictions,
- frozen or paused transfers.

## DeFi Rights and Compatibility

A token can exist on a smart contract chain while still being unsuitable for permissionless DeFi.

Varp records whether the asset appears to be:

- transferable to arbitrary smart contracts,
- collateralizable,
- lendable,
- swappable,
- permissionless DeFi compatible.

These fields should not be inferred from token standard compatibility alone.

## Lifecycle

A profile can describe the asset's current lifecycle state:

- `ACTIVE`
- `RESTRICTED`
- `SUSPENDED`
- `CORPORATE_ACTION`
- `REDEEMING`
- `REDEEMED`

Lifecycle is separate from verification. An asset can be fully verified and still be suspended.
