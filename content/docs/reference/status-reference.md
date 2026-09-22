# Rights Status Reference

This page provides a compact vocabulary for Varp.

## Verification

| Status | Meaning |
|---|---|
| `VERIFIED` | Core onchain behavior and authoritative documentation agree. |
| `PARTIALLY_VERIFIED` | Some important rights are confirmed, but meaningful gaps remain. |
| `UNVERIFIED` | Evidence is insufficient. |
| `CONFLICT` | Important evidence sources disagree. |

## Ownership

| Value | Meaning |
|---|---|
| `DIRECT` | Direct ownership structure. |
| `INDIRECT` | Rights are mediated through an issuer, custodian, SPV, or similar structure. |
| `BENEFICIAL_INTEREST` | Beneficial/economic claim without direct registered ownership. |
| `SYNTHETIC` | Exposure without ownership of the underlying asset. |
| `UNKNOWN` | Not sufficiently established. |

## Generic right state

Where useful, individual rights can use:

- `YES`
- `NO`
- `CONDITIONAL`
- `RESTRICTED`
- `UNKNOWN`

## Transfer

Useful flags include:

- `permissioned`
- `whitelist_required`
- `kyc_required`
- `geographic_restrictions`
- `investor_eligibility_restrictions`
- `paused`
- `frozen`

## Lifecycle

- `ACTIVE`
- `RESTRICTED`
- `SUSPENDED`
- `CORPORATE_ACTION`
- `REDEEMING`
- `REDEEMED`
