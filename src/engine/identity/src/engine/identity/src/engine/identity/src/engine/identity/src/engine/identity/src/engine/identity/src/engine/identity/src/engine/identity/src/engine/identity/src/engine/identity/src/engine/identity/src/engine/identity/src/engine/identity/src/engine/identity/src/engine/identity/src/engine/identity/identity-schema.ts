// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentitySchema
// Purpose: JSON schema definitions for identities, badges, events, artifacts,
// metadata, DIDs, and wallets. Enables validation, interoperability, and
// federal-record alignment.

export const DidSchema = {
  $id: "DidSchema",
  type: "string",
  pattern: "^did:[a-zA-Z0-9]+:[a-zA-Z0-9]+:0x[a-fA-F0-9]{40}$",
  description: "DID format: did:nwo:beast:<wallet>",
};

export const WalletSchema = {
  $id: "WalletSchema",
  type: "string",
  pattern: "^0x[a-fA-F0-9]{40}$",
  description: "EVM wallet address (checksum enforced at runtime)",
};

export const MetadataSchema = {
  $id: "MetadataSchema",
  type: "object",
  properties: {
    governanceVersion: { type: "string" },
    federalRecordAnchor: { type: "string" },
    insignia: { type: "string" },
    provenance: { type: "string" },
  },
  required: [
    "governanceVersion",
    "federalRecordAnchor",
    "insignia",
    "provenance",
  ],
  additionalProperties: true,
};

export const IdentityBadgeSchema = {
  $id: "IdentityBadgeSchema",
  type: "object",
  properties: {
    id: { type: "string" },
    code: { type: "string" },
    issuedAt: { type: "string", format: "date-time" },
    expiresAt: { type: ["string", "null"], format: "date-time" },
    issuer: { $ref: "DidSchema" },
    metadata: { type: ["object", "null"] },
  },
  required: ["id", "code", "issuedAt", "issuer"],
};

export const SovereignIdentitySchema = {
  $id: "SovereignIdentitySchema",
  type: "object",
  properties: {
    did: { $ref: "DidSchema" },
    wallet: { $ref: "WalletSchema" },
    status: { type: "string", enum: ["active", "suspended", "revoked"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    badges: {
      type: "array",
      items: { $ref: "IdentityBadgeSchema" },
    },
    metadata: { $ref: "MetadataSchema" },
  },
  required: [
    "did",
    "wallet",
    "status",
    "createdAt",
    "updatedAt",
    "badges",
    "metadata",
  ],
};

export const IdentityEventSchema = {
  $id: "IdentityEventSchema",
  type: "object",
  properties: {
    id: { type: "string" },
    type: {
      type: "string",
      enum: [
        "identity.created",
        "identity.updated",
        "identity.suspended",
        "identity.revoked",
        "badge.issued",
        "badge.revoked",
        "wallet.verified",
        "artifact.anchored",
      ],
    },
    timestamp: { type: "string", format: "date-time" },
    did: { type: ["string", "null"] },
    wallet: { type: ["string", "null"] },
    payload: { type: "object" },
    metadata: { type: "object" },
  },
  required: ["id", "type", "timestamp", "payload"],
};

export const CivicArtifactSchema = {
  $id: "CivicArtifactSchema",
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    description: { type: ["string", "null"] },
    contentHash: { type: "string" },
    anchoredBy: { $ref: "DidSchema" },
    anchoredWallet: { $ref: "WalletSchema" },
    anchoredAt: { type: "string", format: "date-time" },
    signature: { type: "string" },
    metadata: { type: "object" },
  },
  required: [
    "id",
    "title",
    "contentHash",
    "anchoredBy",
    "anchoredWallet",
    "anchoredAt",
    "signature",
    "metadata",
  ],
};

/**
 * Export all schemas together for URF-S, validation engines, or external systems.
 */
export const IdentitySchemas = {
  DidSchema,
  WalletSchema,
  MetadataSchema,
  IdentityBadgeSchema,
  SovereignIdentitySchema,
  IdentityEventSchema,
  CivicArtifactSchema,
};
