export const verificationStates = Object.freeze({
  VERIFIED: {
    label: "VERIFIED",
    index: 2,
    className: "status-verified",
    short: "Evidence matched",
    description: "Important onchain behavior and authoritative documentation agree.",
  },
  PARTIALLY_VERIFIED: {
    label: "PARTIALLY VERIFIED",
    index: 1,
    className: "status-partial",
    short: "Evidence partial",
    description: "Some rights are confirmed. Important details remain unresolved.",
  },
  UNVERIFIED: {
    label: "UNVERIFIED",
    index: 0,
    className: "status-unverified",
    short: "Evidence missing",
    description: "There is not enough authoritative evidence for a verified profile.",
  },
  CONFLICT: {
    label: "CONFLICT",
    index: 3,
    className: "status-conflict",
    short: "Evidence conflict",
    description: "Observed onchain behavior and documented rights disagree.",
  },
});

export const rightsProfiles = Object.freeze([
  {
    id: "xyz-stock-token",
    symbol: "XYZX",
    asset: "XYZ Stock Token",
    underlying: "XYZ Corp Common Stock",
    tokenType: "Tokenized Security",
    summary: "Indirect claim on XYZ Corp common stock through a regulated custodian.",
    highlight: "OWNERSHIP / INDIRECT",
    emblem: "stock",
    ownership: { type: "Indirect", beneficialInterest: "Supported" },
    economicRights: {
      dividends: "Yes",
      interest: "No",
      yield: "No",
      redemption: "Yes",
      distributionRights: "Supported",
    },
    governanceRights: {
      voting: "No",
      governanceParticipation: "No",
      corporateActionParticipation: "Supported",
    },
    transfer: {
      mode: "Permissioned",
      kyc: "Required",
      whitelist: "Required",
      geographicRestrictions: "Applies",
      investorEligibility: "Restricted",
    },
    defi: {
      smartContractTransfer: "Restricted",
      collateral: "Restricted",
      lending: "Restricted",
      dex: "Restricted",
      permissionlessCompatibility: "No",
    },
    lifecycle: { status: "Active", corporateActions: "Supported" },
    verification: {
      status: "VERIFIED",
      lastChecked: "2026-09-21 14:10 UTC",
      summary: "Core transfer behavior and documented rights agree.",
    },
    conflicts: [],
    sources: [
      {
        name: "Issuer Rights Schedule",
        type: "Issuer Documentation",
        supports: "Ownership, dividends, voting, redemption",
        checked: "2026-09-21",
        description: "Issuer schedule describing the rights attached to each token.",
      },
      {
        name: "Custody Agreement",
        type: "Custodian Documentation",
        supports: "Beneficial interest, redemption, distributions",
        checked: "2026-09-21",
        description: "Custodian terms confirming shares are held for token holders.",
      },
      {
        name: "Transfer Policy",
        type: "Terms",
        supports: "KYC, whitelist, geography, eligibility",
        checked: "2026-09-21",
        description: "Policy used to evaluate who may hold and receive the token.",
      },
      {
        name: "Token Contract Analysis",
        type: "Onchain Contract",
        supports: "Allowlist checks, pause control, admin roles",
        checked: "2026-09-21",
        description: "Transfer hooks enforce the allowlist described in the policy.",
      },
    ],
    history: [
      { version: 2, date: "2026-09-21", change: "Corporate action participation confirmed by the issuer." },
      { version: 1, date: "2026-09-14", change: "Initial profile built from issuer and contract evidence." },
    ],
  },
  {
    id: "harbor-yield-note",
    symbol: "HYN",
    asset: "Harbor Yield Note",
    underlying: "Harbor Receivables Pool",
    tokenType: "Tokenized Debt",
    summary: "Yield bearing note backed by a pool of short term receivables.",
    highlight: "KYC / REQUIRED",
    emblem: "yield",
    ownership: { type: "Beneficial Interest", beneficialInterest: "Supported" },
    economicRights: {
      dividends: "No",
      interest: "Yes",
      yield: "Yes",
      redemption: "Yes",
      distributionRights: "Supported",
    },
    governanceRights: {
      voting: "No",
      governanceParticipation: "No",
      corporateActionParticipation: "Limited",
    },
    transfer: {
      mode: "Permissioned",
      kyc: "Required",
      whitelist: "Required",
      geographicRestrictions: "Unresolved",
      investorEligibility: "Restricted",
    },
    defi: {
      smartContractTransfer: "Supported",
      collateral: "Unknown",
      lending: "Unknown",
      dex: "Restricted",
      permissionlessCompatibility: "No",
    },
    lifecycle: { status: "Active", corporateActions: "Limited" },
    verification: {
      status: "PARTIALLY_VERIFIED",
      lastChecked: "2026-09-21 14:10 UTC",
      summary: "Economic rights are supported. Geographic restrictions remain unresolved.",
    },
    conflicts: [],
    sources: [
      {
        name: "Note Offering Memorandum",
        type: "Offering Documentation",
        supports: "Interest, yield, redemption schedule",
        checked: "2026-09-20",
        description: "Offering terms defining coupon, maturity, and redemption windows.",
      },
      {
        name: "Servicer Report",
        type: "Issuer Documentation",
        supports: "Distribution rights, pool composition",
        checked: "2026-09-20",
        description: "Monthly report describing receivables and holder distributions.",
      },
      {
        name: "Token Contract Analysis",
        type: "Onchain Contract",
        supports: "KYC registry check, whitelist, smart contract transfer",
        checked: "2026-09-21",
        description: "Transfers require a registry approved identity on both sides.",
      },
    ],
    history: [
      { version: 1, date: "2026-09-21", change: "Initial profile. Jurisdiction list still missing from issuer." },
    ],
  },
  {
    id: "atlas-access-unit",
    symbol: "ATLAS",
    asset: "Atlas Access Unit",
    underlying: "Atlas Membership Rights",
    tokenType: "Access Token",
    summary: "Membership unit whose transfer policy disagrees with its contract.",
    highlight: "TRANSFER / CONFLICT",
    emblem: "access",
    ownership: { type: "Indirect", beneficialInterest: "No" },
    economicRights: {
      dividends: "No",
      interest: "No",
      yield: "No",
      redemption: "No",
      distributionRights: "No",
    },
    governanceRights: {
      voting: "Yes",
      governanceParticipation: "Supported",
      corporateActionParticipation: "No",
    },
    transfer: {
      mode: "Permissionless",
      kyc: "Documented as required",
      whitelist: "Documented as required",
      geographicRestrictions: "Applies",
      investorEligibility: "Restricted",
    },
    defi: {
      smartContractTransfer: "Supported",
      collateral: "Supported",
      lending: "Supported",
      dex: "Supported",
      permissionlessCompatibility: "Yes",
    },
    lifecycle: { status: "Restricted", corporateActions: "No" },
    verification: {
      status: "CONFLICT",
      lastChecked: "2026-09-21 14:10 UTC",
      summary: "Documentation requires a whitelist. Observed contract behavior is unrestricted.",
    },
    conflicts: [
      {
        field: "Transfer whitelist",
        documented: "Transfers require whitelisted wallets.",
        observed: "The contract currently allows unrestricted transfers.",
        checked: "2026-09-21",
      },
    ],
    sources: [
      {
        name: "Membership Terms",
        type: "Terms",
        supports: "Voting, eligibility, whitelist requirement",
        checked: "2026-09-19",
        description: "Terms state only approved members may hold a unit.",
      },
      {
        name: "Token Contract Analysis",
        type: "Onchain Contract",
        supports: "Transfer logic, admin roles",
        checked: "2026-09-21",
        description: "No allowlist check exists in the transfer path.",
      },
      {
        name: "Transfer Events",
        type: "Events",
        supports: "Observed transfers to unapproved wallets",
        checked: "2026-09-21",
        description: "Recent transfers reached wallets outside the member list.",
      },
    ],
    history: [
      { version: 2, date: "2026-09-21", change: "Status moved to Conflict after new transfer events." },
      { version: 1, date: "2026-09-12", change: "Initial profile marked Partially Verified." },
    ],
  },
  {
    id: "meridian-index-unit",
    symbol: "MRDN",
    asset: "Meridian Index Unit",
    underlying: "Meridian Equity Basket",
    tokenType: "Index Exposure",
    summary: "Basket exposure token with no authoritative issuer documentation yet.",
    highlight: "OWNERSHIP / UNKNOWN",
    emblem: "index",
    ownership: { type: "Unknown", beneficialInterest: "Unknown" },
    economicRights: {
      dividends: "Unknown",
      interest: "Unknown",
      yield: "Unknown",
      redemption: "Unknown",
      distributionRights: "Unknown",
    },
    governanceRights: {
      voting: "Unknown",
      governanceParticipation: "Unknown",
      corporateActionParticipation: "Unknown",
    },
    transfer: {
      mode: "Permissionless",
      kyc: "Unknown",
      whitelist: "Not observed",
      geographicRestrictions: "Unknown",
      investorEligibility: "Unknown",
    },
    defi: {
      smartContractTransfer: "Supported",
      collateral: "Unknown",
      lending: "Unknown",
      dex: "Unknown",
      permissionlessCompatibility: "Unknown",
    },
    lifecycle: { status: "Active", corporateActions: "Unknown" },
    verification: {
      status: "UNVERIFIED",
      lastChecked: "2026-09-21 14:10 UTC",
      summary: "Only contract behavior is observable. Authoritative documentation is missing.",
    },
    conflicts: [],
    sources: [
      {
        name: "Token Contract Analysis",
        type: "Onchain Contract",
        supports: "Transfer logic, mint permissions",
        checked: "2026-09-21",
        description: "Standard transfers with a single owner able to mint.",
      },
    ],
    history: [
      { version: 1, date: "2026-09-21", change: "Profile opened. Waiting on issuer documentation." },
    ],
  },
]);

export const findProfile = (id) => rightsProfiles.find((profile) => profile.id === id) || null;

const snake = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

// Machine readable Rights Profile following the vocabulary in the docs.
export function toRightsProfileJson(profile) {
  return {
    asset: {
      name: profile.asset,
      symbol: profile.symbol,
      chain: "rh-chain",
      asset_type: snake(profile.tokenType),
      underlying: profile.underlying,
    },
    ownership: {
      type: snake(profile.ownership.type),
      beneficial_interest: snake(profile.ownership.beneficialInterest),
    },
    economic_rights: {
      dividends: snake(profile.economicRights.dividends),
      interest: snake(profile.economicRights.interest),
      yield: snake(profile.economicRights.yield),
      redemption: snake(profile.economicRights.redemption),
      distribution_rights: snake(profile.economicRights.distributionRights),
    },
    governance_rights: {
      voting: snake(profile.governanceRights.voting),
      governance_participation: snake(profile.governanceRights.governanceParticipation),
      corporate_action_participation: snake(profile.governanceRights.corporateActionParticipation),
    },
    transfer: {
      mode: snake(profile.transfer.mode),
      kyc_required: snake(profile.transfer.kyc),
      whitelist_required: snake(profile.transfer.whitelist),
      geographic_restrictions: snake(profile.transfer.geographicRestrictions),
      investor_eligibility_restrictions: snake(profile.transfer.investorEligibility),
    },
    defi: {
      smart_contract_transfer: snake(profile.defi.smartContractTransfer),
      collateral: snake(profile.defi.collateral),
      lending: snake(profile.defi.lending),
      dex: snake(profile.defi.dex),
      permissionless_compatible: snake(profile.defi.permissionlessCompatibility),
    },
    lifecycle: { status: snake(profile.lifecycle.status) },
    verification: {
      status: snake(profile.verification.status),
      last_updated: profile.verification.lastChecked,
      conflicts: profile.conflicts.map((conflict) => ({
        field: snake(conflict.field),
        documented: conflict.documented,
        observed: conflict.observed,
      })),
      sources: profile.sources.map((source) => snake(source.type)),
    },
    version: profile.history[0].version,
  };
}
