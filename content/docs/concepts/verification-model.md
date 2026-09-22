# Verification Model

Varp uses explicit verification states instead of calling every indexed asset "verified."

## VERIFIED

Use when the important onchain behavior and authoritative documentation agree and the core rights are sufficiently supported.

Typical example:

- documentation requires whitelisted transfers,
- the contract enforces an allowlist,
- issuer or custodian terms confirm the restriction,
- no material contradiction is found.

## PARTIALLY_VERIFIED

Use when some important rights are confirmed but meaningful gaps remain.

Example:

- transfer restrictions are verified onchain,
- dividend rights are documented,
- redemption mechanics are unclear.

## UNVERIFIED

Use when authoritative information is insufficient.

This state means Varp has not obtained enough reliable evidence to make a strong claim.

## CONFLICT

Use when important evidence sources disagree.

Example:

```text
Documentation:
Transfers require whitelisted wallets.

Observed onchain behavior:
The contract currently allows unrestricted transfers.
```

This is not a small detail. A conflict can change how a wallet, protocol, exchange, or user should interpret the token.

## Verification principle

Varp verifies **claims about rights**, not the commercial quality of an asset.

A `VERIFIED` profile does not mean:

- the asset is safe,
- the issuer is solvent,
- the token is a good investment,
- a regulator has approved it,
- legal enforceability is guaranteed in every jurisdiction.

It only means the indexed rights profile is well supported by the evidence available to Varp.
