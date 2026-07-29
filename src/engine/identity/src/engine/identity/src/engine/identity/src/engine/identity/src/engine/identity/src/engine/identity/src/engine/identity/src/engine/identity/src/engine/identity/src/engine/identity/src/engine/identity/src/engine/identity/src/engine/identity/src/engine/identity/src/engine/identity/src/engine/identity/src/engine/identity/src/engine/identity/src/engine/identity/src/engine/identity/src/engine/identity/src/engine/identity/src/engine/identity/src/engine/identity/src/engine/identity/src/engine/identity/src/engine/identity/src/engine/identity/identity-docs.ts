// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityDocs
// Purpose: Generate developer documentation for the Identity Layer.
// Produces structured documentation for APIs, CLI, subsystem architecture,
// governance metadata, DID rules, badge workflows, and artifact anchoring.

import fs from "fs";
import path from "path";

import { IdentitySubsystem } from "./identity-bootstrap";
import { IdentityStorageAdapter } from "./identity-storage";

export interface IdentityDocsConfig {
  outputDir?: string;
  includeAPI?: boolean;
  includeCLI?: boolean;
  includeSubsystem?: boolean;
  includeGovernance?: boolean;
  includeStorage?: boolean;
}

export class IdentityDocs {
  private readonly config: IdentityDocsConfig;
  private readonly subsystem: IdentitySubsystem;
  private readonly storage: IdentityStorageAdapter;

  constructor(
    subsystem: IdentitySubsystem,
    storage: IdentityStorageAdapter,
    config: IdentityDocsConfig = {}
  ) {
    this.subsystem = subsystem;
    this.storage = storage;

    this.config = {
      outputDir: config.outputDir ?? "identity-docs",
      includeAPI: config.includeAPI ?? true,
      includeCLI: config.includeCLI ?? true,
      includeSubsystem: config.includeSubsystem ?? true,
      includeGovernance: config.includeGovernance ?? true,
      includeStorage: config.includeStorage ?? true,
    };
  }

  /**
   * Ensure output directory exists.
   */
  private ensureDir(): void {
    if (!fs.existsSync(this.config.outputDir!)) {
      fs.mkdirSync(this.config.outputDir!, { recursive: true });
    }
  }

  /**
   * Write a documentation file.
   */
  private write(name: string, content: string): void {
    const file = path.join(this.config.outputDir!, name);
    fs.writeFileSync(file, content.trim() + "\n");
  }

  /**
   * Generate subsystem documentation.
   */
  private generateSubsystemDocs(): void {
    const content = `
# Identity Subsystem Architecture

The Identity Subsystem consists of:

- IdentityManager
- IdentityRegistry
- BadgeEngine
- WalletVerification
- CivicArtifactAnchor
- IdentityEventBus
- MetadataValidator
- IdentityValidators
- IdentityCrypto
- IdentitySerializer

All components are wired together via bootstrapIdentitySubsystem().
`;

    this.write("subsystem.md", content);
  }

  /**
   * Generate API documentation.
   */
  private generateAPIDocs(): void {
    const content = `
# Identity API Documentation

## Endpoints

### POST /identity
Create a new governed identity.

### GET /identity/:did
Retrieve an identity.

### POST /identity/:did/badge
Issue a badge.

### POST /identity/:did/artifact
Anchor a civic artifact.

### POST /verify
Verify a wallet signature.

### GET /identities
List all identities.

### GET /events
List all identity events.

### GET /artifacts
List all civic artifacts.
`;

    this.write("api.md", content);
  }

  /**
   * Generate CLI documentation.
   */
  private generateCLIDocs(): void {
    const content = `
# Identity CLI Documentation

## Commands

### create-identity <wallet>
Create a new governed identity.

### get-identity <did>
Retrieve an identity.

### issue-badge <did> <code>
Issue a badge.

### list-identities
List all identities.

### list-events
List all events.

### list-artifacts
List all civic artifacts.
`;

    this.write("cli.md", content);
  }

  /**
   * Generate governance metadata documentation.
   */
  private generateGovernanceDocs(): void {
    const content = `
# Governance Metadata Requirements

All identities must include:

- governanceVersion: "3.0"
- federalRecordAnchor: "2:25-cv-00484-JPH-MJD"
- insignia: "Red Ouroboros — New World Order Health & Wellbeing"
- provenance: "New World Order DAO"

These fields are enforced by the Identity Layer.
`;

    this.write("governance.md", content);
  }

  /**
   * Generate storage documentation.
   */
  private generateStorageDocs(): void {
    const content = `
# Identity Storage

Supported storage adapters:

- InMemoryIdentityStorage
- FileIdentityStorage

Storage is used for:

- Identities
- Events
- Civic artifacts

Custom adapters can be implemented by extending IdentityStorageAdapter.
`;

    this.write("storage.md", content);
  }

  /**
   * Generate all documentation.
   */
  generateAll(): void {
    this.ensureDir();

    if (this.config.includeSubsystem) this.generateSubsystemDocs();
    if (this.config.includeAPI) this.generateAPIDocs();
    if (this.config.includeCLI) this.generateCLIDocs();
    if (this.config.includeGovernance) this.generateGovernanceDocs();
    if (this.config.includeStorage) this.generateStorageDocs();
  }
}

/**
 * Factory: generate full documentation set.
 */
export function generateIdentityDocs(
  subsystem: IdentitySubsystem,
  storage: IdentityStorageAdapter,
  config: IdentityDocsConfig = {}
): IdentityDocs {
  const docs = new IdentityDocs(subsystem, storage, config);
  docs.generateAll();
  return docs;
}
