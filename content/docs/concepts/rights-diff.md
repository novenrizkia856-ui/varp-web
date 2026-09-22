# Rights Diff

Rights Diff compares two or more tokenized assets using the same normalized rights vocabulary.

## Why it matters

Users should not need to read dozens of documents to understand that two tokens referencing the same underlying stock have different rights.

A comparison can make the difference obvious.

| Right | Token A | Token B |
|---|---|---|
| Ownership | Direct | Indirect |
| Voting | Yes | No |
| Dividend | Yes | Yes |
| Transfer | Permissioned | Permissionless |
| Redemption | Yes | No |
| DeFi | Restricted | Supported |

## Comparison rules

Rights Diff compares normalized fields, not token names or marketing descriptions.

The output should highlight:

- equal rights,
- different rights,
- restrictions,
- unknown fields,
- verification differences,
- source conflicts.

## Intended users

Rights Diff is especially useful for:

- wallets,
- exchanges,
- DeFi protocols,
- asset issuers,
- developers,
- users evaluating alternative tokenized representations.
