# Project Overview

Varp is a **machine readable rights layer for tokenized assets**.

A normal blockchain interface can tell a user:

- the token contract address,
- the wallet that holds it,
- the token balance,
- and some contract level metadata.

That is not enough to explain what the holder actually owns or is entitled to.

Two tokens that reference the same underlying stock can still differ materially in:

- ownership structure,
- dividend rights,
- voting rights,
- redemption rights,
- transfer restrictions,
- KYC requirements,
- geographic eligibility,
- collateral eligibility,
- DeFi compatibility,
- corporate action treatment,
- and issuer or custodian obligations.

Varp creates one normalized **Rights Profile** for each supported tokenized asset.

## Product definition

Varp is an API and verification layer that translates tokenized assets into:

- machine readable rights,
- restrictions,
- ownership information,
- verification status,
- supporting sources,
- and historical changes.

It combines:

```text
Legal / Economic Context
          +
Asset Documentation
          +
Onchain Contract Evidence
          =
Standardized Rights Intelligence
```

## Core experience

The simplest Varp experience is:

> **Paste a token address. Know what it represents.**

A result should immediately answer:

- What is the underlying asset?
- Is ownership direct, indirect, beneficial, synthetic, or unknown?
- Does the holder receive dividends or other distributions?
- Does the holder have voting rights?
- Can the token be redeemed?
- Is transfer permissioned?
- Is KYC or wallet whitelisting required?
- Can the token interact with smart contracts?
- Can it be used as collateral?
- Are there inconsistencies between documentation and onchain behavior?
- When was the information last verified?
