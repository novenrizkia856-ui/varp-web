# Dashboard

The dashboard should remain extremely simple.

## Search

Primary input:

```text
Enter token address...
```

The user should not need to understand the internal system before using Varp.

## Asset Overview

The result page should show:

- asset name,
- underlying asset,
- token type,
- contract address,
- current verification badge,
- last verified time.

## Rights

Example:

```text
Ownership: Indirect
Voting: No
Dividends: Yes
Redemption: Yes
```

## Restrictions

Example:

```text
Transfer: Permissioned
KYC: Required
Eligible wallets: Whitelist
Geographic restrictions: Conditional
```

## DeFi

Example:

```text
Collateral: Restricted
Lending: Unknown
DEX: Restricted
Smart contracts: Restricted
```

## Sources

The dashboard should expose the categories of evidence behind the profile:

- issuer documentation,
- custodian documentation,
- legal/offering documentation,
- onchain contract analysis.

## Conflicts

If Varp detects a conflict, it should be visually obvious.

The dashboard should explain:

- which field is in conflict,
- what the documentation says,
- what Varp observes onchain,
- when each source was last checked.

The goal is clarity, not a complex analytics interface.
