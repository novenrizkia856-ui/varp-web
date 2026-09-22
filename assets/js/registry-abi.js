export const REGISTRY_ABI = [
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function PUBLISHER_ROLE() view returns (bytes32)",
  "function getCurrentVersion(address asset) view returns (uint256)",
  "function getCurrentProfile(address asset) view returns (tuple(bytes32 profileHash,string metadataURI,uint8 status,uint64 updatedAt,address publisher))",
  "function getProfile(address asset,uint256 version) view returns (tuple(bytes32 profileHash,string metadataURI,uint8 status,uint64 updatedAt,address publisher))",
  "function hasRole(bytes32 role,address account) view returns (bool)",
  "function isAssetRegistered(address asset) view returns (bool)",
  "function grantRole(bytes32 role,address account)",
  "function registerAsset(address asset)",
  "function publishProfile(address asset,bytes32 profileHash,string metadataURI,uint8 status) returns (uint256 version)",
  "event AssetRegistered(address indexed asset,address indexed publisher)",
  "event ProfilePublished(address indexed asset,uint256 indexed version,bytes32 indexed profileHash,uint8 status,address publisher)",
];
