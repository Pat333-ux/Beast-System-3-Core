// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityRegistry
// Purpose: Global identity indexing, DID lookup, badge indexing, audit snapshots,
// and governance-aligned registry queries.

import { SovereignIdentity, IdentityBadge, Did, WalletAddress } from "./identity-manager";

export interface RegistrySnapshot {
  timestamp: Date;
  identities: SovereignIdentity[];
  totalIdentities: number;
  active: number;
  suspended: number;
  revoked: number;
  badgeCounts: Record<string, number>;
}

export class IdentityRegistry {
  private readonly byDid = new Map<Did, SovereignIdentity>();
  private readonly byWallet = new Map<WalletAddress, SovereignIdentity>();
  private readonly badges = new Map<string, IdentityBadge[]>(); // badgeCode → badges

  /**
   * Register or update an identity.
   */
  register(identity: SovereignIdentity): void {
    this.byDid.set(identity.did, identity);
    this.byWallet.set(identity.wallet, identity);

    // Rebuild badge index for this identity
    for (const badge of identity.badges) {
      if (!this.badges.has(badge.code)) {
        this.badges.set(badge.code, []);
      }
      const list = this.badges.get(badge.code)!;

      // Remove old badge entries for this DID
      const filtered = list.filter((b) => b.id !== badge.id);
      filtered.push(badge);

      this.badges.set(badge.code, filtered);
    }
  }

  /**
   * Lookup by DID.
   */
  getByDid(did: Did): SovereignIdentity | undefined {
    return this.byDid.get(did);
  }

  /**
   * Lookup by wallet.
   */
  getByWallet(wallet: WalletAddress): SovereignIdentity | undefined {
    return this.byWallet.get(wallet);
  }

  /**
   * Lookup all identities with a specific badge code.
   */
  getByBadgeCode(code: string): SovereignIdentity[] {
    const badgeList = this.badges.get(code);
    if (!badgeList) return [];

    const dids = new Set(badgeList.map((b) => b.issuer));
    const results: SovereignIdentity[] = [];

    for (const did of dids) {
      const identity = this.byDid.get(did);
      if (identity) results.push(identity);
    }

    return results;
  }

  /**
   * List all identities.
   */
  list(): SovereignIdentity[] {
    return Array.from(this.byDid.values());
  }

  /**
   * Governance-aligned audit snapshot.
   */
  snapshot(): RegistrySnapshot {
    const identities = this.list();
    const badgeCounts: Record<string, number> = {};

    for (const identity of identities) {
      for (const badge of identity.badges) {
        badgeCounts[badge.code] = (badgeCounts[badge.code] ?? 0) + 1;
      }
    }

    return {
      timestamp: new Date(),
      identities,
      totalIdentities: identities.length,
      active: identities.filter((i) => i.status === "active").length,
      suspended: identities.filter((i) => i.status === "suspended").length,
      revoked: identities.filter((i) => i.status === "revoked").length,
      badgeCounts,
    };
  }

  /**
   * Export registry for chain-of-custody anchoring.
   */
  exportForFederalRecord(): string {
    const snapshot = this.snapshot();

    return JSON.stringify(
      {
        anchoredAt: snapshot.timestamp.toISOString(),
        totalIdentities: snapshot.totalIdentities,
        active: snapshot.active,
        suspended: snapshot.suspended,
        revoked: snapshot.revoked,
        badgeCounts: snapshot.badgeCounts,
      },
      null,
      2
    );
  }
}

/**
 * Factory for default registry instance.
 */
export function createIdentityRegistry(): IdentityRegistry {
  return new IdentityRegistry();
}
