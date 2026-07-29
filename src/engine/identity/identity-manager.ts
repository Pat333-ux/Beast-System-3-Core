// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityManager
// Purpose: Wallet-bound identity orchestration, DID resolution, badge linkage, and governance-aligned constraints.

import { EventEmitter } from "events";

/**
 * Core identity types
 */

export type WalletAddress = string; // e.g. 0x-prefixed EVM address

export type Did = string; // e.g. did:nwo:beast:...

export type IdentityStatus = "active" | "suspended" | "revoked";

export interface IdentityBadge {
  id: string;
  code: string; // semantic badge code (e.g. GOV-CONTRIBUTOR, FED-ANCHOR)
  issuedAt: Date;
  expiresAt?: Date;
  issuer: Did;
  metadata?: Record<string, unknown>;
}

export interface SovereignIdentity {
  did: Did;
  wallet: WalletAddress;
  createdAt: Date;
  updatedAt: Date;
  status: IdentityStatus;
  badges: IdentityBadge[];
  metadata: Record<string, unknown>;
}

/**
 * Identity events
 */

export type IdentityEventType =
  | "identity.created"
  | "identity.updated"
  | "identity.suspended"
  | "identity.revoked"
  | "badge.issued"
  | "badge.revoked";

export interface IdentityEvent {
  type: IdentityEventType;
  did: Did;
  timestamp: Date;
  payload: Record<string, unknown>;
}

/**
 * Identity errors
 */

export class IdentityError extends Error {
  readonly code: string;
  readonly context?: Record<string, unknown>;

  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.context = context;
  }
}

/**
 * In-memory registry (replace with URF-S backed storage later)
 */

export interface IdentityStore {
  getByDid(did: Did): SovereignIdentity | undefined;
  getByWallet(wallet: WalletAddress): SovereignIdentity | undefined;
  save(identity: SovereignIdentity): void;
  list(): SovereignIdentity[];
}

export class InMemoryIdentityStore implements IdentityStore {
  private byDid = new Map<Did, SovereignIdentity>();
  private byWallet = new Map<WalletAddress, SovereignIdentity>();

  getByDid(did: Did): SovereignIdentity | undefined {
    return this.byDid.get(did);
  }

  getByWallet(wallet: WalletAddress): SovereignIdentity | undefined {
    return this.byWallet.get(wallet);
  }

  save(identity: SovereignIdentity): void {
    this.byDid.set(identity.did, identity);
    this.byWallet.set(identity.wallet, identity);
  }

  list(): SovereignIdentity[] {
    return Array.from(this.byDid.values());
  }
}

/**
 * IdentityManager configuration
 */

export interface IdentityManagerConfig {
  allowMultipleIdentitiesPerWallet: boolean;
  enforceUniqueWalletBinding: boolean;
  prohibitedBadgeCodes: string[];
  requiredMetadataKeys: string[];
}

/**
 * IdentityManager
 */

export class IdentityManager {
  private readonly store: IdentityStore;
  private readonly config: IdentityManagerConfig;
  private readonly events: EventEmitter;

  constructor(store?: IdentityStore, config?: Partial<IdentityManagerConfig>) {
    this.store = store ?? new InMemoryIdentityStore();
    this.config = {
      allowMultipleIdentitiesPerWallet: false,
      enforceUniqueWalletBinding: true,
      prohibitedBadgeCodes: ["HARMFUL", "ILLEGAL", "UNAUTHORIZED"],
      requiredMetadataKeys: ["federalRecordAnchor", "governanceVersion"],
      ...config,
    };
    this.events = new EventEmitter();
  }

  /**
   * Subscribe to identity events
   */
  on(listener: (event: IdentityEvent) => void): void {
    this.events.on("identity-event", listener);
  }

  private emit(event: IdentityEvent): void {
    this.events.emit("identity-event", event);
  }

  /**
   * Create a new sovereign identity bound to a wallet.
   */
  createIdentity(wallet: WalletAddress, did: Did, metadata: Record<string, unknown> = {}): SovereignIdentity {
    if (!wallet || !wallet.startsWith("0x")) {
      throw new IdentityError("INVALID_WALLET", "Wallet address must be a valid 0x-prefixed string.", { wallet });
    }

    if (!did || !did.startsWith("did:")) {
      throw new IdentityError("INVALID_DID", "DID must be a valid did:* string.", { did });
    }

    if (this.config.enforceUniqueWalletBinding) {
      const existing = this.store.getByWallet(wallet);
      if (existing) {
        throw new IdentityError(
          "WALLET_ALREADY_BOUND",
          "Wallet is already bound to an existing sovereign identity.",
          { wallet, existingDid: existing.did }
        );
      }
    }

    this.enforceRequiredMetadata(metadata);

    const now = new Date();
    const identity: SovereignIdentity = {
      did,
      wallet,
      createdAt: now,
      updatedAt: now,
      status: "active",
      badges: [],
      metadata,
    };

    this.store.save(identity);

    this.emit({
      type: "identity.created",
      did,
      timestamp: now,
      payload: { wallet, metadata },
    });

    return identity;
  }

  /**
   * Update identity metadata.
   */
  updateIdentityMetadata(did: Did, metadataPatch: Record<string, unknown>): SovereignIdentity {
    const identity = this.requireIdentity(did);

    const updatedMetadata = {
      ...identity.metadata,
      ...metadataPatch,
    };

    this.enforceRequiredMetadata(updatedMetadata);

    identity.metadata = updatedMetadata;
    identity.updatedAt = new Date();
    this.store.save(identity);

    this.emit({
      type: "identity.updated",
      did,
      timestamp: identity.updatedAt,
      payload: { metadataPatch },
    });

    return identity;
  }

  /**
   * Suspend an identity (non-destructive, reversible).
   */
  suspendIdentity(did: Did, reason: string): SovereignIdentity {
    const identity = this.requireIdentity(did);

    if (identity.status === "revoked") {
      throw new IdentityError("ALREADY_REVOKED", "Cannot suspend a revoked identity.", { did });
    }

    identity.status = "suspended";
    identity.updatedAt = new Date();
    this.store.save(identity);

    this.emit({
      type: "identity.suspended",
      did,
      timestamp: identity.updatedAt,
      payload: { reason },
    });

    return identity;
  }

  /**
   * Revoke an identity (terminal).
   */
  revokeIdentity(did: Did, reason: string): SovereignIdentity {
    const identity = this.requireIdentity(did);

    identity.status = "revoked";
    identity.updatedAt = new Date();
    this.store.save(identity);

    this.emit({
      type: "identity.revoked",
      did,
      timestamp: identity.updatedAt,
      payload: { reason },
    });

    return identity;
  }

  /**
   * Issue a governance-aligned badge to an identity.
   */
  issueBadge(did: Did, badge: Omit<IdentityBadge, "issuedAt">): IdentityBadge {
    const identity = this.requireIdentity(did);

    if (identity.status !== "active") {
      throw new IdentityError(
        "IDENTITY_NOT_ACTIVE",
        "Badges can only be issued to active identities.",
        { did, status: identity.status }
      );
    }

    if (this.config.prohibitedBadgeCodes.includes(badge.code)) {
      throw new IdentityError(
        "PROHIBITED_BADGE_CODE",
        "Badge code is prohibited by governance rules.",
        { did, code: badge.code }
      );
    }

    const fullBadge: IdentityBadge = {
      ...badge,
      issuedAt: new Date(),
    };

    identity.badges.push(fullBadge);
    identity.updatedAt = new Date();
    this.store.save(identity);

    this.emit({
      type: "badge.issued",
      did,
      timestamp: fullBadge.issuedAt,
      payload: { badgeId: fullBadge.id, code: fullBadge.code },
    });

    return fullBadge;
  }

  /**
   * Revoke a badge from an identity.
   */
  revokeBadge(did: Did, badgeId: string, reason: string): IdentityBadge | undefined {
    const identity = this.requireIdentity(did);

    const index = identity.badges.findIndex((b) => b.id === badgeId);
    if (index === -1) {
      throw new IdentityError("BADGE_NOT_FOUND", "Badge not found on identity.", { did, badgeId });
    }

    const [badge] = identity.badges.splice(index, 1);
    identity.updatedAt = new Date();
    this.store.save(identity);

    this.emit({
      type: "badge.revoked",
      did,
      timestamp: identity.updatedAt,
      payload: { badgeId, reason },
    });

    return badge;
  }

  /**
   * Resolve identity by DID.
   */
  getIdentityByDid(did: Did): SovereignIdentity | undefined {
    return this.store.getByDid(did);
  }

  /**
   * Resolve identity by wallet.
   */
  getIdentityByWallet(wallet: WalletAddress): SovereignIdentity | undefined {
    return this.store.getByWallet(wallet);
  }

  /**
   * List all identities (for registry / audit).
   */
  listIdentities(): SovereignIdentity[] {
    return this.store.list();
  }

  /**
   * Internal helpers
   */

  private requireIdentity(did: Did): SovereignIdentity {
    const identity = this.store.getByDid(did);
    if (!identity) {
      throw new IdentityError("IDENTITY_NOT_FOUND", "No identity found for DID.", { did });
    }
    return identity;
  }

  private enforceRequiredMetadata(metadata: Record<string, unknown>): void {
    for (const key of this.config.requiredMetadataKeys) {
      if (metadata[key] === undefined || metadata[key] === null) {
        throw new IdentityError(
          "MISSING_REQUIRED
