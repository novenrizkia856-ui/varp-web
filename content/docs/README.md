# Varp

**Varp is a rights intelligence layer for tokenized assets.**

It answers one simple question:

> **What does this token actually give its holder?**

A token balance alone does not explain the legal, economic, governance, transfer, redemption, or DeFi rights attached to the asset. Varp combines **onchain evidence** with **authoritative offchain documentation** and converts that information into a standardized, machine readable **Rights Profile**.

Varp uses a deliberately focused product scope:

- **Asset class:** tokenized stocks
- **Chain:** RH Chain
- **Supported set:** 20 to 50 tokenized stock assets
- **Core output:** a standardized Rights Profile
- **Interfaces:** dashboard + REST API
- **Verification states:** Verified, Partially Verified, Unverified, Conflict
- **Onchain layer:** a minimal non custodial registry that anchors profile versions and verification metadata

Varp is **not** a trading venue, wallet, broker, custodian, token issuer, DEX, lending protocol, or legal advice engine.

Its purpose is information and verification infrastructure.

## Core idea

```text
Token Address
     |
     v
Onchain Evidence ---------+
                          |
                          v
                   Rights Normalization
                          |
                          +------> Rights Profile
                          |
Offchain Documentation ---+
                          |
                          v
                  Verification Engine
                          |
                          v
             VERIFIED / PARTIAL /
              UNVERIFIED / CONFLICT
```

The result is a simple interface for wallets, protocols, exchanges, issuers, developers, and users who need to understand what a tokenized asset represents before they interact with it.
