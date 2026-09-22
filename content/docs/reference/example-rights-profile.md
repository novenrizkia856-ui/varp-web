# Example Rights Profile

The exact schema can evolve. The important goal is a consistent vocabulary.

```json
{
  "asset": {
    "name": "XYZ Stock Token",
    "symbol": "XYZ",
    "chain": "rh-chain",
    "token_address": "0x...",
    "asset_type": "tokenized_security",
    "underlying": "XYZ Corp common stock"
  },
  "ownership": {
    "type": "indirect",
    "legal_claim": true
  },
  "economic_rights": {
    "dividends": true,
    "interest": false,
    "yield": "unknown",
    "redemption": true,
    "distribution_rights": true
  },
  "governance_rights": {
    "voting": false,
    "governance_participation": false,
    "corporate_action_participation": true
  },
  "transfer": {
    "permissioned": true,
    "whitelist_required": true,
    "kyc_required": true,
    "geographic_restrictions": "conditional",
    "investor_eligibility_restrictions": true
  },
  "defi": {
    "smart_contract_transfer": "restricted",
    "collateral": "restricted",
    "lending": "unknown",
    "dex": "restricted",
    "permissionless_compatible": false
  },
  "lifecycle": {
    "status": "active"
  },
  "verification": {
    "status": "verified",
    "last_updated": "timestamp",
    "sources": [
      "issuer_documentation",
      "custodian_documentation",
      "onchain_analysis"
    ]
  }
}
```

## Important interpretation rule

A field being `unknown` is not equivalent to `false`.

Varp should preserve uncertainty instead of manufacturing certainty.
