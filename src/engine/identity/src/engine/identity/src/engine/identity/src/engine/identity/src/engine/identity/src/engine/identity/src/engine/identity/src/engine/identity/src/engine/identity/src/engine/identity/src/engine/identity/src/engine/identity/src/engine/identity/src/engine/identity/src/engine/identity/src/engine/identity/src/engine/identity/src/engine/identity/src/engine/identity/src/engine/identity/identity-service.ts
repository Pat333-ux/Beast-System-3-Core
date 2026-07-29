// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityService
// Purpose: High-level service layer for identity operations, badge workflows,
// artifact anchoring, wallet verification, and governance enforcement.

import { IdentitySubsystem } from "./identity-bootstrap";
import { IdentityError } from "./identity-errors";
import { SovereignIdentity, IdentityBadge } from "./identity-manager";
import { CivicArtifact } from "./civic-artifact-anchor";
import { IdentityStorageAdapter } from "./identity-storage";

export class IdentityService {
  private readonly subsystem: IdentitySubsystem;
  private readonly storage: IdentityStorageAdapter;

  constructor(subsystem: IdentitySubsystem, storage: IdentityStorageAdapter) {
    this.subsystem = subsystem;
    this.storage = storage;
  }

  /**
   * Create a new governed identity and persist it.
   */
  async createIdentity(
    wallet: string,
    metadataPatch: Record<string, unknown> = {}
  ): Promise<SovereignIdentity> {
    const identity = this.subsystem.manager.createIdentity(
      wallet,
      `did:nwo:beast:${wallet.toLowerCase()}`,
      {
        governanceVersion: "3.0",
        federalRecordAnchor: "2:25-cv-00484-JPH-MJD",
        insignia: "Red Ouroboros — New World Order Health & Wellbeing",
        provenance: "New World Order DAO",
        ...metadataPatch,
      }
    );

    this.subsystem.registry.register(identity);
    await this.storage.saveIdentity(identity);

    this.subsystem.events.emit(
      this.subsystem.events.createEvent("identity.created", {
        did: identity.did,
        wallet: identity.wallet,
        metadata: identity.metadata,
      })
    );

    return identity;
  }

  /**
   * Retrieve an identity.
   */
  async getIdentity(did: string): Promise<SovereignIdentity> {
    const identity = await this.storage.loadIdentity(did);

    if (!identity) {
      throw new IdentityError("IDENTITY_NOT_FOUND", "Identity not found.", { did });
    }

    return identity;
  }

  /**
   * Issue a badge to an identity.
   */
  async issueBadge(
    did: string,
    code: string,
    metadata: Record<string, unknown> = {}
  ): Promise<IdentityBadge> {
    const identity = await this.getIdentity(did);

    const badge = this.subsystem.badges.issueBadge(identity, code, metadata);

    this.subsystem.registry.register(identity);
    await this.storage.saveIdentity(identity);

    this.subsystem.events.emit(
      this.subsystem.events.createEvent("badge.issued", {
        did,
        badge,
      })
    );

    await this.storage.saveEvent(
      this.subsystem.events.createEvent("badge.issued", {
        did,
        badge,
      })
    );

    return badge;
  }

  /**
   * Anchor a civic artifact.
   */
  async anchorArtifact(
    did: string,
    wallet: string,
    title: string,
    description: string | undefined,
    content: string,
    nonce: string,
    signature: string
  ): Promise<CivicArtifact> {
    const artifact = await this.subsystem.artifacts.anchorArtifact({
      did,
      wallet,
      artifactTitle: title,
      artifactDescription: description,
      artifactContent: content,
      nonce,
      signature,
    });

    await this.storage.saveArtifact(artifact);

    this.subsystem.events.emit(
      this.subsystem.events.createEvent("artifact.anchored", {
        did,
        wallet,
        artifactId: artifact.id,
        title,
      })
    );

    await this.storage.saveEvent(
      this.subsystem.events.createEvent("artifact.anchored", {
        did,
        wallet,
        artifactId: artifact.id,
        title,
      })
    );

    return artifact;
  }

  /**
   * Verify a wallet signature.
   */
  async verifyWallet(
    message: string,
    signature: string,
    did: string,
    nonce: string
  ): Promise<{ valid: boolean; wallet?: string }> {
    const result = await this.subsystem.wallet.verifyAll(
      message,
      signature,
      did,
      nonce
    );

    this.subsystem.events.emit(
      this.subsystem.events.createEvent("wallet.verified", {
        wallet: result.wallet,
        did,
        valid: result.valid,
        reason: result.reason,
      })
    );

    await this.storage.saveEvent(
      this.subsystem.events.createEvent("wallet.verified", {
        wallet: result.wallet,
        did,
        valid: result.valid,
        reason: result.reason,
      })
    );

    return result;
  }

  /**
   * List all identities.
   */
  async listIdentities(): Promise<SovereignIdentity[]> {
    return await this.storage.listIdentities();
  }

  /**
   * List all events.
   */
  async listEvents(): Promise<ReturnType<typeof this.subsystem.events.getHistory>> {
    return this.subsystem.events.getHistory();
  }

  /**
   * List all artifacts.
   */
  async listArtifacts(): Promise<CivicArtifact[]> {
    return await this.storage.listArtifacts();
  }
}
