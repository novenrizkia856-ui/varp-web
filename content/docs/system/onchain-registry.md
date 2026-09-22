# Onchain Registry Concept

The source product is primarily an **information and verification layer**. For a build that also requires a smart contract, Varp can add one minimal onchain component without changing that core idea.

The contract should be a **non custodial Rights Registry**, not a tokenization, trading, or custody contract.

## Purpose

The registry anchors the identity and version of a Rights Profile onchain.

It can answer:

- which asset a profile refers to,
- which profile version is current,
- who published or verified the update,
- when it was updated,
- what verification state was recorded,
- which offchain profile hash or URI corresponds to the version.

## Minimal conceptual record

```text
Asset:
- chain identifier
- token address

Profile anchor:
- profile hash
- optional metadata URI
- verification status
- version
- updated timestamp
```

The full legal and technical profile remains offchain because it is larger, changes over time, and may contain source references that are not appropriate for contract storage.

## Roles

A simple model can use:

- **Admin**: manages authorized publishers/verifiers.
- **Publisher / Verifier**: publishes or updates profile anchors.

Keep governance intentionally simple and limited to the roles required by the product.

## Update flow

```text
Evidence changes
     |
     v
Varp creates a new Rights Profile
     |
     v
Profile content is hashed
     |
     v
Registry stores the new hash + status + version
     |
     v
Event records the update
```

## Events

The contract should conceptually expose events for:

- asset registration,
- profile update,
- verification status update,
- publisher authorization changes.

Events make the history easy to index.

## What the registry does not do

The registry does not:

- hold user funds,
- custody tokenized assets,
- mint stock tokens,
- execute trades,
- guarantee legal enforceability,
- decide whether an asset is a good investment.

Its job is only to create a simple tamper evident anchor for Varp's rights intelligence.
