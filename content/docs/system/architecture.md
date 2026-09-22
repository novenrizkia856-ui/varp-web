# System Architecture

The architecture is intentionally simple.

```text
                    +----------------------+
                    |      Dashboard       |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |       REST API       |
                    +----------+-----------+
                               |
                 +-------------+-------------+
                 |                           |
                 v                           v
        +----------------+          +------------------+
        | Rights Engine  |          | Verification     |
        |                |<-------->| Engine           |
        +-------+--------+          +---------+--------+
                |                             |
        +-------+---------+          +--------+---------+
        |                 |          |                  |
        v                 v          v                  v
+---------------+  +---------------+           +---------------+
| Blockchain    |  | Document      |           | PostgreSQL    |
| Indexer       |  | Parser/Index  |           |               |
+---------------+  +---------------+           +---------------+
        |
        v
   RH Chain

Optional:
Rights Profile hash / version metadata -> Varp Registry contract
```

## Frontend

The dashboard presents:

- asset search,
- asset overview,
- rights,
- restrictions,
- DeFi compatibility,
- verification state,
- sources,
- last updated time,
- Rights Diff.

## Backend

The backend coordinates:

- asset lookup,
- profile retrieval,
- normalization,
- comparison,
- verification,
- history.

## Database

The database stores:

- assets,
- rights profiles,
- evidence sources,
- verification states,
- historical versions,
- change records.

## Blockchain Indexer

The indexer reads the technical behavior of supported contracts.

It does not decide legal meaning by itself.

## Document Layer

The document layer stores and extracts rights related information from authoritative materials.

## Rights Engine

The Rights Engine converts heterogeneous evidence into the Varp schema.

## Verification Engine

The Verification Engine checks completeness and consistency across evidence sources.

The system is evidence first: a normalized field should be traceable to the information used to derive it.
