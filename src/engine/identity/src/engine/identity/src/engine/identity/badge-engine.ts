// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: BadgeEngine
// Purpose: Governance-aligned badge creation, validation, semantic metadata enforcement,
// issuance constraints, revocation logic, and registry integration.

import {
  IdentityBadge,
  SovereignIdentity,
  IdentityError,
  Did,
} from "./identity-manager";

import { IdentityRegistry } from "./identity-registry";

export interface BadgeDefinition {
  code: string; // e.g. GOV-CONTRIBUTOR, FED-ANCHOR, WELLBEING-AGENT
  description: string;
  requiredMetadata?: string[]; // metadata keys identity must have
  prohibitedForStatus?: ("suspended" | "revoked")[];
  expiresInDays?: number; // optional auto-expiration
}

export interface BadgeEngineConfig {
  prohibitedCodes: string[];
  definitions: BadgeDefinition[];
}

export class BadgeEngine {
  private readonly registry: IdentityRegistry;
  private readonly config: BadgeEngineConfig;

  constructor(registry: IdentityRegistry, config?: Partial<BadgeEngineConfig>) {
    this.registry = registry;

    this.config = {
      prohibitedCodes: ["HARMFUL", "ILLEGAL", "UNAUTHORIZED"],
      definitions: [],
      ...config,
    };
  }

  /**
   * Register a new badge definition.
   */
  registerDefinition(def: BadgeDefinition): void {
    if (this.config.prohibitedCodes.includes(def.code)) {
      throw new IdentityError(
        "PROHIBITED_BADGE_DEFINITION",
        `Badge code '${def.code}' is prohibited by governance rules.`,
        { code: def.code }
      );
    }

    this.config.definitions.push(def);
  }

  /**
   * Issue a badge to an identity.
   */
  issueBadge(did: Did, code: string, issuer: Did, metadata?: Record<string, unknown>): IdentityBadge {
    const identity = this.requireIdentity(did);
    const definition = this.requireDefinition(code);

    if (identity.status !== "active") {
      throw new IdentityError(
        "IDENTITY_NOT_ACTIVE",
        "Cannot issue badges to suspended or revoked identities.",
        { did, status: identity.status }
      );
    }

    this.enforceMetadataRequirements(identity, definition);

    const now = new Date();
    const expiresAt = definition.expiresInDays
      ? new Date(now.getTime() + definition.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    const badge: IdentityBadge = {
      id: `${code}-${now.getTime()}`,
      code,
      issuedAt: now,
      expiresAt,
      issuer,
      metadata,
    };

    identity.badges.push(badge);
    identity.updatedAt = now;

    this.registry.register(identity);

    return badge;
  }

  /**
   * Revoke a badge from an identity.
   */
  revokeBadge(did: Did, badgeId: string, reason: string): IdentityBadge {
    const identity = this.requireIdentity(did);

    const index = identity.badges.findIndex((b) => b.id === badgeId);
    if (index === -1) {
      throw new IdentityError(
        "BADGE_NOT_FOUND",
        "Badge not found on identity.",
        { did, badgeId }
      );
    }

    const [badge] = identity.badges.splice(index, 1);
    identity.updatedAt = new Date();

    this.registry.register(identity);

    return badge;
  }

  /**
   * Validate badge expiration and governance constraints.
   */
  validateBadge(badge: IdentityBadge): boolean {
    if (badge.expiresAt && badge.expiresAt.getTime() < Date.now()) {
      return false;
    }
    return true;
  }

  /**
   * List all badges for an identity.
   */
  listBadges(did: Did): IdentityBadge[] {
    const identity = this.requireIdentity(did);
    return identity.badges;
  }

  /**
   * Governance-aligned badge lookup.
   */
  listIdentitiesWithBadge(code: string): SovereignIdentity[] {
    return this.registry.getByBadgeCode(code);
  }

  /**
   * Internal helpers
   */

  private requireIdentity(did: Did): SovereignIdentity {
    const identity = this.registry.getByDid(did);
    if (!identity) {
      throw new IdentityError(
        "IDENTITY_NOT_FOUND",
        "No identity found for DID.",
        { did }
      );
    }
    return identity;
  }

  private requireDefinition(code: string): BadgeDefinition {
    const def = this.config.definitions.find((d) => d.code === code);
    if (!def) {
      throw new IdentityError(
        "UNKNOWN_BADGE_CODE",
        `Badge code '${code}' is not registered.`,
        { code }
      );
    }
    return def;
  }

  private enforceMetadataRequirements(identity: SovereignIdentity, def: BadgeDefinition): void {
    if (!def.requiredMetadata) return;

    for (const key of def.requiredMetadata) {
      if (identity.metadata[key] === undefined) {
        throw new IdentityError(
          "MISSING_REQUIRED_METADATA",
          `Identity is missing required metadata key '${key}' for badge '${def.code}'.`,
          { did: identity.did, key }
        );
      }
    }
  }
}

/**
 * Factory for default BadgeEngine instance.
 */
export function createBadgeEngine(registry: IdentityRegistry): BadgeEngine {
  return new BadgeEngine(registry);
}
