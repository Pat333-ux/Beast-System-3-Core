// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityUtils
// Purpose: Utility helpers for DID generation, wallet normalization,
// badge lookup, identity cloning, metadata scaffolding, and safe object handling.

import crypto from "crypto";
import { ethers } from "ethers";

import {
  SovereignIdentity,
  IdentityBadge,
  Did,
  WalletAddress,
} from "./identity-manager";

import { IdentityError } from "./identity-errors";

/**
 * Generate a deterministic DID from a wallet address.
 * Format: did:nwo:beast:<wallet>
 */
export function generateDid(wallet: WalletAddress): Did {
  if (!ethers.isAddress(wallet)) {
    throw new IdentityError("INVALID_WALLET_FORMAT", "Cannot generate DID from invalid wallet.", { wallet });
  }

  return `did:nwo:beast:${wallet.toLowerCase()}`;
}

/**
 * Normalize wallet address to checksum format.
 */
export function normalizeWallet(wallet: WalletAddress): WalletAddress {
  try {
    return ethers.getAddress(wallet);
  } catch {
    throw new IdentityError("INVALID_WALLET_FORMAT", "Wallet address cannot be normalized.", { wallet });
  }
}

/**
 * Generate a random badge ID.
 */
export function generateBadgeId(code: string): string {
  const rand = crypto.randomBytes(8).toString("hex");
  return `${code}-${Date.now()}-${rand}`;
}

/**
 * Clone an identity object (deep copy).
 */
export function cloneIdentity(identity: SovereignIdentity): SovereignIdentity {
  return {
    did: identity.did,
    wallet: identity.wallet,
    status: identity.status,
    createdAt: new Date(identity.createdAt),
    updatedAt: new Date(identity.updatedAt),
    badges: identity.badges.map((b) => cloneBadge(b)),
    metadata: JSON.parse(JSON.stringify(identity.metadata)),
  };
}

/**
 * Clone a badge.
 */
export function cloneBadge(badge: IdentityBadge): IdentityBadge {
  return {
    id: badge.id,
    code: badge.code,
    issuedAt: new Date(badge.issuedAt),
    expiresAt: badge.expiresAt ? new Date(badge.expiresAt) : undefined,
    issuer: badge.issuer,
    metadata: badge.metadata ? JSON.parse(JSON.stringify(badge.metadata)) : undefined,
  };
}

/**
 * Deep freeze an object to prevent mutation.
 */
export function deepFreeze<T>(obj: T): T {
  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as any)[prop];
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });

  return obj;
}

/**
 * Governance metadata scaffold.
 */
export function createGovernanceMetadata(): Record<string, unknown> {
  return {
    governanceVersion: "3.0",
    federalRecordAnchor: "2:25-cv-00484-JPH-MJD",
    insignia: "Red Ouroboros — New World Order Health & Wellbeing",
    provenance: "New World Order DAO",
  };
}

/**
 * Validate that an identity contains governance metadata.
 */
export function ensureGovernanceMetadata(identity: SovereignIdentity): void {
  const required = ["governanceVersion", "federalRecordAnchor", "insignia", "provenance"];

  for (const key of required) {
    if (identity.metadata[key] === undefined) {
      throw new IdentityError(
        "MISSING_REQUIRED_METADATA",
        `Identity is missing required governance metadata key '${key}'.`,
        { did: identity.did, key }
      );
    }
  }
}

/**
 * Utility: check if identity has a badge.
 */
export function hasBadge(identity: SovereignIdentity, code: string): boolean {
  return identity.badges.some((b) => b.code === code);
}

/**
 * Utility: get all badges with a specific code.
 */
export function getBadges(identity: SovereignIdentity, code: string): IdentityBadge[] {
  return identity.badges.filter((b) => b.code === code);
}
