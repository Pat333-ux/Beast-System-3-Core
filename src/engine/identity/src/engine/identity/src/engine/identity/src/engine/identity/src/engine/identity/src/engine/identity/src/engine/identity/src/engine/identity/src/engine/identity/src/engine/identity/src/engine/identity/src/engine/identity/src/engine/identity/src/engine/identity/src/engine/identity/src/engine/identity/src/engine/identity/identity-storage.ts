// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityStorage
// Purpose: Abstract persistence layer for identities, badges, events,
// and civic artifacts. Supports in-memory, file, database, and URF-S adapters.

import {
  SovereignIdentity,
  IdentityBadge,
} from "./identity-manager";

import { IdentityEvent } from "./identity-events";
import { CivicArtifact } from "./civic-artifact-anchor";
import { IdentityError } from "./identity-errors";

/**
 * Storage adapter interface
 * Allows Beast System 3.0 to plug into any persistence backend.
 */
export interface IdentityStorageAdapter {
  saveIdentity(identity: SovereignIdentity): Promise<void>;
  loadIdentity(did: string): Promise<SovereignIdentity | undefined>;
  listIdentities(): Promise<SovereignIdentity[]>;

  saveEvent(event: IdentityEvent): Promise<void>;
  listEvents(): Promise<IdentityEvent[]>;

  saveArtifact(artifact: CivicArtifact): Promise<void>;
  loadArtifact(id: string): Promise<CivicArtifact | undefined>;
  listArtifacts(): Promise<CivicArtifact[]>;
}

/**
 * In-memory storage adapter (default for development)
 */
export class InMemoryIdentityStorage implements IdentityStorageAdapter {
  private identities = new Map<string, SovereignIdentity>();
  private events: IdentityEvent[] = [];
  private artifacts = new Map<string, CivicArtifact>();

  async saveIdentity(identity: SovereignIdentity): Promise<void> {
    this.identities.set(identity.did, identity);
  }

  async loadIdentity(did: string): Promise<SovereignIdentity | undefined> {
    return this.identities.get(did);
  }

  async listIdentities(): Promise<SovereignIdentity[]> {
    return Array.from(this.identities.values());
  }

  async saveEvent(event: IdentityEvent): Promise<void> {
    this.events.push(event);
  }

  async listEvents(): Promise<IdentityEvent[]> {
    return [...this.events];
  }

  async saveArtifact(artifact: CivicArtifact): Promise<void> {
    this.artifacts.set(artifact.id, artifact);
  }

  async loadArtifact(id: string): Promise<CivicArtifact | undefined> {
    return this.artifacts.get(id);
  }

  async listArtifacts(): Promise<CivicArtifact[]> {
    return Array.from(this.artifacts.values());
  }
}

/**
 * File-based storage adapter (JSON files)
 */
export class FileIdentityStorage implements IdentityStorageAdapter {
  private fs = require("fs");
  private path = require("path");

  constructor(private baseDir: string) {
    if (!this.fs.existsSync(baseDir)) {
      this.fs.mkdirSync(baseDir, { recursive: true });
    }
  }

  private file(name: string): string {
    return this.path.join(this.baseDir, name);
  }

  async saveIdentity(identity: SovereignIdentity): Promise<void> {
    const file = this.file(`identity-${identity.did}.json`);
    this.fs.writeFileSync(file, JSON.stringify(identity, null, 2));
  }

  async loadIdentity(did: string): Promise<SovereignIdentity | undefined> {
    const file = this.file(`identity-${did}.json`);
    if (!this.fs.existsSync(file)) return undefined;
    return JSON.parse(this.fs.readFileSync(file, "utf8"));
  }

  async listIdentities(): Promise<SovereignIdentity[]> {
    const files = this.fs.readdirSync(this.baseDir);
    const identities: SovereignIdentity[] = [];

    for (const f of files) {
      if (f.startsWith("identity-")) {
        const data = JSON.parse(this.fs.readFileSync(this.file(f), "utf8"));
        identities.push(data);
      }
    }

    return identities;
  }

  async saveEvent(event: IdentityEvent): Promise<void> {
    const file = this.file(`event-${event.id}.json`);
    this.fs.writeFileSync(file, JSON.stringify(event, null, 2));
  }

  async listEvents(): Promise<IdentityEvent[]> {
    const files = this.fs.readdirSync(this.baseDir);
    const events: IdentityEvent[] = [];

    for (const f of files) {
      if (f.startsWith("event-")) {
        const data = JSON.parse(this.fs.readFileSync(this.file(f), "utf8"));
        events.push(data);
      }
    }

    return events;
  }

  async saveArtifact(artifact: CivicArtifact): Promise<void> {
    const file = this.file(`artifact-${artifact.id}.json`);
    this.fs.writeFileSync(file, JSON.stringify(artifact, null, 2));
  }

  async loadArtifact(id: string): Promise<CivicArtifact | undefined> {
    const file = this.file(`artifact-${id}.json`);
    if (!this.fs.existsSync(file)) return undefined;
    return JSON.parse(this.fs.readFileSync(file, "utf8"));
  }

  async listArtifacts(): Promise<CivicArtifact[]> {
    const files = this.fs.readdirSync(this.baseDir);
    const artifacts: CivicArtifact[] = [];

    for (const f of files) {
      if (f.startsWith("artifact-")) {
        const data = JSON.parse(this.fs.readFileSync(this.file(f), "utf8"));
        artifacts.push(data);
      }
    }

    return artifacts;
  }
}

/**
 * Factory helpers
 */
export function createInMemoryStorage(): IdentityStorageAdapter {
  return new InMemoryIdentityStorage();
}

export function createFileStorage(baseDir: string): IdentityStorageAdapter {
  return new FileIdentityStorage(baseDir);
}
