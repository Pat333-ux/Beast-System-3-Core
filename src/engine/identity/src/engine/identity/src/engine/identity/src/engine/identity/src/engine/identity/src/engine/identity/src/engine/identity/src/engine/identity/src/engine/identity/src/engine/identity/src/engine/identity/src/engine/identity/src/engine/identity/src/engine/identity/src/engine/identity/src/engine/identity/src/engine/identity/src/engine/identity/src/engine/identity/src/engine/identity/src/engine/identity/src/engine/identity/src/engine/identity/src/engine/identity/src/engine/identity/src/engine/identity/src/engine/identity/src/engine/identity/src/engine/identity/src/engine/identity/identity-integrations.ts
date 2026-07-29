// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityIntegrations
// Purpose: Integration adapters for external systems including blockchain,
// messaging buses, governance engines, tokenomics modules, and third-party identity providers.

import { IdentitySubsystem } from "./identity-bootstrap";
import { SovereignIdentity } from "./identity-manager";
import { CivicArtifact } from "./civic-artifact-anchor";
import { IdentityEvent } from "./identity-events";

export interface BlockchainAdapter {
  anchorIdentity(identity: SovereignIdentity): Promise<void>;
  anchorArtifact(artifact: CivicArtifact): Promise<void>;
  anchorEvent(event: IdentityEvent): Promise<void>;
}

export interface MessagingAdapter {
  publish(topic: string, payload: any): Promise<void>;
}

export interface GovernanceAdapter {
  submitIdentity(identity: SovereignIdentity): Promise<void>;
  submitArtifact(artifact: CivicArtifact): Promise<void>;
  submitEvent(event: IdentityEvent): Promise<void>;
}

export interface TokenomicsAdapter {
  rewardIdentity(did: string, amount: number): Promise<void>;
  rewardArtifact(artifactId: string, amount: number): Promise<void>;
  rewardEvent(eventId: string, amount: number): Promise<void>;
}

export interface ExternalIdentityProvider {
  resolveIdentity(wallet: string): Promise<Partial<SovereignIdentity>>;
}

export class IdentityIntegrations {
  private readonly subsystem: IdentitySubsystem;

  private blockchain?: BlockchainAdapter;
  private messaging?: MessagingAdapter;
  private governance?: GovernanceAdapter;
  private tokenomics?: TokenomicsAdapter;
  private externalProvider?: ExternalIdentityProvider;

  constructor(subsystem: IdentitySubsystem) {
    this.subsystem = subsystem;
  }

  // ------------------------------------------------------------
  // Registration
  // ------------------------------------------------------------
  registerBlockchain(adapter: BlockchainAdapter): void {
    this.blockchain = adapter;
  }

  registerMessaging(adapter: MessagingAdapter): void {
    this.messaging = adapter;
  }

  registerGovernance(adapter: GovernanceAdapter): void {
    this.governance = adapter;
  }

  registerTokenomics(adapter: TokenomicsAdapter): void {
    this.tokenomics = adapter;
  }

  registerExternalIdentityProvider(adapter: ExternalIdentityProvider): void {
    this.externalProvider = adapter;
  }

  // ------------------------------------------------------------
  // Integration Actions
  // ------------------------------------------------------------
  async propagateIdentity(identity: SovereignIdentity): Promise<void> {
    if (this.blockchain) {
      await this.blockchain.anchorIdentity(identity);
    }
    if (this.messaging) {
      await this.messaging.publish("identity.created", identity);
    }
    if (this.governance) {
      await this.governance.submitIdentity(identity);
    }
    if (this.tokenomics) {
      await this.tokenomics.rewardIdentity(identity.did, 1);
    }
  }

  async propagateArtifact(artifact: CivicArtifact): Promise<void> {
    if (this.blockchain) {
      await this.blockchain.anchorArtifact(artifact);
    }
    if (this.messaging) {
      await this.messaging.publish("artifact.anchored", artifact);
    }
    if (this.governance) {
      await this.governance.submitArtifact(artifact);
    }
    if (this.tokenomics) {
      await this.tokenomics.rewardArtifact(artifact.id, 5);
    }
  }

  async propagateEvent(event: IdentityEvent): Promise<void> {
    if (this.blockchain) {
      await this.blockchain.anchorEvent(event);
    }
    if (this.messaging) {
      await this.messaging.publish(event.type, event);
    }
    if (this.governance) {
      await this.governance.submitEvent(event);
    }
    if (this.tokenomics) {
      await this.tokenomics.rewardEvent(event.id, 0.1);
    }
  }

  // ------------------------------------------------------------
  // External Identity Resolution
  // ------------------------------------------------------------
  async resolveExternalIdentity(wallet: string): Promise<Partial<SovereignIdentity>> {
    if (!this.externalProvider) {
      return {};
    }
    return await this.externalProvider.resolveIdentity(wallet);
  }
}
