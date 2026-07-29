// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: CivicArtifactAnchor
// Purpose: Anchor federal filings, governance artifacts, and civic documents to
// sovereign identities using cryptographic signatures and chain-of-custody metadata.

import crypto from "crypto";
import { IdentityError, Did, WalletAddress } from "./identity-manager";
import { WalletVerification } from "./wallet-verification";

export interface CivicArtifact {
  id: string;                     // unique artifact ID
  title: string;                  // e.g. "Federal Filing Packet — April 6, 2026"
  description?: string;
  contentHash: string;            // SHA-256 hash of the artifact content
  anchoredBy: Did;                // DID of the anchoring identity
  anchoredWallet: WalletAddress;  // wallet used for signature
  anchoredAt: Date;               // timestamp
  signature: string;              // cryptographic signature
  metadata: Record<string, unknown>;
}

export interface ArtifactAnchorRequest {
  did: Did;
  wallet: WalletAddress;
  artifactTitle: string;
  artifactDescription?: string;
  artifactContent: string | Buffer;
  nonce: string;
  signature: string;
}

export class CivicArtifactAnchor {
  private readonly verification: WalletVerification;
  private readonly artifacts = new Map<string, CivicArtifact>();

  constructor(verification: WalletVerification) {
    this.verification = verification;
  }

  /**
   * Compute SHA-256 hash of artifact content.
   */
  private computeHash(content: string | Buffer): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Anchor a civic artifact to a DID + wallet.
   */
  async anchorArtifact(req: ArtifactAnchorRequest): Promise<CivicArtifact> {
    // Full verification pipeline
    const result = await this.verification.verifyAll(
      req.artifactTitle,
      req.signature,
      req.did,
      req.nonce
    );

    if (!result.valid) {
      throw new IdentityError(
        "ANCHOR_VERIFICATION_FAILED",
        result.reason ?? "Artifact anchoring verification failed.",
        { did: req.did, wallet: req.wallet }
      );
    }

    const hash = this.computeHash(req.artifactContent);
    const now = new Date();

    const artifact: CivicArtifact = {
      id: `${hash}-${now.getTime()}`,
      title: req.artifactTitle,
      description: req.artifactDescription,
      contentHash: hash,
      anchoredBy: req.did,
      anchoredWallet: req.wallet,
      anchoredAt: now,
      signature: req.signature,
      metadata: {
        federalCase: "2:25-cv-00484-JPH-MJD",
        provenance: "New World Order DAO — Federal Record Alignment",
        insignia: "Red Ouroboros — New World Order Health & Wellbeing",
        anchorVersion: "1.0",
      },
    };

    this.artifacts.set(artifact.id, artifact);

    return artifact;
  }

  /**
   * Retrieve an anchored artifact by ID.
   */
  getArtifact(id: string): CivicArtifact | undefined {
    return this.artifacts.get(id);
  }

  /**
   * List all anchored artifacts.
   */
  listArtifacts(): CivicArtifact[] {
    return Array.from(this.artifacts.values());
  }

  /**
   * Export artifact metadata for federal-record submission.
   */
  exportArtifactRecord(id: string): string {
    const artifact = this.artifacts.get(id);

    if (!artifact) {
      throw new IdentityError(
        "ARTIFACT_NOT_FOUND",
        "No civic artifact found for the given ID.",
        { id }
      );
    }

    return JSON.stringify(
      {
        id: artifact.id,
        title: artifact.title,
        anchoredBy: artifact.anchoredBy,
        anchoredWallet: artifact.anchoredWallet,
        anchoredAt: artifact.anchoredAt.toISOString(),
        contentHash: artifact.contentHash,
        metadata: artifact.metadata,
      },
      null,
      2
    );
  }
}

/**
 * Factory for default CivicArtifactAnchor instance.
 */
export function createCivicArtifactAnchor(
  verification: WalletVerification
): CivicArtifactAnchor {
  return new CivicArtifactAnchor(verification);
}
