# How Varp Works

Varp follows a simple evidence to rights pipeline.

## Step 1: Asset lookup

The user submits:

```text
chain + token contract address
```

Varp resolves the asset identity and loads any existing profile.

## Step 2: Onchain evidence

Varp reads relevant blockchain data such as:

- token standard,
- contract state,
- transfer restrictions,
- whitelist or allowlist behavior,
- pause and freeze mechanisms,
- mint and burn permissions,
- admin roles,
- ownership,
- upgradeability,
- relevant events.

## Step 3: Offchain evidence

Varp indexes authoritative documentation such as:

- issuer documentation,
- offering documents,
- terms and conditions,
- custodian documentation,
- legal disclosures,
- corporate action documentation,
- eligibility rules.

## Step 4: Rights normalization

The Rights Engine converts raw observations into a common schema.

Example:

```text
Document says: only approved investors may receive the token.
Contract says: transfer recipient must pass allowlist check.

Normalized result:
transfer.permissioned = true
transfer.whitelist_required = true
```

## Step 5: Verification

The Verification Engine checks whether the major evidence sources agree.

It then assigns:

- Verified,
- Partially Verified,
- Unverified,
- or Conflict.

## Step 6: Profile delivery

The final Rights Profile is exposed through:

- the Varp dashboard,
- the Varp API,
- comparison views,
- and optionally an onchain profile anchor.

## Step 7: Change tracking

When important evidence changes, Varp creates a new profile version and records the change.

```text
New contract state
        or
New authoritative document
        |
        v
Re-evaluate profile
        |
        v
New version + change record
```
