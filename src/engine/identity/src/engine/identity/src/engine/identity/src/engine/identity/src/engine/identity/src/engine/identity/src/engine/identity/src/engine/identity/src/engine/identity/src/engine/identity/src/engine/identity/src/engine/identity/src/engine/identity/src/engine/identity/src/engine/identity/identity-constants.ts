// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityConstants
// Purpose: Centralized constants for governance, DID namespaces,
// federal-record anchors, badge categories, identity statuses,
// crypto algorithms, and event types.

export const GOVERNANCE_VERSION = "3.0";

export const FEDERAL_CASE_NUMBER = "2:25-cv-00484-JPH-MJD";

export const FEDERAL_RECORD_ANCHOR = "Federal Filing Packet — April 6, 2026";

export const INSIGNIA_OUROBOROS =
  "Red Ouroboros — New World Order Health & Wellbeing";

export const PROVENANCE_CHAIN = "New World Order DAO";

export const DID_NAMESPACE = "did:nwo:beast";

export const IDENTITY_STATUSES = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  REVOKED: "revoked",
} as const;

export const BADGE_CATEGORIES = {
  GOVERNANCE: "GOV",
  WELLBEING: "WELL",
  FEDERAL: "FED",
  CONTRIBUTOR: "CONTRIB",
  SECURITY: "SEC",
} as const;

export const CRYPTO_ALGORITHMS = {
  SHA256: "sha256",
  SHA512: "sha512",
  HMAC_SHA256: "hmac-sha256",
} as const;

export const EVENT_TYPES = {
  IDENTITY_CREATED: "identity.created",
  IDENTITY_UPDATED: "identity.updated",
  IDENTITY_SUSPENDED: "identity.suspended",
  IDENTITY_REVOKED: "identity.revoked",
  BADGE_ISSUED: "badge.issued",
  BADGE_REVOKED: "badge.revoked",
  WALLET_VERIFIED: "wallet.verified",
  ARTIFACT_ANCHORED: "artifact.anchored",
} as const;

/**
 * Required governance metadata keys.
 */
export const REQUIRED_GOVERNANCE_METADATA = [
  "governanceVersion",
  "federalRecordAnchor",
  "insignia",
  "provenance",
];

/**
 * DID format template.
 */
export const DID_FORMAT_TEMPLATE = `${DID_NAMESPACE}:<wallet>`;

/**
 * Wallet replay protection defaults.
 */
export const REPLAY_PROTECTION_WINDOW_MS = 60_000;

/**
 * Badge expiration defaults.
 */
export const BADGE_DEFAULT_EXPIRATION_DAYS = 365;

/**
 * Identity event metadata defaults.
 */
export const EVENT_METADATA_DEFAULTS = {
  governanceVersion: GOVERNANCE_VERSION,
  federalCase: FEDERAL_CASE_NUMBER,
};
