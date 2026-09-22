# Data Sources

Varp combines onchain and offchain sources because neither layer is sufficient by itself.

## Onchain Sources

The blockchain provides technical evidence about how the token currently behaves.

Varp may inspect:

- contract address,
- token standard,
- transfer logic,
- allowlist or whitelist checks,
- pause controls,
- freeze controls,
- mint permissions,
- burn permissions,
- role based access control,
- owner/admin addresses,
- proxy and upgradeability configuration,
- emitted events,
- relevant contract state.

## Offchain Sources

Documents define legal and economic meaning that may not exist in contract storage.

Varp may index:

- issuer documentation,
- offering documents,
- terms and conditions,
- custodian documentation,
- legal disclosures,
- investor eligibility requirements,
- redemption documentation,
- corporate action documentation.

## Source priority

Not every source has equal authority.

Varp should prefer, where available:

1. authoritative issuer or legal documentation,
2. custodian documentation,
3. directly observable onchain behavior,
4. official technical documentation,
5. secondary explanatory material.

Secondary sources can help discovery, but important rights should not be marked Verified solely from unofficial summaries.

## Evidence provenance

For every material claim, Varp should retain:

- source name,
- source type,
- source reference or URL,
- time observed,
- affected rights,
- extraction or observation note.

This allows a user to understand **where a claim came from** instead of receiving an unexplained label.
