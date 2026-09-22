# Problem

Tokenized assets look simple onchain:

```text
Token -> Wallet -> Balance
```

But a balance does not define the holder's real rights.

The token contract may expose technical behavior, while the legal meaning of the asset is defined elsewhere: issuer documentation, offering documents, custodian terms, eligibility rules, redemption terms, or corporate action policies.

## The information gap

A user may see two stock tokens with similar names and assume they provide the same exposure. In reality, one may represent a direct issuer sponsored security while another may be a custodial representation or synthetic exposure.

That difference can change:

- who legally owns the underlying asset,
- whether dividends flow to the holder,
- whether voting is available,
- whether the asset can be redeemed,
- whether transfers require permission,
- whether the token can be sent to arbitrary smart contracts,
- and whether the token is suitable for DeFi integrations.

## Varp's role

Varp does not try to create these rights.

Varp **reads, organizes, normalizes, and verifies** them.

The product exists to convert fragmented technical and legal information into one standard answer that software and humans can use.
