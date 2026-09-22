# API

The API exposes the same normalized information used by the dashboard.

## Complete asset profile

```http
GET /v1/assets/{chain}/{address}
```

Returns the complete Rights Profile.

## Rights only

```http
GET /v1/assets/{chain}/{address}/rights
```

Returns normalized rights information.

## Restrictions

```http
GET /v1/assets/{chain}/{address}/restrictions
```

Returns transfer, eligibility, geographic, KYC, whitelist, and related restrictions.

## Verification

```http
GET /v1/assets/{chain}/{address}/verification
```

Returns:

- current verification state,
- evidence summary,
- source references,
- last updated time,
- unresolved issues or conflicts.

## Changes

```http
GET /v1/assets/{chain}/{address}/changes
```

Returns historical rights or status changes.

## Compare

```http
POST /v1/compare
```

Compares two or more supported assets using normalized rights fields.

## Health

```http
GET /v1/health
```

Returns basic service health.

## API principle

The API should expose explicit `unknown` or unresolved states instead of silently returning false.

For example:

```text
redemption = unknown
```

is different from:

```text
redemption = false
```

That distinction is important for rights intelligence.
