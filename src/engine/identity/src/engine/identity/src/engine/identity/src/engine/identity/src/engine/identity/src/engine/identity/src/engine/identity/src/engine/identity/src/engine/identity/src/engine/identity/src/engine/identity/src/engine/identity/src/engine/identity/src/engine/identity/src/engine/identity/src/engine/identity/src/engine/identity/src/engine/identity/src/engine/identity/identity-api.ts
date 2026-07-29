// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityAPI
// Purpose: Public API surface for identity operations, badge issuance,
// wallet verification, artifact anchoring, and governance metadata enforcement.

import {
  IdentitySubsystem,
  createGovernedIdentity,
} from "./identity-bootstrap";

import {
  IdentityRequestContext,
  createIdentityMiddlewarePipeline,
} from "./identity-middleware";

import { IdentityError } from "./identity-errors";
import { SovereignIdentity } from "./identity-manager";
import { IdentityBadge } from "./identity-manager";
import { CivicArtifact } from "./civic-artifact-anchor";

export interface IdentityAPIRequest {
  ctx: IdentityRequestContext;
  payload?: Record<string, unknown>;
}

export interface IdentityAPIResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: ReturnType<IdentityError["serialize"]>;
}

export class IdentityAPI {
  private readonly subsystem: IdentitySubsystem;
  private readonly middleware = createIdentityMiddlewarePipeline;

  constructor(subsystem: IdentitySubsystem) {
    this.subsystem = subsystem;
  }

  /**
   * Run middleware pipeline.
   */
  private async runMiddleware(ctx: IdentityRequestContext): Promise<void> {
    const pipeline = this.middleware(this.subsystem);
    await pipeline.run(ctx);
  }

  /**
   * Create a new governed identity.
   */
  async createIdentity(
    wallet: string,
    metadataPatch: Record<string, unknown> = {}
  ): Promise<IdentityAPIResponse<SovereignIdentity>> {
    try {
      const identity = createGovernedIdentity(
        this.subsystem,
        wallet,
        metadataPatch
      );

      return { ok: true, data: identity };
    } catch (err: any) {
      const error = err instanceof IdentityError ? err.serialize() : err;
      return { ok: false, error };
    }
  }

  /**
   * Retrieve an identity by DID.
   */
  async getIdentity(did: string): Promise<IdentityAPIResponse<SovereignIdentity>> {
    try {
      const identity = this.subsystem.registry.getByDid(did);

      if (!identity) {
        throw new IdentityError("IDENTITY_NOT_FOUND", "Identity not found.", { did });
      }

      return { ok: true, data: identity };
    } catch (err: any) {
      const error = err instanceof IdentityError ? err.serialize() : err;
      return { ok: false, error };
    }
  }

  /**
   * Issue a badge to an identity.
   */
  async issueBadge(
    request: IdentityAPIRequest
  ): Promise<IdentityAPIResponse<IdentityBadge>> {
    try {
      await this.runMiddleware(request.ctx);

      const identity = this.subsystem.registry.getByDid(request.ctx.did!);
      if (!identity) {
        throw new IdentityError("IDENTITY_NOT_FOUND", "Identity not found.", {
          did: request.ctx.did,
        });
      }

      const badge = this.subsystem.badges.issueBadge(
        identity,
        request.payload!.code as string,
        request.payload!.metadata ?? {}
      );

      this.subsystem.events.emit(
        this.subsystem.events.createEvent("badge.issued", {
          did: identity.did,
          badge,
        })
      );

      return { ok: true, data: badge };
    } catch (err: any) {
      const error = err instanceof IdentityError ? err.serialize() : err;
      return { ok: false, error };
    }
  }

  /**
   * Anchor a civic artifact.
   */
  async anchorArtifact(
    request: IdentityAPIRequest
  ): Promise<IdentityAPIResponse<CivicArtifact>> {
    try {
      await this.runMiddleware(request.ctx);

      const artifact = await this.subsystem.artifacts.anchorArtifact({
        did: request.ctx.did!,
        wallet: request.ctx.wallet!,
        artifactTitle: request.payload!.title as string,
        artifactDescription: request.payload!.description as string,
        artifactContent: request.payload!.content as string,
        nonce: request.ctx.nonce!,
        signature: request.ctx.signature!,
      });

      this.subsystem.events.emit(
        this.subsystem.events.createEvent("artifact.anchored", {
          did: artifact.anchoredBy,
          wallet: artifact.anchoredWallet,
          artifactId: artifact.id,
          title: artifact.title,
        })
      );

      return { ok: true, data: artifact };
    } catch (err: any) {
      const error = err instanceof IdentityError ? err.serialize() : err;
      return { ok: false, error };
    }
  }

  /**
   * Verify a wallet signature.
   */
  async verifyWallet(
    request: IdentityAPIRequest
  ): Promise<IdentityAPIResponse<{ wallet: string }>> {
    try {
      await this.runMiddleware(request.ctx);

      return {
        ok: true,
        data: { wallet: request.ctx.wallet! },
      };
    } catch (err: any) {
      const error = err instanceof IdentityError ? err.serialize() : err;
      return { ok: false, error };
    }
  }

  /**
   * List all identities.
   */
  async listIdentities(): Promise<IdentityAPIResponse<SovereignIdentity[]>> {
    try {
      const list = this.subsystem.registry.list();
      return { ok: true, data: list };
    } catch (err: any) {
      const error = err instanceof IdentityError ? err.serialize() : err;
      return { ok: false, error };
    }
  }

  /**
   * List all events.
   */
  async listEvents(): Promise<IdentityAPIResponse<ReturnType<typeof this.subsystem.events.getHistory>>> {
    try {
      const events = this.subsystem.events.getHistory();
      return { ok: true, data: events };
    } catch (err: any) {
      const error = err instanceof IdentityError ? err.serialize() : err;
      return { ok: false, error };
    }
  }
}
