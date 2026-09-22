export const verificationStates = Object.freeze({
  VERIFIED: {
    label: "VERIFIED",
    className: "status-verified",
    description: "Important onchain behavior and authoritative documentation agree.",
  },
  PARTIALLY_VERIFIED: {
    label: "PARTIALLY VERIFIED",
    className: "status-partial",
    description: "Some information is confirmed while important details remain unresolved.",
  },
  UNVERIFIED: {
    label: "UNVERIFIED",
    className: "status-unverified",
    description: "There is not enough authoritative evidence for a verified profile.",
  },
  CONFLICT: {
    label: "CONFLICT",
    className: "status-conflict",
    description: "Observed onchain behavior and documented rights appear inconsistent.",
  },
});

export const demoAssets = Object.freeze([
  {
    id: "xyz-stock-token",
    asset: "XYZ Stock Token",
    underlying: "XYZ Corp Common Stock",
    tokenType: "Tokenized Security",
    ownership: {
      type: "Indirect",
      beneficialInterest: "Supported",
    },
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
    lifecycle: {
      status: "Active",
      corporateActions: "Supported",
    },
    verification: {
      status: "VERIFIED",
      lastChecked: "2026-09-21 14:10 UTC",
      summary: "Core transfer behavior and documented rights agree.",
    },
    sources: [
      {
        name: "Issuer Rights Schedule",
        type: "Issuer Documentation",
        supports: "Ownership, dividends, voting, redemption",
        checked: "2026-09-21",
        description: "Demonstration issuer document describing the represented rights.",
      },
      {
        name: "Transfer Policy",
        type: "Terms",
        supports: "KYC, whitelist, geography, eligibility",
        checked: "2026-09-21",
        description: "Demonstration policy used to evaluate transfer restrictions.",
      },
      {
        name: "Token Contract",
        type: "Onchain Contract",
        supports: "Transfer controls, smart contract behavior",
        checked: "2026-09-21",
        description: "Static demonstration of analyzed contract behavior. No live request was made.",
      },
      {
        name: "Contract Events",
        type: "Events",
        supports: "Observed lifecycle and transfer activity",
        checked: "2026-09-21",
        description: "Static event evidence used only for the product demonstration.",
      },
    ],
  },
  {
    id: "harbor-yield-note",
    asset: "Harbor Yield Note",
    underlying: "Harbor Receivables Pool",
    tokenType: "Tokenized Debt",
    ownership: {
      type: "Beneficial Interest",
      beneficialInterest: "Supported",
    },
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
    lifecycle: {
      status: "Active",
      corporateActions: "Limited",
    },
    verification: {
      status: "PARTIALLY_VERIFIED",
      lastChecked: "2026-09-21 14:10 UTC",
      summary: "Economic rights are supported. Geographic restrictions remain unresolved.",
    },
    sources: [],
  },
  {
    id: "atlas-access-unit",
    asset: "Atlas Access Unit",
    underlying: "Atlas Membership Rights",
    tokenType: "Access Token",
    ownership: {
      type: "Indirect",
      beneficialInterest: "No",
    },
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
    lifecycle: {
      status: "Restricted",
      corporateActions: "No",
    },
    verification: {
      status: "CONFLICT",
      lastChecked: "2026-09-21 14:10 UTC",
      summary: "Documentation requires a whitelist while demonstration contract behavior appears unrestricted.",
    },
    sources: [],
  },
  {
    id: "unverified-unit",
    asset: "Unverified Demo Unit",
    underlying: "Unknown",
    tokenType: "Unknown",
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
      mode: "Unknown",
      kyc: "Unknown",
      whitelist: "Unknown",
      geographicRestrictions: "Unknown",
      investorEligibility: "Unknown",
    },
    defi: {
      smartContractTransfer: "Unknown",
      collateral: "Unknown",
      lending: "Unknown",
      dex: "Unknown",
      permissionlessCompatibility: "Unknown",
    },
    lifecycle: { status: "Unknown", corporateActions: "Unknown" },
    verification: {
      status: "UNVERIFIED",
      lastChecked: "2026-09-21 14:10 UTC",
      summary: "Authoritative documentation is not available in this demonstration profile.",
    },
    sources: [],
  },
]);

export const defaultAsset = demoAssets[0];
