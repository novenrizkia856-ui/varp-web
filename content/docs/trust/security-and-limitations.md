# Security, Trust & Limitations

Varp is a rights intelligence system, so correctness and provenance matter more than pretending every field is certain.

## Evidence first design

Every important claim should have supporting evidence.

Varp should avoid:

- silently inferring legal rights from token names,
- equating ERC compatibility with unrestricted transferability,
- marking unknown fields as false,
- treating unofficial summaries as authoritative,
- calling a profile Verified when major contradictions remain.

## Conflict is a valid result

A disagreement between documentation and live contract behavior should not be hidden.

`CONFLICT` is a first class output.

## Smart contract security

If the optional Varp Registry contract is used, its attack surface should remain minimal.

The registry should not custody assets or user funds. Its main security concerns are:

- unauthorized profile updates,
- compromised publisher/admin keys,
- incorrect status publication,
- accidental overwrite or version confusion.

A versioned update history and explicit authorization model reduce ambiguity.

## Legal limitation

Varp organizes evidence and describes rights based on available sources.

It does not provide legal advice and cannot guarantee that a right will be enforceable in every jurisdiction.

## Financial limitation

A verification badge does not represent investment quality, price stability, issuer solvency, liquidity, or future performance.

## Data freshness

Rights intelligence becomes stale if:

- contracts are upgraded,
- admins change configuration,
- issuer terms change,
- corporate actions occur,
- redemption terms change,
- assets are suspended or redeemed.

Every profile should therefore include a last verified timestamp and change history.
