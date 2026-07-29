// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityController
// Purpose: Controller layer for identity operations, badge issuance,
// artifact anchoring, wallet verification, and identity retrieval.

import { Request, Response } from "express";
import { IdentityService } from "./identity-service";
import { IdentitySubsystem } from "./identity-bootstrap";
import { IdentityError } from "./identity-errors";

export class IdentityController {
  private readonly service: IdentityService;
  private readonly subsystem: IdentitySubsystem;

  constructor(service: IdentityService, subsystem: IdentitySubsystem) {
    this.service = service;
    this.subsystem = subsystem;
  }

  /**
   * Helper: send structured responses
   */
  private send(res: Response, data: any, error?: any): void {
    if (error) {
      res.status(400).json({
        ok: false,
        error: error instanceof IdentityError ? error.serialize() : error,
      });
      return;
    }

    res.json({ ok: true, data });
  }

  // ------------------------------------------------------------
  // Identity Creation
  // ------------------------------------------------------------
  async createIdentity(req: Request, res: Response): Promise<void> {
    try {
      const { wallet, metadata } = req.body;
      const identity = await this.service.createIdentity(wallet, metadata ?? {});
      this.send(res, identity);
    } catch (err) {
      this.send(res, null, err);
    }
  }

  // ------------------------------------------------------------
  // Identity Retrieval
  // ------------------------------------------------------------
  async getIdentity(req: Request, res: Response): Promise<void> {
    try {
      const identity = await this.service.getIdentity(req.params.did);
      this.send(res, identity);
    } catch (err) {
      this.send(res, null, err);
    }
  }

  // ------------------------------------------------------------
  // Badge Issuance
  // ------------------------------------------------------------
  async issueBadge(req: Request, res: Response): Promise<void> {
    try {
      const { did } = req.params;
      const { code, metadata } = req.body;

      const badge = await this.service.issueBadge(did, code, metadata ?? {});
      this.send(res, badge);
    } catch (err) {
      this.send(res, null, err);
    }
  }

  // ------------------------------------------------------------
  // Artifact Anchoring
  // ------------------------------------------------------------
  async anchorArtifact(req: Request, res: Response): Promise<void> {
    try {
      const { did } = req.params;
      const { wallet, signature, nonce, title, description, content } = req.body;

      const artifact = await this.service.anchorArtifact(
        did,
        wallet,
        title,
        description,
        content,
        nonce,
        signature
      );

      this.send(res, artifact);
    } catch (err) {
      this.send(res, null, err);
    }
  }

  // ------------------------------------------------------------
  // Wallet Verification
  // ------------------------------------------------------------
  async verifyWallet(req: Request, res: Response): Promise<void> {
    try {
      const { message, signature, did, nonce } = req.body;

      const result = await this.service.verifyWallet(
        message,
        signature,
        did,
        nonce
      );

      this.send(res, result);
    } catch (err) {
      this.send(res, null, err);
    }
  }

  // ------------------------------------------------------------
  // List Identities
  // ------------------------------------------------------------
  async listIdentities(_req: Request, res: Response): Promise<void> {
    try {
      const identities = await this.service.listIdentities();
      this.send(res, identities);
    } catch (err) {
      this.send(res, null, err);
    }
  }

  // ------------------------------------------------------------
  // List Events
  // ------------------------------------------------------------
  async listEvents(_req: Request, res: Response): Promise<void> {
    try {
      const events = await this.service.listEvents();
      this.send(res, events);
    } catch (err) {
      this.send(res, null, err);
    }
  }

  // ------------------------------------------------------------
  // List Artifacts
  // ------------------------------------------------------------
  async listArtifacts(_req: Request, res: Response): Promise<void> {
    try {
      const artifacts = await this.service.listArtifacts();
      this.send(res, artifacts);
    } catch (err) {
      this.send(res, null, err);
    }
  }
}
